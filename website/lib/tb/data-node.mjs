// Node-only loader for the Three Blessings lookup tables (scripts / SSR without
// the webpack JSON pipeline). Mirrors lib/fp/content-node.mjs.
//
// Reads the 22 faithful tables emitted by
// docs/features/three-blessings-report/port_content.py into website/data/tb/,
// and indexes each by the lookup key documented in
// docs/features/three-blessings-report/PHASE-1-FINDINGS.md. In the app, import
// { tables } from './data.mjs' instead (webpack JSON imports).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(DIR, '..', '..', 'data', 'tb');

const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));

/** Index an array of row objects by a composite key built from `cols`. */
function indexBy(rows, ...cols) {
  const m = new Map();
  for (const r of rows) {
    const key = cols.map((c) => r[c]).join('|');
    if (!m.has(key)) m.set(key, r); // first row wins on duplicate keys
  }
  return m;
}

/** Group rows into a Map<key, row[]> (for tables queried as a set, e.g. opportunity). */
function groupBy(rows, ...cols) {
  const m = new Map();
  for (const r of rows) {
    const key = cols.map((c) => r[c]).join('|');
    if (!m.has(key)) m.set(key, []);
    m.get(key).push(r);
  }
  return m;
}

export function loadTables() {
  const sign = read('tb-sign.json');
  const rating = read('tb-rating.json');
  const opportunity = read('tb-opportunity.json');
  const meansOpportunity = read('tb-means-opportunity.json');
  const metalWealth = read('tb-metal-wealth.json');
  const monthSign = read('tb-month-sign.json');
  const maturation = read('tb-maturation.json');
  const matAdultChi = read('tb-mat-adult-chi.json');
  const luckValue = read('tb-luck-value.json');
  const luckConclusion = read('tb-luck-conclusion.json');
  const luckElementMix = read('tb-luck-element-mix.json');
  const luckFixedElement = read('tb-luck-fixed-element.json');
  const intCompConclusion = read('tb-int-comp-conclusion.json');
  const healthLuck = read('tb-health-luck.json');
  const healthElement = read('tb-health-element.json');
  const grandConclusion = read('tb-grand-conclusion.json');
  const element = read('tb-element.json');
  const constellation = read('tb-constellation.json');
  const compatRating = read('tb-compat-rating.json');
  const improveElement = read('tb-improve-element.json');
  const harmony = read('tb-harmony.json');

  return {
    sign: indexBy(sign, 'SignID'),
    rating: indexBy(rating, 'HasHour', 'Rating'),
    opportunity: indexBy(opportunity, 'YearSignID', 'Stage'),
    meansOpportunity: indexBy(meansOpportunity, 'Indicator', 'ElementID'),
    metalWealth: indexBy(metalWealth, 'MetalWealth'),
    monthSign: indexBy(monthSign, 'YearSignID', 'MonthSignID'),
    maturation: indexBy(maturation, 'YearSignID', 'Stage', 'HasHour', 'ChiRating'),
    matAdultChi: indexBy(matAdultChi, 'HasHour', 'Period', 'ChiRating'),
    luckValue: indexBy(luckValue, 'LuckValueID'),
    luckConclusion: indexBy(luckConclusion, 'NumLucky', 'NumNeutral', 'NumUnlucky'),
    luckElementMix: indexBy(luckElementMix, 'HasHour', 'Mix'),
    luckFixedElement: indexBy(luckFixedElement, 'FixedElementID', 'YearElementID'),
    intCompConclusion: indexBy(intCompConclusion, 'Rating'),
    healthLuck: indexBy(healthLuck, 'Rating'),
    healthElement: indexBy(healthElement, 'YearElementID', 'HasHour', 'Rating'),
    grandConclusion: indexBy(grandConclusion, 'TotalLucky', 'TotalUnlucky'),
    element: indexBy(element, 'ElementID'),
    constellation: indexBy(constellation, 'ConstellationID'),
    compatRating: indexBy(compatRating, 'FirstSignID', 'SecondSignID'),
    improveElement: indexBy(improveElement, 'ElementID'),
    harmony,
    // raw arrays kept for tables whose access pattern isn't a single-key lookup
    _raw: { opportunity, maturation },
  };
}

export const LUCK_VALUE = { 1: 'LUCKY', 2: 'NEUTRAL', 3: 'UNLUCKY' };
