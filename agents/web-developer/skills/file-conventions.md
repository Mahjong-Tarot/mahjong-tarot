# File Conventions

> Reference for the web-developer agent on where to read inputs and where to write outputs.
> The website is a **Next.js application** using the Pages Router.

## Repository Structure (relevant paths)

```
content/              ← INPUT: markdown source files and Images/
agents/
└── web-developer/
    ├── context/      ← agent knowledge (read-only for the agent)
    └── output/       ← OUTPUT: all generated .jsx components go here first

website/              ← Next.js project root (do NOT write here directly — copy from output/ after review)
├── pages/            ← Next.js routes — one .jsx file per page/post
│   ├── index.jsx
│   ├── about.jsx
│   ├── readings.jsx
│   ├── the-mahjong-mirror.jsx
│   └── blog/
│       ├── index.jsx
│       └── posts/    ← one .jsx per blog post
├── components/       ← shared components (Nav, Footer, BlogCard, etc.)
├── styles/           ← global CSS and CSS modules
└── public/
    └── images/       ← static assets served at /images/
        └── blog/     ← blog post WebP images
```

## Input: Reading Content

- Source files are `.md` files inside `content/topics/<YYYY-MM-DD>-<type>-<topic>/`
- Each blog `.md` file has YAML front matter with `title`, `slug`, `hero_image`, and image notes
- The **folder name** is date-prefixed for organization (`2026-04-20-horse-money`). Do NOT use it as the URL slug
- The **URL slug** comes from the `slug:` front-matter field (e.g. `money-in-the-year-of-the-fire-horse`) — that's what the JSX filename and the live `/blog/posts/<slug>` URL use
- Read the full file — front matter and body — before generating anything
- Source images are in the same topic folder — see the image notes table in each `.md` file

## Output: Writing Components

- All generated `.jsx` files go into `agents/web-developer/output/`
- Do NOT write directly to `website/` — that happens after review
- Naming convention:
  - Filename: `<slug>.jsx` (kebab-case, matches the slug in front matter)
  - Component name: PascalCase version of the slug

| Slug | Filename | Component name |
|---|---|---|
| `about` | `about.jsx` | `About` |
| `readings` | `readings.jsx` | `Readings` |
| `the-mahjong-mirror` | `the-mahjong-mirror.jsx` | `TheMahjongMirror` |
| `blood-moon-fire-horse` | `blood-moon-fire-horse.jsx` | `BloodMoonFireHorse` |

## Final Destinations (after review)

| Content type | Agent output | Final location in website/ |
|---|---|---|
| Blog post | `output/<slug>.jsx` | `website/pages/blog/posts/<slug>.jsx` |
| Site page | `output/<slug>.jsx` | `website/pages/<slug>.jsx` |
| Blog image | *(optimised by publishing workflow)* | `website/public/images/blog/<slug>.webp` |
| Site image | *(optimised by publishing workflow)* | `website/public/images/<filename>.webp` |

## File Naming Rules

- Slugs: lowercase, words separated by hyphens, no spaces or underscores
- No special characters, no dates in the slug
- Image files: match the post slug — e.g. `blood-moon-fire-horse.webp`
- Component files: match the slug — e.g. `blood-moon-fire-horse.jsx`
- CSS module files: PascalCase matching component — e.g. `BloodMoonFireHorse.module.css`

## Next.js Conventions

- Use `import Head from 'next/head'` for `<head>` tags
- Use `import Image from 'next/image'` for all images — never `<img>`
- Use `import Link from 'next/link'` for internal navigation — never bare `<a>` for internal links
- `className` not `class` in all JSX
- All static images are served from `public/` and referenced as `/images/...` (no `public/` prefix in `src`)
