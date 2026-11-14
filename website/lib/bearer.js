import { createClient } from '@supabase/supabase-js';

// Auth for API routes called by the iPhone app. The app has no cookies; it
// sends the member's Supabase access token as "Authorization: Bearer <jwt>".
// Returns a Supabase client scoped to that user (RLS applies) plus the user.
export async function requireBearer(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return { ok: false, status: 401, error: 'Not signed in.' };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return { ok: false, status: 500, error: 'Supabase is not configured.' };

  const supabase = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return { ok: false, status: 401, error: 'Not signed in.' };
  return { ok: true, supabase, user: data.user };
}
