import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { useAuth } from '../../lib/auth';
import styles from '../../styles/Account.module.css';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace('/sign-in');
  }, [loading, user, router]);

  if (loading || !user) return null;

  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || '';
  const greeting = name ? `, ${name}` : '';

  return (
    <>
      <Head>
        <title>Dashboard | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <main className={`container ${styles.wrap}`}>
        <h1 className={styles.title}>Welcome{greeting}</h1>
        <p className={styles.lede}>Your Mahjong Tarot home.</p>

        <div className={styles.cards}>
          <Link href="/dashboard/readings" className={styles.card}>
            <h2>Your readings</h2>
            <p>Review past readings Bill has shared with you.</p>
          </Link>
          <Link href="/firepig" className={styles.card}>
            <h2>FirePig</h2>
            <p>Talk to Bill&apos;s AI guide.</p>
          </Link>
          <Link href="/profile" className={styles.card}>
            <h2>Profile</h2>
            <p>Manage your account details.</p>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
