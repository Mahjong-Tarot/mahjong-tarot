"""
Tong Shu (通勝) almanac rule engine.

Given a Gregorian date, returns the canonical Chinese almanac record:
  - Year / Month / Day pillars (reuses pillars.py)
  - Lunar day (1-30)
  - 12 Day Officer (driven by day_branch vs month_branch)
  - Year-conflict sign (the day branch's directional opposite)
  - 6 auspicious hour windows (黃道吉時)
  - 29 daily activity verdicts (Lucky / Normal / Unlucky)
  - Holiday text (Chinese lunar festivals + Western moments + match-day flags)
  - Composite score (0-100, share of activities that came up Lucky)
  - Tone (auspicious / favorable / neutral / cautionary / challenging)

Usage:
    from almanac import almanac_for
    a = almanac_for("2026-04-27")
"""
from __future__ import annotations
import json
from datetime import date, datetime, timedelta
from pathlib import Path

from pillars import (
    pillars_for, _to_date, _lunar_month_for, _lunar_table, _chinese_year_for,
    ANIMALS,
)
from signals import DIRECTIONAL_CLASHES, WESTERN_MOMENTS

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"

# Branch-index order: Rat=0 ... Pig=11. Same as pillars.ANIMALS.
BRANCH_INDEX = {a: i for i, a in enumerate(ANIMALS)}

# Chinese lunar holidays keyed by (lunar_month, lunar_day).
# Lunar New Year is handled separately (lunar 1/1 in any year).
LUNAR_HOLIDAYS = {
    (1, 1):   "Lunar New Year",
    (1, 15):  "Lantern Festival",
    (2, 2):   "Earth God's Birthday",
    (3, 3):   "Shangsi Festival",
    (4, 8):   "Buddha's Birthday",
    (5, 5):   "Dragon Boat Festival",
    (7, 7):   "Qixi (Chinese Valentine's)",
    (7, 15):  "Ghost Festival",
    (8, 15):  "Mid-Autumn Festival",
    (9, 9):   "Double Ninth Festival",
    (12, 8):  "Laba Festival",
    (12, 23): "Kitchen God Day",
}


_CACHE = {}
def _load(name):
    if name not in _CACHE:
        _CACHE[name] = json.loads((DATA / name).read_text())
    return _CACHE[name]


# ────────────────────────────────────────────────────────────
# 12 Day Officer
# ────────────────────────────────────────────────────────────
def day_officer(d):
    """Return the day's officer dict: {key, english, chinese, pinyin, gloss}.

    Officer index = (day_branch_index - month_branch_index) mod 12, where
    month_branch is the lunar-month branch (Tiger month = lunar 1).
    """
    d = _to_date(d)
    p = pillars_for(d)
    day_branch = p["day"]["sign"]
    month_branch = p["month"]["sign"]
    idx = (BRANCH_INDEX[day_branch] - BRANCH_INDEX[month_branch]) % 12
    officers = _load("day_officers.json")["officers"]
    return officers[idx]


# ────────────────────────────────────────────────────────────
# Lunar day (1-30)
# ────────────────────────────────────────────────────────────
def lunar_day(d):
    """Return the day-of-the-lunar-month (1-based) for d."""
    d = _to_date(d)
    cy = _chinese_year_for(d)
    table = _lunar_table()["years"][str(cy)]
    month_starts = table["month_starts"]

    # Find the largest month-start boundary <= d
    boundaries = []
    for key, gdate_str in month_starts.items():
        is_leap = key.startswith("leap_")
        month_num = int(key.replace("leap_", ""))
        boundaries.append((_to_date(gdate_str), month_num, is_leap))
    boundaries.sort()

    chosen = boundaries[0]
    for b in boundaries:
        if b[0] <= d:
            chosen = b
        else:
            break
    return (d - chosen[0]).days + 1


# ────────────────────────────────────────────────────────────
# Year conflict (sign that clashes with the day)
# ────────────────────────────────────────────────────────────
def year_conflict(day_sign):
    """Return the directional-opposite sign that 'conflicts' with the day."""
    return DIRECTIONAL_CLASHES[day_sign]


# ────────────────────────────────────────────────────────────
# Auspicious hours
# ────────────────────────────────────────────────────────────
def auspicious_hours(day_sign):
    """Return the 6 auspicious hour windows for a day, sorted by start time.

    Each entry is {branch, chinese, range} e.g. {"branch":"Rat","chinese":"子","range":"23-1"}.
    Sorted by hour-of-day so the user sees them in chronological order.
    """
    hours = _load("auspicious_hours.json")
    branches = hours["by_day_branch"][day_sign]
    ranges = hours["hour_ranges"]
    chinese = hours["hour_chinese"]
    out = [{"branch": b, "chinese": chinese[b], "range": ranges[b]} for b in branches]

    def sort_key(item):
        start = int(item["range"].split("-")[0])
        # Rat hour is 23-1; treat as start=23 for sort, except let it land before Ox (1-3)
        return (start, item["range"])
    out.sort(key=sort_key)
    # Move the 23-1 entry to the front so the day reads naturally as "starts at midnight"
    out_sorted = sorted(out, key=lambda x: (x["range"] != "23-1", int(x["range"].split("-")[0])))
    return out_sorted


# ────────────────────────────────────────────────────────────
# 29 activity verdicts
# ────────────────────────────────────────────────────────────
def activity_verdicts(officer_key):
    """Return {activity: 'Lucky'|'Normal'|'Unlucky'} for all 29 activities."""
    rules = _load("activity_rules.json")
    out = {}
    for activity in rules["activity_order"]:
        rule = rules["rules"][activity]
        if officer_key in rule.get("lucky", []):
            out[activity] = "Lucky"
        elif officer_key in rule.get("unlucky", []):
            out[activity] = "Unlucky"
        else:
            out[activity] = "Normal"
    return out


# ────────────────────────────────────────────────────────────
# Holiday text
# ────────────────────────────────────────────────────────────
def holiday_text(d, lunar_m, lunar_d, is_leap_month, match_flags):
    """Compose the holiday/calendar text shown on the almanac card."""
    parts = []

    # Western holidays
    moment = WESTERN_MOMENTS.get((d.month, d.day))
    if moment:
        parts.append(moment)

    # Lunar holidays (only on regular months — leap-month repeat days aren't festivals)
    if not is_leap_month:
        lunar_event = LUNAR_HOLIDAYS.get((lunar_m, lunar_d))
        if lunar_event:
            parts.append(lunar_event)

    # Match-day flags
    flags_pretty = {
        "year_day":   "Year sign meets day sign",
        "month_day":  "Month sign meets day sign",
        "year_month": "Year sign meets month sign",
        "triple":     "Triple alignment (rare)",
    }
    if match_flags:
        for f in match_flags:
            label = flags_pretty.get(f)
            if label:
                parts.append(label)

    return ". ".join(parts) if parts else ""


# ────────────────────────────────────────────────────────────
# Score & tone (drives the calendar tinting)
# ────────────────────────────────────────────────────────────
def _score_from_verdicts(verdicts):
    """Convert 29 verdicts into a 0-100 score weighted toward Lucky.

    Each Lucky = +1, Normal = +0.5, Unlucky = +0.   Then renormalized to 0-100.
    """
    if not verdicts:
        return 50
    raw = sum(1.0 if v == "Lucky" else 0.5 if v == "Normal" else 0.0 for v in verdicts.values())
    pct = round(100 * raw / len(verdicts))
    return pct


def _tone_from_score(score):
    if score >= 80:
        return "auspicious"
    if score >= 60:
        return "favorable"
    if score >= 40:
        return "neutral"
    if score >= 20:
        return "cautionary"
    return "challenging"


# ────────────────────────────────────────────────────────────
# Public API
# ────────────────────────────────────────────────────────────
def almanac_for(d):
    """Return the full almanac record for date d.

    Shape:
      {
        "date": "2026-04-27",
        "weekday": "Monday",
        "pillars": {
          "year":  {"element": "Fire",  "sign": "Horse"},
          "month": {"element": ..., "sign": ...},
          "day":   {"element": ..., "sign": ...}
        },
        "lunar_day": 11,
        "lunar_month": 3,
        "is_leap_month": false,
        "officer": {"key":"establish", "english":"Establish", "chinese":"建", "pinyin":"Jian", "gloss":"..."},
        "year_conflict": "Pig",
        "auspicious_hours": [{"branch":"Rat","chinese":"子","range":"23-1"}, ...],
        "activities": {"StartABusiness":"Lucky", ...},
        "activity_order": [...],
        "labels": {"StartABusiness":"Start a Business", ...},
        "match_day": ["year_day"] | null,
        "western_moment": "Independence Day (US)" | null,
        "holiday": "Lantern Festival",
        "score": 62,
        "tone": "favorable"
      }
    """
    d = _to_date(d)
    p = pillars_for(d)
    year, month, day = p["year"], p["month"], p["day"]

    lm = month["lunar_month"]
    is_leap = month.get("is_leap_month", False)
    ld = lunar_day(d)

    officer = day_officer(d)
    verdicts = activity_verdicts(officer["key"])
    rules_meta = _load("activity_rules.json")
    score = _score_from_verdicts(verdicts)
    tone = _tone_from_score(score)

    # Match-day flags (mirrors signals._detect_match_day)
    flags = []
    if year["sign"] == day["sign"]:
        flags.append("year_day")
    if month["sign"] == day["sign"]:
        flags.append("month_day")
    if year["sign"] == month["sign"]:
        flags.append("year_month")
    if len(flags) == 3:
        flags = ["triple"]
    match = flags or None

    western = WESTERN_MOMENTS.get((d.month, d.day))
    holiday = holiday_text(d, lm, ld, is_leap, match)

    return {
        "date": str(d),
        "weekday": d.strftime("%A"),
        "pillars": {
            "year":  {"element": year["element"],  "sign": year["sign"]},
            "month": {"element": month["element"], "sign": month["sign"]},
            "day":   {"element": day["element"],   "sign": day["sign"]},
        },
        "lunar_day": ld,
        "lunar_month": lm,
        "is_leap_month": is_leap,
        "officer": {
            "key": officer["key"],
            "english": officer["english"],
            "chinese": officer["chinese"],
            "pinyin": officer["pinyin"],
            "gloss": officer["gloss"],
        },
        "year_conflict": year_conflict(day["sign"]),
        "auspicious_hours": auspicious_hours(day["sign"]),
        "activities": verdicts,
        "activity_order": rules_meta["activity_order"],
        "labels": rules_meta["labels"],
        "match_day": match,
        "western_moment": western,
        "holiday": holiday,
        "score": score,
        "tone": tone,
    }


def render_almanac_brief(a):
    """Compact human-readable almanac brief — for CLI inspection."""
    p = a["pillars"]
    lines = [
        f"DATE          {a['date']}  ({a['weekday']})",
        f"LUNAR         lunar {a['lunar_month']}/{a['lunar_day']}{' (leap)' if a['is_leap_month'] else ''}",
        f"YEAR          {p['year']['element']} {p['year']['sign']}",
        f"MONTH         {p['month']['element']} {p['month']['sign']}",
        f"DAY           {p['day']['element']} {p['day']['sign']}",
        f"OFFICER       {a['officer']['english']} ({a['officer']['chinese']} / {a['officer']['pinyin']})",
        f"              {a['officer']['gloss']}",
        f"YEAR CONFLICT {a['year_conflict']}",
        f"SCORE         {a['score']}/100  ->  {a['tone'].upper()}",
    ]
    if a["holiday"]:
        lines.append(f"HOLIDAY       {a['holiday']}")
    lines.append("")
    lines.append("AUSPICIOUS HOURS:")
    for h in a["auspicious_hours"]:
        lines.append(f"  {h['range']:5}  ({h['chinese']} {h['branch']})")
    lines.append("")
    lines.append("ACTIVITIES:")
    lucky = [a["labels"][k] for k in a["activity_order"] if a["activities"][k] == "Lucky"]
    unlucky = [a["labels"][k] for k in a["activity_order"] if a["activities"][k] == "Unlucky"]
    normal = [a["labels"][k] for k in a["activity_order"] if a["activities"][k] == "Normal"]
    lines.append(f"  Lucky   ({len(lucky):2}):  {', '.join(lucky)}")
    lines.append(f"  Normal  ({len(normal):2}):  {', '.join(normal)}")
    lines.append(f"  Unlucky ({len(unlucky):2}):  {', '.join(unlucky)}")
    return "\n".join(lines)


if __name__ == "__main__":
    import sys
    sample_dates = sys.argv[1:] or [
        "2026-02-17",  # LNY 2026
        "2026-02-18",  # day after LNY
        "2026-04-27",  # today
        "2026-06-15",  # Horse-month-of-Horse-year (year_month match)
        "2026-12-25",  # Christmas
    ]
    for d in sample_dates:
        print("=" * 72)
        print(render_almanac_brief(almanac_for(d)))
        print()
