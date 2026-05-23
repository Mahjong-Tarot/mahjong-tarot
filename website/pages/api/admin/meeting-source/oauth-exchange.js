import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from '@supabase/ssr';
import { getAdapter, SUPPORTED_SOURCES } from '../../../../lib/meetingSources';

/**
 * POST /api/admin/meeting-source/oauth-exchange
 *
 * Body: { source, code, state, code_verifier }
 *
 * Authenticates the caller via Supabase cookies. Verifies the
 * is_portal_user() role. Dispatches to the adapter's completeOAuth
 * to swap code → tokens. Upserts a row in meeting_source_connections.
 *
 * Returns { ok: true, account_label } on success.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { source, code, state, code_verifier } = req.body || {};
  if (!source || !code || !code_verifier) {
    return res.status(400).json({ error: 'Missing source, code, or code_verifier.' });
  }
  if (!SUPPORTED_SOURCES.includes(source)) {
    return res.status(400).json({ error: `Unsupported source: ${source}` });
  }

  const cookies = parseCookieHeader(req.headers.cookie ?? '');
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookies,
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.appendHeader('Set-Cookie', serializeCookieHeader(name, value, options));
          });
        },
      },
    },
  );

  // Authenticate the caller.
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  // Role check via RPC (uses the SECURITY DEFINER helper from 016_roles.sql).
  const { data: isPortal, error: rpcErr } = await supabase.rpc('is_portal_user');
  if (rpcErr) {
    console.error('is_portal_user RPC failed:', rpcErr);
    return res.status(500).json({ error: 'Role check failed.' });
  }
  if (!isPortal) {
    return res.status(403).json({ error: 'Portal users only.' });
  }

  // Dispatch to the adapter for the actual code → tokens exchange.
  let result;
  try {
    const adapter = getAdapter(source);
    result = await adapter.completeOAuth({ user_id: user.id, code, state, code_verifier });
  } catch (e) {
    console.error('OAuth completion failed:', e);
    return res.status(502).json({ error: e.message || 'OAuth completion failed.' });
  }

  const { tokens, account_label } = result;
  const now = new Date();
  const expiresAt = tokens.expires_in
    ? new Date(now.getTime() + tokens.expires_in * 1000).toISOString()
    : null;

  const { error: upsertErr } = await supabase
    .from('meeting_source_connections')
    .upsert({
      user_id: user.id,
      source,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || null,
      token_expires_at: expiresAt,
      account_label: account_label || null,
      updated_at: now.toISOString(),
    }, { onConflict: 'user_id,source' });

  if (upsertErr) {
    console.error('meeting_source_connections upsert failed:', upsertErr);
    return res.status(500).json({ error: 'Failed to save connection.' });
  }

  return res.status(200).json({ ok: true, account_label: account_label || null, source });
}
