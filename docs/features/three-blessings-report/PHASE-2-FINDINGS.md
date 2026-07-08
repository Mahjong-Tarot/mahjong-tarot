# Three Blessings Report — Phase 2 Findings (Engine)

**Status:** Engine built and validated. 28 of 30 indicators reproduce Bill's
Jan-2013 golden exactly (verdict + tally); 2 "General Indicators" ratings unresolved.
**Code:** `website/lib/tb/{data-node,derive,engine,validate-inputs,validate-reading}.mjs`
**Run:** `cd website && node lib/tb/validate-reading.mjs`

---

## Key discovery

Bill's Jan-2013 prototype **predates the Purple Star integration** — it has exactly
**10 pure Four-Pillars indicators per blessing** and no Zi Wei indicators, so it is
fully reproducible. (David's later, undated prototype added Purple Star, which is why
its tallies include un-encodable indicators.) Bill is therefore the canonical target.

## Confirmed engine rules

- **Verdict scale:** each indicator → LUCKY(1) / NEUTRAL(2) / UNLUCKY(3).
- **Section verdict:** `sign(NumLucky − NumUnlucky)` → LUCKY / NEUTRAL / UNLUCKY.
  (bill: luck 4/2/4→NEUTRAL, prosperity 5/2/3→LUCKY, longevity 2/5/3→UNLUCKY ✓)
- **Per-blessing conclusion:** `tb-luck-conclusion[NumLucky|NumNeutral|NumUnlucky]`
  (col Luck/Wealth/Health per section).
- **Grand conclusion:** `tb-grand-conclusion[TotalLucky|TotalUnlucky]` where Total* count
  the LUCKY / UNLUCKY sections (bill 1L/1U → "neither favored nor forgotten" ✓).
- **Constellation:** `lunar-typescript` `getXiu()` → Chinese mansion → ConstellationID
  (map in `derive.mjs`; bill 奎→26 Wolf→UNLUCKY ✓).

## Indicator → table map (all keyed off the fp Four Pillars chart)

| # | Happiness / Luck | Prosperity / Wealth | Longevity / Health |
|---|---|---|---|
| 1 | element-mix `luckElementMix[hh\|mix].Luck*` | **General indic. ⚠** | **General indic. ⚠** |
| 2 | element-cycle `element[birthStageEl].BirthStage*` | year-animal `sign[yr].YearSignWealth*` | year-animal `sign[yr].YearHealth*` |
| 3 | year-element `luckFixedElement[fixed\|yrEl]` | year-element `element[yrEl].YearWealth*` | heavenly-stem `healthElement[yrEl\|hh\|count(yrEl)]` |
| 4 | year-animal `sign[yr].YearLuck*` | month `monthSign[yr\|mo].MonthWealth*` | month `monthSign[yr\|mo].MonthHealth*` |
| 5 | month `monthSign[yr\|mo].MonthLuck*` | day `constellation[c].Wealth*` | day `constellation[c].Health*` |
| 6 | day `constellation[c].Luck*` | hour `sign[hr].HourWealth*` | hour `sign[hr].HourHealth*` |
| 7 | hour `sign[hr].HourLuck*` | means `meansOpportunity[Wealth\|dominantEl]` | happiness `rating[hh\|count(happinessStage)].Happiness*` |
| 8 | opportunity `opportunity[yr\|oppStage]` | opportunity `meansOpportunity[Opportunity\|oppStageEl]` | happiness-blessing = **luck section verdict** (cross-ref) |
| 9 | maturation `maturation[yr\|Maturation\|hh\|count(matStage)]` | maturation `matAdultChi[hh\|Maturation\|count(matStage)]` | longevity `rating[hh\|count(retireStage)].RetirementLongevity*` |
| 10 | int-compat `intCompConclusion[round(mean pairwise compatRating)]` | adulthood `matAdultChi[hh\|Adulthood\|count(adultStage)]` | element-mix `luckElementMix[hh\|mix].Health*` |

`hh` = hasHour flag; `count(X)` = chart element count feeding that stage's chi rating;
`oppStage`/`happinessStage`/`wealthStage` = the fp stage carrying that force.

## ⚠ Unresolved: the two "General Indicators" ratings

Prosperity #1 and Longevity #1 read `tb-rating[hasHour|Rating]` (Wealth / Health column),
but the **Rating input (0–9) formula could not be reverse-engineered**. Constraints from
the two goldens (each a data point on `tb-rating`, where health/wealth LUCKY needs
Rating ≥ 6, NEUTRAL needs 4–5):

| | bill (W2 F2 E4 M2 Wa2, hasHour) | david (W2 F0 E3 M2 Wa2, no-hour) |
|---|---|---|
| **Wealth GI** | LUCKY (above avg) → R≥6 | LUCKY (above avg) → R≥6 |
| **Health GI** | NEUTRAL (slightly below) → R4–5 | LUCKY (well above) → R≥7 |

No single-element-count or simple-sum formula fits both samples (e.g. Wood+Earth gives
bill 6→LUCKY, wrong; david's balanced-vs-bill relationship is inverted for health).
The current engine ships a flagged hypothesis (`provisional: true`) so the reading has 10
indicators, but the verdict of these two is not trusted. **To resolve:** recover the
original onlinechineseastrology ASP formula, or gather more has-hour goldens. Everything
else is confirmed.

## Dependencies / next

- Depends on `website/lib/fp/` (Four Pillars chart) — untracked here; lives on `feat/four-pillars-cutover`.
- Next: report UI in the almanac auspiciousness color system (LUCKY green / NEUTRAL paper /
  UNLUCKY fire), and resolve the 2 GI ratings.
