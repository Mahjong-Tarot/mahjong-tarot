# Plan — Post-nav-unification cleanups

**Date:** 2026-06-27
**Branch:** `refactor/post-nav-cleanups`
**Origin:** Three follow-up items deferred from the Karpathy-mode review that produced
the member-nav unification ([../unify-member-nav/plan.md](../unify-member-nav/plan.md)).
**Method:** Each design below was produced by a grounded design agent and then
adversarially critiqued; corrections from the critique are folded in.

---

## Goal

Remove the three remaining clean/efficient issues the nav review flagged, **without
changing user-visible behaviour** (except where explicitly noted): de-duplicate the
copy-pasted hooks, stop building 12 unused Purple Star reports on every load, and stop
shipping a ~230 KB narrative bank to the browser.

---

## Cleanup 1 — Shared `useView()` + `useSignOut()` hooks  ·  effort **S**  ·  **do-now**

### Current state
- The admin "view" localStorage effect (`useState(null)` + read-after-mount +
  `mt-view-change`/`storage` listeners) is **byte-identical** in
  [PortalSwitcher.jsx:52-62](../../../website/components/PortalSwitcher.jsx#L52) and
  [AdminShell.jsx:60-70](../../../website/components/AdminShell.jsx#L60).
- `handleSignOut` (`await signOut(); window.location.href = '/'`) is duplicated **4×**:
  `Nav.jsx:23`, `MemberShell.jsx:25`, `AdminShell.jsx:72`, **and
  `pages/member/profile/index.jsx:109`** (the 4th was not in the original review — fold it in).

### Approach
- Add `useView()` to `PortalSwitcher.jsx` (co-located with its `readView`/`writeView`/
  `VIEW_KEY` primitives — avoids splitting tightly-coupled code; `AdminShell` already
  imports from this module). Both call sites become `const view = useView();`.
- Add `useSignOut()` to `lib/auth.js` (next to `useAuth`, which it depends on). The
  deliberate hard-reload comment **moves into the hook** so the rationale has one home.
  All 4 call sites become `const handleSignOut = useSignOut();`.

### Files
`PortalSwitcher.jsx`, `AdminShell.jsx`, `lib/auth.js`, `Nav.jsx`, `MemberShell.jsx`,
`pages/member/profile/index.jsx`.

### Risk / notes
- Pure extraction; the only correctness invariant is `useState(null)` + read-after-mount
  (preserved verbatim → no hydration change). `useSignOut` returns a fresh fn each render
  — harmless (only used in `onClick`, never a dep array; verified across all 4 sites).
- No automated tests exist → verify manually: admin view toggle still swaps nav across
  same-tab + a 2nd tab; sign-out from all 4 entry points lands on `/` with session cleared.

### Definition of Done
- [ ] Zero duplicated view-effect or sign-out bodies remain; both defined once.
- [ ] Admin view toggle works same-tab and cross-tab; sign-out works from all 4 entries.
- [ ] `next build` clean; no behaviour change.

---

## Cleanup 2 — Build Purple Star reports lazily  ·  effort **S**  ·  **do-now**

### Current state
[purple-star.jsx:59-77](../../../website/pages/member/dashboard/readings/purple-star.jsx#L59)
builds **all 13** HTML docs (full + 12 palaces) in one memo on profile load, then shows 1.
The full report also runs a `buildYears` age 1..100 scan ([engine.mjs:285→161](../../../website/lib/ps/engine.mjs#L285)).

### Approach
Split into two memos:
1. `chartMemo` — `buildChartFromBirth` + set name/age + `scoreChart` **once**, keyed `[hasBirth, profile]`.
   (`scoreChart` mutates the chart in place — must stay run-once on a stable ref.)
2. `srcDoc` — render **only the active view**, keyed `[chartMemo, view]`.
   **Must remain a `useMemo`, not a plain derivation:** the iframe posts `psrHeight` on
   load + `setTimeout(200/800)` ([render.mjs:147](../../../website/lib/ps/render.mjs#L147)),
   each firing `setFrameHeight` → a parent re-render; a plain derivation would rebuild the
   HTML on every resize tick.

### Risk / notes
- Switching views now builds on demand (a few ms; full view pays the `buildYears` scan).
  Acceptable for a single-user dashboard. If instant switching is ever required, add a
  per-view memo cache.
- Migrate all `reports` references (lines ~79-81, 113, 115, 119) to `chartMemo`/`srcDoc`.

### Definition of Done
- [ ] Only the chart+score is built on load; only the selected view's HTML is rendered.
- [ ] `scoreChart` runs exactly once per profile; output HTML identical to today for any view.
- [ ] `next build` clean; iframe auto-resize still works.

---

## Cleanup 3 — Stop shipping the ~230 KB narrative bank to the client  ·  effort **M**  ·  **do-now (steps 1–2 only)**

### Current state
[data.mjs](../../../website/lib/ps/data.mjs) statically imports 5 JSON read-models
(`narratives.json` = **230 KB raw / ~69 KB gz**, dominant; total ~302 KB / ~81 KB gz) → all
bundled into the purple-star client JS. The data is only ever used to build iframe HTML.
The engine is already dependency-injected and a Node loader (`data-node.mjs`, `fs`) exists.

### Approach (steps 1–2)
1. **New `pages/api/member/purple-star.js`** — `requireApi('user')` auth → `loadData()`
   (server-only, never bundled) → read the signed-in user's `profiles` birth fields →
   build + score chart → render full + 12 palaces → return `{ hasBirth, full, palaces, error }`.
2. **Slim `purple-star.jsx`** — drop the `data.mjs`/`engine`/`chart`/`render` imports and
   the client memo; `fetch('/api/member/purple-star')` for the HTML. Keep the iframe,
   tab switch, and postMessage resize untouched. **→ removes ~81 KB gz from the bundle.**

### Corrections from critique (important)
- The design wrongly called `quickReading.js` a 3rd **client** surface — it's **server-only**
  (imported only by an API route). So the optional **step 3** ("chart-only `data-lite.mjs`
  to strip narratives from other pages") helps only ~2 client pages, one of which is the
  staff fulfilment screen that builds a 2nd partner chart. **Defer step 3 to its own commit/PR.**
- `chart-golden.json` (387 KB) is a **test fixture**, not bundled — out of scope.
- **Dual source of truth:** narratives also seeded in Supabase (`046/047_*`), but nothing
  reads the DB at runtime — editing the table doesn't change output until the JSON is
  regenerated. Latent drift; **separate ticket**, not this work.

### Risk / notes
- Auth/session parity: route reads the Supabase session from cookies via SSR client
  (`requireApi('user')`, proven in `pages/api/profile/update.js` with the same `profiles`
  query); RLS "users read own profile" (`auth.uid() = user_id`) already permits it.
- Preserve the 3 UI states (loading / no-birth-details / error) via explicit response shapes.
- `no-store` caching (birth data can change); render output must stay byte-identical so the
  iframe height handshake is unchanged.

### Definition of Done
- [ ] `data.mjs` no longer in the purple-star client bundle (verify with build output / analyzer).
- [ ] New API route auth-gated; returns identical HTML; the 3 UI states still render.
- [ ] `next build` clean; reading page works end-to-end for a member with birth details.
- [ ] Step 3 + JSON-vs-DB duality explicitly logged as follow-ups (not done here).

---

## Recommended sequencing
1. **Cleanup 1 + 2 together** (both S, pure refactor, 1 PR) — safe, immediate.
2. **Cleanup 3 steps 1–2** (M, touches auth/API) — its own PR with a manual end-to-end check.
3. Follow-ups (deferred): cleanup-3 step 3, and the JSON-vs-DB narratives duality.
