-- 054_marketing_platform_tables.sql — marketing platform port, the campaigns entity's tables.
--
-- Generated from edge8-web's live company_os schema (project wwchefrgkkxmhlkntufm,
-- 2026-09-29) so the ported code's queries match column for column. Differences
-- from edge8:
--   * person_id references public.people (company_os.people is a view here);
--   * email_series.time_zone defaults to America/New_York;
--   * marketing_content gains `language` (en | vi) for the Vietnamese Facebook
--     channel (decision 4 in docs/engineering/2026-09-28-marketing-platform-port.md);
--   * brand_contacts is created (edge8 has it outside its generated types);
--   * the CRM tables campaigns reads are mahjong-shaped: company_os.deals is a
--     view over public.deals; pipeline_stages, meetings and events are empty.
-- Also: the claim/stats RPCs and the public `marketing` storage bucket.

create table if not exists company_os.tags (
  id uuid not null default gen_random_uuid(),
  slug text not null,
  label text not null,
  color text,
  kind text,
  created_at timestamp with time zone not null default now()
);
create table if not exists company_os.taggables (
  id uuid not null default gen_random_uuid(),
  tag_id uuid not null,
  entity_type text not null,
  entity_id uuid not null,
  created_at timestamp with time zone not null default now()
);
create table if not exists company_os.person_companies (
  id uuid not null default gen_random_uuid(),
  person_id uuid not null,
  company_id uuid not null,
  role text not null default 'employee'::text,
  title text,
  is_primary boolean not null default false,
  ownership_pct numeric(5,2),
  start_date date,
  end_date date,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);
create table if not exists company_os.brand_profiles (
  brand_id uuid not null,
  positioning text,
  audience text,
  voice_md text,
  offer text,
  primary_cta text,
  content_rules_md text,
  updated_by text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  author_md text,
  rules_md text,
  channels_md text,
  process_md text,
  blog_styles_md text,
  editing_lens_md text,
  seo_lens_md text,
  image_style_md text,
  preferred_blog_types text[] not null default '{}'::text[],
  preferred_image_styles text[] not null default '{}'::text[],
  preferred_social_styles text[] not null default '{}'::text[],
  auto_publish boolean not null default false
);
create table if not exists company_os.marketing_pillars (
  id uuid not null default gen_random_uuid(),
  brand_id uuid not null,
  name text not null,
  active boolean not null default true,
  created_by text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);
create table if not exists company_os.email_audiences (
  id uuid not null default gen_random_uuid(),
  name text not null,
  rules jsonb not null default '{}'::jsonb,
  created_by text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  archived_at timestamp with time zone
);
create table if not exists company_os.email_series (
  id uuid not null default gen_random_uuid(),
  name text not null,
  audience_id uuid not null,
  brand_id uuid,
  subject text not null default ''::text,
  from_email text,
  reply_to text,
  time_zone text not null default 'Australia/Perth'::text,
  draft_weekday smallint not null default 1,
  draft_hour smallint not null default 8,
  send_weekday smallint not null default 3,
  send_hour smallint not null default 8,
  batch_size integer not null default 150,
  active boolean not null default true,
  created_by text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  archived_at timestamp with time zone,
  body_template text not null default ''::text
);
create table if not exists company_os.email_campaigns (
  id uuid not null default gen_random_uuid(),
  name text not null,
  subject text not null,
  preheader text,
  body_md text not null default ''::text,
  status text not null default 'draft'::text,
  segment jsonb not null default '{}'::jsonb,
  from_email text,
  reply_to text,
  batch_size integer not null default 150,
  scheduled_at timestamp with time zone,
  approved_at timestamp with time zone,
  approved_by text,
  sent_at timestamp with time zone,
  created_by text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  brand_id uuid,
  blocks jsonb not null default '{}'::jsonb,
  agent_step text,
  agent_error text,
  agent_started_at timestamp with time zone,
  agent_notes jsonb not null default '{}'::jsonb,
  summary_posted_at timestamp with time zone,
  audience_id uuid,
  series_id uuid,
  archived_at timestamp with time zone,
  archived_by text
);
create table if not exists company_os.email_campaign_recipients (
  id uuid not null default gen_random_uuid(),
  campaign_id uuid not null,
  person_id uuid not null,
  email text not null,
  status text not null default 'pending'::text,
  skip_reason text,
  resend_email_id text,
  error text,
  sent_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  claimed_at timestamp with time zone,
  send_after timestamp with time zone
);
create table if not exists company_os.marketing_campaigns (
  id uuid not null default gen_random_uuid(),
  brand_id uuid,
  pillar_id uuid,
  name text not null,
  objective text,
  seo_geo_md text,
  starts_on date,
  ends_on date,
  status text not null default 'active'::text,
  created_by text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  idea text,
  writer_step text,
  writer_started_at timestamp with time zone,
  writer_error text,
  utm_campaign text
);
create table if not exists company_os.marketing_content (
  id uuid not null default gen_random_uuid(),
  title text not null,
  brand_id uuid,
  pillar text,
  channel text not null,
  status text not null default 'idea'::text,
  publish_date date,
  parent_id uuid,
  copy_md text,
  asset_url text,
  notes text,
  sort_order double precision not null default 0,
  created_by text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  pillar_id uuid,
  posted_url text,
  blog_style text,
  image_type text,
  seo_md text,
  image_brief_md text,
  image_style text,
  social_style text,
  image_url text,
  broadcast_id uuid,
  campaign_id uuid,
  slug text,
  title_tag text,
  meta_description text,
  excerpt text,
  primary_keyword text,
  category text,
  category_slug text,
  read_time text,
  published_at timestamp with time zone,
  body_html text,
  ai_search_question text,
  attributes_best_guess boolean not null default false
);
create table if not exists company_os.marketing_asset_images (
  id uuid not null default gen_random_uuid(),
  entry_id uuid not null,
  url text not null,
  prompt_used text,
  model text,
  is_selected boolean not null default false,
  created_by text,
  created_at timestamp with time zone not null default now()
);
create table if not exists company_os.email_agents (
  id uuid not null default gen_random_uuid(),
  name text not null,
  brand_id uuid,
  audience_id uuid not null,
  from_email text,
  reply_to text,
  sources jsonb not null default '[]'::jsonb,
  cadence_days integer not null default 14,
  send_hour smallint not null default 8,
  review_mode text not null default 'sample'::text,
  sample_size integer not null default 5,
  max_words integer not null default 150,
  active boolean not null default true,
  created_by text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  archived_at timestamp with time zone
);
create table if not exists company_os.email_agent_skills (
  id uuid not null default gen_random_uuid(),
  agent_id uuid not null,
  version integer not null,
  body_md text not null,
  note text,
  created_by text,
  created_at timestamp with time zone not null default now()
);
create table if not exists company_os.email_messages (
  id uuid not null default gen_random_uuid(),
  agent_id uuid not null,
  skill_id uuid not null,
  person_id uuid not null,
  routine_run_id uuid,
  status text not null default 'drafted'::text,
  hold_reason text,
  skip_reason text,
  subject text not null default ''::text,
  body_md text not null default ''::text,
  facts jsonb not null default '[]'::jsonb,
  edited_at timestamp with time zone,
  approved_by text,
  approved_at timestamp with time zone,
  send_after timestamp with time zone,
  claimed_at timestamp with time zone,
  sent_at timestamp with time zone,
  resend_email_id text,
  error text,
  interaction_id uuid,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);
create table if not exists company_os.email_events (
  id uuid not null default gen_random_uuid(),
  resend_email_id text not null,
  event_type text not null,
  recipient text not null,
  person_id uuid,
  campaign_id uuid,
  subject text,
  occurred_at timestamp with time zone not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  svix_id text,
  message_id uuid
);
create table if not exists company_os.books (
  id uuid not null default gen_random_uuid(),
  brand_id uuid not null,
  slug text not null,
  title text not null,
  subtitle text,
  format text not null default 'nonfiction'::text,
  audience text,
  description text,
  reader_path text,
  status text not null default 'draft'::text,
  sort_order integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);
create table if not exists company_os.book_chapters (
  id uuid not null default gen_random_uuid(),
  book_id uuid not null,
  sort_order integer not null,
  part text,
  title text not null,
  body_md text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);
create table if not exists company_os.marketing_recaps (
  id uuid not null default gen_random_uuid(),
  period_month date not null,
  readout text not null,
  suggestions jsonb not null default '[]'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  model text,
  generated_at timestamp with time zone not null default now()
);

create table if not exists company_os.brand_contacts (
  id uuid not null default gen_random_uuid() primary key,
  brand_id uuid not null references company_os.brands(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  unique (brand_id, person_id)
);

alter table company_os.marketing_content
  add column if not exists language text not null default 'en';

-- ── constraints (after every table, so foreign keys resolve) ──
do $$ begin if not exists (select 1 from pg_constraint where conname = 'tags_pkey') then alter table company_os.tags add constraint tags_pkey PRIMARY KEY (id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'tags_slug_key') then alter table company_os.tags add constraint tags_slug_key UNIQUE (slug); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'taggables_pkey') then alter table company_os.taggables add constraint taggables_pkey PRIMARY KEY (id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'taggables_tag_id_entity_type_entity_id_key') then alter table company_os.taggables add constraint taggables_tag_id_entity_type_entity_id_key UNIQUE (tag_id, entity_type, entity_id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'taggables_tag_id_fkey') then alter table company_os.taggables add constraint taggables_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES company_os.tags(id) ON DELETE CASCADE; end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'person_companies_person_id_company_id_key') then alter table company_os.person_companies add constraint person_companies_person_id_company_id_key UNIQUE (person_id, company_id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'person_companies_pkey') then alter table company_os.person_companies add constraint person_companies_pkey PRIMARY KEY (id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'person_companies_role_check') then alter table company_os.person_companies add constraint person_companies_role_check CHECK ((role = ANY (ARRAY['owner_founder'::text, 'executive'::text, 'employee'::text, 'primary'::text, 'secondary'::text, 'board'::text, 'advisor'::text, 'other'::text]))); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'person_companies_company_id_fkey') then alter table company_os.person_companies add constraint person_companies_company_id_fkey FOREIGN KEY (company_id) REFERENCES company_os.companies(id) ON DELETE CASCADE; end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'person_companies_person_id_fkey') then alter table company_os.person_companies add constraint person_companies_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id) ON DELETE CASCADE; end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'brand_profiles_pkey') then alter table company_os.brand_profiles add constraint brand_profiles_pkey PRIMARY KEY (brand_id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'brand_profiles_brand_id_fkey') then alter table company_os.brand_profiles add constraint brand_profiles_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES company_os.brands(id) ON DELETE CASCADE; end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'marketing_pillars_pkey') then alter table company_os.marketing_pillars add constraint marketing_pillars_pkey PRIMARY KEY (id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'marketing_pillars_brand_id_fkey') then alter table company_os.marketing_pillars add constraint marketing_pillars_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES company_os.brands(id) ON DELETE CASCADE; end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_audiences_pkey') then alter table company_os.email_audiences add constraint email_audiences_pkey PRIMARY KEY (id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_series_batch_size_check') then alter table company_os.email_series add constraint email_series_batch_size_check CHECK (((batch_size >= 1) AND (batch_size <= 1000))); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_series_draft_hour_check') then alter table company_os.email_series add constraint email_series_draft_hour_check CHECK (((draft_hour >= 0) AND (draft_hour <= 23))); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_series_draft_weekday_check') then alter table company_os.email_series add constraint email_series_draft_weekday_check CHECK (((draft_weekday >= 0) AND (draft_weekday <= 6))); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_series_pkey') then alter table company_os.email_series add constraint email_series_pkey PRIMARY KEY (id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_series_send_hour_check') then alter table company_os.email_series add constraint email_series_send_hour_check CHECK (((send_hour >= 0) AND (send_hour <= 23))); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_series_send_weekday_check') then alter table company_os.email_series add constraint email_series_send_weekday_check CHECK (((send_weekday >= 0) AND (send_weekday <= 6))); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_series_audience_id_fkey') then alter table company_os.email_series add constraint email_series_audience_id_fkey FOREIGN KEY (audience_id) REFERENCES company_os.email_audiences(id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_series_brand_id_fkey') then alter table company_os.email_series add constraint email_series_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES company_os.brands(id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_campaigns_batch_size_check') then alter table company_os.email_campaigns add constraint email_campaigns_batch_size_check CHECK (((batch_size >= 1) AND (batch_size <= 1000))); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_campaigns_pkey') then alter table company_os.email_campaigns add constraint email_campaigns_pkey PRIMARY KEY (id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_campaigns_status_check') then alter table company_os.email_campaigns add constraint email_campaigns_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'approved'::text, 'sending'::text, 'sent'::text, 'cancelled'::text, 'missed'::text]))); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_campaigns_audience_id_fkey') then alter table company_os.email_campaigns add constraint email_campaigns_audience_id_fkey FOREIGN KEY (audience_id) REFERENCES company_os.email_audiences(id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_campaigns_brand_id_fkey') then alter table company_os.email_campaigns add constraint email_campaigns_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES company_os.brands(id) ON DELETE SET NULL; end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_campaigns_series_id_fkey') then alter table company_os.email_campaigns add constraint email_campaigns_series_id_fkey FOREIGN KEY (series_id) REFERENCES company_os.email_series(id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_campaign_recipients_pkey') then alter table company_os.email_campaign_recipients add constraint email_campaign_recipients_pkey PRIMARY KEY (id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_campaign_recipients_status_check') then alter table company_os.email_campaign_recipients add constraint email_campaign_recipients_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'claimed'::text, 'sent'::text, 'skipped'::text, 'failed'::text]))); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_campaign_recipients_unique') then alter table company_os.email_campaign_recipients add constraint email_campaign_recipients_unique UNIQUE (campaign_id, person_id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_campaign_recipients_campaign_id_fkey') then alter table company_os.email_campaign_recipients add constraint email_campaign_recipients_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES company_os.email_campaigns(id) ON DELETE CASCADE; end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_campaign_recipients_person_id_fkey') then alter table company_os.email_campaign_recipients add constraint email_campaign_recipients_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'marketing_campaigns_pkey') then alter table company_os.marketing_campaigns add constraint marketing_campaigns_pkey PRIMARY KEY (id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'marketing_campaigns_status_check') then alter table company_os.marketing_campaigns add constraint marketing_campaigns_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'paused'::text, 'done'::text, 'archived'::text]))); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'marketing_campaigns_writer_step_check') then alter table company_os.marketing_campaigns add constraint marketing_campaigns_writer_step_check CHECK (((writer_step IS NULL) OR (writer_step = ANY (ARRAY['draft'::text, 'edit'::text, 'seo'::text, 'exhibits'::text, 'hero'::text, 'links'::text, 'assemble'::text, 'validate'::text, 'ready'::text, 'publish'::text, 'channels'::text, 'done'::text])))); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'marketing_campaigns_brand_id_fkey') then alter table company_os.marketing_campaigns add constraint marketing_campaigns_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES company_os.brands(id) ON DELETE SET NULL; end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'marketing_campaigns_pillar_id_fkey') then alter table company_os.marketing_campaigns add constraint marketing_campaigns_pillar_id_fkey FOREIGN KEY (pillar_id) REFERENCES company_os.marketing_pillars(id) ON DELETE SET NULL; end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'marketing_calendar_image_type_check') then alter table company_os.marketing_content add constraint marketing_calendar_image_type_check CHECK (((image_type IS NULL) OR (image_type = ANY (ARRAY['real'::text, 'ai'::text, 'mixed'::text, 'none'::text])))); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'marketing_content_channel_check') then alter table company_os.marketing_content add constraint marketing_content_channel_check CHECK ((channel = ANY (ARRAY['blog'::text, 'email'::text, 'linkedin'::text, 'facebook'::text, 'twitter'::text]))); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'marketing_content_pkey') then alter table company_os.marketing_content add constraint marketing_content_pkey PRIMARY KEY (id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'marketing_content_status_check') then alter table company_os.marketing_content add constraint marketing_content_status_check CHECK ((status = ANY (ARRAY['idea'::text, 'drafted'::text, 'approved'::text, 'scheduled'::text, 'published'::text, 'skipped'::text]))); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'marketing_calendar_brand_id_fkey') then alter table company_os.marketing_content add constraint marketing_calendar_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES company_os.brands(id) ON DELETE SET NULL; end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'marketing_calendar_broadcast_id_fkey') then alter table company_os.marketing_content add constraint marketing_calendar_broadcast_id_fkey FOREIGN KEY (broadcast_id) REFERENCES company_os.email_campaigns(id) ON DELETE SET NULL; end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'marketing_calendar_campaign_id_fkey') then alter table company_os.marketing_content add constraint marketing_calendar_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES company_os.marketing_campaigns(id) ON DELETE SET NULL; end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'marketing_calendar_parent_id_fkey') then alter table company_os.marketing_content add constraint marketing_calendar_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES company_os.marketing_content(id) ON DELETE SET NULL; end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'marketing_calendar_pillar_id_fkey') then alter table company_os.marketing_content add constraint marketing_calendar_pillar_id_fkey FOREIGN KEY (pillar_id) REFERENCES company_os.marketing_pillars(id) ON DELETE SET NULL; end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'marketing_asset_images_pkey') then alter table company_os.marketing_asset_images add constraint marketing_asset_images_pkey PRIMARY KEY (id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'marketing_asset_images_entry_id_fkey') then alter table company_os.marketing_asset_images add constraint marketing_asset_images_entry_id_fkey FOREIGN KEY (entry_id) REFERENCES company_os.marketing_content(id) ON DELETE CASCADE; end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_agents_cadence_days_check') then alter table company_os.email_agents add constraint email_agents_cadence_days_check CHECK (((cadence_days >= 1) AND (cadence_days <= 365))); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_agents_max_words_check') then alter table company_os.email_agents add constraint email_agents_max_words_check CHECK (((max_words >= 20) AND (max_words <= 2000))); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_agents_pkey') then alter table company_os.email_agents add constraint email_agents_pkey PRIMARY KEY (id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_agents_review_mode_check') then alter table company_os.email_agents add constraint email_agents_review_mode_check CHECK ((review_mode = ANY (ARRAY['hold_all'::text, 'sample'::text]))); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_agents_sample_size_check') then alter table company_os.email_agents add constraint email_agents_sample_size_check CHECK (((sample_size >= 1) AND (sample_size <= 100))); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_agents_send_hour_check') then alter table company_os.email_agents add constraint email_agents_send_hour_check CHECK (((send_hour >= 0) AND (send_hour <= 23))); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_agents_audience_id_fkey') then alter table company_os.email_agents add constraint email_agents_audience_id_fkey FOREIGN KEY (audience_id) REFERENCES company_os.email_audiences(id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_agents_brand_id_fkey') then alter table company_os.email_agents add constraint email_agents_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES company_os.brands(id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_agent_skills_agent_id_version_key') then alter table company_os.email_agent_skills add constraint email_agent_skills_agent_id_version_key UNIQUE (agent_id, version); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_agent_skills_pkey') then alter table company_os.email_agent_skills add constraint email_agent_skills_pkey PRIMARY KEY (id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_agent_skills_version_check') then alter table company_os.email_agent_skills add constraint email_agent_skills_version_check CHECK ((version >= 1)); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_agent_skills_agent_id_fkey') then alter table company_os.email_agent_skills add constraint email_agent_skills_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES company_os.email_agents(id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_messages_pkey') then alter table company_os.email_messages add constraint email_messages_pkey PRIMARY KEY (id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_messages_status_check') then alter table company_os.email_messages add constraint email_messages_status_check CHECK ((status = ANY (ARRAY['drafted'::text, 'held'::text, 'approved'::text, 'sending'::text, 'sent'::text, 'skipped'::text, 'cancelled'::text]))); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_messages_agent_id_fkey') then alter table company_os.email_messages add constraint email_messages_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES company_os.email_agents(id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_messages_interaction_id_fkey') then alter table company_os.email_messages add constraint email_messages_interaction_id_fkey FOREIGN KEY (interaction_id) REFERENCES company_os.interactions(id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_messages_person_id_fkey') then alter table company_os.email_messages add constraint email_messages_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_messages_routine_run_id_fkey') then alter table company_os.email_messages add constraint email_messages_routine_run_id_fkey FOREIGN KEY (routine_run_id) REFERENCES company_os.routine_runs(id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_messages_skill_id_fkey') then alter table company_os.email_messages add constraint email_messages_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES company_os.email_agent_skills(id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_events_pkey') then alter table company_os.email_events add constraint email_events_pkey PRIMARY KEY (id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_events_type_check') then alter table company_os.email_events add constraint email_events_type_check CHECK ((event_type = ANY (ARRAY['sent'::text, 'delivered'::text, 'delivery_delayed'::text, 'bounced'::text, 'complained'::text, 'opened'::text, 'clicked'::text, 'failed'::text]))); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_events_campaign_fk') then alter table company_os.email_events add constraint email_events_campaign_fk FOREIGN KEY (campaign_id) REFERENCES company_os.email_campaigns(id) ON DELETE SET NULL; end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_events_message_id_fkey') then alter table company_os.email_events add constraint email_events_message_id_fkey FOREIGN KEY (message_id) REFERENCES company_os.email_messages(id) ON DELETE SET NULL; end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'email_events_person_id_fkey') then alter table company_os.email_events add constraint email_events_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'books_format_check') then alter table company_os.books add constraint books_format_check CHECK ((format = ANY (ARRAY['nonfiction'::text, 'fable'::text]))); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'books_pkey') then alter table company_os.books add constraint books_pkey PRIMARY KEY (id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'books_slug_key') then alter table company_os.books add constraint books_slug_key UNIQUE (slug); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'books_status_check') then alter table company_os.books add constraint books_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published_web'::text, 'published_amazon'::text]))); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'books_brand_id_fkey') then alter table company_os.books add constraint books_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES company_os.brands(id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'book_chapters_book_id_sort_order_key') then alter table company_os.book_chapters add constraint book_chapters_book_id_sort_order_key UNIQUE (book_id, sort_order); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'book_chapters_pkey') then alter table company_os.book_chapters add constraint book_chapters_pkey PRIMARY KEY (id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'book_chapters_book_id_fkey') then alter table company_os.book_chapters add constraint book_chapters_book_id_fkey FOREIGN KEY (book_id) REFERENCES company_os.books(id) ON DELETE CASCADE; end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'marketing_recaps_period_month_key') then alter table company_os.marketing_recaps add constraint marketing_recaps_period_month_key UNIQUE (period_month); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'marketing_recaps_pkey') then alter table company_os.marketing_recaps add constraint marketing_recaps_pkey PRIMARY KEY (id); end if; end $$;
do $$ begin if not exists (select 1 from pg_constraint where conname = 'marketing_content_language_check') then alter table company_os.marketing_content add constraint marketing_content_language_check check (language in ('en', 'vi')); end if; end $$;

-- ── indexes and triggers ──
create index if not exists idx_taggables_entity ON company_os.taggables USING btree (entity_type, entity_id);
create index if not exists idx_person_companies_company ON company_os.person_companies USING btree (company_id);
drop trigger if exists set_person_companies_updated_at on company_os.person_companies;
CREATE TRIGGER set_person_companies_updated_at BEFORE UPDATE ON company_os.person_companies FOR EACH ROW EXECUTE FUNCTION company_os.handle_updated_at();
drop trigger if exists set_brand_profiles_updated_at on company_os.brand_profiles;
CREATE TRIGGER set_brand_profiles_updated_at BEFORE UPDATE ON company_os.brand_profiles FOR EACH ROW EXECUTE FUNCTION company_os.handle_updated_at();
create unique index if not exists marketing_pillars_brand_name_idx ON company_os.marketing_pillars USING btree (brand_id, lower(name));
drop trigger if exists set_marketing_pillars_updated_at on company_os.marketing_pillars;
CREATE TRIGGER set_marketing_pillars_updated_at BEFORE UPDATE ON company_os.marketing_pillars FOR EACH ROW EXECUTE FUNCTION company_os.handle_updated_at();
create index if not exists email_campaigns_created_idx ON company_os.email_campaigns USING btree (created_at DESC);
create index if not exists email_campaigns_brand_idx ON company_os.email_campaigns USING btree (brand_id);
create index if not exists email_campaigns_status_idx ON company_os.email_campaigns USING btree (status);
create unique index if not exists email_campaigns_series_send_key ON company_os.email_campaigns USING btree (series_id, scheduled_at) WHERE (series_id IS NOT NULL);
drop trigger if exists set_email_campaigns_updated_at on company_os.email_campaigns;
CREATE TRIGGER set_email_campaigns_updated_at BEFORE UPDATE ON company_os.email_campaigns FOR EACH ROW EXECUTE FUNCTION company_os.handle_updated_at();
create index if not exists email_campaign_recipients_due_idx ON company_os.email_campaign_recipients USING btree (campaign_id, status, send_after);
create index if not exists email_campaign_recipients_person_idx ON company_os.email_campaign_recipients USING btree (person_id);
create index if not exists email_campaign_recipients_queue_idx ON company_os.email_campaign_recipients USING btree (campaign_id, status) WHERE (status = 'pending'::text);
create index if not exists marketing_campaigns_pillar_idx ON company_os.marketing_campaigns USING btree (pillar_id);
create index if not exists marketing_campaigns_brand_idx ON company_os.marketing_campaigns USING btree (brand_id);
create unique index if not exists marketing_campaigns_utm_campaign_key ON company_os.marketing_campaigns USING btree (utm_campaign) WHERE (utm_campaign IS NOT NULL);
drop trigger if exists set_marketing_campaigns_updated_at on company_os.marketing_campaigns;
CREATE TRIGGER set_marketing_campaigns_updated_at BEFORE UPDATE ON company_os.marketing_campaigns FOR EACH ROW EXECUTE FUNCTION company_os.handle_updated_at();
create unique index if not exists marketing_content_blog_slug_key ON company_os.marketing_content USING btree (brand_id, slug) WHERE ((channel = 'blog'::text) AND (slug IS NOT NULL));
create index if not exists marketing_content_publish_idx ON company_os.marketing_content USING btree (publish_date);
create index if not exists marketing_content_brand_idx ON company_os.marketing_content USING btree (brand_id);
create index if not exists marketing_content_status_idx ON company_os.marketing_content USING btree (status);
create index if not exists marketing_content_pillar_idx ON company_os.marketing_content USING btree (pillar_id);
create index if not exists marketing_content_broadcast_idx ON company_os.marketing_content USING btree (broadcast_id) WHERE (broadcast_id IS NOT NULL);
create index if not exists marketing_content_campaign_idx ON company_os.marketing_content USING btree (campaign_id) WHERE (campaign_id IS NOT NULL);
drop trigger if exists set_marketing_calendar_updated_at on company_os.marketing_content;
CREATE TRIGGER set_marketing_calendar_updated_at BEFORE UPDATE ON company_os.marketing_content FOR EACH ROW EXECUTE FUNCTION company_os.handle_updated_at();
create index if not exists marketing_asset_images_entry_idx ON company_os.marketing_asset_images USING btree (entry_id, created_at DESC);
create unique index if not exists marketing_asset_images_one_selected ON company_os.marketing_asset_images USING btree (entry_id) WHERE is_selected;
create index if not exists email_messages_person_agent_idx ON company_os.email_messages USING btree (person_id, agent_id, sent_at DESC);
create index if not exists email_messages_send_idx ON company_os.email_messages USING btree (status, send_after) WHERE (status = 'approved'::text);
create index if not exists email_messages_resend_idx ON company_os.email_messages USING btree (resend_email_id) WHERE (resend_email_id IS NOT NULL);
create index if not exists email_messages_agent_status_idx ON company_os.email_messages USING btree (agent_id, status);
create unique index if not exists email_events_svix_idx ON company_os.email_events USING btree (svix_id) WHERE (svix_id IS NOT NULL);
create index if not exists email_events_message_idx ON company_os.email_events USING btree (message_id) WHERE (message_id IS NOT NULL);
create index if not exists email_events_person_idx ON company_os.email_events USING btree (person_id);
create index if not exists email_events_recipient_idx ON company_os.email_events USING btree (recipient);
create unique index if not exists email_events_dedupe_idx ON company_os.email_events USING btree (resend_email_id, event_type, occurred_at);
create index if not exists email_events_occurred_idx ON company_os.email_events USING btree (occurred_at DESC);
create index if not exists email_events_campaign_idx ON company_os.email_events USING btree (campaign_id) WHERE (campaign_id IS NOT NULL);
drop trigger if exists set_books_updated_at on company_os.books;
CREATE TRIGGER set_books_updated_at BEFORE UPDATE ON company_os.books FOR EACH ROW EXECUTE FUNCTION company_os.handle_updated_at();
drop trigger if exists set_book_chapters_updated_at on company_os.book_chapters;
CREATE TRIGGER set_book_chapters_updated_at BEFORE UPDATE ON company_os.book_chapters FOR EACH ROW EXECUTE FUNCTION company_os.handle_updated_at();
create index if not exists marketing_recaps_period_idx ON company_os.marketing_recaps USING btree (period_month DESC);

-- ── RPCs ──
CREATE OR REPLACE FUNCTION company_os.claim_campaign_batch(p_campaign_id uuid, p_limit integer, p_reclaim_after interval DEFAULT '00:30:00'::interval)
 RETURNS TABLE(id uuid, person_id uuid, email text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'company_os', 'public', 'extensions'
AS $function$
begin
  update company_os.email_campaign_recipients r
  set status = 'pending', claimed_at = null
  where r.campaign_id = p_campaign_id
    and r.status = 'claimed'
    and r.claimed_at < now() - p_reclaim_after;

  return query
  update company_os.email_campaign_recipients r
  set status = 'claimed', claimed_at = now()
  where r.id in (
    select r2.id
    from company_os.email_campaign_recipients r2
    where r2.campaign_id = p_campaign_id
      and r2.status = 'pending'
      and (r2.send_after is null or r2.send_after <= now())
    order by r2.send_after nulls first, r2.created_at, r2.id
    limit p_limit
    for update skip locked
  )
  returning r.id, r.person_id, r.email;
end;
$function$;
revoke all on function company_os.claim_campaign_batch from public, anon, authenticated;
CREATE OR REPLACE FUNCTION company_os.email_delivery_stats(p_since timestamp with time zone DEFAULT NULL::timestamp with time zone, p_campaign_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(event_type text, unique_emails bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'company_os', 'public', 'extensions'
AS $function$
  select e.event_type, count(distinct e.resend_email_id) as unique_emails
  from company_os.email_events e
  where (p_since is null or e.occurred_at >= p_since)
    and (p_campaign_id is null or e.campaign_id = p_campaign_id)
  group by e.event_type;
$function$;
revoke all on function company_os.email_delivery_stats from public, anon, authenticated;
CREATE OR REPLACE FUNCTION company_os.campaign_recipient_stats(p_campaign_id uuid)
 RETURNS TABLE(status text, n bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'company_os', 'public', 'extensions'
AS $function$
  select r.status, count(*) as n
  from company_os.email_campaign_recipients r
  where r.campaign_id = p_campaign_id
  group by r.status;
$function$;
revoke all on function company_os.campaign_recipient_stats from public, anon, authenticated;

-- ── the CRM reads, mahjong-shaped ──
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
  d.updated_at
from public.deals d;

create table if not exists company_os.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0
);

create table if not exists company_os.meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  started_at timestamptz not null,
  person_id uuid references public.people(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists company_os.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  blurb text,
  description text,
  location text,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

-- ── storage: generated hero and exhibit images ──
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('marketing', 'marketing', true, 10485760, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

-- ── security: service role only, like 053 ──
do $$
declare t text;
begin
  foreach t in array array['tags','taggables','person_companies','brand_profiles','marketing_pillars','email_audiences','email_series','email_campaigns','email_campaign_recipients','marketing_campaigns','marketing_content','marketing_asset_images','email_agents','email_agent_skills','email_messages','email_events','books','book_chapters','marketing_recaps','brand_contacts','pipeline_stages','meetings','events'] loop
    execute format('alter table company_os.%I enable row level security', t);
    execute format('grant select, insert, update, delete on company_os.%I to service_role', t);
  end loop;
end $$;
grant select on company_os.deals to service_role;
grant execute on function company_os.claim_campaign_batch, company_os.email_delivery_stats, company_os.campaign_recipient_stats to service_role;

