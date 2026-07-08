# Three Blessings Report — Phase 1 Findings

**Status:** Phase 1 complete (data extraction + provenance + golden capture). No engine code yet.
**Analogue:** This mirrors `docs/features/four-pillars-report/PHASE-1-FINDINGS.md`. The Four
Pillars ("Life Cycle") reading was reconstructed the same way and now lives in `website/lib/fp/`.

---

## TL;DR

- The live Three Blessings reading (`website/lib/three-blessings.js`) is **not** Bill's method.
  It invents a mahjong-card assignment on top of generic Ba Zi. Bill's real reading is a
  rule-based **Fu Lu Shou** engine (Happiness / Wealth / Longevity), driven off the Four Pillars.
- **The clean engine source is a dead end.** `astro-eng/astro` (the 2023 Astroverse rewrite)
  ported Four Pillars + the Mahjong Mirror but **contains no Three Blessings** — every distinctive
  marker (`TBSign`, `TBGrandConclusion`, "Fu Lu Shou", "internal compatibility", the Grand
  Conclusion text) is absent from the repo. So unlike Four Pillars, there is no SQL/TS to port.
- **The only source of truth is Bill's Excel workbook.** It is pure lookup data — the `.xls`
  files have **zero formulas**. The selection/tally logic lived in the retired
  onlinechineseastrology.com ASP app and must be reconstructed.
- Phase 1 extracted all **22 tables (1,082 rows)** to `website/data/tb/*.json` and captured the
  **two authored prototype reports** as word-for-word golden fixtures.
- The computation model is fully specified by the tables (see below) and the input keys are the
  **same Four-Pillars quantities `website/lib/fp/chart.mjs` already computes**, so the engine
  phase is a lookup-and-tally build validated against the goldens.

---

## Provenance / source of truth

| Source | Verdict |
|---|---|
| `astro-eng/astro` (private) | **No Three Blessings.** Only Four Pillars + Mahjong Mirror were ported. Dead end. |
| `docs/architecture/readings/ThreeBlessings/Three Blessing.xlsx` | **CANONICAL.** 19 lookup tables. Matches the golden reports. Extracted from. |
| `docs/architecture/readings/ThreeBlessings/Three Blessing - Final.xls` | Superset (adds the 3 "Improve" tables) **but** contains a later, more conversational **voice rewrite** of `TBElement`, `TBRating`, `TBMaturation` that does **not** match the goldens. Used only for the Improve tables. |
| Golden prototype reports (2 `.docx`) | The retired ASP app's real output. Contain the **primary** workbook's phrasing ("This indicator is NEUTRAL, as…") and **none** of the Final's rewrites ("my friend", "Wealth and money? That's Metal's forte"). |

**Decision:** `Three Blessing.xlsx` is canonical because it matches the golden validation samples.
The Final `.xls` rewrites (`TBElement`, `TBRating`, `TBMaturation`) are captured as an **open
product question** for Phase 2 — Bill may prefer that newer voice, but adopting it means the
goldens no longer validate those 3 tables verbatim. `port_content.py` can emit the Final variants
on request.

---

## The computation model (fully recovered from the tables)

1. **Per-indicator verdict.** Every indicator resolves to a `LuckValueID` via `tb-luck-value.json`:
   `1 = LUCKY`, `2 = NEUTRAL`, `3 = UNLUCKY`.
2. **Three blessings, ~10 indicators each.** Luck (Happiness), Prosperity (Wealth), and
   Health/Longevity are each scored by a set of indicators drawn from the Elements / Animal Signs /
   Life-Cycle tables. `tb-luck-conclusion.json` is keyed by `(NumLucky, NumNeutral, NumUnlucky)`
   summing to **10** — so each blessing has **10 indicators**, tallied into an (L,N,U) triple.
3. **Per-blessing conclusion.** `(NumLucky, NumNeutral, NumUnlucky)` → the matching row's
   `LuckConclusionNarrative` / `WealthConclusionNarrative` / `HealthConclusionNarrative` and an
   overall verdict for that blessing.
4. **Grand conclusion.** The 3 blessing verdicts → `(TotalLucky, TotalUnlucky)` over `{0..3}` →
   `tb-grand-conclusion.json` (11 rows, e.g. `3L/0U` = "Fate has especially favored you…").
5. **Numeric rating tables** (`tb-rating.json` keyed `hasHour|rating` 0–9; `tb-health-element.json`
   keyed `yearElementId|hasHour|rating`; `tb-mat-adult-chi.json` keyed `hasHour|period|chiRating`)
   map a **chi/element count** to a verdict. These counts are exactly the per-stage `clamp(count,9)`
   values `website/lib/fp/engine.mjs` already derives — the two engines share their arithmetic.

---

## Output contract (from the golden reports)

```
Background
Section 1 — Luck (Happiness)
  What the Elements Say   → Element Mix, Element cycle, Year of birth
  What the Stars Say      → Month of birth, Day of birth, [Purple Star / Ming Palace]*
  What the Chart Says     → Opportunity, Maturation
  What Animal Signs Say   → Year Sign, Month Sign, Hour Sign, Internal Sign Compatibility
  Conclusion
Section 2 — Prosperity (Wealth)
  Elements (Year Element, General Indicators) · Animal Signs (Year Sign) · Stars (Day of Birth)
  Chart (General Indicators, Opportunity: Time/Kind, Maturation: Mid Life) · Animal (Month, Hour)
  Conclusion
Section 3 — Longevity / Health
  Elements (Heavenly stem, Element mix, General Indicators) · Stars (Day of Birth, [Health Palace,
  Very Lucky Stars]*) · Chart (Happiness, Longevity) · Animal (Year, Month, Element mix)
  Conclusion
Grand Conclusion
How You Can Improve Your Luck  (Timing: Day/Month/Year/Decade/Stage of Life)
Appendices
```
`*` Purple Star / Ming Palace / Health Palace / Very Lucky Stars indicators depend on the
Zi Wei (Purple Star) engine, which is **also un-encoded** (see the Purple Star findings). In a v1
these are optional/stubbed; the core Four-Pillars indicators stand alone.

---

## Extracted tables (`website/data/tb/`)

Faithful, lossless row-array JSON (one file per sheet; empty spacer columns dropped; ids and
LuckValueIDs coerced to int). **Intended lookup key** documented per table for the engine phase:

| File | Rows | Source sheet | Intended key | Value |
|---|---:|---|---|---|
| `tb-sign.json` | 12 | TBSign | `SignID` | year/hour × luck/wealth/health narrative + LV |
| `tb-rating.json` | 19 | TBRating | `HasHour\|Rating`(0–9) | health/wealth/happiness/longevity narrative + LV |
| `tb-opportunity.json` | 60 | TBOpportunity | `YearSignID\|Stage` | opportunity narrative + LV |
| `tb-means-opportunity.json` | 10 | TBMeansOpportunity | `Indicator\|ElementID` | means description + LV |
| `tb-metal-wealth.json` | 19 | TBMetalWealth | `MetalWealth`(count) | narrative + LV |
| `tb-month-sign.json` | 144 | TBMonthSign | `YearSignID\|MonthSignID` | luck/wealth/health narrative + LV |
| `tb-maturation.json` | 228 | TBMaturation | `YearSignID\|Stage\|HasHour\|ChiRating` | narrative + LV |
| `tb-mat-adult-chi.json` | 38 | TBMatAdultChi | `HasHour\|Period\|ChiRating` | description + LV |
| `tb-luck-value.json` | 3 | TBLuckValue | `LuckValueID` | LUCKY / NEUTRAL / UNLUCKY |
| `tb-luck-conclusion.json` | 66 | TBLuckConclusion | `NumLucky\|NumNeutral\|NumUnlucky` (Σ=10) | luck/wealth/health conclusion |
| `tb-luck-element-mix.json` | 59 | TBLuckElementMix | `HasHour\|Mix` (e.g. `93000`) | health-mix + luck-mix narrative + LV |
| `tb-luck-fixed-element.json` | 25 | TBLuckFixedElement | `FixedElementID\|YearElementID` | narrative + LV |
| `tb-int-comp-conclusion.json` | 86 | TBIntCompConclusion | `Rating` | internal-compatibility conclusion + LV |
| `tb-health-luck.json` | 21 | TBHealthLuck | `Rating`(favorable count) | health-luck conclusion + LV |
| `tb-health-element.json` | 83 | TBHealthElement | `YearElementID\|HasHour\|Rating` | narrative + LV |
| `tb-grand-conclusion.json` | 10 | TBGrandConclusion | `TotalLucky\|TotalUnlucky` | grand conclusion narrative |
| `tb-element.json` | 5 | TBElement | `ElementID` | year-wealth + birth-stage narrative + LV |
| `tb-constellation.json` | 28 | TBConstellation | `ConstellationID` | luck/wealth/health narrative + LV |
| `tb-compat-rating.json` | 144 | TBCompatRating | `FirstSignID\|SecondSignID` | rating + LV + harmony |
| `tb-improve-element.json` | 15 | TBImproveElement (Final) | `ElementID` | how-to-improve narrative |
| `tb-improve-yin-yang.json` | 0 | TBImproveYinYang (Final) | `Yin/Yang/Balanced` | **narratives blank in source** (see note) |
| `tb-harmony.json` | 7 | TBHarmony (Final) | — | harmony narrative |

**1,082 rows across 22 tables.**

Note — `tb-improve-yin-yang.json` is empty: the source sheet has the keys (`Yin`/`Yang`/`Balanced`)
but the `HowToImprove` narrative column is unpopulated. That copy most likely lives as prose in
`docs/architecture/readings/ThreeBlessings/How To Improve Your Luck.docx`, not as a table.

---

## Dependencies

- **`website/lib/fp/` (Four Pillars chart).** The TB engine needs the pillars, element counts,
  element **mix code**, and per-stage **chi/count** that `fp/chart.mjs` already produces. This is
  why the work is stacked on the same in-flight port. If `fp/` moves, re-point the imports.
- **Purple Star (Zi Wei).** Optional indicators only (Ming/Health Palace, Very Lucky Stars).
  Un-encoded today; stub for v1.

---

## Golden fixtures (`docs/features/three-blessings-report/golden/`)

- `golden-david-1972.txt` — "david", b. 1972-09-01 12:00 (Water Rat / Earth Monkey / Wood Sheep / Water Horse).
- `golden-bill-1947.txt` — "Bill", b. 1947-02-06 13:00 (Fire Pig / Water Tiger / Fire Dragon / Wood Sheep).

Phase 2 must reproduce these two reports word-for-word from birth data alone (same bar the
`fp/` port was held to).

---

## Open questions for Phase 2 (engine)

1. **Exact indicator→blessing binding.** The provisional map above (10 indicators per blessing) is
   read off the golden section structure; confirm the precise table set and order by diffing engine
   output against the goldens.
2. **How each `Rating`/`ChiRating` is computed** from the chart (which stage's clamped count feeds
   which indicator). Recover from `fp` stage logic + goldens.
3. **Primary vs Final voice.** Ship the golden-aligned primary text, or adopt Bill's newer Final
   rewrite of `TBElement`/`TBRating`/`TBMaturation`? Product call.
4. **Purple Star indicators** — stub vs. block on the Zi Wei engine.

---

## Regenerate

```bash
python3 docs/features/three-blessings-report/port_content.py   # from repo root
```
Requires `openpyxl` and `soffice` (LibreOffice, for the 3 Final-only Improve tables).
