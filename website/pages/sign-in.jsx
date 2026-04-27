import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import styles from '../styles/Account.module.css';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push('/dashboard');
  };

  return (
    <>
      <Head>
        <title>Sign In | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <main className={`container ${styles.authCenter}`}>
        <div className={styles.authCard}>
          <h1 className={styles.authTitle}>Sign in</h1>
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
                autoComplete="current-password"
                className={styles.authInput}
              />
            </label>
            {error && <p className={styles.authError}>{error}</p>}
            <button type="submit" disabled={submitting} className={styles.authSubmit}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className={styles.authFootnote}>
            New here? <Link href="/sign-up">Create an account</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
