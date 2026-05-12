# Brevo Send Log

Append-only log of every action taken by the Brevo Manager Agent (formerly MailerLite Manager — see migration note below).

| When | Action | Detail | Notes |
|------|--------|--------|-------|
| 2026-05-02 10:08 | create group | OCA Reactivation May 2026 — 500 (id `186349279814616280`) | MailerLite. Empty at creation. |
| 2026-05-02 10:15-10:22 | import | OCA Reactivation May 2026 — 500 | MailerLite. 498 net new from `oca-2k-sample-pre-zerobounce_valid_phase1.csv` (top 500 Western-scored). Account total 499/500. |
| 2026-05-02 10:18 | draft | OCA Reactivation — V1 Original — May 2026 (campaign `186349885477357515`) | MailerLite. Subject: "the horse year briefly". D-0 candidate. |
| 2026-05-02 10:18 | draft | OCA Reactivation — V2 OCA Anchor — May 2026 (campaign `186349913766888504`) | MailerLite. Subject: "remember online chinese astrology?". D-0 candidate. |
| 2026-05-02 10:19 | draft | OCA Reactivation — V3 Fire Horse Hook — May 2026 (campaign `186349936749577277`) | MailerLite. Subject: "the year japan stopped having babies". D-0 candidate. |
| 2026-05-02 10:29 | import | OCA Reactivation May 2026 — 500 | MailerLite. +1 (`waylon21984@hotmail.com`) to top up to free-plan ceiling. Account total 500/500. |
| 2026-05-02 10:36 | rename (archive) | V1 + V3 drafts | Prefixed with `[ARCHIVED]`. V2 chosen as D-0 send. |
| 2026-05-02 10:50 | schedule | V2 (campaign `186349913766888504`) | MailerLite. Scheduled `2026-05-19 14:00:00 UTC` = Tue May 19, 10am EDT. 499 recipients. **Never delivered — account terminated before send.** |

---

## ⚠️ ESP migration: MailerLite → Brevo (May 2-3, 2026)

MailerLite **terminated the account** before any sends went out, citing T&Cs around dormant-list re-permission. All MailerLite groups, drafts, and the V2 scheduled campaign are gone (data retained 3 years per their privacy policy). We migrated to **Brevo**.

| When (Asia/Saigon) | Action | Detail |
|---|---|---|
| 2026-05-02 ~17:00 | account check | Brevo `Online Chinese Astrology` (`yonavo@gmail.com`), Free plan, 300 sends/day cap. |
| 2026-05-02 17:05 | sender create | `Bill Hajdu <firepig@onlinechineseastrology.com>` (sender id `2`). OTP `356102` validated → `active: true`. |
| 2026-05-02 ~17:07 | domain auth | `onlinechineseastrology.com` authenticated via DNS at GoDaddy (DKIM brevo1/brevo2 + DMARC `p=none`). |
| 2026-05-02 17:25 | import | 870 contacts from `oca-2k-sample-pre-zerobounce_valid_phase1.csv` → list `OCA Reactivation May 2026 — 870` (id `5`). 196 had FIRSTNAME/LASTNAME parsed; rest email-only. |
| 2026-05-02 17:30 | split | List 5 split into 3 batch lists of 290 each: id `6` (Tue May 19), id `7` (Wed May 20), id `8` (Thu May 21). |
| 2026-05-02 17:35 | schedule | Brevo campaign id `1` (Tue May 19, list 6) scheduled `2026-05-19T14:00:00Z` = 10am EDT. Subject: "the horse year briefly". |
| 2026-05-02 17:35 | schedule | Brevo campaign id `2` (Wed May 20, list 7) scheduled `2026-05-20T14:00:00Z` = 10am EDT. Same body. |
| 2026-05-02 17:35 | schedule | Brevo campaign id `3` (Thu May 21, list 8) scheduled `2026-05-21T14:00:00Z` = 10am EDT. Same body. |
| 2026-05-02 17:40 | test send | Campaign 1 → `dhajdu@gmail.com` + `yon@edge8.co`. Required adding both as Brevo contacts (ids 872, 873) and to list 2 first; then HTTP 204 success. |
| 2026-05-02 17:45 | scheduled-task | Local task `oca-v1-batch1-results-check` set to fire Wed May 20 08:00 Saigon — pulls campaign 1 stats, classifies green/yellow/red, alerts Bill if RED so batches 2+3 can be unscheduled before they fire at 21:00 Saigon. |
| 2026-05-02 17:45 | scheduled-task | Local task `oca-d1-book-announcement-prep` set to fire Mon Jun 1 09:00 Saigon — drafts D-1 book announcement for the June 15 send. |
| 2026-05-02 17:50 | rename | `agents/mailerlite-manager/` → `agents/brevo-manager/` and `.claude/agents/mailerlite-manager.md` → `.claude/agents/brevo-manager.md`. Persona, skills, send-log all rewritten for Brevo terminology + 300/day cap + 3-batch send pattern. |
| 2026-05-03 00:35 | **suspend (all 3 D-0 campaigns)** | Campaigns 1, 2, 3 → status `suspended`. Test send to yon@edge8.co landed in Gmail spam folder. Decision: pause D-0 entirely, do manual sender-domain warmup first (10-14 days, ~30 personal contacts who'll open + reply, ramp volume) before sending to the 870. Original Tue/Wed/Thu schedule preserved on the campaigns themselves so they can be reactivated. |
| 2026-05-03 00:35 | scheduled-task | Removed `oca-v1-batch1-results-check` (was Wed May 20) — irrelevant since no send. Updated `oca-d1-book-announcement-prep` (June 1) to first check whether D-0 actually went out before drafting D-1. |
| 2026-05-12 15:55 | MCP install | Brevo MCP wired up at `https://mcp.brevo.com/v1/brevo/mcp` (user-scope, header bearer). 282 tools registered after IP whitelist fix. |
| 2026-05-12 16:05 | IP whitelist | Added `2405:4802:980f:a090::/64` (IPv6 /64 from current location) at https://app.brevo.com/security/authorised_ips. Was the root cause of tools/list returning 0 and v3 REST returning 401 on the previous probe. IPv4 `118.68.21.204` also added; `1.53.96.104` retained from May 2. |
| 2026-05-12 16:25 | reschedule | Campaigns 1/2/3 moved from May 19/20/21 → **Jun 2/3/4 at 14:00:00Z** (10am EDT). Names updated to "Tuesday June 2 2026" / "Wednesday June 3 2026" / "Thursday June 4 2026". Lists 6/7/8 and sender id 2 unchanged. Update auto-flipped status from `suspended` → `queued`. |
| 2026-05-12 16:26 | suspend | Campaigns 1/2/3 → `suspended` again. Will NOT fire on Jun 2-4 until Brevo Manager unsuspends after Phase 3 inbox-placement test passes (see `warmup-checklist.md`). |
| 2026-05-12 16:30 | write | `agents/brevo-manager/context/warmup-checklist.md` created — 3-phase 21-day sender domain warmup plan (Personal → Brevo seed → Inbox placement test) gating the Jun 2-4 send. |
| 2026-05-12 17:10 | sender create | `Bill Hajdu <firepig@mahjongtarot.com>` (sender id `3`). OTP `273619` validated → `active: true`. For D-1 onward (book launch brand). D-0 stays on sender id 2. |
| 2026-05-12 17:15 | domain auth | `mahjongtarot.com` authenticated. DNS at Vercel: DKIM brevo1/brevo2 CNAME, brevo-code `971d9443fcbbd646761ebfc1279505e3` TXT @, DMARC `p=none rua=mailto:rua@dmarc.brevo.com`. Also added root SPF `v=spf1 include:_spf.google.com include:spf.brevo.com ~all` (merged Google Workspace + Brevo). MX → smtp.google.com (Google Workspace handles inbound). Resend on `send.*` subdomain untouched. |
| 2026-05-12 17:35 | plan | `sequence-d-plan.md` written — canonical Sequence D doc. Dual-domain strategy (OCA for D-0 sacrificial → MT for Bridge+D-1+ pristine). Inserted **Bridge** step Jun 9 between purge and D-1 for trust-transfer. Persona schedule table updated with Bridge + sender column. |
| 2026-05-12 18:05 | update | Campaigns 1/2/3 htmlContent — inserted P.S. addendum telegraphing the upcoming domain switch: "P.S. Going forward I'll write from a new address — firepig@mahjongtarot.com. Same me, fresh project. If you reply to this one, I'll add you to that list." Body otherwise unchanged. |
| 2026-05-12 18:10 | draft | Brevo campaign id `4` "OCA → MT Bridge — Tuesday June 9 2026" created. Sender id 3 (firepig@mahjongtarot.com), replyTo same. Subject "my new address — Bill". Status draft, no scheduledAt yet. Recipients: placeholder list 2 (test users). **Must be re-pointed to "OCA Responders" list after purge runs Jun 8** before send. |
| 2026-05-12 18:15 | scheduled-task | 4 preview tasks created: `brevo-preview-d0-batch1` (fires May 31 21:00 Saigon), `brevo-preview-d0-batch2` (Jun 1 21:00), `brevo-preview-d0-batch3` (Jun 2 21:00), `brevo-preview-bridge` (Jun 7 21:00). Each fires 48h before its campaign's scheduledAt, runs MCP test-send to dhajdu+yon, displays body for approval. |
| 2026-05-12 18:20 | rule | Added hard rule #7 to persona.md: every scheduled send requires a `brevo-preview-*` scheduled task firing 48h prior. Creating a new scheduled send must always pair with creating its preview task. |
| 2026-05-12 18:25 | update | `warmup-checklist.md` — added Phase 2b (May 26 – Jun 8): MT domain warmup. Bill sends 2 personal plain-text emails/day from `firepig@mahjongtarot.com` to bring MT out of cold state before the Bridge fires Jun 9. |
| 2026-05-12 19:00 | write | `agents/brevo-manager/context/warmup-templates.md` created — subject lines + openers (Phase 1 OCA + Phase 2b MT) in Bill's voice. Source-of-truth for daily reminder. |
| 2026-05-13 02:00 | scheduled-task | `firepig-warmup-daily` cron task created (`0 10 * * *` local Saigon). Daily 10am reminder posts phase, day count, mailbox, count, subjects, openers, rules. Auto-disables after 2026-06-08. User sends manually; logs to send-log via "done N" reply. |
| 2026-05-13 02:10 | scheduled-task | `brevo-d0-decision-gate` one-off task created (fires Mon Jun 1 18:00 Saigon). Runs warmup pass/fail check: read send-log totals, ask user for mail-tester scores + Gmail placement, classify GREEN/YELLOW/RED, then either unsuspend D-0 (GREEN), partial-unsuspend batch 1 (YELLOW), or push everything +14 days and notify D-1 needs to move (RED). |
