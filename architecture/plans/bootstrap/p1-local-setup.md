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

**How to communicate with the user throughout P1:**
- Before every step, say in one plain-English sentence what you are about to do and why.
- When a tool is installed for the first time, introduce it with a one-sentence explanation: what it is and what role it plays in the project.
- After each major step completes, confirm it worked before moving on.
- Never run a block of commands in silence — always narrate.

---

## STAGE A — Cowork: Install Tools & Pre-Seed Permissions

> **What is Cowork?** It can see and control your screen. It opens your terminal,
> runs commands, and types for you. You do not need to type anything yourself.
>
> **If the user attached a non-MD file** (PDF, Word, screenshot): extract the text,
> save as a temp working file, then continue. Never ask to re-paste.

### A1 — Install developer tools

Before running anything, say:
```
I'm going to install the developer tools your project needs.
Each one takes about 30 seconds. I'll tell you what each one does as I go.

• Homebrew — an installer for Mac developer tools (like an App Store for code tools)
• git — tracks every change to your project files, like a version history you can rewind
• gh — lets me push your code to GitHub automatically, without you typing passwords
• node — runs the JavaScript code your website is built on
• vercel — deploys your website to the internet with one command
• supabase CLI — lets me connect to your database from your computer

Starting now — your Mac may ask for your password once during this process. That's normal.
```

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

After this completes, say:
```
All developer tools are installed. ✅
```

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

Run this once. It writes a `Bash(*)` wildcard plus MCP and file permissions to
`~/.claude/settings.local.json` so Claude Code never prompts for shell command
approval during the rest of the bootstrap or any scheduled agent run.

`Bash(*)` is a single entry that covers every tool — full paths, chained commands
(`&&`, `;`, pipes), inline scripts (`python3 -c "..."`), and any CLI not yet installed.
Per-command rules accumulate debt and miss edge cases; the wildcard eliminates the
problem entirely. `defaultMode: acceptEdits` keeps file-write prompts active while
removing all Bash prompts.

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

# Bash(*) as first entry covers all shell commands — no per-command rules needed
required = [
    "Bash(*)",
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

# Bash(*) must be first — move it to the front if already present elsewhere
allow = [p for p in allow if p != "Bash(*)"]
existing = set(allow)
added = [p for p in required if p not in existing and p != "Bash(*)"]
allow = ["Bash(*)", *allow, *added]

perms["allow"] = allow
perms["defaultMode"] = "acceptEdits"

os.makedirs(os.path.dirname(path), exist_ok=True)
with open(path, "w") as f:
    json.dump(settings, f, indent=2)

print(f"✅ Permissions written → ~/.claude/settings.local.json")
print(f"   Bash(*) wildcard is first — no per-command prompts for the rest of bootstrap")
print(f"   defaultMode: acceptEdits — file writes still prompt, Bash never does")
PYEOF
```

Confirm:
```
✅ Stage A complete.
Tools installed, GitHub authenticated, Claude Code permissions pre-approved.

Next:
  1. Switch to the Code tab in Claude Desktop
  2. Click the 📎 attachment icon (bottom-left of the message box)
  3. Re-attach this same file — p1-local-setup.md
  4. Send it — Claude Code will continue from Stage B automatically
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

Say:
```
First, I'll link your name and email to your code changes.
Every time you save work to GitHub, your name appears on it — like signing a document.
```

Ask:
```
Two quick questions:

A. Your name for git commits (e.g. "Jane Smith" — this shows on GitHub)
B. Your email address (same as your GitHub account)
```

```bash
git config --global user.name  "ANSWER_A"
git config --global user.email "ANSWER_B"
```

After: `✅ Git identity set — your name and email will appear on every commit.`

### B3 — Create project directory and initialise repo

Say:
```
Now I'll create your project folder and turn it into a git repository.
A repository (or "repo") is just a folder that tracks every change ever made to it —
like a timeline you can rewind. Everything for your business lives inside this one folder.
```

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
- Content topics: content/topics/ (one folder per post)
- Source material: content/source-material/
- Content calendar: content/content-calendar/
- Resources: resources/
- Standups: standup/

## Current status
Bootstrap in progress — P1 complete, proceeding to P2.
```

### B6 — Create project folder structure

```bash
mkdir -p .claude/agents
mkdir -p .claude/rules
mkdir -p .claude/skills
mkdir -p agents
mkdir -p content/topics
mkdir -p content/source-material
mkdir -p content/content-calendar
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

Say:
```
I'm going to connect Claude to your database using something called MCP
(Model Context Protocol). MCP is a standard way for Claude to talk directly
to external tools — in this case, your Supabase database. Once it's configured,
Claude can read and write database records without you having to copy-paste anything.
I'll add a placeholder token for now — you'll fill in the real one after P2.
```

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

Say:
```
Now I'll install "skills" — reusable instruction sets that teach Claude how to
do specific tasks. Think of them like recipes: instead of re-explaining a process
every time, Claude reads the skill file and follows it. Your AI team will use
skills for things like writing check-ins, building web pages, and posting content.
```

```bash
# skill-creator — Anthropic official skill for creating new skills
npx skills add anthropic/skill-creator -g -y 2>/dev/null || echo "skill-creator: check anthropic skills registry"

# agent-creator — custom skill for generating full agent packages
npx skills add larksuite/cli -g -y 2>/dev/null || true
```

> If `npx skills` is not available, output:
> "Skills CLI not found. Install it with: `npm install -g @anthropic/skills-cli`
> Then re-run B9."

### B10 — Install daily-checkin skill

Create the directory and write the skill file directly.
Team member names are placeholders — P3 will replace them with the real roster.

```bash
mkdir -p ~/.claude/skills/daily-checkin
```

Write the following content to `~/.claude/skills/daily-checkin/SKILL.md`:

---
name: daily-checkin
description: Help a human team member write their daily check-in. Use when someone says "help me write my check-in", "I need to do my standup", "update my standup", or "fill in my check-in". Writes check-ins to standup/individual/[name].md.
---

# Daily Check-in Skill

## Purpose

Guide a human team member through their daily check-in and write the result to the correct file, ready for the PM agent to pick up at 9 AM.

> Setup note: Replace [Person 1], [Person 2], [Person 3] and their file paths below with your actual team member names once they are confirmed in P3.

---

## Human Check-in Flow

### 1. Confirm the person

Ask: "Who are you?"

Map to file (update these in P3 with real names):
- [Person 1] → standup/individual/person1.md
- [Person 2] → standup/individual/person2.md
- [Person 3] → standup/individual/person3.md

### 2. Ask about today's focus

Ask: "What are you working on today?"

If the answer is vague, follow up for specifics. Collect 1-5 focus items and confirm them back before writing.

### 3. Ask about notes (optional)

Ask: "Any context worth sharing — background, decisions made, anything the team should know?"

Capture briefly if yes; skip if no.

### 4. Ask about blockers

Ask: "Any blockers stopping or slowing you down?"

Record None or a brief description per blocker.

### 5. Determine the check-in date

Before writing, check the current local time and set the date accordingly:

| Time of check-in | Date to use | Reason |
|------------------|-------------|--------|
| Before 09:00 | Today | Early morning = today's standup |
| 09:00 or later | Tomorrow | Standup has already run — prep for next day |

Use `date +%H:%M` to get the current time.

### 6. Write the file

Write to standup/individual/[name].md, replacing any previous content:

```
date: YYYY-MM-DD
name: [Name]

## Today's focus
- [item 1]
- [item 2]

## Notes
- [optional — omit section if nothing to add]

## Blockers
[None | description]
```

Rules:
- Line 1 must be `date: YYYY-MM-DD` — use the date from Step 5
- Focus items must be action-oriented (verb + outcome)
- Blockers section must always be present, even if None

### 7. Confirm

Say: "Your check-in is saved to standup/individual/[name].md. The PM picks it up at 9 AM. You're all set."

If date was set to tomorrow: "It's past 9 AM — I've dated this for tomorrow so it's ready for the next 9 AM compile."

### 8. Offer to commit and push

Run `git status` to see the full picture of modified and untracked files.

Present the results split into two groups:

```
Your standup file:
  standup/individual/[name].md

Other changed files (if any):
  [list every other modified/untracked file — or "None" if clean]
```

Then ask: "Would you like me to commit and push:
(A) Just your standup file
(B) Everything listed above
(C) Skip — I'll handle it myself"

If A — standup only:
```bash
git checkout -b standup/[name]/YYYY-MM-DD
git add standup/individual/[name].md
git commit -m "standup([name]): YYYY-MM-DD"
git push origin standup/[name]/YYYY-MM-DD
gh pr create --title "standup([name]): YYYY-MM-DD" --base main --body "Daily check-in for [Name]"
gh pr merge --merge --auto --delete-branch
git checkout main && git pull origin main
git branch -d standup/[name]/YYYY-MM-DD 2>/dev/null || true
```

If B — everything: show the exact file list again and ask once more: "To confirm — I'll stage and commit these files: [list]. Proceed? (yes / no)"
Only proceed after an explicit yes. Stage each file by name — never use git add . or git add -A.
Then follow the same branch → commit → push → PR → merge flow as option A.

If C — skip: say "No problem. Run git add standup/individual/[name].md when you're ready."

---

## Conversational tone

- Brief and direct — this should take under 2 minutes
- If someone says "just write it based on what I told you", do it immediately
- If someone pastes a wall of text, extract the relevant fields yourself, confirm, then write

---

## Edge cases

| Situation | Action |
|-----------|--------|
| Name not in roster | Write to standup/individual/[name].md; note PM may not recognise it |
| No focus items given | Ask once more; if still nothing, write "No update provided" and flag it |
| Check-in already exists for today | Overwrite — the new entry is canonical |
| Person wants to update later | Tell them to re-run this skill; it will overwrite |

---
(end of skill file)

```bash
echo "✅ daily-checkin skill written → ~/.claude/skills/daily-checkin/SKILL.md"
echo "   Team member names are placeholders — update in P3 with real names"
```

### B11 — Initial git commit

Say:
```
Almost done. I'm going to save a snapshot of everything we've just built.
This is your first git commit — a saved checkpoint you can always come back to.
It records the folder structure, your config files, and the base skills we installed.
```

```bash
git add CLAUDE.md .gitignore .env.example .claude/ agents/ content/ resources/ context/ standup/ working_files/.gitkeep
git commit -m "bootstrap: P1 complete — project structure, CLAUDE.md, base config"
```

After: `✅ First checkpoint saved. Your project has its foundation.`

---

```
✅ P1 complete.

Your project is set up locally with:
  ✓ Developer tools installed (git, node, vercel, supabase CLI)
  ✓ GitHub authenticated
  ✓ Claude Code permissions pre-approved — Bash(*) wildcard, no prompts ever again
  ✓ defaultMode set to acceptEdits — file writes still confirm, Bash never does
  ✓ Project folder structure created
  ✓ Global + local CLAUDE.md written
  ✓ Engineering rules written
  ✓ Supabase MCP configured (token needed after P2)
  ✓ Base skills installed
  ✓ daily-checkin skill installed — team member names are placeholders, update in P3

Next:
  1. Click the 📎 attachment icon (bottom-left of the message box)
  2. Select p2-discovery.md from your files
  3. Send it — Claude will begin the business discovery interview
```
