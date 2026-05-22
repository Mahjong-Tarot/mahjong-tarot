import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import PortalNav from '../../../components/PortalNav';
import { supabase } from '../../../lib/supabase';
import { requireAdmin } from '../../../lib/requireAdmin';
import portalStyles from '../../../styles/Portal.module.css';
import styles from '../../../styles/PortalAdmin.module.css';

export async function getServerSideProps(ctx) {
  return requireAdmin(ctx);
}

const PIPELINE_LABELS = {
  new_lead:       'New lead',
  contacted:      'Contacted',
  discovery_call: 'Discovery call',
  proposal:       'Proposal',
  won:            'Won',
  lost:           'Lost',
  archived:       'Archived',
};

const TYPE_LABELS = {
  contact:      'Contact',
  newsletter:   'Newsletter',
  booking:      'Booking',
  reading:      'Reading',
  consultation: 'Consultation',
  general:      'General',
};

function relTime(value) {
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function AdminDashboard({ profile }) {
  const [counts, setCounts] = useState([]);
  const [recent, setRecent] = useState([]);
  const [stats, setStats] = useState({ people: 0, clients: 0, last7: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!supabase) {
        setError('Supabase not configured.');
        setLoading(false);
        return;
      }
      try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const [countsRes, recentRes, peopleRes, clientsRes, last7Res] = await Promise.all([
          supabase.rpc('get_inquiry_counts'),
          supabase
            .from('inquiries')
            .select('id, type, status, created_at, person_id, people(name, email)')
            .order('created_at', { ascending: false })
            .limit(10),
          supabase.from('people').select('id', { count: 'exact', head: true }),
          supabase.from('clients').select('id', { count: 'exact', head: true }),
          supabase
            .from('inquiries')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', sevenDaysAgo),
        ]);

        if (countsRes.error)  throw countsRes.error;
        if (recentRes.error)  throw recentRes.error;
        if (peopleRes.error)  throw peopleRes.error;
        if (clientsRes.error) throw clientsRes.error;
        if (last7Res.error)   throw last7Res.error;

        setCounts(countsRes.data ?? []);
        setRecent(recentRes.data ?? []);
        setStats({
          people:  peopleRes.count  ?? 0,
          clients: clientsRes.count ?? 0,
          last7:   last7Res.count   ?? 0,
        });
      } catch (e) {
        setError(e.message || 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const byType = Object.keys(TYPE_LABELS).map((t) => ({
    id: t,
    label: TYPE_LABELS[t],
    count: counts.filter((r) => r.type === t && r.status !== 'archived').reduce((s, r) => s + Number(r.count), 0),
  }));
  const byStage = Object.keys(PIPELINE_LABELS).filter((s) => s !== 'archived').map((s) => ({
    id: s,
    label: PIPELINE_LABELS[s],
    count: counts.filter((r) => r.status === s).reduce((sum, r) => sum + Number(r.count), 0),
  }));

  const totalOpen = byType.reduce((s, t) => s + t.count, 0);
  const maxType  = Math.max(1, ...byType.map((t) => t.count));
  const maxStage = Math.max(1, ...byStage.map((s) => s.count));

  return (
    <>
      <Head>
        <title>Admin Dashboard | Mahjong Tarot Portal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={portalStyles.shell}>
        <PortalNav profile={profile} />
        <main className={portalStyles.main}>
          <p className={portalStyles.eyebrow}>Admin</p>
          <h1 className={portalStyles.h1}>Dashboard</h1>
          <p className={portalStyles.lede}>
            Pipeline state across every contact form, booking and newsletter signup.
          </p>

          {error && <p className={styles.error}>{error}</p>}
          {loading && !error && <p className={styles.muted}>Loading…</p>}

          {!loading && !error && (
            <>
              <div className={styles.statRow}>
                <Link href="/portal/admin/people" className={styles.statCard}>
                  <p className={styles.statLabel}>People</p>
                  <p className={styles.statValue}>{stats.people}</p>
                  <p className={styles.statHint}>Total contacts</p>
                </Link>
                <Link href="/portal/clients" className={styles.statCard}>
                  <p className={styles.statLabel}>Clients</p>
                  <p className={styles.statValue}>{stats.clients}</p>
                  <p className={styles.statHint}>In astrologer portal</p>
                </Link>
                <Link href="/portal/admin/inquiries" className={styles.statCard}>
                  <p className={styles.statLabel}>Inquiries 7d</p>
                  <p className={styles.statValue}>{stats.last7}</p>
                  <p className={styles.statHint}>{totalOpen} open total</p>
                </Link>
                <Link href="/portal/admin/conversions" className={styles.statCard}>
                  <p className={styles.statLabel}>Conversions</p>
                  <p className={styles.statValue}>→</p>
                  <p className={styles.statHint}>Subscription targets</p>
                </Link>
              </div>

              <div className={styles.gridTwo}>
                <section className={styles.panel}>
                  <header className={styles.panelHeader}>
                    <h2 className={styles.panelTitle}>Inquiries by type</h2>
                    <Link href="/portal/admin/inquiries" className={styles.panelLink}>View all →</Link>
                  </header>
                  <ul className={styles.barList}>
                    {byType.map((t) => (
                      <li key={t.id} className={styles.barRow}>
                        <span className={styles.barLabel}>{t.label}</span>
                        <div className={styles.barTrack}>
                          <div
                            className={styles.barFill}
                            style={{ width: `${(t.count / maxType) * 100}%` }}
                          />
                        </div>
                        <span className={styles.barCount}>{t.count}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className={styles.panel}>
                  <header className={styles.panelHeader}>
                    <h2 className={styles.panelTitle}>Pipeline by stage</h2>
                    <Link href="/portal/admin/inquiries" className={styles.panelLink}>View board →</Link>
                  </header>
                  <ul className={styles.barList}>
                    {byStage.map((s) => (
                      <li key={s.id} className={styles.barRow}>
                        <span className={styles.barLabel}>{s.label}</span>
                        <div className={styles.barTrack}>
                          <div
                            className={`${styles.barFill} ${styles[`stage_${s.id}`] || ''}`}
                            style={{ width: `${(s.count / maxStage) * 100}%` }}
                          />
                        </div>
                        <span className={styles.barCount}>{s.count}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <section className={styles.panel}>
                <header className={styles.panelHeader}>
                  <h2 className={styles.panelTitle}>Recent activity</h2>
                </header>
                {recent.length === 0 ? (
                  <p className={styles.muted}>No recent inquiries.</p>
                ) : (
                  <ul className={styles.feed}>
                    {recent.map((r) => {
                      const person = r.people?.name || r.people?.email || 'unknown';
                      return (
                        <li key={r.id} className={styles.feedItem}>
                          <span className={styles.feedTime}>{relTime(r.created_at)}</span>
                          <span className={styles.feedTitle}>
                            New {TYPE_LABELS[r.type] || r.type} inquiry
                            <span className={styles.feedDetail}> · {person}</span>
                          </span>
                          <span className={styles.feedStage}>{PIPELINE_LABELS[r.status] || r.status}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </>
  );
}
