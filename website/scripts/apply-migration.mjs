#!/usr/bin/env node
// Apply a .sql migration via the Supabase Management API.
// Reads SUPABASE_ACCESS_TOKEN + PUBLIC_SUPABASE_URL from ../../.env (repo root).
//
// Usage:  node scripts/apply-migration.mjs <path-to-sql-file>

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../..');

const sqlPath = process.argv[2];
if (!sqlPath) { console.error('Usage: node scripts/apply-migration.mjs <sql-file>'); process.exit(1); }

// Merge env from both files. website/.env.local holds the real mahjong-tarot
// Supabase creds (NEXT_PUBLIC_SUPABASE_URL); repo-root .env holds the
// Management API access token. Root .env wins on collision.
function readEnv(path) {
  try {
    const text = readFileSync(path, 'utf8');
    return Object.fromEntries(
      text.split('\n').filter((l) => l && !l.startsWith('#') && l.includes('=')).map((l) => {
        const i = l.indexOf('=');
        return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
      })
    );
  } catch { return {}; }
}
const env = {
  ...readEnv(resolve(__dirname, '../.env.local')),
  ...readEnv(resolve(repoRoot, '.env')),
};

const token = env.SUPABASE_ACCESS_TOKEN;
const url   = env.NEXT_PUBLIC_SUPABASE_URL || env.PUBLIC_SUPABASE_URL;
if (!token) { console.error('Missing SUPABASE_ACCESS_TOKEN in .env'); process.exit(1); }
if (!url)   { console.error('Missing PUBLIC_SUPABASE_URL in .env');   process.exit(1); }

const ref = url.replace(/^https?:\/\//, '').replace(/\.supabase\.co.*$/, '');
if (!ref)   { console.error(`Could not parse project ref from URL: ${url}`); process.exit(1); }
console.log(`Project ref: ${ref}`);
console.log(`Migration:   ${sqlPath}`);

const sql = readFileSync(resolve(repoRoot, sqlPath), 'utf8');
console.log(`SQL length:  ${sql.length} chars\n`);

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
});

const text = await res.text();
let body;
try { body = JSON.parse(text); } catch { body = text; }

console.log(`Status: ${res.status} ${res.statusText}`);
console.log('Response:', typeof body === 'string' ? body : JSON.stringify(body, null, 2));

if (!res.ok) process.exit(1);
console.log('\n✓ Migration applied.');
