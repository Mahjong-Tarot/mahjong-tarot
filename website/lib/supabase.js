import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Cookie-backed client so the same session is visible to server-side
// gates (requirePortalUser / requireAdmin) on the next request. Drop-in
// SupabaseClient API — only persistence behaviour changes vs. createClient.
export const supabase = supabaseUrl
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : null;
