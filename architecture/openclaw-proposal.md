# OpenClaw Integration Proposal
> Honest assessment of where OpenClaw fits (and doesn't fit) in the automated marketing team

---

## What OpenClaw Is

OpenClaw is an open-source personal AI agent daemon (145k+ GitHub stars) built by the Postiz team.
It runs as a **persistent background process** on any machine or VPS, connects to chat apps
(WhatsApp, Telegram, Slack, Discord) as its control interface, and supports cron-based
**heartbeat tasks** that execute autonomously without any user trigger.

It is NOT a replacement for Claude Code. It is a complement for the execution and always-on layer.

---

## Revised Assessment: RemoteTrigger Changes the Picture

**Claude Code now has RemoteTrigger (CCR — Cloud Code Remote).** This is a persistent
webhook that spawns fully isolated Claude Code sessions in Anthropic's cloud on a cron
schedule — no Claude Desktop, no laptop, no VPS required.

This directly eliminates what was previously OpenClaw's main advantage.

### What RemoteTrigger Solves (previously OpenClaw territory)

| Problem | Before CCR | After CCR |
|---|---|---|
| Scheduling without laptop on | OpenClaw daemon on VPS | ✅ RemoteTrigger cron, Anthropic cloud |
| Daily standup triggers | OpenClaw heartbeat | ✅ RemoteTrigger, min 1hr interval |
| Weekly analytics reports | OpenClaw heartbeat | ✅ RemoteTrigger reads committed files |
| Always-on content publishing | OpenClaw + Postiz CLI | ✅ RemoteTrigger + Postiz REST API via Bash |

### What Claude Code Still Cannot Do (genuine OpenClaw territory)

### 1. WhatsApp as Control Interface
Claude Code's communication plugin is Telegram-only. Many non-tech business owners
prefer WhatsApp. OpenClaw natively supports WhatsApp, Telegram, Slack, and Discord.

**Impact:** Real for the "low-tech executive" target user who won't install Telegram.

### 2. UGC Video Generation (agent-media)
Script-to-TikTok-video with talking heads, B-roll, and Hormozi subtitles in one command.
This capability does not exist anywhere in Claude Code or Postiz's tool stack.

**Impact:** Genuine new content format for TikTok — not a duplication of existing capability.

---

## Where OpenClaw Is Overkill (Honest)

Do not move these to OpenClaw:

| Agent | Reason to keep on Claude Code |
|---|---|
| Writer | Needs Claude's reasoning quality for nuanced brand voice |
| Marketing Manager | Strategy work requires complex thinking, file context, web research |
| Product Manager | ICP analysis, vision reports — needs full Claude capability |
| Web Developer | Requires Read/Edit/Write/Glob/Grep file tools — OpenClaw doesn't have these |
| Designer | Image generation prompts need brand context from persona files |
| Project Manager | RAID log, scope change, retrospective — complex structured work |

**Rule of thumb:** If the task requires reading/editing code or complex reasoning, use Claude Code.
If the task is "check X, do Y, notify Z" on a schedule, OpenClaw is the right tool.

---

## Best-Fit Use Cases (3 Genuine Wins)

### ~~Use Case 1 — Always-On Publishing Daemon~~ → Use RemoteTrigger Instead

**This use case is now better served by Claude Code's RemoteTrigger (CCR).**

RemoteTrigger runs in Anthropic's cloud on a true cron schedule — no laptop, no VPS,
no OpenClaw daemon needed. For scheduling content and running analytics, prefer:

```
RemoteTrigger "Weekly Social Schedule" → cron: 0 2 * * 5 (Friday 9am Asia/Saigon)
RemoteTrigger "Weekly Analytics"       → cron: 0 2 * * 1 (Monday 9am Asia/Saigon)
RemoteTrigger "Daily Standup Compile"  → cron: 0 2 * * 1-5 (9am Mon-Fri Asia/Saigon)
```

See `architecture/auto-publishing-architecture.md` for the full CCR trigger setup.

**Only choose OpenClaw here if:** The client needs WhatsApp as the trigger interface,
OR the cost of Claude Sonnet per run is prohibitive and a cheaper model is preferred.

---

### Use Case 2 — UGC Video Content (agent-media) ⭐ New Capability

**The problem:** TikTok videos perform better than static carousels for some content types
(tutorials, reactions, personal stories). Claude Code + Designer can generate images but
cannot produce talking-head videos with B-roll and subtitles.

**agent-media.ai** (built by same Postiz team, available as OpenClaw skill):

```bash
# Install the skill once
clawhub install agent-media

# Then from any chat app or cron:
npx agent-media ugc \
  --script "3 signs your Chinese zodiac sign says you'll have a good year" \
  --actor random \
  --subtitles hormozi \
  --duration 30
```

Output: `~/output/ugc-final.mp4` ready for TikTok upload.

**What this enables:**
- Writer agent writes the script
- OpenClaw + agent-media generates the video
- Postiz CLI schedules it as a TikTok draft
- Client adds music and publishes

**Pricing:** $39/month starting. Credit-based, pay per video.

**Honest caveat:** This is an additional monthly cost. Only recommend to clients
who are committed to TikTok video content (not just carousels). Start with
static carousels, upgrade to UGC video when the channel gains traction.

---

### Use Case 3 — WhatsApp as the Control Interface ⭐ UX Win for Non-Tech Clients

**The problem:** Non-tech business owners won't install Telegram. WhatsApp is where they live.

**The OpenClaw solution:** Run OpenClaw on a cheap VPS. Connect it to WhatsApp.
The client messages their AI team from their existing WhatsApp number.

```
Client (WhatsApp): "Can you schedule a post about our new product launch for Friday?"

OpenClaw → Postiz → schedules to all connected platforms → replies via WhatsApp:
"Done! Post scheduled for Friday 9am across Instagram, LinkedIn, and Facebook.
 TikTok draft created — don't forget to add trending music before going live."
```

**What this requires:**
- WhatsApp Business API account (or unofficial bridge)
- VPS running OpenClaw daemon
- Postiz skill installed

**Honest caveat:** WhatsApp Business API requires Facebook Business verification
and has a per-message cost above the free tier. For clients on a tight budget,
Telegram remains simpler. Recommend WhatsApp only when client insists on it.

---

## Revised Architecture (With RemoteTrigger)

```
┌─────────────────────────────────────────────────────────────┐
│  CLAUDE CODE — Interactive Sessions                         │
│  Runs: when user is actively working                        │
│                                                             │
│  All 7 agents: PM, ProdM, WebDev, Designer,                 │
│  Writer, Marketing Mgr, Social Media Mgr                    │
│                                                             │
│  Social Media Mgr → Postiz MCP → schedules week            │
│  Output: content committed to repo                          │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼ committed to git repo
┌─────────────────────────────────────────────────────────────┐
│  REMOTE TRIGGER (CCR) — Anthropic Cloud                     │
│  Runs: on cron, no laptop needed                            │
│                                                             │
│  standup-compile:    Mon-Fri 9am → read/compile/commit      │
│  weekly-analytics:   Monday 9am → Postiz API → Telegram     │
│  content-calendar:   1st of month → generate draft          │
│  weekly-rag:         Friday 4pm → status report             │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  POSTIZ  (publishing backbone — fires at scheduled times)   │
│  Connected to: TikTok, Instagram, Facebook, LinkedIn, X     │
│  Accessed via: Postiz MCP (interactive) + REST API (CCR)    │
└─────────────────────────────────────────────────────────────┘

           ┌────────────────────────────────────────┐
           │  OPENCLAW (optional, narrow scope)      │
           │  Only if client wants:                  │
           │  • WhatsApp control interface           │
           │  • UGC video via agent-media            │
           └────────────────────────────────────────┘
```

---

## Implementation Guide

### Step 1 — Install OpenClaw

```bash
# Install globally
npm install -g openclaw

# Or run without installing
npx openclaw start
```

### Step 2 — Install the Postiz skill

```bash
clawhub install nevo-david/postiz

# Set API key
export POSTIZ_API_KEY=your_postiz_api_key

# Verify
openclaw skills list --eligible
# Should show: postiz: Social media automation CLI
```

### Step 3 — Configure heartbeats

Create `openclaw.json` in your project root:

```json
{
  "llm": "claude-sonnet-4-5",
  "heartbeat": [
    {
      "cron": "0 8 * * 1-5",
      "prompt": "Check content/approved/ for .md files. For each, read the frontmatter to get target platforms and scheduled time. Use the Postiz CLI to schedule each post. Move files to content/published/ after scheduling. Send a Telegram summary."
    },
    {
      "cron": "0 9 * * 1",
      "prompt": "Use Postiz analytics:platform for each connected integration. Write the summary to standup/briefings/YYYY-MM/weekly-analytics.md. Send via Telegram."
    }
  ]
}
```

### Step 4 — Deploy on VPS (for always-on operation)

```bash
# On your VPS (Hetzner/DigitalOcean/Vultr — $4-6/month)
npm install -g openclaw
export POSTIZ_API_KEY=your_key
export ANTHROPIC_API_KEY=your_key

# Start as a daemon
openclaw start --daemon

# Verify it's running
openclaw status
```

### Step 5 — Optional: agent-media UGC videos

```bash
clawhub install agent-media

# Test it
npx agent-media ugc --script "Your test script" --subtitles hormozi --duration 15
```

---

## Content File Format (the handoff contract)

Claude Code agents write files in this format to `content/approved/`:

```markdown
---
slug: signs-your-year-will-be-good
platforms: [instagram, facebook, linkedin, tiktok]
schedule: 2026-04-18T09:00:00+07:00
tiktok: draft
media:
  - content/topics/signs-good-year/hero.webp
  - content/topics/signs-good-year/slide-2.webp
  - content/topics/signs-good-year/slide-3.webp
---

Your caption text here. Tag #ChineseAstrology #Mahjong

<!-- INSTAGRAM_OVERRIDE -->
Slightly different IG caption if needed.
```

OpenClaw reads the frontmatter and executes. No ambiguity. No LLM reasoning needed
for the handoff — it's structured data.

---

## Cost Estimate

| Component | Monthly Cost |
|---|---|
| VPS (Hetzner CX11) | ~$4 |
| OpenClaw | Free (open source) |
| Postiz (for API + publishing) | $19 (paid tier for API) |
| agent-media (if using UGC) | $39+ |
| Anthropic API (OpenClaw tasks) | ~$2-5 (simple execution tasks, low token use) |
| **Total without UGC** | **~$25/month** |
| **Total with UGC** | **~$64/month** |

Claude Code subscription (Pro/Max) is separate and remains the primary tool.

---

## When to Recommend OpenClaw to a Client

**Recommend if:**
- Client prefers WhatsApp (or Slack/Discord) over Telegram for comms
- Client wants TikTok video content — talking heads, B-roll, Hormozi subtitles (agent-media)
- Client has a specific need to use cheaper LLMs (GPT-4o Mini, Llama) for high-frequency tasks

**Do not recommend if:**
- Client just needs always-on scheduling → use RemoteTrigger (CCR), no VPS, free
- Client is comfortable with Telegram → Claude Code plugin is sufficient
- Client is tech-shy → a VPS still adds real complexity
- Budget is under $50/month — agent-media alone starts at $39/month
- Client is just starting out — revisit when TikTok video becomes a stated priority

---

## Integration into the Bootstrap (SETUP.md)

In `architecture/CLIENT-BOOTSTRAP-PROMPT.md`, OpenClaw is presented as an **optional Phase 9**
after the core setup is complete and validated. It is clearly framed as:
- Not required for the system to work
- Recommended upgrade once client is posting consistently
- Especially recommended for non-Telegram users and video content

See the proposal section at the end of `architecture/CLIENT-BOOTSTRAP-PROMPT.md`.
