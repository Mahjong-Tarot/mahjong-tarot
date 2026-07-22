#!/usr/bin/env node
// ============================================================
// import-myemailverifier-leads.mjs
//
// Imports MyEmailVerifier-validated deliverable emails into
// public.people as leads. Source CSV:
//   working_files/oca-master-deliverable.csv (37,950 unique)
//
// Inserts with:
//   lifecycle_stage = 'lead'
//   source          = 'legacy_leads'
//   nurture_stage   = 0
//   nurture_status  = 'active'
//   next_send_at    = NULL  (nurture agent will NOT auto-pick;
//                            admin opts them in explicitly)
//   metadata        = { import_batch, source_file, validation }
//
// On email conflict: skipped (existing rows untouched).
//
// Run from /website:
//   node scripts/import-myemailverifier-leads.mjs            (dry run)
//   node scripts/import-myemailverifier-leads.mjs --apply    (live insert)
//
// Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
// in website/.env.local.
// ============================================================

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../..');

// ── env ──────────────────────────────────────────────────────
const envText = readFileSync(resolve(__dirname, '../.env.local'), 'utf8');
const env = Object.fromEntries(
  envText
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
    }),
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in website/.env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ── parse CSV ────────────────────────────────────────────────
const cleanEmail = (e) => (e || '').trim().toLowerCase();

function parseDeliverable() {
  const path = resolve(repoRoot, 'working_files/oca-master-deliverable.csv');
  const text = readFileSync(path, 'utf8');
  const lines = text.split('\n').slice(1); // drop header
  const rows = [];
  for (const line of lines) {
    const e = cleanEmail(line);
    if (!e || !e.includes('@')) continue;
    rows.push({
      email: e,
      name: null,
      source: 'legacy_leads',
      lifecycle_stage: 'lead',
      ok_to_contact: true,
      nurture_stage: 0,
      nurture_status: 'active',
      next_send_at: null,
      metadata: {
        import_batch: 'myemailverifier_3batch_2026_05_27',
        source_file: 'oca-master-deliverable.csv',
        validation: 'myemailverifier',
      },
    });
  }
  return rows;
}

function dedupe(rows) {
  const seen = new Map();
  for (const r of rows) if (!seen.has(r.email)) seen.set(r.email, r);
  return [...seen.values()];
}

async function insertBatch(rows, label) {
  const batchSize = 200;
  let inserted = 0;
  let processed = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const slice = rows.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('people')
      .upsert(slice, { onConflict: 'email', ignoreDuplicates: true })
      .select('id');
    if (error) {
      console.error(`[${label}] batch ${i}-${i + slice.length} failed:`, error.message);
      process.exit(1);
    }
    inserted += data?.length || 0;
    processed += slice.length;
    if (i % 2000 === 0 || processed >= rows.length) {
      const pct = ((processed / rows.length) * 100).toFixed(1);
      console.log(`[${label}] ${processed}/${rows.length} processed (${pct}%) — ${inserted} new`);
    }
  }
  return { inserted, processed, skipped: processed - inserted };
}

// ── main ─────────────────────────────────────────────────────
const all = dedupe(parseDeliverable());
console.log(`Parsed ${all.length} unique deliverable emails from working_files/oca-master-deliverable.csv\n`);

const args = process.argv.slice(2);
if (!args.includes('--apply')) {
  console.log('=== DRY RUN ===\nSample row that would be inserted:');
  console.log(JSON.stringify(all[0], null, 2));
  console.log(`\nReady to insert: ${all.length} rows into public.people`);
  console.log(`Lifecycle: 'lead'   Source: 'legacy_leads'   Nurture: paused (next_send_at=NULL)`);
  console.log('\nRe-run with --apply to perform the insert.');
  process.exit(0);
}

console.log('=== APPLYING ===');
console.log('Inserting into public.people with onConflict (email) → skip existing …\n');
const start = Date.now();
const { inserted, skipped } = await insertBatch(all, 'myemailverifier_leads');
const secs = ((Date.now() - start) / 1000).toFixed(1);
console.log(`\n✓ Done in ${secs}s.`);
console.log(`  Inserted: ${inserted} new leads`);
console.log(`  Skipped:  ${skipped} (email already in public.people)`);
console.log(`  Total in batch: ${all.length}`);
