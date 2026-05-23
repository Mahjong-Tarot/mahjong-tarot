-- ============================================================
-- 031_deals_idempotency_indexes.sql — unique partial indexes
-- on deals so the Stripe webhook can do idempotent insert-or-skip
-- by booking_id / member_subscription_id / stripe_payment_intent_id.
-- ============================================================

create unique index if not exists deals_booking_id_uniq
  on public.deals(booking_id)
  where booking_id is not null;

create unique index if not exists deals_member_subscription_id_uniq
  on public.deals(member_subscription_id)
  where member_subscription_id is not null;

create unique index if not exists deals_stripe_pi_uniq
  on public.deals(stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;
