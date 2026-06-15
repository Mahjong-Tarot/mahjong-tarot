#!/usr/bin/env python3
"""ETL: Bill's authored 1-4 star x palace auspiciousness matrix -> auspiciousness.json

Source of truth is the canonical Google Sheet Dave maintains and Bill edits:
  https://docs.google.com/spreadsheets/d/1_hfURgUyHsL-9_BFUHjmUU0DcCppgvpbhBKJf38olBY/edit?gid=1466894022

Pull it fresh (it changes) before running this. We saved the current export as a
pipe-delimited file (pipe avoids the commas inside the "Gloss / note" column):
  working_files/purple-star-matrix-canonical.psv

The sheet columns are LIFE-PALACES (Bill's interpretive choice), so the lookup the
engine does is star x palace, NOT star x branch. Do not "fix" this to branches.

Sheet palace labels map to our internal palace keys; three differ:
  Fate -> Ming, Friends -> Associates, Wellbeing -> Happiness (the rest are identical).

Output: website/data/ps/auspiciousness.json
  {
    "_meta": {...provenance...},
    "stars":     { "<hanzi>": { "Ming":4, "Siblings":3, ... "Parents":4 }, ... },
    "catalysts": { "化禄": {...}, "化权": {...}, "化科": {...}, "化忌": {...} }
  }

The 114 placed-star rows are deduped by hanzi (六 cyclical groups repeat 小耗/大耗/
病符/华盖/咸池/天德 with identical ratings). The 4 Si-Hua rows are kept separately as
mutagen modifiers — the engine uses them as a +/- band, not as placed stars.

Usage: python3 docs/features/purple-star-report/etl_auspiciousness.py
"""
import csv
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
SRC = os.path.join(REPO, "working_files", "purple-star-matrix-canonical.psv")
OUT = os.path.join(REPO, "website", "data", "ps", "auspiciousness.json")

# sheet palace label -> internal palace key
SHEET_TO_KEY = {
    "Fate": "Ming",
    "Siblings": "Siblings",
    "Marriage": "Marriage",
    "Children": "Children",
    "Wealth": "Wealth",
    "Health": "Health",
    "Travel": "Travel",
    "Friends": "Associates",
    "Career": "Career",
    "Property": "Property",
    "Wellbeing": "Happiness",
    "Parents": "Parents",
}
PALACE_KEYS = list(SHEET_TO_KEY.values())
CATALYST_TYPE = "Catalyst (Si Hua)"


def main():
    if not os.path.exists(SRC):
        sys.exit(f"ERROR: source not found: {SRC}\n"
                 "Pull the canonical Google Sheet (text/csv export) and save it there first.")

    with open(SRC, encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="|")
        rows = list(reader)

    stars = {}
    catalysts = {}
    conflicts = []
    n_star_rows = 0

    for r in rows:
        hanzi = (r["Hanzi"] or "").strip()
        if not hanzi:
            continue
        ratings = {}
        for sheet_label, key in SHEET_TO_KEY.items():
            raw = (r[sheet_label] or "").strip()
            if raw == "":
                sys.exit(f"ERROR: empty rating for {hanzi} / {sheet_label}")
            val = int(raw)
            if val < 1 or val > 4:
                sys.exit(f"ERROR: rating out of range 1-4 for {hanzi} / {sheet_label}: {val}")
            ratings[key] = val

        if (r["Type"] or "").strip() == CATALYST_TYPE:
            catalysts[hanzi] = ratings
            continue

        n_star_rows += 1
        if hanzi in stars:
            if stars[hanzi] != ratings:
                conflicts.append(hanzi)  # duplicate hanzi with DIFFERENT ratings
            continue  # dedupe: identical duplicate, keep first
        stars[hanzi] = ratings

    if conflicts:
        sys.exit("ERROR: duplicate hanzi with conflicting ratings (cannot dedupe): "
                 + ", ".join(sorted(set(conflicts))))

    out = {
        "_meta": {
            "source": "Google Sheet 1_hfURgUyHsL-9_BFUHjmUU0DcCppgvpbhBKJf38olBY (tab gid 1466894022)",
            "title": "Purple Star — Auspiciousness Matrix (Bill's authored 1-4 star x palace)",
            "note": "Ratings 1-4 (1=least auspicious, 4=most). Star x LIFE-PALACE, not star x branch. "
                    "Values are Bill's to verify; current may be AI drafts.",
            "palaceKeys": PALACE_KEYS,
            "ratingScale": {"1": "least auspicious", "2": "below neutral", "3": "favorable", "4": "most auspicious"},
            "starRows": n_star_rows,
            "uniqueStars": len(stars),
            "catalysts": list(catalysts.keys()),
            "generatedBy": "docs/features/purple-star-report/etl_auspiciousness.py",
        },
        "stars": stars,
        "catalysts": catalysts,
    }

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"✓ wrote {os.path.relpath(OUT, REPO)}")
    print(f"  star rows read : {n_star_rows}")
    print(f"  unique stars   : {len(stars)} (after hanzi dedupe)")
    print(f"  catalysts      : {', '.join(catalysts.keys())}")


if __name__ == "__main__":
    main()
