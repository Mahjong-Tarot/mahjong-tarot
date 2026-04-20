# Schedule Mahjong Studio Agents — Setup Prompt

Read this file, then use the `create-local-task` skill to register all three scheduled tasks with Claude Desktop's local scheduler.

---

## Tasks to register

| Agent | Trigger file | Cron (local time) | Purpose |
|-------|-------------|-------------------|---------|
| Writer | `agents/writer/context/triggers/tuesday-writer.md` | `0 8 * * 2` | Writes blog posts for the upcoming week every Tuesday at 8 AM |
| Designer | `agents/designer/context/triggers/thursday-designer.md` | `0 8 * * 4` | Generates hero images for all unimaged posts every Thursday at 8 AM |
| Publisher | `agents/web-developer/context/triggers/weekday-publisher.md` | `0 9 * * 1-5` | Builds and publishes ready posts every weekday at 9 AM |

---

## Instructions for Claude Code

For each task:

1. Read the full prompt body from the trigger file listed above
2. Call `mcp__scheduled-tasks__create_scheduled_task` with:
   - `taskId`: the `name` field from the trigger file's frontmatter
   - `description`: the `description` field from the trigger file's frontmatter
   - `prompt`: the full body of the trigger file (everything below the closing `---`)
   - `cronExpression`: from the table above
   - `notifyOnCompletion`: `true`

Register all three tasks, then confirm each with its next scheduled run time.

---

## After registering

> **One-time action required:** Open Claude Desktop → Scheduled Tasks sidebar. Find each task and click **Run now** once to pre-approve tool permissions so future scheduled runs do not pause for prompts.

---

## Pipeline rhythm

```
Tuesday 8 AM   → Writer writes next week's posts
Thursday 8 AM  → Designer generates hero images for all written posts
Weekdays 9 AM  → Publisher builds pages for all imaged posts
```

Bill's only manual step: `git push origin main`
