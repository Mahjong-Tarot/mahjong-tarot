"""
Backfill horoscopes into Supabase from Lunar New Year (2026-02-17) through today.

Generates 39 horoscopes per day:
  - 3 day-level (general, love, money)
  - 12 signs x 3 categories = 36 sign-specific

DRY-RUN by default. Pass --commit to write to Supabase, or --out-sql DIR to
write SQL chunks for the SQL Editor (no service-role key needed).

Usage:
    python3 backfill_supabase.py                                # dry run, full range
    python3 backfill_supabase.py --start 2026-02-17 --end 2026-02-23  # one week
    python3 backfill_supabase.py --commit                       # generate + write to Supabase
    python3 backfill_supabase.py --out-sql out/horoscopes       # generate + write SQL chunks

Requires:
    pip install anthropic supabase
    export ANTHROPIC_API_KEY=sk-...

For --commit mode also:
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
    p.add_argument("--out-sql", help="generate prose, write to SQL chunks in DIR (no DB write needed)")
    p.add_argument("--chunk-bytes", type=int, default=540_000,
                   help="target chunk size for --out-sql files (default 540 KB, fits Supabase SQL Editor)")
    p.add_argument("--skip-existing", action="store_true", help="skip (date,scope,category) rows already in DB")
    return p.parse_args()


def _sql_str(s):
    if s is None:
        return "null"
    return "'" + s.replace("'", "''") + "'"


def _sql_jsonb(o):
    if o is None:
        return "null"
    return "'" + json.dumps(o, separators=(", ", ": "), ensure_ascii=False).replace("'", "''") + "'::jsonb"


def _sql_row(row):
    return "  (" + ", ".join([
        _sql_str(row["date"]),
        _sql_str(row["scope"]),
        _sql_str(row["category"]),
        _sql_str(row["text"]),
        str(row["score"]),
        _sql_str(row["tone"]),
        _sql_jsonb(row["signal_payload"]),
        _sql_str(row["status"]),
    ]) + ")"


_SQL_HEADER = """-- ============================================================
-- Mahjong Tarot: horoscopes seed (chunk {chunk_idx} of {chunk_total})
-- Range: {first_date} → {last_date}  ({row_count} rows)
-- Idempotent: UPSERT on (date, scope, category).
-- ============================================================

insert into public.horoscopes
  (date, scope, category, text, score, tone, signal_payload, status)
values
"""

_SQL_TRAILER = """
on conflict (date, scope, category) do update set
  text = excluded.text,
  score = excluded.score,
  tone = excluded.tone,
  signal_payload = excluded.signal_payload,
  status = excluded.status,
  updated_at = now();
"""


def _flush_chunk(out_dir, chunk_idx, chunk_rows):
    """Write a single SQL chunk file to disk. Returns the path written."""
    body = ",\n".join(_sql_row(r) for r in chunk_rows)
    sql = (
        _SQL_HEADER.format(
            chunk_idx=chunk_idx,
            chunk_total="?",  # filled in after all chunks written
            first_date=chunk_rows[0]["date"],
            last_date=chunk_rows[-1]["date"],
            row_count=len(chunk_rows),
        )
        + body
        + _SQL_TRAILER
    )
    path = out_dir / f"horoscopes_chunk_{chunk_idx:02d}.sql"
    path.write_text(sql)
    return path, sql


def _finalize_chunk_total(paths_and_text, total):
    """Replace 'chunk_total=?' placeholder once we know how many chunks were emitted."""
    for path, text in paths_and_text:
        path.write_text(text.replace("of ?", f"of {total}", 1))


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

    if not args.commit and not args.out_sql:
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
        print("Re-run with --commit (write to Supabase) or --out-sql DIR (write SQL chunks).")
        return

    if args.out_sql and args.commit:
        print("Pass either --commit or --out-sql, not both.")
        sys.exit(1)

    # PROSE GENERATION (shared by --commit and --out-sql)
    try:
        import anthropic
    except ImportError:
        print("pip install anthropic")
        sys.exit(1)
    if not os.getenv("ANTHROPIC_API_KEY"):
        print("ANTHROPIC_API_KEY not set")
        sys.exit(1)

    from prose import generate_one
    client = anthropic.Anthropic()

    if args.out_sql:
        out_dir = Path(args.out_sql)
        out_dir.mkdir(parents=True, exist_ok=True)
        return _run_out_sql(args, start, end, days, client, generate_one, out_dir)
    return _run_commit(args, start, end, days, client, generate_one)


def _run_out_sql(args, start, end, days, client, generate_one, out_dir):
    started = time.time()
    rows_buffer = []
    chunks_emitted = []
    bytes_in_buffer = 0
    failed = 0

    for offset in range(days):
        d = start + timedelta(days=offset)
        for sign in [None] + SIGNS:
            for cat in CATEGORIES:
                scope = (sign or "general").lower()
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
                row_sql = _sql_row(row)
                row_bytes = len(row_sql.encode("utf-8")) + 2  # +2 for ',\n'
                if rows_buffer and bytes_in_buffer + row_bytes > args.chunk_bytes:
                    chunks_emitted.append(_flush_chunk(out_dir, len(chunks_emitted) + 1, rows_buffer))
                    print(f"  chunk {len(chunks_emitted):02d} written ({len(rows_buffer)} rows)")
                    rows_buffer = []
                    bytes_in_buffer = 0
                rows_buffer.append(row)
                bytes_in_buffer += row_bytes
                print(f"  OK   {d} {scope:8} {cat:7}  ({len(text.split())}w)")

    if rows_buffer:
        chunks_emitted.append(_flush_chunk(out_dir, len(chunks_emitted) + 1, rows_buffer))
        print(f"  chunk {len(chunks_emitted):02d} written ({len(rows_buffer)} rows)")

    _finalize_chunk_total(chunks_emitted, len(chunks_emitted))

    elapsed = time.time() - started
    print(f"\nDone. {len(chunks_emitted)} SQL chunk(s) in {out_dir}, {failed} failed, {elapsed:.1f}s")
    print("Paste each file into the Supabase SQL Editor in order.")


def _run_commit(args, start, end, days, client, generate_one):
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
