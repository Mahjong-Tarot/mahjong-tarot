// Robustness sweep: prove the engine generalizes (not Katherine-specific) and
// never crashes / produces empty narratives across varied births.

import { scoreChart, buildFullReport, buildPalaceReading, PALACE_LABEL } from '../lib/ps/engine.mjs';
import { loadData } from '../lib/ps/data-node.mjs';
import { buildChartFromBirth, chineseAge } from '../lib/ps/chart-iztro.mjs';

const data = loadData();
const PALACES = Object.keys(PALACE_LABEL);

// deterministic spread of births: years, months, days, hours, genders
const births = [];
for (const y of [1947, 1962, 1978, 1985, 1990, 1996, 2003, 2011, 2018]) {
  for (const [m, d] of [[1, 12], [4, 30], [7, 7], [10, 23]]) {
    for (const h of [2, 6, 11, 17, 23]) {
      births.push({ solarDate: `${y}-${m}-${d}`, hour: h, gender: (y + m + d + h) % 2 ? 'female' : 'male' });
    }
  }
}

let ok = 0, fail = 0, emptyConclusion = 0, emptyFate = 0, palaceFail = 0;
const issues = [];
for (const b of births) {
  try {
    const chart = buildChartFromBirth(b, data);
    chart.name = 'Test';
    chart.currentAge = chineseAge(b.solarDate);
    scoreChart(chart);
    if (chart.palaces.length !== 12) throw new Error(`palaces=${chart.palaces.length}`);
    const full = buildFullReport(chart, data);
    if (full.decades.length !== 12) throw new Error(`decades=${full.decades.length}`);
    if (full.palaces.length !== 12) throw new Error(`palaces report=${full.palaces.length}`);
    if (full.years.mostLucky.length !== 10 || full.years.leastLucky.length !== 10)
      throw new Error(`years ${full.years.mostLucky.length}/${full.years.leastLucky.length}`);
    for (const p of full.palaces) {
      if (!p.conclusion) emptyConclusion++;
      if (!p.fate || !p.fate.length) emptyFate++;
    }
    // every palace must produce a non-null reading with full SFSZ
    for (const pk of PALACES) {
      const pr = buildPalaceReading(chart, pk, data);
      if (!pr || !pr.narrative.conclusion || pr.sanFangSiZheng.trine.length !== 2) { palaceFail++; }
    }
    ok++;
  } catch (e) {
    fail++; issues.push(`${b.solarDate} h${b.hour} ${b.gender}: ${e.message}`);
  }
}

console.log(`\nSweep: ${births.length} births × 12 palace readings each`);
console.log(`  full reports OK : ${ok}/${births.length}`);
console.log(`  failures        : ${fail}`);
console.log(`  empty palace conclusions : ${emptyConclusion}`);
console.log(`  empty fate banks         : ${emptyFate}`);
console.log(`  palace-reading defects   : ${palaceFail}`);
if (issues.length) { console.log('\n  first issues:'); issues.slice(0, 8).forEach((i) => console.log('   - ' + i)); }
console.log(fail === 0 && palaceFail === 0 ? '\n✓ PASS — engine generalizes across all births\n' : '\n✗ FAIL\n');
process.exit(fail === 0 && palaceFail === 0 ? 0 : 1);
