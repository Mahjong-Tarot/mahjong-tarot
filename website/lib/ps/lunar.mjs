// Proprietary lunar-calendar conversion — no third-party dependency.
//
// Browser-safe: takes the vendored table (data/ps/lunar-table.json) as an argument,
// same as the rest of the ps engine takes `data`. The table is generated once by
// scripts/gen-lunar-table.mjs.

export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const DAY = 86400000;
const EPOCH_MS = Date.UTC(1900, 0, 31); // 1900-01-31 = lunar 1900-1-1

// "YYYY-M-D" or (y,m,d) → {lunarYear, lunarMonth, lunarDay, isLeap}
export function solarToLunar(table, solarDate) {
  const [y, m, d] = String(solarDate).split('-').map(Number);
  let dayNum = Math.round((Date.UTC(y, m - 1, d) - EPOCH_MS) / DAY);
  if (dayNum < 0) throw new RangeError(`date before lunar table epoch: ${solarDate}`);
  for (let year = 1900; year <= 2099; year++) {
    const rec = table.years[year];
    if (!rec) break;
    for (const [mn, leap, days] of rec.months) {
      if (dayNum < days) return { lunarYear: year, lunarMonth: mn, isLeap: !!leap, lunarDay: dayNum + 1 };
      dayNum -= days;
    }
  }
  throw new RangeError(`date past lunar table range: ${solarDate}`);
}

// Year ganzhi (purely arithmetic off the lunar year).
export function yearGanzhi(lunarYear) {
  const stemIdx = ((lunarYear - 4) % 10 + 10) % 10;
  const branchIdx = ((lunarYear - 4) % 12 + 12) % 12;
  return {
    stem: STEMS[stemIdx], branch: BRANCHES[branchIdx],
    stemIdx, branchIdx,
    yang: stemIdx % 2 === 0, // 甲丙戊庚壬 = yang
  };
}

// Hour clock → earthly-branch index (子=0…亥=11). Bill's day rule: civil day is the
// day; a 23:00–01:00 (子) hour stays on the civil date (handled by callers passing
// the civil solar date, not rolling it forward).
export function hourToBranchIdx(hour) {
  return Math.floor(((hour + 1) % 24) / 2);
}

// 纳音五行 (sound-element) of a ganzhi pillar → Five Elements Bureau number.
// 60-cycle table: index = (stemIdx*6 + ... ) — use the standard 30-pair element list.
const NAYIN_ELEMENT = [ // by (60-cycle index >> 1): 0..29 — standard 纳音 sequence
  'Metal', 'Fire', 'Wood', 'Earth', 'Metal', 'Fire', 'Water', 'Earth', 'Metal', 'Wood',
  'Water', 'Earth', 'Fire', 'Wood', 'Water', 'Metal', 'Fire', 'Wood', 'Earth', 'Metal',
  'Fire', 'Water', 'Earth', 'Metal', 'Wood', 'Water', 'Earth', 'Fire', 'Wood', 'Water',
];
const BUREAU_NUM = { Water: 2, Wood: 3, Metal: 4, Earth: 5, Fire: 6 };
const BUREAU_CN = { Water: '水二局', Wood: '木三局', Metal: '金四局', Earth: '土五局', Fire: '火六局' };

// Bureau from a palace's stem+branch indices (its ganzhi). Returns {num, cn, element}.
export function bureauFromGanzhi(stemIdx, branchIdx) {
  // 60-cycle index where stem and branch advance together
  let cycle = -1;
  for (let i = 0; i < 60; i++) {
    if (i % 10 === stemIdx && i % 12 === branchIdx) { cycle = i; break; }
  }
  const element = NAYIN_ELEMENT[Math.floor(cycle / 2)];
  return { num: BUREAU_NUM[element], cn: BUREAU_CN[element], element };
}
