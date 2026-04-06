---
name: build-page
description: "Converts markdown content files into polished Next.js page components for The Mahjong Tarot website. MUST be used whenever: building a new page or blog post from a content/*.md file, converting markdown to a React component, publishing a blog post, generating website pages, or the user says 'build', 'publish', 'create page', 'new post', or mentions turning content into a web page. Also use when updating or regenerating existing pages from their source markdown."
---

# Build Page — Content to Next.js Component

Converts an approved `.md` file from `content/` into a complete Next.js (Pages Router) `.jsx` component and saves it to `agents/web-developer/output/` for review.

## Before you start

Read these files in order — do NOT generate any code until you have read them:

1. `context/web-style-guide.md` — Master brand and design rules
2. `context/web-dev-guide.md` — React patterns and reusable snippets (if it exists)
3. `agents/web-developer/context/style-guide.md` — Agent-specific component conventions
4. `agents/web-developer/context/file-conventions.md` — Naming and path rules

Then read the source `.md` file the user wants to build.

## Inputs

The user provides one of:

- A filename: `content/about.md`, `content/blood-moon-signal.md`
- A slug: `about`, `blood-moon-signal`
- A general request: "build the about page", "publish the blood moon post"

If the user doesn't specify a file, list the `.md` files in `content/` and ask which one to build.

## Step-by-step process

### 1. Read the source markdown

```
Read content/<filename>.md
```

Extract from the YAML front matter:

- `title` — page/post title
- `slug` — URL slug (kebab-case)
- `output` — destination type (`page` or `blog-post`)
- `hero_image` — hero image source path
- `category` — blog category (blog posts only)
- `date` — publish date (blog posts only)
- Image mapping table (if present)

Read the full body content.

### 2. Determine output path and component name

| Type | Output file | Final destination |
|------|------------|-------------------|
| Page | `agents/web-developer/output/<slug>.jsx` | `website/pages/<slug>.jsx` |
| Blog post | `agents/web-developer/output/<slug>.jsx` | `website/pages/blog/posts/<slug>.jsx` |

Component name = PascalCase of slug. Example: `blood-moon-signal` → `BloodMoonSignal`

### 3. Generate the component

Use existing blog posts as reference for the exact pattern:

- `website/pages/blog/posts/blood-moon-signal.jsx`
- `website/pages/blog/posts/mahjong-tarot-vs-tarot.jsx`

For site pages, reference:

- `website/pages/about.jsx`
- `website/pages/readings.jsx`

Every component MUST include:

```jsx
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Nav from '../../../components/Nav';      // adjust depth for page type
import Footer from '../../../components/Footer';
import styles from '../../../styles/BlogPost.module.css';  // or page-specific module
```

### 4. Component structure — Blog posts

```jsx
export default function ComponentName() {
  return (
    <>
      <Head>
        <title>{title} — The Mahjong Tarot</title>
        <meta name="description" content="{150-char excerpt}" />
        <meta property="og:title" content="{title}" />
        <meta property="og:description" content="{short description}" />
        <meta property="og:image" content="https://mahjong-tarot.com/images/blog/{slug}.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://mahjong-tarot.com/blog/posts/{slug}" />
      </Head>

      <Nav />

      <main>
        <article className={styles.article}>
          <header className={styles.header}>
            <div className="container">
              <span className="post-category">{category}</span>
              <h1>{title}</h1>
              <p className="post-meta">By Bill Hajdu · {date} · {X} min read</p>
            </div>
          </header>

          <figure className={styles.hero}>
            <Image
              src="/images/blog/{slug}.webp"
              alt="{descriptive alt text}"
              width={1200}
              height={630}
              priority
              style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
            />
          </figure>

          <section className={`container ${styles.body}`}>
            {/* Converted markdown body */}
          </section>

          <footer className={`container ${styles.footer}`}>
            <div className="divider-gold" />
            <div className={styles.cta}>
              <p>{contextual CTA text}</p>
              <Link href="/readings" className="btn-primary">Book a Reading</Link>
              <Link href="/the-mahjong-mirror" className="btn-secondary">Explore the Book</Link>
            </div>
          </footer>
        </article>
      </main>

      <Footer />
    </>
  );
}
```

### 5. Markdown to JSX conversion rules

| Markdown | JSX |
|----------|-----|
| `# Heading` | `<h1>` |
| `## Heading` | `<h2>` |
| `### Heading` | `<h3>` |
| Paragraph | `<p>` |
| `**bold**` | `<strong>` |
| `*italic*` | `<em>` |
| `[text](url)` | `<Link href="url">text</Link>` (internal) or `<a href="url">text</a>` (external) |
| `![alt](src)` | `<Image src="..." alt="..." width={...} height={...} />` |
| `> blockquote` | `<blockquote>` |
| Lists | `<ul>/<ol>` with `<li>` |

**Critical JSX rules:**

- `className` not `class`
- Self-close empty elements: `<br />`, `<hr />`
- HTML comments become `{/* comment */}`
- All `Image` components need `src`, `alt`, `width`, `height`
- No `border-radius` anywhere — sharp corners only
- Use CSS Modules from `styles/BlogPost.module.css` for blog posts

### 6. Handle images

- Hero: `next/image` with `width={1200} height={630} priority`
- Inline: wrap in `<figure>` + `<figcaption>`
- Blog image paths: `/images/blog/<slug>.webp`
- Site page image paths: `/images/<filename>.webp`
- If a source image hasn't been optimized yet, add `{/* IMAGE NEEDED: <source path> */}`

### 7. Estimate read time

Count words in the body content. Divide by 230 (average reading speed). Round up to nearest minute. Format as `X min read`.

### 8. Save and report

Write the finished `.jsx` to `agents/web-developer/output/<slug>.jsx`.

Report to the user:

- Source file read: `content/<filename>.md`
- Output written: `agents/web-developer/output/<slug>.jsx`
- Component name: `<PascalCase>`
- Category: `<category>` (blog posts)
- Read time: `X min read`
- Any missing images or ambiguous content
- Reminder: "Review the output, then copy to `website/pages/...` and update the blog index"

## After the build

Remind the user of the remaining publishing steps:

1. Review the component in `agents/web-developer/output/`
2. Copy to `website/pages/blog/posts/<slug>.jsx` (or `website/pages/<slug>.jsx`)
3. Ensure images are optimized to WebP in `website/public/images/`
4. Update `website/pages/blog/index.jsx` with a new post card (blog posts only)
5. Git stage and commit
6. Run `git push origin main` from their terminal
