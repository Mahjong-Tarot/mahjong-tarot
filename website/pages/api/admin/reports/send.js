import { marked } from 'marked';
import { requirePortalUserApi } from '../../../../lib/requirePortalUserApi';

const REPLY_TO = process.env.RESEND_REPLY_TO || 'firepig01@gmail.com';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Mahjong Tarot <notifications@mahjongtarot.com>';
const SITE_URL = 'https://mahjongtarot.com';

// Conversion CTA target. v1: point clients at The Mahjong Mirror
// page on mahjongtarot.com, which introduces the practice and
// invites them to deepen the work. v2 (planned): swap this for a
// dedicated subscribe landing page with pricing + Stripe Payment
// Link, and add a secondary "Book another session" button.
const CTA_URL = 'https://mahjongtarot.com/the-mahjong-mirror';

function buildEmailHtml({ clientName, title, bodyHtml }) {
  const firstName = (clientName || '').split(' ')[0] || 'there';
  const safeTitle = title || `${firstName}'s reading`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(safeTitle)}</title>
</head>
<body style="margin:0; padding:0; background:#f7f3ec; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#1a1a1a;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f7f3ec;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:640px; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding:32px 32px 16px; border-bottom:1px solid #ece6da;">
              <p style="margin:0 0 8px; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#6b6258;">Mahjong Tarot</p>
              <h1 style="margin:0; font-family: Georgia, 'Times New Roman', serif; font-size:24px; line-height:1.3; color:#1a1a1a;">${escapeHtml(safeTitle)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px; font-size:15px; line-height:1.6; color:#2a2a2a;">
              <p style="margin:0 0 16px;">Hello ${escapeHtml(firstName)},</p>
              <p style="margin:0 0 24px;">Thank you for the reading. Here is what came up — take your time with it.</p>
              <div style="border-top:1px solid #ece6da; border-bottom:1px solid #ece6da; padding:20px 0; margin:0 0 24px;">
                ${bodyHtml}
              </div>
              <p style="margin:0;">With warmth,<br>Bill</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:24px 32px 32px; background:#faf6ef;">
              <p style="margin:0 0 12px; font-size:14px; color:#2a2a2a;">Want to keep going?</p>
              <p style="margin:0 0 16px; font-size:13px; line-height:1.55; color:#6b6258;">
                Ongoing readings build on each other. Explore The Mahjong Mirror — Bill's framework for deeper, recurring work together.
              </p>
              <a href="${CTA_URL}" style="display:inline-block; padding:10px 22px; background:#c8442e; color:#ffffff; text-decoration:none; border-radius:6px; font-size:14px; font-weight:600;">
                Explore The Mahjong Mirror →
              </a>
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

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requirePortalUserApi(req, res);
  if (!auth.ok) {
    return res.status(auth.status).json({ error: auth.error });
  }
  const { supabase } = auth;

  const { reportId } = req.body || {};
  if (!reportId) {
    return res.status(400).json({ error: 'Missing reportId.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY is not configured.' });
  }

  try {
    const { data: report, error: reportErr } = await supabase
      .from('reports')
      .select('id, client_id, title, body_markdown, status, sent_to_email')
      .eq('id', reportId)
      .maybeSingle();
    if (reportErr) throw reportErr;
    if (!report) return res.status(404).json({ error: 'Report not found.' });
    if (!report.body_markdown || !report.body_markdown.trim()) {
      return res.status(400).json({ error: 'Report body is empty. Add content before sending.' });
    }

    const { data: client, error: clientErr } = await supabase
      .from('clients')
      .select('id, full_name, email')
      .eq('id', report.client_id)
      .maybeSingle();
    if (clientErr) throw clientErr;
    if (!client?.email) {
      return res.status(400).json({ error: 'Client has no email on file.' });
    }

    const bodyHtml = marked.parse(report.body_markdown, { gfm: true, breaks: true });
    const subject = report.title || `${(client.full_name || '').split(' ')[0] || 'Your'} reading`;
    const html = buildEmailHtml({
      clientName: client.full_name,
      title: report.title,
      bodyHtml,
    });

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
      console.error('Resend API error:', data);
      return res.status(response.status).json({ error: data.message || 'Failed to send email.' });
    }

    const sentAt = new Date().toISOString();
    const { data: updated, error: updateErr } = await supabase
      .from('reports')
      .update({
        status: 'sent',
        sent_at: sentAt,
        sent_to_email: client.email,
        email_message_id: data.id || null,
        updated_at: sentAt,
      })
      .eq('id', report.id)
      .select('id, status, sent_at, sent_to_email, email_message_id')
      .single();
    if (updateErr) throw updateErr;

    return res.status(200).json({ success: true, report: updated });
  } catch (err) {
    console.error('Report send error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
