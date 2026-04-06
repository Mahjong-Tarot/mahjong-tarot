# CLAUDE.md

Project-level rules and conventions for Claude to follow in this workspace.

---

## Git

Always use the GitHub CLI (`gh`) and terminal commands for all git-related tasks (commits, branches, pull requests, status checks, etc.). Do not use GUI-based or API-based alternatives when a `git` or `gh` CLI command can accomplish the task.

## Workflow Documentation

All workflow documentation files must be saved under `/sessions/laughing-busy-clarke/mnt/mahjong-tarot/context`. Do not place workflow docs in other directories.

## Agent Persona Files

When a new agent is created, its persona instructions (`.md` files) must be stored in the `agents/` folder at the project root. This follows the Claude Code folder structure convention.
