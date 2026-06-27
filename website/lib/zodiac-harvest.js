// Extracts a Chinese zodiac sign from free-text campaign replies
// ("Fire Rooster", "Eart Monkey 1968", "I'm a dragon!", "born 1975").
// Used by /api/brevo/inbound to enrich CRM contacts from the
// "tell me your zodiac sign" reply-bait.
//
// Conservative by design: returns null whenever the text is ambiguous
// (two different animals mentioned, or several candidate years).
// people.chinese_sign stores capitalized animal names only — elements
// ("Fire", "Earth") are accepted in the text but not stored.

// Index = (year - 1900) % 12, so 1900 → Rat.
const YEAR_CYCLE = [
  'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
  'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig',
];

const ANIMAL_ALIASES = {
  rat: 'Rat',
  ox: 'Ox',
  tiger: 'Tiger',
  rabbit: 'Rabbit',
  hare: 'Rabbit',
  cat: 'Rabbit',      // Vietnamese zodiac uses Cat for the Rabbit year
  dragon: 'Dragon',
  snake: 'Snake',
  horse: 'Horse',
  goat: 'Goat',
  sheep: 'Goat',
  ram: 'Goat',
  monkey: 'Monkey',
  rooster: 'Rooster',
  chicken: 'Rooster',
  dog: 'Dog',
  pig: 'Pig',
  boar: 'Pig',
};

const ANIMAL_RE = new RegExp(`\\b(${Object.keys(ANIMAL_ALIASES).join('|')})s?\\b`, 'gi');
const YEAR_RE = /\b(19[0-9]{2}|20[0-1][0-9]|202[0-6])\b/g;

export function signFromYear(year) {
  if (!Number.isInteger(year) || year < 1900 || year > 2026) return null;
  return YEAR_CYCLE[(year - 1900) % 12];
}

/**
 * Returns { sign, basis: 'stated' | 'year' } or null.
 * - Exactly one distinct animal mentioned → that sign ('stated').
 * - No animal but exactly one plausible birth year → derived ('year').
 *   Year-derived signs are approximate: January/February births can
 *   fall in the previous lunar year. Good enough for marketing data.
 */
export function extractChineseSign(text) {
  if (!text || typeof text !== 'string') return null;
  // Quoted lines in replies are usually our own email echoed back —
  // it mentions signs/years and would poison the extraction.
  const ownWords = text
    .split('\n')
    .filter((line) => !line.trim().startsWith('>'))
    .join('\n');

  const animals = new Set(
    [...ownWords.matchAll(ANIMAL_RE)].map((m) => ANIMAL_ALIASES[m[1].toLowerCase()]),
  );
  if (animals.size === 1) return { sign: [...animals][0], basis: 'stated' };
  if (animals.size > 1) return null;

  const years = new Set([...ownWords.matchAll(YEAR_RE)].map((m) => parseInt(m[1], 10)));
  if (years.size === 1) {
    const sign = signFromYear([...years][0]);
    return sign ? { sign, basis: 'year' } : null;
  }
  return null;
}
