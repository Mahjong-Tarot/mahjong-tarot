# Content Calendar — Monthly Process

## Overview

This document defines the repeating weekly content rhythm and the process for planning each month's content calendar. The actual topics and hooks are defined in a separate monthly calendar file (e.g., `content-calendar-2026-04.md`).

---

## Weekly Rhythm

Each week follows a five-day publishing cycle across three channels.

| Day | Type | Content |
|-----|------|---------|
| Monday | Blog + Social | **Fire Horse — shock & awe.** Provocative, current-event style. Gets people thinking. Creates urgency. |
| Tuesday | Social only | **Continues Monday's topic.** Deepens the hook, adds a new angle or personal story. |
| Wednesday | Blog + Social | **Mahjong Mirror — the answer.** Directly responds to Monday's topic. Shows how the decision-making framework, the tiles, and the book address the problem Monday raised. |
| Thursday | Social only | **Continues Wednesday's topic.** Reinforces the Mahjong Mirror angle, builds toward the weekend challenge. |
| Friday | Blog + Social | **Feel Good Friday — positive and actionable.** Ties Monday and Wednesday together. Prompts the audience to do something constructive over the weekend. Uplifting, empowering tone. |

## Channels

| Channel | Notes |
|---------|-------|
| **Blog** | Published on the website. Monday, Wednesday, and Friday. |
| **Facebook EN** | English-language Facebook page. Every day Mon–Fri. |
| **Facebook VN** | Vietnamese translation of the English Facebook post. Every day Mon–Fri. Human-reviewed for accuracy. |
| **Instagram** | Single account. Every day Mon–Fri. |

## Content Pairing Rules

- Monday and Wednesday are a **matched pair**. Wednesday's Mahjong Mirror post must directly tie back to Monday's Fire Horse post. Monday raises the problem; Wednesday provides the path forward.
- Friday's challenge ties the **whole week** together. It should feel like a natural conclusion to the Mon–Wed arc.
- Each week can have **one or more topics**. A typical week has three: a Fire Horse topic (Mon/Tue), a Mahjong Mirror topic (Wed/Thu), and a Friday challenge topic (Fri).
- Each topic gets its own folder under `content/topics/[topic-slug]/`.

## Topic Folder Convention

```
content/topics/[topic-slug]/
├── blog-fire-horse.md          # Monday blog (if applicable)
├── blog-mahjong-mirror.md      # Wednesday blog (if applicable)
├── seo-fire-horse.md           # SEO for Monday blog
├── seo-mahjong-mirror.md       # SEO for Wednesday blog
├── mon-facebook-en.md          # Monday social
├── mon-facebook-vn.md
├── mon-instagram.md
├── tue-facebook-en.md          # Tuesday social
├── tue-facebook-vn.md
├── tue-instagram.md
├── wed-facebook-en.md          # Wednesday social
├── wed-facebook-vn.md
├── wed-instagram.md
├── thu-facebook-en.md          # Thursday social
├── thu-facebook-vn.md
├── thu-instagram.md
├── blog-feel-good-friday.md    # Friday blog
├── seo-feel-good-friday.md     # SEO for Friday blog
├── fri-facebook-en.md          # Friday social
├── fri-facebook-vn.md
├── fri-instagram.md
```

Not every topic will have all files. A Fire Horse topic won't have `blog-mahjong-mirror.md`. The topic folder contains only the deliverables the content calendar assigns to it.

## File Naming Convention

- **Blogs:** `blog-[angle].md` — e.g., `blog-fire-horse.md`, `blog-mahjong-mirror.md`
- **SEO:** `seo-[angle].md` — matches the blog it supports
- **Social:** `[day]-[channel].md` — e.g., `mon-facebook-en.md`, `thu-instagram.md`
- **Vietnamese posts** are translations of the corresponding English Facebook post

## Monthly Planning Process

### 1. Choose the Month's Themes

Before the month begins, decide on the weekly themes. Each week needs:

- A **Fire Horse angle** — provocative, shock-and-awe, tied to the Year of the Fire Horse
- A **Mahjong Mirror angle** — the constructive response, tied to the book's framework, a specific chapter, or a tile/card concept
- A **Friday challenge** — positive action that ties both together

Themes can draw from:
- The Mahjong Mirror book chapters (Central Theme, Know Thyself, Opposition, The Future, specific cards)
- Purple Star Astrology concepts (traveling star, career palaces, sign compatibility)
- Current events or seasonal hooks
- Source material in `content/source-material/`
- Quora answers, reader questions, or real reading stories

### 2. Update the Content Calendar

There is ONE content calendar file: `content/content-calendar/content-calendar.md`. Never create separate monthly files — update this single file in place by adding new weeks at the bottom.

Each week needs:
- A row for every publish date
- The channel for each row
- A short hook describing the content

The calendar is the single source of truth the writer agent checks on Friday.

### 3. Prepare Source Material

For each week's themes, ensure relevant source material is placed in `content/source-material/` under the appropriate subject folder. The writer agent pulls from these when producing content.

### 4. Writer Agent Runs on Tuesday

Every Tuesday, the writer agent:

1. Reads the content calendar for the following week (Monday through Friday)
2. Pulls source material for each topic
3. Creates topic folders and writes all deliverables
4. Produces a completion report

### 5. Image Designer Runs After Writing

Once a topic is marked `STATUS: WRITTEN`, the image designer agent can be invoked (`@image-designer`). It:

1. Reads the content calendar and finds all WRITTEN topics
2. Plans unique images for every content file (excluding SEO) — writes prompts to `content/topics/<slug>/image-prompts.md`
3. Generates all images in parallel using the Gemini API
4. Saves images to `content/topics/<slug>/` — one unique image per content file
5. Updates the content calendar status from `WRITTEN` → `DESIGNED`

**Weekly target:** 18 unique images (3 topics × ~6 content files each). Every image is visually distinct — no duplicates, no sharing between posts.

The image designer never publishes. Images sit in the topic folder for human review.

### 6. Human Review (Wed–Sat)

Humans review all content and images, with special attention to:

- Vietnamese translations for accuracy
- Blog tone and voice (must sound like Bill / the Firepig)
- Factual accuracy on astrology concepts
- Friday challenge tone (must be positive and actionable, not preachy)

### 7. Web Developer Publishes (Wednesday)

The web developer picks up approved content on Wednesday and publishes according to the calendar schedule.

---

## Voice and Tone

- **Author:** Bill Hajdu / the Firepig
- **Blog voice:** First person, authoritative, experienced, conversational. 35+ years of practice. Not academic, not mystical — practical and grounded.
- **Monday tone:** Provocative, urgent, eye-opening. "Here's what's really happening."
- **Wednesday tone:** Constructive, educational, empowering. "Here's what you can do about it."
- **Friday tone:** Warm, encouraging, actionable. "Here's your challenge."
- **Social voice:** Slightly more casual than the blog. Facebook can run longer and more conversational. Instagram is punchy and visual. Vietnamese posts are translations, not rewrites.

## CTAs

Every Monday blog should end with:
- **Primary:** Link to `/readings` for a personal Mahjong tile reading
- **Secondary:** Link to `/the-mahjong-mirror` for the book

Every Wednesday blog should end with:
- **Primary:** Link to `/the-mahjong-mirror` for the book (since Wednesday is the Mahjong Mirror angle)
- **Secondary:** Link to `/readings`

Every Friday blog should end with:
- **Primary:** Soft CTA — a weekend challenge or reflective prompt
- **Secondary:** Link to `/readings` or `/the-mahjong-mirror` (whichever ties more naturally to the week's theme)
