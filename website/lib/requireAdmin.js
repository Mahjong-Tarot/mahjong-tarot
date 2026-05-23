import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from '@supabase/ssr';

/**
 * getServerSideProps helper for admin-only pages (/admin).
 *
 * Same shape as requirePortalUser but only role === 'admin' is allowed.
 * Astrologers are redirected to the portal home.
 */
export async function requireAdmin(ctx) {
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

  if (!profile || profile.role !== 'admin') {
    return {
      redirect: {
        destination: profile?.role === 'astrologer' ? '/admin/sessions' : '/',
        permanent: false,
      },
    };
  }

  return { props: { profile } };
}
