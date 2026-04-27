"""
The encoded rule system: get_signals(date, user_sign|None, category) -> structured signal payload
that a writer (LLM or human) turns into prose for a given (date, user-sign, category) horoscope.

This is the deterministic part. Everything in this module is reproducible: same
inputs always give the same output. The prose layer is the only thing left.

Categories:
    'general' - day's overall energy (broad domains: Action, Mental, Home/Family, Health, Travel, Leisure)
    'love'    - love angle (Love, Friendship, Social/Style)
    'money'   - money angle (Financial, Job)

User sign:
    Pass one of the 12 zodiac animals for a sign-specific reading, or None for the day-level
    general reading (no user-sign filter, scores aggregated across all signs).

Usage:
    from signals import get_signals
    payload = get_signals("2026-02-17", "Tiger", "love")
    payload = get_signals("2026-02-17", None, "general")  # day-level
"""
from __future__ import annotations
import json
from datetime import date, datetime, timedelta
from pathlib import Path

from pillars import pillars_for, _to_date

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"

SIGNS = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake",
         "Horse", "Sheep", "Monkey", "Rooster", "Dog", "Pig"]

CATEGORIES = ("general", "love", "money")

# Which matrix domains each category draws prose from.
CATEGORY_DOMAINS = {
    "general": ["Action", "Mental", "Home/Family", "Health", "Travel", "Leisure"],
    "love":    ["Love", "Friendship", "Social/Style"],
    "money":   ["Financial", "Job"],
}

# The six directional clashes (opposite signs in the zodiac wheel, 180 degrees apart).
DIRECTIONAL_CLASHES = {
    "Rat": "Horse", "Horse": "Rat",
    "Ox": "Sheep", "Sheep": "Ox",
    "Tiger": "Monkey", "Monkey": "Tiger",
    "Rabbit": "Rooster", "Rooster": "Rabbit",
    "Dragon": "Dog", "Dog": "Dragon",
    "Snake": "Pig", "Pig": "Snake",
}

# Western-calendar moments that the 2013 master file occasionally hooked into.
WESTERN_MOMENTS = {
    (1, 1):   "New Year's Day",
    (2, 14):  "Valentine's Day",
    (3, 17):  "St. Patrick's Day",
    (7, 4):   "Independence Day (US)",
    (10, 31): "Halloween",
    (12, 24): "Christmas Eve",
    (12, 25): "Christmas Day",
    (12, 31): "New Year's Eve",
}

_CACHE = {}
def _load(name):
    if name not in _CACHE:
        _CACHE[name] = json.loads((DATA / name).read_text())
    return _CACHE[name]


def _tone_from_score(score):
    if score is None:
        return "neutral"
    if score >= 80:
        return "auspicious"
    if score >= 60:
        return "favorable"
    if score >= 40:
        return "neutral"
    if score >= 20:
        return "cautionary"
    return "challenging"


def _detect_match_day(year_sign, month_sign, day_sign):
    flags = []
    if year_sign == day_sign:
        flags.append("year_day")
    if month_sign == day_sign:
        flags.append("month_day")
    if year_sign == month_sign:
        flags.append("year_month")
    if len(flags) == 3:
        return ["triple"]
    return flags or None


def _western_moment(d):
    return WESTERN_MOMENTS.get((d.month, d.day))


def _aggregate_day_score(day_element, day_sign):
    """For day-level (no user_sign) general signals: average the sexagenary score
    across all 12 user signs to get an overall day temperature."""
    sx_scores = _load("scores_sexagenary.json")
    sx_key = f"{day_element} {day_sign}"
    row = sx_scores.get(sx_key, {})
    if not row:
        return None
    vals = list(row.values())
    return round(sum(vals) / len(vals)) if vals else None


def get_signals(d, user_sign, category="general"):
    """
    The core API.

    Args:
        d: ISO date string or date object.
        user_sign: one of the 12 animals, or None for a day-level reading (no per-sign filter).
        category: 'general' | 'love' | 'money'. Determines which matrix domains the prose draws from.

    Returns a dict ready for prose generation.
    """
    if category not in CATEGORIES:
        raise ValueError(f"category must be one of {CATEGORIES}; got {category!r}")
    if user_sign is not None and user_sign not in SIGNS:
        raise ValueError(f"user_sign must be one of {SIGNS} or None; got {user_sign!r}")

    d = _to_date(d)

    # 1. Pillars
    p = pillars_for(d)
    year, month, day = p["year"], p["month"], p["day"]

    # 2. Score
    sx_scores = _load("scores_sexagenary.json")
    matrix_scores = _load("scores_user_x_day.json")
    sx_key = f"{day['element']} {day['sign']}"
    sexagenary_score = None
    matrix_score = None
    matrix_score_flag = ""

    if user_sign is not None:
        sexagenary_score = sx_scores.get(sx_key, {}).get(user_sign)
        m = matrix_scores.get(user_sign, {}).get(day["sign"], {})
        matrix_score = m.get("score")
        matrix_score_flag = m.get("flag", "")
        primary_score = sexagenary_score if sexagenary_score is not None else matrix_score
    else:
        primary_score = _aggregate_day_score(day["element"], day["sign"])

    tone = _tone_from_score(primary_score)

    # 3. Domains
    element_domains = _load("element_domains.json")
    amplified = element_domains.get(day["element"], [])
    category_domains = CATEGORY_DOMAINS[category]
    # Domains the prose should focus on for this category, with element-amplified ones flagged
    focus_domains = category_domains
    amplified_in_focus = [d_ for d_ in focus_domains if d_ in amplified]

    # 4. Matrix keywords (per-sign only; for day-level we synthesize from house + voice + match flags)
    matrix_keywords = {}
    all_domain_keywords = {}
    if user_sign is not None:
        matrix = _load("matrix.json")
        user_block = matrix.get(user_sign, {})
        day_block = user_block.get(day["sign"], {})
        all_domain_keywords = dict(day_block)
        matrix_keywords = {dom: day_block.get(dom, "") for dom in focus_domains}

    # 5. House
    houses = _load("houses.json")
    house = houses.get(day["sign"], "")

    # 6. Voice (only meaningful for per-sign)
    voice = {}
    if user_sign is not None:
        sign_descriptors = _load("sign_descriptors.json")
        voice = sign_descriptors.get(user_sign, {})

    # 7. Match-day flags (Year/Month/Day pillar collisions)
    match = _detect_match_day(year["sign"], month["sign"], day["sign"])

    # 8. User-sign relationships (per-sign only)
    user_sign_relations = []
    if user_sign is not None:
        if user_sign == year["sign"]:
            user_sign_relations.append("ben_ming_nian")
        if user_sign == month["sign"]:
            user_sign_relations.append("ben_ming_yue")
        if user_sign == day["sign"]:
            user_sign_relations.append("ben_ming_ri")
        clash_sign = DIRECTIONAL_CLASHES[user_sign]
        if clash_sign == year["sign"]:
            user_sign_relations.append("year_clash")
        if clash_sign == month["sign"]:
            user_sign_relations.append("month_clash")
        if clash_sign == day["sign"]:
            user_sign_relations.append("day_clash")

    # 9. Western moment
    moment = _western_moment(d)

    return {
        "date": str(d),
        "user_sign": user_sign,
        "category": category,
        "pillars": {
            "year":  {"element": year["element"],  "sign": year["sign"]},
            "month": {"element": month["element"], "sign": month["sign"]},
            "day":   {"element": day["element"],   "sign": day["sign"]},
        },
        "scores": {
            "primary": primary_score,
            "sexagenary_60x12": sexagenary_score,
            "matrix_12x12": matrix_score,
            "matrix_flag": matrix_score_flag,
        },
        "tone": tone,
        "amplified_domains": amplified,
        "focus_domains": focus_domains,
        "amplified_in_focus": amplified_in_focus,
        "matrix_keywords": matrix_keywords,
        "all_domain_keywords": all_domain_keywords,
        "house": house,
        "voice": voice,
        "match_day": match,
        "user_sign_relations": user_sign_relations or None,
        "western_moment": moment,
    }


def render_signal_brief(payload):
    """Compact human-readable brief shown to the prose layer."""
    p = payload["pillars"]
    sign_label = payload["user_sign"] if payload["user_sign"] else "DAY-LEVEL"
    lines = [
        f"DATE          {payload['date']}",
        f"SIGN          {sign_label}",
        f"CATEGORY      {payload['category']}",
        f"YEAR          {p['year']['element']} {p['year']['sign']}",
        f"MONTH         {p['month']['element']} {p['month']['sign']}",
        f"DAY           {p['day']['element']} {p['day']['sign']}",
        f"SCORE         {payload['scores']['primary']}/100  -> {payload['tone'].upper()}",
        f"HOUSE         {payload['house']}",
        f"FOCUS         {', '.join(payload['focus_domains'])}",
        f"AMPLIFIED     {', '.join(payload['amplified_domains'])}",
    ]
    if payload["amplified_in_focus"]:
        lines.append(f"DOUBLE WEIGHT {', '.join(payload['amplified_in_focus'])}  (in focus AND day-element-amplified)")
    if payload["match_day"]:
        lines.append(f"MATCH DAY     {', '.join(payload['match_day'])}")
    if payload["user_sign_relations"]:
        lines.append(f"USER VS DAY   {', '.join(payload['user_sign_relations'])}")
    if payload["western_moment"]:
        lines.append(f"WESTERN       {payload['western_moment']}")

    if payload["voice"]:
        lines.append("")
        lines.append("VOICE:")
        v = payload["voice"]
        if v.get("likes"):
            lines.append(f"  likes:    {v['likes']}")
        if v.get("dislikes"):
            lines.append(f"  dislikes: {v['dislikes']}")
        for trait in v.get("traits", []):
            lines.append(f"  trait:    {trait}")

    if payload["matrix_keywords"]:
        lines.append("")
        lines.append("KEYWORDS (focus domains):")
        for dom, kw in payload["matrix_keywords"].items():
            lines.append(f"  [{dom}] {kw}")

    return "\n".join(lines)


if __name__ == "__main__":
    for case in [
        ("2026-02-17", None, "general"),
        ("2026-02-17", None, "love"),
        ("2026-02-17", None, "money"),
        ("2026-02-17", "Tiger", "general"),
        ("2026-02-17", "Tiger", "love"),
        ("2026-02-17", "Tiger", "money"),
    ]:
        print("="*72)
        print(f"  {case}")
        print("="*72)
        s = get_signals(*case)
        print(render_signal_brief(s))
        print()
