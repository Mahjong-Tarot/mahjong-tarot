import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from './supabase';
import { AUTH_REDIRECT } from './config';
import { loadBirth, saveBirth, birthFromProfile, profileFromBirth } from './birth';

const AuthContext = createContext(null);

async function loadProfile(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('user_id, name, birthday, birth_time, gender, created_at')
    .eq('user_id', userId)
    .maybeSingle();
  return data || null;
}

// The website creates a profiles row lazily, so the app does the same: on
// first sign-in it writes the birth details the guest entered on the phone
// (and the name from sign-up). If the account already has birth details,
// they replace the ones on the phone so My Chart shows the member's chart.
async function syncProfile(user) {
  let profile = await loadProfile(user.id);
  const local = await loadBirth();
  const meta = user.user_metadata || {};
  const metaName = [meta.first_name, meta.last_name].filter(Boolean).join(' ').trim();

  if (!profile?.birthday && local?.date) {
    const row = { user_id: user.id, ...profileFromBirth(local) };
    if (!profile?.name && (metaName || local.name)) row.name = metaName || local.name;
    const { data } = await supabase.from('profiles').upsert(row, { onConflict: 'user_id' })
      .select('user_id, name, birthday, birth_time, gender, created_at').maybeSingle();
    if (data) profile = data;
  } else if (profile?.birthday) {
    const fromProfile = birthFromProfile(profile);
    if (fromProfile) await saveBirth(fromProfile);
  }
  return profile;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!alive) return;
      setSession(data.session || null);
      if (data.session?.user) setProfile(await syncProfile(data.session.user));
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next || null);
      if (!next) setProfile(null);
      else if (event === 'SIGNED_IN') syncProfile(next.user).then(setProfile);
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return null;
    const p = await syncProfile(session.user);
    setProfile(p);
    return p;
  }, [session]);

  const value = useMemo(() => ({
    ready,
    session,
    user: session?.user || null,
    profile,
    refreshProfile,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    sendMagicLink: (email) => supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: AUTH_REDIRECT, shouldCreateUser: false },
    }),
    startTrial: ({ email, password, firstName, lastName, birth, newsletter }) => supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: AUTH_REDIRECT,
        data: {
          first_name: firstName,
          last_name: lastName,
          birthday: birth?.date || null,
          birth_time: birth?.time || null,
          newsletter: Boolean(newsletter),
          signup_source: 'app',
        },
      },
    }),
    resetPassword: (email) => supabase.auth.resetPasswordForEmail(email, { redirectTo: AUTH_REDIRECT }),
    exchangeCode: (code) => supabase.auth.exchangeCodeForSession(code),
    signOut: () => supabase.auth.signOut({ scope: 'local' }),
  }), [ready, session, profile, refreshProfile]);

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  return useContext(AuthContext);
}

// The website advertises a 90-day trial from sign-up; there is no trial
// column, so the app counts from the profile's creation date.
export function trialDaysLeft(profile, user) {
  const start = profile?.created_at || user?.created_at;
  if (!start) return null;
  const end = new Date(start).getTime() + 90 * 24 * 3600 * 1000;
  return Math.max(0, Math.ceil((end - Date.now()) / (24 * 3600 * 1000)));
}
