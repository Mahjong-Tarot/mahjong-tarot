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
    if (supabase) await supabase.auth.signOut();
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
