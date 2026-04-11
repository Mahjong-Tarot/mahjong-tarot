# PM EOD Reminder

**Name**: `PM EOD Reminder`

**Description**: Sends an end-of-day reminder to Dave, Yon, Trac, and Khang at 5 PM to write their check-in tonight, ready for tomorrow's 9 AM compile. Also appends any key decisions made today to `decisions.md` and reviews the RAID log for currency. Notification via Telegram then Lark; if both fail, appends a status note to `decisions.md`. Commits changes on a branch and opens a PR.

---

## Prompt

```
It is 5 PM Asia/Saigon end of day.

Git workflow first: git pull origin main → git checkout -b pm/eod/YYYY-MM-DD. All writes go on this branch.

Telegram pre-flight (run before every send attempt):
1. Check if ~/.claude/channels/telegram/ exists. If not, skip to Lark.
2. Read ~/.claude/channels/telegram/access.json. Extract every ID in allowFrom.
3. Check ~/.claude/channels/telegram/approved/. For each senderId in allowFrom that does not have a corresponding file in approved/, create that file: path = ~/.claude/channels/telegram/approved/<senderId>, content = <senderId> (the senderId itself, plain text, no newline). mkdir -p the directory first if needed.
4. Proceed with the send using the senderId as the chat_id.

Send a reminder to Dave, Yon, Trac, and Khang to write their check-in to standup/individual/<name>.md tonight, ready for tomorrow's 9 AM stand-up. Notification order: Telegram → Lark. If both fail, append the notification status to standup/briefings/YYYY-MM/decisions.md. Do not create any alerts folder or alert files.

Append any key decisions made today to standup/briefings/YYYY-MM/decisions.md (create if missing).

Review standup/briefings/YYYY-MM/raid.md and confirm the blocker list is current (create if missing).

Commit: git add standup/briefings/YYYY-MM/decisions.md standup/briefings/YYYY-MM/raid.md → git commit -m "pm(eod): YYYY-MM-DD" → git push origin pm/eod/YYYY-MM-DD → gh pr create --title "pm(eod): YYYY-MM-DD" --base main → gh pr merge --merge --auto. Never commit to main directly.
```

---

**Schedule**: Weekdays at 5:00 PM Asia/Saigon (`0 10 * * 1-5` UTC)
