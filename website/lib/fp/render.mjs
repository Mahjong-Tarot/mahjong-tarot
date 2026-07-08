// Four Pillars (Life Cycle) reading -> email-safe HTML.
//
// Themed to the member Almanac (components/AlmanacView.module.css): white
// surfaces, slate-ink text, #E4E5EA hairlines, Fraunces serif numbers/headings,
// and the Almanac's luck/tone scale rather than per-element colours —
// auspicious (green) / favorable / neutral (grey) / cautionary / challenging
// (fire-red), with soft top-fade gradient card backgrounds. A stage's tone comes
// from its Chi level, so the life-cycle graphic reads as an arc of fortune.
// Elements are shown as plain text, Almanac-style. Table-based inline styles so
// it survives email clients; hex hardcoded from the design tokens.
//
// Consumes the `reading` object from engine.mjs buildFourPillarsReading().

const C = {
  ink: '#14161B', ink2: '#2A2D35', ink3: '#50545E', ink4: '#8A8E98',
  paper: '#FFFFFF', rule: '#E4E5EA', rule2: '#EFEFF2', fill: '#F5F5F7',
  fire: '#E63329', gold: '#B8893A',
  serif: "'Fraunces','Iowan Old Style',Georgia,serif",
  sans: "'Inter',ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif",
};

// The Almanac tone scale (colours + gradients lifted from AlmanacView.module.css).
const TONE = {
  auspicious:  { label: 'Auspicious',  bar: '#2c8a4a', text: '#1e6334', chip: '#e8f5e8', grad: 'linear-gradient(180deg,#e8f5e8 0%,#ffffff 72%)' },
  favorable:   { label: 'Favorable',   bar: '#5a9a3a', text: '#3f6f28', chip: '#f0f7e8', grad: 'linear-gradient(180deg,#f0f7e8 0%,#ffffff 72%)' },
  neutral:     { label: 'Neutral',     bar: '#8A8E98', text: '#50545E', chip: '#EFEFF2', grad: '#F5F5F7' },
  cautionary:  { label: 'Cautionary',  bar: '#B8893A', text: '#8a5f1a', chip: '#faf0e8', grad: 'linear-gradient(180deg,#faf0e8 0%,#ffffff 72%)' },
  challenging: { label: 'Challenging', bar: '#C8261C', text: '#9E1B14', chip: '#fbe9e7', grad: 'linear-gradient(180deg,#f5e8e8 0%,#ffffff 72%)' },
};

const ANIMAL_EMOJI = {
  Rat: '🐀', Ox: '🐂', Tiger: '🐅', Rabbit: '🐇', Dragon: '🐉', Snake: '🐍',
  Horse: '🐎', Sheep: '🐐', Monkey: '🐒', Rooster: '🐓', Dog: '🐕', Pig: '🐖',
};
const ELEMENT_ORDER = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
const STAGE_AGES = { Birth: '0–6', Youth: '6–22', Maturation: '21–35', Adulthood: '35–60', Retirement: '60+' };
const FORCE_LABEL = {
  fate: 'Fate', wealth: 'Wealth', opportunity: 'Opportunity', happiness: 'Happiness', recognition: 'Recognition',
};

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const microLabel = (t) =>
  `<div style="font-family:${C.sans}; font-size:10px; letter-spacing:0.09em; text-transform:uppercase; color:${C.ink4}; margin:0 0 6px;">${escapeHtml(t)}</div>`;

// Pull the chi descriptor ("low normal", "strong", ...) out of the narrative.
function chiLevel(chiText) {
  const m = /this is an?\s+(.+?)\s+chi period/i.exec(chiText || '');
  return m ? m[1] : null;
}

// Map a stage's Chi level (and count as fallback) to an Almanac tone.
function toneForChi(level, count) {
  const l = (level || '').toLowerCase();
  if (/very low|extremely low|weak/.test(l)) return 'challenging';
  if (/high normal/.test(l)) return 'favorable';
  if (/low normal/.test(l)) return 'neutral';
  if (/\blow\b/.test(l)) return 'cautionary';
  if (/strong|very high|extremely high|very strong/.test(l)) return 'auspicious';
  if (/\bhigh\b/.test(l)) return 'favorable';
  if (/normal/.test(l)) return 'neutral';
  if (count >= 5) return 'auspicious';
  if (count === 4) return 'favorable';
  if (count <= 1) return 'cautionary';
  return 'neutral';
}

const toneChip = (t, text) =>
  `<span style="display:inline-block; padding:3px 11px; border-radius:999px; background:${t.chip}; color:${t.text}; font-size:11px; font-family:${C.sans};">${escapeHtml(text)}</span>`;

// ── Year-sign masthead ─────────────────────────────────────────────────────
function yearSignCard(ys, name) {
  const emoji = ANIMAL_EMOJI[ys.animal] || '';
  const meta = [
    `Year element ${ys.element}`,
    ys.fixedElement ? `fixed element ${ys.fixedElement}` : null,
  ].filter(Boolean).join(' · ');
  return `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin:0 0 20px;">
    <tr>
      <td width="72" valign="middle" style="font-size:44px; line-height:1; text-align:center; padding-right:14px;">${emoji}</td>
      <td valign="middle">
        ${name ? `<div style="font-size:12px; color:${C.ink3}; margin:0 0 4px;">${escapeHtml(name)}</div>` : ''}
        <div style="font-family:${C.serif}; font-size:26px; color:${C.ink}; line-height:1.1;">${escapeHtml(ys.combined)}</div>
        <div style="font-size:12px; color:${C.ink4}; margin:6px 0 0;">${escapeHtml(meta)}</div>
      </td>
    </tr>
  </table>`;
}

// ── Signature graphic: the life-cycle fortune "skyline" ─────────────────────
// Five stages left→right; each bar's height is its Chi rating and its colour is
// the stage's Almanac tone, so the row reads as an arc of fortune across a life.
function chiTimeline(stages) {
  const MAXBAR = 96;
  const scale = Math.max(5, ...stages.map((s) => s.count));
  const col = (s) => {
    const level = chiLevel(s.chi);
    const t = TONE[toneForChi(level, s.count)];
    const barPx = Math.max(6, Math.round((s.count / scale) * MAXBAR));
    return `<td width="20%" valign="bottom" style="text-align:center; padding:0 4px;">
      <div style="font-family:${C.serif}; font-size:15px; color:${C.ink}; margin:0 0 3px;">${s.count}</div>
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;"><tr>
        <td height="${MAXBAR}" valign="bottom" style="height:${MAXBAR}px;"><div style="height:${barPx}px; background:${t.bar}; border-radius:4px 4px 0 0;"></div></td>
      </tr></table>
      <div style="border-top:2px solid ${t.bar}; margin:4px 0 5px;"></div>
      <div style="font-size:11px; color:${C.ink}; font-weight:600;">${escapeHtml(s.stage)}</div>
      <div style="font-size:10px; color:${C.ink4}; margin:1px 0 3px;">${escapeHtml(STAGE_AGES[s.stage] || '')}</div>
      <div style="font-size:10px; color:${C.ink3};">${escapeHtml(s.element)}</div>
      ${level ? `<div style="font-size:10px; color:${t.text}; margin-top:2px;">${escapeHtml(level)}</div>` : ''}
    </td>`;
  };
  return `<div style="margin:0 0 22px;">
    ${microLabel('Your life-cycle chi')}
    <div style="background:${C.paper}; border:1px solid ${C.rule}; border-radius:14px; padding:16px 12px 12px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;"><tr>${stages.map(col).join('')}</tr></table>
    </div>
  </div>`;
}

// ── Five-element balance (monochrome, Almanac-style; dominant in gold) ───────
function elementBalance(counts, code) {
  const max = Math.max(4, ...ELEMENT_ORDER.map((e) => counts?.[e] || 0));
  const dominantVal = Math.max(...ELEMENT_ORDER.map((e) => counts?.[e] || 0));
  const rows = ELEMENT_ORDER.map((el) => {
    const v = counts?.[el] || 0;
    const pct = Math.round((v / max) * 100);
    const isDom = v === dominantVal && v > 0;
    const fill = isDom ? C.gold : C.ink4;
    return `<tr>
      <td style="width:46px; font-size:11px; color:${C.ink3}; padding:4px 6px 4px 0; white-space:nowrap;">${el}</td>
      <td style="padding:4px 0;"><div style="background:${C.rule2}; border-radius:3px; height:11px;"><div style="width:${pct}%; height:11px; background:${fill}; border-radius:3px;${v === 0 ? ' opacity:0.3;' : ''}"></div></div></td>
      <td style="width:18px; text-align:right; font-size:11px; color:${isDom ? C.ink : C.ink3}; font-weight:${isDom ? 600 : 400}; padding:4px 0 4px 6px;">${v}</td>
    </tr>`;
  }).join('');
  return `<div style="margin:0 0 22px;">
    ${microLabel(`Five-element balance · mix ${escapeHtml(code)}`)}
    <div style="background:${C.paper}; border:1px solid ${C.rule}; border-radius:14px; padding:12px 14px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">${rows}</table>
    </div>
  </div>`;
}

// ── Per-stage detail cards (Almanac tone treatment) ─────────────────────────
function stageCard(s) {
  const level = chiLevel(s.chi);
  const t = TONE[toneForChi(level, s.count)];
  const force = FORCE_LABEL[s.force] || s.force;
  return `<div style="margin:0 0 14px; padding:15px 16px; background:${t.grad}; border:1px solid ${C.rule}; border-left:4px solid ${t.bar}; border-radius:14px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin:0 0 9px;"><tr>
      <td valign="middle"><span style="font-family:${C.serif}; font-size:18px; color:${C.ink};">${escapeHtml(s.stage)}</span><span style="font-size:11px; color:${C.ink4}; margin-left:8px;">${escapeHtml(STAGE_AGES[s.stage] || '')}</span></td>
      <td valign="middle" align="right">${toneChip(t, level ? level.replace(/^\w/, (c) => c.toUpperCase()) : t.label)}<span style="font-size:11px; color:${C.ink3}; margin-left:8px;">${escapeHtml(s.element)} · ${escapeHtml(force)}</span></td>
    </tr></table>
    ${s.chi ? `<p style="margin:0 0 8px; font-size:13px; line-height:1.55; color:${C.ink2};">${escapeHtml(s.chi)}</p>` : ''}
    ${s.chiDelta ? `<p style="margin:0 0 8px; font-size:12px; line-height:1.5; color:${C.ink3}; font-style:italic;">${escapeHtml(s.chiDelta)}</p>` : ''}
    ${s.fate ? `<div style="margin:8px 0 0; padding:9px 11px; background:${C.paper}; border:1px solid ${C.rule}; border-radius:10px;">${microLabel('Fate · ' + force)}<p style="margin:0; font-size:12.5px; line-height:1.5; color:${C.ink2};">${escapeHtml(s.fate)}</p></div>` : ''}
  </div>`;
}

// ── Year-sign narrative ─────────────────────────────────────────────────────
function miniCard(label, body) {
  if (!body) return '';
  return `<div style="background:${C.fill}; border:1px solid ${C.rule}; border-radius:14px; padding:10px 12px; height:100%;">${microLabel(label)}<p style="margin:0; font-size:12px; line-height:1.5; color:${C.ink2};">${escapeHtml(body)}</p></div>`;
}

function yearSignNarrative(ys) {
  const t = ys.traits || {};
  const years = ys.years || {};
  const block = (label, body) => body ? `<div style="margin:0 0 12px;">${microLabel(label)}<p style="margin:0; font-size:13px; line-height:1.55; color:${C.ink2};">${escapeHtml(body)}</p></div>` : '';
  const lifeYears = (years.early || years.middle || years.late) ? `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin:0 0 12px;"><tr>
      <td width="33%" valign="top" style="padding:0 5px 0 0;">${miniCard('Early years', years.early)}</td>
      <td width="34%" valign="top" style="padding:0 5px;">${miniCard('Middle years', years.middle)}</td>
      <td width="33%" valign="top" style="padding:0 0 0 5px;">${miniCard('Later years', years.late)}</td>
    </tr></table>` : '';
  return `<div style="margin:0 0 24px;">
    <h2 style="font-family:${C.serif}; font-size:18px; margin:0 0 12px; color:${C.ink};">Your ${escapeHtml(ys.animal)} sign</h2>
    ${block('Defining characteristics', t.defining)}
    ${ys.personality ? block(ys.combined, ys.personality) : ''}
    ${lifeYears}
    ${t.positive ? block('Strengths', t.positive) : ''}
    ${t.negative ? block('Watch-outs', t.negative) : ''}
  </div>`;
}

// ── Public: the reading body fragment ──────────────────────────────────────
export function renderFourPillarsReading(reading, opts = {}) {
  if (!reading) return '';
  const name = opts.name || null;
  return `<div style="font-family:${C.sans}; margin:0 0 28px;">
    <h2 style="font-family:${C.serif}; font-size:18px; margin:0 0 14px; color:${C.ink};">Four Pillars · Life Cycle</h2>
    ${yearSignCard(reading.yearSign, name)}
    ${chiTimeline(reading.stages)}
    ${elementBalance(reading.elementMix.counts, reading.elementMix.code)}
    ${reading.elementMix.conclusion ? `<p style="margin:-14px 2px 22px; font-size:12.5px; line-height:1.5; color:${C.ink3};">${escapeHtml(reading.elementMix.conclusion)}</p>` : ''}
    <div style="margin:0 0 4px;">${microLabel('The five stages of your life')}</div>
    ${reading.stages.map(stageCard).join('')}
    ${reading.conclusion?.desc1 ? `<div style="margin:16px 0 22px; padding:13px 15px; background:${C.fill}; border:1px solid ${C.rule}; border-radius:14px;">${microLabel('In conclusion')}<p style="margin:0; font-size:13px; line-height:1.55; color:${C.ink2};">${escapeHtml(reading.conclusion.desc1)}${reading.conclusion.desc2 ? ' ' + escapeHtml(reading.conclusion.desc2) : ''}</p></div>` : ''}
    ${yearSignNarrative(reading.yearSign)}
  </div>`;
}

// ── Public: a standalone preview page ──────────────────────────────────────
export function renderFourPillarsPage(reading, opts = {}) {
  const name = opts.name || 'Your';
  const birthLine = opts.birthLine || '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Four Pillars — ${escapeHtml(name)}</title></head>
<body style="margin:0; padding:0; background:${C.fill}; font-family:${C.sans}; color:${C.ink};">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${C.fill};"><tr><td align="center" style="padding:24px 16px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:760px; background:${C.paper}; border:1px solid ${C.rule}; border-radius:16px; overflow:hidden;">
      <tr><td style="padding:24px 28px 16px; border-bottom:1px solid ${C.rule};">
        <p style="margin:0 0 6px; font-size:11px; letter-spacing:0.09em; text-transform:uppercase; color:${C.ink4};">Mahjong Tarot · Four Pillars</p>
        <h1 style="margin:0; font-family:${C.serif}; font-size:24px; color:${C.ink};">${escapeHtml(name)}</h1>
        ${birthLine ? `<p style="margin:6px 0 0; font-size:12px; color:${C.ink3};">${escapeHtml(birthLine)}</p>` : ''}
      </td></tr>
      <tr><td style="padding:22px 28px;">${renderFourPillarsReading(reading, { name })}</td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}
