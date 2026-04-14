# Writer Agent — Correction Prompt

Paste this prompt directly to Claude Code to execute all three fixes documented in `architecture/writer-gap-recommendation.md`.

---

```
You are fixing alignment bugs in the writer agent for The Mahjong Tarot project. 
Do NOT redesign anything. Do NOT touch content files. Make only the three targeted 
fixes below.

Before touching any file, read it in full first.

---

## Context (read these files before making any changes)

1. Read `content/content-calendar/content-calendar.md` — source of truth for weekly 
   output structure. This is the only file you need to understand the output pattern.

2. Read `agents/writer/skills/write-post/SKILL.md` — note the broken step sequence 
   (Step 3 missing, Step 4 inside Step 5 code block, Step 5 appears twice).

3. Read `architecture/writer-workflow.md` — note the wrong file naming convention 
   and the missing Vietnamese and INDEX.md steps.

Do NOT read anything under `content/topics/` — those files will be deleted.

---

## Fix 1 — `agents/writer/context/persona.md`

Find the line referencing the write-post skill path and correct it:

- Wrong: `agents/writer/skills/write-post.md`
- Correct: `agents/writer/skills/write-post/SKILL.md`

---

## Fix 2 — `agents/writer/skills/write-post/SKILL.md`

Rewrite the step sequence only. Keep all content rules, voice guidelines, platform 
specs, and output format instructions exactly as they are — only fix the structure.

The correct step order is:

1. Read the content calendar (`content/content-calendar/content-calendar.md`) — find 
   this week's topics, publish dates, channels, hooks, and angles
2. Gather source material from `content/source-material/`
3. Determine slug, angle (fire-horse OR mahjong-mirror), and blog style
4. Write the blog post — save as `blog-fire-horse.md` OR `blog-mahjong-mirror.md` 
   depending on the angle
5. Write the SEO file — save as `seo-fire-horse.md` OR `seo-mahjong-mirror.md`
6. Write social media posts using day-of-week file naming from the content calendar:
   - Facebook EN: `{day}-facebook-en.md` (e.g. `mon-facebook-en.md`)
   - Instagram: `{day}-instagram.md`
   - Use the hook from the content calendar as the opening line for each post
7. Write Vietnamese Facebook variants: `{day}-facebook-vn.md` for every Facebook EN 
   post. Flag each VN file with a comment at the top: `<!-- ⚠️ HUMAN REVIEW REQUIRED -->`
8. Create the topic folder `content/topics/<slug>/` and save all files into it
9. Update `context/blogindex.md` with the new row
10. Confirm: list all files created, flag anything missing or thin on source material

Update the output folder structure example in the skill to show the real file names:

```
content/topics/<slug>/
├── blog-fire-horse.md          (or blog-mahjong-mirror.md)
├── seo-fire-horse.md           (or seo-mahjong-mirror.md)
├── mon-facebook-en.md
├── mon-facebook-vn.md          ← ⚠️ human review
├── mon-instagram.md
├── tue-facebook-en.md          (if calendar has Tuesday posts)
├── tue-facebook-vn.md          ← ⚠️ human review
└── tue-instagram.md
```

For Friday challenge topics (social only, no blog):
```
content/topics/<slug>/
├── fri-facebook-en.md
├── fri-facebook-vn.md          ← ⚠️ human review
└── fri-instagram.md
```

---

## Fix 3 — `architecture/writer-workflow.md`

Make three additions to the existing workflow. Do not remove anything already there.

**a. Replace the folder structure example (under "Folder Structure")**

Update the `topics/[topic-slug]/` example to show the real file naming convention:

```
└── [topic-slug]/
    ├── blog-fire-horse.md        (Fire Horse angle posts)
    ├── blog-mahjong-mirror.md    (Mahjong Mirror angle posts)
    ├── seo-fire-horse.md
    ├── seo-mahjong-mirror.md
    ├── mon-facebook-en.md
    ├── mon-facebook-vn.md        ← ⚠️ human review required
    ├── mon-instagram.md
    ├── tue-facebook-en.md
    ├── tue-facebook-vn.md        ← ⚠️ human review required
    ├── tue-instagram.md
    ├── fri-facebook-en.md        (challenge weeks only)
    ├── fri-facebook-vn.md        ← ⚠️ human review required
    └── fri-instagram.md          (challenge weeks only)
```

**b. Add a Vietnamese translation step after Step 5 (Write the Social Media Posts)**

Insert a new Step 6:

> **Step 6: Write Vietnamese Facebook Variants**
>
> For every Facebook EN post produced in Step 5, write a Vietnamese translation and 
> save it as `{day}-facebook-vn.md` in the same topic folder.
>
> The translation should adapt naturally for a Vietnamese-speaking audience — not a 
> literal word-for-word render. Bill's directness and warmth must survive the translation.
>
> Add this comment at the top of every VN file:
> `<!-- ⚠️ HUMAN REVIEW REQUIRED — Vietnamese posts must be approved by Thanh before scheduling -->`
>
> Do not translate Instagram posts — EN only for Instagram.

Renumber the subsequent steps accordingly (old Step 6 becomes Step 7, etc.).

**c. Add an INDEX.md generation step before the Completion Report**

Insert a new step (before "Produce the Completion Report"):

> **Step N: Generate the Weekly INDEX.md**
>
> After all topic folders are complete for the week, create or update `content/topics/INDEX.md`.
>
> For each week, write a section using this exact format:
> - Week heading with theme (e.g. `## Week of April 13 — Travel`)
> - One sub-section per topic with: angle, publish days, file table (File | Type | Day | 
>   Channel | Image | Published), blog hook, primary/secondary CTA
> - Mark all VN files with `⚠️ human review` in the Channel column
> - Mark all Image cells as `TO DO`
> - Mark all Published cells as `No`
>
> Append a human review checklist at the bottom for:
> - Bill: voice accuracy on all blog posts
> - Thanh: Vietnamese accuracy on all VN Facebook posts
> - Bill/Dave: chapter/tile reference accuracy on Mahjong Mirror posts
>
> Update the file count table at the bottom.

---

## After making all changes

Report back:
1. Exact edits made to each file (a brief diff summary per file)
2. Anything you could not do without more information
3. Confirm no content files, content calendar, or style guide were touched
```
