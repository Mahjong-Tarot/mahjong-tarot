#!/usr/bin/env node
// Publish content/blog/<slug>.md to the blog database (company_os.marketing_content).
//
// The public blog reads the database (docs/engineering/2026-09-28-marketing-platform-port.md,
// decision 1). A markdown post written by the writer/build-page flow reaches the site
// by running this script; posts made in the admin (Marketing → Campaigns) are
// already in the database. Re-running for a slug updates its row in place.
//
// Usage (from website/):
//   node scripts/publish-blog-post.mjs <slug> [<slug> ...]
//   node scripts/publish-blog-post.mjs --all
//
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from website/.env.local.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = resolve(__dirname, '../../content/blog');

function readEnv(path) {
  try {
    return Object.fromEntries(
      readFileSync(path, 'utf8')
        .split('\n')
        .filter((l) => l && !l.startsWith('#') && l.includes('='))
        .map((l) => {
          const i = l.indexOf('=');
          return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
        }),
    );
  } catch {
    return {};
  }
}
const env = { ...readEnv(resolve(__dirname, '../.env.local')), ...process.env };
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in website/.env.local');
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } }).schema('company_os');

// The blog's topics map onto the brand's content pillars (057). A Feel Good
// Friday post belongs to that pillar whatever its topic.
const PILLAR_FOR_TOPIC = {
  'Love & Relationships': 'Love & Relationships',
  'Money & Career': 'Money & Career',
  'Forecasts & Timing': 'Year of the Fire Horse',
  'The Mahjong Mirror': 'The Mahjong Mirror',
};

const slugify = (s) =>
  s.toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// The FAQ goes into the body in the accordion form the marketing platform
// writes and reads (entities/site/lib/posts.ts extractFaq).
function faqBlock(faqs) {
  if (!Array.isArray(faqs) || faqs.length === 0) return '';
  const items = faqs.map((f) => `<details class="faq-item"><summary>${f.q}</summary>\n\n${f.a}\n</details>`);
  return `\n\n## FAQ\n\n${items.join('\n\n')}\n`;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node scripts/publish-blog-post.mjs <slug> [...] | --all');
    process.exit(1);
  }
  const slugs = args[0] === '--all'
    ? readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''))
    : args;

  const { data: brand, error: brandErr } = await db.from('brands').select('id').eq('slug', 'mahjong-tarot').single();
  if (brandErr) throw new Error(`brand lookup: ${brandErr.message}`);
  const { data: pillars, error: pillarErr } = await db.from('marketing_pillars').select('id, name').eq('brand_id', brand.id);
  if (pillarErr) throw new Error(`pillars: ${pillarErr.message}`);
  const pillarId = (name) => pillars.find((p) => p.name === name)?.id ?? null;

  let ok = 0;
  for (const slug of slugs) {
    const file = resolve(BLOG_DIR, `${slug}.md`);
    if (!existsSync(file)) {
      console.error(`✗ ${slug}: no content/blog/${slug}.md`);
      continue;
    }
    const { data: fm, content } = matter(readFileSync(file, 'utf8'));
    for (const field of ['title', 'topic', 'excerpt', 'isoDate']) {
      if (!fm[field]) {
        console.error(`✗ ${slug}: frontmatter is missing "${field}"`);
        process.exitCode = 1;
      }
    }
    if (!fm.title || !fm.topic || !fm.excerpt || !fm.isoDate) continue;

    const isoDate = String(fm.isoDate).slice(0, 10);
    const pillarName = slug.startsWith('feel-good-friday') ? 'Feel Good Friday' : PILLAR_FOR_TOPIC[fm.topic];
    const hero = fm.hero ?? {};
    const row = {
      brand_id: brand.id,
      channel: 'blog',
      language: 'en',
      status: 'published',
      slug,
      title: fm.title,
      excerpt: fm.excerpt,
      category: fm.topic,
      category_slug: slugify(fm.topic),
      pillar_id: pillarName ? pillarId(pillarName) : null,
      pillar: pillarName ?? null,
      read_time: fm.readTime ?? null,
      publish_date: isoDate,
      published_at: `${isoDate}T12:00:00Z`,
      title_tag: fm.seo?.title ?? null,
      meta_description: fm.seo?.description ?? null,
      image_url: hero.src ?? `/images/blog/${slug}.webp`,
      copy_md: content.trim() + faqBlock(fm.faqs),
      posted_url: `https://www.mahjongtarot.com/blog/posts/${slug}`,
      page_meta: {
        author: fm.author ?? 'Bill Hajdu',
        dateLabel: fm.date ?? null,
        cardDate: fm.cardDate ?? null,
        // The /blog card's own title and read time, when they differ from the page's.
        cardTitle: fm.cardTitle ?? null,
        cardReadTime: fm.cardReadTime ?? null,
        // A post written without a hero keeps none on its page (the card still
        // uses /images/blog/<slug>.webp).
        hero: fm.hero
          ? { alt: hero.alt ?? null, caption: hero.caption ?? null, width: hero.width ?? null, height: hero.height ?? null, useHeroClass: hero.useHeroClass ?? false }
          : { hidden: true },
        cta: fm.cta ?? null,
        related: fm.related ?? [],
        nav: fm.nav ?? {},
        // The post's own social/canonical/schema tags, kept verbatim so a
        // migrated page's <head> does not change.
        og: fm.seo?.og ?? null,
        canonical: fm.seo?.canonical ?? null,
        jsonLd: fm.jsonLd ?? null,
      },
    };

    const { data: existing, error: findErr } = await db
      .from('marketing_content')
      .select('id')
      .eq('brand_id', brand.id)
      .eq('channel', 'blog')
      .eq('slug', slug)
      .maybeSingle();
    if (findErr) {
      console.error(`✗ ${slug}: ${findErr.message}`);
      process.exitCode = 1;
      continue;
    }
    // An update keeps the row's published_at: it orders same-day posts.
    const { published_at: _keep, ...updateRow } = row;
    const { error } = existing
      ? await db.from('marketing_content').update(updateRow).eq('id', existing.id)
      : await db.from('marketing_content').insert(row);
    if (error) {
      console.error(`✗ ${slug}: ${error.message}`);
      process.exitCode = 1;
      continue;
    }
    ok += 1;
    console.log(`${existing ? '↻' : '+'} ${slug}`);
  }
  console.log(`${ok}/${slugs.length} published. Live within 5 minutes at https://www.mahjongtarot.com/blog`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
