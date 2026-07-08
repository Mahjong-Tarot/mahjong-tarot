# Four Pillars (Life Cycle) — Proprietary Engine Spec

**Status:** Draft spec · **Date:** 2026-07-08
**Branch:** `feat/four-pillars-real-reading`
**Companion to:** [`PLAN.md`](PLAN.md) (build phases), [`etl_four_pillars.py`](etl_four_pillars.py) (source extraction)
**Pattern precedent:** [`../purple-star-report/PROPRIETARY-ENGINE-SPEC.md`](../purple-star-report/PROPRIETARY-ENGINE-SPEC.md)

> **Update 2026-07-08:** Phase 1 found Bill's complete working engine in `astro-eng/astro` and
> validated it against the golden sample. The §7 unknowns below are **resolved** (exact counting,
> rating, and stage-cycle formulas). The build is now a port of that engine, not a
> reverse-engineer. See [`PHASE-1-FINDINGS.md`](PHASE-1-FINDINGS.md) and the rewritten
> [`PLAN.md`](PLAN.md). §2-§4 (the reading structure and contract) still stand.

## 1. The problem

Every "Four Pillars" surface on the site (quick reading, member dashboard "Your Four
Pillars", the private-reading prep brief and Claude generator, compatibility, fire-horse)
routes through `website/lib/bazi.js`. That file is a thin wrapper over the third-party
`lunar-typescript` package's `getEightChar()`, i.e. generic Chinese Ba Zi (八字). It
returns the raw stems and branches plus a naive five-element tally, and the app layers on
generic textbook interpretation hardcoded in `website/lib/readingBrief.js` (DAY_MASTER_LINES,
DOMINANT_LINES, ANIMAL_LINES). The quick reading even labels the section "Bazi — Four Pillars".

Bill does not practice generic Ba Zi. He has an authored **Life Cycle Reading** driven by a
proprietary content database. It has never been built. That is the gap: "Four Pillars" on
the site is generic Ba Zi, not Bill's reading.

This is the exact situation Purple Star was in before its native engine
(`website/lib/ps/`) was built from `docs/architecture/readings/Purple-Star-Luck/`. Four
Pillars has the authored source but no `website/lib/fp/` equivalent.

Note: even the pillar math diverges. Bill's animal→fixed-element table (`EASign`) reads
Ox=Water, Dragon=Wood, Sheep=Fire; the branch-element map in `bazi.js` (used everywhere)
gives Ox=Earth, Dragon=Earth. The "fixed sign element" is a distinct concept from the
branch's element, and Bill's reading depends on his table, not the library's.

## 2. The reading (target output)

The Life Cycle Reading maps a person's Four Pillars onto **five life stages**, each ruled by
one element in productive-cycle order. It is deterministic: same birth data always yields
the same reading.

| Stage        | Universal element | Season         | Rough ages          |
|--------------|-------------------|----------------|---------------------|
| Early / Birth| Wood              | Spring         | conception to ~6    |
| Education / Youth | Fire         | Summer         | ~5 to ~22           |
| Maturation   | Earth             | Middle season  | ~21 to ~35          |
| Career / Adulthood| Metal        | Autumn         | ~35 to retirement   |
| Retirement   | Water             | Winter         | retirement to end   |

The report is:

1. **Introduction** (mostly static): the five elements, five seasons, the cyclical view of
   life, the five "influences", the non-determinist disclaimer.
2. **Primary / Year Sign narrative**: the animal's early / middle / late years
   (`LCSignEarlyMiddleLateYears`).
3. **Five stage sections**, each containing:
   - **Luck**
     - **Element Relationships**, two comparisons:
       - a) *Stage ruling element vs. your fixed sign element* (your animal's fixed element).
         Constructive / destructive / same relationship drives lucky / unlucky / neutral.
       - b) *Your stage element vs. the universal stage element*. Constructive or destructive.
     - **Chi Strength**: a per-stage Chi rating (0 to 9) narrated as low / normal / high,
       plus the change from the previous stage (`LCChiDelta`).
     - **Conclusion**: overall Luck for the stage, from the L / U / N combination of the
       three luck factors (`LCConclusion`).
   - **Fate** (fixed / destiny): the stage's **Force** (one of Wealth, Opportunity, Fate,
     Happiness, Recognition) narrated with a strength derived from the relevant element
     count in the chart (`LCPeriodRating.ForceDescription`).
4. **Appendix**: general information (static).

There are also two supporting modules the source treats as their own products but that feed
the same chart:
- **Element Analysis (EA)**: element mix personality (excess / balance of each element),
  element-mix conclusion, element+sign personality (60 combinations).
- **Sign Analysis (SA)**: the 12 animals, the 60-year element+sign cycle, Western×Chinese
  sign overlay, the 28 lunar-mansion constellations.

## 3. Authored source inventory

Source workbooks live in `docs/architecture/readings/Four Pillars Rewrite/`. The narratives
in the old prototype describe the assembly logic:
`old data/Four Pillars Chi - Instructions.docx` and `old data/ReWrite-Prototype.docx`
(sample reading for a Dragon named "David Sample").

[`etl_four_pillars.py`](etl_four_pillars.py) extracts every sheet to `data/*.json`. Row
counts (see `data/_manifest.json`):

**element-analysis.json**
- `EAElement` (5): per-element productive/destructive cycle, characteristics, traits.
- `EAElementMix` (85): (HasHour, ElementID, Rating 0-8) → excess/balance narrative.
- `EAElementMixConclusion` (72): (HasHour, Mix code) → whole-chart element-balance narrative.
- `EAElementSign` (60): (ElementID × SignID) → personality of the 60 element+animal combos.
- `EASign` (12): SignID → fixed element + description. **Bill's canonical fixed-element map.**

**sign-analysis.json**
- `SAWesternSign` (13), `SAWesternChineseSign` (144): Western sign + how it modifies each animal.
- `SASign` (12): the 12 animals — defining characteristics, decision-making, positive/negative.
- `SALunarYear` (103): (ElementID, SignID, date range) — the 60-year cycle lookup, 1900+.
- `SAElementSign` (60): element+animal personality (SA's own 60-combo set).
- `SAConstellation` (28): the 28 lunar mansions by day → description.

**life-cycle.json**
- `LCPeriodRating` (2376): (Period, hasHour, Rating 0-9, RulingElementID, Force) →
  RatingDescription + ForceDescription. **The core engine table** (Chi + Fate narrative).
- `LCChiDelta` (133): (ChiPrev, ChiCurrent, HasHour) → the change-in-chi narrative.
- `LCConclusion` (61): (hasHour, Mix code) → the overall-luck conclusion.
- `LCElementNaturalRuling` (6): natural element × ruling element note.
- `LCSignEarlyMiddleLateYears` (12): SignID → early / middle / late-years narrative.

ID conventions (consistent across workbooks): ElementID 1..5 = Wood, Fire, Earth, Metal,
Water. SignID 1..12 = Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Sheep, Monkey, Rooster,
Dog, Pig.

## 4. Engine contract (the chart object)

Reuse the pillar computation already in `bazi.js` (`calculatePillars`) as the calendar
layer. Do not re-derive stems/branches. The Four Pillars engine consumes the pillars and
produces a `reading` object roughly:

```
{
  input:   { birthday, birthTime, hasHour, gender },
  chart:   { pillars, animalSign, fixedElement, elementCounts, mixCode },
  stages:  [ { key, universalElement, personStageElement, force,
              chiRating, chiDelta,
              luck: { relFixed, relStage, conclusion },
              fate: { force, strength, text },
              narrative: { chi, fate, conclusion } }, x5 ],
  yearSign:{ early, middle, late },
  element: { mix, mixConclusion, elementSign },   // EA module
  sign:    { animal, westernOverlay, constellation }, // SA module
}
```

A renderer (`render.mjs`) turns `reading` into the HTML fragment the quick reading and
member dashboard already expect. The private-reading generator consumes `reading` as
structured prep context instead of the current thin `readingBrief` string.

## 5. Algorithm

1. **Pillars**: `calculatePillars(birthday, birthTime)` (existing). `hasHour = !!birthTime`.
2. **Animal sign**: year branch → SignID.
3. **Fixed element**: `EASign[SignID].FixedElementID` (Bill's table, NOT the branch element).
4. **Element counts**: tally the five elements across the chart. **Open (see §7):** the exact
   counting method (visible stems + branches only, or including hidden stems 藏干; whether the
   day master is weighted) must match the source. EA mix codes sum to 13 with hour; LC mix
   codes sum to 12 with hour, so the two modules count slightly differently.
5. **Mix code**: sort the five element counts descending, concatenate to the 5-digit code
   (e.g. counts {W:9,F:4} → `94000`). Look up `EAElementMixConclusion` / `LCConclusion`.
6. **Per-stage Chi rating (0-9)**: **Open (see §7).** Most likely a function of how much of
   the stage's universal element the chart holds, scaled to 0-9. This is the primary
   reverse-engineering target. `LCChiDelta` then narrates rating[n] vs rating[n-1].
7. **Stage element relationships**: productive/destructive cycle (already in `bazi.js`:
   `ELEMENT_GENERATES` / `ELEMENT_DESTROYS`). Compare (stage ruling element, fixed element)
   and (person stage element, universal stage element) → each is constructive / destructive /
   same → maps to Lucky / Unlucky / Neutral.
8. **Stage Force**: each stage maps to a Force. Look up `LCPeriodRating` by
   (Period, hasHour, Rating, RulingElementID, Force) for the Chi + Fate narrative.
9. **Assemble** narratives from the lookups into the `reading` object; render.

## 6. Module layout (mirror `lib/ps/`)

```
website/lib/fp/
  data.mjs      // loads data/*.json (built artifact), typed accessors by ID
  chart.mjs     // pillars (reuse bazi) -> counts, mix, fixed element, per-stage ratings
  engine.mjs    // stage assembly: luck relationships, force lookup, conclusions
  render.mjs    // reading object -> HTML fragment
```

The committed JSON that ships in the app is a cleaned build artifact under
`website/lib/fp/` or `website/data/fp/`, produced by the ETL. The 2 MB raw `data/*.json` in
this docs folder is the extraction, not the shipped file.

## 7. Key unknowns and reverse-engineering risks

1. **Element counting method** (§5.4). The mix-code column tells us the *distribution* the
   narratives are keyed on, but not how raw pillars become counts. Recover from the old
   spreadsheet formulas (`old data/Four Pillars Rewrite.xls`, 831 KB, has live formulas) or
   by reproducing the prototype sample (David Sample, a Dragon, with the stage ratings quoted
   in `ReWrite-Prototype.docx`: low-normal Early, high Education, normal Maturation, lower
   Adulthood, high Retirement).
2. **Per-stage Chi rating formula** (§5.6). Same recovery path. This drives every stage's
   Luck, so it must match a golden sample before shipping.
3. **RulingElementID semantics in `LCPeriodRating`**: whether it is the person's stage
   element or the universal one. Resolve against the prototype.
4. **Data hygiene**: `LCPeriodRating.Period` contains both `Youth` and `youth`, a `NULL`
   period, and `Force` has both `Opportunity` and `opportunity`. The ETL must normalize case
   and drop/merge the stray rows before the app depends on them.
5. **EA vs LC count divergence** (13 vs 12). Confirm whether hidden stems are counted in one
   module and not the other, or whether it is a data-entry artifact.

Non-negotiable, carried from Purple Star: this drives **paid readings**, so the engine must
be **validated to a golden sample before it becomes the default**. No silently-wrong readings.

## 8. Integration points (surfaces to repoint after the engine is validated)

- `website/lib/quickReading.js` → `out.bazi` becomes the fp `reading`; drop the "Bazi" label.
- `website/lib/quickReadingHtml.js` `renderBaziSection` → render the fp `reading`.
- `website/pages/member/dashboard/index.jsx` "Your Four Pillars" → fp `reading`.
- `website/pages/api/admin/generate-reading.js` + `website/lib/readingBrief.js` → feed the
  structured `reading` to Claude instead of the generic day-master brief; drop "Bazi / Zi Wei".
- `website/components/BaziChart.jsx` → keep the pillar grid, add the stage/luck view.

Naming: retire "Bazi" across UI copy in favor of "Four Pillars" once the reading is real.
