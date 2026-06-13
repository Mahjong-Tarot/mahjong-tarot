# Purple Star Report — Build Status

**Updated:** 2026-06-13 · supersedes parts of PLAN.md with what's now built.

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
