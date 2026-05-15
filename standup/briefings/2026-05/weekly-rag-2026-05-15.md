# Weekly RAG Status Report — Week of May 11 – May 15, 2026
_Generated: Friday, May 15 2026 — 4:00 PM Asia/Saigon | Project Manager Agent_

---

## 🟢 GREEN — On Track

- **Sequence D / Mahjong Mirror launch infrastructure fully landed.** Yon's PR #203 (`brevo-manager: implement Sequence D dual-domain plan + warmup automation`, merged Mon 2026-05-12 17:10 UTC) shipped the full end-to-end plan: Brevo MCP wired (282 tools after IPv6 whitelist fix — new IPs `2405:4802:980f:a090::/64` + `118.68.21.204`); dual-domain reputation strategy (D-0 from sacrificial `firepig@onlinechineseastrology.com`, D-1+ from pristine `firepig@mahjongtarot.com`); sender id 3 verified; `mahjongtarot.com` authenticated via Vercel DNS (DKIM `brevo1/brevo2`, DMARC `p=none`, brevo-code TXT, merged SPF); D-0 campaigns rescheduled May 19-21 → **Jun 2-4 14:00Z** and re-suspended pending decision gate; Bridge campaign 4 drafted; new canonical docs at `agents/brevo-manager/context/` (`sequence-d-plan.md`, `warmup-checklist.md`, `warmup-templates.md`, `send-log.md`); 48h preview hard rule added to persona §7; full scheduled-task suite queued (`firepig-warmup-daily`, `brevo-preview-d0-batch1/2/3`, `brevo-preview-bridge`, `brevo-d0-decision-gate`).
- **Phase 1 OCA warmup live.** Yon is executing the daily 5-send sequence from `firepig@onlinechineseastrology.com` from Wed 2026-05-13 onwards. Reciprocity-loop (same-day replies) and Gmail / Yahoo / Outlook / iCloud recipient curation underway.
- **Trac bootstrap-docs back on the board after silence.** PR #202 (`Trac/workflows n processes`, +5,487 / −1,282, merged 2026-05-12 09:55 UTC) shipped `docs(bootstrap): add infiniteleverage-init skill with Phase 1/2 guides, 18 Protocols integration, smart resume paths`. Largest single PR of the week and directionally on theme with his last stated focus.
- **Writer bundles for week of 2026-05-18 staged.** PR #200 (Mon 2026-05-11 18:23 UTC) delivered three weekly bundles — `2026-05-18-horse-love-signs`, `2026-05-20-mirror-love-signs`, `2026-05-22-feel-good-love` (each with blog, SEO, FB/IG EN+VN, `image-prompts.json`). Ready for image-designer + web-developer.
- **Vercel production stable.** All 7-day deployments `● Ready` (production + preview), no failed builds, no rollbacks. Latest production deploy 7h old via `dhajdu`. Live site healthy at https://www.mahjongtarot.com.
- **Resend email channel resilient.** 100% delivery via cURL fallback every morning + compile + weekly RAG this week (HTTP 200 every send). curl-first migration of the trigger spec still recommended.
- **No open PRs across the repo** as of Friday 09:00 Asia/Saigon — clean inbox into the weekend.

---

## 🟡 AMBER — Needs Attention

| Item | Owner | Target Resolution |
|------|-------|-------------------|
| **`2026-05-15-derby-feel-good` publish slot missed.** Today is the calendar publish date; bundle is `STATUS: WRITTEN/DESIGNED` but no hero images generated and no web-developer build. Same item flagged on the 2026-05-08 RAG; second consecutive week the publish slot has slipped. | web-developer / image-designer / Dave | 2026-05-18 |
| **Trac silent on check-ins for 20 working days.** `standup/individual/trac.md` last refreshed 2026-04-23. PR #202 shipped silently 2026-05-12 — significant work not narrated in check-in. 1-1 ping outstanding from prior RAG (target 2026-05-11). | Dave | 2026-05-18 |
| **Dave check-in 17 days stale** (file dated 2026-04-28). Carry-forward from prior RAG (target 2026-05-11) — not refreshed. No visibility into Mahjong Tarot redesign progress, EO Forum follow-ups, Linh Thai outcomes, or agent walkthrough with Yon. | Dave | 2026-05-18 |
| **GEMINI_API_KEY repo `.env` still rejected.** Image-designer agent continues to fall back to `/content-studio/.env`. Carry-forward from 2026-05-06 / 5-week-old blocker. Repo key rotation/refresh needed before next autonomous image run — and blocks `2026-05-15-derby-feel-good` and 5/18-5/22 hero/social generation. | Dave | 2026-05-18 |
| **`ffmpeg` lacks `libwebp` on Dave's machine.** SKILL.md `-q:v` flag silently fails; `cwebp` workaround in place. Either install `ffmpeg --with-libwebp` or update SKILL to make `cwebp` the default. Carry-forward 9+ days. | Dave / image-designer | 2026-05-18 |
| **Brevo MCP token sits in chat history.** Carry-forward from PR #203. Rotate at https://app.brevo.com/sso/account → SMTP & API → API Keys before next external coordination. | Yon | 2026-05-18 |
| **`resend` CLI step still in PM triggers but non-functional.** npm `resend` package is the JS SDK, not a CLI binary (v6.12.3); every PM run exits 127 then falls back to cURL. Codify cURL as primary in the trigger spec to drop the dead ladder rung. Decision overdue (RAG target 2026-05-15). | Trac / Dave | 2026-05-18 |
| **Khang still not in trigger Team roster** despite PR #196 / #197 work (email marketer agent + template fix, 2026-05-10). Carry-forward from 30 April. | Dave / Trac | 2026-05-18 |
| **Auto-publishing checklist sign-off twice overdue** (prior RAG targets 2026-05-04 and 2026-05-11). No progress recorded this week. | Dave | 2026-05-18 |

---

## 🔴 RED — Escalation Required

| Item | Impact | Immediate Action |
|------|--------|------------------|
| **Lark notification channel broken — 15 consecutive working days** (28/29/30 Apr + 1/4/5/6/7/8/11/12/13/14/15 May). `[10014] app secret invalid` for App ID `cli_a95707d3b57a5eed`. Three sub-actions still pending: (1) rotate app secret in Lark Open Platform + re-run `lark-cli auth login --as bot`; (2) persist `LARK_CHAT_ID=oc_e5fe68740864439744b3fb0f31f81040` to root `.env`; (3) upgrade `lark-cli` 1.0.10 → 1.0.23+ (needed for `whoami` / `auth token --as bot` retry-ladder steps). | Resend continues to carry every notification, so no comms loss — but the channel is now functionally dark and the team is normalising it. The decision-gate notifications around the Jun 1 D-0 unsuspend will need a working channel. | **Dave to rotate the app secret today**; if Trac is the owner, Dave to confirm or formally reassign. Promoted from AMBER (9 days on 2026-05-08 RAG) — escalating now because we have 17 days until the D-0 decision gate (Jun 1) and the warmup-daily / preview tasks depend on a reliable broadcast channel. |

---

## 📋 UPCOMING — Next 2 Weeks

| Milestone | Owner | Target |
|-----------|-------|--------|
| Publish: Derby Feel Good (`2026-05-15-derby-feel-good`) — missed today, pull into Mon | web-developer / image-designer | 2026-05-18 |
| Hero + social images for 2026-05-18 / 5-20 / 5-22 bundles | image-designer | 2026-05-17 |
| Publish: `2026-05-18-horse-love-signs` | web-developer | 2026-05-18 |
| Publish: `2026-05-20-mirror-love-signs` | web-developer | 2026-05-20 |
| Publish: `2026-05-22-feel-good-love` | web-developer | 2026-05-22 |
| Writer Monday content trigger for week of 2026-05-25 | writer | 2026-05-18 |
| Lark app-secret rotation + `.env` `LARK_CHAT_ID` persistence + `lark-cli` upgrade | Dave (was Trac) | 2026-05-18 |
| Trac 1-1 ping + work-status confirmation | Dave | 2026-05-18 |
| Phase 1 OCA warmup daily 5-send sequence (continues through Jun 8) | Yon | daily |
| `brevo-preview-d0-batch1` 48h pre-flight test-send | brevo-manager | 2026-05-31 21:00 Saigon |
| `brevo-preview-d0-batch2` 48h pre-flight test-send | brevo-manager | 2026-06-01 21:00 Saigon |
| `brevo-d0-decision-gate` — classify warmup GREEN / YELLOW / RED, unsuspend or push +14d | Yon / Dave | 2026-06-01 18:00 Saigon |
| `brevo-preview-d0-batch3` 48h pre-flight test-send | brevo-manager | 2026-06-02 21:00 Saigon |
| D-0 reactivation campaigns Batch 1 (if gate is GREEN/YELLOW) | brevo-manager | 2026-06-02 14:00Z |
| D-0 reactivation campaigns Batch 2 | brevo-manager | 2026-06-03 14:00Z |
| D-0 reactivation campaigns Batch 3 | brevo-manager | 2026-06-04 14:00Z |
| `brevo-preview-bridge` 48h pre-flight | brevo-manager | 2026-06-07 21:00 Saigon |
| GEMINI_API_KEY repo `.env` refresh | Dave | 2026-05-18 |
| Switch standup-compile + weekly-rag triggers to curl-first for Resend | Dave / Trac | 2026-05-22 |
| Auto-publishing checklist sign-off (twice overdue) | Dave | 2026-05-18 |
| edge8.ai Resend domain verification (A-03) | Trac | TBD |

---

## ⚠️ TOP RISKS

| # | Risk | Probability | Impact | Mitigation |
|---|------|------------|--------|-----------|
| 1 | **D-0 reactivation campaigns (Jun 2-4) launch with no working broadcast channel.** Decision-gate go/no-go classification on Jun 1 18:00 Saigon needs the team to see it in real time; Lark is dark and Resend is the only path. If Resend cURL hits an outage or Cloudflare-1010 block (we already saw urllib hit 1010 last week), there is no fallback. | Medium | High | Rotate Lark app secret this week so we have two-channel notification before the Jun 1 gate. Pin curl-first Resend as primary in trigger spec. Consider a third channel (Slack webhook or email-only personal sends) as backup. |
| 2 | **Image-designer pipeline blocked by GEMINI_API_KEY rejection — 9+ days.** Already cost the `2026-05-15-derby-feel-good` publish slot today; will block 5/18 / 5/20 / 5/22 if not refreshed by Monday. Three publish slots at risk in seven days. | High | Medium | Dave to rotate/refresh the repo key Monday morning before the 5/18 publish window. If still blocked, fall back permanently to `/content-studio/.env` and document the resolution. |
| 3 | **Trac silent 20 working days; Lark ownership ambiguous.** Lark blocker has been "Trac's" for three weeks but no commits, no check-ins, no resolution. Phase-2 bootstrap-doc track shipped silently in PR #202 — direction is unclear. | High | Medium | Dave to message Trac directly Monday: (a) confirm availability and capacity, (b) confirm or reassign Lark blocker. If unavailable, remove `trac.md` from daily roster, reassign Lark to Dave, and rebalance bootstrap-doc track. |
| 4 | **MailerLite Manager agent now likely obsolete.** Yon's Sequence D plan moves the OCA reactivation work to Brevo (PR #203). The MailerLite Manager agent (PR #170, landed 2026-05-04) plus the 500-subscriber OCA group + 3 staged D-0 drafts on MailerLite are now orphaned. | High | Low-Medium | Yon + Dave to confirm MailerLite scope is fully retired this sprint; plan a follow-up PR to rename / rescope or archive the MailerLite Manager agent. Stop further work on the staged MailerLite D-0 drafts. |
| 5 | **Stale check-in pattern chronic** — Dave 17 days, Trac 20 days, Yon 2 days. Only the `yon-create` automated flow keeps any signal flowing. Without check-ins, daily git-vs-reported reconciliation is one-sided. | Medium | Low-Medium | Either enforce a freshness gate at 09:00 compile (block until file dates match window) or simplify to a single-line check-in template. Decision now twice-overdue. |

---

## 🔔 DECISIONS NEEDED

| Decision | Decided By | Deadline |
|----------|-----------|----------|
| **Lark blocker ownership** — confirm Trac is still on it, or formally reassign to Dave. Promoted to RED this week; can't sit ambiguous another sprint. | Dave | 2026-05-18 |
| **MailerLite Manager agent fate post-Sequence-D pivot** — rename/rescope to Brevo Manager scope, or archive the agent + staged OCA drafts. Currently orphaned by PR #203. | Yon → Dave | 2026-05-18 |
| **Add `khang-h-nguyen-te` to trigger Team roster** so PR #196 / #197 author attribution flows into daily compile. Carry-forward since 30 April. | Dave | 2026-05-18 |
| **Switch trigger Resend step to curl-first** (drop dead `npm install -g resend` ladder rung). Twice overdue. | Dave | 2026-05-22 |
| **Auto-publishing checklist sign-off** — overdue since 2026-05-04. | Dave | 2026-05-18 |
| **Check-in freshness gate or simplification** — chronic staleness needs either enforcement or template simplification. | Dave | 2026-05-22 |
| **D-0 reactivation go/no-go** — Jun 1 18:00 Saigon decision gate based on Phase 1 warmup classification (GREEN / YELLOW / RED). Will be made on the day; flagged here so it is on the radar. | Yon → Dave | 2026-06-01 18:00 |

---

## 🤖 Agent TODO — Week of 2026-05-18

- **project-manager**: Continue daily morning + compile triggers. Monitor Lark step for first successful send post app-secret rotation. Prep next weekly RAG for 2026-05-22. Drop the dead `resend` CLI step from triggers once Dave signs off.
- **writer**: Run the Monday content trigger for week of 2026-05-25 (no drafts staged beyond 2026-05-22).
- **web-developer**: Publish `2026-05-15-derby-feel-good` (missed slot) + the three 5/18 / 5/20 / 5/22 bundles. All four are blocked on hero-image generation — coordinate with image-designer.
- **image-designer**: Generate hero + social images for `2026-05-15-derby-feel-good` and all three 2026-05-18 / 5-20 / 5-22 bundles **once `GEMINI_API_KEY` is refreshed**. Push for the `.env` refresh first thing Monday.
- **brevo-manager**: 48h pre-flight tasks (`brevo-preview-d0-batch1` 5/31 21:00, `brevo-preview-d0-batch2` 6/1 21:00, `brevo-preview-d0-batch3` 6/2 21:00, `brevo-preview-bridge` 6/7 21:00) are queued and self-firing. Decision gate `brevo-d0-decision-gate` Mon 6/1 18:00 Saigon. No action this week beyond Yon's daily warmup sends.
- **product-manager**: Drive auto-publishing checklist sign-off with Dave (now three times overdue).

---

_End of report._

---

## 📡 Notification Status

- **Lark CLI**: ❌ Failed — `TAT API error: [10014] app secret invalid` on `lark-cli im +messages-send --as bot` for App ID `cli_a95707d3b57a5eed`. Both `--markdown` and `--text` retried. Retry ladder cannot be fully executed: `lark-cli` 1.0.10 has no `whoami` subcommand; `auth list` reports "No logged-in users"; HTTP cURL fallback also depends on the same rotated app secret to obtain a `tenant_access_token`. **15th consecutive working-day failure** (28/29/30 Apr + 1/4/5/6/7/8/11/12/13/14/15 May). Promoted to RED above. Outstanding: rotate app secret, persist `LARK_CHAT_ID=oc_e5fe68740864439744b3fb0f31f81040` to root `.env`, upgrade `lark-cli` 1.0.10 → 1.0.23+.
- **Resend email**: ✅ Sent — HTTP 200, id `a7add2ad-4634-45dc-89a1-3cefd06464cf`. Recipients: `dave@edge8.ai`, `yon@edge8.ai`, `trac.nguyen@edge8.ai`, `khang.h.nguyen@edge8.ai`. Sent from `mahjong-pm@davehajdu.com` via cURL fallback (Resend CLI not installed on host — `resend emails send` exits 127). Worth codifying cURL as primary in the trigger spec.
