date: 2026-05-13

---

## project-manager

**Completed:**
- PR #201: pm(standup-morning): 2026-05-12 — merged 2026-05-12 00:07 UTC

**Next:**
- This 07:00 morning trigger is in flight (`pm/standup-morning/2026-05-13`)
- 09:00 standup-compile run later this morning

**Blockers:**
- Lark bot auth still failing (`[10014] app secret invalid`) — carrying forward from 2026-05-08 (now 13 consecutive working days). App secret for App ID `cli_a95707d3b57a5eed` needs rotation, and `LARK_CHAT_ID` (`oc_e5fe68740864439744b3fb0f31f81040`) still missing from root `.env`. `lark-cli` upgrade (1.0.10 → 1.0.23+) also pending.

---

## brevo-manager

**Completed:**
- PR #203: brevo-manager: Sequence D dual-domain plan + warmup automation — merged 2026-05-12 17:10 UTC. Single landing covers Brevo MCP install (282 tools, IPv6 whitelist resolved), dual-domain strategy (D-0 from sacrificial `firepig@onlinechineseastrology.com`, D-1+ from pristine `firepig@mahjongtarot.com`), Bridge campaign Jun 9, 48h pre-flight preview as hard rule (persona §7), `sequence-d-plan.md` + `warmup-checklist.md` + `warmup-templates.md` + `send-log.md` published, `oca-reactivation-sequence/SKILL.md` updated. Operational state outside PR: Sender id 3 verified, mahjongtarot.com DKIM/DMARC live at Vercel DNS, campaigns 1–3 rescheduled to Jun 2-4 14:00Z (suspended pending Jun 1 decision gate), campaign 4 drafted, `firepig-warmup-daily` cron + 4 × `brevo-preview-*` + `brevo-d0-decision-gate` scheduled tasks queued.

**Next:**
- No open PRs.
- Phase 1 OCA warmup begins today — 5 plain-text personal sends from `firepig@onlinechineseastrology.com` (Yon executing per his check-in).
- 48h pre-flight previews fire at `brevo-preview-d0-batch1/2/3` on May 31 / Jun 1 / Jun 2 (21:00 Saigon) ahead of Jun 2-4 D-0 sends; Bridge preview Jun 7 21:00.
- `brevo-d0-decision-gate` Mon Jun 1 18:00 Saigon classifies warmup GREEN/YELLOW/RED.

**Blockers:**
None blocking — but Brevo MCP token sits in chat history and should be rotated at https://app.brevo.com/sso/account → SMTP & API → API Keys (carry-forward note from PR #203).

---

## web-developer

**Completed:**
- No activity in the 2026-05-12 00:00 UTC → 2026-05-13 00:00 UTC window.

**Next:**
- No open PRs.
- Per content calendar: writer bundles for 2026-05-18 / 2026-05-20 / 2026-05-22 remain ready for hero image generation + page build. `2026-05-15-derby-feel-good` page build still outstanding.

**Blockers:**
None

---

## writer

**Completed:**
- No activity in the 2026-05-12 00:00 UTC → 2026-05-13 00:00 UTC window. (PR #200 — Week of 2026-05-18 — landed 2026-05-11 18:23 UTC and is reflected in yesterday's briefing.)

**Next:**
- No open PRs.
- Content calendar through end-of-May still has slots needing drafts beyond 2026-05-22.

**Blockers:**
None

---

## product-manager

**Completed:**
- No activity in the 2026-05-12 00:00 UTC → 2026-05-13 00:00 UTC window.

**Next:**
- Review auto-publishing checklist with Dave for implementation sign-off.

**Blockers:**
None

---

## image-designer

**Completed:**
- No activity in the 2026-05-12 00:00 UTC → 2026-05-13 00:00 UTC window.

**Next:**
- No open work detected.
- `image-prompts.json` files from writer for 2026-05-18 / 2026-05-20 / 2026-05-22 — hero + social images still required ahead of the 2026-05-18 publish slot.
- Hero/social images for `2026-05-15-derby-feel-good` still outstanding from the prior queue.

**Blockers:**
- Repo `.env` `GEMINI_API_KEY` rejection (carry-forward from 2026-05-06): agent fell back to `/content-studio/.env`. Repo key needs rotation/refresh before next autonomous run.
- `ffmpeg` on Dave's machine lacks `libwebp`; SKILL.md `-q:v` flag silently fails — `cwebp` workaround in place. SKILL update or `ffmpeg --with-libwebp` install pending.

---

## other-agents

**Completed:**
- PR #202 (`Trac/workflows n processes`, merged 2026-05-12 09:55 UTC) — human work by Trac, not agent-attributed.
- PR #204 (`standup(yon): 2026-05-13`, merged 2026-05-12 17:18 UTC) — Yon's check-in update; counted as a human check-in, not an autonomous agent.

**Next:**
- No open PRs across the repo as of 2026-05-13 07:00 Asia/Saigon.

**Blockers:**
None
