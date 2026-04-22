# P3 — Business Discovery + Agent Customisation
> **Prerequisites:** P2 complete. Website live, 4 core agents installed, PM schedules active.
> **Where:** Claude Desktop — Code tab.
> **Time:** ~90–120 minutes (interview ~30 min, personalisation ~60 min)
> **Done when:** Business context captured, agents personalised, resources written, website updated.

---

## INSTRUCTIONS FOR CLAUDE CODE

This phase does two things: learns about the business, then uses that knowledge to
personalise the core team and optionally extend it with specialist agents.

**How to communicate with the user throughout P3:**
- Start by presenting the installed 4-agent model — what each agent does and how they connect.
- Run the interview in three groups — one message per group, wait for answers before proceeding.
- After the interview, confirm what you understood before generating any files.
- When personalising each agent, say which file you're updating and what's changing.
- Never generate files in silence — always narrate what you're writing and why.

**Resume:** If the session ends mid-phase, start a new session and say
"Resume P3 from [last completed section]" — load context from any resource files already written.

---

## SECTION 1 — Present Your Installed Team

Before starting the interview, show the user what's already running:

```
Your core AI team is installed and ready. Here's what each agent does:

┌─────────────────────────────────────────────────────────────────┐
│  PROJECT MANAGER                                                │
│  Runs your daily standups (7am/9am/5pm), tracks risks in a     │
│  RAID log, flags scope changes, and sends a weekly status       │
│  report every Friday. Already scheduled — it starts tomorrow.  │
├─────────────────────────────────────────────────────────────────┤
│  WRITER                                                         │
│  Drafts blog posts, social captions, and email copy in your    │
│  brand's voice. Outputs drafts for your review — never posts   │
│  without approval.                                              │
├─────────────────────────────────────────────────────────────────┤
│  DESIGNER                                                       │
│  Creates hero images, social cards, and visual assets.         │
│  Works from prompts shaped by your brand style guide.          │
├─────────────────────────────────────────────────────────────────┤
│  WEB DEVELOPER                                                  │
│  Builds and publishes website pages and blog posts. Commits    │
│  everything to git and hands you a single push command to run. │
└─────────────────────────────────────────────────────────────────┘

Right now they have placeholder content where your business details belong.
The next step is a short interview so I can fill those in properly.
```

---

## SECTION 2 — Business Identity Interview

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
    before it goes out? Be honest — this shapes how the agents are calibrated.

18b. For each platform you use: auto-post or draft-only?
     - TikTok → ALWAYS draft (you must add trending music manually before going live)
     - Instagram: auto-post / draft-only?
     - Facebook: auto-post / draft-only?
     - LinkedIn: auto-post / draft-only?
     - Twitter-X: auto-post / draft-only?

19. What days and times do you prefer for your weekly AI team strategy check-in?
    (e.g. "Monday 9am" — include your timezone if different from P2)

20. Do you want daily team updates via Telegram? Yes / No

21. Rough monthly budget for third-party tools:
    Under $50 / $50–200 / $200–500 / $500+

22. Is there a human team member who handles the tech side?
    If yes: their name and what they manage.
```

---

## SECTION 3 — Style Guide Interview

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

---

## SECTION 4 — Content Pillars & 90-Day Goal

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

---

## SECTION 5 — Generate Resource Files

Using ACTUAL answers from the interview — no placeholders like [BUSINESS NAME]:

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
{Derive 5–8 categories from content pillars Q25}

## Do's
{3–5 specific dos}

## Don'ts
{3–5 specific don'ts}
```

### Generate: `resources/audience-personas.md`

```markdown
# Audience Personas — {Business Name}

## Primary ICP (Ideal Customer Profile)
- Demographics: {from Q7}
- Psychographics: {values, fears, aspirations derived from Q7 + Q2}
- Biggest problem: {from Q7}
- Goals: {what they want to achieve}
- Where they discover us: {from Q13 context}
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

## First month calendar (blank — Writer fills this in)
| Week | Platform | Content type | Pillar | Status |
|------|----------|-------------|--------|--------|
| 1 | | | | Draft |
| 1 | | | | Draft |
| 2 | | | | Draft |
| 2 | | | | Draft |
```

### Generate: `resources/seo-strategy.md`

```markdown
# SEO Strategy — {Business Name}

## Business category and primary search intent
{derived from Q2 and Q3 — what people search for when looking for this business}

## Seed keywords (10)
{derived from products/services Q3, ICP Q7, and content pillars Q25}

## Content format priorities
{Based on Q15, Q16, and Q18 — long-form blog, short-form social, or video}

## Internal linking strategy
{how blog posts should link to each other and to service pages}

## SEO checklist per post
- [ ] Title contains primary keyword (≤60 chars)
- [ ] Meta description contains keyword (≤160 chars)
- [ ] H2 subheadings contain secondary keywords
- [ ] Internal link to at least one related post or service page
- [ ] Image alt text contains keyword
- [ ] OG image is 1200×630px
```

---

## SECTION 6 — Update Website with Real Content

Now that the business context is known, replace the placeholder content in website pages:

Update these files using REAL copy derived from the interview — no [placeholder] tokens:

- `website/pages/index.jsx` — Real hero headline, value proposition, and CTA (from Q2, Q7, Q11)
- `website/pages/about.jsx` — Real about page (from Q2 and Q6)
- `website/components/Nav.jsx` — Real business name
- `website/components/Footer.jsx` — Real social links (from Q13), copyright
- `website/styles/globals.css` — Replace placeholder CSS variables with brand colours (Q23/Q24)

After: `✅ Website pages updated with real business content.`

---

## SECTION 7 — Update CLAUDE.md

Replace the placeholder CLAUDE.md with the full project instructions:

```markdown
# {Business Name} — Claude Code Instructions

## Role
You are the website production and publishing system for {Business Name}.
Your job: take approved content, build polished React components, update the blog index,
stage with git, and hand the owner a single `git push` command to run.

## What this project DOES
- Read approved content from content/topics/{slug}/blog-draft.md
- Optimise images to WebP → website/public/images/blog/
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
├── content/social/             ← Standalone social media content and drafts
├── content/source-material/    ← Raw research and source content by topic
├── content/content-calendar/   ← Monthly editorial calendars
├── resources/                  ← brand-voice.md, design-system.md, web-style-guide.md
├── context/                    ← Publish log, change requests, RAID log
├── standup/                    ← Daily standups and briefings
├── working_files/              ← Git-ignored scratch space
└── website/                    ← Next.js project root

## Publishing workflow
1. Read content/topics/{slug}/blog-draft.md
2. Read resources/web-style-guide.md
3. Generate or optimise hero image
4. Invoke build-page skill → generate .jsx
5. Copy to website/pages/blog/posts/{slug}.jsx
6. Update website/pages/blog/index.jsx
7. git add [specific files] && git commit -m "publish: {title}"
8. Output: git push origin main command for owner to run

## Quality checklist (before every commit)
- [ ] Component renders without errors
- [ ] All images use next/image with correct src, alt, width, height
- [ ] <Head> includes title, meta description, OG/Twitter tags, canonical URL
- [ ] Category tag matches web-style-guide.md
- [ ] No inline styles — CSS modules or globals only
- [ ] Post card added at top of blog index
- [ ] Publish log updated at context/publish-log.md
```

---

## SECTION 8 — Personalise Core Agents

Update each of the 4 installed agents with real business context from the interview.
Read the current persona.md for each agent. Remove all `{placeholder}` tokens and
"P3 update:" notes. Replace with real values.

**Project Manager** — update `agents/project-manager/context/persona.md`:
- Replace `{Owner Name}` with the real name from Q6
- Replace `{Timezone}` with the confirmed timezone (from P2 or Q19)
- Add team member rows from Q22 to the Team table
- Update the escalation contact

**Writer** — update `agents/writer/context/persona.md`:
- Add content pillars section from Q25
- Add the 90-day goal and what CTA to use in each piece
- Add platform-specific rules from Q13 and Q18b (auto-post vs draft-only)
- Add language/translation rules if Q17 says yes

**Designer** — update `agents/designer/context/persona.md`:
- Replace style with Q23 visual style description
- Add brand colour palette from Q23/Q24 (hex codes)
- Add typography preferences derived from visual style
- Add "image tool: gemini-4.1-flash-preview via Gemini API (Nano Banana 2 — see generate-image skill)"

**Web Developer** — update `agents/web-developer/context/persona.md`:
- Add approved blog categories from resources/web-style-guide.md
- Add CSS variable names and values from resources/web-style-guide.md
- Add repo name and Vercel URL (from P2)

After all 4 updates: `✅ All 4 agents personalised with real business context.`

---

## SECTION 9 — Update daily-checkin Skill with Real Team

The daily-checkin skill was installed in P1 with placeholder team names.
Now that the team is confirmed, update it:

Build the team roster from Q6 (owner) and Q22 (other team members). For each person,
create a name slug: lowercase, spaces → hyphens (e.g. "Alex Chen" → "alex-chen").

```python
import os, re

# Roster built from interview answers — fill these from Q6 and Q22
# Format: [("Display Name", "file-slug"), ...]
team = [
    ("{Owner Name from Q6}", "{owner-slug}"),
    # Add one entry per additional person from Q22:
    # ("{Person Name}", "{name-slug}"),
]

skill_path = os.path.expanduser("~/.claude/skills/daily-checkin/SKILL.md")
with open(skill_path) as f:
    content = f.read()

# Build the roster section dynamically from team list
roster_lines = "\n".join(
    f"- {name} → standup/individual/{slug}.md"
    for name, slug in team
)

# Replace the placeholder roster block
content = re.sub(
    r"Map to file \(update these in P3 with real names\):.*?(?=\n### |\Z)",
    f"Map to file:\n{roster_lines}\n\n",
    content,
    flags=re.DOTALL
)

# Remove the setup note now that names are real
content = re.sub(
    r"> Setup note:.*?\n\n",
    "",
    content,
    flags=re.DOTALL
)

with open(skill_path, "w") as f:
    f.write(content)
print(f"✅ daily-checkin skill updated → {skill_path}")
print(f"   Team roster: {[name for name, _ in team]}")
```

Copy the updated skill into the project for version control:
```bash
cp ~/.claude/skills/daily-checkin/SKILL.md .claude/skills/daily-checkin/SKILL.md
```

Create the standup file for the owner:
```bash
today=$(date +%Y-%m-%d)
echo "date: $today
name: {owner name}

## Today's focus
- Getting the AI team set up and running

## Notes
- Bootstrap P3 complete

## Blockers
None" > standup/individual/{owner-slug}.md
```

Also create `context/agent-creation-guideline.md`:

```markdown
# Agent Creation Guideline

Use this 5-step workflow whenever a new AI agent is added to the team after bootstrap.
Never generate an agent without completing the Review step and getting explicit approval.

## The 5-Step Workflow

### Step 1 — Interview
Ask targeted questions about this agent's specific domain.
Minimum: purpose, audience, decision authority, output format, cadence, escalation path.

### Step 2 — Design Workflow
Draft the agent's operating pattern:
- Daily / weekly / on-demand triggers
- What it reads (input files, resource files)
- What it writes (output files, paths)
- What it never does (hard rules)

### Step 3 — Review (REQUIRED — never skip)
Present the plan to the owner. Show:
- Purpose and SOPs to be applied
- Skill set and trigger phrases
- Hard rules
Ask: "Approve? (yes / adjust + what to change)"
Do NOT generate any files until you have an explicit approval.

### Step 4 — Generate
Write in this order:
1. `.claude/agents/{name}.md` — YAML frontmatter (name, description, model, tools) + quick reference
2. `agents/{name}/context/persona.md` — full persona (11 standard sections)
3. `agents/{name}/context/skills/` — one SKILL.md per skill

### Step 5 — Install
Confirm trigger phrases work. Show the owner how to invoke the agent.
Update CLAUDE.md agents table with the new agent.
```

---

## SECTION 10 — Optional: Extend the Team

Ask:
```
Your core team is personalised and ready.

Would you like to add any of these specialist agents now?

  A — Product Manager
      Growth strategy, OKR tracking, RICE prioritisation, competitive analysis,
      Now/Next/Later roadmap. Best if: you're building a product, launching a course,
      or need strategic oversight beyond day-to-day delivery.

  B — Marketing Manager
      Campaign planning, content calendar, performance reporting.
      Best if: you're running paid ads or need structured campaign tracking.

  C — Social Media Manager
      Platform-specific drafts, TikTok carousels, hashtag strategy, weekly analytics.
      Best if: social is a primary channel and you post 5+ times per week.

Type the letters of agents to add (e.g. "A" / "A B" / "none" to skip).
```

Wait for answer. If "none" or blank: skip to Section 11.
If any letters selected: run the FULL AGENT-CREATOR WORKFLOW below for each selected agent.

---

## FULL AGENT-CREATOR WORKFLOW (for each selected extended agent)

Build each agent in order:

```
For EVERY extended agent:
  Step 1 — Interview    (targeted questions for this agent's domain)
  Step 2 — Workflow     (design the agent's daily/weekly operating pattern)
  Step 3 — Review       (show the user the plan, wait for approval)
  Step 4 — Generate     (write persona.md, skills/, agent definition)
  Step 5 — Install      (write .claude/agents/{name}.md, confirm trigger phrases)
```

**Do NOT skip the review step.** The user must approve each agent before it is generated.

---

### PRODUCT MANAGER

**Industry standards applied automatically (do not ask the user about these):**
- **OKR framework**: objectives + measurable key results, reviewed quarterly
- **RICE prioritisation**: Reach × Impact × Confidence ÷ Effort for all feature decisions
- **Now/Next/Later roadmap**: no fixed-date commitments beyond the current quarter
- **Product discovery**: problem statement → hypothesis → experiment → learn
- **Competitive analysis**: feature matrix + strategic insights, updated monthly
- **North Star metric**: single primary metric derived from Q26, supported by 2–3 leading indicators

**Interview:**
No additional interview needed — use answers from Sections 2–4 (Q7, Q9, Q11, Q25, Q26).

**Review — output this to the user:**
```
PRODUCT MANAGER — Review before generating

Purpose: Growth strategy, roadmap, feature prioritisation, ICP research, OKR tracking

SOPs applied: OKR quarterly cycle, RICE prioritisation, Now/Next/Later roadmap,
monthly competitive analysis. Industry standards — no extra setup needed.

North Star metric (from Q26): {derive — e.g. "Email subscribers", "Readings booked"}
Primary persona: {Q7 summary}
Competitors: {Q9}
Strategy review: {Q19 day/time}

Trigger phrases:
  "we should build" / "prioritise this" / "update the roadmap"
  "who is our target user" / "write a vision report"
  "how do competitors handle" / "what's our product strategy"

Approve? (yes / adjust + what to change)
```

Wait for approval. Then generate:

`.claude/agents/product-manager.md`:
```markdown
---
name: product-manager
description: >
  Handles product strategy, roadmap, RICE prioritisation, OKR tracking, ICP research,
  and competitive analysis for {Business Name}. Trigger when: proposing a new feature,
  asking about product strategy, requesting a vision report, or doing competitive research.
model: claude-sonnet-4-6
tools: [Read, Write, Glob, Grep, Bash, WebSearch]
---

# Product Manager — Quick Reference

**Context files to read first:**
- agents/product-manager/context/persona.md
- resources/brand-voice.md
- resources/audience-personas.md

**Skills:**
| Skill | Trigger |
|-------|---------|
| prioritise | "should we build this?" / "prioritise this" / "RICE score this" |
| roadmap-update | "update the roadmap" / "add this to the roadmap" |
| competitive-analysis | "how do competitors handle" / "competitive analysis" |
| vision-report | "write a vision report" / "product vision" |

**Hard rules:**
1. Never add a feature to Now without a RICE score — no gut-feel prioritisation
2. OKRs reviewed quarterly — do not change Key Results mid-quarter without owner sign-off
3. Roadmap shows outcomes (what the user gains), not features (what gets built)
4. Competitive analysis updated at least monthly — never cite analysis older than 30 days
5. All decisions tie back to the North Star metric: {derive from Q26}
```

`agents/product-manager/context/persona.md` — full persona with all sections:
1. Identity & Purpose (from Q2, Q26)
2. North Star Metric (from Q26 + Q11)
3. Primary Persona (from Q7)
4. Competitors (from Q9)
5. Product Discovery Process (4-step: framing → evidence → hypothesis → RICE)
6. OKR Framework (quarterly cycle, format, status thresholds 🟢≥70% / 🟡40-69% / 🔴<40%)
7. RICE Prioritisation (full formula, scoring table, tier interpretation)
8. Product Roadmap (Now/Next/Later format, max 3 in Now, no fixed dates beyond current quarter)
9. Competitive Analysis (format, monthly update requirement, WebSearch required)
10. Weekly/Monthly/Quarterly Cadence (hardcoded schedule)
11. Canonical Artifacts (OKRs, roadmap, competitive analysis, vision reports)

`agents/product-manager/context/skills/prioritise/SKILL.md` — RICE scoring workflow
`agents/product-manager/context/skills/competitive-analysis/SKILL.md` — monthly research workflow

---

### MARKETING MANAGER

**Interview:**
```
MARKETING MANAGER SETUP

90-day goal: {Q26}

1. How do you currently plan your marketing? (ad hoc / monthly calendar / quarterly)

2. Which metric do you check most often?
   (email subscribers / social followers / website traffic / sales / other)

3. Do you run paid ads? If yes: which platforms and rough budget?

4. Do you have a content calendar format you like, or should the agent design one?

5. How often do you want a performance summary?
   (daily brief / weekly report / monthly only / only when something's wrong)
```

**Step 2 — Design workflow.** Derive from interview: reporting cadence from Q5, primary metric from Q2, channel mix from P3 Q13, budget from Q3.

**Step 3 — Review — output this to the user:**
```
MARKETING MANAGER — Review before generating

Purpose: Campaign planning, content calendar, performance reporting

Primary metric: {Q2 answer}
Channels: {Q13 from main interview}
Budget: {Q3 — paid / organic}
Reporting cadence: {Q5 answer}
Strategy review: {P3 Q19 day/time}

Skill set:
  campaign-plan        — plan content campaigns
  performance-report   — weekly/monthly analytics
  content-calendar-update — fill next month's calendar

Trigger phrases:
  "plan a campaign" / "update the content calendar" / "performance report"
  "what should we focus on this month" / "review this month's content"

Approve? (yes / adjust + what to change)
```

Wait for approval. Then:

**Step 4 — Generate.** **Step 5 — Install.**

Generate full agent package: `.claude/agents/marketing-manager.md`,
`agents/marketing-manager/context/persona.md` (11 sections), and skill files for:
- `campaign-plan` — plan a content campaign
- `performance-report` — weekly/monthly analytics summary
- `content-calendar-update` — fill in next month's calendar

---

### SOCIAL MEDIA MANAGER

**Interview:**
```
SOCIAL MEDIA MANAGER SETUP

Platforms from earlier: {Q13}

1. What is your highest-priority platform right now?

2. For that platform: what content performs best for you?
   (educational / inspirational / behind-the-scenes / promotional / personal stories)

3. How many posts per week do you want drafted per platform?

4. TikTok carousels are always 6 slides (hook + 4 content + CTA). Is that OK?

5. Do you use hashtags actively? If yes: list 5–10 you always use.

6. When a draft is ready, how do you want to be notified?
   (Telegram / email / just check the content folder)
```

**Step 2 — Design workflow.** Derive from interview: post frequency from Q3, platform priority from Q1, posting mode from P3 Q18b.

**Step 3 — Review — output this to the user:**
```
SOCIAL MEDIA MANAGER — Review before generating

Purpose: Platform-specific post drafts, hashtag strategy, weekly batch drafts

Priority platform: {Q1 answer}
Posting frequency: {Q3 — posts per week per platform}
Post approval mode: draft-only (all platforms pending Q18b settings)
TikTok: always draft — you add trending music before going live
Notification when drafts ready: {Q6 answer}

Skill set:
  draft-post         — create platform-specific drafts
  tiktok-carousel    — 6-slide structure (hook + 4 content + CTA)
  weekly-draft-run   — batch the week's posts on Friday

Trigger phrases:
  "draft posts for this week" / "write a caption for [topic]"
  "create a TikTok carousel" / "batch this week's social"
  "hashtags for [topic]"

Approve? (yes / adjust + what to change)
```

Wait for approval. Then:

**Step 4 — Generate.** **Step 5 — Install.**

Generate full agent package: `.claude/agents/social-media-manager.md`,
`agents/social-media-manager/context/persona.md` (11 sections), and skill files for:
- `draft-post` — create platform-specific post drafts
- `tiktok-carousel` — 6-slide carousel structure
- `weekly-draft-run` — batch draft the week's posts

---

## SECTION 11 — Final Resources & Git Commit

Create `context/publish-log.md` with header row (entries added per published post):
```markdown
| Date | Title | File | Category |
|------|-------|------|----------|
```

Commit everything:
```bash
git add resources/ agents/ .claude/agents/ website/pages/ website/components/ website/styles/ CLAUDE.md context/ standup/ .claude/skills/
git commit -m "bootstrap(p3): business discovery + agent personalisation"
```

---

```
✅ P3 complete.

  ✓ Business identity captured
  ✓ Brand voice written → resources/brand-voice.md
  ✓ Design system written → resources/design-system.md
  ✓ Web style guide written → resources/web-style-guide.md
  ✓ Audience personas written → resources/audience-personas.md
  ✓ Content calendar framework → resources/content-calendar.md
  ✓ SEO strategy written → resources/seo-strategy.md
  ✓ Website pages updated with real business content
  ✓ CLAUDE.md updated with full project context
  ✓ All 4 core agents personalised
  ✓ daily-checkin skill updated with real team names
  {if extended agents added: ✓ Extended agents installed: {list}}

{if extended agents were added with scheduled tasks}
Next:
  1. Click the 📎 attachment icon (bottom-left of the message box)
  2. Select p4-schedules.md from your files
  3. Send it — Claude will activate schedules for your extended team and run final verification

{if no extended agents were added}
Your AI team is fully personalised and ready.
The Project Manager's schedules are already active from P2.

To start using your team right now:
  • "help me write my standup" → Project Manager
  • "write a post about {your first content pillar}" → Writer
  • "generate a hero image for {that post}" → Designer
  • "publish this post" → Web Developer
```
