-- ============================================================
-- Mahjong Tarot: Admin Dashboard RPC Functions
-- Migration: 002_admin_dashboard
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- get_inquiries: Paginated list of inquiries with person info
-- ────────────────────────────────────────────────────────────
create or replace function public.get_inquiries(
  p_type   text default null,
  p_status text default null,
  p_limit  int  default 50,
  p_offset int  default 0
)
returns table (
  id               uuid,
  type             text,
  status           text,
  subject          text,
  message          text,
  source           text,
  created_at       timestamptz,
  person_id        uuid,
  person_name      text,
  person_email     text,
  person_phone     text,
  person_chinese_sign text,
  person_birthday  date,
  person_address   text,
  reading_type_name text
)
language plpgsql security definer
as $$
begin
  return query
  select
    i.id,
    i.type,
    i.status,
    i.subject,
    i.message,
    i.source,
    i.created_at,
    p.id        as person_id,
    p.name      as person_name,
    p.email     as person_email,
    p.phone     as person_phone,
    p.chinese_sign as person_chinese_sign,
    p.birthday  as person_birthday,
    p.address   as person_address,
    rt.name     as reading_type_name
  from public.inquiries i
  join public.people p on p.id = i.person_id
  left join public.reading_types rt on rt.id = i.reading_type_id
  where (p_type is null or i.type = p_type)
    and (p_status is null or i.status = p_status)
  order by i.created_at desc
  limit p_limit
  offset p_offset;
end;
$$;

-- ────────────────────────────────────────────────────────────
-- get_inquiry_detail: Full details for a single inquiry
-- ────────────────────────────────────────────────────────────
create or replace function public.get_inquiry_detail(
  p_inquiry_id uuid
)
returns table (
  id               uuid,
  type             text,
  status           text,
  subject          text,
  message          text,
  source           text,
  created_at       timestamptz,
  person_id        uuid,
  person_name      text,
  person_email     text,
  person_phone     text,
  person_address   text,
  person_chinese_sign text,
  person_birthday  date,
  person_ok_to_contact boolean,
  reading_type_name text
)
language plpgsql security definer
as $$
begin
  return query
  select
    i.id,
    i.type,
    i.status,
    i.subject,
    i.message,
    i.source,
    i.created_at,
    p.id             as person_id,
    p.name           as person_name,
    p.email          as person_email,
    p.phone          as person_phone,
    p.address        as person_address,
    p.chinese_sign   as person_chinese_sign,
    p.birthday       as person_birthday,
    p.ok_to_contact  as person_ok_to_contact,
    rt.name          as reading_type_name
  from public.inquiries i
  join public.people p on p.id = i.person_id
  left join public.reading_types rt on rt.id = i.reading_type_id
  where i.id = p_inquiry_id;
end;
$$;

-- ────────────────────────────────────────────────────────────
-- update_inquiry_status: Change the status of an inquiry
-- ────────────────────────────────────────────────────────────
create or replace function public.update_inquiry_status(
  p_inquiry_id uuid,
  p_status     text
)
returns uuid
language plpgsql security definer
as $$
begin
  if p_status not in ('received', 'read', 'confirmed', 'completed', 'cancelled') then
    raise exception 'Invalid status: %', p_status;
  end if;

  update public.inquiries
  set status = p_status
  where id = p_inquiry_id;

  return p_inquiry_id;
end;
$$;

-- ────────────────────────────────────────────────────────────
-- get_inquiry_counts: Summary counts by type and status
-- ────────────────────────────────────────────────────────────
create or replace function public.get_inquiry_counts()
returns table (
  type   text,
  status text,
  count  bigint
)
language plpgsql security definer
as $$
begin
  return query
  select i.type, i.status, count(*)::bigint
  from public.inquiries i
  group by i.type, i.status
  order by i.type, i.status;
end;
$$;

-- ────────────────────────────────────────────────────────────
-- update_person: Edit a person's information
-- ────────────────────────────────────────────────────────────
create or replace function public.update_person(
  p_person_id    uuid,
  p_name         text default null,
  p_email        text default null,
  p_phone        text default null,
  p_address      text default null,
  p_chinese_sign text default null,
  p_birthday     date default null
)
returns uuid
language plpgsql security definer
as $$
begin
  update public.people
  set
    name         = coalesce(p_name, name),
    email        = coalesce(lower(trim(p_email)), email),
    phone        = coalesce(p_phone, phone),
    address      = coalesce(p_address, address),
    chinese_sign = coalesce(p_chinese_sign, chinese_sign),
    birthday     = coalesce(p_birthday, birthday)
  where id = p_person_id;

  return p_person_id;
end;
$$;

-- ============================================================
-- GRANTS
-- ============================================================
grant execute on function public.get_inquiries to anon;
grant execute on function public.get_inquiry_detail to anon;
grant execute on function public.update_inquiry_status to anon;
grant execute on function public.get_inquiry_counts to anon;
grant execute on function public.update_person to anon;
