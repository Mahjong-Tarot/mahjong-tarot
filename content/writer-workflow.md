# Writer Agent — Weekly Workflow

**Owner:** Writer Agent
**Schedule:** Every Friday
**Purpose:** Produce all content for the week's assigned topics — blog posts, social media posts, and SEO files — based on the content calendar and source material.

---

## Prerequisites

Before the writer runs on Friday, these things should already be in place:

- The **content calendar** (`content/content-calendar.md`) has been updated with this week's assigned topics, including which deliverables each topic requires.
- Any **source material** the writer needs has been placed in `content/source-material/` under the appropriate subject folder.
- The writer has access to prior completed topics in `content/topics/` for tone and format reference.

---

## Folder Structure

```
content/
├── content-calendar.md               # Master calendar — what's due and when
├── writer-workflow.md                 # This document
├── source-material/                   # Research & reference, organized by subject
│   ├── chinese-astrology/
│   ├── mahjong-fortune-telling/
│   ├── romance/
│   ├── working-images/
│   └── year-of-the-fire-horse/
└── topics/                            # One folder per topic, all deliverables inside
    └── [topic-slug]/
        ├── blog.md
        ├── seo.md
        ├── social-facebook.md
        ├── social-instagram.md
        ├── social-linkedin.md
        └── social-x.md
```

---

## Workflow Steps

### Step 1: Read the Content Calendar

Open `content/content-calendar.md` and find all topics assigned to this week's Friday date. There may be one topic or several.

For each topic, note:

- The **topic name** and slug (this becomes the folder name under `topics/`)
- The **primary keyword** and any secondary keywords
- Which **deliverables** are required — always a blog post, but the number and type of social posts varies per topic (e.g., one topic might need 3 Facebook posts, another might need 1)
- Any **special instructions** or notes

### Step 2: Pull Source Material

For each topic, go to `content/source-material/` and pull everything in the relevant subject folder(s). This is the research, reference text, and background the writer uses to produce the content.

If a topic draws from multiple subject areas, pull from all of them. If no source material exists for a topic, flag it in the completion report — but still attempt the topic using the writer's general knowledge and the content calendar's notes.

### Step 3: Write the Blog Post First

The blog post is the **anchor** for every topic. All other deliverables are derived from it.

Create a new folder under `topics/` using the topic slug as the folder name. Write the blog post and save it as `blog.md`.

**Blog format to follow:**

```markdown
<!--
Slug: [topic-slug]
Primary Keyword: [from calendar]
Blog Style: [style name]
Reason: [brief note on why this style was chosen]
-->

---
title: "[Full Title]"
slug: [topic-slug]
author: Bill Hajdu
date: [YYYY-MM-DD]
category: [from calendar]
primary_keyword: [keyword]
blog_style: [style]
excerpt: "[1-2 sentence hook]"
read_time: [X] min
---

# [Full Title]

[Body content — use H2 sections, blockquote pull quotes, and end with
CTAs linking to /readings and /the-mahjong-mirror]
```

**Key rules for the blog:**

- Author is always **Bill Hajdu** (voice: "the Firepig")
- Write in first person from Bill's perspective — authoritative, experienced, conversational
- Reference 35+ years of Mahjong tile reading practice where appropriate
- End with a CTA section pointing to `/readings` for a personal reading and `/the-mahjong-mirror` for the book
- Include a blockquote pull quote that works as a standalone social media quote

### Step 4: Write the SEO File

After the blog is complete, produce the SEO companion file and save it as `seo.md` in the same topic folder.

**SEO file format:**

```markdown
# SEO Guide: [Blog Title]

## Target Keyword
[primary keyword]

## Secondary Keywords
- [keyword 1]
- [keyword 2]
- [keyword 3]

## Meta Title
[Under 60 characters, includes primary keyword]

## Meta Description
[Under 160 characters, compelling, includes keyword naturally]

## URL Slug
[topic-slug]

## Header Structure
- H1: [title]
- H2: [each section heading from the blog]

## Internal Links
- /readings — anchor text for booking CTA
- /the-mahjong-mirror — anchor text for book CTA
- [any other relevant internal links to existing blog posts]

## External Link Opportunities
- [platforms and communities where this content could be shared or repurposed]

## Image Alt Text
- Hero image: [descriptive alt text]
- [any other images]

## Social Sharing Notes
- [best posting windows for the target audience]
- [hook lines to use per platform]
```

### Step 5: Write the Social Media Posts

Now derive the social media posts from the blog. Each platform gets its own file. Only produce the posts the content calendar specifies for this topic.

**File naming convention:** `social-[platform].md`

If the calendar calls for multiple posts on the same platform (e.g., 3 Facebook posts for one topic), include all of them in a single file separated by `---` dividers.

**Platform-specific guidelines:**

**Facebook** (`social-facebook.md`):
- Conversational, educational tone
- Can run longer — 150-250 words is fine
- End with a question to drive engagement ("What's your sign? I'll tell you what to watch for.")
- "Link in comments" (not in the post body)

**Instagram** (`social-instagram.md`):
- Punchy, visual-friendly language
- Open with a strong hook — the first line matters most
- "Link in bio" as the CTA
- Include a suggested hashtag block (10-15 hashtags) below a `---` divider

**LinkedIn** (`social-linkedin.md`):
- Frame through a professional or decision-making lens
- More analytical tone — still Bill's voice but addressing a thinking audience
- 5-8 hashtags at the end, focused on professional and astrology communities

**X / Twitter** (`social-x.md`):
- Write as a thread — numbered tweets (Tweet 1, Tweet 2, etc.)
- Tweet 1 is the hook — must stand alone
- Final tweet is the CTA with blog link
- Each tweet should work as a standalone if someone only sees one
- Use `[blog link]` as placeholder for the URL

### Step 6: Repeat for Each Topic

If the content calendar has multiple topics assigned to this Friday, repeat Steps 3–5 for each one. Finish all deliverables for one topic before moving to the next.

### Step 7: Produce the Completion Report

When all topics are done, compile a short report covering:

- **Topics completed:** List each topic and confirm which deliverables were produced
- **Topics with issues:** Anything that couldn't be completed and why (missing source material, ambiguous calendar instructions, etc.)
- **Files created:** Full list of new files and their paths
- **Review notes:** Anything the humans should pay particular attention to when reviewing

### Step 8: Send Telegram Notification

Push a message to the team's Telegram group:

> **Writer — Friday content is done.**
>
> **Topics completed this week:**
> - [Topic 1] — blog, seo, 3x facebook, instagram, linkedin, x thread
> - [Topic 2] — blog, seo, 1x facebook, instagram, x thread
>
> **Issues:** [any, or "None"]
>
> Please review before Wednesday — the web developer will begin picking up approved content then.
>
> If anything needs changes, ping the writer agent or update the files directly.

---

## Schedule — Rest of April 2026

| Friday | Topics | Status |
|--------|--------|--------|
| April 11 | *(already completed manually)* | Done |
| April 17 | TBD — update content calendar | Pending |
| April 24 | TBD — update content calendar | Pending |

---

## Weekly Rhythm

| Day | Who | What |
|-----|-----|------|
| **Friday** | Writer agent | Produces all content for the week's topics |
| **Sat–Tue** | Humans | Review, edit, approve |
| **Wednesday** | Web developer | Picks up approved content and publishes |

---

## Reference: Completed Topic Example

The topic `the-danger-of-love-when-fire-runs-wild` is the gold standard for a fully completed topic. It contains:

- `blog.md` — ~1,500 word explainer with frontmatter, H2 sections, pull quote, and CTAs
- `seo.md` — target and secondary keywords, meta tags, header structure, internal/external link plan, social sharing notes
- `social-facebook.md` — educational tone, ~200 words, ends with engagement question
- `social-instagram.md` — concise hook, hashtag block
- `social-linkedin.md` — professional framing, analytical tone
- `social-x.md` — 5-tweet thread, hook → explanation → CTA

Use this topic as the format and tone reference for all future content.
