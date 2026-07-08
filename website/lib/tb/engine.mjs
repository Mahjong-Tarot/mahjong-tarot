// Three Blessings reading engine.
//
// Assembles Bill's authored Fu Lu Shou reading from a Four Pillars chart:
// three blessings (Happiness/Luck, Prosperity/Wealth, Longevity/Health), each
// scored by 10 indicators that resolve to LUCKY(1)/NEUTRAL(2)/UNLUCKY(3), then
// tallied into a per-blessing conclusion, then rolled up into a grand conclusion.
//
// Indicator -> table mappings were reverse-engineered against the Jan-2013 "bill"
// golden (docs/features/three-blessings-report/golden/), which has no Purple Star
// indicators and so is fully reproducible. Validated by lib/tb/validate-reading.mjs.
//
// Verdicts and tally match the golden; narrative prose is the workbook's authored
// text, which is a later revision than the 2013 prototypes for a few tables.

import { deriveInputs } from './derive.mjs';

const LUCK_NAME = { 1: 'LUCKY', 2: 'NEUTRAL', 3: 'UNLUCKY' };
const get = (map, ...parts) => map.get(parts.join('|')) || null;

/** Build one indicator: pull narrative + luck value from a table row. */
function ind(label, row, narrativeCol, lvCol, extra = {}) {
  return {
    label,
    narrative: row ? row[narrativeCol] ?? null : null,
    lv: row ? row[lvCol] ?? null : null,
    ...extra,
  };
}

/** Tally a list of indicators into {L,N,U} and an overall verdict (sign of L-U). */
function tally(indicators) {
  const t = { L: 0, N: 0, U: 0 };
  for (const i of indicators) {
    if (i.lv === 1) t.L += 1;
    else if (i.lv === 2) t.N += 1;
    else if (i.lv === 3) t.U += 1;
  }
  const verdict = t.L > t.U ? 1 : t.L < t.U ? 3 : 2; // LUCKY / UNLUCKY / NEUTRAL
  return { tally: t, verdict };
}

/**
 * Compute the full Three Blessings reading.
 * @param {object} chart      output of buildFourPillarsChart()
 * @param {object} tables     output of loadTables() / imported data.mjs
 * @param {string} [birthday] YYYY-MM-DD (for the day-constellation indicator)
 */
export function computeThreeBlessings(chart, tables, birthday) {
  const inp = deriveInputs(chart, birthday);
  if (!inp) return null;
  const T = tables;
  const hh = inp.hasHourFlag;
  const { year, month, day, hour } = inp.signs;
  const counts = inp.elementCounts;
  const birthStage = inp.stageByName['Birth'];
  const matStage = inp.stageByName['Maturation'];
  const adultStage = inp.stageByName['Adulthood'];
  const retireStage = inp.stageByName['Retirement'];
  const oppStage = inp.stageByForce['opportunity'];
  const happyStage = inp.stageByForce['happiness'];
  const wealthStage = inp.stageByForce['wealth'];

  // ── Internal sign compatibility: mean of the pairwise sign ratings ──────────
  const signIds = [year, month, day, hour].filter((s) => s != null);
  let sum = 0;
  let pairs = 0;
  for (let i = 0; i < signIds.length; i++) {
    for (let j = i + 1; j < signIds.length; j++) {
      const r = get(T.compatRating, signIds[i], signIds[j]) ||
                get(T.compatRating, signIds[j], signIds[i]);
      if (r) { sum += r.Rating; pairs += 1; }
    }
  }
  const intCompRating = pairs ? Math.round(sum / pairs) : null;

  // ════════════ SECTION 1 — HAPPINESS / LUCK ════════════
  const luckInd = [
    ind('Element mix', get(T.luckElementMix, hh, inp.mix), 'LuckMixNarrative', 'LuckMixLuckValueID'),
    ind('Element cycle', get(T.element, birthStage.elementId), 'BirthStageElementNarrative', 'BirthStageElementLuckValueID'),
    ind('Year of birth (element)', get(T.luckFixedElement, inp.fixedElementId, inp.yearElementId), 'LuckFixedElementNarrative', 'LuckValueID'),
    ind('Year of birth (animal)', get(T.sign, year), 'YearLuckNarrative', 'YearLuckValueID'),
    ind('Month of birth', get(T.monthSign, year, month), 'MonthLuckNarrative', 'MonthLuckValueID'),
    ind('Day of birth', get(T.constellation, inp.constellationId), 'LuckNarrative', 'LuckLuckValueID'),
    ind('Hour of birth', get(T.sign, hour), 'HourLuckNarrative', 'HourLuckLuckValueID'),
    ind('Opportunity', get(T.opportunity, year, oppStage.stage), 'OpportunityNarrative', 'LuckValueID'),
    ind('Maturation', get(T.maturation, year, 'Maturation', hh, matStage.count), 'MaturationNarrative', 'LuckValueID'),
    ind('Internal sign compatibility', get(T.intCompConclusion, intCompRating), 'IntCompConclusionNarrative', 'LuckValueID'),
  ];
  const luck = { indicators: luckInd, ...tally(luckInd) };
  luck.conclusion = (get(T.luckConclusion, luck.tally.L, luck.tally.N, luck.tally.U) || {}).LuckConclusionNarrative || null;

  // ════════════ SECTION 2 — PROSPERITY / WEALTH ════════════
  // Wealth "General Indicators": rating unconfirmed. Hypothesis (matches bill):
  // count of the two money elements, Earth + Metal. Flagged provisional.
  const wealthGiRating = counts[3] + counts[4];
  const prosperityInd = [
    ind('General indicators', get(T.rating, hh, wealthGiRating), 'WealthRatingNarrative', 'WealthLuckValueID', { provisional: true }),
    ind('Year sign (animal)', get(T.sign, year), 'YearSignWealthNarrative', 'YearSignWealthLuckValueID'),
    ind('Year element (heavenly stem)', get(T.element, inp.yearElementId), 'YearWealthOverallNarrative', 'YearWealthLuckValueID'),
    ind('Month sign', get(T.monthSign, year, month), 'MonthWealthNarrative', 'MonthWealthValueID'),
    ind('Day sign', get(T.constellation, inp.constellationId), 'WealthNarrative', 'WealthLuckValueID'),
    ind('Hour sign', get(T.sign, hour), 'HourWealthNarrative', 'HourWealthLuckValueID'),
    ind('Means', get(T.meansOpportunity, 'Wealth', inp.dominantElementId), 'MeansDescription', 'LuckValueID'),
    ind('Opportunity', get(T.meansOpportunity, 'Opportunity', oppStage.elementId), 'MeansDescription', 'LuckValueID'),
    ind('Maturation', get(T.matAdultChi, hh, 'Maturation', matStage.count), 'MatAdultDescription', 'LuckValueID'),
    ind('Adulthood', get(T.matAdultChi, hh, 'Adulthood', adultStage.count), 'MatAdultDescription', 'LuckValueID'),
  ];
  const prosperity = { indicators: prosperityInd, ...tally(prosperityInd) };
  prosperity.conclusion = (get(T.luckConclusion, prosperity.tally.L, prosperity.tally.N, prosperity.tally.U) || {}).WealthConclusionNarrative || null;

  // ════════════ SECTION 3 — LONGEVITY / HEALTH ════════════
  // Health "General Indicators": rating unconfirmed. Flagged provisional.
  const healthGiRating = counts[1] + counts[3]; // hypothesis: Wood + Earth (health elements)
  const longevityInd = [
    ind('General indicators', get(T.rating, hh, healthGiRating), 'HealthRatingNarrative', 'HealthLuckValueID', { provisional: true }),
    ind('Year sign (animal)', get(T.sign, year), 'YearHealthNarrative', 'YearHealthLuckValueID'),
    ind('Heavenly stem', get(T.healthElement, inp.yearElementId, hh, counts[inp.yearElementId]), 'HealthElementHealthNarrative', 'HealthLuckValueID'),
    ind('Month sign', get(T.monthSign, year, month), 'MonthHealthNarrative', 'MonthHealthValueID'),
    ind('Day sign', get(T.constellation, inp.constellationId), 'HealthNarrative', 'HealthLuckValueID'),
    ind('Hour sign', get(T.sign, hour), 'HourHealthNarrative', 'HourHealthLuckValueID'),
    ind('Happiness (chart)', get(T.rating, hh, happyStage.count), 'HappinessRatingNarrative', 'HappinessLuckValueID'),
    // Happiness blessing: carries the Luck section's overall verdict.
    { label: 'Happiness blessing', narrative: null, lv: luck.verdict, crossRef: 'luck' },
    ind('Longevity', get(T.rating, hh, retireStage.count), 'RetirementLongevityNarrative', 'RetirementLongevityLuckValueID'),
    ind('Element mix', get(T.luckElementMix, hh, inp.mix), 'HealthMixNarrative', 'HealthMixLuckValueID'),
  ];
  const longevity = { indicators: longevityInd, ...tally(longevityInd) };
  longevity.conclusion = (get(T.luckConclusion, longevity.tally.L, longevity.tally.N, longevity.tally.U) || {}).HealthConclusionNarrative || null;

  // ════════════ GRAND CONCLUSION ════════════
  const verdicts = [luck.verdict, prosperity.verdict, longevity.verdict];
  const totalLucky = verdicts.filter((v) => v === 1).length;
  const totalUnlucky = verdicts.filter((v) => v === 3).length;
  const grand = (get(T.grandConclusion, totalLucky, totalUnlucky) || {}).GrandConclusionNarrative || null;

  return {
    inputs: inp,
    luck,
    prosperity,
    longevity,
    grand: { totalLucky, totalUnlucky, narrative: grand },
    LUCK_NAME,
  };
}
