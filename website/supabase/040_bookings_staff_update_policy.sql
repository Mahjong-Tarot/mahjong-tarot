-- ============================================================
-- 040_bookings_staff_update_policy.sql — let staff write bookings
-- ============================================================
-- The /admin/private-readings/[id] page edits booking fields
-- (prep_notes, post_call_notes, transcript_text, summary_text,
-- final_reading_html, question) directly from the browser through
-- the authenticated user's Supabase client. Without an UPDATE RLS
-- policy, those writes silently affect 0 rows — saves appear to
-- succeed in the UI but never reach the DB. The /api/admin/
-- generate-reading route then reads the still-empty fields and
-- bails with "Upload a transcript or add post-call notes…".
--
-- This mirrors the policy added for sessions/reports in
-- 024_astrologer_scoping.sql: astrologers can update bookings
-- assigned to them, admins can update any.
--
-- INSERT/DELETE stay locked down — the booking funnel uses the
-- service-role key via the Stripe webhook for creates, and
-- deletes aren't part of any current flow.
-- ============================================================

drop policy if exists "Staff update bookings" on public.bookings;
create policy "Staff update bookings"
  on public.bookings
  for update using (
    auth.uid() = astrologer_id or public.is_admin()
  );
