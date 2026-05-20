import { marked } from 'marked';
import { requireAdminApi } from '../../../../lib/requireAdminApi';

const REPLY_TO = process.env.RESEND_REPLY_TO || 'firepig01@gmail.com';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Mahjong Tarot <notifications@mahjongtarot.com>';
const SITE_URL = 'https://mahjongtarot.com';

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildEmailHtml({ clientName, bodyHtml }) {
  const firstName = (clientName || '').split(' ')[0] || 'there';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0; padding:0; background:#f7f3ec; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#1a1a1a;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f7f3ec;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding:28px 32px 14px; border-bottom:1px solid #ece6da;">
              <p style="margin:0; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#6b6258;">Mahjong Tarot</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px; font-size:15px; line-height:1.6; color:#2a2a2a;">
              <p style="margin:0 0 16px;">Hi ${escapeHtml(firstName)},</p>
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:16px 32px 24px; font-size:11px; color:#9a8f81;">
              <a href="${SITE_URL}" style="color:#9a8f81; text-decoration:none;">mahjongtarot.com</a>
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

  const auth = await requireAdminApi(req, res);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
  const { supabase } = auth;

  const { clientId, subject, body } = req.body || {};
  if (!clientId || !subject || !body) {
    return res.status(400).json({ error: 'Missing required fields: clientId, subject, body.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY is not configured.' });
  }

  try {
    const { data: client, error: clientErr } = await supabase
      .from('clients')
      .select('id, full_name, email')
      .eq('id', clientId)
      .maybeSingle();
    if (clientErr) throw clientErr;
    if (!client) return res.status(404).json({ error: 'Client not found.' });
    if (!client.email) return res.status(400).json({ error: 'Client has no email on file.' });

    const bodyHtml = marked.parse(body, { gfm: true, breaks: true });
    const html = buildEmailHtml({ clientName: client.full_name, bodyHtml });

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [client.email],
        subject,
        html,
        reply_to: REPLY_TO,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Resend API error (send-note):', data);
      return res.status(response.status).json({ error: data.message || 'Failed to send email.' });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    console.error('Send-note error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
