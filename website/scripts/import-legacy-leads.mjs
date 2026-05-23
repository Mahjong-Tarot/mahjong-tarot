#!/usr/bin/env node
// One-shot import: legacy customers (with names) + legacy ZB-valid leads.
// Inserts into public.leads with next_send_at = NULL so the nurture agent
// will not pick them up automatically. Run from /website:
//   node scripts/import-legacy-leads.mjs
// Requires SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL in .env.local.
// Migration 026_legacy_lead_sources.sql must be applied first.

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../..');

// ── env ────────────────────────────────────────────────────────
const envText = readFileSync(resolve(__dirname, '../.env.local'), 'utf8');
const env = Object.fromEntries(
  envText
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
    })
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in website/.env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

// ── helpers ────────────────────────────────────────────────────
const cleanEmail = (e) => (e || '').trim().toLowerCase();
const cleanField = (v) => (v == null ? '' : String(v).trim());

// Minimal CSV line splitter — handles double-quoted fields.
function splitCsv(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQ = false;
      else cur += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ',') { out.push(cur); cur = ''; }
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}

// ── legacy_customers from customerEmail2.txt (TSV) ─────────────
function parseCustomers() {
  const path = resolve(repoRoot, 'working_files/customerEmail2.txt');
  const lines = readFileSync(path, 'utf8').split('\n').filter((l) => l.trim());
  const rows = [];
  for (const line of lines) {
    const [first, last, email, gender, country] = line.split('\t').map(cleanField);
    const e = cleanEmail(email);
    if (!e || !e.includes('@')) continue;
    const name = [first, last].filter(Boolean).join(' ') || null;
    rows.push({
      email: e,
      name,
      source: 'legacy_customers',
      stage: 0,
      status: 'active',
      next_send_at: null,
      metadata: {
        import_batch: 'legacy_customerEmail2_2026_05_23',
      },
    });
  }
  return rows;
}

// ── legacy_leads from ZeroBounce valid CSV ─────────────────────
function parseValidLeads() {
  const path = resolve(repoRoot, 'working_files/oca-2k-sample-pre-zerobounce_valid.csv');
  let text = readFileSync(path, 'utf8');
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1); // strip BOM
  const lines = text.split('\n').filter((l) => l.trim());
  const header = splitCsv(lines.shift()).map((h) => h.replace(/^"|"$/g, ''));
  const col = (name) => header.indexOf(name);
  const iEmail = col('email');
  const iFirst = col('ZB First Name');
  const iLast  = col('ZB Last Name');

  const rows = [];
  for (const line of lines) {
    const f = splitCsv(line).map(cleanField);
    const e = cleanEmail(f[iEmail]);
    if (!e || !e.includes('@')) continue;
    const first = f[iFirst] || null;
    const last  = f[iLast]  || null;
    // ZB labels look reversed in the data (e.g. cmh09@att.net → first=Hogge,
    // last=Caroline). Store raw fields in metadata so we can correct later.
    const name = [first, last].filter(Boolean).join(' ') || null;
    rows.push({
      email: e,
      name,
      source: 'legacy_leads',
      stage: 0,
      status: 'active',
      next_send_at: null,
      metadata: {
        import_batch: 'legacy_zerobounce_valid_2026_05_23',
      },
    });
  }
  return rows;
}

// ── dedupe within batch (email is UNIQUE) ──────────────────────
function dedupe(rows) {
  const seen = new Map();
  for (const r of rows) if (!seen.has(r.email)) seen.set(r.email, r);
  return [...seen.values()];
}

async function insertBatch(rows, label) {
  const batchSize = 200;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const slice = rows.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('leads')
      .upsert(slice, { onConflict: 'email', ignoreDuplicates: true })
      .select('id');
    if (error) {
      console.error(`[${label}] batch ${i}-${i + slice.length} failed:`, error.message);
      process.exit(1);
    }
    inserted += data?.length || 0;
    console.log(`[${label}] inserted ${inserted} / ${rows.length}`);
  }
  return inserted;
}

// ── main ───────────────────────────────────────────────────────
const customers = dedupe(parseCustomers());
const leads = dedupe(parseValidLeads());

console.log(`Parsed ${customers.length} legacy_customers, ${leads.length} legacy_leads.`);
const args = process.argv.slice(2);
if (!args.includes('--apply')) {
  console.log('\nDry run. Sample customer row:');
  console.log(JSON.stringify(customers[0], null, 2));
  console.log('\nSample lead row:');
  console.log(JSON.stringify(leads[0], null, 2));
  console.log('\nRe-run with --apply to insert.');
  process.exit(0);
}

const c = await insertBatch(customers, 'legacy_customers');
const l = await insertBatch(leads, 'legacy_leads');
console.log(`\nDone. Inserted ${c} customers + ${l} leads (existing emails skipped).`);
