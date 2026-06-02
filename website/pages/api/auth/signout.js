// POST /api/auth/signout
// Authoritatively clears the Supabase auth cookies server-side.
//
// The browser signOut() can hang in prod (the SDK call never resolves)
// or finish without fully clearing the cookie, leaving the SSR session
// cookie intact — so the next request is still authenticated and the
// user appears signed in. This route rebuilds the cookie-aware server
// client and signs out, which writes expired Set-Cookie headers back to
// the browser. scope:'local' means no network call to GoTrue, so it
// can't hang.
import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from '@supabase/ssr';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
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

  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch (err) {
    // Even if GoTrue errors, the setAll above has already queued the
    // expired cookies — so we still return ok.
    console.error('[api/auth/signout]', err);
  }

  return res.status(200).json({ ok: true });
}
