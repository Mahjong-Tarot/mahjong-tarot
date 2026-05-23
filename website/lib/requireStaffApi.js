import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from '@supabase/ssr';

/**
 * API-route auth helper for portal endpoints.
 *
 * Reads the Supabase session from request cookies and resolves the
 * caller's profile. Returns:
 *   - { ok: false, status: 401, error } if no session
 *   - { ok: false, status: 403, error } if the role isn't astrologer/admin
 *   - { ok: true, supabase, user, profile } otherwise
 *
 * The returned `supabase` client is cookie-aware and should be used
 * for any further DB reads/writes inside the handler so RLS still
 * applies to the authenticated user (not the anon key).
 *
 * Usage:
 *
 *   export default async function handler(req, res) {
 *     const auth = await requireStaffApi(req, res);
 *     if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
 *     const { supabase, user, profile } = auth;
 *     // … do work
 *   }
 */
export async function requireStaffApi(req, res) {
  const cookies = parseCookieHeader(req.headers.cookie ?? '');

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookies,
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.appendHeader(
              'Set-Cookie',
              serializeCookieHeader(name, value, options),
            );
          });
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, status: 401, error: 'Not signed in.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id, name, role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!profile || (profile.role !== 'astrologer' && profile.role !== 'admin')) {
    return { ok: false, status: 403, error: 'Not authorized.' };
  }

  return { ok: true, supabase, user, profile };
}
