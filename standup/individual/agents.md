date: 2026-05-28

---

## project-manager

**Completed:**
- No agent activity in the 2026-05-27 00:00 UTC → 2026-05-28 00:00 UTC window. Last PM agent run was PR #344 `pm(standup-compile): 2026-05-26` (merged 2026-05-26 — Tuesday). No scheduled morning/EOD or compile runs landed on Wed 2026-05-27.

**Next:**
- This 07:00 morning trigger is in flight (`pm/standup-morning/2026-05-28`).
- 09:00 standup-compile run later this morning.
- 17:00 EOD reminder later today.

**Blockers:**
- Lark bot auth still failing (`[10014] app secret invalid`) — carrying forward from 2026-04-28 (now **25 consecutive working days**, including today). App secret for App ID `cli_a95707d3b57a5eed` needs rotation in Lark Open Platform; `LARK_CHAT_ID` (`oc_e5fe68740864439744b3fb0f31f81040`) still missing from root `.env`; `lark-cli` upgrade (1.0.10 → 1.0.23+) still pending. Dave owns rotation.

---

## brevo-manager

**Completed:**
- No activity in the 2026-05-27 00:00 UTC → 2026-05-28 00:00 UTC window.

**Next:**
- No open PRs.
- Phase 1 OCA warmup continues — Yon owns the daily 5-send sequence from `firepig@onlinechineseastrology.com`.
- 48h pre-flight previews fire at `brevo-preview-d0-batch1/2/3` on May 31 / Jun 1 / Jun 2 (21:00 Saigon) ahead of Jun 2–4 D-0 sends; Bridge preview Jun 7 21:00.
- `brevo-d0-decision-gate` Mon Jun 1 18:00 Saigon classifies warmup GREEN/YELLOW/RED.

**Blockers:**
None blocking — but Brevo MCP token sits in chat history and should be rotated at https://app.brevo.com/sso/account → SMTP & API → API Keys (carry-forward note from PR #203).

---

## web-developer

**Completed:**
- No activity in the 2026-05-27 00:00 UTC → 2026-05-28 00:00 UTC window.

**Next:**
- No open PRs.
- Backlog: writer bundles 2026-05-18 / 2026-05-20 / 2026-05-22 still awaiting hero image generation + page build. `2026-05-15-derby-feel-good` page build remains outstanding from the prior queue.

**Blockers:**
None — but blocked downstream on image-designer hero image generation.

---

## writer

**Completed:**
- No activity in the 2026-05-27 00:00 UTC → 2026-05-28 00:00 UTC window.

**Next:**
- No open PRs.
- Content calendar through end-of-May still has slots needing drafts beyond 2026-05-22.

**Blockers:**
None

---

## product-manager

**Completed:**
- No activity in the 2026-05-27 00:00 UTC → 2026-05-28 00:00 UTC window.
- _Note (in-window, human-authored):_ PR #346 `docs(engineering): add OCA email list validation reports (May 2026)` merged 2026-05-27 00:41 UTC — human work by `yon-create` / `Tiga Bait`. PM agent has not yet generated derivative artefacts from these reports.

**Next:**
- Triage PR #346 OCA email-list validation reports into any required follow-up tickets (warmup eligibility / suppression list updates).
- Carry-forward: triage readings-generator spec (PR #243) into a vertical-slice epic and follow-up `IMPLEMENTATION-PLAN.md`.

**Blockers:**
None

---

## image-designer

**Completed:**
- No activity in the 2026-05-27 00:00 UTC → 2026-05-28 00:00 UTC window.

**Next:**
- No open work detected.
- `image-prompts.json` files from writer for 2026-05-18 / 2026-05-20 / 2026-05-22 — hero + social images still required.
- Hero/social images for `2026-05-15-derby-feel-good` still outstanding from the prior queue.

**Blockers:**
- Repo `.env` `GEMINI_API_KEY` rejection (carry-forward from 2026-05-06): agent fell back to `/content-studio/.env`. Repo key needs rotation/refresh before next autonomous run.
- `ffmpeg` on Dave's machine lacks `libwebp`; SKILL.md `-q:v` flag silently fails — `cwebp` workaround in place. SKILL update or `ffmpeg --with-libwebp` install pending.

---

## other-agents

**Completed:**
- No autonomous agent activity in the 2026-05-27 00:00 UTC → 2026-05-28 00:00 UTC window. The only in-window commit (e09b0d7) and merge (PR #346) are human-authored (Tiga Bait / yon-create).

**Next:**
- No open PRs in the repo (`gh pr list --state open` returned empty at 07:00 Asia/Saigon on 2026-05-28).

**Blockers:**
None
