# Marketing platform port: edge8-web `campaigns` → mahjong-tarot

Status: plan, 2026-09-28. Owner: Dave.

## Decision

Copy (not move) edge8-web's `campaigns` entity into mahjong-tarot so Dave runs Mahjong Tarot's
marketing with the same method he uses at Edge8. All features come over. Resend broadcasts
replace Brevo. The brand is Mahjong Tarot; the main channel today is Facebook (English).

## Approach: keep the edge8 shape so the two copies can stay in step

- Next 14 runs App Router and Pages Router side by side. The ported code goes into
  `website/app/` (TypeScript, server actions) and `website/entities/campaigns/`, with the same
  file layout as edge8-web. Existing Pages Router pages are untouched.
- A thin `website/kernel/` shim supplies only what campaigns imports from edge8's kernel
  (data client, admin guard, UI primitives, surface links, routine runs/audit, AI client,
  Lark/email messaging, config). Same export names, mahjong implementations.
- Tables go in a `company_os` schema in the mahjong Supabase project (`ntqmddmesgdquatodsyu`)
  with edge8's names and columns, so queries port unchanged. Mahjong's own data is exposed
  through compatibility views, not copied (see "Data mapping").
- Result: an improvement made in edge8 can be diffed and cherry-picked file-for-file.
  Mahjong-specific changes stay in brand data (`brand_profiles`) and the kernel shim, not in
  entity code, wherever possible.

Cost of this approach: mahjong gains TypeScript, `zod`, `resend`, `@react-email/*` and a
`vercel.json` (crons). Roughly 22k lines + 4k lines of tests arrive.

## Data mapping

| edge8 (`company_os`) | mahjong source | How |
|---|---|---|
| `people` | `public.people` (38.6k with email) | view: `ok_to_contact` → `marketing_consent`; `timezone` defaults to a brand zone; `is_team_member` false |
| `brands` | new | one row: `mahjong-tarot`, domain `www.themahjongtarot.com` (confirm) |
| `brand_profiles` (brand context) | `agents/writer/context/*`, `agents/web-developer/context/web-style-guide.md`, `agents/designer/context/style-guide.md`, `.claude/skills/writer` | seed migration, rewritten for Mahjong Tarot: voice, audience, offer, CTA, channels (Facebook English first), blog styles, image style, SEO lens |
| `marketing_pillars` | blog categories in the web style guide | seed |
| `interactions` | `activity_log`? | decide: new table vs view |
| `email_events` | `public.email_events` (Brevo) | new `company_os.email_events` for Resend; keep Brevo history read-only |
| `tags`, `taggables`, `companies`, `deals`, `pipeline_stages` | `deals`, `lifecycle_stage`, `nurture_*` | audience rules rewritten against mahjong fields |
| campaigns' 15 owned tables | none | copy edge8 migrations, consolidated into numbered files in `website/supabase/` |

## Phases

Each phase ships as its own PR, verified by `npm run build` plus the ported Vitest suite.

**0. Foundations**
TypeScript + App Router in `website/`; kernel shim; `company_os` schema; compatibility views;
admin guard from `profiles.role = 'admin'`; a marketing
section in the admin nav. New env vars added to `.env.local`.

**1. Brand context**
`brands`, `brand_profiles`, `marketing_pillars`, style catalogues, seeded for Mahjong Tarot.
Brands screen to edit them. Replace Edge8/Dave/Vietnam strings in prompts with profile fields.

**2. Email: broadcasts, audiences, unsubscribe, delivery tracking**
`vercel.json` crons with `CRON_SECRET`; Resend sending domain verified; send engine (`email-campaign-send`, batch claim RPC, send cap,
send windows); Resend webhook → `email_events`; one-click unsubscribe writing
`ok_to_contact = false`; audiences over mahjong people.
Brevo cutover: stop the `051` newsletter trigger, route new signups to `people` consent,
warm the Resend domain with engaged contacts before the full 38k list.

**3. Content engine: calendar, assets, writer, images, blog publish**
Calendar with pillars and channels (Facebook first), asset images (Gemini, bucket
`marketing`), writer agent, publish editor, marketing digest emailed to Dave.
Blog publish needs a DB-backed blog route next to the 41 existing static JSX posts.

**4. Everything else**
Recurring series, weekly letter (Bill's voice, new sources), personal email agents,
recaps and weekly pulse (emailed), books (The Mahjong Mirror), broadcast summary.

## Decisions (2026-09-28)

1. **Blog publishes from the database** (edge8 method). The 41 existing static JSX posts
   under `website/pages/blog/posts/` are migrated into `marketing_content` rows (Phase 3), and
   the blog index, post route, sitemap and RSS read from the database. `build-page` retires.
2. **Revenue board sync is ported.** Mahjong has no boards feature, so the board tables and a
   Revenue board screen come over with it (Phase 4).
3. **Weekly letter is Bill's.** Sources and voice are to be discussed; it is a follow-up task
   after Phase 4, not part of this port.
4. **Vietnamese Facebook is coming.** Content gets a language field (`en` / `vi`) in Phase 3;
   the channel list offers Facebook (EN) and Facebook (VI).
5. **Time zone is US Eastern** (`America/New_York`) for send windows, schedules and crons.
   `saigonToday()` and friends become brand-zone helpers in the kernel shim.
6. **No Lark.** Marketing notices (digest, recap, pulse, writer steps, broadcast summaries)
   are emailed to `dave@edge8.ai` via Resend. The shim's `notifyMarketing` sends email.

## Progress

- 2026-09-28, PR #436: Phase 0 foundations (kernel slice, App Router, migration 053).
- 2026-09-29: the campaigns entity copied whole from edge8-web origin/main (`website/entities/campaigns`), with
  stand-ins for the other edge8 entities it reads (`website/entities/{contacts,site,crm,company-os,library,retreats,boards,billing}`),
  the Resend webhook, unsubscribe, publish editor and broadcast summary. Migrations 054 (the 19 campaigns and contacts
  tables, generated from edge8's live schema), 055 (run log ticks, ai_calls), 056 (deals view), 057 (Mahjong Tarot brand
  profile and pillars). Brand, time zone (US Eastern), writer rules (cards not tiles), prompts and palette adapted.
  Crons are routed but not scheduled (`website/vercel.json` has no crons yet).
- 2026-09-29: the blog reads the database. All 41 posts loaded into `company_os.marketing_content` (migration 058
  adds `page_meta` for their hero alt, CTA, nav, related, og/canonical/JSON-LD), `lib/posts.js` and
  `lib/blogContent.js` removed, `/blog`, `/blog/posts/[slug]`, the homepage journal and the sitemap read
  `website/lib/blogDb.js`. `content/blog/<slug>.md` stays the authoring format for the build-page skill and reaches
  the site through `website/scripts/publish-blog-post.mjs`. Verified byte-identical against production for all 41
  posts (main and head), `/blog` and the sitemap. The marketing platform's links use `/blog/posts/<slug>`.
- 2026-09-29: the Revenue board. Migration 059 creates edge8's board tables (boards, board_columns, board_members,
  tasks, task_stage_log) and seeds the "Revenue" board (flagged `content_board`). `website/entities/boards` holds the
  reads/writes, card moves and subtask ticks (slimmed from edge8's land-card), and the screen at
  `/admin/revenue/board`. `instrumentation.ts` registers the campaigns listener, so a ticked post goes Published and a
  day moved to Done closes its posts; the event registry lives on `globalThis` because Next bundles instrumentation
  separately from routes. Verified end to end locally against production data (test rows removed).
- 2026-09-29: go-live. `website/vercel.json` schedules 11 routines in UTC for US Eastern mornings (writer 06:00,
  blog publish 07:00, digest 08:00, broadcast summary 09:20, Monday pulse 09:00, recap on the 4th; sends every
  15 minutes). The weekly letter is **not** scheduled (follow-up below). Migration 060 stops the Brevo newsletter sync
  and makes a newsletter signup (re)subscribe the person.

## Go-live checklist (Dave)

Production environment variables in Vercel (project `mahjong-tarot`), names only; values in `website/.env.local`:
`CRON_SECRET`, `UNSUBSCRIBE_SECRET`, `EMAIL_FROM`, `MARKETING_EMAIL_FROM`, `MARKETING_REPLY_TO`, `MARKETING_TEST_TO`,
`MARKETING_NOTIFY_EMAIL`, `MARKETING_POSTAL_ADDRESS` (required in every broadcast footer), `RESEND_WEBHOOK_SECRET`,
`VERCEL_ANALYTICS_TOKEN`, `NEXT_PUBLIC_SUPPORT_EMAIL`, `NEXT_PUBLIC_ORG_NAME`. `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`
and `RESEND_API_KEY` should already be set.

Resend webhook: endpoint `https://www.mahjongtarot.com/api/webhooks/resend`, events sent / delivered /
delivery_delayed / bounced / complained / opened / clicked / failed; its signing secret is `RESEND_WEBHOOK_SECRET`.

First sends: warm `mahjongtarot.com` on engaged contacts before the full 37k list (an audience of recent openers,
batch size 150), and check the list-validation reports in `docs/engineering/email-list-validation*` first.

## Follow-up tasks

1. **Weekly letter (Bill's voice)**: decide its sources (edge8's reads a Notion journal, meetings and retreat events)
   and calls to action, adapt `entities/campaigns/lib/letter/*`, then schedule `letter-weekly`.
2. Personal email agents read edge8's AIOlabz learner progress (`lib/learner-progress.ts`); it no-ops without
   `AIOLABZ_*` and can be removed or replaced with Mahjong member data.
3. Instagram and Vietnamese Facebook as calendar channels: content has `language` (en/vi); the channel list and
   writer prompts still offer edge8's set (blog, email, LinkedIn, Facebook, Twitter).
