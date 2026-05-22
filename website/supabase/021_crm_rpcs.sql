-- ============================================================
-- 021_crm_rpcs.sql — CRM RPCs (slice 2)
-- ============================================================
-- Ported from aio-website/supabase/001_normalized_schema.sql.
-- Mahjong-specific changes:
--   • inquiry types: contact, newsletter, booking, reading,
--                    consultation, general
--   • inquiry statuses: new_lead, contacted, discovery_call,
--                       proposal, won, lost, archived
--   • default source_site: 'themahjongtarot.com'
--   • admin-only RPCs check public.is_admin() internally
--     (defined in 016_roles.sql)
--
-- All RPCs use SECURITY DEFINER so they can bypass RLS for the
-- legitimate use-cases. Submit RPCs are granted to `anon` for
-- public form submissions; admin RPCs are granted to authenticated
-- but gated by an is_admin() check at the top of the function body.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0. Drop prior versions
-- ────────────────────────────────────────────────────────────
-- 002_admin_dashboard.sql created earlier versions of these RPCs
-- with different return signatures. PG can't CREATE OR REPLACE
-- a function when its return type changes, so we drop first.
drop function if exists public.submit_inquiry(text, text, text, text, text, text, text, text, text, text);
drop function if exists public.submit_newsletter(text, text, text, text);
drop function if exists public.get_inquiries(text, text, text, int, int);
drop function if exists public.get_inquiries(text, text, int, int);
drop function if exists public.get_inquiry_detail(uuid);
drop function if exists public.update_inquiry_status(uuid, text);
drop function if exists public.get_inquiry_counts();
drop function if exists public.update_person(uuid, text, text, text, text, text);

-- ────────────────────────────────────────────────────────────
-- 1. submit_inquiry — public form (anon) inserts person + inquiry
-- ────────────────────────────────────────────────────────────
create or replace function public.submit_inquiry(
  p_name         text,
  p_email        text,
  p_type         text default 'contact',
  p_phone        text default null,
  p_company      text default null,
  p_role         text default null,
  p_subject      text default null,
  p_message      text default null,
  p_source       text default null,
  p_source_site  text default 'themahjongtarot.com'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_person_id  uuid;
  v_inquiry_id uuid;
begin
  insert into public.people (email, name, phone, company, role)
  values (lower(trim(p_email)), nullif(trim(p_name), ''), p_phone, p_company, p_role)
  on conflict (email) do update set
    name    = coalesce(nullif(trim(excluded.name), ''), public.people.name),
    phone   = coalesce(excluded.phone,   public.people.phone),
    company = coalesce(excluded.company, public.people.company),
    role    = coalesce(excluded.role,    public.people.role),
    updated_at = now()
  returning id into v_person_id;

  insert into public.inquiries
    (person_id, type, subject, message, source, source_site)
  values
    (v_person_id, p_type, p_subject, p_message, p_source, p_source_site)
  returning id into v_inquiry_id;

  return v_inquiry_id;
end;
$$;

-- ────────────────────────────────────────────────────────────
-- 2. submit_newsletter — convenience wrapper
-- ────────────────────────────────────────────────────────────
create or replace function public.submit_newsletter(
  p_email        text,
  p_name         text default null,
  p_source       text default 'footer',
  p_source_site  text default 'themahjongtarot.com'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_person_id  uuid;
  v_inquiry_id uuid;
begin
  insert into public.people (email, name)
  values (lower(trim(p_email)), nullif(trim(p_name), ''))
  on conflict (email) do update set
    name = coalesce(nullif(trim(excluded.name), ''), public.people.name),
    updated_at = now()
  returning id into v_person_id;

  insert into public.inquiries (person_id, type, source, source_site)
  values (v_person_id, 'newsletter', p_source, p_source_site)
  returning id into v_inquiry_id;

  return v_inquiry_id;
end;
$$;

-- ────────────────────────────────────────────────────────────
-- 3. get_inquiries — admin paginated list with person joined
-- ────────────────────────────────────────────────────────────
create or replace function public.get_inquiries(
  p_type         text default null,
  p_status       text default null,
  p_source_site  text default null,
  p_limit        int  default 50,
  p_offset       int  default 0
)
returns table (
  id              uuid,
  type            text,
  status          text,
  subject         text,
  message         text,
  source          text,
  source_site     text,
  created_at      timestamptz,
  person_id       uuid,
  person_name     text,
  person_email    text,
  person_phone    text,
  person_company  text,
  person_role     text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden: admin only';
  end if;

  return query
  select
    i.id, i.type, i.status, i.subject, i.message, i.source,
    i.source_site, i.created_at,
    p.id, p.name, p.email, p.phone, p.company, p.role
  from public.inquiries i
  join public.people p on p.id = i.person_id
  where (p_type        is null or i.type        = p_type)
    and (p_status      is null or i.status      = p_status)
    and (p_source_site is null or i.source_site = p_source_site)
  order by i.created_at desc
  limit p_limit
  offset p_offset;
end;
$$;

-- ────────────────────────────────────────────────────────────
-- 4. get_inquiry_detail — full record for the detail drawer
-- ────────────────────────────────────────────────────────────
create or replace function public.get_inquiry_detail(p_inquiry_id uuid)
returns table (
  id                    uuid,
  type                  text,
  status                text,
  subject               text,
  message               text,
  source                text,
  source_site           text,
  created_at            timestamptz,
  person_id             uuid,
  person_name           text,
  person_email          text,
  person_phone          text,
  person_company        text,
  person_role           text,
  person_ok_to_contact  boolean,
  person_source_site    text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden: admin only';
  end if;

  return query
  select
    i.id, i.type, i.status, i.subject, i.message, i.source,
    i.source_site, i.created_at,
    p.id, p.name, p.email, p.phone, p.company, p.role,
    p.ok_to_contact, p.source_site
  from public.inquiries i
  join public.people p on p.id = i.person_id
  where i.id = p_inquiry_id;
end;
$$;

-- ────────────────────────────────────────────────────────────
-- 5. update_inquiry_status — pipeline mutation
-- ────────────────────────────────────────────────────────────
create or replace function public.update_inquiry_status(
  p_inquiry_id uuid,
  p_status     text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden: admin only';
  end if;

  if p_status not in (
    'new_lead', 'contacted', 'discovery_call',
    'proposal', 'won', 'lost', 'archived'
  ) then
    raise exception 'invalid status: %', p_status;
  end if;

  update public.inquiries
     set status = p_status
   where id = p_inquiry_id;

  -- Audit
  insert into public.activity_log (inquiry_id, person_id, action, details)
  select p_inquiry_id, i.person_id, 'status_change',
         jsonb_build_object('to', p_status)
    from public.inquiries i where i.id = p_inquiry_id;

  return p_inquiry_id;
end;
$$;

-- ────────────────────────────────────────────────────────────
-- 6. get_inquiry_counts — group-by for dashboard
-- ────────────────────────────────────────────────────────────
create or replace function public.get_inquiry_counts()
returns table (type text, status text, count bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden: admin only';
  end if;

  return query
  select i.type, i.status, count(*)::bigint
  from public.inquiries i
  group by i.type, i.status
  order by i.type, i.status;
end;
$$;

-- ────────────────────────────────────────────────────────────
-- 7. update_person — edit a contact (admin)
-- ────────────────────────────────────────────────────────────
create or replace function public.update_person(
  p_person_id  uuid,
  p_name       text default null,
  p_email      text default null,
  p_phone      text default null,
  p_company    text default null,
  p_role       text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden: admin only';
  end if;

  update public.people
     set name    = coalesce(p_name, name),
         email   = coalesce(lower(trim(p_email)), email),
         phone   = coalesce(p_phone, phone),
         company = coalesce(p_company, company),
         role    = coalesce(p_role, role)
   where id = p_person_id;

  insert into public.activity_log (person_id, action, details)
  values (p_person_id, 'person_updated',
          jsonb_build_object(
            'name',    p_name,
            'email',   p_email,
            'phone',   p_phone,
            'company', p_company,
            'role',    p_role
          ));

  return p_person_id;
end;
$$;

-- ============================================================
-- GRANTS
-- ============================================================
-- Public submission funnel
grant execute on function public.submit_inquiry(text, text, text, text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.submit_newsletter(text, text, text, text) to anon, authenticated;

-- Admin RPCs — granted to authenticated; the is_admin() check inside
-- each function body is the actual access gate.
grant execute on function public.get_inquiries(text, text, text, int, int) to authenticated;
grant execute on function public.get_inquiry_detail(uuid) to authenticated;
grant execute on function public.update_inquiry_status(uuid, text) to authenticated;
grant execute on function public.get_inquiry_counts() to authenticated;
grant execute on function public.update_person(uuid, text, text, text, text, text) to authenticated;
