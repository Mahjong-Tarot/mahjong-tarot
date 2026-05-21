import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from '@supabase/ssr';

/**
 * API-route auth helper for endpoints that any signed-in user can hit.
 *
 * Lighter than requirePortalUserApi / requireAdminApi — no role check.
 * Use for self-serve endpoints (own profile, own readings, etc.) where
 * RLS is the source of truth on what data the user can touch.
 *
 *   const auth = await requireUserApi(req, res);
 *   if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
 *   const { supabase, user } = auth;
 */
export async function requireUserApi(req, res) {
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

  return { ok: true, supabase, user };
}
