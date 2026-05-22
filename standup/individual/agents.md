date: 2026-05-22

---

## project-manager

**Completed:**
- PR #242: pm(standup-morning): 2026-05-21 — merged 2026-05-21 00:08 UTC (07:08 Asia/Saigon)
- PR #244: pm(standup-compile): 2026-05-21 — merged 2026-05-21 02:12 UTC (09:12 Asia/Saigon)

**Next:**
- This 07:00 morning trigger is in flight (`pm/standup-morning/2026-05-22`)
- 09:00 standup-compile run later this morning
- 17:00 EOD reminder later today

**Blockers:**
- Lark bot auth still failing (`[10014] app secret invalid`) — carrying forward from 2026-05-08 (now **22 consecutive working days**). App secret for App ID `cli_a95707d3b57a5eed` needs rotation in Lark Open Platform, `LARK_CHAT_ID` (`oc_e5fe68740864439744b3fb0f31f81040`) still missing from root `.env`, and `lark-cli` upgrade (1.0.10 → 1.0.23+) still pending. Dave owns rotation.

---

## brevo-manager

**Completed:**
- No activity in the 2026-05-21 00:00 UTC → 2026-05-22 00:00 UTC window.

**Next:**
- No open PRs.
- Phase 1 OCA warmup continues — Yon owns the daily 5-send sequence from `firepig@onlinechineseastrology.com`. Day 10 of the 21-day plan today (per Yon's last live check-in dated 2026-05-13, now 7 working days stale — confirm with Yon).
- 48h pre-flight previews fire at `brevo-preview-d0-batch1/2/3` on May 31 / Jun 1 / Jun 2 (21:00 Saigon) ahead of Jun 2–4 D-0 sends; Bridge preview Jun 7 21:00.
- `brevo-d0-decision-gate` Mon Jun 1 18:00 Saigon classifies warmup GREEN/YELLOW/RED.

**Blockers:**
None blocking — but Brevo MCP token sits in chat history and should be rotated at https://app.brevo.com/sso/account → SMTP & API → API Keys (carry-forward note from PR #203).

---

## web-developer

**Completed:**
- No activity in the 2026-05-21 00:00 UTC → 2026-05-22 00:00 UTC window.

**Next:**
- No open PRs.
- Per content calendar: 2026-05-18 publish slot now **4 days overdue**. Writer bundles for 2026-05-18 / 2026-05-20 / 2026-05-22 remain ready for hero image generation + page build. `2026-05-15-derby-feel-good` page build still outstanding from prior queue.

**Blockers:**
None — but blocked downstream on image-designer hero image generation.

---

## writer

**Completed:**
- No activity in the 2026-05-21 00:00 UTC → 2026-05-22 00:00 UTC window.

**Next:**
- No open PRs.
- Content calendar through end-of-May still has slots needing drafts beyond 2026-05-22.

**Blockers:**
None

---

## product-manager

**Completed:**
- No activity in the 2026-05-21 00:00 UTC → 2026-05-22 00:00 UTC window.
- _Note (in-window, human-authored):_ PR #243 `docs(readings-generator): stakeholder spec v0.1` merged 2026-05-21 00:50 UTC — human work by `yon-create`, covers readings-generator scope; PM agent has not yet generated its own derivative artefacts.

**Next:**
- Review auto-publishing checklist with Dave for implementation sign-off.
- Triage PR #243 readings-generator spec into a vertical-slice epic and follow-up `IMPLEMENTATION-PLAN.md`.

**Blockers:**
None

---

## image-designer

**Completed:**
- No activity in the 2026-05-21 00:00 UTC → 2026-05-22 00:00 UTC window.

**Next:**
- No open work detected.
- `image-prompts.json` files from writer for 2026-05-18 / 2026-05-20 / 2026-05-22 — hero + social images still required. 2026-05-18 publish slot is now 4 days overdue.
- Hero/social images for `2026-05-15-derby-feel-good` still outstanding from the prior queue.

**Blockers:**
- Repo `.env` `GEMINI_API_KEY` rejection (carry-forward from 2026-05-06): agent fell back to `/content-studio/.env`. Repo key needs rotation/refresh before next autonomous run.
- `ffmpeg` on Dave's machine lacks `libwebp`; SKILL.md `-q:v` flag silently fails — `cwebp` workaround in place. SKILL update or `ffmpeg --with-libwebp` install pending.

---

## other-agents

**Completed:**
- No autonomous agent activity in window beyond project-manager. PRs #241 (`fix(profile): save via API route…`), #243 (`docs(readings-generator): stakeholder spec v0.1`), and #245 (`feat(portal): quick-reading email tool`) are human/dev work by `yon-create`, not agent automation.

**Next:**
- Open PR #226 (`OCA D-0 results — DATA UNAVAILABLE`, yon-create, branch `oca-d0-results-2026-05-20`) — human-owned, still open, last updated 2026-05-20 02:02 UTC (~48h with no new activity).

**Blockers:**
None
