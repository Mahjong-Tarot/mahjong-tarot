-- ============================================================
-- 052_canonical_source_site.sql — one domain label everywhere
-- ============================================================
-- source_site carried the legacy label 'themahjongtarot.com'
-- (38,603 people + 11 inquiries) and every new signup/inquiry
-- kept inheriting it via column + function defaults from 020/021.
-- The canonical domain is mahjongtarot.com (see CLAUDE.md and
-- .github/workflows/domain-guard.yml). Display-only column —
-- verified no code filters on the value — so normalising is safe.
--
-- Function bodies below are verbatim from production
-- (pg_get_functiondef, 2026-07-22); only the p_source_site
-- DEFAULT changed. submit_newsletter's newer overload
-- (p_email, p_chinese_sign, p_source) has no source_site arg and
-- picks up the column default, so fixing the column fixes it.
-- ============================================================

-- ─── 1. Column defaults ───────────────────────────────────────

alter table public.people    alter column source_site set default 'mahjongtarot.com';
alter table public.inquiries alter column source_site set default 'mahjongtarot.com';

-- ─── 2. Function argument defaults ────────────────────────────

create or replace function public.submit_inquiry(
  p_name text, p_email text,
  p_type text default 'contact',
  p_phone text default null,
  p_company text default null,
  p_role text default null,
  p_subject text default null,
  p_message text default null,
  p_source text default null,
  p_source_site text default 'mahjongtarot.com')
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
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
$function$;

create or replace function public.submit_newsletter(
  p_email text,
  p_name text default null,
  p_source text default 'footer',
  p_source_site text default 'mahjongtarot.com')
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
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
$function$;

-- ─── 3. Normalise existing rows ───────────────────────────────

update public.people    set source_site = 'mahjongtarot.com' where source_site = 'themahjongtarot.com';
update public.inquiries set source_site = 'mahjongtarot.com' where source_site = 'themahjongtarot.com';
