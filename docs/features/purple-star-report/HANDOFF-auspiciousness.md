# Handoff: integrate Bill's auspiciousness matrix → re-run Purple Star charts

Paste the block below into a fresh Claude Code session at the repo root
(`~/code-projects/mahjong-tarot`). It is self-contained.

---

## PROMPT

You are picking up the Purple Star (Zi Wei Dou Shu) reading on The Mahjong Tarot site.
**Goal:** replace the engine's auspiciousness source with Bill's authored 1–4
star×palace matrix (now a Google Sheet), regenerate the charts/reports, validate,
and ship. Read `docs/features/purple-star-report/BUILD-STATUS.md` first for context.

### Background (what already exists, do NOT rebuild)
- Data lives in `website/data/ps/`: `stars.json` (37-star canon), `narratives.json`
  (8 workbook sheets), `fate.json` (per-palace trait bank).
- Engine: `website/lib/ps/engine.mjs` (scoring + report assembly, browser-safe),
  `chart-iztro.mjs` (placement provider), `render.mjs` (HTML), `data.mjs` (client
  data loader), `data-node.mjs` (node loader).
- Member page: `website/pages/member/dashboard/readings/purple-star.jsx` renders
  each member's report client-side from their `profiles` birth data.
- Scripts: `website/scripts/gen-ps-report.mjs` (demo gen), `sweep-ps.mjs` (robustness).
- Today, auspiciousness comes from **iztro brightness** in `engine.mjs`
  (`brightnessInfo`) → weight → `scoreChart`. THIS is what you're replacing.

### The new data source
Bill's matrix — **the canonical Google Sheet is**
`https://docs.google.com/spreadsheets/d/1_hfURgUyHsL-9_BFUHjmUU0DcCppgvpbhBKJf38olBY/edit?gid=1466894022`
fileId **`1_hfURgUyHsL-9_BFUHjmUU0DcCppgvpbhBKJf38olBY`**, tab gid **`1466894022`**.
(This is the file Dave maintains and Bill edits; ignore any other draft copies.)
Columns: `ID, Star (English), Hanzi, Pinyin, Type, Gloss/note,` then the 12 palaces:
`Fate, Siblings, Marriage, Children, Wealth, Health, Travel, Friends, Career, Property, Wellbeing, Parents`.
Cells are **1–4** (1 = least auspicious, 4 = most). 114 star rows + 4 Si-Hua catalyst rows.

**Get the current data (Bill may have edited it) — always pull from the canonical
sheet above, not the repo copy:**
1. Preferred: download the Sheet as CSV via the Google Drive connector
   (`download_file_content` / export, `exportMimeType: text/csv`, fileId
   `1_hfURgUyHsL-9_BFUHjmUU0DcCppgvpbhBKJf38olBY`, tab gid `1466894022`).
   If the connector isn't available, ask the user to File→Download→CSV and drop it in.
2. Fallback only (stale; pre-dates Bill's edits): `working_files/purple-star-matrix-rated.csv`.

### What to build
1. **ETL** `docs/features/purple-star-report/etl_auspiciousness.py`: read the matrix
   CSV → `website/data/ps/auspiciousness.json`, shape:
   `{ "<hanzi>": { "Ming":4, "Siblings":3, ... } }` keyed by **hanzi** and by our
   **internal palace keys** (Ming, Siblings, Marriage, Children, Wealth, Health,
   Travel, Associates, Career, Property, Happiness, Parents). Map the sheet's
   palace labels → internal keys: **Fate→Ming, Friends→Associates, Wellbeing→Happiness**
   (the rest are identical). Dedupe duplicate hanzi across cyclical groups (小耗,
   大耗, 病符, 华盖, 咸池, 天德 repeat with identical ratings). Keep the 4 catalysts
   (化禄/权/科/忌) separately as mutagen modifiers, not placed-star rows.

2. **Rewire scoring** to use the matrix instead of brightness:
   - In `engine.mjs scoreChart`, for each star in palace `p`, look up
     `auspiciousness[star.hanzi][p.key]` → rating 1–4 → weight via a tunable map
     (start: `{1:-2, 2:-1, 3:+1, 4:+2}`). This is where palace context exists, so
     assign weight here rather than in the chart provider.
   - Derive the luck `code` from the rating for the star-combo narratives
     (`4→VL, 3→L, 2→U, 1→VUL`).
   - Mutagen (Si Hua) on a star: shift its rating using the catalyst row
     (化禄/权/科 → +1 band, 化忌 → −1 band), clamped 1–4. Keep it simple + tunable.
   - `chart-iztro.mjs` should still place stars and tag hanzi/mutagen, but stop
     deciding final weight from brightness (brightness can remain for display only).
   - Any chart star missing from the matrix → default rating 2 and `console.warn`.
   - **The columns are life-palaces (Bill's interpretive choice), so the lookup is
     star×palace, NOT star×branch. Do not "fix" this to branches.**

3. **Leave narratives, fate, and placement alone.** iztro stays as the placement
   provider for now (replacing placement is a separate future task — do NOT remove
   iztro in this task). Do not touch the paywall (separate task).

### Validate (this is the point — the old engine under-counted unlucky stars)
- `node website/scripts/sweep-ps.mjs` → 0 failures across the 180-birth sweep.
- Regenerate and eyeball Bill's chart (born **1947-02-06, 13:42, male**) and check
  against his own feedback — these are the calibration targets:
  - **~6 inauspicious stars out of ~40** (the old engine gave only 2 — fixing this
    is the whole reason for the change).
  - **Marriage palace reads inauspicious** (it contains 破军 Po Jun + 铃星 Ling Xing).
  - Palace luck distribution roughly **4 auspicious / 6 mixed / 2 unfavorable**.
  - **Travel** carries the dissolute star **咸池 (Peach Blossom)**.
  - A **very-unfavorable decade in his 90s**.
- Also regenerate Dave (1972-09-01, 11:00, M) and Katherine (1996-01-12, 06:00, F).
- If results are off, tune **two small knobs only**: the 1–4→weight map and the
  palace luck-category thresholds in `engine.mjs`. Keep them as a clearly-labeled,
  tunable table. Do not hard-code per-person fudges.

"Re-run the charts on the website" = the member page generates client-side on load,
so once the data + engine change deploys, every member's chart regenerates
automatically. There is no batch job to run.

### Ship (follow repo git discipline)
- The working branch has **unrelated uncommitted WIP** (CLAUDE.md, writer files) —
  do NOT commit those. Per repo memory, branch off `origin/main` into a dedicated
  branch; because the dirty files block a clean switch, use a **git worktree off
  origin/main** (see how PRs #373/#374 were done), copy in only your changed files,
  `git add` them explicitly, commit, push, open PR (base `main`), wait for the
  Vercel check to pass, then merge. Never commit secrets; never `git add -A`.
- After merge, the production deploy is automatic; verify with a hard refresh at
  `/member/dashboard/readings/purple-star`.

### Honesty / guardrails
- The 1–4 ratings and the new English names in the sheet are **Bill's to verify** —
  current values may be AI drafts. The engine just consumes whatever the sheet says.
- State plainly in the PR what changed (auspiciousness source), what didn't
  (placement still iztro; narratives/fate unchanged), and that thresholds are
  first-draft pending calibration against Bill's real charts.
- Update `docs/features/purple-star-report/BUILD-STATUS.md` when done.
