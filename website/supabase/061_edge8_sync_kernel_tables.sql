-- 061_edge8_sync_kernel_tables.sql: marketing platform, sync with edge8-web (2026-10-10).
--
-- edge8-web's shared code gained an approval park for the writer and the
-- letter, an effect ledger that sends a notice or publishes a post once, an
-- event outbox, and per-routine run modes (live / paused / shadow). These are
-- its tables, copied from its live company_os schema (wwchefrgkkxmhlkntufm,
-- 2026-10-10), with people references pointing at public.people.

create table if not exists company_os.approvals (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (btrim(subject_type) <> ''),
  subject_id text not null check (btrim(subject_id) <> ''),
  requested_by uuid references public.people(id) on delete set null,
  approver_person_id uuid references public.people(id) on delete set null,
  approver_permission text,
  state text not null default 'pending' check (state in ('pending', 'approved', 'rejected', 'cancelled')),
  decided_by uuid references public.people(id) on delete set null,
  decided_at timestamptz,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists approvals_one_pending_per_subject on company_os.approvals (subject_type, subject_id) where state = 'pending';
create index if not exists approvals_pending_by_approver on company_os.approvals (approver_person_id) where state = 'pending';
drop trigger if exists set_updated_at on company_os.approvals;
create trigger set_updated_at before update on company_os.approvals
  for each row execute function company_os.handle_updated_at();

create table if not exists company_os.automation_effects (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  routine_id text not null,
  run_id uuid references company_os.routine_runs(id) on delete set null,
  kind text not null check (kind in ('lark', 'publish', 'webhook')),
  status text not null check (status in ('claimed', 'done', 'released', 'unknown', 'shadow')),
  attempt integer not null default 1,
  claimed_at timestamptz not null default now(),
  done_at timestamptz,
  provider_ref text,
  detail jsonb,
  summary text,
  constraint automation_effects_shadow_key check ((status = 'shadow') = (key like 'shadow:%')),
  constraint automation_effects_shadow_says_what check (status <> 'shadow' or length(btrim(coalesce(summary, ''))) > 0),
  constraint automation_effects_summary_length check (summary is null or length(summary) <= 500)
);
create unique index if not exists automation_effects_key on company_os.automation_effects (key);
create index if not exists automation_effects_run_idx on company_os.automation_effects (run_id);
create index if not exists automation_effects_claimed_idx on company_os.automation_effects (claimed_at) where status = 'claimed';

create or replace function company_os.claim_effect(p_key text, p_routine text, p_run uuid, p_kind text)
returns table(id uuid, attempt integer)
language sql
security definer
set search_path to ''
as $function$
  insert into company_os.automation_effects (key, routine_id, run_id, kind, status)
  values (p_key, p_routine, p_run, p_kind, 'claimed')
  on conflict (key) do update
    set status = 'claimed',
        attempt = company_os.automation_effects.attempt + 1,
        claimed_at = now(),
        run_id = excluded.run_id,
        routine_id = excluded.routine_id
    where company_os.automation_effects.status = 'released'
  returning company_os.automation_effects.id, company_os.automation_effects.attempt;
$function$;
revoke all on function company_os.claim_effect from public, anon, authenticated;
grant execute on function company_os.claim_effect to service_role;

create table if not exists company_os.event_outbox (
  id uuid primary key default gen_random_uuid(),
  event_name text not null check (btrim(event_name) <> ''),
  dedupe_key text not null check (btrim(dedupe_key) <> ''),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  attempts integer not null default 0,
  published_at timestamptz,
  last_error text,
  constraint event_outbox_event_key unique (event_name, dedupe_key)
);
create index if not exists event_outbox_pending_idx on company_os.event_outbox (created_at) where published_at is null;

create table if not exists company_os.event_deliveries (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  event_id uuid not null,
  subscriber text not null,
  ok boolean not null,
  error text,
  duration_ms integer,
  delivered_at timestamptz not null default now()
);
create index if not exists event_deliveries_event_idx on company_os.event_deliveries (event_id);
create index if not exists event_deliveries_delivered_idx on company_os.event_deliveries (delivered_at);

create table if not exists company_os.routine_config (
  routine_id text primary key,
  mode text not null default 'live' check (mode in ('live', 'paused', 'shadow')),
  paused_reason text,
  updated_by uuid references public.people(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint routine_config_paused_says_why check (mode <> 'paused' or length(btrim(coalesce(paused_reason, ''))) > 0)
);

alter table company_os.interactions add column if not exists category text;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'interactions_category_check') then
    alter table company_os.interactions add constraint interactions_category_check check (category is null or category in
      ('workboard', 'one_on_one', 'goals', 'reviews', 'onboarding', 'people_ops', 'client', 'marketing', 'account', 'other'));
  end if;
end $$;

alter table company_os.approvals enable row level security;
alter table company_os.automation_effects enable row level security;
alter table company_os.event_outbox enable row level security;
alter table company_os.event_deliveries enable row level security;
alter table company_os.routine_config enable row level security;
grant select, insert, update, delete on company_os.approvals, company_os.automation_effects, company_os.event_outbox,
  company_os.event_deliveries, company_os.routine_config to service_role;
