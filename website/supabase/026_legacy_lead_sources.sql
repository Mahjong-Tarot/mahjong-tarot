-- ============================================================
-- 026_legacy_lead_sources.sql
-- Extend leads.source to accept the legacy import buckets.
--   legacy_customers — past paying customers (customerEmail2.txt)
--   legacy_leads     — past prospect list, ZeroBounce-validated
-- ============================================================

alter table public.leads drop constraint if exists leads_source_check;

alter table public.leads add constraint leads_source_check
  check (source in (
    'newsletter',
    'contact',
    'readings',
    'mirror',
    'legacy_customers',
    'legacy_leads'
  ));
