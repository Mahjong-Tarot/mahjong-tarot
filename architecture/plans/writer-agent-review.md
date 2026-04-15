# Writer Agent Review

**Date:** 2026-04-13
**Reviewer:** Trac Nguyen
**Branch:** trac/workflows-n-processes

---

## Purpose

This review assesses whether the writer agent — as currently defined in `agents/writer/` — fulfils its dual purpose:

1. Marketing blog post writer for The Mahjong Tarot brand
2. Producer of social media content to be handed off to a social media manager for distribution

---

## Agent Files Reviewed

| File | Path |
|------|------|
| Persona | `agents/writer/context/persona.md` |
| Style Guide | `agents/writer/context/style-guide.md` |
| Write-Post Skill | `agents/writer/skills/write-post/SKILL.md` |

---

## What the Agent Does Well

### Voice and ICP definition
Bill Hajdu's persona (Parts 2–3 of the style guide), sentence patterns, signature phrases, and "what he never sounds like" provide enough signal for an AI agent to maintain consistency across posts without drift.

### Ten blog styles
Each style includes word count range, tone notes, example hooks, and when-to-use guidance. The skill's rotation logic (avoid repeating a style in the last 3 posts) prevents tonal repetition across the blog.

### Social media output scope
The skill generates four platform-specific files — Instagram, Facebook, X/Twitter, LinkedIn — each with format specs, word counts, and tone adaptations. This is the right scope for a brand at this stage.

### SEO guide output
`seo.md` covers meta title/description character limits, header structure, alt text, internal/external link suggestions, and social sharing timing notes.

### Output folder structure
Everything lands in `content/topics/<slug>/` — clean, predictable, and decoupled from the website build pipeline.

---

## Gaps and Issues

### 1. SKILL.md has a broken step sequence (critical)

The skill file has a numbering error that would cause an AI agent executing it to produce malformed output or skip steps:

- **Step 3 is missing entirely.** The file jumps from Step 2 directly to Step 5.
- **Step 4 (Write the Blog Post) appears inside the Step 5 (SEO Guide) code block**, making it look like part of the `seo.md` template rather than a standalone step.
- **Step 5 appears twice** — once for the SEO guide, once for social media.

An agent following this file mechanically will have ambiguous execution order between the SEO guide and the blog post itself (which is a problem, since the SEO guide references the blog's H2 structure).

**Fix:** Rewrite the skill with correct, unambiguous step numbering and extract Step 4 from inside the Step 5 code block.

---

### 2. No social media manager handoff contract (significant)

The persona and skill produce social files but never define what the downstream social media manager actually needs. Files are dropped into `content/topics/<slug>/` with no:

- **Scheduling metadata** — target publish date, time, platform priority order
- **Approval status** — no signal distinguishing "draft" from "ready to distribute"
- **Image specs** — the Instagram file says "note any image suggestion" but specifies no dimensions, aspect ratios, or whether a generated hero image is expected
- **Handoff trigger** — no mention of how the social media manager knows files are ready (status flag, checklist entry, notification)

The social media manager agent spec (see `architecture/CLIENT-BOOTSTRAP-PROMPT.md`) explicitly separates the writer and distributor roles. The coordination layer between them is currently undefined in the writer agent.

**Fix:** Add a `social-brief.md` output to the write-post skill — a consolidated handoff file specifying platforms, priority order, suggested schedule relative to blog publish date, confirmed image asset paths, and any platform-specific notes.

---

### 3. Persona references wrong skill path (minor)

`agents/writer/context/persona.md` line 31 references:
```
agents/writer/skills/write-post.md
```

The actual path is:
```
agents/writer/skills/write-post/SKILL.md
```

**Fix:** Update the path in `persona.md`.

---

### 4. No consolidated handoff summary for the SM manager (minor)

Each social file is raw content only. A social media manager (human or agent) benefits from a single `social-brief.md` per topic that consolidates:

- Which platforms to post on, in priority order
- Suggested cadence relative to blog publish date (e.g. LinkedIn 48h after, X same day)
- Confirmed image asset paths
- Any platform restrictions or audience notes

This also serves as the approval checkpoint — the human reviewer signs off on `social-brief.md` before handing to the SM agent.

---

## Verdict

| Dimension | Rating | Notes |
|-----------|--------|-------|
| Voice and brand consistency | Strong | ICP, persona, and style guide are thorough |
| Blog post production | Strong | 10 styles, rotation logic, SEO output |
| Social media content scope | Adequate | Right platforms, needs handoff contract |
| SM manager coordination | Missing | No handoff definition, no scheduling metadata |
| Skill file integrity | Broken | Step numbering errors will cause execution failures |

The **content quality foundation** is strong. The **social media scope** is correct. The agent cannot reliably fulfill its purpose until the skill step sequence is fixed and the SM handoff contract is defined.

---

## Recommended Fixes (Priority Order)

1. **Rewrite `SKILL.md`** with correct step numbering and extract the blog post step from inside the SEO code block
2. **Add `social-brief.md` as a required output** in the write-post skill — the handoff document for the SM manager
3. **Fix the skill path** in `agents/writer/context/persona.md`
4. **Define image specs per platform** in the Instagram and Facebook social sections of the skill
