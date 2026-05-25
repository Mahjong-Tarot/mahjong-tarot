import { useState } from 'react';
import Head from 'next/head';
import AdminShell from '../../components/AdminShell';
import { requirePage } from '../../lib/guards';
import { getServiceSupabase } from '../../lib/stripe';
import styles from '../../styles/PortalAdmin.module.css';
import tableStyles from '../../styles/PortalAdminTable.module.css';

export async function getServerSideProps(ctx) {
  // Reuse the admin guard — redirects non-admins before we ever query.
  const guarded = await requirePage('admin')(ctx);
  if ('redirect' in guarded || 'notFound' in guarded) return guarded;

  // RLS on `profiles` only allows reading your own row, so the admin's
  // browser query returns nothing. Fetch with the service role on the server
  // and hand the list to the client as a prop.
  const service = getServiceSupabase();
  const { data: rows, error } = await service
    .from('profiles')
    .select('user_id, name')
    .eq('role', 'astrologer')
    .order('name', { ascending: true });

  if (error) {
    return {
      props: { ...guarded.props, astrologers: [], loadError: error.message },
    };
  }

  // Look up email per astrologer via Supabase Admin API. The list is tiny
  // (a handful of practitioners) — per-row calls are fine here.
  const astrologers = await Promise.all(
    (rows || []).map(async (r) => {
      const { data } = await service.auth.admin.getUserById(r.user_id);
      return {
        user_id: r.user_id,
        name: r.name || '',
        email: data?.user?.email || '',
      };
    }),
  );

  return { props: { ...guarded.props, astrologers, loadError: '' } };
}

export default function AdminAstrologers({ profile, astrologers, loadError }) {
  const [error, setError]         = useState(loadError || '');
  const [pendingId, setPendingId] = useState(null);

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
            {astrologers.length} {astrologers.length === 1 ? 'astrologer' : 'astrologers'}
          </p>
        </div>

        {astrologers.length === 0 && (
          <p className={styles.muted}>No astrologers found.</p>
        )}

        {astrologers.length > 0 && (
          <div className={tableStyles.tableWrap}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {astrologers.map((a) => (
                  <tr key={a.user_id}>
                    <td>{a.name || <span className={styles.muted}>(no name)</span>}</td>
                    <td>{a.email || <span className={styles.muted}>—</span>}</td>
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
