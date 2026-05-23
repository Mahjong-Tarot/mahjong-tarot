import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import AdminShell from '../../components/AdminShell';
import { supabase } from '../../lib/supabase';
import { requireAdmin } from '../../lib/requireAdmin';
import styles from '../../styles/PortalAdmin.module.css';
import tableStyles from '../../styles/PortalAdminTable.module.css';

export async function getServerSideProps(ctx) {
  return requireAdmin(ctx);
}

const FILTERS = [
  { id: 'all',         label: 'All' },
  { id: 'customers',    label: 'Customers' },
  { id: 'members',     label: 'Portal members' },
  { id: 'subscribers', label: 'Subscribers' },
  { id: 'opted_out',   label: 'Opted out' },
];

const TYPE_LABELS = {
  contact:      'Contact',
  newsletter:   'Newsletter',
  booking:      'Booking',
  reading:      'Reading',
  consultation: 'Consultation',
  general:      'General',
};

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function relTime(value) {
  const diffMs = Date.now() - new Date(value).getTime();
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (days <= 0)  return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7)   return `${days}d ago`;
  if (days < 30)  return `${Math.floor(days / 7)}w ago`;
  return formatDate(value);
}

export default function AdminPeople({ profile }) {
  const [people, setPeople]       = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [profiles, setProfiles]   = useState([]);
  const [filter, setFilter]       = useState('all');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function load() {
      if (!supabase) {
        setError('Supabase not configured.');
        setLoading(false);
        return;
      }
      try {
        const [pRes, iRes, prRes] = await Promise.all([
          supabase
            .from('people').select('id, email, name, company, role, phone, ok_to_contact, source_site, created_at, updated_at, lifecycle_stage')
            .order('updated_at', { ascending: false }),
          supabase
            .from('inquiries')
            .select('person_id, type, status, created_at'),
          supabase
            .from('profiles')
            .select('user_id, person_id, role, is_premium, name'),
        ]);
        if (pRes.error)  throw pRes.error;
        if (iRes.error)  throw iRes.error;
        if (prRes.error) throw prRes.error;
        setPeople(pRes.data ?? []);
        setInquiries(iRes.data ?? []);
        setProfiles(prRes.data ?? []);
      } catch (e) {
        setError(e.message || 'Failed to load people.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const aggregated = useMemo(() => {
    const inquiriesByPerson = new Map();
    for (const i of inquiries) {
      if (!inquiriesByPerson.has(i.person_id)) inquiriesByPerson.set(i.person_id, []);
      inquiriesByPerson.get(i.person_id).push(i);
    }
    const profilesByPersonId = new Map();
    const profilesByName     = new Map(); // weak fallback — profiles lack email
    for (const pr of profiles) {
      if (pr.person_id) profilesByPersonId.set(pr.person_id, pr);
      if (pr.name)      profilesByName.set(pr.name.toLowerCase(), pr);
    }

    return people.map((p) => {
      const pInq    = inquiriesByPerson.get(p.id) ?? [];
      const memberProfile = profilesByPersonId.get(p.id)
        ?? (p.name ? profilesByName.get(p.name.toLowerCase()) : null);

      const types  = Array.from(new Set(pInq.map((i) => i.type))).sort();
      const subscriber = types.includes('newsletter');

      let lastActivity = p.updated_at || p.created_at;
      for (const i of pInq) if (i.created_at > lastActivity) lastActivity = i.created_at;

      return {
        ...p,
        types,
        inquiry_count: pInq.length,
        is_customer:   p.lifecycle_stage === 'customer',
        is_member:     !!memberProfile,
        is_subscriber: subscriber,
        last_activity: lastActivity,
      };
    }).sort((a, b) => (a.last_activity < b.last_activity ? 1 : -1));
  }, [people, inquiries, profiles]);

  const totals = useMemo(() => ({
    total:        aggregated.length,
    customers:    aggregated.filter((p) => p.is_customer).length,
    members:      aggregated.filter((p) => p.is_member).length,
    subscribers:  aggregated.filter((p) => p.is_subscriber && p.ok_to_contact).length,
    opted_out:    aggregated.filter((p) => !p.ok_to_contact).length,
  }), [aggregated]);

  const filtered = aggregated.filter((p) => {
    if (filter === 'customers')     return p.is_customer;
    if (filter === 'members')     return p.is_member;
    if (filter === 'subscribers') return p.is_subscriber && p.ok_to_contact;
    if (filter === 'opted_out')   return !p.ok_to_contact;
    return true;
  });

  return (
    <>
      <Head>
        <title>People | Mahjong Tarot Portal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminShell profile={profile}>
          <p className={styles.pageEyebrow}>Admin</p>
          <h1 className={styles.pageTitle}>People</h1>
          <p className={styles.pageLede}>
            Every human who has interacted with the site — inquirers, subscribers, customers, members.
          </p>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.statRow}>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Total</p>
              <p className={styles.statValue}>{totals.total}</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Customers</p>
              <p className={styles.statValue}>{totals.customers}</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Members</p>
              <p className={styles.statValue}>{totals.members}</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Subscribers</p>
              <p className={styles.statValue}>{totals.subscribers}</p>
            </div>
          </div>

          <div className={tableStyles.controlsRow}>
            <div className={tableStyles.chipRow}>
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={filter === f.id ? tableStyles.chipActive : tableStyles.chip}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <p className={tableStyles.count}>
              {loading ? 'Loading…' : `${filtered.length} ${filtered.length === 1 ? 'person' : 'people'}`}
            </p>
          </div>

          {!loading && filtered.length === 0 && (
            <p className={styles.muted}>No people match this filter.</p>
          )}

          {!loading && filtered.length > 0 && (
            <div className={tableStyles.tableWrap}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Tags</th>
                    <th>Inquiries</th>
                    <th>Source</th>
                    <th>Last activity</th>
                    <th>Consent</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td className={tableStyles.cellPrimary}>{p.name || '—'}</td>
                      <td className={tableStyles.cellSecondary}>{p.email}</td>
                      <td>
                        <div className={tableStyles.tagRow}>
                          {p.is_member && <span className={tableStyles.tagMember}>member</span>}
                          {p.is_customer && <span className={tableStyles.tagClient}>customer</span>}
                          {p.subscription === 'active' && <span className={tableStyles.tagActive}>subscribed</span>}
                          {p.subscription === 'lapsed' && <span className={tableStyles.tagLapsed}>lapsed</span>}
                          {p.types.map((t) => (
                            <span key={t} className={tableStyles.tag}>{TYPE_LABELS[t] || t}</span>
                          ))}
                          {p.types.length === 0 && !p.is_member && !p.is_customer && (
                            <span className={tableStyles.muted}>—</span>
                          )}
                        </div>
                      </td>
                      <td className={tableStyles.cellMuted}>{p.inquiry_count || '—'}</td>
                      <td className={tableStyles.cellMuted}>{p.source_site || '—'}</td>
                      <td className={tableStyles.cellMuted}>{relTime(p.last_activity)}</td>
                      <td>
                        {p.ok_to_contact
                          ? <span className={tableStyles.tagOptedIn}>opted in</span>
                          : <span className={tableStyles.tagOptedOut}>opted out</span>}
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
