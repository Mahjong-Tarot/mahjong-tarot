-- ============================================================
-- 039_bookings_final_reading_html.sql — store generated HTML reading
-- ============================================================
-- Adds bookings.final_reading_html so the /admin/private-readings
-- detail page can keep the Claude-generated post-call reading
-- separate from the human-edited summary_text (which still feeds
-- the email Bill writes to the guest in his own words).
--
-- One column, additive only, no RLS changes — admins/astrologers
-- already have full access via existing booking policies.
-- ============================================================

alter table public.bookings
  add column if not exists final_reading_html text;
