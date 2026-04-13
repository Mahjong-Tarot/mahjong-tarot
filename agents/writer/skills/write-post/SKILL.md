---
name: write-post
description: Writes a complete blog post package from source material - blog draft, social media variants, SEO guide, and social handoff brief. Reads source material from content/source-material/, selects a blog style by checking the blogindex for rotation, writes all outputs, and saves everything to a new topic folder in content/topics/. Use this skill whenever a new blog post needs to be written from a topic or source material.
allowed-tools: Read Write Bash Glob Grep Edit
---

# Write Post Skill

Your job is to take a topic and its source material, write a complete blog post in Bill Hajdu's voice, generate social media content, produce an SEO guide, create a social handoff brief, and save everything to a properly structured topic folder.

---

## Before You Start

Read these two files in full before doing anything else:

1. **Blog index:** `context/blogindex.md` - existing posts, keywords taken, styles used, next Order number
2. **Writer style guide:** `agents/writer/context/style-guide.md` - ICP, persona, voice, blog styles

Do not skip this step. Do not write from memory of these files. Read them fresh every time.

---

## Step 1: Gather Source Material

Based on the topic you've been given:

1. **Scan `content/source-material/`** - list all subfolders and identify which ones are relevant to the topic. Read every relevant file (`.md`, `.txt`) in full.
2. **Check `content/topics/`** - see if there are existing topic folders with related content (`.docx` summaries, prior drafts) that provide context or material to build on. Read what's useful.
3. **Collect all raw material** before writing. You need the full picture - Bill's voice, his specific anecdotes, tile references, sign-by-sign details, historical facts - before you structure anything.

If the source material is thin or missing for the requested topic, stop and report what you found. Do not invent astrology content, tile meanings, or sign-specific guidance that isn't grounded in the source material or Bill's established knowledge.

---

## Step 2: Determine Slug, Keyword, and Blog Style

### 2a. Read the blog index

Read `context/blogindex.md`. Note:
- The **next Order number** (increment from the highest existing Order)
- Which **primary keywords** are already taken (you must not duplicate or cannibalize)
- Which **blog styles** have been used recently (aim for variety)

### 2b. Generate the slug

Create a kebab-case slug that:
- Is concise and keyword-rich
- Matches the naming conventions of existing slugs in the blogindex
- Will be used as the topic folder name, the `.jsx` filename, and the hero image filename

### 2c. Choose the primary keyword

Select a primary keyword phrase that:
- Someone would Google to find this post
- Does **not** conflict with any existing primary keyword in the blogindex
- Is specific enough to own (not a broad generic term)

### 2d. Select the blog style

Choose a style from the ten styles in the writer style guide that:
- Has **not been used in the last 3 posts** (check the blogindex)
- **Fits the source material** naturally (don't force a Listicle if the material is a deep narrative)
- **Creates variety** in the blog's recent tone - if recent posts have been heavy/fear-driven, lean toward an Explainer or How-To; if they've been educational, lean toward a Provocation or Story

If the source material strongly suggests a specific style even though it was used recently, that's acceptable - but note the style debt and flag it so the next post compensates.

### 2e. Document the choices

At the top of the blog draft, include a comment block:

```
<!-- 
Slug: [slug]
Primary Keyword: [keyword]
Blog Style: [Selected style]
Reason: [Why this style, what it follows, what it balances]
-->
```

---

## Step 3: Write the SEO Guide

Generate `seo.md` - a reference file for optimizing the blog post and its promotion.

### Contents of seo.md

```markdown
# SEO Guide: [Post Title]

## Target Keyword
[Primary keyword phrase - must not conflict with any existing primary keyword in context/blogindex.md]

## Secondary Keywords
[3-5 related keyword phrases]

## Meta Title
[60 characters max - optimized for search, includes primary keyword]

## Meta Description
[155 characters max - compelling, includes primary keyword]

## URL Slug
[The slug chosen in Step 2]

## Header Structure
[List the H1 and all H2s from the blog post - confirm they include keywords naturally]

## Internal Links
[Suggest 3-5 internal links to other pages on mahjong-tarot.com that should be linked from this post, and which anchor text to use. Prioritize links to other blog posts.]

## External Links
[Suggest 2-3 external links to authoritative sources (Wikipedia, established references). Include target="_blank" note.]

## FAQ Schema
[3-5 questions and direct answers for FAQPage structured data. These should be questions someone would ask a search engine about this topic. Answers should be complete sentences that AI search engines can extract.]

## Image Alt Text
[Suggested alt text for the hero image and any inline images - descriptive, keyword-aware]

## AI Search Optimization
[Clear entity definitions, direct answers to likely queries, headers optimized for LLM extraction (Perplexity, ChatGPT search, Google AI Overviews)]

## Social Sharing Notes
[Any additional notes on timing, audience targeting, or platform-specific tips for promoting this post]
```

---

## Step 4: Write the Blog Post

Write the full blog post as a markdown file following:

- The **selected blog style** structure from the writer style guide
- **Bill's voice** as defined in the writer style guide (Parts 2-3)
- The **universal blog post rules** from Part 4 of the writer style guide
- The **target audience** defined in Part 1 of the writer style guide
- Use the SEO Guide and optimize accordingly
- Optimize for AI search
- Add 3-5 internal and/or external links

### Required elements

- **Title:** Provocative and specific. No generic titles. Should work as a social media headline on its own.
- **Category:** Read the target website's site-config.md in `/Users/davepro/Documents/Code Projects/web-developer/{project}/context/site-config.md` to get the valid category list. Pick one or more that fit. Do not invent categories.
- **Author:** Bill Hajdu
- **Date:** The target publish date (provided or use today's date)
- **Read time:** Calculate at ~250 words per minute, round to nearest minute.
- **Excerpt:** 1-2 sentences (~25-35 words) for the blog index card. This is a hook, not a summary.
- **Body:** Full post following the selected style's structure. Word count within the style's specified range.

### CTA rules

Every post ends with a call to action. Choose based on topic fit:

**Reading CTA** - Use when the post is about personal decisions, relationships, sign-specific guidance, or anything where "what does this mean for me?" is the natural next question.
> Pattern: [Insight about what a reading reveals] + [Link to /readings]

**Book CTA** - Use when the post is about the Mahjong Mirror as a concept, decision-making frameworks, or the broader system behind Bill's practice.
> Pattern: [Insight about the Mahjong Mirror framework] + [Link to /the-mahjong-mirror]

A post can include both if natural, but lead with whichever fits the content more closely. The CTA must feel like the logical next step - not an ad bolted onto the end.

Save the blog post as `blog.md` inside the topic folder (see Step 6 for folder creation).

---

## Step 5: Write Social Media Content

Generate social media variants derived from the blog post. Each should be self-contained and work without reading the full post.

### 5a. `social-instagram.md`

- 1 post, 80-150 words (caption length)
- Hook line first (must grab attention in the first line before "...more")
- Conversational, slightly more casual than the blog
- Ends with a CTA: "Link in bio" or "DM me for a reading"
- Include 10-15 suggested hashtags (mix of niche and broad)
- **Image spec:** 1080x1080px square or 1080x1350px portrait. Suggest a specific image concept (not just "use the hero image").

### 5b. `social-facebook.md`

- 1 post, 100-200 words
- Personal and conversational
- Can include a question to drive comments ("What's your sign? Drop it below.")
- CTA to the blog post
- Tone: Bill talking to friends and followers, warm and accessible
- **Image spec:** 1200x630px landscape. Can reuse blog OG image or suggest alternative.

### 5c. `social-x.md` (Twitter/X)

- 3-5 standalone tweets that could be posted as a thread or individually
- Each tweet: max 280 characters
- First tweet is the hook - most provocative standalone line
- Last tweet includes a CTA and link placeholder: `[blog link]`
- Tone: sharp, direct, punchy. Bill at his most compressed.

### 5d. `social-linkedin.md`

- 1 post, 150-250 words
- Opens with a hook line (the most provocative or surprising sentence from the blog)
- 2-3 short paragraphs that deliver value on their own
- Ends with a soft CTA pointing to the blog post: "Full post on the blog" or "Link in comments"
- Tone: professional but warm. Bill's voice, adapted for LinkedIn's audience.
- Include 3-5 suggested hashtags at the bottom

---

## Step 6: Write the Social Handoff Brief

Generate `social-brief.md` - a consolidated handoff document for the social media manager (human or agent).

### Contents of social-brief.md

```markdown
# Social Brief: [Post Title]

## Blog Publish Date
[YYYY-MM-DD]

## Platform Priority
1. [Highest priority platform and why]
2. [Second priority]
3. [Third priority]
4. [Fourth priority]

## Suggested Cadence
- **X:** Same day as blog publish (thread format)
- **Instagram:** Day of or next day
- **Facebook:** 24-48h after publish
- **LinkedIn:** 48-72h after publish

## Image Assets
- OG/Hero: [filename or "needs generation"]
- Instagram: [specific image concept, 1080x1080 or 1080x1350]
- Facebook: [filename or "use OG image"]

## Audience Notes
[Any platform-specific audience considerations - e.g. "LinkedIn audience skews professional, lead with the business insight angle not the astrology angle"]

## Approval Status
- [ ] Blog approved
- [ ] Social copy approved
- [ ] Images confirmed
```

---

## Step 7: Create the Output Folder and Save All Files

### 7a. Create the topic folder

Create a new folder in `content/topics/` using the slug as the folder name:

```
content/topics/<slug>/
```

The slug must match what was chosen in Step 2 and recorded in the blogindex.

### 7b. Save all files to the folder

```
content/topics/<slug>/
├── blog.md                  <- The full blog post
├── seo.md                   <- SEO optimization guide
├── social-instagram.md      <- Instagram caption
├── social-facebook.md       <- Facebook post
├── social-x.md              <- Twitter/X thread
├── social-linkedin.md       <- LinkedIn post
└── social-brief.md          <- Handoff brief for SM manager
```

---

## Step 8: Update the Blog Index

Add a new row to the Posts table in `context/blogindex.md`:

```
| [Order] | [slug] | [primary keyword] | [blog style] | [category] | [YYYY-MM-DD] |
```

Use the Order, slug, keyword, style, and category determined in Step 2. Date is the publish date.

---

## Step 9: Confirm

Report back with:

1. **Topic folder created:** full path
2. **Slug:** the slug chosen
3. **Blog style selected:** which style and why
4. **Primary keyword:** the keyword chosen and confirmation it doesn't conflict
5. **Blog post:** title, word count, read time, category, excerpt
6. **Social media files:** list of files created
7. **Social brief:** platform priority and cadence summary
8. **SEO guide:** primary keyword, meta title, FAQ questions
9. **Blog index updated:** the row added
10. **Source material used:** which files from `content/source-material/` and `content/topics/` were read
11. **Anything flagged:** missing source material, thin content areas, or decisions that need human review
