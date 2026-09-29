// The public blog's data, from the database.
//
// Every post lives in company_os.marketing_content (channel 'blog', brand
// mahjong-tarot), whether it was written in the marketing platform's admin or
// published from content/blog/<slug>.md with scripts/publish-blog-post.mjs.
// See docs/engineering/2026-09-28-marketing-platform-port.md, decision 1.
//
// Server-only: call from getStaticProps / getServerSideProps. It uses the
// service-role key, which bypasses RLS.

import { createClient } from '@supabase/supabase-js';
import { marked } from 'marked';

const SITE = 'https://www.mahjongtarot.com';
const BRAND_SLUG = 'mahjong-tarot';

// A post goes live on its publish date in US Eastern, the business time zone.
export const PUBLISH_TZ = 'America/New_York';

export const TOPICS = [
  'Love & Relationships',
  'Money & Career',
  'Forecasts & Timing',
  'The Mahjong Mirror',
];

marked.setOptions({ gfm: true, breaks: false });

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  }).schema('company_os');
}

export function todayIsoInTz(tz = PUBLISH_TZ) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

function formatDate(iso, month) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('en-US', { month, day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${iso}T00:00:00Z`),
  );
}

const absolute = (src) => (!src ? null : src.startsWith('http') ? src : `${SITE}${src}`);

const LIST_COLUMNS = 'slug, title, excerpt, category, publish_date, read_time, image_url, page_meta, brands!inner(slug)';

function toCard(row) {
  return {
    slug: row.slug,
    title: row.page_meta?.cardTitle || row.title,
    excerpt: row.excerpt ?? '',
    topic: row.category ?? '',
    isoDate: row.publish_date,
    date: row.page_meta?.cardDate || formatDate(row.publish_date, 'short'),
    readTime: row.page_meta?.cardReadTime || row.read_time || '',
    image: row.image_url || `/images/blog/${row.slug}.webp`,
  };
}

// Published posts whose date has arrived, newest first. Throws on a database
// error so a build or revalidation fails loudly instead of publishing an empty
// blog (ISR keeps serving the last good page).
export async function listPublishedPosts(todayIso = todayIsoInTz()) {
  const { data, error } = await db()
    .from('marketing_content')
    .select(LIST_COLUMNS)
    .eq('channel', 'blog')
    .eq('status', 'published')
    .eq('brands.slug', BRAND_SLUG)
    .not('slug', 'is', null)
    .lte('publish_date', todayIso)
    .order('publish_date', { ascending: false })
    .order('published_at', { ascending: false });
  if (error) throw new Error(`[blog] published posts: ${error.message}`);
  return (data ?? []).map(toCard);
}

// Split the body at its FAQ section: the accordion items become the page's
// FAQ list (and FAQPage schema); everything above is the article.
function splitFaq(markdown) {
  const m = markdown.match(/^## FAQ\s*$/im);
  const body = m ? markdown.slice(0, m.index) : markdown;
  const faqs = [];
  const block = /<details[^>]*class="faq-item"[^>]*>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi;
  let hit;
  while ((hit = block.exec(m ? markdown.slice(m.index) : '')) !== null) {
    const q = hit[1].replace(/<[^>]+>/g, '').trim();
    const a = hit[2].trim();
    if (q && a) faqs.push({ q, a });
  }
  return { body: body.trim(), faqs };
}

const DEFAULT_CTA = {
  overline: 'Your Next Step',
  heading: 'See what the cards say about your year',
  body: 'A personal reading with Bill turns the year’s energy into decisions you can act on.',
  primary: '/readings#book',
  primaryLabel: 'Book a Reading',
  secondary: '/the-mahjong-mirror',
  secondaryLabel: 'Explore the Book',
};

// One published post in the shape pages/blog/posts/[slug].jsx renders, or null
// when there is no such live post. Prev/next and related come from the post's
// own page_meta when it has them (the migrated posts), else from its
// neighbours in the published list.
export async function loadPublishedPost(slug, todayIso = todayIsoInTz()) {
  const { data: row, error } = await db()
    .from('marketing_content')
    .select(`${LIST_COLUMNS}, copy_md, title_tag, meta_description`)
    .eq('channel', 'blog')
    .eq('status', 'published')
    .eq('brands.slug', BRAND_SLUG)
    .eq('slug', slug)
    .lte('publish_date', todayIso)
    .maybeSingle();
  if (error) throw new Error(`[blog] post ${slug}: ${error.message}`);
  if (!row) return null;

  const meta = row.page_meta ?? {};
  const { body, faqs } = splitFaq(row.copy_md ?? '');
  const image = row.image_url || `/images/blog/${slug}.webp`;

  let nav = meta.nav && (meta.nav.prev || meta.nav.next) ? meta.nav : null;
  // A migrated post keeps its own list, even an empty one; a post made in the
  // admin has none and gets its topic's latest three.
  let related = Array.isArray(meta.related) ? meta.related : null;
  if (!nav || !related) {
    const all = await listPublishedPosts(todayIso);
    const i = all.findIndex((p) => p.slug === slug);
    if (!nav) {
      const newer = i > 0 ? all[i - 1] : null;
      const older = i >= 0 && i < all.length - 1 ? all[i + 1] : null;
      nav = {
        ...(older ? { prev: { slug: older.slug, label: older.title } } : {}),
        ...(newer ? { next: { slug: newer.slug, label: newer.title } } : {}),
      };
    }
    if (!related) {
      related = all
        .filter((p) => p.slug !== slug && p.topic === row.category)
        .slice(0, 3)
        .map((p) => ({ slug: p.slug, title: p.title, dateLabel: p.date, image: p.image }));
    }
  }

  const description = row.meta_description || row.excerpt || '';
  const frontmatter = {
    title: row.title,
    date: meta.dateLabel || formatDate(row.publish_date, 'long'),
    readTime: row.read_time ?? '',
    author: meta.author || 'Bill Hajdu',
    categoryPill: row.category ?? '',
    breadcrumbLabel: row.category ?? '',
    hero: meta.hero?.hidden ? null : {
      src: image,
      alt: meta.hero?.alt || row.title,
      caption: meta.hero?.caption || null,
      width: meta.hero?.width || null,
      height: meta.hero?.height || null,
      useHeroClass: Boolean(meta.hero?.useHeroClass),
    },
    // A post's own og/canonical/JSON-LD (page_meta, the migrated posts) win
    // over the defaults built from its columns.
    seo: {
      title: row.title_tag || `${row.title} | Mahjong Tarot`,
      description,
      canonical: meta.canonical || `${SITE}/blog/posts/${slug}`,
      og: meta.og || { title: row.title, description, image: absolute(image), siteName: 'The Mahjong Tarot' },
    },
    jsonLd: meta.jsonLd || { headline: row.title, datePublished: row.publish_date, image: absolute(image), publisherUrl: SITE },
    faqs,
    nav,
    related,
    cta: meta.cta || DEFAULT_CTA,
  };

  return { slug, frontmatter: JSON.parse(JSON.stringify(frontmatter)), html: marked.parse(body) };
}
