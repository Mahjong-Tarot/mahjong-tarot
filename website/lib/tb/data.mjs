// Bundled Three Blessings lookup tables (webpack JSON imports — no fs), for use
// in the app. Mirrors lib/fp/content.mjs. In Node scripts use data-node.mjs.

import { buildTables } from './tables.mjs';

import sign from '../../data/tb/tb-sign.json';
import rating from '../../data/tb/tb-rating.json';
import opportunity from '../../data/tb/tb-opportunity.json';
import meansOpportunity from '../../data/tb/tb-means-opportunity.json';
import metalWealth from '../../data/tb/tb-metal-wealth.json';
import monthSign from '../../data/tb/tb-month-sign.json';
import maturation from '../../data/tb/tb-maturation.json';
import matAdultChi from '../../data/tb/tb-mat-adult-chi.json';
import luckValue from '../../data/tb/tb-luck-value.json';
import luckConclusion from '../../data/tb/tb-luck-conclusion.json';
import luckElementMix from '../../data/tb/tb-luck-element-mix.json';
import luckFixedElement from '../../data/tb/tb-luck-fixed-element.json';
import intCompConclusion from '../../data/tb/tb-int-comp-conclusion.json';
import healthLuck from '../../data/tb/tb-health-luck.json';
import healthElement from '../../data/tb/tb-health-element.json';
import grandConclusion from '../../data/tb/tb-grand-conclusion.json';
import element from '../../data/tb/tb-element.json';
import constellation from '../../data/tb/tb-constellation.json';
import compatRating from '../../data/tb/tb-compat-rating.json';
import improveElement from '../../data/tb/tb-improve-element.json';
import harmony from '../../data/tb/tb-harmony.json';

export { LUCK_VALUE } from './tables.mjs';

export const tables = buildTables({
  sign, rating, opportunity, meansOpportunity, metalWealth, monthSign, maturation,
  matAdultChi, luckValue, luckConclusion, luckElementMix, luckFixedElement,
  intCompConclusion, healthLuck, healthElement, grandConclusion, element,
  constellation, compatRating, improveElement, harmony,
});
