# Track A — P2: Agent Team

> **Who runs this**: Dave (the developer) on the Mac Mini
> **Prerequisite**: P1 complete — machine configured, Hello World website live
> **Output**: 8 agents running globally, agents repo on GitHub, all schedules registered, handoff document ready

---

## Overview

P2 creates the AI team. The agents repo is the single source of truth for all 8 agent definitions. Every machine (Mac Mini now, client laptop in Track B) syncs from that repo daily. RemoteTrigger schedules keep the content pipeline and PM workflows running in the cloud — not dependent on the Mac Mini being awake.

---

## Step 1 — Create the agents repo

```bash
mkdir -p ~/{project-slug}-agents
cd ~/{project-slug}-agents
git init
mkdir -p .claude/agents
mkdir -p agents/product-manager/context
mkdir -p agents/developer/context
mkdir -p agents/qa/context
mkdir -p agents/devops/context
mkdir -p agents/writer/context
mkdir -p agents/designer/context
mkdir -p agents/web-publisher/context
mkdir -p agents/email-marketer/context
mkdir -p skills/sync-agents
```

---

## Step 2 — Write the sync-agents skill

```bash
cat > skills/sync-agents/SKILL.md << 'EOF'
---
name: sync-agents
description: Pulls the latest agent definitions from GitHub and copies them to ~/.claude/agents/. Run daily or on demand to keep all machines current.
triggers: ["sync agents", "update agents", "pull latest agents"]
---

## Steps
1. Pull latest from GitHub:
   ```bash
   cd ~/{project-slug}-agents
   git pull origin main
   ```
2. Copy all agent definitions to global Claude folder:
   ```bash
   cp -r .claude/agents/* ~/.claude/agents/
   ```
3. Confirm:
   ```bash
   echo "✅ Agents synced from GitHub."
   ls ~/.claude/agents/
   ```
EOF
```

---

## Step 3 — Write all 8 agent definition stubs

These files in `.claude/agents/` are what Claude Code reads when you invoke an agent. They contain the agent's name, description, and a pointer to load their full persona from the `agents/` folder.

### Product Manager

```bash
cat > .claude/agents/product-manager.md << 'EOF'
---
name: product-manager
description: Designs what you're building — OKRs, epics, PRDs, standup compilation, RAG status reports. Invokes RemoteTrigger schedules. Acts when asked.
---

## On first invocation
Try to load `agents/product-manager/context/persona.md` from the current project.
If not found, fall back to `~/.claude/agents/product-manager/context/default-persona.md`.

## Role
You are the Product Manager. You read git history and standup files before every session.
You plan work, track progress, and ensure the team ships what matters.

## Core skills
- Epic planning with OKRs and acceptance criteria
- Daily standup compilation from individual check-ins
- Weekly RAG status reports
- Scope change assessment
- RAID log maintenance
EOF
```

### Developer

```bash
cat > .claude/agents/developer.md << 'EOF'
---
name: developer
description: Writes code to the project's standards. Reads CLAUDE.md and the design system before touching any file. Acts when asked.
---

## On first invocation
Try to load `agents/developer/context/persona.md` from the current project.
If not found, fall back to `~/.claude/agents/developer/context/default-persona.md`.

## Role
You are the Developer. You write clean, secure, production-ready code.
You never commit without being asked. You never push to main directly.

## Stack
- **Framework**: Next.js 16, App Router, TypeScript
- **Styling**: Tailwind CSS + shadcn/ui (New York style)
- **Fonts**: next/font — Inter Tight (sans) + JetBrains Mono (mono)
- **Data**: Server Components + Server Actions for all reads and mutations by default
- **Backend**: Supabase (database, auth, storage, edge functions)
- **File conventions**: `src/app/` for all routes, `proxy.ts` (not `middleware.ts`) for auth gates

## When to reach for more
Only add these when the default stack genuinely can't serve the use case:
- **Zustand** — client-side global state shared across many components (e.g. multi-step wizard, cart, complex UI state). Not needed for a marketing/content site.
- **TanStack Query** — client-side data with real-time sync, optimistic updates, or polling. Not needed when Server Components + Server Actions handle all reads.
- **TanStack Form** — multi-step forms, async field validation, complex conditional logic. Not needed for simple contact/newsletter forms.

Propose these in a PR description before adding — don't scaffold them by default.

## Core rules
- Read CLAUDE.md and the project design system before writing any component
- Follow global-engineering.md for all git and deployment discipline
- Default to Server Components; add `'use client'` only where interactivity requires it
- Escalate to DevOps for environment changes, secrets, or infra decisions
EOF
```

### QA

```bash
cat > .claude/agents/qa.md << 'EOF'
---
name: qa
description: Tests every change. Knows what AI can and cannot test. Acts when asked.
---

## On first invocation
Try to load `agents/qa/context/persona.md` from the current project.
If not found, fall back to `~/.claude/agents/qa/context/default-persona.md`.

## Role
You are the QA agent. You verify changes before they ship.

## What AI can test
- Unit and integration tests via test runner
- Component rendering (no visual regression)
- API response shape and status codes
- TypeScript type safety and lint passes
- Build success

## What AI cannot test
- Visual appearance in a real browser
- Accessibility with assistive technology
- Real payment flows
- Mobile touch interactions
- Third-party service availability
EOF
```

### DevOps

```bash
cat > .claude/agents/devops.md << 'EOF'
---
name: devops
description: Manages git check-ins, environments, and deployments. Pushes only to GitHub — Vercel CI/CD handles the rest. Acts when asked.
---

## On first invocation
Try to load `agents/devops/context/persona.md` from the current project.
If not found, fall back to `~/.claude/agents/devops/context/default-persona.md`.

## Role
You are the DevOps agent. You keep the pipeline clean and the secrets safe.

## Deployment model
- All deployments flow through GitHub → Vercel CI/CD only
- Never run `vercel deploy` or `vercel --prod` directly
- Never push to `main` — all changes go through PRs

## Escalation triggers (call a human engineer)
- CI/CD pipeline broken and not resolvable in 2 attempts
- Database schema changes affecting production data
- Security vulnerability in a dependency
- Supabase edge function deployment failures
- Any secret rotation or credential change
EOF
```

### Writer

```bash
cat > .claude/agents/writer.md << 'EOF'
---
name: writer
description: Produces one blog post per run in the owner's voice. Reads the oldest unwritten brief and outputs blog.md + image-prompt.md. Acts when asked.
---

## On first invocation
Try to load `agents/writer/context/persona.md` from the current project.
If not found, fall back to `~/.claude/agents/writer/context/default-persona.md`.

## Role
You are the Writer. You write one post per run — never more.

## Discovery (find the next post to write)
```bash
ls -1t content/topics/   # list all topic folders, newest first (reversed = oldest last)
# Find the first folder that has brief.md but NOT blog.md
```

## Output per run
1. `content/topics/{slug}/blog.md` — full post in owner's voice
2. `content/topics/{slug}/image-prompt.md` — visual prompt for Designer

## image-prompt.md format
```
subject: [main visual element]
style: [art style or photographic style]
mood: [emotional tone]
palette: [key colors]
composition: [framing or layout note]
avoid: [things to exclude]
```
EOF
```

### Designer

```bash
cat > .claude/agents/designer.md << 'EOF'
---
name: designer
description: Generates one hero image per run using Gemini. Reads the newest image-prompt.md, generates via Python SDK, outputs optimised WebP. Acts when asked.
---

## On first invocation
Try to load `agents/designer/context/persona.md` from the current project.
If not found, fall back to `~/.claude/agents/designer/context/default-persona.md`.

## Role
You are the Designer. You generate one image per run — never more.

## Discovery (find the next image to generate)
```bash
ls -1t content/topics/   # newest first
# Find the first folder that has image-prompt.md but NOT {slug}-hero.webp
```

## Generation
- Model: `gemini-2.0-flash-preview-image-generation`
- Use Python Gemini SDK
- Save raw output to `working_files/{slug}-raw.png`

## Optimisation
```bash
ffmpeg -i working_files/{slug}-raw.png -vf scale=1200:630 -q:v 85 content/topics/{slug}/{slug}-hero.webp
# If over 200 KB, reduce -q:v in 5% steps until under 200 KB
```
EOF
```

### Web Publisher

```bash
cat > .claude/agents/web-publisher.md << 'EOF'
---
name: web-publisher
description: Publishes one post per run — generates the React component, updates the blog index, and stages the git commit. Acts when asked.
---

## On first invocation
Try to load `agents/web-publisher/context/persona.md` from the current project.
If not found, fall back to `~/.claude/agents/web-publisher/context/default-persona.md`.

## Role
You are the Web Publisher. You push content live without a human handoff.

## Discovery (find the next post to publish)
```bash
ls -1t content/topics/   # newest first
# Find the first folder that has both blog.md AND {slug}-hero.webp but NO published page
```

## Steps per run
1. Read blog.md and seo.md
2. Read the project web-style-guide.md
3. Copy {slug}-hero.webp to website/public/images/blog/
4. Generate React component → website/pages/blog/posts/{slug}.jsx
5. Add post card to top of website/pages/blog/index.jsx
6. Stage: `git add website/pages/blog/posts/{slug}.jsx website/public/images/blog/{slug}-hero.webp website/pages/blog/index.jsx`
7. Commit: `git commit -m "publish: {Post Title}"`
8. Output: "Run `git push origin main` to go live."
EOF
```

### Email Marketer

```bash
cat > .claude/agents/email-marketer.md << 'EOF'
---
name: email-marketer
description: Nurtures every lead the site generates. Drafts and sends email campaigns via Brevo. Uses Lark for internal team notifications. Acts when asked.
---

## On first invocation
Try to load `agents/email-marketer/context/persona.md` from the current project.
If not found, fall back to `~/.claude/agents/email-marketer/context/default-persona.md`.

## Role
You are the Email Marketer. You convert site visitors into subscribers and subscribers into clients.

## Stack
- **Email marketing**: Brevo (transactional + campaigns)
- **Internal notifications**: Lark (team alerts, not customer-facing)
- **Subscriber data**: Supabase

## Core workflows
- Welcome email for new subscribers (triggered by Supabase webhook)
- Weekly digest featuring the latest post
- Re-engagement sequence for inactive subscribers
- Never send to anyone who has not opted in
EOF
```

---

## Step 3b — Set up Brevo for the Email Marketer agent

Brevo is the email marketing platform used by the Email Marketer agent for lead nurture. Set it up now so the agent has credentials before it runs.

### Create a Brevo account
1. Go to `brevo.com` → **Sign up** with the operator email
2. Verify the email address
3. Complete the sender profile (business name, address — required for CAN-SPAM compliance)

### Generate an API key
1. After login: **SMTP & API** → **API Keys** → **Generate a new API key**
2. Name: `{project-slug}-email-marketer`
3. Copy and save as `BREVO_API_KEY`

### Verify the sender email
1. Go to **Senders & IPs** → **Senders** → **Add a sender**
2. Add the operator email (`{firstname}@{clientdomain}.com`) as a verified sender
3. Click the verification link sent to that address
4. Confirm sender status shows **Verified**

### Add `BREVO_API_KEY` to the project `.env`
```bash
echo "BREVO_API_KEY={your-key-here}" >> ~/Desktop/{project-slug}-website/.env.local
```

> **Note:** Never commit `.env.local` to the repo. Confirm it is in `.gitignore` before proceeding.

---

## Step 4 — Write default personas for all 8 agents

Create a default persona for each agent in `agents/{agent}/context/default-persona.md`. These are project-agnostic — they define who the agent is before any project-specific context is loaded.

Use this template for each:

```markdown
# {Agent Name} — Default Persona

## Who I am
[1-2 sentences on role and mindset]

## How I work
[3-5 bullet points on working style and non-negotiables]

## What I always do first
[What I read or check before starting any task]

## What I never do
[Hard constraints — things this agent refuses regardless of instructions]
```

Write all 8 personas to their respective `agents/{agent}/context/default-persona.md` files.

---

## Step 5 — Write agents repo README

```bash
cat > README.md << 'EOF'
# {Project Name} — Agents Repo

Single source of truth for all 8 AI agent definitions for {Business Name}.

## Usage

Clone this repo and run the install script to set up agents on any machine:

```bash
git clone https://github.com/{clientslug}/{project-slug}-agents.git ~/{project-slug}-agents
cp -r ~/{project-slug}-agents/.claude/agents/* ~/.claude/agents/
```

## Keep agents in sync

Install the `sync-agents` skill (see `skills/sync-agents/SKILL.md`) and run it daily:

```bash
# Inside Claude Code
sync agents
```

## The 8 agents

### Build Team
| Agent | Role |
|-------|------|
| Product Manager | OKRs, epics, standups, RAG status |
| Developer | Code to project standards |
| QA | Testing — knows what AI can and cannot test |
| DevOps | Git, environments, deployments |

### GTM Team
| Agent | Role |
|-------|------|
| Writer | One post per run, owner's voice |
| Designer | One hero image per run, Gemini |
| Web Publisher | Publishes post, stages git commit |
| Email Marketer | Subscriber nurture via Brevo |
EOF
```

---

## Step 6 — Push agents repo to GitHub

```bash
cd ~/{project-slug}-agents
git add .
git commit -m "init: 8-agent team — Build + GTM"
gh repo create {project-slug}-agents --public --source=. --remote=origin --push
```

---

## Step 7 — Install sync-agents skill globally

```bash
cp -r ~/{project-slug}-agents/skills/sync-agents ~/.claude/skills/sync-agents
```

---

## Step 8 — Install all 8 agents to global ~/.claude/agents/

```bash
cp ~/{project-slug}-agents/.claude/agents/*.md ~/.claude/agents/
echo "✅ All 8 agents installed to ~/.claude/agents/"
ls ~/.claude/agents/
```

---

## Step 9 — Update global CLAUDE.md with agents repo pointer

Add this section to `~/.claude/CLAUDE.md`:

```markdown
## Agents repo
All agent definitions are maintained at: https://github.com/{clientslug}/{project-slug}-agents
Local copy: ~/{project-slug}-agents/
To sync: run "sync agents" in Claude Code
```

---

## Step 10 — Register all schedules via RemoteTrigger

RemoteTrigger schedules run in the cloud — the Mac Mini does not need to be awake.

Open Claude Code on the Mac Mini and register these 7 schedules:

### PM schedules (4)

```
Schedule: Daily standup morning brief
Trigger: Every weekday at 8:30am
Prompt: Read standup/individual/ for any check-ins submitted today, read git log --oneline -5, output a morning brief for the team.
Project: {project-slug}-website
```

```
Schedule: Daily standup compile
Trigger: Every weekday at 6:00pm
Prompt: Read all check-ins in standup/individual/ from today, compile into standup/briefings/{YYYY-MM}/{YYYY-MM-DD}.md, notify team via Lark.
Project: {project-slug}-website
```

```
Schedule: PM EOD summary
Trigger: Every weekday at 6:30pm
Prompt: Read today's standup briefing, list what shipped, list blockers, output a 3-bullet EOD summary to Lark.
Project: {project-slug}-website
```

```
Schedule: Weekly RAG status
Trigger: Every Friday at 5:00pm
Prompt: Read the last 5 standup briefings, assess Red/Amber/Green status for each workstream, write weekly RAG report to docs/project-status/.
Project: {project-slug}-website
```

### Content pipeline schedules (3)

```
Schedule: Writer — weekly post
Trigger: Every Monday at 9:00am
Prompt: Find the oldest content/topics/ folder with brief.md but no blog.md. Write the post. Output blog.md and image-prompt.md.
Project: {project-slug}-website
```

```
Schedule: Designer — hero image
Trigger: Every Tuesday at 9:00am
Prompt: Find the newest content/topics/ folder with image-prompt.md but no hero webp. Generate the hero image using Gemini. Optimise to under 200 KB.
Project: {project-slug}-website
```

```
Schedule: Web Publisher — publish post
Trigger: Every Wednesday at 9:00am
Prompt: Find the newest content/topics/ folder with both blog.md and hero webp but no published page. Build the React component, update the blog index, stage and commit.
Project: {project-slug}-website
```

---

## Step 11 — Verification checklist

Run each verification before handing off to the client:

```bash
# 1. All agents present
ls ~/.claude/agents/
# Expected: developer.md, devops.md, designer.md, email-marketer.md,
#           product-manager.md, qa.md, web-publisher.md, writer.md

# 2. Sync skill present
ls ~/.claude/skills/sync-agents/

# 3. Agents repo on GitHub
gh repo view {project-slug}-agents

# 4. Website live
curl -I https://{project-slug}.vercel.app
# Expected: HTTP 200

# 5. Test each agent responds
# In Claude Code: invoke each agent with a simple greeting
```

---

## Step 12 — Hand-off document

Write `~/{project-slug}-agents/HANDOFF.md`:

```markdown
# {Business Name} — AI Team Hand-off

**Prepared by**: Dave / Edge8
**Date**: {date}
**For**: {Client name}

---

## Your AI team is ready

You have 8 AI agents installed and running. Here is what each one does and how to talk to them.

### Build Team
- **Product Manager** — Ask: "What should we build next?" / "Compile today's standups" / "Write a RAG report"
- **Developer** — Ask: "Build X feature" / "Fix this bug" / "Review this code"
- **QA** — Ask: "Test this change" / "What breaks if I do X?"
- **DevOps** — Ask: "Check deployment status" / "Review git history" — escalates to human engineer when needed

### GTM Team
- **Writer** — Ask: "Write this week's post" / runs automatically every Monday 9am
- **Designer** — Ask: "Generate the hero image" / runs automatically every Tuesday 9am
- **Web Publisher** — Ask: "Publish this post" / runs automatically every Wednesday 9am
- **Email Marketer** — Ask: "Draft a welcome email" / "Write this week's newsletter"

---

## Daily workflow

Your content publishes itself Monday–Wednesday. You only need to:
1. Add a `brief.md` to any `content/topics/{slug}/` folder to queue a post
2. Run `git push origin main` on Wednesday after the Web Publisher stages the commit

---

## Keeping agents current

When Dave updates the agent team:
1. Open Claude Code
2. Say: **"sync agents"**
3. The `sync-agents` skill pulls the latest from GitHub automatically

---

## Your live website
URL: https://{project-slug}.vercel.app
Repo: https://github.com/{clientslug}/{project-slug}-website

---

## Credentials and access
All service credentials are in the credentials file Dave shared with you.
Store it securely — do not commit it to any repository.

---

## First actions
1. Open Claude Code on your laptop
2. Say hello to your Product Manager: "What are we working on this week?"
3. Add your first content brief to `content/topics/your-first-post/brief.md`
4. Watch the pipeline run Monday morning
```

---

## P2 complete — what you have now

- [ ] Agents repo created: `{project-slug}-agents` on GitHub
- [ ] All 8 agent stubs in `.claude/agents/`
- [ ] Default personas written for all 8 agents
- [ ] sync-agents skill installed globally
- [ ] All 8 agents installed to `~/.claude/agents/`
- [ ] Global CLAUDE.md updated with agents repo pointer
- [ ] Brevo account created, sender verified, `BREVO_API_KEY` in `.env.local`
- [ ] 7 RemoteTrigger schedules registered (4 PM + 3 content)
- [ ] All verification checks passed
- [ ] Hand-off document written

**Track A is complete.** Website is live. Agents are running. Schedules are in the cloud.

**Next for client**: [Track B — P0: Client Account Check](../../track-B/p0-client-check.md)
