# P4 — Extended Team Schedules + Verification
> **Prerequisites:** P3 complete. All selected agents installed and personalised.
> **Where:** Claude Desktop — Code tab (generate files), then Chat tab (activate schedules).
> **Time:** ~30–45 minutes
> **Done when:** Extended agent schedules active, all verification tests passed, system confirmed ready.

> **Note:** The Project Manager's 4 core schedules (standup reminder, compile, EOD reminder,
> weekly RAG) were auto-registered in P2. This phase handles schedules for any extended
> agents added in P3 (Product Manager, Marketing Manager, Social Media Manager) plus
> a full system verification run.

---

## INSTRUCTIONS FOR CLAUDE CODE

Run sections in order. Skip Section 1 if no extended agents were added in P3.

**How to communicate throughout P4:**
- Check which agents were installed in P3 before generating anything.
- Before asking the user to activate schedules, explain the Chat tab vs. Code tab difference.
- After each verification test, confirm what passed before continuing.
- Never run checks in silence — narrate what you're testing and why.

---

## SECTION 1 — Extended Agent Schedules

Before starting, check which agents were installed in P3:
```bash
ls .claude/agents/
```

If ONLY the 4 core agents exist (project-manager, writer, designer, web-developer):
```
No extended agents were added in P3 — skipping schedule generation.
Your Project Manager schedules are already active from P2.
Proceeding directly to verification.
```
Skip to Section 2.

---

If extended agents exist, generate schedule entries for each:

Create (or append to) `agents/project-manager/context/schedule-desktop-tasks.md`.
Use the timezone confirmed in P2. Convert all times to local timezone — never UTC.

Format each entry as:
```
# [Task name]
# Runs: [human-readable — e.g. "Monday at 9am Bangkok time"]
# Cron: [cron expression in local timezone]
# Paste this command into the Claude Desktop CHAT tab:
/schedule "[full agent prompt]" --cron "[cron expression]"
```

---

**If Product Manager was installed**, add these scheduled tasks:

**Weekly OKR check (Monday 9am)**
```
/schedule "Read standup/briefings/ from last week. Check if any OKR key results in context/okrs/ moved. Read agents/product-manager/context/persona.md for North Star metric. Flag if the North Star metric is trending down for 2+ consecutive weeks — note as Amber status for this week's RAG report. Write any observation to context/product-notes/YYYY-MM-DD.md." --cron "0 9 * * 1"
```

**Monthly competitive analysis (1st of month 9am)**
```
/schedule "Read agents/product-manager/context/persona.md for the competitor list. Use WebSearch to research each competitor: check for new features, pricing changes, or content from the last 30 days. Update context/competitive-analysis.md — update the competitor table, feature comparison, and strategic insights. Add 'Last updated: {date}' at the top. Flag any competitor move that affects our Now/Next/Later roadmap." --cron "0 9 1 * *"
```

**Quarterly OKR review (1st of January, April, July, October — 9am)**
```
/schedule "Read context/okrs/ for the current quarter. Score each Key Result against target. Determine if Objective was achieved. Draft next quarter's OKRs aligned to resources/content-calendar.md 90-day goal. Refresh context/product-roadmap.md — re-score RICE for items in Now/Next/Later. Write a 1-page vision report to context/vision-reports/YYYY-MM.md: where we are, where we're going, what we learned." --cron "0 9 1 1,4,7,10 *"
```

---

**If Marketing Manager was installed**, add:

**Monthly content calendar (last Friday of month 4pm)**
```
/schedule "Read resources/content-calendar.md and resources/brand-voice.md. Review this month's content performance — check standup/briefings/ for content mentions and completion. Generate next month's content calendar in content/content-calendar/YYYY-MM.md: one post idea per active platform per week, tied to the content pillars. Flag any pillar gaps or seasonal opportunities." --cron "0 16 * * 5L"
```

**Weekly performance summary (Friday 3pm)**
```
/schedule "Read all standup/briefings/ from this week. Check resources/content-calendar.md against what was actually produced. Write a marketing performance summary to standup/briefings/YYYY-MM/marketing-YYYY-MM-DD.md: content published vs. planned, any metrics mentioned, blockers, next week priorities." --cron "0 15 * * 5"
```

---

**If Social Media Manager was installed**, add:

**Weekly draft batch (Friday 2pm)**
```
/schedule "Read resources/brand-voice.md and resources/content-calendar.md for this week's planned posts. For each platform in the active platforms list, draft the week's posts. Write each draft to content/social/YYYY-MM-DD-{platform}.md. Include: caption text, hashtags, image prompt for Designer. Note which posts are auto-post approved vs. draft-only per the posting rules in agents/social-media-manager/context/persona.md." --cron "0 14 * * 5"
```

**Monday analytics reminder (Monday 8am)**
```
/schedule "Send reminder: 'Monday morning — check your social analytics before the week starts. Log any notable numbers (reach, engagement, clicks) in standup/individual/agents.md under social-media-manager. This helps the Product Manager track the North Star metric.'" --cron "0 8 * * 1"
```

---

## SECTION 2 — Activate Extended Schedules

If extended agent schedules were generated in Section 1, output this to the user:

```
The schedule commands for your extended team are ready. Now you need to activate
them in the Claude Desktop Chat tab (the conversation view — different from the Code tab).
Paste each /schedule command there to register it. You only need to do this once.
```

Output this checklist to the user. Complete in the Claude Desktop Chat tab.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACTIVATE EXTENDED TEAM SCHEDULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your schedule commands are in:
  agents/project-manager/context/schedule-desktop-tasks.md

How to activate:
  1. Open that file (in Code or Finder)
  2. Copy each /schedule command
  3. Switch to Claude Desktop CHAT tab
  4. Paste and press Enter — one command at a time

{list only the tasks that were generated for installed agents}

⚠️  Schedules only fire when Claude Desktop is open and your laptop is on.
    If the laptop is closed when a schedule fires, that run is skipped. That's expected.

Come back and say "schedules activated" when done.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Wait for "schedules activated" (or user confirms there are no extended agents to schedule).

---

## SECTION 3 — Verification

Run these checks after schedules are confirmed.

### 3.0 — Confirm PM Schedules from P2 Are Active

```bash
# Check if P2 MCP registration succeeded or fell back to the manual file
if [ -f "agents/project-manager/context/schedule-desktop-tasks.md" ]; then
  echo "⚠️  schedule-desktop-tasks.md exists — P2 MCP registration may have failed."
  echo "    Check if PM schedules are active in Claude Desktop → Scheduled tab."
  echo "    If not active, paste the /schedule commands from the file into the Chat tab before continuing."
else
  echo "✅ No fallback file found — PM schedules were registered via MCP in P2."
fi
```

If the fallback file exists and PM schedules are not yet active, pause here and guide the user to activate them before running verification tests.

---

### 3.1 — File Verification

```bash
# Agent definitions
for f in .claude/agents/*.md; do echo "EXISTS: $f"; done

# Agent personas
for d in agents/*/; do
  p="${d}context/persona.md"
  [ -f "$p" ] && echo "EXISTS: $p" || echo "MISSING: $p"
done

# Resources (should all exist after P3)
for f in resources/brand-voice.md resources/design-system.md resources/web-style-guide.md resources/audience-personas.md resources/content-calendar.md resources/seo-strategy.md; do
  [ -f "$f" ] && echo "EXISTS: $f" || echo "MISSING: $f"
done

# Schedule file (only if extended agents were installed)
[ -f "agents/project-manager/context/schedule-desktop-tasks.md" ] && \
  echo "EXISTS: schedule-desktop-tasks.md" || echo "(no extended schedules — expected if core team only)"

# Publish log
[ -f "context/publish-log.md" ] && echo "EXISTS: context/publish-log.md" || echo "MISSING: context/publish-log.md"
```

If any required file is MISSING: regenerate it before continuing.

### 3.2 — Functional Tests

**Test 1 — Project Manager standup:**
```
Simulate a morning standup message from the Project Manager.
Read agents/project-manager/context/persona.md and produce
the standup reminder message it would send today.
```
Confirm: output references real team names (not {placeholders}) and correct timezone.

**Test 2 — Writer content dry-run:**
```
Ask the Writer agent to draft a 3-sentence social media caption
for the top content pillar from resources/content-calendar.md.
Confirm it reads resources/brand-voice.md first.
```
Confirm: output matches the brand voice and tone from Q8.

**Test 3 — Web Developer build-page dry-run:**
```
Ask the Web Developer to describe what it would do if given a blog brief at
content/topics/my-first-post/brief.md — without actually building anything.
(The file does not need to exist — you're testing the agent's process knowledge.)
```
Confirm: it references `website/pages/blog/posts/my-first-post.jsx` as output and cites `web-style-guide.md`.

**Test 4 — Designer image prompt dry-run:**
```
Ask the Designer to write an image prompt for a blog hero image on the first
content pillar from resources/content-calendar.md.
```
Confirm: prompt includes style, mood, colors, and composition from resources/design-system.md.

---

## SECTION 4 — Final Summary

Output this when all checks pass:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR AI MARKETING TEAM IS READY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{Business Name} — AI team status:

Agent                     Status    Schedules
─────────────────────     ──────    ────────────────────────────────
Project Manager           ✅ Ready  7am reminder · 9am compile · 5pm EOD · Fri 4pm RAG
Writer                    ✅ Ready  On-demand
Designer                  ✅ Ready  On-demand
Web Developer             ✅ Ready  On-demand
{Product Manager if}      ✅ Ready  Mon OKR check · Monthly competitive · Quarterly review
{Marketing Manager if}    ✅ Ready  Weekly performance · Monthly calendar
{Social Manager if}       ✅ Ready  Fri draft batch · Mon analytics reminder

Website: {Vercel URL}
Repository: {GitHub URL}

YOUR FIRST ACTIONS:
1. Write your first standup:
   "help me write my standup" or start a conversation with @project-manager

2. Generate your first content:
   "@writer write a post about {content pillar 1}"

3. Check the PM schedule fired (tomorrow at 9am you'll get your first briefing)

4. Confirm all scheduled tasks in Claude Desktop → Scheduled sidebar

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALWAYS YOUR DECISION:
• Social posts → drafted for your approval first
• Email campaigns → ALWAYS require your approval before sending
• Blog posts → you review before the Web Developer publishes
• Paid spend (ads, tools) → always your call
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your team runs Monday–Friday in the background.
To interact with any agent, just open Claude Desktop and say what you need.
Your team will take it from there.
```

---

## SECTION 5 — Optional Upgrade (OpenClaw)

Present this ONLY after the user confirms the core system is working.
Do not mention it earlier.

> **Note:** OpenClaw, clawhub, and agent-media are third-party tools, not Anthropic products.
> Claude cannot install or verify them — the user follows their documentation independently.

```
OPTIONAL UPGRADE — OpenClaw Daemon

Your core team is running. One upgrade worth considering once you're
publishing consistently:

WHAT IT ADDS (beyond the base system):
  ✓ WhatsApp as a control interface (alternative to Telegram)
  ✓ AI UGC video generation for TikTok (talking head + B-roll + subtitles)

WHEN TO ADD IT:
  - You prefer WhatsApp over Telegram for team notifications
  - You want to produce TikTok videos, not just static carousels
  - Monthly budget $50+ (agent-media starts at ~$39/month)

WHEN TO SKIP IT:
  - Already using Telegram (no need for another comms layer)
  - Only posting static images/carousels
  - Budget under $50/month

Add it? (yes / skip)
```

**If YES:** Ask which chat app they prefer (WhatsApp / Telegram / Slack / Discord),
generate `openclaw.json` adapted to their content calendar and timezone,
create `content/approved/` and `content/published/` folders with `.gitkeep` files,
and output the third-party setup instructions from the OpenClaw docs.

**If SKIP:** Confirm the core system is complete.
Note: "OpenClaw can be added later — see architecture/openclaw-proposal.md if available."

---

```
✅ P4 complete. Bootstrap finished.

Append header row to context/publish-log.md if not already present:

| Date | Title | File | Category |
|------|-------|------|----------|
(entries added per published post)
```
