// Calibration harness — checks the matrix-driven engine against Bill's feedback.
// Not shipped logic; a verification aid. Run: node website/scripts/calibrate-ps.mjs

import { scoreChart, buildFullReport, PALACE_LABEL, INAUSPICIOUS_AT_OR_BELOW } from '../lib/ps/engine.mjs';
import { loadData } from '../lib/ps/data-node.mjs';
import { buildChartFromBirth, chineseAge } from '../lib/ps/chart.mjs';

const data = loadData();

const people = [
  { name: 'Bill',      solarDate: '1947-2-6',  hour: 13.7, gender: 'male' },   // 13:42
  { name: 'Dave',      solarDate: '1972-9-1',  hour: 11,   gender: 'male' },
  { name: 'Katherine', solarDate: '1996-1-12', hour: 6,    gender: 'female' },
];

const AUSP_LUCK = new Set(['mostLucky', 'generallyLucky']);
const UNFAV_LUCK = new Set(['leastLucky', 'generallyUnlucky']);

for (const pp of people) {
  const chart = buildChartFromBirth(pp, data);
  chart.name = pp.name;
  chart.currentAge = chineseAge(pp.solarDate);
  scoreChart(chart, data);
  const full = buildFullReport(chart, data);

  // star instance ratings across all palaces
  let total = 0, inausp = 0;
  for (const p of chart.palaces)
    for (const s of [...p.majors, ...p.minors]) {
      total++; if (s.rating <= INAUSPICIOUS_AT_OR_BELOW) inausp++;
    }

  const dist = { auspicious: 0, mixed: 0, unfavorable: 0 };
  for (const p of chart.palaces) {
    if (AUSP_LUCK.has(p.luck)) dist.auspicious++;
    else if (UNFAV_LUCK.has(p.luck)) dist.unfavorable++;
    else dist.mixed++;
  }

  console.log(`\n════════ ${pp.name} · ${pp.solarDate} h${pp.hour} ${pp.gender} ════════`);
  console.log(`Stars placed: ${total} · inauspicious (rating ≤${INAUSPICIOUS_AT_OR_BELOW}): ${inausp}`);
  console.log(`Palace luck distribution → auspicious ${dist.auspicious} / mixed ${dist.mixed} / unfavorable ${dist.unfavorable}`);

  const marriage = chart.palaces.find((p) => p.key === 'Marriage');
  const mStars = [...marriage.majors, ...marriage.minors].map((s) => `${s.hanzi}(${s.rating})`).join(' ');
  console.log(`Marriage: luck=${marriage.luck} score=${marriage.score} · ${mStars || '—'}`);

  const travel = chart.palaces.find((p) => p.key === 'Travel');
  const tStars = [...travel.majors, ...travel.minors].map((s) => `${s.hanzi}(${s.rating})`).join(' ');
  console.log(`Travel:   luck=${travel.luck} score=${travel.score} · ${tStars || '—'} · 咸池 present: ${tStars.includes('咸池')}`);

  // decades — flag any Very Unfavorable, and specifically those in the 90s
  const vuf = full.decades.filter((d) => d.rating === 'Very Unfavorable');
  const in90s = full.decades.filter((d) => d.ages && d.ages[0] >= 90 && d.rating === 'Very Unfavorable');
  console.log(`Decades Very Unfavorable: ${vuf.map((d) => `#${d.index}[${d.ages.join('-')}]${d.palace}`).join(' ') || 'none'}`);
  console.log(`  → Very Unfavorable decade in 90s: ${in90s.length ? 'YES ' + in90s.map((d) => d.ages.join('-')).join(',') : 'no'}`);

  console.log(`Luckiest palace: ${full.luckiestPalace} · Unluckiest: ${full.unluckiestPalace}`);
  console.log('Per-palace:');
  for (const p of [...chart.palaces].sort((a, b) => b.score - a.score)) {
    const stars = [...p.majors, ...p.minors].map((s) => `${s.hanzi}${s.rating}`).join(' ');
    console.log(`  ${PALACE_LABEL[p.key].padEnd(10)} ${String(p.score).padStart(6)} ${p.luck.padEnd(16)} ${stars}`);
  }
}
