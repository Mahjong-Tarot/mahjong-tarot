import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import AdminShell from '../../components/AdminShell';
import PersonRow from '../../components/PersonRow';
import PersonEditShelf from '../../components/PersonEditShelf';
import { supabase } from '../../lib/supabase';
import { requirePage } from '../../lib/guards';
import { FILTERS, sortValue } from '../../lib/admin-people';
import styles from '../../styles/PortalAdmin.module.css';
import tableStyles from '../../styles/PortalAdminTable.module.css';

export async function getServerSideProps(ctx) {
  return requirePage('admin')(ctx);
}

const sortableTh = { cursor: 'pointer', userSelect: 'none' };

export default function AdminPeople({ profile }) {
  const [people, setPeople]       = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [profiles, setProfiles]   = useState([]);
  const [deals, setDeals]         = useState([]);
  const [filter, setFilter]       = useState('all');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(true);
  const [sortKey, setSortKey]     = useState('last_activity');
  const [sortDir, setSortDir]     = useState('desc');

  // Detail-shelf state. selected = the row, draft = the editable copy.
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft]           = useState(null);
  const [savingField, setSavingField] = useState('');
  const [shelfError, setShelfError]   = useState('');

  function openShelf(p) {
    setSelectedId(p.id);
    setDraft({
      name:              p.name              || '',
      email:             p.email             || '',
      phone:             p.phone             || '',
      address:           p.address           || '',
      birthday:          p.birthday          || '',
      birth_time:        p.birth_time        || '',
      birth_place:       p.birth_place       || '',
      gender:            p.gender            || '',
      chinese_sign:      p.chinese_sign      || '',
      company:           p.company           || '',
      role:              p.role              || '',
      lifecycle_stage:   p.lifecycle_stage   || 'lead',
      nurture_stage:     p.nurture_stage ?? 0,
      nurture_status:    p.nurture_status    || '',
      membership_status: p.membership_status || '',
      source:            p.source            || '',
      source_site:       p.source_site       || '',
      ok_to_contact:     !!p.ok_to_contact,
    });
    setShelfError('');
  }
  function closeShelf() {
    setSelectedId(null);
    setDraft(null);
    setShelfError('');
  }

  async function saveField(field, value) {
    if (!selectedId) return;
    setSavingField(field);
    setShelfError('');
    const payload = { [field]: value === '' ? null : value };
    const { error: e } = await supabase
      .from('people')
      .update(payload)
      .eq('id', selectedId);
    setSavingField('');
    if (e) { setShelfError(e.message); return; }
    setPeople((prev) => prev.map((row) =>
      row.id === selectedId ? { ...row, ...payload, updated_at: new Date().toISOString() } : row,
    ));
  }

  useEffect(() => {
    async function load() {
      if (!supabase) {
        setError('Supabase not configured.');
        setLoading(false);
        return;
      }
      try {
        const [pRes, iRes, prRes, dRes] = await Promise.all([
          supabase
            .from('people').select('id, email, name, company, role, phone, address, birthday, birth_time, birth_place, gender, chinese_sign, ok_to_contact, source, source_site, lifecycle_stage, nurture_stage, nurture_status, membership_status, created_at, updated_at')
            .order('updated_at', { ascending: false }),
          supabase
            .from('inquiries')
            .select('person_id, type, status, created_at'),
          supabase
            .from('profiles')
            .select('user_id, person_id, role, is_premium, name'),
          supabase
            .from('deals')
            .select('person_id, status'),
        ]);
        if (pRes.error)  throw pRes.error;
        if (iRes.error)  throw iRes.error;
        if (prRes.error) throw prRes.error;
        if (dRes.error)  throw dRes.error;
        setPeople(pRes.data ?? []);
        setInquiries(iRes.data ?? []);
        setProfiles(prRes.data ?? []);
        setDeals(dRes.data ?? []);
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
    const ordersByPerson = new Map();
    for (const d of deals) {
      if (d.status !== 'won') continue;
      ordersByPerson.set(d.person_id, (ordersByPerson.get(d.person_id) || 0) + 1);
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
        order_count:   ordersByPerson.get(p.id) || 0,
        is_customer:   p.lifecycle_stage === 'customer',
        is_member:     !!memberProfile,
        is_subscriber: subscriber,
        last_activity: lastActivity,
      };
    });
  }, [people, inquiries, profiles, deals]);

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

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      const av = sortValue(a, sortKey);
      const bv = sortValue(b, sortKey);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'last_activity' ? 'desc' : 'asc');
    }
  }
  function sortIndicator(key) {
    if (sortKey !== key) return null;
    return <span style={{ marginLeft: 4 }}>{sortDir === 'asc' ? '▲' : '▼'}</span>;
  }

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
              {loading ? 'Loading…' : `${sorted.length} ${sorted.length === 1 ? 'person' : 'people'}`}
            </p>
          </div>

          {!loading && sorted.length === 0 && (
            <p className={styles.muted}>No people match this filter.</p>
          )}

          {!loading && sorted.length > 0 && (
            <div className={tableStyles.tableWrap}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th onClick={() => toggleSort('name')}          style={sortableTh}>Name{sortIndicator('name')}</th>
                    <th onClick={() => toggleSort('email')}         style={sortableTh}>Email{sortIndicator('email')}</th>
                    <th onClick={() => toggleSort('tags')}          style={sortableTh}>Tags{sortIndicator('tags')}</th>
                    <th onClick={() => toggleSort('inquiry_count')} style={sortableTh}>Inquiries{sortIndicator('inquiry_count')}</th>
                    <th onClick={() => toggleSort('order_count')}   style={sortableTh}>Orders{sortIndicator('order_count')}</th>
                    <th onClick={() => toggleSort('last_activity')} style={sortableTh}>Last activity{sortIndicator('last_activity')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((p) => (
                    <PersonRow
                      key={p.id}
                      person={p}
                      tableStyles={tableStyles}
                      onOpen={openShelf}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Detail shelf — opens when a row is clicked */}
          {selectedId && draft && (
            <PersonEditShelf
              draft={draft}
              setDraft={setDraft}
              savingField={savingField}
              shelfError={shelfError}
              onSave={saveField}
              onClose={closeShelf}
            />
          )}
      </AdminShell>
    </>
  );
}
