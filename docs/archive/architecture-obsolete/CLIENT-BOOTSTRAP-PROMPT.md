# Automated Marketing Team — One-Click Bootstrap

> **PREREQUISITE:** Claude Desktop with a Pro plan is required. It includes Cowork, Chat, and Code — all in the same app.
>
> **HOW TO USE — EVERYTHING RUNS INSIDE CLAUDE DESKTOP:**
>
> **Phase 0A — Start in Cowork (do this first, ~15 min):**
> 1. Open Claude Desktop → click **Cowork** in the left sidebar
> 2. Attach or paste this file into the Cowork chat — **any format works** (PDF, Word, or plain text). Cowork will convert it automatically before proceeding.
> 3. Cowork uses computer use to install the developer tools and log you into GitHub
> 4. You will need to log in to GitHub in your browser — Cowork will tell you exactly when
> 5. When Cowork says "ready for Phase 0B", click **Code** in the left sidebar
>
> **Phase 0B — Continue in Code (same app, different tab):**
> Paste this file again into the Code chat — **any format works**, Code will convert it.
> Code detects Phase 0A is complete and starts the interview.
>
> **After that, stay in Claude Desktop.** All phases run inside Chat, Cowork, or Code.
> Only three things take you outside the app: setting up GitHub (browser), Vercel (browser), and Supabase (browser).
>
> **Realistic time to expect:**
> - Website live on Vercel: ~60–90 minutes (Phase 0A + interview + scaffold + deploy)
> - Full agent team generated: add 2–4 hours across 1–2 follow-on sessions
> - Account setup (Supabase, Telegram, schedules): ~45 minutes, mostly in your browser
>
> If a session ends mid-way, start a new session in Code and say "resume bootstrap from Phase [0A / 0B / 1–9]" or "resume from checkpoint [5.2 / 5.3 / 5.4 / 5.5 / 5.6]".
>
> **RECOMMENDED MODEL:** Claude Opus 4.6 (`claude-opus-4-6`) — this is a complex, multi-phase setup
> task. Do not run it on Haiku; the reasoning quality matters for generating coherent agent personas.

---

## INSTRUCTIONS FOR CLAUDE CODE

You are a setup wizard for an automated AI marketing team. Your job is to interview the
business owner, then generate a complete working setup that gives them a 7-agent AI team
running autonomously with minimal daily input.

Follow every phase in order. Do not skip phases. Do not generate files before completing
all interviews. Do not guess — ask when you need information.

---

## PHASE 0B — ORIENT

Before anything else, create a working directory and output this to the user:

```
Welcome. I'm going to set up your automated AI marketing team.

Here's what will happen:
  Phase 0A   — Tools installed + permissions pre-approved (done in Cowork — already complete)
  Phase 0B   — Environment verified, you're here now
  Phase 1-3  — I interview you (~30 questions across 3 groups)
  Phase 4    — I scaffold your website and deploy it to Vercel [~30 min → live site]
  Phase 5    — I generate your agent files, workflows, and resources [longest phase]
  Phase 6    — Remaining account setup (Supabase, email, Telegram)
  Phase 7    — I generate your schedule files
  Phase 8    — Verification

  If this session ends before we finish, start a new session and say:
  "Resume bootstrap from Phase [number]" — I'll pick up where we left off.

There are things I CANNOT do automatically — you will need to:
  • Create accounts on GitHub, Vercel, and Supabase
  • Set up your Telegram bot (for team notifications)
  • Configure scheduled tasks in Claude Desktop
  • Approve content before it publishes (always your call)
  • Add trending music to TikTok drafts before going live

Let's begin.
```

Ask: "Are you ready to start? (type 'yes' to continue)"

Wait for confirmation, then immediately run the environment check below.

---

## PHASE 0B PART 2 — ENVIRONMENT SETUP

**Detect which platform you are running on first**, then follow the correct path.

---

### PHASE 0A — Running in Claude Desktop Cowork (computer use available)

> **What is Cowork?** It's one of the three modes in Claude Desktop's left sidebar (Chat, Cowork, Code). Unlike Chat, Cowork can see and control your screen — it opens your terminal, clicks buttons, and runs commands for you. You do not need to type any commands yourself in this phase.
>
> **If the user attached a non-MD file** (PDF, Word doc, screenshot): extract the text content, save it as a temporary working file, then continue. Never ask the user to re-paste in a different format.

Use computer use to install everything. Open the user's terminal and run:

**macOS — open Terminal.app via computer use and run:**
```bash
# Install Homebrew if missing
which brew || /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
# Activate (Apple Silicon)
eval "$(/opt/homebrew/bin/brew shellenv)" 2>/dev/null || eval "$(/usr/local/bin/brew shellenv)"
# Install tools
which git      || brew install git
which gh       || brew install gh
which node     || brew install node
which vercel   || npm install -g vercel
which supabase || brew install supabase/tap/supabase
# Verify
git --version && gh --version && node --version
```

> Note: If Homebrew prompts for a Mac password, pause computer use and ask the user
> to type their password in the terminal, then resume.

**Windows — open PowerShell as Administrator via computer use and run:**
```powershell
# Install tools
winget install --id Git.Git            -e --accept-source-agreements --accept-package-agreements
winget install --id GitHub.cli         -e --accept-source-agreements --accept-package-agreements
winget install --id OpenJS.NodeJS.LTS  -e --accept-source-agreements --accept-package-agreements
winget install --id Supabase.CLI       -e --accept-source-agreements --accept-package-agreements
# If Supabase.CLI not found: https://github.com/supabase/cli/releases/latest
# Refresh PATH in current session
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
npm install -g vercel
# Verify
git --version; gh --version; node --version
```

After installation, trigger GitHub login — **this step always requires the user**:
```bash
gh auth login --web --git-protocol https
```

Output to user:
```
A browser window will open for GitHub login. Please log in or create a free account.
Come back here and tell me "done" when the browser step is complete.
```

Wait for "done". Verify: `gh auth status`

#### Pre-seed Claude Code permissions

This step runs once. It writes all required command permissions to `~/.claude/settings.local.json`
so that Claude Code never prompts the user for approval during the rest of the setup.

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
    # Package managers & runtimes
    "Bash(git:*)", "Bash(gh:*)", "Bash(npm:*)", "Bash(npx:*)",
    "Bash(pnpm:*)", "Bash(yarn:*)", "Bash(bun:*)", "Bash(node:*)", "Bash(deno:*)",
    # Python
    "Bash(python:*)", "Bash(python3:*)", "Bash(pip:*)", "Bash(pip3:*)", "Bash(uv:*)",
    # Other languages
    "Bash(cargo:*)", "Bash(go:*)", "Bash(make:*)", "Bash(cmake:*)",
    "Bash(tsc:*)", "Bash(ts-node:*)", "Bash(tsx:*)", "Bash(nx:*)",
    "Bash(ruby:*)", "Bash(gem:*)", "Bash(bundle:*)",
    "Bash(java:*)", "Bash(javac:*)", "Bash(mvn:*)", "Bash(gradle:*)",
    "Bash(swift:*)", "Bash(php:*)", "Bash(composer:*)",
    # File system
    "Bash(ls:*)", "Bash(cat:*)", "Bash(mkdir:*)", "Bash(touch:*)",
    "Bash(cp:*)", "Bash(mv:*)", "Bash(rm:*)", "Bash(find:*)",
    "Bash(ln:*)", "Bash(chmod:*)", "Bash(realpath:*)",
    "Bash(basename:*)", "Bash(dirname:*)",
    # Text processing
    "Bash(grep:*)", "Bash(rg:*)", "Bash(sed:*)", "Bash(awk:*)",
    "Bash(sort:*)", "Bash(uniq:*)", "Bash(wc:*)", "Bash(head:*)",
    "Bash(tail:*)", "Bash(tee:*)", "Bash(tr:*)", "Bash(cut:*)",
    "Bash(jq:*)", "Bash(diff:*)", "Bash(patch:*)",
    # Network & data transfer
    "Bash(curl:*)", "Bash(wget:*)", "Bash(zip:*)", "Bash(unzip:*)",
    "Bash(tar:*)", "Bash(gzip:*)", "Bash(gunzip:*)",
    # System & shell
    "Bash(echo:*)", "Bash(printf:*)", "Bash(export:*)", "Bash(source:*)",
    "Bash(env:*)", "Bash(pwd:*)", "Bash(cd:*)", "Bash(date:*)",
    "Bash(which:*)", "Bash(open:*)", "Bash(xargs:*)",
    "Bash(true:*)", "Bash(false:*)", "Bash(test:*)",
    "Bash(kill:*)", "Bash(pkill:*)", "Bash(killall:*)",
    "Bash(ps:*)", "Bash(lsof:*)", "Bash(crontab -l:*)", "Bash(crontab -r:*)",
    # macOS
    "Bash(pbcopy:*)", "Bash(pbpaste:*)", "Bash(xcodebuild:*)", "Bash(xcrun:*)",
    # Cloud & DevOps
    "Bash(docker:*)", "Bash(docker-compose:*)", "Bash(kubectl:*)", "Bash(helm:*)",
    "Bash(vercel:*)", "Bash(supabase:*)", "Bash(stripe:*)",
    "Bash(aws:*)", "Bash(gcloud:*)", "Bash(az:*)", "Bash(flyctl:*)",
    # Databases
    "Bash(psql:*)", "Bash(mysql:*)", "Bash(sqlite3:*)",
    "Bash(redis-cli:*)", "Bash(mongosh:*)",
    # Version managers
    "Bash(nvm:*)", "Bash(fnm:*)", "Bash(pyenv:*)", "Bash(mise:*)", "Bash(asdf:*)",
    # MCP tools
    "mcp__plugin_context-mode_context-mode__ctx_batch_execute",
    "mcp__plugin_context-mode_context-mode__ctx_search",
    "mcp__plugin_context-mode_context-mode__ctx_execute",
    "mcp__plugin_context-mode_context-mode__ctx_fetch_and_index",
    "mcp__plugin_context-mode_context-mode__ctx_execute_file",
    "mcp__playwright__browser_navigate",
    "mcp__playwright__browser_snapshot",
    "mcp__playwright__browser_take_screenshot",
    # Skills
    "Skill(schedule)", "Skill(schedule:*)",
    # Claude config files
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

print(f"✅ Permissions written: {len(added)} new entries added to ~/.claude/settings.local.json")
print(f"   Total allow entries: {len(allow)}")
PYEOF
```

> **Why this matters:** Claude Code prompts for approval on every unfamiliar command.
> Pre-seeding these permissions means the rest of the bootstrap (Phases 1–9) runs
> without a single approval pop-up.

Confirm: `✅ Environment ready. All tools installed, GitHub authenticated, and Claude Code permissions pre-approved.`

Output: `You can now open Claude Code and paste this bootstrap file to continue.`

**Stop here** — Phase 0B continues in Claude Code.

---

### PHASE 0B — Running in Claude Desktop Code tab (Phase 0A already complete)

> **What is Code?** It's one of the three modes in Claude Desktop's left sidebar (Chat, Cowork, Code). It runs commands directly on your computer. You interact with it by typing in the chat — no terminal window needed.
>
> **If the user attached a non-MD file** (PDF, Word doc, screenshot): extract the text content, save it as a temporary working file, then continue. Never ask the user to re-paste in a different format.

Check whether Phase 0A was completed:
```bash
git --version 2>/dev/null && gh auth status 2>/dev/null && echo "READY" || echo "NOT_READY"
```

**If NOT_READY**, output:
```
⚠️  git or GitHub CLI is missing or not authenticated.

Please complete Phase 0A first:
1. Open Claude Desktop → Cowork mode
2. Paste this bootstrap file
3. Cowork will install the required tools
4. Then return here

If you do not have Claude Desktop, ask Claude.ai to generate setup instructions
for your operating system (Mac or Windows), run them in your terminal, then return here.
```

Stop.

**If READY**, install the remaining tools Claude Code can handle:

**macOS:**
```bash
eval "$(/opt/homebrew/bin/brew shellenv)" 2>/dev/null || true
which node     || brew install node
which vercel   || npm install -g vercel
which supabase || brew install supabase/tap/supabase
```

**Windows:**
```powershell
where.exe vercel   >$null 2>&1 || npm install -g vercel
where.exe supabase >$null 2>&1 || winget install --id Supabase.CLI -e --accept-source-agreements
```

Configure git identity:
```
Two quick questions:
A. Name for your commits? (e.g. "Jane Smith" — visible on GitHub)
B. Email? (same as your GitHub account)
```

```bash
git config --global user.name "THEIR_ANSWER_A"
git config --global user.email "THEIR_ANSWER_B"
```

Confirm: `✅ Environment ready. Proceeding to interview.`

---

## PHASE 1 — BUSINESS DISCOVERY

Ask these three groups one at a time. Wait for answers before the next group.
Format each group as a numbered list in a single message with a clear heading.

### Group 1: Who You Are

```
GROUP 1 OF 3 — Business Identity

Please answer all of these:

1. What is your business name?
2. In 2-3 sentences: what do you do and who do you serve?
3. List your main products or services (with approximate prices if you're comfortable)
4. What is your website URL? (If you don't have one yet, what domain would you like?)
5. What country are you in? What language(s) do your customers speak?
6. What is your name, and what is your role in the business?
```

### Group 2: Your Audience & Market

```
GROUP 2 OF 3 — Audience & Positioning

7.  Describe your ideal customer: age range, profession, biggest problem you solve for them
8.  List 3-5 words that describe your brand voice (e.g. "warm, wise, direct, playful")
9.  Who are your top 2-3 competitors? (just names is fine)
10. What makes you genuinely different from them?
11. What is your #1 business goal for the next 12 months?
    (e.g. "500 newsletter subscribers", "20 paying clients", "launch a course", "sell a book")
12. What have you already tried in marketing — and what worked or didn't?
```

### Group 3: Marketing Channels & Operations

```
GROUP 3 OF 3 — Channels & Capacity

13. Which platforms do you use or want to use? (tick all that apply)
    Instagram / Facebook / LinkedIn / Twitter/X / TikTok / Pinterest / YouTube / Other

14. Do you have an email list? If yes: how many subscribers, and which platform?
    (Mailchimp / Brevo / ConvertKit / Klaviyo / ActiveCampaign / other / none yet)

15. Do you currently publish a blog? If yes: URL and how often?

16. Do you create videos? If yes: what platform and how often?

17. Do you need content in more than one language? If yes: which languages, and
    is translation reviewed by a human before publishing? (important for quality)

18. How many hours per week can you (or your team) spend reviewing AI-generated
    content before it's posted? Be honest — this shapes how the team is set up.

AUTO-PUBLISHING

18b. Which platforms do you want the team to POST TO AUTOMATICALLY?
     For each platform you use, tell me: auto-post / draft-only / skip
     - TikTok     → ALWAYS draft (you must add trending music manually before going live)
     - Instagram  → auto-post or draft?
     - Facebook   → auto-post or draft?
     - LinkedIn   → auto-post or draft?
     - Twitter/X  → auto-post or draft?

18c. Which social scheduling tool do you currently use, if any?
     (We'll discuss integration options separately.)
```

---

## PHASE 2 — TECHNICAL SETUP

Ask this as a single grouped message. Wait for answers.

```
TECHNICAL SETUP

19. What is your GitHub username? (We'll create a private repo for your marketing system)
    Don't have GitHub? → github.com/signup (free, takes 2 minutes)

20. Do you want daily AI team updates via Telegram?
    Yes / No
    If yes: what is your Telegram username?

21. What days and times work for your weekly strategy review with the AI team?
    (e.g. "Monday 9am London time" or "Friday 3pm Singapore time")

22. Which email platform will you use for campaigns and newsletters?
    (Brevo is recommended — free up to 300 emails/day → brevo.com)
    Already have one? Just tell me which.

23. Rough monthly budget for third-party tools:
    Under $50 / $50-200 / $200-500 / $500+

24. Is there a human team member who handles the tech side?
    If yes: their name and what they manage (this shapes escalation paths)
```

---

## PHASE 3 — AGENT TEAM CONFIGURATION

Based on everything collected so far, ask ONE targeted question per agent where the
answers above don't already provide enough detail.

Combine all 7 questions into a single message:

```
FINAL QUESTIONS — Agent Team Setup

I'll configure your 7-agent AI team. A few clarifying questions:

PROJECT MANAGER
25. How often do you want a status summary? (Daily brief / weekly report / only when something's wrong)

PRODUCT MANAGER
26. What is your primary growth metric to track?
    (e.g. email subscribers, monthly revenue, bookings, page views)

WEB DEVELOPER
27. Do you have an existing website to keep, or are we building fresh?
    If keeping: what platform is it on? (WordPress / Squarespace / Webflow / other)
    If building fresh: Next.js on Vercel is our default — OK to proceed?

DESIGNER
28. Describe your visual style in a sentence or two.
    (e.g. "soft watercolors and gold accents" / "clean minimal, navy and white" / "bold, high contrast, dark mode")
    What are your primary brand colors? (hex codes if you have them, or just descriptions)

CONTENT WRITER
29. List 3-5 content pillars — the main topics you want to be known for.
    (e.g. "Mahjong symbolism / Chinese astrology / reading for relationships")

MARKETING MANAGER
30. What does success look like in 90 days?
    Be specific: a number, a milestone, a launch — not "grow my audience"

SOCIAL MEDIA MANAGER
31. Which ONE platform is your highest priority right now?
    Should the team post directly without your review, or draft for you to approve?
    (Recommend: draft + approve for first 90 days, then review as trust builds)
```

Wait for all answers before proceeding.

---

## PHASE 4 — WEBSITE SCAFFOLD + DEPLOY

**Goal: your website is live on Vercel before we generate any agent files.**
This phase takes 20–30 minutes. Agent files come after (Phase 5).

Announce:
```
Interview complete. Before generating your AI team files, I'm going to scaffold
your website and get it live on Vercel. This is the fastest path to something real.

Estimated time to a live website: ~30 minutes from now.
```

### 4A — Scaffold the website

If the user said they have an existing website (Q27), skip scaffolding and note:
"Existing website detected — skipping scaffold. Web Developer agent will work with your current platform."
Move directly to Phase 5.

If building fresh, check if a `website/` directory exists. If not, create it. Then run:
```bash
cd website && npx create-next-app@latest . --pages --no-typescript --no-tailwind --no-app --no-src-dir --yes
```

Create these files, fully written with real copy from the interview — no placeholder text:

- `pages/index.jsx` — Homepage: hero, value proposition, CTA (newsletter / booking / shop — per Q7)
- `pages/about.jsx` — About the business owner
- `pages/contact.jsx` — Contact form stub (wired to `/api/contact`)
- `pages/api/contact.js` — API stub: logs to console, returns 200 (Supabase wired later)
- `pages/blog/index.jsx` — Blog listing (empty state: "Posts coming soon")
- `components/Nav.jsx` — Navigation with business name + page links
- `components/Footer.jsx` — Footer with social links, copyright
- `components/NewsletterSignup.jsx` — Email signup form (wired later)
- `styles/globals.css` — CSS variables for brand colors (Q28), typography
- `website/.env.local.example` — template with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- `website/supabase/001_initial_schema.sql` — contact_submissions and newsletter_subscribers tables

Each page must: import Nav and Footer, include `<Head>` with title + meta description, use brand voice from Q8, use CSS variables (not inline styles), and reference brand colors from Q28.

### 4B — Create GitHub repo and deploy to Vercel

Run these commands to create the repo and push automatically:

```bash
gh repo create {business-name-kebab-case}-marketing --private --source=. --remote=origin --push
```

Then output this to the user — they need to complete Vercel in their browser:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR REPO IS LIVE ON GITHUB. NOW DEPLOY TO VERCEL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to: https://vercel.com/new
2. Sign in or create a free account if you haven't already
3. Click "Import Git Repository" → select {repo-name}

   ⚠️  IMPORTANT — easy to miss:
   Look for a field labelled "Root Directory" on this page.
   Type:  website/
   If you skip this, the deploy will fail.

4. Click Deploy (skip env vars for now — add them after Supabase is set up)

Your site will be live in ~2 minutes. Come back and paste your Vercel URL.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Wait for the user to paste their Vercel URL. Then confirm:

```
✅ Website live at: [their URL]

Now I'll generate your AI marketing team files. This is the longer phase.
I'll check in at each checkpoint. You can pause and resume any time by saying
"Resume bootstrap from checkpoint [5.2 / 5.3 / 5.4 / 5.5 / 5.6]"
```

---

## PHASE 5 — GENERATE AGENT FILES

After the website is confirmed live, create the following files. Every file must use
actual answers from the interview — no placeholders like [INSERT NAME HERE].

Announce `✅ CHECKPOINT 5.2 complete` after finishing section 5.2.
Announce `✅ CHECKPOINT 5.3 complete` after finishing section 5.3.
Announce `✅ CHECKPOINT 5.4 complete` after finishing section 5.4.
Announce `✅ CHECKPOINT 5.5 complete` after finishing section 5.5.
Announce `✅ CHECKPOINT 5.6 complete` after finishing section 5.6.

### 5.0 — Global Claude Code Config (`~/.claude/CLAUDE.md`)

This is a one-time machine-level setup. Write (or append) to `~/.claude/CLAUDE.md`.
These rules apply to every Claude Code session on this machine.

Check first: if the file exists, append only missing sections. Never overwrite existing content.

Generate the full rules file from these principles — write them out in detail:
- **Git:** `git status` before any work; never force-push; stage files by name only; never commit without explicit instruction
- **Branches:** never push directly to main; all changes via PR; confirm base branch first
- **Deployment:** never deploy via CLI; all deploys through `git push` → CI/CD only; Vercel CLI is read-only (status, logs only)
- **Secrets:** never commit `.env`, API keys, or credentials; if found in staged files, remove and warn immediately
- **Destructive ops:** confirm before `rm -rf`, `git reset --hard`, dropping tables, or overwriting uncommitted work
- **Quality:** never skip failing tests; never disable linters; no known security vulnerabilities (OWASP top 10)
- **Learning:** when a solution is confirmed working, invoke the `/capture-learning` skill (only if: real problem encountered + solution applied + user approved)

After writing, confirm: `~/.claude/CLAUDE.md — global rules written.`

---

### 5.0b — MCP Configuration

Developer tools were installed in Phase 0. This step only adds the MCP server entries
so Claude agents can query Supabase directly.

Read `.claude/settings.local.json` (create if missing) and merge — do not overwrite existing keys:

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

The placeholder is replaced by the user in Phase 6 after they create their Supabase account.

Confirm: `MCP config written to .claude/settings.local.json`

---

### 5.1 — Root Project Files

Create `CLAUDE.md` — the master project instructions file.

Content must include:
- Business name, description, and publishing workflow (tailored to their answers)
- Folder structure reference (matching what you're creating)
- The seven-step publishing workflow (content → writer → review → web dev → publish)
- Error handling table
- Quality checklist before any git commit
- Manual push instruction (never auto-push to main)

Create `.claude/rules/global-engineering.md` with these exact non-negotiable rules:

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
- Never modify environment variables without recording the change in repo env docs

## Secrets and credentials
- Never commit .env files, API keys, tokens, or credentials
- If a secret is found in staged files, remove it and warn the user

## Destructive operations
- Always confirm before: rm -rf, git reset --hard, dropping database tables

## Content approval
- Social media posts require human approval before publishing (default)
- Email campaigns ALWAYS require human approval before sending — non-negotiable
- Translated content (any language) must be human-reviewed before publishing
- Financial commitments (paid ads, tool subscriptions) always require human approval

## Continuous improvement
- When a solution is confirmed working, invoke the /capture-learning skill
```

### 5.2 — Claude Code Agent Definitions (`.claude/agents/`)

Create one `.md` file per agent in `.claude/agents/`. Use the project-manager agent
from this repo as the format template. Each file needs:
- YAML frontmatter: name, description (trigger phrases), model: sonnet, tools list
- Quick reference block
- On first invocation steps (read persona → identify skill/workflow → execute)
- Skills table with triggers
- Workflows table with schedules (use the user's timezone from Q21)
- Hard rules (3-5 non-negotiable behaviors)

**Agent 1: project-manager.md**
- Purpose: delivery, standups, RAID log, scope management
- Tools: Read, Write, Glob, Grep, Bash
- Schedules: Daily standup morning (7am user's timezone M-F), compile (9am M-F),
  EOD reminder (5pm M-F), weekly RAG (Friday 4pm)
- Triggers: check-ins, "log this risk", "what's our status", "help me write my standup"

**Agent 2: product-manager.md**
- Purpose: roadmap, growth strategy, ICP research, vision alignment
- Tools: Read, Write, Glob, Grep, Bash, WebSearch
- Schedules: Weekly product review (user's strategy review day/time from Q21)
- Triggers: "we should build", "who is our target user", "write a vision report",
  "how do competitors handle", "what's our product strategy"

**Agent 3: web-developer.md**
- Purpose: publish content to website, maintain Next.js codebase, deploy via CI/CD
- Tools: Read, Write, Edit, Glob, Grep, Bash
- Schedules: Content publishing (based on content calendar)
- Triggers: "publish this post", "update the website", "build a page", "deploy"

**Agent 4: designer.md**
- Purpose: all visual assets — blog hero images, social cards, brand graphics
- Tools: Read, Write, Glob, Grep, Bash
- Schedules: Image generation weekly (before publish days)
- Triggers: "generate an image", "create a hero image", "design a social card",
  "optimise this image"
- Note: Include the user's brand colors, visual style from Q28

**Agent 5: writer.md**
- Purpose: blog posts, social captions, email campaigns, all written content
- Tools: Read, Write, Glob, Grep, Bash, WebSearch
- Schedules: Content writing (Friday before the publish week, or per content calendar)
- Triggers: "write a blog post", "write social captions", "write an email", "draft content"
- Note: Reference the content pillars from Q29, brand voice from Q8

**Agent 6: marketing-manager.md**
- Purpose: campaign strategy, content calendar, channel management, performance review
- Tools: Read, Write, Glob, Grep, Bash, WebSearch
- Schedules: Content calendar generation (monthly, first Monday), performance review (weekly)
- Triggers: "plan a campaign", "update the content calendar", "review this month's performance",
  "what should we post about", "create a campaign brief"
- Note: Reference the 90-day goal from Q30

**Agent 7: social-media-manager.md**
- Purpose: distribute content across platforms — drafts, scheduling, analytics, approval routing
- Tools: Read, Write, Glob, Grep, Bash
- Schedules: Weekly draft assembly (Friday), day-of TikTok alerts, Monday analytics report
- Triggers: "schedule this post", "write social copy", "distribute this content",
  "what's posting this week", "show me this week's scheduled posts", "weekly analytics"
- Carousel rule: TikTok posts are always 6 slides (hook + 4 content + CTA). Never fewer.
- Approval routing (per user answers from Q18b and Q31):
  - All platforms default to draft-only until the user configures a publishing integration
  - Notify via Telegram when drafts are ready for review

### 5.3 — Agent Full Personas (`agents/`)

For each of the 7 agents, create the full persona at `agents/<name>/context/persona.md`.

Each persona must include these sections (use the agent-creation-guideline at
`context/agent-creation-guideline.md` as the standard):

1. Identity & Purpose — what the agent owns, one paragraph, named after the business
2. Team — all team members with names, types (human/AI), contact/file paths
3. Core Behaviors — 5-7 non-negotiable rules from a relevant framework
4. Daily/Weekly Workflow — step-by-step with named phases, times (user's timezone), fallbacks
5. Communication Standards — output format, escalation rules, approval requirements
6. Canonical Artifacts — what the agent maintains, where, at what cadence
7. Data Locations — full path table with read/write/append operations
8. Tools & MCPs — what's connected vs needs setup
9. Agent Skills — skill names, folder paths, trigger phrases
10. KPIs — metrics tracked
11. Scheduled Tasks — triggers, times, actions, fallbacks

### 5.4 — Skills

For each agent, create at minimum the following skill files at
`agents/<name>/context/skills/<skill-name>/SKILL.md`:

**Project Manager:**
- `daily-checkin` — collect and format standup entries
- `raid-log` — log and update risks, actions, issues, decisions
- `scope-change` — assess impact of a proposed scope change

**Product Manager:**
- `idea-to-epic` — turn a raw idea into a structured epic with user stories
- `competitive-analysis` — research and summarize competitor positioning
- `build-persona` — create a detailed ICP persona from research

**Web Developer:**
- `build-page` — convert a markdown brief into a Next.js JSX component
- `publish-post` — full pipeline: image + component + blog index update + commit

**Designer:**
- `generate-image` — create a hero/social image via AI generation (prompt engineering)
- `optimise-image` — convert and resize images to WebP at standard sizes

**Writer:**
- `write-post` — write a full blog post from a topic brief
- `write-social` — write platform-specific social captions from a post
- `write-email` — write a newsletter edition or campaign email

**Marketing Manager:**
- `content-calendar` — generate a 4-week content calendar based on pillars and goals
- `campaign-brief` — write a structured campaign brief for any initiative
- `performance-review` — compile weekly/monthly performance summary

**Social Media Manager:**
- `write-social-post` — platform-specific post drafts with hashtags and CTAs
- `tiktok-carousel` — generate a 6-slide TikTok carousel (hook + 4 content slides + CTA),
  write draft file to `content/social/tiktok/`, send Telegram reminder with publish instructions
- `weekly-schedule` — assemble all this week's content into draft files per platform,
  send Telegram summary of what's ready for review
- `weekly-analytics` — compile weekly performance notes from available data, format into
  a brief Telegram report: top post, key metric, one recommendation for next week
- `distribution-checklist` — pre-publish quality gate before any content goes out

Each SKILL.md must contain:
- Frontmatter: `name:` and `description:` (the description is the trigger phrase)
- Purpose: why this skill exists
- Numbered steps with explicit conditions and fallbacks
- File paths for every read/write operation
- Output format: exact structure of what the skill produces
- Edge cases: at least 2 named failure modes and how to handle them

### 5.5 — Resources & Context Files

Create `resources/brand-voice.md`:
- Business name and tagline
- Brand personality (from Q8 adjectives)
- Tone: formal vs conversational, how to open, how to close
- Words to use / words to avoid
- Examples of on-brand sentences
- Examples of off-brand sentences

Create `resources/audience-personas.md`:
- Primary ICP (from Q7) with: demographics, psychographics, pain points, goals
- What they search for
- Where they spend time online
- What makes them buy / subscribe / follow
- 2-3 secondary audience segments if relevant

Create `resources/content-calendar.md`:
- Content pillars (from Q29) with descriptions and example topics
- Weekly posting rhythm (based on Q13 platforms and Q18 hours available)
- Monthly content themes framework
- Blank first-month calendar (Marketing Manager will fill this in)

Create `resources/seo-strategy.md`:
- Business category and primary search intent
- 10 seed keywords (derived from products/services and ICP from answers)
- Content format priorities (long-form blog vs short-form vs video)
- Internal linking strategy
- SEO checklist per post

Create `resources/design-system.md`:
- Brand colors (from Q28)
- Typography preferences
- Image style guidelines (from Q28)
- Do's and don'ts for visual content
- Standard image sizes (hero, social card, thumbnail, OG)

Create `context/publish-log.md` with header:
```
| Date | Title | File | Category | Platform |
|------|-------|------|----------|----------|
```

Create `context/agent-creation-guideline.md`:
Copy the full content of the existing guideline (the 6-stage process) adapted for
the new business name and context.

Create `standup/individual/<owner-name>.md` with today's date and a first entry
welcoming them to the system.

Create `standup/briefings/` directory with a `README.md` noting the folder structure.

### 5.6 — Content Folder

Create `content/topics/` directory structure with a sample topic folder:
```
content/
  topics/
    sample-first-post/
      brief.md          ← one-paragraph topic brief (reference content pillar 1 from Q29)
      seo.md            ← SEO metadata template
```

The brief.md should be a real, ready-to-use topic brief for the writer agent —
based on content pillar 1 from their answers, framed for their ICP.

---

## PHASE 6 — REMAINING ACCOUNT SETUP

GitHub and Vercel are already done (Phase 4). This checklist covers the remaining
services. Generate it and save to `context/manual-setup-checklist.md`. Also print it.

```
REMAINING SETUP — COMPLETE THESE STEPS YOURSELF
(Claude Code cannot create accounts or store credentials for you)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — Supabase project (database)                          ⏱ ~10 min
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ Sign up at https://supabase.com (free)
□ Create a new project, name it: {business-name}-marketing
□ Go to Project Settings → API → copy:
    Project URL   → this is NEXT_PUBLIC_SUPABASE_URL
    Anon key      → this is NEXT_PUBLIC_SUPABASE_ANON_KEY
□ Run the database schema:
    — On your computer, open your project folder
      (on Mac: Finder → your project; on Windows: File Explorer → your project)
    — Navigate to: website → supabase → 001_initial_schema.sql
    — Open that file in any text editor (TextEdit, Notepad), select all, copy
    — Back in Supabase: click "SQL Editor" in the left sidebar
    — Paste your copied text into the editor → click "Run"
□ Click "Table Editor" in the left sidebar — you should see two tables:
    contact_submissions + newsletter_subscribers
□ In Vercel → your project → Settings → Environment Variables → add both values above
□ Redeploy: Vercel → Deployments → Redeploy latest

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — Supabase MCP token (for Claude agents)               ⏱ ~2 min
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ Go to: https://supabase.com/dashboard/account/tokens
□ Create a new token, name it: {business-name}-claude
□ Open .claude/settings.local.json
□ Replace SUPABASE_ACCESS_TOKEN_PLACEHOLDER with the token
□ Save and restart Claude Code

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3 — Email Platform                                       ⏱ ~10 min
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ {IF BREVO} Sign up at https://brevo.com (free up to 300 emails/day)
  → Account → SMTP & API → API Keys → Create
  → Add to Vercel env vars as: EMAIL_API_KEY
  → Create your first list: name it "Newsletter" → note the list ID: ________

□ {IF OTHER PLATFORM} Add your API key to Vercel env vars as: EMAIL_API_KEY
  Note your subscriber list ID: ________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4 — Social Media Accounts                                ⏱ ~5 min
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your AI team drafts content but does not post automatically (unless you opted in).
For now, make sure you can log in to each platform you want to use:

□ Log in to each platform you selected in Q13
  (Instagram / Facebook / LinkedIn / Twitter-X / TikTok / Pinterest / YouTube)
□ Note your usernames here so the agent files reference the right handles:
    Instagram:  _______________
    TikTok:     _______________
    LinkedIn:   _______________
    Other:      _______________

If you answered Q18c with a scheduling tool (Buffer, Later, Hootsuite, etc.):
□ Log in and confirm your account is active
□ Note your API key or connection method — the Marketing Manager agent will use this

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5 — Telegram Bot (notifications)                         ⏱ ~5 min
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{INCLUDE ONLY IF user answered YES to Q20}

□ Open Telegram → search @BotFather → tap Start
□ Send: /newbot
□ Name your bot: {BusinessName}MarketingBot
□ Username: {businessname}marketing_bot (must end in _bot)
□ Copy the token BotFather gives you
□ In Claude Desktop: Settings → Claude Code → Plugins → telegram@claude-plugins-official
□ Paste your bot token when prompted
□ Send your bot a message to activate it. Note your chat ID: ________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 6 — Claude Desktop Schedules                             ⏱ ~10 min
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  Complete Phase 7 first — it generates the exact commands you need here.
    Come back to this step after Phase 7 is done.

The exact copy-paste commands for each schedule are in:
  agents/project-manager/context/schedule-desktop-tasks.md

To find that file on your computer:
  Mac: Finder → your project folder → agents → project-manager → context → schedule-desktop-tasks.md
  Windows: File Explorer → your project folder → agents → project-manager → context → schedule-desktop-tasks.md
  Or: switch to the Code tab in Claude Desktop and type: "show me schedule-desktop-tasks.md"

For each task below, copy the command from that file and paste it into the
Claude Desktop Chat tab:

□ Daily standup morning reminder → Mon-Fri {7am your timezone}
□ Daily standup compile → Mon-Fri {9am your timezone}
□ EOD check-in reminder → Mon-Fri {5pm your timezone}
□ Monthly content calendar → 1st of each month {9am your timezone}
□ Weekly performance report → Friday {4pm your timezone}

IMPORTANT: Schedules only fire when Claude Desktop is open and your laptop is on.
Close the laptop → reminder doesn't fire that day. That's expected.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 7 — Custom Domain (optional)                             ⏱ ~15 min
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ In Vercel → your project → Settings → Domains
□ Add: {user's domain from Q4}
□ Follow Vercel's DNS instructions at your domain registrar
□ Wait 5–30 minutes for DNS to propagate

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHEN DONE: Come back and tell me "setup complete"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## PHASE 7 — SCHEDULE FILE GENERATION

All scheduled tasks use **Claude Code local schedules** (CronCreate via Claude Desktop).
There is no remote or cloud scheduling — everything runs on the user's machine.

Create `agents/project-manager/context/schedule-desktop-tasks.md`.

This file must contain copy-paste `/schedule` commands for ALL tasks below.
For each task: include the exact cron expression (converted to the user's timezone from Q21),
the agent prompt, and a one-line plain-language description.

Format each entry as:

```
# [Task name]
# Schedule: [human-readable] → Mon-Fri {time} {timezone}
# Command to paste into Claude Desktop:
/schedule "[agent prompt]" --cron "[cron expression]"
```

Tasks to include:

| Task | When | Agent prompt |
|---|---|---|
| Morning standup reminder | Mon-Fri 7am | Remind Dave, Yon, and Trac to write their standup check-in to standup/individual/<name>.md |
| Standup compile | Mon-Fri 9am | Read standup/individual/*.md, compile today's briefing, write to standup/briefings/YYYY-MM/YYYY-MM-DD.md |
| EOD check-in reminder | Mon-Fri 5pm | Send end-of-day reminder: write tonight's standup check-in for tomorrow's 9am compile |
| Content calendar | 1st of month 9am | Read resources/content-calendar.md and resources/brand-voice.md, generate next month's content calendar draft, write to content/calendar/YYYY-MM.md |
| Weekly performance report | Friday 4pm | Read standup/briefings/ for this week, generate RAG status report, write to standup/briefings/YYYY-MM/weekly-rag.md |

Adapt all times to the user's timezone (Q21). Convert to their local time — do not use UTC.

Also create `agents/project-manager/context/workflows/daily-standup.md` with:
- Step 1: Morning reminder (what the agent sends, to whom, format)
- Step 2: Compile (what it reads, how it summarizes, where it writes)
- Step 3: Distribution (who gets the compiled brief, via which channel)
- Fallback for each phase (what happens if a team member hasn't checked in)

---

## PHASE 8 — VERIFICATION

After the user says "setup complete", run the following in order:

### 8.1 — File verification
1. Check that all 7 `.claude/agents/*.md` files exist
2. Check that all 7 `agents/*/context/persona.md` files exist
3. Check that `resources/brand-voice.md`, `resources/audience-personas.md`, and
   `resources/content-calendar.md` all exist and contain real content (not blank)
4. Check that `agents/project-manager/context/schedule-desktop-tasks.md` exists and
   contains all 5 scheduled tasks with real cron expressions and agent prompts

### 8.2 — Schedule confirmation

Output to the user:
```
Your schedules are in: agents/project-manager/context/schedule-desktop-tasks.md

To activate them, open Claude Desktop and paste each /schedule command from that file.
All schedules run locally — they only fire when Claude Desktop is open on your laptop.

Tasks to activate:
  □ Morning standup reminder   Mon-Fri {7am timezone}
  □ Standup compile            Mon-Fri {9am timezone}
  □ EOD check-in reminder      Mon-Fri {5pm timezone}
  □ Monthly content calendar   1st of month {9am timezone}
  □ Weekly performance report  Friday {4pm timezone}
```

### 8.3 — Functional tests
6. Run the first test standup: read the Project Manager persona and simulate a
   morning standup message
7. Run a content dry-run: ask the Social Media Manager to write a sample social post
   for the top content pillar (confirms the agent is reading brand-voice.md correctly)

Then output the final summary:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR AUTOMATED MARKETING TEAM IS READY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{Business Name} now has a 7-agent AI marketing team:

Agent             Status    Primary Role
─────────────     ──────    ──────────────────────────────────────
Project Manager   ✅ Ready  Daily standups, delivery, blockers
Product Manager   ✅ Ready  Strategy, roadmap, ICP research
Web Developer     ✅ Ready  Website, content publishing, deploys
Designer          ✅ Ready  Images, social cards, visual assets
Content Writer    ✅ Ready  Blog posts, social copy, emails
Marketing Manager ✅ Ready  Campaigns, content calendar, strategy
Social Media Mgr  ✅ Ready  Draft content for all platforms, TikTok carousels, analytics

YOUR FIRST ACTIONS:
1. Run your first standup:
   Type: "help me write my standup" or "@project-manager run daily standup"

2. Generate your first content calendar:
   Type: "@marketing-manager generate this month's content calendar"

3. Write your first blog post:
   Type: "@writer write a post about [pick a content pillar]"

4. Make sure Claude Desktop schedules are active (Step 6 above)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT REMINDERS:
• Social posts → always drafted for your approval first
• Email campaigns → ALWAYS require your approval before sending
• Translated content → human review before publishing
• Blog posts → you review before the Web Developer publishes
• Financial spend (ads, tools) → always your decision
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your team will work Monday-Friday, check in daily, and escalate
only when they need a decision from you. Everything else runs itself.
```

---

## PHASE 9 — OPENCLAW PROPOSAL (OPTIONAL UPGRADE)

> **Note for Claude:** OpenClaw, clawhub, and agent-media are third-party tools, not
> Anthropic products. They may require separate accounts, pricing, and installation steps
> that are not verified during this bootstrap. If the user opts in, present the steps
> clearly and flag that you cannot install or test these tools on their behalf —
> they will need to follow the OpenClaw documentation independently.

After completing Phase 8 verification, present this upgrade path ONLY if the user
confirms their core system is working. Do not mention this earlier — it adds complexity
before the baseline is proven.

Present it as follows:

```
OPTIONAL UPGRADE — OpenClaw Daemon

Your core marketing team is running. Here's one upgrade worth considering
once you're publishing consistently:

WHAT IT SOLVES:
  Right now, your scheduled tasks require Claude Desktop to be open.
  If your computer is off, tasks don't fire.

NOTE: Scheduling (standups, analytics, calendar reminders) is handled by
  RemoteTrigger (CCR) — Anthropic's cloud. No laptop, no VPS needed for that.

WHAT OPENCLAW ADDS BEYOND CCR:
  ✓ WhatsApp as a control interface (if you prefer it over Telegram)
  ✓ AI UGC video generation for TikTok (talking head + B-roll + subtitles)

HOW IT FITS:
  Claude Code handles content creation, strategy, and website.
  RemoteTrigger (CCR) handles all scheduled tasks in Anthropic's cloud.
  OpenClaw optionally adds WhatsApp comms + TikTok video generation.

WHEN TO ADD IT:
  - You prefer WhatsApp over Telegram for team notifications
  - You want to produce TikTok videos (not just static carousels)

WHEN TO SKIP IT:
  - You're using Telegram already (no need for another comms layer)
  - You only post static images/carousels (no UGC video)
  - Budget is under $50/month — agent-media starts at $39/month

Full implementation details: architecture/openclaw-proposal.md

Add it? (yes / skip)
```

**If user says YES:**

1. Add Q32 to the setup record: "Which chat app do you prefer for controlling your team?
   (WhatsApp / Telegram / Slack / Discord)"

2. Generate `openclaw.json` in the project root with heartbeats adapted to the user's
   content calendar, timezone (Q21), and chosen chat app.

3. Generate `content/approved/.gitkeep` and `content/published/.gitkeep` to create the
   handoff folders that OpenClaw monitors.

4. Update the Social Media Manager agent persona to include a section on the file
   handoff format — what frontmatter to write when dropping content into `content/approved/`.

5. Append to the manual checklist (output to user):

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OPENCLAW SETUP (optional upgrade — third-party tools)         ⏱ ~20 min
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NOTE: OpenClaw and agent-media are separate products, not part of Claude Desktop.
You will need to follow their documentation and create accounts independently.
Claude Code generates the config file for you; the rest requires their own setup guides.

□ Install Node.js 20+ on your machine (skip if already installed)
□ Install OpenClaw (third-party tool — see openclaw documentation for latest instructions):
    npm install -g openclaw
□ Start the daemon:
    openclaw start --daemon
    openclaw status                   ← should show "running"
□ Test it:
    Send a message from {user's chosen chat app}:
    "What's on the content calendar this week?"
    Expected: OpenClaw replies with this week's scheduled content

{IF agent-media opted in}
NOTE: agent-media is a paid third-party service — check current pricing before installing.
□ Install agent-media skill:
    clawhub install agent-media
    npx agent-media credits           ← check your balance
□ Test video generation:
    npx agent-media ugc --script "Test script" --duration 15
    Expected: video file in ~/output/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**If user says SKIP:** Acknowledge and confirm the core system is complete.
Note in the final summary: "OpenClaw can be added later — see architecture/openclaw-proposal.md"

---

## IMPORTANT RULES FOR CLAUDE DURING SETUP

- Never use placeholder text — every file must contain real, personalized content
- If an answer is unclear, ask for clarification before generating
- Generate files in dependency order (resources → agent personas → skills → CLAUDE.md)
- After each major section (4.1, 4.2, 4.3, etc.), output a brief progress note
- If the user's content platform is WordPress/Squarespace/Webflow (not self-hosted Next.js),
  adapt the Web Developer agent to work with that platform instead of scaffolding Next.js
- If budget is under $50/month, recommend free tiers only and note any limitations
- Always include fallback behaviors for every notification path (primary channel down → alternative)
- The Social Media Manager should NEVER post directly — always draft for approval unless
  the user explicitly opts into auto-posting for a specific platform
