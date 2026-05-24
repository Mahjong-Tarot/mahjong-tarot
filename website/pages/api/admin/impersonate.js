// POST /api/admin/impersonate { user_id }
//
// Admin-only. Generates a magic-link URL for the target astrologer using the
// Supabase Admin API. The client navigates to the URL, which signs the
// browser session out of admin and into the astrologer's account.
//
// Restricted to role='astrologer' targets — refuses to mint links for admins
// or members.

import { requireApi } from '../../../lib/guards';
import { getServiceSupabase } from '../../../lib/stripe';

function originFromReq(req) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host  = req.headers['x-forwarded-host']  || req.headers.host;
  return `${proto}://${host}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const auth = await requireApi('admin')(req, res);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

  const { user_id } = req.body || {};
  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ error: 'user_id required.' });
  }

  if (user_id === auth.user.id) {
    return res.status(400).json({ error: 'Cannot impersonate yourself.' });
  }

  const service = getServiceSupabase();

  const { data: targetProfile, error: pErr } = await service
    .from('profiles')
    .select('user_id, role, name')
    .eq('user_id', user_id)
    .maybeSingle();
  if (pErr) return res.status(500).json({ error: pErr.message });
  if (!targetProfile) {
    return res.status(404).json({ error: 'Target user not found.' });
  }
  if (targetProfile.role !== 'astrologer') {
    return res.status(403).json({ error: 'Target is not an astrologer.' });
  }

  const { data: targetUser, error: uErr } = await service.auth.admin.getUserById(user_id);
  if (uErr || !targetUser?.user?.email) {
    return res.status(500).json({ error: uErr?.message || 'Could not load target email.' });
  }

  const redirectTo = `${originFromReq(req)}/admin/quick-reading`;
  const { data: linkData, error: lErr } = await service.auth.admin.generateLink({
    type: 'magiclink',
    email: targetUser.user.email,
    options: { redirectTo },
  });
  if (lErr || !linkData?.properties?.action_link) {
    return res.status(500).json({ error: lErr?.message || 'Failed to generate link.' });
  }

  return res.status(200).json({ url: linkData.properties.action_link });
}
