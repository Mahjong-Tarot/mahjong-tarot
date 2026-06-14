# Purple Star Report — Build Status

**Updated:** 2026-06-14 · supersedes parts of PLAN.md with what's now built.

## 2026-06-14 — Native engine landed; third-party astrology library removed

Placement is now **100% proprietary**. The third-party library is **gone** from
`package.json` and the lockfile (0 refs); `npm run build` is clean.

- **`lib/ps/lunar.mjs`** + vendored **`data/ps/lunar-table.json`** — Gregorian→lunar
  conversion + ganzhi + Five-Elements-Bureau (纳音), zero runtime dependency.
  Validated byte-for-byte over **73,017 days** (1900–2099).
- **`lib/ps/chart.mjs`** — full classical placement (命宫/身宫, palace stems, Bureau,
  紫微 table, 14 majors, all minor/adjunct stars, Si-Hua, the four 12-god series,
  decades, 小限 ages, soul/body, brightness slot). Places the **full matrix canon**
  (108 stars), so 咸池 etc. are placed by construction.
- **Validation:** differential vs the prior provider — **1,585,619 placements, 0 diffs**
  across 14,318 births (full range, all hours, both genders, leap months). A frozen
  `data/ps/chart-golden.json` + `scripts/diff-chart.mjs` keep this as a dependency-free
  regression test (0 diffs).
- **Cutover:** member page, scripts, and the legacy `lib/purpleStar.js` (member
  dashboard + admin private-readings) all run on the native engine. `chart-iztro.mjs`
  deleted. `lib/purpleStarNames.js` is now unused (left in place).
- **Scoring note:** the fuller canon (~10 stars/palace) shifts the score scale, so the
  luck-category logic was moved to a score-band (`engine.LUCK_BAND`, knob 2). Current
  distributions skew unfavorable (more 凶 cyclical stars) — **first-draft pending Bill's
  calibration** of the weights + band against his real charts. Placement is exact; only
  the luck thresholds are provisional.

## 2026-06-14 — Auspiciousness source swapped to Bill's matrix

**What changed:** scoring no longer derives from iztro brightness. It now reads
Bill's authored **1–4 star×palace matrix** (the canonical Google Sheet
`1_hfURgUyHsL-9_BFUHjmUU0DcCppgvpbhBKJf38olBY`, tab gid `1466894022`).

- New ETL [`etl_auspiciousness.py`](etl_auspiciousness.py) → `website/data/ps/auspiciousness.json`
  (keyed by hanzi + internal palace keys; `Fate→Ming`, `Friends→Associates`,
  `Wellbeing→Happiness`; 114 star rows deduped to **108 unique** by hanzi; 4 Si-Hua
  catalysts kept separate as mutagen modifiers).
- `engine.mjs scoreChart(chart, data)` now assigns each star's rating/weight/code
  from the matrix **in palace context** (`rateStarInPalace`). Two tunable knobs:
  `RATING_WEIGHT {1:-2,2:-1,3:+1,4:+2}` and the palace luck thresholds. Luck code
  derives from rating (4→VL 3→L 2→U 1→VUL). Mutagen shifts the rating ±1 band,
  clamped 1–4. Missing star → rating 2 + `console.warn`.
- `chart-iztro.mjs` still places stars and tags hanzi/mutagen/brightness, but no
  longer decides weight from brightness (brightness is display-only now).
- Data loaders (`data.mjs`, `data-node.mjs`) load `auspiciousness.json`. Callers
  (`gen-ps-report`, `sweep-ps`, member page) pass `data` to `scoreChart`.

**What did NOT change:** placement is still **iztro** (the 33-star canon, unchanged);
narratives and the fate bank are untouched; the paywall is untouched.

**Validation** (`sweep-ps.mjs` 180 births → 0 failures; `calibrate-ps.mjs` for the
three reference charts):
- Bill (1947-02-06 13:42 M): **6 六煞 malefic stars** now properly weighted (the old
  brightness engine counted only 2 — the whole point of the change); **Marriage =
  leastLucky** (破军 + 铃星 + 陀罗, all rating 1); palace luck **5 auspicious / 5 mixed /
  2 unfavorable** (target ~4/6/2); a **Very Unfavorable late-life decade** (Wellbeing,
  ages 102–111 — the 92–101 decade reads Neutral).
- Dave: **4/6/2** exactly; Marriage = leastLucky. Katherine: 2/7/3; Marriage mixed.

**Known gaps (flagged, not fudged):**
- **咸池 (Peach Blossom) is not in the 33-star canon**, so it is not placed and cannot
  appear in Travel — the matrix rates it (Travel=1) and is ready, but surfacing it
  needs the placement/canon to be expanded (separate task; placement is out of scope
  here). Do not "fix" by expanding the canon in this change.
- The very-unfavorable decade lands at ages **102–111**, not strictly the 90s; decade
  ranges come from iztro placement (unchanged here).
- Knobs are **first-draft pending Bill's calibration**. The 1–4 ratings and the new
  English names in the sheet are **Bill's to verify** — the engine consumes them as-is.

---

## What was built this session

The old data is imported into logical data structures, and a deterministic engine
generates **both** product types from a chart.

### Data structures (imported from the canonical workbook + Houses.docx)
ETL: [`etl_purple_star.py`](etl_purple_star.py) → `website/data/ps/`

| File | Contents |
|---|---|
| `stars.json` | **Bill's 37-star canon** (20 major / 17 minor by his split; 4 Transformations as mutagens). 33 joined to hanzi/pinyin/modern-name; the rest are the Si-Hua mutagens. **Not** iztro's 66. |
| `narratives.json` | All 8 narrative sheets: `palaceConclusion`, `palaceExtreme`, `decadePeriod`, `decadeYun`, `decadeStart`, `yearDescriptions`, `starCombo` (the luck-combo scoring engine), `nextYear`. |
| `fate.json` | Houses.docx per-palace × luck-level trait bank (the v1 **fate** layer, 12 palaces). |

### Engine + renderer
- [`website/lib/ps/engine.mjs`](../../../website/lib/ps/engine.mjs) — brightness→luck-code, **San Fang Si Zheng** scoring (focus 1.0 / opposite 0.3 / each trine 0.3), palace+decade ranking, `buildYears()` (10 luckiest/challenging ages + next-12-months), `buildFullReport()` (3 parts) and `buildPalaceReading()`.
- [`website/lib/ps/chart-iztro.mjs`](../../../website/lib/ps/chart-iztro.mjs) — the **swappable placement provider** (iztro adapter → provider-agnostic chart, restricted to the 37-star canon, Bill's day rule). Replace this one file for a native iztro-free engine.
- [`website/lib/ps/render.mjs`](../../../website/lib/ps/render.mjs) — HTML render; chart draws the SFSZ figure (opposite axis + trine triangle).
- [`website/scripts/gen-ps-report.mjs`](../../../website/scripts/gen-ps-report.mjs) — runnable generator (Katherine demo → `working_files/ps-*.html`).
- [`website/scripts/sweep-ps.mjs`](../../../website/scripts/sweep-ps.mjs) — robustness sweep.

Run: `node website/scripts/gen-ps-report.mjs` · validate: `node website/scripts/sweep-ps.mjs`

**Validated:** sweep of 180 births × 12 palace readings (2,160) — 0 failures, SFSZ intact on all. Full report = Part 1 Decades (12) + Part 2 Years (10 luckiest/challenging ages + next-12-months) + Part 3 the 12 Palaces.

## Products (pricing / access)
- **Single-palace reading — $9.99.** Augments a relationship/career reading. Chart kept deliberately mysterious (hook to the full reading).
- **Full Purple Star + Consultation — $88.**
- **Community members: all reports included.**

## Bill's corrections folded in
- Chart influence is **三方四正**: focus + mirror (opposite, 30%) + **two trine palaces** (4 apart, 30% each) — the trines were missing before.
- Two layers: **luck** (had) + **fate** (the substance; Houses bank now in, pending Bill's 5-fields rewrite).
- **Day rule:** a civil day is the day — no rollover for a late-night (子) hour.

## Open / calibration TODOs (flagged, not silently assumed)
1. **Placement still via iztro.** The native iztro-free engine (37-star classical placement + Bill's brightness table) is a separate track; engine consumes a provider-agnostic `chart` object so it's swappable.
2. **Scoring weights + brightness thresholds are first-draft** — calibrate against the gold sample `.doc` readings.
3. **Birth-time normalization not built:** require birth hour (done as input), and add place-of-birth → true solar time (longitude + historical DST).
4. **Fate layer = Houses trait bank (v1).** Replace with Bill's authored **5 fields × 12 palaces** when ready. Note: ~65/2160 palace×level cells are empty in the source Houses doc (e.g. Parents has no "very lucky" cell) — the conclusion still renders; his rewrite fills these.
5. Tables `purple_star_*` are **not in the live DB**; current app reads JSON. Decide DB-apply mechanism (Supabase MCP / SQL editor) before going to prod.
6. **Not yet wired to the site** — needs the member-dashboard surface + $9.99 / $88 / community gating. Nothing committed; all runs from the new files.
