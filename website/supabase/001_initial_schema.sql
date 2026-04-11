-- ============================================================
-- Mahjong Tarot: Supabase Database Schema
-- Migration: 001_initial_schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- REFERENCE TABLE: reading_types
-- ────────────────────────────────────────────────────────────
create table public.reading_types (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  duration    text,
  description text,
  in_person   boolean not null default false,
  online      boolean not null default true,
  via_ai      boolean not null default false,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

insert into public.reading_types (slug, name, duration, description, in_person, online, via_ai, sort_order)
values (
  'mahjong-mirror-session',
  'Mahjong Mirror Session',
  '45–60 min',
  'A deep, intuitive reading into your full life picture.',
  false,
  true,
  false,
  1
);

-- ────────────────────────────────────────────────────────────
-- CORE TABLE: people
-- One row per unique email address
-- ────────────────────────────────────────────────────────────
create table public.people (
  id             uuid primary key default gen_random_uuid(),
  email          text not null unique,
  name           text,
  phone          text,
  address        text,
  chinese_sign   text,
  birthday       date,
  ok_to_contact  boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Auto-update updated_at on any change
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_people_updated_at
  before update on public.people
  for each row
  execute function public.handle_updated_at();

-- ────────────────────────────────────────────────────────────
-- FORM TABLE: inquiries
-- All form submissions (newsletter, contact, booking)
-- ────────────────────────────────────────────────────────────
create table public.inquiries (
  id              uuid primary key default gen_random_uuid(),
  person_id       uuid not null references public.people(id) on delete cascade,
  type            text not null check (type in ('newsletter', 'contact', 'booking')),
  reading_type_id uuid references public.reading_types(id),
  subject         text,
  message         text,
  source          text,
  status          text not null default 'received'
                    check (status in ('received', 'read', 'confirmed', 'completed', 'cancelled')),
  created_at      timestamptz not null default now()
);

create index idx_inquiries_person on public.inquiries (person_id);
create index idx_inquiries_type   on public.inquiries (type);
create index idx_inquiries_status on public.inquiries (status);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.reading_types enable row level security;
alter table public.people enable row level security;
alter table public.inquiries enable row level security;

-- Anon can read reading types (for form dropdowns)
create policy "Anyone can read reading types"
  on public.reading_types for select
  using (true);

-- Anon can insert people and inquiries (needed by RPC functions)
create policy "Anon can insert people"
  on public.people for insert
  with check (true);

create policy "Anon can insert inquiries"
  on public.inquiries for insert
  with check (true);

-- ============================================================
-- RPC FUNCTIONS (called from frontend via supabase.rpc())
-- security definer = runs with table owner privileges
-- ============================================================

-- Newsletter signup
create or replace function public.submit_newsletter(
  p_email text,
  p_chinese_sign text default null,
  p_source text default 'footer'
)
returns uuid
language plpgsql security definer
as $$
declare
  v_person_id uuid;
  v_inquiry_id uuid;
begin
  -- Upsert person
  insert into public.people (email, chinese_sign)
  values (lower(trim(p_email)), p_chinese_sign)
  on conflict (email) do update set
    chinese_sign = coalesce(public.people.chinese_sign, excluded.chinese_sign),
    updated_at = now()
  returning id into v_person_id;

  -- Insert inquiry
  insert into public.inquiries (person_id, type, source)
  values (v_person_id, 'newsletter', p_source)
  returning id into v_inquiry_id;

  return v_inquiry_id;
end;
$$;

-- Contact form
create or replace function public.submit_contact(
  p_name text,
  p_email text,
  p_phone text default null,
  p_subject text default null,
  p_message text default null
)
returns uuid
language plpgsql security definer
as $$
declare
  v_person_id uuid;
  v_inquiry_id uuid;
begin
  insert into public.people (email, name, phone)
  values (lower(trim(p_email)), trim(p_name), p_phone)
  on conflict (email) do update set
    name = coalesce(nullif(trim(p_name), ''), public.people.name),
    phone = coalesce(p_phone, public.people.phone),
    updated_at = now()
  returning id into v_person_id;

  insert into public.inquiries (person_id, type, subject, message, source)
  values (v_person_id, 'contact', p_subject, p_message, 'contact-page')
  returning id into v_inquiry_id;

  return v_inquiry_id;
end;
$$;

-- Booking request
create or replace function public.submit_booking(
  p_name text,
  p_email text,
  p_reading_type_slug text,
  p_phone text default null,
  p_chinese_sign text default null,
  p_birthday date default null,
  p_message text default null
)
returns uuid
language plpgsql security definer
as $$
declare
  v_person_id uuid;
  v_reading_type_id uuid;
  v_inquiry_id uuid;
begin
  -- Upsert person
  insert into public.people (email, name, phone, chinese_sign, birthday)
  values (lower(trim(p_email)), trim(p_name), p_phone, p_chinese_sign, p_birthday)
  on conflict (email) do update set
    name = coalesce(nullif(trim(p_name), ''), public.people.name),
    phone = coalesce(p_phone, public.people.phone),
    chinese_sign = coalesce(p_chinese_sign, public.people.chinese_sign),
    birthday = coalesce(p_birthday, public.people.birthday),
    updated_at = now()
  returning id into v_person_id;

  -- Resolve reading type
  select id into strict v_reading_type_id
  from public.reading_types
  where slug = p_reading_type_slug and is_active = true;

  -- Insert inquiry
  insert into public.inquiries (person_id, type, reading_type_id, message, source)
  values (v_person_id, 'booking', v_reading_type_id, p_message, 'readings')
  returning id into v_inquiry_id;

  return v_inquiry_id;
end;
$$;

-- ============================================================
-- GRANTS
-- ============================================================

grant select on public.reading_types to anon;
grant insert on public.people to anon;
grant insert on public.inquiries to anon;
grant execute on function public.submit_newsletter to anon;
grant execute on function public.submit_contact to anon;
grant execute on function public.submit_booking to anon;
