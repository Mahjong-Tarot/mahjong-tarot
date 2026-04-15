# The Mahjong Tarot — Website Project Instructions

## Role

You are the website production and publishing system for **The Mahjong Tarot** — Bill Hajdu's personal practice and book website.

Your job is to take approved content from `content/`, optimise images, build polished React components that conform to the site style guide, update the blog index, stage everything with git, and hand Bill a single `git push` command to run from his own terminal. The live site is hosted via GitHub at **https://github.com/Mahjong-Tarot/mahjong-tarot.git**.

The website is a **Next.js** application (Pages Router). You read source content from `content/` and write finished components to `website/`. All React component generation is handled by the **web-developer agent** in `agents/web-developer/`.

---

## What this project DOES

- Read approved content drafts (`.md` files) from `content/`
- Optimise source images to WebP and write them to `website/public/images/blog/` or `website/public/images/`
- Use the `build-page` skill to generate React `.jsx` components
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
├── .claude/
│   ├── agents/                        ← Claude Code agent definitions
│   │   ├── product-manager.md
│   │   └── project-manager.md
│   ├── rules/
│   │   └── global-engineering.md      ← Engineering guardrails (git, secrets, deploys)
│   └── skills/
│       ├── build-page/SKILL.md        ← Converts markdown → Next.js .jsx components
│       ├── capture-learning/SKILL.md  ← Auto-appends lessons to CLAUDE.md
│       ├── create-agent/SKILL.md      ← Scaffolds new agent roles
│       └── generate-image/SKILL.md    ← Blog hero image generation via Nano Banana 2
│
├── agents/
│   ├── designer/                      ← Design agent (context)
│   ├── product-manager/               ← Product manager agent (context, skills)
│   ├── project-manager/               ← Project manager agent
│   │   ├── context/                   ← Persona, workflows (standup, retro, release monitor, etc.)
│   │   ├── skills/                    ← daily-checkin, raid-log, scope-change
│   │   └── workflows/
│   ├── web-developer/                 ← Web developer agent
│   │   ├── context/                   ← Persona, style guides, file conventions
│   │   └── skills/
│   │       └── build-page.md          ← The build-page skill (agent copy)
│   └── writer/                        ← Writer agent
│       ├── context/                   ← Persona, style guide
│       └── skills/
│           └── write-post/            ← Blog post writing skill
│
├── architecture/                      ← System design docs and planning artefacts
│   ├── admin-crm-plan.md
│   ├── crm-design-doc.md
│   └── *.html / *.docx               ← Org chart, workflow diagrams, build plans
│
├── content/
│   ├── source-material/               ← Raw research organised by topic
│   │   ├── chinese-astrology/
│   │   ├── mahjong-fortune-telling/
│   │   ├── romance/
│   │   ├── working-images/
│   │   └── year-of-the-fire-horse/
│   └── topics/                        ← Blog topic bundles (each folder = one post)
│       └── <slug>/                    ← blog.md, seo.md, social-*.md, source images
│
├── context/                           ← Project-specific guides — read before any task
│   ├── blog-index.md                  ← Blog index structure reference
│   ├── claude-md-overview.md          ← How CLAUDE.md files work across the project
│   ├── claude-md-setup-guide.md       ← Setup guide for new CLAUDE.md configurations
│   ├── publish-log.md                 ← Append one line per published post
│   └── templates/
│       └── CLAUDE.template.md         ← Template for new project CLAUDE.md files
│
├── standup/                           ← Daily standup logs and briefings
│   ├── individual/                    ← Per-person check-ins (dave.md, yon.md, trac.md, khang.md, agents.md)
│   └── briefings/                     ← Compiled daily stand-ups (YYYY-MM/YYYY-MM-DD.md)
│
├── working_files/                     ← Git-ignored scratch space (see Working files below)
│
└── website/                           ← Next.js project root
    ├── pages/
    │   ├── index.jsx
    │   ├── about.jsx
    │   ├── admin.jsx
    │   ├── contact.jsx
    │   ├── readings.jsx
    │   ├── the-mahjong-mirror.jsx
    │   ├── api/
    │   │   └── reply.js
    │   └── blog/
    │       ├── index.jsx              ← Blog listing page — update post cards here
    │       └── posts/                 ← One .jsx file per published post
    ├── components/                    ← Nav, Footer, NewsletterSignup
    ├── lib/
    │   └── supabase.js                ← Supabase client
    ├── styles/                        ← CSS modules per page + globals.css
    ├── public/
    │   └── images/                    ← Optimised WebP images served statically
    │       └── blog/
    └── supabase/
        ├── *.sql                      ← Schema and seed migrations
        └── functions/
            └── notify-inquiry/        ← Edge function for contact form
```

---

## Publishing workflow

### Step 1 — Read the source content

Locate the approved topic bundle in `content/topics/<slug>/` (contains `blog.md`, `seo.md`, and `social-*.md` files). Read `blog.md` in full. Note the title, author, date, category tag, and any image references. See `agents/web-developer/context/web-style-guide.md` for the canonical blog category list.

### Step 2 — Read the style guide

Read `agents/web-developer/context/web-style-guide.md` and `agents/web-developer/context/style-guide.md`. Do not build any components without doing this first.

### Step 3 — Generate or optimise images

**Option A — Generate a new hero image:** Invoke the `generate-image` skill from `.claude/skills/generate-image/SKILL.md`.

**Option B — Optimise an existing source image:** Use Python + Pillow. Source files live in `content/source-material/` or `content/topics/<slug>/`.

### Step 4 — Generate React component via the build-page skill

Invoke the `build-page` skill from `.claude/skills/build-page/SKILL.md` (or `agents/web-developer/skills/build-page.md`). Review the generated component before proceeding.

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
| Image too large after optimisation | Reduce Pillow quality in 5% steps until under target |
| `build-page` output needs corrections | Edit the generated `.jsx` directly, then copy to `website/` |

---

## Quality checklist (run before Step 7)

- [ ] Component renders without errors — no missing imports, correct JSX syntax
- [ ] All images use `next/image` with correct `src`, `alt`, `width`, and `height`
- [ ] `<Head>` includes `title`, `meta description`, and OG/Twitter tags
- [ ] Category tag matches a valid blog category (see `agents/web-developer/context/web-style-guide.md`)
- [ ] Post card added at the top of the blog index grid
- [ ] No inline styles used unless unavoidable — use CSS modules or global styles
- [ ] Read-time estimate is included in the post header
- [ ] Publish log entry appended to `context/publish-log.md`

---

*Instructions version: 2.0 — Updated to Next.js (Pages Router). Update this file whenever the workflow changes.*

# Cross-Tool Context Bridge

This project uses a shared context system between Cowork and Claude Code.

**At the start of every session**, read the bridge file for context from other tools:
- Read `~/Documents/Claude/shared-context/BRIDGE.md` for current project state
- Check `~/Documents/Claude/shared-context/blockers/` for pending work
- Check `~/Documents/Claude/shared-context/handoffs/` for the latest handoff note (most recent by filename)

**At the end of every session**, update the bridge:

## PM Agent Rules

These rules apply whenever running or debugging PM agent trigger prompts:

**Lark CLI identity**: Default to `--as bot` (tenant_access_token, no OAuth) for all PM notifications. Only use `--as user` (requires OAuth login) when the user explicitly asks Claude to act as them, make edits on their behalf, or perform an action under their identity. If you see a bot auth error, check lark-cli's stored credentials — do not initiate OAuth.

**Environment variables**: Always check `.env`, `.env.development`, `.env.production`, and `.env.local` (in that order, later takes precedence) before concluding a value is missing. Never stop at just `.env` and `.env.local`.

**Email templates**: HTML email templates for PM notifications live at `agents/project-manager/context/template/emails/`. Always substitute placeholders in those files. Do not create new templates or inline HTML email content.

**Context lookup**: When a trigger prompt references an external source (persona.md, daily-standup.md, pm-notification-guide.md, etc.), read it before concluding the information isn't available. Check every listed source.

---
- Update `~/Documents/Claude/shared-context/BRIDGE.md` with what you did and current state
- Write a handoff note to `~/Documents/Claude/shared-context/handoffs/` named `YYYY-MM-DDTHH-MM_cc-to-cowork.md`
- Delete any blocker files in `blockers/` that you resolved
- If something needs Cowork (browser testing, document creation, research), add a blocker file
