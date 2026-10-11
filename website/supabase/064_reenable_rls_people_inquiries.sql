-- ============================================================
-- 064_reenable_rls_people_inquiries.sql — SEC-02
-- ============================================================
-- 029 disabled RLS on public.people and public.inquiries, so anyone holding
-- the public anon key (it ships in the JS bundle) could read, edit and delete
-- the whole CRM through PostgREST.
--
-- Access after this migration:
--   * service_role: everything (API routes, webhooks, kernel/entities code,
--     the company_os.people view, crons). service_role also bypasses RLS.
--   * authenticated portal users (astrologer/admin, public.is_portal_user()):
--     full read/write, which keeps the admin dashboard, /admin/people
--     (including its direct client people.update) and the private-readings
--     pages working.
--   * anon: nothing directly. Public forms write only through the SECURITY
--     DEFINER RPCs submit_inquiry / submit_newsletter / submit_contact /
--     submit_booking, which run as the table owner and are unaffected.
--
-- Also revokes the old ungated update_person(uuid, text, text, text, text,
-- text, date) overload (001): SECURITY DEFINER, executable by anon, and with
-- no is_admin() check, so it was a second way for anyone to rewrite any
-- person. No code calls it; the gated overload (021) stays.
-- ============================================================

alter table public.people    enable row level security;
alter table public.inquiries enable row level security;

drop policy if exists "Anon can insert people"    on public.people;
drop policy if exists "Anon can insert inquiries" on public.inquiries;
drop policy if exists "Service role manages people"    on public.people;
drop policy if exists "Service role manages inquiries" on public.inquiries;
drop policy if exists "Portal users manage people"     on public.people;
drop policy if exists "Portal users manage inquiries"  on public.inquiries;

create policy "Service role manages people" on public.people
  for all to service_role using (true) with check (true);
create policy "Service role manages inquiries" on public.inquiries
  for all to service_role using (true) with check (true);

create policy "Portal users manage people" on public.people
  for all to authenticated
  using (public.is_portal_user()) with check (public.is_portal_user());
create policy "Portal users manage inquiries" on public.inquiries
  for all to authenticated
  using (public.is_portal_user()) with check (public.is_portal_user());

revoke all on public.people, public.inquiries from anon;

revoke execute on function public.update_person(uuid, text, text, text, text, text, date)
  from public, anon, authenticated;
