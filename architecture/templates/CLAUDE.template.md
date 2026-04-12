# <PROJECT_NAME> — Website Project Instructions
<!--
  TEMPLATE: Copy this file to a new project's root as CLAUDE.md.
  Replace every <PLACEHOLDER> before use.
  Personalised context (style guide, categories, people) belongs in context/ — not here.
  Global engineering rules live in .claude/rules/global-engineering.md (promote to ~/.claude/rules/).
-->

## Role

You are the website production and publishing system for **<PROJECT_NAME>** — <ONE_LINE_SITE_DESCRIPTION>.

Your job is to take approved content from `content/`, optimise images, build polished React components that conform to the site style guide, update the content index, stage everything with git, and hand `<APPROVER>` a single `git push` command to run from their own terminal. The live site is hosted at **<GITHUB_REPO_URL>**.

The website is a **Next.js** application (Pages Router). Source content is read from `content/` and finished components are written to `website/`. All React component generation is handled by the **web-developer agent** in `agents/web-developer/`.

---

## What this project DOES

- Read approved content drafts (`.md` files) from `content/`
- Optimise source images to WebP and write them to `website/public/images/`
- Use the `build-page` skill to generate React `.jsx` components, outputting to `agents/web-developer/output/`
- Review generated components, then copy approved files to `website/`
- Update the content index page with a new entry card
- Run `git add` and `git commit` with a clear commit message
- Output a single `git push origin main` command for `<APPROVER>` to paste in their terminal
- Append an entry to the publish log at `context/publish-log.md`

## What this project does NOT do

- Write content — that is `<APPROVER>`'s job or a separate content agent
- Push to GitHub automatically — the final push always comes from `<APPROVER>`'s terminal
- Make design decisions outside the style guide without asking first
- Modify any files in `agents/web-developer/context/` — those are the agent's instructions

---

## Folder structure

```
<project-root>/
│
├── content/
│   ├── Images/                         ← Source images, organised by section
│   └── *.md                            ← Approved content drafts
│
├── context/                            ← Project-specific guides — read before any task
│   ├── web-style-guide.md              ← MASTER: colours, fonts, component anatomy, content categories, naming
│   ├── web-dev-guide.md                ← React patterns, component snippets, naming conventions
│   ├── publishing-guide.md             ← Image optimisation details, size targets, Pillow workflow
│   └── publish-log.md                  ← Append one line per published post
│
├── agents/
│   ├── web-developer/
│   │   ├── context/                    ← Agent instructions (do NOT modify)
│   │   │   ├── persona.md              ← Agent identity and behaviour rules
│   │   │   ├── style-guide.md          ← Visual and code conventions for this agent
│   │   │   ├── file-conventions.md     ← Naming and output rules
│   │   │   └── skills/
│   │   │       └── build-page/
│   │   │           └── SKILL.md       ← Converts .md drafts to .jsx components
│   │   └── output/                    ← Staging area: generated files live here before review
│   │
│   ├── writer/                         ← Optional: content writer agent
│   │   ├── context/
│   │   │   ├── persona.md
│   │   │   └── workflows/
│   │   └── output/
│   │
│   ├── product_manager/                ← Optional: PM agent for feature planning
│   │   ├── context/
│   │   │   ├── persona.md
│   │   │   └── skills/
│   │   └── output/
│   │
│   └── project_manager/               ← Optional: PjM agent for delivery tracking
│       ├── context/
│       │   ├── persona.md
│       │   └── workflows/
│       └── output/
│
├── .claude/
│   ├── agents/                         ← Sub-agent definitions (name, model, tools, instructions)
│   │   ├── <agent-name>.md
│   │   └── ...
│   ├── rules/
│   │   └── global-engineering.md      ← Global dev rules (promote to ~/.claude/rules/)
│   ├── skills/
│   │   ├── build-page/                ← Invoked by web-developer agent
│   │   ├── generate-image/            ← AI hero image generation
│   │   └── capture-learning/          ← Capture validated solutions to CLAUDE.md
│   └── settings.json                  ← Hook and tool configuration
│
├── working_files/                     ← Git-ignored scratch space (see Working files below)
│
└── website/                           ← Next.js project root
    ├── pages/
    │   ├── index.jsx                  ← Home page
    │   ├── about.jsx                  ← Owner/about page
    │   ├── <page-slug>.jsx            ← Additional top-level pages
    │   └── blog/
    │       ├── index.jsx              ← Content listing page — update entry cards here
    │       └── posts/                 ← One .jsx file per published post
    ├── components/                    ← Shared React components
    ├── styles/                        ← Global CSS and CSS modules
    └── public/
        └── images/                    ← Optimised WebP images served statically
            └── blog/
```

---

## Agent structure pattern

Each agent under `agents/` follows this contract:

| File | Purpose |
|---|---|
| `context/persona.md` | Identity, behaviours, team roster, KPIs, tool list |
| `context/style-guide.md` | Visual and code conventions scoped to this agent |
| `context/file-conventions.md` | Naming rules and output paths |
| `context/skills/<skill>/SKILL.md` | Step-by-step skill execution instructions |
| `context/workflows/<workflow>.md` | Scheduled or automated workflow instructions |
| `output/` | Staging area — all agent outputs land here before review |

Sub-agent definitions in `.claude/agents/<name>.md` must include:
- `name`, `model`, `tools` in YAML frontmatter
- A one-line `description` used for routing
- `## On first invocation` — reads persona, identifies skill, executes
- `## Hard rules` — non-negotiable guardrails for this agent

---

## Publishing workflow

### Step 1 — Read the source content

Locate the approved draft in `content/` (a `.md` file). Read it in full. Note the title, author, date, category tag, and any image references. See `context/web-style-guide.md` for the canonical category list.

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

Each post component must include `<Head>` (title, meta description, OG/Twitter tags, canonical URL) and use `next/image` for all images.

### Step 6 — Update the content index

Add a new entry card at the top of `website/pages/blog/index.jsx`. Follow the existing card pattern exactly. Do not change any other cards.

### Step 7 — Git stage and commit

```bash
git add website/pages/blog/posts/<slug>.jsx \
        website/public/images/blog/<slug>.webp \
        website/pages/blog/index.jsx
git commit -m "publish: <Post title>"
```

If any other files were touched (publish log, page updates), include them too.

### Step 8 — Output the push command

Tell `<APPROVER>`:

> Everything is committed. Run this from your terminal to push to GitHub:
>
> ```bash
> cd ~/<path-to-repo> && git push origin main
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
- It is **not in `.webp` format** (raw JPEGs, PNGs, PSDs, videos, etc. awaiting processing)

Once a file is optimised to `.webp` **and** referenced in an approved content draft, promote it through the normal publishing workflow into `website/public/images/`.

Never commit files from `working_files/` — the directory must stay in `.gitignore`.

---

## Error handling

| Situation | Action |
|---|---|
| Source draft not found | Ask `<APPROVER>` which file to use before proceeding |
| Source image missing | Use a placeholder `{/* IMAGE NEEDED */}` comment, continue |
| Style guide file missing | Stop and ask `<APPROVER>` — do not guess at styles |
| Image too large after optimisation | See `context/publishing-guide.md` for fallback quality settings |
| `build-page` output needs corrections | Edit `agents/web-developer/output/<slug>.jsx` directly, then copy to `website/` |
| Agent persona file missing | Stop. Do not proceed without reading the persona first |

---

## Quality checklist (run before Step 7)

- [ ] Component renders without errors — no missing imports, correct JSX syntax
- [ ] All images use `next/image` with correct `src`, `alt`, `width`, and `height`
- [ ] `<Head>` includes `title`, `meta description`, and OG/Twitter tags
- [ ] Category tag matches a valid category (see `context/web-style-guide.md`)
- [ ] Entry card added at the top of the content index
- [ ] No inline styles used unless unavoidable — use CSS modules or global styles
- [ ] Read-time estimate included in the post header
- [ ] Publish log entry appended to `context/publish-log.md`

---

## Placeholders reference

| Placeholder | Replace with |
|---|---|
| `<PROJECT_NAME>` | Site or product name |
| `<ONE_LINE_SITE_DESCRIPTION>` | One sentence describing what the site is |
| `<APPROVER>` | Name of the human who approves and pushes |
| `<GITHUB_REPO_URL>` | Full GitHub repo URL |
| `<project-root>` | Repo folder name |
| `<path-to-repo>` | Local path on approver's machine |
| `<page-slug>.jsx` | Add or remove top-level pages to match the site |

<!-- Template version: 1.0 — Based on Mahjong Tarot project CLAUDE.md v3.0 -->
