// Validates the Three Blessings input-derivation layer against Bill's authored
// golden prototypes. Run from website/:  node lib/tb/validate-inputs.mjs
//
// Verified facts (see docs/features/three-blessings-report/PHASE-1-FINDINGS.md):
//   * "bill"  (Jan-2013 prototype) is a HAS-HOUR reading: 4-pillar mix 42222,
//     Fire Pig year, month Tiger, hour Sheep. Matches fp / standard BaZi.
//   * "david" (undated prototype) is really a NO-HOUR reading: its "12pm" is the
//     classic unknown-time default. With no hour, the 3-pillar mix is 32220 —
//     exactly the golden. (With a hour it would be 33321, which the golden is not.)
// So both goldens are internally consistent under fp's native counting; there is
// no special TB element-count rule beyond "honor hasHour".

import { buildFourPillarsChart } from '../fp/chart.mjs';
import { deriveInputs } from './derive.mjs';

let fails = 0;
const ok = (label, cond, got) => {
  if (!cond) fails += 1;
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${cond ? '' : `  <- got ${JSON.stringify(got)}`}`);
};

// ── bill: has-hour, canonical target ────────────────────────────────────────
const bill = deriveInputs(buildFourPillarsChart({ birthday: '1947-02-06', birthTime: '13:00' }));
console.log('bill:', JSON.stringify(bill.signs), 'yearEl', bill.yearElementId, 'mix', bill.mix);
ok('bill year sign = Pig (12)', bill.signs.year === 12, bill.signs.year);
ok('bill month sign = Tiger (3)', bill.signs.month === 3, bill.signs.month);
ok('bill hour sign = Sheep (8)', bill.signs.hour === 8, bill.signs.hour);
ok('bill year element = Fire (2)', bill.yearElementId === 2, bill.yearElementId);
ok('bill fixed element = Water (5)', bill.fixedElementId === 5, bill.fixedElementId);
ok('bill mix = 42222', bill.mix === '42222', bill.mix);

// ── david: no-hour reading ──────────────────────────────────────────────────
const david = deriveInputs(buildFourPillarsChart({ birthday: '1972-09-01', birthTime: null }));
console.log('\ndavid (no-hour):', JSON.stringify(david.signs), 'yearEl', david.yearElementId, 'mix', david.mix);
ok('david year sign = Rat (1)', david.signs.year === 1, david.signs.year);
ok('david month sign = Monkey (9)', david.signs.month === 9, david.signs.month);
ok('david year element = Water (5)', david.yearElementId === 5, david.yearElementId);
ok('david fixed element = Water (5)', david.fixedElementId === 5, david.fixedElementId);
ok('david no-hour mix = 32220 (matches golden)', david.mix === '32220', david.mix);

console.log(`\n${fails === 0 ? 'ALL PASS' : fails + ' FAILURE(S)'}`);
process.exit(fails === 0 ? 0 : 1);
