---
name: build-page
description: Writes a blog post as markdown to content/blog/<slug>.md and registers it in website/lib/posts.js. The dynamic route at website/pages/blog/posts/[slug].jsx renders the markdown — there is no per-post JSX file. Use this skill whenever a blog post needs to be published.
allowed-tools: Read Write Bash Edit
---

# Build Page Skill

Blog posts are published as **markdown only**. The dynamic route at `website/pages/blog/posts/[slug].jsx` reads `content/blog/<slug>.md` at build time and renders the full post (SEO, hero, body, FAQs, JSON-LD, post nav, related cards, CTA). There is no per-post `.jsx` file to generate.

This skill is responsible for:
1. Writing the markdown with full frontmatter at `content/blog/<slug>.md`
2. Registering the post at the top of `POSTS[]` in `website/lib/posts.js` (so it appears on the `/blog` index)

## Before you start

Read these in order — do not generate anything from memory:

1. `agents/web-developer/context/web-style-guide.md` — brand and design rules, valid category list
2. `agents/web-developer/context/style-guide.md` — component conventions
3. `website/pages/blog/posts/[slug].jsx` — the template; see its destructured frontmatter to know what fields it consumes
4. `website/lib/blogContent.js` — the loader, with the canonical frontmatter schema
5. `website/lib/posts.js` — the ordered index used by `/blog`
6. The full canonical spec at `.claude/skills/build-page/SKILL.md` (which you should mirror if you change anything here)

## Inputs

- An approved draft markdown (often produced upstream by the writer agent under `content/topics/<bundle>/blog*.md`), or
- A slug + topic the user wants published

## Step 1: Choose the slug

The slug is the URL path: `/blog/posts/<slug>`. It must be kebab-case, descriptive, and unique. Use the slug from the source draft's frontmatter when present.

## Step 2: Write `content/blog/<slug>.md`

Frontmatter schema (required keys in bold):

- **`title`** — page H1. Use real Unicode em-dashes (`—`) and smart quotes (`‘’ “”`). Never use HTML entities (`&mdash;` would render as literal text).
- **`author`** — default `"Bill Hajdu"`
- **`date`** — display-formatted (e.g. `"Apr 17, 2026"`)
- **`readTime`** — e.g. `"6 min read"`
- **`categoryPill`** — category label above the H1
- **`breadcrumbLabel`** — usually same as `categoryPill`
- **`seo`** — `{ title, description, canonical, og: { title, description, image, siteName? } }`
- **`jsonLd`** — `{ datePublished, image, headline?, publisherUrl? }`
- **`cta`** — `{ overline, heading, body, primary, primaryLabel, secondary, secondaryLabel }`

Optional:

- `hero` — `{ src, alt, caption?, width?, height?, useHeroClass? }`
- `faqs` — list of `{ q, a }` pairs (also feeds FAQPage JSON-LD)
- `nav` — `{ prev?: { slug, label }, next?: { slug, label } }`
- `related` — list of `{ slug, title, dateLabel, image?, alt? }` cards

## Step 3: Write the body

Plain markdown after the frontmatter. `marked` renders it; inline HTML is preserved.

Standard markdown:
- `## Subhead` → `<h2>` (avoid `#` — the H1 comes from the `title` field)
- `**bold**`, `*italic*`, `> quote`, `[text](/internal)`, `[text](https://external)`
- `---` → `<hr>`

For external links that need `target="_blank"`, write raw HTML: `<a href="..." target="_blank" rel="noopener noreferrer">...</a>`.

## Step 4: Use raw HTML for bespoke blocks

CSS for these lives in `website/styles/blog-post-blocks.css` (globally loaded), so plain HTML class names work inside the markdown body:

| Class | Usage |
|---|---|
| `pullQuote` | `<div class="pullQuote"><p>...</p></div>` |
| `riskCard` + `riskLabel` | numbered risk callout |
| `pivotBanner` | mid-post centered banner with `<h2>` and `<p>` |
| `predictionBox` + `predictionLabel` | gold-bar prediction callout |
| `imagePair` + `imagePairCaption` | side-by-side two-image block |
| `signGrid` + `signCard` + `signBadge` + `badge{Exceptional,Favorable,Neutral,Mixed,Challenging,HighRisk}` | zodiac sign card grid |

Canonical examples:
- pullQuote, riskCard, pivotBanner, imagePair, predictionBox → `content/blog/swift-kelce-wedding-stars.md`
- signGrid → `content/blog/love-in-the-fire-horse-year.md`

For inline mid-body figures with figcaptions, write raw `<figure style="...">...<figcaption>...</figcaption></figure>`.

## Step 5: Register the post

Open `website/lib/posts.js` and add the post at the top of `POSTS[]`:

```js
{
  slug: '<slug>',
  title: '...',
  excerpt: '...',
  categories: ['Year of the Fire Horse'],   // see web-style-guide.md for the valid list
  date: 'Apr 17, 2026',
  isoDate: '2026-04-17',
  readTime: '6 min read',
},
```

## Step 6: Place the hero image

The hero must exist at `website/public/images/blog/<slug>.webp` and match `hero.src` in the frontmatter. Invoke the `generate-image` skill if a new one is needed.

## Step 7: Verify

```bash
cd website && npm run build
```

The build output should list `/blog/posts/<slug>` under the dynamic `[slug]` route.

## Step 8: Stage and commit (only when the user asks)

```bash
git add content/blog/<slug>.md \
        website/public/images/blog/<slug>.webp \
        website/lib/posts.js
git commit -m "publish: <Post title>"
```

## What this skill no longer does

- ❌ Writes `.jsx` files to `agents/web-developer/output/`
- ❌ Copies `.jsx` files to `website/pages/blog/posts/`
- ❌ Edits `website/pages/blog/index.jsx` — that page is driven by `lib/posts.js`

The shape of the output is now `content/blog/<slug>.md` plus a one-line addition to `lib/posts.js`. Everything else is handled by the dynamic route at build time.
