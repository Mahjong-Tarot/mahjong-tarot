-- 055_kernel_run_log_and_ai_calls.sql — marketing platform port.
--
-- Brings the kernel's run log up to edge8-web's current shape (053 copied an
-- older one): tick keys and shadow/live mode on routine_runs with claim_tick(),
-- which stops two deliveries of one cron tick from both running, and the
-- ai_calls ledger that kernel/ai/gateway.ts writes for every model call.
-- Definitions copied from edge8's live company_os schema, 2026-09-29.

alter table company_os.routine_runs
  add column if not exists tick_key text,
  add column if not exists mode text not null default 'live',
  add column if not exists attempt integer not null default 1,
  add column if not exists workflow_run_id text,
  add column if not exists step_deadline_at timestamptz;

alter table company_os.routine_runs drop constraint if exists routine_runs_status_check;
alter table company_os.routine_runs add constraint routine_runs_status_check
  check (status in ('running', 'waiting', 'ok', 'skipped', 'error', 'died'));
alter table company_os.routine_runs drop constraint if exists routine_runs_mode_check;
alter table company_os.routine_runs add constraint routine_runs_mode_check
  check (mode in ('shadow', 'live'));

create index if not exists routine_runs_started_idx on company_os.routine_runs (started_at desc);
create index if not exists routine_runs_reap_idx on company_os.routine_runs (step_deadline_at) where status = 'running';
create unique index if not exists routine_runs_one_tick on company_os.routine_runs (routine_id, tick_key, mode)
  where tick_key is not null and status in ('running', 'waiting', 'ok', 'skipped');

create or replace function company_os.claim_tick(p_routine text, p_tick text, p_mode text, p_host text, p_step_s integer)
returns uuid
language sql
security definer
set search_path to ''
as $function$
  insert into company_os.routine_runs (routine_id, tick_key, mode, host, status, started_at, step_deadline_at)
  values (p_routine, p_tick, p_mode, p_host, 'running', now(), now() + make_interval(secs => p_step_s))
  on conflict (routine_id, tick_key, mode) where tick_key is not null and status in ('running', 'waiting', 'ok', 'skipped')
  do nothing
  returning id;
$function$;
revoke all on function company_os.claim_tick from public, anon, authenticated;
grant execute on function company_os.claim_tick to service_role;

create table if not exists company_os.ai_calls (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  site text not null,
  class text not null check (class in ('S', 'C', 'B', 'A')),
  provider text not null check (provider in ('anthropic', 'openrouter', 'google')),
  model text not null,
  input_tokens integer,
  output_tokens integer,
  cache_read_tokens integer,
  cache_write_tokens integer,
  cost_usd numeric(12,6),
  latency_ms integer not null,
  prompt_version text not null,
  input_hash text not null,
  run_id uuid,
  ok boolean not null,
  error_kind text check (error_kind in ('refusal', 'max_tokens', 'timeout', 'connection', 'rate_limit', 'api_error', 'unknown'))
);
create index if not exists ai_calls_created_idx on company_os.ai_calls (created_at);
create index if not exists ai_calls_site_created_idx on company_os.ai_calls (site, created_at);
alter table company_os.ai_calls enable row level security;
grant select, insert on company_os.ai_calls to service_role;
