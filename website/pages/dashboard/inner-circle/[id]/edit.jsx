import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Nav from '../../../../components/Nav';
import Footer from '../../../../components/Footer';
import MemberForm from '../../../../components/MemberForm';
import { useAuth } from '../../../../lib/auth';
import { supabase } from '../../../../lib/supabase';
import styles from '../../../../styles/Account.module.css';

export default function EditMember() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useAuth();
  const [member, setMember] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/sign-in');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !id || !supabase) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('inner_circle')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      setMember(data);
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user, id]);

  if (loading || !user) return null;

  return (
    <>
      <Head>
        <title>Edit member | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <main className={`container ${styles.wrap}`}>
        <h1 className={styles.title}>Edit {member?.name || 'member'}</h1>
        <div style={{ marginTop: '1.5rem' }}>
          {loaded && !member ? (
            <p className={styles.muted}>Not found.</p>
          ) : (
            member && <MemberForm userId={user.id} initial={member} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
