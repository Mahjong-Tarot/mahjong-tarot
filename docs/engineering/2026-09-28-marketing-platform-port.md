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
