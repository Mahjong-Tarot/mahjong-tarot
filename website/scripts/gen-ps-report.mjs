// Generate a Purple Star report (full fate+luck, or single palace) from birth data.
//
// Chart placement currently comes from iztro (a swappable provider — the native
// iztro-free engine is a separate track). Everything downstream — the 37-star
// canon, San Fang Si Zheng scoring, and all narrative — is Bill's own data.
//
// Usage: node website/scripts/gen-ps-report.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scoreChart, buildFullReport, buildPalaceReading } from '../lib/ps/engine.mjs';
import { loadData } from '../lib/ps/data-node.mjs';
import { buildChartFromBirth, chineseAge } from '../lib/ps/chart-iztro.mjs';
import { renderFullReport, renderPalaceReading } from '../lib/ps/render.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const data = loadData();

// ── run for Katherine ─────────────────────────────────────────────────────────
const chart = buildChartFromBirth({ solarDate: '1996-1-12', hour: 6, gender: 'female' }, data);
chart.name = 'Katherine';
chart.currentAge = chineseAge('1996-1-12');
scoreChart(chart);
const full = buildFullReport(chart, data);
const palace = buildPalaceReading(chart, 'Property', data);

const WF = path.join(DIR, '..', '..', 'working_files');
fs.writeFileSync(path.join(WF, 'ps-report-katherine.json'), JSON.stringify({ chart, full, palace }, null, 2));
fs.writeFileSync(path.join(WF, 'ps-full-katherine.html'), renderFullReport(chart, full));
fs.writeFileSync(path.join(WF, 'ps-palace-katherine.html'), renderPalaceReading(chart, palace));

// ── console summary (verification) ─────────────────────────────────────────────
const L = (s) => console.log(s);
L('\n════════ CHART ════════');
L(`Katherine · ${chart.meta.solarDate} ${chart.meta.timeRange} · ${chart.meta.chinese} · ${chart.meta.fiveElements}`);
L(`Soul ${chart.meta.soul} / Body ${chart.meta.body}`);
L('\nPalace            Branch  Score  Luck            Stars (Bill\'s 37)');
for (const p of [...chart.palaces].sort((a,b)=>b.score-a.score)) {
  const stars = [...p.majors.map(s=>s.display+'*'), ...p.minors.map(s=>s.display)].join(', ');
  L(`${p.key.padEnd(16)} ${p.branchHan}      ${String(p.score).padStart(5)}  ${p.luck.padEnd(15)} ${stars}`);
}
L('\n════════ FULL REPORT ════════');
L(`Luckiest palace: ${full.luckiestPalace} | Unluckiest: ${full.unluckiestPalace}`);
L(`Luckiest decade: #${full.luckiestDecade?.index} (ages ${full.luckiestDecade?.ages?.join('-')}, ${full.luckiestDecade?.palace})`);
L(`Unluckiest decade: #${full.unluckiestDecade?.index} (ages ${full.unluckiestDecade?.ages?.join('-')}, ${full.unluckiestDecade?.palace})`);
L(`\nDecades scored: ${full.decades.length} | Palaces: ${full.palaces.length}`);
L('\nSample — Property palace (Part 3):');
const prop = full.palaces.find(p=>p.key==='Property');
L(`  luck=${prop.luck} score=${prop.score}`);
L(`  conclusion: ${(prop.conclusion||'').slice(0,140)}…`);
L(`  fate traits: ${prop.fate.slice(0,3).join(' / ')}`);
L('\n════════ PALACE READING (Property) ════════');
L(`Level: ${palace.palace.level} (${palace.palace.luck})`);
L(`Conclusion: ${(palace.narrative.conclusion||'').slice(0,120)}…`);
L(`Star-combo: ${(palace.narrative.starCombo||'(none)').slice(0,120)}`);
L('San Fang Si Zheng:');
L(`  Focus   ${palace.sanFangSiZheng.focus.palace}: ${palace.sanFangSiZheng.focus.stars.join(', ')}`);
L(`  Mirror  ${palace.sanFangSiZheng.opposite.palace} (${palace.sanFangSiZheng.opposite.branch}): ${palace.sanFangSiZheng.opposite.stars.join(', ')}`);
for (const t of palace.sanFangSiZheng.trine)
  L(`  Trine   ${t.palace} (${t.branch}): ${t.stars.join(', ')}`);
L('\n✓ wrote working_files/ps-report-katherine.json');
L('✓ wrote working_files/ps-full-katherine.html');
L('✓ wrote working_files/ps-palace-katherine.html');
