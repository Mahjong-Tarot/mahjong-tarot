// Account deletion, required by the App Store for apps that create accounts.
// Called by the iPhone app with the member's Bearer token. Cancels a
// renewing Stripe subscription first, then deletes the auth user; profiles,
// readings, inner_circle and member_subscriptions cascade from auth.users.

import { requireBearer } from '../../../lib/bearer';
import { getStripe, getServiceSupabase } from '../../../lib/stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const auth = await requireBearer(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

  const service = getServiceSupabase();
  const { data: sub } = await service
    .from('member_subscriptions')
    .select('stripe_subscription_id, status, plan')
    .eq('user_id', auth.user.id)
    .maybeSingle();

  const renewing = sub?.stripe_subscription_id
    && sub.plan !== 'lifetime'
    && ['active', 'trialing', 'past_due', 'unpaid', 'incomplete', 'paused'].includes(sub.status);
  if (renewing) {
    try {
      await getStripe().subscriptions.cancel(sub.stripe_subscription_id);
    } catch (err) {
      if (err?.code !== 'resource_missing') {
        // eslint-disable-next-line no-console
        console.error('account/delete: stripe cancel failed', err);
        return res.status(502).json({ error: 'We could not cancel your membership billing. Please contact us.' });
      }
    }
  }

  const { error } = await service.auth.admin.deleteUser(auth.user.id);
  if (error) {
    // eslint-disable-next-line no-console
    console.error('account/delete: deleteUser failed', error);
    return res.status(500).json({ error: 'We could not delete your account. Please contact us.' });
  }
  return res.status(200).json({ ok: true });
}
