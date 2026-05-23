-- ============================================================
-- 028_leads_person_link.sql
-- Link leads to people (a lead is "promoted" when they engage).
--   - Adds nullable person_id FK to leads.people(id)
--   - Indexes for join + reverse lookup
--   - Backfills the 359 legacy_customers we just imported
--     (they exist in both tables but are unlinked).
-- See docs/architecture/leads-and-people.md for lifecycle rules.
-- ============================================================

alter table public.leads
  add column if not exists person_id uuid
  references public.people(id) on delete set null;

create index if not exists idx_leads_person_id on public.leads (person_id);

-- Backfill legacy_customers (already inserted into both tables
-- by the 026/027 migrations + import script — just unlinked).
update public.leads l
set    person_id = p.id
from   public.people p
where  l.person_id is null
  and  l.email = p.email
  and  l.source = 'legacy_customers';
