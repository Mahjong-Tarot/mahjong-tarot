# Schedule Mahjong Studio Agents — Setup Prompt

Read this file in full, then use the `create-local-task` skill to register all three scheduled tasks with Claude Desktop's local scheduler.

Working directory for all tasks: `/Applications/E8/Innovations/mahjong-tarot`

---

## What you are setting up

Three scheduled agents that run the Mahjong Tarot content pipeline automatically:

| Agent | Trigger file | Schedule | Purpose |
|-------|-------------|----------|---------|
| Writer | `agents/writer/context/triggers/tuesday-writer.md` | Every Tuesday 8 AM Asia/Saigon | Writes blog posts and social content for the upcoming week |
| Designer | `agents/designer/context/triggers/thursday-designer.md` | Every Thursday 8 AM Asia/Saigon | Generates hero images for all posts written but not yet imaged |
| Publisher | `agents/web-developer/context/triggers/weekday-publisher.md` | Every weekday 9 AM Asia/Saigon | Builds JSX pages and updates blog index for all posts with images |

The pipeline is designed so each agent picks up exactly where the previous one left off — writer writes Tuesday, designer images Thursday, publisher builds Friday (and every weekday thereafter until all ready slugs are published).

---

## Instructions for Claude Code

Follow the `create-local-task` skill exactly. Register all three tasks.

### Task 1 — Writer (Tuesday)

1. Read the full prompt body from `agents/writer/context/triggers/tuesday-writer.md`
2. Call `mcp__scheduled-tasks__create_scheduled_task` with:
   - `taskId`: `mahjong-writer-tuesday`
   - `description`: `Every Tuesday at 8 AM Asia/Saigon, checks the content calendar for the next unwritten week and runs the write-post skill. Branches off main, commits, opens a PR, and notifies Labs via Lark and email.`
   - `prompt`: full contents of the trigger file (everything below the frontmatter `---`)
   - `cronExpression`: `0 8 * * 2`  *(Tuesday 8 AM local)*
   - `notifyOnCompletion`: `true`

### Task 2 — Designer (Thursday)

1. Read the full prompt body from `agents/designer/context/triggers/thursday-designer.md`
2. Call `mcp__scheduled-tasks__create_scheduled_task` with:
   - `taskId`: `mahjong-designer-thursday`
   - `description`: `Every Thursday at 8 AM Asia/Saigon, finds all unimaged blog posts, writes image prompts, generates hero images via Gemini API, promotes WebP to website/public/images/blog/, commits, and notifies Labs.`
   - `prompt`: full contents of the trigger file
   - `cronExpression`: `0 8 * * 4`  *(Thursday 8 AM local)*
   - `notifyOnCompletion`: `true`

### Task 3 — Publisher (weekdays)

1. Read the full prompt body from `agents/web-developer/context/triggers/weekday-publisher.md`
2. Call `mcp__scheduled-tasks__create_scheduled_task` with:
   - `taskId`: `mahjong-publisher-weekday`
   - `description`: `Every weekday at 9 AM Asia/Saigon, finds all ready-to-publish slugs (blog post + hero image present, no JSX yet), builds pages, updates blog index, commits, and notifies Labs.`
   - `prompt`: full contents of the trigger file
   - `cronExpression`: `0 9 * * 1-5`  *(weekdays 9 AM local)*
   - `notifyOnCompletion`: `true`

---

## After registering all three tasks

Confirm each registration succeeded by reporting:
- Task ID
- Next scheduled run time (returned by the MCP tool)

Then remind the user:

> **One-time action required:** Open Claude Desktop → Scheduled Tasks sidebar. Find each of the three tasks and click **Run now** once. This pre-approves the tool permissions (file reads, git, Lark CLI, Resend CLI, Gemini API calls) so future scheduled runs do not pause for permission prompts.

---

## Pipeline rhythm (for reference)

```
Tuesday 8 AM   → Writer writes next week's posts → PR merged to main
Thursday 8 AM  → Designer images all unimaged posts → PR merged to main
Friday 9 AM    → Publisher builds all ready posts → PR merged to main
                 (also runs Mon–Thu in case anything was missed)

Bill's only manual step: git push origin main from his terminal
```

---

## Editing or pausing a task

To update a prompt: edit the trigger file in `agents/*/context/triggers/`, then re-register the task with the same `taskId` (the MCP tool will overwrite it).

To pause a task: open Claude Desktop → Scheduled Tasks → toggle the task off.

To run a task immediately outside its schedule: open Claude Desktop → Scheduled Tasks → click **Run now**.
