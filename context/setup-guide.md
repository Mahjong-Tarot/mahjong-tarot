# Claude Code Setup Guide

**For:** Dave, Yon, and any non-technical team members
**Purpose:** Get set up from zero to running daily check-ins in Claude Code

This guide walks you through everything
- Installing prerequisites
- Cloning the project
- Setting up Claude Code
- Installing dependencies
- Activating the Project Manager agent

---

## Overview: What You're Setting Up

| Component | What It Does |
|-----------|--------------|
| **Terminal** | Your command-line interface to run commands |
| **Git** | Version control
- tracks changes, syncs with team |
| **Node.js** | JavaScript runtime
- required for the website |
| **Claude Code** | AI assistant that runs in your terminal
- handles PM tasks, skills, scheduling |
| **Project Manager Agent** | Automated workflows for standups, reports, RAID logs |

---

## Part 1: Install Prerequisites

### Step 1.1
- Install Terminal (macOS)

Your Mac already has Terminal installed.

1. Press `Cmd + Space` to open Spotlight
2. Type `Terminal` and press Enter
3. Keep this window open
- you'll use it throughout setup

**Pro tip:** Pin Terminal to your Dock
- Right-click the Terminal icon in Dock
- Options
- Keep in Dock

---

### Step 1.2
- Install Git

Git tracks every change to the project and syncs your work with the team.

**Check if you already have Git:**

In Terminal, type:
```bash
git --version
```

- If you see a version number (e.g., `git version 2.39.0`)
- you're done. Skip to Step 1.3.
- If you see `command not found`, continue below.

**Install Git:**

1. Install Xcode Command Line Tools:
```bash
xcode-select --install
```

2. A popup will appear
- click **Install**

3. Wait for installation to complete (5-10 minutes)

4. Verify:
```bash
git --version
```

---

### Step 1.3
- Install Node.js

Node.js runs the website. Even if you're not working on the website, some tools depend on it.

**Check if you already have Node:**

```bash
node --version
```

- If you see `v18.x.x` or higher
- you're done. Skip to Step 1.4.
- If you see `command not found` or an older version, continue below.

**Install Node.js (recommended method):**

1. Install Homebrew (package manager for Mac):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. When prompted, enter your Mac password (you won't see it as you type
- this is normal)

3. After Homebrew installs, add it to your path (run both commands):
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

4. Install Node.js:
```bash
brew install node
```

5. Verify:
```bash
node --version
npm --version
```

You should see Node v18+ and npm v9+.

---

### Step 1.4
- Install Claude Code

Claude Code is your AI assistant. It runs directly in your terminal and handles all PM tasks.

**Install:**

```bash
npm install -g @anthropic-ai/claude-code
```

**Verify:**

```bash
claude --version
```

---

## Part 2: Clone the Project

### Step 2.1
- Create your project folder

We recommend keeping the project in your Documents folder for easy access.

```bash
mkdir -p ~/Documents/mahjong-tarot
```

---

### Step 2.2
- Clone the repository

This downloads the entire project from GitHub to your machine.

```bash
cd ~/Documents
git clone https://github.com/Mahjong-Tarot/mahjong-tarot.git
```

You'll see progress bars as files download. When complete:

```bash
cd mahjong-tarot
ls
```

You should see folders like `agents/`, `content/`, `website/`, and `context/`.

---

### Step 2.3
- Configure Git with your identity

Git needs to know who you are for commits.

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Replace with your actual name and email.

---

## Part 3: Install Project Dependencies

### Step 3.1
- Install website dependencies

The website has dependencies that need to be installed locally.

```bash
cd ~/Documents/mahjong-tarot/website
npm install
```

This may take 1-2 minutes. You'll see a progress bar.

**Verify:**

```bash
ls node_modules
```

You should see a long list of folders
- this means dependencies installed correctly.

---

## Part 4: Set Up Claude Code

### Step 4.1
- Open Claude Code in the project

Navigate to the project folder and start Claude Code:

```bash
cd ~/Documents/mahjong-tarot
claude
```

**First-time setup:**

Claude Code will guide you through authentication:

1. It will display a URL and a code
2. Press `Enter` to open the URL in your browser
3. Log in with your Anthropic account
4. Enter the code shown in Terminal
5. Return to Terminal when complete

You should now see Claude Code running, ready for input.

---

### Step 4.2
- Verify Claude Code sees the project

In Claude Code, type:

```
What project is this? Read CLAUDE.md and summarize.
```

Claude should respond with a summary of The Mahjong Tarot project.

---

## Part 5: Activate the Project Manager Agent

### Step 5.1
- Run the onboarding prompt

The onboarding prompt sets up everything for you:
- Syncs your git branch
- Verifies PM skills are available
- Registers scheduled workflows (daily standups, weekly reports)
- Guides you through your first check-in

**In Claude Code, paste this:**

```
Read and execute the file: agents/project manager/context/workflows/onboarding-prompt.md
```

Claude will walk you through each step. Follow the prompts.

---

### Step 5.2
- What the onboarding does

You don't need to do anything manually here
- this section explains what's happening.

| Step | What Claude Does |
|------|------------------|
| **Git sync** | Switches to main, pulls latest, creates your personal branch |
| **Skill verification** | Confirms `/daily-checkin`, `/raid-log`, `/scope-change` are available |
| **Schedule registration** | Sets up automated triggers for standups, reports, retros |
| **First check-in** | Guides you through writing your first standup file |
| **Git push guide** | Generates personalized commands for your daily workflow |

---

### Step 5.3
- Verify skills are available

After onboarding completes, test that skills work:

In Claude Code, type:
```
/daily-checkin
```

You should see Claude ask for your name and what you worked on today.

If you see an error like "skill not found," tell Claude:
```
Verify that the skill files exist under agents/project manager/context/skills/
```

---

## Part 6: Your Daily Workflow

### Every morning: Pull latest changes

Before starting work, always pull the latest:

```bash
cd ~/Documents/mahjong-tarot
git pull origin main
```

Or just tell Claude:
```
Pull the latest changes from main
```

---

### Every evening: Daily check-in

**Option A
- Use Claude Code (recommended):**

1. Open Terminal
2. Run:
```bash
cd ~/Documents/mahjong-tarot && claude
```
3. Type:
```
/daily-checkin
```
4. Answer Claude's questions
5. Claude writes the file for you

**Option B
- Direct command:**

Just tell Claude:
```
I need to do my check-in. I'm [your name], and today I [what you did].
```

Claude will handle the rest.

---

### After check-in: Push your changes

Claude will generate personalized git commands during onboarding. They look like this:

```bash
git add standup/your-name.md
git commit -m "chore(daily): 2026-04-08 check-in"
git push origin your-name/daily
```

Then:
1. Open GitHub in your browser
2. Create a Pull Request
3. Merge it immediately

**Your personalized guide** will be generated during onboarding
- save it somewhere accessible.

---

## Quick Reference: Essential Commands

| Task | Command |
|------|---------|
| Open Terminal | `Cmd + Space`, type `Terminal` |
| Navigate to project | `cd ~/Documents/mahjong-tarot` |
| Pull latest changes | `git pull origin main` |
| Start Claude Code | `claude` |
| Run daily check-in | `/daily-checkin` |
| Check git status | `git status` |
| View your branch | `git branch` |

---

## Troubleshooting

### "command not found: git"

Git isn't installed. See [Step 1.2](#step-12---install-git).

---

### "command not found: node"

Node.js isn't installed. See [Step 1.3](#step-13---install-nodejs).

---

### "command not found: claude"

Claude Code isn't installed. See [Step 1.4](#step-14---install-claude-code).

---

### "Permission denied (publickey)"

GitHub authentication issue. Use HTTPS instead:

```bash
git remote set-url origin https://github.com/Mahjong-Tarot/mahjong-tarot.git
```

---

### "Merge conflict"

Someone else edited the same file you're working on.

1. Don't panic
- this is normal
2. Tell Claude:
```
I have a merge conflict. Help me resolve it.
```
3. Claude will guide you through keeping the right changes

---

### "/daily-checkin not found"

Skills should auto-discover from SKILL.md files. Verify:

```
Check if agents/project manager/context/skills/daily-checkin/SKILL.md exists
```

If missing, pull latest:
```bash
git pull origin main
```

---

### Claude Code won't authenticate

1. Make sure you have an Anthropic account
2. Try logging out and back in:
```bash
claude logout
claude
```
3. Follow the authentication flow again

---

## What Changed from Cowork

If you used Claude Cowork before, here's what's different:

| Before (Cowork) | After (Claude Code) |
|-----------------|---------------------|
| Web UI in browser | Terminal-based |
| Skills installed via UI clicks | Skills auto-discovered from files |
| Schedules in Cowork interface | Schedules via `/schedule` command |
| Two tools to manage | One tool for everything |
| Context split across interfaces | Single session, full context |

**The skills work the same.** `/daily-checkin`, `/raid-log`, and `/scope-change` behave identically. Only the interface changed.

---

## Getting Help

If anything in this guide doesn't work:

1. **Ask Claude directly:**
   ```
   I'm stuck on [step]. Can you help me troubleshoot?
   ```

2. **Check the onboarding prompt:**
   ```
   Read agents/project manager/context/workflows/onboarding-prompt.md and help me complete setup
   ```

3. **Contact Trac or the technical lead**

---

## Summary Checklist

Print this and check off each step:

- [ ] Terminal installed and pinned to Dock
- [ ] Git installed (`git --version` works)
- [ ] Node.js installed (`node --version` shows v18+)
- [ ] Claude Code installed (`claude --version` works)
- [ ] Project cloned to `~/Documents/mahjong-tarot`
- [ ] Git identity configured
- [ ] Website dependencies installed (`npm install` in `website/`)
- [ ] Claude Code authenticated
- [ ] Onboarding prompt completed
- [ ] `/daily-checkin` skill verified
- [ ] Personal git push guide saved

---

**Setup complete.** You're ready for daily standups, automated reports, and full PM agent support
- all from Claude Code in your terminal.
