"""
Generate 2026 deliverables:
  out/2026-pillars.csv          one row per day, all three pillars + match flags
  out/2026-signals-preview.json  full signal payloads for one sample week (12 signs x 7 days)
  out/2026-loaded-days.csv      every day where any pillar collision OR Western moment fires
"""
import csv
import json
from datetime import date, timedelta
from pathlib import Path

from pillars import pillars_for
from signals import get_signals, SIGNS, WESTERN_MOMENTS

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "out"
OUT.mkdir(exist_ok=True)


def daily_pillars_csv():
    path = OUT / "2026-pillars.csv"
    with path.open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow([
            "date", "weekday",
            "year_element", "year_sign",
            "month_element", "month_sign", "lunar_month",
            "day_element", "day_sign", "sexagenary_index",
            "match_year_month", "match_year_day", "match_month_day",
            "western_moment",
        ])
        d = date(2026, 1, 1)
        end = date(2026, 12, 31)
        while d <= end:
            p = pillars_for(d)
            y, m, dy = p["year"], p["month"], p["day"]
            w.writerow([
                d.isoformat(),
                d.strftime("%a"),
                y["element"], y["sign"],
                m["element"], m["sign"], m["lunar_month"],
                dy["element"], dy["sign"], dy["sexagenary_index"],
                int(y["sign"] == m["sign"]),
                int(y["sign"] == dy["sign"]),
                int(m["sign"] == dy["sign"]),
                WESTERN_MOMENTS.get((d.month, d.day), ""),
            ])
            d += timedelta(days=1)
    return path


def signal_preview_week():
    """Full signal payloads for one sample week × all 12 user signs.
    Picked Lunar New Year week (2026-02-15 → 2026-02-21) so the writer can see
    a Year-pillar transition mid-week."""
    path = OUT / "2026-signals-preview.json"
    payloads = []
    d = date(2026, 2, 15)
    for _ in range(7):
        for sign in SIGNS:
            payloads.append(get_signals(d, sign))
        d += timedelta(days=1)
    path.write_text(json.dumps(payloads, indent=2))
    return path, len(payloads)


def loaded_days_csv():
    """Every 2026 day where any of the rule-based loadings fires for any user-sign."""
    path = OUT / "2026-loaded-days.csv"
    with path.open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["date", "year_pillar", "month_pillar", "day_pillar",
                    "match_day", "western_moment"])
        d = date(2026, 1, 1)
        end = date(2026, 12, 31)
        while d <= end:
            p = pillars_for(d)
            y, m, dy = p["year"], p["month"], p["day"]
            matches = []
            if y["sign"] == m["sign"]:
                matches.append("year=month")
            if y["sign"] == dy["sign"]:
                matches.append("year=day")
            if m["sign"] == dy["sign"]:
                matches.append("month=day")
            western = WESTERN_MOMENTS.get((d.month, d.day), "")
            if matches or western:
                w.writerow([
                    d.isoformat(),
                    f"{y['element']} {y['sign']}",
                    f"{m['element']} {m['sign']}",
                    f"{dy['element']} {dy['sign']}",
                    "; ".join(matches),
                    western,
                ])
            d += timedelta(days=1)
    return path


def main():
    p1 = daily_pillars_csv()
    p2, n = signal_preview_week()
    p3 = loaded_days_csv()
    print(f"  wrote {p1.name:30} (365 rows)")
    print(f"  wrote {p2.name:30} ({n} payloads = 7 days × 12 signs)")
    print(f"  wrote {p3.name:30} (astrologically loaded days only)")


if __name__ == "__main__":
    main()
