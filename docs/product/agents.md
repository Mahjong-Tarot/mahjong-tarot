# Agents — The Mahjong Tarot

Five Claude Code agents drive content production. Each has a definition at `.claude/agents/<name>.md` and a richer persona file at `agents/<name>/context/persona.md`. The `mahjong-studio` skill chains them: writer → designer → web-developer → git commit.

Status reflects code presence and observed pipeline use as of 2026-04-29. Percentages are first-pass.

| # | Agent | Status | % | Description |
|---|---|---|---|---|
| 1 | **Writer** | 🔄 | 70 | Reads the content calendar, gathers source material from `content/source-material/`, produces blog posts, social variants, SEO guides, and Vietnamese translations. First stage of the `mahjong-studio` pipeline. **Gap:** voice doc not written — contractor-friendliness limited until then. |
| 2 | **Designer** | ✅ | 85 | Generates unique hero and inline images for written content via the Gemini Python SDK. Reads the blog draft, writes prompts per content file, generates, optimises to WebP. |
| 3 | **Web Developer** | ✅ | 90 | Builds Next.js JSX components from approved content drafts, places them in `website/pages/blog/posts/`, updates the blog index, promotes images to `website/public/images/blog/`. Final stage of the `mahjong-studio` pipeline. |
| 4 | **Project Manager** | ✅ | 85 | Owns delivery — daily stand-ups, RAID log, blocker triage, scope-change assessment, RAG status reports, release monitoring. Skills: `daily-checkin`, `raid-log`, `scope-change`. |
| 5 | **Product Manager** | ✅ | 75 | Executes structured PM workflows — feature ideas, competitor analysis, user personas, vision reports. Triggered by phrases like "we should build", "how do competitors handle", "write a vision report". |

## Image Designer (scaffold only)

`agents/image-designer/` exists with `output/` and `workflow/` subfolders but no persona file and no `.claude/agents/*.md` definition. Either a draft of the Designer agent or a planned successor — out of scope today. **Status:** 🆕 needs planning if it's intended to be a separate agent.

## Glyph legend

| Glyph | Meaning |
|---|---|
| ✅ | Shipped — agent is wired and used in the production pipeline |
| 🔄 | In progress — agent is wired but has known gaps |
| 📋 | Planned — definition exists but not yet operational |
| 🆕 | Needs planning — not defined in code |

## Cross-references

- Pipeline orchestrator: the `mahjong-studio` skill (`.claude/skills/mahjong-studio/`) chains writer → designer → web-developer.
- Per-agent personas: `agents/<name>/context/persona.md`.
- Style guide consumed by Web Developer: `agents/web-developer/context/web-style-guide.md`.
- Daily standup workflow used by Project Manager: `standup/individual/` and `standup/briefings/`.
