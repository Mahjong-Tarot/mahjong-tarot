-- ============================================================
-- 034_drop_orders.sql — retire the legacy orders table
-- ============================================================
-- `public.deals` is now the canonical money record. /admin/sales
-- has been switched to read from `deals` (with a booking_id /
-- member_subscription_id / notes prefix discriminator for the
-- subscription / book / reading kind).
--
-- Already applied: `drop table if exists public.orders cascade;`
-- ============================================================

drop table if exists public.orders cascade;
