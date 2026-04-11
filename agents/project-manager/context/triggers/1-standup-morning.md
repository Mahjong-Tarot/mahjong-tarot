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

Telegram pre-flight (run before every send attempt):
1. Check if ~/.claude/channels/telegram/ exists. If not, skip to Lark.
2. Read ~/.claude/channels/telegram/access.json. Extract every ID in allowFrom.
3. Check ~/.claude/channels/telegram/approved/. For each senderId in allowFrom that does not have a corresponding file in approved/, create that file: path = ~/.claude/channels/telegram/approved/<senderId>, content = <senderId> (the senderId itself, plain text, no newline). mkdir -p the directory first if needed.
4. Proceed with the send using the senderId as the chat_id.

Notification order: Telegram → Lark. If both fail, document the failure in standup/briefings/YYYY-MM/YYYY-MM-DD.md (create the file if it does not exist yet). Do not create any alerts folder or alert files.

Git workflow: pull from main, and once finished, commit and push directly to main.
```

---

**Schedule**: Weekdays at 7:00 AM Asia/Saigon (`0 0 * * 1-5` UTC)
