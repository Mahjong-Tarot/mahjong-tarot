# Four Pillars (Life Cycle) — Build Plan (PORT)

**Status:** Build plan · **Date:** 2026-07-08 · **Branch:** `feat/four-pillars-real-reading`
**Companion to:** [`SPEC.md`](SPEC.md), [`PHASE-1-FINDINGS.md`](PHASE-1-FINDINGS.md)

## Objective

Replace the generic Ba Zi behind every "Four Pillars" surface with Bill's authored Life Cycle
reading by **porting his own working engine, `astro-eng/astro`**, into `website/lib/fp/`.
Phase 1 found that engine and validated it against the golden sample (see findings), so this is
a port, not a reverse-engineer.

Non-negotiable (carried from Purple Star): this drives **paid readings**. The port must be
**validated against the golden sample before it becomes the default**. No silently-wrong readings.

## Source of truth

`astro-eng/astro` (Bill's private GitHub org, accessible as `dhajdu`):
- Engine: `src/library/chinese-astrology/calculation.ts` (+ `sign.ts`, `element.ts`, `util.ts`).
- Calendar data: `init/v1.0.0/pillars-of-fate.sql`, `lunar-number.sql`, `sa-lunar-year.sql`, `sign.sql`.
- Content: `strapi-data/cc-element-luck-cycle.csv`, `cc-element-strength.csv`,
  `cc-element-relationship.csv`, `cc-luck-cycle-conclusion.csv`, `element.csv`.

Ownership: it is Bill's own code and data, so reuse is fine. Confirm there is no third-party
license baked into the astrology library before copying (quick check during Phase 2).

## Phases

### Phase 0 — Docs + extraction (done)
`SPEC.md`, `PLAN.md`, `PHASE-1-FINDINGS.md`, `etl_four_pillars.py`, `data/*.json` (gitignored).

### Phase 1 — Find/recover the algorithm (done, gate closed)
Engine located in `astro-eng/astro` and validated: all 5 stage elements, all 5 chi ratings, and
4/5 forces reproduce the golden sample. See [`PHASE-1-FINDINGS.md`](PHASE-1-FINDINGS.md).

### Phase 2 — Port the calc engine (`website/lib/fp/chart.mjs`, `data.mjs`) — DONE
- `data.mjs`: the 60-row `pillars-of-fate` table + matriculation constants, ported verbatim.
- `chart.mjs`: `buildFourPillarsChart({ birthday, birthTime })` — reuses `lunar-typescript` for
  the ganzhi (validated to match Bill's engine), then ports the element counting (stem+branch+nayin),
  the matriculation formula, per-stage element assignment, and `getElementForce`. Pure, no DB.
- `validate-golden.mjs`: asserts the golden sample.
- **Done (validated):** the golden sample emits stage elements Water/Wood/Fire/Earth/Metal, counts
  2/2/4/2/2, forces fate/happiness/recognition/wealth/opportunity; a 1,332-birth sweep
  (1920-2030) throws no errors; no-hour readings count three pillars. Files are inert (not yet
  imported by the app).

### Phase 3 — Port the content + assembly (`engine.mjs`, shipped content JSON) — DONE
- Content source: the authored **workbook** narratives (`life-cycle` / `element-analysis` /
  `sign-analysis`), not the modern `astro-eng/astro` `cc-*` CSVs — those turned out to be the
  **compatibility** reading, and the modern Four Pillars product is chart-only (no verbose
  5-stage prose). The workbook `LCPeriodRating` keys exactly onto the Phase 2 chart.
- `port_content.py` emits cleaned, keyed JSON to `website/data/fp/*.json` (normalizes the SPEC §7
  hygiene issues: `Youth`/`youth`, `NULL` period, `Opportunity` casing).
- `content.mjs` (webpack JSON imports, for the app) + `content-node.mjs` (fs, for scripts),
  mirroring `lib/ps/data.mjs` / `data-node.mjs`.
- `engine.mjs`: `buildFourPillarsReading(chart, content)` assembles year-sign, element-mix, and
  the five stages (chi + fate + chi transition).
- **Done (validated):** `validate-reading.mjs` reproduces the golden sample word-for-word (chi
  narratives "low normal"/"strong"/"low", element strengths, Fire Pig / fixed Water). A 648-chart
  sweep (1940-2020) has **100% per-stage content coverage** (0 missing chi/fate/chiDelta over 3,240
  stages), 0 crashes; only 3 element-strength cells miss (rating-range edge, degrades to null).
  Files remain inert (not imported by the app).

### Phase 4 — Validation (golden sample + sign-off)
- Reproduce Bill's Feb 6 1947 reading end to end; diff structurally against
  `Four Pillars - Prototype.docx` and `astro-eng/astro`'s own `samples/`.
- Bill signs off on one additional live chart.
- **Done when:** golden sample matches; Bill approves one live chart.

### Phase 5 — Render + cutover (`render.mjs`, repoint surfaces)
- `render.mjs` (DONE): `renderFourPillarsReading(reading)` → email-safe HTML themed to the member
  **Almanac** (white surfaces, `#E4E5EA` hairlines, Fraunces/Inter, and the Almanac luck/tone scale
  — auspicious green / favorable / neutral grey / cautionary / challenging fire-red, with soft
  top-fade gradient cards). Elements shown as plain text; dominant element in gold. Signature
  graphic: the **life-cycle chi "skyline"** (5 stages as an arc of fortune, bars coloured by each
  stage's Chi tone), plus a monochrome five-element balance, an animal year-sign card, and
  tone-treated per-stage cards. `renderFourPillarsPage(reading)` wraps it as a standalone preview.
  Verified on the golden sample.
- TODO: repoint the SPEC §8 surfaces (quick reading, member dashboard, private-reading generator,
  BaziChart). Retire "Bazi" labeling for "Four Pillars".
- **Done when:** build clean; quick reading, dashboard, and a generated private reading render the
  Life Cycle reading; production verified.

## Sequencing

Phases 0-1 are done on this branch. Phases 2-4 land together in the port PR (the engine stays
inert until the golden sample validates). Phase 5 (cutover) merges once Phase 4 is green.

## Acceptance for "we don't do Ba Zi anymore"

- No "Bazi" label in shipped UI copy.
- Four Pillars surfaces render the stage-based Life Cycle reading from `website/lib/fp/`.
- Golden sample matches; Bill signs off on a live chart.

## Risks

1. **Calendar coverage.** `lunar-number` must cover the birth-year range the site serves; verify
   the ported table's span (the standalone `pillars.py` table did not reach 1947).
2. **Content parity.** The `strapi-data` CSVs are the modern content; confirm they read as well as
   Bill's latest workbooks, or use the workbook narratives where richer.
3. **Paid-reading correctness.** Engine stays inert until the golden sample matches.
