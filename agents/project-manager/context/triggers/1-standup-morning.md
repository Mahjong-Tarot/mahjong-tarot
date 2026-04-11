# PM Standup Morning

**Name**: `PM Standup Morning`

**Description**: Sends a morning check-in reminder to all four team members (Dave, Yon, Trac, Khang) at 7 AM, asking them to submit their standup files to `standup/individual/` before the 9 AM compile deadline. Attempts Telegram first, then Lark. If both fail, logs the failure in that day's briefing file. Creates a git branch, commits any file changes, and opens a PR — never writes directly to main.

---

## Prompt

```
Run the daily stand-up Phase 1 workflow from agents/project-manager/context/daily-standup.md.

It is now 7 AM Asia/Saigon. Send a morning check-in reminder to all four team members — Dave, Yon, Trac, and Khang — asking them to submit their check-in files in standup/individual/ before 9 AM:
- standup/individual/dave.md
- standup/individual/yon.md
- standup/individual/trac.md
- standup/individual/khang.md

Notification order: Telegram → Lark. If both fail, document the failure in standup/briefings/YYYY-MM/YYYY-MM-DD.md (create the file if it does not exist yet). Do not create any alerts folder or alert files.

Git workflow: git pull origin main → git checkout -b pm/standup-morning/YYYY-MM-DD → write any file changes on this branch → git add <files> → git commit -m "pm(standup-morning): YYYY-MM-DD" → git push → gh pr create --base main → gh pr merge --merge --auto. Never commit to main directly.
```

---

**Schedule**: Weekdays at 7:00 AM Asia/Saigon (`0 0 * * 1-5` UTC)
