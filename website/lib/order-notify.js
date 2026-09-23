// Internal "new book order" notice: email to the owners + a Lark post
// to the Infinite Leverage group. Called from the Stripe webhook the
// first time a book_orders row is written. Never throws — a failed
// notice must not make Stripe retry the webhook.
import { bookFor } from './books';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Mahjong Tarot <notifications@mahjongtarot.com>';
const NOTIFY_TO  = ['firepig01@gmail.com', 'dave@edge8.ai'];
const SITE_URL   = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mahjongtarot.com';

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatMoney(cents, currency) {
  return `${((cents ?? 0) / 100).toFixed(2)} ${(currency || 'usd').toUpperCase()}`;
}

function describe(order) {
  const book = bookFor(order.sku);
  const address = [
    order.shipping_name,
    order.shipping_line1,
    order.shipping_line2,
    [order.shipping_city, order.shipping_state, order.shipping_postal_code].filter(Boolean).join(' '),
    order.shipping_country,
  ].filter(Boolean);

  return {
    item: `The Mahjong Mirror — ${book?.label || order.sku}`,
    amount: formatMoney(order.amount_cents, order.currency),
    rows: [
      ['Item', `The Mahjong Mirror — ${book?.label || order.sku}`],
      ['Amount', formatMoney(order.amount_cents, order.currency)],
      ['Name', order.full_name || '—'],
      ['Email', order.email || '—'],
      ['Country', order.country || order.shipping_country || '—'],
      ...(address.length ? [['Ship to', address.join(', ')]] : []),
      ['Stripe', order.stripe_payment_intent_id || order.stripe_session_id],
    ],
  };
}

async function sendEmail(order, d) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not set');

  const rowsHtml = d.rows
    .map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0; color:#6b6258; vertical-align:top;">${escapeHtml(k)}</td><td style="padding:6px 0;">${escapeHtml(v)}</td></tr>`)
    .join('');
  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:15px; color:#1a1a1a;">
  <h2 style="font-family:Georgia,serif; margin:0 0 16px;">New book order</h2>
  <table cellpadding="0" cellspacing="0" border="0">${rowsHtml}</table>
  <p style="margin:20px 0 0;"><a href="${SITE_URL}/admin">Open admin</a></p>
</div>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      from:     FROM_EMAIL,
      to:       NOTIFY_TO,
      subject:  `New order: ${d.item} · ${d.amount}`,
      html,
      reply_to: order.email || undefined,
    }),
  });
  if (!response.ok) throw new Error(`Resend ${response.status}: ${await response.text()}`);
}

async function postToLark(d) {
  const url = process.env.LARK_ORDERS_WEBHOOK_URL;
  if (!url) throw new Error('LARK_ORDERS_WEBHOOK_URL is not set');

  const text = ['🛒 New book order', ...d.rows.map(([k, v]) => `${k}: ${v}`)].join('\n');
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ msg_type: 'text', content: { text } }),
  });
  const data = await response.json().catch(() => ({}));
  // Lark custom-bot webhooks return 200 with a non-zero code on failure.
  if (!response.ok || (data.code ?? 0) !== 0) {
    throw new Error(`Lark ${response.status}: ${JSON.stringify(data)}`);
  }
}

export async function notifyBookOrder(order) {
  const d = describe(order);
  const results = await Promise.allSettled([sendEmail(order, d), postToLark(d)]);
  for (const r of results) {
    if (r.status === 'rejected') console.error('[order-notify]', r.reason);
  }
}
