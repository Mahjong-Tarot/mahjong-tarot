-- ============================================================
-- 041_bookings_public_token_and_sent_at.sql — guest-link delivery
-- ============================================================
-- Adds two columns to public.bookings so the practitioner can
-- email the guest a private link to view their final reading:
--
--   public_token            — random, URL-safe token used by
--                             the public /reading/[token] page.
--                             Generated when the email is sent.
--   final_reading_sent_at   — timestamp the last email went out;
--                             surfaced on the admin page so Bill
--                             knows the guest got it.
--
-- The token is the only auth on the public page — long random
-- value (UUID) is enough entropy for this use case. Anyone with
-- the link can view. RLS-wise the page reads via service-role
-- from a server route, so no public table policy is needed.
-- ============================================================

alter table public.bookings
  add column if not exists public_token          text,
  add column if not exists final_reading_sent_at timestamptz;

create unique index if not exists bookings_public_token_idx
  on public.bookings(public_token)
  where public_token is not null;
