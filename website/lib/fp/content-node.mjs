// Node-only content loader (scripts / SSR without the webpack JSON pipeline).
// Reads the shipped Four Pillars content from disk. Mirrors lib/ps/data-node.mjs.
// In the app, import { content } from './content.mjs' instead.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(DIR, '..', '..', 'data', 'fp');

export function loadContent() {
  const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));
  return {
    periodRating: read('lc-period-rating.json'),
    chiDelta: read('lc-chi-delta.json'),
    lcConclusion: read('lc-conclusion.json'),
    signYears: read('lc-sign-years.json'),
    elementMix: read('ea-element-mix.json'),
    mixConclusion: read('ea-mix-conclusion.json'),
    elementDetail: read('ea-element.json'),
    eaSign: read('ea-sign.json'),
    saSign: read('sa-sign.json'),
    elementSign: read('sa-element-sign.json'),
  };
}
