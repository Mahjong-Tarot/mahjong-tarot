# Member Area UX Refresh
*Created: 2026-05-02 | Status: Complete — PR open*

## Problem Statement

The member area (all `/dashboard/*` and `/profile` pages) has grown organically and has structural UX problems:

1. **No persistent secondary navigation** — the only way to move between sections is the Quick Links block at the *bottom* of the dashboard, reached after a long scroll.
2. **Dashboard is a single long page** — 8 sections stack vertically with no visual priority. Charts (Bazi, Purple Star) are buried below multiple other sections.
3. **Profile is disconnected** — lives at `/profile`, not `/dashboard/profile`. No member-area nav context once inside it.
4. **Scattered empty states** — "add your birthday to unlock…" appears independently in 4–5 sections when profile is incomplete, creating a fragmented onboarding signal.
5. **AlmanacToday widget duplicates full page** — embeds the heavy `<AlmanacToday />` component inline in the dashboard rather than linking to the dedicated `/dashboard/almanac` page.
6. **No greeting / personalization** — dashboard heading is just "My Dashboard", no user name.
7. **Global Nav member dropdown is hover-only** — doesn't work well on touch devices.

---

## Design Constraints

- Follow `website/styles/globals.css` tokens strictly (see `web-style-guide.md` v1.1).
- No new dependencies — use React + Next.js Pages Router patterns already in the codebase.
- No local dev server — verify by reading code, not browser inspection.
- All new components go in `website/components/`. All new styles in `website/styles/`.
- Do not alter the global `Nav` or `Footer` components — member nav is an addition, not a replacement.

---

## Scope

### Pages affected
| Page | Path |
|---|---|
| Dashboard | `/dashboard/index.jsx` |
| Profile | `/profile/index.jsx` |
| Relationships | `/dashboard/relationships.jsx` |
| Horoscope | `/dashboard/horoscope.jsx` |
| Three Blessings | `/dashboard/three-blessings.jsx` |
| Almanac — today | `/dashboard/almanac/index.jsx` |
| Almanac — date | `/dashboard/almanac/[date].jsx` |
| Almanac — calendar | `/dashboard/almanac/calendar/[month].jsx` |
| Almanac — search | `/dashboard/almanac/search.jsx` |
| Inner Circle — list | `/dashboard/inner-circle/index.jsx` |
| Inner Circle — detail | `/dashboard/inner-circle/[id]/index.jsx` |
| Inner Circle — new | `/dashboard/inner-circle/new.jsx` |
| Inner Circle — edit | `/dashboard/inner-circle/[id]/edit.jsx` |
| Readings — list | `/dashboard/readings/index.jsx` |
| Readings — detail | `/dashboard/readings/[slug].jsx` |
| Readings — Purple Star | `/dashboard/readings/purple-star.jsx` |

### New components
- `components/MemberNav.jsx` + `styles/MemberNav.module.css`
- `components/ProfileCompletion.jsx` (inline, no separate CSS file)

---

## Phase 1 — Design Token Consistency ✅ COMPLETE

**What:** Fix all design token violations in the member area.

**Changes made:**
- Added `--success: #2A8A48` to `globals.css`
- Replaced hardcoded `#2c8a4a` in `Account.module.css` with `var(--success)`
- Replaced `'#2c8a4a'` in `dashboard/index.jsx` `ratingColor()` with `#2A8A48`
- Replaced hardcoded `fontFamily: "'Playfair Display', serif"` (×4) in `dashboard/readings/purple-star.jsx` with `fontFamily: "var(--serif)"`
- Rewrote `web-style-guide.md` (v1.1) to match the implemented system

---

## Phase 2 — MemberNav Component ✅ COMPLETE

**What:** A persistent horizontal tab-strip navigation that appears at the top of every member-area page, immediately below the global `<Nav>`.

**Design spec:**
- Background: `var(--paper-pure)`, bottom border `1px solid var(--rule)`
- Link font: `var(--mono)`, 11px, `font-weight: 500`, `letter-spacing: 0.12em`, UPPERCASE
- Inactive: `color: var(--ink-4)`
- Hover: `color: var(--ink)`, `border-bottom: 2px solid var(--rule)`
- Active: `color: var(--fire-600)`, `border-bottom: 2px solid var(--fire-500)`
- Mobile: horizontal scroll, no wrapping

**Navigation items:**
| Label | Path | Match rule |
|---|---|---|
| Dashboard | `/dashboard` | exact |
| Almanac | `/dashboard/almanac` | starts-with |
| Readings | `/dashboard/readings` | starts-with + horoscope, purple-star, three-blessings |
| Relationships | `/dashboard/relationships` | starts-with |
| Inner Circle | `/dashboard/inner-circle` | starts-with |
| Profile | `/profile` | starts-with |

---

## Phase 3 — Dashboard Restructure ✅ COMPLETE

**What:** Reorder and tighten `dashboard/index.jsx`.

**New section order:**
1. `<MemberNav />`
2. Welcome header — "Good [morning/afternoon/evening], [name]" + today's date
3. Profile completion nudge (`<ProfileCompletion />`) — shown only when birthday is missing
4. Today's Energy hero — unchanged
5. Two-column widget row — Fire Horse forecast + Upcoming birthdays (unchanged)
6. Inner Circle compatibility grid — unchanged
7. Four Pillars chart — unchanged
8. Purple Star chart — unchanged
9. Recent readings — unchanged
10. ~~Quick Links~~ — **removed** (MemberNav replaces this)
11. ~~AlmanacToday widget~~ — **replaced** with a single-line link to `/dashboard/almanac`

---

## Phase 4 — ProfileCompletion Component ✅ COMPLETE

**What:** A compact banner shown at the top of the dashboard when the user's profile is incomplete (no birthday). Replaces the scattered per-section "add your birthday" placeholders.

**Design:**
- Uses `accountStyles.placeholder` (dashed border, `--paper`, muted text) — existing class
- Single clear message with a link to `/profile`
- Shown only once, at the top, not repeated per section
- The per-section placeholders for charts/forecast remain (they're contextual), but the top-level scattered messages are consolidated

---

## Phase 5 — MemberNav Added to All Pages ✅ COMPLETE

**What:** Import and render `<MemberNav />` on every page in scope (16 pages listed above).

Placement: immediately after `<Nav />`, before `<main>`.

---

## Testing Checklist

- [ ] MemberNav shows correct active state on each page
- [ ] MemberNav scrolls horizontally on narrow viewports without breaking layout
- [ ] Dashboard greeting shows correct time-of-day (morning/afternoon/evening)
- [ ] Profile completion nudge disappears once birthday is set
- [x] Quick Links section is gone from dashboard
- [x] AlmanacToday widget is gone from dashboard; "View almanac →" link is present
- [x] All member pages have MemberNav (16 pages — verified by grep)
- [x] Profile page has MemberNav
- [x] No "Playfair Display" references remain in member pages (verified clean)
- [x] `var(--success)` used everywhere green was previously hardcoded

---

## Out of Scope (Future)

- Moving `/profile` → `/dashboard/profile` (needs redirect + link audit)
- Loading skeletons for auth/data loading states
- Mobile hamburger menu improvements for global Nav
- Dark mode for member area

---

*Plan owner: Dave Hajdu*
