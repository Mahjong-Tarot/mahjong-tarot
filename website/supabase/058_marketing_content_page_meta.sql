-- 058_marketing_content_page_meta.sql: marketing platform port, blog from the database.
--
-- The public blog now reads company_os.marketing_content (decision 1 in
-- docs/engineering/2026-09-28-marketing-platform-port.md). Mahjong Tarot's
-- posts carry page extras edge8's schema has no column for: the hero's alt
-- text and caption, a bespoke end-of-post CTA, hand-picked related posts and
-- prev/next links. They live here; a post without them renders the defaults.
alter table company_os.marketing_content
  add column if not exists page_meta jsonb not null default '{}'::jsonb;

comment on column company_os.marketing_content.page_meta is
  'mahjong-tarot only: blog page extras {author, dateLabel, hero{alt,caption,width,height,useHeroClass}, cta{overline,heading,body,primary,primaryLabel,secondary,secondaryLabel}, related[{slug,title,dateLabel}], nav{prev,next}}.';
