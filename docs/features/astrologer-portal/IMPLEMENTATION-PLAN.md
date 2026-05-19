# Astrologer Portal — Implementation Plan

**Source spec:** the `Astrologer Portal — Implementation Spec` (2026-05-19) provided in chat
**This doc:** maps each spec section to the actual files in the repo, flags collisions, calls out open questions, and lists the file-level changes per PR.
**Date:** 2026-05-19
**Branch for PR #1:** `feat/portal-01-roles`

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

**Recommendation:** for `generate-report` and `send-report` (both user-triggered), use **Next.js API routes** at `website/pages/api/portal/generate-report.js` and `…/send-report.js` rather than Deno edge functions. Reasons:

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

Files under `pages/api/portal/*.js`. Matches existing `api/reply.js` precedent. JS-only. Cookie-based auth via `@supabase/ssr` (OQ2). The spec's `supabase/functions/<name>` paths are translated as:

| Spec path | Actual path |
|---|---|
| `supabase/functions/meeting-source-oauth-exchange/index.ts` | `pages/api/portal/meeting-source/oauth-exchange.js` |
| `supabase/functions/meetings-list/index.ts` | `pages/api/portal/meetings/list.js` |
| `supabase/functions/meetings-fetch/index.ts` | `pages/api/portal/meetings/fetch.js` |
| `supabase/functions/generate-report/index.ts` | `pages/api/portal/reports/generate.js` |
| `supabase/functions/send-report/index.ts` | `pages/api/portal/reports/send.js` |

Each handler:
1. Reads the Supabase session via `@supabase/ssr` cookie client
2. Calls `is_portal_user()` (RPC) to verify the caller
3. Delegates to `lib/meetingSources` / `lib/reports` as appropriate

### OQ2 — SSR helper: **install `@supabase/ssr`**

Added to `website/package.json` in PR #1. Used by:
- `lib/requirePortalUser.js` and `lib/requireAdmin.js` (PR #1)
- Every `pages/api/portal/**` handler (PRs 5–8)

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

### OQ8 — Krisp readiness (blocks PR #5 only)

Before PR #5 merges:
1. Krisp OAuth app registered with redirect URI from OQ7
2. `KRISP_OAUTH_CLIENT_ID` set in Vercel env (and local `.env.local` for testing)
3. `KRISP_OAUTH_REDIRECT_URI=https://mahjongtarot.com/portal/settings/meeting-source/callback?source=krisp`

PRs 1–4 are independent of these.

---

## 3. PR-by-PR plan

Each section lists: scope, files created/modified, migrations, env vars, smoke test, and risk.

---

### PR #1 — Roles foundation (this branch: `feat/portal-01-roles`)

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

### PR #2 — Portal shell

**Scope.** `/portal` exists and renders an empty layout for portal users. Sign-in redirect now lands somewhere real.

**Files created:**

- `website/pages/portal/index.jsx` — placeholder content. Calls `requirePortalUser` in `getServerSideProps`.
- `website/components/PortalNav.jsx` + `website/components/PortalNav.module.css` — sidebar or top nav for portal pages. Links: Upcoming, Clients, Settings.
- `website/styles/Portal.module.css` — portal layout (sidebar + main column).

**Files modified:** none.

**Smoke test.** Sign in as astrologer → `/portal` renders, sidebar visible, no console errors.

**Risk.** None.

---

### PR #3 — Data model + manual client CRUD

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

### PR #4 — Upcoming Clients dashboard

**Scope.** `/portal/index.jsx` becomes the real dashboard: today/this-week sessions, subscription filter chip, subscription badges.

**Files modified:** `website/pages/portal/index.jsx`

**Files created:** none new (uses lib/sessions, lib/clients from PR #3).

**Smoke test.** Schedule a session for tomorrow → it appears on the dashboard. Filter "Not yet subscribed" hides clients with `subscription_status = 'active'`.

**Risk.** None.

---

### PR #5 — Meeting source abstraction + Krisp connect screen

**Scope.** Pluggable adapter layer. Krisp OAuth start + callback exchange. UI for the connect screen.

**Files created:**

- `website/supabase/017_meeting_source_connections.sql` — exactly the SQL from spec §3.3
- `website/lib/meetingSources/index.js` — the adapter registry + `getActiveMeetingSource()` from spec §3.2
- `website/lib/meetingSources/krisp.js` — `startOAuth` and `completeOAuth` only in this PR (PKCE, OAuth discovery via `.well-known/oauth-protected-resource`). Stubs for `listMeetings`/`fetchMeeting` that throw `Error('not implemented')`.
- `website/pages/portal/settings/meeting-source/index.jsx` — connect cards
- `website/pages/portal/settings/meeting-source/callback.jsx` — OAuth redirect target. Posts to the exchange endpoint.
- Either `website/pages/api/portal/meeting-source/oauth-exchange.js` (OQ1=A) or `website/supabase/functions/meeting-source-oauth-exchange/index.ts` (OQ1=B)

**Env vars new:**

- `KRISP_OAUTH_CLIENT_ID`
- `KRISP_OAUTH_REDIRECT_URI` (e.g. `https://<domain>/portal/settings/meeting-source/callback?source=krisp`)
- `MEETING_SOURCE_DEFAULT` (defaults to `krisp` if unset)

**Smoke test.** Click "Connect Krisp" → redirected to Krisp's OAuth → consent → bounced back to `/portal/settings/meeting-source/callback` → row appears in `meeting_source_connections`.

**Risk.** Medium. OAuth + PKCE + dynamic discovery. Test against Krisp's real flow before merging.

---

### PR #6 — Krisp adapter completion + Attach meeting modal

**Scope.** Real `listMeetings` and `fetchMeeting`. Edge function or API route for both. Attach-meeting UI on session row in client profile.

**Files modified:** `website/lib/meetingSources/krisp.js` (real impls), `website/pages/portal/clients/[id].jsx` (attach modal).

**Files created:** `website/pages/api/portal/meetings/list.js` and `…/fetch.js` (or the edge function equivalents per OQ1). `website/components/AttachMeetingModal.jsx` + module CSS.

**Smoke test.** Connect Krisp. Schedule a session. Click "Attach meeting" → list renders. Pick one → session row updates with `meeting_source = 'krisp'` and `meeting_external_id` set.

**Risk.** Medium. Krisp's actual JSON-RPC shape may differ from the spec's description. Build with logging on first.

---

### PR #7 — Generate report

**Scope.** "Generate report" button on session row → creates a `reports` row → calls Anthropic → fills `body_markdown` → user reviews on `/portal/reports/[id]`.

**Files created:**

- Either `website/pages/api/portal/reports/generate.js` (OQ1=A) or `website/supabase/functions/generate-report/index.ts`
- `website/pages/portal/reports/[id].jsx` — view + edit + regenerate
- `website/lib/reports.js` — `getReport`, `updateReport`, `markGenerating`, `markReady`, `markFailed`
- `website/styles/PortalReport.module.css`

**Env vars new:**

- `ANTHROPIC_API_KEY`
- `REPORT_MODEL` (default `claude-opus-4-7`)

**Packages:** `marked`, optionally `@anthropic-ai/sdk` (direct `fetch` works fine).

**Smoke test.** Attach a meeting → click Generate → status flips `draft` → `generating` → `ready`. Markdown renders with H2 sections, no H1.

**Risk.** Medium. Failure modes around Krisp transcript unavailable, Anthropic timeout, partial generation. Status field must always end up `ready` or `failed`, never stuck in `generating`. Use a try/finally in the handler.

---

### PR #8 — Send report

**Scope.** "Send to client" → renders markdown to HTML → emails via Resend with subscription CTA.

**Files created:** either `website/pages/api/portal/reports/send.js` (OQ1=A) or `website/supabase/functions/send-report/index.ts`. New email template (inline HTML in the handler — matches `api/reply.js` style).

**Files modified:** `website/pages/portal/reports/[id].jsx` (Send button + sent_at display).

**Env vars:** reuses `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_REPLY_TO`. No new vars.

**Smoke test.** Click Send → client receives email → `reports.status = 'sent'`, `sent_at` populated, `email_message_id` stored.

**Risk.** Low. Resend already proven via `api/reply.js`.

---

### PR #9 — Subscription conversion surface

**Scope.** Subscription badges throughout, "Not yet subscribed" filter chip on dashboard (if not already in PR #4), manual mark-as-subscribed toggle, subscription CTA confirmed in report email.

**Files modified:** several portal pages. Mostly UI.

**Smoke test.** Toggle client to `active` → badge updates everywhere → dashboard filter respects it.

**Risk.** None.

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

---

## 5. Architectural check (the test that decides if the abstraction holds)

Per spec §11: adding Zoom later must require only `lib/meetingSources/zoom.js` plus a one-line addition to `lib/meetingSources/index.js`. We honor this by:

- Never importing `krisp.js` directly from any page or API route — always `getActiveMeetingSource()`.
- Never naming `meeting_source` columns Krisp-specific.
- Generating the report prompt with the language "meeting recording service", not "Krisp".
- Rendering the connect screen from `SUPPORTED_SOURCES`, not a hardcoded list.

PR reviewers should grep for `krisp` outside `lib/meetingSources/krisp.js`. Any hit outside that file (or env-var names) is a leak.

---

## 6. Implementation order (mirrors spec §9, restated for clarity)

| PR | Branch | Depends on |
|---|---|---|
| #1 | `feat/portal-01-roles` | — (this branch) |
| #2 | `feat/portal-02-shell` | #1 |
| #3 | `feat/portal-03-clients-crud` | #2 |
| #4 | `feat/portal-04-dashboard` | #3 |
| #5 | `feat/portal-05-meeting-source-connect` | #2 |
| #6 | `feat/portal-06-attach-meeting` | #5, #3 |
| #7 | `feat/portal-07-generate-report` | #6 |
| #8 | `feat/portal-08-send-report` | #7 |
| #9 | `feat/portal-09-subscription-surface` | #4 |

#3 and #5 are independent of each other after #2; can be parallelized if there's a second developer or context.

---

## 7. Next action

All decisions locked. PR #1 is ready to code on `feat/portal-01-roles`.

### PR #1 final file list

**Created:**
- `website/supabase/016_roles.sql`
- `website/supabase/seed-astrologers.sql` (runbook with real emails per OQ6)
- `website/lib/requirePortalUser.js`
- `website/lib/requireAdmin.js`

**Modified:**
- `website/package.json` — add `@supabase/ssr`
- `website/lib/auth.js` — extend `useAuth()` per OQ5
- `website/pages/sign-in.jsx` — branch redirect by role per OQ4
- `website/pages/signup.jsx` — same branch
- `website/pages/admin.jsx` — add `getServerSideProps` calling `requireAdmin` per OQ3

**Scope estimate.** ~150 lines of JS/JSX + one SQL migration (~25 lines) + one seed file (~12 lines).

**Pre-merge checklist:**
- [ ] Apply `016_roles.sql` against dev Supabase project
- [ ] Manually set one test profile to `astrologer` and verify portal redirect (will hit 404 on `/portal` until PR #2 — that's expected)
- [ ] Verify `/admin` redirects unauthenticated and member users to `/`
- [ ] Verify `/admin` still works for an admin-role profile
- [ ] Run `seed-astrologers.sql` against dev after the real users have signed up at least once (creates their `profiles` row)
- [ ] Run `seed-astrologers.sql` against prod only after PR #1 is live
