# Mahjong Tarot CRM — plan

**Date:** 2026-05-22
**Status:** Draft, not approved
**Owner:** Dave

## Goal

Bring the existing portal admin (currently just `/portal/admin/conversions`) up to feature parity with AIO's `/admin` CRM. One spine — `people` — joins together every human who interacts with the site: form submitter, lead, member, portal client.

## Reference

We're cloning the pattern that's already proven at `aio-website/`:
- `src/app/admin/*` — Next.js admin UI (sidebar + dashboard + people + contacts kanban + …)
- `supabase/001_normalized_schema.sql` — `people` + `inquiries` + `activity_log` + RPCs
- `src/lib/constants.ts` — `PIPELINE_STAGES`, `INQUIRY_TYPES`

AIO's migration comment literally says it's modeled on Mahjong's pattern. We're closing the loop.

## What we have today

Tables already exist in `public`:

| Table | Purpose | CRM role |
|---|---|---|
| `people` (28) | Inbound contacts | ✅ spine |
| `inquiries` (38) | Form submissions, FK→people | ✅ pipeline body |
| `leads` (1) | Email nurture state | ⚠️ overlap with people — collapse later |
| `clients` (2) | Astrologer-portal client records | 🔗 link to people |
| `profiles` (8) | Logged-in members (1:1 auth.users) | 🔗 link to people |
| `inner_circle` (7) | Profile's loved-ones | not CRM |
| `sessions`, `reports`, `readings`, `reading_types` | Practice data | not CRM (yet) |

Gaps vs. AIO:
1. `people` is missing `source_site`, `company`, `role` columns.
2. `inquiries.status` is a free-text default `'received'` — no pipeline stages.
3. `inquiries` is missing `source_site`.
4. No `activity_log`.
5. No CRM RPCs (`get_inquiries`, `update_inquiry_status`, etc.).
6. No `person_id` on `clients` or `profiles` — same human can exist 4 times unlinked.
7. No CRM UI beyond `/portal/admin/conversions`.

## Non-goals (for now)

- Stripe / orders / memberships. Mahjong has placeholder columns on `profiles` but zero integration. CRM ships **without** commerce; we add commerce when there's a buyer.
- Replacing the astrologer portal. `/portal` for the astrologer stays as-is. The CRM is a sibling under `/portal/admin/*`, gated by `role='admin'`.
- Multi-tenancy across other Dave projects. The `source_site` column is added so we *could* later, but mahjong stays single-site.

## Slice plan (vertical, ship-each-step)

### Slice 1 — Schema: normalize people + inquiries (this PR)

**Migration:** `website/supabase/020_crm_normalize.sql`
*(019 is taken by session_transcripts)*

Adds/changes (all additive, no destructive ops):

- `people`: add `source_site` (default `'themahjongtarot.com'`), `company`, `role`. Add `UNIQUE` index on `lower(email)` (existing rows already conform).
- `inquiries`: add `source_site`, change `status` default to `'new_lead'`, add CHECK constraint for `('new_lead','contacted','discovery_call','proposal','won','lost','archived')`. Backfill existing `'received'` rows to `'new_lead'`.
- `inquiries.type`: add CHECK constraint `('general','keynote','consultation','coaching','retreat','newsletter','reading')` — extends AIO's list with `reading` for mahjong's actual flow.
- New table `activity_log` (id, person_id?, inquiry_id?, action text, details jsonb, created_at).
- New columns `clients.person_id uuid references people(id)`, `profiles.person_id uuid references people(id)`. **Nullable** — backfill in a follow-up after the UI can show unlinked rows.
- Auto-update trigger for `people.updated_at` (mirrors AIO).
- RLS: keep existing policies. CRM RPCs are `SECURITY DEFINER` so they bypass RLS like AIO's do.

### Slice 2 — RPCs

**Migration:** `021_crm_rpcs.sql`

Port directly from AIO `001_normalized_schema.sql`:
- `submit_inquiry(...)` — upsert person on email, insert inquiry
- `submit_newsletter(...)` — same, type='newsletter'
- `get_inquiries(type?, status?, source_site?, limit, offset)` — paginated list w/ person joined
- `get_inquiry_detail(id)` — full record
- `update_inquiry_status(id, new_status)` — pipeline mutation, validates enum
- `get_inquiry_counts()` — group by type+status
- `update_person(id, name?, email?, …)` — edit contact

Grants to `anon` for the submit_* RPCs; admin RPCs gated by `is_admin()` check inside the function body.

### Slice 3 — Admin sidebar + dashboard skeleton

**Files:**
- `website/components/PortalAdminSidebar.jsx` — sidebar like AIO's, items: Dashboard · People · Inquiries · Conversions · Sessions
- `website/pages/portal/admin/index.jsx` — dashboard (counts + recent activity feed)
- Update `website/components/PortalNav.jsx` to link to `/portal/admin` for admins

Reuse the existing `/portal/admin/conversions` page — moves under the same sidebar.

### Slice 4 — People list

**File:** `website/pages/portal/admin/people.jsx`

Port of AIO's `/admin/people/page.tsx` simplified for what mahjong has (no orders, no memberships yet):
- Table: name, email, company/role, tags (inquiry types + `subscription_status` if linked to a client), source, last activity, first seen, consent (`ok_to_contact`)
- Filters: all / clients / portal-members / subscribers / opted-out
- Click row → detail drawer with all inquiries + linked client + profile

### Slice 5 — Inquiries kanban

**File:** `website/pages/portal/admin/inquiries.jsx`

Port of AIO's contacts page:
- List view (default) and Kanban view (drag-and-drop status change)
- Filters: type, source_site, date range
- Detail drawer with full inquiry + person info + status mutation
- Add `@hello-pangea/dnd` to `package.json`

### Slice 6 — Backfill identities (background)

One-time SQL job, run manually in prod:
- For every `clients` row with an email, find matching `people` row and set `clients.person_id`. If no people row, insert one and link.
- For every `profiles` row, find `auth.users.email`, match to `people`, set `profiles.person_id`. Insert if missing.
- For `leads` rows, ensure each has a `people` row, then plan deprecation of `leads` table in a future slice (its state lives on as `newsletter`-type inquiry + activity_log entries).

This is its own migration `022_crm_backfill_identities.sql` — runnable after the UI exists so we can verify before doing it.

## Decisions to confirm before slice 1

1. **Migration number:** 020. Confirm 019 is finalized and live.
2. **Pipeline stages:** copy AIO's verbatim? (`new_lead → contacted → discovery_call → proposal → won/lost`) — they're generic enough.
3. **Inquiry types:** AIO has 6. Mahjong's actual sources: contact form, booking inquiry, newsletter — and we should add `reading` for someone asking about a specific reading. Final list: `general, consultation, reading, retreat, newsletter, booking`. Confirm.
4. **Where the CRM lives:** `/portal/admin/*` (same Next.js app, role='admin' gated). Confirmed already.
5. **`leads` table fate:** keep for now, deprecate in slice 6 after backfill proves nothing breaks.

## File map (what gets added)

```
website/
├── supabase/
│   ├── 020_crm_normalize.sql        ← slice 1
│   ├── 021_crm_rpcs.sql             ← slice 2
│   └── 022_crm_backfill_identities.sql  ← slice 6
├── components/
│   ├── PortalAdminSidebar.jsx       ← slice 3
│   └── PortalAdminDashboard.jsx     ← slice 3
├── lib/
│   ├── crm/constants.js             ← slice 2 (mirror AIO's constants.ts)
│   ├── crm/inquiries.js             ← slice 4–5
│   └── crm/people.js                ← slice 4
└── pages/portal/admin/
    ├── index.jsx                    ← slice 3
    ├── people.jsx                   ← slice 4
    └── inquiries.jsx                ← slice 5
```

## Open questions

- Does the astrologer (firepig01) need any of this CRM access, or admin-only? **Suggested:** admin-only — astrologer keeps the existing `/portal` for sessions.
- When a portal `client` is created from the CRM (slice 4 detail view), should it auto-create the corresponding `people` row, or refuse? **Suggested:** auto-create, link via `person_id`.

## Risks

- Adding a CHECK constraint on `inquiries.status` after backfill — must run the backfill in the same migration, before adding the constraint, or it errors on existing `'received'` rows. (Migration handles this.)
- `people.email` unique index — already declared as `unique` in `001_initial_schema.sql`. Confirm no duplicate-email rows exist before adding the lower(email) index. (Migration checks first.)
- Slice 5 kanban depends on `@hello-pangea/dnd` — small dep, react 18 compatible.
