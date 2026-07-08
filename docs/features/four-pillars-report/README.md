# Four Pillars (Life Cycle) Report

Bill's authored **Four Pillars / Life Cycle Reading**, being built to replace the generic
Ba Zi that currently backs every "Four Pillars" surface on the site. Same situation Purple
Star was in before its native engine ([`../purple-star-report/`](../purple-star-report/)).

## Files

| File | What it is |
|------|------------|
| [`SPEC.md`](SPEC.md) | The reading, the data model, the algorithm, the open unknowns. |
| [`PLAN.md`](PLAN.md) | Phased build plan. Phase 1 (formula recovery) is the gate. |
| [`PHASE-1-FINDINGS.md`](PHASE-1-FINDINGS.md) | Formula-recovery result: what is settled, the golden sample, and the 3 remaining unknowns. |
| [`etl_four_pillars.py`](etl_four_pillars.py) | Extracts the authored workbooks to `data/*.json`. Rerun from this folder. |
| `data/*.json` | Raw extraction of the three authored workbooks (~2.3 MB, gitignored, regenerable via the ETL). |

## Authored source

`docs/architecture/readings/Four Pillars Rewrite/`
- `Element AnalysisRevised.xlsx`, `Sign Analysis.xlsx`, `Life Cycle.xlsx` (the data)
- `old data/ReWrite-Prototype.docx` (the golden sample reading: "David Sample", a Dragon)
- `old data/Four Pillars Chi - Instructions.docx` (how the sections assemble)
- `old data/Four Pillars Rewrite.xls` (has the live formulas needed for Phase 1)

## Status

Phase 0 (docs + extraction) and Phase 1 (formula recovery) **done** on branch
`feat/four-pillars-real-reading`. Not merged, no app code changed yet.

**Phase 1 gate is CLOSED.** Bill's complete working engine was found in his `astro-eng/astro`
repo and validated against the golden sample (all 5 stage elements + all 5 chi ratings match).
The build is a **port of `astro-eng/astro`** into `website/lib/fp/`, not a reverse-engineer.
See [`PHASE-1-FINDINGS.md`](PHASE-1-FINDINGS.md).

**Phases 2 (calc engine) and 3 (content + assembly) are DONE and validated.** `website/lib/fp/`:
- `data.mjs` — the 60-row pillars-of-fate table + constants.
- `chart.mjs` — `buildFourPillarsChart({ birthday, birthTime })` (counting + matriculation + force).
- `content.mjs` / `content-node.mjs` — the narrative content loaders (app / node).
- `engine.mjs` — `buildFourPillarsReading(chart, content)` assembles the full reading.
- `validate-golden.mjs`, `validate-reading.mjs` — run from `website/` with `node lib/fp/<file>`.

The narrative content ships in `website/data/fp/*.json` (ported by `port_content.py`). Both
validators reproduce Bill's golden sample word-for-word; a 648-chart sweep has 100% per-stage
content coverage and 0 crashes. **The files are inert** (nothing in the app imports them yet).

Next: Phase 4 (Bill signs off on one live chart) and Phase 5 (`render.mjs` + repoint the quick
reading / member dashboard / private-reading generator, retire the "Bazi" label).
