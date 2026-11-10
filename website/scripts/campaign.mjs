#!/usr/bin/env node
// Campaigns from the command line, for the `campaign` skill (.claude/skills/campaign).
// A campaign here is what the admin's "New campaign" makes: one idea that the
// platform's writer agent turns into one blog post plus its channel posts.
//
// Usage (from website/):
//   node scripts/campaign.mjs recent
//       The last 12 published posts, so a new idea does not repeat one.
//   node scripts/campaign.mjs create --name "…" --idea-file <path> --pillar "<pillar name>"
//                                    --starts-on YYYY-MM-DD [--objective "…"] [--run] [--dry]
//       Creates the campaign. --run also starts the writer: the agent-driver
//       cron picks the run up within 5 minutes and takes one step per tick.
//   node scripts/campaign.mjs run <campaign-id>      Start (or restart) the writer.
//   node scripts/campaign.mjs status <campaign-id>   Where the writer is, and the assets so far.

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, '../.env.local'), 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
    }),
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } }).schema('company_os');
const ADMIN = 'https://www.mahjongtarot.com/admin/revenue/marketing/campaigns';
const ACTOR = 'campaign-skill';

const must = ({ data, error }, what) => {
  if (error) throw new Error(`${what}: ${error.message}`);
  return data;
};
const [cmd, ...rest] = process.argv.slice(2);
const flag = (name) => {
  const i = rest.indexOf(`--${name}`);
  return i === -1 ? null : rest[i + 1];
};
const has = (name) => rest.includes(`--${name}`);

// What the admin's Start button writes (writer/advance.ts startWriterRun).
const startWriter = async (id) =>
  must(
    await db.from('marketing_campaigns').update({ writer_step: 'draft', writer_error: null, writer_started_at: new Date().toISOString() }).eq('id', id),
    'start writer',
  );

async function recent() {
  const rows = must(
    await db.from('marketing_content').select('publish_date, pillar, title').eq('channel', 'blog').order('publish_date', { ascending: false }).limit(12),
    'recent posts',
  );
  for (const r of rows) console.log(`${r.publish_date}  [${r.pillar ?? 'no pillar'}]  ${r.title}`);
}

async function create() {
  const name = flag('name');
  const startsOn = flag('starts-on');
  const pillarName = flag('pillar');
  const idea = flag('idea-file') ? readFileSync(flag('idea-file'), 'utf8').trim() : '';
  if (!name || !idea || !pillarName || !/^\d{4}-\d{2}-\d{2}$/.test(startsOn ?? '')) {
    throw new Error('create needs --name, --idea-file, --pillar and --starts-on YYYY-MM-DD');
  }
  if (idea.includes('—') || name.includes('—')) throw new Error('The name or idea contains an em dash. Rewrite it; the writer refuses them.');

  const brand = must(await db.from('brands').select('id').eq('slug', 'mahjong-tarot').single(), 'brand');
  const pillars = must(await db.from('marketing_pillars').select('id, name').eq('brand_id', brand.id), 'pillars');
  const pillar = pillars.find((p) => p.name.toLowerCase() === pillarName.toLowerCase());
  if (!pillar) throw new Error(`No pillar "${pillarName}". Pillars: ${pillars.map((p) => p.name).join(', ')}`);

  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  const taken = new Set(must(await db.from('marketing_campaigns').select('utm_campaign').like('utm_campaign', `${base}%`), 'utm').map((r) => r.utm_campaign));
  let utm = base;
  for (let n = 2; taken.has(utm); n++) utm = `${base}-${n}`;

  const row = {
    name,
    idea,
    objective: flag('objective'),
    brand_id: brand.id,
    pillar_id: pillar.id,
    starts_on: startsOn,
    utm_campaign: utm,
    created_by: ACTOR,
  };
  if (has('dry')) {
    console.log('DRY RUN, nothing written:', { ...row, idea: `${idea.length} chars`, run: has('run') });
    return;
  }
  const { id } = must(await db.from('marketing_campaigns').insert(row).select('id').single(), 'create campaign');
  if (has('run')) await startWriter(id);
  console.log(`Created ${id}${has('run') ? ', writer started' : ''}\n${ADMIN}/${id}`);
}

async function status(id) {
  const c = must(
    await db.from('marketing_campaigns').select('name, status, starts_on, writer_step, writer_error, writer_started_at').eq('id', id).single(),
    'campaign',
  );
  console.log(`${c.name}  (${c.status}, starts ${c.starts_on})`);
  console.log(`writer: ${c.writer_step ?? 'not started'}${c.writer_error ? `  STOPPED: ${c.writer_error}` : ''}`);
  const assets = must(await db.from('marketing_content').select('channel, language, status, title, image_url').eq('campaign_id', id).order('channel'), 'assets');
  for (const a of assets) console.log(`  ${a.channel}/${a.language}  ${a.status}  ${a.image_url ? 'image' : 'no image'}  ${a.title}`);
  console.log(`${ADMIN}/${id}`);
}

const run = { recent, create, status: () => status(rest[0]), run: async () => { await startWriter(rest[0]); await status(rest[0]); } }[cmd];
if (!run) {
  console.error('Usage: node scripts/campaign.mjs recent | create … | run <id> | status <id>');
  process.exit(1);
}
run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
