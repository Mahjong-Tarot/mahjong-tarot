// HTML renderer for Purple Star reports — turns engine output into the
// chart-on-night-sky presentation Bill liked. Two entry points:
//   renderPalaceReading(chart, palaceReport)
//   renderFullReport(chart, fullReport)

import { sanFangSiZheng, BRANCH_IDX } from './engine.mjs';

const MALEFIC = new Set(['火星', '铃星', '擎羊', '陀罗', '地劫', '地空', '大耗', '天刑']);
const ROMANCE = new Set(['咸池', '红鸾', '天喜', '天姚']);

// branch → 4×4 grid cell (col,row) and grid-area name
const POS = { 巳:['si',0,0], 午:['wu',1,0], 未:['wei',2,0], 申:['shen',3,0],
  辰:['chen',0,1], 酉:['you',3,1], 卯:['mao',0,2], 戌:['xu',3,2],
  寅:['yin',0,3], 丑:['chou',1,3], 子:['zi',2,3], 亥:['hai',3,3] };
const center = (han) => { const [, c, r] = POS[han]; return [c + 0.5, r + 0.5]; };

const esc = (s) => String(s == null ? '' : s).replace(/[&<>]/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;' }[m]));

function starChip(s, kind) {
  const nat = MALEFIC.has(s.hanzi) ? 'malefic' : ROMANCE.has(s.hanzi) ? 'romance'
    : kind === 'major' ? 'major' : 'minor';
  const badges = (s.mutagen ? `<span class="bd mu">${esc(s.mutagen)}</span>` : '')
    + (s.brightness ? `<span class="bd br">${esc(s.brightness)}</span>` : '');
  return `<div class="star ${kind} n-${nat}"><span class="han">${esc(s.hanzi)}</span>`
    + `<span class="en">${esc(s.en)}</span>${badges}</div>`;
}

function renderChart(chart, focusKey) {
  const byBranch = {}; for (const p of chart.palaces) byBranch[p.branchIdx] = p;
  const focus = chart.palaces.find((p) => p.key === focusKey);
  let lines = '';
  if (focus) {
    const sf = sanFangSiZheng(focus.branchIdx);
    const fb = focus.branchHan;
    const ob = byBranch[sf.opposite].branchHan;
    const tb = sf.trine.map((t) => byBranch[t].branchHan);
    const pt = (h) => center(h).join(',');
    const fc = center(fb), oc = center(ob), t1 = center(tb[0]), t2 = center(tb[1]);
    lines = `<svg class="sfsz" viewBox="0 0 4 4" preserveAspectRatio="none">
      <line x1="${fc[0]}" y1="${fc[1]}" x2="${oc[0]}" y2="${oc[1]}" class="axis"/>
      <polygon points="${pt(fb)} ${pt(tb[0])} ${pt(tb[1])}" class="tri"/>
    </svg>`;
  }

  const cells = chart.palaces.map((p) => {
    const [area] = POS[p.branchHan];
    let cls = 'palace';
    if (p.key === focusKey) cls += ' focus';
    else if (focus && p.branchIdx === sanFangSiZheng(focus.branchIdx).opposite) cls += ' mirror';
    else if (focus && sanFangSiZheng(focus.branchIdx).trine.includes(p.branchIdx)) cls += ' trine';
    else if (focus) cls += ' dim';
    const stars = p.majors.map((s) => starChip(s, 'major')).join('')
      + p.minors.map((s) => starChip(s, 'minor')).join('');
    const tag = p.key === focusKey ? '<div class="pflag f">Focus</div>'
      : (focus && p.branchIdx === sanFangSiZheng(focus.branchIdx).opposite) ? '<div class="pflag m">Mirror</div>'
      : (focus && sanFangSiZheng(focus.branchIdx).trine.includes(p.branchIdx)) ? '<div class="pflag t">Trine</div>' : '';
    return `<div class="${cls}" style="grid-area:${area}">${tag}
      <div class="stars">${stars || '<span class="empty">— borrows opposite —</span>'}</div>
      <div class="pfoot"><span class="pname">${esc(p.label || p.key)}</span>
        <span class="pbranch">${esc(p.animal)} ${esc(p.branchHan)}</span></div></div>`;
  }).join('');

  const m = chart.meta;
  const centerPanel = `<div class="center">
      <div class="cn">紫微斗數</div><h2>${esc(chart.name || 'Purple Star')}</h2>
      <div class="meta">${esc(m.chinese)}<br>${esc(m.fiveElements)} · Soul ${esc(m.soul)} / Body ${esc(m.body)}<br>
      ${esc(m.solarDate)} · ${esc(m.timeRange)}</div></div>`;

  return `<div class="chart">${lines}${cells}${centerPanel}</div>
    <p class="chartnote">The chart is a map, not the message — it's here for gravitas and as a keepsake.
    Everything it encodes is spelled out, in plain language, in your reading below.</p>`;
}

const PAGE = (title, ident, body) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title>
<style>
:root{--paper:#f5edda;--paper2:#efe4c9;--ink:#2b2138;--ink-soft:#5c5170;--gold:#d8b25f;--gold-deep:#b8924a;
--jade:#74b89a;--ember:#e0795f;--rose:#d98aae;--muted:#9387ad;--line:rgba(216,178,95,.28)}
*{box-sizing:border-box}body{margin:0;padding:32px 18px 64px;color:var(--paper);line-height:1.6;
font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,"Songti SC",serif;
background:radial-gradient(1200px 700px at 70% -10%,rgba(120,80,200,.35),transparent 60%),
radial-gradient(900px 600px at 10% 110%,rgba(60,150,130,.18),transparent 55%),
linear-gradient(160deg,#140b29,#241449 55%,#0d0720);background-attachment:fixed}
.wrap{max-width:1080px;margin:0 auto}
.topline{text-align:center;font-size:.72rem;letter-spacing:.32em;text-transform:uppercase;color:var(--gold)}
h1{text-align:center;font-size:2.2rem;margin:.3em 0 .1em;font-weight:600}
h1 .han{color:var(--gold);font-family:"Songti SC",serif;margin-left:.25em}
.ident{text-align:center;color:var(--paper2);font-size:.92rem;margin:0 auto 26px;max-width:680px}
.ident b{color:var(--gold)}
.chart{position:relative;display:grid;gap:6px;aspect-ratio:1/1;max-width:740px;margin:0 auto 8px;
grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(4,1fr);
grid-template-areas:"si wu wei shen" "chen ctr ctr you" "mao ctr ctr xu" "yin chou zi hai"}
.sfsz{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:5}
.sfsz .axis{stroke:rgba(216,178,95,.55);stroke-width:.02;stroke-dasharray:.06 .04}
.sfsz .tri{fill:rgba(116,184,154,.07);stroke:rgba(116,184,154,.55);stroke-width:.02}
.palace{position:relative;border:1px solid var(--line);border-radius:9px;background:rgba(20,12,38,.55);
padding:7px 8px 24px;overflow:hidden;display:flex;flex-direction:column;gap:2px;min-height:0}
.palace.dim{opacity:.4}
.palace.focus{background:linear-gradient(180deg,rgba(216,178,95,.16),rgba(20,12,38,.6));border-color:var(--gold);
box-shadow:0 0 0 1px rgba(216,178,95,.35),0 0 26px rgba(216,178,95,.2) inset}
.palace.mirror{background:linear-gradient(180deg,rgba(116,184,154,.13),rgba(20,12,38,.6));border-color:rgba(116,184,154,.6)}
.palace.trine{background:linear-gradient(180deg,rgba(116,184,154,.07),rgba(20,12,38,.6));border-color:rgba(116,184,154,.35)}
.center{grid-area:ctr;border:1px solid var(--line);border-radius:11px;display:flex;flex-direction:column;
align-items:center;justify-content:center;text-align:center;padding:12px;
background:radial-gradient(120% 120% at 50% 0,rgba(40,24,70,.7),rgba(10,6,22,.85))}
.center .cn{font-family:"Songti SC",serif;color:var(--gold);font-size:1.3rem;letter-spacing:.14em}
.center h2{margin:.2em 0;font-size:1.05rem}.center .meta{font-size:.68rem;color:var(--muted);line-height:1.7}
.pflag{position:absolute;top:6px;right:7px;font-size:.52rem;letter-spacing:.1em;text-transform:uppercase;
padding:2px 6px;border-radius:99px;font-family:Georgia,serif}
.pflag.f{background:var(--gold);color:#2a1d05}.pflag.m{background:rgba(116,184,154,.9);color:#08201a}
.pflag.t{background:rgba(116,184,154,.45);color:#dff0e8}
.stars{display:flex;flex-direction:column;gap:1px;flex:1;min-height:0;z-index:2}
.star{display:flex;align-items:baseline;gap:5px;line-height:1.15}
.star .han{font-family:"Songti SC",serif;font-weight:600;font-size:.92rem;white-space:nowrap}
.star .en{font-size:.58rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.star.major .han{font-size:1rem}.star.minor .han{font-size:.82rem;font-weight:500}
.n-major .han{color:#f0d98c}.n-minor .han{color:var(--jade)}.n-malefic .han{color:var(--ember)}.n-romance .han{color:var(--rose)}
.bd{font-size:.5rem;border-radius:3px;padding:0 3px;font-family:Georgia,serif}
.bd.mu{background:rgba(216,178,95,.22);color:#f0d98c}.bd.br{background:rgba(255,255,255,.08);color:var(--muted)}
.empty{font-size:.6rem;color:var(--muted);font-style:italic}
.pfoot{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;gap:4px;
padding:3px 8px;background:rgba(8,4,18,.5);border-top:1px solid var(--line);font-size:.58rem;z-index:2}
.pname{font-weight:600;color:var(--paper2)}.pbranch{color:var(--gold);font-family:"Songti SC",serif}
.chartnote{text-align:center;color:var(--muted);font-size:.72rem;font-style:italic;max-width:560px;margin:0 auto 30px}
.reading{max-width:760px;margin:30px auto 0;background:var(--paper);color:var(--ink);border-radius:14px;
padding:34px 38px 40px;box-shadow:0 24px 60px rgba(0,0,0,.45)}
.reading .kicker{text-align:center;font-size:.7rem;letter-spacing:.26em;text-transform:uppercase;color:var(--gold-deep)}
.reading h2{text-align:center;font-size:1.7rem;margin:.2em 0 .5em}
.reading h3{font-size:1.15rem;color:#5b3f7a;margin:26px 0 6px;border-bottom:1px solid #e3d6b8;padding-bottom:4px}
.reading p{margin:.5em 0}.badge{display:inline-block;font-size:.66rem;font-weight:700;text-transform:uppercase;
letter-spacing:.04em;color:#fff;border-radius:99px;padding:.15rem .6rem;vertical-align:middle}
.entry{margin:10px 0;padding:11px 15px;border-radius:9px;background:var(--paper2);border-left:4px solid var(--gold)}
.entry .lead{font-weight:600;display:block;margin-bottom:3px}
.fate{margin:.5em 0;padding-left:1.1em}.fate li{margin:.25em 0}
.sfsz-list{font-size:.9rem;color:var(--ink-soft);margin:.4em 0}
.sfsz-list b{color:var(--ink)}.han-inline{font-family:"Songti SC",serif;color:#7a3f8c}
.palblock{margin:14px 0;padding:14px 18px;border-radius:10px;background:var(--paper2)}
.palblock h4{margin:0 0 4px;font-size:1.05rem;color:#5b3f7a;display:flex;justify-content:space-between;align-items:center;gap:8px}
.footnote{max-width:760px;margin:22px auto 0;font-size:.72rem;color:var(--muted);text-align:center}
.footnote code{color:var(--gold)}
</style></head><body><div class="wrap">
<div class="topline">Purple Star Astrology · 紫微斗數</div>
<h1>${title}</h1><p class="ident">${ident}</p>${body}
<p class="footnote">Generated deterministically from Bill Hajdu's authored Purple Star data (37-star canon).
Modern names: <code>locked</code> names are final; others fall back to pinyin + characters.</p>
</div>
<script>(function(){function h(){try{parent.postMessage({psrHeight:document.documentElement.scrollHeight},'*')}catch(e){}}
window.addEventListener('load',h);setTimeout(h,200);setTimeout(h,800)})();</script>
</body></html>`;

const LUCK_COLOR = { mostLucky:'#3f8f5a', generallyLucky:'#6a9f5a', mixed:'#b8924a', generallyUnlucky:'#c2693f', leastLucky:'#b23b3b' };
const LUCK_LABEL = { mostLucky:'Most Lucky', generallyLucky:'Generally Lucky', mixed:'Mixed Luck', generallyUnlucky:'Generally Unlucky', leastLucky:'Least Lucky' };
const fateList = (arr) => arr && arr.length ? `<ul class="fate">${arr.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : '';

export function renderPalaceReading(chart, r) {
  const ident = `Prepared for <b>${esc(chart.name)}</b> · ${esc(chart.meta.solarDate)} ${esc(chart.meta.timeRange)} · single-palace reading`;
  const sf = r.sanFangSiZheng;
  const sfszHtml = `<div class="sfsz-list">
    <p><b>Focus — ${esc(sf.focus.palace)}:</b> ${sf.focus.stars.map(esc).join(', ') || '—'}</p>
    <p><b>Mirror — ${esc(sf.opposite.palace)} (${esc(sf.opposite.branch)}), 30% influence:</b> ${sf.opposite.stars.map(esc).join(', ') || '—'}</p>
    ${sf.trine.map((t) => `<p><b>Trine — ${esc(t.palace)} (${esc(t.branch)}), 30% influence:</b> ${t.stars.map(esc).join(', ') || '—'}</p>`).join('')}
  </div>`;
  const body = renderChart(chart, r.palace.key) + `<div class="reading">
    <div class="kicker">Single-Palace Reading</div>
    <h2>The ${esc(r.palace.label)} Palace
      <span class="badge" style="background:${LUCK_COLOR[r.palace.luck]}">${esc(LUCK_LABEL[r.palace.luck])}</span></h2>
    <p>${esc(r.narrative.conclusion)}</p>
    ${r.narrative.starCombo ? `<div class="entry"><span class="lead">The stars here</span>${esc(r.narrative.starCombo)}</div>` : ''}
    <h3>What this palace governs</h3>${fateList(r.narrative.fate)}
    <h3>The wider field — 三方四正 (Three Directions, Four Palaces)</h3>
    <p>This palace is never read alone. Its mirror and two trine palaces each lend about a third of their weight.</p>
    ${sfszHtml}
  </div>`;
  return PAGE(`The ${esc(r.palace.label)} Palace <span class="han">${esc(r.palace.branch)}</span>`, ident, body);
}

function renderYears(years) {
  if (!years) return '';
  const ageList = (arr) => `<ul class="fate">${arr.map((y) =>
    `<li><b>Age ${y.age}</b> (${esc(y.palace)}) — ${esc(y.text || '')}</li>`).join('')}</ul>`;
  const ny = years.nextYear;
  return `<h3>Part 2 — Your Years</h3>
    <div class="palblock"><h4>★ Your 10 luckiest ages</h4>${ageList(years.mostLucky)}</div>
    <div class="palblock"><h4>△ Your 10 most challenging ages</h4>${ageList(years.leastLucky)}</div>
    ${ny ? `<div class="palblock"><h4><span>The next 12 months — age ${ny.age} (${esc(ny.palace)})</span>
      <span class="badge" style="background:${ny.rating.includes('Unlucky')?'#b23b3b':ny.rating==='Neutral'?'#b8924a':'#3f8f5a'}">${esc(ny.rating)}</span></h4>
      ${ny.firstMonths ? `<p>${esc(ny.firstMonths)}</p>` : ''}${ny.secondMonths ? `<p>${esc(ny.secondMonths)}</p>` : ''}</div>` : ''}`;
}

export function renderFullReport(chart, full) {
  const ident = `Prepared for <b>${esc(chart.name)}</b> · ${esc(chart.meta.solarDate)} ${esc(chart.meta.timeRange)} · `
    + `${esc(chart.meta.chinese)} · full fate & luck report`;
  const decadeRows = full.decades.map((d) => `<div class="palblock">
    <h4><span>Decade ${d.index} — ages ${d.ages.join('–')} · ${esc(d.palace)}</span>
      <span class="badge" style="background:${d.rating.includes('Unfav')?'#b23b3b':d.rating==='Neutral'?'#b8924a':'#3f8f5a'}">${esc(d.rating)}</span></h4>
    ${d.yun ? `<p>${esc(d.yun)}</p>` : ''}
    ${d.major ? `<p><em>Major stars:</em> ${esc(d.major)}</p>` : ''}
    ${d.period ? `<p><em>${d===full.luckiestDecade?'★ Your luckiest decade':'△ Your most challenging decade'}:</em> ${esc(d.period)}</p>` : ''}
  </div>`).join('');

  const palaceRows = full.palaces.map((p) => `<div class="palblock">
    <h4><span>${esc(p.label)} Palace <span class="han-inline">${esc(p.branch)}</span></span>
      <span class="badge" style="background:${LUCK_COLOR[p.luck]}">${esc(LUCK_LABEL[p.luck])}</span></h4>
    <p>${esc(p.conclusion)}</p>
    ${p.extreme ? `<p><em>${esc(p.extreme)}</em></p>` : ''}
    ${fateList(p.fate)}
  </div>`).join('');

  const body = renderChart(chart, null) + `<div class="reading">
    <div class="kicker">Full Fate &amp; Luck Report</div>
    <h2>${esc(chart.name)}'s Purple Star</h2>
    <p style="text-align:center">Your luckiest area of life is your <b>${esc(full.luckiestPalace)}</b> palace;
       your most challenging is <b>${esc(full.unluckiestPalace)}</b>.</p>
    <h3>Part 1 — The Decades of Your Life</h3>${decadeRows}
    ${renderYears(full.years)}
    <h3>Part 3 — The Twelve Palaces</h3>${palaceRows}
  </div>`;
  return PAGE(`Full Purple Star Reading`, ident, body);
}
