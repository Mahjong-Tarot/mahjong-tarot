-- ============================================================
-- 023_crm_backfill_identities.sql — CRM slice 6
-- ============================================================
-- Links the existing `clients` and `profiles` rows to `people`
-- via the nullable `person_id` columns added in 020_crm_normalize.
--
-- Strategy:
--   1. For every clients row with an email, find or create a
--      people row, then set clients.person_id.
--   2. For every profiles row, look up the matching auth.users
--      email, find or create a people row, then set
--      profiles.person_id.
--   3. After backfill, add NOT VALID foreign keys, then VALIDATE
--      so the constraint applies only to verified data.
--
-- Numbered 023 because 022 is reserved for an in-flight member
-- subscriptions migration (Stripe WIP) on a separate branch.
--
-- This migration mutates real data. Run manually after review.
-- Re-runnable: idempotent UPSERT logic + IF NOT EXISTS guards.
-- ============================================================

begin;

-- ────────────────────────────────────────────────────────────
-- 1. clients → people
--    For each client with a non-null email:
--      • upsert into people (matched by email, case-insensitive)
--      • write the resulting people.id back to clients.person_id
-- ────────────────────────────────────────────────────────────
with client_emails as (
  select id, lower(trim(email)) as email_lower, full_name, phone
    from public.clients
   where email is not null
     and trim(email) <> ''
     and person_id is null
),
inserted as (
  insert into public.people (email, name, phone, source_site)
  select c.email_lower, c.full_name, c.phone, 'themahjongtarot.com'
    from client_emails c
  on conflict (email) do update set
    name  = coalesce(public.people.name,  excluded.name),
    phone = coalesce(public.people.phone, excluded.phone),
    updated_at = now()
  returning id, email
)
update public.clients c
   set person_id = p.id
  from public.people p
 where c.person_id is null
   and c.email is not null
   and lower(trim(c.email)) = lower(p.email);

-- ────────────────────────────────────────────────────────────
-- 2. profiles → people (via auth.users.email)
-- ────────────────────────────────────────────────────────────
with profile_emails as (
  select p.user_id, lower(trim(u.email)) as email_lower, p.name
    from public.profiles p
    join auth.users u on u.id = p.user_id
   where p.person_id is null
     and u.email is not null
     and trim(u.email) <> ''
),
inserted as (
  insert into public.people (email, name, source_site)
  select pe.email_lower, pe.name, 'themahjongtarot.com'
    from profile_emails pe
  on conflict (email) do update set
    name = coalesce(public.people.name, excluded.name),
    updated_at = now()
  returning id, email
)
update public.profiles pr
   set person_id = ppl.id
  from public.people ppl, auth.users u
 where pr.user_id = u.id
   and pr.person_id is null
   and lower(trim(u.email)) = lower(ppl.email);

-- ────────────────────────────────────────────────────────────
-- 3. Add FK constraints (NOT VALID + VALIDATE for safety)
-- ────────────────────────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conname = 'clients_person_id_fkey'
       and conrelid = 'public.clients'::regclass
  ) then
    alter table public.clients
      add constraint clients_person_id_fkey
        foreign key (person_id) references public.people(id)
        on delete set null
      not valid;
    alter table public.clients validate constraint clients_person_id_fkey;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conname = 'profiles_person_id_fkey'
       and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_person_id_fkey
        foreign key (person_id) references public.people(id)
        on delete set null
      not valid;
    alter table public.profiles validate constraint profiles_person_id_fkey;
  end if;
end $$;

-- ────────────────────────────────────────────────────────────
-- 4. Verification (commented — paste manually after apply)
-- ────────────────────────────────────────────────────────────
-- -- All clients with email should have person_id set:
-- select id, email, person_id from public.clients
--   where email is not null and person_id is null;
--
-- -- All profiles with auth.users.email should have person_id set:
-- select pr.user_id, u.email, pr.person_id
--   from public.profiles pr
--   join auth.users u on u.id = pr.user_id
--  where pr.person_id is null and u.email is not null;
--
-- -- FK presence:
-- select conname from pg_constraint
--   where conrelid in ('public.clients'::regclass, 'public.profiles'::regclass)
--     and conname like '%person_id%';

commit;
