# Purple Star — Native Engine Build Plan

**Status:** Build plan · **Date:** 2026-06-14
**Companion to:** [`PROPRIETARY-ENGINE-SPEC.md`](PROPRIETARY-ENGINE-SPEC.md) (the algorithm)

> This plan supersedes the older iztro-based PLAN. The original
> placement-via-third-party-library plan is archived as
> [`PLAN-legacy-2026-06-04.md`](PLAN-legacy-2026-06-04.md).

## Objective

Make the Purple Star chart **100% proprietary** — own the calendar conversion and the
star placement in-house, remove the third-party astrology library from the runtime and
from `package.json`, and place the **full matrix canon** (108 placed stars + 4 Si-Hua
catalysts), so 咸池 and every other matrix star appear by construction.

Non-negotiable: this math drives **paid ($88 / $9.99) readings**, so the native engine
**must be validated to parity before it becomes the default** — no silently-wrong charts.

## Guardrail: the contract stays fixed

The new placer returns the **exact `chart` object** the engine already consumes
(see spec §2). `engine.mjs`, `render.mjs`, `data.mjs`, and the member page do **not**
change. We are swapping one file behind an existing seam.

## Phases

### Phase 0 — Docs (this PR)
- Ship `PROPRIETARY-ENGINE-SPEC.md` (algorithm) + this `PLAN.md`.
- **Done when:** merged to main.

### Phase 1 — Calendar (`website/lib/ps/lunar.mjs`)
- Vendored 1900–2100 Gregorian→lunar conversion (packed lunar table, our data) +
  ganzhi arithmetic (year stem/branch, yin/yang) + hour branch (Bill's day rule).
- Self-checks: per-year invariants (12–13 months; 353–385 days; monotonic new-year),
  plus spot-checks against known lunar-new-year dates.
- **Done when:** unit checks pass; conversion is deterministic and dependency-free.

### Phase 2 — Placer (`website/lib/ps/chart.mjs`)
- Implement spec §5: Life/Body palace, 12 palaces, palace stems, Five Elements Bureau,
  紫微 placement, the 14 majors, minor/adjunct stars, Si-Hua, the four 12-god series,
  brightness (display), decades + ages.
- Places the full matrix canon; `stars.json` is the naming overlay (Major→major,
  all other families→minor for the engine's weight split — see spec §6/§9.5).
- **Done when:** produces a complete, well-formed `chart` for every birth.

### Phase 3 — Validation (golden snapshot, no old-provider import in committed code)
- One-time: snapshot N reference charts to `website/data/ps/chart-golden.json`
  (generated once from the prior provider as a test oracle; the committed test reads
  only the snapshot — the old library is **not** imported by anything we keep).
- Differential test `scripts/diff-chart.mjs`: native engine vs golden snapshot,
  palace-by-palace / star-by-star. Plus Bill's gold hand-cast chart (命宫, Bureau,
  紫微, 14 majors). Plus calendar edge cases (leap month, new-year boundary, 子 hour).
- **Done when:** 0 unexplained diffs on the canon; gold samples match; `sweep-ps.mjs`
  green; `calibrate-ps.mjs` sane (recalibrate RATING_WEIGHT/thresholds for the fuller
  star set).

### Phase 4 — Cutover + removal
- Point the member page + scripts at `chart.mjs`.
- Delete the old provider adapter; remove the dependency from `package.json` + lockfile.
- **Done when:** build clean; no third-party astrology lib anywhere; production verified.

## Sequencing

Phase 0 ships now. Phases 1–3 land together in the **native-engine PR** (the engine is
inert until validated). Phase 4 (the deletion) merges only once Phase 3 is green — in
the same PR if validation passes in-branch, else a fast follow-up.

## Acceptance for "iztro is gone"

- `grep -ri iztro website/` returns nothing in shipped code.
- `package.json` / lockfile contain no third-party astrology library.
- Charts for Bill / Dave / Katherine match the validated golden snapshot.
- `sweep-ps.mjs` 0 failures; member page renders on a hard refresh.

## Risks (carried from spec §9)

1. **Calendar conversion** is the main correctness risk → the golden differential test
   is the safety net (it also catches any lunar-table transcription error).
2. **紫微 parity rule** → lock against gold samples or use the lookup-table form.
3. **`ages[]` semantics** → pin via the golden snapshot.
4. **Recalibration** of scoring for the fuller canon → redo against gold samples.
