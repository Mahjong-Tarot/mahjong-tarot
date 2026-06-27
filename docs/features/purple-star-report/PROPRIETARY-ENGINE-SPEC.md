# Purple Star — Proprietary Chart Engine (replacing iztro)

**Status:** Design spec for review · **Date:** 2026-06-14
**Goal:** Remove the third-party `iztro` dependency and own the entire Purple Star
(Zi Wei Dou Shu, 紫微斗数) chart-casting pipeline in-house.

---

## 1. Why and what

Everything *interpretive* is already proprietary — Bill's data:

| Layer | Source | Status |
|---|---|---|
| Auspiciousness (1–4 star×palace) | Bill's matrix → `auspiciousness.json` | ✅ ours |
| Narratives (8 sheets) | Bill's workbook → `narratives.json` | ✅ ours |
| Fate trait bank | Houses.docx → `fate.json` | ✅ ours |
| Star canon / names / split | Bill → `stars.json` | ✅ ours |
| Scoring engine (SFSZ, ranking) | `engine.mjs` | ✅ ours |

**`iztro` does exactly two things for us**, both inside `chart-iztro.mjs`:

1. **Calendar conversion** — Gregorian birth datetime → Chinese lunar date + the
   year/month/day/hour **ganzhi** (干支, stems & branches).
2. **Star placement** — which of the ~108 stars land in which of the 12 palaces,
   plus decade ranges, ages, and brightness.

Owning these two = a fully proprietary system. As a bonus it lets us **control the
star canon directly** (e.g. admit 咸池 Peach Blossom so it surfaces in Travel — the
gap flagged in the auspiciousness PR), drop an npm dependency, and remove a black
box we can't calibrate.

This document specifies the algorithm. It is deterministic: same input → same chart.

---

## 2. The contract to preserve (do not break the engine)

The placement provider is the swappable seam. The new `chart.mjs` must return the
**exact same `chart` object shape** that `chart-iztro.mjs` returns today, so
`engine.mjs` and `render.mjs` need **zero changes**:

```js
chart = {
  meta: {
    solarDate, hour, timeIndex, gender,
    lunar, chinese,            // lunar date + ganzhi strings (display)
    sign, zodiac, soul, body,  // optional display extras
    fiveElements,              // the Bureau, e.g. "水二局"
    timeRange,
  },
  palaces: [                   // 12 entries
    {
      key,        // 'Ming' | 'Siblings' | ... (internal palace key)
      label,      // PALACE_LABEL[key]
      branchHan,  // '子'..'亥'  (earthly branch char of the cell)
      branchIdx,  // 0..11       (BRANCH_IDX[branchHan])
      animal,     // BRANCH_ANIMAL[branchHan]
      decade: { range: [startAge, endAge] } | null,
      ages: [ ... ],           // ages this palace governs (流年/小限)
      majors: [ star, ... ],   // billType==='Major'
      minors: [ star, ... ],   // billType==='Minor'
    },
  ],
}

star = { hanzi, roman, display, en, brightness, mutagen, billType }
// rating/weight/code are added later by engine.scoreChart() — NOT here.
```

The provider's job ends at "placed + tagged with hanzi/mutagen/(brightness)".
Scoring stays in `engine.mjs` exactly as it is today.

---

## 3. Inputs

| Input | Type | Notes |
|---|---|---|
| `solarDate` | `YYYY-M-D` (Gregorian) | civil date |
| `hour` | 0–23 (decimal ok) | local clock hour |
| `gender` | `'male' | 'female'` | drives decade/cyclical direction |

**Bill's day rule (already adopted):** a civil day *is* the day — a late-night 子
hour (23:00–01:00) does **not** roll the date forward. Keep this.

**Optional pre-step — True Solar Time (deferred, flagged in BUILD-STATUS):** correct
clock time to local apparent solar time using birthplace longitude + equation of
time + historical timezone/DST before deriving the hour branch. Out of scope for v1
of the engine; design the hour input so this can wrap it later.

---

## 4. Part A — Calendar conversion (the real dependency)

This is the hard part of leaving iztro, and the part most likely to introduce bugs.
We must convert a Gregorian datetime to:

- **lunar year, month (1–12 + leap flag), day (1–30)** — needed for 紫微 placement,
  month-based stars, and the Life/Body palace formulas;
- **year stem & branch** (年干支) — needed for stems, Si-Hua, year-based stars,
  cyclical-series direction;
- **hour branch** (时支, 0=子 … 11=亥) — from clock time, two-hour periods, with
  Bill's day rule.

### 4.1 The choice

Two ways to own this, in increasing cost:

1. **Bundle a lunar dataset (recommended).** The Chinese lunar calendar for a fixed
   range (e.g. **1900–2100**) is fully captured by a compact packed table — the same
   "lunar info array" pattern used by every mainstream MIT-licensed Chinese-calendar
   library. ~200 integers encode, per year: leap month, big/small months, and the
   solar date of lunar new year. From that we derive lunar Y/M/D exactly. Ganzhi is
   pure arithmetic off the year. **Vendor this as `lib/ps/lunar.mjs` (our code, our
   data), no runtime dependency.** Cheapest correct path.
2. **Compute astronomically.** New-moon instants (for month boundaries) and the 24
   solar terms (for the year boundary / 节气). Highest fidelity, large code, and
   needs a timezone model. Overkill for a birth-chart range; only worth it past 2100.

> **Boundary subtlety to get right:** Zi Wei month boundaries are the **lunar months**
> (new moon to new moon), *not* the solar-term months used by BaZi. The **year**
> boundary for the ganzhi can be taken at lunar new year (正月初一) in the common Zi
> Wei convention. Confirm both conventions against the gold sample charts (§9) — this
> is the #1 source of off-by-one chart errors.

### 4.2 Ganzhi arithmetic (no data needed)

- Year stem index = `(lunarYear − 4) mod 10` (0=甲…9=癸); branch = `(lunarYear − 4) mod 12` (0=子…11=亥).
- Year is **yang** if stem index is even, **yin** if odd. (Used by §7.)
- Hour branch = `floor(((hour + 1) mod 24) / 2)` (already in `hourToTimeIndex`).

---

## 5. Part B — Placement algorithm

All positions are **earthly-branch cells** indexed `子=0 … 亥=11`, fixed to the board.
"顺 / clockwise / forward" = +1 index; "逆 / counter-clockwise / backward" = −1.
`寅 = 2`. Everything below is integer arithmetic mod 12.

### 5.1 Life Palace 命宫 and Body Palace 身宫

Start 寅 at lunar month 1, go forward to the birth month, then for 命宫 go *backward*
by the hour, for 身宫 go *forward* by the hour:

```
命宫 = (2 + (month − 1) − hourIdx) mod 12      // 寅起正月, 顺数至生月, 逆数至生时
身宫 = (2 + (month − 1) + hourIdx) mod 12
```

### 5.2 The 12 palaces

From 命宫, lay the palace names **counter-clockwise** (逆):

```
命宫 → 兄弟 → 夫妻 → 子女 → 财帛 → 疾厄 → 迁移 → 仆役 → 官禄 → 田宅 → 福德 → 父母
Ming → Siblings → Marriage → Children → Wealth → Health → Travel → Associates → Career → Property → Happiness → Parents
```

Each palace's `branchHan` is its cell; `branchIdx`, `animal` derive from it.

### 5.3 Palace stems (五虎遁 / 年上起月)

The stem of the 寅 cell is fixed by the **year stem**; stems then run clockwise:

| Year stem | 寅 cell stem |
|---|---|
| 甲 / 己 | 丙 |
| 乙 / 庚 | 戊 |
| 丙 / 辛 | 庚 |
| 丁 / 壬 | 壬 |
| 戊 / 癸 | 甲 |

(Needed for the Bureau and for display; not needed by the current scorer.)

### 5.4 Five Elements Bureau 五行局

The Bureau is the **纳音五行** (sound-element) of the **命宫's ganzhi** (its stem from
§5.3 + its branch). Map to a number — this number drives 紫微 placement, 长生, and
decade start age:

| Bureau | Number |
|---|---|
| 水二局 Water | 2 |
| 木三局 Wood | 3 |
| 金四局 Metal | 4 |
| 土五局 Earth | 5 |
| 火六局 Fire | 6 |

Implement 纳音 as a 60-entry ganzhi→element lookup (standard, fixed table).

### 5.5 Place 紫微 (the keystone)

Given Bureau number `n` and lunar `day`:

```
k = ceil(day / n)            // smallest k with n*k ≥ day
r = n*k − day                // remainder
P = (2 + (k − 1)) mod 12     // count k cells clockwise from 寅
紫微 = (r even) ? (P − r) mod 12 : (P + r) mod 12
```

> ⚠️ **Verify against gold samples.** The "even subtract / odd add" remainder rule is
> the widely-documented method, but the exact starting offset and parity convention
> vary by source. Lock it by reproducing the sample charts in §9 before trusting it;
> a 起紫微 lookup table (Bureau × day → cell) is an equally valid, audit-friendly
> alternative and may be safer to ship.

### 5.6 The 14 major stars

**紫微 group (北斗), counter-clockwise from 紫微:**
```
天机 = 紫微 − 1
太阳 = 紫微 − 3
武曲 = 紫微 − 4
天同 = 紫微 − 5
廉贞 = 紫微 − 8
```
(口诀: 紫微逆去天机星，隔一太阳武曲辰，连接天同空二宫，廉贞居处方是真.)

**天府** is the mirror of 紫微 across the 寅–申 axis:
```
天府 = (4 − 紫微) mod 12      // e.g. 紫微子(0)→天府辰(4); 紫微寅(2)→天府寅(2)
```

**天府 group (南斗), clockwise from 天府:**
```
太阴 = 天府 + 1
贪狼 = 天府 + 2
巨门 = 天府 + 3
天相 = 天府 + 4
天梁 = 天府 + 5
七杀 = 天府 + 6
破军 = 天府 + 10      // 七杀 then skip 3
```
(口诀: 天府顺行有太阴，贪狼而后巨门临，随来天相天梁继，七杀空三是破军.)

### 5.7 Minor & adjunct stars (the `Minor` + `Adjunct` families)

Each has a deterministic rule keyed by hour / month / year-stem / year-branch.
Representative set (implement the full list from the matrix's `Type` column):

| Star(s) | Keyed by | Rule (branch index math) |
|---|---|---|
| 文昌 / 文曲 | hour | 文昌 = (10 − hourIdx) mod 12 (戌逆时); 文曲 = (4 + hourIdx) mod 12 (辰顺时) |
| 左辅 / 右弼 | month | 左辅 = (4 + (month−1)) mod 12 (辰顺月); 右弼 = (10 − (month−1)) mod 12 (戌逆月) |
| 天魁 / 天钺 | year stem | 干→branch lookup (天乙贵人 table) |
| 禄存 | year stem | 干→branch lookup |
| 擎羊 / 陀罗 | from 禄存 | 擎羊 = 禄存 + 1; 陀罗 = 禄存 − 1 |
| 火星 / 铃星 | year-branch triad + hour | start cell by 三合 group, then count by hour (gender-independent classical rule) |
| 地空 / 地劫 | hour | 地劫 = (11 + hourIdx) mod 12 (亥顺时); 地空 = (11 − hourIdx) mod 12 (亥逆时) |
| 天马 | year branch | 驿马: 申子辰→寅, 寅午戌→申, 巳酉丑→亥, 亥卯未→巳 |
| 红鸾 / 天喜 | year branch | 红鸾 = (3 − yearBranch) mod 12 (卯逆年支); 天喜 = 红鸾 + 6 |
| **咸池** (桃花) | year branch | 三合桃花: 申子辰→酉, 寅午戌→卯, 巳酉丑→午, 亥卯未→子 |
| 天姚 / 天刑 | month | from fixed start cell, count by month |
| (remaining Adjunct) | mixed | per-star classical rule; table-driven |

### 5.8 Si-Hua transformations 四化 (mutagens)

By **year stem**, four major stars receive 化禄/权/科/忌. Fixed 10-row table:

| Stem | 化禄 | 化权 | 化科 | 化忌 |
|---|---|---|---|---|
| 甲 | 廉贞 | 破军 | 武曲 | 太阳 |
| 乙 | 天机 | 天梁 | 紫微 | 太阴 |
| 丙 | 天同 | 天机 | 文昌 | 廉贞 |
| 丁 | 太阴 | 天同 | 天机 | 巨门 |
| 戊 | 贪狼 | 太阴 | 右弼 | 天机 |
| 己 | 武曲 | 贪狼 | 天梁 | 文曲 |
| 庚 | 太阳 | 武曲 | 太阴 | 天同 |
| 辛 | 巨门 | 太阳 | 文曲 | 文昌 |
| 壬 | 天梁 | 紫微 | 左辅 | 武曲 |
| 癸 | 破军 | 巨门 | 太阴 | 贪狼 |

Tag the matched star with `mutagen = '禄'|'权'|'科'|'忌'`. `engine.scoreChart`
already consumes this (the ±1 band).

### 5.9 The four cyclical 12-god series

Each is 12 stars, one per palace, starting at a computed cell:

| Series (matrix `Type`) | Start cell | Direction |
|---|---|---|
| 长生十二神 ChangSheng-12 | by Bureau: 水/土→申, 木→亥, 金→巳, 火→寅 | 阳男阴女顺 / 阴男阳女逆 |
| 博士十二神 Boshi-12 | at 禄存 | same yin-yang×gender rule |
| 岁前十二神 SuiQian-12 | at year branch (岁建) | 顺 (always) |
| 将前十二神 JiangQian-12 | by 三合: 申子辰→子, 寅午戌→午, 巳酉丑→酉, 亥卯未→卯 (将星) | 顺 (always) |

> Note: **咸池 appears twice** in the matrix (once as a 三合桃花 Adjunct, once in the
> 将前 series) — that is correct and why the ETL dedupes by hanzi.

**Direction rule (阳男阴女顺行, 阴男阳女逆行):**
`forward = (yearIsYang === (gender === 'male'))`.

### 5.10 Brightness 庙旺利陷 (display only)

Each major (and some minor) star has a brightness depending on the branch it lands
in — a fixed **14×12 star-by-branch table**. Since scoring now comes from the
auspiciousness matrix, brightness is **display only**; port the table for parity but
it does not affect luck.

### 5.11 Decades 大限 and ages 流年

- **First decade start age = Bureau number** (水二局→2, 木三局→3, …, 火六局→6).
- Decades walk the palaces from 命宫, **forward for 阳男阴女, backward for 阴男阳女**,
  10 years each: palace gets `decade.range = [start, start+9]`.
- **Ages (`ages[]`):** reproduce the per-palace 小限/流年 age list the engine's
  `buildYears()` consumes. Define this rule explicitly and validate it reproduces
  iztro's `ages` arrays during the transition (§9).

---

## 6. Canon — the matrix IS the canon (decided 2026-06-14)

**Decision (Dave):** the canon going forward is **the auspiciousness matrix we built**
— the full star list in `auspiciousness.json` / the Google Sheet, *not* the legacy
33-star subset in `stars.json`. The proprietary placer places **every star in the
matrix**: the **108 unique placed stars** across all `Type` families (Major 20,
Minor 14, Adjunct 34, ChangSheng-12, Boshi-12, SuiQian-12, JiangQian-12) plus the 4
Si-Hua catalysts as mutagens. 咸池 (Peach Blossom) is therefore in by definition and
will appear in Travel — the gap from the auspiciousness PR closes automatically.

Implications:

- **`stars.json` becomes a naming/identity *overlay*, keyed by hanzi**, for the
  subset Bill has curated (modern name, element, court-role, name-status). The
  **matrix is the authoritative star *list***; display name resolves as: Bill's
  locked name from `stars.json` if present → else pinyin + hanzi from the matrix.
  Every placed star always has at least the matrix's English/pinyin/hanzi.
- **Major vs Minor for scoring — needs one decision (see §9.5).** The engine weights
  `majors ×1.0`, `minors ×0.5`. The matrix `Type` has 8 families; the natural map is
  `Major → major`, **everything else → minor (×0.5)**. This grows per-palace star
  counts well beyond the old 20/13 split, so **scoring will need recalibration** (the
  RATING_WEIGHT map and palace thresholds) once the fuller set is placed.
- **Interim option (before the native placer exists):** widen `chart-iztro.mjs`'s
  `CANON` filter to the full matrix so iztro places the fuller set now. Cheap, but
  triggers the same recalibration — do it only if we want the richer chart before the
  proprietary engine lands.

---

## 7. Validation strategy (how we trust it)

1. **Differential test vs iztro (transition safety net).** Keep `chart-iztro.mjs`
   temporarily. Run the 180-birth sweep through *both* providers and diff palace-by-
   palace, star-by-star. Target: 100% match on the canon (or every difference
   explained — e.g. a deliberate canon addition). This is the cheapest way to prove
   the new placer is correct before deleting iztro.
2. **Gold sample charts.** Reproduce Bill's hand-cast reference charts (the sample
   `.doc` readings; Bill 1947-02-06 13:42 M) — confirm 命宫, Bureau, 紫微 cell, and the
   14 majors match. This validates the calendar conversion and §5.5 parity rule.
3. **Calendar edge cases.** Leap months, lunar-new-year boundary births, 子-hour
   births (Bill's day rule), year-boundary births. These are where it breaks.
4. **Keep `sweep-ps.mjs` green** (0 failures) and re-run `calibrate-ps.mjs`.

Only after (1) and (2) pass do we delete `iztro` from `package.json` and remove
`chart-iztro.mjs`.

---

## 8. Migration plan (phased, low-risk)

| Phase | Deliverable | Exit check |
|---|---|---|
| **P1 — Calendar** | `lib/ps/lunar.mjs` (vendored 1900–2100 conversion + ganzhi) | unit tests: N dates vs known lunar/ganzhi truth |
| **P2 — Placer** | `lib/ps/chart.mjs` (§5), same `chart` contract; behind a flag | differential diff vs iztro = 0 unexplained diffs (§7.1) |
| **P3 — Cut over** | member page + scripts import `chart.mjs`; canon finalized (+咸池) | gold samples pass; sweep green; calibrate sane |
| **P4 — Remove iztro** | delete `chart-iztro.mjs`, drop `iztro` dep | build clean; no `iztro` in lockfile |

Each phase is one PR. The engine, narratives, fate, and auspiciousness layers are
untouched throughout — this is purely swapping the placement provider behind its
existing seam.

---

## 9. Risks & open questions

1. **Calendar conversion is the main risk.** Off-by-one month/year at lunar/solar-term
   boundaries silently produces a wrong-but-plausible chart. Mitigate with the
   differential test (§7.1) and explicit boundary unit tests.
2. **紫微 parity rule (§5.5).** Lock against gold samples or ship the lookup-table form.
3. **`ages[]` semantics (§5.11).** We must match whatever iztro produced, since
   `buildYears()` depends on it — pin it in the differential test.
4. **Year-boundary convention** for the ganzhi (lunar new year vs 立春). Confirm which
   one iztro/Bill use; be consistent.
5. **Canon scope — DECIDED:** canon = the full matrix (§6). Remaining sub-decision:
   the **Major/Minor → scoring-weight** map (Major→×1.0, all else→×0.5?), which drives
   a **recalibration** of RATING_WEIGHT + palace thresholds once the fuller star set is
   placed. Confirm the map, then recalibrate against the gold samples.
6. **True Solar Time** (§3) remains deferred; design the hour input to allow wrapping.

---

*Once P1–P4 land, the Purple Star system is 100% proprietary: our calendar, our
placement, our canon, our scoring, our narratives — no third-party astrology library
in the runtime.*
