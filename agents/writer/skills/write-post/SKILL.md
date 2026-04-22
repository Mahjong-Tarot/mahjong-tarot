---
name: write-post
description: Reads the content calendar for the upcoming week, gathers source material, and writes all blog posts, social media content, SEO guides, and Vietnamese translation drafts for every topic in that week. Outputs everything to content/topics/ using the day-channel file naming convention.
allowed-tools: Read Write Bash Glob Grep Edit
---

# Write Post Skill

Your job is to read the content calendar, identify the upcoming week's topics, gather source material, and produce every deliverable for that week — blog posts, social media content, SEO guides, and Vietnamese translation drafts — saved to properly structured topic folders.

---

## Before You Start

Read these three files in full before doing anything else:

1. **Content calendar:** `content/content-calendar/content-calendar.md` — the weekly topics, hooks, and publish schedule
2. **Content calendar process:** `content/content-calendar/content-calendar-process.md` — the weekly rhythm, file naming conventions, and channel rules
3. **Writer style guide:** `agents/writer/context/style-guide.md` — ICP, persona, voice, ten blog styles

Do not skip this step. Do not write from memory of these files. Read them fresh every time.

---

## Step 1: Identify the Upcoming Week

Read the content calendar and find the **next week that does not yet have completed topic folders** in `content/topics/`.

Each week has three topics:

| Day | Type | Topic angle |
|-----|------|-------------|
| Monday (+ Tuesday social) | Blog + Social | **Fire Horse — shock & awe** |
| Wednesday (+ Thursday social) | Blog + Social | **Mahjong Mirror — the answer** |
| Friday | Social only | **Feel Good Friday — positive challenge** |

Note for each topic:
- The **folder slug** from the calendar — format is `<YYYY-MM-DD>-<type>-<topic>` where type is `horse` / `mirror` / `feel-good` and date is the publish date (see `content/content-calendar/content-calendar-process.md` → Folder Naming Convention for the full rule)
- The **slug** — the semantic URL slug for the published post (different from the folder slug). You decide this and write it to each blog markdown's frontmatter as `slug:`. Keep it descriptive for SEO (e.g. `how-to-know-if-this-is-the-year-for-you-to-take-a-financial-risk`)
- The **angle** (Fire Horse, Mahjong Mirror, or Feel Good Friday)
- The **hooks** for each day and channel
- Any **chapter/tile focus** noted in the calendar

---

## Step 2: Gather Source Material

For each topic in the week:

1. **Scan `content/source-material/`** — list all subfolders and identify which ones are relevant. Read every relevant `.md` and `.txt` file in full.
2. **Check the content calendar hooks** — the calendar provides specific hooks and angles for each day. These are your creative brief.
3. **Collect all raw material** before writing. You need Bill's voice, his anecdotes, tile references, sign-by-sign details, historical facts — the full picture before you structure anything.

If source material is thin or missing for a topic, **stop and report** what you found. Do not invent astrology content, tile meanings, or sign-specific guidance that isn't grounded in the source material or Bill's established knowledge.

---

## Blog URL Convention for Social Posts

Every social post that links to a blog post must use the full URL. The blog URL pattern is:

```
https://www.mahjong-tarot.com/blog/posts/<slug>
```

Where `<slug>` is the semantic URL slug you defined in the blog markdown's frontmatter (NOT the folder name). Folder names follow `<YYYY-MM-DD>-<type>-<topic>` for organization; URL slugs stay descriptive for SEO. Use this URL in all Facebook CTAs and as the `[blog link]` placeholder in all social files. For Instagram, use "Link in bio" as the CTA (Instagram doesn't support clickable links in captions).

**Monday blog URL:** `https://www.mahjong-tarot.com/blog/posts/<monday-slug>`
**Wednesday blog URL:** `https://www.mahjong-tarot.com/blog/posts/<wednesday-slug>`
**Friday blog URL:** `https://www.mahjong-tarot.com/blog/posts/<friday-slug>`

---

## Step 3: Write the Monday Topic (Fire Horse)

The Monday topic is the provocative, shock-and-awe angle. It publishes as a blog on Monday with social content on Monday and Tuesday.

### 3a. Choose the blog style

Select a style from the ten styles in the writer style guide that:
- Fits the **Fire Horse angle** naturally (Provocation, Prediction, Historical Deep Dive, and Myth Buster tend to work well for Fire Horse topics)
- Has **not been used in the last 3 weeks** (check existing topic folders)
- **Creates variety** in recent tone

### 3b. Write `blog-fire-horse.md`

Write the full blog post following:
- The **selected blog style** structure from the writer style guide
- **Bill's voice** as defined in the writer style guide (Parts 2-3)
- The **universal blog post rules** from Part 4 of the writer style guide
- The **hook from the content calendar** as your starting point

Required elements:
- **Title:** Provocative and specific. Should work as a social media headline.
- **Category:** Choose from: Mahjong and Tarot, Tarot, Mahjong Readings, Year of the Snake, Year of the Fire Horse, Blood Moon
- **Author:** Bill Hajdu
- **Date:** The Monday publish date from the calendar
- **Read time:** Calculate at ~250 words per minute, round to nearest minute
- **Excerpt:** 1-2 sentences (~25-35 words) for the blog index card. A hook, not a summary.
- **Body:** Full post following the selected style. Word count within the style's specified range.

**CTA:** Monday blogs end with a Reading CTA — link to `/readings`. Can include a secondary Book CTA if natural.

### 3c. Write `seo-fire-horse.md`

Generate the SEO guide for the Monday blog:

```markdown
# SEO Guide: [Post Title]

## Target Keyword
[Primary keyword phrase]

## Secondary Keywords
[3-5 related keyword phrases]

## Meta Title
[60 characters max, includes primary keyword]

## Meta Description
[155 characters max, compelling, includes primary keyword]

## URL Slug
[The topic slug]

## Header Structure
[H1 and all H2s from the blog post]

## Internal Links
[3-5 internal links to other mahjong-tarot.com pages with anchor text]

## External Links
[2-3 external links to authoritative sources]

## FAQ Schema
[3-5 questions and direct answers for FAQPage structured data]

## Image Alt Text
[Alt text for hero image and any inline images]

## AI Search Optimization
[Entity definitions, direct answers, headers optimized for LLM extraction]
```

### 3d. Write Monday social content

**`mon-facebook-en.md`**
- 100-200 words
- Use the Monday Facebook hook from the calendar as your starting point
- Personal and conversational — Bill talking to friends
- CTA with the full Monday blog URL (see Blog URL Convention above)
- Include a question to drive comments where natural

**`mon-facebook-vn.md`**
- Vietnamese translation of the English Facebook post
- Translate naturally, not word-for-word. Adapt idioms and cultural references.
- Keep the same structure and CTA intent

**`mon-instagram.md`**
- 80-150 words (caption length)
- Use the Monday Instagram hook from the calendar
- Hook line first (must grab attention before "...more")
- Ends with CTA: "Link in bio" or "DM me for a reading"
- Include 10-15 suggested hashtags
- **Image spec:** Suggest a specific image concept (1080x1080 or 1080x1350)

### 3e. Write Tuesday social content (continues Monday's topic)

**`tue-facebook-en.md`**
- 100-200 words
- Use the Tuesday Facebook hook from the calendar
- Deepens Monday's angle — adds a new perspective or personal story
- CTA with the full Monday blog URL

**`tue-facebook-vn.md`**
- Vietnamese translation of Tuesday's English Facebook post

**`tue-instagram.md`**
- 80-150 words
- Use the Tuesday Instagram hook from the calendar
- Fresh angle on Monday's topic, not a repeat

---

## Step 4: Write the Wednesday Topic (Mahjong Mirror)

The Wednesday topic is the constructive, educational angle. It directly responds to Monday's Fire Horse topic by showing how the Mahjong Mirror framework addresses the problem Monday raised.

### 4a. Choose the blog style

Select a style that:
- Fits the **Mahjong Mirror angle** (Explainer, How-To, and Story/Parable tend to work well)
- Has **not been used in the last 3 weeks**
- **Contrasts with Monday's style** — if Monday was a Provocation, Wednesday should be an Explainer or How-To, not another Provocation

### 4b. Write `blog-mahjong-mirror.md`

Same requirements as Step 3b, but:
- The angle connects to the Mahjong Mirror book, framework, or a specific chapter/tile
- Reference the **chapter/tile focus** from the content calendar if one is specified
- Must tie back to Monday's topic — Wednesday is the answer to Monday's provocation

**CTA:** Wednesday blogs end with a Book CTA — link to `/the-mahjong-mirror`. Can include a secondary Reading CTA if natural.

### 4c. Write `seo-mahjong-mirror.md`

Same format as Step 3c, for the Wednesday blog.

### 4d. Write Wednesday social content

**`wed-facebook-en.md`** — Use the Wednesday Facebook hook from the calendar
**`wed-facebook-vn.md`** — Vietnamese translation
**`wed-instagram.md`** — Use the Wednesday Instagram hook

Same specs as Monday social content.

### 4e. Write Thursday social content (continues Wednesday's topic)

**`thu-facebook-en.md`** — Use the Thursday Facebook hook from the calendar
**`thu-facebook-vn.md`** — Vietnamese translation
**`thu-instagram.md`** — Use the Thursday Instagram hook

Same specs as Tuesday social content — deepens Wednesday's angle.

---

## Step 5: Write the Friday Topic (Feel Good Friday)

The Friday topic is the warm, positive wrap-up. It includes a blog post AND social content. The tone is encouraging, actionable, and uplifting. It ties Monday and Wednesday together and prompts the reader to do something constructive over the weekend.

### 5a. Choose the blog style

Select a style that fits the Feel Good Friday tone. **Story/Parable**, **How-To**, and **Manifesto** work well for Friday. The style should contrast with Monday and Wednesday — if the week has been heavy, Friday should feel like a release.

### 5b. Write `blog-feel-good-friday.md`

Write the full blog post following:
- The **selected blog style** structure from the writer style guide
- **Bill's voice** — but at his warmest and most encouraging
- The **Friday hook from the content calendar** as your starting point
- Must tie the week together — reference both Monday's provocation and Wednesday's framework

Required elements:
- **Title:** Start with "Feel Good Friday:" followed by a warm, aspirational headline
- **Category:** Choose the most fitting category
- **Author:** Bill Hajdu
- **Date:** The Friday publish date from the calendar
- **Read time:** Calculate at ~250 words per minute
- **Excerpt:** 1-2 sentences, warm and inviting
- **Body:** Full post. Word count within the selected style's range.

**CTA:** Soft and encouraging — a weekend challenge or reflective prompt. Secondary link to `/readings` or `/the-mahjong-mirror` (whichever ties more naturally to the week's theme).

### 5c. Write `seo-feel-good-friday.md`

Same SEO guide format as Steps 3c and 4c, for the Friday blog.

### 5d. Write Friday social content

**`fri-facebook-en.md`**
- 100-200 words
- Use the Friday Facebook hook from the calendar
- Warm, positive, actionable — a challenge or prompt for the weekend
- CTA: soft, encouraging. "What's yours?" or "Drop it in the comments."

**`fri-facebook-vn.md`**
- Vietnamese translation

**`fri-instagram.md`**
- 80-150 words
- Use the Friday Instagram hook from the calendar
- Punchy, aspirational, ends on an uplifting note
- Include 10-15 suggested hashtags
- **Image spec:** Suggest a specific image concept

---

## Step 6: Create Topic Folders and Save All Files

### 6a. Create one folder per topic

```
content/topics/<YYYY-MM-DD>-horse-<topic>/      # Monday Fire Horse post
content/topics/<YYYY-MM-DD>-mirror-<topic>/     # Wednesday Mahjong Mirror post
content/topics/<YYYY-MM-DD>-feel-good-<topic>/  # Friday Feel Good Friday post
```

Folder name = publish date + angle type + short topic keyword. See `content/content-calendar/content-calendar-process.md` → Folder Naming Convention.

**Examples:**
- `content/topics/2026-04-20-horse-money/`
- `content/topics/2026-04-22-mirror-money/`
- `content/topics/2026-04-24-feel-good-money/`

### 6b. Save files to the correct folders

**Monday/Tuesday topic folder (Fire Horse):**
```
content/topics/<monday-slug>/
├── blog-fire-horse.md
├── seo-fire-horse.md
├── mon-facebook-en.md
├── mon-facebook-vn.md
├── mon-instagram.md
├── tue-facebook-en.md
├── tue-facebook-vn.md
└── tue-instagram.md
```

**Wednesday/Thursday topic folder (Mahjong Mirror):**
```
content/topics/<wednesday-slug>/
├── blog-mahjong-mirror.md
├── seo-mahjong-mirror.md
├── wed-facebook-en.md
├── wed-facebook-vn.md
├── wed-instagram.md
├── thu-facebook-en.md
├── thu-facebook-vn.md
└── thu-instagram.md
```

**Friday topic folder (Feel Good Friday):**
```
content/topics/<friday-slug>/
├── blog-feel-good-friday.md
├── seo-feel-good-friday.md
├── fri-facebook-en.md
├── fri-facebook-vn.md
└── fri-instagram.md
```

---

## Step 7: Write `image-prompts.json` for every topic

You own the creative brief for images — not the designer. You've just written every word of the blog and social posts, so you know the emotional core, the specific phrases, and the scenes better than anyone. Write one image prompt per content file (skip `seo-*.md`) and save them as `content/topics/<folder>/image-prompts.json`.

### 7a. Read the designer's style guide

Read `agents/designer/context/style-guide.md` in full. It defines:
- Brand palette (plain English color names to cite in prompts)
- Image style categories (HUMAN / TEXT / SCENE) — mix styles, never repeat within one topic
- Non-negotiables (no text *in* images, no generic stock, women don't face camera directly)

### 7b. Extract the visual brief from your own writing

For each topic, write down (in your head or scratch):
- **What the post is actually about** — the real-world topic (weddings, career change, finances) — not "mahjong"
- **3–5 short phrases** from your blog that are card-worthy text lines (punchy, quotable, perfect English). These get used as the `text` field for TEXT-style images. Examples: "Know yourself first." / "Balance over heat."
- **3–4 scenes of real people doing the topic** — a bride fixing her veil, a woman at a cafe opening a financial app, a man staring at his email inbox. These feed HUMAN-style prompts.

### 7c. Assign a style to each file and write the prompt

For each content file in the topic, pick ONE `image_style` (HUMAN / TEXT / SCENE) such that no two files in the same topic share a style. Aspect ratios:
- `blog-*` and `*-facebook-*` → 16:9 (1200×630)
- `*-instagram*` → 1:1 (1080×1080)

**Mahjong Mirror cards — Wednesday only.** The Mahjong Mirror deck lives in `agents/designer/context/mahjong-cards/` (Guardian, Honor, Suit categories). You may reference a card ONLY in `wed-*.md` files, and only when the blog naturally references it. Never force cards into Monday/Tuesday/Thursday/Friday imagery.

**Every prompt must end with:** `No watermarks or Western zodiac imagery anywhere in the image.`

### 7d. Save the JSON

Save to `content/topics/<folder>/image-prompts.json` with this structure:

```json
{
  "topic": "<what the post is actually about — one sentence>",
  "phrases": ["<phrase 1>", "<phrase 2>", "..."],
  "images": [
    {
      "file": "<content-file.md>",
      "slug": "<url-slug from the blog frontmatter>",
      "content_type": "<filename without .md>",
      "concept": "<what this image shows and why>",
      "image_style": "HUMAN | TEXT | SCENE",
      "text": "<exact phrase — only for TEXT style, omit otherwise>",
      "card": "<card name and category — only for Wednesday card references, omit otherwise>",
      "aspect_ratio": "16:9 | 1:1",
      "dimensions": "1200x630 | 1080x1080",
      "prompt": "<full prompt>"
    }
  ]
}
```

The designer will read this file, validate it, and call the Gemini API to generate images. The designer will NOT rewrite your prompts — they're yours.

---

## Step 8: Em dash sweep (MANDATORY)

Before moving on, scan every file you wrote in this run for em dashes (`—`, U+2014). This is a hard rule from the writer style guide — em dashes are banned in Bill's voice.

```bash
# From repo root. Lists every file + line that still has an em dash.
grep -rn "—" content/topics/<each-folder-you-wrote>/ || echo "clean"
```

For every hit, rewrite the sentence using a period, colon, comma, parentheses, or a full rewrite (see the writer style guide, Part 3, "Punctuation — NO EM DASHES"). Do NOT simply replace `—` with `-` or `,` blindly: pick the punctuation that actually fits the sentence, and rewrite if none do.

Re-run the grep after edits. Only proceed to Step 9 when every folder returns `clean`.

This sweep applies to: `blog-*.md`, `seo-*.md`, every social file (EN and VN), and `image-prompts.json` (the `concept` and `prompt` fields). VN translations in particular tend to carry em dashes over from English — strip them.

---

## Step 9: Update the Topic Index

Add a row for each blog post to the SEO table in `content/topics/INDEX.md`. Group by week. Each row contains:

```
| Title | Primary Keyword | SEO Description | Internal Links | External Links |
```

Pull these values directly from the SEO guide files you wrote in earlier steps.

---

## Step 10: Update the Content Calendar Status

In `content/content-calendar/content-calendar.md`, append `— STATUS: WRITTEN` to each topic line for the week you just processed. For example:

```
**Topic: some-topic-folder** — STATUS: WRITTEN
```

---

## Step 11: Notify and confirm

Send notifications to the Labs Lark group and all members via email, then report back.

```bash
# Load env vars
_ENV_FILE=$([ -f .env.local ] && echo .env.local || echo .env)
RESEND_FROM=$(grep 'RESEND_FROM' "$_ENV_FILE" | cut -d= -f2- | tr -d '"')
RESEND_TO=$(grep 'RESEND_TO' "$_ENV_FILE" | cut -d= -f2- | tr -d '"')
RESEND_API_KEY=$(grep 'RESEND_API_KEY' "$_ENV_FILE" | cut -d= -f2- | tr -d '"')
LABS_CHAT="oc_e5fe68740864439744b3fb0f31f81040"

LARK_MSG="✍️ Writer done — Week of <monday-date>
• <fire-horse-title>
• <mahjong-mirror-title>
• <feel-good-friday-title>
Review blog posts and image-prompts.json in content/topics/ before designer generates images."

EMAIL_SUBJECT="[Writer] Done — Week of <monday-date>"
EMAIL_BODY="Writer has completed all content for the week of <monday-date>.

Posts written:
• <fire-horse-title>  →  content/topics/<monday-slug>/blog-fire-horse.md
• <mahjong-mirror-title>  →  content/topics/<wednesday-slug>/blog-mahjong-mirror.md
• <feel-good-friday-title>  →  content/topics/<friday-slug>/blog-feel-good-friday.md

Review each blog post and each image-prompts.json. The designer will generate images from those prompts next.
If you want to adjust the content or prompts before images are generated, edit the files now."

lark-cli im +messages-send --chat-id "$LABS_CHAT" --as bot --text "$LARK_MSG" 2>/dev/null || true

RESEND_API_KEY="$RESEND_API_KEY" resend emails send \
  --from "$RESEND_FROM" \
  --to $(echo "$RESEND_TO" | tr ',' ' ') \
  --subject "$EMAIL_SUBJECT" \
  --text "$EMAIL_BODY" 2>/dev/null || true
```

Then report back with:

1. **Week processed:** which week from the calendar (dates)
2. **Topics created:** list of topic folders and their slugs
3. **Monday blog:** title, blog style, word count, read time, category, excerpt
4. **Wednesday blog:** title, blog style, word count, read time, category, excerpt
5. **Friday blog:** title, blog style, word count, read time, category, excerpt
6. **Social files created:** full list per topic folder
7. **Source material used:** which files from `content/source-material/` were read
8. **Anything flagged:** missing source material, thin content, translation notes, or decisions needing human review
