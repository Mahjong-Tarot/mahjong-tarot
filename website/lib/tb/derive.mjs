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

const ELEMENT_IDS = [1, 2, 3, 4, 5];
const NAME_BY_ID = { 1: 'Wood', 2: 'Fire', 3: 'Earth', 4: 'Metal', 5: 'Water' };

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
 * @returns {object|null}
 */
export function deriveInputs(chart) {
  if (!chart) return null;

  const countsById = {};
  for (const id of ELEMENT_IDS) countsById[id] = chart.elementCounts[NAME_BY_ID[id]];

  const yearSignId = chart.pillars.year.branch;

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
    elementCounts: countsById,           // { 1..5 } numeric, 4-pillar when hasHour
    mix: chart.mix,                      // sorted rating string, e.g. "42222"
    stages: chart.stages,                // [{ stage, elementId, element, count, force }]
  };
}
