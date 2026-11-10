#!/usr/bin/env node
// Put the posts published by the file pipeline into the marketing platform's
// campaign model. publish-blog-post.mjs calls this for each slug it publishes;
// run with no slugs it covers every published post (the original backfill).
//
// For each week of published blog posts it creates one marketing_campaigns row,
// links that week's blog rows to it, loads the social captions from
// content/topics/<dated-folder>/ as marketing_content rows (parented to their
// blog), uploads the social images to the "marketing" bucket, and records every
// image (blog heroes included) in marketing_asset_images.
//
// Safe to re-run: a week's campaign is found by its start date, social rows by
// (parent, channel, language, date), images by entry.
//
// Usage (from website/):
//   node scripts/sync-campaigns.mjs [<slug> ...]            dry run, prints the plan
//   node scripts/sync-campaigns.mjs --apply [<slug> ...]    writes to the database

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

let APPLY = false;
const ACTOR = 'backfill-campaigns';
const __dirname = dirname(fileURLToPath(import.meta.url));
const TOPICS = resolve(__dirname, '../../content/topics');

const env = Object.fromEntries(
  readFileSync(resolve(__dirname, '../.env.local'), 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
    }),
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const db = supabase.schema('company_os');

const DAYS = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 };
// File suffix → the platform's channel and language. Instagram has no channel
// in marketing_content_channel_check, so those captions are left on disk.
const CHANNELS = {
  'facebook-en': { channel: 'facebook', language: 'en' },
  'facebook-vn': { channel: 'facebook', language: 'vi' },
  linkedin: { channel: 'linkedin', language: 'en' },
  x: { channel: 'twitter', language: 'en' },
};

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const addDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const mondayOf = (iso) => addDays(iso, -((new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7));
const must = ({ data, error }, what) => {
  if (error) throw new Error(`${what}: ${error.message}`);
  return data;
};

// "## Week of April 13 — Theme" / "## Week of November 9: Theme" → { '04-13': 'Theme' }
function indexThemes() {
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const out = {};
  for (const line of readFileSync(join(TOPICS, 'INDEX.md'), 'utf8').split('\n')) {
    const m = line.match(/^## Week of (\w+) (\d+)\s*(?:—|:)\s*(.+)$/);
    if (!m) continue;
    const mm = String(months.indexOf(m[1].toLowerCase()) + 1).padStart(2, '0');
    out[`${mm}-${m[2].padStart(2, '0')}`] = m[3].trim();
  }
  return out;
}

function readFolders() {
  return readdirSync(TOPICS)
    .filter((d) => /^\d{4}-\d{2}-\d{2}-/.test(d) && statSync(join(TOPICS, d)).isDirectory())
    .map((d) => {
      const dir = join(TOPICS, d);
      const files = readdirSync(dir);
      let prompts = [];
      if (existsSync(join(dir, 'image-prompts.json'))) {
        const j = JSON.parse(readFileSync(join(dir, 'image-prompts.json'), 'utf8'));
        prompts = (Array.isArray(j) ? j : j.images ?? []).filter((p) => p && typeof p === 'object');
      }
      return { name: d, dir, date: d.slice(0, 10), files, prompts, slug: prompts.find((p) => p.slug)?.slug ?? null };
    });
}

// slugs: only these posts (and their week's campaign); empty means every post.
export async function syncCampaigns({ apply = false, slugs = [] } = {}) {
  APPLY = apply;
  const brand = must(await db.from('brands').select('id').eq('slug', 'mahjong-tarot').single(), 'brand');
  const blogs = must(
    await db.from('marketing_content').select('id, slug, title, publish_date, pillar, pillar_id, image_url, campaign_id')
      .eq('brand_id', brand.id).eq('channel', 'blog').eq('status', 'published').order('publish_date'),
    'blogs',
  );
  const today = new Date().toISOString().slice(0, 10);
  const themes = indexThemes();

  // Folder → blog: by slug first, then by a unique publish-date match.
  const folders = readFolders();
  const folderFor = new Map();
  for (const f of folders) {
    const b = blogs.find((x) => x.slug === f.slug);
    if (b) folderFor.set(b.id, f);
  }
  for (const f of folders) {
    if ([...folderFor.values()].includes(f)) continue;
    const free = blogs.filter((b) => b.publish_date === f.date && !folderFor.has(b.id));
    if (free.length === 1) folderFor.set(free[0].id, f);
  }
  const unmatched = folders.filter((f) => ![...folderFor.values()].includes(f));

  const weeks = new Map();
  for (const b of blogs) {
    const mon = mondayOf(b.publish_date);
    weeks.set(mon, [...(weeks.get(mon) ?? []), b]);
  }

  const totals = { campaigns: 0, linked: 0, social: 0, uploads: 0, images: 0, noImage: 0, instagram: 0 };

  for (const [monday, weekPosts] of weeks) {
    const posts = slugs.length ? weekPosts.filter((p) => slugs.includes(p.slug)) : weekPosts;
    if (!posts.length) continue;
    const theme = themes[monday.slice(5)] ?? weekPosts[0].title;
    const name = theme.replace(/\s*—\s*/g, ': ');
    const utm = `${slugify(name).slice(0, 48)}-${monday.slice(5).replace('-', '')}`;
    const lastDay = weekPosts.reduce((m, p) => (p.publish_date > m ? p.publish_date : m), monday);
    const endsOn = addDays(lastDay, 1) > addDays(monday, 6) ? addDays(lastDay, 1) : addDays(monday, 5);
    console.log(`\n${monday}  ${name}  [${utm}]`);

    let campaignId = null;
    if (APPLY) {
      const found = must(
        await db.from('marketing_campaigns').select('id').eq('brand_id', brand.id).eq('starts_on', monday).eq('created_by', ACTOR).limit(1),
        'campaign lookup',
      )[0];
      campaignId = found?.id ?? must(
        await db.from('marketing_campaigns').insert({
          name,
          brand_id: brand.id,
          pillar_id: weekPosts[0].pillar_id,
          starts_on: monday,
          ends_on: endsOn,
          status: endsOn < today ? 'done' : 'active',
          utm_campaign: utm,
          created_by: ACTOR,
        }).select('id').single(),
        'campaign insert',
      ).id;
    }
    totals.campaigns += 1;

    for (const blog of posts) {
      const folder = folderFor.get(blog.id);
      console.log(`  blog ${blog.publish_date} ${blog.slug}${folder ? `  ← ${folder.name}` : '  (no topic folder)'}`);
      if (APPLY) must(await db.from('marketing_content').update({ campaign_id: campaignId }).eq('id', blog.id), 'link blog');
      totals.linked += 1;

      // The blog hero is already served from /public; record it as the selected image.
      if (blog.image_url) {
        const prompt = folder?.prompts.find((p) => String(p.content_type ?? p.file ?? '').startsWith('blog'))?.prompt ?? null;
        await recordImage(blog.id, blog.image_url, prompt, totals);
      }
      if (!folder) continue;

      for (const file of folder.files.filter((f) => f.endsWith('.md')).sort()) {
        const m = file.match(/^(mon|tue|wed|thu|fri|sat|sun)-(.+)\.md$/);
        if (!m) continue;
        const [, day, kind] = m;
        if (kind === 'instagram') { totals.instagram += 1; continue; }
        const target = CHANNELS[kind];
        if (!target) { console.log(`    ? skipped ${file} (unknown channel)`); continue; }

        const publishDate = addDays(monday, DAYS[day]);
        const key = `${day}-${kind}`;
        const image = folder.files.find((f) => f.endsWith(`-${key}.webp`)) ?? null;
        if (!image) totals.noImage += 1;
        console.log(`    ${publishDate} ${target.channel}/${target.language}${image ? '  + image' : ''}`);
        totals.social += 1;
        if (!APPLY) { if (image) { totals.uploads += 1; totals.images += 1; } continue; }

        const existing = must(
          await db.from('marketing_content').select('id').eq('parent_id', blog.id).eq('channel', target.channel)
            .eq('language', target.language).eq('publish_date', publishDate).maybeSingle(),
          'social lookup',
        );
        const entryId = existing?.id ?? must(
          await db.from('marketing_content').insert({
            title: blog.title,
            brand_id: brand.id,
            pillar: blog.pillar,
            pillar_id: blog.pillar_id,
            campaign_id: campaignId,
            parent_id: blog.id,
            channel: target.channel,
            language: target.language,
            // The captions were handed off for posting on these dates; past
            // dates are recorded as published, today and later as approved.
            status: publishDate < today ? 'published' : 'approved',
            publish_date: publishDate,
            copy_md: readFileSync(join(folder.dir, file), 'utf8').trim(),
            created_by: ACTOR,
          }).select('id').single(),
          'social insert',
        ).id;

        if (image) {
          const path = `entries/${entryId}/${image}`;
          const { error: upErr } = await supabase.storage.from('marketing')
            .upload(path, readFileSync(join(folder.dir, image)), { contentType: 'image/webp', upsert: true });
          if (upErr) throw new Error(`upload ${image}: ${upErr.message}`);
          totals.uploads += 1;
          const url = supabase.storage.from('marketing').getPublicUrl(path).data.publicUrl;
          const prompt = folder.prompts.find((p) => p.content_type === key || p.file === file)?.prompt ?? null;
          await recordImage(entryId, url, prompt, totals);
          must(await db.from('marketing_content').update({ image_url: url }).eq('id', entryId), 'mirror image_url');
        }
      }
    }
  }

  console.log(`\n${APPLY ? 'APPLIED' : 'DRY RUN'}:`, totals);
  if (unmatched.length && !slugs.length) console.log(`Topic folders with no published post (skipped): ${unmatched.map((f) => f.name).join(', ')}`);
}

async function recordImage(entryId, url, prompt, totals) {
  if (!APPLY) { totals.images += 1; return; }
  const have = must(await db.from('marketing_asset_images').select('id').eq('entry_id', entryId).limit(1), 'image lookup');
  if (have.length) return;
  must(
    await db.from('marketing_asset_images').insert({ entry_id: entryId, url, prompt_used: prompt, is_selected: true, created_by: ACTOR }),
    'image insert',
  );
  totals.images += 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  syncCampaigns({ apply: args.includes('--apply'), slugs: args.filter((a) => !a.startsWith('--')) }).catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
