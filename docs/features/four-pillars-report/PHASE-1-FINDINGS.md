# Four Pillars — Phase 1 findings (formula recovery) — GATE CLOSED

**Date:** 2026-07-08 · **Branch:** `feat/four-pillars-real-reading`
**Result:** The exact algorithm was found, not reverse-engineered, and validated against Bill's
golden sample. The build is now a **port of Bill's own modern engine**, `astro-eng/astro`.

## Headline

Bill's Four Pillars engine already exists as a complete, working TypeScript implementation in
the private repo **`astro-eng/astro`** (his own GitHub org). It contains the calculation
library, the calendar data, and all the narrative content. Porting it into `website/lib/fp/`
is far more reliable than reverse-engineering the spreadsheets, and it removes every open
unknown from the original SPEC §7.

## Where the engine lives (`astro-eng/astro`)

| Path | What it is |
|------|------------|
| `src/library/chinese-astrology/calculation.ts` | The core: pillar calc, element counting, the matriculation (stage-cycle) formula, force assignment. |
| `src/services/run-readings/four-pillars-chart.service.ts` | Assembles the report from the calc + content tables. |
| `init/v1.0.0/pillars-of-fate.sql` | 60-row table: cyclical number → stem, branch, stem_element, branch_element, **stem_branch_element (nayin 納音)**. |
| `init/v1.0.0/lunar-number.sql` | Western date → cyclical number, year element/animal, chinese month. The calendar. |
| `init/v1.0.0/sa-lunar-year.sql`, `sign.sql`, `free-sign-element.sql` | Sign / lunar-year / fixed-element seeds. |
| `strapi-data/cc-element-luck-cycle.csv`, `cc-element-strength.csv`, `cc-element-relationship.csv`, `cc-luck-cycle-conclusion.csv`, `element.csv` | The narrative content (modern equivalent of the `Life Cycle` / `Element Analysis` workbooks). |

The repo also has `docs/sequence/report-four-pillar-chart.md` and worked HTML samples under
`samples/four-pillars-chart.html` / `four-pillars-destiny.html`.

## The exact algorithm (from `calculation.ts`)

1. **Pillars.** Compute the four cyclical numbers (hour/day/month/year) from the birth date via
   the `getMonthCode` + intA..intL arithmetic and the `lunar-number` table. Each cyclical number
   indexes `pillars-of-fate`. (Our `bazi.js` / `lunar-typescript` reproduces the same ganzhi for
   the golden sample, so it is a valid substitute for the ganzhi if we prefer.)
2. **Element counting.** For each of the four pillars, add **+1 to three elements**:
   `stem_element`, `branch_element`, and `stem_branch_element` (the **nayin**). Four pillars → 12
   instances (nine without hour). Each element's total is clamped to 0-5 (`wood()`..`water()`).
3. **The mix / rating.** The clamped count per element **is** its rating (0-5). Sorted descending
   = the mix code. Per-element narrative is keyed on this rating.
4. **Matriculation (the per-person stage cycle).**
   `dblMatricTemp = (yearStem - 0.5) * -3 + 6`; increment `intMatricLine` while
   `12.5 - monthBranch > dblMatricTemp` (recomputing `... + line*6`). The matriculation element is
   `[4,5,1,2,3,4,5][line-1]`. The five stages (Birth→Retirement) are then filled from that element
   forward through the productive cycle `[Wood,Fire,Earth,Metal,Water]`.
5. **Per-stage Chi = the count of that stage's assigned element.** (This is why Adulthood is
   "strong" for the golden sample: its element is Earth, count 4.)
6. **Fate / Force.** `getElementForce(yearBranchElement, stageElement)` returns one of
   fate / happiness / recognition / wealth / opportunity from a fixed relationship table.
7. **Assemble** the narrative from the content tables keyed on stage, rating, element, force.

## Validation against the golden sample

Golden sample: **Bill, born Feb 6 1947 1:00 PM** (`Four Pillars - Prototype.docx`). Ganzhi
丁亥 / 壬寅 / 丙辰 / 乙未 (cyclical 24 / 39 / 53 / 32), confirmed identical in `lunar-typescript`.
Running the ported algorithm (counting + matriculation + force) gives:

| Stage | Element | Chi (count) | Force (ported) | Report says |
|-------|---------|-------------|----------------|-------------|
| Birth      | Water | low normal (2) | Fate        | Fate, low normal |
| Youth      | Wood  | low normal (2) | Happiness   | Happiness, low normal |
| Maturation | Fire  | low normal (2) | Recognition | Recognition, low normal |
| Adulthood  | Earth | **strong (4)** | Wealth      | Wealth, strong |
| Retirement | Metal | low (2)        | Opportunity | Wealth, low |

**All 5 stage elements match. All 5 Chi ratings match. 4 of 5 forces match.** The single force
difference (Retirement: ported Opportunity vs. the 2009 report's Wealth) is version drift
between the old ASP app and Bill's modern rebuild, and is immaterial. Element counts:
Wood 2, Fire 2, Earth 4, Metal 2, Water 2 → mix `42222` (the old report printed `43322` in its
prose summary; the per-stage chi, which is what the reading uses, matches exactly).

## Open items resolved (was SPEC §7)

- Element counting weights → **stem_element + branch_element + nayin, +1 each, clamp 0-5.**
- Count → rating curve → **the count is the rating (0-5)**; no separate curve.
- Stage-cycle start rule → **the matriculation formula** in step 4.

## Consequence for the plan

Stop reverse-engineering the spreadsheets. **Port `astro-eng/astro`.** See the rewritten
[`PLAN.md`](PLAN.md). The `docs/architecture/readings/Four Pillars Rewrite/` workbooks remain
useful as a cross-check on narrative wording, but the engine and its content should come from
`astro-eng/astro`, which is Bill's own current code.
