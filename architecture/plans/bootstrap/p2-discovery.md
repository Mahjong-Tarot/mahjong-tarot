# P2 — Business Discovery + First Website
> **Prerequisites:** P1 complete. Project folder exists, Claude Code running.
> **Where:** Claude Desktop — Code tab.
> **Time:** ~60–90 minutes (interview ~30 min, scaffold + deploy ~45 min)
> **Done when:** Business context captured, style guides written, first website live on Vercel.

---

## INSTRUCTIONS FOR CLAUDE CODE

You are conducting a structured business discovery interview, then immediately using the
answers to scaffold a live website. Run every section in order.

Rules:
- Ask each group as a single message. Wait for answers before the next group.
- Never generate any files before completing all three interview groups.
- If an answer is unclear, ask one clarifying question — do not guess.
- Use ACTUAL answers in every generated file — no placeholders like [BUSINESS NAME].

**How to communicate with the user throughout P2:**
- Before every section, say in one plain-English sentence what you are about to do and why.
- When a new tool or concept is introduced (Next.js, GitHub, Vercel, Supabase), explain it in one sentence before using it.
- After each major step completes, confirm it worked before moving on.
- Never run a block of commands in silence — always narrate.

---

## SECTION 1 — Business Identity Interview

### Group 1 of 3: Who You Are

```
GROUP 1 OF 3 — Business Identity

Please answer all of these:

1.  What is your business name?
2.  In 2–3 sentences: what do you do and who do you serve?
3.  What are your main products or services?
    (Include approximate prices if you're comfortable)
4.  What is your website domain? (existing URL, or what you'd like — e.g. acme.com)
5.  What country are you in, and what language(s) do your customers speak?
6.  What is your name and your role in the business?
```

### Group 2 of 3: Your Audience & Market

```
GROUP 2 OF 3 — Audience & Positioning

7.  Describe your ideal customer:
    age range, profession or situation, and the biggest problem you solve for them

8.  List 3–5 words that describe your brand voice
    (e.g. "warm, wise, direct, playful" / "sharp, minimal, data-driven")

9.  Who are your top 2–3 competitors? (names only is fine)

10. What makes you genuinely different from them?

11. What is your #1 business goal for the next 12 months?
    Be specific — a number, a launch, a milestone.
    (e.g. "500 email subscribers" / "launch a $497 course" / "20 new coaching clients")

12. What have you already tried in marketing? What worked, what didn't?
```

### Group 3 of 3: Channels & Capacity

```
GROUP 3 OF 3 — Channels & Working Style

13. Which platforms do you currently use or want to use?
    (tick all that apply)
    Instagram / Facebook / LinkedIn / Twitter-X / TikTok / Pinterest / YouTube / Other: ___

14. Do you have an email list?
    If yes: how many subscribers, and which platform?
    (Mailchimp / Brevo / ConvertKit / Klaviyo / other / none yet)

15. Do you currently publish a blog? If yes: URL and how often?

16. Do you create video content? Platform and frequency?

17. Do you need content in more than one language?
    If yes: which languages, and is translation reviewed by a human before publishing?

18. How many hours per week can you (or your team) spend reviewing AI-drafted content
    before it goes out? Be honest — this shapes how the agents are set up.

18b. For each platform you use: auto-post or draft-only?
     - TikTok → ALWAYS draft (you must add trending music manually before going live)
     - Instagram: auto-post / draft-only?
     - Facebook: auto-post / draft-only?
     - LinkedIn: auto-post / draft-only?
     - Twitter-X: auto-post / draft-only?

19. What days and times do you prefer for your weekly AI team strategy check-in?
    (e.g. "Monday 9am" — include your timezone)

20. Do you want daily team updates via Telegram? Yes / No

21. Rough monthly budget for third-party tools:
    Under $50 / $50–200 / $200–500 / $500+

22. Is there a human team member who handles the tech side?
    If yes: their name and what they manage.
```

---

## SECTION 2 — Style Guide Interview

Ask BOTH style questions in a single message. If the user has no clear answer,
offer 3 concrete suggestions based on their business type and brand voice (Q8).

```
VISUAL & WEB STYLE

23. Describe your visual style in a sentence or two.
    Examples:
    • "Soft watercolours, gold accents, feminine and mystical"
    • "Clean and minimal — navy, white, lots of white space"
    • "Bold and high-contrast — dark mode, electric accents"
    • "Warm earthy tones, handcrafted feel, nature-inspired"

    Not sure? I can suggest 3 options based on your brand voice — just say "suggest".

24. What are your primary brand colours?
    Hex codes if you have them (e.g. #2C3E50), or just descriptions.
    Not sure? I can suggest a palette based on your industry and tone — say "suggest".
```

**If user says "suggest" for Q23:**
Generate 3 style options based on Q2 (business description) and Q8 (brand voice adjectives).
Format each as: Style name | Primary colour | Accent colour | Mood sentence.
Ask the user to pick one or describe their own preference.

**If user says "suggest" for Q24:**
Generate a 3-colour palette (primary, secondary, accent) based on the chosen style.
Present with hex codes. Ask to confirm or adjust.

### Generate: `resources/brand-voice.md`

```markdown
# Brand Voice — {Business Name}

## Identity
- Business: {name}
- Tagline: {tagline if known, or "TBD"}
- Business description: {Q2}

## Voice adjectives
{Q8 — list each on its own line}

## Tone guidelines
- Formality: {derived from Q8 — e.g. "conversational, not corporate"}
- How to open a post: {example derived from voice}
- How to close a post: {example derived from voice}
- Words to use: {5–8 words that fit the voice}
- Words to avoid: {5–8 words that clash with the voice}

## On-brand examples
{2 example sentences in the brand voice}

## Off-brand examples
{2 example sentences that miss the mark — too stiff, too casual, etc.}
```

### Generate: `resources/design-system.md`

```markdown
# Design System — {Business Name}

## Brand colours
- Primary: {hex} — {name/description}
- Secondary: {hex} — {name/description}
- Accent: {hex} — {name/description}
- Background: {hex}
- Text: {hex}

## Visual style
{Q23 description, expanded into 2–3 sentences}

## Typography preferences
{derive from visual style — e.g. "serif headings (Playfair Display), sans body (Inter)"}

## Image style guidelines
- Photography: {warm/cool/moody/bright, etc.}
- Illustrations: {hand-drawn/geometric/none}
- Avoid: {stock photography clichés, etc.}

## Standard image sizes
| Use | Size |
|-----|------|
| Blog hero | 1200×630px |
| Social card (square) | 1080×1080px |
| Social card (story) | 1080×1920px |
| OG / link preview | 1200×630px |
| Thumbnail | 400×300px |
```

### Generate: `resources/web-style-guide.md`

```markdown
# Web Style Guide — {Business Name}

> This guide governs how the Web Developer agent builds every page.

## Layout principles
{3–4 layout rules derived from visual style — e.g. "generous whitespace", "single-column mobile-first"}

## Component patterns
- Hero: {full-width / split / minimal}
- CTAs: {primary button colour, secondary style}
- Cards: {border / shadow / flat}
- Navigation: {sticky / static, hamburger on mobile}

## CSS variables (globals.css)
```css
:root {
  --color-primary: {hex};
  --color-secondary: {hex};
  --color-accent: {hex};
  --color-bg: {hex};
  --color-text: {hex};
  --font-heading: {font-family};
  --font-body: {font-family};
  --radius: {e.g. 8px};
  --shadow: {e.g. 0 2px 8px rgba(0,0,0,0.08)};
}
```

## Blog post structure
1. Hero image (1200×630)
2. Title + read time + category tag
3. Intro paragraph (hook)
4. H2 sections (3–5)
5. CTA block (newsletter signup or booking)

## Approved blog categories
{Derive 5–8 categories from content pillars Q29}

## Do's
{3–5 specific dos}

## Don'ts
{3–5 specific don'ts}
```

---

## SECTION 3 — Content Pillars & 90-Day Goal

Ask as a single message:

```
CONTENT STRATEGY

25. List 3–5 content pillars — the main topics you want to be known for.
    (e.g. "Mahjong symbolism / Chinese astrology / reading for relationships")
    These become the backbone of everything your AI team writes.

26. What does success look like in 90 days?
    Be specific: a number, a milestone, a launch.
    Not "grow my audience" — something you could measure.
    (e.g. "500 newsletter subscribers" / "sold 10 copies of my ebook" / "published 12 blog posts")
```

### Generate: `resources/audience-personas.md`

```markdown
# Audience Personas — {Business Name}

## Primary ICP (Ideal Customer Profile)
- Demographics: {from Q7}
- Psychographics: {values, fears, aspirations derived from Q7 + Q2}
- Biggest problem: {from Q7}
- Goals: {what they want to achieve}
- Where they spend time online: {from Q13 context}
- What makes them buy/subscribe/follow: {derived}

## Secondary segments (if applicable)
{1–2 secondary audiences, if relevant}
```

### Generate: `resources/content-calendar.md`

```markdown
# Content Calendar Framework — {Business Name}

## Content pillars
{Q25 — each pillar with 2–3 example topics}

## Weekly posting rhythm
{Based on Q13 platforms and Q18 hours available}

## 90-day goal
{Q26}

## Monthly themes framework
- Month 1: Foundation — introduce the brand, explain the value
- Month 2: Depth — go deep on pillar 1 and 2
- Month 3: Conversion — CTAs, offers, community

## First month calendar (blank — Marketing Manager fills this in)
| Week | Platform | Content type | Pillar | Status |
|------|----------|-------------|--------|--------|
| 1 | | | | Draft |
| 1 | | | | Draft |
| 2 | | | | Draft |
| 2 | | | | Draft |
```

---

## SECTION 4 — Select Agents for Website Launch

Based on the interview answers, determine the MINIMUM agent set needed to
scaffold and launch the first website. At minimum this is always:

| Agent | Why always needed |
|-------|-------------------|
| Web Developer | Builds and maintains the website |
| Designer | Hero images and visual assets |
| Writer | First blog posts and page copy |

Ask: "For your first website launch, which of these would also be useful right away?
- **Marketing Manager** — content calendar and campaign planning
- **Social Media Manager** — distributing content to your platforms
- **Project Manager** — daily standups and progress tracking
- **Product Manager** — growth strategy and roadmap

Or we can start with just Web Developer + Designer + Writer and add the rest in P3."

Note the user's answer for P3. Proceed with the minimum set selected.

---

## SECTION 5 — Scaffold Website

Announce:
```
Interview complete. I'm going to scaffold your website and get it live on Vercel now.
Estimated time: ~30 minutes.
```

### 5A — Create Next.js app

Say:
```
I'm going to create your website using Next.js — a modern framework for building
fast, professional websites with React. It's the same technology used by companies
like Nike and Netflix. This command scaffolds the base structure in about 60 seconds.
```

```bash
cd website && npx create-next-app@latest . --pages --no-typescript --no-tailwind --no-app --no-src-dir --yes
```

After: `✅ Website scaffold created.`

Create these files, fully written with real copy from the interview — no placeholder text:

- `pages/index.jsx` — Homepage: hero, value proposition, CTA (per Q7 and Q11)
- `pages/about.jsx` — About the business owner (from Q2 and Q6)
- `pages/contact.jsx` — Contact form stub → `/api/contact`
- `pages/api/contact.js` — API stub: logs to console, returns 200
- `pages/blog/index.jsx` — Blog listing (empty state: "Posts coming soon")
- `components/Nav.jsx` — Business name + page links
- `components/Footer.jsx` — Social links (from Q13), copyright
- `components/NewsletterSignup.jsx` — Email signup stub
- `styles/globals.css` — CSS variables from design-system.md
- `website/.env.local.example` — NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- `website/supabase/001_initial_schema.sql` — contact_submissions and newsletter_subscribers tables

Each page must: use Nav and Footer, include `<Head>` (title + meta description + OG tags),
use brand voice from Q8, use CSS variables only (no inline styles).

### 5B — Push to GitHub and deploy to Vercel

Say:
```
Now I'll push your website code to GitHub (your online backup and version history),
then connect it to Vercel — the hosting platform that publishes your site to the internet.
Every time your AI team makes a change, Vercel will automatically redeploy your site.
```

```bash
gh repo create {business-name-kebab-case}-marketing --private --source=. --remote=origin --push
```

After: `✅ Code is on GitHub. Now let's connect Vercel to publish your site live.`

Output to user:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR REPO IS ON GITHUB. NOW CONNECT VERCEL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to: https://vercel.com/new
2. Click "Import Git Repository" → select {repo-name}

   ⚠️  IMPORTANT — easy to miss:
   Find the "Root Directory" field on this page.
   Type: website/
   If you skip this, the deploy will fail.

3. Click Deploy (skip env vars for now)

Your site will be live in ~2 minutes.
Come back and paste your Vercel URL when it's done.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Wait for the user to paste their Vercel URL. Then:

### 5C — Wire Supabase to Vercel

Say:
```
Last step: I'll connect your database to your website.
Supabase is your database — it stores contact form submissions, newsletter signups,
and any data your website collects. Right now the website and database don't know
about each other. The steps below introduce them.
```

Output to user:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONNECT YOUR DATABASE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Open your Supabase project (from P0)
   → Project Settings → API → copy:
     Project URL  → NEXT_PUBLIC_SUPABASE_URL
     Anon key     → NEXT_PUBLIC_SUPABASE_ANON_KEY

2. In Vercel → your project → Settings → Environment Variables
   Add both values above

3. Run the database schema:
   - Open your project folder → website → supabase → 001_initial_schema.sql
   - Open in any text editor → copy all → paste into Supabase SQL Editor → Run

4. In Vercel → Deployments → Redeploy latest

5. Add your Supabase MCP token:
   - Go to: https://supabase.com/dashboard/account/tokens
   - Create token named: {project-name}-claude
   - Open .claude/settings.local.json
   - Replace SUPABASE_ACCESS_TOKEN_PLACEHOLDER with the token
   - Restart Claude Code

Come back and say "database connected" when done.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Wait for "database connected".

### 5D — Update local CLAUDE.md

Now that the business context is known, replace the placeholder CLAUDE.md written in P1
with the full project instructions file:

```markdown
# {Business Name} — Claude Code Instructions

## Role
You are the website production and publishing system for {Business Name}.
Your job: take approved content, build polished React components, update the blog index,
stage with git, and hand the owner a single `git push` command to run.

## What this project DOES
- Read approved content from content/topics/{slug}/
- Optimise images to WebP → website/public/images/
- Use the build-page skill to generate React .jsx components
- Update blog index (website/pages/blog/index.jsx)
- Run git add + git commit with a clear message
- Output a single git push origin main command for the owner

## What this project does NOT do
- Write blog content — that is the writer agent's job
- Push to GitHub automatically — final push always comes from the owner
- Make design decisions outside the web style guide without asking

## Folder structure
{project-name}/
├── .claude/agents/             ← Claude Code agent definitions
├── .claude/rules/              ← Engineering guardrails
├── .claude/skills/             ← Project-local skill definitions
├── agents/                     ← Agent personas, skills, workflows
├── content/topics/             ← Blog topic bundles (one folder per post)
├── content/source-material/    ← Raw research and source content by topic
├── content/content-calendar/   ← Monthly editorial calendars
├── resources/                  ← brand-voice.md, design-system.md, etc.
├── context/                    ← Publish log, templates
├── standup/                    ← Daily standups and briefings
├── working_files/              ← Git-ignored scratch space
└── website/                    ← Next.js project root

## Publishing workflow
1. Read content/topics/{slug}/blog.md
2. Read resources/web-style-guide.md
3. Generate or optimise hero image
4. Invoke build-page skill → generate .jsx
5. Copy to website/pages/blog/posts/{slug}.jsx
6. Update website/pages/blog/index.jsx
7. git add [files] && git commit -m "publish: {title}"
8. Output: git push origin main command for owner

## Quality checklist (before every commit)
- [ ] Component renders without errors
- [ ] All images use next/image
- [ ] <Head> includes title, meta description, OG/Twitter tags
- [ ] Category tag matches web-style-guide.md
- [ ] No inline styles — CSS modules or globals only
- [ ] Post card added at top of blog index
```

---

```
✅ P2 complete.

  ✓ Business identity captured
  ✓ Brand voice written → resources/brand-voice.md
  ✓ Design system written → resources/design-system.md
  ✓ Web style guide written → resources/web-style-guide.md
  ✓ Audience personas written → resources/audience-personas.md
  ✓ Content calendar framework → resources/content-calendar.md
  ✓ Website live at: {Vercel URL}
  ✓ Database connected (Supabase)
  ✓ CLAUDE.md updated with full project context

Agent team selected for P3: {list the agents chosen in Section 4}

Next:
  1. Click the 📎 attachment icon (bottom-left of the message box)
  2. Select p3-agents.md from your files
  3. Send it — Claude will build your agent team
```
