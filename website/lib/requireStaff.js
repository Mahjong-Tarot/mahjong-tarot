import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from '@supabase/ssr';

/**
 * getServerSideProps helper for staff-only pages — any /admin/* page
 * that operational astrologers also need access to (sessions, reports,
 * settings, etc.).
 *
 * Reads the Supabase session from request cookies, loads the caller's
 * profile, and:
 *   - redirects to /sign-in if there's no session
 *   - redirects to / if the user's role is not 'astrologer' or 'admin'
 *   - otherwise returns { props: { profile } }
 *
 * Use it like this:
 *
 *   export async function getServerSideProps(ctx) {
 *     return requireStaff(ctx);
 *   }
 */
export async function requireStaff(ctx) {
  const cookies = parseCookieHeader(ctx.req.headers.cookie ?? '');

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookies,
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            ctx.res.appendHeader(
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
    return { redirect: { destination: '/sign-in', permanent: false } };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id, name, role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!profile || (profile.role !== 'astrologer' && profile.role !== 'admin')) {
    return { redirect: { destination: '/', permanent: false } };
  }

  return { props: { profile } };
}
