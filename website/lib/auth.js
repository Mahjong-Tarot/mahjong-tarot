import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext({
  user: null,
  loading: true,
  signOut: async () => {},
  profile: null,
  role: 'member',
  isPortalUser: false,
});

async function fetchProfile(userId) {
  if (!supabase || !userId) return null;
  const { data } = await supabase
    .from('profiles')
    .select('user_id, name, role, birthday, birth_time, birth_place, gender')
    .eq('user_id', userId)
    .maybeSingle();
  return data ?? null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return;
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      setProfile(await fetchProfile(sessionUser?.id));
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      setProfile(sessionUser ? await fetchProfile(sessionUser.id) : null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      if (supabase) {
        // scope:'local' clears the cookie + localStorage without waiting on
        // /auth/v1/logout. The race+timeout prevents the prod hang where the
        // SDK call never resolves and the handler never gets to redirect.
        await Promise.race([
          supabase.auth.signOut({ scope: 'local' }),
          new Promise((resolve) => setTimeout(resolve, 1500)),
        ]);
      }
    } catch (err) {
      console.error('signOut failed:', err);
    }
    // The browser signOut above can hang (or resolve via the 1500ms race
    // before the cookie is actually cleared), leaving the SSR auth cookie
    // intact so the next page load is still authenticated. Hit a server
    // route that authoritatively expires the cookie before we navigate.
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch (err) {
      console.error('server signOut failed:', err);
    }
    // Don't depend on onAuthStateChange firing — clear local state ourselves.
    setUser(null);
    setProfile(null);
  };

  // `profile.id` is the user's UUID (== profiles.user_id), not a separate row id.
  const role = profile?.role || 'member';
  const isPortalUser = role === 'astrologer' || role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, signOut, profile, role, isPortalUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
