import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { useAuth } from '../../lib/auth';
import styles from '../../styles/Account.module.css';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace('/sign-in');
  }, [loading, user, router]);

  if (loading || !user) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <>
      <Head>
        <title>Profile | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <main className={`container ${styles.authCenter}`}>
        <div className={styles.authCard}>
          <h1 className={styles.authTitle}>Profile</h1>
          <p className={styles.authLede}>Signed in as <strong>{user.email}</strong>.</p>
          <div style={{ marginTop: '1.5rem' }}>
            <button type="button" onClick={handleSignOut} className={styles.authSubmit}>
              Sign out
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
