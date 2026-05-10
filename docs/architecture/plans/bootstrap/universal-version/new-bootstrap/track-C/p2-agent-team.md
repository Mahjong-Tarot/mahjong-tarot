# Track C — P2: Your AI Team

> **Who runs this**: You, on your own laptop
> **Prerequisite**: P1 complete — machine configured, site live on Vercel
> **End state**: 8 agents installed globally on your machine, first-actions guide in hand

---

## Overview

P2 gives you the team. Eight AI agents — Build Team and GTM Team — installed to `~/.claude/agents/` so they're available in every project on your machine.

Unlike Track A (which creates the agents repo from scratch) and Track B (which syncs from a repo Dave set up), Track C installs from the Infinite Leverage public agents template. You can customize from there.

---

## Step 1 — Clone the agents template

```bash
cd ~
gh repo clone infinite-leverage/agents-template {your-project-slug}-agents
```

> **If that repo doesn't exist yet**: skip the clone and follow the manual scaffold in the appendix at the bottom of this file. Dave will publish the public template before the first solo cohort.

---

## Step 2 — Install all 8 agents

```bash
cp -r ~/{your-project-slug}-agents/.claude/agents/* ~/.claude/agents/
echo "✅ All 8 agents installed."
ls ~/.claude/agents/
```

Expected output:
```
developer.md    devops.md       designer.md     email-marketer.md
product-manager.md  qa.md       web-publisher.md    writer.md
```

---

## Step 3 — Install the sync-agents skill

```bash
cp -r ~/{your-project-slug}-agents/skills/sync-agents ~/.claude/skills/sync-agents
echo "✅ sync-agents skill installed."
```

---

## Step 4 — Push agents template to your own GitHub repo

You want your agents under your own account so you can customize them without touching the template:

```bash
cd ~/{your-project-slug}-agents
# Remove the template remote
git remote remove origin
# Create your own repo
gh repo create {your-project-slug}-agents --private --source=. --remote=origin --push
```

---

## Step 5 — Run first sync (verify round-trip)

```bash
cd ~/{your-project-slug}-agents
git pull origin main
cp -r .claude/agents/* ~/.claude/agents/
echo "✅ Agents synced."
```

Any time the template is updated or you customize an agent, run this to stay current:

```
# In Claude Code — just say:
sync agents
```

---

## Step 6 — Test all 8 agents

Open Claude Code in your website project:

```bash
cd ~/code-projects/{your-project-slug}-website
claude
```

Test each agent:

| Say this | What you should hear back |
|----------|--------------------------|
| `@product-manager what are you?` | Describes PM role, mentions standups and RAG reports |
| `@developer what are you?` | Describes developer role, mentions CLAUDE.md and stack |
| `@qa what are you?` | Lists what AI can and cannot test |
| `@devops what are you?` | Describes DevOps role, mentions escalation to human engineer |
| `@writer what are you?` | Describes Writer role, mentions content/topics/ queue |
| `@designer what are you?` | Describes Designer, mentions Gemini image generation |
| `@web-publisher what are you?` | Describes Publisher, mentions blog/posts/ and git commit |
| `@email-marketer what are you?` | Describes Email Marketer, mentions Resend and Supabase |

All 8 should respond. If any don't, run `sync agents` and try again.

---

## Step 7 — Set up scheduled automation (optional)

The content pipeline (Writer Monday, Designer Tuesday, Web Publisher Wednesday) and PM standups run via RemoteTrigger — cloud-hosted schedules that don't depend on your laptop being open.

This requires a Claude Pro subscription and the RemoteTrigger feature enabled.

To set up schedules, open Claude Code and say:

```
Set up my weekly content pipeline schedule:
- Every Monday 9am: Writer picks the oldest brief and writes the post
- Every Tuesday 9am: Designer generates the hero image  
- Every Wednesday 9am: Web Publisher builds and stages the commit
```

Claude will register the RemoteTrigger schedules and confirm.

For PM schedules, say:

```
Set up PM automation:
- Every weekday 8:30am: morning brief from git log and open PRs
- Every weekday 6pm: compile standup check-ins to standup/briefings/
- Every Friday 5pm: weekly RAG status report
```

---

## First actions — what to do now

Your AI team is live. Here is your first week:

### Day 1: Talk to your Product Manager
```
@product-manager I just finished setting up my AI team. 
What should I work on this week to get my first content piece live?
```

### Day 2: Queue your first post
Create a brief in your project:
```bash
mkdir -p ~/code-projects/{your-project-slug}-website/content/topics/my-first-post
```

Write `content/topics/my-first-post/brief.md`:
```markdown
Topic: [Your first post topic]
Angle: [Your perspective or hook]
Key points:
- [Point 1]
- [Point 2]
- [Point 3]
Target reader: [Who this is for]
```

Then ask your Writer:
```
@writer write this week's post
```

### Day 3: Generate the image and publish
```
@designer generate the hero image for my-first-post
```

```
@web-publisher publish my-first-post
```

Then:
```bash
cd ~/code-projects/{your-project-slug}-website
git push origin main
```

Your post is live.

---

## Your daily workflow going forward

**To queue content**: Add a `brief.md` to `content/topics/{slug}/`

**To push live** (Wednesday or whenever): `git push origin main`

**To start your day**: Say "morning standup" to Claude Code in your project folder

**To update your agents**: Say "sync agents"

**To add a task**: Say "add a task: [description]"

---

## P2 complete — what you have now

- [ ] 8 agents installed to `~/.claude/agents/`
- [ ] sync-agents skill installed
- [ ] Agents repo forked to your own GitHub account
- [ ] All 8 agents tested and responding
- [ ] Scheduled automation registered (optional)
- [ ] First content brief queued

**Your AI team is online. Everything from here is iteration.**

---

## Appendix — Manual agents scaffold (if template not available)

If the public template isn't published yet, create the agents manually:

```bash
mkdir -p ~/{your-project-slug}-agents/.claude/agents
mkdir -p ~/{your-project-slug}-agents/skills/sync-agents
cd ~/{your-project-slug}-agents
```

Then follow [Track A — P2: Agent Team](../track-A/p2-agent-team.md) Steps 3–8 verbatim — those steps write all 8 agent files and the sync-agents skill. Skip the parts about registering schedules (those require Track A's Mac Mini).

When done, push your agents repo:

```bash
gh repo create {your-project-slug}-agents --private --source=. --remote=origin --push
```

Return to Step 5 of this file.
