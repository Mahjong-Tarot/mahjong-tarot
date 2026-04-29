# Auto-Publishing Architecture
> Synthesized from: boss-proposal, my-proposal, Postiz MCP docs, RemoteTrigger (CCR) capabilities

---

## What We're Solving

The agent team generates content but needs two things to publish automatically:
1. A way to **push content to social platforms** (Postiz handles this)
2. A way to **trigger agents on a schedule without the user's laptop being on** (RemoteTrigger handles this)

---

## The Stack (Final)

| Layer | Tool | Why |
|---|---|---|
| Scheduling & publishing | **Postiz** | Multi-platform scheduler — IG, FB, LinkedIn, TikTok drafts, 25+ platforms |
| Agent interface (interactive) | **Postiz MCP** (native, URL-based) | Social Media Manager calls it during live sessions |
| Agent scheduling | **RemoteTrigger (CCR)** | Anthropic cloud sessions — no laptop needed, true cron |
| Notifications | **Telegram** | Already connected, used for team comms |
| Image generation | **AI image API** | Designer agent handles this |

---

## How RemoteTrigger (CCR) Works

RemoteTrigger creates **persistent cloud sessions** that run in Anthropic's infrastructure:

- Fires on cron schedule — no Claude Desktop, no laptop, no VPS needed
- Checks out the git repo on each run — reads committed files
- Has full tool access: Bash, Read, Write, Edit, Glob, Grep
- Can attach pre-registered MCP connectors (Vercel, Gmail, Figma, etc.)
- **Minimum interval: 1 hour**
- **Postiz MCP limitation:** Postiz is not a pre-registered connector on claude.ai.
  The CCR environment cannot use the `https://api.postiz.com/mcp/KEY` URL-based server directly.

### The Postiz API Key Problem in CCR

Since CCR can't attach a custom URL MCP, the agent can either:
1. Call Postiz REST API via **Bash + curl** with the key embedded in the trigger prompt
2. Read the Postiz API key from a **committed config file** in the repo (non-sensitive path)

Option 2 is cleaner: store `context/postiz-config.md` with the API URL (key included in URL),
gitignored in public repos but committed in private repos.

```bash
# CCR agent reads the key from a config file, then calls Postiz REST API
POSTIZ_KEY=$(grep "api_key:" context/postiz-config.yml | cut -d' ' -f2)
curl -s "https://api.postiz.com/public/v1/posts" \
  -H "Authorization: Bearer $POSTIZ_KEY" \
  -H "Content-Type: application/json" \
  -d '{"integrationId": "...", "content": "...", "type": "schedule", "date": "..."}'
```

---

## Publishing Strategy: Two Modes

### Mode A — Interactive Publishing (Primary, Recommended)
The Social Media Manager agent is invoked manually (or by a Telegram command).
It uses the Postiz MCP (full tool access in live session) to schedule the week's content.
Postiz then publishes at the scheduled times — no further agent involvement needed.

```
User / Marketing Manager → @social-media-manager schedule this week
  → Agent reads content/approved/ files
  → Calls Postiz MCP: schedulePostTool for each post
  → TikTok: type "draft" | IG/FB/LI: type "schedule"
  → Telegram: "Week scheduled. 3 TikTok drafts ready."
  → Postiz fires at scheduled times automatically
```

**Best for:** Weekly scheduling sessions (Friday afternoon), on-demand publishing.
**Human touchpoint:** User triggers the agent once per week. Postiz does the rest.

### Mode B — Fully Automated Publishing via CCR (Optional)
A RemoteTrigger fires on schedule, reads committed content files,
calls Postiz REST API directly via Bash, and commits the result.

```
Friday 9am Asia/Saigon → RemoteTrigger fires
  → CCR checks out repo
  → Reads content/approved/*.md files (frontmatter: platforms, schedule time, media)
  → Calls Postiz REST API via Bash for each post
  → Commits: moves files to content/published/, updates publish-log.md
  → Sends Telegram summary
```

**Best for:** Clients who want zero weekly touchpoints for social publishing.
**Requirement:** POSTIZ_API_KEY accessible in CCR (stored in private repo config file).
**Trade-off:** Less flexible than Mode A (no MCP tool discovery, no schema validation per platform).

---

## RemoteTrigger Schedule: What Goes Where

These tasks are well-suited to CCR (pure file + reporting work, no external API keys needed):

| Trigger | Cron (UTC) | Local time | What it does |
|---|---|---|---|
| `standup-morning` | `0 0 * * 1-5` | 7am Mon-Fri Asia/Saigon | Sends standup reminder via Telegram |
| `standup-compile` | `0 2 * * 1-5` | 9am Mon-Fri Asia/Saigon | Reads individual standups, compiles briefing, commits to standup/briefings/ |
| `content-calendar` | `0 2 1 * *` | 9am 1st of month Asia/Saigon | Reads resources/, generates next month's content calendar draft |
| `weekly-analytics` | `0 2 * * 1` | 9am Monday Asia/Saigon | Calls Postiz analytics via Bash, writes weekly summary, Telegram |
| `weekly-rag-report` | `0 9 * * 5` | 4pm Friday Asia/Saigon | Reads standup/briefings/, generates RAG status report |

**Note:** standup-morning/compile can be implemented more reliably with RemoteTrigger
than with Claude Desktop CronCreate, since CCR runs in Anthropic's cloud 24/7.

---

## Content File Handoff Format

Claude Code agents write approved content to `content/approved/` with this frontmatter.
RemoteTrigger (Mode B) and the Social Media Manager (Mode A) both read this format.

```markdown
---
slug: your-post-slug
platforms:
  instagram: schedule        # schedule | draft | skip
  facebook: schedule
  linkedin: schedule
  tiktok: draft              # always draft for TikTok
schedule: 2026-04-18T09:00:00+07:00
media:
  - content/topics/your-slug/hero.webp
  - content/topics/your-slug/slide-2.webp
---

Your caption text here. #Hashtag1 #Hashtag2

<!-- INSTAGRAM_OVERRIDE (optional) -->
Different caption for Instagram if needed.
```

Files are committed to `content/approved/` by the generating agent.
After publishing, moved to `content/published/` (committed by agent or CCR).

---

## Platform-Specific Rules (Unchanged)

### TikTok
- **Always `type: "draft"`** — music cannot be added via API
- **Format:** 6-slide carousel (2.9× comments, 1.9× likes vs video per boss-proposal data)
- Telegram alert day-of: "TikTok draft for [topic] is live — add trending music before [time]"

### Instagram / Facebook / LinkedIn
- `type: "schedule"` at optimal times (IG: 8-9am or 6-8pm, LI: Tue-Thu 8-10am)
- Default: human approves content in review step before scheduling
- After approval: fully automated via Mode A or B

---

## Postiz MCP Config (Interactive Sessions)

In `.claude/settings.local.json` (for live Claude Code sessions):

```json
{
  "mcpServers": {
    "postiz": {
      "url": "https://api.postiz.com/mcp/POSTIZ_API_KEY_PLACEHOLDER"
    }
  }
}
```

Replace `POSTIZ_API_KEY_PLACEHOLDER` with actual key after Postiz setup.
This is used by the Social Media Manager in Mode A (interactive sessions only).

---

## Files to Create per Client

```
.claude/settings.local.json          ← add postiz MCP entry
context/postiz-setup.md              ← setup instructions
context/postiz-config.yml            ← API key for CCR Bash calls (Mode B only)
context/approved/.gitkeep            ← handoff folder
context/published/.gitkeep           ← published archive
agents/social-media-manager/         ← full agent with Postiz MCP tools
```

---

## OpenClaw — Revised Role

With RemoteTrigger solving the scheduling problem, OpenClaw's role shrinks significantly.
See `architecture/openclaw-proposal.md` for the updated assessment.

**Remaining OpenClaw use cases (genuine):**
1. **WhatsApp as control interface** — clients who prefer WhatsApp over Telegram
2. **agent-media UGC videos** — script-to-TikTok-video, not possible with Claude Code alone

**Eliminated OpenClaw use cases (now covered by RemoteTrigger):**
- ~~Always-on scheduling daemon~~ → CCR handles this natively
- ~~Cron-based content publishing~~ → RemoteTrigger with Mode B
- ~~VPS requirement~~ → Anthropic cloud handles execution
