import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import { useAuth } from '../../../lib/auth';
import { supabase } from '../../../lib/supabase';
import styles from '../../../styles/Account.module.css';

export default function InnerCircleList() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [members, setMembers] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/sign-in');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !supabase) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('inner_circle')
        .select('id, name, relationship, birthday')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (cancelled) return;
      setMembers(data || []);
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (loading || !user) return null;

  const handleDelete = async (id, name) => {
    if (!confirm(`Remove ${name} from your Inner Circle?`)) return;
    const { error } = await supabase.from('inner_circle').delete().eq('id', id);
    if (!error) setMembers(members.filter((m) => m.id !== id));
  };

  return (
    <>
      <Head>
        <title>Inner Circle | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <main className={`container ${styles.wrap}`}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className={styles.title}>Inner circle</h1>
            <p className={styles.lede}>Wife, partners, parents, kids — anyone whose chart you want to keep close.</p>
          </div>
          <Link href="/dashboard/inner-circle/new" className={styles.authSubmit} style={{ textDecoration: 'none', display: 'inline-block' }}>
            + Add person
          </Link>
        </div>

        {loaded && members.length === 0 && (
          <div className={styles.placeholder} style={{ marginTop: '1.5rem' }}>
            <p style={{ margin: 0 }}>
              No one in your inner circle yet. <Link href="/dashboard/inner-circle/new">Add your first person</Link>.
            </p>
          </div>
        )}

        <div style={{ marginTop: '1.5rem' }}>
          {members.map((m) => (
            <div key={m.id} className={styles.icMember}>
              <div className={styles.icMemberInfo}>
                <h3>{m.name}</h3>
                <span>{m.relationship}{m.birthday ? ` · ${m.birthday}` : ''}</span>
              </div>
              <div className={styles.icActions}>
                <Link href={`/dashboard/inner-circle/${m.id}`} className={styles.btnGhost} style={{ textDecoration: 'none' }}>
                  View
                </Link>
                <Link href={`/dashboard/inner-circle/${m.id}/edit`} className={styles.btnGhost} style={{ textDecoration: 'none' }}>
                  Edit
                </Link>
                <button type="button" onClick={() => handleDelete(m.id, m.name)} className={styles.btnDanger}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className={styles.authFootnote} style={{ marginTop: '2rem' }}>
          <Link href="/dashboard">← Back to dashboard</Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
