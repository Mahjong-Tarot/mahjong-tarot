// Three Blessings input-derivation layer.
//
// The Three Blessings engine reuses the Four Pillars chart (lib/fp/chart.mjs) for
// its ganzhi, element counts and life-cycle stages, then exposes the specific
// quantities the TB lookup tables are keyed on. See
// docs/features/three-blessings-report/PHASE-1-FINDINGS.md.
//
// Convention (verified against the Jan-2013 "bill" golden): when the hour is
// known, element counts use all four pillars (identical to fp / standard BaZi).
// A no-hour reading counts three pillars — which is what fp already returns when
// birthTime is omitted. (The undated "david" prototype computed a 3-pillar mix
// while still printing an hour section; its "12pm" is the classic unknown-time
// default, i.e. it was really a no-hour reading. bill is the canonical target.)

import { Solar } from 'lunar-typescript';

const ELEMENT_IDS = [1, 2, 3, 4, 5];
const NAME_BY_ID = { 1: 'Wood', 2: 'Fire', 3: 'Earth', 4: 'Metal', 5: 'Water' };

// The 28 lunar mansions (xiu). lunar-typescript getXiu() returns the Chinese
// character; the Three Blessings TBConstellation table numbers them 1-28 (see
// tb-constellation.json). Verified against bill's golden: 奎 -> 26 (Wolf) -> UNLUCKY.
const XIU_TO_CONSTELLATION_ID = {
  角: 13, 亢: 12, 氐: 14, 房: 15, 心: 16, 尾: 17, 箕: 18, 斗: 19, 牛: 20, 女: 21,
  虚: 22, 危: 23, 室: 24, 壁: 25, 奎: 26, 娄: 27, 胃: 28, 昴: 1, 毕: 2, 觜: 3,
  参: 4, 井: 5, 鬼: 6, 柳: 7, 星: 8, 张: 9, 翼: 10, 轸: 11,
};

/** ConstellationID (1-28) ruling a birth date, via the day's lunar mansion. */
export function constellationIdFor(birthday) {
  if (!birthday) return null;
  const [y, m, d] = birthday.split('-').map(Number);
  if (!y || !m || !d) return null;
  const xiu = Solar.fromYmd(y, m, d).getLunar().getXiu();
  return XIU_TO_CONSTELLATION_ID[xiu] ?? null;
}

// Native ("fixed") element of each animal sign (branch id 1-12).
export const FIXED_ELEMENT_BY_SIGN = {
  1: 5,  // Rat   -> Water
  2: 3,  // Ox    -> Earth
  3: 1,  // Tiger -> Wood
  4: 1,  // Rabbit-> Wood
  5: 3,  // Dragon-> Earth
  6: 2,  // Snake -> Fire
  7: 2,  // Horse -> Fire
  8: 3,  // Sheep -> Earth
  9: 4,  // Monkey-> Metal
  10: 4, // Rooster-> Metal
  11: 3, // Dog   -> Earth
  12: 5, // Pig   -> Water
};

/**
 * Derive Three Blessings inputs from a Four Pillars chart.
 * @param {object} chart  output of buildFourPillarsChart()
 * @param {string} [birthday]  YYYY-MM-DD, for the day-constellation indicator
 * @returns {object|null}
 */
export function deriveInputs(chart, birthday) {
  if (!chart) return null;

  const countsById = {};
  for (const id of ELEMENT_IDS) countsById[id] = chart.elementCounts[NAME_BY_ID[id]];

  const yearSignId = chart.pillars.year.branch;

  // Dominant element = highest count (ties -> lowest element id, Wood..Water order).
  let dominantElementId = 1;
  for (const id of ELEMENT_IDS) {
    if (countsById[id] > countsById[dominantElementId]) dominantElementId = id;
  }

  // The stage carrying each of the five forces (fp assigns one force per stage).
  const stageByForce = {};
  for (const s of chart.stages) stageByForce[s.force] = s;
  const stageByName = {};
  for (const s of chart.stages) stageByName[s.stage] = s;

  return {
    hasHour: chart.hasHour,
    hasHourFlag: chart.hasHour ? 1 : 0,
    signs: {
      year: yearSignId,
      month: chart.pillars.month.branch,
      day: chart.pillars.day.branch,
      hour: chart.pillars.hour ? chart.pillars.hour.branch : null,
    },
    yearElementId: chart.pillars.year.stemElement,
    fixedElementId: FIXED_ELEMENT_BY_SIGN[yearSignId],
    dominantElementId,
    constellationId: constellationIdFor(birthday),
    elementCounts: countsById,           // { 1..5 } numeric, 4-pillar when hasHour
    mix: chart.mix,                      // sorted rating string, e.g. "42222"
    stages: chart.stages,                // [{ stage, elementId, element, count, force }]
    stageByForce,                        // force -> stage
    stageByName,                         // stage name -> stage
  };
}
