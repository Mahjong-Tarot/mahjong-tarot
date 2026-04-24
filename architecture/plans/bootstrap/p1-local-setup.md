# P1 — Local Machine Setup
> **Prerequisites:** P0 complete. Homebrew and git installed.
> **Where:** Claude Desktop — Code tab.
> **Done when:** Repo initialised, permissions set, folder structure created, skills installed.

---

## INSTRUCTIONS FOR CLAUDE CODE

First, output this to the user:
```
⚠️  Do not try to open or read any files during this process.
    It's highly technical — you don't need to understand it.
    Just answer when I ask you something. Everything else is automatic.
```

Then output this agenda:
```
P1 — Local Machine Setup (~30 min)
Here's what I'm setting up:

  1. Developer tools (gh, node, vercel CLI, supabase CLI)
  2. GitHub authentication
  3. Pre-approve all tool permissions (one-time)
  4. Create project folder + git init
  5. Folder structure + architecture docs
  6. CLAUDE.md files (global + project)
  7. Environment variable template
  8. Write Supabase credentials to .env
  9. Supabase MCP connection
 10. Install skills (create-local-task, daily-checkin, skill-creator)
 11. Initial commit
 12. GitHub repo creation + Vercel import

I'll ask you 6 questions, then run everything automatically.
```

Then ask these questions in one message:

```
A few quick questions before I start:

1. Your project folder name (e.g. "acme-marketing" — no spaces)
2. Your name and email for git (e.g. "Jane Smith" / jane@example.com)
3. Your Supabase Project URL from P0 Step 4 (looks like https://xxxx.supabase.co)
4. Your Supabase anon key from P0 Step 4 (long JWT string)
5. Your Supabase service role key from P0 Step 4 (different long JWT string)
6. Your Supabase personal access token from P0 Step 4 (starts with "sbp_...")
7. Did you set up Lark in P0 Step 6? (yes / no)
```

Wait for all answers. Then run every step below without stopping or asking anything further.

---

## STEP 1 — Install remaining developer tools

```bash
eval "$(/opt/homebrew/bin/brew shellenv)" 2>/dev/null || eval "$(/usr/local/bin/brew shellenv)" 2>/dev/null || true
which gh   || brew install gh
which node || brew install node
```

```bash
eval "$(/opt/homebrew/bin/brew shellenv)" 2>/dev/null || eval "$(/usr/local/bin/brew shellenv)" 2>/dev/null || true
which vercel   || npm install -g vercel
which supabase || { brew tap supabase/tap 2>/dev/null || true; brew install supabase/tap/supabase; }
which jq      || brew install jq
which ffmpeg  || brew install ffmpeg
```

---

## STEP 2 — GitHub authentication

Output to user:
```
A one-time code will appear in the output below — copy it.
Your browser will open (or navigate to github.com/login/device).
Paste the code there and complete the login, then come back here.
```

```bash
gh auth login --web --git-protocol https
```

```bash
gh auth status
```

---

## STEP 3 — Pre-seed permissions

Output this notice, then run the script immediately:

```
┌─────────────────────────────────────────────────────────────────┐
│  🔐  ONE-TIME PERMISSION SETUP                                   │
│  Pre-approving all tools so Claude never interrupts you.        │
│  Written to ~/.claude/settings.local.json on your machine only. │
└─────────────────────────────────────────────────────────────────┘
```

```bash
python3 - <<'PYEOF'
import json, os

path = os.path.expanduser("~/.claude/settings.local.json")
home = os.path.expanduser("~")
settings = {}
if os.path.exists(path):
    with open(path) as f:
        try: settings = json.load(f)
        except: settings = {}

perms = settings.setdefault("permissions", {})
allow = perms.setdefault("allow", [])

required = [
    "Bash(*)", "WebFetch", "Skill(*)",
    "mcp__plugin_context-mode_context-mode__ctx_batch_execute",
    "mcp__plugin_context-mode_context-mode__ctx_search",
    "mcp__plugin_context-mode_context-mode__ctx_execute",
    "mcp__plugin_context-mode_context-mode__ctx_fetch_and_index",
    "mcp__plugin_context-mode_context-mode__ctx_execute_file",
    "mcp__playwright__browser_navigate",
    "mcp__playwright__browser_snapshot",
    "mcp__playwright__browser_take_screenshot",
    "mcp__playwright__browser_click",
    "mcp__playwright__browser_fill_form",
    "mcp__playwright__browser_evaluate",
    "mcp__plugin_supabase_supabase__authenticate",
    "mcp__plugin_supabase_supabase__complete_authentication",
    "mcp__supabase__authenticate",
    "mcp__supabase__complete_authentication",
    f"Read({home}/.claude/**)",
    f"Edit({home}/.claude/**)",
    f"Write({home}/.claude/**)",
]

allow = [p for p in allow if p != "Bash(*)"]
existing = set(allow)
added = [p for p in required if p not in existing and p != "Bash(*)"]
allow = ["Bash(*)", *allow, *added]
perms["allow"] = allow
perms["defaultMode"] = "acceptEdits"
os.makedirs(os.path.dirname(path), exist_ok=True)
with open(path, "w") as f:
    json.dump(settings, f, indent=2)
print("✅ Permissions set.")
PYEOF
```

**From this point: speed run all remaining steps. No pausing. No narrating. Execute everything and confirm once at the end.**

---

## STEP 4 — Create project and git init

```bash
mkdir -p ~/{project-name} && cd ~/{project-name}
git init && git checkout -b main
```

`.gitignore`:
```bash
cat > .gitignore << 'EOF'
.env
.env.local
.env.*.local
.claude/settings.local.json
settings.local.json
node_modules/
.next/
working_files/
*.psd
*.ai
*.mov
*.mp4
EOF
```

---

## STEP 5 — Git identity

```bash
git config --global user.name  "{name from answer}"
git config --global user.email "{email from answer}"
```

---

## STEP 6 — Folder structure

```bash
mkdir -p .claude/agents .claude/rules .claude/skills
mkdir -p agents
mkdir -p architecture/docs
mkdir -p content/topics content/social content/source-material/brand content/source-material/images content/source-material/research content/content-calendar
mkdir -p resources
mkdir -p context/templates
mkdir -p standup/individual standup/briefings
mkdir -p working_files website
```

---

## STEP 7 — Project documentation

Write these files to `architecture/docs/`:

`architecture/docs/README.md`:
```markdown
# Project Overview

This is an AI-powered marketing system. It runs a website, manages content, and automates daily communications through a team of AI agents.

## How to use it
- Open Claude Desktop (Code tab) and describe what you need.
- The agents handle writing, designing, publishing, and reporting.
- You review and approve before anything goes live.

## Phases completed
- P0: Accounts and credentials set up
- P1: Local environment configured
- P2: Website live, agents installed, schedules running
```

`architecture/docs/AGENTS.md`:
```markdown
# AI Agents

| Agent | What it does | How to trigger |
|-------|-------------|----------------|
| Project Manager | Compiles daily standups, sends briefings, tracks blockers | "help me write my standup" |
| Writer | Writes blog posts, social captions, email drafts | "@writer write a post about X" |
| Designer | Generates hero images and social visuals | "@designer create an image for X" |
| Web Developer | Builds and publishes website pages and blog posts | "@web-developer publish this post" |
| Product Manager (optional) | Manages OKRs, roadmap, competitive analysis | "@product-manager review our roadmap" |
| Marketing Manager (optional) | Plans content calendars, tracks performance | "@marketing-manager plan next month" |
| Social Media Manager (optional) | Drafts and batches social posts | "@social-manager draft this week's posts" |

All agents are in `.claude/agents/`. Their context files are in `agents/`.
```

`architecture/docs/WORKFLOWS.md`:
```markdown
# Automated Workflows

| Task | When | Agent |
|------|------|-------|
| Morning standup reminder | Mon–Fri 7am | Project Manager |
| Compile daily briefing | Mon–Fri 9am | Project Manager |
| EOD check-in reminder | Mon–Fri 5pm | Project Manager |
| Weekly RAG report | Friday 4pm | Project Manager |
| Weekly social draft batch | Friday 2pm | Social Media Manager (if installed) |
| Monthly content calendar | Last Friday 4pm | Marketing Manager (if installed) |

Schedules run automatically when Claude Desktop is open.
```

`architecture/docs/CONTENT.md`:
```markdown
# Content Flow

1. Brief goes into `content/topics/{slug}/blog.md`
2. Writer drafts the post — you review and approve
3. Designer generates the hero image
4. Web Developer builds the page and adds it to the blog index
5. You run `git push origin main` — Vercel deploys automatically

Social posts follow the same approval flow before publishing.
```

`architecture/docs/ARCHITECTURE.md`:
```markdown
# Folder Structure

| Folder | What's in it |
|--------|-------------|
| `.claude/agents/` | Agent definition files (loaded by Claude Desktop) |
| `agents/` | Agent context, personas, and skills |
| `architecture/` | Planning docs, bootstrap files, system design |
| `content/topics/` | Blog topic bundles — one folder per post |
| `content/source-material/` | Raw brand assets, images, research |
| `resources/` | Brand voice, design system, style guides |
| `standup/` | Daily check-ins and compiled briefings |
| `website/` | Next.js project — pages, components, styles |
| `working_files/` | Scratch space (git-ignored) |
```

---

## STEP 8 — Global CLAUDE.md

Write to `~/.claude/CLAUDE.md` (append if exists, never overwrite):

```markdown
# Global Claude Code Rules

## Git
- Run `git status` before any file work.
- Never force-push. Never skip hooks. Never use `git add .` or `git add -A`.
- Never commit unless explicitly instructed.

## Deployment
- Never deploy via CLI. All deployments through git push → CI/CD only.
- Vercel CLI is read-only.

## Secrets
- Never commit .env files, API keys, or credentials.

## Content approval
- Social posts → draft for approval first.
- Email campaigns → ALWAYS require human approval before sending.
- Financial commitments → always the user's decision.

## Continuous improvement
- When a solution is confirmed working, invoke /capture-learning.
```

---

## STEP 9 — Local CLAUDE.md placeholder

```markdown
# {Project Name} — Claude Code Instructions

> Will be completed in P2 after brand intake.

## Quick reference
- Website: website/ (Next.js, Pages Router)
- Agents: .claude/agents/ and agents/
- Content: content/topics/
- Resources: resources/
- Standups: standup/
```

---

## STEP 10 — Engineering rules

Write to `.claude/rules/global-engineering.md`:

```markdown
# Engineering Rules

- Never force-push. Never skip hooks. Never use git add . or git add -A.
- Never commit unless instructed.
- Never deploy via CLI — git push → CI/CD only.
- Never commit .env files or credentials.
- Always confirm before: rm -rf, git reset --hard, dropping database tables.
- Social posts require approval. Email campaigns ALWAYS require approval. Non-negotiable.
```

---

## STEP 11 — .env template

```bash
cat > .env.example << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
RESEND_API_KEY=
LARK_BOT_TOKEN=
LARK_CHAT_ID=
EOF
```

---

## STEP 12 — Write Supabase credentials to .env

Using the values from answers 3, 4, and 5:

```bash
cat > .env << ENVEOF
NEXT_PUBLIC_SUPABASE_URL={supabase-project-url}
NEXT_PUBLIC_SUPABASE_ANON_KEY={supabase-anon-key}
SUPABASE_SERVICE_ROLE_KEY={supabase-service-role-key}
GEMINI_API_KEY=
RESEND_API_KEY=
LARK_BOT_TOKEN=
LARK_CHAT_ID=
ENVEOF
```

---

## STEP 13 — Supabase MCP

```bash
python3 - <<PYEOF
import json, os
token = "{supabase personal access token from answer 6}"
path = os.path.expanduser("~/.claude/settings.local.json")
settings = {}
if os.path.exists(path):
    with open(path) as f:
        try: settings = json.load(f)
        except: settings = {}
settings.setdefault("mcpServers", {})["supabase"] = {
    "command": "npx",
    "args": ["-y", "@supabase/mcp-server-supabase@latest", "--access-token", token]
}
with open(path, "w") as f:
    json.dump(settings, f, indent=2)
print("✅ Supabase MCP configured.")
PYEOF
```

---

## STEP 14 — Install skills

**create-local-task:**
```bash
mkdir -p ~/.claude/skills/create-local-task
cat > ~/.claude/skills/create-local-task/SKILL.md << 'EOF'
---
name: create-local-task
description: Create a tracked local task or to-do item. Use when someone says "add a task", "remind me to", "track this", or "create a to-do". Writes to context/tasks.md.
---

## Steps
1. Confirm task title and optional due date / owner
2. Append to context/tasks.md:
   `- [ ] {title} {(due: YYYY-MM-DD)} {(owner: name)}`
3. Confirm: "✅ Task added to context/tasks.md"
EOF
```

**daily-checkin:**
```bash
mkdir -p ~/.claude/skills/daily-checkin
cat > ~/.claude/skills/daily-checkin/SKILL.md << 'EOF'
---
name: daily-checkin
description: Help a team member write their daily check-in. Trigger: "help me write my check-in", "do my standup", "update my standup". Writes to standup/individual/[name].md.
---

## Flow
1. Ask: "Who are you?" → map to standup/individual/[name].md
2. Ask: "What are you working on today?" → collect 1–5 items
3. Ask: "Any blockers?" → record None or description
4. Check time with `date +%H:%M` — before 09:00 → today, after → tomorrow
5. Write to standup/individual/[name].md:
```
date: YYYY-MM-DD
name: [Name]

## Today's focus
- [item]

## Blockers
[None | description]
```
6. Offer to commit: "(A) just this file  (B) everything changed  (C) skip"
   Stage by name only — never git add . or git add -A
EOF
```

**skill-creator** (check Claude Desktop first, fallback if missing):
```bash
claude skills list 2>/dev/null | grep -qi skill-creator || (
  mkdir -p ~/.claude/skills/skill-creator
  cat > ~/.claude/skills/skill-creator/SKILL.md << 'EOF'
---
name: skill-creator
description: Create a new reusable skill. Trigger: "create a skill for X", "write a skill that does Y". Writes SKILL.md to ~/.claude/skills/{name}/.
---

## Steps
1. Confirm skill name and trigger phrase
2. Write SKILL.md with frontmatter, purpose, steps, edge cases
3. Save to ~/.claude/skills/{name}/SKILL.md
4. Confirm: "✅ Skill '{name}' created"
EOF
)
```

**Lark CLI** — if answer to question 4 was yes:
```bash
npm install -g @larksuite/lark-cli 2>/dev/null || brew install larksuite/tap/lark-cli 2>/dev/null || true
```
If no: skip.

---

## STEP 15 — Initial commit

```bash
git add CLAUDE.md .gitignore .env.example .claude/ agents/ architecture/ content/ resources/ context/ standup/
git commit -m "bootstrap: P1 complete — structure, config, skills"
```

---

---

## STEP 16 — GitHub repo + Vercel import

### 16a — Create GitHub repository

Check if the user already has a GitHub repo for this project:

```bash
gh repo view 2>/dev/null && echo "REPO_EXISTS" || echo "NO_REPO"
```

If `NO_REPO`: create it and push the initial commit:

```bash
gh repo create {project-name} --private --source=. --push
```

If `REPO_EXISTS`: just push:

```bash
git push -u origin main
```

### 16b — Import into Vercel

Output this to the user and **wait for their confirmation before continuing**:

```
▲  VERCEL IMPORT

Now let's connect your project to Vercel for automatic deployments.

1. Go to https://vercel.com/new
2. Under "Import Git Repository", find {project-name} and click Import
3. On the Configure Project screen:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: click Edit → type "website" → click Continue
4. Under Environment Variables, add all three:
   - NEXT_PUBLIC_SUPABASE_URL  → (your Supabase project URL)
   - NEXT_PUBLIC_SUPABASE_ANON_KEY  → (your anon key)
   - SUPABASE_SERVICE_ROLE_KEY  → (your service role key)
5. Click Deploy

Vercel will build the project. The first deploy may take 1–2 minutes.
Once it shows "Congratulations!", copy the deployment URL — you'll need it.

Reply "done" (and optionally the deployment URL) when it's live.
```

---

```
✅ P1 complete. Switch to p2-discovery.md to continue.
```
