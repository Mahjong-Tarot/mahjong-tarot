# Claude Code — Permission Unlock Setup

## Purpose

Scheduled and automated agents (standup, compile, PM reminders) cannot handle interactive permission prompts. This document records the permission configuration that allows all CLI commands to run unattended.

## What to configure

In `~/.claude/settings.json`, the `permissions.allow` array must include `"Bash(*)"` as its first entry. This single wildcard replaces per-command allow rules and covers:

- Full-path binaries (e.g. `/Users/<user>/.npm-global/bin/lark-cli`)
- Chained commands (`&&`, `;`, pipes)
- Inline scripts (`python3 -c "..."`, `bash -c "..."`)
- Any CLI tool not known at config-write time

## Minimal allow block (merge into existing settings)

```json
"permissions": {
  "allow": [
    "Bash(*)",
    "Read",
    "Write",
    "Edit",
    "Glob",
    "Grep"
  ],
  "defaultMode": "acceptEdits"
}
```

`defaultMode: acceptEdits` keeps file-write prompts active while removing all Bash prompts. Use `bypassPermissions` only if file writes also need to be unattended (not recommended for interactive sessions).

## Why not per-command rules

Per-command `Bash(cmd:*)` entries only match the leading token before a space. They miss:

| Command pattern | Per-command rule | `Bash(*)` |
|---|---|---|
| `/usr/local/bin/tool arg` | No match (full path) | ✅ |
| `cmd1 && cmd2` | No match (shell compound) | ✅ |
| `python3 -c "script"` | Matches `python3` only if listed | ✅ |
| `LARK_EXIT=$?` | Not a command, shell built-in | ✅ |

The per-command approach accumulates debt — every new tool or path variation requires a new entry.

## Security note

`Bash(*)` allows any shell command without prompting. The `acceptEdits` default mode still gates file writes. This setting is appropriate for:

- Developer machines running scheduled agents
- CI-like automation in a trusted local environment

It is **not** appropriate for shared or untrusted environments.
