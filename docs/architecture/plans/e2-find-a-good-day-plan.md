# Plan: E2 — Find a Good Day (Day Plan)

**Project:** The Mahjong Tarot
**Epic:** [E2 · Find a Good Day](../../product/epics.md#e2--find-a-good-day) — Phase 1 wedge, workstream W1.2
**Date:** 2026-04-29
**Branch:** `feat/e2-find-a-good-day`
**Status:** In flight

---

## Context

The almanac data layer and a search prototype already exist:

- [website/pages/dashboard/almanac/search.jsx](../../../website/pages/dashboard/almanac/search.jsx) — free-text query box, activity autocomplete, year/month filters, results list.
- [website/lib/almanac.js](../../../website/lib/almanac.js) — `ACTIVITIES` list (29 entries), `searchActivities()` keyword matcher, `fetchLuckyDatesForActivity()` against `public.almanac_days`.
- [website/pages/dashboard/almanac/[date].jsx](../../../website/pages/dashboard/almanac/[date].jsx) — per-date detail via `AlmanacView`.

What blocks the wedge:

1. **Both routes are auth-gated and `noindex`.** The Phase 1 success criterion is ≥ 500 unique users on the search by 2026-06-01 — un-reachable while the route is members-only.
2. **No share-able artifact.** No copy-link, no native share, no `.ics`, no OG image. The success criterion is ≥ 10% of result pages shared; today the share rate ceiling is 0.
3. **No "why this date scores well" copy.** Result rows show officer + score, not the reason — required by W1.2 DoD.

---

## Goal for the day

Ship a publicly-accessible, indexable, share-able **Find a Good Day** flow that closes the gap between the existing prototype and W1.2's definition of done.

### Definition of done for today

- [ ] `/find-a-good-day` exists, is publicly reachable, and is indexable (no auth, no `noindex`).
- [ ] A clean URL exists for any (activity, date) pair: `/find-a-good-day/<activity-slug>/<YYYY-MM-DD>` — server-rendered, indexable, share-able.
- [ ] Each result page renders a one-paragraph "why this date scores well" explanation derived from officer + score + activity verdict.
- [ ] At least one share affordance works: copy-link button on every result page (web share API as progressive enhancement).
- [ ] Analytics event fires for: search submitted, result page viewed, share clicked.
- [ ] Existing `/dashboard/almanac/search` continues to work for signed-in members (no regression).

### Out of scope for today

- OG image generation (stretch only — see Block 4)
- `.ics` download (stretch only)
- Free-text NLP beyond the existing keyword matcher
- Mobile design polish beyond "doesn't break"
- Birth-data / personal-pillar interaction (E3)
- Server-rendered pre-fetch of every (activity, date) page at build time

---

## Workstreams

### Block 1 — Public route + indexability (target: 90 min)

**Files:**
- New: `website/pages/find-a-good-day/index.jsx` — public clone of the search shell.
- New: `website/pages/find-a-good-day/[activity]/[date].jsx` — server-rendered result page.
- Modify: `website/pages/dashboard/almanac/search.jsx` — keep as-is for members; this becomes a power-user view.

**Steps:**
1. Lift the search UI from `dashboard/almanac/search.jsx` into a shared component `website/components/AlmanacSearch.jsx`. The dashboard page wraps it with auth + member chrome; the public page wraps it with marketing chrome and indexable head tags.
2. Add `getStaticProps` / `getServerSideProps` on the public `[activity]/[date].jsx` so the result page renders without JS and is crawlable. Use `fetchAlmanacForDate()` server-side.
3. Drop `<meta name="robots" content="noindex" />` from public routes only. Add `<link rel="canonical">` and full OG/Twitter tags (text-only is fine for today; image is Block 4 stretch).
4. Add a slug map for activity keys: `'GetMarried' ↔ 'get-married'` lives in `lib/almanac.js`. Keep both directions so URLs stay stable.

**Verify:**
- Open `http://localhost:3000/find-a-good-day` in an incognito window — search runs, result list renders.
- `curl -sL http://localhost:3000/find-a-good-day/get-married/2026-04-18 | grep '<title>'` — title resolves on first byte (no JS needed).
- `curl -sI http://localhost:3000/find-a-good-day/get-married/2026-04-18 | grep -i x-robots` — no robots-deny header.

---

### Block 2 — "Why this date scores well" copy (target: 60 min)

**Files:**
- New: `website/lib/explainScore.js` — pure function `explainScore({ officer, score, activity, holiday })` → string.
- Modify: `website/pages/find-a-good-day/[activity]/[date].jsx` to call it.
- Modify: `website/components/AlmanacView.jsx` later if the copy is reusable on the dashboard date page.

**Approach:**
- Combine three inputs into a single paragraph: (a) the day-officer's general tendency, (b) the activity's verdict for the day, (c) the score band.
- Use a small template library (4–6 sentence shells per officer × 3 score bands). Do not generate via LLM today — this needs to be deterministic for SEO and snapshot stability.
- Voice: probabilistic ("the day leans toward…"), no em-dashes, no exclamation points. See [docs/brand/](../../brand/) and any voice notes in [agents/writer/context/](../../../agents/writer/context/).

**Verify:**
- Snapshot the copy for 6 representative dates × 4 activities (24 outputs). Spot-check that each reads in voice.
- Confirm the score-band cutoffs match `tone` already on the row.

---

### Block 3 — Share affordances (target: 60 min)

**Files:**
- New: `website/components/ShareRow.jsx` — Copy-link button (always), native Web Share API trigger (mobile only, feature-detected), Twitter/X intent link (text-only fallback).
- Modify: result page to render `<ShareRow url={...} title={...} />` below the explanation.

**Analytics:**
- New: `website/lib/analytics.js` (or wire into existing analytics if present — search for `gtag` / `posthog` / `plausible` first).
- Events: `e2_search_submitted { activity }`, `e2_result_viewed { activity, date, score }`, `e2_share_clicked { method, activity, date }`.

**Verify:**
- Click Copy Link → URL is in clipboard, toast confirms.
- On a real iPhone: tap Share → native sheet opens with title + URL.
- Network tab shows the analytics event on each action.

---

### Block 4 — Stretch: OG image route (target: 60 min if time)

**Risk note from [phase-01-wedge.md](../../product/phase-01-wedge.md):** OG image generation needs Vercel build budget review. Treat as opt-in for today.

**Files:**
- New: `website/pages/api/og/find-a-good-day.jsx` — uses `@vercel/og`. Renders activity name, date, score, officer in brand fonts.
- Modify: result page `<head>` to point `og:image` and `twitter:image` at the API route.

**Verify:**
- `curl -o /tmp/og.png 'http://localhost:3000/api/og/find-a-good-day?activity=GetMarried&date=2026-04-18'`, open the file. Renders in brand colours.
- Twitter card validator on the deployed preview URL shows the image.

**Defer if:** any block above is not done by EOD, or if `@vercel/og` adds > 200 KB to the build.

---

## Branch + PR plan

- Working branch: `feat/e2-find-a-good-day` (cut from updated `main`, already exists locally).
- Two uncommitted files from earlier (`docs/project-status.html`, `docs/product/agents.md`) ride on this branch — both are docs-only, no risk to the E2 work.
- Open one PR at end of day. Title: `feat(e2): public Find a Good Day page with shareable result URLs`. Base: `main`.
- Run the full quality checklist (linter, type-check if any, manual mobile check) before requesting review.

---

## Risks

| Risk | Mitigation |
|---|---|
| `getServerSideProps` blows up function execution time on Vercel for every result hit | Use ISR with `revalidate: 86400` — almanac is static per day. |
| The shared `AlmanacSearch` component breaks the existing `/dashboard/almanac/search` | Keep the dashboard page importing the same component; verify by re-running the dashboard flow before pushing. |
| Analytics double-counts because the SPA fires both a route change and a synthetic event | Single source of truth: fire from the result page mount only, dedupe via `useRef`. |
| OG image route slows the build | Drop into Block 4 (stretch) only — defer to a follow-up PR if budget concerns arise. |

---

## Tomorrow's candidates (do NOT start today)

- `.ics` calendar download.
- Free-text NLP step that maps "I'm thinking of buying a car" → `MakeAMajorPurchase` (LLM-call-shaped).
- Pre-built top-N pages: `/find-a-good-day/get-married` (no date) — auto-redirects to top-scoring date in the next 365 days.
- Member-only enhancement: filter by birth-pillar harmony (E3 dependency).

---

*Plan version: 1.0 — 2026-04-29. Update if scope shifts mid-day.*
