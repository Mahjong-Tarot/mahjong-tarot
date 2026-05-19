import { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import PortalNav from '../../../components/PortalNav';
import { supabase } from '../../../lib/supabase';
import { requirePortalUser } from '../../../lib/requirePortalUser';
import { listClients } from '../../../lib/clients';
import portalStyles from '../../../styles/Portal.module.css';
import styles from '../../../styles/PortalClients.module.css';

export async function getServerSideProps(ctx) {
  return requirePortalUser(ctx);
}

const SUB_LABEL = {
  none: 'Not subscribed',
  active: 'Subscribed',
  lapsed: 'Lapsed',
  cancelled: 'Cancelled',
};

const SUB_CLASS = {
  none: 'subNone',
  active: 'subActive',
  lapsed: 'subLapsed',
  cancelled: 'subCancelled',
};

export default function ClientsListPage({ profile }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('[clients-debug] effect fired, supabase=', !!supabase);
    if (!supabase) {
      console.log('[clients-debug] supabase is null — aborting');
      setError('Supabase not configured.');
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data, error }) => {
      console.log('[clients-debug] getSession:', { hasSession: !!data?.session, hasUser: !!data?.session?.user, error: error?.message });
    });
    console.log('[clients-debug] calling listClients…');
    const t0 = performance.now();
    listClients(supabase)
      .then((rows) => {
        const ms = Math.round(performance.now() - t0);
        console.log('[clients-debug] listClients resolved in', ms, 'ms with', rows?.length, 'rows');
        setClients(rows);
      })
      .catch((err) => {
        const ms = Math.round(performance.now() - t0);
        console.error('[clients-debug] listClients rejected after', ms, 'ms:', err);
        setError(err.message || 'Failed to load clients.');
      })
      .finally(() => {
        console.log('[clients-debug] finally — setting loading=false');
        setLoading(false);
      });
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

      <div className={portalStyles.shell}>
        <PortalNav profile={profile} />

        <main className={portalStyles.main}>
          <div className={styles.header}>
            <div>
              <p className={portalStyles.eyebrow}>Portal · Clients</p>
              <h1 className={portalStyles.h1}>Clients</h1>
            </div>
            <Link href="/portal/clients/new" className={styles.newBtn}>+ New client</Link>
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
                ? <>No clients yet. <Link href="/portal/clients/new" className={styles.emptyLink}>Add your first one →</Link></>
                : 'No matches for that search.'}
            </div>
          ) : (
            <ul className={styles.list}>
              {filtered.map((c) => (
                <li key={c.id} className={styles.row}>
                  <Link href={`/portal/clients/${c.id}`} className={styles.rowLink}>
                    <div className={styles.rowName}>{c.full_name}</div>
                    <div className={styles.rowMeta}>
                      {c.email && <span>{c.email}</span>}
                      {c.phone && <span>{c.phone}</span>}
                      {c.birthday && <span>{c.birthday}</span>}
                    </div>
                    <span className={`${styles.badge} ${styles[SUB_CLASS[c.subscription_status]] || ''}`}>
                      {SUB_LABEL[c.subscription_status] || c.subscription_status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </>
  );
}
