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

const LIFECYCLE_STAGES = ['subscriber', 'lead', 'mql', 'sql', 'opportunity', 'customer', 'evangelist'];

function sortValue(row, key) {
  switch (key) {
    case 'name':           return (row.name || '').toLowerCase();
    case 'email':          return (row.email || '').toLowerCase();
    case 'tags':           return row.types.length;
    case 'inquiry_count':  return row.inquiry_count || 0;
    case 'order_count':    return row.order_count || 0;
    case 'last_activity':  return row.last_activity || '';
    default:               return row[key];
  }
}

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

          {error && <p className="error-block">{error}</p>}

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
                    <tr key={p.id} onClick={() => openShelf(p)} style={{ cursor: 'pointer' }}>
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
                      <td className={tableStyles.cellMuted}>{p.order_count || '—'}</td>
                      <td className={tableStyles.cellMuted}>{relTime(p.last_activity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Detail shelf — opens when a row is clicked */}
          {selectedId && draft && (
            <>
              <div onClick={closeShelf} style={shelfBackdrop} />
              <aside style={shelfPanel} onClick={(e) => e.stopPropagation()}>
                <header style={shelfHeader}>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                    {draft.name || draft.email || 'Untitled person'}
                  </h2>
                  <button type="button" onClick={closeShelf} aria-label="Close" style={shelfClose}>×</button>
                </header>

                {shelfError && <p style={shelfErr}>{shelfError}</p>}

                <Field label="Name" name="name" draft={draft} setDraft={setDraft}
                       saving={savingField === 'name'} onSave={saveField} />
                <Field label="Email" name="email" draft={draft} setDraft={setDraft}
                       saving={savingField === 'email'} onSave={saveField} />
                <Field label="Phone" name="phone" draft={draft} setDraft={setDraft}
                       saving={savingField === 'phone'} onSave={saveField} />
                <Field label="Address" name="address" draft={draft} setDraft={setDraft}
                       saving={savingField === 'address'} onSave={saveField} />
                <Field label="Birthday" name="birthday" type="date" draft={draft} setDraft={setDraft}
                       saving={savingField === 'birthday'} onSave={saveField} />
                <Field label="Birth time" name="birth_time" type="time" draft={draft} setDraft={setDraft}
                       saving={savingField === 'birth_time'} onSave={saveField} />
                <Field label="Birth place" name="birth_place" draft={draft} setDraft={setDraft}
                       saving={savingField === 'birth_place'} onSave={saveField} />
                <SelectField label="Gender (needed for Purple Star chart)" name="gender" draft={draft} setDraft={setDraft}
                       options={['', 'F', 'M']} optionLabels={{'': '— not set —', F: 'Female', M: 'Male'}}
                       saving={savingField === 'gender'} onSave={saveField} />
                <Field label="Chinese sign" name="chinese_sign" draft={draft} setDraft={setDraft}
                       saving={savingField === 'chinese_sign'} onSave={saveField} />
                <Field label="Company" name="company" draft={draft} setDraft={setDraft}
                       saving={savingField === 'company'} onSave={saveField} />
                <Field label="Role" name="role" draft={draft} setDraft={setDraft}
                       saving={savingField === 'role'} onSave={saveField} />
                <SelectField label="Lifecycle stage" name="lifecycle_stage" draft={draft} setDraft={setDraft}
                       options={LIFECYCLE_STAGES} saving={savingField === 'lifecycle_stage'} onSave={saveField} />
                <Field label="Nurture stage" name="nurture_stage" type="number" draft={draft} setDraft={setDraft}
                       saving={savingField === 'nurture_stage'} onSave={saveField} />
                <Field label="Nurture status" name="nurture_status" draft={draft} setDraft={setDraft}
                       saving={savingField === 'nurture_status'} onSave={saveField} />
                <Field label="Membership status" name="membership_status" draft={draft} setDraft={setDraft}
                       saving={savingField === 'membership_status'} onSave={saveField} />
                <Field label="Source" name="source" draft={draft} setDraft={setDraft}
                       saving={savingField === 'source'} onSave={saveField} />
                <Field label="Source site" name="source_site" draft={draft} setDraft={setDraft}
                       saving={savingField === 'source_site'} onSave={saveField} />
                <CheckField label="OK to contact (newsletter / outreach)" name="ok_to_contact" draft={draft} setDraft={setDraft}
                       saving={savingField === 'ok_to_contact'} onSave={saveField} />
              </aside>
            </>
          )}
      </AdminShell>
    </>
  );
}

// ── Sortable table header style ─────────────────────────────────────
const sortableTh = { cursor: 'pointer', userSelect: 'none' };

// ── Shelf primitives ────────────────────────────────────────────────
const shelfBackdrop = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 60,
};
const shelfPanel = {
  position: 'fixed', top: 0, right: 0, bottom: 0,
  width: 'min(440px, 92vw)', background: '#fff', boxShadow: '-12px 0 32px rgba(0,0,0,0.15)',
  padding: 20, overflowY: 'auto', zIndex: 61,
};
const shelfHeader = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #e5e7eb',
};
const shelfClose = {
  background: 'transparent', border: 'none', fontSize: 28, cursor: 'pointer',
  lineHeight: 1, color: '#6b7280', padding: '0 4px',
};
const shelfErr = {
  background: '#fef2f2', color: '#991b1b', padding: '8px 12px', borderRadius: 6,
  fontSize: 13, marginBottom: 12,
};
const fieldWrap = { marginBottom: 14 };
const fieldLabel = {
  display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em',
  color: '#6b7280', fontWeight: 500, marginBottom: 4,
};
const fieldInput = {
  display: 'block', width: '100%', padding: '8px 10px',
  border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, fontFamily: 'inherit',
  background: '#fff',
};
const fieldSaving = {
  display: 'inline-block', fontSize: 11, color: '#6b7280', marginLeft: 6,
};

function Field({ label, name, type = 'text', draft, setDraft, onSave, saving, readOnly = false }) {
  const initial = draft[name];
  return (
    <div style={fieldWrap}>
      <label style={fieldLabel}>{label}{saving && <span style={fieldSaving}>Saving…</span>}</label>
      <input
        type={type}
        readOnly={readOnly}
        value={draft[name] ?? ''}
        onChange={(e) => setDraft({ ...draft, [name]: e.target.value })}
        onBlur={() => !readOnly && draft[name] !== initial && onSave?.(name, draft[name])}
        style={{ ...fieldInput, background: readOnly ? '#f9fafb' : '#fff' }}
      />
    </div>
  );
}

function SelectField({ label, name, draft, setDraft, options, optionLabels, onSave, saving }) {
  const initial = draft[name];
  return (
    <div style={fieldWrap}>
      <label style={fieldLabel}>{label}{saving && <span style={fieldSaving}>Saving…</span>}</label>
      <select
        value={draft[name] ?? ''}
        onChange={(e) => {
          const next = e.target.value;
          setDraft({ ...draft, [name]: next });
          if (next !== initial) onSave?.(name, next);
        }}
        style={fieldInput}
      >
        {options.map((o) => <option key={o || '_blank'} value={o}>{(optionLabels && optionLabels[o]) || o}</option>)}
      </select>
    </div>
  );
}

function CheckField({ label, name, draft, setDraft, onSave, saving }) {
  return (
    <div style={{ ...fieldWrap, display: 'flex', alignItems: 'center', gap: 10 }}>
      <input
        id={`f-${name}`}
        type="checkbox"
        checked={!!draft[name]}
        onChange={(e) => {
          const next = e.target.checked;
          setDraft({ ...draft, [name]: next });
          onSave?.(name, next);
        }}
      />
      <label htmlFor={`f-${name}`} style={{ ...fieldLabel, marginBottom: 0 }}>
        {label}{saving && <span style={fieldSaving}>Saving…</span>}
      </label>
    </div>
  );
}
