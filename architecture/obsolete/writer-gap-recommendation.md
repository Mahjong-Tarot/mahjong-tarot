# Writer Agent — Gap Recommendation

**Date:** 2026-04-13
**Status:** Ready for implementation
**Related review:** `architecture/writer-agent-review.md`

---

## The Core Finding

The content calendar (`content/content-calendar.md`) is complete and correct. It already carries every piece of weekly context the writer needs:

- Exact publish date per post
- Day of week
- Channel (Blog, Facebook EN, Facebook VN, Instagram)
- Hook copy for every single post
- Topic angle (Fire Horse vs Mahjong Mirror vs Weekly Challenge)
- Chapter/tile references for Mahjong Mirror posts

**The problem is not the content calendar. The problem is that the writer-workflow.md and write-post SKILL.md do not read or implement it faithfully.**

The workflow produces flat `social-facebook.md` files. The calendar and the actual produced content both use `mon-facebook-en.md` naming. The workflow has no Vietnamese step. The SKILL.md step numbering is broken. These are alignment bugs — not design rethinks.

---

## What NOT to Touch

| File | Reason |
|------|--------|
| `content/content-calendar/content-calendar.md` | Source of truth — correct as-is |
| `agents/writer/context/style-guide.md` | Thorough and accurate — no changes needed |
| All existing files in `content/topics/` | Already produced correctly |
| `content/topics/INDEX.md` | Already produced correctly — just needs to be auto-generated going forward |

---

## What to Fix (Minimum Viable Changes)

### Fix 1 — `architecture/writer-workflow.md`

The workflow document needs three updates:

**a. File naming convention**

Replace the flat platform naming with day-of-week + language naming that matches the calendar:

| Old (wrong) | New (correct) |
|-------------|---------------|
| `social-facebook.md` | `mon-facebook-en.md`, `tue-facebook-en.md`, etc. |
| `social-instagram.md` | `mon-instagram.md`, `tue-instagram.md`, etc. |
| `blog.md` | `blog-fire-horse.md` OR `blog-mahjong-mirror.md` (based on angle) |
| `seo.md` | `seo-fire-horse.md` OR `seo-mahjong-mirror.md` |

**b. Vietnamese translation step**

After writing each English Facebook post, the writer must produce the Vietnamese variant as a separate file (`mon-facebook-vn.md`). All VN files get a `⚠️ human review` flag in the INDEX — they are never auto-approved.

The workflow step should read:

> For every Facebook EN post, write a Vietnamese translation in Bill's adapted voice. Save as `{day}-facebook-vn.md`. Flag all VN files for human review before scheduling.

**c. INDEX.md generation step**

After all topics for the week are done, generate (or update) `content/topics/INDEX.md` using the exact format already established:

- One section per week (heading = week theme)
- One sub-section per topic (angle, publish days, file table, blog hook, CTAs)
- Human review checklist at the bottom
- File count summary

The INDEX.md is the handoff document for the social media manager and web developer.

---

### Fix 2 — `agents/writer/skills/write-post/SKILL.md`

The step numbering is broken and the blog post step is embedded inside the SEO code block. Correct the sequence:

| Current (broken) | Correct |
|---|---|
| Step 1: Gather source | Step 1: Read the content calendar |
| Step 2: Determine slug/style | Step 2: Gather source material |
| Step 5 (first): SEO guide | Step 3: Determine slug, angle, and blog style |
| Step 4 (inside Step 5 code block): Blog post | Step 4: Write the blog post |
| Step 5 (second): Social media | Step 5: Write the SEO file |
| Step 6: Create output folder | Step 6: Write social media posts (day-named files) |
| Step 7: Update blog index | Step 7: Write Vietnamese variants |
| Step 8: Confirm | Step 8: Create the topic folder and save all files |
| — | Step 9: Update the blog index |
| — | Step 10: Confirm and report |

Also update the output folder structure in the skill to match the real naming convention.

---

### Fix 3 — `agents/writer/context/persona.md`

Line 31 references the wrong skill path:

```
# wrong
agents/writer/skills/write-post.md

# correct
agents/writer/skills/write-post/SKILL.md
```

---

## Implementation Order

1. Fix `persona.md` path — 2 minutes, zero risk
2. Fix `write-post/SKILL.md` step sequence — rewrite steps only, leave all content rules intact
3. Update `writer-workflow.md` — add VN step, rename file convention, add INDEX.md generation

Do not touch the content calendar, style guide, or any existing content files.

---

## Correction Prompt

See the companion file `architecture/writer-correction-prompt.md` for the single Claude Code prompt to execute all three fixes.
