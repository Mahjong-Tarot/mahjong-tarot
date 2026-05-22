# Weekly RAG Status Report — Week of May 18 – May 22, 2026
_Generated: Friday, May 22 2026 — 4:00 PM Asia/Saigon | Project Manager Agent_

---

## 🟢 GREEN — On Track

- **Astrologer-portal epic shipped end-to-end this week.** Yon merged 19 PRs across the portal vertical: foundation + admin gate (PR #217), shell (PR #218 via Tiga), supabase-client fix (PR #219 via Tiga), clients/sessions/reports + CRUD (PR #220), upcoming-clients dashboard (PR #223), Krisp meeting-source abstraction (PR #224), sessions redesign (PR #229), manual transcript + report textarea (PR #230), send-report-by-email + subscription CTA (PR #231), admin conversions dashboard (PR #232), a tight stabilisation loop on supabase save hangs (PRs #233/#234/#236/#237), report-CTA → Mahjong Mirror (PR #238), SubscriptionIcon on clients list/profile (PR #239), portal user guide v1.0 (PR #240), profile API-route fix (PR #241), readings-generator stakeholder spec v0.1 (PR #243), and the brand-new portal quick-reading email tool (PR #245). Net +5,500 / -150 LOC of in-product astrologer flow plus full user docs.
- **Vercel production stable across the week.** 19 of 20 most-recent deployments `● Ready` (production + preview); one Production deploy `Canceled` 1d ago and immediately superseded by a `● Ready` build seconds later (`dhajdu`). Live site healthy at https://www.mahjongtarot.com. No failed builds, no rollbacks.
- **PM agent daily cadence intact.** Morning brief (07:00 Saigon) and compile brief (09:00 Saigon) ran every working day Mon → Fri. Weekly RAG (this run) is on time. PR #s 212, 213, 214, 215, 225, 227, 242, 244 — all merged on schedule.
- **Resend email channel 100% delivery every day** via cURL HTTP fallback. Every compile + this RAG sends out HTTP 200; recipient list `dave@edge8.ai`, `yon@edge8.ai`, `trac.nguyen@edge8.ai`, `khang.h.nguyen@edge8.ai`.
- **Readings-generator stakeholder spec v0.1 landed** (PR #243). Adds `docs/features/readings-generator/SPEC.md` + `STAKEHOLDER-REVIEW.md` — first concrete framing of the readings-generator scope; ready for PM triage into the active epic backlog.
- **Tiga (`lsu@Tigas-MacBook-Pro.local`, "Tiga Bait") collaborating on portal stabilisation.** Two productive commits in PRs #218 and #219 (portal shell + supabase-client fix) merged via Dave. External contributor signal — needs formalisation (see AMBER).

---

## 🟡 AMBER — Needs Attention

| Item | Owner | Target Resolution |
|------|-------|-------------------|
| **Content pipeline catastrophically backlogged — six posts now waiting.** `2026-05-15-derby-feel-good` (page build outstanding from 2x prior RAGs), `2026-05-18-horse-love-signs` (5 days overdue), `2026-05-20-mirror-love-signs` (3 days overdue), `2026-05-22-feel-good-love` (today's slot). All writer drafts ready in `content/topics/`; blocked on image-designer hero generation; image-designer blocked on `GEMINI_API_KEY` repo rotation (carry-forward 16+ days from 2026-05-06). Same blocker, third consecutive RAG. | Dave (key rotation) → image-designer → web-developer | 2026-05-25 |
| **Yon check-in stale 7 working days** (`yon.md` dated 2026-05-13) despite shipping ~5,500 LOC of portal scope this week. OCA Phase 1 warmup status (today should be Day 9 of the 21-day plan, Jun 8 finish) entirely opaque. With D-0 decision gate 10 calendar days away, lack of warmup-cadence confirmation is the biggest visibility gap. | Yon (file refresh) / Dave (1-1 confirm) | 2026-05-25 |
| **Dave check-in stale 18 working days** (file dated 2026-04-28). Carry-forward from prior 2 RAGs. No visibility into Mahjong Tarot redesign progress, EO Forum follow-ups, Linh Thai outcomes, or agent walkthrough with Yon. Approving portal PRs visibly but personal-work cadence dark. | Dave | 2026-05-25 |
| **GEMINI_API_KEY repo `.env` still rejected.** Image-designer agent continues to fall back to `/content-studio/.env`. Carry-forward 16+ days. Blocks the four-post publish backlog above. | Dave | 2026-05-25 |
| **`ffmpeg` lacks `libwebp` on Dave's machine.** SKILL.md `-q:v` flag silently fails; `cwebp` workaround in place. Either install `ffmpeg --with-libwebp` or update SKILL to make `cwebp` the default. Carry-forward 16+ days. | Dave / image-designer | 2026-05-25 |
| **Brevo MCP token sits in chat history.** Carry-forward from PR #203 (2x prior RAGs). Rotate at https://app.brevo.com/sso/account → SMTP & API → API Keys before D-0 sends. | Yon | 2026-05-26 |
| **`resend` CLI step still in PM triggers but non-functional.** npm `resend` package is the JS SDK, not a CLI binary; every PM run exits 127 then falls back to cURL. Codify cURL as primary in trigger spec. Decision now **thrice overdue** (RAG targets 2026-05-15, 2026-05-22). | Trac / Dave | 2026-05-25 |
| **Khang still not in trigger Team roster** despite PR #196 / #197 work (email marketer agent + template fix, 2026-05-10). Now ~4 weeks carried; Khang receives compile emails but cannot be attributed in git-mismatch step. | Dave / Trac | 2026-05-25 |
| **Auto-publishing checklist sign-off — three times overdue** (prior RAG targets 2026-05-04, 2026-05-11, 2026-05-18). No progress recorded this week. | Dave | 2026-05-25 |
| **PR #226 (`OCA D-0 results — DATA UNAVAILABLE`) still open as DRAFT** since 2026-05-20 02:02 UTC. Yon authored, intended placeholder; needs close, merge as no-op, or repurposing before D-0 results actually exist on Jun 5+. | Yon | 2026-05-26 |
| **GH usernames `dhajdu` (Dave), `yon-create` (Yon) still "TBC"** in `agents/project-manager/context/persona.md`. PM agent has been observing them as the de-facto handles for 4+ working days; formal mapping unlocks proper git-vs-reported reconciliation. | Dave | 2026-05-25 |
| **External contributor Tiga (`lsu@Tigas-MacBook-Pro.local`) not in roster.** Merged to main twice via Dave's approvals (PRs #218, #219). Either add to persona as external contributor or document a different scope (e.g. paired-pairing with Yon). | Dave | 2026-05-25 |

---

## 🔴 RED — Escalation Required

| Item | Impact | Immediate Action |
|------|--------|------------------|
| **Lark notification channel broken — 22 consecutive working days.** Same App ID `cli_a95707d3b57a5eed` returning `[10014] app secret invalid` on every send attempt. Same three sub-actions still pending after being promoted to RED 7 days ago: (1) rotate app secret in Lark Open Platform + re-run `lark-cli auth login --as bot`; (2) persist `LARK_CHAT_ID=oc_e5fe68740864439744b3fb0f31f81040` to root `.env`; (3) upgrade `lark-cli` 1.0.10 → 1.0.23+. Dave owns rotation (re-assigned from Trac last RAG). | **D-0 decision gate is 10 calendar days away (Jun 1 18:00 Saigon).** Resend continues to carry every notification but is a single-channel dependency; one Resend outage or Cloudflare-1010 block on the decision-gate window leaves the team blind during the actual launch. Daily warmup status, 48h preview heartbeats, and the gate classification all need to reach the team in real time. | **Dave to rotate the app secret on Monday 2026-05-25 morning** as first action of the week. If Dave is not the right owner, formally re-assign by EOD Friday 2026-05-22. Failure to land this before Wed 2026-05-27 puts the D-0 launch broadcast at material risk. |
| **Trac silent on both channels for 8 consecutive working days** (last check-in 2026-04-23, 22 working days stale; no commits from `TracNg99` since PR #202 on 2026-05-12). Manager nudge from 2026-05-19 unresolved. **Promoted from AMBER (3 RAGs running) to RED today** because we are 10 calendar days from D-0 and Trac was previously the owner of Lark + Resend curl-first switch + bootstrap-docs cleanup — three of the longest-running open threads. | Lark blocker re-assignment to Dave (last RAG) has not produced action; bootstrap-docs and curl-first switch decisions stalled. Capacity question is unanswered going into a critical launch window. Without resolution this becomes a single point of failure if Yon's bandwidth is also fully consumed by portal scope. | **Dave to direct-message Trac today** with three explicit asks: (a) confirm availability and capacity this week and next, (b) confirm or formally hand off Lark/curl-first/bootstrap-docs, (c) re-engage on `trac.md` daily check-in by Mon 2026-05-25. If no response by Mon EOD, formally reassign all open Trac items and remove from daily compile roster. |
| **D-0 reactivation launch (Jun 2-4) running into a perfect-storm risk surface.** With 10 days to the decision gate: (1) broadcast channel still dark; (2) Yon's verified attention this week is on portal scope, not warmup — zero visible warmup-status updates since 2026-05-13; (3) Trac unreachable; (4) Content pipeline frozen for ≥6 days (audience may perceive brand inactive into a reactivation campaign); (5) GEMINI key blocker means we cannot generate the planned D-0-week social/blog artillery either. Decision-gate go/no-go has no live signal feeding it. | If gate fires Jun 1 18:00 with no warmup classification data and no working broadcast channel, the team will either be forced to push +14d (compresses Q3 schedule) or launch blind (reputation risk on the reactivation domain). | **By Mon 2026-05-25 EOD**: (1) Dave-Yon 1-1 to confirm warmup is still daily — and if not, set explicit catch-up plan; (2) commit a 24h triage for Lark rotation; (3) decide and announce content-pipeline catch-up plan (or formally accept slip); (4) Yon to confirm Brevo MCP token rotated before any preview send. |

---

## 📋 UPCOMING — Next 2 Weeks

| Milestone | Owner | Target |
|-----------|-------|--------|
| Lark app-secret rotation + `.env` `LARK_CHAT_ID` persistence + `lark-cli` upgrade | Dave | 2026-05-25 |
| Trac direct message + capacity confirmation | Dave | 2026-05-22 EOD |
| GEMINI_API_KEY repo `.env` refresh | Dave | 2026-05-25 |
| Backlog publish: `2026-05-15-derby-feel-good`, `2026-05-18-horse-love-signs`, `2026-05-20-mirror-love-signs`, `2026-05-22-feel-good-love` (hero images + page build + index updates) | image-designer → web-developer | 2026-05-25 → 2026-05-27 |
| Writer Monday content trigger for week of 2026-05-25 | writer | 2026-05-25 |
| Persona table: confirm `dhajdu` → Dave, `yon-create` → Yon, add Khang, decide on Tiga | Dave | 2026-05-25 |
| PR #226 close-out or repurpose | Yon | 2026-05-26 |
| Brevo MCP token rotation | Yon | 2026-05-26 |
| Phase 1 OCA warmup daily 5-send sequence (continues through Jun 8) | Yon | daily |
| `brevo-preview-d0-batch1` 48h pre-flight test-send | brevo-manager | 2026-05-31 21:00 Saigon |
| `brevo-preview-d0-batch2` 48h pre-flight test-send | brevo-manager | 2026-06-01 21:00 Saigon |
| **`brevo-d0-decision-gate` — classify warmup GREEN / YELLOW / RED, unsuspend or push +14d** | Yon / Dave | 2026-06-01 18:00 Saigon |
| `brevo-preview-d0-batch3` 48h pre-flight test-send | brevo-manager | 2026-06-02 21:00 Saigon |
| D-0 reactivation campaigns Batch 1 (if gate is GREEN/YELLOW) | brevo-manager | 2026-06-02 14:00Z |
| D-0 reactivation campaigns Batch 2 | brevo-manager | 2026-06-03 14:00Z |
| D-0 reactivation campaigns Batch 3 | brevo-manager | 2026-06-04 14:00Z |
| `brevo-preview-bridge` 48h pre-flight | brevo-manager | 2026-06-07 21:00 Saigon |
| Switch standup-compile + weekly-rag triggers to curl-first for Resend | Dave / Trac | 2026-05-25 |
| Auto-publishing checklist sign-off (three times overdue) | Dave | 2026-05-25 |
| Triage readings-generator stakeholder spec (PR #243) into epic backlog | product-manager | 2026-05-29 |
| MailerLite Manager agent fate (rename/rescope or archive) | Yon → Dave | 2026-05-25 |

---

## ⚠️ TOP RISKS

| # | Risk | Probability | Impact | Mitigation |
|---|------|------------|--------|-----------|
| 1 | **D-0 reactivation campaign (Jun 2-4) launches with no working broadcast channel + unconfirmed warmup cadence.** Lark dark 22 days; Yon's visible attention 2026-05-18 → 2026-05-22 was 100% portal scope with zero check-in or PM signal confirming the OCA warmup is still being driven daily. Decision gate Mon 6/1 18:00 needs live warmup-quality data. | High | High | Mon 2026-05-25 morning: Dave-Yon 1-1 to confirm warmup days 9-12 status, get explicit warmup-cadence written into `yon.md`. Same morning: Dave rotates Lark app secret. If both confirmed by Tue 2026-05-26 EOD, the gate becomes manageable; if not, schedule push +14d announcement by Thu 2026-05-28. |
| 2 | **Content pipeline frozen 6+ days running into a reactivation campaign that expects a visibly active brand.** Audience hits the landing pages mid-campaign and sees the last post from 2026-05-13. Compounds: image-designer key issue is now blocking the D-0-week social artillery too. | High | Medium-High | Dave to rotate GEMINI_API_KEY Mon morning. If still blocked, formally adopt `/content-studio/.env` as canonical and remove repo `.env` dependency from SKILL. Image-designer + web-developer to clear the four-post backlog Mon-Tue. |
| 3 | **Trac is now a single point of failure on three open threads.** Lark, curl-first switch, bootstrap-docs cleanup — all originally Trac-owned. Eight working days silent. If Yon's bandwidth is fully consumed by portal scope and Trac is unreachable, Dave is the only available pair of hands for the D-0 launch operational tasks. | High | Medium-High | Dave-Trac DM today (2026-05-22). If no response by Mon EOD: formally reassign Lark + curl-first to Dave, freeze bootstrap-docs work, drop `trac.md` from daily compile roster, document in next RAG. |
| 4 | **Yon's attention split between portal scope and OCA warmup with no visible reconciliation.** 19 portal PRs this week + an OCA results PR that says "DATA UNAVAILABLE" is a strong signal that warmup tracking is not the day-to-day priority. If portal scope keeps expanding, OCA Phase 1 warmup integrity (Days 9-21) suffers and D-0 launch quality drops. | Medium-High | High | Dave to formally decide: pause portal feature work until D-0 ships, OR push D-0 +14d to fit portal. The middle ground (both at full speed) is what created the current visibility crisis. |
| 5 | **External contributor (Tiga) merging to main with no roster entry.** Two PRs to production website code via Dave's approvals; no documented scope, no `dave-edits.md`-style attribution. Provenance/audit gap and security-review surface area as the portal scales. | Medium | Medium | Add Tiga to persona table by Mon 2026-05-25 with explicit scope; ensure all future PRs go through Yon's review chain before Dave merges. |

---

## 🔔 DECISIONS NEEDED

| Decision | Decided By | Deadline |
|----------|-----------|----------|
| **Portal feature freeze vs. D-0 push** — Yon cannot simultaneously ship portal at this velocity AND run OCA warmup AND make the Jun 1 decision gate. Pick one. | Dave | 2026-05-25 EOD |
| **Lark blocker ownership confirmation** — re-assigned to Dave on 2026-05-15 RAG; no action in 7 days. Confirm Dave owns + commit to Mon 2026-05-25 rotation, OR re-assign with explicit owner-name. | Dave | 2026-05-22 EOD |
| **Trac status decision** — keep on roster with 1-1 plan, OR formally remove from daily compile + reassign all open items. | Dave | 2026-05-25 EOD (depends on DM response) |
| **MailerLite Manager agent fate post-Sequence-D pivot** — twice carried, still orphaned. Archive or rescope. | Yon → Dave | 2026-05-25 |
| **Add `khang-h-nguyen-te` to trigger Team roster** so PR #196 / #197 author attribution flows into daily compile. **Four-week carry.** | Dave | 2026-05-25 |
| **Switch trigger Resend step to curl-first** (drop dead `npm install -g resend` ladder rung). **Thrice overdue.** | Dave | 2026-05-25 |
| **Auto-publishing checklist sign-off** — overdue since 2026-05-04 (three RAGs). | Dave | 2026-05-25 |
| **Check-in freshness gate or simplification** — chronic staleness now Dave 18d / Yon 7d / Trac 22d. Twice overdue. | Dave | 2026-05-29 |
| **Persona table updates** — confirm `dhajdu`/`yon-create`, add Khang, decide on Tiga. | Dave | 2026-05-25 |
| **D-0 reactivation go/no-go** — Jun 1 18:00 Saigon decision gate based on Phase 1 warmup classification (GREEN / YELLOW / RED). | Yon → Dave | 2026-06-01 18:00 |

---

## 🤖 Agent TODO — Week of 2026-05-25

- **project-manager**: Continue daily morning + compile triggers (Memorial Day in US is not a Saigon holiday — full week of triggers). First send post-Lark-rotation should be flagged in the next RAG. Prep next weekly RAG for 2026-05-29. Drop the dead `resend` CLI step from triggers once Dave signs off Mon morning. Open a PR to remove the now-stale `lark-cli` retry-ladder steps that depend on subcommands not present in v1.0.10 — replace with v1.0.23+-only ladder if Dave gets the upgrade in.
- **product-manager**: Drive auto-publishing checklist sign-off with Dave (**four times overdue**). Triage `docs/features/readings-generator/SPEC.md` + `STAKEHOLDER-REVIEW.md` (PR #243) into a vertical-slice epic — readings-generator is Yon's next-priority scope hint.
- **writer**: Run the Monday content trigger for week of 2026-06-01 (no drafts staged beyond 2026-05-22 — the cupboard is bare).
- **web-developer**: **Clear the four-post backlog**: `2026-05-15-derby-feel-good`, `2026-05-18-horse-love-signs`, `2026-05-20-mirror-love-signs`, `2026-05-22-feel-good-love`. All blocked on hero-image generation — kick off Monday once image-designer is unblocked.
- **image-designer**: Generate hero + social images for the four backlogged posts **once `GEMINI_API_KEY` is refreshed**. If repo key still rejected by Mon noon, formally adopt `/content-studio/.env` and update SKILL.md accordingly. Push for the `.env` refresh first thing Monday.
- **brevo-manager**: All 48h pre-flight tasks queued and self-firing (`brevo-preview-d0-batch1` 5/31 21:00, `batch2` 6/1 21:00, `batch3` 6/2 21:00, `bridge` 6/7 21:00). Decision gate `brevo-d0-decision-gate` Mon 6/1 18:00 Saigon. **No autonomous send actions this week** beyond Yon's daily warmup sends from `firepig@onlinechineseastrology.com`.

---

_End of report._

---

## 📡 Notification Status

- **Lark CLI**: ❌ Failed — `TAT API error: [10014] app secret invalid` on `lark-cli im +messages-send --as bot` for App ID `cli_a95707d3b57a5eed`. Both `--markdown` and `--text` retried. Retry ladder cannot be fully executed: `lark-cli` 1.0.10 has no `whoami` subcommand (errors `unknown command "whoami" for "lark-cli"`); `auth list` reports "No logged-in users"; `auth token --as bot` subcommand also missing in v1.0.10 — HTTP cURL fallback cannot mint a fresh `tenant_access_token` without a rotated app secret. **22nd consecutive working-day failure** (28/29/30 Apr + 1/4/5/6/7/8/11/12/13/14/15/18/19/20/21/22 May). Stays RED. Outstanding: rotate app secret, persist `LARK_CHAT_ID=oc_e5fe68740864439744b3fb0f31f81040` to root `.env`, upgrade `lark-cli` 1.0.10 → 1.0.23+.
- **Resend email**: ✅ Sent — HTTP 200, id `08199199-b78d-4fed-ad76-e779315534e3`. Recipients: `dave@edge8.ai`, `yon@edge8.ai`, `trac.nguyen@edge8.ai` (Khang still not in persona roster — see AMBER). Sent from `mahjong-pm@davehajdu.com` via cURL HTTP fallback (Resend CLI npm package is the JS SDK, not a CLI binary, so the trigger's `resend emails send` step exits 127; `curl -A 'MahjongTarot-PM/1.0'` avoids the Cloudflare 1010 block Python `urllib` hits with its default User-Agent). curl-first switch is now thrice overdue.
