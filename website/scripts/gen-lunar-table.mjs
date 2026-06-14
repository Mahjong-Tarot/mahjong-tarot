// BUILD-TIME generator (run once): emits a vendored lunar-conversion table so the
// runtime lunar.mjs has ZERO third-party calendar dependency.
//
// It derives the table from the existing calendar data source by scanning every
// solar day in range and recording lunar-month boundaries. The output table is
// then OUR data (generated + attributed); nothing at runtime imports the source.
//
// Usage: node website/scripts/gen-lunar-table.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { solar2lunar } from 'lunar-lite';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(DIR, '..', 'data', 'ps', 'lunar-table.json');

const EPOCH = Date.UTC(1900, 0, 31); // 1900-01-31 = lunar 1900-1-1 (verified below)
const DAY = 86400000;
const END = Date.UTC(2100, 11, 31);

const fmt = (ms) => {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
};

// sanity: epoch is lunar new year 1900
const e = solar2lunar(fmt(EPOCH));
if (!(e.lunarYear === 1900 && e.lunarMonth === 1 && e.lunarDay === 1 && !e.isLeap))
  throw new Error(`epoch mismatch: ${JSON.stringify(e)}`);

// Walk every day; record each month-start (lunarDay===1) as {year, month, leap, startDayNum}.
const starts = [];
for (let ms = EPOCH; ms <= END; ms += DAY) {
  const l = solar2lunar(fmt(ms));
  if (l.lunarDay === 1) starts.push({ y: l.lunarYear, m: l.lunarMonth, leap: l.isLeap ? 1 : 0, day: Math.round((ms - EPOCH) / DAY) });
}

// month length = gap to next start; group by lunar year in chronological order
const years = {};
for (let i = 0; i < starts.length; i++) {
  const s = starts[i];
  const next = starts[i + 1];
  const days = next ? next.day - s.day : null; // last open month: drop
  if (days == null) continue;
  (years[s.y] = years[s.y] || { leap: 0, months: [] }).months.push([s.m, s.leap, days]);
  if (s.leap) years[s.y].leap = s.m;
}

// keep only fully-formed years (12 or 13 months)
const clean = {};
for (const y of Object.keys(years)) {
  const rec = years[y];
  if (rec.months.length === 12 || rec.months.length === 13) clean[y] = rec;
}

const out = {
  _meta: {
    note: 'Vendored Gregorian↔lunar table for the Purple Star engine. Generated once; '
        + 'runtime lunar.mjs reads this and has no third-party calendar dependency.',
    source: 'Derived from lunar-lite (MIT) by scanning solar days; data only, no runtime link.',
    epoch: '1900-1-1 lunar = 1900-01-31 solar',
    range: '1900–2100',
    generatedBy: 'website/scripts/gen-lunar-table.mjs',
    months: 'each year: { leap: 0|1-12, months: [[monthNum, isLeap(0/1), days(29|30)], ...] }',
  },
  epoch: '1900-01-31',
  years: clean,
};

fs.writeFileSync(OUT, JSON.stringify(out));
fs.writeFileSync(OUT + '.pretty.json', JSON.stringify(out, null, 0)); // optional readable
fs.rmSync(OUT + '.pretty.json');
console.log(`✓ wrote ${path.relpath ? path.relpath(process.cwd(), OUT) : OUT}`);
console.log(`  years: ${Object.keys(clean).length} (${Object.keys(clean)[0]}–${Object.keys(clean).slice(-1)[0]})`);
const leaps = Object.values(clean).filter((r) => r.leap).length;
console.log(`  leap years: ${leaps}`);
