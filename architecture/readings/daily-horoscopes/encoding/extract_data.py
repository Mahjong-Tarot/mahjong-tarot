"""
One-time extraction of the keyword/score matrices into JSON.

Sources (Bill's original spreadsheets):
  ../horoscope-Matrix.xls          — main keyword grid (user_sign x day_sign x domain)
  ../horoscopeKeywords.xls         — element->domain weighting + 60x12 score grid
  ../SignMatches.xls               — pillar lookup samples (used for verification)

Outputs (under data/):
  matrix.json              user_sign -> day_sign -> domain -> keywords
  scores_user_x_day.json   user_sign -> day_sign -> {score, flag}
  sign_descriptors.json    user_sign -> {likes, dislikes, traits[]}
  houses.json              day_sign -> house description
  element_domains.json     element -> [amplified domains]
  scores_sexagenary.json   "Element Sign" -> user_sign -> score (60x12)

Run once: python3 extract_data.py
"""
import json
import re
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parent
SRC = ROOT.parent
OUT = ROOT / "data"

SIGNS = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake",
         "Horse", "Sheep", "Monkey", "Rooster", "Dog", "Pig"]
ELEMENTS = ["Wood", "Fire", "Earth", "Metal", "Water"]
DOMAINS = ["Action", "Job", "Financial", "Friendship", "Health",
           "Home/Family", "Leisure", "Love", "Mental", "Social/Style", "Travel"]


def clean(s):
    if pd.isna(s):
        return ""
    return str(s).replace(" ", " ").strip()


def parse_score(cell):
    """Extract numeric score and any flag markers ('*', '???', 'L,', etc.)."""
    s = clean(cell)
    if not s:
        return {"score": None, "flag": ""}
    m = re.match(r"\s*(\d+)\s*(.*)$", s)
    if m:
        return {"score": int(m.group(1)), "flag": m.group(2).strip()}
    return {"score": None, "flag": s}


def extract_matrix():
    df = pd.read_excel(SRC / "horoscope-Matrix.xls", sheet_name="Sheet1", header=None)

    # Row 0 col 2..13 = day signs
    day_sign_cols = {c: clean(df.iloc[0, c]).rstrip(" *") for c in range(2, 14)}
    # Row 1 col 2..13 = house descriptions
    houses = {day_sign_cols[c]: clean(df.iloc[1, c]) for c in range(2, 14)}

    # 12 user-sign blocks, header rows at 2, 14, 26, ...
    block_starts = list(range(2, 2 + 12 * 12, 12))
    matrix = {}
    scores = {}
    sign_descriptors = {}

    for user_sign, header_row in zip(SIGNS, block_starts):
        # Verify
        observed = clean(df.iloc[header_row, 0]).rstrip(" *")
        assert observed == user_sign, f"Expected {user_sign} at row {header_row}, got {observed!r}"

        # Scores: cols 2..13 of header row
        scores[user_sign] = {
            day_sign_cols[c]: parse_score(df.iloc[header_row, c])
            for c in range(2, 14)
        }

        # 11 domain rows follow
        traits = []
        likes = ""
        dislikes = ""
        per_domain_keywords = {}
        for offset, domain in enumerate(DOMAINS, start=1):
            r = header_row + offset
            # Confirm domain label in col 1
            label = clean(df.iloc[r, 1])
            if label and label != domain:
                # Some files use "Home/family" etc. — accept anyway
                pass

            # Col 0 = a sign descriptor sentence (sometimes empty)
            descriptor = clean(df.iloc[r, 0])
            if descriptor:
                low = descriptor.lower()
                if low.startswith("likes "):
                    likes = descriptor[6:].strip()
                elif low.startswith("dislikes "):
                    dislikes = descriptor[9:].strip()
                else:
                    traits.append(descriptor)

            # Cols 2..13 = keywords per day-sign
            per_domain_keywords[domain] = {
                day_sign_cols[c]: clean(df.iloc[r, c])
                for c in range(2, 14)
            }

        # Restructure: matrix[user_sign][day_sign][domain] = keywords
        matrix[user_sign] = {ds: {} for ds in SIGNS}
        for domain, by_day in per_domain_keywords.items():
            for day_sign, kw in by_day.items():
                matrix[user_sign][day_sign][domain] = kw

        sign_descriptors[user_sign] = {
            "likes": likes,
            "dislikes": dislikes,
            "traits": traits,
        }

    return matrix, scores, sign_descriptors, houses


def extract_element_and_sexagenary():
    df_elem = pd.read_excel(SRC / "horoscopeKeywords.xls", sheet_name="Element", header=None)
    # Row 0 col 1..5 = elements; col 0 row 1.. = domain names
    elements_in_cols = [clean(df_elem.iloc[0, c]) for c in range(1, 6)]
    element_domains = {e: [] for e in elements_in_cols}
    for r in range(1, df_elem.shape[0]):
        domain = clean(df_elem.iloc[r, 0])
        if not domain:
            continue
        for ci, elem in enumerate(elements_in_cols, start=1):
            if clean(df_elem.iloc[r, ci]) == "+":
                element_domains[elem].append(domain)

    # Sexagenary score grid (Sheet3): rows = "Element Sign" (60), cols = user signs
    df_sx = pd.read_excel(SRC / "horoscopeKeywords.xls", sheet_name="Sheet3", header=None)
    # Header row 0 cols 1..12 = abbreviated user signs (Rat, Ox, Tig, ...)
    abbrev_to_sign = {
        "Rat": "Rat", "Ox": "Ox", "Tig": "Tiger", "Rab": "Rabbit",
        "Dra": "Dragon", "Sna": "Snake", "Hor": "Horse", "She": "Sheep",
        "Mon": "Monkey", "Roo": "Rooster", "Dog": "Dog", "Pig": "Pig",
    }
    user_sign_cols = [abbrev_to_sign[clean(df_sx.iloc[0, c])] for c in range(1, 13)]

    sexagenary_scores = {}
    for r in range(1, df_sx.shape[0]):
        key = clean(df_sx.iloc[r, 0])
        if not key:
            continue
        sexagenary_scores[key] = {
            user_sign_cols[i]: int(df_sx.iloc[r, i + 1])
            for i in range(12)
            if pd.notna(df_sx.iloc[r, i + 1])
        }

    return element_domains, sexagenary_scores


def main():
    OUT.mkdir(exist_ok=True)
    matrix, scores, sign_descriptors, houses = extract_matrix()
    element_domains, sexagenary_scores = extract_element_and_sexagenary()

    artefacts = {
        "matrix.json": matrix,
        "scores_user_x_day.json": scores,
        "sign_descriptors.json": sign_descriptors,
        "houses.json": houses,
        "element_domains.json": element_domains,
        "scores_sexagenary.json": sexagenary_scores,
    }
    for name, data in artefacts.items():
        with open(OUT / name, "w") as f:
            json.dump(data, f, indent=2, sort_keys=False)
        print(f"  wrote {name} ({len(json.dumps(data))} bytes)")

    # Sanity counts
    print()
    print(f"matrix:               {len(matrix)} user signs x 12 day signs x {len(DOMAINS)} domains")
    print(f"sexagenary scores:    {len(sexagenary_scores)} day-types (expected 60)")
    print(f"element_domains:      {sum(len(v) for v in element_domains.values())} amplifications")


if __name__ == "__main__":
    main()
