# Internal Announcement: Migrating PM Workflow from Claude Cowork to Claude Code

**Date:** 2026-04-08
**From:** Project Manager Agent
**To:** Dave, Yon, Trac, Khang
**Re:** Infrastructure migration — Cowork → Claude Code

---

## The Short Version

We are retiring Claude Cowork from this project's stack. As of today, the entire PM agent workflow — scheduled triggers, skills, standups, RAID logs, and reports — runs exclusively through Claude Code. The migration is complete. No action required from anyone except a one-time re-run of the onboarding prompt on each local machine.

---

## Why Now

Cowork was never the preferred tool. It was the necessary one. The PM agent needed scheduled triggers to run morning standups, deadline checks, and weekly reports automatically. Claude Code did not support that — until now.

With native scheduling now available in Claude Code via the `CronCreate` tool and `/schedule` skill, the last functional reason to keep Cowork in the stack is gone. We moved immediately.

---

## What Blocker Was Lifted

**Two interfaces for one brain.** Running the PM agent across Cowork and Claude Code meant maintaining context in two places, onboarding each new machine twice, and managing skill installation through a click-through UI that could not be scripted or version-controlled.

Specific frictions now eliminated:

- **Skill installation**: Cowork required writing a `.skill` temp file, clicking "Save Skill" in the web UI, verifying installation, then deleting the temp file. Claude Code discovers skills automatically from `SKILL.md` files already checked into the repo. No clicks. No temp files. Skills are always in sync with the codebase.
- **Scheduling**: Cowork held all scheduled triggers in its own interface, disconnected from the project repo. Claude Code schedules are created programmatically and can be documented, reproduced, and version-controlled.
- **Onboarding**: A new machine previously required setting up both tools. Now it requires Claude Code only. The onboarding prompt has been updated accordingly.

---

## What Changes Day-to-Day

| Area | Before | After |
|---|---|---|
| Skills | Install via Cowork UI (.skill file → click Save) | Auto-discovered from SKILL.md files in repo |
| Schedules | Registered in Cowork interface | Created via CronCreate / `/schedule` in Claude Code |
| Onboarding | Two tools to set up | Claude Code only |
| Skill updates | Reinstall manually after changes | Pull from git — already updated |
| Context | Split across web UI and CLI | Single CLI session |

The `/daily-checkin`, `/raid-log`, and `/scope-change` skills work identically. The standup files, RAID log, reports, and alert outputs land in the same paths as before. Nothing about the PM agent's behaviour changes — only where it lives.

---

## The Trade-Offs (Honest Accounting)

**What we lose:**

- Cowork's visual UI. For non-technical users, clicking "Save Skill" in a web interface is more approachable than a terminal. If Dave or Yon are uncomfortable in Claude Code, there is a steeper ramp.
- The web-based access model. Cowork could be opened in a browser from anywhere. Claude Code requires a terminal and the project cloned locally.

**What we gain:**

- One tool. One context. One place to look.
- Skills that update automatically when the repo updates — no reinstall step, no drift between what's in the file and what's installed.
- Schedules that can be documented, reviewed, and reproduced from the repo itself.
- Zero cognitive overhead switching between interfaces mid-task.

**The verdict:** For a solo operator running an infinite leverage model — where every unnecessary tool switch is a tax on attention — consolidation is the right call. The visual UI Cowork provided was solving a problem Claude Code users do not have. The scheduling gap was real; it is now closed.

The losses are real but small. The gains are structural.

---

## What Each Person Needs to Do

**Everyone (Dave, Yon, Trac, Khang):** Run the updated onboarding prompt in Claude Code with this project folder open. It will handle git sync, skill verification, schedule registration, and your first check-in in one pass. The prompt is at:

```
agents/project manager/context/workflows/cowork-onboarding-prompt.md
```

---

## Reference: Updated Files

- `agents/project manager/context/workflows/cowork-onboarding-prompt.md` — full migration to Claude Code
- `agents/project manager/context/workflows/schedule-all-tasks.md` — updated to CronCreate / `/schedule`
- `agents/shared/import-agent-skills/SKILL.md` — new shared skill for importing any agent's skill set
- `context/skill-import-prompt-template.md` — reusable template for future agent onboarding
