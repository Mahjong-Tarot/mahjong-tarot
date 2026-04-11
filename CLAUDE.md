# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state

The website is mid-migration. `website/` currently contains static HTML stubs (`index.html`, `about.html`) and `node_modules`. The Next.js Pages Router project described in the workflow below **has not been scaffolded yet** — `pages/`, `components/`, and `styles/` directories do not yet exist. The context guide files (`context/web-style-guide.md`, `context/web-dev-guide.md`, `context/publishing-guide.md`) are currently empty placeholders.

## Dev commands

All commands run from `website/`:

```bash
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build
npm run start    # serve production build
```

The `website/package.json` lists Next.js 14, React 18, and React DOM 18 as the only dependencies. There is no linter or test suite configured yet.

## Role of this Claude instance

This repo is Bill Hajdu's personal fortune-telling practice site (**The Mahjong Tarot**). This Claude instance acts as the **website production and publishing system** — it reads approved content drafts from `content/`, optimises images, builds React components, updates the blog index, stages git commits, and hands Bill a single `git push` command.

**Do not push to GitHub automatically.** The final push always comes from Bill's terminal.

## Repo layout

```
content/          ← Bill's approved .md drafts + source images (content/Images/)
context/          ← Style guide, dev guide, publishing guide (currently empty)
agents/
  web-developer/
    output/       ← Staging area for generated .jsx files before review
website/          ← Next.js project root (pages/, components/, styles/ TBD)
  public/images/  ← Optimised WebP images served statically
```

## Style constraints

- **Fonts:** Playfair Display (headings) + Source Sans 3 (body/UI)
- **Colours:** Midnight Indigo `#1B1F3B`, Mystic Fire `#C0392B`, Celestial Gold `#C9A84C`, Warm Cream `#FAF8F4`
- `border-radius: 0` everywhere — no rounded corners (Mahjong tile geometry)
- Use CSS modules or global styles — no inline styles unless unavoidable
- All images via `next/image` with correct `src`, `alt`, `width`, `height`

## Naming conventions

| Thing | Convention | Example |
|---|---|---|
| Post slug | kebab-case, no dates | `blood-moon-fire-horse` |
| Image file | matches slug | `blood-moon-fire-horse.webp` |
| Component file | PascalCase slug | `BloodMoonFireHorse.jsx` |

## Blog categories

Mahjong and Tarot · Tarot · Mahjong Readings · Year of the Snake · Year of the Fire Horse · Blood Moon

## Publishing workflow (summary)

1. Read the `.md` draft from `content/`
2. Read `context/web-style-guide.md` before building any component
3. Optimise images to WebP with Pillow (`quality=82`; hero < 200 KB, inline < 100 KB) → `website/public/images/blog/<slug>.webp`
4. Generate the `.jsx` component via the `build-page` skill → `agents/web-developer/output/<slug>.jsx`
5. Review output, then copy to `website/pages/blog/posts/<slug>.jsx`
6. Add a post card at the top of `website/pages/blog/index.jsx`
7. `git add` + `git commit -m "publish: <Title>"`
8. Tell Bill to run `git push origin main` from his terminal
9. Append a row to `context/publish-log.md`

## Git notes

- Branch `web-developer-agent` is the active development branch; PRs merge into `main`
- The sandbox cannot reach GitHub over SSH — Bill runs the final `git push`
- Before any session: confirm `git status` is clean; stop and report if there are conflicts
