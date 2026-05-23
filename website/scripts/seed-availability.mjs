#!/usr/bin/env node
// seed-availability.mjs — populate public.reading_availability with
// open slots for the next N days. Idempotent — uses the (slot_start,
// duration_minutes) unique constraint to skip slots that already exist.
//
// Usage:
//   node scripts/seed-availability.mjs                          # 30 days, Bill
//   node scripts/seed-availability.mjs --days 60                # 60 days, Bill
//   node scripts/seed-availability.mjs --astrologer-id <uuid>   # populate someone else's calendar
//   node scripts/seed-availability.mjs --dry                    # print only
//
// Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local.

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_FILE = path.resolve(__dirname, '..', '.env.local');

// Crude .env.local reader (avoids dotenv dep)
try {
  const raw = readFileSync(ENV_FILE, 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    if (!process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"(.*)"$/, '$1');
  }
} catch {
  // ok if missing — env may already be set
}

const args = process.argv.slice(2);
const DAYS = parseInt(arg('--days') || '30', 10);
const DRY  = args.includes('--dry');
// Default = Bill (c02c4b87…); override with --astrologer-id when seeding
// for a second astrologer.
const ASTROLOGER_ID = arg('--astrologer-id') || 'c02c4b87-a890-4614-8720-cd19d7745943';

function arg(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
}

// ── Configuration ──────────────────────────────────────────────
// Edit these to control Bill's availability windows.
// Times are in this IANA timezone; the script converts to UTC for storage.
const TIMEZONE = 'America/New_York';

// Weekdays Bill takes (0=Sun, 1=Mon, ..., 6=Sat)
const WEEKDAYS = [1, 2, 3, 4, 5]; // Mon–Fri

// Slot start times — local clock, 24h. The slots themselves are duration_minutes long.
// Default: morning + afternoon offerings.
const SLOT_HOURS = [
  { hour: 10, minute: 0, duration_minutes: 60 },
  { hour: 11, minute: 0, duration_minutes: 30 },
  { hour: 14, minute: 0, duration_minutes: 60 },
  { hour: 15, minute: 30, duration_minutes: 90 },
];

// Booking lead time: don't offer slots within this many hours of now.
const LEAD_HOURS = 24;

// ───────────────────────────────────────────────────────────────

function buildSlotUtc(yyyy_mm_dd, hour, minute, tz) {
  // Construct UTC ms for the wall-clock instant {yyyy_mm_dd, hour, minute}
  // in the given IANA timezone. Two iterations of the formatToParts probe
  // converge across DST boundaries.
  const [y, m, d] = yyyy_mm_dd.split('-').map(Number);
  const targetMs = Date.UTC(y, m - 1, d, hour, minute, 0);
  let utcMs = targetMs;
  for (let i = 0; i < 2; i++) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).formatToParts(new Date(utcMs));
    const get = (t) => parts.find((p) => p.type === t)?.value;
    const ly  = Number(get('year'));
    const lm  = Number(get('month'));
    const ld  = Number(get('day'));
    let   lh  = Number(get('hour'));
    if (lh === 24) lh = 0; // Intl quirk
    const lmin = Number(get('minute'));
    const observedMs = Date.UTC(ly, lm - 1, ld, lh, lmin, 0);
    utcMs += (targetMs - observedMs);
  }
  return new Date(utcMs);
}

// Returns {y,m,d, dow} for a Date as seen in the configured TIMEZONE.
function dateInTz(date, tz) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    weekday: 'short',
  }).formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t)?.value;
  const dowMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    y: Number(get('year')),
    m: Number(get('month')),
    d: Number(get('day')),
    dow: dowMap[get('weekday')],
  };
}

function* generateSlots(days) {
  const now = new Date();
  const earliest = new Date(Date.now() + LEAD_HOURS * 60 * 60 * 1000);
  const startTodayTz = dateInTz(now, TIMEZONE);
  // Use UTC math to iterate forward N calendar days, then re-project to tz.
  const startUtc = Date.UTC(startTodayTz.y, startTodayTz.m - 1, startTodayTz.d);
  for (let i = 0; i < days; i++) {
    const probe = new Date(startUtc + i * 86_400_000);
    const tzDay = dateInTz(probe, TIMEZONE);
    if (!WEEKDAYS.includes(tzDay.dow)) continue;
    const yyyy_mm_dd = `${tzDay.y}-${String(tzDay.m).padStart(2, '0')}-${String(tzDay.d).padStart(2, '0')}`;
    for (const cfg of SLOT_HOURS) {
      const utc = buildSlotUtc(yyyy_mm_dd, cfg.hour, cfg.minute, TIMEZONE);
      if (utc.getTime() < earliest.getTime()) continue;
      yield {
        slot_start: utc.toISOString(),
        duration_minutes: cfg.duration_minutes,
        status: 'open',
        astrologer_id: ASTROLOGER_ID,
      };
    }
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.');
  console.error('Either populate website/.env.local (vercel env pull) or export them.');
  process.exit(1);
}

const client = createClient(url, key, { auth: { persistSession: false } });

const slots = Array.from(generateSlots(DAYS));
console.log(`Generated ${slots.length} candidate slots over the next ${DAYS} days for astrologer ${ASTROLOGER_ID}.`);
if (DRY) {
  for (const s of slots) console.log(' ', s.slot_start, `(${s.duration_minutes} min)`);
  process.exit(0);
}

// Insert; ignore conflicts on (slot_start, duration_minutes).
const { data, error } = await client
  .from('reading_availability')
  .upsert(slots, { onConflict: 'slot_start,duration_minutes', ignoreDuplicates: true })
  .select('id');

if (error) {
  console.error('Insert failed:', error.message);
  process.exit(1);
}

console.log(`Inserted/kept ${data?.length ?? 0} rows.`);
