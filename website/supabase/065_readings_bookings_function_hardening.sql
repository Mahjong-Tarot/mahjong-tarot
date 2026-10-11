-- ============================================================
-- 065_readings_bookings_function_hardening.sql — SEC-17, SEC-20, SEC-22
-- ============================================================

-- ── SEC-17: only staff author shareable reading HTML ────────
-- /reading/q/<token> serves readings.html to anyone with the token. Members
-- may still save and delete their own compatibility readings (lib/readings.js)
-- but may not set html, public_token or type 'admin' — those are written only
-- by the staff Quick Reading flow (pages/api/admin/quick-reading.js, run as a
-- portal user) or the service role.
create or replace function public.readings_lock_shareable_columns()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  claims text := nullif(current_setting('request.jwt.claims', true), '');
  jwt_role text := coalesce(claims::jsonb ->> 'role', '');
begin
  if jwt_role = 'service_role'
     or current_user in ('service_role', 'postgres', 'supabase_admin')
     or public.is_portal_user() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.html is not null or new.public_token is not null or new.type = 'admin' then
      raise exception 'readings: shareable readings are created by staff only'
        using errcode = '42501';
    end if;
  elsif new.html is distinct from old.html
     or new.public_token is distinct from old.public_token
     or new.type is distinct from old.type then
    raise exception 'readings: shareable readings are created by staff only'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists readings_lock_shareable_columns on public.readings;
create trigger readings_lock_shareable_columns
  before insert or update on public.readings
  for each row execute function public.readings_lock_shareable_columns();

-- ── SEC-22: staff booking updates stay on their own bookings ─
-- The 040 policy had USING but no WITH CHECK, and authenticated held
-- table-wide UPDATE, so an astrologer could reassign a booking, change its
-- email (redirecting the emailed reading) or its amount/status.
drop policy if exists "Staff update bookings" on public.bookings;
create policy "Staff update bookings" on public.bookings
  for update
  using (auth.uid() = astrologer_id or public.is_admin())
  with check (auth.uid() = astrologer_id or public.is_admin());

-- Columns the staff page writes with the user's JWT
-- (pages/admin/private-readings/[id].jsx saveField/saveValue/saveRaw), plus
-- the call-record fields. Everything else (status, amounts, email,
-- astrologer_id, Stripe ids, public_token, final_reading_sent_at) is written
-- only by the service role.
revoke update on public.bookings from anon, authenticated;
grant update (
  question, birthday, birth_time,
  is_relationship, partner_name, partner_birthday, partner_birth_time, partner_gender,
  prep_notes, transcript_text, post_call_notes, summary_text, final_reading_html,
  meeting_source, meeting_external_id
) on public.bookings to authenticated;

-- ── SEC-20: pin search_path on the 001 SECURITY DEFINER RPCs ─
alter function public.submit_newsletter(text, text, text) set search_path = public, pg_temp;
alter function public.submit_contact(text, text, text, text, text) set search_path = public, pg_temp;
alter function public.submit_booking(text, text, text, text, text, date, text) set search_path = public, pg_temp;
alter function public.update_person(uuid, text, text, text, text, text, date) set search_path = public, pg_temp;
