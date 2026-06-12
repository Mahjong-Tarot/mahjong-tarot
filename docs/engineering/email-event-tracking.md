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

## Phase 2 — Reply capture (built 2026-06-11)

Mail sent to `*@reply.mahjongtarot.com` is parsed by Brevo inbound
parsing and POSTed to `POST /api/brevo/inbound` (same shared-secret
auth), which stores each message in `public.email_replies` (migration
047, dedup on Message-ID, RLS service-role only) **and forwards a copy
to Bill via Resend** — `reply_to` is the original sender, so hitting
Reply in Gmail goes straight back to them. Forward target:
`REPLY_FORWARD_TO` env var, falling back to `RESEND_REPLY_TO`.

```
Subscriber replies to bill@reply.mahjongtarot.com
        │  (MX: inbound1/inbound2.sendinblue.com)
        ▼
Brevo inbound parsing ──POST──► /api/brevo/inbound?token=…
        │                              │
        ▼                              ▼
public.email_replies          Resend forward → Bill's inbox
```

### Phase 2 setup

1. DNS (Vercel, `mahjongtarot.com` zone): two MX records —
   `reply` → `inbound1.sendinblue.com` (priority 10) and
   `reply` → `inbound2.sendinblue.com` (priority 20).
2. Register the **inbound** webhook in Brevo: type `inbound`,
   `domain: reply.mahjongtarot.com`, event `inboundEmailProcessed`,
   URL `https://www.mahjongtarot.com/api/brevo/inbound?token=<secret>`.
3. Set campaign **reply-to** to `bill@reply.mahjongtarot.com` (any
   local-part works). Bill still receives every reply via the forward;
   only the Reply-To header changes.
4. Verify: email the reply address, then
   `select from_email, subject, forwarded_at from email_replies order by created_at desc limit 5;`

## Auto-suppression (built 2026-06-11)

`/api/brevo/webhook` now also updates `people` when a suppressing
event arrives — `hard_bounce` → `nurture_status='bounced'`,
`spam` → `'complained'`, `unsubscribe`/`unsubscribed` →
`'unsubscribed'` — and sets `ok_to_contact=false` in all three cases.
Any non-`active` nurture_status drops the contact from the
nurture-due index (migration 032), so suppressed contacts stop
receiving internal nurture sends. Best-effort: a suppression failure
is logged but never 500s the webhook. Brevo independently maintains
its own suppression for campaign sends.

## Newsletter signup → Brevo auto-sync (built 2026-06-12)

Closes the gap from email-system-overview.md §2: signups reached the
CRM but only got to Brevo via a manual export before each send. Now a
Postgres trigger on `inquiries` (`type='newsletter'`, migration 051)
fires `net.http_post` to Brevo `POST /v3/contacts` — upsert with
`updateEnabled`, added to **list 9** ("OCA Master Deliverable") —
within seconds of signup. Supabase stays the source of truth.

- **API key** lives in Supabase Vault as `brevo_api_key`. Rotation:
  call the service-role-only RPC `admin_set_brevo_vault_key('<new>')`
  (via PostgREST with the service key — never paste the key in chat
  or SQL editor history).
- **Requires Brevo IP authorization OFF** (disabled 2026-06-12):
  Supabase egress IPs vary, an allowlist would randomly break sync.
- **No retry**: pg_net is fire-and-forget (responses visible in
  `net._http_response` for ~6h). If Brevo is down during a signup,
  that contact misses the sync — the manual export remains the
  backstop and is still worth running as a pre-send checklist item.

## Deliberate non-goals

- No UI: query via SQL / admin server routes for now.
- Replies are not pushed to Lark/Telegram yet — the Resend forward to
  Bill covers visibility. Add a notifier if reply volume justifies it.
- Brevo unsubscribes are mirrored into Supabase (auto-suppression)
  but Supabase-side deletes/changes don't push back to Brevo beyond
  the signup sync — full two-way sync is out of scope.

---

*Document version: 1.0 — 2026-06-11.*
