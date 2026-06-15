// Regression test: native chart.mjs vs the frozen golden snapshot (chart-golden.json).
// No third-party astrology dependency — the snapshot was captured once. Re-run after
// any change to chart.mjs / lunar.mjs. Expected: 0 diffs.
import fs from 'node:fs';
import { buildChartFromBirth } from '../lib/ps/chart.mjs';

const table = JSON.parse(fs.readFileSync('data/ps/lunar-table.json', 'utf8'));
const stars = JSON.parse(fs.readFileSync('data/ps/stars.json', 'utf8'));
const golden = JSON.parse(fs.readFileSync('data/ps/chart-golden.json', 'utf8'));
const data = { lunarTable: table, stars };

let starOK = 0, starBad = 0, buBad = 0, decBad = 0, ageBad = 0;
const wrong = {};
for (const g of golden.charts) {
  const c = buildChartFromBirth({ solarDate: g.birth.solarDate, hour: g.birth.hour, gender: g.birth.gender }, data);
  if (c.meta.fiveElements !== g.bureau) buBad++;
  const mine = {}; for (const p of c.palaces) mine[p.branchHan] = p;
  for (const gp of g.palaces) {
    const mp = mine[gp.branch];
    const ms = new Set(mp ? [...mp.majors, ...mp.minors].map((s) => s.hanzi) : []);
    const gs = new Set(gp.stars);
    for (const h of gs) { if (ms.has(h)) starOK++; else { starBad++; wrong[h] = (wrong[h] || 0) + 1; } }
    for (const h of ms) { if (!gs.has(h)) { starBad++; wrong[h + '(extra)'] = (wrong[h + '(extra)'] || 0) + 1; } }
    const md = mp && mp.decade ? mp.decade.range.join('-') : null;
    if ((gp.decade ? gp.decade.join('-') : null) !== md) decBad++;
    if ((gp.ages || []).join(',') !== (mp ? (mp.ages || []).join(',') : '')) ageBad++;
  }
}
console.log(`golden charts: ${golden.charts.length}`);
console.log(`star placements: ${starOK} correct, ${starBad} wrong`);
console.log(`bureau wrong: ${buBad}, decade-cell wrong: ${decBad}, ages-cell wrong: ${ageBad}`);
const list = Object.entries(wrong).sort((a, b) => b[1] - a[1]);
if (list.length) { console.log('misplaced:'); list.forEach(([s, c]) => console.log(`  ${s}: ${c}`)); process.exit(1); }
console.log('\n✓ native engine matches the golden snapshot exactly');
