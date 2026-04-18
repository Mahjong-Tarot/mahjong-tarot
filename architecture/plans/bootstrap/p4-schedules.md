# P4 — Schedules & Verification
> **Prerequisites:** P3 complete. All agents installed.
> **Where:** Claude Desktop — Code tab (generate), then Chat tab (activate schedules).
> **Time:** ~30–45 minutes
> **Done when:** All schedules active, verification tests passed, system confirmed working.

---

## INSTRUCTIONS FOR CLAUDE CODE

This is the final phase. Run sections in order.

**How to communicate with the user throughout P4:**
- Before generating schedule files, explain in one sentence what a schedule does.
- Before asking the user to activate schedules, explain the Chat tab vs. Code tab difference.
- After each verification test, confirm what passed before continuing.
- Never run checks in silence — always narrate what you're testing and why.

---

## SECTION 1 — Generate Schedule Files

Before starting, say:
```
I'm going to set up automatic schedules for your AI team.
A schedule is like setting an alarm — you tell Claude "run this task every Monday at 9am"
and it fires automatically as long as Claude Desktop is open.
Your agents will check in, compile standups, and generate content reports
without you having to ask.
I'll generate all the schedule commands first, then walk you through activating them one by one.
```

Create `agents/project-manager/context/schedule-desktop-tasks.md`.

This file contains ready-to-paste `/schedule` commands for every automated task.
Use the timezone from P2 Q19. Convert all times to the user's local timezone — never UTC.

Format each entry as:
```
# [Task name]
# Runs: [human-readable — e.g. "Mon-Fri at 7am Bangkok time"]
# Cron: [cron expression in user's local timezone]
# Paste this command into the Claude Desktop Chat tab:
/schedule "[full agent prompt]" --cron "[cron expression]"
```

Generate entries for ALL of these tasks:

| Task | Default time | Agent prompt |
|------|-------------|-------------|
| Morning standup reminder | Mon-Fri 7am | Read standup/individual/*.md, check if today's entry exists for each team member, send a friendly reminder to anyone who hasn't checked in yet. Format: "@{name} — standup time! Add your check-in to standup/individual/{name}.md" |
| Standup compile | Mon-Fri 9am | Read all standup/individual/*.md entries for today. Compile a daily briefing in this format: Date, each team member's Yesterday/Today/Blockers, any shared blockers or risks. Write to standup/briefings/YYYY-MM/YYYY-MM-DD.md. If anyone hasn't checked in, note "Not received" — do not fabricate. |
| EOD check-in reminder | Mon-Fri 5pm | Send an end-of-day reminder: "Day wrap-up time. Add your check-in for tomorrow's standup to standup/individual/{name}.md. What did you finish today? What's first tomorrow? Any blockers?" |
| Monthly content calendar | 1st of month 9am | Read resources/content-calendar.md and resources/brand-voice.md. Generate next month's content calendar — one post idea per active platform per week, tied to the content pillars. Write to content/calendar/YYYY-MM.md. Flag any pillar gaps or seasonal opportunities. |
| Weekly performance report | Friday 4pm | Read all standup/briefings/ entries from this week. Generate a RAG status report: overall status (Red/Amber/Green), key wins, risks, decisions needed. Write to standup/briefings/YYYY-MM/weekly-rag-YYYY-MM-DD.md. |

**If additional agents were installed in P3**, add their scheduled tasks here too:
- Designer: weekly image generation reminder (Monday before publish days)
- Social Media Manager: weekly draft assembly (Friday), Monday analytics reminder
- Marketing Manager: monthly calendar review (last Friday of month)

Also create `agents/project-manager/context/workflows/daily-standup.md`:
```markdown
# Daily Standup Workflow

## Step 1: Morning Reminder ({7am Q19 timezone})
- Read standup/individual/*.md
- Check for today's entries (date heading = today)
- Send reminder to any team member missing today's entry
- Format: friendly, not nagging — one reminder per person per day

## Step 2: Compile Briefing ({9am Q19 timezone})
- Read all standup/individual/*.md entries for today
- For each team member: extract Yesterday / Today / Blockers
- Note any shared blockers or recurring risks
- Write compiled briefing to standup/briefings/YYYY-MM/YYYY-MM-DD.md
- If check-in missing: write "Not received — {name}"

## Step 3: Distribution
- If Telegram is configured: send briefing summary (3–5 lines max)
- If no Telegram: briefing is in standup/briefings/ for async review

## Fallbacks
- If no check-ins by 9am: compile with all "Not received", note in briefing
- If briefings folder missing: create it, then write
- If Telegram fails: log error in briefing footer, continue
```

---

## SECTION 2 — Activate Schedules

Before outputting the checklist, say:
```
The schedule commands are ready. Now you need to activate them in the Claude Desktop Chat tab.
(Chat is a different tab from Code — it's the conversation view on the left sidebar.)
Each /schedule command you paste registers one automatic task with Claude Desktop.
You only need to do this once — the schedules persist until you delete them.
```

Output this checklist to the user. They must complete this in the Claude Desktop Chat tab.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACTIVATE YOUR SCHEDULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your schedule commands are in:
  agents/project-manager/context/schedule-desktop-tasks.md

How to find that file:
  → In Claude Code: type "show me schedule-desktop-tasks.md"
  → In Finder/Explorer: {project-folder} → agents → project-manager → context

For each task below:
1. Copy the /schedule command from the file
2. Switch to the Claude Desktop CHAT tab
3. Paste the command and press Enter

□ Morning standup reminder   Mon-Fri {7am your timezone}
□ Standup compile            Mon-Fri {9am your timezone}
□ EOD check-in reminder      Mon-Fri {5pm your timezone}
□ Monthly content calendar   1st of month {9am your timezone}
□ Weekly performance report  Friday {4pm your timezone}
{any additional agent schedules from P3}

⚠️  Schedules only fire when Claude Desktop is open and your laptop is on.
    If the laptop is closed → that reminder doesn't fire that day. That's expected.

Come back and say "schedules activated" when all are set up.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Wait for "schedules activated".

---

## SECTION 3 — Verification

Run these checks after the user confirms schedules are active.

### 3.1 — File Verification

```bash
# Agent definitions
for f in .claude/agents/*.md; do echo "EXISTS: $f"; done

# Agent personas
for d in agents/*/; do
  p="${d}context/persona.md"
  [ -f "$p" ] && echo "EXISTS: $p" || echo "MISSING: $p"
done

# Resources
for f in resources/brand-voice.md resources/design-system.md resources/web-style-guide.md resources/audience-personas.md resources/content-calendar.md; do
  [ -f "$f" ] && echo "EXISTS: $f" || echo "MISSING: $f"
done

# Schedule file
[ -f "agents/project-manager/context/schedule-desktop-tasks.md" ] && \
  echo "EXISTS: schedule-desktop-tasks.md" || echo "MISSING: schedule-desktop-tasks.md"
```

If any file is MISSING: regenerate it before continuing.

### 3.2 — Functional Tests

**Test 1 — Project Manager standup:**
```
Simulate a morning standup message from the Project Manager.
Read agents/project-manager/context/persona.md and produce
the standup reminder message it would send today.
```

Confirm the output references real names (not placeholders) and uses the correct timezone.

**Test 2 — Writer content dry-run:**
```
Ask the Writer agent to draft a 3-sentence social media caption
for the top content pillar from resources/content-calendar.md.
Confirm it reads resources/brand-voice.md first.
```

Confirm the output matches the brand voice and tone from Q8.

**Test 3 — Web Developer build-page dry-run:**
```
Ask the Web Developer to describe what it would do if given a brief at
content/topics/sample-first-post/brief.md — without actually building anything.
```

Confirm it references the correct paths and style guide.

---

## SECTION 4 — Final Summary

Output this when all checks pass:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR AI MARKETING TEAM IS READY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{Business Name} — AI team status:

Agent                  Status    Role
─────────────────────  ──────    ────────────────────────────────
Project Manager        ✅ Ready  Daily standups, RAID log, delivery
Product Manager        ✅ Ready  Strategy, roadmap, ICP research
Web Developer          ✅ Ready  Website, publishing, deploys
{Designer if built}    ✅ Ready  Images, social cards, visual assets
{Writer if built}      ✅ Ready  Blog posts, social copy, emails
{Marketing Mgr if}     ✅ Ready  Campaigns, content calendar
{Social Media if}      ✅ Ready  Platform drafts, TikTok, analytics

Website: {Vercel URL}
Repository: {GitHub URL}

YOUR FIRST ACTIONS:
1. Write your first standup:
   "help me write my standup" or "@project-manager standup time"

2. Generate your first content calendar:
   "@marketing-manager generate this month's content calendar"

3. Write your first blog post:
   "@writer write a post about {content pillar 1 from Q25}"

4. Confirm schedules are active in Claude Desktop Chat

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALWAYS YOUR DECISION:
• Social posts → drafted for your approval first
• Email campaigns → ALWAYS require your approval before sending
• Blog posts → you review before the Web Developer publishes
• Paid spend (ads, tools) → always your call
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your team runs Monday–Friday, checks in daily, and escalates
only when they need a decision from you. Everything else runs itself.
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
create `content/approved/.gitkeep` and `content/published/.gitkeep`,
and output the third-party setup instructions from the OpenClaw docs.

**If SKIP:** Confirm the core system is complete.
Note: "OpenClaw can be added later — see architecture/openclaw-proposal.md if available."

---

```
✅ P4 complete. Bootstrap finished.

Append to context/publish-log.md:

| Date | Title | File | Category | Platform |
|------|-------|------|----------|----------|
(header only — entries added per published post)
```

After appending, say:
```
That's everything. Your AI marketing team is set up, your website is live,
and your schedules are running.

From here, your AI team works Monday–Friday in the background.
To interact with any agent, just open Claude Desktop and say what you need —
for example:
  • "help me write my standup"
  • "write a post about [your topic]"
  • "what's our project status?"

Your team will take it from there.
```
