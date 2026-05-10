# Track B — P1: Laptop Setup

> **Who runs this**: Dave (sets up), client watches
> **Machine**: Client's personal laptop
> **Prerequisite**: Track B P0 complete — tools installed, authenticated
> **Output**: Laptop fully configured as a Claude Code machine; no website scaffold (already live from Track A)

---

## Overview

This mirrors Track A P1 in structure but is shorter — no website scaffold, and some tools may already be installed from P0. The goal is a clean `~/.claude/` setup that matches the Mac Mini's configuration so the client's agents behave identically on both machines.

---

## Step 1 — Install remaining dev tools

Check and install what was not already installed in P0:

```bash
# Check each
node --version 2>/dev/null || brew install node
jq --version 2>/dev/null || brew install jq
ffmpeg -version 2>/dev/null || brew install ffmpeg
```

---

## Step 2 — Pre-seed Claude Code permissions

```bash
mkdir -p ~/.claude
```

Write `~/.claude/settings.local.json` — identical to Track A:

```json
{
  "permissions": {
    "allow": [
      "Bash(git:*)",
      "Bash(gh:*)",
      "Bash(npm:*)",
      "Bash(node:*)",
      "Bash(vercel:*)",
      "Bash(supabase:*)",
      "Bash(ffmpeg:*)",
      "Bash(jq:*)",
      "Bash(ls:*)",
      "Bash(find:*)",
      "Bash(grep:*)",
      "Bash(cp:*)",
      "Bash(mv:*)",
      "Bash(mkdir:*)",
      "Bash(rm:*)",
      "Bash(cat:*)",
      "Bash(echo:*)",
      "Bash(curl:*)",
      "Bash(python3:*)",
      "Bash(npx:*)"
    ]
  }
}
```

---

## Step 3 — Create global Claude Code directories

```bash
mkdir -p ~/.claude/agents
mkdir -p ~/.claude/skills
mkdir -p ~/.claude/rules
```

---

## Step 4 — Write global CLAUDE.md

```bash
cat > ~/.claude/CLAUDE.md << 'EOF'
# Global Claude Code Rules

## Identity
You are the AI development team for {Business Name}. You have 8 specialist agents available globally on this machine.

## Agents
All 8 agents are installed in `~/.claude/agents/`. Agents are defined in the agents repo at `~/{project-slug}-agents/`.

## Engineering rules
See `~/.claude/rules/global-engineering.md` for all code and git discipline rules.

## Content queue
Add a `brief.md` to any `content/topics/{slug}/` folder to queue a post.
The Writer picks the oldest unwritten topic automatically on schedule.

## Publishing workflow (automated Mon–Wed — runs on Mac Mini)
1. Monday 9am    — Writer writes the post + image prompt
2. Tuesday 9am   — Designer generates the hero image
3. Wednesday 9am — Web Developer builds and stages the page
4. Run: `git push origin main` (owner only)
EOF
```

---

## Step 5 — Write global engineering rules

```bash
cat > ~/.claude/rules/global-engineering.md << 'EOF'
# Global Engineering Rules

## Git discipline
- Run `git status` before any file work.
- Never force-push to any branch.
- Never skip hooks with `--no-verify`.
- Never use `git add .` or `git add -A` — stage files explicitly by name.
- Never create a commit unless explicitly instructed by the user.

## Branch and PR discipline
- Never push directly to `main` or `master`. All changes go through a pull request.
- Confirm the correct base branch before opening a PR.

## Deployment discipline
- Never deploy using `vercel deploy` or `vercel --prod` directly.
- All deployments flow through `git push` → CI/CD pipeline only.

## Secrets and credentials
- Never commit `.env` files, API keys, tokens, or passwords.
- Never include secrets in code, comments, or commit messages.

## Destructive operations
- Always confirm with the user before: `rm -rf`, `git reset --hard`, dropping database tables.
EOF
```

---

## Step 6 — Write .env credentials

```bash
cat > ~/.claude/.env << 'EOF'
SUPABASE_URL={from-credentials-file}
SUPABASE_ANON_KEY={from-credentials-file}
SUPABASE_SERVICE_ROLE_KEY={from-credentials-file}
GEMINI_API_KEY={from-credentials-file}
RESEND_API_KEY={from-credentials-file}
LARK_APP_ID={from-credentials-file}
LARK_APP_SECRET={from-credentials-file}
LARK_WEBHOOK_URL={from-credentials-file}
EOF
```

Replace all values from the credentials file transferred in P0.

---

## Step 7 — Configure Supabase MCP

This connects the client's laptop to the same Supabase account set up in Track A.

Say this to Claude Code:

```
Set up the Supabase MCP server on this machine:
1. Fetch the latest Supabase MCP setup documentation so you follow the current install method
2. Add the MCP server to ~/.claude/settings.local.json
3. Start the Supabase authentication flow and give me the browser URL to authorize
4. After I tell you I've completed authorization, finish the auth flow
5. Verify the connection by listing the Supabase projects on this account
```

**The only manual step**: Claude will output a URL — open it in a browser and click **Authorize**. Tell Claude "done" when the page confirms success.

Claude handles everything else: package installation, config file update, auth completion, and connection verification.

---

## Step 8 — Install global skills

### daily-checkin skill

```bash
mkdir -p ~/.claude/skills/daily-checkin
cat > ~/.claude/skills/daily-checkin/SKILL.md << 'EOF'
---
name: daily-checkin
description: Run morning standup check-in — reads recent git commits, open PRs, and any pending content briefs; outputs a brief for the day.
triggers: ["daily checkin", "morning standup", "what's on today"]
---

## Steps
1. Run `git log --oneline -10` in the project folder
2. Run `gh pr list --state open`
3. Check `content/topics/` for any folders with `brief.md` but no `blog.md`
4. Output: what shipped yesterday, open PRs, content queued
EOF
```

### create-routines skill

```bash
mkdir -p ~/.claude/skills/create-routines
cat > ~/.claude/skills/create-routines/SKILL.md << 'EOF'
---
name: create-routines
description: Creates a task file in working_files/tasks/ with a clear description, acceptance criteria, and priority.
triggers: ["create task", "new task", "log task"]
---

## Steps
1. Ask: task title, description, priority (high/medium/low)
2. Write to `working_files/tasks/{YYYY-MM-DD}-{slug}.md`
3. Format:
   ```
   # {Title}
   Priority: {priority}
   Created: {date}
   
   ## Description
   {description}
   
   ## Acceptance criteria
   - [ ] ...
   ```
EOF
```

---

## Step 9 — Clone the website project locally

```bash
mkdir -p ~/code-projects
cd ~/code-projects
gh repo clone {clientslug}/{project-slug}-website
cd {project-slug}-website
npm install
```

Verify the dev server starts:
```bash
npm run dev
```
Open `http://localhost:3000` — confirm the client site loads (Hero, Infinite Leverage Agenda, 18 Protocols).

```bash
# Stop the server
Ctrl+C
```

---

## P1 complete — what you have now

- [ ] node, jq, ffmpeg installed
- [ ] `~/.claude/settings.local.json` with permissions + Supabase MCP
- [ ] `~/.claude/agents/`, `~/.claude/skills/`, `~/.claude/rules/` created
- [ ] `~/.claude/CLAUDE.md` written (matches Mac Mini)
- [ ] `~/.claude/rules/global-engineering.md` written
- [ ] `~/.claude/.env` written with all API keys
- [ ] Global skills installed: `daily-checkin`, `create-routines`
- [ ] `~/code-projects/{project-slug}-website/` cloned locally, dev server verified

**Next**: [P2 — Connect to Agent Team](p2-client-connect.md)
