# Auto-Publishing TODO

> **Context:** For a team that already has the codebase running and the Project Manager
> agent with scheduled tasks active on their local machine. Goal: get the full
> writer → content → auto-publish pipeline operational.
>
> Each step includes a **Claude Code prompt** you can paste directly into a new session.
> Review and verify outputs before moving to the next step.

---

## 1. Create the Social Media Manager agent

**Responsibility split:**
- **Writer** — produces all written content: blog posts, social captions, email copy, TikTok slide text
- **Social Media Manager** — owns the calendar, scheduling, distribution via Postiz, and analytics. Never writes content. Picks up after the writer is done.

- [ ] Create `.claude/agents/social-media-manager.md` (agent definition with `mcp__postiz__*` tools listed)
- [ ] Create `agents/social-media-manager/context/persona.md`
- [ ] Create skill: `agents/social-media-manager/skills/content-calendar/SKILL.md`
- [ ] Create skill: `agents/social-media-manager/skills/weekly-schedule/SKILL.md`
- [ ] Create skill: `agents/social-media-manager/skills/distribution-checklist/SKILL.md`
- [ ] Create skill: `agents/social-media-manager/skills/weekly-analytics/SKILL.md`
- [ ] Create skill: `agents/social-media-manager/skills/performance-review/SKILL.md`

**Prompt to run:**

```
Read CLAUDE.md and the existing agent definitions in .claude/agents/ and
agents/*/context/persona.md to understand the project conventions and persona format.
Also read agents/writer/context/persona.md to understand what the writer already owns.

Create the Social Media Manager agent for The Mahjong Tarot. This agent owns the
calendar, scheduling, and distribution pipeline — it never writes content. The writer
agent produces all copy (blog posts, social captions, TikTok slide text, email copy).
The Social Media Manager picks up finished content and gets it published via Postiz.

Files to create:

1. .claude/agents/social-media-manager.md
   Tools: Read, Write, Glob, Grep, Bash, and all mcp__postiz__* tools.
   Hard rules:
   - Never write content — if copy is missing, trigger the writer agent first
   - Always call integrationList first to confirm channel IDs
   - Always call integrationSchema before the first post of a new type on any platform
   - TikTok must always use type "draft" — never "schedule" or "now"
   - After any TikTok draft, send Telegram: "Draft ready for [topic] — open TikTok
     app → Drafts → add trending music → go live at [time]"
   - Email campaigns always require human approval before sending
   Trigger phrases: "schedule this post", "distribute this content", "what's posting
   this week", "generate the content calendar", "weekly analytics", "review performance"

2. agents/social-media-manager/context/persona.md
   Full persona using the same structure as agents/project-manager/context/persona.md.
   This agent owns: content calendar, Postiz scheduling, TikTok drafts, approval
   routing, weekly analytics, and performance reporting.

3. agents/social-media-manager/skills/content-calendar/SKILL.md
   Generate a 4-week content calendar based on content pillars (Mahjong symbolism,
   Chinese astrology, tarot readings, relationships, personal growth) and what the
   writer has already produced in content/topics/. Output to resources/content-calendar.md.

4. agents/social-media-manager/skills/weekly-schedule/SKILL.md
   Read this week's entries from the content calendar, check that writer output exists
   in content/topics/<slug>/ for each, then call Postiz tools per platform:
   - TikTok: schedulePostTool with type "draft"
   - All other auto-post platforms: schedulePostTool with type "schedule"
   - Draft-only platforms: schedulePostTool with type "draft", then send Telegram for approval
   Send a Telegram summary of what was scheduled.

5. agents/social-media-manager/skills/distribution-checklist/SKILL.md
   Pre-publish quality gate. Checks: writer output exists, captions are present for all
   platforms, images are optimised WebP, no placeholder text remains. Run before any
   Postiz call.

6. agents/social-media-manager/skills/weekly-analytics/SKILL.md
   Call Postiz analytics tools, format into a Telegram report: top post, total
   impressions, follower change, one recommendation for next week.

7. agents/social-media-manager/skills/performance-review/SKILL.md
   Compile a weekly/monthly performance summary across all platforms. Write to
   standup/briefings/ as a performance report.

Do not use placeholders — write real content tailored to The Mahjong Tarot.
```

**Verify:** All files exist. Read the persona and confirm it contains no content-writing
responsibilities. Confirm the "never write content" hard rule is present in the agent definition.

---

## 2. Wire up Postiz MCP

**Manual steps (Claude Code cannot do these for you):**

- [ ] Sign up at postiz.com and connect social accounts (Instagram, TikTok, etc.)
- [ ] Get API key: Postiz → Settings → Developers → Public API
- [ ] Add to `.claude/settings.local.json`:
  ```json
  "postiz": {
    "url": "https://api.postiz.com/mcp/YOUR_ACTUAL_KEY"
  }
  ```
- [ ] Restart Claude Code

**Then run this prompt to create the reference doc and verify the connection:**

```
Read .claude/settings.local.json to confirm the postiz MCP entry exists.

Then create context/postiz-setup.md with:
- What Postiz MCP does and which tools it provides
- The one-time setup steps (sign up, connect channels, get API key, update settings.local.json, restart)
- How to verify the connection is working
- TikTok draft rule: API cannot add music — agent always uses type "draft", user opens
  TikTok app → Drafts → adds trending music → publishes manually
- A note for self-hosted Postiz users on how to change the URL

After writing the file, call the Postiz integrationList tool to list connected platforms
and confirm the MCP connection is live.
```

**Verify:** You should see your connected social channels listed in the output.

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

Then create these five resource files with real, specific content for this project
(no placeholders):

1. resources/brand-voice.md
   - Business name: The Mahjong Tarot
   - Brand personality adjectives (warm, wise, mystical, grounded, direct)
   - Tone guidelines: how to open posts, how to close, formal vs conversational
   - Words to use / words to avoid
   - 3 on-brand example sentences
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
   - Blank first-month calendar grid for Marketing Manager to fill

4. resources/seo-strategy.md
   - Primary search intent for this site
   - 10 seed keywords
   - Content format priorities
   - Internal linking strategy
   - SEO checklist per post (matching the existing quality checklist in CLAUDE.md)

5. resources/design-system.md
   - Brand colors and CSS variable names (cross-reference website/styles/globals.css)
   - Typography preferences
   - Image style guidelines (hero images, social cards)
   - Standard image sizes: hero, thumbnail, card, OG, social
   - Do's and don'ts for visual content
```

**Verify:** Read each file and confirm the content is specific to The Mahjong Tarot, not generic.

---

## 4. Add missing writer skills

The writer produces all content — blog posts, social captions, TikTok slide text, and
email copy. These two skills extend the writer to cover the full content pipeline that
the Social Media Manager then schedules.

- [ ] Create `agents/writer/skills/write-social/SKILL.md` (platform captions + TikTok slide text from a finished blog post)
- [ ] Create `agents/writer/skills/write-email/SKILL.md` (newsletter / campaign email)

**Prompt to run:**

```
Read agents/writer/context/persona.md and agents/writer/skills/write-post/SKILL.md
to understand the writer agent's conventions and SKILL.md format.

The writer owns ALL content — including social captions and email copy. These skills
extend the writer so the Social Media Manager only has to schedule, never write.

Create two new skills:

1. agents/writer/skills/write-social/SKILL.md
   - Purpose: generate platform-specific social captions from a finished blog post
   - Steps: read content/topics/<slug>/blog.md, read resources/brand-voice.md, then
     write captions for Instagram, Facebook, LinkedIn, X, and TikTok slide text
     (6 slides: hook + 4 content slides + CTA) — each with appropriate length, tone,
     hashtags, and CTA for the platform
   - Output: social-captions.md saved to content/topics/<slug>/
   - Edge cases: post too long for platform limits, no clear hook in the source post

2. agents/writer/skills/write-email/SKILL.md
   - Purpose: write a newsletter edition or campaign email from a blog post or brief
   - Steps: read source content, read resources/brand-voice.md, write subject line +
     preview text + body (intro, main content, CTA, sign-off in Bill's voice)
   - Output: email.md saved to content/topics/<slug>/
   - Edge cases: no source post yet (start from a topic brief), subscriber list not specified

Both skills must follow the same frontmatter format as write-post/SKILL.md.
```

**Verify:** Read both files and confirm they follow the SKILL.md format with numbered steps,
file paths, and edge cases. Confirm TikTok slide text is included in write-social.

---

## 5. Add the web developer to `.claude/agents/`

- [ ] Create `.claude/agents/web-developer.md`

**Prompt to run:**

```
Read agents/web-developer/context/persona.md and .claude/agents/project-manager.md
to understand the agent definition format used in this project.

Then create .claude/agents/web-developer.md — the Claude Code agent definition for
the Web Developer. It should:
- Have YAML frontmatter: name, description (trigger phrases for publishing tasks),
  model: sonnet, and tools list (Read, Write, Edit, Glob, Grep, Bash)
- Reference the build-page skill at agents/web-developer/skills/build-page.md
- List trigger phrases: "publish this post", "update the website", "build a page",
  "deploy", "update the blog index"
- Include hard rules matching CLAUDE.md: never auto-push, always stage files
  explicitly by name, always run git status first
```

**Verify:** The file exists at `.claude/agents/web-developer.md` and follows the same format as the other agent definitions.

---

## 6. Test the end-to-end pipeline

Once all the above is done, run these in sequence and verify each output before the next.

- [ ] Writer produces a post
- [ ] Web developer publishes it
- [ ] Social Media Manager distributes it
- [ ] TikTok draft confirmed (not scheduled)
- [ ] Telegram notification fires

**Prompt to run:**

```
Run a full end-to-end autopublishing test. Use this brief: write a short blog post
about what the Dragon tile means in Mahjong fortune-telling and how it connects to
personal power.

Steps — run in order, stop and report any errors before continuing:

1. @writer — write the blog post using the write-post skill.
   Output: content/topics/dragon-tile-meaning/blog.md

2. @writer — write social captions using the write-social skill.
   Output: content/topics/dragon-tile-meaning/social-captions.md
   (must include Instagram, Facebook, LinkedIn, X, and TikTok 6-slide text)

3. @web-developer — publish the post: generate the JSX component, update the blog
   index, stage and commit. Do not push — output the git push command for the user.

4. @social-media-manager — run the distribution-checklist skill, then distribute:
   - Instagram: schedule via Postiz (type "schedule")
   - TikTok: create a draft via Postiz (type "draft"), send Telegram notification

After each step report what was created and where.
```

**Verify:**
- `content/topics/dragon-tile-meaning/blog.md` exists
- `content/topics/dragon-tile-meaning/social-captions.md` exists with all platform captions
- `website/pages/blog/posts/dragon-tile-meaning.jsx` exists
- Blog index updated with the new card at the top
- Postiz shows a scheduled Instagram post and a TikTok draft
- Telegram received the "Draft ready — add music" message

---

## Shortest path to first working run

**Step 2 (Postiz) → Step 1 SMM agent only → Step 5 (web-developer definition) → Step 6 pipeline test.**

Marketing Manager, writer skills, and resource files can follow once the core pipeline is proven.
