import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import MemberForm from '../../../components/MemberForm';
import { useAuth } from '../../../lib/auth';
import styles from '../../../styles/Account.module.css';

export default function NewMember() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace('/sign-in');
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <>
      <Head>
        <title>Add to Inner Circle | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <main className={`container ${styles.wrap}`}>
        <h1 className={styles.title}>Add to inner circle</h1>
        <p className={styles.lede}>Their chart will be saved so you can compare any time.</p>
        <div style={{ marginTop: '1.5rem' }}>
          <MemberForm userId={user.id} />
        </div>
      </main>
      <Footer />
    </>
  );
}
