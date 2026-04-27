# Fire Horse 2026 — Day Master Addendum

This document layers the **Day Master (日主)** onto the year-pillar methodology in [methodology.md](methodology.md). The year-pillar reading (60-sign view) gives a useful but shallow forecast — your "social/public year." The Day Master reading goes deeper — it's the centerpiece of modern BaZi practice and is what tells a Yin Earth person and a Yang Metal person born in the same year that they'll have **very different** Fire Horse experiences, even if they're both Tigers.

This is the Phase-2 layer. Phase 1 (year pillar) requires birth year; this requires birth date. If a user's profile has a birth date, we can show the deeper reading.

## What this layer adds

| Layer | Personas | Required input | Notes |
|---|---|---|---|
| Year pillar (Phase 1) | 60 (12 sign × 5 element) | birth year | Already shipped |
| **+ Day Master (this doc)** | 60 × 10 = 600 | birth date | Adds polarity (Yin/Yang) which the year-pillar drops |
| Full BaZi (Phase 3, future) | thousands | birth date + time | Adds month + day + hour pillars, branch interactions, Luck Pillar |

The voice across all layers stays probabilistic: the Day Master shifts the deck — it does not lock the outcome. *"For a Yang Metal Day Master, the deck is stacked harder against you this year — Fire melts Metal, and the polarity match makes the friction sharper. About 6 in 10 Yang Metal people will feel real career pressure. The 4 in 10 who do well are the ones who treat the pressure as a forge, not as an attack."*

## Reusing what's already built

The existing infrastructure in [website/lib/bazi.js](website/lib/bazi.js) does the heavy lifting. We don't rebuild any of this.

**Already in place:**

- [website/lib/bazi.js:3](website/lib/bazi.js:3) — `STEMS` table (10 heavenly stems, keyed by Chinese char, with `{en, element, polarity}`).
- [website/lib/bazi.js:16](website/lib/bazi.js:16) — `BRANCHES` table (12 earthly branches, with `{en, animal, element}`).
- [website/lib/bazi.js:59](website/lib/bazi.js:59) — `calculatePillars(birthday, birthTime)` — runs `lunar-typescript` to produce all four pillars from a birth date.
- [website/supabase/004_user_profiles_and_inner_circle.sql:18](website/supabase/004_user_profiles_and_inner_circle.sql:18) — `profiles.pillars` jsonb column already stores the full computed chart for every signed-in user.

**The Day Master is one property access away:**

```js
const dayMaster = pillars.day.gan;          // e.g. '丙'
const dmInfo    = pillars.day.stem;          // { en: 'Bing', element: 'Fire', polarity: 'Yang' }
```

**What's missing and we add:**

1. The 10 Gods (十神) lookup — a small function that takes (DM, other_stem) and returns the relationship type. Pure data + arithmetic, no library needed.
2. The Fire Horse year modifier table — 10 entries, one per possible Day Master, ported here.
3. The per-month modifier table — 10 DMs × 12 months = 120 cells, computed via the same 10 Gods function.

These three live in `compute_scores.py` (already alongside `methodology.md`) and emit `day-master-scores.json` for the website to consume.

## The 10 Heavenly Stems

| # | Stem (汉字) | English | Element | Polarity |
|---|---|---|---|---|
| 1 | 甲 | Jia  | Wood  | Yang |
| 2 | 乙 | Yi   | Wood  | Yin  |
| 3 | 丙 | Bing | Fire  | Yang |
| 4 | 丁 | Ding | Fire  | Yin  |
| 5 | 戊 | Wu   | Earth | Yang |
| 6 | 己 | Ji   | Earth | Yin  |
| 7 | 庚 | Geng | Metal | Yang |
| 8 | 辛 | Xin  | Metal | Yin  |
| 9 | 壬 | Ren  | Water | Yang |
| 10| 癸 | Gui  | Water | Yin  |

Every Day Master is one of these ten. Year stem of 2026 is **丙 Bing — Yang Fire**. The whole forecast turns on how your DM relates to Bing.

## The 10 Gods (十神)

The canonical BaZi mechanism for stem-vs-stem analysis. Given a Day Master and any other stem (year, month, day, hour, or external), the relationship is one of ten types determined by two questions:

1. **Element relationship** — same? produced by? produces? destroys? destroyed by?
2. **Polarity match** — same Yin/Yang? or opposite?

The 5 element relationships × 2 polarity outcomes = 10 Gods.

| Element relation (DM vs other) | Same polarity | Opposite polarity |
|---|---|---|
| Same element            | 比肩 Friend           | 劫财 Rob Wealth         |
| DM produces other       | 食神 Output           | 伤官 Hurt Officer       |
| DM destroys other       | 偏财 Indirect Wealth  | 正财 Direct Wealth      |
| Other destroys DM       | 七杀 Seven Killings   | 正官 Direct Officer     |
| Other produces DM       | 偏印 Indirect Resource| 正印 Direct Resource    |

Quality (in plain English, ranked roughly best-to-worst):

| 10 Gods | Plain English | Default quality | Year-pillar lift |
|---|---|---|---:|
| 正印 Direct Resource    | Protection, wisdom, recognition coming to you      | Strongly positive  | +0.10 |
| 正财 Direct Wealth      | Steady financial flow, your effort pays off         | Positive            | +0.07 |
| 偏财 Indirect Wealth    | Speculative gains, hustle, opportunistic income     | Positive            | +0.05 |
| 食神 Output             | Creative output, generosity, joyful expression      | Positive            | +0.05 |
| 偏印 Indirect Resource  | Unconventional protection, learning from struggle   | Mildly positive     | +0.03 |
| 正官 Direct Officer     | Career pressure that becomes structured advancement | Mildly positive     | +0.02 |
| 伤官 Hurt Officer       | Talent shines but rebellious, clashes with authority| Neutral             |  0.00 |
| 比肩 Friend             | Peer-level energy, intense, competitive             | Mildly negative     | −0.02 |
| 劫财 Rob Wealth         | Drained by peers, financial volatility              | Negative            | −0.05 |
| 七杀 Seven Killings     | Pressure, conflict, growth via real challenge       | Strongly negative   | −0.10 |

These quality calls are calibrated for **the prose layer's voice**: probabilistic, not deterministic. A "Seven Killings" reading does not say "you're doomed" — it says "the deck is stacked toward conflict for your kind of energy this year, but conflict is also where Seven Killings people grow."

## The 10 Day Masters in a Bing-Wu (Fire Horse) Year

This is the Phase-2 lookup. Every Day Master gets a specific 10 Gods reading against the year stem 丙 Bing.

| Day Master | DM Element/Polarity | Relation to Bing | 10 Gods | Year lift | Plain English |
|---|---|---|---|---:|---|
| 甲 Jia  | Yang Wood  | DM produces year, same polarity      | 食神 Output            | +0.05 | Year energy gives you a creative outlet. Productive. |
| 乙 Yi   | Yin Wood   | DM produces year, opposite polarity  | 伤官 Hurt Officer      |  0.00 | You'll shine, but you'll buck authority. Mixed. |
| 丙 Bing | Yang Fire  | Same element, same polarity          | 比肩 Friend            | −0.02 | The year mirrors you. Intense, competitive. Be careful what you compete *for*. |
| 丁 Ding | Yin Fire   | Same element, opposite polarity      | 劫财 Rob Wealth        | −0.05 | The year drains your resources to feed peers/family. Watch finances. |
| 戊 Wu   | Yang Earth | Year produces DM, same polarity      | 偏印 Indirect Resource | +0.03 | Year nourishes you through unusual sources. Learning year. |
| 己 Ji   | Yin Earth  | Year produces DM, opposite polarity  | 正印 Direct Resource   | **+0.10** | Best DM-year fit of all ten. Protection, recognition, wisdom flowing in. |
| 庚 Geng | Yang Metal | Year destroys DM, same polarity      | 七杀 Seven Killings    | **−0.10** | Worst DM-year fit. Real pressure. Growth-through-fire if you can take it. |
| 辛 Xin  | Yin Metal  | Year destroys DM, opposite polarity  | 正官 Direct Officer    | +0.02 | Career-structured pressure. Productive if you accept the structure. |
| 壬 Ren  | Yang Water | DM destroys year, same polarity      | 偏财 Indirect Wealth   | +0.05 | You push against the year and gain. Opportunistic, hustle pays. |
| 癸 Gui  | Yin Water  | DM destroys year, opposite polarity  | 正财 Direct Wealth     | +0.07 | Steady gains from disciplined effort against the year's grain. |

**Two patterns to notice** that the year-pillar (12-sign) view completely misses:

- **Yang Metal vs Yin Metal split.** In the 12-sign view, both Monkey and Rooster (and Dog) are Metal-fixed and get the same `−5×1.4 = −7` year-element penalty. Day Master differentiates them by polarity: Yang Metal Day Masters land on Seven Killings (−0.10), Yin Metal Day Masters land on Direct Officer (+0.02). Same metal, very different year. The polarity carries 0.12 of score.
- **Earth Day Masters benefit asymmetrically.** Bill said "Earth-year people benefit, Fire produces Earth → wealth." True — but Yin Earth (Direct Resource, +0.10) gets a much stronger lift than Yang Earth (Indirect Resource, +0.03). Yin Earth Day Master is the single best fit for a Bing-Wu year.

## Per-Month Day Master Modifier

Every lunar month also has a stem (see [methodology.md § 2026 Lunar Calendar](methodology.md#2026-lunar-calendar-bing-wu-丙午)). For each (DM, month_stem) pair, run the same 10 Gods lookup and apply a smaller **per-month lift** at half magnitude:

```
month_lift_per_god = year_lift_per_god / 2     # range ±0.05 instead of ±0.10
```

Half magnitude because the month is a subtler context than the year. The year sets your baseline disposition; the month modulates it.

The 12 month stems for Bing-Wu year (year stem index 3 → month series starts at Geng):

| Month | Stem-Branch | Month stem | Element | Polarity |
|---|---|---|---|---|
| 1  | Geng-Yin   | Geng | Metal | Yang |
| 2  | Xin-Mao    | Xin  | Metal | Yin  |
| 3  | Ren-Chen   | Ren  | Water | Yang |
| 4  | Gui-Si     | Gui  | Water | Yin  |
| 5  | Jia-Wu     | Jia  | Wood  | Yang |
| 6  | Yi-Wei     | Yi   | Wood  | Yin  |
| 7  | Bing-Shen  | Bing | Fire  | Yang |
| 8  | Ding-You   | Ding | Fire  | Yin  |
| 9  | Wu-Xu      | Wu   | Earth | Yang |
| 10 | Ji-Hai     | Ji   | Earth | Yin  |
| 11 | Geng-Zi    | Geng | Metal | Yang |
| 12 | Xin-Chou   | Xin  | Metal | Yin  |

A Yin Earth Day Master across these 12 months gets twelve different 10 Gods relationships — Hurt Officer in Geng-Yin, Output in Xin-Mao, Direct Wealth in Ren-Chen, etc. — producing a personalized monthly curve overlaid on the standard 12-sign curve.

## Final Formula

For a user with known Day Master:

```
year_pillar_score      = (existing 60-sign score from methodology.md)
DM_year_lift           = year_lift_table[10_Gods(DM, Bing)]
DM_month_lift[i]       = month_lift_table[10_Gods(DM, month_stems[i])]   # i = 1..12

final_year_score   = clip(year_pillar_score + DM_year_lift,
                          0.05, 0.95)
final_monthly[i]   = clip(monthly_score[i] + DM_year_lift + DM_month_lift[i],
                          0.05, 0.95)
final_year_avg     = mean(final_monthly[1..12])
```

We use `final_year_score` for the headline year reading (one number) and `final_monthly[i]` for the 12-month curve. They will be close but not identical because monthly lifts vary.

The same `[0.05, 0.95]` floor and cap from the year-pillar methodology applies. The Day Master layer can shift outcomes meaningfully but never drives anyone to a deterministic 0 or 1.

## Worked Example

**Tiger user, born 1986-06-15** (random pick — Yang Fire year, Wu Tiger). Per `lunar-typescript`, the Day Master from this birth date is `庚` (Geng, Yang Metal). So this is a Yang Metal Day Master in a Yang Wood Tiger sign year-pillar.

### Year-pillar reading (Phase 1, sign-only)

From [signs-scores.json](signs-scores.json), Tiger with Wood element (default) yearly score = **0.781** ("Favorable" band).

### Day Master reading (Phase 2)

- DM = Geng (Yang Metal). Year stem = Bing (Yang Fire). Year destroys DM, same polarity → **七杀 Seven Killings**.
- `DM_year_lift = −0.10`.

```
final_year_score = clip(0.781 + (−0.10), 0.05, 0.95) = 0.681
```

The Tiger's "favorable" year drops a band — from Favorable (0.70–0.85) to Mildly Positive (0.55–0.70). This Tiger isn't safe just because Tigers are. Seven Killings is real pressure: the year's fire melts Yang Metal hard. Most Tigers will sail; this Tiger is a Tiger who should brace.

### Monthly curve

Take Month 5 (Jia-Wu, Wood Horse — Tiger's peak window in the year-pillar reading):

- Tiger × Horse, Wood element user, Fire year → existing monthly score = 0.95 (capped).
- DM_year_lift for Geng = −0.10.
- DM_month_lift for Geng vs Jia: Jia destroys Geng (Wood doesn't really destroy Metal, but Metal cuts Wood — so Jia is destroyed by Geng. From DM=Geng's perspective: DM destroys other, same polarity → 偏财 Indirect Wealth. Half-magnitude lift = +0.025).

```
final_monthly[5] = clip(0.95 + (−0.10) + 0.025, 0.05, 0.95) = 0.875
```

Still in the Favorable band. The peak window survives. The Day Master pulls it down a touch but the structural Tiger-Horse alignment is so strong that even a Yang Metal DM gets a good month here. Pattern: this user's *worst* months will be unusually rough, but their *best* months still work.

Compare to Month 1 (Geng-Yin, Metal Tiger):

- Tiger × Tiger, Wood user, Fire year → existing monthly score = 0.494 (Neutral).
- DM_year_lift = −0.10.
- DM_month_lift for Geng vs Geng: same element, same polarity → **比肩 Friend**. Half magnitude = −0.01.

```
final_monthly[1] = clip(0.494 + (−0.10) + (−0.01), 0.05, 0.95) = 0.384
```

Drops from Neutral to Mildly Adverse. The Yang Metal Day Master meeting the Yang Metal month stem in a Fire year creates a triple-pressure window. Plain reading: *"For most Tigers, Tiger month is fine. For Yang Metal Tigers specifically, it's the start of a pressure year — the kind of month where you should not start anything new."*

This is the level of nuance the year-pillar layer can't deliver.

## Limitations & Future Work

**This phase does NOT yet handle:**

- **Branch interactions.** In real BaZi, branch-vs-branch relationships matter — clashes (六冲), combinations (三合, 六合), punishments (三刑), harms (六害). The Tiger-vs-Horse year is a productive trine (寅午戌 fire trine without dog), which classical BaZi would amplify further. We're not modeling this yet.
- **Hidden stems (藏干).** Each branch contains 1-3 hidden stems that influence its energy. The Horse branch (午) contains hidden Bing (main) and Ji (residual). A complete reading factors these.
- **Day branch interactions.** The user's day branch (their personal "self") interacts with the year branch directly. A user born in a Rat day faces a direct clash with the Horse year (子午冲) — a major event signal that the year-pillar + Day Master alone don't show.
- **10-Year Luck Pillar (大运).** Every person passes through a sequence of 10-year luck pillars derived from their birth chart. The current luck pillar shapes which years feel like opportunities and which feel like obstacles. A Yang Metal Day Master in a "wood-burning fire" luck pillar will feel the Fire Horse year very differently from one in a "metal-strengthening earth" luck pillar.
- **Strength of Day Master (身强 vs 身弱).** Whether a DM is "strong" (well-supported by other pillars) or "weak" (poorly supported) flips many of the 10 Gods readings — a strong DM welcomes Seven Killings as productive challenge; a weak DM gets crushed by it. This requires the full chart, not just the DM stem.

These are Phase 3+ territory. The Day Master layer alone gets us about 60% of the way from "tabloid horoscope" to "real BaZi reading." Phase 3 (full chart with branch interactions and Luck Pillar) gets us to about 90%.

For v1 of the Fire Horse interactive, Phase 1 + Phase 2 is the right cut: meaningful depth, manageable complexity, and the input ramp (birth year → birth date) is gentle.

## Implementation summary

**Add to [content/source-material/year-of-the-fire-horse/data/compute_scores.py](compute_scores.py):**

- `STEMS` dict (port from `bazi.js`).
- `ten_gods(dm_stem, other_stem)` — returns one of ten string keys.
- `DM_YEAR_LIFT` (10 entries, table above).
- `DM_MONTH_LIFT_HALF_MAG` (derived).
- `compute_dm_scores()` — for each of 10 DMs, computes the 12 monthly lifts and the year lift; emits `day-master-scores.json`.

**Frontend (Fire Horse interactive page, future task):**

```js
import { STEMS, calculatePillars } from '@/lib/bazi';

// If user has a profile with pillars cached:
const dmStem = profile.pillars?.day?.gan;            // '丙' or null
const dm     = STEMS[dmStem];                        // { en, element, polarity } or undefined

// If they don't, but they entered birth date:
const pillars = calculatePillars(birthday, birthTime);
const dmStem  = pillars?.day?.gan;
```

Then load `signs-scores.json` for the year-pillar reading and `day-master-scores.json` for the modifier overlay. Compose the final score on the page.

---

*Sources: [methodology.md](methodology.md) (year-pillar foundation); [website/lib/bazi.js](website/lib/bazi.js) (existing BaZi infrastructure); classical BaZi 十神 framework (Tan Yangguan, *Bazi Mingli Yongshen Tanli*, standard reference); [`fire-horse-extremes-and-danger.md`](../fire-horse-extremes-and-danger.md) for voice calibration.*
