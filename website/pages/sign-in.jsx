import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import styles from '../styles/Account.module.css';

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);

  const isSignUp = mode === 'signup';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      setSubmitting(false);
      if (error) { setError(error.message); return; }
      if (data.session) router.push('/dashboard');
      else setPendingConfirmation(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setSubmitting(false);
      if (error) { setError(error.message); return; }
      router.push('/dashboard');
    }
  };

  const switchMode = () => {
    setMode(isSignUp ? 'signin' : 'signup');
    setError('');
    setPendingConfirmation(false);
  };

  return (
    <>
      <Head>
        <title>{isSignUp ? 'Create account' : 'Sign in'} | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <main className={`container ${styles.authCenter}`}>
        <div className={styles.authCard}>
          <h1 className={styles.authTitle}>{isSignUp ? 'Create account' : 'Sign in'}</h1>

          {pendingConfirmation ? (
            <p className={styles.authLede}>
              Check your inbox at <strong>{email}</strong> to confirm your account.
              You can close this tab, once confirmed, sign in to continue.
            </p>
          ) : (
            <>
              <form onSubmit={handleSubmit} className={styles.authForm}>
                <label className={styles.authLabel}>
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className={styles.authInput}
                  />
                </label>
                <label className={styles.authLabel}>
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    minLength={isSignUp ? 8 : undefined}
                    className={styles.authInput}
                  />
                </label>
                {error && <p className={styles.authError}>{error}</p>}
                <button type="submit" disabled={submitting} className={styles.authSubmit}>
                  {submitting ? (isSignUp ? 'Creating account…' : 'Signing in…') : (isSignUp ? 'Sign up' : 'Sign in')}
                </button>
              </form>
              <p className={styles.authFootnote}>
                {isSignUp ? 'Already have an account?' : 'New here?'}{' '}
                <button type="button" onClick={switchMode} className={styles.authToggle}>
                  {isSignUp ? 'Sign in' : 'Create an account'}
                </button>
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
