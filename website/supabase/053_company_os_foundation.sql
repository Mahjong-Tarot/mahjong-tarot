-- 053_company_os_foundation.sql — marketing platform port, Phase 0.
--
-- The marketing platform is copied from edge8-web's `campaigns` entity, whose
-- code queries a `company_os` schema. This creates that schema here with the
-- kernel tables the code needs, so the ported queries run unchanged:
--
--   company_os.people        view over public.people (no second copy of anyone)
--   company_os.interactions  one row per message sent to / received from a person
--   company_os.audit_log     append-only trail of admin writes
--   company_os.routine_runs  one row per scheduled routine execution
--   company_os.brands        the brands the platform writes for (Mahjong Tarot)
--   company_os.companies     empty; audience rules can target companies
--
-- public.people gains the consent and profile columns edge8's people row has.
-- `marketing_consent` and the existing `ok_to_contact` are kept in step by a
-- trigger, so existing mahjong code and the ported code agree on who may be
-- mailed. Plan: docs/engineering/2026-09-28-marketing-platform-port.md
--
-- company_os follows edge8's security model: RLS on, no policies, no grants to
-- anon/authenticated. Only the service role (server code behind requireAdmin)
-- reads or writes it. The schema must also be added to the Data API's exposed
-- schemas (Dashboard → Settings → API) for PostgREST to serve it.

create schema if not exists company_os;
grant usage on schema company_os to service_role;

create or replace function company_os.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── public.people: the columns the marketing code reads ──────────────────────

alter table public.people
  add column if not exists marketing_consent text not null default 'never_asked',
  add column if not exists marketing_consent_at timestamptz,
  add column if not exists marketing_consent_source text,
  add column if not exists do_not_contact boolean not null default false,
  add column if not exists is_team_member boolean not null default false,
  add column if not exists persona text,
  add column if not exists timezone text,
  add column if not exists city text,
  add column if not exists country text,
  add column if not exists archived_at timestamptz;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'people_marketing_consent_check') then
    alter table public.people add constraint people_marketing_consent_check
      check (marketing_consent in ('subscribed', 'unsubscribed', 'never_asked'));
  end if;
end $$;

-- Backfill once from ok_to_contact: it is what the Brevo newsletter mailed on.
update public.people
   set marketing_consent = case when ok_to_contact then 'subscribed' else 'unsubscribed' end,
       marketing_consent_source = 'backfill:ok_to_contact'
 where marketing_consent = 'never_asked'
   and marketing_consent_source is null;

-- Keep the two consent columns in step. Whichever one a write changes wins.
create or replace function public.people_sync_consent()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    if new.marketing_consent = 'never_asked' and new.ok_to_contact then
      new.marketing_consent := 'subscribed';
    elsif not new.ok_to_contact then
      new.marketing_consent := 'unsubscribed';
    end if;
    new.ok_to_contact := new.marketing_consent <> 'unsubscribed';
  elsif new.marketing_consent is distinct from old.marketing_consent then
    new.ok_to_contact := new.marketing_consent <> 'unsubscribed';
    new.marketing_consent_at := coalesce(new.marketing_consent_at, now());
  elsif new.ok_to_contact is distinct from old.ok_to_contact then
    new.marketing_consent := case when new.ok_to_contact then 'subscribed' else 'unsubscribed' end;
    new.marketing_consent_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists people_sync_consent on public.people;
create trigger people_sync_consent before insert or update on public.people
  for each row execute function public.people_sync_consent();

-- ── company_os.people ────────────────────────────────────────────────────────
-- A simple view, so updates to the plain columns (consent, archived_at, …) pass
-- through to public.people. The name columns are derived from `name` and are
-- read-only here.

create or replace view company_os.people as
select
  p.id,
  p.email,
  p.name as full_name,
  p.name as display_name,
  null::text as preferred_name,
  nullif(split_part(btrim(p.name), ' ', 1), '') as first_name,
  null::text as last_name,
  p.phone,
  p.gender,
  p.source,
  p.metadata,
  p.marketing_consent,
  p.marketing_consent_at,
  p.marketing_consent_source,
  p.do_not_contact,
  p.is_team_member,
  p.persona,
  p.timezone,
  p.city,
  p.country,
  p.archived_at,
  p.lifecycle_stage,
  p.chinese_sign,
  p.birthday,
  p.created_at,
  p.updated_at
from public.people p;

grant select, insert, update on company_os.people to service_role;

-- ── company_os.brands ────────────────────────────────────────────────────────

create table if not exists company_os.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  primary_domain text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists set_brands_updated_at on company_os.brands;
create trigger set_brands_updated_at before update on company_os.brands
  for each row execute function company_os.handle_updated_at();

insert into company_os.brands (slug, name, primary_domain)
values ('mahjong-tarot', 'Mahjong Tarot', 'www.mahjongtarot.com')
on conflict (slug) do nothing;

-- ── company_os.companies (kept empty; audience rules may reference it) ────────

create table if not exists company_os.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text,
  industry text,
  industry_normalized text,
  size_band text,
  website_url text,
  lifecycle_stage text not null default 'lead',
  client_types text[] not null default '{}',
  client_start_date date,
  client_end_date date,
  is_ai_program boolean not null default false,
  priority text,
  billing_address text,
  notes text,
  owner_id uuid,
  metadata jsonb not null default '{}',
  archived_at timestamptz,
  archived_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── company_os.interactions ──────────────────────────────────────────────────

create table if not exists company_os.interactions (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  subject text,
  body text,
  person_id uuid references public.people(id) on delete set null,
  company_id uuid references company_os.companies(id) on delete set null,
  owner_id uuid,
  subject_type text,
  subject_id uuid,
  metadata jsonb not null default '{}',
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists interactions_person_idx on company_os.interactions (person_id, occurred_at desc);

-- ── company_os.audit_log ─────────────────────────────────────────────────────

create table if not exists company_os.audit_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id text,
  operation text not null,
  actor_label text,
  actor_person_id uuid,
  old_data jsonb,
  new_data jsonb,
  context jsonb not null default '{}',
  changed_at timestamptz not null default now()
);
create index if not exists audit_log_table_record_idx on company_os.audit_log (table_name, record_id, changed_at desc);

-- ── company_os.routine_runs ──────────────────────────────────────────────────

create table if not exists company_os.routine_runs (
  id uuid primary key default gen_random_uuid(),
  routine_id text not null,
  host text not null check (host in ('vercel', 'mac-mini')),
  status text not null default 'running' check (status in ('running', 'ok', 'skipped', 'error')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  duration_ms integer,
  summary text,
  result jsonb,
  error text,
  log text,
  ai_calls integer not null default 0,
  ai_input_tokens bigint not null default 0,
  ai_output_tokens bigint not null default 0,
  ai_cache_read_tokens bigint not null default 0,
  ai_cache_write_tokens bigint not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists routine_runs_routine_started_idx on company_os.routine_runs (routine_id, started_at desc);

-- ── security: service role only ──────────────────────────────────────────────

alter table company_os.brands enable row level security;
alter table company_os.companies enable row level security;
alter table company_os.interactions enable row level security;
alter table company_os.audit_log enable row level security;
alter table company_os.routine_runs enable row level security;

grant select, insert, update, delete on company_os.brands, company_os.companies, company_os.interactions to service_role;
grant select, insert on company_os.audit_log to service_role;
grant select, insert, update on company_os.routine_runs to service_role;
