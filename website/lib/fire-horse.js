// Shared constants, lookups, and pure helpers for the
// Year of the Fire Horse 2026 personalized forecast page.

import signsScores from '../data/fire-horse/signs-scores.json';

export const SIGNS = ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake',
                      'horse', 'sheep', 'monkey', 'rooster', 'dog', 'pig'];

export const ELEMENTS = ['wood', 'fire', 'earth', 'metal', 'water'];

export const FIXED_ELEMENT = {
  rat: 'water', ox: 'water', pig: 'water',
  tiger: 'wood', rabbit: 'wood', dragon: 'wood',
  snake: 'fire', horse: 'fire', sheep: 'fire',
  monkey: 'metal', rooster: 'metal', dog: 'metal',
};

export const ELEMENT_LABEL = { wood: 'Wood', fire: 'Fire', earth: 'Earth', metal: 'Metal', water: 'Water' };
export const SIGN_LABEL = Object.fromEntries(SIGNS.map(s => [s, s[0].toUpperCase() + s.slice(1)]));

export const BAND_FOR = (s) => {
  if (s >= 0.85) return { label: 'Peak window',     tone: 'positive', short: 'Peak' };
  if (s >= 0.70) return { label: 'Favorable',       tone: 'positive', short: 'Favorable' };
  if (s >= 0.55) return { label: 'Mildly positive', tone: 'positive', short: 'Mild +' };
  if (s >= 0.45) return { label: 'Neutral',         tone: 'neutral',  short: 'Neutral' };
  if (s >= 0.30) return { label: 'Mildly adverse',  tone: 'negative', short: 'Mild -' };
  if (s >= 0.15) return { label: 'Difficult',       tone: 'negative', short: 'Difficult' };
  return            { label: 'Severe',           tone: 'negative', short: 'Severe' };
};

export const BAND_COLOR = {
  positive: '#3a8a3a',
  neutral:  '#b88c4f',
  negative: '#c0392b',
};

export function findEntry(sign, element) {
  return signsScores.find((e) => e.sign === sign && e.element === element);
}

export function topMonths(monthly, n = 3, ascending = false) {
  const sorted = [...monthly].sort((a, b) => ascending ? a.score - b.score : b.score - a.score);
  return sorted.slice(0, n);
}
