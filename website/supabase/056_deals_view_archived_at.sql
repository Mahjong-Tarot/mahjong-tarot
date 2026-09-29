-- 056_deals_view_archived_at.sql — marketing platform port.
-- The ported audience rules and personal-agent sources filter deals on
-- archived_at. public.deals has no such column (a deal is never archived), so
-- the view answers null for every row.
create or replace view company_os.deals as
select
  d.id,
  d.person_id,
  null::uuid as company_id,
  coalesce(nullif(d.source, ''), 'Deal') as title,
  d.status,
  null::uuid as stage_id,
  d.amount_cents,
  d.currency,
  d.close_date,
  d.won_at,
  d.lost_at,
  d.created_at,
  d.updated_at,
  null::timestamptz as archived_at
from public.deals d;
grant select on company_os.deals to service_role;
