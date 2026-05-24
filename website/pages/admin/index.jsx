import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminShell from '../../components/AdminShell';
import { supabase } from '../../lib/supabase';
import { requirePage } from '../../lib/guards';
import { RECENT_CUSTOMER_SINCE } from '../../lib/admin-people';
import styles from '../../styles/PortalAdmin.module.css';

export async function getServerSideProps(ctx) {
  return requirePage('admin')(ctx);
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
  const [recentDeals, setRecentDeals] = useState([]);
  const [stats, setStats] = useState({
    people: 0,
    customers: 0,
    premiumSubscribers: 0,
    booksSold: 0,
    revenueCents: 0,
  });
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
        const [countsRes, recentRes, peopleRes, premiumRes, booksRes, allDealsRes, recentDealsRes] = await Promise.all([
          supabase.rpc('get_inquiry_counts'),
          supabase
            .from('inquiries')
            .select('id, type, status, created_at, person_id, people(name, email)')
            .order('created_at', { ascending: false })
            .limit(10),
          supabase.from('people').select('id', { count: 'exact', head: true }),
          supabase
            .from('profiles')
            .select('user_id', { count: 'exact', head: true })
            .eq('is_premium', true),
          supabase
            .from('book_orders')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'paid'),
          // All won deals — drives Customers (recent, dedupe by person)
          // and Total Revenue (all-time sum). One query, two derived stats.
          supabase
            .from('deals')
            .select('person_id, won_at, amount_cents')
            .eq('status', 'won'),
          supabase
            .from('deals')
            .select('id, amount_cents, currency, source, won_at, person_id, people(name, email)')
            .eq('status', 'won')
            .order('won_at', { ascending: false })
            .limit(5),
        ]);

        if (countsRes.error)      throw countsRes.error;
        if (recentRes.error)      throw recentRes.error;
        if (peopleRes.error)      throw peopleRes.error;
        if (premiumRes.error)     throw premiumRes.error;
        if (booksRes.error)       throw booksRes.error;
        if (allDealsRes.error)    throw allDealsRes.error;
        if (recentDealsRes.error) throw recentDealsRes.error;

        // Total revenue = sum of all won deal amounts (all-time).
        const revenueCents = (allDealsRes.data || []).reduce((sum, d) => sum + (d.amount_cents || 0), 0);

        // Customers = people whose MOST RECENT won deal lands on/after the
        // RECENT_CUSTOMER_SINCE cutoff. Matches the /admin/people definition.
        const latestDealByPerson = new Map();
        for (const d of (allDealsRes.data || [])) {
          if (!d.person_id || !d.won_at) continue;
          const prev = latestDealByPerson.get(d.person_id);
          if (!prev || d.won_at > prev) latestDealByPerson.set(d.person_id, d.won_at);
        }
        let customers = 0;
        for (const latest of latestDealByPerson.values()) {
          if (latest >= RECENT_CUSTOMER_SINCE) customers += 1;
        }

        setCounts(countsRes.data ?? []);
        setRecent(recentRes.data ?? []);
        setRecentDeals(recentDealsRes.data ?? []);
        setStats({
          people:             peopleRes.count  ?? 0,
          customers,
          premiumSubscribers: premiumRes.count ?? 0,
          booksSold:          booksRes.count   ?? 0,
          revenueCents,
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

      <AdminShell profile={profile}>
          <p className={styles.pageEyebrow}>Admin</p>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageLede}>
            Pipeline state across every contact form, booking and newsletter signup.
          </p>

          {error && <p className="error-block">{error}</p>}
          {loading && !error && <p className={styles.muted}>Loading…</p>}

          {!loading && !error && (
            <>
              <div className={styles.statRow}>
                <Link href="/admin/people" className={styles.statCard}>
                  <p className={styles.statLabel}>People</p>
                  <p className={styles.statValue}>{stats.people}</p>
                  <p className={styles.statHint}>Total contacts</p>
                </Link>
                <Link href="/admin/people" className={styles.statCard}>
                  <p className={styles.statLabel}>Customers</p>
                  <p className={styles.statValue}>{stats.customers}</p>
                  <p className={styles.statHint}>Since {RECENT_CUSTOMER_SINCE}</p>
                </Link>
                <Link href="/admin/people" className={styles.statCard}>
                  <p className={styles.statLabel}>Premium Subscribers</p>
                  <p className={styles.statValue}>{stats.premiumSubscribers}</p>
                  <p className={styles.statHint}>Paid portal members</p>
                </Link>
                <Link href="/admin/sales" className={styles.statCard}>
                  <p className={styles.statLabel}>Books Sold</p>
                  <p className={styles.statValue}>{stats.booksSold}</p>
                  <p className={styles.statHint}>Paid book orders</p>
                </Link>
                <Link href="/admin/sales" className={styles.statCard}>
                  <p className={styles.statLabel}>Total Revenue</p>
                  <p className={styles.statValue}>${(stats.revenueCents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                  <p className={styles.statHint}>Won deals to date</p>
                </Link>
              </div>

              <div className={styles.gridTwo}>
                <section className={styles.panel}>
                  <header className={styles.panelHeader}>
                    <h2 className={styles.panelTitle}>Inquiries by type</h2>
                    <Link href="/admin/inquiries" className={styles.panelLink}>View all →</Link>
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
                    <Link href="/admin/inquiries" className={styles.panelLink}>View board →</Link>
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
                  <h2 className={styles.panelTitle}>Recent deals</h2>
                  <Link href="/admin/sales" className={styles.panelLink}>View sales →</Link>
                </header>
                {recentDeals.length === 0 ? (
                  <p className={styles.muted}>No closed deals yet.</p>
                ) : (
                  <ul className={styles.feed}>
                    {recentDeals.map((d) => {
                      const who = d.people?.name || d.people?.email || 'unknown';
                      const amt = `$${((d.amount_cents || 0) / 100).toFixed(2)}`;
                      return (
                        <li key={d.id} className={styles.feedItem}>
                          <span className={styles.feedTime}>{d.won_at ? relTime(d.won_at) : '—'}</span>
                          <span className={styles.feedTitle}>
                            {amt} won
                            <span className={styles.feedDetail}> · {who} · {d.source}</span>
                          </span>
                          <span className={styles.feedStage}>{(d.currency || 'usd').toUpperCase()}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

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
      </AdminShell>
    </>
  );
}
