# Auto-Publishing TODO

> **Context:** For a team that already has the codebase running and the Project Manager
> agent with scheduled tasks active on their local machine. Goal: get the full
> writer → content → auto-publish pipeline operational.
>
> Each step includes a **Claude Code prompt** you can paste directly into a new session.
> Review and verify outputs before moving to the next step.

---

## Where to start

Do **not** follow the numbered steps in order. The fastest path to a working pipeline is:

1. **Step 2 first** — wire up Postiz (manual account setup, then run the prompt)
2. **Step 1 second** — create the Social Media Manager agent
3. **Step 5 third** — add the web developer agent definition
4. **Step 6 last** — run the end-to-end test

Steps 3 and 4 (brand resources and writer skills) can wait until after the pipeline works.

---

## 1. Create the Social Media Manager agent

**Responsibility split:**
- **Writer** — produces all written content: blog posts, social captions, email copy, TikTok slide text
- **Social Media Manager** — owns the calendar, scheduling, distribution via Postiz, and analytics. Never writes content. Picks up after the writer is done.

- [ ] Create `.claude/agents/social-media-manager.md` (agent definition)
- [ ] Create `agents/social-media-manager/context/persona.md`
- [ ] Create skill: `agents/social-media-manager/skills/content-calendar/SKILL.md`
- [ ] Create skill: `agents/social-media-manager/skills/weekly-schedule/SKILL.md`
- [ ] Create skill: `agents/social-media-manager/skills/distribution-checklist/SKILL.md`
- [ ] Create skill: `agents/social-media-manager/skills/weekly-analytics/SKILL.md`
- [ ] Create skill: `agents/social-media-manager/skills/performance-review/SKILL.md`

**Prompt to run:**

```
I need to build a Social Media Manager agent from scratch for The Mahjong Tarot project.
There are no existing social media agent files — start fresh.

--- PHASE: INTERVIEW ---

Before writing any files, ask me these 3 questions in a single message. Wait for all
answers before proceeding.

SOCIAL MEDIA MANAGER SETUP

1. Which platforms do you want to publish to, and for each: auto-post or draft?
   (e.g. Instagram → auto, TikTok → draft, LinkedIn → skip)
   Note: TikTok is always draft — the Postiz API cannot add music.

2. How often per week, and on which days/times, should content go out?
   (e.g. Instagram: Tue + Fri 7pm, TikTok: Thu 6pm — or say "research best times")

3. Which timezone are you in?

Once I have your answers, research the exact API requirements and constraints for each
chosen platform via Postiz, then build the agent to match.

--- PHASE: QUICK BUILD (if user says "DIY" or "just build it") ---

Skip the interview. Instead:

1. Search the web for current Postiz MCP documentation and the schedulePostTool API —
   specifically the supported type values (schedule / draft / now) and platform-specific
   constraints (character limits, image specs, video requirements).
   If web search returns no clear results, call mcp__postiz__integrationSchema directly
   on a connected platform and use the live schema as the source of truth.

2. Research current best-practice posting frequencies and optimal times for each
   platform chosen.

3. Make sensible default decisions for all interview questions and document them in
   agents/social-media-manager/context/assumptions.md before creating any other files.

--- PHASE: CREATE FILES ---

After interview answers (or Quick Build research), create these files:

1. .claude/agents/social-media-manager.md
   - YAML frontmatter: name, description, model: sonnet, tools list
   - Tools: Read, Glob, and all mcp__postiz__* tools only
     (this agent never runs shell commands or writes code)
   - Trigger phrases based on answers: "schedule this post", "distribute this content",
     "what's posting this week", "generate the content calendar", "weekly analytics"
   - Hard rules:
     * Never write content — if copy is missing, stop and tell the user to run the writer first
     * Call integrationList once at the start of each session to confirm channel IDs
     * On first use of any platform, call integrationSchema and save the result to
       agents/social-media-manager/context/platform-constraints.md — read from that
       file on all future runs, only re-fetch on a validation error
     * TikTok: always type "draft", never "schedule" or "now"; after creating the draft,
       notify the user: "Draft ready for [topic] — open TikTok app → Drafts → add
       trending music → go live at [time]"
     * Any platform set to "draft": create draft + notify, never auto-post

2. agents/social-media-manager/context/persona.md
   - Identity, purpose, and what this agent owns
   - Platforms it manages and posting schedule per platform (from answers or defaults)
   - Platform constraints table (character limits, image sizes, video specs) — populated
     from real research or integrationSchema, never guessed
   - Escalation rules: when to notify vs act silently

3. agents/social-media-manager/skills/content-calendar/SKILL.md
   Generate a 4-week calendar from content pillars and posting frequency.
   Output: resources/content-calendar.md with dated slots.

4. agents/social-media-manager/skills/weekly-schedule/SKILL.md
   Read this week's calendar slots. For each: verify writer output exists in
   content/topics/<slug>/, run distribution-checklist, call Postiz with the correct
   type per platform. Send a summary of what was scheduled.

5. agents/social-media-manager/skills/distribution-checklist/SKILL.md
   Pre-publish gate. Checks: caption file exists, image is WebP, no placeholder text,
   platform constraints met (character limit, image dimensions). Halt on any failure.

6. agents/social-media-manager/skills/weekly-analytics/SKILL.md
   Note: before writing this skill, verify that Postiz MCP exposes an analytics tool
   by checking integrationList or Postiz docs. If no analytics tool exists, this skill
   should instruct the user to export from the Postiz web UI instead.
   If it does exist: call it, format a brief report (top post, impressions, follower
   change, one recommendation), deliver on the day chosen in interview or Monday.

7. agents/social-media-manager/skills/performance-review/SKILL.md
   Monthly summary across all platforms. Write to standup/briefings/.
```

**Verify:**
- All 7 files exist
- The persona's platform constraints table contains real values (character limits, image sizes), not placeholders
- The agent definition lists only `Read`, `Glob`, and `mcp__postiz__*` tools — no `Bash`
- The "never write content" hard rule is explicitly present
- Each skill's output path matches the project folder structure

---

## 2. Wire up Postiz MCP

**Manual steps — Claude Code cannot do these for you:**

- [ ] Sign up at postiz.com and connect your social accounts (Instagram, TikTok, etc.)
- [ ] Get your API key: Postiz → Settings → Developers → Public API → Generate key
- [ ] Open `.claude/settings.local.json` and add the `postiz` block inside `mcpServers`.
  If the file already exists, merge — don't overwrite. The complete structure looks like:
  ```json
  {
    "mcpServers": {
      "postiz": {
        "url": "https://mcp.postiz.com/mcp/YOUR_ACTUAL_KEY"
      }
    }
  }
  ```
  Replace `YOUR_ACTUAL_KEY` with your real key. If you're self-hosting Postiz, change
  the domain to your own instance URL.
- [ ] Restart Claude Code

**Then run this prompt to create the reference doc and verify the connection:**

```
Read .claude/settings.local.json to confirm the postiz MCP entry exists and has a
real API key (not the placeholder text).

Then create context/postiz-setup.md with:
- What Postiz MCP does and which tools it provides
- The one-time setup steps (sign up, connect channels, get API key, update
  settings.local.json, restart Claude Code)
- How to verify the connection is live
- TikTok draft rule: the API cannot add music — agent always uses type "draft",
  user opens TikTok app → Drafts → adds trending music → publishes manually
- A note for self-hosted Postiz: change the MCP URL to your own instance

After writing the file, call the Postiz integrationList tool to list all connected
platforms and confirm the MCP connection is live.
```

**Verify:** You should see your connected social channels listed in the output. If you
see an authentication error, double-check the API key in `.claude/settings.local.json`
and restart Claude Code again.

---

## 3. Fill in missing resources (brand context for agents)

All `resources/` files except `README.md` are missing — agents need these to write on-brand.

- [ ] Create `resources/brand-voice.md`
- [ ] Create `resources/audience-personas.md`
- [ ] Create `resources/content-calendar.md`
- [ ] Create `resources/seo-strategy.md`
- [ ] Create `resources/design-system.md`

**Prompt to run:**

```
Read CLAUDE.md, agents/writer/context/persona.md, and agents/web-developer/context/
to understand The Mahjong Tarot project and Bill Hajdu's brand.

Then create these five resource files with real, specific content (no placeholders).
Everything must be grounded in The Mahjong Tarot — mahjong tiles, Chinese astrology,
tarot readings, Bill Hajdu's personal practice and book.

1. resources/brand-voice.md
   - Business name: The Mahjong Tarot
   - Brand personality (warm, wise, mystical, grounded, direct)
   - Tone guidelines: how to open posts, how to close, formal vs conversational
   - Words to use / words to avoid
   - 3 on-brand example sentences (must reference mahjong or astrology specifically)
   - 3 off-brand example sentences

2. resources/audience-personas.md
   - Primary ICP: who buys the book / books readings (demographics, psychographics,
     pain points, what they search for, where they spend time online)
   - 2 secondary audience segments

3. resources/content-calendar.md
   - Content pillars: Mahjong symbolism, Chinese astrology, tarot readings,
     relationships & love, personal growth
   - Weekly posting rhythm (blog + social)
   - Monthly content themes framework
   - Blank first-month calendar grid (the Social Media Manager agent will fill this in)

4. resources/seo-strategy.md
   - Primary search intent for this site
   - 10 seed keywords
   - Content format priorities
   - Internal linking strategy
   - SEO checklist per post (matching the existing quality checklist in CLAUDE.md)

5. resources/design-system.md
   - Open website/styles/globals.css and copy the exact CSS variable names into this file
   - Typography preferences
   - Image style guidelines (hero images, social cards)
   - Standard image sizes: hero, thumbnail, card, OG, social
   - Do's and don'ts for visual content
```

**Verify:**
- `resources/brand-voice.md` mentions Bill Hajdu by name and references Mahjong tiles or Chinese astrology — if it could apply to any wellness brand, regenerate it
- `resources/design-system.md` CSS variable names match exactly what is in `website/styles/globals.css`
- No file contains the word "placeholder" or generic filler text

---

## 4. Add missing writer skills

The writer produces all content — blog posts, social captions, TikTok slide text, and
email copy. These two skills extend the writer to cover the full content pipeline.

- [ ] Create `agents/writer/skills/write-social/SKILL.md`
- [ ] Create `agents/writer/skills/write-email/SKILL.md`

**Prompt to run:**

```
Read agents/writer/context/persona.md and agents/writer/skills/write-post/SKILL.md
to understand the writer agent's conventions and SKILL.md format. Note the exact
output file names that write-post already generates (e.g. social-instagram.md,
social-facebook.md, etc.) — the new write-social skill must use the same naming
convention so the Social Media Manager can find files consistently.

The writer owns ALL content. These skills extend the writer so the Social Media
Manager only schedules — never writes.

Create two new skills:

1. agents/writer/skills/write-social/SKILL.md
   - Purpose: generate platform-specific social captions from a finished blog post
   - Steps: read content/topics/<slug>/blog.md, read resources/brand-voice.md, then
     write captions for each active platform using the same output filenames as
     write-post already uses
   - TikTok output: exactly 6 slides — 1 hook slide, 4 content slides, 1 CTA slide,
     each slide max 3 lines of text
   - Edge cases: caption exceeds platform character limit, no clear hook in source post

2. agents/writer/skills/write-email/SKILL.md
   - Purpose: write a newsletter edition or campaign email from a blog post or brief
   - Steps: read source content, read resources/brand-voice.md, write subject line +
     preview text + body (intro, main content, CTA, sign-off in Bill's voice)
   - Output: email.md saved to content/topics/<slug>/
   - Edge cases: no source post yet (start from a topic brief), subscriber list not specified

Both skills must follow the same frontmatter format as write-post/SKILL.md.
```

**Verify:**
- Both files follow the SKILL.md format with numbered steps, file paths, and edge cases
- write-social output filenames match the convention already used by write-post
- TikTok slide spec is explicit: exactly 6 slides, max 3 lines each

---

## 5. Add the web developer to `.claude/agents/`

- [ ] Create `.claude/agents/web-developer.md`

**Prompt to run:**

```
Read agents/web-developer/context/persona.md and .claude/agents/project-manager.md
to understand the agent definition format used in this project.

Then create .claude/agents/web-developer.md with:
- YAML frontmatter: name, description (trigger phrases), model: sonnet, tools list
- Tools: Read, Write, Edit, Glob, Grep, Bash
- Trigger phrases: "publish this post", "update the website", "build a page",
  "deploy", "update the blog index"
- Reference to the build-page skill at agents/web-developer/skills/build-page.md
- Hard rules from CLAUDE.md: never auto-push to GitHub, always stage files explicitly
  by name (never git add .), always run git status before any file work
```

**Verify:** The file exists at `.claude/agents/web-developer.md` and follows the same
format as the other agent definitions in `.claude/agents/`.

---

## 6. Test the end-to-end pipeline

**Prerequisites: Steps 1, 2, and 5 must be complete before running this test.
Steps 3 and 4 are optional for the test but recommended for quality output.**

**Run on a test branch first** to avoid a test post appearing in the real git history:
```bash
git checkout -b test/e2e-pipeline
```

- [ ] Writer produces a post and social captions
- [ ] Web developer publishes to the website
- [ ] Social Media Manager distributes via Postiz
- [ ] TikTok draft confirmed (not auto-posted)
- [ ] Telegram notification fires

**Prompt to run:**

```
Before starting: call the Postiz integrationList tool and confirm you can see the
connected social channels. If you cannot, stop here — Postiz is not connected.
Return to Step 2 of the setup guide.

If Postiz is connected, run the full end-to-end pipeline test below.

Brief: write a short blog post about what the Dragon tile means in Mahjong
fortune-telling and how it connects to personal power.

Run these in order. Stop and report any errors before continuing to the next step.

1. @writer — write the blog post using the write-post skill.
   Output: content/topics/dragon-tile-meaning/blog.md

2. @writer — write social captions using the write-social skill.
   Output: per-platform caption files in content/topics/dragon-tile-meaning/
   (must include TikTok 6-slide text: 1 hook + 4 content + 1 CTA slide)

3. @web-developer — publish the post: generate the JSX component, update the blog
   index, stage the files. Do NOT commit yet — show me the staged files first so
   I can review before committing.

4. @social-media-manager — run the distribution-checklist skill, then distribute:
   - Instagram: schedule via Postiz (type "schedule")
   - TikTok: create a draft via Postiz (type "draft"), then notify the user

After each step, report what was created and where it was saved.
```

**Verify:**
- `content/topics/dragon-tile-meaning/blog.md` exists
- Platform caption files exist in `content/topics/dragon-tile-meaning/`
- TikTok output has exactly 6 slides
- `website/pages/blog/posts/dragon-tile-meaning.jsx` exists
- Blog index has the new post card at the top
- Postiz shows a scheduled Instagram post and a TikTok draft (not scheduled)
- Telegram received the "Draft ready — add music" message

After confirming all checks pass, commit and clean up:
```bash
git add website/pages/blog/posts/dragon-tile-meaning.jsx website/pages/blog/index.jsx
git commit -m "test: e2e pipeline verification"
git checkout main
git branch -d test/e2e-pipeline
```
