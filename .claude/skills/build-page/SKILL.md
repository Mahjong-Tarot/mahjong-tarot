---
name: build-page
description: "Converts content/blog/<slug>.md markdown into a published blog post. MUST be used whenever: building a new blog post from a content/blog/<slug>.md file, publishing a blog post, or the user says 'build', 'publish', 'create page', 'new post', or mentions turning content into a web page."
---

# Build Page — Markdown to Published Post

Blog posts are now rendered dynamically from a single markdown source file. The dynamic route at `website/pages/blog/posts/[slug].jsx` reads `content/blog/<slug>.md` at build time and renders the entire post: SEO tags, hero, body, FAQs, JSON-LD, post navigation, related cards, and CTA.

**There is no per-post JSX file anymore.** The skill's job is to write the markdown — full frontmatter plus body — and place it at `content/blog/<slug>.md`. Then update `website/lib/posts.js` so the post appears on the blog index.

## Before you start

Read these files in order:

1. `agents/web-developer/context/web-style-guide.md` — Master brand and design rules
2. `agents/web-developer/context/style-guide.md` — Agent-specific component conventions
3. `agents/web-developer/context/file-conventions.md` — Naming and path rules
4. `website/pages/blog/posts/[slug].jsx` — see the template that will render this post (especially the destructured frontmatter fields)
5. `website/lib/blogContent.js` — see the loader, which documents the full frontmatter schema
6. The source draft the user wants to build (one of `content/topics/<bundle>/blog*.md`, or a free-form draft the user pastes)

## Inputs

The user provides:

- An approved blog draft file, or
- A slug + topic bundle they want published

## Step-by-step process

### 1. Pick the slug

The slug is the URL path: `/blog/posts/<slug>`. It must be kebab-case, descriptive, and unique. Use the slug in the draft's frontmatter if present; otherwise propose one and confirm with the user before writing.

### 2. Write the markdown to `content/blog/<slug>.md`

The file is a YAML frontmatter block + a plain-markdown body.

Required frontmatter fields:

```yaml
title: "..."              # h1 text (use real em-dashes —, smart quotes ‘’, not HTML entities)
author: "Bill Hajdu"
date: "Apr 17, 2026"     # display-formatted date
readTime: "6 min read"
categoryPill: "..."       # category label shown above the title
breadcrumbLabel: "..."    # usually same as categoryPill
seo:
  title: "..."            # <title> tag
  description: "..."
  canonical: "https://mahjongtarot.com/blog/posts/<slug>"
  og:
    title: "..."
    description: "..."
    image: "https://mahjongtarot.com/images/blog/<slug>.webp"
    siteName: "The Mahjong Mirror"   # optional
jsonLd:
  datePublished: "2026-04-17"        # ISO date for Article schema
  image: "..."                        # usually same as og.image
  headline: "..."                     # optional, defaults to title
  publisherUrl: "https://..."         # optional, defaults to https://mahjongtarot.com
cta:
  overline: "..."
  heading: "Book a Reading with Bill"
  body: "..."
  primary: "/readings#book"
  primaryLabel: "Book a Reading"
  secondary: "/the-mahjong-mirror"
  secondaryLabel: "Explore the Book"
```

Optional frontmatter fields:

```yaml
hero:
  src: "/images/blog/<slug>.webp"
  alt: "..."
  caption: "..."            # optional figcaption under the hero
  width: 1200               # optional, defaults to 1200
  height: 630               # optional, defaults to 630
  useHeroClass: true        # optional, applies styles.hero (cover fit). Default is the inline margin style most posts use.
faqs:                       # list of Q/A pairs — also renders FAQPage JSON-LD
  - q: "..."
    a: "..."
nav:                        # prev / next post navigation under the body
  prev:
    slug: "..."
    label: "..."
  next:
    slug: "..."
    label: "..."
related:                    # "More Articles" cards (two is typical)
  - slug: "..."
    title: "..."
    dateLabel: "Apr 6, 2026"
    image: "..."             # optional, defaults to /images/blog/<slug>.webp
    alt: "..."               # optional, defaults to title
```

### 3. Write the body in markdown

Use plain markdown for the body. `marked` renders it to HTML and `[slug].jsx` drops it inside `<div className={styles.body}>` via `dangerouslySetInnerHTML`.

| Markdown | Renders as |
|---|---|
| `# Heading` | `<h1>` (avoid — reserved for the title field) |
| `## Heading` | `<h2>` |
| `### Heading` | `<h3>` |
| paragraph | `<p>` |
| `**bold**` | `<strong>` |
| `*italic*` | `<em>` |
| `[text](/internal)` | plain `<a href="/internal">` (still works — Next.js handles client nav from anchor tags via prefetch on hover) |
| `[text](https://...)` | external `<a>` — add `target="_blank" rel="noopener noreferrer"` by writing raw HTML when needed |
| `> blockquote` | `<blockquote>` |
| `---` | `<hr>` |

### 4. Use raw HTML for custom blocks

A few posts use bespoke layout blocks. The CSS for these lives in `website/styles/blog-post-blocks.css` and is loaded site-wide via `_app.jsx`, so plain class names work in the body markdown.

Available block class names:

| Class | Usage |
|---|---|
| `pullQuote` | `<div class="pullQuote"><p>...</p></div>` |
| `riskCard` + `riskLabel` | `<div class="riskCard"><span class="riskLabel">Risk #1</span><h3>...</h3><p>...</p></div>` |
| `pivotBanner` | `<div class="pivotBanner"><h2>...</h2><p>...</p></div>` |
| `predictionBox` + `predictionLabel` | `<div class="predictionBox"><span class="predictionLabel">Bill's Call</span><p>...</p></div>` |
| `imagePair` + `imagePairCaption` | `<div class="imagePair"><img .../><img .../><p class="imagePairCaption">...</p></div>` |
| `signGrid` + `signCard` + `signBadge` + `badge{Exceptional,Favorable,Neutral,Mixed,Challenging,HighRisk}` | Grid of sign cards — see `content/blog/love-in-the-fire-horse-year.md` for the canonical example |

For inline mid-body images, use raw HTML `<figure>` with inline style attributes.

### 5. Update `website/lib/posts.js`

Add the new post at the top of the `POSTS` array (newest first). Required fields:

```js
{
  slug: '<slug>',
  title: '...',                          // can be different from the page <h1>
  excerpt: '...',                        // shown on /blog
  categories: ['Year of the Fire Horse'], // used by the /blog filter
  date: 'Apr 17, 2026',
  isoDate: '2026-04-17',
  readTime: '6 min read',
},
```

### 6. Generate or place the hero image

If a new hero is needed, invoke the `generate-image` skill. The image must end up at `website/public/images/blog/<slug>.webp` (matches `hero.src` in the frontmatter).

### 7. Verify

```bash
cd website && npm run build
```

The build output should list the new slug under `/blog/posts/[slug]`. Visit `/blog` and `/blog/posts/<slug>` via `npm run dev` to confirm visual parity.

### 8. Stage, commit, push

Stage explicitly:

```bash
git add content/blog/<slug>.md \
        website/public/images/blog/<slug>.webp \
        website/lib/posts.js
git commit -m "publish: <Post title>"
```

### 9. Update the publish log

Append one line to `context/general-project-agent-context/publish-log.md`:

```
| YYYY-MM-DD | <Post title> | <slug>.md | <Category> |
```

## Notes on character escaping

- Use real Unicode characters in YAML strings: em-dash `—`, smart quotes `‘’ “”`, ellipsis `…`. **Do not use HTML entities** like `&mdash;` — those would be rendered as literal text by React.
- Inside body markdown, smart quotes also render correctly. Avoid HTML entities unless you want them visible.
- Apostrophes in YAML need either double-quoting the whole string or escaping: prefer `"He's the Firepig"` over `'He''s the Firepig'`.
