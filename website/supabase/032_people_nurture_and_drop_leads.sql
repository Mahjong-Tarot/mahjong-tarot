-- ============================================================
-- 032_people_nurture_and_drop_leads.sql
-- Consolidate to a single HubSpot-style contacts table.
--   - Adds nurture/email-sequence columns to people
--   - Adds membership_status (separate from lifecycle_stage)
--   - Removes 'subscriber' from the lifecycle_stage CHECK
--     (subscriber is not a lifecycle stage — it's a membership
--      state. Newsletter signup = lead until they convert.)
--   - Drops the leads table — model is now one Contacts table
--     (public.people). Nurture state lives on the contact.
--
-- Idempotent; safe to re-run.
-- ============================================================

-- ─── 1. Nurture + membership columns on people ────────────────
alter table public.people
  add column if not exists membership_status text,
  add column if not exists nurture_stage     int  not null default 0,
  add column if not exists nurture_status    text,
  add column if not exists last_emailed_at   timestamptz,
  add column if not exists next_send_at      timestamptz,
  add column if not exists metadata          jsonb not null default '{}'::jsonb;

-- membership_status values (free text for now):
--   active    — currently paying for a subscription
--   lapsed    — was a member, lapsed
--   cancelled — actively cancelled
--   null      — never a member

create index if not exists people_nurture_due_idx
  on public.people (nurture_status, next_send_at)
  where nurture_status = 'active';

-- ─── 2. Remove 'subscriber' from the lifecycle CHECK ──────────
alter table public.people drop constraint if exists people_lifecycle_stage_check;

alter table public.people add constraint people_lifecycle_stage_check
  check (lifecycle_stage in (
    'lead', 'mql', 'sql', 'opportunity', 'customer', 'evangelist'
  ));

-- Reclassify any rows that were 'subscriber' back to 'lead'.
update public.people set lifecycle_stage = 'lead' where lifecycle_stage = 'subscriber';

-- ─── 3. Drop leads table ──────────────────────────────────────
-- Nurture state now lives on public.people (nurture_*, next_send_at).
-- The email-marketer agent docs need a corresponding update to
-- query public.people instead of public.leads.
drop table if exists public.leads;
