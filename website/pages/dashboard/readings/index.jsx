import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import { useAuth } from '../../../lib/auth';
import styles from '../../../styles/Account.module.css';

export default function MyReadings() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace('/sign-in');
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <>
      <Head>
        <title>Your Readings | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <main className={`container ${styles.wrap}`}>
        <h1 className={styles.title}>Your readings</h1>
        <p className={styles.lede}>
          Past reading results Bill has shared with you will appear here.
        </p>

        <div className={styles.placeholder}>
          <p style={{ margin: 0 }}>
            No readings yet. <Link href="/readings">Book a reading</Link> to get started.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
