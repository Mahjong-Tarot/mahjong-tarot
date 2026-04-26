# Mac Account Setup for Fresh Bootstrap Testing

End-to-end setup guide for non-technical business owners

| Phases | Total time | Your effort | AI Agents |
|--------|-----------|-------------|-----------|
| 5 | ~6h | ~1h | 7 |

---

## P0 — Accounts & Credentials
`Manual` `Claude Chat` `45–60 min`

Pure browser work. Claude Chat guides you step by step. Nothing to install — just create accounts and copy your credentials into a safe place.

| Step | Action |
|------|--------|
| Step 1 | Claude Desktop Pro — download & install |
| Step 2 | GitHub — create account, note username |
| Step 3 | Vercel — sign up with GitHub |
| Step 4 | Supabase — new project, copy URL + anon key |
| Step 5 | Email platform — Brevo recommended, get API key |
| Step 6 | Telegram bot — optional, for AI team alerts |

**Outputs:** All credentials noted · GitHub account · Supabase project · Email API key

---

↓ *credentials ready — P1 needs your GitHub access to push the first repo*

---

## P1 — Local Machine Setup
`Cowork` `Code` `20–30 min`

Claude takes the wheel. Stage A uses Cowork (screen control) to install developer tools. Stage B runs in Code to scaffold your project and configure Claude itself.

| Stage | Action |
|-------|--------|
| Stage A — Cowork | Install git, node, Vercel CLI, Supabase CLI. Authenticate GitHub. Pre-seed all Claude Code permissions. |
| Stage B — Code | Create project folder + git repo. Write CLAUDE.md rules. Configure Supabase MCP. Install skills (skill-creator, agent-creator). |

**Outputs:** Project repo on GitHub · CLAUDE.md written · Permissions pre-seeded · Skills installed · Supabase MCP configured

---

↓ *repo exists + Claude is fully configured — P2 can write files and push to GitHub*

---

## P2 — Business Discovery + First Website
`Code` `60–90 min`

A structured interview captures everything Claude needs to know about your business, brand, and audience. Then it builds and deploys your website automatically.

| Group | Topics |
|-------|--------|
| Group 1 | Business identity — name, description, products, domain, location |
| Group 2 | Audience & market — ICP, brand voice, competitors, 12-month goal |
| Group 3 | Channels & capacity — platforms, email list, hours available, timezone |
| Style | Visual style + brand colours — pick from suggestions or specify your own |
| Strategy | Content pillars (3–5) + 90-day goal |
| Website | Scaffold Next.js app → push to GitHub → deploy to Vercel → wire Supabase |

**Outputs:** `brand-voice.md` · `design-system.md` · `web-style-guide.md` · `audience-personas.md` · `content-calendar.md` · Live website on Vercel · Supabase connected

---

↓ *brand files exist + website live — P3 uses these to generate personalised agent personas*

---

## P3 — Agent Team Build
`Code` `2–3 hours`

Every agent is built with a 5-step workflow: interview → workflow design → your approval → generate all files → install. Nothing is generated before you say yes.

| Type | Agent | Role |
|------|-------|------|
| Template | **Project Manager** | Standups, RAID log, RAG reports |
| Template | **Product Manager** | Strategy, roadmap, ICP research |
| Template | **Web Developer** | Build & publish pages |
| Full workflow | **Designer** | Hero images, social cards, brand visuals |
| Full workflow | **Writer** | Blog posts, social copy, newsletters |
| Full workflow | **Marketing Manager** | Campaigns, content calendar |
| Full workflow | **Social Media Manager** | Platform drafts, TikTok, analytics |

**Outputs per agent:** `.claude/agents/{name}.md` · `agents/{name}/context/persona.md` · `agents/{name}/context/skills/` · `resources/seo-strategy.md` · `standup/individual/{owner}.md`

---

↓ *all agents installed — P4 can generate personalised schedule commands for each agent's triggers*

---

## P4 — Schedules + Verification
`Code` `Chat` `30–45 min`

Claude generates ready-to-paste schedule commands, you activate them in the Chat tab, then Claude runs end-to-end tests to confirm the whole system is working.

| Section | Action |
|---------|--------|
| Section 1 — Code | Generate `/schedule` commands for all automated tasks. Write to `schedule-desktop-tasks.md`. |
| Section 2 — Chat | Copy each command → switch to Chat tab → paste & press Enter. Confirm each schedule is active. |
| Section 3 — Code | Verification: file existence checks + 3 functional agent tests (PM standup, Writer caption, Web Dev build). |
| Section 5 — Optional | OpenClaw upgrade: WhatsApp control interface + TikTok AI video generation. |

**Outputs:** `schedule-desktop-tasks.md` · 5 active schedules · `context/publish-log.md` · Verification passed

---

## Your AI Team is Running

Mon–Fri, every week, automatically — without you setting a reminder.

| When | Task | Agent |
|------|------|-------|
| Mon–Fri · 7am | Standup reminder | Project Manager |
| Mon–Fri · 9am | Daily briefing compiled | Project Manager |
| Mon–Fri · 5pm | EOD check-in reminder | Project Manager |
| 1st of month · 9am | Content calendar generated | Marketing Manager |
| Friday · 4pm | Weekly RAG report | Project Manager |
| On demand | Blog posts, social drafts, web pages — triggered by you | Writer · Designer · Web Dev |

**Always your decision:** Social posts are drafted for your review first. Email campaigns require explicit approval before sending. Blog posts are reviewed before the Web Developer publishes. Paid spend is always your call.
