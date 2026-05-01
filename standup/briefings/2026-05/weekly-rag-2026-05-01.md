# Weekly RAG Status Report — Week of April 27 – May 1, 2026
_Generated: Friday, May 1 2026 — 4:00 PM Asia/Saigon | Project Manager Agent_

---

## 🟢 GREEN — On Track

- **Massive product delivery week from Dave** — 14+ feature PRs merged in 5 days. Monday alone shipped 8 majors: Clerk auth scaffold (later swapped to Supabase Auth), Purple Star (Zi Wei Dou Shu) reading (PR #140), Year of the Fire Horse 2026 interactive forecast (PR #141), Daily Horoscopes + Tong Shu Almanac (PR #142, +71,572 LoC, 354 days seeded, extended through 2032), Three Blessings reading (PR #143), profile dropdown + personal readings (PR #144), member-shell nav lock + daily-horoscope route (PR #145), and the Writer agent's full May-4 content bundle (PR #146).
- **E1 Home Almanac + E2 "Find a Good Day" funnel both shipped** — Wednesday 2026-04-29: E1 home almanac hero (PR #158), full E2 public Find-a-Good-Day pages with shareable URLs, why-this-date-scores explanation, share affordances and analytics events (PR #160). Both epics now live in production.
- **Documentation reorganisation complete** — `architecture/` → `docs/` tree migration landed (PR #159, +297,705 / -2,092 LoC) plus agents.md surfaced in project-status dashboard.
- **Vercel production stable** — All 7-day production deployments showing `● Ready`, no failed builds or rollbacks in window. Latest production deploy 7h old via `dhajdu`. Live site: https://www.mahjongtarot.com.
- **Content pipeline operational** — Writer agent ran successfully Mon 2026-04-27: PR #146 "Writer: Week of 2026-05-04" — full blog/SEO/social bundle (Love and Compatibility, May 4 / 6 / 8). 1,111-line bundle queued for publish.
- **Mahjong Mirror form polish** — Yon shipped PRs #138 and #139 (Preferred Format select styling — background, text, border).
- **Bootstrap docs progressing** — Trac shipped P1 global machine setup plan (`239b38a`, +1,515 LoC). Khang shipped PR #153 P2 discovery improvements (+696 / -4 LoC).
- **Resend email channel resilient** — Daily standup compile recovered via Resend HTTP API cURL fallback after `resend` CLI binary not found; 200 OK delivery confirmed to all three team emails.

---

## 🟡 AMBER — Needs Attention

| Item | Owner | Target Resolution |
|------|-------|-------------------|
| Lark notification channel broken — `[10014] app secret invalid` for App ID `cli_a95707d3b57a5eed` blocks every PM automation; recurring 5 consecutive days (2026-04-27 through 2026-05-01). `LARK_CHAT_ID=oc_e5fe68740864439744b3fb0f31f81040` also still missing from root `.env` | Trac / Dave | 2026-05-04 |
| Three human check-ins stale — Dave (2026-04-28, 3 days), Yon (2026-04-29, 2 days), Trac (2026-04-23, 8 days). Carried over since 2026-04-28 briefing. Yesterday's E1/E2/docs ship still not logged in `dave.md` | each individual | 2026-05-04 |
| Bootstrap docs ownership ambiguity — Khang's PR #153 (p2 discovery) and Trac's `239b38a` (P1 global machine plan) both shipped 2026-04-29 on the same bootstrap track without explicit ownership decision | Dave | 2026-05-04 |
| Khang not in trigger roster — substantial work shipping under `khang-h-nguyen-te` but not in `agents/project-manager/context/triggers/2-standup-compile.md` Team table; recommendation carried over since 2026-04-30 | Dave / Trac | 2026-05-04 |
| Open file conflict — PR #164 `Standup: 2026-05-01` (yon-create) modifies the same briefing file the PM compile (PR #165) already wrote and merged. PR #164 still OPEN | Dave / Yon | 2026-05-01 (today) |
| Auto-publishing checklist sign-off (target was 2026-05-01) | Dave | Overdue — resolve 2026-05-04 |
| Mahjong Mirror outreach kickoff (was scheduled "Week of 2026-04-28") — no commits or comms surfaced | Yon | 2026-05-04 |

---

## 🔴 RED — Escalation Required

None this week.

---

## 📋 UPCOMING — Next 2 Weeks

| Milestone | Owner | Target |
|-----------|-------|--------|
| Lark app-secret rotation + persist `LARK_CHAT_ID` into `.env` | Trac / Dave | 2026-05-04 |
| Bootstrap docs ownership decision (Trac vs Khang) | Dave | 2026-05-04 |
| Add Khang to standup-compile trigger roster | Dave / Trac | 2026-05-04 |
| Auto-publishing checklist sign-off (overdue) | Dave | 2026-05-04 |
| Mahjong Mirror outreach kickoff — pick CSV-with-EU-flag vs CAN-SPAM Sequence D path | Yon | 2026-05-05 |
| MailerLite DNS verification end-to-end confirmation | Yon | 2026-05-04 |
| EO onboarding (Alex + Tam) onto Claude | Yon | Week of 2026-05-04 |
| Publish Love-and-Compatibility blog series (May 4 / 6 / 8) — web-developer build-page + ship | web-developer / Dave | 2026-05-04 → 2026-05-08 |
| E2 "Find a Good Day" production monitoring & analytics review (just shipped 2026-04-29) | Dave | Rolling, week of 2026-05-04 |
| Two-way Lark channel (Lark → Claude Code) first test | Trac | TBD |
| edge8.ai Resend domain verification (A-03) | Trac | TBD |

---

## ⚠️ TOP RISKS

| # | Risk | Probability | Impact | Mitigation |
|---|------|------------|--------|-----------|
| 1 | Lark notification channel broken (5+ days) — every PM trigger silently fails the Lark step; team only sees email | High | Medium | Rotate app secret for `cli_a95707d3b57a5eed` + persist `LARK_CHAT_ID` into root `.env`. Resend HTTP fallback continues to deliver in the meantime, so no comms loss yet |
| 2 | Stale human check-ins (chronic) — 4 consecutive compile days with at least one stale file; visibility into Yon and Trac is now git-diff-only | High | Low-Medium | Morning reminder is firing but not acting — consider a weekly enforcement gate (e.g. block standup-compile until file dates match window) or a simplified single-line check-in template |
| 3 | Bootstrap track ownership ambiguity (Trac vs Khang) — overlapping commits 2026-04-29 without an explicit owner creates duplication risk and slows P0/P1/P2 progression | Medium | Medium | Dave to assign single owner Monday morning; document in `decisions.md` |

---

## 🔔 DECISIONS NEEDED

| Decision | Decided By | Deadline |
|----------|-----------|----------|
| Bootstrap docs single owner (Trac or Khang) — close PR #153/`239b38a` overlap | Dave | 2026-05-04 |
| Add `khang-h-nguyen-te` to standup-compile trigger Team roster | Dave | 2026-05-04 |
| Auto-publishing checklist sign-off | Dave | 2026-05-04 (overdue) |
| Mahjong Mirror outreach path — CSV-with-EU-flag (Bill) vs CAN-SPAM Sequence D footer first | Yon → Dave to confirm | 2026-05-05 |
| Resolve PR #164 (close — superseded by PR #165) | Dave or Yon | 2026-05-01 (today) |

---

## 🤖 Agent TODO — Week of 2026-05-04

- **project-manager**: Continue daily morning + compile triggers; monitor Lark step for first successful send post app-secret rotation; prep next weekly RAG for 2026-05-08.
- **writer**: No open work — next scheduled run produces content for week of 2026-05-11.
- **web-developer**: Process the Love-and-Compatibility content bundle from `content/topics/` (PR #146 source) into `website/pages/blog/posts/` for May 4 / 6 / 8 publish dates.
- **image-designer**: No active work — standby for hero image briefs from web-developer build-page runs.
- **product-manager**: Drive auto-publishing checklist sign-off with Dave (overdue).

---

_End of report._

---

## 📡 Notification Status

- **Lark CLI**: ❌ Failed — `TAT API error: [10014] app secret invalid` on `lark-cli im +messages-send --as bot` for App ID `cli_a95707d3b57a5eed` (both `--markdown` and `--text` retried). Same root cause as 2026-04-27 through 2026-04-30. Retry ladder exhausted — `lark-cli` does not expose a `whoami` subcommand; `auth status` confirms bot identity is wired but the secret on file is invalid; HTTP fallback also depends on the rotated secret. App secret rotation for `cli_a95707d3b57a5eed` and persisting `LARK_CHAT_ID=oc_e5fe68740864439744b3fb0f31f81040` into root `.env` remain outstanding actions for Trac/Dave.
- **Resend email**: ✅ Sent — `resend` CLI not present, recovered via Resend HTTP API cURL fallback (option 3 of the retry ladder); HTTP 200; message id `6102c4eb-16d0-43ce-9609-b4150d116090`. Recipients: `dave@edge8.ai`, `yon@edge8.ai`, `trac.nguyen@edge8.ai`. Subject: `Weekly Status Report — Week of April 27 – May 1, 2026`.
