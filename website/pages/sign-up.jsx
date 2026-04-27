import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import styles from '../styles/Account.module.css';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.push('/dashboard');
    } else {
      setPendingConfirmation(true);
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <main className={`container ${styles.authCenter}`}>
        <div className={styles.authCard}>
          <h1 className={styles.authTitle}>Create account</h1>
          {pendingConfirmation ? (
            <p className={styles.authLede}>
              Check your inbox at <strong>{email}</strong> to confirm your account.
              You can close this tab — once confirmed, sign in to continue.
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
                    autoComplete="new-password"
                    minLength={8}
                    className={styles.authInput}
                  />
                </label>
                {error && <p className={styles.authError}>{error}</p>}
                <button type="submit" disabled={submitting} className={styles.authSubmit}>
                  {submitting ? 'Creating account…' : 'Sign up'}
                </button>
              </form>
              <p className={styles.authFootnote}>
                Already have an account? <Link href="/sign-in">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
