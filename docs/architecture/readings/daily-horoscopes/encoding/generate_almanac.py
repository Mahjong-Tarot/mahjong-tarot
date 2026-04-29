"""
Almanac generator. Two outputs:

  out/2026-almanac.json  — full year of almanac records (Lunar New Year → eve of next LNY)
  out/2026-almanac.csv   — flat per-day summary for spot-checking

Optional Supabase write with --commit (upserts into public.almanac_days).

Usage:
    python3 generate_almanac.py                          # writes JSON + CSV to out/
    python3 generate_almanac.py --start 2026-02-17 --end 2027-02-05
    python3 generate_almanac.py --commit                 # writes to Supabase too
    python3 generate_almanac.py --commit --skip-existing # only insert missing dates
"""
from __future__ import annotations
import argparse
import csv
import json
import os
import sys
import time
from datetime import date, timedelta
from pathlib import Path

from almanac import almanac_for

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "out"
OUT.mkdir(exist_ok=True)

LNY_2026 = date(2026, 2, 17)
LNY_2027 = date(2027, 2, 6)


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--start", default=str(LNY_2026), help="ISO date, default 2026-02-17 (LNY)")
    p.add_argument("--end",   default=str(LNY_2027 - timedelta(days=1)),
                   help="ISO date, default 2027-02-05 (eve of next LNY)")
    p.add_argument("--commit", action="store_true",
                   help="upsert into Supabase public.almanac_days")
    p.add_argument("--skip-existing", action="store_true",
                   help="skip dates already present in DB (default: upsert all)")
    return p.parse_args()


def collect(start, end):
    rows = []
    d = start
    while d <= end:
        rows.append(almanac_for(d))
        d += timedelta(days=1)
    return rows


def write_json(rows, path):
    path.write_text(json.dumps(rows, indent=2))
    return path


def write_csv(rows, path):
    with path.open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow([
            "date", "weekday", "lunar_month", "lunar_day",
            "year_pillar", "month_pillar", "day_pillar",
            "officer", "year_conflict", "score", "tone", "holiday",
            "lucky_count", "unlucky_count",
        ])
        for a in rows:
            verdicts = a["activities"]
            lucky = sum(1 for v in verdicts.values() if v == "Lucky")
            unlucky = sum(1 for v in verdicts.values() if v == "Unlucky")
            p = a["pillars"]
            w.writerow([
                a["date"], a["weekday"], a["lunar_month"], a["lunar_day"],
                f'{p["year"]["element"]} {p["year"]["sign"]}',
                f'{p["month"]["element"]} {p["month"]["sign"]}',
                f'{p["day"]["element"]} {p["day"]["sign"]}',
                a["officer"]["english"],
                a["year_conflict"],
                a["score"], a["tone"], a["holiday"],
                lucky, unlucky,
            ])
    return path


def upsert_supabase(rows, skip_existing=False):
    try:
        from supabase import create_client
    except ImportError:
        print("pip install supabase")
        sys.exit(1)

    sb_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL") or os.getenv("SUPABASE_URL")
    sb_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not (sb_url and sb_key):
        print("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        sys.exit(1)

    sb = create_client(sb_url, sb_key)

    existing = set()
    if skip_existing and rows:
        start = rows[0]["date"]
        end = rows[-1]["date"]
        resp = sb.table("almanac_days").select("date").gte("date", start).lte("date", end).execute()
        existing = {r["date"] for r in (resp.data or [])}
        print(f"Found {len(existing)} existing rows; will skip them.")

    written = 0
    failed = 0
    started = time.time()

    for a in rows:
        if a["date"] in existing:
            continue
        row = {
            "date":             a["date"],
            "weekday":          a["weekday"],
            "pillars":          a["pillars"],
            "lunar_day":        a["lunar_day"],
            "lunar_month":      a["lunar_month"],
            "is_leap_month":    a["is_leap_month"],
            "officer":          a["officer"],
            "year_conflict":    a["year_conflict"],
            "auspicious_hours": a["auspicious_hours"],
            "activities":       a["activities"],
            "match_day":        a["match_day"],
            "western_moment":   a["western_moment"],
            "holiday":          a["holiday"] or None,
            "score":            a["score"],
            "tone":             a["tone"],
        }
        try:
            sb.table("almanac_days").upsert(row, on_conflict="date").execute()
            written += 1
        except Exception as e:
            print(f"  DB FAIL {a['date']}: {e}")
            failed += 1

    elapsed = time.time() - started
    print(f"Supabase: {written} upserted, {failed} failed in {elapsed:.1f}s")


def main():
    args = parse_args()
    start = date.fromisoformat(args.start)
    end = date.fromisoformat(args.end)
    if end < start:
        print(f"Empty range: {start} to {end}")
        sys.exit(1)

    print(f"Generating almanac: {start} → {end}  ({(end-start).days + 1} days)")
    rows = collect(start, end)

    json_path = OUT / f"{start.year}-almanac.json"
    csv_path = OUT / f"{start.year}-almanac.csv"
    write_json(rows, json_path)
    write_csv(rows, csv_path)
    print(f"  wrote {json_path.name} ({len(rows)} rows)")
    print(f"  wrote {csv_path.name}")

    # Quick distribution
    tones = {}
    for a in rows:
        tones[a["tone"]] = tones.get(a["tone"], 0) + 1
    print(f"  tone distribution: {tones}")

    if args.commit:
        upsert_supabase(rows, skip_existing=args.skip_existing)


if __name__ == "__main__":
    main()
