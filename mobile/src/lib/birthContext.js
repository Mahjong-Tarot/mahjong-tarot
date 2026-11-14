import { createContext, createElement, useCallback, useContext, useEffect, useState } from 'react';
import { loadBirth, saveBirth } from './birth';
import { useAuth } from './auth';
import { supabase } from './supabase';
import { profileFromBirth } from './birth';

const BirthContext = createContext(null);

export function BirthProvider({ children }) {
  const { user, profile, refreshProfile } = useAuth();
  const [birth, setBirth] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => { loadBirth().then((b) => { setBirth(b); setReady(true); }); }, []);

  // After sign-in the auth layer may replace the phone's details with the
  // account's; pick that up.
  useEffect(() => { if (profile?.birthday) loadBirth().then(setBirth); }, [profile?.birthday, profile?.birth_time, profile?.gender]);

  const update = useCallback(async (next) => {
    const merged = { ...next, name: next.name ?? birth?.name ?? null };
    await saveBirth(merged);
    setBirth(merged);
    if (user) {
      await supabase.from('profiles').upsert({ user_id: user.id, ...profileFromBirth(merged) }, { onConflict: 'user_id' });
      await refreshProfile();
    }
  }, [birth, user, refreshProfile]);

  return createElement(BirthContext.Provider, { value: { birth, ready, update } }, children);
}

export function useBirth() {
  return useContext(BirthContext);
}
