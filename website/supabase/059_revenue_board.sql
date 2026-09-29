-- 059_revenue_board.sql: marketing platform port, the Revenue board.
--
-- Decision 2 in docs/engineering/2026-09-28-marketing-platform-port.md: the
-- content calendar is mirrored onto a Revenue board, as at Edge8. These are
-- edge8-web's board tables (company_os, copied from its live schema on
-- 2026-09-29) with the columns the Revenue board sync and screen use. People
-- references point at public.people; edge8's sprint, epic, AI-program and
-- client-company links are kept as plain columns without their tables.
--
-- The board itself is seeded: "Revenue", flagged content_board so the
-- campaigns sync (entities/campaigns/lib/revenue-board) files the calendar on it.

create table if not exists company_os.boards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  client_company_id uuid,
  owner_id uuid references public.people(id),
  status text not null default 'active',
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  archived_at timestamptz,
  archived_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  ai_program_id uuid
);

create table if not exists company_os.board_columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references company_os.boards(id) on delete cascade,
  name text not null,
  "position" integer not null default 0,
  is_done boolean not null default false,
  is_not_doing boolean not null default false,
  wip_limit integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint board_columns_done_or_not_doing check (not (is_done and is_not_doing)),
  constraint board_columns_wip_limit_positive check (wip_limit is null or wip_limit > 0)
);
create index if not exists board_columns_board_idx on company_os.board_columns (board_id);

create table if not exists company_os.board_members (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references company_os.boards(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique (board_id, person_id)
);
create index if not exists board_members_board_idx on company_os.board_members (board_id);

create table if not exists company_os.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  board_id uuid references company_os.boards(id) on delete cascade,
  board_column_id uuid references company_os.board_columns(id),
  sprint_id uuid,
  "position" double precision not null default 0,
  assignee_id uuid references public.people(id),
  created_by uuid references public.people(id),
  status text not null default 'open',
  priority text not null default 'p3',
  due_date date,
  completed_at timestamptz,
  internal boolean not null default false,
  subject_type text,
  subject_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  archived_at timestamptz,
  archived_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  parent_task_id uuid references company_os.tasks(id) on delete cascade,
  human_tokens numeric(6,2),
  epic_id uuid
);
create index if not exists tasks_board_idx on company_os.tasks (board_id);
create index if not exists tasks_column_idx on company_os.tasks (board_column_id);
create index if not exists tasks_parent_idx on company_os.tasks (parent_task_id);
create index if not exists tasks_subject_idx on company_os.tasks (subject_type, subject_id);
create unique index if not exists tasks_content_day_once on company_os.tasks (board_id, (metadata ->> 'content_day'))
  where subject_type = 'marketing_day' and parent_task_id is null;
create unique index if not exists tasks_content_asset_once on company_os.tasks (board_id, subject_id)
  where subject_type = 'marketing_content';
create unique index if not exists tasks_writer_campaign_once on company_os.tasks (board_id, subject_id)
  where subject_type = 'marketing_campaign';

create table if not exists company_os.task_stage_log (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references company_os.tasks(id) on delete cascade,
  from_column_id uuid references company_os.board_columns(id),
  to_column_id uuid references company_os.board_columns(id),
  from_sprint_id uuid,
  to_sprint_id uuid,
  kind text not null default 'move',
  moved_by uuid references public.people(id),
  note text,
  moved_at timestamptz not null default now()
);
create index if not exists task_stage_log_task_idx on company_os.task_stage_log (task_id);

drop trigger if exists set_boards_updated_at on company_os.boards;
create trigger set_boards_updated_at before update on company_os.boards
  for each row execute function company_os.handle_updated_at();
drop trigger if exists set_board_columns_updated_at on company_os.board_columns;
create trigger set_board_columns_updated_at before update on company_os.board_columns
  for each row execute function company_os.handle_updated_at();
drop trigger if exists set_tasks_updated_at on company_os.tasks;
create trigger set_tasks_updated_at before update on company_os.tasks
  for each row execute function company_os.handle_updated_at();

-- A card closed (done / not doing) closes its open subtasks; a card reopened
-- from Not Doing reopens the subtasks it closed. As edge8.
create or replace function company_os.tasks_children_follow_card()
returns trigger
language plpgsql
set search_path to 'pg_catalog'
as $function$
begin
  if new.parent_task_id is not null then
    return null;
  end if;
  if new.status in ('done', 'not_doing') then
    update company_os.tasks
       set status = new.status,
           completed_at = case when new.status = 'done' then coalesce(new.completed_at, now()) else null end
     where parent_task_id = new.id
       and status = 'open'
       and archived_at is null;
  elsif new.status = 'open' and old.status = 'not_doing' then
    update company_os.tasks
       set status = 'open', completed_at = null
     where parent_task_id = new.id
       and status = 'not_doing'
       and archived_at is null;
  end if;
  return null;
end;
$function$;
drop trigger if exists tasks_children_follow_card on company_os.tasks;
create trigger tasks_children_follow_card after update of status on company_os.tasks
  for each row when (old.status is distinct from new.status)
  execute function company_os.tasks_children_follow_card();

-- The next position at the bottom of a column, serialised per column.
create or replace function company_os.append_task_position(p_board_id uuid, p_column_id uuid)
returns integer
language plpgsql
set search_path to ''
as $function$
declare
  v_top integer;
begin
  perform pg_advisory_xact_lock(hashtext(p_column_id::text));
  select coalesce(max(t.position), 0) into v_top
  from company_os.tasks t
  where t.board_id = p_board_id
    and t.board_column_id = p_column_id
    and t.archived_at is null;
  return v_top + 1;
end;
$function$;

-- ── security: service role only ──
alter table company_os.boards enable row level security;
alter table company_os.board_columns enable row level security;
alter table company_os.board_members enable row level security;
alter table company_os.tasks enable row level security;
alter table company_os.task_stage_log enable row level security;
grant select, insert, update, delete on company_os.boards, company_os.board_columns, company_os.board_members,
  company_os.tasks, company_os.task_stage_log to service_role;
revoke all on function company_os.append_task_position from public, anon, authenticated;
grant execute on function company_os.append_task_position to service_role;

-- ── the Revenue board ──
insert into company_os.boards (name, slug, description, metadata)
values ('Revenue', 'revenue', 'The content calendar as cards: one per publishing day, a subtask per post, and the AI writer''s campaigns.',
        '{"content_board": true}'::jsonb)
on conflict (slug) do nothing;

insert into company_os.board_columns (board_id, name, "position", is_done, is_not_doing)
select b.id, c.name, c.pos, c.done, c.not_doing
from company_os.boards b
cross join (values ('To Do', 1, false, false), ('Doing', 2, false, false), ('Waiting', 3, false, false),
                   ('Done', 4, true, false), ('Not Doing', 5, false, true)) as c(name, pos, done, not_doing)
where b.slug = 'revenue'
  and not exists (select 1 from company_os.board_columns x where x.board_id = b.id);
