-- ============================================================
-- 068_member_subscriptions_yearly_lifetime.sql
-- ============================================================
-- Allows the two plans sold on /membership:
--   yearly   — $99/yr Stripe subscription
--   lifetime — $299 one-time payment; status 'active' with no
--              current_period_end (access checks key off status).
-- Additive: widens the plan check constraint from 022.
-- ============================================================

alter table public.member_subscriptions
  drop constraint if exists member_subscriptions_plan_check;

alter table public.member_subscriptions
  add constraint member_subscriptions_plan_check
  check (plan in ('founders', 'standard', 'yearly', 'lifetime'));
