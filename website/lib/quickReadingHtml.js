// Renders the multi-section Quick Reading email body. Each section is
// included only when the astrologer ticked its checkbox on the
// /admin/quick-reading page.

import { SIGN_LABEL, ELEMENT_LABEL, BAND_FOR, BAND_COLOR } from './fire-horse';
import { CHART_CSS, renderChartEmbed } from './ps/render.mjs';

const TONE_COLORS = {
  great: '#217A43',
  good:  '#2A8A48',
  mixed: '#B8893A',
  rough: '#E63329',
};

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Five-element helpers (shared) ───────────────────────────────────
// Wu Xing colours mapped onto the site design system (globals.css):
// Fire = brand fire-500, Earth = gold, Wood = success green, Metal = slate
// ink-4, Water = a harmonising slate-blue. Email-safe inline hex.
const ELEMENT_HEX = { Wood: '#2A8A48', Fire: '#E63329', Earth: '#B8893A', Metal: '#8A8E98', Water: '#3F6FA3' };
const ELEMENT_ORDER = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
const ANIMAL_EMOJI = {
  Rat: '🐀', Ox: '🐂', Tiger: '🐅', Rabbit: '🐇', Dragon: '🐉', Snake: '🐍',
  Horse: '🐎', Sheep: '🐐', Goat: '🐐', Monkey: '🐒', Rooster: '🐓', Dog: '🐕', Pig: '🐖',
};
const GENDER_GLYPH = { F: '♀', M: '♂', Female: '♀', Male: '♂' };

// Wu Xing cycles. Generating (生): each element feeds the next. Controlling
// (克): each element governs the one it can overcome. Used to state the
// element dynamic in the correct DIRECTION (Water controls Fire, never the
// reverse) rather than assuming person1 → person2.
const GENERATES = { Wood: 'Fire', Fire: 'Earth', Earth: 'Metal', Metal: 'Water', Water: 'Wood' };
const CONTROLS = { Wood: 'Earth', Fire: 'Metal', Earth: 'Water', Metal: 'Wood', Water: 'Fire' };
function elementRelation(a, b) {
  if (!a || !b) return null;
  if (a === b) return { verb: 'shares with', from: a, to: b };
  if (GENERATES[a] === b) return { verb: 'nourishes', from: a, to: b };
  if (GENERATES[b] === a) return { verb: 'nourishes', from: b, to: a };
  if (CONTROLS[a] === b) return { verb: 'controls', from: a, to: b };
  if (CONTROLS[b] === a) return { verb: 'controls', from: b, to: a };
  return { verb: 'meets', from: a, to: b };
}

// A single panel of five horizontal element bars. `max` scales every panel
// to the same axis so panels can be compared side by side. Table-based so
// it survives email clients that drop flexbox/grid.
function elementBarsPanel(title, counts, max) {
  const scale = max > 0 ? max : 1;
  const rows = ELEMENT_ORDER.map((el) => {
    const v = counts?.[el] || 0;
    const pct = Math.round((v / scale) * 100);
    return `<tr>
      <td style="width:42px; font-size:11px; color:#50545E; padding:3px 6px 3px 0; white-space:nowrap;">${el}</td>
      <td style="padding:3px 0;">
        <div style="background:#EFEFF2; border-radius:3px; height:11px;">
          <div style="width:${pct}%; height:11px; background:${ELEMENT_HEX[el]}; border-radius:3px;${v === 0 ? ' opacity:0.25;' : ''}"></div>
        </div>
      </td>
      <td style="width:16px; text-align:right; font-size:11px; color:#50545E; padding:3px 0 3px 6px;">${v}</td>
    </tr>`;
  }).join('');
  return `
    <div style="background:#FAFAFB; border:1px solid #E4E5EA; border-radius:8px; padding:10px 12px;">
      <div style="font-size:12px; color:#14161B; margin:0 0 6px; text-align:center;"><strong>${escapeHtml(title)}</strong></div>
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">${rows}</table>
    </div>`;
}

// ── Bazi ────────────────────────────────────────────────────────────

function pillarCell(p, label) {
  if (!p) {
    return `
      <td style="padding:10px 8px; border:1px solid #E4E5EA; vertical-align:top; text-align:center; color:#8A8E98;">
        <div style="font-size:10px; letter-spacing:0.06em; text-transform:uppercase; color:#8A8E98;">${escapeHtml(label)}</div>
        <div style="font-size:18px; margin-top:6px;">—</div>
      </td>`;
  }
  return `
    <td style="padding:10px 8px; border:1px solid #E4E5EA; vertical-align:top; text-align:center;">
      <div style="font-size:10px; letter-spacing:0.06em; text-transform:uppercase; color:#8A8E98;">${escapeHtml(label)}</div>
      <div style="font-family: 'Fraunces', Georgia, 'Times New Roman', serif; font-size:22px; color:#14161B; margin-top:4px;">${escapeHtml(p.gan)}${escapeHtml(p.zhi)}</div>
      <div style="font-size:11px; color:#50545E; margin-top:4px;">${escapeHtml(p.stem?.en || '')} ${escapeHtml(p.stem?.element || '')}</div>
      <div style="font-size:11px; color:#50545E;">${escapeHtml(p.branch?.en || '')} · ${escapeHtml(p.branch?.animal || '')}</div>
    </td>`;
}

// Renders one person's four pillars + a dominant-element line. `partnerBazi`
// (when present) stacks a second chart below and switches the element
// display to two comparable bar panels so both charts read side by side.
function renderBaziSection(bazi, partnerBazi) {
  if (!bazi) return '';

  const chart = (b) => `
    <div style="margin:0 0 12px;">
      ${b.name ? `<div style="font-size:12px; color:#50545E; margin:0 0 6px;"><strong style="color:#14161B;">${escapeHtml(b.name)}</strong>${b.dominant ? ` · dominant <span style="color:${ELEMENT_HEX[b.dominant] || '#50545E'};">${escapeHtml(b.dominant)}</span>` : ''}</div>` : ''}
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
        <tr>
          ${pillarCell(b.pillars.year,  'Year')}
          ${pillarCell(b.pillars.month, 'Month')}
          ${pillarCell(b.pillars.day,   'Day')}
          ${pillarCell(b.pillars.hour,  b.pillars.hasTime ? 'Hour' : 'Hour (no time given)')}
        </tr>
      </table>
    </div>`;

  const maxEl = 4;
  const barsRow = partnerBazi
    ? `<tr>
        <td width="50%" style="padding:0 6px 0 0; vertical-align:top;">${elementBarsPanel(bazi.name || 'Person 1', bazi.elements, maxEl)}</td>
        <td width="50%" style="padding:0 0 0 6px; vertical-align:top;">${elementBarsPanel(partnerBazi.name || 'Person 2', partnerBazi.elements, maxEl)}</td>
      </tr>`
    : `<tr><td style="vertical-align:top;">${elementBarsPanel('Five elements', bazi.elements, maxEl)}</td></tr>`;

  return `
    <div style="margin: 0 0 28px;">
      <h2 style="font-family: 'Fraunces', Georgia, 'Times New Roman', serif; font-size:26px; font-weight:600; letter-spacing:-0.01em; margin:0 0 14px; color:#14161B;">Bazi · Four Pillars${partnerBazi ? ' · Side by side' : ''}</h2>
      ${chart(bazi)}
      ${partnerBazi ? chart(partnerBazi) : ''}
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin-top:4px;">${barsRow}</table>
      ${!partnerBazi && bazi.dominant ? `<p style="margin:8px 0 0; font-size:13px; color:#2A2D35;"><strong>Dominant element:</strong> ${escapeHtml(bazi.dominant)}</p>` : ''}
    </div>`;
}

// ── Zi Wei Dou Shu ──────────────────────────────────────────────────

const LUCK_LABEL = { mostLucky: 'Most Lucky', generallyLucky: 'Generally Lucky', mixed: 'Mixed Luck', generallyUnlucky: 'Generally Unlucky', leastLucky: 'Least Lucky' };
const LUCK_COLOR = { mostLucky: '#2c8a4a', generallyLucky: '#6a9f5a', mixed: '#B8893A', generallyUnlucky: '#c2693f', leastLucky: '#c0392b' };
const ratingColor = (r) => (/Unfav|Unlucky/.test(r) ? '#c0392b' : r === 'Neutral' ? '#B8893A' : '#2c8a4a');

// Full fate & luck report (Bill's authored Purple Star narratives),
// rendered with email-safe inline styles.
function renderZiweiFullReport(full) {
  if (!full) return '';
  const h3 = (t) => `<h3 style="font-family: 'Fraunces', Georgia, 'Times New Roman', serif; font-size:15px; margin:18px 0 4px; color:#14161B;">${t}</h3>`;
  const para = (t) => `<p style="margin:6px 0 0; font-size:12px; line-height:1.55; color:#2A2D35;">${escapeHtml(t)}</p>`;

  const decadeBlock = (d) => `
    <div style="margin:10px 0; padding:10px 14px; background:#EFEFF2; border-left:3px solid ${ratingColor(d.rating)}; border-radius:4px;">
      <div style="font-size:12px; color:#14161B;"><strong>Decade ${escapeHtml(d.index)} — ages ${d.ages[0]}–${d.ages[1]} · ${escapeHtml(d.palace)}</strong>
        <span style="color:${ratingColor(d.rating)}; font-weight:600; margin-left:6px;">${escapeHtml(d.rating)}</span></div>
      ${d.yun ? para(d.yun) : ''}
      ${d.major ? `<p style="margin:6px 0 0; font-size:12px; line-height:1.55; color:#2A2D35;"><em>Major stars:</em> ${escapeHtml(d.major)}</p>` : ''}
      ${d.period ? `<p style="margin:6px 0 0; font-size:12px; line-height:1.55; color:#2A2D35;"><em>${d === full.luckiestDecade ? '★ Luckiest decade' : '△ Most challenging decade'}:</em> ${escapeHtml(d.period)}</p>` : ''}
    </div>`;

  const ageItem = (y) => `<li style="margin:0 0 5px; font-size:12px; line-height:1.5; color:#2A2D35;"><strong>Age ${y.age}</strong> (${escapeHtml(y.palace)}) — ${escapeHtml(y.text || '')}</li>`;
  const ageList = (label, arr) => `
    <div style="margin:10px 0; padding:10px 14px; background:#EFEFF2; border-radius:4px;">
      <div style="font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#8A8E98; margin-bottom:6px;">${label}</div>
      <ul style="margin:0; padding-left:18px;">${arr.map(ageItem).join('')}</ul>
    </div>`;
  const ny = full.years?.nextYear;

  const palaceBlock = (p) => `
    <div style="margin:10px 0; padding:10px 14px; border:1px solid #E4E5EA; border-radius:4px;">
      <div style="font-size:12px; color:#14161B;"><strong>${escapeHtml(p.label)} Palace</strong>
        <span style="color:#8A8E98;"> ${escapeHtml(p.branch)}</span>
        <span style="color:${LUCK_COLOR[p.luck] || '#444'}; font-weight:600; margin-left:6px;">${escapeHtml(LUCK_LABEL[p.luck] || '')}</span></div>
      ${p.conclusion ? para(p.conclusion) : ''}
      ${p.extreme ? `<p style="margin:6px 0 0; font-size:12px; line-height:1.55; color:#2A2D35;"><em>${escapeHtml(p.extreme)}</em></p>` : ''}
      ${p.fate?.length ? `<ul style="margin:6px 0 0; padding-left:18px;">${p.fate.map((t) => `<li style="margin:0 0 4px; font-size:12px; line-height:1.5; color:#2A2D35;">${escapeHtml(t)}</li>`).join('')}</ul>` : ''}
    </div>`;

  return `
    <p style="margin:14px 0 0; font-size:13px; color:#2A2D35;">Your luckiest area of life is your <strong>${escapeHtml(full.luckiestPalace)}</strong> palace; your most challenging is <strong>${escapeHtml(full.unluckiestPalace)}</strong>.</p>
    ${full.genderAssumed ? `<p style="margin:6px 0 0; font-size:11px; color:#8A8E98; font-style:italic;">Gender was not provided — the decade luck cycle assumes male. Set the gender for an exact reading.</p>` : ''}
    ${h3('Part 1 — The decades of your life')}
    ${full.decades.map(decadeBlock).join('')}
    ${full.years ? `
      ${h3('Part 2 — Your years')}
      ${ageList('★ Your 10 luckiest ages', full.years.mostLucky)}
      ${ageList('△ Your 10 most challenging ages', full.years.leastLucky)}
      ${ny ? `
        <div style="margin:10px 0; padding:10px 14px; border:1px solid #E4E5EA; border-radius:4px;">
          <div style="font-size:12px; color:#14161B;"><strong>The next 12 months — age ${ny.age} (${escapeHtml(ny.palace)})</strong>
            <span style="color:${ratingColor(ny.rating)}; font-weight:600; margin-left:6px;">${escapeHtml(ny.rating)}</span></div>
          ${ny.firstMonths ? para(ny.firstMonths) : ''}
          ${ny.secondMonths ? para(ny.secondMonths) : ''}
        </div>` : ''}
    ` : ''}
    ${h3('Part 3 — The twelve palaces')}
    ${full.palaces.map(palaceBlock).join('')}`;
}

function renderZiweiSection(chart, ziweiFull) {
  if (!chart) {
    return `
      <div style="margin: 0 0 28px;">
        <h2 style="font-family: 'Fraunces', Georgia, 'Times New Roman', serif; font-size:26px; font-weight:600; letter-spacing:-0.01em; margin:0 0 14px; color:#14161B;">Zi Wei Dou Shu</h2>
        <p style="margin:0; font-size:13px; color:#50545E; font-style:italic;">Birth time not provided — Zi Wei chart skipped. Add the birth time to compute.</p>
      </div>`;
  }
  const m = chart.meta;
  return `
    <div style="margin: 0 0 28px;">
      <h2 style="font-family: 'Fraunces', Georgia, 'Times New Roman', serif; font-size:26px; font-weight:600; letter-spacing:-0.01em; margin:0 0 14px; color:#14161B;">Zi Wei Dou Shu</h2>
      <p style="margin:0 0 8px; font-size:12px; color:#50545E;">
        ${escapeHtml(m.chinese || '')} · Soul: <strong>${escapeHtml(m.soul || '—')}</strong> · Body: <strong>${escapeHtml(m.body || '—')}</strong> · Five Elements: <strong>${escapeHtml(m.fiveElements || '—')}</strong>
      </p>
      ${renderChartEmbed(chart, 'Ming')}
      <p style="margin:0 0 8px; font-size:11px; color:#8A8E98;">
        The chart shows the twelve palaces on the classical board. The Fate palace is highlighted with its
        三方四正 influences: the mirror palace directly opposite (6 branches across) and the two trine palaces (4 apart).
      </p>
      ${renderZiweiFullReport(ziweiFull)}
    </div>`;
}

// ── Three Blessings ─────────────────────────────────────────────────

function renderThreeBlessingsSection(tb) {
  if (!tb) return '';
  const blessing = (b) => `
    <td style="vertical-align:top; padding:10px; border:1px solid #E4E5EA; width:33%;">
      <div style="font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#8A8E98;">${escapeHtml(b.position.name)} — ${escapeHtml(b.position.label)}</div>
      <div style="font-family: 'Fraunces', Georgia, serif; font-size:14px; color:#14161B; margin-top:4px;">${escapeHtml(b.card?.name || '—')}${b.isIdeal ? ' <span style="color:#E63329;">★</span>' : ''}</div>
      <div style="font-size:11px; color:#50545E; margin-top:6px; line-height:1.5;">${escapeHtml(b.personalLine || '')}</div>
    </td>`;
  return `
    <div style="margin: 0 0 28px;">
      <h2 style="font-family: 'Fraunces', Georgia, 'Times New Roman', serif; font-size:26px; font-weight:600; letter-spacing:-0.01em; margin:0 0 14px; color:#14161B;">Three Blessings</h2>
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
        <tr>${blessing(tb.phuc)}${blessing(tb.loc)}${blessing(tb.tho)}</tr>
      </table>
    </div>`;
}

// ── Fire Horse 2026 forecast ────────────────────────────────────────

function renderFireHorseSection(fh) {
  if (!fh) {
    return `
      <div style="margin: 0 0 28px;">
        <h2 style="font-family: 'Fraunces', Georgia, 'Times New Roman', serif; font-size:26px; font-weight:600; letter-spacing:-0.01em; margin:0 0 14px; color:#14161B;">Year of the Fire Horse — 2026 Forecast</h2>
        <p style="margin:0; font-size:13px; color:#50545E; font-style:italic;">Forecast unavailable — sign / element could not be resolved from the birthday provided.</p>
      </div>`;
  }
  const yearColor = BAND_COLOR[fh.yearBand?.tone] || '#444';
  const sn = fh.signNarrative;
  const dm = fh.dayMaster;
  const monthRow = (m) => {
    const lm = fh.lunarMonths.find((x) => x.index === m.month);
    const band = BAND_FOR(m.score);
    return `
      <li style="margin:0 0 6px; font-size:12px; color:#2A2D35;">
        <strong>${escapeHtml(lm?.stem_branch || '')}</strong>
        ${lm ? `<span style="color:#8A8E98;"> · ${escapeHtml(lm.begin)} → ${escapeHtml(lm.end)}</span>` : ''}
        <span style="color:#50545E;"> · ${m.score.toFixed(2)} · ${escapeHtml(band.short)}</span>
      </li>`;
  };

  return `
    <div style="margin: 0 0 28px;">
      <h2 style="font-family: 'Fraunces', Georgia, 'Times New Roman', serif; font-size:26px; font-weight:600; letter-spacing:-0.01em; margin:0 0 14px; color:#14161B;">Year of the Fire Horse — 2026 Forecast</h2>
      <p style="margin:0 0 10px; font-size:12px; letter-spacing:0.04em; text-transform:uppercase; color:#8A8E98;">
        ${escapeHtml(SIGN_LABEL[fh.sign])} · ${escapeHtml(ELEMENT_LABEL[fh.effectiveElement])}${dm ? ` · Day Master ${escapeHtml(dm.en)}` : ''}
      </p>

      <div style="display:inline-block; padding:8px 12px; background:#EFEFF2; border-left:3px solid ${yearColor}; border-radius:4px; margin: 0 0 12px;">
        <span style="font-family: 'Fraunces', Georgia, serif; font-size:20px; color:#14161B;">${fh.yearScore.toFixed(2)}</span>
        <span style="font-size:12px; color:${yearColor}; margin-left:8px; font-weight:600;">${escapeHtml(fh.yearBand?.label || '')}</span>
      </div>

      ${sn ? `
        <p style="margin:6px 0; font-family: 'Fraunces', Georgia, serif; font-style:italic; font-size:14px; color:#14161B;">&ldquo;${escapeHtml(sn.headline)}&rdquo;</p>
        <p style="margin:6px 0 12px; font-size:13px; line-height:1.55; color:#2A2D35;">${escapeHtml(sn.lead)}</p>
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin: 0 0 12px;">
          <tr>
            <td style="vertical-align:top; padding:8px 10px; border:1px solid #E4E5EA; width:33%;">
              <div style="font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#8A8E98;">Career</div>
              <p style="margin:6px 0 0; font-size:12px; line-height:1.5; color:#2A2D35;">${escapeHtml(sn.career)}</p>
            </td>
            <td style="vertical-align:top; padding:8px 10px; border:1px solid #E4E5EA; width:33%;">
              <div style="font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#8A8E98;">Money</div>
              <p style="margin:6px 0 0; font-size:12px; line-height:1.5; color:#2A2D35;">${escapeHtml(sn.money)}</p>
            </td>
            <td style="vertical-align:top; padding:8px 10px; border:1px solid #E4E5EA; width:33%;">
              <div style="font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#8A8E98;">Love</div>
              <p style="margin:6px 0 0; font-size:12px; line-height:1.5; color:#2A2D35;">${escapeHtml(sn.love)}</p>
            </td>
          </tr>
        </table>
        <p style="margin:6px 0 12px; font-size:13px; color:#2A2D35;"><strong>This year's advice:</strong> ${escapeHtml(sn.advice)}</p>
      ` : ''}

      ${dm?.narrative ? `
        <div style="margin: 12px 0; padding: 10px 12px; background:#F1F1F4; border-left:3px solid #50545E; border-radius:4px;">
          <div style="font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#8A8E98; margin-bottom:4px;">Day Master overlay · ${escapeHtml(dm.narrative.ten_gods)}</div>
          <p style="margin:0 0 6px; font-family: 'Fraunces', Georgia, serif; font-size:14px; color:#14161B;">${escapeHtml(dm.narrative.headline)}</p>
          <p style="margin:6px 0 0; font-size:12px; line-height:1.55; color:#2A2D35;">${escapeHtml(dm.narrative.extended)}</p>
          <p style="margin:8px 0 0; font-size:12px; color:#2A2D35;"><strong>Day Master advice:</strong> ${escapeHtml(dm.narrative.advice)}</p>
        </div>
      ` : ''}

      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin: 8px 0 0;">
        <tr>
          <td style="vertical-align:top; padding:10px 12px; border:1px solid #E4E5EA; width:50%;">
            <div style="font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#8A8E98; margin-bottom:6px;">Best windows</div>
            <ul style="margin:0; padding-left:18px;">${fh.bestMonths.map(monthRow).join('')}</ul>
          </td>
          <td style="vertical-align:top; padding:10px 12px; border:1px solid #E4E5EA; width:50%;">
            <div style="font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#8A8E98; margin-bottom:6px;">Hardest windows</div>
            <ul style="margin:0; padding-left:18px;">${fh.worstMonths.map(monthRow).join('')}</ul>
          </td>
        </tr>
      </table>
    </div>`;
}

// ── Compatibility ──────────────────────────────────────────────────

// Indicator → colour + verb for the Wu Xing element dynamic.
const INDICATOR = {
  Constructive: { color: '#2A8A48', bg: '#EAF6EE' },
  Destructive:  { color: '#E63329', bg: '#FFF4F2' },
  Neutral:      { color: '#B8893A', bg: '#EFEFF2' },
};

function ratingMeter(compat, color) {
  const pct = compat.rating != null ? Math.max(0, Math.min(100, Math.round(compat.rating))) : null;
  return `
    <div style="margin:0 0 18px;">
      <div style="margin:0 0 6px;">
        <span style="font-family: 'Fraunces', Georgia, serif; font-size:30px; color:#14161B;">${pct != null ? pct + '%' : '—'}</span>
        ${compat.tier ? `<span style="font-size:12px; color:#fff; background:${color}; margin-left:8px; padding:2px 10px; border-radius:999px;">${escapeHtml(compat.tier.name)}</span>` : ''}
      </div>
      <div style="background:#EFEFF2; border-radius:999px; height:10px; overflow:hidden;">
        <div style="width:${pct != null ? pct : 0}%; height:10px; background:${color}; border-radius:999px;"></div>
      </div>
    </div>`;
}

// Standard Wu Xing star layout: Wood top, then clockwise. Consecutive nodes
// form the generating (sheng) pentagon; the diagonals are the controlling
// (ke) cycle. We draw the faint pentagon plus one bold arrow for this pair's
// actual relationship. SVG renders in the on-screen iframe and most email
// clients; where it is stripped, the text label below still carries the point.
const WUXING_NODES = {
  Wood: { x: 100, y: 27 }, Fire: { x: 171, y: 79 }, Earth: { x: 144, y: 162 },
  Metal: { x: 56, y: 162 }, Water: { x: 29, y: 79 },
};
function elementCycleSvg(primary, partner, rel, toneColor) {
  const order = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
  const R = 17;
  const pts = order.map((e) => `${WUXING_NODES[e].x},${WUXING_NODES[e].y}`).join(' ');
  const on = new Set([primary, partner]);
  const nodes = order.map((e) => {
    const n = WUXING_NODES[e];
    const hot = on.has(e);
    return `<circle cx="${n.x}" cy="${n.y}" r="${R}" fill="${hot ? ELEMENT_HEX[e] : '#efe9df'}" stroke="${hot ? ELEMENT_HEX[e] : '#e0d8ca'}" stroke-width="${hot ? 2 : 1}"/>`
      + `<text x="${n.x}" y="${n.y + 3}" text-anchor="middle" font-size="8.5" font-family="Helvetica,Arial,sans-serif" fill="${hot ? '#ffffff' : '#8A8E98'}">${e}</text>`;
  }).join('');
  let arrow = '';
  if (rel && rel.from !== rel.to && WUXING_NODES[rel.from] && WUXING_NODES[rel.to]) {
    const a = WUXING_NODES[rel.from], b = WUXING_NODES[rel.to];
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    const x1 = (a.x + ux * (R + 2)).toFixed(1), y1 = (a.y + uy * (R + 2)).toFixed(1);
    const x2 = (b.x - ux * (R + 7)).toFixed(1), y2 = (b.y - uy * (R + 7)).toFixed(1);
    arrow = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${toneColor}" stroke-width="2.5" marker-end="url(#wx-ar)"/>`;
  }
  return `<svg viewBox="0 0 200 189" width="180" height="170" xmlns="http://www.w3.org/2000/svg" style="display:block;">
    <defs><marker id="wx-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="${toneColor}"/></marker></defs>
    <polygon points="${pts}" fill="none" stroke="#e0d8ca" stroke-width="1" stroke-dasharray="3 3"/>
    ${arrow}${nodes}
  </svg>`;
}

function elementDynamicBlock(dyn) {
  if (!dyn) return '';
  const ind = INDICATOR[dyn.indicator] || INDICATOR.Neutral;
  const rel = elementRelation(dyn.primary, dyn.partner);
  const label = rel
    ? `${dyn.indicator} · ${rel.from} ${rel.verb} ${rel.to}`
    : dyn.indicator;
  const chip = (el) => `<span style="display:inline-block; padding:3px 12px; border-radius:999px; background:${ELEMENT_HEX[el] || '#9a9990'}; color:#fff; font-size:12px;">${escapeHtml(el)}</span>`;
  return `
    <div style="margin:0 0 16px; padding:12px 14px; background:${ind.bg}; border:1px solid #E4E5EA; border-left:3px solid ${ind.color}; border-radius:6px;">
      <div style="font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#8A8E98; margin:0 0 10px;">The elemental dynamic</div>
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
        <tr>
          <td width="190" style="vertical-align:middle; padding:0 14px 0 0;">${elementCycleSvg(dyn.primary, dyn.partner, rel, ind.color)}</td>
          <td style="vertical-align:middle;">
            <div style="margin:0 0 8px;">
              ${chip(dyn.primary)}
              <span style="font-size:12px; color:${ind.color}; margin:0 8px; white-space:nowrap;">${escapeHtml(label)}</span>
              ${chip(dyn.partner)}
            </div>
            <p style="margin:0; font-size:13px; line-height:1.55; color:#2A2D35;">${escapeHtml(dyn.description || '')}</p>
          </td>
        </tr>
      </table>
    </div>`;
}

function yinYangBar(yin, yang) {
  if (yin == null && yang == null) return '';
  const total = (yin || 0) + (yang || 0) || 1;
  const yinPct = Math.round(((yin || 0) / total) * 100);
  return `
    <div style="margin:0 0 16px;">
      <div style="font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#8A8E98; margin:0 0 6px;">Yin &amp; Yang balance</div>
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; border-radius:6px; overflow:hidden;">
        <tr>
          <td style="width:${yinPct}%; background:#2A2D35; color:#fff; font-size:11px; padding:5px 8px;">Yin · ${yin ?? 0}</td>
          <td style="width:${100 - yinPct}%; background:#E4E5EA; color:#2A2D35; font-size:11px; padding:5px 8px; text-align:right;">Yang · ${yang ?? 0}</td>
        </tr>
      </table>
    </div>`;
}

function renderCompatibilitySection(compat, subjectName, partnerName, relationshipHeader) {
  if (!compat) return '';
  const color = TONE_COLORS[compat.tier?.tone] || '#444';
  const n1 = subjectName || compat.person1?.sign || 'Person 1';
  const n2 = partnerName || compat.person2?.sign || 'Person 2';

  const block = (label, body) => body ? `
    <div style="margin: 0 0 12px;">
      <div style="font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#8A8E98;">${escapeHtml(label)}</div>
      <p style="margin:4px 0 0; font-size:13px; line-height:1.55; color:#2A2D35;">${escapeHtml(body)}</p>
    </div>` : '';

  const toneCard = (label, body, tone) => body ? `
    <td width="50%" style="vertical-align:top; padding:0 6px;">
      <div style="background:${tone === 'good' ? '#EAF6EE' : '#FFF4F2'}; border-radius:8px; padding:12px 14px;">
        <div style="font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:${tone === 'good' ? '#2A8A48' : '#E63329'}; margin:0 0 5px;">${escapeHtml(label)}</div>
        <p style="margin:0; font-size:13px; line-height:1.55; color:#2A2D35;">${escapeHtml(body)}</p>
      </div>
    </td>` : '<td width="50%"></td>';

  // Shared axis so the three element panels compare honestly.
  const sharedMax = Math.max(4, ...ELEMENT_ORDER.flatMap((e) => [
    compat.person1?.elements?.[e] || 0,
    compat.person2?.elements?.[e] || 0,
    compat.combinedElements?.[e] || 0,
  ]));

  return `
    <div style="margin: 0 0 28px;">
      <h2 style="font-family: 'Fraunces', Georgia, 'Times New Roman', serif; font-size:26px; font-weight:600; letter-spacing:-0.01em; margin:0 0 14px; color:#14161B;">Compatibility</h2>
      ${relationshipHeader || ''}
      ${ratingMeter(compat, color)}

      <div style="font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#8A8E98; margin:0 0 8px;">Five-element balance</div>
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin:0 0 16px;">
        <tr>
          <td width="33%" style="vertical-align:top; padding:0 5px 0 0;">${elementBarsPanel(n1, compat.person1?.elements, sharedMax)}</td>
          <td width="34%" style="vertical-align:top; padding:0 5px;">${elementBarsPanel(n2, compat.person2?.elements, sharedMax)}</td>
          <td width="33%" style="vertical-align:top; padding:0 0 0 5px;">${elementBarsPanel('Together', compat.combinedElements, sharedMax)}</td>
        </tr>
      </table>

      ${elementDynamicBlock(compat.elementDynamic)}
      ${yinYangBar(compat.yin, compat.yang)}

      ${block('General match',  compat.generalMatchDescription)}
      ${block('Yin & Yang',     compat.yinYangDescription)}

      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin:0 -6px 12px;">
        <tr>
          ${toneCard('The Good', compat.theGood, 'good')}
          ${toneCard('The Not-So-Good', compat.theNotSoGood, 'bad')}
        </tr>
      </table>

      ${block('Romance', compat.romance)}
      ${block('In Bed',  compat.sex)}

      ${compat.soulMate ? `
        <div style="margin: 0 0 12px; padding: 10px 12px; background:#F1F1F4; border-left:3px solid #E63329; border-radius:4px;">
          <div style="font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#8A8E98; margin-bottom:4px;">Soul mate · ${compat.soulMate.isMatch ? 'Match' : 'Not the listed match'}</div>
          <p style="margin:0; font-size:13px; line-height:1.55; color:#2A2D35;">${escapeHtml(compat.soulMate.description || '')}</p>
        </div>` : ''}
      ${compat.elementStrength?.conclusion ? `
        <p style="margin:0; font-size:13px; color:#2A2D35;"><strong>Combined element strength (${escapeHtml(compat.elementStrength.element)}):</strong> ${escapeHtml(compat.elementStrength.conclusion)}</p>` : ''}
    </div>`;
}

// ── Wrapper ─────────────────────────────────────────────────────────

/**
 * Build the full Quick Reading email HTML from a `reading` object (output
 * of buildQuickReading). The email shows whichever sections are populated;
 * sections set to undefined are skipped.
 */
export function buildQuickReadingHtml(reading) {
  const { subject, partner } = reading;
  const subjectName = subject.name || 'this person';
  const birthLine = [
    subject.birthday,
    subject.birthTime,
    subject.birthPlace,
    subject.gender,
    subject.zodiacAnimal ? `Year of the ${subject.zodiacAnimal}` : null,
  ].filter(Boolean).join(' · ');

  // The two people, side by side, shown ONLY inside the Compatibility
  // (relationship) section. Every other report is about the subject alone,
  // so this never sits on their headers.
  const compat = reading.compatibility;
  const personCard = (name, sign, element, gender, birthday, birthTime) => {
    const el = element ? `<span style="color:${ELEMENT_HEX[element] || '#50545E'};">${escapeHtml(element)}</span>` : '';
    const meta = [sign ? escapeHtml(sign) : null, el || null, gender ? escapeHtml(GENDER_GLYPH[gender] || gender) : null].filter(Boolean).join(' · ');
    const birth = [birthday, birthTime].filter(Boolean).join(' · ');
    return `
      <td width="42%" style="vertical-align:top; text-align:center; padding:4px 8px;">
        <div style="font-size:30px; line-height:1;">${ANIMAL_EMOJI[sign] || '✦'}</div>
        <div style="font-family: 'Fraunces', Georgia, 'Times New Roman', serif; font-size:16px; color:#14161B; margin-top:4px;">${escapeHtml(name || 'Unnamed')}</div>
        <div style="font-size:12px; color:#50545E; margin-top:1px;">${meta}</div>
        ${birth ? `<div style="font-size:11px; color:#8A8E98;">${escapeHtml(birth)}</div>` : ''}
      </td>`;
  };
  const relationshipCards = compat ? `
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin:0 0 18px;">
      <tr>
        ${personCard(subject.name, compat.person1?.sign || subject.zodiacAnimal, compat.person1?.signElement, subject.gender, subject.birthday, subject.birthTime)}
        <td width="16%" style="text-align:center; vertical-align:middle;"><span style="font-family: 'Fraunces', Georgia, serif; font-size:22px; color:#E63329;">&times;</span></td>
        ${personCard(partner?.name, compat.person2?.sign, compat.person2?.signElement, partner?.gender, partner?.birthday, partner?.birthTime)}
      </tr>
    </table>` : '';

  // One tab per included reading, rendered top-right. The bar is hidden by
  // default and enabled by the script below, so email clients (no JS) show
  // every section in sequence while browsers get switchable tabs.
  const sections = [
    { key: 'bazi',           tab: 'Four Pillars',    html: reading.bazi           !== undefined ? renderBaziSection(reading.bazi) : null },
    { key: 'ziwei',          tab: 'Zi Wei',          html: reading.ziwei          !== undefined ? renderZiweiSection(reading.ziwei, reading.ziweiFull) : null },
    { key: 'threeBlessings', tab: 'Three Blessings', html: reading.threeBlessings !== undefined ? renderThreeBlessingsSection(reading.threeBlessings) : null },
    { key: 'fireHorse',      tab: 'Fire Horse',      html: reading.fireHorse      !== undefined ? renderFireHorseSection(reading.fireHorse) : null },
    { key: 'compatibility',  tab: 'Compatibility',   html: reading.compatibility  !== undefined ? renderCompatibilitySection(reading.compatibility, subject.name || null, partner?.name, relationshipCards) : null },
  ].filter((s) => s.html !== null);

  const tabBar = `<div id="qr-tabs">
    ${sections.map((s, i) => `<button type="button" data-tab="${s.key}"${i === 0 ? ' class="on"' : ''}>${escapeHtml(s.tab)}</button>`).join('')}
  </div>`;

  const sectionHtml = sections
    .map((s) => `<div class="qr-sec" data-sec="${s.key}">${s.html}</div>`)
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Quick reading — ${escapeHtml(subjectName)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');
    #qr-tabs{display:none;position:sticky;top:0;z-index:30;justify-content:flex-end;flex-wrap:wrap;gap:6px;padding:10px 16px;background:rgba(255,255,255,0.97);border-bottom:1px solid #E4E5EA}
    #qr-tabs button{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;padding:6px 14px;border-radius:999px;border:1px solid #E4E5EA;background:#fff;color:#2A2D35;cursor:pointer}
    #qr-tabs button.on{background:#14161B;color:#fff;border-color:#14161B}
  </style>
  ${reading.ziwei ? `<style>${CHART_CSS}.psc-chart .chart{max-width:900px}</style>` : ''}
</head>
<body style="margin:0; padding:0; background:#F1F1F4; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#14161B;">
  ${tabBar}
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F1F1F4;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:1000px; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding:24px 28px 18px; border-bottom:1px solid #E4E5EA;">
              <p style="margin:0 0 6px; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#50545E;">Mahjong Tarot · Quick reading</p>
              <h1 style="margin:0; font-family: 'Fraunces', Georgia, 'Times New Roman', serif; font-size:22px; line-height:1.3; color:#14161B;">Reading for ${escapeHtml(subjectName)}</h1>
              <p style="margin:6px 0 0; font-size:12px; color:#50545E;">${escapeHtml(birthLine)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 12px;">
              ${sectionHtml}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:14px 28px 22px; font-size:11px; color:#8A8E98; border-top:1px solid #E4E5EA;">
              Generated from <a href="https://mahjongtarot.com" style="color:#8A8E98; text-decoration:none;">mahjongtarot.com</a> · For practitioner reference only.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <script>(function(){
    var bar=document.getElementById('qr-tabs');if(!bar)return;
    var secs=[].slice.call(document.querySelectorAll('.qr-sec'));
    if(secs.length<2)return;
    bar.style.display='flex';
    var btns=[].slice.call(bar.querySelectorAll('button'));
    function show(k){
      secs.forEach(function(s){s.style.display=(s.getAttribute('data-sec')===k)?'':'none';});
      btns.forEach(function(b){b.className=b.getAttribute('data-tab')===k?'on':'';});
      window.scrollTo(0,0);
    }
    btns.forEach(function(b){b.addEventListener('click',function(){show(b.getAttribute('data-tab'));});});
    show(secs[0].getAttribute('data-sec'));
  })();</script>
</body>
</html>`;
}
