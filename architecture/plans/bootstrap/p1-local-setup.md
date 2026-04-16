# P1 — Local Machine Setup
> **Prerequisites:** P0 complete. Claude Desktop (Pro) installed.
> **Where:** Claude Desktop — Cowork tab first, then Code tab.
> **Time:** ~20–30 minutes
> **Done when:** Repo cloned, CLAUDE.md files written, folder structure created, base skills installed.

---

## INSTRUCTIONS FOR CLAUDE

You are running this in two stages:
- **Stage A** runs in Cowork (computer use) — installs tools and pre-seeds permissions
- **Stage B** runs in Code — clones the repo, scaffolds the project, installs skills

Detect which stage you are in:
- If computer use is available → run Stage A
- If `git --version` works and permissions are pre-seeded → run Stage B

---

## STAGE A — Cowork: Install Tools & Pre-Seed Permissions

> **What is Cowork?** It can see and control your screen. It opens your terminal,
> runs commands, and types for you. You do not need to type anything yourself.
>
> **If the user attached a non-MD file** (PDF, Word, screenshot): extract the text,
> save as a temp working file, then continue. Never ask to re-paste.

### A1 — Install developer tools

**macOS — open Terminal.app via computer use and run:**
```bash
which brew || /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
eval "$(/opt/homebrew/bin/brew shellenv)" 2>/dev/null || eval "$(/usr/local/bin/brew shellenv)"
which git      || brew install git
which gh       || brew install gh
which node     || brew install node
which vercel   || npm install -g vercel
which supabase || brew install supabase/tap/supabase
git --version && gh --version && node --version
```

> If Homebrew asks for a Mac password, pause and ask the user to type it, then resume.

**Windows — open PowerShell as Administrator via computer use and run:**
```powershell
winget install --id Git.Git            -e --accept-source-agreements --accept-package-agreements
winget install --id GitHub.cli         -e --accept-source-agreements --accept-package-agreements
winget install --id OpenJS.NodeJS.LTS  -e --accept-source-agreements --accept-package-agreements
winget install --id Supabase.CLI       -e --accept-source-agreements --accept-package-agreements
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
npm install -g vercel
git --version; gh --version; node --version
```

### A2 — GitHub authentication

```bash
gh auth login --web --git-protocol https
```

Output to user:
```
A browser window will open for GitHub login.
Log in (or create a free account), then come back and tell me "done".
```

Wait for "done". Verify: `gh auth status`

### A3 — Pre-seed Claude Code permissions

Run this once. It writes all required permissions to `~/.claude/settings.local.json`
so Claude Code never prompts for approval during the rest of the bootstrap.

```bash
python3 - <<'PYEOF'
import json, os

path = os.path.expanduser("~/.claude/settings.local.json")
home = os.path.expanduser("~")

settings = {}
if os.path.exists(path):
    with open(path) as f:
        try:
            settings = json.load(f)
        except Exception:
            settings = {}

perms = settings.setdefault("permissions", {})
allow = perms.setdefault("allow", [])

required = [
    "Bash(git:*)", "Bash(gh:*)", "Bash(npm:*)", "Bash(npx:*)",
    "Bash(pnpm:*)", "Bash(yarn:*)", "Bash(bun:*)", "Bash(node:*)", "Bash(deno:*)",
    "Bash(python:*)", "Bash(python3:*)", "Bash(pip:*)", "Bash(pip3:*)", "Bash(uv:*)",
    "Bash(cargo:*)", "Bash(go:*)", "Bash(make:*)", "Bash(cmake:*)",
    "Bash(tsc:*)", "Bash(ts-node:*)", "Bash(tsx:*)", "Bash(nx:*)",
    "Bash(ruby:*)", "Bash(gem:*)", "Bash(bundle:*)",
    "Bash(java:*)", "Bash(javac:*)", "Bash(mvn:*)", "Bash(gradle:*)",
    "Bash(swift:*)", "Bash(php:*)", "Bash(composer:*)",
    "Bash(ls:*)", "Bash(cat:*)", "Bash(mkdir:*)", "Bash(touch:*)",
    "Bash(cp:*)", "Bash(mv:*)", "Bash(rm:*)", "Bash(find:*)",
    "Bash(ln:*)", "Bash(chmod:*)", "Bash(realpath:*)", "Bash(basename:*)", "Bash(dirname:*)",
    "Bash(grep:*)", "Bash(rg:*)", "Bash(sed:*)", "Bash(awk:*)",
    "Bash(sort:*)", "Bash(uniq:*)", "Bash(wc:*)", "Bash(head:*)",
    "Bash(tail:*)", "Bash(tee:*)", "Bash(tr:*)", "Bash(cut:*)",
    "Bash(jq:*)", "Bash(diff:*)", "Bash(patch:*)",
    "Bash(curl:*)", "Bash(wget:*)", "Bash(zip:*)", "Bash(unzip:*)",
    "Bash(tar:*)", "Bash(gzip:*)", "Bash(gunzip:*)",
    "Bash(echo:*)", "Bash(printf:*)", "Bash(export:*)", "Bash(source:*)",
    "Bash(env:*)", "Bash(pwd:*)", "Bash(cd:*)", "Bash(date:*)",
    "Bash(which:*)", "Bash(open:*)", "Bash(xargs:*)",
    "Bash(true:*)", "Bash(false:*)", "Bash(test:*)",
    "Bash(kill:*)", "Bash(pkill:*)", "Bash(killall:*)",
    "Bash(ps:*)", "Bash(lsof:*)",
    "Bash(pbcopy:*)", "Bash(pbpaste:*)", "Bash(xcodebuild:*)", "Bash(xcrun:*)",
    "Bash(docker:*)", "Bash(docker-compose:*)", "Bash(kubectl:*)", "Bash(helm:*)",
    "Bash(vercel:*)", "Bash(supabase:*)", "Bash(stripe:*)",
    "Bash(aws:*)", "Bash(gcloud:*)", "Bash(az:*)", "Bash(flyctl:*)",
    "Bash(psql:*)", "Bash(mysql:*)", "Bash(sqlite3:*)", "Bash(redis-cli:*)", "Bash(mongosh:*)",
    "Bash(nvm:*)", "Bash(fnm:*)", "Bash(pyenv:*)", "Bash(mise:*)", "Bash(asdf:*)",
    "mcp__plugin_context-mode_context-mode__ctx_batch_execute",
    "mcp__plugin_context-mode_context-mode__ctx_search",
    "mcp__plugin_context-mode_context-mode__ctx_execute",
    "mcp__plugin_context-mode_context-mode__ctx_fetch_and_index",
    "mcp__plugin_context-mode_context-mode__ctx_execute_file",
    "mcp__playwright__browser_navigate",
    "mcp__playwright__browser_snapshot",
    "mcp__playwright__browser_take_screenshot",
    "Skill(schedule)", "Skill(schedule:*)",
    "Skill(create-agent)", "Skill(create-agent:*)",
    "Skill(skill-creator)", "Skill(skill-creator:*)",
    f"Read({home}/.claude/**)",
    f"Edit({home}/.claude/**)",
    f"Write({home}/.claude/**)",
]

existing = set(allow)
added = [p for p in required if p not in existing]
allow.extend(added)

os.makedirs(os.path.dirname(path), exist_ok=True)
with open(path, "w") as f:
    json.dump(settings, f, indent=2)

print(f"✅ Permissions written: {len(added)} new entries → ~/.claude/settings.local.json")
PYEOF
```

Confirm:
```
✅ Stage A complete.
Tools installed, GitHub authenticated, Claude Code permissions pre-approved.

Now switch to the Code tab in Claude Desktop and paste the P1 file to continue.
```

**Stop here** — Stage B continues in the Code tab.

---

## STAGE B — Code: Repository, Structure & Skills

> **If the user attached a non-MD file**: extract, save as temp file, continue.

### B1 — Verify Stage A completed

```bash
git --version 2>/dev/null && gh auth status 2>/dev/null && echo "READY" || echo "NOT_READY"
```

If NOT_READY:
```
⚠️  Stage A is not complete. Please go to the Cowork tab and run P1 Stage A first.
```
Stop.

### B2 — Configure git identity

Ask:
```
Two quick questions before we set up your project:

A. Your name for git commits (e.g. "Jane Smith" — this shows on GitHub)
B. Your email address (same as your GitHub account)
```

```bash
git config --global user.name  "ANSWER_A"
git config --global user.email "ANSWER_B"
```

### B3 — Create project directory and initialise repo

Ask: "What would you like to name your project folder? (e.g. `acme-marketing`)"

```bash
mkdir -p ~/{project-name} && cd ~/{project-name}
git init
git checkout -b main
```

Create the base `.gitignore`:
```bash
cat > .gitignore << 'EOF'
.env
.env.local
.env.*.local
node_modules/
.next/
working_files/
*.psd
*.ai
*.mov
*.mp4
EOF
```

### B4 — Write global CLAUDE.md

Write (or append if exists) to `~/.claude/CLAUDE.md`. Never overwrite existing content.

```markdown
# Global Claude Code Rules

## Git discipline
- Run `git status` before any file work. Stop if there are uncommitted changes.
- Never force-push to any branch.
- Never skip hooks with --no-verify.
- Never use `git add .` or `git add -A` — stage files by name only.
- Never create a commit unless explicitly instructed by the user.

## Branch and PR discipline
- Never push directly to main — all changes via pull request.
- Confirm the correct base branch before opening a PR.

## Deployment discipline
- Never deploy via CLI directly. All deployments go through git push → CI/CD only.
- Vercel CLI is read-only (status, logs, analytics only).
- Never modify environment variables without recording the change in repo env docs.

## Secrets and credentials
- Never commit .env files, API keys, tokens, or credentials of any kind.
- If a secret is found in staged files, remove it and warn the user immediately.

## Destructive operations
- Always confirm with the user before: rm -rf, git reset --hard, dropping tables,
  or overwriting uncommitted work.

## Content approval
- Social media posts → always draft for approval first (never auto-post by default)
- Email campaigns → ALWAYS require human approval before sending
- Translated content → human review before publishing
- Financial commitments (ads, subscriptions) → always the user's decision

## Continuous improvement
- When a solution is confirmed working by the user, invoke /capture-learning
  (only if: real problem encountered + solution applied + user explicitly approved)
```

Confirm: `✅ ~/.claude/CLAUDE.md written.`

### B5 — Write local project CLAUDE.md

Create `CLAUDE.md` in the project root. This will be fleshed out fully in P2 once
the business context is known — for now write a minimal placeholder:

```markdown
# {Project Name} — Claude Code Instructions

> This file will be completed in P2 after the business discovery interview.

## Quick reference
- Project root: ~/{project-name}/
- Website: website/ (Next.js, Pages Router)
- Agents: .claude/agents/ and agents/
- Content: content/
- Resources: resources/
- Standups: standup/

## Current status
Bootstrap in progress — P1 complete, proceeding to P2.
```

### B6 — Create project folder structure

```bash
mkdir -p .claude/agents
mkdir -p .claude/rules
mkdir -p agents
mkdir -p content/topics
mkdir -p content/social
mkdir -p resources
mkdir -p context/templates
mkdir -p standup/individual
mkdir -p standup/briefings
mkdir -p working_files
mkdir -p website
```

Write `.claude/rules/global-engineering.md`:
```markdown
# Global Engineering Rules

## Git discipline
- Run `git status` before any file work
- Never force-push to any branch
- Never skip hooks with --no-verify
- Never use `git add .` or `git add -A` — stage files by name
- Never create a commit unless explicitly instructed by the user

## Branch and PR discipline
- Never push directly to main — all changes via pull request
- Confirm the correct base branch before opening a PR

## Deployment discipline
- Never deploy via CLI directly — all deployments through git push → CI/CD only
- Never modify environment variables without recording in repo env docs

## Secrets and credentials
- Never commit .env files, API keys, tokens, or credentials
- If a secret is found in staged files, remove it and warn the user

## Destructive operations
- Always confirm before: rm -rf, git reset --hard, dropping database tables

## Content approval
- Social media posts require human approval before publishing
- Email campaigns ALWAYS require human approval before sending — non-negotiable
- Translated content must be human-reviewed before publishing
- Financial commitments always require human approval

## Continuous improvement
- When a solution is confirmed working, invoke the /capture-learning skill
```

### B7 — Write .env template

```bash
cat > .env.example << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Email platform
EMAIL_API_KEY=
EMAIL_LIST_ID=

# Telegram (optional)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
EOF
```

### B8 — Configure Supabase MCP

Read `.claude/settings.local.json` and merge — do not overwrite existing keys:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest", "--access-token", "SUPABASE_ACCESS_TOKEN_PLACEHOLDER"]
    }
  }
}
```

Output:
```
⚠️  SUPABASE_ACCESS_TOKEN_PLACEHOLDER is in .claude/settings.local.json.
Replace it after P2 once your Supabase project is active:
  1. Go to: https://supabase.com/dashboard/account/tokens
  2. Create a token named: {project-name}-claude
  3. Open .claude/settings.local.json and replace the placeholder
  4. Restart Claude Code
```

### B9 — Install base skills

```bash
# skill-creator — Anthropic official skill for creating new skills
npx skills add anthropic/skill-creator -g -y 2>/dev/null || echo "skill-creator: check anthropic skills registry"

# agent-creator — custom skill for generating full agent packages
npx skills add larksuite/cli -g -y 2>/dev/null || true
```

> If `npx skills` is not available, output:
> "Skills CLI not found. Install it with: `npm install -g @anthropic/skills-cli`
> Then re-run B9."

### B10 — Initial git commit

```bash
git add CLAUDE.md .gitignore .env.example .claude/ agents/ content/ resources/ context/ standup/ working_files/.gitkeep
git commit -m "bootstrap: P1 complete — project structure, CLAUDE.md, base config"
```

---

```
✅ P1 complete.

Your project is set up locally with:
  ✓ Developer tools installed (git, node, vercel, supabase CLI)
  ✓ Claude Code permissions pre-approved (no more prompts)
  ✓ GitHub authenticated
  ✓ Project folder structure created
  ✓ Global + local CLAUDE.md written
  ✓ Engineering rules written
  ✓ Supabase MCP configured (token needed after P2)
  ✓ Base skills installed

Next: Paste the P2 file into Claude Code to begin the business discovery interview.
```
