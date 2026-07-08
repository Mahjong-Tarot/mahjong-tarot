// Shared index builder for the Three Blessings lookup tables. Pure (no fs / no
// webpack), so both data-node.mjs (Node/fs, for scripts) and data.mjs (webpack
// JSON imports, for the app) produce identical indexed tables. Keys are the
// lookup keys documented in docs/features/three-blessings-report/PHASE-1-FINDINGS.md.

/** Index an array of row objects by a composite key built from `cols`. */
function indexBy(rows, ...cols) {
  const m = new Map();
  for (const r of rows) {
    const key = cols.map((c) => r[c]).join('|');
    if (!m.has(key)) m.set(key, r); // first row wins on duplicate keys
  }
  return m;
}

/** Build the indexed tables from the raw row-array JSON (keyed by table name). */
export function buildTables(raw) {
  return {
    sign: indexBy(raw.sign, 'SignID'),
    rating: indexBy(raw.rating, 'HasHour', 'Rating'),
    opportunity: indexBy(raw.opportunity, 'YearSignID', 'Stage'),
    meansOpportunity: indexBy(raw.meansOpportunity, 'Indicator', 'ElementID'),
    metalWealth: indexBy(raw.metalWealth, 'MetalWealth'),
    monthSign: indexBy(raw.monthSign, 'YearSignID', 'MonthSignID'),
    maturation: indexBy(raw.maturation, 'YearSignID', 'Stage', 'HasHour', 'ChiRating'),
    matAdultChi: indexBy(raw.matAdultChi, 'HasHour', 'Period', 'ChiRating'),
    luckValue: indexBy(raw.luckValue, 'LuckValueID'),
    luckConclusion: indexBy(raw.luckConclusion, 'NumLucky', 'NumNeutral', 'NumUnlucky'),
    luckElementMix: indexBy(raw.luckElementMix, 'HasHour', 'Mix'),
    luckFixedElement: indexBy(raw.luckFixedElement, 'FixedElementID', 'YearElementID'),
    intCompConclusion: indexBy(raw.intCompConclusion, 'Rating'),
    healthLuck: indexBy(raw.healthLuck, 'Rating'),
    healthElement: indexBy(raw.healthElement, 'YearElementID', 'HasHour', 'Rating'),
    grandConclusion: indexBy(raw.grandConclusion, 'TotalLucky', 'TotalUnlucky'),
    element: indexBy(raw.element, 'ElementID'),
    constellation: indexBy(raw.constellation, 'ConstellationID'),
    compatRating: indexBy(raw.compatRating, 'FirstSignID', 'SecondSignID'),
    improveElement: indexBy(raw.improveElement, 'ElementID'),
    harmony: raw.harmony,
  };
}

export const LUCK_VALUE = { 1: 'LUCKY', 2: 'NEUTRAL', 3: 'UNLUCKY' };
