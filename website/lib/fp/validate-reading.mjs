// Validates the assembled Four Pillars reading against Bill's golden sample.
// Run from website/:  node lib/fp/validate-reading.mjs

import { buildFourPillarsChart } from './chart.mjs';
import { buildFourPillarsReading } from './engine.mjs';
import { loadContent } from './content-node.mjs';

const chart = buildFourPillarsChart({ birthday: '1947-02-06', birthTime: '13:00' });
const reading = buildFourPillarsReading(chart, loadContent());

let fails = 0;
const ok = (label, cond, detail = '') => {
  if (!cond) fails += 1;
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${cond ? '' : `  <- ${detail}`}`);
};

console.log('Year sign:', reading.yearSign.combined, '| fixed:', reading.yearSign.fixedElement, '\n');
ok('year sign = Fire Pig', reading.yearSign.combined === 'Fire Pig');
ok('fixed element = Water', reading.yearSign.fixedElement === 'Water');
ok('year-sign personality present', !!reading.yearSign.personality);
ok('mix code = 42222', reading.elementMix.code === '42222', reading.elementMix.code);

const wantChi = {
  Birth: 'This is a low normal chi period',
  Youth: 'This is a low normal chi period',
  Maturation: 'This is a low normal chi period',
  Adulthood: 'This is a strong chi period',
  Retirement: 'This is a low chi period',
};
console.log('\nStages:');
reading.stages.forEach((s) => {
  const chi = (s.chi || '').slice(0, 40);
  const good = !!s.chi && !!s.fate && s.chi.startsWith(wantChi[s.stage]);
  if (!good) fails += 1;
  console.log(`${good ? 'PASS' : 'FAIL'}  ${s.stage.padEnd(11)} ${s.element.padEnd(6)} force=${(s.force || '').padEnd(11)} chi="${chi}..."`);
});

console.log('\nElement strengths:');
reading.elementMix.strengths.forEach((e) => {
  console.log(`  ${e.element.padEnd(6)} count=${e.count}  ${(e.text || '(none)').slice(0, 60)}`);
});

console.log(`\n${fails === 0 ? 'ALL PASS' : fails + ' FAILURE(S)'}`);
process.exit(fails === 0 ? 0 : 1);
