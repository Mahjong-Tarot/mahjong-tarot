import { useEffect, useState } from 'react';
import Head from 'next/head';
import AdminShell from '../../components/AdminShell';
import { supabase } from '../../lib/supabase';
import { requirePage } from '../../lib/guards';
import styles from '../../styles/PortalAdmin.module.css';
import tableStyles from '../../styles/PortalAdminTable.module.css';

export async function getServerSideProps(ctx) {
  return requirePage('admin')(ctx);
}

export default function AdminAstrologers({ profile }) {
  const [astrologers, setAstrologers] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [pendingId, setPendingId]     = useState(null);

  useEffect(() => {
    if (!supabase) {
      setError('Supabase not configured.');
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error: e } = await supabase
        .from('profiles')
        .select('user_id, name')
        .eq('role', 'astrologer')
        .order('name', { ascending: true });
      if (e) setError(e.message);
      else setAstrologers(data || []);
      setLoading(false);
    })();
  }, []);

  async function viewAs(userId) {
    setPendingId(userId);
    setError('');
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not start impersonation.');
      // Magic link consumes the admin session and signs the browser in as the
      // astrologer. To return, the admin signs back in as themselves.
      window.location.href = json.url;
    } catch (e) {
      setError(e.message);
      setPendingId(null);
    }
  }

  return (
    <>
      <Head>
        <title>Astrologers | Mahjong Tarot Portal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminShell profile={profile}>
        <p className={styles.pageEyebrow}>Admin</p>
        <h1 className={styles.pageTitle}>Astrologers</h1>
        <p className={styles.pageLede}>
          Click <strong>View as</strong> to sign in as the astrologer and see the portal exactly
          as they do. This signs you out of your admin account — to return, sign back in as yourself.
        </p>

        {error && <p className="error-block">{error}</p>}

        <div className={tableStyles.controlsRow}>
          <p className={tableStyles.count}>
            {loading
              ? 'Loading…'
              : `${astrologers.length} ${astrologers.length === 1 ? 'astrologer' : 'astrologers'}`}
          </p>
        </div>

        {!loading && astrologers.length === 0 && (
          <p className={styles.muted}>No astrologers found.</p>
        )}

        {!loading && astrologers.length > 0 && (
          <div className={tableStyles.tableWrap}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {astrologers.map((a) => (
                  <tr key={a.user_id}>
                    <td>{a.name || <span className={styles.muted}>(no name)</span>}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => viewAs(a.user_id)}
                        disabled={pendingId === a.user_id}
                      >
                        {pendingId === a.user_id ? 'Signing in…' : 'View as'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminShell>
    </>
  );
}
