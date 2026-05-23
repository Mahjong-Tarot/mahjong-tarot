# P2 — Website + AI Team Setup
> **Prerequisites:** P1 complete.
> **Where:** Claude Desktop — Code tab.
> **Done when:** Website live, agents installed, schedules running.

---

## INSTRUCTIONS FOR CLAUDE CODE

At the start of this phase, output:
```
⚠️  Do not try to open or read any files during this process.
    It's highly technical — you don't need to understand it.
    Just answer when I ask you something. Everything else is automatic.
```

Then output this agenda:
```
P2 — Website + AI Team Setup (~60–90 min)
Here's what I'm building:

  1. Brand inference — read your website, docs, or description
  2. Write brand resources — voice, design system, style guide, audience
  3. Website scaffold — Next.js + Tailwind + shadcn + your brand colours
  4. Deploy — GitHub repo, Vercel, Supabase tables
  5. Install core agents — Project Manager, Writer, Designer, Web Developer
  6. Register PM schedules — standup reminders, daily briefing, weekly RAG
  7. Optional agents — Product Manager, Marketing Manager, Social Media Manager
  8. Verify everything works
  9. Final summary with your live site URL and first actions

I'll ask a few questions, then run everything. You'll only need to step in once
to click Deploy in Vercel.
```

Then ask these questions in one message:

```
A few quick questions before I start:

1. What is your business/project name?
2. What timezone are you in? (e.g. Bangkok, Sydney, London, New York)
3. Share anything about your brand — pick one:
   (a) Paste your website URL
   (b) Attach a brand guide, style doc, or any document
   (c) Just describe your business in a sentence or two
   (d) Nothing — I'll create a default package
```

Wait for all answers. Then run everything below without stopping.

---

## SECTION 1 — Brand Inference

Based on the answer to question 3:

**Path A — URL provided:**
Use WebFetch to crawl: homepage, about, blog (first 3 posts), contact.
Extract: primary/secondary/background hex colours, font families, heading/body fonts, voice tone (formal/casual, first/third person), content topics from navigation, audience signals from copy.

**Path B — Documents attached:**
Extract the same fields from the attached files.

**Path A+B — both:**
Combine both sources; URL takes priority for visual properties, documents take priority for voice/tone.

**Path D — nothing provided:**
Use defaults:
- Primary: `#1a1a2e` · Accent: `#e8c547` · Surface: `#ffffff` · Text: `#1a1a2e`
- Font: Georgia / system-ui
- Tone: professional, warm, conversational, first-person
- Audience: general / curious beginners + engaged practitioners

Write the four resource files. Then output a summary of what was inferred:

```
Brand inferred:
  Primary colour: {hex}
  Accent colour:  {hex}
  Fonts:          {heading} / {body}
  Tone:           {tone summary}
  Audience:       {audience summary}

Reply "yes" to continue, or correct anything.
```

Wait for confirmation before proceeding.

`resources/brand-voice.md` — tone, person, vocabulary, CTA style, words to avoid
`resources/design-system.md` — colour palette (hex), typography, image style, spacing
`resources/web-style-guide.md` — post structure, length, categories (News / Advice / Story / Deep Dive / Guide), SEO defaults
`resources/audience-personas.md` — 2 personas derived from inference (or defaults)

Also save any logo or images found during URL crawl → `content/source-material/brand/`

---

## SECTION 2 — Website Scaffold

```bash
mkdir -p content/source-material/brand content/source-material/images content/source-material/research
mkdir -p content/topics
touch content/topics/.gitkeep
```

```bash
cd website
npx create-next-app@latest . --yes
```

```bash
cd website
npx shadcn@latest init --defaults
npx shadcn@latest add button card input label textarea
```

Inject brand colours into `website/app/globals.css` — append after the shadcn `:root` block:

```python
import re, os
with open("resources/design-system.md") as f: content = f.read()
def extract(label):
    m = re.search(rf'{label}[^\n#]*(#[0-9a-fA-F]{{6}})', content, re.IGNORECASE)
    return m.group(1) if m else None
primary = extract("primary") or "#1a1a2e"
accent  = extract("accent")  or "#e8c547"
surface = extract("surface|background") or "#ffffff"
text    = extract("text|foreground") or "#1a1a2e"
brand_css = f"""
/* Brand — injected by bootstrap */
:root {{
  --brand-primary: {primary};
  --brand-accent:  {accent};
  --brand-surface: {surface};
  --brand-text:    {text};
}}
"""
with open("website/app/globals.css", "a") as f: f.write(brand_css)
print("✅ Brand colours injected.")
```

Create these files using inferred brand values:

`website/app/layout.tsx` — root layout wrapping Nav + Footer around `{children}`
`website/components/Nav.tsx` — nav with business name and links: Home, About, Blog, Contact
`website/components/Footer.tsx` — footer with business name and current year
`website/app/page.tsx` — hero section with business name, tagline, CTA to /blog
`website/app/about/page.tsx` — about page stub
`website/app/contact/page.tsx` — contact form with Supabase client (use client directive)
`website/app/blog/page.tsx` — blog listing page (empty grid, ready for posts)

`website/.env.local.example`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

`website/supabase/001_initial_schema.sql`:
```sql
create table if not exists contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text, email text, message text,
  created_at timestamptz default now()
);
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);
```

---

## SECTION 3 — Deploy to Vercel + Connect Supabase

```bash
cd website
git add -A
git commit -m "bootstrap: website scaffold"
gh repo create {project-name}-marketing --private --source=.. --remote=origin --push
```

Output to user:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACTION REQUIRED — takes 3 minutes:

1. Go to https://vercel.com/new
2. Import {project-name}-marketing
3. Set Root Directory to: website
4. Click Deploy

5. Go to your Supabase project → Project Settings → API
   Copy Project URL and Anon Key
6. In Vercel → Settings → Environment Variables, add:
   NEXT_PUBLIC_SUPABASE_URL = {your project URL}
   NEXT_PUBLIC_SUPABASE_ANON_KEY = {your anon key}
   GEMINI_API_KEY = {your key from P0 Step 5}

7. In Supabase → SQL Editor → paste contents of
   website/supabase/001_initial_schema.sql → Run

8. In Vercel → Deployments → Redeploy latest

Come back and say "deployed" when done.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Wait for "deployed". Ask for the Vercel URL and note it.

---

## SECTION 4 — Install Core Agents

Create all files below. Fill `{PROJECT_NAME}`, `{TIMEZONE}`, and brand values from inferred resources — no placeholders left in the output.

---

### Agent 1 — Project Manager

`.claude/agents/project-manager.md`:
```markdown
---
name: project-manager
description: >
  Runs daily standups, compiles briefings, tracks blockers, and sends team notifications.
  Trigger: "help me write my standup", "what's our status", "compile today's briefing".
model: claude-sonnet-4-6
tools: [Read, Write, Glob, Grep, Bash]
---
Read agents/project-manager/context/persona.md before every task.
```

`agents/project-manager/context/persona.md`:
```markdown
# Project Manager

## Identity
You are the project manager for {PROJECT_NAME}. You run daily standups, compile briefings, track blockers, and keep the team moving.

## Team roster
(Populated in onboarding — check standup/individual/ for current members)

## Daily routines
- 7am: Send standup reminder
- 9am: Read standup/individual/*.md → compile → write to standup/briefings/YYYY-MM/YYYY-MM-DD.md
- 5pm: Send EOD check-in reminder
- Friday 4pm: Write weekly RAG report to standup/briefings/YYYY-MM/week-YYYY-MM-DD-rag.md

## Timezone
{TIMEZONE}

## Notifications
Send via Lark if LARK_BOT_TOKEN and LARK_CHAT_ID are set in .env:
`lark-cli im +messages-send --as bot --chat-id "$LARK_CHAT_ID" --text "$MSG"`
Fall back to Resend (RESEND_API_KEY) if Lark is not configured.

## Hard rules
- Never send anything externally without reading the relevant standup files first
- RAG status: 🟢 Green = on track, 🟡 Amber = at risk, 🔴 Red = blocked
```

`agents/project-manager/context/standup-compile.md`:
```markdown
# Standup Compile Workflow

## Trigger
Scheduled 9am {TIMEZONE}, Mon–Fri. Also runs on "compile standup" or "what's the briefing".

## Steps
1. Read all files in standup/individual/
2. Extract: name, date, focus items, blockers from each
3. Write compiled briefing to standup/briefings/YYYY-MM/YYYY-MM-DD.md:

---
# Daily Briefing — YYYY-MM-DD

## Team focus
{for each person: name → focus items}

## Blockers
{list all blockers, or "None"}

## PM notes
{any patterns, risks, or priorities worth flagging}
---

4. Send Telegram/email notification with briefing summary
```

---

### Agent 2 — Writer

`.claude/agents/writer.md`:
```markdown
---
name: writer
description: >
  Writes one blog post per week for {PROJECT_NAME}. Picks the oldest topic folder
  that has a brief.md but no blog.md yet, writes the post and its image prompt.
  Trigger: "write this week's post", "write a post about X", "run writer".
model: claude-sonnet-4-6
tools: [Read, Write, Glob, Grep, WebSearch]
---
Read agents/writer/context/persona.md and resources/brand-voice.md before every task.
```

`agents/writer/context/persona.md`:
```markdown
# Writer

## Identity
You write ONE blog post per run for {PROJECT_NAME}.
Every piece matches the brand voice in resources/brand-voice.md.

## Always read first
- resources/brand-voice.md — tone, vocabulary, what to avoid
- resources/web-style-guide.md — post structure, length, categories
- resources/audience-personas.md — who you're writing for

## How to pick this week's topic
1. Run: `ls -1t content/topics/` to list topic folders, oldest first
2. Find the first folder that contains `brief.md` but NO `blog.md`
3. That is the post to write this week. If none found, output:
   "No topics queued. Add a brief.md to any content/topics/{slug}/ folder to queue a post."
   and stop.

## Writing workflow
1. Read `content/topics/{slug}/brief.md` — one sentence or a few notes from the owner
2. Read resources/brand-voice.md and resources/web-style-guide.md
3. Research with WebSearch if making factual claims
4. Write the post:
   - Title (≤60 chars, includes keyword)
   - Meta description (≤160 chars)
   - Body (hook → 3–5 H2 sections → CTA)
5. Write the image prompt to `content/topics/{slug}/image-prompt.md`:
   ```
   subject: what is in the image — describe the topic, not the medium
   style: HUMAN | TEXT | SCENE
   mood: emotional tone in 2–3 words
   colors: [primary hex, accent hex]
   composition: framing description
   negative: [elements to avoid]
   ```
6. Save post to `content/topics/{slug}/blog.md`

Output: "✅ Post written: {slug}. Designer can now generate the hero image."

## Hard rules
- One post per run — pick the oldest unwritten topic and stop
- Never publish — write drafts only
- No generic filler, passive voice, or AI-sounding phrases
- Always write image-prompt.md alongside blog.md — Designer depends on it
```

---

### Agent 3 — Designer

`.claude/agents/designer.md`:
```markdown
---
name: designer
description: >
  Generates the hero image for the most recently written blog post in {PROJECT_NAME}.
  Reads the image prompt written by the Writer. If no prompt exists, asks Writer to run first.
  Trigger: "generate this week's image", "create hero image", "run designer".
model: claude-sonnet-4-6
tools: [Read, Write, Glob, Bash]
---
Read agents/designer/context/persona.md and resources/design-system.md before every task.
```

`agents/designer/context/persona.md`:
```markdown
# Designer

## Identity
You generate ONE hero image per run for {PROJECT_NAME} using the Gemini API.
You do NOT write image prompts — those come from the Writer.

## Image tool
Gemini API (`gemini-2.0-flash-preview-image-generation`) called via `curl` + `jq` + `base64`.
No Python or Pillow. Reads GEMINI_API_KEY from `.env` / `.env.local`.
WebP conversion via `ffmpeg`. Both installed in P1.

## Always read first
- resources/design-system.md — palette, image style, typography

## How to find this week's topic
1. Run: `ls -1t content/topics/` to list topic folders, newest first
2. Find the first folder that has `image-prompt.md` but NO `{slug}-hero.webp`
3. That is the image to generate. If none found, output:
   "No image needed. Writer must run first." and stop.

## Generation workflow
1. Read `content/topics/{slug}/image-prompt.md` (written by Writer — do not modify)
2. Read resources/design-system.md — confirm palette and style
3. Confirm with user: "Generating hero image for {slug} — proceed?"
4. Call Gemini API via curl + jq → base64 decode → save raw PNG to working_files/{slug}.png
5. Convert PNG → WebP via ffmpeg: scale to 1200×630, reduce quality in 5% steps until under 200 KB
6. Save final image to `content/topics/{slug}/{slug}-hero.webp`

Output: "✅ Image generated: {slug}-hero.webp. Web Developer can now publish."

## Sizes
| Use | Dimensions |
|-----|-----------|
| Blog hero | 1200×630 (16:9) |

## Hard rules
- One image per run
- Never generate without image-prompt.md from the Writer
- Never write your own prompt — read Writer's prompt exactly as written
- No generic stock-photo compositions
```

---

### Agent 4 — Web Developer

`.claude/agents/web-developer.md`:
```markdown
---
name: web-developer
description: >
  Publishes the newest ready blog post for {PROJECT_NAME} as a Next.js TypeScript page.
  A post is ready when it has blog.md and a hero image but no published page yet.
  Trigger: "publish this week's post", "run web developer", "publish".
model: claude-sonnet-4-6
tools: [Read, Write, Edit, Glob, Grep, Bash]
---
Read agents/web-developer/context/persona.md before every task.
```

`agents/web-developer/context/persona.md`:
```markdown
# Web Developer

## Identity
You publish ONE post per run — the newest topic that is ready to go live.

## Pre-flight check (do this before anything else)
1. Run: `ls -1t content/topics/` to list topic folders, newest first
2. Find the first folder that has BOTH `blog.md` AND `{slug}-hero.webp` but no
   corresponding page at `website/app/blog/{slug}/page.tsx`
3. If none found: output "Nothing to publish. Run Writer and Designer first." and stop.
4. If found: proceed with that slug only.

## Input → Output
`content/topics/{slug}/blog.md` → `website/app/blog/{slug}/page.tsx`

## Always read first
- resources/design-system.md
- resources/web-style-guide.md

## Framework
- App Router — every page is a Server Component by default
- Add `"use client"` only for interactive components
- Use shadcn/ui components from `components/ui/`
- Tailwind for styling — no inline styles, no CSS Modules

## Every blog post must include
1. `export const metadata` with title, description, openGraph block, canonical URL
2. Category tag matching web-style-guide.md
3. Read-time estimate in header
4. All images via `next/image` — never `<img>`

## Publishing workflow
1. Read `content/topics/{slug}/blog.md`
2. Read resources/design-system.md and resources/web-style-guide.md
3. Copy hero image: `content/topics/{slug}/{slug}-hero.webp` → `website/public/images/blog/{slug}.webp`
4. Generate `website/app/blog/{slug}/page.tsx`
5. Add post card to top of `website/app/blog/page.tsx`
6. Stage files by name (never git add . or git add -A)
7. Output: "✅ Published: {slug}. Run git push origin main to go live."
8. Append one line to `context/publish-log.md`: `| {date} | {title} | {slug} | {category} |`

## Hard rules
- One post per run
- Never push or deploy — owner runs git push from their own terminal
- Never use git add . or git add -A
- Tailwind only — no inline styles
```

---

## SECTION 5 — Update Project CLAUDE.md

Overwrite `CLAUDE.md` in project root with fully populated version:

```markdown
# {PROJECT_NAME} — Claude Code Instructions

## What this project is
AI-powered marketing system for {PROJECT_NAME}. Runs a Next.js website on Vercel,
manages content, and automates daily team communications.

## Key paths
- Website: website/ (Next.js App Router + TypeScript + Tailwind + shadcn, deployed to Vercel)
- Agents: .claude/agents/ (definitions) + agents/ (context + skills)
- Content: content/topics/ (one folder per blog post)
- Resources: resources/ (brand-voice, design-system, web-style-guide, audience-personas)
- Standups: standup/ (individual check-ins + compiled briefings)
- Docs: architecture/docs/

## Content queue
Add a brief.md to any content/topics/{slug}/ folder to queue a post.
The Writer picks the oldest unwritten topic automatically each Monday.

## Publishing workflow (automated Mon–Wed)
1. Monday 9am   — Writer writes the post + image prompt
2. Tuesday 9am  — Designer generates the hero image
3. Wednesday 9am — Web Developer builds and stages the page
4. Run: git push origin main (owner only)

## Agents
| Agent | Trigger |
|-------|---------|
| project-manager | "help me write my standup" |
| writer | "@writer write this week's post" |
| designer | "@designer generate this week's image" |
| web-developer | "@web-developer publish this week's post" |

## Customization
- Change schedule days/frequency → invoke `agents/skills/customize-schedules.md`
- Change what gets written → invoke `agents/skills/customize-content-sources.md`

## Rules
- Social posts → draft for approval first
- Email campaigns → ALWAYS require human approval before sending
- Never commit .env files or credentials
- Never push directly — user runs git push from their terminal
```

---

## SECTION 6 — Register PM Schedules

Register all schedules via MCP. Use the timezone from Section 1.

The `mcp__scheduled-tasks__create_scheduled_task` tool is auto-discovered by Claude Desktop — use it directly without any installation step.

Convert times to the user's timezone cron expressions.

**PM communication schedules:**

| Schedule | Default time | Cron |
|----------|-------------|------|
| Standup reminder | Mon–Fri 7am | `0 7 * * 1-5` |
| Compile briefing | Mon–Fri 9am | `0 9 * * 1-5` |
| EOD reminder | Mon–Fri 5pm | `0 17 * * 1-5` |
| Weekly RAG | Friday 4pm | `0 16 * * 5` |

**Content pipeline schedules (one post per week):**

| Schedule | Default time | Cron | Prompt |
|----------|-------------|------|--------|
| Writer | Monday 9am | `0 9 * * 1` | `@writer write this week's post` |
| Designer | Tuesday 9am | `0 9 * * 2` | `@designer generate this week's image` |
| Web Developer | Wednesday 9am | `0 9 * * 3` | `@web-developer publish this week's post` |

For each schedule, call `mcp__scheduled-tasks__create_scheduled_task` with the appropriate prompt and cron.

If MCP registration fails, write fallback to `agents/project-manager/context/schedule-desktop-tasks.md` with `/schedule` commands for the user to paste into the Claude Desktop Chat tab, and tell the user:
```
⚠️  Automatic schedule registration failed.
    Open Claude Desktop Chat tab and paste each /schedule command from:
    agents/project-manager/context/schedule-desktop-tasks.md
```

---

## SECTION 7 — Customization Skills

Write two skills the owner can invoke later to change the default setup.
These are plain markdown files — no installation step required.

---

`agents/skills/customize-schedules.md`:
```markdown
# Skill: Customize Content Pipeline Schedules

Use this skill when the owner says "change when Writer runs", "post twice a week",
"move publishing to Friday", or any variation of schedule change.

## Steps

1. Ask the owner:
   - How many posts per week? (default: 1)
   - Which days should Writer / Designer / Web Developer run?
   - What time? What timezone?

2. Calculate new cron expressions for each agent.

3. Show a summary table before changing anything:
   | Agent | Old schedule | New schedule |
   |-------|-------------|--------------|
   | Writer | Monday 9am | {new} |
   | Designer | Tuesday 9am | {new} |
   | Web Developer | Wednesday 9am | {new} |

4. Confirm: "Update these schedules? (yes / no)"

5. On yes: call `mcp__scheduled-tasks__update_scheduled_task` (or delete + recreate)
   for each changed schedule. Report which ones succeeded and which failed.

6. If MCP tools are unavailable, output the new /schedule commands for the owner
   to paste into the Claude Desktop Chat tab.

## Tip
To post twice a week, run Writer on Mon + Thu, Designer on Tue + Fri,
Web Developer on Wed + Sat. The Writer will pick the two oldest unwritten topics.
```

---

`agents/skills/customize-content-sources.md`:
```markdown
# Skill: Customize Content Sources

Use this skill when the owner says "change what the Writer writes about",
"add a research folder", "use a different style guide", "point to my Notion",
or any variation of content source change.

## What counts as a content source

| Source | Location | Purpose |
|--------|----------|---------|
| Topic queue | `content/topics/{slug}/brief.md` | One file per post idea — Writer picks oldest unwritten |
| Brand voice | `resources/brand-voice.md` | Tone, vocabulary, what to avoid |
| Style guide | `resources/web-style-guide.md` | Post structure, length, categories |
| Audience personas | `resources/audience-personas.md` | Who the posts are written for |
| Research material | `content/source-material/` | Background docs the Writer can reference |

## Steps

Ask the owner which source they want to change, then:

**To add topics to the queue:**
Create `content/topics/{slug}/brief.md` containing a one-sentence description.
The slug becomes the URL path — use lowercase-with-hyphens.
Example: `content/topics/how-to-read-bamboo-tiles/brief.md`

**To change brand voice or style:**
Edit `resources/brand-voice.md` or `resources/web-style-guide.md` directly.
Walk the owner through each section and update values they want changed.

**To add research material:**
Drop files into `content/source-material/` with a descriptive name.
Tell the owner: "Add a note in the relevant brief.md pointing to this file
so the Writer knows to read it."

**To use an external source (Notion, Google Docs, URL):**
Edit the Writer persona at `agents/writer/context/persona.md`.
Add a step to the writing workflow: "Read {source} before writing."
If the source requires a tool (WebFetch, Notion MCP), add it to
the writer agent's tools list in `.claude/agents/writer.md`.

## After any change
Run: `@writer write this week's post`
to verify the Writer picks up the new source correctly.
```

---

Ask:
```
Your core team is ready. Want to add any of these specialists?

  (a) Product Manager — OKRs, roadmap, competitive analysis
  (b) Marketing Manager — content calendar, performance tracking
  (c) Social Media Manager — weekly post batches, platform scheduling
  (d) Email Marketer — lead nurture sequences triggered by site signups
  (e) Skip — I can add these later

Reply with a, b, c, d (any combination), or e.
```

If (d) Email Marketer is selected, run this setup before installing the agent:

```
A few questions to set up your lead nurture sequence:

1. How many emails in the sequence? (e.g. 3, 5)
2. For each email:
   - Subject line
   - Key points or body copy
   - Delay from previous send (e.g. "immediately", "3 days after stage 1")
3. What exits a lead from the sequence?
   (e.g. books a reading → converted, clicks unsubscribe → unsubscribed)
4. Which lead sources does this sequence apply to?
   (newsletter, contact, readings, mirror — or all)
```

Wait for answers. Then:
- Install the agent using the standard template pattern below

For each selected agent, install using the same template pattern as Section 4.
Use brand context from resources/ files already written.
Register any schedules via MCP immediately after installing.

---

## SECTION 8 — Git Commit

```bash
git add .claude/ agents/ resources/ content/ context/ website/ standup/ CLAUDE.md architecture/docs/
git commit -m "bootstrap: P2 complete — website, agents, schedules"
```

---

## SECTION 9 — Verification

Run silently. Output a pass/fail summary at the end.

**File check:**
```bash
for f in .claude/agents/project-manager.md .claude/agents/writer.md .claude/agents/designer.md .claude/agents/web-developer.md resources/brand-voice.md resources/design-system.md resources/web-style-guide.md resources/audience-personas.md; do
  [ -f "$f" ] && echo "✅ $f" || echo "❌ MISSING: $f"
done
```

**Agent test 1 — PM standup:**
Simulate: read `agents/project-manager/context/persona.md` and produce the standup reminder it would send today.
Pass if: output references real business name (not a placeholder) and correct timezone.

**Agent test 2 — Writer caption:**
Ask Writer to draft a 3-sentence social caption for the top content category in `resources/web-style-guide.md`.
Pass if: output matches brand voice from `resources/brand-voice.md`.

**Agent test 3 — Web Developer process:**
Ask Web Developer to describe what it would do given a brief at `content/topics/my-first-post/brief.md`.
Pass if: output references `website/app/blog/my-first-post/page.tsx` and `resources/design-system.md`.

---

## SECTION 10 — Final Summary

Output when all checks pass:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{PROJECT_NAME} — AI TEAM READY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Website:     {VERCEL_URL}
Repository:  {GITHUB_URL}

Agents installed:
  ✅ Project Manager   — standup, briefings, RAG reports
  ✅ Writer            — blog posts, social captions, email drafts
  ✅ Designer          — hero images, social cards
  ✅ Web Developer     — builds and publishes pages
  {optional agents if installed}

Schedules running:
  Mon–Fri 7am   — standup reminder
  Mon–Fri 9am   — compile briefing
  Mon–Fri 5pm   — EOD reminder
  Friday 4pm    — weekly RAG report

YOUR FIRST ACTIONS:
  1. "help me write my standup"
  2. "@writer write a post about {top content topic}"
  3. Check Claude Desktop → Scheduled tab to confirm schedules

ALWAYS YOUR DECISION:
  Social posts → you review before anything posts
  Email campaigns → ALWAYS require your approval
  Blog posts → you review before Web Developer publishes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Append to `context/publish-log.md`:
```
| Date | Title | File | Category |
|------|-------|------|----------|
```

```
✅ P2 complete. Bootstrap finished.
```
