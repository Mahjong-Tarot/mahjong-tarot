import { requirePortalUserApi } from '../../../lib/requirePortalUserApi';
import { buildQuickReading } from '../../../lib/quickReading';

const REPLY_TO = process.env.RESEND_REPLY_TO || 'firepig01@gmail.com';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Mahjong Tarot <notifications@mahjongtarot.com>';

// ─── HTML helpers ──────────────────────────────────────────────────────

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatHumanDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

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

function renderZiweiSection(ziwei) {
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
    </div>`;
}

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

function renderAlmanacSection(almanac, date) {
  if (!almanac) {
    return `
      <div style="margin: 0 0 28px;">
        <h2 style="font-family: Georgia, 'Times New Roman', serif; font-size:18px; margin:0 0 10px; color:#1a1a1a;">Almanac for ${escapeHtml(formatHumanDate(date))}</h2>
        <p style="margin:0; font-size:13px; color:#6b6258; font-style:italic;">No almanac entry available for this date (range: 2026-02-17 to 2032-02-09).</p>
      </div>`;
  }
  const activities = almanac.activities || {};
  const lucky    = Object.entries(activities).filter(([, v]) => v === 'Lucky').map(([k]) => k);
  const unlucky  = Object.entries(activities).filter(([, v]) => v === 'Unlucky').map(([k]) => k);
  const luckyList = lucky.length    ? lucky.slice(0, 8).join(', ')    : '—';
  const unluckyList = unlucky.length ? unlucky.slice(0, 8).join(', ') : '—';
  return `
    <div style="margin: 0 0 28px;">
      <h2 style="font-family: Georgia, 'Times New Roman', serif; font-size:18px; margin:0 0 10px; color:#1a1a1a;">Almanac for ${escapeHtml(formatHumanDate(date))}</h2>
      <p style="margin:0 0 6px; font-size:13px; color:#2a2a2a;"><strong>Tone:</strong> ${escapeHtml(almanac.tone || '—')} · <strong>Score:</strong> ${almanac.score ?? '—'}/100 · <strong>${escapeHtml(almanac.weekday || '')}</strong></p>
      ${almanac.holiday ? `<p style="margin:0 0 6px; font-size:13px; color:#c8442e;"><strong>${escapeHtml(almanac.holiday)}</strong></p>` : ''}
      ${almanac.year_conflict ? `<p style="margin:0 0 6px; font-size:12px; color:#6b6258;"><strong>Year conflict:</strong> ${escapeHtml(almanac.year_conflict)}</p>` : ''}
      <p style="margin:8px 0 4px; font-size:13px; color:#2a8a48;"><strong>Auspicious:</strong> ${escapeHtml(luckyList)}</p>
      <p style="margin:0; font-size:13px; color:#b22;"><strong>Inauspicious:</strong> ${escapeHtml(unluckyList)}</p>
    </div>`;
}

function renderHoroscopeSection(horoscope, date) {
  const chinese = horoscope?.chinese;
  const western = horoscope?.western;
  return `
    <div style="margin: 0 0 28px;">
      <h2 style="font-family: Georgia, 'Times New Roman', serif; font-size:18px; margin:0 0 10px; color:#1a1a1a;">Horoscope for ${escapeHtml(formatHumanDate(date))}</h2>

      <div style="margin: 0 0 16px; padding: 12px 14px; background:#faf6ef; border-left:3px solid #c8442e; border-radius:4px;">
        <div style="font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#9a8f81; margin-bottom:4px;">Chinese zodiac · ${escapeHtml(chinese?.animal || '—')}</div>
        ${chinese?.general ? `<p style="margin:6px 0; font-size:13px; line-height:1.55; color:#2a2a2a;"><strong>General:</strong> ${escapeHtml(chinese.general)}</p>` : ''}
        ${chinese?.love    ? `<p style="margin:6px 0; font-size:13px; line-height:1.55; color:#2a2a2a;"><strong>Love:</strong> ${escapeHtml(chinese.love)}</p>` : ''}
        ${chinese?.money   ? `<p style="margin:6px 0; font-size:13px; line-height:1.55; color:#2a2a2a;"><strong>Money:</strong> ${escapeHtml(chinese.money)}</p>` : ''}
        ${!chinese ? `<p style="margin:0; font-size:12px; color:#6b6258; font-style:italic;">No published horoscope for this date / sign yet.</p>` : ''}
      </div>

      <div style="margin: 0; padding: 12px 14px; background:#f7f3ec; border-left:3px solid #6b6258; border-radius:4px;">
        <div style="font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#9a8f81; margin-bottom:4px;">Western zodiac</div>
        <p style="margin:0; font-size:13px; color:#2a2a2a;">Sun sign: <strong>${escapeHtml(western || '—')}</strong></p>
      </div>
    </div>`;
}

function buildEmailHtml(reading) {
  const { subject, consultationDate } = reading;
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
              <p style="margin:4px 0 0; font-size:12px; color:#6b6258;">Consultation date: <strong>${escapeHtml(formatHumanDate(consultationDate))}</strong></p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 12px;">
              ${renderBaziSection(reading.bazi)}
              ${renderZiweiSection(reading.ziwei)}
              ${renderThreeBlessingsSection(reading.threeBlessings)}
              ${renderAlmanacSection(reading.almanac, consultationDate)}
              ${renderHoroscopeSection(reading.horoscope, consultationDate)}
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

// ─── Handler ──────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requirePortalUserApi(req, res);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
  const { user } = auth;

  const {
    name,
    birthday,
    birthTime,
    birthPlace,
    gender,
    consultationDate,
    recipient,
  } = req.body || {};

  // Validation
  if (!birthday || !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
    return res.status(400).json({ error: 'birthday (YYYY-MM-DD) is required.' });
  }
  if (!consultationDate || !/^\d{4}-\d{2}-\d{2}$/.test(consultationDate)) {
    return res.status(400).json({ error: 'consultationDate (YYYY-MM-DD) is required.' });
  }
  if (birthTime && !/^\d{2}:\d{2}$/.test(birthTime)) {
    return res.status(400).json({ error: 'birthTime must be HH:MM.' });
  }
  // Recipient is either 'me' (use caller's email) or an explicit email string.
  let toEmail = user.email;
  if (recipient && recipient !== 'me') {
    if (typeof recipient !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(recipient)) {
      return res.status(400).json({ error: 'recipient must be "me" or a valid email address.' });
    }
    toEmail = recipient;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY is not configured.' });
  }

  try {
    const reading = await buildQuickReading({
      name: name || null,
      birthday,
      birthTime: birthTime || null,
      birthPlace: birthPlace || null,
      gender: gender || null,
      consultationDate,
    });

    const html = buildEmailHtml(reading);
    const subjectLine = `Quick reading — ${name || 'unnamed subject'} · ${consultationDate}`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [toEmail],
        subject: subjectLine,
        html,
        reply_to: REPLY_TO,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error('Resend error (quick-reading):', data);
      return res.status(response.status).json({ error: data.message || 'Failed to send email.' });
    }

    return res.status(200).json({ success: true, sentTo: toEmail, id: data.id });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('quick-reading handler error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
