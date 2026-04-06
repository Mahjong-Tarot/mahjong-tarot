---
name: build-page
description: Reads a markdown (.md) file from the content/ folder and generates a complete Next.js page component (.jsx), saving it to agents/web-developer/output/. Use this skill whenever a content file needs to be converted into a website page or blog post.
allowed-tools: Read Write Bash
---

# Build Page Skill

Your job is to convert a markdown file from `content/` into a valid Next.js page component and save it to `agents/web-developer/output/`.

## Before you start

Read the style guide at `agents/web-developer/context/style-guide.md` before generating any component. The design is editorial and strict — Playfair Display headings, Source Sans 3 body, Warm Cream background, no rounded corners anywhere.

## Steps

### 1. Read the source file
- The file will be a `.md` file inside `content/` (e.g. `content/about.md`)
- Read the YAML front matter — it contains `title`, `slug`, `output`, `hero_image`, and image notes
- Read the full body content before generating anything

### 2. Determine the output path and component name
- Output file: `agents/web-developer/output/<slug>.jsx`
- Component name: PascalCase version of the slug — e.g. `the-mahjong-mirror` → `TheMahjongMirror`
- For blog posts, the final destination will be `website/pages/blog/posts/<slug>.jsx`
- For site pages, the final destination will be `website/pages/<slug>.jsx`

### 3. Generate the Next.js component

Use this base structure for every page:

```jsx
import Head from 'next/head';
import Image from 'next/image';
// Import shared components as needed:
// import Nav from '../../components/Nav';
// import Footer from '../../components/Footer';

export default function PageName() {
  return (
    <>
      <Head>
        <title>{/* Page title */} | The Mahjong Tarot</title>
        <meta name="description" content="{/* 150-char excerpt */}" />
        <meta property="og:title" content="{/* Page title */}" />
        <meta property="og:description" content="{/* 150-char excerpt */}" />
        <meta property="og:image" content="https://mahjong-tarot.com/images/{/* image path */}" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://mahjong-tarot.com/{/* slug */}" />
      </Head>

      {/* <Nav /> */}

      <main>
        {/* Page content */}
      </main>

      {/* <Footer /> */}
    </>
  );
}
```

### 4. Convert markdown content to JSX

Map markdown elements to their JSX equivalents:

| Markdown | JSX |
|---|---|
| `# Heading` | `<h1>` |
| `## Heading` | `<h2>` |
| `### Heading` | `<h3>` |
| Paragraph | `<p>` |
| `**bold**` | `<strong>` |
| `*italic*` | `<em>` |
| `[text](url)` | `<a href="url">text</a>` |
| `![alt](src)` | `<Image src="..." alt="..." width={...} height={...} />` |
| `> blockquote` | `<blockquote>` |
| Unordered list | `<ul><li>...</li></ul>` |
| Ordered list | `<ol><li>...</li></ul>` |

**Important JSX rules:**
- Use `className` instead of `class`
- Self-close empty elements: `<img />`, `<br />`, `<hr />`
- Wrap the return in a single root element or `<>...</>`
- HTML comments become `{/* comment */}`
- All `next/image` components require `src`, `alt`, `width`, and `height` props

### 5. Handle images

- Hero image: use `next/image` with `layout="responsive"` or `fill` inside a positioned container
- Inline images: wrap in `<figure>` with `<figcaption>` for captions
- All image `src` paths reference `/images/blog/<slug>.webp` (from `public/`) for blog posts, or `/images/<filename>.webp` for site pages
- Use the image notes table in the `.md` front matter to map source files to placements

### 6. Blog post specifics

For blog post components, include a post header section:

```jsx
<header className="post-header">
  <span className="post-category">{/* Category tag */}</span>
  <h1>{/* Title */}</h1>
  <p className="post-meta">
    By Bill Hajdu · {/* Date */} · {/* X min read */}
  </p>
  <figure className="post-hero">
    <Image
      src="/images/blog/{slug}.webp"
      alt="{/* Descriptive alt text */}"
      width={1200}
      height={630}
      priority
    />
  </figure>
</header>
```

And a post footer with a CTA:

```jsx
<footer className="post-footer">
  <div className="post-cta">
    <p>Ready to explore your path through the tiles?</p>
    <a href="/readings" className="btn-primary">Book a Reading</a>
    <a href="/the-mahjong-mirror" className="btn-secondary">Pre-order the Book</a>
  </div>
</footer>
```

### 7. Save the output

Write the complete `.jsx` component to `agents/web-developer/output/<slug>.jsx`. Create subdirectories if needed.

### 8. Confirm

Report:
- Source file read
- Output file written
- Any content that was ambiguous or could not be converted cleanly
- Any images that need to be optimised before this component will render correctly
