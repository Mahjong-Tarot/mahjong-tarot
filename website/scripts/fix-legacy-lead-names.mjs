#!/usr/bin/env node
// One-shot: best-effort rebuild of `name` for source=legacy_leads.
// Reads the source ZB CSV, uses email-handle heuristics to decide the
// real ordering of ZB First/Last, and updates rows.
//
// Confidence buckets (printed at the end):
//   HIGH    — both names appear in the email handle; order resolved
//   MEDIUM  — one name appears at the start of the handle; ZB order kept/swapped accordingly
//   LOW     — one name appears mid-handle; ZB order kept
//   FLAG    — neither name appears in the handle, but both fields present
//   GARBAGE — single-letter or obvious noise (e.g. "St School") — name nulled
//   EMPTY   — no names from ZB; name left null
//
// Run from /website:
//   node scripts/fix-legacy-lead-names.mjs           # dry-run, prints summary + flagged
//   node scripts/fix-legacy-lead-names.mjs --apply   # writes to DB

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../..');
const APPLY = process.argv.includes('--apply');

// ── env ────────────────────────────────────────────────────────
const envText = readFileSync(resolve(__dirname, '../.env.local'), 'utf8');
const env = Object.fromEntries(
  envText.split('\n').filter((l) => l && !l.startsWith('#') && l.includes('=')).map((l) => {
    const i = l.indexOf('=');
    return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
  })
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ── csv ────────────────────────────────────────────────────────
function splitCsv(line) {
  const out = []; let cur = ''; let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQ = false; else cur += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ',') { out.push(cur); cur = ''; } else cur += c;
    }
  }
  out.push(cur);
  return out;
}

let text = readFileSync(resolve(repoRoot, 'working_files/oca-2k-sample-pre-zerobounce_valid.csv'), 'utf8');
if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
const lines = text.split('\n').filter((l) => l.trim());
const header = splitCsv(lines.shift()).map((h) => h.replace(/^"|"$/g, ''));
const iEmail = header.indexOf('email');
const iFirst = header.indexOf('ZB First Name');
const iLast  = header.indexOf('ZB Last Name');

// ── classifier ─────────────────────────────────────────────────
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : '');

function classify(emailRaw, zbFirstRaw, zbLastRaw) {
  const email = (emailRaw || '').trim().toLowerCase();
  const a = (zbFirstRaw || '').trim();
  const b = (zbLastRaw  || '').trim();
  if (!a && !b) return { bucket: 'EMPTY', name: null };

  // Garbage filter: any name that is 1 char, or only digits, or both names obviously not names
  const looksNoise = (s) => !s || s.length < 2 || /^\d+$/.test(s);
  if (looksNoise(a) && looksNoise(b)) return { bucket: 'GARBAGE', name: null };

  const handle = email.split('@')[0].toLowerCase().replace(/[^a-z]/g, '');
  const al = a.toLowerCase();
  const bl = b.toLowerCase();
  const posA = al && al.length >= 2 ? handle.indexOf(al) : -1;
  const posB = bl && bl.length >= 2 ? handle.indexOf(bl) : -1;

  // Both appear → order by position
  if (posA >= 0 && posB >= 0) {
    const order = posA < posB ? [a, b] : [b, a];
    return { bucket: 'HIGH', name: order.map(cap).join(' ') };
  }
  // Only one appears
  if (posA >= 0 && posB < 0) {
    // a is in the email; treat a as first name. Keep b as second word if present.
    const out = [cap(a)]; if (b) out.push(cap(b));
    const conf = posA === 0 ? 'MEDIUM' : 'LOW';
    return { bucket: conf, name: out.join(' ') };
  }
  if (posB >= 0 && posA < 0) {
    // b is in the email; b is more likely the first name → swap.
    const out = [cap(b)]; if (a) out.push(cap(a));
    const conf = posB === 0 ? 'MEDIUM' : 'LOW';
    return { bucket: conf, name: out.join(' ') };
  }
  // Neither in handle
  if (a && b) return { bucket: 'FLAG', name: [cap(a), cap(b)].join(' ') };
  if (a) return { bucket: 'FLAG', name: cap(a) };
  return { bucket: 'FLAG', name: cap(b) };
}

// ── walk rows ──────────────────────────────────────────────────
const buckets = { HIGH: [], MEDIUM: [], LOW: [], FLAG: [], GARBAGE: [], EMPTY: [] };
for (const line of lines) {
  const f = splitCsv(line);
  const email = (f[iEmail] || '').trim().toLowerCase();
  if (!email) continue;
  const c = classify(email, f[iFirst], f[iLast]);
  buckets[c.bucket].push({ email, name: c.name, zbFirst: f[iFirst], zbLast: f[iLast] });
}

console.log('\nClassification:');
for (const [b, arr] of Object.entries(buckets)) console.log(`  ${b.padEnd(8)} ${arr.length}`);

console.log('\nFlagged (no clear signal — review manually):');
for (const r of buckets.FLAG) {
  console.log(`  ${r.email.padEnd(40)} ZB: ${r.zbFirst || '∅'} / ${r.zbLast || '∅'} → currently set to "${r.name}"`);
}

if (!APPLY) {
  console.log('\nDry run. Re-run with --apply to write to DB.');
  process.exit(0);
}

// ── apply ──────────────────────────────────────────────────────
async function applyOne(email, name) {
  const { error } = await supabase
    .from('leads')
    .update({ name })
    .eq('source', 'legacy_leads')
    .eq('email', email);
  if (error) throw new Error(`${email}: ${error.message}`);
}

let done = 0;
const all = [
  ...buckets.HIGH,
  ...buckets.MEDIUM,
  ...buckets.LOW,
  ...buckets.FLAG,
  ...buckets.GARBAGE,
  ...buckets.EMPTY,
];
for (const r of all) {
  await applyOne(r.email, r.name);
  done++;
  if (done % 100 === 0) console.log(`  applied ${done}/${all.length}`);
}
console.log(`\nDone. Updated ${done} legacy_leads rows.`);
