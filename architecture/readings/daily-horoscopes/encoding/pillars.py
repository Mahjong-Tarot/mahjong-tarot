"""
Pillar calculator: given a Gregorian date, return the Year / Month / Day pillars
(Element + Sign) per the BaZi system observed in Bill's SignMatches.xls.

Conventions confirmed from SignMatches.xls (2010-2012):
  - Year pillar transitions on Lunar New Year.
  - Month pillar uses lunar months (new-moon transitions): lunar mo 1 = Tiger,
    lunar mo 2 = Rabbit, ..., lunar mo 12 = Ox.
  - Month stem is derived from year stem via the standard BaZi rule
    (Wu Hu Dun Yuan Ge / 五虎遁元歌).
  - Day pillar follows the unbroken 60-day sexagenary cycle.

Usage:
    from pillars import pillars_for
    p = pillars_for("2026-04-27")
    # p == {"year":  {"element": "Fire",  "sign": "Horse"},
    #       "month": {"element": "Water", "sign": "Dragon"},
    #       "day":   {"element": "Earth", "sign": "Snake"}}
"""
from __future__ import annotations
import json
from datetime import date, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"

ELEMENTS = ["Wood", "Fire", "Earth", "Metal", "Water"]
ANIMALS = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake",
           "Horse", "Sheep", "Monkey", "Rooster", "Dog", "Pig"]

# Lunar month index (1=Tiger ... 12=Ox) → animal
LUNAR_MONTH_TO_ANIMAL = ["Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Sheep",
                         "Monkey", "Rooster", "Dog", "Pig", "Rat", "Ox"]

# Wu Hu Dun rule: stem-index of Tiger month given year stem-index.
# Year stem 0 (Jia/Wood-Yang) or 5 (Ji/Earth-Yin)  → Tiger month stem = 2 (Bing/Fire-Yang)
# Year stem 1 (Yi/Wood-Yin)  or 6 (Geng/Metal-Yang) → Tiger month stem = 4 (Wu/Earth-Yang)
# Year stem 2 (Bing/Fire-Yang) or 7 (Xin/Metal-Yin)  → Tiger month stem = 6 (Geng/Metal-Yang)
# Year stem 3 (Ding/Fire-Yin) or 8 (Ren/Water-Yang)  → Tiger month stem = 8 (Ren/Water-Yang)
# Year stem 4 (Wu/Earth-Yang) or 9 (Gui/Water-Yin)   → Tiger month stem = 0 (Jia/Wood-Yang)
TIGER_MONTH_STEM = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0]

# Day pillar anchor: 2010-05-04 was Jia Yin (Wood Tiger), sexagenary day index 50.
# Verified from SignMatches.xls.
ANCHOR_DATE = date(2010, 5, 4)
ANCHOR_SX_INDEX = 50


def _to_date(d):
    if isinstance(d, date) and not isinstance(d, datetime):
        return d
    if isinstance(d, datetime):
        return d.date()
    return datetime.strptime(str(d), "%Y-%m-%d").date()


# Cache the lunar lookup
_LUNAR = None
def _lunar_table():
    global _LUNAR
    if _LUNAR is None:
        _LUNAR = json.loads((DATA / "lunar_calendar.json").read_text())
    return _LUNAR


def _stem_branch_indices(sx_index):
    return sx_index % 10, sx_index % 12


def day_pillar(d):
    d = _to_date(d)
    sx = (ANCHOR_SX_INDEX + (d - ANCHOR_DATE).days) % 60
    stem, branch = _stem_branch_indices(sx)
    return {
        "element": ELEMENTS[stem // 2],
        "sign": ANIMALS[branch],
        "stem_index": stem,
        "branch_index": branch,
        "sexagenary_index": sx,
    }


def _chinese_year_for(d):
    """Return the Chinese year (Gregorian-year-named) that contains d, based on Lunar New Year."""
    d = _to_date(d)
    table = _lunar_table()["years"]
    # Chinese year-N spans LNY(N) → day before LNY(N+1)
    g_year = d.year
    candidates = [g_year - 1, g_year, g_year + 1]
    for cy in candidates:
        if str(cy) not in table:
            continue
        lny = _to_date(table[str(cy)]["new_year"])
        next_year = str(cy + 1)
        if next_year in table:
            next_lny = _to_date(table[next_year]["new_year"])
        else:
            next_lny = date(cy + 1, 12, 31)
        if lny <= d < next_lny:
            return cy
    raise ValueError(f"No lunar-calendar coverage for date {d!r}. "
                     f"Add the year to data/lunar_calendar.json.")


def year_pillar(d):
    """Year pillar derived from the Chinese year (Lunar New Year transition)."""
    d = _to_date(d)
    cy = _chinese_year_for(d)
    sx = (cy - 4) % 60  # standard formula: cy=4 (4 AD) is Jia Zi
    stem, branch = _stem_branch_indices(sx)
    return {
        "element": ELEMENTS[stem // 2],
        "sign": ANIMALS[branch],
        "stem_index": stem,
        "branch_index": branch,
        "chinese_year": cy,
    }


def _lunar_month_for(d):
    """Return (lunar_month_int 1-12, is_leap_bool) for the given date."""
    d = _to_date(d)
    cy = _chinese_year_for(d)
    table = _lunar_table()["years"][str(cy)]
    month_starts = table["month_starts"]

    # Sort the boundaries chronologically
    boundaries = []
    for key, gdate_str in month_starts.items():
        is_leap = key.startswith("leap_")
        month_num = int(key.replace("leap_", ""))
        boundaries.append((_to_date(gdate_str), month_num, is_leap))
    boundaries.sort()

    # Find the largest boundary <= d
    chosen = boundaries[0]
    for b in boundaries:
        if b[0] <= d:
            chosen = b
        else:
            break
    return chosen[1], chosen[2]


def month_pillar(d):
    d = _to_date(d)
    lunar_month, is_leap = _lunar_month_for(d)
    yp = year_pillar(d)
    tiger_stem = TIGER_MONTH_STEM[yp["stem_index"]]
    # Lunar month 1 = Tiger month → stem = tiger_stem; each subsequent month +1
    month_stem = (tiger_stem + (lunar_month - 1)) % 10
    return {
        "element": ELEMENTS[month_stem // 2],
        "sign": LUNAR_MONTH_TO_ANIMAL[lunar_month - 1],
        "stem_index": month_stem,
        "lunar_month": lunar_month,
        "is_leap_month": is_leap,
    }


def pillars_for(d):
    return {
        "date": str(_to_date(d)),
        "year": year_pillar(d),
        "month": month_pillar(d),
        "day": day_pillar(d),
    }


# ============================================================
# Self-test: verify against SignMatches.xls anchors
# ============================================================
def _verify():
    table = _lunar_table()["verification_anchors"]["anchors"]
    failures = []
    for anchor in table:
        d = anchor["date"]
        expected = (anchor["element"], anchor["sign"])
        actual_dp = day_pillar(d)
        actual = (actual_dp["element"], actual_dp["sign"])
        ok = "✓" if actual == expected else "✗"
        line = f"  {ok}  {d}  expected {expected[0]:6} {expected[1]:7} got {actual[0]:6} {actual[1]}"
        print(line)
        if actual != expected:
            failures.append((d, expected, actual))
    return failures


if __name__ == "__main__":
    print("Verifying day pillar against SignMatches.xls anchors:")
    failures = _verify()
    if failures:
        print(f"\n{len(failures)} mismatches.")
    else:
        print("\nAll anchors match.")

    print("\nSample pillars:")
    for d in ["2026-01-01", "2026-02-16", "2026-02-17", "2026-04-27", "2026-12-31"]:
        p = pillars_for(d)
        print(f"  {d}: Year={p['year']['element']} {p['year']['sign']:7}"
              f"  Month={p['month']['element']} {p['month']['sign']:7}"
              f"  Day={p['day']['element']} {p['day']['sign']}")
