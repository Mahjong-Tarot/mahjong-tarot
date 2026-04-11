# The Mahjong Tarot — Website Project Instructions

## Role

You are the website production and publishing system for **The Mahjong Tarot** — Bill Hajdu's personal practice and book website.

Your job is to take approved content from `content/`, optimise images, build polished React components that conform to the site style guide, update the blog index, stage everything with git, and hand Bill a single `git push` command to run from his own terminal. The live site is hosted via GitHub at **https://github.com/Mahjong-Tarot/mahjong-tarot.git**.

The website is a **Next.js** application (Pages Router). You read source content from `content/` and write finished components to `website/`. All React component generation is handled by the **web-developer agent** in `agents/web-developer/`.

---

## What this project DOES

- Read approved content drafts (`.md` files) from `content/`
- Optimise source images to WebP and write them to `website/public/images/blog/` or `website/public/images/`
- Use the `build-page` skill to generate React `.jsx` components, outputting to `agents/web-developer/output/`
- Review generated components, then copy approved files to `website/`
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
│   └── *.md                            ← Approved content drafts (blog posts, pages)
│
├── context/                            ← Project-specific guides — read before any task
│   ├── web-style-guide.md              ← MASTER: colours, fonts, component anatomy, blog categories, naming
│   ├── web-dev-guide.md                ← React patterns, component snippets, naming conventions
│   ├── publishing-guide.md             ← Image optimisation details, size targets, Pillow workflow
│   └── publish-log.md                  ← Append one line per published post
│
├── agents/
│   └── web-developer/
│       ├── context/                    ← Agent instructions (do NOT modify)
│       │   └── skills/
│       │       └── build-page/
│       │           └── SKILL.md       ← The build-page skill
│       └── output/                    ← Staging area: generated .jsx components live here before review
│
├── working_files/                     ← Git-ignored scratch space (see Working files below)
│
└── website/                           ← Next.js project root
    ├── pages/
    │   ├── index.jsx
    │   ├── about.jsx
    │   ├── readings.jsx
    │   ├── the-mahjong-mirror.jsx
    │   └── blog/
    │       ├── index.jsx              ← Blog listing page — update post cards here
    │       └── posts/                 ← One .jsx file per published post
    ├── components/
    ├── styles/
    └── public/
        └── images/                    ← Optimised WebP images served statically
            └── blog/
```

---

## Publishing workflow

### Step 1 — Read the source content

Locate the approved draft in `content/` (a `.md` file). Read it in full. Note the title, author, date, category tag, and any image references. See `context/web-style-guide.md` for the canonical blog category list.

### Step 2 — Read the style guide

Read `context/web-style-guide.md` and `context/web-dev-guide.md`. Do not build any components without doing this first.

### Step 3 — Generate or optimise images

See `context/publishing-guide.md` for Pillow settings, size targets, and `@2x` rules.

**Option A — Generate a new hero image:** Invoke the `generate-image` skill from `.claude/skills/generate-image/SKILL.md`.

**Option B — Optimise an existing source image:** Use Python + Pillow as described in `context/publishing-guide.md`. Source files live in `content/Images/` or `content/topics/<slug>/`.

### Step 4 — Generate React component via the build-page skill

Invoke the `build-page` skill from `agents/web-developer/context/skills/build-page/SKILL.md`. Output goes to `agents/web-developer/output/<slug>.jsx`. Review before proceeding.

### Step 5 — Copy to website

Copy the approved component:
- Blog post → `website/pages/blog/posts/<slug>.jsx`
- Other page → `website/pages/<slug>.jsx`

Each blog post component must include `<Head>` (title, meta description, OG/Twitter tags, canonical URL) and use `next/image` for all images.

### Step 6 — Update the blog index

Add a new post card at the top of `website/pages/blog/index.jsx`. Follow the existing card pattern exactly. Do not change any other cards.

### Step 7 — Git stage and commit

```bash
git add website/pages/blog/posts/<slug>.jsx \
        website/public/images/blog/<slug>.webp \
        website/pages/blog/index.jsx
git commit -m "publish: <Post title>"
```

If any other files were touched (publish log, page updates), include them too.

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

## Working files

`working_files/` at the repo root is a git-ignored scratch space. Place a media file here when **either** condition is true:

- It is **not yet referenced** in any file under `content/` or in any HTML file
- It is **not in `.webp` format** (i.e. raw JPEGs, PNGs, PSDs, videos, etc. awaiting processing)

Once a file has been optimised to `.webp` **and** is referenced in an approved content draft, promote it through the normal publishing workflow into `website/public/images/`.

Never commit files from `working_files/` — the directory is in `.gitignore` and must stay there.

---

## Error handling

| Situation | Action |
|---|---|
| Source draft not found | Ask Bill which file to use before proceeding |
| Source image missing | Use a placeholder `{/* IMAGE NEEDED */}` comment, continue |
| Style guide file missing | Stop and ask Bill — do not guess at styles |
| Image too large after optimisation | See `context/publishing-guide.md` for fallback quality settings |
| `build-page` output needs corrections | Edit `agents/web-developer/output/<slug>.jsx` directly, then copy to `website/` |

---

## Quality checklist (run before Step 7)

- [ ] Component renders without errors — no missing imports, correct JSX syntax
- [ ] All images use `next/image` with correct `src`, `alt`, `width`, and `height`
- [ ] `<Head>` includes `title`, `meta description`, and OG/Twitter tags
- [ ] Category tag matches a valid blog category (see `context/web-style-guide.md`)
- [ ] Post card added at the top of the blog index grid
- [ ] No inline styles used unless unavoidable — use CSS modules or global styles
- [ ] Read-time estimate is included in the post header
- [ ] Publish log entry appended to `context/publish-log.md`

---
