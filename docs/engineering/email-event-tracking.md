# Email Event Tracking — Resend → Supabase

**Status:** Live. Resend replaced Brevo in the marketing platform port
(migration `060_brevo_cutover.sql`); the Brevo webhook and inbound routes
(`/api/brevo/webhook`, `/api/brevo/inbound`) have been deleted.
**Owner:** Engineering
**Updated:** 2026-10-11 (first written 2026-06-11 for Brevo)
**Related:** [email-system-overview.md](email-system-overview.md), [2026-09-28-marketing-platform-port.md](2026-09-28-marketing-platform-port.md)

---

## What this is

Every email the site sends goes through Resend: marketing broadcasts, personal
messages from the admin, and transactional mail. Resend posts delivery events
(sent, delivered, opened, clicked, bounced, complained…) to a webhook, which
stores them in Supabase so engagement is queryable internally and joinable
against `people` and campaigns.

```
Resend webhook  ──POST──►  /api/webhooks/resend
                                 │  (Svix signature check against
                                 │   RESEND_WEBHOOK_SECRET)
                                 ▼
                     company_os.email_events (Supabase)
```

## Components

| Piece | Where |
|---|---|
| Table + indexes | `website/supabase/054_marketing_platform_tables.sql` (`company_os.email_events`) |
| Receiver (body) | `website/entities/company-os/api/webhooks/resend/route.ts` |
| Route mount | `website/app/api/webhooks/resend/route.ts` (re-exports `POST`) |
| Signature check | `readSvixHeaders` / `verifySvixSignature` from `website/entities/billing` |
| Webhook registration | Resend dashboard → Webhooks |

### How the receiver works

1. Rejects with 503 when `RESEND_WEBHOOK_SECRET` is unset (fails loudly rather
   than accepting unverified payloads).
2. Verifies the Svix signature over the raw body; 401 on failure.
3. Maps the Resend event name to our `event_type`:
   `email.sent` → `sent`, `email.delivered` → `delivered`,
   `email.delivery_delayed` → `delivery_delayed`, `email.bounced` → `bounced`,
   `email.complained` → `complained`, `email.opened` → `opened`,
   `email.clicked` → `clicked`, `email.failed` → `failed`. Any other type is
   acknowledged (200, `ignored`) so Resend stops retrying.
4. Matches the first recipient to a non-archived `people` row (best effort),
   to a campaign through `email_campaign_recipients.resend_email_id`, and to a
   personal message through `email_messages.resend_email_id`. The send cron
   backfills campaign attribution for events that arrive before the sender has
   stamped the Resend id.
5. Inserts one row into `company_os.email_events`.

### Table shape (`company_os.email_events`)

One row per event: `resend_email_id`, `event_type` (checked against the eight
values above), `recipient`, `person_id`, `campaign_id`, `message_id`,
`subject`, `occurred_at`, `svix_id`, and `metadata` (jsonb: the Resend type and
raw `data`).

Idempotency: a unique index on `svix_id` (stable across Resend retries) plus a
unique index on `(resend_email_id, event_type, occurred_at)`. The endpoint
treats `23505` as a duplicate and answers 200.

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `RESEND_WEBHOOK_SECRET` | Vercel (production) + `website/.env.local` | The webhook's Svix signing secret (`whsec_…`), copied from the Resend dashboard. The endpoint answers 503 without it. |

## Setup / runbook

1. In the Resend dashboard, add a webhook pointing at
   `https://www.mahjongtarot.com/api/webhooks/resend`, **with no trailing
   slash**. Resend does not follow redirects, and this app runs with Next's
   default `trailingSlash: false`, so `/api/webhooks/resend/` answers 308 and
   every event would be dropped. (The comment in the route file and the hint
   on `/admin/revenue/marketing` say the trailing slash is required; that is
   carried over from edge8, whose config sets `trailingSlash: true`, and is
   wrong here.)
2. Subscribe it to the eight `email.*` events listed above.
3. Copy the signing secret into `RESEND_WEBHOOK_SECRET` (Vercel production and
   `website/.env.local`).
4. Send a test email and confirm a row lands:
   `select event_type, recipient, occurred_at from company_os.email_events order by created_at desc limit 5;`

## Useful queries

```sql
-- Campaign scorecard
select event_type, count(*), count(distinct recipient)
from company_os.email_events
where campaign_id = '<uuid>'
group by 1 order by 2 desc;

-- List health: who bounced or complained
select distinct recipient, event_type
from company_os.email_events
where event_type in ('bounced', 'complained');
```

## Legacy Brevo data

- `public.email_events` (migration 046) holds the Brevo-era event history. It
  is no longer written to; the receiver that fed it is gone.
- `public.email_replies` (migration 047) holds replies captured by Brevo
  inbound parsing. Inbound capture stopped with the Brevo routes; the table is
  still read by `pages/admin/email.jsx`.
- The newsletter → Brevo list sync trigger (migration 051) was dropped in
  migration 060. A newsletter signup now sets
  `people.marketing_consent = 'subscribed'`, and the marketing platform mails
  that audience through Resend. 051's function and the Brevo Vault key were
  left in place.

---

*Document version: 2.0 — 2026-10-11.*
