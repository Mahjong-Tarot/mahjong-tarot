import { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminShell from '../../../components/AdminShell';
import SubscriptionIcon from '../../../components/SubscriptionIcon';
import { supabase } from '../../../lib/supabase';
import { requireAdmin } from '../../../lib/requireAdmin';
import { listClients } from '../../../lib/clients';
import adminStyles from '../../../styles/PortalAdmin.module.css';
import styles from '../../../styles/PortalClients.module.css';

export async function getServerSideProps(ctx) {
  return requireAdmin(ctx);
}

export default function ClientsListPage({ profile }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) {
      setError('Supabase not configured.');
      setLoading(false);
      return;
    }
    listClients(supabase)
      .then((rows) => setClients(rows))
      .catch((err) => setError(err.message || 'Failed to load clients.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) =>
      [c.full_name, c.email, c.phone].filter(Boolean).some((v) => v.toLowerCase().includes(q))
    );
  }, [clients, search]);

  return (
    <>
      <Head>
        <title>Clients | Mahjong Tarot Portal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminShell profile={profile}>
          <div className={styles.header}>
            <div>
              <p className={adminStyles.pageEyebrow}>Admin</p>
              <h1 className={adminStyles.pageTitle}>Private readings</h1>
            </div>
            <Link href="/admin/private-readings/new" className={styles.newBtn}>+ New client</Link>
          </div>

          <div className={styles.toolbar}>
            <input
              type="search"
              placeholder="Search by name, email, or phone"
              className={styles.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className={styles.count}>
              {loading ? '…' : `${filtered.length} of ${clients.length}`}
            </span>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          {loading ? (
            <p className={styles.empty}>Loading clients…</p>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              {clients.length === 0
                ? <>No clients yet. <Link href="/admin/private-readings/new" className={styles.emptyLink}>Add your first one →</Link></>
                : 'No matches for that search.'}
            </div>
          ) : (
            <ul className={styles.list}>
              {filtered.map((c) => (
                <li key={c.id} className={styles.row}>
                  <Link href={`/admin/private-readings/${c.id}`} className={styles.rowLink}>
                    <div className={styles.rowName}>{c.full_name}</div>
                    <div className={styles.rowMeta}>
                      {c.email && <span>{c.email}</span>}
                      {c.phone && <span>{c.phone}</span>}
                      {c.birthday && <span>{c.birthday}</span>}
                    </div>
                    <span className={styles.statusCell}>
                      <SubscriptionIcon status={c.subscription_status} showLabel />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
      </AdminShell>
    </>
  );
}
