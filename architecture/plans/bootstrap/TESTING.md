# Bootstrap Test Guide — Fresh Mac

> **Purpose:** End-to-end test protocol for validating the bootstrap on a clean machine with no prior developer tools or accounts.
> **Tester profile:** Simulate a non-technical business owner. Move deliberately — don't skip steps, don't use existing accounts.
> **Total time:** ~6–7 hours across 2 sessions. Split at the P2/P3 boundary.

---

## Pre-Test Checklist

Before starting, confirm the test environment is genuinely clean:

- [ ] Mac has never had Homebrew, git, or node installed — or you've run the [Reset Procedure](#reset-procedure) below
- [ ] You have a clean browser profile (or incognito) — no saved GitHub/Vercel/Supabase sessions
- [ ] You have a test email address not previously used for these services
- [ ] Claude Desktop Pro is installed and signed in (this is the one prerequisite you can bring)
- [ ] You have a notepad (physical or digital) to record credentials as you go

---

## Test Business Persona

Use this fictional business throughout the test. Consistent answers make failures reproducible.

| Field | Test Value |
|-------|-----------|
| Business name | Bloom & Thread |
| Description | Handmade textile art and workshops for adults who want to slow down and create |
| Products | Online workshops ($97), print-on-demand wall art ($45–$120), custom commissions |
| Domain | bloomandthread.com (don't buy — use as the intended domain) |
| Country | Australia · English |
| Owner name | Alex Chen |
| Brand voice | Warm, grounded, quiet luxury, tactile |
| Competitors | Gathered, The Mindful Kind, Tara Brach (content-adjacent) |
| 12-month goal | 300 email subscribers and launch first $97 online workshop |
| Platforms | Instagram, Pinterest, occasional YouTube |
| Email list | None yet |
| Weekly hours available | 3 hours |
| Timezone | AEST (UTC+10) |
| Visual style | Warm earthy tones, linen textures, handcrafted feel |
| Brand colours | Primary #8B6F5E (clay), Secondary #D4C5B2 (linen), Accent #4A6741 (sage) |
| Content pillars | Slow making / Behind the craft / Workshop life / Material stories / Colour & texture |
| 90-day goal | 12 blog posts published, 100 email subscribers |
| Telegram | Yes (set up a test bot) |

---

## P0 — Accounts & Credentials

**Mode:** Claude Chat · **Pass time:** ~45–60 min

### Steps

- [ ] **1.1** Open Claude Desktop → Chat tab → paste `bootstrap/p0-accounts.md`
- [ ] **1.2** Claude Chat confirms it's guiding you through P0. Follow each step exactly.
- [ ] **1.3** Create GitHub account with your test email. Note username.
- [ ] **1.4** Create Vercel account using "Continue with GitHub". Confirm Vercel can see your GitHub.
- [ ] **1.5** Create Supabase account. Create new project named `bloom-and-thread-marketing`. Choose Sydney region. Record password, Project URL, and Anon Key.
- [ ] **1.6** Create Brevo account. Get API key. Create "Newsletter" list. Record List ID.
- [ ] **1.7** Create Telegram bot via @BotFather. Record bot token and note your chat ID.
- [ ] **1.8** Fill in the credentials summary table in your notepad.

### Pass criteria

| Check | Expected |
|-------|----------|
| GitHub account created | Can push a public repo |
| Vercel connected to GitHub | Vercel dashboard shows GitHub repos |
| Supabase project URL | Starts with `https://` and ends with `.supabase.co` |
| Brevo API key | Present and copied |
| Telegram bot token | Format: `123456789:ABCdef...` |
| Credentials notepad | All items filled — nothing blank |

### Common failures

- **Supabase "project spinning up"** — wait 2 minutes before copying keys; the anon key shows as placeholder until ready
- **Vercel GitHub auth** — if Vercel can't see repos, check you authorised the right GitHub org/account
- **Telegram bot** — must send the bot a message first before the chat ID is discoverable

---

## P1 — Local Machine Setup

**Mode:** Cowork (Stage A) → Code (Stage B) · **Pass time:** ~20–30 min

### Stage A — Cowork

- [ ] **2.1** Switch to Cowork tab → paste `bootstrap/p1-local-setup.md`
- [ ] **2.2** Claude opens Terminal and installs: git, gh, node, vercel, supabase CLI
- [ ] **2.3** When prompted, enter your Mac password for Homebrew (only manual step)
- [ ] **2.4** Browser opens for GitHub auth — log in with the test account, authorise
- [ ] **2.5** Claude runs the Python3 permission pre-seeding script
- [ ] **2.6** Claude confirms "Stage A complete. Switch to Code tab."

### Stage B — Code

- [ ] **2.7** Switch to Code tab → paste `bootstrap/p1-local-setup.md` again
- [ ] **2.8** Claude detects Stage A is complete and proceeds with Stage B
- [ ] **2.9** Answer git identity questions: `Alex Chen` / your test email
- [ ] **2.10** Project folder name: `bloom-and-thread`
- [ ] **2.11** Claude creates folder structure, writes CLAUDE.md, configures Supabase MCP, installs skills
- [ ] **2.12** Initial git commit appears in terminal output

### Pass criteria

```bash
# Run these in Terminal to verify
git --version         # should output git version 2.x+
node --version        # should output v20.x or higher
gh auth status        # should show: Logged in to github.com as [your username]
ls ~/bloom-and-thread # should show: .claude agents content resources standup website working_files

cat ~/bloom-and-thread/.claude/settings.local.json | python3 -c "
import sys, json
s = json.load(sys.stdin)
perms = s.get('permissions', {}).get('allow', [])
print(f'Permissions pre-seeded: {len(perms)} entries')
print('PASS' if len(perms) > 100 else 'FAIL — too few permissions')
"
```

| Check | Expected |
|-------|----------|
| `git --version` | 2.x or higher |
| `node --version` | v20.x or higher |
| `gh auth status` | Authenticated as test username |
| Folder structure | All 7 directories exist |
| `.claude/settings.local.json` | 100+ permission entries |
| `CLAUDE.md` exists at project root | Yes |
| `agents/project-manager/` exists | Yes |
| Supabase MCP in settings | `SUPABASE_ACCESS_TOKEN_PLACEHOLDER` present |

### Common failures

- **Homebrew takes 5–10 min** — Cowork will wait; don't interrupt
- **gh auth opens wrong browser** — if you have multiple browsers, ensure the default opens the test account
- **`npx skills` not found** — if skill installation fails, Claude should note it; skills can be added manually in P3
- **Permission count under 100** — re-run the Python3 script from `p1-local-setup.md` Step B8 manually

---

## P2 — Business Discovery + First Website

**Mode:** Code · **Pass time:** ~60–90 min

### Interview

- [ ] **3.1** In Code tab, paste `bootstrap/p2-discovery.md`
- [ ] **3.2** Claude sends Group 1 questions — answer using the test business persona above
- [ ] **3.3** Claude sends Group 2 questions — answer using persona
- [ ] **3.4** Claude sends Group 3 questions — answer using persona
- [ ] **3.5** For visual style (Q23): type "suggest" — verify Claude generates 3 options based on your brand voice
- [ ] **3.6** For brand colours (Q24): type the exact hex values from the persona table
- [ ] **3.7** Claude sends content strategy questions (Q25–Q26) — answer using persona
- [ ] **3.8** Agent selection: choose all 7 agents for a full test

### Resource file verification

After interview, before website scaffold:

- [ ] **3.9** `resources/brand-voice.md` exists and mentions "warm", "grounded", "tactile"
- [ ] **3.10** `resources/design-system.md` contains `#8B6F5E`, `#D4C5B2`, `#4A6741`
- [ ] **3.11** `resources/web-style-guide.md` contains "Slow making" as a blog category
- [ ] **3.12** `resources/audience-personas.md` describes the ICP from Q7
- [ ] **3.13** `resources/content-calendar.md` contains all 5 content pillars

### Website scaffold

- [ ] **3.14** Claude runs `npx create-next-app@latest` in `website/`
- [ ] **3.15** Claude creates all pages: index, about, contact, blog listing, Nav, Footer
- [ ] **3.16** Claude creates GitHub repo named `bloom-and-thread-marketing`
- [ ] **3.17** Claude outputs Vercel deploy instructions — **Root Directory = `website/`** warning must appear
- [ ] **3.18** You deploy to Vercel manually (import repo, set Root Directory to `website/`, click Deploy)
- [ ] **3.19** Paste Vercel URL back to Claude
- [ ] **3.20** Claude outputs Supabase wiring instructions — run SQL schema in Supabase SQL Editor
- [ ] **3.21** Add env vars to Vercel, redeploy
- [ ] **3.22** Replace Supabase MCP placeholder token in `.claude/settings.local.json`, restart Claude Code
- [ ] **3.23** Say "database connected" — Claude updates CLAUDE.md with full project context

### Pass criteria

| Check | Expected |
|-------|----------|
| Website live | Returns HTTP 200 at Vercel URL |
| Homepage has real copy | References "Bloom & Thread", not `[BUSINESS NAME]` |
| Blog page exists | `/blog` renders without error |
| Supabase tables | `contact_submissions` and `newsletter_subscribers` exist in Table Editor |
| CLAUDE.md updated | Contains Vercel URL and real business name |
| All 5 resource files | Present in `resources/` |

### Common failures

- **Vercel deploy fails** — almost always the Root Directory not set to `website/`. Must be exact.
- **Resource files contain placeholders** — Claude missed an interview answer. Check the specific file and re-prompt Claude with the missing context.
- **SQL schema error in Supabase** — copy the entire contents of `001_initial_schema.sql`; partial copy is the most common cause

---

## P3 — Agent Team Build

**Mode:** Code · **Pass time:** ~2–3 hours (can split across sessions)

### Template agents (Project Manager, Product Manager, Web Developer)

For each, Claude should:
1. Show a review block (schedule, team, trigger phrases)
2. Wait for your "yes"
3. Generate files
4. Confirm installation with a `✅` summary

- [ ] **4.1** Project Manager approved and installed
  - Review shows: AEST times (7am, 9am, 5pm, 4pm Friday)
  - Review shows team member: Alex Chen
  - Files created: `.claude/agents/project-manager.md` + `agents/project-manager/context/persona.md`
- [ ] **4.2** Product Manager approved and installed
- [ ] **4.3** Web Developer approved and installed
  - Review references `bloom-and-thread-marketing` repo
  - Review references `resources/web-style-guide.md`

### Full workflow agents

For each, Claude must run the interview before generating anything:

- [ ] **4.4** Designer — answer: blog hero images + social cards, Ideogram preferred, weekly content
- [ ] **4.5** Writer — answer: long-form blog (1000–1500 words), suggest topics OK, conversational + poetic style
- [ ] **4.6** Marketing Manager — answer: monthly calendar, email subscribers is primary metric, no paid ads
- [ ] **4.7** Social Media Manager — answer: Instagram priority, educational + behind-scenes, 3 posts/week Instagram, draft-only

### Pass criteria for each agent

```bash
cd ~/bloom-and-thread
for agent in project-manager product-manager web-developer designer writer marketing-manager social-media-manager; do
  echo -n "$agent: "
  [ -f ".claude/agents/$agent.md" ] && \
  [ -f "agents/$agent/context/persona.md" ] && \
  echo "✅ PASS" || echo "❌ FAIL"
done
```

| Critical check | Expected |
|----------------|----------|
| No placeholder text | None of the generated files contain `{Business Name}` or `[name]` |
| Timezone in PM persona | References AEST or UTC+10 |
| Standup times in PM | 7am, 9am, 5pm — not generic |
| Brand voice in Writer | References "warm", "grounded", tactile language |
| Platform in SMM | Instagram listed as priority, TikTok as always-draft |
| `resources/seo-strategy.md` | Exists with Bloom & Thread keywords |
| `standup/individual/alex-chen.md` | Exists with today's welcome entry |

### Common failures

- **Claude generates without approval** — this is a protocol failure; stop, delete the files, restart the agent from the review step
- **Persona still has placeholders** — re-run that agent's generation step, providing the missing interview answers explicitly
- **Agent definition missing YAML frontmatter** — the `---` block at top of `.claude/agents/{name}.md` must be present for Claude to load it as an agent

---

## P4 — Schedules + Verification

**Mode:** Code (generate) → Chat (activate) → Code (verify) · **Pass time:** ~30–45 min

### Generate

- [ ] **5.1** Paste `bootstrap/p4-schedules.md` in Code tab
- [ ] **5.2** Claude generates `agents/project-manager/context/schedule-desktop-tasks.md`
- [ ] **5.3** Open the file — confirm all 5 tasks are present with cron expressions in AEST
- [ ] **5.4** Confirm each entry has a `/schedule` command that is copy-paste ready

### Activate

- [ ] **5.5** Switch to Claude Desktop Chat tab
- [ ] **5.6** For each task, copy the `/schedule` command and paste it — confirm Claude acknowledges each one
- [ ] **5.7** All 5 schedules activated:
  - [ ] Morning standup reminder — Mon-Fri 7am AEST
  - [ ] Compile briefing — Mon-Fri 9am AEST
  - [ ] EOD reminder — Mon-Fri 5pm AEST
  - [ ] Monthly content calendar — 1st of month 9am AEST
  - [ ] Weekly RAG — Friday 4pm AEST
- [ ] **5.8** Tell Claude "schedules activated" → switch back to Code tab

### Verification

Claude runs 3 functional tests. For each, record what it produces:

**Test 1 — PM standup simulation**
- [ ] Output references "Alex Chen" by name
- [ ] Output references AEST timezone (not UTC, not Bangkok)
- [ ] Message is friendly, not templated-looking

**Test 2 — Writer caption**
- [ ] Claude reads `resources/brand-voice.md` before writing
- [ ] Caption uses warm, tactile language (not generic)
- [ ] Caption references a content pillar from `resources/content-calendar.md`

**Test 3 — Web Dev build-page dry-run**
- [ ] Claude references `agents/web-developer/context/web-style-guide.md`
- [ ] Claude references `content/topics/sample-first-post/brief.md` path
- [ ] Claude describes the correct output location (`website/pages/blog/posts/`)

### Pass criteria

| Check | Expected |
|-------|----------|
| `schedule-desktop-tasks.md` exists | ✅ |
| All cron expressions use AEST times | No UTC offsets |
| 5 schedules activated in Chat | All confirmed |
| Test 1 names real person | "Alex Chen", not "{name}" |
| Test 2 reads brand-voice.md | Explicitly stated in response |
| Test 3 cites correct paths | web-style-guide, correct output folder |
| `context/publish-log.md` created | With header row |

### Common failures

- **Cron times in UTC** — Claude miscalculated timezone. AEST is UTC+10, so 7am AEST = `0 21 * * 1-5` (previous UTC day). Regenerate with explicit "AEST = UTC+10" instruction.
- **Schedule command rejected in Chat** — ensure you're in the Chat tab, not Code
- **Test 1 uses placeholder name** — the PM persona.md still has a placeholder. Fix the file and re-run test.

---

## Final State Verification

Run this full audit after P4 completes:

```bash
cd ~/bloom-and-thread

echo "=== AGENT DEFINITIONS ==="
for f in .claude/agents/*.md; do echo "EXISTS: $f"; done

echo ""
echo "=== PERSONA FILES ==="
for d in agents/*/; do
  p="${d}context/persona.md"
  [ -f "$p" ] && echo "EXISTS: $p" || echo "MISSING: $p"
done

echo ""
echo "=== RESOURCE FILES ==="
for f in resources/brand-voice.md resources/design-system.md resources/web-style-guide.md \
         resources/audience-personas.md resources/content-calendar.md resources/seo-strategy.md; do
  [ -f "$f" ] && echo "EXISTS: $f" || echo "MISSING: $f"
done

echo ""
echo "=== SCHEDULE FILE ==="
[ -f "agents/project-manager/context/schedule-desktop-tasks.md" ] && \
  echo "EXISTS: schedule-desktop-tasks.md" || echo "MISSING"

echo ""
echo "=== STANDUP ==="
ls standup/individual/
```

**All lines should say EXISTS. Any MISSING line is a test failure.**

---

## Bugs to Watch For

These are known edge cases from the design review — flag them if encountered:

| Scenario | What to watch | Severity |
|----------|--------------|----------|
| Cowork loses focus mid-install | Claude stops typing in Terminal | High |
| `gh auth` opens wrong browser | GitHub auth completes but wrong account | High |
| Vercel Root Directory not warned | Deploy fails silently | High |
| Claude generates agent before approval | Skips review/approval step | High |
| Placeholder text in persona files | `{Business Name}` appears in generated files | Medium |
| Cron times in UTC instead of local | Wrong schedule fire times | Medium |
| Skills CLI not available | `npx skills` not found | Medium |
| Supabase SQL partial copy | Schema creates only some tables | Medium |
| P2 "suggest" option not offered | User with no style idea gets stuck | Low |
| PM standup uses wrong names | Names from template, not interview | Low |

---

## Reset Procedure

To retest from scratch:

```bash
# 1. Remove project folder
rm -rf ~/bloom-and-thread

# 2. Remove Claude project memory (if any)
# In Claude Desktop: Settings → Projects → delete bloom-and-thread project

# 3. Remove pre-seeded permissions (optional — only if testing the permission flow)
python3 - <<'EOF'
import json, os
path = os.path.expanduser("~/.claude/settings.local.json")
with open(path) as f:
    s = json.load(f)
s.get("permissions", {})["allow"] = []
with open(path, "w") as f:
    json.dump(s, f, indent=2)
print("Permissions cleared")
EOF

# 4. Delete GitHub repo (via browser or CLI)
gh repo delete bloom-and-thread-marketing --yes

# 5. Delete Vercel project (via Vercel dashboard)
# 6. Delete Supabase project (via Supabase dashboard)
# 7. Log out of GitHub CLI
gh auth logout
```

> **Do NOT uninstall Homebrew, git, or node** unless you are testing the full Cowork tool installation flow. Reinstalling these adds ~15 minutes and requires a Mac password.

---

## Test Log Template

Copy this for each test run:

```
Test run: YYYY-MM-DD
Tester: 
Mac OS version: 
Claude Desktop version: 
Model used: 

P0: PASS / FAIL — notes:
P1: PASS / FAIL — notes:
P2: PASS / FAIL — notes:
P3: PASS / FAIL — notes:
P4: PASS / FAIL — notes:

Bugs found:
1.
2.

Overall: PASS / FAIL
Time taken: 
```
