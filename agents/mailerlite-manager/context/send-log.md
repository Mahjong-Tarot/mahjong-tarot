# MailerLite Send Log

Append-only log of every action taken by the MailerLite Manager Agent.

| When | Action | Detail | Notes |
|------|--------|--------|-------|
| 2026-05-02 10:08 | create group | OCA Reactivation May 2026 — 500 (id `186349279814616280`) | Empty at creation |
| 2026-05-02 10:15-10:22 | import | OCA Reactivation May 2026 — 500 | 498 net new from `oca-2k-sample-pre-zerobounce_valid_phase1.csv` (top 500 Western-scored, 2 dupes auto-deduped). Account total 499/500. |
| 2026-05-02 10:18 | draft | OCA Reactivation — V1 Original — May 2026 (campaign `186349885477357515`) | Subject: "the horse year briefly". 300 recipients at draft time (import in flight). D-0 candidate. |
| 2026-05-02 10:18 | draft | OCA Reactivation — V2 OCA Anchor — May 2026 (campaign `186349913766888504`) | Subject: "remember online chinese astrology?". D-0 candidate. |
| 2026-05-02 10:19 | draft | OCA Reactivation — V3 Fire Horse Hook — May 2026 (campaign `186349936749577277`) | Subject: "the year japan stopped having babies". D-0 candidate. |
| 2026-05-02 10:29 | import | OCA Reactivation May 2026 — 500 | +1 (`waylon21984@hotmail.com` as "Waylon") to top up to free-plan ceiling. Account total 500/500. |
| 2026-05-02 10:36 | rename (archive) | V1 + V3 drafts | Prefixed with `[ARCHIVED]`. V2 chosen as the D-0 send. NOTE: `update_campaign` reset audience filter on both archived campaigns to `all_active_subscribers: true` — load-bearing reason not to send them. |
| 2026-05-02 10:50 | schedule | V2 (campaign `186349913766888504`) | Status `ready`. `scheduled_for: 2026-05-19 14:00:00 UTC` = **Tue May 19, 10:00 AM EDT**. 499 recipients in OCA Reactivation group. D-0 send. Test sends to yon@edge8.co + dhajdu@gmail.com to be triggered manually from dashboard. |
