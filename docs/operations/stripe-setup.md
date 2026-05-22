# Stripe — Member Area subscription wiring

This is the operational record for the Stripe Checkout flow on `/signup`.
Live mode, Talent Edge LLC account (same account that backs eo-vietnam).

## Live IDs (Talent Edge LLC Stripe account)

| Thing | ID |
|---|---|
| Product — *Mahjong Tarot — Founders Annual* | `prod_UZ47ZkMOIP1ayw` |
| Price — Founders Annual $49.50/yr (USD, recurring yearly) | `price_1TZvyrRouu1ZL9vsncnUwwZC` |
| Webhook endpoint — `https://www.mahjongtarot.com/api/stripe/webhook` | `we_1TZw40Rouu1ZL9vskFeq8a76` |

The webhook is subscribed to:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Vercel environment variables

Set on the `mahjong-tarot` project. Production + Development populated by
the initial wiring; Preview was skipped (current `vercel` CLI 53.2.0 has a
non-interactive bug for preview-target adds — re-run after `npm i -g vercel@latest`
if Preview deploys need to process checkout).

| Name | Source |
|---|---|
| `STRIPE_SECRET_KEY` | Talent Edge `sk_live_…` (shared with eo-vietnam) |
| `STRIPE_PRICE_FOUNDERS` | `price_1TZvyrRouu1ZL9vsncnUwwZC` |
| `STRIPE_WEBHOOK_SECRET` | The `whsec_…` returned when the endpoint above was created |
| `SUPABASE_SERVICE_ROLE_KEY` | The Supabase service role key (also present in repo `.env` as `PUBLIC_SUPABASE_SERVICE_KEY` — misnamed legacy var) |

`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is **not** needed — hosted Checkout
runs entirely on Stripe's domain.

## Supabase migration

Apply `website/supabase/022_member_subscriptions.sql` in the Supabase SQL
Editor before the first live checkout. The webhook will return 500 on every
event until this table exists; Stripe will retry, so applying the migration
later does not lose data, but checkout success pages will say "active" before
the database catches up.

## How the flow works

1. User fills `/signup` and clicks **Claim founder rate**.
2. `supabase.auth.signUp` creates the Supabase user (session is issued
   immediately — email confirmation is off on this project).
3. The signup page POSTs to `/api/stripe/checkout` with `{ plan: 'founders' }`.
4. That route creates a Stripe customer (idempotent — re-uses the customer id
   stored in `member_subscriptions` if present), creates a Checkout Session,
   returns `{ url }`.
5. Page redirects `window.location` to the Stripe-hosted Checkout.
6. On success, Stripe redirects to `/dashboard?checkout=success&session_id=...`.
7. Stripe fires `checkout.session.completed` → `/api/stripe/webhook` upserts
   `member_subscriptions.status = 'active'` keyed by `user_id`.

## Manual verification (live)

Until we add an automated smoke test:

```
1. Open /signup, click "Claim founder rate".
2. Fill name/email/password with a throwaway address.
3. Submit — confirm redirect to checkout.stripe.com.
4. Pay with a real card (or use a Stripe-issued test card if you've
   swapped STRIPE_SECRET_KEY to sk_test for this run).
5. Confirm redirect back to /dashboard?checkout=success.
6. In Supabase, confirm row in public.member_subscriptions with
   status='active' for that user_id.
7. Refund the charge in the Stripe dashboard if you used a real card.
```

## Cancellation / customer portal (NOT WIRED)

This PR only wires the buy path. Cancel / change card / view invoices is a
follow-up that needs:

- A new `/api/stripe/portal` route that creates a `billingPortal.sessions`
  link for the signed-in user
- A button on `/dashboard` that POSTs to it
- A Customer Portal configuration saved in the Stripe dashboard

Track in a separate epic.
