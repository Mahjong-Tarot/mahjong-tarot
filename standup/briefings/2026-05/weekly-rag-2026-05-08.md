# Weekly RAG Status Report — Week of May 4 – May 8, 2026
_Generated: Friday, May 8 2026 — 4:00 PM Asia/Saigon | Project Manager Agent_

---

## 🟢 GREEN — On Track

- **Strong content/agent shipping streak — 9 publish/agent PRs merged Mon → Fri.** Writer ran twice (PR #175 Week of 2026-05-11 love-and-compatibility content; PR #185 derby-week-2026-05-11 Kentucky Derby bundle with love-by-sign reschedule). Web-developer published two Mahjong Mirror posts (PR #174 "Opposites Attract Is a Lie", PR #186 Kentucky Derby Fire Horse year story, PR #189 "What the Favorites' Trainers Missed"). Image-designer shipped PR #188 hero + social images for 6 upcoming topics. Three publish topic bundles for derby week (5/11, 5/13, 5/15) staged with `STATUS: WRITTEN/DESIGNED`.
- **MailerLite Manager agent landed.** PR #170 merged Monday 2026-05-04 04:13 UTC after ~70h open — full agent definition + 3 skills, plus the OCA Reactivation May 2026 group already at 500/500 subscribers and 3 D-0 candidate drafts staged.
- **Vercel production stable.** All 7-day deployments showing `● Ready`, no failed builds or rollbacks. Latest production deploy 7h old via `dhajdu`. Live site: https://www.mahjongtarot.com.
- **Documentation reorganisation extended.** PR #176 docs/status refresh through 2026-05-05 (E5 50%→60%, E10 30%→45%); PR #191 consolidated `project-status.html` into `docs/`; direct commit `8f3b0cd` repriced Phase 1 epics — most features done.
- **Yon's first stretch of consistent check-ins this week.** Fresh files on 5/5 and 5/6 (refreshed via `yon-create` automation in PR #178 and PR #183). First time this has happened since Yon joined the daily roster.
- **No open PRs across the repo.** Inbox clean as of today's 09:00 compile.
- **Resend email channel resilient.** Daily standup compile + weekly RAG continue to recover via Resend HTTP API cURL fallback (200 OK every time); `npm install -g resend` permanently fails because the npm package is the JS SDK, not a CLI binary — proposal already in carry-forward to switch the trigger to curl-first.

---

## 🟡 AMBER — Needs Attention

| Item | Owner | Target Resolution |
|------|-------|-------------------|
| **Lark notification channel broken — 9th consecutive day** (`[10014] app secret invalid` for App ID `cli_a95707d3b57a5eed`). `LARK_CHAT_ID=oc_e5fe68740864439744b3fb0f31f81040` still missing from root `.env`; `lark-cli` upgrade (1.0.10 → 1.0.23+) still pending. Carry-forward from 28/29/30 April + 1/4/5/6/7/8 May. | Trac / Dave | 2026-05-11 |
| **Trac silent 15 days.** Check-in last refreshed 2026-04-23. No commits or PRs from `TracNg99` in the 4-week window; Lark blocker squarely in his scope and unresolved. Needs a 1-1 ping to confirm availability and ownership. | Dave | 2026-05-11 |
| **Dave check-in 10 days stale** (file dated 2026-04-28). Massive solo activity in git (manual docs sweeps, agent run merges, project-status work) is not reflected in `dave.md`. Same situation flagged daily 28 April → today. | Dave | 2026-05-11 |
| **Yon check-in went stale again** (last fresh 2026-05-06; today 2026-05-08 file is 2 days old). Email-provider evaluation outcome still unreported. Worth a follow-up ping. | Yon | 2026-05-11 |
| **Email-provider decision in flight.** Yon's research follows MailerLite pre-send ban + MailChimp cost; outcome could obsolete the just-merged MailerLite Manager agent (PR #170) and the OCA Reactivation 500-subscriber group + 3 staged D-0 drafts. Coordinate with Dave before any provider switch. | Yon → Dave | 2026-05-11 |
| **GEMINI_API_KEY rejected in repo `.env`.** Image-designer agent has been falling back to `/content-studio/.env` for two weeks. Carry-forward from 2026-05-05/06/07. Repo key needs rotation/refresh before next autonomous run. | Dave | 2026-05-11 |
| **`ffmpeg` lacks `libwebp` on Dave's machine.** SKILL.md `-q:v` flag silently fails; `cwebp` workaround in place. Either install `ffmpeg --with-libwebp` or update SKILL to make `cwebp` the default. | Dave / image-designer | 2026-05-11 |
| **Auto-publishing checklist sign-off — overdue.** Was on the previous RAG (target 2026-05-04). No progress recorded this week. | Dave | 2026-05-11 |
| **Khang still not in trigger roster.** Carry-forward since 30 April. Substantial bootstrap work has shipped under `khang-h-nguyen-te` historically; not in `agents/project-manager/context/triggers/2-standup-compile.md` Team table. | Dave / Trac | 2026-05-11 |

---

## 🔴 RED — Escalation Required

None this week. The Lark blocker is approaching the threshold but Resend continues to deliver every notification, so there is no comms loss yet.

---

## 📋 UPCOMING — Next 2 Weeks

| Milestone | Owner | Target |
|-----------|-------|--------|
| Publish: Derby Mirror (`2026-05-13-derby-mirror`) — `STATUS: WRITTEN/DESIGNED` | web-developer / Dave | 2026-05-13 |
| Publish: Derby Feel Good (`2026-05-15-derby-feel-good`) — `STATUS: WRITTEN/DESIGNED` | web-developer / Dave | 2026-05-15 |
| Writer agent run for week of 2026-05-18 (currently no drafts) | writer | Mon 2026-05-11 |
| Lark app-secret rotation + persist `LARK_CHAT_ID` into `.env` + `lark-cli` 1.0.10 → 1.0.23+ upgrade | Trac / Dave | 2026-05-11 |
| Trac 1-1 ping + work-status confirmation | Dave | 2026-05-11 |
| Email-provider decision (MailerLite replacement) + agent/scope realignment if needed | Yon → Dave | 2026-05-12 |
| GEMINI_API_KEY repo `.env` refresh | Dave | 2026-05-11 |
| Auto-publishing checklist sign-off (overdue) | Dave | 2026-05-11 |
| Add `khang-h-nguyen-te` to standup-compile trigger roster | Dave / Trac | 2026-05-11 |
| Switch standup-compile + weekly-rag triggers to curl-first for Resend (drop dead `resend` CLI step) | Trac / Dave | 2026-05-15 |
| Mahjong Mirror outreach kickoff — pending email-provider decision | Yon | 2026-05-15 |
| edge8.ai Resend domain verification (A-03) | Trac | TBD |

---

## ⚠️ TOP RISKS

| # | Risk | Probability | Impact | Mitigation |
|---|------|------------|--------|-----------|
| 1 | **Lark notification channel broken (9 days)** — every PM trigger silently fails the Lark step; team only sees email. Risk of complacency normalising the broken channel. | High | Medium | Rotate app secret for `cli_a95707d3b57a5eed` + persist `LARK_CHAT_ID` to `.env` + upgrade `lark-cli`. Resend HTTP fallback continues to deliver, so no comms loss yet — but this is now the longest-running open blocker. |
| 2 | **Trac silent 15 days** — Lark blocker unresolved within his scope; bootstrap-doc track stalled since 29 April. Without a 1-1 we cannot confirm availability or whether work has shifted owner. | High | Medium | Dave to ping Trac directly Monday; if unavailable, reassign Lark + bootstrap-doc work and remove `trac.md` from daily roster reminder until available. |
| 3 | **Email-provider switch could orphan MailerLite Manager agent** — PR #170 just landed (full agent + 3 skills) and the OCA Reactivation 500-subscriber group has 3 D-0 drafts staged. A switch away from MailerLite invalidates the agent's scope and the staged work. | Medium | Medium | Yon to coordinate with Dave before any switch; if a new provider is chosen, plan a single follow-up PR to rename/rescope the agent in lockstep with the cutover so the staged drafts can be ported. |
| 4 | **Stale check-in pattern is chronic** — Dave 10 days, Trac 15 days, Yon now 2 days again after a brief streak. Visibility into human work is git-diff-only most days, which is fine for Dave but blind for Yon and Trac. | Medium | Low-Medium | Either enforce a freshness gate at 09:00 compile (block compile until file dates match window) or simplify to a single-line check-in template. Decision overdue. |

---

## 🔔 DECISIONS NEEDED

| Decision | Decided By | Deadline |
|----------|-----------|----------|
| **Email-provider replacement for MailerLite** (and consequent fate of the MailerLite Manager agent + OCA 500-subscriber group + 3 staged D-0 drafts) | Yon → Dave to confirm | 2026-05-12 |
| **Trac ownership of Lark blocker** — confirm Trac is still on it, or reassign to Dave | Dave | 2026-05-11 |
| **Auto-publishing checklist sign-off** (overdue from previous RAG) | Dave | 2026-05-11 (re-overdue) |
| **Add `khang-h-nguyen-te` to standup-compile trigger Team roster** | Dave | 2026-05-11 |
| **Switch trigger Resend step to curl-first** (drop the dead `npm install -g resend` ladder rung) | Dave | 2026-05-15 |

---

## 🤖 Agent TODO — Week of 2026-05-11

- **project-manager**: Continue daily morning + compile triggers; monitor Lark step for first successful send post app-secret rotation. Prep next weekly RAG for 2026-05-15. Recommend dropping the dead `resend` CLI step from triggers.
- **writer**: Run the Monday content trigger for week of 2026-05-18 (no drafts staged yet beyond the derby bundle).
- **web-developer**: Publish Derby Mirror (2026-05-13) and Derby Feel Good (2026-05-15) from `content/topics/`. Both bundles are `STATUS: WRITTEN/DESIGNED`.
- **image-designer**: Hero/social images for any topics added by next writer run; contingent on `GEMINI_API_KEY` repo `.env` refresh.
- **product-manager**: Drive auto-publishing checklist sign-off with Dave (now twice overdue).

---

_End of report._

---

## 📡 Notification Status

- **Lark CLI**: ❌ Failed — `TAT API error: [10014] app secret invalid` on `lark-cli im +messages-send --as bot` for App ID `cli_a95707d3b57a5eed` (both `--markdown` and `--text` retried). 9th consecutive day of failure. Retry ladder exhausted: `lark-cli` 1.0.10 has no `whoami` subcommand; `auth list` reports "No logged-in users"; `auth login` is OAuth Device Flow (user-only — does not apply to `--as bot`); `auth token` subcommand does not exist; HTTP cURL fallback also depends on the rotated app secret to obtain a `tenant_access_token`. Outstanding: (1) rotate app secret in Lark Developer console + update macOS Keychain entry, (2) persist `LARK_CHAT_ID=oc_e5fe68740864439744b3fb0f31f81040` to root `.env`, (3) upgrade `lark-cli` 1.0.10 → 1.0.23+.
- **Resend email**: ✅ Sent — `id d9184020-95d6-4e8a-9210-9e3feb0390a7` to dave@edge8.ai, yon@edge8.ai, trac.nguyen@edge8.ai. Sent via cURL direct to `https://api.resend.com/emails` (ladder step 3) because the `resend` shell command is not on the PATH (npm `resend` package is the JS SDK, not a CLI binary). One additional note for the trigger: the Python `urllib` HTTP path returned a Cloudflare 403 (`error code: 1010`) on first attempt — likely a UA-based block — so the curl fallback is the only reliable HTTP path for now. Worth updating the trigger to use curl-first.
