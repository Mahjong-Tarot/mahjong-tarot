// Node-only loader for the Three Blessings lookup tables (scripts / SSR without
// the webpack JSON pipeline). Reads the 22 tables emitted by
// docs/features/three-blessings-report/port_content.py and indexes them via the
// shared builder in tables.mjs. In the app, import { tables } from './data.mjs'.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTables } from './tables.mjs';

export { LUCK_VALUE } from './tables.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(DIR, '..', '..', 'data', 'tb');
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));

export function loadTables() {
  return buildTables({
    sign: read('tb-sign.json'),
    rating: read('tb-rating.json'),
    opportunity: read('tb-opportunity.json'),
    meansOpportunity: read('tb-means-opportunity.json'),
    metalWealth: read('tb-metal-wealth.json'),
    monthSign: read('tb-month-sign.json'),
    maturation: read('tb-maturation.json'),
    matAdultChi: read('tb-mat-adult-chi.json'),
    luckValue: read('tb-luck-value.json'),
    luckConclusion: read('tb-luck-conclusion.json'),
    luckElementMix: read('tb-luck-element-mix.json'),
    luckFixedElement: read('tb-luck-fixed-element.json'),
    intCompConclusion: read('tb-int-comp-conclusion.json'),
    healthLuck: read('tb-health-luck.json'),
    healthElement: read('tb-health-element.json'),
    grandConclusion: read('tb-grand-conclusion.json'),
    element: read('tb-element.json'),
    constellation: read('tb-constellation.json'),
    compatRating: read('tb-compat-rating.json'),
    improveElement: read('tb-improve-element.json'),
    harmony: read('tb-harmony.json'),
  });
}
