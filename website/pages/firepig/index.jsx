import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { useAuth } from '../../lib/auth';
import styles from '../../styles/Account.module.css';

export default function FirePig() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace('/sign-in');
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <>
      <Head>
        <title>FirePig | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <main className={`container ${styles.wrap}`}>
        <h1 className={styles.title}>FirePig</h1>
        <p className={styles.lede}>Bill&apos;s AI guide.</p>

        <div className={styles.placeholder}>
          <p style={{ margin: 0 }}>
            FirePig is coming soon. The chat interface will live here.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
