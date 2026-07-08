// Validates the Four Pillars port against Bill's golden sample.
// Run from website/:  node lib/fp/validate-golden.mjs
//
// Golden sample: Bill, born 1947-02-06 1:00 PM (Four Pillars - Prototype.docx).
// Expected (see PHASE-1-FINDINGS.md): stage elements Water/Wood/Fire/Earth/Metal,
// counts 2/2/4/2/2, forces fate/happiness/recognition/wealth/opportunity.

import { buildFourPillarsChart } from './chart.mjs';

const chart = buildFourPillarsChart({ birthday: '1947-02-06', birthTime: '13:00' });

const expected = {
  mix: '42222',
  elementCounts: { Wood: 2, Fire: 2, Earth: 4, Metal: 2, Water: 2 },
  stages: [
    { stage: 'Birth', element: 'Water', count: 2, force: 'fate' },
    { stage: 'Youth', element: 'Wood', count: 2, force: 'happiness' },
    { stage: 'Maturation', element: 'Fire', count: 2, force: 'recognition' },
    { stage: 'Adulthood', element: 'Earth', count: 4, force: 'wealth' },
    { stage: 'Retirement', element: 'Metal', count: 2, force: 'opportunity' },
  ],
};

let failures = 0;
const check = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}` + (ok ? '' : `\n   got:  ${JSON.stringify(got)}\n   want: ${JSON.stringify(want)}`));
};

console.log('Golden sample: Bill, 1947-02-06 1:00 PM\n');
check('mix code', chart.mix, expected.mix);
check('element counts', chart.elementCounts, expected.elementCounts);
expected.stages.forEach((e, i) => {
  const s = chart.stages[i];
  check(`stage ${e.stage}`, { stage: s.stage, element: s.element, count: s.count, force: s.force }, e);
});

console.log(`\n${failures === 0 ? 'ALL PASS' : failures + ' FAILURE(S)'}`);
process.exit(failures === 0 ? 0 : 1);
