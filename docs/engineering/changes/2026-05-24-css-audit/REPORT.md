# CSS Module Audit — `website/styles/`

**Date:** 2026-05-24
**Scope:** All 28 `.module.css` files in `website/styles/` (plus `globals.css`)
**Status:** Research only. No code changes. Produces a prioritized list of follow-up PRs.

## TL;DR

| Metric | Count |
|---|---|
| Total CSS modules audited | 28 |
| **Dead modules** (zero importers in routed code) | **7** |
| **Effectively dead** (only used by archive / legacy file) | **1** (`Admin.module.css`) |
| Substantial duplicates inside the live set | 4 patterns repeated 3–9× |
| Realistic post-cleanup target | **14–16 modules** (28 → 14, not 28 → 10) |

The 28-to-10 hypothesis from the original code review is too aggressive without rewriting rules — live modules are mostly well-scoped per page and only share a handful of primitives (`.error`, `.btnPrimary`, `.muted`, `.chip*`). The cheap win is **deleting 8 dead modules (~2,425 lines)** before any consolidation work.

---

## Section 1 — Inventory

All paths relative to `website/`. Importer counts only include files under `website/pages/` and `website/components/`.

| File | Lines | Importers | Importers (paths) |
|---|---:|---:|---|
| `About.module.css` | 104 | 1 | `pages/about.jsx` |
| `Account.module.css` | 433 | 15 | `pages/sign-in.jsx`, `pages/member/firepig/index.jsx`, `pages/member/dashboard/relationships.jsx`, `pages/member/dashboard/readings/[slug].jsx`, `pages/member/dashboard/three-blessings.jsx` (as `account`), `pages/member/dashboard/index.jsx` (as `accountStyles`), `pages/member/dashboard/inner-circle/index.jsx`, `pages/member/dashboard/inner-circle/new.jsx`, `pages/member/dashboard/readings/index.jsx`, `pages/member/dashboard/readings/purple-star.jsx` (as `accountStyles`), `pages/member/dashboard/inner-circle/[id]/edit.jsx`, `pages/member/dashboard/inner-circle/[id]/index.jsx`, `pages/member/profile/index.jsx`, `components/ProfileCompletion.jsx`, `components/MemberForm.jsx` |
| `Admin.module.css` | 614 | 1 | `_archive/admin-legacy.jsx` only — **effectively dead** (not under `pages/`, not routed) |
| `Blog.module.css` | 195 | 1 | `pages/blog/index.jsx` |
| `BlogPost.module.css` | 585 | 16 | All 16 files in `pages/blog/posts/*.jsx` |
| `Booking.module.css` | 600 | 7 | `pages/book-a-reading.jsx`, `pages/book-a-reading/confirm.jsx`, `pages/book-a-reading/pay.jsx`, `pages/book-a-reading/details.jsx`, `pages/book-a-reading/schedule.jsx`, `pages/the-mahjong-mirror/order/confirm.jsx`, `pages/the-mahjong-mirror/order/index.jsx` |
| `Contact.module.css` | 43 | 1 | `pages/contact.jsx` |
| `Dashboard.module.css` | 578 | 1 | `pages/member/dashboard/index.jsx` |
| `FireHorse.module.css` | 461 | 1 | `pages/year-of-the-fire-horse.jsx` |
| `Forms.module.css` | 273 | 3 | `pages/readings.jsx` (as `form`), `pages/contact.jsx` (as `form`), `components/NewsletterSignup.jsx` |
| `Home.module.css` | 1009 | 3 | `pages/index.jsx`, `pages/cards/[slug].jsx`, `pages/cards/index.jsx` |
| `MahjongMirror.module.css` | 213 | 1 | `pages/the-mahjong-mirror.jsx` |
| `MemberNav.module.css` | 60 | 1 | `components/MemberNav.jsx` |
| `Portal.module.css` | 341 | **0** | — **DEAD** |
| `PortalAdmin.module.css` | 237 | 9 | `pages/admin/quick-reading.jsx`, `pages/admin/index.jsx`, `pages/admin/people.jsx`, `pages/admin/inquiries.jsx`, `pages/admin/sales.jsx`, `pages/admin/private-readings/index.jsx`, `pages/admin/private-readings/[id].jsx`, `pages/admin/settings/meeting-source/index.jsx`, `pages/admin/settings/meeting-source/callback.jsx` |
| `PortalAdminKanban.module.css` | 363 | 1 | `pages/admin/inquiries.jsx` |
| `PortalAdminTable.module.css` | 175 | 3 | `pages/admin/people.jsx`, `pages/admin/inquiries.jsx`, `pages/admin/private-readings/index.jsx` |
| `PortalClient.module.css` | 315 | **0** | — **DEAD** |
| `PortalClients.module.css` | 150 | **0** | — **DEAD** |
| `PortalConversions.module.css` | 142 | 1 | `pages/admin/sales.jsx` |
| `PortalHome.module.css` | 85 | **0** | — **DEAD** |
| `PortalQuickReading.module.css` | 143 | 1 | `pages/admin/quick-reading.jsx` |
| `PortalReport.module.css` | 306 | **0** | — **DEAD** |
| `PortalSettings.module.css` | 254 | 2 | `pages/admin/settings/meeting-source/index.jsx`, `pages/admin/settings/meeting-source/callback.jsx` |
| `ProfileCompletion.module.css` | 57 | 1 | `components/ProfileCompletion.jsx` |
| `Readings.module.css` | 186 | 1 | `pages/readings.jsx` |
| `Signup.module.css` | 911 | 1 | `pages/signup.jsx` |
| `ThreeBlessingsReport.module.css` | 165 | 1 | `pages/member/dashboard/three-blessings.jsx` |
| **TOTAL** | **8,998** | | |

> `globals.css` (390 lines) is imported globally via `_app.jsx` — not a module.
> Component-local `.module.css` files in `website/components/` and certain `website/pages/` subdirs (e.g. `Nav.module.css`, `Footer.module.css`, `AdminShell.module.css`, `MemberShell.module.css`, `AlmanacCalendar.module.css`, `Forecast.module.css`) are out of scope per the brief.

---

## Section 2 — Dead modules

7 modules have **zero importers** anywhere under `website/pages/` or `website/components/`. They can be deleted with no JSX changes.

| File | Lines | Notes |
|---|---:|---|
| `Portal.module.css` | 341 | Looks like an early "portal shell" base; superseded by `PortalAdmin.module.css` |
| `PortalHome.module.css` | 85 | Tabs/toggles for a never-shipped portal home |
| `PortalClient.module.css` | 315 | Single-client detail page — never wired up; current admin uses `PortalAdminTable` rows + dedicated `private-readings/[id].jsx` |
| `PortalClients.module.css` | 150 | Clients list — superseded by `pages/admin/people.jsx` (uses `PortalAdminTable`) |
| `PortalReport.module.css` | 306 | Report draft/send view — feature shipped through `private-readings/[id].jsx` using `PortalAdmin` instead |

That's 5 dead Portal* files = **1,197 LOC removable with zero JSX changes.**

**One additional "effectively dead":**

| File | Lines | Notes |
|---|---:|---|
| `Admin.module.css` | 614 | Only imported by `website/_archive/admin-legacy.jsx`, not under `pages/` so not routed. Superseded by the `PortalAdmin*` family. |

**Total deletable (with `_archive/admin-legacy.jsx`): ~1,811 + 614 = ~2,425 lines, no JSX changes required.**

---

## Section 3 — Near-duplicate modules

### 3.1 The Portal* family is NOT a base + extends pattern

Initial hypothesis ruled out. `Portal.module.css` is not imported anywhere and the sibling Portal* files do not `composes:` from it. The 11 Portal* files are 11 **parallel siblings** of which 5 are dead. The 6 live ones are scoped per page.

Class names recurring across live Portal modules:

| Class | Files | Notes |
|---|---:|---|
| `.error` | 9 (Forms + 8 Portal*) | Near-identical: red text, ~14px sans, sometimes with `background: rgba(178,34,34,.06)` + left border. Diverges between "minimal" and "block" variants. |
| `.btnPrimary` + `.btnSecondary` paired | 4 (PortalClient, PortalQuickReading, PortalReport, PortalSettings) | Effectively identical: fire-500 primary, paper-pure secondary, 6px radius, 8–10px padding. PortalReport tweaks padding/font-size by 1–2px. |
| `.chip` + `.chipActive` paired | 3 (Portal, PortalAdminTable, PortalConversions) | PortalAdminTable + PortalConversions are byte-equivalent. Portal differs only in `chipActive` background (fire-500 vs. ink). |
| `.backLink` (+ `:hover`) | 3 (PortalClient, PortalReport, PortalSettings) | Identical 6-line block. |
| `.muted` | 5 modules | Two flavours: 14px ink-3 vs ink-4 with small vertical padding — rules within 2–4 lines of each other. |

### 3.2 Pairwise spot-checks (live modules only)

| Pair | Same class names? | Same rule contents? | Overlap |
|---|---|---|---|
| `PortalAdminTable` vs `PortalAdminKanban` | Partial | No | ~10%. Table is grid/rows/tags. Kanban is board/columns/drawer/modal. Different concerns. **Do not merge.** |
| `PortalAdminTable` vs `PortalConversions` | Yes for `.chip*`, `.chipActive` | Yes (byte-equivalent for chip rules) | ~25% (chip pattern + table styling). PortalConversions' `.ordersTable` is almost identical to PortalAdminTable's `.table`. **Merge candidate.** |
| `PortalReport` vs `PortalSettings` | Yes for `.btnPrimary`, `.btnSecondary`, `.backLink`, `.error` | Effectively yes | ~30% on shared primitives |
| `PortalQuickReading` vs `PortalReport` | Yes for `.form`, `.field`, `.label`, `.input`, `.textarea`, `.btnPrimary`, `.btnSecondary`, `.error` | Effectively yes (1–2px tweaks in PortalReport) | ~40% on shared form primitives |
| `Admin.module.css` (dead) vs `PortalAdmin` + `PortalAdminTable` + `PortalAdminKanban` | Yes — Admin has `.kanban*`, `.table`, `.summaryCards`, `.viewToggle`, etc. | No — different naming, different rules | Legacy `Admin.module.css` is a single-file version of what the Portal* trio replaced. |

### 3.3 Outside the Portal family

| Pair | Overlap | Notes |
|---|---|---|
| `About`, `Blog`, `Contact`, `Readings`, (dead `Admin`) | `.pageHeader { ... } .pageHeader h1 { ... }` in all 5 | ~6–8 lines duplicated; classic page-header pattern. **Candidate to lift to `globals.css`.** |
| `Forms.module.css` | Uses `composes:` for `inputDark`/`textareaDark`/`labelLight` — well-factored | Keep as-is |
| `BlogPost.module.css` (585 lines, all 16 posts) | Standalone editorial-typography module | Keep as-is — clean separation |
| `Booking.module.css` (600 lines, 7 importers) | Single shared module — already consolidated | Keep as-is |
| `Account.module.css` (433 lines, 15 importers) | De-facto member-area shared module | Keep as-is — works well |

---

## Section 4 — Consolidation candidates

Ranked by **impact per effort**. Each proposal preserves rendering parity by design.

### Proposal A — Delete dead Portal* modules
- Files to delete: `Portal.module.css`, `PortalHome.module.css`, `PortalClient.module.css`, `PortalClients.module.css`, `PortalReport.module.css`
- Affected importers: **0** (no JSX changes)
- Effort: **trivial** (`git rm` × 5)
- Risk: **low** — grep confirms zero references

### Proposal B — Delete legacy `Admin.module.css` and `_archive/admin-legacy.jsx`
- Files to delete: `Admin.module.css`, `_archive/admin-legacy.jsx`
- Affected importers: **0** routed files
- Effort: **trivial**
- Risk: **low** — verify `git log -- _archive/` first to confirm intentional retirement

### Proposal C — Merge `PortalConversions` into `PortalAdminTable`
- PortalConversions reimplements `.chip`, `.chipActive`, `.chipRow`, `.count` byte-for-byte from PortalAdminTable, plus a near-duplicate `.ordersTable` of `.table`
- Resulting file: `PortalAdminTable.module.css` (add `.sortField`, `.sortLabel`, `.sortSelect`, `.toast` as table-page utilities)
- Affected importers: 1 (`pages/admin/sales.jsx`)
- Effort: **moderate** (~30 min)
- Risk: **low–medium**

### Proposal D — Extract a shared `PortalForm.module.css`
- `PortalQuickReading`, `PortalReport`, `PortalSettings` redeclare `.form`, `.field`, `.label`, `.input`, `.textarea`, `.btnPrimary`, `.btnSecondary`, `.error`, `.backLink` with near-identical rules. PortalReport diverges in 2 places (font-size 13 vs 14; min-height 120 vs 84)
- Resulting file: new `PortalForm.module.css` (~120 lines, replaces ~250 lines spread across 3 files)
- Affected importers: 3
- Effort: **moderate** (~1 hour)
- Risk: **medium** — small but real divergence

### Proposal E — Lift `.pageHeader` pattern to `globals.css`
- 4 live modules redefine `.pageHeader { ... } .pageHeader h1 { ... }`
- Effort: **moderate** (~45 min)
- Risk: **medium** — global namespace pollution

### Proposal F — Lift shared `.error` utility
- 9 modules declare `.error` with same intent. Block variants → `.error-block`; inline → `.error-inline`
- Effort: **moderate** (~1 hour)
- Risk: **medium** — broad surface
- **Defer** until A–D done

### Why 28 → 10 isn't realistic

After Proposals A + B (free), count drops from 28 to **20**. Proposals C–F could reasonably take it to **15–16**. Going below would require rewriting rules (out of scope) or lumping unrelated page-specific styles together (net loss of clarity). **Realistic target: 14–16 modules.**

---

## Section 5 — Rules in `globals.css` that should be modules (or vice versa)

`globals.css` (390 lines) is well-scoped — design tokens, reset, typography, button primitives (`.btn-primary` / `.btn-secondary` / `.btn-ghost`), cards (`.card` / `.card-dark`), `.overline`, `.divider-gold`, etc.

1. **Module → global candidate:** `.error` (block) + `.error-text` (inline). Duplicated 9× with minor variations. Adding `.error-block` and `.error-inline` would let modules drop them. See Proposal F.
2. **Module → global candidate:** `.page-header` (eyebrow + h1 + lede block on `/about`, `/blog`, `/contact`, `/readings`). See Proposal E.
3. **No global → module candidates spotted.** Current globals are legitimately cross-cutting. Note: the Portal* family redefines `.btnPrimary`/`.btnSecondary` in camelCase because CSS Modules can't reference `.btn-primary` global directly without `:global()` — this is a real reason for the duplication and may not be worth changing.
4. **Note (out of scope):** Legacy token remaps in `globals.css` lines 40–49 (`--midnight-indigo`, `--mystic-fire`, etc.) imply a design-system rename. Deleting dead Portal* modules removes some pressure on those aliases — but live BlogPost/Booking/Account/Home likely still reference them. Worth a separate audit.

---

## Section 6 — Recommendations (prioritized PR plan)

| # | PR | Files affected | Risk | Parallel-safe? |
|---:|---|---:|---|---|
| 1 | **Delete 5 dead Portal modules** (`Portal`, `PortalHome`, `PortalClient`, `PortalClients`, `PortalReport`) | 5 deletes, 0 JSX | **Low** | Yes — fully independent |
| 2 | **Retire `Admin.module.css` + `_archive/admin-legacy.jsx`** (confirm with `git log` first) | 2 deletes, 0 JSX | **Low** | Yes |
| 3 | **Merge `PortalConversions` into `PortalAdminTable`** | 1 delete, 1 rename, 1 JSX update | **Low–Medium** | No |
| 4 | **Extract `PortalForm.module.css`** from QuickReading/Report/Settings | 1 new, 3 module shrinks, 3 JSX updates | **Medium** | No |
| 5 | **Lift `.page-header` to `globals.css`** (About, Blog, Contact, Readings) | 4 module shrinks, 4 JSX updates, +1 global | **Medium** | Yes |
| 6 | **Lift `.error-block` / `.error-inline` to `globals.css`** | 9 module shrinks, ~9 JSX updates, +2 globals | **Medium** | Yes (do after #1+#2) |

**Suggested order:** Land **PR #1 and #2 first** — pure deletions, zero risk, drops 28 → 20 immediately. Then queue **PR #3** as the lowest-risk consolidation. Defer **PR #4–#6** pending visual regression check on live admin pages.

**Stretch target after all 6 PRs:** 28 → **~14 modules** + 2 new global utilities. Roughly half the CSS lines removed; no rendering changes.

---

## Top 3 recommendations (impact-per-effort)

1. **PR #1 — delete 5 dead Portal* modules.** Zero JSX changes, 1,197 LOC gone, count drops 28 → 23.
2. **PR #2 — retire `Admin.module.css` + `_archive/admin-legacy.jsx`.** Trivial, removes the largest dead file (614 LOC), count → 22.
3. **PR #3 — merge `PortalConversions` into `PortalAdminTable`.** Lowest-risk real consolidation; 1 JSX file touched, byte-equivalent chip rules collapse cleanly, count → 21.

## Methodology

- Inventory: `wc -l website/styles/*.module.css`
- Importers: `grep -rn "styles/<name>\.module\.css" website/pages/ website/components/`
- Duplicate-class detection: `grep -h "^\.[a-zA-Z]" website/styles/*.module.css | sort | uniq -c | sort -rn`
- Pairwise overlap: read each file in full, compare class-name sets and rule contents
- No build, no dev-server, no JSX edits — pure static analysis
