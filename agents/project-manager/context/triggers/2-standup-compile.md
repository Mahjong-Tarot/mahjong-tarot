# PM Standup Compile

**Name**: `PM Standup Compile`

**Description**: Compiles the daily stand-up at 9 AM from all five check-in files (`dave.md`, `yon.md`, `trac.md`, `khang.md`, `agents.md`). Checks that each human file is fresh (dated the previous working day). Detects conflicts. Writes the compiled briefing to `standup/briefings/YYYY-MM/YYYY-MM-DD.md`. Sends the summary via Telegram then Lark; if both fail, appends a status note to the briefing file. Commits on a branch and opens a PR.

---

## Prompt

```
Run the daily stand-up Phase 2 workflow from agents/project-manager/workflows/daily-standup-workflow.md.

It is now 9 AM Asia/Saigon — the stand-up compile deadline.

Git workflow first: git pull origin main → git checkout -b pm/standup-compile/YYYY-MM-DD. All writes go on this branch.

Read all five files in standup/individual/: dave.md, yon.md, trac.md, khang.md, and agents.md. Check freshness on the four human files (date must match the previous working day — yesterday; treat Friday as yesterday on Mondays).

Detect conflicts across all five check-ins.

Compile the daily stand-up to standup/briefings/YYYY-MM/YYYY-MM-DD.md (create the monthly folder if needed). Include agent updates as-is under an Agent Updates section.

Send the summary: Telegram → Lark. If both fail, append the notification status at the bottom of standup/briefings/YYYY-MM/YYYY-MM-DD.md. Do not create any alerts folder or alert files.

Commit: git add standup/briefings/YYYY-MM/YYYY-MM-DD.md → git commit -m "pm(standup-compile): YYYY-MM-DD" → git push origin pm/standup-compile/YYYY-MM-DD → gh pr create --title "pm(standup-compile): YYYY-MM-DD" --base main → gh pr merge --merge --auto.
```

---

**Schedule**: Weekdays at 9:00 AM Asia/Saigon (`0 2 * * 1-5` UTC)
