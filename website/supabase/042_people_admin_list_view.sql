-- ============================================================
-- 042_people_admin_list_view.sql
-- Pre-joined view for the /admin/people page. Replaces the
-- 4-table client-side aggregation with a single read.
--
-- Backs the refactor in docs/features/admin-people-scale/SPEC.md.
-- This migration ships ALONE (PR #1) — app code still queries
-- the underlying tables until the page rewrite (PR #2) lands.
-- That's intentional: the view can be exercised + measured in
-- isolation before any user-facing changes.
--
-- Apply each `--` section separately when running through
-- Supabase's Management API (which prepares statements eagerly).
-- The CLI invocation that ships this migration applies them
-- individually.
-- ============================================================

-- ─── 1. trigram extension for the search-box index ────────────
create extension if not exists pg_trgm;

-- ─── 2. trigram indexes on people.email + people.name ─────────
-- These power the ILIKE search at the top of the page once the
-- rewrite lands (PR #2). Creating them now means PR #2 can ship
-- with zero migration risk on the read path.
create index if not exists people_email_trgm_idx
  on public.people using gin (lower(email) gin_trgm_ops);

create index if not exists people_name_trgm_idx
  on public.people using gin (lower(name)  gin_trgm_ops);

-- ─── 3. people_admin_list view ────────────────────────────────
-- One row per person, with pre-computed counts + customer flags.
-- Definitions mirror lib/admin-people.js so the view returns the
-- same booleans the page already filters on.
--
-- RECENT_CUSTOMER_SINCE is hardcoded to '2026-01-01' to match the
-- JS constant. If that constant moves, update this view too.
--
-- security_invoker = true: the view runs with the calling user's
-- privileges and inherits RLS from people / inquiries / deals /
-- profiles. Today people and inquiries have RLS disabled (see
-- migration 029) so this is effectively wide-open, same as direct
-- table reads. When 029's TODO is resolved and RLS comes back on,
-- this view will start enforcing it automatically — no rewrite.
create or replace view public.people_admin_list
  with (security_invoker = true) as
select
  p.id, p.email, p.name, p.company, p.role, p.phone, p.address,
  p.birthday, p.birth_time, p.birth_place, p.gender, p.chinese_sign,
  p.ok_to_contact, p.source, p.source_site,
  p.lifecycle_stage, p.nurture_stage, p.nurture_status, p.membership_status,
  p.created_at, p.updated_at,

  coalesce(inq.inquiry_count, 0) as inquiry_count,
  inq.last_inquiry_at,
  inq.types,                                              -- text[] of distinct inquiry types

  coalesce(d.order_count, 0)     as order_count,
  d.latest_deal_at,

  pr.is_premium                  as is_premium_member,
  (pr.user_id is not null)       as is_member,

  -- is_recent_customer: has a won deal on/after the cutoff.
  -- Mirrors isRecentCustomer() in lib/admin-people.js.
  (d.latest_deal_at is not null and d.latest_deal_at >= '2026-01-01'::timestamptz)
    as is_recent_customer,

  -- is_legacy_customer: NOT a recent customer, AND either has any prior
  -- deal OR carries the legacy lifecycle_stage='customer' marker.
  -- Mirrors isLegacyCustomer() in lib/admin-people.js.
  case
    when d.latest_deal_at is not null and d.latest_deal_at >= '2026-01-01'::timestamptz
      then false
    else (coalesce(d.order_count, 0) > 0 or p.lifecycle_stage = 'customer')
  end as is_legacy_customer,

  -- last_activity: most recent of (person update, person create, last inquiry).
  -- Used as the default sort key on the page.
  greatest(
    p.updated_at,
    p.created_at,
    coalesce(inq.last_inquiry_at, '1970-01-01'::timestamptz)
  ) as last_activity

from public.people p
-- Per-person inquiry aggregates. LATERAL keeps the index lookup on
-- inquiries(person_id) instead of a hash join over the whole table.
left join lateral (
  select
    count(*)                  as inquiry_count,
    max(created_at)           as last_inquiry_at,
    array_agg(distinct type)  as types
  from public.inquiries i
  where i.person_id = p.id
) inq on true
-- Per-person deal aggregates, won only.
left join lateral (
  select
    count(*) filter (where status = 'won')    as order_count,
    max(won_at) filter (where status = 'won') as latest_deal_at
  from public.deals d
  where d.person_id = p.id
) d on true
-- One profile per person (one-to-one in practice — profiles.person_id is
-- the FK). NOTE: today's page also has a name-based fallback for profiles
-- with a null person_id ("weak fallback — profiles lack email"). We do
-- NOT replicate that here; the page rewrite (PR #2) should either drop
-- the fallback or backfill the missing person_id values.
left join public.profiles pr on pr.person_id = p.id;

-- ─── 4. grants ────────────────────────────────────────────────
-- Same grants as the underlying tables. PostgREST exposes the view
-- to the authenticated role via the standard public schema route.
grant select on public.people_admin_list to authenticated, anon;
