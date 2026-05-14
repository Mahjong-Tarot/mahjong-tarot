date: 2026-05-14

---

## project-manager

**Completed:**
- PR #205: pm(standup-morning): 2026-05-13 — merged 2026-05-13 00:07 UTC (07:07 Asia/Saigon)
- PR #206: pm(standup-compile): 2026-05-13 — merged 2026-05-13 02:10 UTC (09:10 Asia/Saigon)

**Next:**
- This 07:00 morning trigger is in flight (`pm/standup-morning/2026-05-14`)
- 09:00 standup-compile run later this morning

**Blockers:**
- Lark bot auth still failing (`[10014] app secret invalid`) — carrying forward from 2026-05-08 (now 14 consecutive working days). App secret for App ID `cli_a95707d3b57a5eed` needs rotation, `LARK_CHAT_ID` (`oc_e5fe68740864439744b3fb0f31f81040`) still missing from root `.env`, and `lark-cli` upgrade (1.0.10 → 1.0.23+) still pending.

---

## brevo-manager

**Completed:**
- No activity in the 2026-05-13 00:00 UTC → 2026-05-14 00:00 UTC window. (PR #203 — Sequence D dual-domain plan + warmup automation — landed 2026-05-12 17:10 UTC and is reflected in yesterday's briefing.)

**Next:**
- No open PRs.
- Phase 1 OCA warmup continues today — Yon owns the daily 5-send sequence from `firepig@onlinechineseastrology.com`.
- 48h pre-flight previews fire at `brevo-preview-d0-batch1/2/3` on May 31 / Jun 1 / Jun 2 (21:00 Saigon) ahead of Jun 2-4 D-0 sends; Bridge preview Jun 7 21:00.
- `brevo-d0-decision-gate` Mon Jun 1 18:00 Saigon classifies warmup GREEN/YELLOW/RED.

**Blockers:**
None blocking — but Brevo MCP token sits in chat history and should be rotated at https://app.brevo.com/sso/account → SMTP & API → API Keys (carry-forward note from PR #203).

---

## web-developer

**Completed:**
- No activity in the 2026-05-13 00:00 UTC → 2026-05-14 00:00 UTC window.

**Next:**
- No open PRs.
- Per content calendar: writer bundles for 2026-05-18 / 2026-05-20 / 2026-05-22 remain ready for hero image generation + page build. `2026-05-15-derby-feel-good` page build still outstanding.

**Blockers:**
None

---

## writer

**Completed:**
- No activity in the 2026-05-13 00:00 UTC → 2026-05-14 00:00 UTC window.

**Next:**
- No open PRs.
- Content calendar through end-of-May still has slots needing drafts beyond 2026-05-22.

**Blockers:**
None

---

## product-manager

**Completed:**
- No activity in the 2026-05-13 00:00 UTC → 2026-05-14 00:00 UTC window.

**Next:**
- Review auto-publishing checklist with Dave for implementation sign-off.

**Blockers:**
None

---

## image-designer

**Completed:**
- No activity in the 2026-05-13 00:00 UTC → 2026-05-14 00:00 UTC window.

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
- No autonomous agent activity in window beyond project-manager.

**Next:**
- No open PRs across the repo as of 2026-05-14 07:00 Asia/Saigon.

**Blockers:**
None
