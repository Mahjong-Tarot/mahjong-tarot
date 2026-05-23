# Bootstrap Plan — Two-Track Universal Version

> **Status**: Planning phase — files to be generated under `track-A/` and `track-B/`
> **Source inputs**: `baseline/infinite-8-domain-setup.md`, `baseline/slides.html` (18 protocols, 8 agents)

---

## What changed from the previous bootstrap

| Previous | New |
|----------|-----|
| Single path (one machine) | Two tracks: Mac Mini (A) + Client laptop (B) |
| 4 agents (PM, Writer, Designer, Web Dev) | 8 agents: Build Team (4) + GTM Team (4) |
| Agent definitions in `.claude/agents/` per project | Dedicated **agents repo** on GitHub; synced to `~/.claude/agents/` on every machine |
| No Hello World website in P1 | P1 ends with a live deployed website |
| P0 creates accounts from scratch | Track A P0 starts from Google Workspace master account |
| Client and dev use same phases | Track B skips website; clones the agents repo |

---

## The 8 agents (from slides, Slide 17–19)

### Build Team (Agents 1–4)
| # | Agent | Role |
|---|-------|------|
| 01 | Product Manager | Designs what you're building — OKRs, epics, PRDs |
| 02 | Developer | Writes code to your standards; reads CLAUDE.md |
| 03 | QA | Tests every change; knows what AI can and cannot test |
| 04 | DevOps | Manages git check-ins, environments, deployments |

### GTM Team (Agents 5–8)
| # | Agent | Role |
|---|-------|------|
| 05 | Writer | Produces content in your voice |
| 06 | Designer | Generates visuals to your spec and design system |
| 07 | Web Publisher | Pushes content live without a human handoff |
| 08 | Email Marketer | Nurtures every lead the site generates |

---

## The 18 protocols (5 tracks from slides) — how they shape the system

### Track 01 — Mindset
1. **Humans are the orchestrator.** All agent definitions lead with: "You act when asked."
2. **The CMS is dead — AI is the CMS.** Web Publisher is the new CMS layer; no manual page editing.
3. **The stack: Claude + GitHub + Vercel + Supabase.** Every infra step references exactly these four.
4. **Agents are folders, not magic.** All agent definitions use explicit folder structure; no ambiguity.

### Track 02 — Infrastructure
5. **GitHub** — version control for all code and agent context.
6. **Vercel** — deployment; CI/CD via git push only.
7. **Supabase** — data layer; contact forms, subscribers, CRM.

### Track 03 — Building
8. **Design systems Claude can read.** `resources/design-system.md` is always written before any component.
9. **Workflows that turn intent into output.** Each agent has a concrete step-by-step workflow.
10. **Communications that go out automatically.** PM schedules run via RemoteTrigger (cloud, always-on).
11. **Admin tools your team uses without escalating.** Skills like `daily-checkin`, `customize-schedules`.

### Track 04 — Team and Ops
12. **When to bring in a human engineer.** DevOps agent has explicit escalation rules.
13. **The roles every IL team has.** The 8-agent roster is fixed; optional agents are extras.
14. **How to plan an epic.** Product Manager agent has epic-planning skill.
15. **PM agent that already knows what you shipped.** PM reads `git log` + standup files before every task.

### Track 05 — Continuity
16. **What AI can test on its own, and what it cannot.** QA agent has explicit can/cannot-test list.
17. **How to hand off context, memory, and project state.** Memory system + BRIDGE.md pattern baked in.
18. **The work outlives the operator.** Agents repo on GitHub; sync-agents skill keeps all machines current.

---

## The agents repo (new concept)

A dedicated GitHub repo — separate from the website project — that is the single source of truth for all agent definitions and default personas.

```
{project-slug}-agents/
├── README.md                         ← What this repo is and how to use it
├── .claude/agents/                   ← Agent definition stubs (the .md files)
│   ├── product-manager.md
│   ├── developer.md
│   ├── qa.md
│   ├── devops.md
│   ├── writer.md
│   ├── designer.md
│   ├── web-publisher.md
├── agents/                           ← Project-agnostic context and personas
│   ├── product-manager/context/default-persona.md
│   ├── developer/context/default-persona.md
│   ├── qa/context/default-persona.md
│   ├── devops/context/default-persona.md
│   ├── writer/context/default-persona.md
│   ├── designer/context/default-persona.md
│   ├── web-publisher/context/default-persona.md
└── skills/
    └── sync-agents/SKILL.md          ← Pulls latest from this repo → copies to ~/.claude/agents/
```

**sync-agents skill** (runs daily or on demand):
```bash
cd ~/{project-slug}-agents
git pull origin main
cp -r .claude/agents/* ~/.claude/agents/
echo "✅ Agents synced from GitHub."
```

Both Mac Mini (Track A) and client laptop (Track B) install this skill. When Dave updates an agent centrally, all machines stay current on next sync.

---

## Track A — Mac Mini (Developer setup)

**Who runs it**: Dave / the developer  
**Machine state**: Completely fresh Mac Mini, nothing installed  
**End state**: 8 agents running globally, agents repo on GitHub, Hello World website live on Vercel

### A-P0 — Accounts (source: `infinite-8-domain-setup.md`)
1. Log into master Google Workspace (infinite-8.com Admin Console)
2. Add client's domain as a secondary domain
3. Copy Google's TXT verification record
4. Add TXT record to Vercel DNS for that domain
5. Return to Google Admin — verify domain
6. Set MX records via Vercel (auto-configures for Google)
7. Create operator email: `{firstname}@{theirdomain}.com`
8. Use that email to create: GitHub, Claude (Pro), Vercel, Supabase
9. Generate all API keys: Gemini, Resend, Lark
10. Collect credentials → ready for P1

### A-P1 — Machine Setup
1. Install: Homebrew, git, gh CLI, Node, jq, ffmpeg, vercel CLI, supabase CLI, lark-cli
2. GitHub auth with operator account
3. Pre-seed `~/.claude/settings.local.json` permissions
4. Create `~/.claude/agents/`, `~/.claude/skills/`, `~/.claude/rules/`
5. Write `~/.claude/CLAUDE.md` (global rules) + `~/.claude/rules/global-engineering.md`
6. Write Supabase credentials to `.env`
7. Configure Supabase MCP in `~/.claude/settings.local.json`
8. Install global skills: `daily-checkin`, `create-local-task`, `skill-creator`
9. **Hello World website** (new — end of P1):
   - Scaffold Next.js App Router + Tailwind + shadcn in `hello-world/`
   - Apply Infinite Leverage visual style (Inter Tight + JetBrains Mono, `#2563EB` blue, `#0B1426` ink)
   - Pages: home (name + tagline + "AI team is online" status), about stub, contact stub
   - Push as `{project-slug}-website` to GitHub
   - Import to Vercel → deploy → note live URL
10. Initial git commit and push

### A-P2 — Agent Team
1. Clone/create the agents repo: `{project-slug}-agents`
2. Install all 8 agent definitions to `~/.claude/agents/` (Build Team + GTM Team)
3. Write default personas for all 8 agents
4. Push agents repo to GitHub
5. Install `sync-agents` skill globally
6. Write global CLAUDE.md update pointing to agents repo
7. Register all schedules via RemoteTrigger:
   - PM: standup morning/compile/EOD/weekly RAG
   - Content: Writer (Mon), Designer (Tue), Web Publisher (Wed)
   - Email Marketer: weekly outreach (Thu) — checks for new posts, sends to opted-in subscribers via Resend
8. Verification: test all 8 agents, confirm site is live, confirm schedules registered
9. **Hand-off document**: what client needs to know, credentials file, first actions

---

## Track B — Client Personal Laptop

**Who runs it**: Dave sets up, client watches  
**Machine state**: Client's existing laptop — may have some tools already  
**End state**: Client's laptop has all 8 agents synced from the agents repo; can use them immediately

### B-P0 — Client Account Check
1. Check/install: Chrome, Homebrew, git, gh CLI
2. Authenticate: GitHub (operator account), Claude Desktop, Vercel CLI, Supabase CLI
3. No new account creation (already done in Track A P0)
4. Copy `.env` credentials from Mac Mini setup

### B-P1 — Laptop Setup (no website)
1. Install same dev tools as Track A P1 (step 1)
2. GitHub auth
3. Pre-seed permissions (same script as Track A)
4. Create `~/.claude/agents/`, `~/.claude/skills/`, `~/.claude/rules/`
5. Write `~/.claude/CLAUDE.md` + `~/.claude/rules/global-engineering.md`
6. Configure Supabase MCP
7. Install global skills: `daily-checkin`, `create-local-task`
8. **SKIP** website scaffold (already live from Track A)
9. Initial local git config

### B-P2 — Connect to Agent Team
1. Clone `{project-slug}-agents` repo to laptop
2. Run install script: copy all 8 agent definitions to `~/.claude/agents/`
3. Install `sync-agents` skill
4. Run first sync: `git pull` + copy to `~/.claude/agents/`
5. Test all 8 agents respond correctly
6. **Leave client with first-actions guide**:
   - Your AI team is ready
   - How to talk to each agent
   - Daily workflow (standup → write → design → publish)
   - How to queue new content
   - What happens automatically without you

---

## Files to generate

```
new-bootstrap/
├── PLAN.md                           ← This file
├── track-A/
│   ├── p0-accounts.md               ← Google Workspace + all service accounts
│   ├── p1-machine-setup.md          ← Full Mac Mini setup + Hello World website
│   └── p2-agent-team.md             ← 8 agents + agents repo + schedules + handoff
└── track-B/
    ├── p0-client-check.md           ← Verify/install tools + authenticate
    ├── p1-client-setup.md           ← Laptop setup (no website)
    └── p2-client-connect.md         ← Clone agents repo + install + first-actions guide
```

---

## Open decisions (resolve before generating)

| # | Question | Default assumption |
|---|----------|--------------------|
| 1 | What does the Hello World website say? | Business name + tagline + "AI team is online" badge |
| 2 | Does Track B P2 need to register its own RemoteTrigger schedules? | No — schedules run on Mac Mini (always-on); laptop just runs agents on demand |
| 3 | Does the agents repo include project-specific personas or only default personas? | Default personas only; project-specific personas stay in the website project repo |
| 4 | Email Marketer — what stack? Resend only, or also Lark? | Resend for email marketing; Lark for internal team notifications |
| 5 | DevOps agent — does it push to Vercel or only to GitHub? | GitHub only; Vercel CI/CD handles the rest |
