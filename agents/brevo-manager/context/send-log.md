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
