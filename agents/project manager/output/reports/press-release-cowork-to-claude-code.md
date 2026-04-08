# Internal Announcement: Migrating from Claude Cowork to Claude Code

**Date:** 2026-04-08
**From:** Project Manager Agent
**To:** Dave, Yon, Trac, Khang
**Re:** Why we're retiring Cowork and consolidating everything into Claude Code

---

## The Short Version

We are retiring Claude Cowork. As of today, all project operations — task tracking, standups, reports, and automated workflows — run exclusively through Claude Code. The migration is complete. Each person needs to do a one-time re-run of the onboarding prompt on their machine to sync up.

---

## Why We Had Two Tools in the First Place

Cowork was never the preferred tool. It was a workaround.

Claude Code lacked one critical capability: the ability to schedule automated tasks. We needed things to happen at fixed times — morning reminders, deadline checks, weekly summaries — without anyone having to manually trigger them. So we brought in Cowork specifically for that.

That workaround is now obsolete. Scheduling is natively supported in Claude Code. Cowork's only job is done.

---

## The Core Problem with Running Cowork Alongside Claude Code

Running two AI interfaces for one project creates a category of friction that compounds quietly over time.

**Split context.** Every time work crossed the boundary between Cowork and Claude Code, something was lost. An agent that can see everything in one session is sharper than one stitching together two partial views.

**Double onboarding.** Every new team member had to set up both tools separately. Every returning member had to maintain both. That cost is invisible until you add it up.

**Capability drift.** When a workflow lives in one tool and the knowledge lives in another, they diverge. Updates to one don't automatically reflect in the other. Subtle inconsistencies accumulate — hard to debug, easy to ignore until they cause real problems.

**Manual capability management.** Cowork required human interaction through its UI to install and update agent capabilities. Every change required someone to click through an interface. That's a bottleneck in a workflow designed around automation.

---

## What the Consolidation Changes

The day-to-day experience for the team changes very little. The same workflows run. The same information lands in the same places. The rhythm is identical.

What changes is the underlying structure:

| Area | Before | After |
|---|---|---|
| **Capabilities** | Installed manually in Cowork UI | Automatically available in Claude Code |
| **Schedules** | Managed inside Cowork | Created and documented alongside the project |
| **Onboarding** | Cowork + Claude Code to configure | Claude Code only, one prompt |
| **Updates** | Manual reinstall in Cowork required | Always current — no action needed |
| **Context** | Split across Cowork and Claude Code | Single continuous Claude Code session |

Nothing the team interacts with daily changes in behaviour. Only the infrastructure behind it changes.

---

## What We Gain

- One tool. One context. One place to look.
- Capabilities that stay current automatically — no manual update step, no drift between what's documented and what's running.
- Schedules and workflows that live alongside the project, can be reviewed by anyone, and can be reproduced on any machine.
- Zero overhead switching between interfaces during a working session.

The scheduling gap that justified Cowork is now closed. There is no functional loss. Consolidation into Claude Code is the structurally correct move, and the timing is right.

---

## What Each Person Needs to Do

Open Claude Code with the project folder active and run the onboarding prompt. It will handle everything in one pass — syncing your local copy, verifying your setup, registering scheduled workflows, and walking you through your first check-in.

If you're unsure how to start, ask Trac.
