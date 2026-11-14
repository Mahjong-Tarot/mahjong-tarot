export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
export const SITE_URL = (process.env.EXPO_PUBLIC_SITE_URL || 'https://www.mahjongtarot.com').replace(/\/$/, '');

// Sign-in and confirm-email links come back to the app through this
// Universal Link (claimed in /.well-known/apple-app-site-association).
export const AUTH_REDIRECT = `${SITE_URL}/app/auth-callback`;
