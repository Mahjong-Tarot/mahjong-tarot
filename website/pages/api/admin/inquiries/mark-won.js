// POST /api/admin/inquiries/mark-won
//
// Admin-only. Marks an inquiry as Won by creating a public.deals
// row, flipping inquiries.status='won', and promoting the linked
// person to lifecycle_stage='customer'. Idempotent: re-submitting
// for the same inquiry returns the existing Won deal.
//
// Body: { inquiry_id, amount_cents, currency?='usd',
//         close_date?=today, notes? }
import { requireApi } from '../../../../lib/guards';
import { getServiceSupabase } from '../../../../lib/stripe';

const PROMOTE_FROM = new Set([
  'subscriber', 'lead', 'mql', 'sql', 'opportunity',
]);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requireApi('admin')(req, res);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
  const { user } = auth;

  const {
    inquiry_id,
    amount_cents,
    currency = 'usd',
    close_date,
    notes,
  } = req.body || {};

  if (!inquiry_id || typeof inquiry_id !== 'string') {
    return res.status(400).json({ error: 'inquiry_id is required' });
  }
  const amount = parseInt(amount_cents, 10);
  if (!Number.isFinite(amount) || amount < 0) {
    return res.status(400).json({ error: 'amount_cents must be a non-negative integer' });
  }

  const service = getServiceSupabase();

  // Look up the inquiry — must have a linked person.
  const { data: inquiry, error: inquiryErr } = await service
    .from('inquiries')
    .select('id, person_id, status, type, source')
    .eq('id', inquiry_id)
    .maybeSingle();

  if (inquiryErr) return res.status(500).json({ error: inquiryErr.message });
  if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });
  if (!inquiry.person_id) {
    return res.status(400).json({
      error: 'This inquiry isn\'t linked to a person yet. Set a person before marking Won.',
    });
  }

  // Idempotency: if a Won deal for this inquiry already exists, return it.
  const { data: existing } = await service
    .from('deals')
    .select('id, amount_cents, currency, won_at')
    .eq('inquiry_id', inquiry_id)
    .eq('status', 'won')
    .maybeSingle();

  if (existing) {
    return res.status(200).json({
      deal: existing,
      reused: true,
    });
  }

  // 1. Insert the deal
  const closeDate = close_date || new Date().toISOString().slice(0, 10);
  const { data: deal, error: dealErr } = await service
    .from('deals')
    .insert({
      person_id: inquiry.person_id,
      inquiry_id,
      amount_cents: amount,
      currency: (currency || 'usd').toLowerCase(),
      source: 'inquiry',
      notes: notes || null,
      close_date: closeDate,
      won_at: new Date().toISOString(),
      status: 'won',
      owner_id: user.id,
    })
    .select('id, amount_cents, currency, won_at')
    .single();

  if (dealErr) return res.status(500).json({ error: dealErr.message });

  // 2. Flip the inquiry to won
  const { error: invErr } = await service
    .from('inquiries')
    .update({ status: 'won' })
    .eq('id', inquiry_id);
  if (invErr) {
    // Roll-forward best-effort: log and continue. The deal already
    // exists; admin can fix inquiry status manually if this fails.
    console.error('[mark-won] inquiry status update failed', invErr);
  }

  // 3. Promote the person to customer if not already
  const { data: person } = await service
    .from('people')
    .select('id, lifecycle_stage')
    .eq('id', inquiry.person_id)
    .maybeSingle();

  if (person && PROMOTE_FROM.has(person.lifecycle_stage)) {
    await service
      .from('people')
      .update({ lifecycle_stage: 'customer' })
      .eq('id', person.id);
  }

  return res.status(200).json({ deal, reused: false });
}
