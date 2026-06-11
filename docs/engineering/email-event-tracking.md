# Email Event Tracking — Brevo → Supabase

**Status:** Phase 1 live (engagement events). Phase 2 (reply capture) specced below.
**Owner:** Engineering (Yon)
**Date:** 2026-06-11
**Related:** [email-system-overview.md](email-system-overview.md), [oca-book-launch-campaign-plan.md](oca-book-launch-campaign-plan.md)

---

## What this is

Brevo tracks opens/clicks/bounces in its own dashboard, but nothing flowed
back into our system, and campaign-plan risk #12 (reply flood to Bill's
inbox, untracked) had no mitigation. This feature mirrors Brevo marketing
events into Supabase so engagement data is queryable internally, joinable
against `people` / `deals` for attribution, and portable if we ever switch
ESPs.

```
Brevo marketing webhook  ──POST──►  /api/brevo/webhook?token=…
                                          │  (shared-secret auth,
                                          │   constant-time compare)
                                          ▼
                              public.email_events (Supabase)
```

## Components

| Piece | Where |
|---|---|
| Table + dedup index | `website/supabase/046_email_events.sql` |
| Receiver endpoint | `website/pages/api/brevo/webhook.js` |
| Webhook registration | Brevo dashboard → Transactional/Marketing → Webhooks (or API) |

### Table shape (`public.email_events`)

One row per event: `event_type` (Brevo's string, lower-cased — e.g.
`delivered`, `opened`, `click`, `hard_bounce`, `soft_bounce`,
`unsubscribe`, `spam`), `email`, `campaign_id`, `campaign_name`, `url`
(for clicks), `occurred_at`, and the full raw `payload` (jsonb) for
anything we didn't normalise. RLS is enabled with **no policies** —
service-role only; the admin dashboard must read via server routes.

Idempotency: a unique index on
`(provider, event_type, email, coalesce(campaign_id, 0), occurred_at)`
makes Brevo retries/replays no-ops (the endpoint swallows `23505`).

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `BREVO_WEBHOOK_SECRET` | Vercel (production) + `website/.env.local` | Shared secret in the webhook URL. Generate with `openssl rand -hex 32`. The endpoint 401s without it. |

> Recorded per the engineering rule that all Vercel env changes are
> documented in-repo. The webhook URL **contains the secret** — treat the
> Brevo webhook configuration page as sensitive.

## Setup / runbook

1. ✅ Apply the migration (`046_email_events.sql`) via Supabase SQL editor or MCP. *(Done 2026-06-11 via MCP.)*
2. ✅ Generate a secret: `openssl rand -hex 32`. *(Done 2026-06-11; value in `website/.env.local`.)*
3. ✅ Add `BREVO_WEBHOOK_SECRET` to Vercel production env (and `.env.local` for dev). *(Done 2026-06-11 — added by Yon via dashboard, Production only.)*
4. ✅ Register the webhook in Brevo (type **marketing**), URL:
   `https://www.mahjongtarot.com/api/brevo/webhook?token=<secret>`
   Events: delivered, opened, click, hard bounce, soft bounce,
   unsubscribed, marked as spam. *(Done 2026-06-11 via Brevo API.)*
5. ✅ Send a test event, confirm a row lands:
   `select event_type, email, occurred_at from email_events order by created_at desc limit 5;`
   *(Verified 2026-06-11 against production; test row deleted.)*

## Useful queries

```sql
-- Campaign scorecard (joins what the warm-up gate needs)
select event_type, count(*) , count(distinct email)
from email_events
where campaign_id = <id>
group by 1 order by 2 desc;

-- List-health: who hard-bounced or complained (candidates for suppression)
select distinct email, event_type
from email_events
where event_type in ('hard_bounce', 'spam', 'unsubscribe');
```

## Phase 2 — Reply capture (specced, not built)

Replies currently go to `firepig@mahjongtarot.com` (Bill's inbox) with no
tracking. Brevo **inbound parsing** can capture them:

1. Create a reply subdomain, e.g. `reply.mahjongtarot.com`, and point its
   **MX record** at Brevo (`mx1.brevo.com` / per Brevo docs) — DNS change,
   same access as the `news.` subdomain setup.
2. Register an **inbound** webhook in Brevo pointing at a new
   `/api/brevo/inbound` route; store sender, subject, text body in a
   `email_replies` table (or `email_events` with `event_type='reply'`).
3. Set campaign reply-to to `bill@reply.mahjongtarot.com`; Brevo forwards
   parsed replies to the webhook. Optionally auto-forward a copy to Bill's
   Gmail so his workflow doesn't change.
4. Surface replies in the admin dashboard and/or push to Lark — filters
   out the out-of-office noise the campaign plan predicts (risk #12).

Decision needed: whether Bill is OK with reply-to moving off his Gmail
(forwarding keeps him in the loop). Until then, replies stay manual.

## Deliberate non-goals (phase 1)

- No automatic suppression: hard bounces / spam complaints are recorded
  but do not yet update `people` (nurture status). Do this once we've
  watched real data for a send or two.
- No UI: query via SQL / admin server routes for now.

---

*Document version: 1.0 — 2026-06-11.*
