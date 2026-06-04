import STARS from '../data/purple-star-stars.json';

// Map keyed by iztroKey, built once at module load.
const STAR_BY_KEY = new Map();
for (const row of STARS) {
  STAR_BY_KEY.set(row.iztroKey, row);
}

// Display contract: use the locked name when nameStatus === 'locked';
// otherwise fall back to pinyin + ' ' + hanzi. Draft / resting / unnamed
// names must never appear publicly.
function displayValue(row) {
  if (row.nameStatus === 'locked' && row.name) return row.name;
  return `${row.pinyin} ${row.hanzi}`;
}

export function resolveStarName(iztroKey) {
  const row = iztroKey == null ? undefined : STAR_BY_KEY.get(iztroKey);
  if (!row) {
    return {
      display: iztroKey || '',
      hanzi: '',
      pinyin: '',
      name: null,
      nameStatus: 'unnamed',
    };
  }
  return {
    display: displayValue(row),
    hanzi: row.hanzi,
    pinyin: row.pinyin,
    name: row.name,
    nameStatus: row.nameStatus,
    courtRole: row.courtRole,
    legacyAlias: row.legacyAlias,
    billKind: row.billKind,
    element: row.element,
  };
}
