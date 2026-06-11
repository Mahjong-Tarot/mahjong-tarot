-- ============================================================
-- 048_email_dashboard.sql — admin email dashboard access + views
-- ============================================================
-- Backs the /admin/email page. Two parts:
--
--   1. Admin SELECT policies on email_events / email_replies —
--      until now both were service-role only; the dashboard reads
--      from the browser through the signed-in admin's client,
--      matching how /admin/sales reads deals.
--
--   2. Aggregate views (security_invoker, so the caller's RLS
--      applies — anon sees nothing, admins see everything).
--      PostgREST can't GROUP BY, so aggregation lives in views.
--
-- Rates (open rate, CTR, …) are computed in the page from these
-- counts. Denominator is delivered events — Brevo's "sent" total
-- lives only in Brevo; the dashboard links there for it.
-- ============================================================

-- ─── 1. Admin read access ─────────────────────────────────────

drop policy if exists "Admins read email events" on public.email_events;
create policy "Admins read email events"
  on public.email_events
  for select using (public.is_admin());

drop policy if exists "Admins read email replies" on public.email_replies;
create policy "Admins read email replies"
  on public.email_replies
  for select using (public.is_admin());

-- ─── 2. Aggregate views ───────────────────────────────────────

-- Per-campaign scorecard counts.
create or replace view public.admin_email_campaign_stats
  with (security_invoker = on) as
select
  campaign_id,
  max(campaign_name)                                                        as campaign_name,
  count(distinct email) filter (where event_type = 'delivered')             as delivered,
  count(distinct email) filter (where event_type in ('opened', 'unique_opened')) as unique_opens,
  count(*)              filter (where event_type in ('opened', 'unique_opened')) as total_opens,
  count(distinct email) filter (where event_type = 'click')                 as unique_clicks,
  count(*)              filter (where event_type = 'click')                 as total_clicks,
  count(distinct email) filter (where event_type in ('hard_bounce', 'hardbounce')) as hard_bounces,
  count(distinct email) filter (where event_type in ('soft_bounce', 'softbounce')) as soft_bounces,
  count(distinct email) filter (where event_type in ('unsubscribe', 'unsubscribed')) as unsubscribes,
  count(distinct email) filter (where event_type in ('spam', 'complaint'))  as spam_complaints,
  min(occurred_at)                                                          as first_event_at,
  max(occurred_at)                                                          as last_event_at
from public.email_events
group by campaign_id;

-- Hourly event buckets, for the activity timeline bars.
create or replace view public.admin_email_event_timeline
  with (security_invoker = on) as
select
  campaign_id,
  date_trunc('hour', occurred_at) as bucket,
  event_type,
  count(*) as events
from public.email_events
group by campaign_id, date_trunc('hour', occurred_at), event_type;

-- Most-clicked links per campaign.
create or replace view public.admin_email_top_links
  with (security_invoker = on) as
select
  campaign_id,
  url,
  count(*)              as clicks,
  count(distinct email) as unique_clicks
from public.email_events
where event_type = 'click' and url is not null
group by campaign_id, url;

-- Engagement by recipient mail provider — early deliverability
-- signal (e.g. Gmail opens fine but Yahoo bounces).
create or replace view public.admin_email_domain_stats
  with (security_invoker = on) as
select
  campaign_id,
  split_part(email, '@', 2) as domain,
  count(distinct email) filter (where event_type = 'delivered')                   as delivered,
  count(distinct email) filter (where event_type in ('opened', 'unique_opened'))  as opens,
  count(distinct email) filter (where event_type in ('hard_bounce', 'hardbounce',
                                                     'soft_bounce', 'softbounce')) as bounces,
  count(distinct email) filter (where event_type in ('spam', 'complaint'))        as complaints
from public.email_events
group by campaign_id, split_part(email, '@', 2);

-- Suppressed contacts with the event that caused it.
create or replace view public.admin_email_suppressed
  with (security_invoker = on) as
select distinct on (e.email)
  e.email,
  e.event_type,
  e.campaign_name,
  e.occurred_at as suppressed_at
from public.email_events e
where e.event_type in ('hard_bounce', 'hardbounce', 'spam', 'complaint',
                       'unsubscribe', 'unsubscribed')
order by e.email, e.occurred_at desc;

-- Caller RLS governs row visibility (security_invoker), but the
-- API roles still need object-level SELECT grants to query at all.
grant select on public.admin_email_campaign_stats,
                public.admin_email_event_timeline,
                public.admin_email_top_links,
                public.admin_email_domain_stats,
                public.admin_email_suppressed
  to authenticated;

revoke all on public.admin_email_campaign_stats,
              public.admin_email_event_timeline,
              public.admin_email_top_links,
              public.admin_email_domain_stats,
              public.admin_email_suppressed
  from anon;
