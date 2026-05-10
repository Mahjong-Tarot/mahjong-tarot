# Track B — P2: Connect to Agent Team

> **Who runs this**: Dave (sets up), client watches — then client takes over
> **Machine**: Client's personal laptop
> **Prerequisite**: Track B P1 complete; Track A P2 complete — agents repo live on GitHub
> **Output**: Client laptop has all 8 agents synced; client leaves with a first-actions guide and can use the team immediately

---

## Overview

The agents were designed on the Mac Mini and pushed to GitHub in Track A. This phase clones that repo to the client's laptop and installs all 8 agents to `~/.claude/agents/`. From this point the client can invoke any agent directly from their laptop. Scheduled work still runs from the Mac Mini via RemoteTrigger.

---

## Step 1 — Clone the agents repo

```bash
cd ~
gh repo clone {clientslug}/{project-slug}-agents
```

Verify:
```bash
ls ~/{project-slug}-agents/.claude/agents/
# Expected: developer.md, devops.md, designer.md, email-marketer.md,
#           product-manager.md, qa.md, web-publisher.md, writer.md
```

---

## Step 2 — Run the install script

```bash
cp -r ~/{project-slug}-agents/.claude/agents/* ~/.claude/agents/
echo "✅ All 8 agents installed."
ls ~/.claude/agents/
```

---

## Step 3 — Install the sync-agents skill

```bash
cp -r ~/{project-slug}-agents/skills/sync-agents ~/.claude/skills/sync-agents
echo "✅ sync-agents skill installed."
```

---

## Step 4 — Run the first sync (verify round-trip)

```bash
cd ~/{project-slug}-agents
git pull origin main
cp -r .claude/agents/* ~/.claude/agents/
echo "✅ Agents synced from GitHub."
```

This confirms: the client can update their agents anytime Dave pushes a change — just say "sync agents" in Claude Code.

---

## Step 5 — Test all 8 agents respond

Open Claude Code in the `{project-slug}-website` directory:

```bash
cd ~/{project-slug}-website
claude
```

Test each agent with a simple prompt:

| Say this | Expected response |
|----------|-------------------|
| `@product-manager what are you?` | Describes PM role, reads git log |
| `@developer what are you?` | Describes developer role, mentions CLAUDE.md |
| `@qa what are you?` | Describes QA role, lists what AI can/cannot test |
| `@devops what are you?` | Describes DevOps role, mentions escalation rules |
| `@writer what are you?` | Describes Writer role, mentions content/topics/ queue |
| `@designer what are you?` | Describes Designer role, mentions Gemini |
| `@web-publisher what are you?` | Describes Publisher role, mentions blog/posts/ |
| `@email-marketer what are you?` | Describes Email Marketer role, mentions Brevo |

All 8 should respond correctly before proceeding.

---

## Step 6 — Confirm scheduled work is running on Mac Mini

The client does NOT register new schedules — all 7 RemoteTrigger schedules were registered in Track A P2 and run in the cloud. Verify they exist:

In Claude Code, ask the Product Manager:
```
@product-manager list all registered schedules
```

Expected output: 7 schedules (4 PM + 3 content pipeline).

---

## Step 7 — Leave client with the first-actions guide

Print or share the following as a standalone document:

---

### Your AI Team — First Actions Guide

**Your team is ready. Here is everything you need to know to get started.**

---

#### Your 8 agents

Open any terminal, navigate to your project, and run `claude`. Then talk to your agents:

**Build Team**
- `@product-manager` — Ask: "What are we working on?" / "Compile today's standups" / "Write a scope change assessment"
- `@developer` — Ask: "Build X" / "Fix this bug" / "Review this code"
- `@qa` — Ask: "Test this change" / "What could break if I do X?"
- `@devops` — Ask: "Check deployment status" / "What's in git history?" (escalates complex infra to a human engineer)

**GTM Team**
- `@writer` — Ask: "Write this week's post" (or it runs automatically every Monday 9am)
- `@designer` — Ask: "Generate the hero image" (or it runs automatically every Tuesday 9am)
- `@web-publisher` — Ask: "Publish this post" (or it runs automatically every Wednesday 9am)
- `@email-marketer` — Ask: "Draft a welcome email" / "Write the weekly newsletter"

---

#### Your daily workflow

**Content publishes itself Monday–Wednesday.** Your only jobs are:

1. **Queue a post**: Add `brief.md` to `content/topics/{slug}/`
   - What does a brief look like? It can be as simple as:
     ```
     Topic: 5 signs you need a systems audit
     Angle: Written for founders who feel like they're always in reactive mode
     Key points: overwhelm signals, what a good system feels like, call to action
     ```

2. **Push to go live** (Wednesday after 9am):
   ```bash
   cd ~/{project-slug}-website
   git push origin main
   ```
   That's it. Vercel deploys automatically.

---

#### Your content pipeline (automatic)

| When | What happens | Your action |
|------|-------------|-------------|
| Monday 9am | Writer writes post from oldest brief | None |
| Tuesday 9am | Designer generates hero image | None |
| Wednesday 9am | Web Publisher builds page, stages commit | Run `git push origin main` |

---

#### How to keep your agents updated

When Dave updates the agent team, say this in Claude Code:

> **"sync agents"**

That pulls the latest from GitHub and installs everything automatically.

---

#### Your live website

URL: `https://{project-slug}.vercel.app`
Repo: `https://github.com/{clientslug}/{project-slug}-website`

Every `git push origin main` triggers a Vercel deploy. You'll see the live site update within 1–2 minutes.

---

#### Where to find things

| What | Where |
|------|-------|
| Blog content queue | `content/topics/` — one folder per post |
| Published posts | `website/pages/blog/posts/` |
| Publish history | `context/general-project-agent-context/publish-log.md` |
| Daily standups | `standup/briefings/` |
| Project tasks | `working_files/tasks/` |

---

#### If something goes wrong

- **Agent doesn't respond**: Run "sync agents" first
- **Build fails**: Ask `@developer` — paste the error message
- **Site not updating after push**: Check Vercel dashboard for the deployment status
- **Not sure what to prioritize**: Ask `@product-manager "what should I focus on this week?"`

---

**You're set. Your AI team is live and scheduled. Welcome to the system.**

---

## P2 complete — what you have now

- [ ] Agents repo cloned to `~/{project-slug}-agents/`
- [ ] All 8 agents installed to `~/.claude/agents/`
- [ ] sync-agents skill installed to `~/.claude/skills/`
- [ ] First sync completed successfully
- [ ] All 8 agents tested and responding
- [ ] Scheduled work confirmed running on Mac Mini
- [ ] Client has first-actions guide

**Track B is complete.**

The client's laptop is a fully functional AI team workstation. The Mac Mini handles scheduled automation. Both machines stay current via the agents repo on GitHub.
