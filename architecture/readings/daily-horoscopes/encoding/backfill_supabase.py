"""
Backfill horoscopes into Supabase from Lunar New Year (2026-02-17) through today.

Generates 39 horoscopes per day:
  - 3 day-level (general, love, money)
  - 12 signs x 3 categories = 36 sign-specific

DRY-RUN by default. Pass --commit to actually generate via Anthropic API and write to Supabase.

Usage:
    python3 backfill_supabase.py                                # dry run, full range
    python3 backfill_supabase.py --start 2026-02-17 --end 2026-02-23  # one week
    python3 backfill_supabase.py --commit                       # generate + insert
    python3 backfill_supabase.py --commit --start 2026-02-17 --end 2026-02-17  # one day

Requires:
    pip install anthropic supabase
    export ANTHROPIC_API_KEY=sk-...
    export NEXT_PUBLIC_SUPABASE_URL=...
    export SUPABASE_SERVICE_ROLE_KEY=...
"""
from __future__ import annotations
import argparse
import json
import os
import sys
import time
from datetime import date, datetime, timedelta
from pathlib import Path

from signals import get_signals, SIGNS, CATEGORIES

ROOT = Path(__file__).resolve().parent
LNY = date(2026, 2, 17)


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--start", default=str(LNY), help="ISO date, default 2026-02-17 (Lunar New Year)")
    p.add_argument("--end", default=str(date.today()), help="ISO date, default today")
    p.add_argument("--commit", action="store_true", help="actually generate + insert (default: dry run)")
    p.add_argument("--skip-existing", action="store_true", help="skip (date,scope,category) rows already in DB")
    return p.parse_args()


def main():
    args = parse_args()
    start = date.fromisoformat(args.start)
    end = date.fromisoformat(args.end)
    days = (end - start).days + 1
    if days <= 0:
        print(f"Empty range: {start} to {end}")
        sys.exit(1)

    total = days * (1 + len(SIGNS)) * len(CATEGORIES)
    print(f"Range: {start} to {end}  ({days} days, {total} horoscopes)")

    if not args.commit:
        print("\n--- DRY RUN ---")
        print("Computing signal payloads only (no API calls, no inserts).")
        for offset in range(days):
            d = start + timedelta(days=offset)
            for sign in [None] + SIGNS:
                for cat in CATEGORIES:
                    s = get_signals(d, sign, cat)
                    label = (sign or "DAY").lower()
                    print(f"  {d} {label:8} {cat:7}  score={s['scores']['primary']}  tone={s['tone']}")
        print(f"\nDry run complete. {total} payloads computed.")
        print("Re-run with --commit to actually generate prose and write to Supabase.")
        return

    # COMMIT MODE
    try:
        import anthropic
    except ImportError:
        print("pip install anthropic")
        sys.exit(1)
    try:
        from supabase import create_client
    except ImportError:
        print("pip install supabase")
        sys.exit(1)

    if not os.getenv("ANTHROPIC_API_KEY"):
        print("ANTHROPIC_API_KEY not set")
        sys.exit(1)
    sb_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL") or os.getenv("SUPABASE_URL")
    sb_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not (sb_url and sb_key):
        print("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        sys.exit(1)

    from prose import generate_one
    client = anthropic.Anthropic()
    sb = create_client(sb_url, sb_key)

    # Optionally fetch existing rows to skip
    existing = set()
    if args.skip_existing:
        resp = sb.table("horoscopes").select("date,scope,category").gte(
            "date", str(start)
        ).lte("date", str(end)).execute()
        existing = {(r["date"], r["scope"], r["category"]) for r in resp.data}
        print(f"Skipping {len(existing)} existing rows.")

    started = time.time()
    written = 0
    failed = 0

    for offset in range(days):
        d = start + timedelta(days=offset)
        for sign in [None] + SIGNS:
            for cat in CATEGORIES:
                scope = (sign or "general").lower()
                key = (str(d), scope, cat)
                if key in existing:
                    continue
                payload = get_signals(d, sign, cat)
                try:
                    text = generate_one(client, payload)
                except Exception as e:
                    print(f"  FAIL {d} {scope:8} {cat:7}  {e}")
                    failed += 1
                    continue
                row = {
                    "date": str(d),
                    "scope": scope,
                    "category": cat,
                    "text": text,
                    "score": payload["scores"]["primary"] or 0,
                    "tone": payload["tone"],
                    "signal_payload": payload,
                    "status": "published",
                }
                try:
                    sb.table("horoscopes").upsert(row, on_conflict="date,scope,category").execute()
                    written += 1
                    print(f"  OK   {d} {scope:8} {cat:7}  ({len(text.split())}w)")
                except Exception as e:
                    print(f"  DB   {d} {scope:8} {cat:7}  {e}")
                    failed += 1

    elapsed = time.time() - started
    print(f"\nDone. {written} written, {failed} failed in {elapsed:.1f}s")

    # Log run
    sb.table("horoscope_runs").insert({
        "target_date": str(end),
        "status": "success" if failed == 0 else ("partial" if written > 0 else "failed"),
        "generated": written,
        "failed": failed,
        "duration_ms": int(elapsed * 1000),
    }).execute()


if __name__ == "__main__":
    main()
