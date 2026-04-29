Read `agents/project-manager/context/schedule-all-tasks.md` in full. That file defines every trigger that needs to exist for the Project Manager agent. Your job is to register all of them as remote scheduled triggers using the RemoteTrigger tool.

---

## Before creating any triggers

1. List all existing triggers with `RemoteTrigger {action: "list"}`.
2. Check if any trigger with the same canonical name already exists.
   - If it exists and the prompt/schedule matches: skip it, note it as already current.
   - If it exists but is outdated: update it with `RemoteTrigger {action: "update", trigger_id: "..."}`.
   - If it does not exist: create it.

---

## Configuration to use for every trigger

- **Environment ID**: `env_01Ly7cgFD1z5N2xN9VtNZ42S`
- **Model**: `claude-sonnet-4-6`
- **Repo**: `https://github.com/Mahjong-Tarot/mahjong-tarot`
- **Allowed tools**: `["Bash", "Read", "Write", "Edit", "Glob", "Grep"]`
- **UUID**: generate a fresh lowercase v4 UUID for each trigger's `events[].data.uuid`

---

## Trigger body shape

```json
{
  "name": "TRIGGER_NAME",
  "cron_expression": "CRON_UTC",
  "enabled": true,
  "job_config": {
    "ccr": {
      "environment_id": "env_01Ly7cgFD1z5N2xN9VtNZ42S",
      "session_context": {
        "model": "claude-sonnet-4-6",
        "sources": [
          {"git_repository": {"url": "https://github.com/Mahjong-Tarot/mahjong-tarot"}}
        ],
        "allowed_tools": ["Bash", "Read", "Write", "Edit", "Glob", "Grep"]
      },
      "events": [
        {"data": {
          "uuid": "<fresh lowercase v4 uuid>",
          "session_id": "",
          "type": "user",
          "parent_tool_use_id": null,
          "message": {"role": "user", "content": "PROMPT_FROM_SCHEDULE_ALL_TASKS"}
        }}
      ]
    }
  }
}
```

---

## Triggers to register

Use the exact names, cron expressions, and prompts from `agents/project-manager/context/schedule-all-tasks.md`. Do not paraphrase the prompts — copy them exactly.

The canonical trigger names are:
- `PM Standup Morning`
- `PM Standup Compile`
- `PM EOD Reminder`
- `PM Weekly RAG Report`

Skip `Sprint Retrospective` — it is set manually at each sprint boundary.

---

## After all triggers are registered

List all active triggers and report back in this format:

| Trigger name | Cron (UTC) | Local time (Asia/Saigon) | Status | Next run | Trigger ID |
|---|---|---|---|---|---|
| PM Standup Morning | `0 0 * * 1-5` | Mon–Fri 7:00 AM | ✅ active | ... | trig_... |
| PM Standup Compile | `0 2 * * 1-5` | Mon–Fri 9:00 AM | ✅ active | ... | trig_... |
| PM EOD Reminder | `0 10 * * 1-5` | Mon–Fri 5:00 PM | ✅ active | ... | trig_... |
| PM Weekly RAG Report | `0 9 * * 5` | Friday 4:00 PM | ✅ active | ... | trig_... |

If any trigger failed to register, show the error and what needs to be fixed.

Manage all triggers at: https://claude.ai/code/scheduled
