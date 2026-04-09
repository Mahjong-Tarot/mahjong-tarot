You are setting up the Mahjong Tarot project on this machine for the first time. Work through every step below using your Bash tool — do not ask me to open a terminal or run commands myself unless explicitly noted. Tell me what you're doing at each step and flag anything that needs my input.

---

## Step 1 — Clone the repository (skip if already cloned)

Check if the project already exists:

```bash
ls ~/Documents/mahjong-tarot
```

If the folder does not exist, clone it:

```bash
git clone https://github.com/Mahjong-Tarot/mahjong-tarot.git ~/Documents/mahjong-tarot
```

Then confirm it succeeded:

```bash
ls ~/Documents/mahjong-tarot
```

You should see `agents/`, `content/`, `website/`, and `context/`.

---

## Step 2 — Configure Git identity

Ask me for my name and email if you do not already know them. Then run:

```bash
git config --global user.name "<my name>"
git config --global user.email "<my email>"
```

Confirm by running:

```bash
git config --global user.name
git config --global user.email
```

---

## Step 3 — Install website dependencies

```bash
cd ~/Documents/mahjong-tarot/website && npm install
```

Wait for completion. Confirm `node_modules/` exists:

```bash
ls ~/Documents/mahjong-tarot/website/node_modules | head -5
```

If you see folder names, dependencies are installed correctly.

---

## Step 4 — Sync the repo to latest

```bash
cd ~/Documents/mahjong-tarot && git switch main && git pull origin main
```

Report the current branch and last commit message.

---

## Step 5 — Set up personal branch

Check for an existing personal branch for me:

```bash
git branch -a
```

- If a branch named after me exists (e.g. `dave/daily`, `yon/daily`) — check it out and merge main into it:
  ```bash
  git switch <my-branch> && git merge main
  ```
- If no branch exists — ask me to confirm a branch name (convention: `<name>/daily`), then create it:
  ```bash
  git checkout -b <branch-name> && git push -u origin <branch-name>
  ```

Tell me which branch I'm on.

---

## Step 6 — Verify PM skills are available

Check that these three skill files exist:

```bash
ls "~/Documents/mahjong-tarot/agents/project manager/context/skills/daily-checkin/SKILL.md"
ls "~/Documents/mahjong-tarot/agents/project manager/context/skills/raid-log/SKILL.md"
ls "~/Documents/mahjong-tarot/agents/project manager/context/skills/scope-change/SKILL.md"
```

If all three exist, tell me:
> "All PM skills are available: `/daily-checkin`, `/raid-log`, `/scope-change`."

If any are missing, flag the path and continue — report it in the final summary.

---

## Step 7 — Register all scheduled workflows

Read the file `agents/project manager/context/workflows/schedule-all-tasks.md` and execute it now using Claude Code's schedule system (CronCreate tool or `/schedule` skill).

Before creating each trigger, check if one with the same canonical name already exists. If it does, skip it and note "already registered."

After registering all triggers, list them back to me with their next run times and status.

---

## Step 8 — First daily check-in

Read and execute the `/daily-checkin` skill now. Ask me:

> "We're all set. Let's do your first check-in — tell me your name and what you worked on today. A brain dump or bullet points is fine."

Wait for my response, then:
- Extract and confirm my focus items
- Note any blockers
- Write my standup to `standup/<my-name>.md` with today's date

Confirm the file path when done.

---

## Step 9 — Generate my personal git push guide

Using my name and branch from Step 5, output a personalised copy-paste block I can save for daily use:

---

### Your daily git push — [Name]

**After your check-in is written, run these in Terminal:**

**1. Commit:**
```bash
git add standup/[name].md
git commit -m "chore(daily): [YYYY-MM-DD] check-in"
```

**2. Push:**
```bash
git push origin [branch-name]
```

**3. Open a Pull Request:**
- Go to: `https://github.com/Mahjong-Tarot/mahjong-tarot/pull/new/[branch-name]`
- Title: `chore(daily): [YYYY-MM-DD] [Name] check-in`
- Click **Create pull request**

**4. Merge immediately:**
- Click **Merge pull request** → **Confirm merge**
- Do not delete the branch — it is your permanent personal branch

---

Tell me to bookmark or screenshot this — the only thing that changes daily is the date in the commit message.

---

## Step 10 — Final summary

Confirm everything is in place:

- ✅ Repository cloned to `~/Documents/mahjong-tarot`
- ✅ Git identity configured
- ✅ Website dependencies installed
- ✅ Repo synced to latest main
- ✅ Personal branch set up: [branch-name]
- ✅ PM skills verified (daily-checkin, raid-log, scope-change)
- ✅ Scheduled workflows registered
- ✅ First check-in written to `standup/[name].md`
- ✅ Personal git push guide generated
- ⏳ Commit, push, and merge still needed — use the guide above

Flag any items that were skipped or failed, with the reason.
