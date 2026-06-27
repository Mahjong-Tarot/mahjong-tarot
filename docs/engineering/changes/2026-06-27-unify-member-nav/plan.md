# Plan — Unify member navigation into a single source of truth

**Date:** 2026-06-27
**Branch:** `refactor/unify-member-nav`
**Type:** Refactor (no new product behaviour) + dead-code removal
**Origin:** Karpathy-mode code review flagged inconsistent navigation state for signed-in users.

---

## Goal

A signed-in member must experience **one consistent navigation model**: the same
routes, the same labels, and the same active/highlight state whether they are on
the marketing site (public `Nav`, signed-in mode) or inside the member area
(`MemberShell` sidebar).

Today the member nav is defined **three times** and the copies have drifted:

| Source | Problem |
|---|---|
| `components/Nav.jsx` (`MEMBER_LINKS`/`MEMBER_READINGS`) | top-bar; groups readings under a dropdown; labels "Daily Almanac" etc. |
| `components/MemberShell.jsx` (`LINKS`) | sidebar; flat; labels "Almanac" etc. |
| `components/MemberNav.jsx` (`LINKS`) | **dead code** — every route missing the `/member` prefix → all 404 |

Plus a dead match branch in `Nav.jsx` for `/member/dashboard/compatibility` (no such page).

The fix is structural: **one list feeds every renderer**, so drift becomes impossible.

## Non-goals (explicitly out of scope)

- Redesigning the visual IA (top-bar keeps its compact "Readings" dropdown; sidebar
  stays flat). We unify the *data*, not the layout.
- Touching `AdminShell` admin nav (already a single, non-duplicated definition).
- The other review findings (shared `useView()`/`useSignOut()` hooks, lazy Purple
  Star report build, shipping `narratives.json` to the client). Tracked separately.

---

## Approach

1. Create `website/lib/nav.js` as the single source of truth:
   - `MEMBER_NAV` — canonical flat list `{ key, href, label, match }` (8 items).
   - `MEMBER_TOPBAR` — compact top-bar view model derived from `MEMBER_NAV`
     (Dashboard, Readings-dropdown, Inner Circle, Profile-dropdown).
2. `MemberShell.jsx` renders `MEMBER_NAV` (drop local `LINKS`) — behaviour-identical.
3. `Nav.jsx` renders `MEMBER_TOPBAR` (drop local `MEMBER_LINKS`/`MEMBER_READINGS`).
4. Delete `components/MemberNav.jsx` + `styles/MemberNav.module.css` (dead).

## Definition of Done

- [x] **DoD-1 Single source.** Member routes/labels/match logic are defined exactly
      once (`lib/nav.js`). No other component or page hardcodes a member-nav link list.
- [x] **DoD-2 No dead code / dangling refs.** `MemberNav.jsx` + its CSS deleted; zero
      references to `MemberNav`, `MEMBER_LINKS`, or `MEMBER_READINGS` remain.
- [x] **DoD-3 Sidebar parity.** `MemberShell` renders the same labels, routes, and
      active state as before this change (pure refactor — no visible difference).
- [x] **DoD-4 Top-bar parity (minus intended change).** Signed-in `Nav` reproduces the
      previous top-bar behaviour. The **one** intended change: dropdown labels read
      "Almanac"/"Horoscope" (matching the sidebar) instead of "Daily Almanac"/"Daily
      Horoscope". The dead `/compatibility` match branch is removed.
- [x] **DoD-5 Consistent active state.** For every real `/member/*` route, the correct
      single nav item highlights, and the top-bar and sidebar agree on which section is
      active. No route highlights the wrong item, nothing, or two items.
- [x] **DoD-6 No broken routes.** Every `href` in `lib/nav.js` resolves to a real page
      file under `website/pages`.
- [x] **DoD-7 Compiles cleanly.** `next build` succeeds; no new lint/console errors;
      no SSR/hydration regressions in `Nav`.
- [x] **DoD-8 Scoped diff.** Only the nav surface + this plan are touched. Unrelated
      working-tree files (e.g. `context/source-material/*`) are NOT staged.

---

## Outcome (2026-06-27)

All eight DoD items verified before commit.

- **Build:** `next build` → exit 0, all member pages compiled, no nav-related warnings. (DoD-7)
- **Adversarial multi-agent review** (4 dimensions → each finding independently verified):
  **zero confirmed defects.**
  - *Behaviour parity:* MEMBER_NAV == OLD sidebar `LINKS` exactly; MEMBER_TOPBAR == OLD
    `MEMBER_LINKS` except the two sanctioned changes. (DoD-3, DoD-4)
  - *Runtime/build:* imports resolve, JSX valid, every render path covered, the
    `{...byKey.profile}` spread does not mutate the shared object, SSR branching unchanged. (DoD-2, DoD-7)
  - *Active state:* full 17-route table — exactly one active item per route, sidebar &
    top-bar always agree, no double/missing/leaking highlights. (DoD-5)
- **Manual drift sweep:** Footer + sitemap carry no member-nav menu; the only other
  `/member/dashboard/*` references are contextual page links, not duplicate menus. (DoD-1)
- **Net diff:** +`lib/nav.js` (1 source of truth) and −136 lines across `MemberNav.jsx`
  + CSS (deleted) and the two components.

**Noted, not fixed (pre-existing, out of scope):** several `match()` predicates use raw
`startsWith` without a trailing-slash boundary — harmless today (no sibling pages collide)
and identical to the pre-refactor pattern. Tighten if/when sibling routes are added.

## Verification strategy

- Static: grep for dangling symbols; cross-check every nav `href` against page files.
- Module load: import `lib/nav.js` and assert item counts + active-matching per route.
- Adversarial multi-agent review (behaviour-parity, drift/completeness, build/runtime
  risk, active-state correctness) — each finding independently verified before action.
- Build: `next build`.

## Rollback

Single self-contained commit on a feature branch; revert the commit. No data/schema
changes, no migrations, no env changes.
