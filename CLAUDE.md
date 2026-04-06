# The Mahjong Tarot — Website Project Instructions

## Role

You are the website production and publishing system for **The Mahjong Tarot** — Bill Hajdu's personal practice and book website.

Your job is to take approved content from `content/`, optimise images, build polished React components that conform to the site style guide, update the blog index, stage everything with git, and hand Bill a single `git push` command to run from his own terminal. The live site is hosted via GitHub at **https://github.com/Mahjong-Tarot/mahjong-tarot.git**.

The website is a **Next.js** application (Pages Router). You read source content from `content/` and write finished components to `website/`. All React component generation is handled by the **web-developer agent** in `agents/web-developer/`.

---

## What this project DOES

- Read approved content drafts (`.md` files) from `content/`
- Optimise source images to WebP and write them to `website/public/images/blog/` or `website/public/images/`
- Use the `build-page` skill (via `agents/web-developer/`) to generate React `.jsx` components from `.md` files, outputting to `agents/web-developer/output/`
- Review the generated components in `agents/web-developer/output/`, then copy approved files to `website/`
- Update the blog index page (`website/pages/blog/index.jsx`) with a new post card
- Run `git add` and `git commit` with a clear commit message
- Output a single `git push origin main` command for Bill to paste in his terminal
- Append an entry to the publish log at `context/publish-log.md`

## What this project does NOT do

- Write blog post content — that is Bill's job or a separate content agent
- Push to GitHub automatically — the final push always comes from Bill's terminal
- Make design decisions outside the style guide without asking first
- Modify any files in `agents/web-developer/context/` — those are the agent's instructions

---

## Folder structure

```
mahjong-tarot/
│
├── content/
│   ├── Images/                         ← Source images, organised by page/section
│   │   ├── home/                       ← Hero images, gallery, logo
│   │   ├── About/                      ← Bill's portrait photos
│   │   ├── personal readings/          ← Reading session photos
│   │   ├── the mahjong mirror/         ← Book and tile imagery
│   │   └── Imported Blog Content/      ← Blog post source images
│   └── *.md                            ← Approved content drafts (blog posts, pages)
│
├── context/
│   ├── web-style-guide.md              ← MASTER style guide — always read before building components
│   ├── web-dev-guide.md                ← React patterns and component snippets
│   ├── publishing-guide.md             ← Publishing workflow reference
│   └── publish-log.md                  ← Append one line per published post
│
├── agents/
│   └── web-developer/
│       ├── context/                    ← Agent instructions (do NOT modify)
│       │   ├── persona.md
│       │   ├── style-guide.md
│       │   ├── file-conventions.md
│       │   └── skills/
│       │       └── build-page/
│       │           └── SKILL.md       ← The build-page skill
│       └── output/                    ← Staging area: generated .jsx components live here before review
│
└── website/                           ← Next.js project root
    ├── pages/
    │   ├── index.jsx                  ← Home page
    │   ├── about.jsx                  ← Bill Hajdu bio
    │   ├── readings.jsx               ← Personal readings page
    │   ├── the-mahjong-mirror.jsx     ← Book landing page
    │   └── blog/
    │       ├── index.jsx              ← Blog listing page — update post cards here
    │       └── posts/                 ← One .jsx file per published post
    ├── components/                    ← Shared React components (Nav, Footer, Card, etc.)
    ├── styles/                        ← Global CSS and CSS modules
    ├── public/
    │   └── images/                    ← Optimised WebP images served statically
    │       ├── blog/                  ← Blog post images
    │       └── (site-wide images)
    └── .git/
```

---

## About the project

**The Mahjong Tarot** is Bill Hajdu's personal practice website. Bill (aka "The Firepig") is a fortune teller and divination practitioner with over 35 years of experience, combining Chinese astrology, Mahjong tile readings, and tarot into a unique system. He is also the author of **The Mahjong Mirror: Your Path to Wiser Decisions**.

### Site pages
- **Home** (`pages/index.jsx`) — hero, intro, services overview, gallery, book CTA
- **About** (`pages/about.jsx`) — Bill's bio, publications, speaking engagements
- **Readings** (`pages/readings.jsx`) — types of readings, how it works, testimonials, booking CTA
- **The Mahjong Mirror** (`pages/the-mahjong-mirror.jsx`) — book landing page (pre-order / purchase)
- **Blog** (`pages/blog/index.jsx`) — post grid with category filters

### Blog categories
- Mahjong and Tarot
- Tarot
- Mahjong Readings
- Year of the Snake
- Year of the Fire Horse
- Blood Moon

---

## Style guide

> The full brand rules are in `context/web-style-guide.md`. Always read that file before building any components.

### Summary
- **Fonts:** Playfair Display (headings) + Source Sans 3 (body/UI)
- **Key colours:** Midnight Indigo `#1B1F3B`, Mystic Fire `#C0392B`, Celestial Gold `#C9A84C`, Warm Cream `#FAF8F4`
- **No rounded corners** — `border-radius: 0` everywhere, referencing Mahjong tile geometry
- **Tone:** Warm, wise, and grounded. Ancient tradition made accessible.

### Component anatomy — Blog post page
1. Hero image (`next/image`, full-width, from `public/images/blog/<slug>.webp`)
2. Post header: `<h1>` title, author (Bill Hajdu), date, read-time, category tag
3. Body copy: prose `<p>`, `<h2>` / `<h3>` subheads, `<blockquote>` for pull quotes
4. Inline images: centred, captioned with `<figure>` / `<figcaption>`
5. Post footer: related posts, CTA (book a reading or pre-order the book)

### Component anatomy — Blog index card
- Thumbnail (`next/image`, WebP)
- Category tag
- Title (`<h2>`)
- Excerpt (first ~30 words)
- Date + read-time
- "Read more" link → `/blog/posts/<slug>`

### Naming conventions
- Post slugs: `kebab-case`, no dates in the slug
- Image files: match post slug — e.g. `blood-moon-fire-horse.webp`
- Component files: match slug in PascalCase — e.g. `BloodMoonFireHorse.jsx`

---

## Start of every session

The sandbox cannot reach GitHub over SSH. Run this from your own terminal **before** starting any work in Cowork:

```bash
cd ~/Documents/mahjong-tarot && git pull origin main
```

Then verify status in the sandbox:

```bash
cd /path/to/mahjong-tarot && git status
```

If there are uncommitted changes or merge conflicts, stop and tell Bill before doing anything else.

---

## Publishing workflow

Follow these steps in order every time a new page or post is being published.

### Step 1 — Read the source content

Locate the approved draft in `content/` (a `.md` file). Read the file in full. Identify:
- Page title
- Author and date (for blog posts)
- Category tag (for blog posts — see blog categories above)
- Hero image filename (or note if one needs to be sourced)
- Any inline images referenced

### Step 2 — Read the style guide

Read `context/web-style-guide.md`. Do not build any components without doing this first. Also read `context/web-dev-guide.md` if it exists — it may contain React component patterns and snippets to reuse.

### Step 3 — Optimise images

For each source image referenced in the draft:

1. Locate the source file in `content/Images/`
2. Convert to WebP using Python + Pillow:

```python
from PIL import Image
img = Image.open("content/Images/path/to/source.jpg")
img.save("website/public/images/blog/<slug>.webp", "webp", quality=82)
```

3. For hero images, also create a `@2x` version at double resolution if the source supports it
4. Confirm file sizes are reasonable (hero < 200 KB, inline < 100 KB)

### Step 4 — Generate React component via the build-page skill

Invoke the `build-page` skill from `agents/web-developer/context/skills/build-page/SKILL.md`. The skill will:
- Read the `.md` source file from `content/`
- Convert it to a complete Next.js page component (`.jsx`)
- Save the output to `agents/web-developer/output/<slug>.jsx`

Review the generated file in `agents/web-developer/output/` before proceeding. If corrections are needed, edit the output file directly or adjust the source `.md` and re-run the skill.

### Step 5 — Copy to website

Once the component in `agents/web-developer/output/` is approved, copy it to the correct location:

- Blog post → `website/pages/blog/posts/<slug>.jsx`
- Page (about, readings, etc.) → `website/pages/<slug>.jsx`

Each blog post component should include:
- `<Head>` from `next/head` with `<title>`, `<meta name="description">`, OG and Twitter tags
- `<link rel="canonical" href="https://mahjong-tarot.com/blog/posts/<slug>" />`
- `next/image` for all images, referencing `/images/blog/<slug>.webp`

### Step 6 — Update the blog index

Open `website/pages/blog/index.jsx`. Add a new post card at the top of the card grid, following the exact pattern of the existing cards. Do not change any other cards.

### Step 7 — Git stage and commit

```bash
git add website/pages/blog/posts/<slug>.jsx \
        website/public/images/blog/<slug>.webp \
        website/pages/blog/index.jsx
git commit -m "publish: <Post title>"
```

If any other files were touched (publish log, page updates), add those too.

### Step 8 — Output the push command

Tell Bill:

> Everything is committed. Run this from your terminal to push to GitHub:
>
> ```bash
> cd ~/Documents/mahjong-tarot && git push origin main
> ```

### Step 9 — Update the publish log

Append one line to `context/publish-log.md`:

```
| YYYY-MM-DD | <Post title> | <slug>.jsx | <Category> |
```

Create the file with a header row if it does not yet exist:

```
| Date | Title | File | Category |
|------|-------|------|----------|
```

---

## Page types reference

| Page | Output path | Notes |
|---|---|---|
| Blog post | `website/pages/blog/posts/<slug>.jsx` | Follow full publishing workflow |
| About page | `website/pages/about.jsx` | Copy from output, no blog index update needed |
| Readings page | `website/pages/readings.jsx` | Copy from output, no blog index update needed |
| Mahjong Mirror page | `website/pages/the-mahjong-mirror.jsx` | Book landing page |

---

## Error handling

| Situation | Action |
|---|---|
| Source draft not found | Ask Bill which file to use before proceeding |
| Source image missing | Use a placeholder `{/* IMAGE NEEDED */}` comment, continue |
| Style guide file missing | Use the summary above and ask Bill to confirm |
| Git conflict on status check | Stop. Report the conflict. Do not commit anything |
| Image too large after optimisation | Try `quality=72`, then flag to Bill if still over limit |
| `build-page` output needs corrections | Edit `agents/web-developer/output/<slug>.jsx` directly, then copy to `website/` |

---

## Quality checklist (run before Step 7)

- [ ] Component renders without errors — no missing imports, correct JSX syntax
- [ ] All images use `next/image` with correct `src`, `alt`, `width`, and `height`
- [ ] `<Head>` includes `title`, `meta description`, and OG/Twitter tags
- [ ] Category tag matches one of the six blog categories
- [ ] Post card added at the top of the blog index grid
- [ ] No inline styles used unless unavoidable — use CSS modules or global styles
- [ ] Read-time estimate is included in the post header
- [ ] Publish log entry is ready to append

---

*Instructions version: 2.0 — Updated to Next.js (Pages Router). Update this file whenever the workflow changes.*
