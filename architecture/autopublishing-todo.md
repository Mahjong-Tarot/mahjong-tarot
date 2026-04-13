# Auto-Publishing TODO

> **Context:** For a team that already has the codebase running and the Project Manager
> agent with scheduled tasks active on their local machine. Goal: get the full
> writer → content → auto-publish pipeline operational.
>
> Each step includes a **Claude Code prompt** you can paste directly into a new session.
> Review and verify outputs before moving to the next step.

---

## 1. Create the Social Media Manager agent

The Social Media Manager owns both content distribution and campaign strategy — combining
what the SETUP.md called two separate agents (Social Media Manager + Marketing Manager)
into one. The writer agent already handles content creation.

- [ ] Create `.claude/agents/social-media-manager.md` (agent definition with `mcp__postiz__*` tools listed)
- [ ] Create `agents/social-media-manager/context/persona.md`
- [ ] Create skill: `agents/social-media-manager/skills/write-social-post/SKILL.md`
- [ ] Create skill: `agents/social-media-manager/skills/tiktok-carousel/SKILL.md` (6-slide, always `type: draft`, fires Telegram after)
- [ ] Create skill: `agents/social-media-manager/skills/weekly-schedule/SKILL.md`
- [ ] Create skill: `agents/social-media-manager/skills/weekly-analytics/SKILL.md`
- [ ] Create skill: `agents/social-media-manager/skills/distribution-checklist/SKILL.md`
- [ ] Create skill: `agents/social-media-manager/skills/content-calendar/SKILL.md`
- [ ] Create skill: `agents/social-media-manager/skills/campaign-brief/SKILL.md`
- [ ] Create skill: `agents/social-media-manager/skills/performance-review/SKILL.md`

**Prompt to run:**

```
Read CLAUDE.md and the existing agent definitions in .claude/agents/ and
agents/*/context/persona.md to understand the project conventions and persona format.

Create a single Social Media Manager agent that owns both content distribution AND
campaign strategy for The Mahjong Tarot (Bill Hajdu's mahjong symbolism / Chinese
astrology / tarot readings site). The writer agent already exists and handles all
written content — the Social Media Manager picks up after the writer is done.

Files to create:

1. .claude/agents/social-media-manager.md
   Tools: Read, Write, Glob, Grep, Bash, WebSearch, and all mcp__postiz__* tools.
   Hard rules:
   - Always call integrationList first to confirm channel IDs
   - Always call integrationSchema before the first post of a new type on any platform
   - TikTok must always use type "draft" — never "schedule" or "now"
   - After any TikTok draft, send Telegram: "Draft ready for [topic] — open TikTok
     app → Drafts → add trending music → go live at [time]"
   - Email campaigns always require human approval before sending
   Trigger phrases: "schedule this post", "distribute this content", "what's posting
   this week", "generate the content calendar", "plan a campaign", "weekly analytics",
   "review this month's performance"

2. agents/social-media-manager/context/persona.md
   Full persona using the same structure as agents/project-manager/context/persona.md.
   The agent owns: Postiz scheduling, TikTok drafts, content calendar, campaign briefs,
   weekly analytics, and distribution approval routing.

3. agents/social-media-manager/skills/write-social-post/SKILL.md
   Platform-specific post copy with hashtags and CTA for Instagram, Facebook, LinkedIn, X.

4. agents/social-media-manager/skills/tiktok-carousel/SKILL.md
   6 slides (hook + 4 content + CTA). Always type "draft". Sends Telegram after.

5. agents/social-media-manager/skills/weekly-schedule/SKILL.md
   Assemble this week's content, call Postiz tools per platform, send Telegram summary.

6. agents/social-media-manager/skills/weekly-analytics/SKILL.md
   Call postiz analytics, format into a Telegram report: top post, impressions,
   follower change, one recommendation for next week.

7. agents/social-media-manager/skills/distribution-checklist/SKILL.md
   Pre-publish quality gate before any Postiz call.

8. agents/social-media-manager/skills/content-calendar/SKILL.md
   Generate a 4-week content calendar based on The Mahjong Tarot's content pillars
   (Mahjong symbolism, Chinese astrology, tarot readings, relationships, personal growth).

9. agents/social-media-manager/skills/campaign-brief/SKILL.md
   Write a structured campaign brief for any initiative.

10. agents/social-media-manager/skills/performance-review/SKILL.md
    Compile weekly/monthly performance summary across all platforms.

Do not use placeholders — write real content tailored to The Mahjong Tarot.
```

**Verify:** All files exist. Read the persona and confirm it reads as a coherent single agent
that owns both distribution and strategy. Confirm the hard rules are present in the agent definition.

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

- [ ] Create `agents/writer/skills/write-social/SKILL.md`
- [ ] Create `agents/writer/skills/write-email/SKILL.md`

**Prompt to run:**

```
Read agents/writer/context/persona.md and agents/writer/skills/write-post/SKILL.md
to understand the writer agent's conventions and SKILL.md format.

Then create two new skills:

1. agents/writer/skills/write-social/SKILL.md
   - Purpose: generate platform-specific social captions from a finished blog post
   - Steps: read the blog post, read resources/brand-voice.md, write captions for
     Instagram, Facebook, LinkedIn, and X — each with appropriate length, tone,
     hashtags, and CTA for the platform
   - Output: a social-captions.md file saved to content/topics/<slug>/
   - Edge cases: post too long for platform limits, no clear hook in the source post

2. agents/writer/skills/write-email/SKILL.md
   - Purpose: write a newsletter edition or campaign email from a blog post or brief
   - Steps: read source content, read brand voice, write subject line + preview text +
     body (intro, main content, CTA, sign-off)
   - Output: email.md saved to content/topics/<slug>/
   - Edge cases: no source post exists yet (start from a brief), subscriber list not specified

Both skills must follow the same frontmatter format as write-post/SKILL.md.
```

**Verify:** Read both files and confirm they follow the SKILL.md format with numbered steps, file paths, and edge cases.

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
Run a full end-to-end autopublishing test using the existing content in content/topics/.
If no topic exists, use this brief: write a short blog post about what the Dragon tile
means in Mahjong fortune-telling and how it connects to personal power.

Steps:
1. @writer — write the post using the write-post skill. Save output to content/topics/dragon-tile-meaning/
2. @web-developer — publish the post: generate the JSX component, update the blog index,
   stage and commit (do not push — output the git push command for the user to run)
3. @social-media-manager — run the distribution-checklist skill, then distribute:
   - Instagram: schedule via Postiz
   - TikTok: create a draft via Postiz, send Telegram notification

After each step, report what was created and where. Stop and flag any errors before continuing.
```

**Verify:**
- `content/topics/dragon-tile-meaning/` contains blog.md and social-captions.md
- `website/pages/blog/posts/dragon-tile-meaning.jsx` exists
- Blog index updated with the new card at the top
- Postiz shows a scheduled Instagram post and a TikTok draft
- Telegram received the "Draft ready — add music" message

---

## Shortest path to first working run

**Step 2 (Postiz) → Step 1 SMM agent only → Step 5 (web-developer definition) → Step 6 pipeline test.**

Marketing Manager, writer skills, and resource files can follow once the core pipeline is proven.
