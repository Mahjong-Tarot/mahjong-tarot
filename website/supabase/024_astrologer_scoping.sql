-- ============================================================
-- 024_astrologer_scoping.sql — multi-astrologer data scoping
-- ============================================================
-- Adds astrologer_id ownership to bookings, reading_availability,
-- and reports, then replaces the broad is_portal_user() RLS on
-- sessions + reports with per-astrologer policies. Admins still
-- see everything via a new is_admin() helper.
--
-- Apply each `--` section separately when running through Supabase's
-- Management API (which prepares statements eagerly and can't see a
-- column added earlier in the same script). The CLI invocation that
-- shipped this PR ran each statement individually.
-- ============================================================

-- ─── 1. reading_availability.astrologer_id (NOT NULL) ──────────
alter table public.reading_availability
  add column if not exists astrologer_id uuid
    references auth.users(id) on delete restrict;

update public.reading_availability
  set astrologer_id = 'c02c4b87-a890-4614-8720-cd19d7745943'::uuid
  where astrologer_id is null;

alter table public.reading_availability
  alter column astrologer_id set not null;

create index if not exists reading_availability_astrologer_id_idx
  on public.reading_availability(astrologer_id);

-- ─── 2. bookings.astrologer_id ────────────────────────────────
alter table public.bookings
  add column if not exists astrologer_id uuid
    references auth.users(id) on delete set null;

update public.bookings b
  set astrologer_id = ra.astrologer_id
  from public.reading_availability ra
  where b.slot_id = ra.id
    and b.astrologer_id is null;

update public.bookings
  set astrologer_id = 'c02c4b87-a890-4614-8720-cd19d7745943'::uuid
  where astrologer_id is null;

create index if not exists bookings_astrologer_id_idx
  on public.bookings(astrologer_id);

-- ─── 3. reports.astrologer_id ─────────────────────────────────
alter table public.reports
  add column if not exists astrologer_id uuid
    references auth.users(id) on delete set null;

update public.reports r
  set astrologer_id = s.astrologer_id
  from public.sessions s
  where r.session_id = s.id
    and r.astrologer_id is null;

update public.reports
  set astrologer_id = generated_by
  where astrologer_id is null
    and generated_by is not null;

create index if not exists reports_astrologer_id_idx
  on public.reports(astrologer_id);

-- ─── 4. is_admin() helper ─────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated, service_role;

-- ─── 5. RLS — tighten per-astrologer scoping ──────────────────
alter table public.reading_availability enable row level security;

drop policy if exists "Staff read availability" on public.reading_availability;
create policy "Staff read availability"
  on public.reading_availability
  for select using (
    auth.uid() = astrologer_id or public.is_admin()
  );

drop policy if exists "Staff read bookings" on public.bookings;
create policy "Staff read bookings"
  on public.bookings
  for select using (
    auth.uid() = astrologer_id or public.is_admin()
  );

drop policy if exists "portal users full access on sessions"
  on public.sessions;

drop policy if exists "Astrologer read own sessions"   on public.sessions;
drop policy if exists "Astrologer write own sessions"  on public.sessions;
drop policy if exists "Astrologer update own sessions" on public.sessions;
drop policy if exists "Admin delete sessions"          on public.sessions;

create policy "Astrologer read own sessions"
  on public.sessions for select using (
    auth.uid() = astrologer_id or public.is_admin()
  );
create policy "Astrologer write own sessions"
  on public.sessions for insert with check (
    auth.uid() = astrologer_id or public.is_admin()
  );
create policy "Astrologer update own sessions"
  on public.sessions for update using (
    auth.uid() = astrologer_id or public.is_admin()
  );
create policy "Admin delete sessions"
  on public.sessions for delete using (public.is_admin());

drop policy if exists "portal users full access on reports"
  on public.reports;

drop policy if exists "Astrologer read own reports"   on public.reports;
drop policy if exists "Astrologer write own reports"  on public.reports;
drop policy if exists "Astrologer update own reports" on public.reports;
drop policy if exists "Admin delete reports"          on public.reports;

create policy "Astrologer read own reports"
  on public.reports for select using (
    auth.uid() = astrologer_id or public.is_admin()
  );
create policy "Astrologer write own reports"
  on public.reports for insert with check (
    auth.uid() = astrologer_id or public.is_admin()
  );
create policy "Astrologer update own reports"
  on public.reports for update using (
    auth.uid() = astrologer_id or public.is_admin()
  );
create policy "Admin delete reports"
  on public.reports for delete using (public.is_admin());

-- clients / inquiries / people remain admin-only data, accessed
-- through /admin/people (gated by requireAdmin) and through joins
-- from sessions/bookings. The legacy /admin/private-readings page
-- (which currently shows the clients list) is being moved behind
-- requireAdmin in the same PR — see the AdminShell nav change.
