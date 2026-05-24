# /admin/people — Refactor for 140k+ rows

**Status:** v0.2 — questions answered, ready to phase
**Date:** 2026-05-24
**Author:** Claude (paired with Dave)
**For:** Dave Hajdu, Yon

> **v0.2 changes:** Dave confirmed the page must scale to the full ~140k
> mailing list (planned import). Stat cards always show **global** totals
> (they ignore the search box). CSV export is **in scope** — added as §2.8.

---

## TL;DR

`/admin/people` currently fetches every person, inquiry, profile, and
won deal into the browser and computes everything (sort, filter, stat
totals, customer flags) client-side. That works at 1,259 rows. With
the mailing list at 140,000 it does not — the page would ship ~50–80 MB
of JSON on every load, freeze the browser during sort/filter, and the
stat cards would still be wrong unless every row was fetched.

This spec replaces the all-client-side model with:

1. A Postgres **view** that pre-joins the per-person counts/dates the
   page needs, so we never JOIN client-side again.
2. **Server-side pagination** — 50 rows per page by default.
3. **Server-side filter + sort + search** — pushed to Supabase, not
   computed in `useMemo`.
4. **Aggregate stat-card counts** via 4 `{ count: 'exact', head: true }`
   queries — global, not narrowed by the search box.
5. **CSV export** of the currently-filtered list via a streaming server route.

PR [#326](https://github.com/Mahjong-Tarot/mahjong-tarot/pull/326)
(`.range(0, 9999)`) stays in place as a stopgap until this lands.

---

## 1. What breaks at 140k today

Trace through [pages/admin/people.jsx](website/pages/admin/people.jsx):

| Today's code | Cost at 140k |
|---|---|
| `from('people').select('...20 cols...')` no range | PostgREST caps at 1k → silent truncation; even at 10k cap (the stopgap), ~5 MB JSON over the wire |
| `from('inquiries').select('person_id, type, status, created_at')` no range | inquiries grows with form submits; same cap, same truncation |
| `from('profiles').select(...)` | small (~10 today), unlikely to scale to 140k |
| `from('deals').select('person_id, status, won_at')` | grows with sales — not 140k-scale yet, but trending |
| `useMemo(aggregated)` — builds a Map of inquiries, profiles, deals per person, then maps people | O(n) per person × 140k = blocks the main thread for seconds |
| `useMemo(totals)` — `aggregated.length`, `.filter()` × 3 | depends on `aggregated` being complete; bogus once truncation kicks in |
| `.filter()` + `.sort()` on render | another full pass per re-render |
| Renders every `<PersonRow>` | 140k DOM nodes = browser locks up |

The stat cards (Total / Customers / Legacy / Premium) are the most
load-bearing piece: they must equal real totals across the whole table,
not the rendered page.

---

## 2. Proposed architecture

### 2.1 New Postgres view: `people_admin_list`

```sql
create or replace view public.people_admin_list as
select
  p.id, p.email, p.name, p.company, p.role, p.phone, p.address,
  p.birthday, p.birth_time, p.birth_place, p.gender, p.chinese_sign,
  p.ok_to_contact, p.source, p.source_site,
  p.lifecycle_stage, p.nurture_stage, p.nurture_status, p.membership_status,
  p.created_at, p.updated_at,

  coalesce(inq.inquiry_count, 0) as inquiry_count,
  inq.last_inquiry_at,
  inq.types,                                             -- text[] of inquiry types

  coalesce(d.order_count, 0)     as order_count,
  d.latest_deal_at,

  pr.is_premium                  as is_premium_member,
  (pr.user_id is not null)       as is_member,

  -- Derived flags so client-side `isRecentCustomer` / `isLegacyCustomer`
  -- become trivial column reads. Definition mirrors lib/admin-people.js.
  (d.latest_deal_at >= '2026-01-01')                  as is_recent_customer,
  (
    d.latest_deal_at is not null
    and d.latest_deal_at < '2026-01-01'
  ) or (
    coalesce(d.order_count, 0) = 0
    and p.lifecycle_stage = 'customer'
  )                                                    as is_legacy_customer,

  -- Last activity = max(updated_at, created_at, last inquiry).
  greatest(p.updated_at, p.created_at, coalesce(inq.last_inquiry_at, '1970-01-01'::timestamptz))
                                                       as last_activity
from public.people p
left join lateral (
  select
    count(*)                  as inquiry_count,
    max(created_at)           as last_inquiry_at,
    array_agg(distinct type)  as types
  from public.inquiries i
  where i.person_id = p.id
) inq on true
left join lateral (
  select
    count(*) filter (where status = 'won')              as order_count,
    max(won_at) filter (where status = 'won')           as latest_deal_at
  from public.deals d
  where d.person_id = p.id
) d on true
left join public.profiles pr on pr.person_id = p.id;
```

**Why a view, not a materialized view:** writes (new inquiries, profile
updates, won deals) need to show up immediately. A view costs one
sequential scan per page-load, but each page-load only touches 50 rows
via `range`, and the lateral joins use index lookups by `person_id`.

**Why a view, not an RPC:** we want to keep using PostgREST's `.range`,
`.order`, `.ilike`, and `.eq` — RPCs make filter composition awkward.

RLS: the view inherits `is_admin()` from the underlying tables. Verify
in QA before shipping.

### 2.2 Page query plan

Replace the 4-table-Promise.all with:

```js
// 1. The visible page of rows — applies search, filter, sort, pagination.
let list = supabase
  .from('people_admin_list')
  .select('*')
  .order(sortColumn, { ascending: sortDir === 'asc' })
  .range(page * pageSize, page * pageSize + pageSize - 1);
if (q)                          list = list.or(`email.ilike.%${q}%,name.ilike.%${q}%`);
if (filter === 'customers')     list = list.eq('is_recent_customer', true);
if (filter === 'legacy')        list = list.eq('is_legacy_customer', true);
if (filter === 'premium')       list = list.eq('is_premium_member', true);
const { data, error } = await list;

// 2. Stat-card counts — GLOBAL. They do NOT include the search box, so
// they keep showing real DB totals while you type into search. Per Dave:
// "always global". They're cached and only re-fetched on initial load
// and after a shelf save (since edits can move someone in/out of a bucket).
const [total, customers, legacy, premium] = await Promise.all([
  supabase.from('people_admin_list').select('id', { count: 'exact', head: true }),
  supabase.from('people_admin_list').select('id', { count: 'exact', head: true }).eq('is_recent_customer', true),
  supabase.from('people_admin_list').select('id', { count: 'exact', head: true }).eq('is_legacy_customer', true),
  supabase.from('people_admin_list').select('id', { count: 'exact', head: true }).eq('is_premium_member', true),
]);
```

5 queries per page-load on first paint. After that, typing into search
or changing sort/page only re-fires query #1 — the 4 count queries are
memoised and stay put until a shelf save invalidates them.

`HEAD` count queries don't ship rows, so they're cheap even on the 140k
table (PostgREST runs `COUNT(*) WHERE …` server-side).

### 2.3 Search

A single search box (Cmd+K-style or just inline `<input>`). Match against
`email` and `name`. PostgREST supports this via `.or()`:

```js
.or(`email.ilike.%${q}%,name.ilike.%${q}%`)
```

For 140k rows we'll want a trigram index:

```sql
create extension if not exists pg_trgm;
create index if not exists people_email_trgm_idx on public.people using gin (email gin_trgm_ops);
create index if not exists people_name_trgm_idx  on public.people using gin (name  gin_trgm_ops);
```

### 2.4 Pagination UI

Bottom of the table:

```
   ← Prev   Page 3 of 2,801   Next →     |   50 per page ▾
```

Default 50/page (4 KB JSON, instant render). Allow 25 / 50 / 100 / 200
in the dropdown — never higher.

URL-sync the page number so refresh is stable: `/admin/people?page=3`.

### 2.5 Sort

Sortable columns: name, email, inquiry_count, order_count, last_activity.
Push every one to `.order(col, { ascending })`. Add a btree index on
`last_activity` in the view's underlying table (people.updated_at and
people.created_at already exist; `last_activity` is computed, so we may
need a generated column or an explicit sort key).

### 2.6 Filter

The 4 stat cards stay clickable, same as today. Pushing the active
filter into the query is one of `.eq('is_recent_customer', true)`,
`.eq('is_legacy_customer', true)`, `.eq('is_premium_member', true)`,
or no filter for "all". The visible row list reflects search + filter +
pagination; the card numbers above the table are global (§2.2).

### 2.7 Shelf edits

The detail shelf's per-field save flow keeps working unchanged — it
hits `from('people').update(...).eq('id', selectedId)`. After save:
- Patch the local row in state (already happens today).
- Refetch the 4 stat-card counts, since a lifecycle-stage edit can move
  the person in/out of the Customers / Legacy / Premium buckets.

### 2.8 CSV export

**Button.** A small "Export CSV" button in the controls row, next to the
search box. Disabled while a fetch is in flight.

**What it exports.** The full list that matches the current filter +
search — *not* just the current page. No `range`, no `limit`. If you've
filtered to "Customers" and searched "sarah", you get every Customer
named Sarah as one file.

**How.** New server route at [pages/api/admin/people/export.js](website/pages/api/admin/people/export.js):

```js
// GET /api/admin/people/export?filter=customers&q=sarah
// Auth: requireApi('admin')
// Response: Content-Type: text/csv; Content-Disposition: attachment; filename="people-2026-05-24.csv"
//
// Streams the people_admin_list view row-by-row through a CSV transform.
// At 140k rows × ~25 cols the file is ~25-40 MB; streaming keeps memory
// bounded and avoids the 300s function-timeout risk.
```

Implementation notes:
- Server-side iteration uses the Postgres connection (via the Supabase
  service-role key) with `.from(...).select(...).order(...)` and
  consumes results page-by-page in 5k-row chunks. Each chunk gets
  written to `res` as it arrives.
- Use a tiny inline CSV writer (no new dep) — Postgres values come
  pre-typed from PostgREST, just need quote-and-escape on text fields.
- Columns: same 20 people columns + the 5 view-derived ones
  (`inquiry_count`, `last_inquiry_at`, `order_count`, `latest_deal_at`,
  `is_premium_member`). `types` (text[]) joined as `"newsletter|booking"`.
- Filename format: `people-YYYY-MM-DD[-filter][-q-{slug}].csv` so
  downloads are self-describing.

Client side: the button just does `window.location = '/api/admin/people/export?…'`
with the current filter+search in the query string. Browser handles the
download.

---

## 3. Work breakdown (suggested PRs)

| # | PR | Risk | Notes |
|---|---|---|---|
| 1 | `feat/admin-people-view` — create `people_admin_list` view + trigram indexes | low | Migration only. App still queries `people` directly. Verify RLS in QA. |
| 2 | `feat/admin-people-paginated` — rewrite the page to use the view + pagination + filter + sort + search + global stat cards | medium | The big one. |
| 3 | `feat/admin-people-csv-export` — `/api/admin/people/export.js` streaming route + Export button | small | Depends on #1 (uses the view). Independent of #2. |
| 4 | `chore/admin-people-rip-range-stopgap` — revert PR #326's `.range(0, 9999)` once #2 ships | trivial | |

#3 can land before or after #2 — the export route doesn't need the page rewrite, it only needs the view from #1.

---

## 4. Resolved decisions

| # | Question | Decision |
|---|---|---|
| 1 | Page scope — full mailing list or only people with activity? | **Full mailing list.** Dave will import ~140k subscribers into `people`. Spec assumes this. |
| 2 | When search is active, do stat cards count search results or DB totals? | **Always global.** Cards show DB-wide totals regardless of search/page state. |
| 3 | CSV export needed once pagination removes "render everything"? | **Yes.** Spec'd in §2.8. Streams the current filter+search, ignores pagination. |

## 5. Still open (low-priority, can be answered during implementation)

1. **Search latency target.** Trigram search on 140k rows is typically
   <100ms but worth measuring in staging. If too slow, switch to
   Postgres full-text search (`tsvector` + `tsquery`).
2. **Sort by computed columns.** `last_activity` is computed in the
   view, so PostgREST can `.order` by it, but the planner may not use
   any index. May need a generated column on `people` for fast sort.
3. **Page-size dropdown.** Spec says 25/50/100/200 — confirm 200 isn't
   too high (200 rows × 25 cols ≈ 100 KB, still fine).
4. **Mailing-list import format.** Out of scope for this spec, but the
   import path (CSV upload? script?) should be sketched separately so
   the 140k arrive with sensible defaults for `source`, `source_site`,
   and `lifecycle_stage`.

---

## 6. Out of scope

- Real-time updates (Postgres `listen/notify` → Supabase Realtime).
  The page is admin-only and refreshed manually today; no need to
  layer in subscriptions.
- Bulk operations (delete, tag, merge people). Different feature.
- The Person detail shelf — works unchanged.
- The mailing-list import itself (separate spec when Dave is ready).

---

## 7. Next step

PR #1 (view + trigram indexes) can land first as a no-op preparation —
no app code touches it yet, so it's safe to ship immediately.
