import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from '@supabase/ssr';

/**
 * API-route auth helper for admin-only endpoints.
 *
 * Same shape as requireStaffApi but only role === 'admin' is allowed.
 *
 *   const auth = await requireAdminApi(req, res);
 *   if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
 *   const { supabase, user, profile } = auth;
 */
export async function requireAdminApi(req, res) {
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

  if (!profile || profile.role !== 'admin') {
    return { ok: false, status: 403, error: 'Admin role required.' };
  }

  return { ok: true, supabase, user, profile };
}
