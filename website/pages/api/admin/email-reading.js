// Emails the guest a private link to view their final reading.
// Generates a public_token on first send (reused on subsequent sends).
// Records final_reading_sent_at on success so the admin page can
// show "Sent X minutes ago".
//
// Gated by requireApi('staff'). BCCs Bill (firepig@onlinechineseastrology.com)
// so he gets a copy of every reading sent.

import { randomUUID } from 'crypto';
import { requireApi } from '../../../lib/guards';
import { getServiceSupabase } from '../../../lib/stripe';
import { siteOrigin } from '../../../lib/siteOrigin';
import PALETTE from '../../../kernel/config/palette.json';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Mahjong Tarot <notifications@mahjongtarot.com>';
const REPLY_TO   = 'firepig@onlinechineseastrology.com';
const BCC        = 'firepig@onlinechineseastrology.com';
const SERIF      = "'Fraunces','Iowan Old Style',Georgia,serif";

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
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function buildEmailHtml({ firstName, callDate, readingUrl }) {
  const dateLine = callDate
    ? `Thank you for our conversation on <strong>${escapeHtml(callDate)}</strong>. I've written up your reading and it's ready for you here:`
    : `Thank you for our conversation. I've written up your reading and it's ready for you here:`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Mahjong Tarot reading</title>
</head>
<body style="margin:0; padding:0; background:${PALETTE.canvas}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:${PALETTE.dark};">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${PALETTE.canvas};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px; background:${PALETTE.white}; border-radius:10px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding:32px 36px 28px;">
              <p style="margin:0 0 18px; font-family: ${SERIF}; font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:${PALETTE.inkBody};">Mahjong Tarot</p>
              <h1 style="margin:0 0 18px; font-family: ${SERIF}; font-size:26px; font-weight:600; color:${PALETTE.dark}; line-height:1.3;">
                Your reading is ready, ${escapeHtml(firstName)}.
              </h1>
              <p style="margin:0 0 16px; font-size:15px; line-height:1.6;">
                ${dateLine}
              </p>
              <p style="margin:28px 0; text-align:center;">
                <a href="${escapeHtml(readingUrl)}"
                   style="display:inline-block; padding:14px 32px; background:${PALETTE.dark}; color:${PALETTE.white}; text-decoration:none; border-radius:6px; font-size:15px; font-weight:500;">
                  Read your reading
                </a>
              </p>
              <p style="margin:0 0 14px; font-size:14px; line-height:1.6; color:${PALETTE.ink2};">
                The link is private to you, so you can come back to it any time.
                If anything in there sparks more questions, just hit reply &mdash; I read every message.
              </p>
              <p style="margin:22px 0 0; font-size:15px; line-height:1.5;">
                With warmth,<br>
                <span style="font-family: ${SERIF}; font-size:17px;">Bill</span>
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:14px 28px 20px; font-size:11px; color:${PALETTE.muted}; border-top:1px solid ${PALETTE.line};">
              <a href="${escapeHtml(readingUrl)}" style="color:${PALETTE.muted}; word-break:break-all;">${escapeHtml(readingUrl)}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requireApi('staff')(req, res);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY is not configured.' });
  }

  const { bookingId } = req.body || {};
  if (!bookingId || typeof bookingId !== 'string') {
    return res.status(400).json({ error: 'bookingId is required.' });
  }

  let svc;
  try {
    svc = getServiceSupabase();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  const { data: booking, error: bErr } = await svc
    .from('bookings')
    .select('id, astrologer_id, full_name, email, scheduled_at, final_reading_html, public_token')
    .eq('id', bookingId)
    .maybeSingle();
  if (bErr) return res.status(500).json({ error: bErr.message });
  if (!booking) return res.status(404).json({ error: 'Booking not found.' });
  // The service-role client bypasses the per-astrologer RLS scoping, so
  // enforce it here: an astrologer only touches their own bookings.
  if (auth.profile.role !== 'admin' && booking.astrologer_id !== auth.user.id) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  if (!booking.email) {
    return res.status(400).json({ error: 'This booking has no guest email on file.' });
  }
  if (!booking.final_reading_html) {
    return res.status(400).json({ error: 'No final reading to send yet. Generate one first.' });
  }

  // Reuse the token if we've already minted one; otherwise mint a new one.
  let token = booking.public_token;
  if (!token) {
    token = randomUUID();
    const { error: tErr } = await svc
      .from('bookings')
      .update({ public_token: token })
      .eq('id', bookingId);
    if (tErr) return res.status(500).json({ error: `Failed to mint link: ${tErr.message}` });
  }

  const origin = siteOrigin();
  const readingUrl = `${origin}/reading/${token}`;
  const guestName  = (booking.full_name || '').trim() || 'friend';
  const firstName  = guestName.split(/\s+/)[0] || guestName;
  const callDate   = formatHumanDate(booking.scheduled_at);

  const html = buildEmailHtml({ firstName, callDate, readingUrl });
  const subject = `Your Mahjong Tarot reading, ${firstName}`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:     FROM_EMAIL,
        to:       [booking.email],
        bcc:      [BCC],
        subject,
        html,
        reply_to: REPLY_TO,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error('Resend error (email-reading):', data);
      return res.status(response.status).json({
        error: data?.message || 'Failed to send email.',
      });
    }

    // Record send. Don't fail the request if this errors — the email
    // already went out, the column is just for the UI.
    const sentAt = new Date().toISOString();
    await svc
      .from('bookings')
      .update({ final_reading_sent_at: sentAt })
      .eq('id', bookingId);

    return res.status(200).json({
      success:     true,
      sentTo:      booking.email,
      sentAt,
      readingUrl,
      publicToken: token,
      emailId:     data.id,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('email-reading handler error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
