// Renders the multi-section Quick Reading email body. Each section is
// included only when the astrologer ticked its checkbox on the
// /admin/quick-reading page.

import { SIGN_LABEL, ELEMENT_LABEL, BAND_FOR, BAND_COLOR } from './fire-horse';

const TONE_COLORS = {
  great: '#2c8a4a',
  good:  '#3a7bb8',
  mixed: '#b88c4f',
  rough: '#c0392b',
};

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Bazi ────────────────────────────────────────────────────────────

function pillarCell(p, label) {
  if (!p) {
    return `
      <td style="padding:10px 8px; border:1px solid #ece6da; vertical-align:top; text-align:center; color:#9a8f81;">
        <div style="font-size:10px; letter-spacing:0.06em; text-transform:uppercase; color:#9a8f81;">${escapeHtml(label)}</div>
        <div style="font-size:18px; margin-top:6px;">—</div>
      </td>`;
  }
  return `
    <td style="padding:10px 8px; border:1px solid #ece6da; vertical-align:top; text-align:center;">
      <div style="font-size:10px; letter-spacing:0.06em; text-transform:uppercase; color:#9a8f81;">${escapeHtml(label)}</div>
      <div style="font-family: Georgia, 'Times New Roman', serif; font-size:22px; color:#1a1a1a; margin-top:4px;">${escapeHtml(p.gan)}${escapeHtml(p.zhi)}</div>
      <div style="font-size:11px; color:#6b6258; margin-top:4px;">${escapeHtml(p.stem?.en || '')} ${escapeHtml(p.stem?.element || '')}</div>
      <div style="font-size:11px; color:#6b6258;">${escapeHtml(p.branch?.en || '')} · ${escapeHtml(p.branch?.animal || '')}</div>
    </td>`;
}

function renderBaziSection(bazi) {
  if (!bazi) return '';
  const { pillars, elements, dominant } = bazi;
  const elementRow = ['Wood', 'Fire', 'Earth', 'Metal', 'Water']
    .map((e) => `<td style="text-align:center; padding:6px 4px; font-size:12px; color:#2a2a2a;"><strong>${e}</strong><br><span style="color:#6b6258;">${elements?.[e] || 0}</span></td>`)
    .join('');
  return `
    <div style="margin: 0 0 28px;">
      <h2 style="font-family: Georgia, 'Times New Roman', serif; font-size:18px; margin:0 0 10px; color:#1a1a1a;">Bazi — Four Pillars</h2>
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
        <tr>
          ${pillarCell(pillars.year,  'Year')}
          ${pillarCell(pillars.month, 'Month')}
          ${pillarCell(pillars.day,   'Day')}
          ${pillarCell(pillars.hour,  pillars.hasTime ? 'Hour' : 'Hour (no time given)')}
        </tr>
      </table>
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:10px; border:1px solid #ece6da; border-collapse:collapse;">
        <tr>${elementRow}</tr>
      </table>
      ${dominant ? `<p style="margin:8px 0 0; font-size:13px; color:#2a2a2a;"><strong>Dominant element:</strong> ${escapeHtml(dominant)}</p>` : ''}
    </div>`;
}

// ── Zi Wei Dou Shu ──────────────────────────────────────────────────

const LUCK_LABEL = { mostLucky: 'Most Lucky', generallyLucky: 'Generally Lucky', mixed: 'Mixed Luck', generallyUnlucky: 'Generally Unlucky', leastLucky: 'Least Lucky' };
const LUCK_COLOR = { mostLucky: '#2c8a4a', generallyLucky: '#6a9f5a', mixed: '#b88c4f', generallyUnlucky: '#c2693f', leastLucky: '#c0392b' };
const ratingColor = (r) => (/Unfav|Unlucky/.test(r) ? '#c0392b' : r === 'Neutral' ? '#b88c4f' : '#2c8a4a');

// Full fate & luck report (Bill's authored Purple Star narratives),
// rendered with email-safe inline styles.
function renderZiweiFullReport(full) {
  if (!full) return '';
  const h3 = (t) => `<h3 style="font-family: Georgia, 'Times New Roman', serif; font-size:15px; margin:18px 0 4px; color:#1a1a1a;">${t}</h3>`;
  const para = (t) => `<p style="margin:6px 0 0; font-size:12px; line-height:1.55; color:#2a2a2a;">${escapeHtml(t)}</p>`;

  const decadeBlock = (d) => `
    <div style="margin:10px 0; padding:10px 14px; background:#faf6ef; border-left:3px solid ${ratingColor(d.rating)}; border-radius:4px;">
      <div style="font-size:12px; color:#1a1a1a;"><strong>Decade ${escapeHtml(d.index)} — ages ${d.ages[0]}–${d.ages[1]} · ${escapeHtml(d.palace)}</strong>
        <span style="color:${ratingColor(d.rating)}; font-weight:600; margin-left:6px;">${escapeHtml(d.rating)}</span></div>
      ${d.yun ? para(d.yun) : ''}
      ${d.major ? `<p style="margin:6px 0 0; font-size:12px; line-height:1.55; color:#2a2a2a;"><em>Major stars:</em> ${escapeHtml(d.major)}</p>` : ''}
      ${d.period ? `<p style="margin:6px 0 0; font-size:12px; line-height:1.55; color:#2a2a2a;"><em>${d === full.luckiestDecade ? '★ Luckiest decade' : '△ Most challenging decade'}:</em> ${escapeHtml(d.period)}</p>` : ''}
    </div>`;

  const ageItem = (y) => `<li style="margin:0 0 5px; font-size:12px; line-height:1.5; color:#2a2a2a;"><strong>Age ${y.age}</strong> (${escapeHtml(y.palace)}) — ${escapeHtml(y.text || '')}</li>`;
  const ageList = (label, arr) => `
    <div style="margin:10px 0; padding:10px 14px; background:#faf6ef; border-radius:4px;">
      <div style="font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#9a8f81; margin-bottom:6px;">${label}</div>
      <ul style="margin:0; padding-left:18px;">${arr.map(ageItem).join('')}</ul>
    </div>`;
  const ny = full.years?.nextYear;

  const palaceBlock = (p) => `
    <div style="margin:10px 0; padding:10px 14px; border:1px solid #ece6da; border-radius:4px;">
      <div style="font-size:12px; color:#1a1a1a;"><strong>${escapeHtml(p.label)} Palace</strong>
        <span style="color:#9a8f81;"> ${escapeHtml(p.branch)}</span>
        <span style="color:${LUCK_COLOR[p.luck] || '#444'}; font-weight:600; margin-left:6px;">${escapeHtml(LUCK_LABEL[p.luck] || '')}</span></div>
      ${p.conclusion ? para(p.conclusion) : ''}
      ${p.extreme ? `<p style="margin:6px 0 0; font-size:12px; line-height:1.55; color:#2a2a2a;"><em>${escapeHtml(p.extreme)}</em></p>` : ''}
      ${p.fate?.length ? `<ul style="margin:6px 0 0; padding-left:18px;">${p.fate.map((t) => `<li style="margin:0 0 4px; font-size:12px; line-height:1.5; color:#2a2a2a;">${escapeHtml(t)}</li>`).join('')}</ul>` : ''}
    </div>`;

  return `
    <p style="margin:14px 0 0; font-size:13px; color:#2a2a2a;">Your luckiest area of life is your <strong>${escapeHtml(full.luckiestPalace)}</strong> palace; your most challenging is <strong>${escapeHtml(full.unluckiestPalace)}</strong>.</p>
    ${full.genderAssumed ? `<p style="margin:6px 0 0; font-size:11px; color:#9a8f81; font-style:italic;">Gender was not provided — the decade luck cycle assumes male. Set the gender for an exact reading.</p>` : ''}
    ${h3('Part 1 — The decades of your life')}
    ${full.decades.map(decadeBlock).join('')}
    ${full.years ? `
      ${h3('Part 2 — Your years')}
      ${ageList('★ Your 10 luckiest ages', full.years.mostLucky)}
      ${ageList('△ Your 10 most challenging ages', full.years.leastLucky)}
      ${ny ? `
        <div style="margin:10px 0; padding:10px 14px; border:1px solid #ece6da; border-radius:4px;">
          <div style="font-size:12px; color:#1a1a1a;"><strong>The next 12 months — age ${ny.age} (${escapeHtml(ny.palace)})</strong>
            <span style="color:${ratingColor(ny.rating)}; font-weight:600; margin-left:6px;">${escapeHtml(ny.rating)}</span></div>
          ${ny.firstMonths ? para(ny.firstMonths) : ''}
          ${ny.secondMonths ? para(ny.secondMonths) : ''}
        </div>` : ''}
    ` : ''}
    ${h3('Part 3 — The twelve palaces')}
    ${full.palaces.map(palaceBlock).join('')}`;
}

function renderZiweiSection(ziwei, ziweiFull) {
  if (!ziwei) {
    return `
      <div style="margin: 0 0 28px;">
        <h2 style="font-family: Georgia, 'Times New Roman', serif; font-size:18px; margin:0 0 10px; color:#1a1a1a;">Zi Wei Dou Shu</h2>
        <p style="margin:0; font-size:13px; color:#6b6258; font-style:italic;">Birth time not provided — Zi Wei chart skipped. Add the birth time to compute.</p>
      </div>`;
  }
  const palaceCells = ziwei.palaces.slice(0, 12).map((p) => `
    <td style="border:1px solid #ece6da; padding:8px; vertical-align:top; width: 25%; font-size:11px; color:#2a2a2a;">
      <div style="font-weight:600; color:#1a1a1a; font-size:12px;">${escapeHtml(p.name)}${p.isMing ? ' <span style="color:#c8442e;">★</span>' : ''}${p.isBody ? ' <span style="color:#6b6258;">(Body)</span>' : ''}</div>
      <div style="color:#9a8f81; font-size:10px; margin-bottom:4px;">${escapeHtml(p.branchHan || '')}${p.animal ? ' · ' + escapeHtml(p.animal) : ''}</div>
      ${(p.majorStars || []).slice(0, 4).map((s) => `<div>${escapeHtml(s.name)}${s.mutagen ? ` <em style="color:#c8442e;">${escapeHtml(s.mutagen)}</em>` : ''}</div>`).join('')}
    </td>`);
  const rows = [];
  for (let i = 0; i < 12; i += 4) {
    rows.push(`<tr>${palaceCells.slice(i, i + 4).join('')}</tr>`);
  }
  return `
    <div style="margin: 0 0 28px;">
      <h2 style="font-family: Georgia, 'Times New Roman', serif; font-size:18px; margin:0 0 10px; color:#1a1a1a;">Zi Wei Dou Shu</h2>
      <p style="margin:0 0 8px; font-size:12px; color:#6b6258;">
        Soul star: <strong>${escapeHtml(ziwei.soulStar || '—')}</strong> · Body star: <strong>${escapeHtml(ziwei.bodyStar || '—')}</strong> · Five Elements: <strong>${escapeHtml(ziwei.fiveElementsClass || '—')}</strong>
      </p>
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
        ${rows.join('')}
      </table>
      ${renderZiweiFullReport(ziweiFull)}
    </div>`;
}

// ── Three Blessings ─────────────────────────────────────────────────

function renderThreeBlessingsSection(tb) {
  if (!tb) return '';
  const blessing = (b) => `
    <td style="vertical-align:top; padding:10px; border:1px solid #ece6da; width:33%;">
      <div style="font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#9a8f81;">${escapeHtml(b.position.name)} — ${escapeHtml(b.position.label)}</div>
      <div style="font-family: Georgia, serif; font-size:14px; color:#1a1a1a; margin-top:4px;">${escapeHtml(b.card?.name || '—')}${b.isIdeal ? ' <span style="color:#c8442e;">★</span>' : ''}</div>
      <div style="font-size:11px; color:#6b6258; margin-top:6px; line-height:1.5;">${escapeHtml(b.personalLine || '')}</div>
    </td>`;
  return `
    <div style="margin: 0 0 28px;">
      <h2 style="font-family: Georgia, 'Times New Roman', serif; font-size:18px; margin:0 0 10px; color:#1a1a1a;">Three Blessings</h2>
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
        <h2 style="font-family: Georgia, 'Times New Roman', serif; font-size:18px; margin:0 0 10px; color:#1a1a1a;">Year of the Fire Horse — 2026 Forecast</h2>
        <p style="margin:0; font-size:13px; color:#6b6258; font-style:italic;">Forecast unavailable — sign / element could not be resolved from the birthday provided.</p>
      </div>`;
  }
  const yearColor = BAND_COLOR[fh.yearBand?.tone] || '#444';
  const sn = fh.signNarrative;
  const dm = fh.dayMaster;
  const monthRow = (m) => {
    const lm = fh.lunarMonths.find((x) => x.index === m.month);
    const band = BAND_FOR(m.score);
    return `
      <li style="margin:0 0 6px; font-size:12px; color:#2a2a2a;">
        <strong>${escapeHtml(lm?.stem_branch || '')}</strong>
        ${lm ? `<span style="color:#9a8f81;"> · ${escapeHtml(lm.begin)} → ${escapeHtml(lm.end)}</span>` : ''}
        <span style="color:#6b6258;"> · ${m.score.toFixed(2)} · ${escapeHtml(band.short)}</span>
      </li>`;
  };

  return `
    <div style="margin: 0 0 28px;">
      <h2 style="font-family: Georgia, 'Times New Roman', serif; font-size:18px; margin:0 0 10px; color:#1a1a1a;">Year of the Fire Horse — 2026 Forecast</h2>
      <p style="margin:0 0 10px; font-size:12px; letter-spacing:0.04em; text-transform:uppercase; color:#9a8f81;">
        ${escapeHtml(SIGN_LABEL[fh.sign])} · ${escapeHtml(ELEMENT_LABEL[fh.effectiveElement])}${dm ? ` · Day Master ${escapeHtml(dm.en)}` : ''}
      </p>

      <div style="display:inline-block; padding:8px 12px; background:#faf6ef; border-left:3px solid ${yearColor}; border-radius:4px; margin: 0 0 12px;">
        <span style="font-family: Georgia, serif; font-size:20px; color:#1a1a1a;">${fh.yearScore.toFixed(2)}</span>
        <span style="font-size:12px; color:${yearColor}; margin-left:8px; font-weight:600;">${escapeHtml(fh.yearBand?.label || '')}</span>
      </div>

      ${sn ? `
        <p style="margin:6px 0; font-family: Georgia, serif; font-style:italic; font-size:14px; color:#1a1a1a;">&ldquo;${escapeHtml(sn.headline)}&rdquo;</p>
        <p style="margin:6px 0 12px; font-size:13px; line-height:1.55; color:#2a2a2a;">${escapeHtml(sn.lead)}</p>
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin: 0 0 12px;">
          <tr>
            <td style="vertical-align:top; padding:8px 10px; border:1px solid #ece6da; width:33%;">
              <div style="font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#9a8f81;">Career</div>
              <p style="margin:6px 0 0; font-size:12px; line-height:1.5; color:#2a2a2a;">${escapeHtml(sn.career)}</p>
            </td>
            <td style="vertical-align:top; padding:8px 10px; border:1px solid #ece6da; width:33%;">
              <div style="font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#9a8f81;">Money</div>
              <p style="margin:6px 0 0; font-size:12px; line-height:1.5; color:#2a2a2a;">${escapeHtml(sn.money)}</p>
            </td>
            <td style="vertical-align:top; padding:8px 10px; border:1px solid #ece6da; width:33%;">
              <div style="font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#9a8f81;">Love</div>
              <p style="margin:6px 0 0; font-size:12px; line-height:1.5; color:#2a2a2a;">${escapeHtml(sn.love)}</p>
            </td>
          </tr>
        </table>
        <p style="margin:6px 0 12px; font-size:13px; color:#2a2a2a;"><strong>This year's advice:</strong> ${escapeHtml(sn.advice)}</p>
      ` : ''}

      ${dm?.narrative ? `
        <div style="margin: 12px 0; padding: 10px 12px; background:#f7f3ec; border-left:3px solid #6b6258; border-radius:4px;">
          <div style="font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#9a8f81; margin-bottom:4px;">Day Master overlay · ${escapeHtml(dm.narrative.ten_gods)}</div>
          <p style="margin:0 0 6px; font-family: Georgia, serif; font-size:14px; color:#1a1a1a;">${escapeHtml(dm.narrative.headline)}</p>
          <p style="margin:6px 0 0; font-size:12px; line-height:1.55; color:#2a2a2a;">${escapeHtml(dm.narrative.extended)}</p>
          <p style="margin:8px 0 0; font-size:12px; color:#2a2a2a;"><strong>Day Master advice:</strong> ${escapeHtml(dm.narrative.advice)}</p>
        </div>
      ` : ''}

      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; margin: 8px 0 0;">
        <tr>
          <td style="vertical-align:top; padding:10px 12px; border:1px solid #ece6da; width:50%;">
            <div style="font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#9a8f81; margin-bottom:6px;">Best windows</div>
            <ul style="margin:0; padding-left:18px;">${fh.bestMonths.map(monthRow).join('')}</ul>
          </td>
          <td style="vertical-align:top; padding:10px 12px; border:1px solid #ece6da; width:50%;">
            <div style="font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#9a8f81; margin-bottom:6px;">Hardest windows</div>
            <ul style="margin:0; padding-left:18px;">${fh.worstMonths.map(monthRow).join('')}</ul>
          </td>
        </tr>
      </table>
    </div>`;
}

// ── Compatibility ──────────────────────────────────────────────────

function renderCompatibilitySection(compat, partnerName) {
  if (!compat) return '';
  const color = TONE_COLORS[compat.tier?.tone] || '#444';
  const ratingPct = compat.rating != null ? `${Math.round(compat.rating)}%` : '—';
  const block = (label, body) => body ? `
    <div style="margin: 0 0 12px;">
      <div style="font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#9a8f81;">${escapeHtml(label)}</div>
      <p style="margin:4px 0 0; font-size:13px; line-height:1.55; color:#2a2a2a;">${escapeHtml(body)}</p>
    </div>` : '';

  const partner = partnerName ? ` with ${escapeHtml(partnerName)}` : '';
  return `
    <div style="margin: 0 0 28px;">
      <h2 style="font-family: Georgia, 'Times New Roman', serif; font-size:18px; margin:0 0 10px; color:#1a1a1a;">Compatibility${partner}</h2>
      <div style="display:inline-block; padding:8px 12px; background:#faf6ef; border-left:3px solid ${color}; border-radius:4px; margin: 0 0 14px;">
        <span style="font-family: Georgia, serif; font-size:22px; color:#1a1a1a;">${escapeHtml(ratingPct)}</span>
        ${compat.tier ? `<span style="font-size:12px; color:${color}; margin-left:8px; font-weight:600;">${escapeHtml(compat.tier.name)}</span>` : ''}
      </div>
      ${block('General match',  compat.generalMatchDescription)}
      ${block('Yin & Yang',     compat.yinYangDescription)}
      ${block('The Good',       compat.theGood)}
      ${block('The Not-So-Good', compat.theNotSoGood)}
      ${block('Romance',        compat.romance)}
      ${block('In Bed',         compat.sex)}
      ${compat.soulMate ? `
        <div style="margin: 0 0 12px; padding: 10px 12px; background:#f7f3ec; border-left:3px solid #c8442e; border-radius:4px;">
          <div style="font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#9a8f81; margin-bottom:4px;">Soul mate · ${compat.soulMate.isMatch ? 'Match' : 'Not the listed match'}</div>
          <p style="margin:0; font-size:13px; line-height:1.55; color:#2a2a2a;">${escapeHtml(compat.soulMate.description || '')}</p>
        </div>` : ''}
      ${compat.elementStrength ? `
        <p style="margin:0; font-size:13px; color:#2a2a2a;"><strong>Combined element strength (${escapeHtml(compat.elementStrength.element)}):</strong> ${escapeHtml(compat.elementStrength.conclusion)}</p>` : ''}
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

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Quick reading — ${escapeHtml(subjectName)}</title>
</head>
<body style="margin:0; padding:0; background:#f7f3ec; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#1a1a1a;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f7f3ec;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:760px; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding:24px 28px 14px; border-bottom:1px solid #ece6da;">
              <p style="margin:0 0 6px; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#6b6258;">Mahjong Tarot · Quick reading</p>
              <h1 style="margin:0; font-family: Georgia, 'Times New Roman', serif; font-size:22px; line-height:1.3; color:#1a1a1a;">Reading for ${escapeHtml(subjectName)}</h1>
              <p style="margin:6px 0 0; font-size:12px; color:#6b6258;">${escapeHtml(birthLine)}</p>
              ${partner ? `<p style="margin:4px 0 0; font-size:12px; color:#6b6258;">Compared with ${escapeHtml(partner.name || 'partner')} (${escapeHtml(partner.birthday || '')}${partner.birthTime ? ' · ' + escapeHtml(partner.birthTime) : ''})</p>` : ''}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 12px;">
              ${reading.bazi           !== undefined ? renderBaziSection(reading.bazi) : ''}
              ${reading.ziwei          !== undefined ? renderZiweiSection(reading.ziwei, reading.ziweiFull) : ''}
              ${reading.threeBlessings !== undefined ? renderThreeBlessingsSection(reading.threeBlessings) : ''}
              ${reading.fireHorse      !== undefined ? renderFireHorseSection(reading.fireHorse) : ''}
              ${reading.compatibility  !== undefined ? renderCompatibilitySection(reading.compatibility, partner?.name) : ''}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:14px 28px 22px; font-size:11px; color:#9a8f81; border-top:1px solid #ece6da;">
              Generated from <a href="https://mahjongtarot.com" style="color:#9a8f81; text-decoration:none;">mahjongtarot.com</a> · For practitioner reference only.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
