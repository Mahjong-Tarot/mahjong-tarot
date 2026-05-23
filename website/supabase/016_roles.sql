-- ============================================================
-- 016_roles.sql — Astrologer Portal: role column + RPC helpers
-- ============================================================
-- Adds a `role` column to public.profiles and two SECURITY DEFINER
-- helper functions used by Row-Level Security policies and by
-- application code (lib/requireStaff.js, lib/requireAdmin.js).
--
-- Roles:
--   'member'      — default; standard site members
--   'astrologer'  — practitioner (Dave's father)
--   'admin'       — operators (Dave, Yon) — full portal + /admin
--
-- Existing rows default to 'member'. Specific accounts are
-- promoted via website/supabase/seed-astrologers.sql (manual).
-- ============================================================

alter table public.profiles
  add column if not exists role text not null default 'member'
  check (role in ('member', 'astrologer', 'admin'));

create index if not exists profiles_role_idx on public.profiles(role);

-- ────────────────────────────────────────────────────────────
-- is_portal_user() — true if the caller's role is astrologer or admin.
-- Used by RLS policies on portal tables (clients/sessions/reports,
-- introduced in 018_astrologer_portal.sql).
-- ────────────────────────────────────────────────────────────
create or replace function public.is_portal_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid()
      and role in ('astrologer', 'admin')
  );
$$;

-- ────────────────────────────────────────────────────────────
-- is_admin() — true if the caller's role is admin.
-- Used by /admin gate and admin-only RPCs.
-- ────────────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;
