# Astrologer Portal — Implementation Plan

**Source spec:** the `Astrologer Portal — Implementation Spec` (2026-05-19) provided in chat
**This doc:** maps each spec section to the actual files in the repo, flags collisions, calls out open questions, and lists the file-level changes per PR.
**Date:** 2026-05-19
**Revised:** 2026-05-20 — see Revision Log below
**Branch for PR #1:** `feat/portal-01-roles` (shipped)

---

## Revision Log

### 2026-05-20 — stakeholder direction change (Dave)

After PRs #1–#5 shipped, stakeholder feedback rerouted PRs #6–#9. Key changes:

1. **Drop Anthropic API.** No automated report generation in v1. Bill (or an admin) pastes a transcript + optional summary; the report is written by a human into a textarea. Long-term automation may come back via the LLM workflow described in §8.
2. **Hide Krisp connect UI.** Bill won't adopt new tools easily; scheduling and meeting-source connections will be handled by admins (or an AI agent) on his behalf later. The `lib/meetingSources/` abstraction, migration `017_meeting_source_connections.sql`, and the connect pages remain in the repo but are unlinked from the nav.
3. **Sessions view: full list + calendar, no time cap.** Replace the "next 2 weeks" `/portal` dashboard with a grouped-by-week view (past + future) plus a list/calendar toggle. Default tab: Upcoming.
4. **Subscription becomes an icon, not a filter chip.** Bill sees subscription status inline. The filter chip is removed.
5. **Admins get a dedicated conversions dashboard.** New `/portal/admin/conversions` page (admin-only): cross-astrologer client list, status filter, warm-lead sort, quick actions.
6. **Transcript editing scope expands.** Admins can paste transcripts on Bill's behalf — RLS loosens so `role='admin'` can write any astrologer's session/report rows.
7. **`ANTHROPIC_API_KEY` no longer required.** Removed from the env-var list. `REPORT_MODEL` also removed.

Revised PR plan: see §3 below. PRs #6–#9 are fully rewritten; sections marked **(superseded)** are kept for history.

---

## 1. Survey of current state (what exists today)

### Auth and profiles

- [website/lib/auth.js](website/lib/auth.js) — `AuthProvider` returns only `{ user, loading, signOut }`. It does **not** fetch a profile row on auth-state change. The `onAuthStateChange` callback only stores `session?.user`.
- [website/lib/supabase.js](website/lib/supabase.js) — single anon client (`createClient(SUPABASE_URL, ANON_KEY)`). **No SSR helper, no service-role client, no cookie-aware client.**
- [website/pages/_app.jsx](website/pages/_app.jsx) — minimal. No post-login redirect logic, no role gate.
- [website/supabase/004_user_profiles_and_inner_circle.sql](website/supabase/004_user_profiles_and_inner_circle.sql) — `public.profiles` columns:
  ```
  user_id (uuid PK → auth.users(id) ON DELETE CASCADE)
  name        text
  birthday    date
  birth_time  time
  birth_place text
  gender      text  -- check 'M'/'F'/null
  pillars     jsonb
  created_at  timestamptz default now()
  updated_at  timestamptz default now()
  ```
  No `role` column. RLS enabled with three "Users (read|insert|update) own profile" policies — all keyed on `auth.uid() = user_id`.

### Pages, routes, admin

- [website/pages/admin.jsx](website/pages/admin.jsx) — **NO auth gate.** Only checks if the supabase client is configured. Anyone with a session can hit it. Spec §2.3 calls for retrofitting; this is also a security finding worth flagging on its own. (See Open Question 3.)
- `website/pages/portal/` — **does not exist.** Clean slate.
- Existing post-login flow: [website/pages/sign-in.jsx](website/pages/sign-in.jsx) and [website/pages/signup.jsx](website/pages/signup.jsx) both `router.push('/dashboard')` on success. Spec wants portal users to land on `/portal`; we'll redirect from `/dashboard` once role is known, or branch in sign-in.

### Edge functions vs Node API routes (important)

The repo has **two** patterns for server-side code, and the spec assumes one (edge functions). Reality:

- [website/supabase/functions/notify-inquiry/index.ts](website/supabase/functions/notify-inquiry/index.ts) — **Deno + TypeScript** edge function. Used as a Supabase webhook (triggered by a DB insert on `inquiries`). Not user-triggered.
- [website/pages/api/reply.js](website/pages/api/reply.js) — **Next.js Node API route, JS.** User-triggered (admin clicks "Send Reply"). Calls Resend via `fetch('https://api.resend.com/emails', …)`. Uses env vars `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_REPLY_TO`.

**Recommendation:** for `generate-report` and `send-report` (both user-triggered), use **Next.js API routes** at `website/pages/api/admin/generate-report.js` and `…/send-report.js` rather than Deno edge functions. Reasons:

1. The spec mandates "JavaScript only (no TypeScript)" for the website app. Adding new TS edge functions splits the language. The existing `api/reply.js` precedent is JS.
2. User-triggered flows want cookie-based session auth — straightforward with `getServerSideProps`-style cookie reads in API routes, awkward in Deno edge functions.
3. Resend is already wired via `api/reply.js`. Same env vars, same pattern.
4. Edge functions are still the right shape for the OAuth callback exchange (`meeting-source-oauth-exchange`) if we want server-to-server token handling out of Vercel's runtime, but even that can be a Node API route.

This is **Open Question 1** below — it changes the file paths in PRs 5–8 substantially.

### Email transport

Resend is already in use via `api/reply.js`. New report email reuses the same envs.

### Packages

[website/package.json](website/package.json) dependencies:

```
@supabase/supabase-js  ^2.103.0
@vercel/analytics      ^2.0.1
iztro                  ^2.5.8
lunar-typescript       ^1.8.6
next                   ^14.0.0
react                  ^18.0.0
react-dom              ^18.0.0
```

**Missing — to be added across the PR series:**

| Package | Used for | When | PR |
|---|---|---|---|
| `marked` | markdown→HTML for report view + email | View/send report | 7, 8 |
| `@supabase/ssr` *(or rolling own cookie parser)* | server-side session read in `requirePortalUser` | Route protection | 1 |
| `@anthropic-ai/sdk` *(or direct `fetch`)* | report generation | Generate report | 7 |

No new global tooling (no ESLint changes, no Tailwind, no test framework).

### Styles

CSS modules with PascalCase: `Admin.module.css`, `Dashboard.module.css`, etc. Global tokens live in [website/styles/globals.css](website/styles/globals.css):

- Surfaces: `--paper`, `--paper-pure`
- Text: `--ink`, `--ink-2`, `--ink-3`, `--ink-4`
- Brand: `--fire-500` (primary), `--gold`, `--gold-soft`
- Spacing scale: `--space-xs` (4) through `--space-3xl` (96)
- Fonts: `--serif` (Fraunces), `--sans` (Inter), `--mono` (JetBrains)

New portal CSS modules will follow PascalCase: `Portal.module.css`, `PortalClients.module.css`, `PortalClient.module.css`, `PortalReport.module.css`, `PortalSettings.module.css`.

### Nav

[website/components/Nav.jsx](website/components/Nav.jsx) drives links from `useAuth().user`. No role-aware variants. Plan: add a `PortalNav` for `/portal/*` rather than overloading `Nav`. Members shouldn't see portal links, and astrologers shouldn't see member readings while inside the portal.

### Existing `getServerSideProps` usage

- [website/pages/sitemap.xml.js](website/pages/sitemap.xml.js) — sitemap generation
- [website/pages/almanac/index.jsx](website/pages/almanac/index.jsx) — public data
- [website/pages/horoscopes/forecast/index.jsx](website/pages/horoscopes/forecast/index.jsx) — public data

**None of these read the Supabase session cookie.** `requirePortalUser` is a new pattern for this codebase.

### Collision check

Searched migrations for `clients`, `sessions`, `reports`, `meeting_source_connections`, `is_portal_user`, `is_admin`:

- **No table or function collisions.** Safe to use those names as-is from the spec.

---

## 2. Resolved decisions

All eight open questions resolved 2026-05-19. Locked answers below.

### OQ1 — Server runtime for user-triggered flows: **Next.js API routes**

Files under `pages/api/admin/*.js`. Matches existing `api/reply.js` precedent. JS-only. Cookie-based auth via `@supabase/ssr` (OQ2). The spec's `supabase/functions/<name>` paths are translated as:

| Spec path | Actual path |
|---|---|
| `supabase/functions/meeting-source-oauth-exchange/index.ts` | `pages/api/admin/meeting-source/oauth-exchange.js` |
| `supabase/functions/meetings-list/index.ts` | `pages/api/admin/meetings/list.js` |
| `supabase/functions/meetings-fetch/index.ts` | `pages/api/admin/meetings/fetch.js` |
| `supabase/functions/generate-report/index.ts` | `pages/api/admin/reports/generate.js` |
| `supabase/functions/send-report/index.ts` | `pages/api/admin/reports/send.js` |

Each handler:
1. Reads the Supabase session via `@supabase/ssr` cookie client
2. Calls `is_portal_user()` (RPC) to verify the caller
3. Delegates to `lib/meetingSources` / `lib/reports` as appropriate

### OQ2 — SSR helper: **install `@supabase/ssr`**

Added to `website/package.json` in PR #1. Used by:
- `lib/requirePortalUser.js` and `lib/requireAdmin.js` (PR #1)
- Every `pages/api/admin/**` handler (PRs 5–8)

### OQ3 — `/admin` gate: **fold into PR #1**

`pages/admin.jsx` gets `getServerSideProps` calling `requireAdmin`. PR #1 title becomes "roles foundation + admin gate".

### OQ4 — Post-login redirect: **in `sign-in.jsx` and `signup.jsx`**

After `signInWithPassword` / `signInWithOtp` succeeds, fetch `profiles.role` for the new session's user, then:
```js
router.push(role === 'astrologer' || role === 'admin' ? '/portal' : '/dashboard');
```
No `_app.jsx` changes.

### OQ5 — `useAuth().profile` shape (informational)

`profile.id` will be the `profiles.user_id` value (the table's primary key). Consumers should treat it as the user ID. Documented in the JSDoc comment on the context value.

### OQ6 — Seed astrologers — **emails confirmed**

```sql
-- website/supabase/seed-astrologers.sql (runbook, not auto-applied)

update public.profiles set role = 'admin'
where user_id = (select id from auth.users where email = 'dhajdu@gmail.com');

update public.profiles set role = 'astrologer'
where user_id = (select id from auth.users where email = 'firepig01@gmail.com');

update public.profiles set role = 'admin'
where user_id = (select id from auth.users where email = 'yon@edge8.co');
```

Role rationale: Dave's father is the practitioner (astrologer). Dave and Yon are operators (admin — full access including `/admin` inquiry dashboard).

### OQ7 — Production domain: **`mahjongtarot.com` (no hyphen)**

All hardcoded URLs use the no-hyphen form. Krisp OAuth redirect:
```
https://mahjongtarot.com/portal/settings/meeting-source/callback?source=krisp
```
The GitHub repo name `mahjong-tarot` is unchanged — only the live domain matters here.

### OQ8 — Krisp readiness (blocks PR #5 only) — **Deferred indefinitely (2026-05-20)**

Originally: Krisp OAuth app + env vars required before PR #5 merges.

**Update (2026-05-20):** Krisp's OAuth client creation now requires a paid tier upgrade we don't want to pay for. The connect UI shipped in PR #5 is hidden from the nav (see new PR #6). The underlying `lib/meetingSources/` abstraction stays in place so any service (Krisp paid, Zoom, Otter, etc.) can plug in later as a single file. No env vars needed in v1.

---

## 3. PR-by-PR plan

Each section lists: scope, files created/modified, migrations, env vars, smoke test, and risk.

---

### PR #1 — Roles foundation (this branch: `feat/portal-01-roles`) — ✅ Shipped (#217)

**Scope.** Add `role` column and helper functions to Postgres. Extend `useAuth()` to expose `profile`, `role`, `isPortalUser`. Add the SSR gate helper. Retrofit `/admin`. Commit the seed runbook.

**Files created:**

- `website/supabase/016_roles.sql` — exactly the SQL from spec §2.1
- `website/supabase/seed-astrologers.sql` — runbook only (commit but don't auto-apply); placeholders replaced once OQ6 is answered
- `website/lib/requirePortalUser.js` — new SSR helper. Reads Supabase session via `@supabase/ssr`, loads the profile, redirects to `/` if role isn't `astrologer`/`admin`, otherwise returns `{ props: { profile } }`.
- `website/lib/requireAdmin.js` — same shape, requires `role === 'admin'`. Used by `/admin`.

**Files modified:**

- `website/lib/auth.js` — fetch profile row inside `onAuthStateChange`. Extend the context value to:
  ```js
  {
    user, loading, signOut,
    profile,                                       // row from public.profiles or null
    role: profile?.role || 'member',
    isPortalUser: profile?.role === 'astrologer' || profile?.role === 'admin'
  }
  ```
  Handle the sign-out case (clear profile).

- `website/pages/_app.jsx` — no functional change (post-login redirect handled in sign-in.jsx per OQ4). Just leave as-is unless OQ4 flips.

- `website/pages/sign-in.jsx` — after `signInWithPassword` and `signInWithOtp`, fetch the user's profile, branch:
  ```js
  const { data: prof } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', data.session.user.id)
    .maybeSingle();
  router.push(prof?.role === 'astrologer' || prof?.role === 'admin' ? '/portal' : '/dashboard');
  ```

- `website/pages/signup.jsx` — same branch. New signups will be `member` by default, so this almost always pushes to `/dashboard`, but covers the case where an admin user pre-creates the profile row.

- `website/pages/admin.jsx` — add `export async function getServerSideProps(ctx) { return requireAdmin(ctx); }` at the top. (OQ3.)

- `website/package.json` — add `@supabase/ssr` as a dep.

**Env vars touched:** none new.

**Smoke test (manual after merge):**

1. Apply migration `016_roles.sql` against the dev Supabase project
2. Sign in as a `member` user → land at `/dashboard`
3. Manually update one row in `profiles` to `role = 'admin'` → sign out, sign in again → land at `/portal` *(/portal will 404 until PR #2 — verify the redirect *attempts* `/portal`)*
4. Hit `/admin` while logged in as `member` → redirected to `/`
5. Hit `/admin` while logged in as `admin` → admin dashboard renders

**Risk.** Low. RLS changes none. The migration only adds a column with a default — existing rows become `member`. No data loss path.

**Rollback.** `git revert` the merge commit. The DB column remains harmless (default `'member'`). Optionally drop the column in a follow-up migration if a full rollback is needed.

---

### PR #2 — Portal shell — ✅ Shipped (#218)

**Scope.** `/portal` exists and renders an empty layout for portal users. Sign-in redirect now lands somewhere real.

**Files created:**

- `website/pages/portal/index.jsx` — placeholder content. Calls `requirePortalUser` in `getServerSideProps`.
- `website/components/PortalNav.jsx` + `website/components/PortalNav.module.css` — sidebar or top nav for portal pages. Links: Upcoming, Clients, Settings.
- `website/styles/Portal.module.css` — portal layout (sidebar + main column).

**Files modified:** none.

**Smoke test.** Sign in as astrologer → `/portal` renders, sidebar visible, no console errors.

**Risk.** None.

---

### PR #3 — Data model + manual client CRUD — ✅ Shipped (#220)

**Scope.** Migration `018_astrologer_portal.sql` (note: spec uses 018 because 017 is the meeting_source table introduced in PR #5; we'll keep 018 here even though it lands first chronologically — see OQ-numbering note below). Pages for clients list, new client, client profile, manual session create.

**OQ-numbering note.** Spec §4 calls the clients/sessions/reports migration `018_astrologer_portal.sql` and §3.3 calls the meeting-source-connections migration `017_meeting_source_connections.sql`. If we ship PR #3 before PR #5, the file numbering doesn't match the merge order. Two options:

- **A (recommended):** Keep the spec's numbering. Migrations are file-numbered, not strictly merge-ordered. `017_*` sits in the repo unapplied until PR #5; Supabase applies in filename order. PR #3 ships `018_*` alone, which applies cleanly because it doesn't reference anything in `017_*`.
- **B:** Renumber: clients = `016_` (after roles, no — `016_` is roles), so clients = `017_…_astrologer_portal.sql`, meeting sources = `018_meeting_source_connections.sql`.

Going with A unless flagged.

**Files created:**

- `website/supabase/018_astrologer_portal.sql` — exactly the SQL from spec §4 and §4.1
- `website/pages/portal/clients/index.jsx` — searchable list
- `website/pages/portal/clients/new.jsx` — create form
- `website/pages/portal/clients/[id].jsx` — client profile (no "attach meeting" yet — that lands PR #6)
- `website/pages/portal/sessions/new.jsx` — schedule a session (manual, no meeting source yet)
- `website/lib/clients.js` — client queries: `listClients`, `getClient`, `createClient`, `updateClient`, `markSubscription`
- `website/lib/sessions.js` — `listSessions`, `createSession`, `updateSession`
- `website/styles/PortalClients.module.css`, `PortalClient.module.css`

**Smoke test.** Create a client manually. Open `/portal/clients/<id>`. Create a session for that client. Sign-out, sign in as `member` → can't read those clients (RLS blocks because `is_portal_user()` returns false).

**Risk.** Low. New tables, no touching of existing ones.

---

### PR #4 — Upcoming Clients dashboard — ✅ Shipped (#223) — **superseded by new PR #6**

**Scope.** `/portal/index.jsx` becomes the real dashboard: today/this-week sessions, subscription filter chip, subscription badges.

**Files modified:** `website/pages/portal/index.jsx`

**Files created:** none new (uses lib/sessions, lib/clients from PR #3).

**Smoke test.** Schedule a session for tomorrow → it appears on the dashboard. Filter "Not yet subscribed" hides clients with `subscription_status = 'active'`.

**Risk.** None.

---

### PR #5 — Meeting source abstraction + Krisp connect screen — ✅ Shipped (#224) — UI to be hidden in new PR #6

**Scope.** Pluggable adapter layer. Krisp OAuth start + callback exchange. UI for the connect screen.

**Files created:**

- `website/supabase/017_meeting_source_connections.sql` — exactly the SQL from spec §3.3
- `website/lib/meetingSources/index.js` — the adapter registry + `getActiveMeetingSource()` from spec §3.2
- `website/lib/meetingSources/krisp.js` — `startOAuth` and `completeOAuth` only in this PR (PKCE, OAuth discovery via `.well-known/oauth-protected-resource`). Stubs for `listMeetings`/`fetchMeeting` that throw `Error('not implemented')`.
- `website/pages/portal/settings/meeting-source/index.jsx` — connect cards
- `website/pages/portal/settings/meeting-source/callback.jsx` — OAuth redirect target. Posts to the exchange endpoint.
- Either `website/pages/api/admin/meeting-source/oauth-exchange.js` (OQ1=A) or `website/supabase/functions/meeting-source-oauth-exchange/index.ts` (OQ1=B)

**Env vars new:**

- `KRISP_OAUTH_CLIENT_ID`
- `KRISP_OAUTH_REDIRECT_URI` (e.g. `https://<domain>/portal/settings/meeting-source/callback?source=krisp`)
- `MEETING_SOURCE_DEFAULT` (defaults to `krisp` if unset)

**Smoke test.** Click "Connect Krisp" → redirected to Krisp's OAuth → consent → bounced back to `/portal/settings/meeting-source/callback` → row appears in `meeting_source_connections`.

**Risk.** Medium. OAuth + PKCE + dynamic discovery. Test against Krisp's real flow before merging.

---

### PR #6 — Sessions view redesign + cleanup (revised 2026-05-20)

**Scope.** Replaces the "next 2 weeks" dashboard from PR #4 with a full sessions view. Removes the subscription filter chip in favor of an inline icon. Hides the Krisp connect UI from nav.

**UX:**

- `/portal/index.jsx` becomes a sessions view with two tabs: **Upcoming** (default) and **Past**.
- Each tab supports two view modes via toggle: **List** (grouped by week — `This week`, `Next week`, `Week of <Mon date>`) and **Calendar** (month grid with session pills on the day).
- No time cap. Pagination only if the list grows beyond ~3 weeks of past data (lazy-load older weeks on scroll). Initial render: current week + 2 weeks forward / 2 weeks back.
- Each session card/pill shows a small subscription-status icon next to the client name:
  - ◯ not subscribed
  - ● subscribed (active)
  - ◐ lapsed
  - ⊘ cancelled
- The "Not yet subscribed" filter chip is removed. (Admin-side filtering moves to the new admin conversions dashboard — see PR #9.)
- `PortalNav.jsx`: remove the "Settings → Meeting source" link. The page itself stays at `/portal/settings/meeting-source` (still reachable by URL) but is unlinked. Add a small note on that page: "Meeting-source automation is on hold — admins schedule sessions manually for now."

**Files modified:**

- `website/pages/portal/index.jsx` — full rewrite of dashboard
- `website/components/PortalNav.jsx` — drop the meeting-source link
- `website/pages/portal/settings/meeting-source/index.jsx` — add the "on hold" banner
- `website/lib/sessions.js` — extend `listSessions` to accept `{ range: 'upcoming' | 'past', weekStart, weekEnd }`

**Files created:**

- `website/components/SessionsCalendar.jsx` + `SessionsCalendar.module.css` — month view, week starts Monday, today highlighted
- `website/components/SessionsList.jsx` + `SessionsList.module.css` — weekly grouping component
- `website/components/SubscriptionIcon.jsx` — small icon mapped to `subscription_status`
- `website/styles/PortalHome.module.css` — new layout (was using `Portal.module.css`)

**Migrations:** none.

**Env vars:** none.

**Smoke test.**
1. Sign in as Bill → land at `/portal` → see Upcoming tab with this-week + next-week sessions
2. Toggle to Past → see prior sessions grouped by week
3. Toggle to Calendar → see month view with session pills on the right days
4. Subscription icons render per-client
5. Sidebar no longer shows the "Meeting source" link

**Risk.** Low — UI-only. Existing data unchanged. The PR #4 dashboard logic is replaced wholesale, so verify the data fetch path doesn't accidentally orphan the subscription badge work that already shipped.

---

### PR #7 — Manual transcript + report textarea (revised 2026-05-20)

**Scope.** After a session, Bill (or an admin) pastes the Zoom AI Companion transcript + summary into the session record. A new `/portal/reports/[id]` page renders an editable report textarea where Bill pastes the polished report he produced from his Claude.ai Project. **No Anthropic API call.**

**Migration `019_session_transcripts.sql`:**

```sql
alter table public.sessions
  add column if not exists transcript_text  text,
  add column if not exists summary_text     text;

-- Loosen RLS so admins can edit any astrologer's sessions/reports.
-- Existing policies on these tables key on auth.uid() ownership; the new policies
-- add an OR clause for role='admin' read/write. See migration file for exact SQL.
```

(Exact migration SQL committed in the file; uses `is_admin()` helper from PR #1's `016_roles.sql`.)

**Files created:**

- `website/supabase/019_session_transcripts.sql` — adds the two columns + admin-bypass RLS policies on `sessions` and `reports`
- `website/pages/portal/reports/[id].jsx` — view + edit. Textareas for `report.body_markdown` (the polished text Bill pastes from Claude.ai) and session `transcript_text` / `summary_text`. Save button persists. No regenerate, no API call.
- `website/lib/reports.js` — `getReport`, `updateReport`. Simpler than the original PR #7 plan — no `markGenerating`/`markReady`/`markFailed`.
- `website/styles/PortalReport.module.css`
- `website/components/TranscriptPasteForm.jsx` — paste form embedded in the session view; opens or links to the report row

**Files modified:**

- `website/pages/portal/clients/[id].jsx` — each session row gets an "Open report" link and a "Paste transcript" link (or one combined action)
- `website/lib/sessions.js` — `updateSession` accepts the new fields

**Env vars:** none. No `ANTHROPIC_API_KEY`. No `REPORT_MODEL`.

**Packages:** none new. (No `@anthropic-ai/sdk`. `marked` deferred to PR #8 where rendered HTML is actually used.)

**Status field:**

- `reports.status` stays in the schema (already created in PR #3) but its lifecycle simplifies to: `draft` → `sent`. No `generating`/`ready`/`failed` states.

**Smoke test.**
1. As Bill: open a past session → click "Paste transcript" → paste a sample transcript + summary → save
2. Open the report → paste polished markdown into the body textarea → save
3. Sign in as admin (Yon) → repeat on a session that belongs to Bill, not the admin → succeeds (RLS bypass works)
4. Sign in as a member → can't read either record (RLS still blocks non-portal users)

**Risk.** Low. New columns are nullable. RLS change is additive (adds policies, doesn't remove). No external service calls.

---

### PR #8 — Send report by email + subscription CTA (revised 2026-05-20)

**Scope.** "Send to client" button on `/portal/reports/[id]` → renders `body_markdown` to HTML → emails via Resend with a subscription CTA at the bottom. Same as the original PR #8 — the only change is dropping any dependency on PR #7 having generated the report (the source is now the manually-pasted textarea).

**Files created:**

- `website/pages/api/admin/reports/send.js` — Resend-backed handler. Markdown→HTML via `marked`. CTA links to a TBD landing page or `mailto:` reply.

**Files modified:**

- `website/pages/portal/reports/[id].jsx` — Send button + `sent_at` display; locks the body textarea once sent (or allows resend with a confirm).

**Migrations:** none.

**Env vars:** reuses `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_REPLY_TO`. No new vars.

**Packages:** `marked` (new).

**Smoke test.**
1. Click Send → client receives an email rendering the markdown
2. CTA renders at the bottom
3. `reports.status` flips to `sent`, `sent_at` populated, `email_message_id` stored
4. Resend works for both Bill (astrologer) and admin acting on Bill's behalf

**Risk.** Low. Resend already proven via `api/reply.js`.

---

### PR #9 — Admin conversions dashboard (new 2026-05-20)

**Scope.** A dedicated admin-only page focused on converting non-subscribed clients into members. Replaces the conversion-by-filter behavior that lived on Bill's dashboard.

**UX:**

- `/portal/admin/conversions` (admin-only — gated by `requireAdmin`)
- Cross-astrologer table of every client across the system
- Columns: client name · astrologer · subscription status · last session date · # sessions · last report sent · contact email
- Default filter: status ≠ `active` (i.e. Not subscribed / Lapsed / Cancelled — the conversion targets)
- Sort options: warm-lead (recent session + not subscribed first), recency, alphabetical
- Quick actions per row:
  - Mark subscribed (reuses existing `markSubscription` from `lib/clients.js`)
  - Open client profile
  - Send a note (opens a compose form that goes through Resend — same pattern as `api/reply.js`)

**Files created:**

- `website/pages/portal/admin/conversions.jsx` — the dashboard page. `getServerSideProps` calls `requireAdmin`.
- `website/lib/conversions.js` — `listConversionTargets({ statusFilter, sort })` query, joins `clients` + last `sessions` + last sent `reports`.
- `website/components/ConversionTable.jsx` + `ConversionTable.module.css`
- `website/components/SendNoteModal.jsx` — small compose UI; calls a new API route
- `website/pages/api/admin/conversions/send-note.js` — Resend-backed; admin-gated
- `website/styles/PortalConversions.module.css`

**Files modified:**

- `website/components/PortalNav.jsx` — admin-only "Conversions" link visible when `role === 'admin'`

**Migrations:** none. The query joins existing tables.

**Env vars:** reuses Resend envs.

**Packages:** none new.

**Smoke test.**
1. Sign in as admin → see "Conversions" link in nav, member view doesn't
2. Open the page → table populates with non-subscribed clients across all astrologers
3. Change filter to Lapsed → list updates
4. Click "Mark subscribed" → row updates, badge flips on other portal pages
5. Click "Send a note" → modal opens → submit → email sent via Resend
6. Sign in as Bill (astrologer) → `/portal/admin/conversions` redirects (not admin)

**Risk.** Low. Read-only join + a Resend call already proven. RLS already loosened in PR #7 covers admin's cross-astrologer read; verify the SELECT works under admin auth.

---

### PR #9 (original) — Subscription conversion surface — superseded

Subscription badges/icon: folded into new PR #6 (`SubscriptionIcon` component).
Manual mark-as-subscribed: already shipped in PR #3 (`/portal/clients/[id]` subscription panel).
Filter chip: removed per stakeholder direction; admin filtering moved to new PR #9.
CTA in report email: included in new PR #8.

Nothing left in the original PR #9 that isn't covered elsewhere — closing this slot.

---

## 4. Decisions deferred (per spec §8, recorded here for cross-reference)

| Decision | v1 default | Where the TODO lives |
|---|---|---|
| Auto-create clients from bookings | Manual only | `pages/portal/clients/new.jsx`, `lib/clients.js` |
| Stripe subscription product | Manual toggle | `pages/portal/clients/[id].jsx` |
| Client self-serve report access | RLS only, no UI | `pages/portal/reports/[id].jsx` |
| PDF export | Not in v1 | `pages/portal/reports/[id].jsx` |
| Vault for OAuth tokens | Plain table + RLS | `supabase/017_meeting_source_connections.sql` |
| Active-source toggle | Most-recently-updated wins | `lib/meetingSources/index.js` |
| Zoom adapter | Not built | `lib/meetingSources/zoom.js` (does not yet exist) |
| **Auto-pull transcripts (Krisp/Zoom/Otter)** | Manual paste in PR #7 | `lib/meetingSources/*.js` — abstraction kept |
| **AI-drafted report generation** | Bill drafts manually via his Claude.ai Project (Max plan), pastes into portal | Could return as a one-click feature in v2 once volume justifies API spend; cheapest path is Gemini free-tier API |
| **AI-agent–assisted scheduling** | Admin schedules manually | Future work; relates to Krisp/Zoom auto-link |

---

## 5. Architectural check (the test that decides if the abstraction holds)

Per spec §11: adding Zoom later must require only `lib/meetingSources/zoom.js` plus a one-line addition to `lib/meetingSources/index.js`. We honor this by:

- Never importing `krisp.js` directly from any page or API route — always `getActiveMeetingSource()`.
- Never naming `meeting_source` columns Krisp-specific.
- Generating the report prompt with the language "meeting recording service", not "Krisp".
- Rendering the connect screen from `SUPPORTED_SOURCES`, not a hardcoded list.

PR reviewers should grep for `krisp` outside `lib/meetingSources/krisp.js`. Any hit outside that file (or env-var names) is a leak.

---

## 6. Implementation order (revised 2026-05-20)

| PR | Branch | Status | Depends on |
|---|---|---|---|
| #1 | `feat/portal-01-roles` | ✅ Shipped (#217) | — |
| #2 | `feat/portal-02-shell` | ✅ Shipped (#218) | #1 |
| #3 | `feat/portal-03-clients-crud` | ✅ Shipped (#220) | #2 |
| #4 | `feat/portal-04-dashboard` | ✅ Shipped (#223) — superseded by new #6 | #3 |
| #5 | `feat/portal-05-meeting-source` | ✅ Shipped (#224) — UI to be hidden | #2 |
| **#6** | `feat/portal-06-sessions-redesign` | ⏭ Next | #4 |
| **#7** | `feat/portal-07-transcript-report` | Planned | #3 |
| **#8** | `feat/portal-08-send-report` | Planned | #7 |
| **#9** | `feat/portal-09-admin-conversions` | Planned | #3, #7 (for RLS bypass) |

PRs #6 and #7 can be parallelized (no shared files). #8 depends on #7 (needs `body_markdown` to exist). #9 can land any time after #7 (needs the admin RLS bypass policies).

---

## 7. Next action (revised 2026-05-20)

PRs #1–#5 shipped. Migration `017_meeting_source_connections.sql` applied to prod 2026-05-20 (was outstanding at merge of PR #224). All decisions for PRs #6–#9 locked above.

### Next up — PR #6: Sessions view redesign + cleanup

**Branch:** `feat/portal-06-sessions-redesign` off `origin/main`

**Pre-merge checklist:**
- [ ] `/portal` shows Upcoming tab by default; Past tab works
- [ ] List view groups by week with `This week` / `Next week` / `Week of <Mon date>` headers
- [ ] Calendar view renders month grid; today highlighted; session pills clickable
- [ ] Subscription icon renders correctly for all four `subscription_status` values
- [ ] Filter chip removed
- [ ] Sidebar no longer shows "Meeting source" link; visiting `/portal/settings/meeting-source` directly shows the "on hold" banner
- [ ] No regressions on existing client/session CRUD pages

**Then in parallel or sequentially:**
- PR #7 — Manual transcript + report textarea (depends only on PR #3; can start now)
- PR #8 — Send report email (depends on PR #7)
- PR #9 — Admin conversions dashboard (depends on PR #7 for admin RLS bypass)
