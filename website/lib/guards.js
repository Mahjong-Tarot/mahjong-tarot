import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from '@supabase/ssr';

/**
 * Shared role guards for Next.js pages and API routes.
 *
 * Two parameterized factories replace five near-identical files:
 *   - requirePage(role) → getServerSideProps helper
 *   - requireApi(role)  → API route auth helper
 *
 * Supported roles:
 *   'admin'  — only profile.role === 'admin'
 *   'staff'  — profile.role in ('admin', 'astrologer')
 *   'user'   — any authenticated user (no role check)
 *
 * Usage (page):
 *
 *   export const getServerSideProps = requirePage('admin');
 *
 * Usage (API):
 *
 *   const auth = await requireApi('staff')(req, res);
 *   if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
 *   const { supabase, user, profile } = auth;
 */

const STAFF_ROLES = new Set(['admin', 'astrologer']);

function buildSupabase(getCookieHeader, appendSetCookie) {
  const cookies = parseCookieHeader(getCookieHeader() ?? '');
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookies,
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            appendSetCookie(
              'Set-Cookie',
              serializeCookieHeader(name, value, options),
            );
          });
        },
      },
    },
  );
}

function roleAllowed(role, profileRole) {
  if (role === 'admin') return profileRole === 'admin';
  if (role === 'staff') return STAFF_ROLES.has(profileRole);
  return true; // 'user' — no role check
}

/**
 * Page-level guard factory. Returns a function suitable for
 * `export const getServerSideProps = requirePage('admin')`.
 *
 * Redirect behavior preserves the original requireAdmin / requireStaff files:
 *   - no session       → redirect to /sign-in
 *   - 'admin' required, profile is 'astrologer' → /admin/sessions
 *   - 'admin' required, anything else           → /
 *   - 'staff' required, role not allowed        → /
 *
 * Note: 'user' is not used at the page level today, but is supported for
 * symmetry. A logged-in user with any (or no) profile row passes.
 */
export function requirePage(role) {
  return async function pageGuard(ctx) {
    const supabase = buildSupabase(
      () => ctx.req.headers.cookie,
      (name, value) => ctx.res.appendHeader(name, value),
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { redirect: { destination: '/sign-in', permanent: false } };
    }

    if (role === 'user') {
      return { props: {} };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id, name, role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile || !roleAllowed(role, profile.role)) {
      // 'admin' guard sends astrologers to their portal; everyone else home.
      const destination =
        role === 'admin' && profile?.role === 'astrologer'
          ? '/admin/sessions'
          : '/';
      return { redirect: { destination, permanent: false } };
    }

    return { props: { profile } };
  };
}

/**
 * API-level guard factory. Returns an async function with the same
 * `{ ok, status, error, supabase, user, profile }` shape that the
 * original requireAdminApi / requireStaffApi / requireUserApi files used.
 *
 * Error responses match the originals:
 *   - 401 'Not signed in.'        if there is no session
 *   - 403 'Admin role required.'  for role='admin'  when role check fails
 *   - 403 'Not authorized.'       for role='staff'  when role check fails
 *
 * The 'user' variant skips the profiles lookup entirely (matches the
 * original requireUserApi which returned only { supabase, user }).
 */
export function requireApi(role) {
  return async function apiGuard(req, res) {
    const supabase = buildSupabase(
      () => req.headers.cookie,
      (name, value) => res.appendHeader(name, value),
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, status: 401, error: 'Not signed in.' };
    }

    if (role === 'user') {
      return { ok: true, supabase, user };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id, name, role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile || !roleAllowed(role, profile.role)) {
      const error =
        role === 'admin' ? 'Admin role required.' : 'Not authorized.';
      return { ok: false, status: 403, error };
    }

    return { ok: true, supabase, user, profile };
  };
}
