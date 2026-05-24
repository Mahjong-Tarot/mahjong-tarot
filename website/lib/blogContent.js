// Markdown-driven blog post loader.
//
// Source of truth for each post:
//   <repo>/content/blog/<slug>.md
//
// Each file = YAML frontmatter + markdown body. Frontmatter carries every
// per-post knob that used to live inlined in the per-post .jsx files:
//   - title / excerpt / date / readTime / categoryPill / categories
//   - hero { src, alt, caption?, width?, height? }
//   - seo { title, description, og:{title,description,image,siteName?}, canonical }
//   - jsonLd.headline (defaults to title) and jsonLd.image (defaults to og.image)
//   - faqs[]            -> renders FAQ section + FAQPage schema
//   - nav { prev?, next? } with { slug, label }
//   - related[]         with { slug, title, dateLabel }
//   - cta { overline, heading, body, primary?, primaryLabel?, secondary?, secondaryLabel? }
//
// Body is rendered with `marked`. Inline HTML in the body is preserved (this is
// how the few posts with bespoke layouts — Swift/Kelce risk cards, the love
// post's sign grid, mid-body figures — keep their custom markup).
//
// The lib/posts.js index continues to be the canonical ordered list used by
// /blog. This file backs the per-post page only.

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

const BLOG_DIR = path.join(process.cwd(), '..', 'content', 'blog');

// Configure marked for parity with how the old hand-written JSX rendered:
//   - GitHub-style line breaks OFF (matches the legacy <p>-per-paragraph layout)
//   - HTML passthrough ON (custom inline blocks in the body)
marked.setOptions({
  gfm: true,
  breaks: false,
  headerIds: false,
  mangle: false,
});

export function listSlugs() {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

export function loadPost(slug) {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);

  const html = marked.parse(content);

  return {
    slug,
    frontmatter: serialize(data),
    html,
  };
}

// Next.js getStaticProps requires JSON-serializable props. Dates from YAML
// come back as JS Date objects, which can't cross the SSR boundary. Convert
// any Date to ISO string and strip undefined.
function serialize(value) {
  if (value === undefined) return null;
  if (value === null) return null;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(serialize);
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const s = serialize(v);
      if (s !== undefined) out[k] = s;
    }
    return out;
  }
  return value;
}
