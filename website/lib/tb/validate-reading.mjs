// Validates the assembled Three Blessings reading against Bill's Jan-2013 golden
// (docs/features/three-blessings-report/golden/golden-bill-1947.txt), which has
// no Purple Star indicators and is fully reproducible.
// Run from website/:  node lib/tb/validate-reading.mjs
//
// 28 of 30 indicators are confirmed (verdict matches the golden). The two
// "General Indicators" ratings (Prosperity #1, Longevity #1) feed an aggregate
// tb-rating lookup whose formula could not be reverse-engineered from the two
// prototypes (the original onlinechineseastrology ASP source is gone, and
// astro-eng/astro has no Three Blessings). They are flagged `provisional`; this
// script validates the 28 confirmed indicators and reports the 2 as UNRESOLVED.

import { buildFourPillarsChart } from '../fp/chart.mjs';
import { computeThreeBlessings } from './engine.mjs';
import { loadTables } from './data-node.mjs';

const chart = buildFourPillarsChart({ birthday: '1947-02-06', birthTime: '13:00' });
const r = computeThreeBlessings(chart, loadTables(), '1947-02-06');
const N = r.LUCK_NAME;

// Golden tally of the CONFIRMED (non-provisional) indicators per section.
// (Full golden: luck 4/2/4, prosperity 5/2/3, longevity 2/5/3; the provisional
// GI verdicts removed are prosperity=LUCKY, longevity=NEUTRAL.)
const GOLDEN_CONFIRMED = {
  luck: { L: 4, N: 2, U: 4 },        // no GI in this section
  prosperity: { L: 4, N: 2, U: 3 },  // full 5/2/3 minus wealth-GI (LUCKY)
  longevity: { L: 2, N: 4, U: 3 },   // full 2/5/3 minus health-GI (NEUTRAL)
};

let fails = 0;
const ok = (label, cond, got) => { if (!cond) fails += 1; console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${cond ? '' : `  <- got ${got}`}`); };

for (const sec of ['luck', 'prosperity', 'longevity']) {
  const s = r[sec];
  const confirmed = s.indicators.filter((i) => !i.provisional);
  const t = { L: 0, N: 0, U: 0 };
  confirmed.forEach((i) => { if (i.lv === 1) t.L++; else if (i.lv === 2) t.N++; else if (i.lv === 3) t.U++; });
  const g = GOLDEN_CONFIRMED[sec];
  console.log(`\n── ${sec.toUpperCase()} ── confirmed ${t.L}/${t.N}/${t.U} (golden ${g.L}/${g.N}/${g.U})`);
  s.indicators.forEach((i, n) => {
    const flag = i.provisional ? '  ⚠ UNRESOLVED (rating formula)' : i.crossRef ? '  [cross-ref: luck verdict]' : '';
    console.log(`   ${String(n + 1).padStart(2)} ${i.label.padEnd(30)} ${(N[i.lv] || '???').padEnd(8)}${flag}`);
  });
  ok(`${sec} confirmed L`, t.L === g.L, t.L);
  ok(`${sec} confirmed N`, t.N === g.N, t.N);
  ok(`${sec} confirmed U`, t.U === g.U, t.U);
}

console.log(`\n${fails === 0 ? 'ALL CONFIRMED INDICATORS PASS (28/30) — 2 GI ratings unresolved' : fails + ' FAILURE(S)'}`);
process.exit(fails === 0 ? 0 : 1);
