import { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminShell from '../../components/AdminShell';
import PersonRow from '../../components/PersonRow';
import PersonEditShelf from '../../components/PersonEditShelf';
import { supabase } from '../../lib/supabase';
import { requirePage } from '../../lib/guards';
import styles from '../../styles/PortalAdmin.module.css';
import tableStyles from '../../styles/PortalAdminTable.module.css';

export async function getServerSideProps(ctx) {
  return requirePage('admin')(ctx);
}

// ─── constants ────────────────────────────────────────────────
const PAGE_SIZES = [25, 50, 100, 200];
const DEFAULT_PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 300;
const sortableTh = { cursor: 'pointer', userSelect: 'none' };

// Map UI sort key → people_admin_list column. `tags` is dropped in v1
// because PostgREST can't .order() by array length without a generated
// column on the view; falls back to inquiry_count as the closest proxy.
const SORT_COLUMNS = {
  name:           'name',
  email:          'email',
  inquiry_count:  'inquiry_count',
  order_count:    'order_count',
  last_activity:  'last_activity',
  tags:           'inquiry_count',
};

// PostgREST .or() interprets , ( ) as separators. Strip them from the
// search input — admin search doesn't need them and they'd break the URL.
function sanitizeSearch(q) {
  return (q || '').replace(/[,()*]/g, '').trim();
}

// View returns NULL for types/last_inquiry_at when person has no inquiries.
// Also derive is_customer (broad) and is_subscriber for PersonRow.
function normalize(row) {
  const types = row.types || [];
  return {
    ...row,
    types,
    is_customer: (row.order_count || 0) > 0 || row.lifecycle_stage === 'customer',
    is_subscriber: types.includes('newsletter'),
  };
}

// ─── component ────────────────────────────────────────────────
export default function AdminPeople({ profile }) {
  const router = useRouter();

  // Visible data
  const [rows, setRows]                 = useState([]);
  const [pagedCount, setPagedCount]     = useState(0); // total matching filter+search
  const [rowsLoading, setRowsLoading]   = useState(true);
  const [error, setError]               = useState('');

  // Global stat-card counts — Dave: "always global, ignore search"
  const [totals, setTotals] = useState({ total: 0, customers: 0, legacy: 0, premium: 0 });
  const [totalsLoading, setTotalsLoading] = useState(true);

  // Query state. Hydrated from URL on first router-ready render.
  const [filter, setFilter]       = useState('all');
  const [search, setSearch]       = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [page, setPage]           = useState(1);
  const [pageSize, setPageSize]   = useState(DEFAULT_PAGE_SIZE);
  const [sortKey, setSortKey]     = useState('last_activity');
  const [sortDir, setSortDir]     = useState('desc');

  // Increment to force a totals refetch (after shelf save). Separate from
  // the rows trigger so typing-in-search doesn't re-run the 4 count queries.
  const [totalsKey, setTotalsKey] = useState(0);

  // Shelf state
  const [selectedId, setSelectedId]       = useState(null);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [draft, setDraft]                 = useState(null);
  const [savingField, setSavingField]     = useState('');
  const [shelfError, setShelfError]       = useState('');

  // Race-condition guard for rows fetch — discard stale responses.
  const fetchSeq = useRef(0);
  // Has URL been hydrated yet? Avoids overwriting URL state on first mount.
  const hydratedRef = useRef(false);

  // ── Hydrate state from URL once router is ready ──────────────
  useEffect(() => {
    if (!router.isReady || hydratedRef.current) return;
    hydratedRef.current = true;
    const q = router.query;
    if (q.filter   && ['all','customers','legacy','premium'].includes(q.filter)) setFilter(q.filter);
    if (q.search)                                                                setSearch(String(q.search));
    if (q.page)                                                                  setPage(Math.max(1, parseInt(q.page, 10) || 1));
    if (q.size     && PAGE_SIZES.includes(Number(q.size)))                       setPageSize(Number(q.size));
    if (q.sort     && SORT_COLUMNS[q.sort])                                      setSortKey(q.sort);
    if (q.dir      && (q.dir === 'asc' || q.dir === 'desc'))                     setSortDir(q.dir);
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync state → URL (after hydration) ───────────────────────
  useEffect(() => {
    if (!hydratedRef.current) return;
    const q = {};
    if (filter !== 'all')                                             q.filter = filter;
    if (debouncedQ)                                                   q.search = debouncedQ;
    if (page > 1)                                                     q.page   = String(page);
    if (pageSize !== DEFAULT_PAGE_SIZE)                               q.size   = String(pageSize);
    if (sortKey !== 'last_activity' || sortDir !== 'desc') { q.sort = sortKey; q.dir = sortDir; }
    router.replace({ pathname: router.pathname, query: q }, undefined, { shallow: true, scroll: false });
  }, [filter, debouncedQ, page, pageSize, sortKey, sortDir]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Debounce search ──────────────────────────────────────────
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(sanitizeSearch(search)), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [search]);

  // Reset to page 1 whenever filter or search changes.
  useEffect(() => { setPage(1); }, [filter, debouncedQ, pageSize]);

  // ── Fetch the visible page of rows + filter-aware total ──────
  useEffect(() => {
    if (!supabase) {
      setError('Supabase not configured.');
      setRowsLoading(false);
      return;
    }
    const seq = ++fetchSeq.current;
    setRowsLoading(true);
    setError('');

    let q = supabase
      .from('people_admin_list')
      .select('*', { count: 'exact' })
      .order(SORT_COLUMNS[sortKey], { ascending: sortDir === 'asc' })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (debouncedQ) q = q.or(`email.ilike.%${debouncedQ}%,name.ilike.%${debouncedQ}%`);
    if (filter === 'customers') q = q.eq('is_recent_customer',  true);
    if (filter === 'legacy')    q = q.eq('is_legacy_customer',  true);
    if (filter === 'premium')   q = q.eq('is_premium_member',   true);

    q.then(({ data, count, error: e }) => {
      if (seq !== fetchSeq.current) return; // stale response — discard
      if (e) {
        setError(e.message);
        setRows([]);
        setPagedCount(0);
      } else {
        setRows((data || []).map(normalize));
        setPagedCount(count || 0);
      }
      setRowsLoading(false);
    });
  }, [page, pageSize, filter, debouncedQ, sortKey, sortDir]);

  // ── Fetch global stat-card counts ────────────────────────────
  useEffect(() => {
    if (!supabase) return;
    setTotalsLoading(true);
    Promise.all([
      supabase.from('people_admin_list').select('id', { count: 'exact', head: true }),
      supabase.from('people_admin_list').select('id', { count: 'exact', head: true }).eq('is_recent_customer', true),
      supabase.from('people_admin_list').select('id', { count: 'exact', head: true }).eq('is_legacy_customer', true),
      supabase.from('people_admin_list').select('id', { count: 'exact', head: true }).eq('is_premium_member',  true),
    ]).then(([t, c, l, p]) => {
      setTotals({
        total:     t.count ?? 0,
        customers: c.count ?? 0,
        legacy:    l.count ?? 0,
        premium:   p.count ?? 0,
      });
      setTotalsLoading(false);
    });
  }, [totalsKey]);

  // ── Shelf handlers ───────────────────────────────────────────
  function openShelf(p) {
    setSelectedId(p.id);
    setSelectedEmail(p.email || '');
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
    setSelectedEmail('');
    setDraft(null);
    setShelfError('');
  }
  async function saveField(field, value) {
    if (!selectedId) return;
    setSavingField(field);
    setShelfError('');
    const payload = { [field]: value === '' ? null : value };
    const { error: e } = await supabase.from('people').update(payload).eq('id', selectedId);
    setSavingField('');
    if (e) { setShelfError(e.message); return; }
    // Patch the visible row in place.
    setRows((prev) => prev.map((row) =>
      row.id === selectedId ? normalize({ ...row, ...payload, updated_at: new Date().toISOString() }) : row,
    ));
    // Lifecycle/customer edits can move someone between buckets — refetch totals.
    if (field === 'lifecycle_stage') setTotalsKey((k) => k + 1);
  }

  // ── Sort header helpers ──────────────────────────────────────
  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'last_activity' ? 'desc' : 'asc');
    }
  }
  function sortIndicator(key) {
    if (sortKey !== key) return null;
    return <span style={{ marginLeft: 4 }}>{sortDir === 'asc' ? '▲' : '▼'}</span>;
  }

  // ── Pagination math ──────────────────────────────────────────
  const pageCount = Math.max(1, Math.ceil(pagedCount / pageSize));
  const firstRow  = pagedCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastRow   = Math.min(page * pageSize, pagedCount);

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

        {/* Stat cards — global counts, ignore the search box */}
        <div className={styles.statRow}>
          {[
            { id: 'all',       label: 'Total',            value: totals.total },
            { id: 'customers', label: 'Customers',        value: totals.customers },
            { id: 'legacy',    label: 'Legacy Customers', value: totals.legacy },
            { id: 'premium',   label: 'Premium Members',  value: totals.premium },
          ].map((card) => {
            const isActive = filter === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setFilter(card.id)}
                aria-pressed={isActive}
                className={`${styles.statCard} ${isActive ? styles.statCardActive : ''}`}
              >
                <p className={styles.statLabel}>{card.label}</p>
                <p className={styles.statValue}>{totalsLoading ? '—' : card.value}</p>
              </button>
            );
          })}
        </div>

        {/* Controls: search left, count right */}
        <div className={tableStyles.controlsRow}>
          <input
            type="search"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search people"
            style={{
              flex: '1 1 280px',
              maxWidth: 360,
              padding: '8px 12px',
              fontFamily: 'var(--sans)',
              fontSize: 14,
              border: '1px solid var(--rule)',
              borderRadius: 6,
              background: 'var(--paper-pure)',
              color: 'var(--ink)',
            }}
          />
          <p className={tableStyles.count}>
            {rowsLoading
              ? 'Loading…'
              : pagedCount === 0
                ? '0 results'
                : `${firstRow.toLocaleString()}–${lastRow.toLocaleString()} of ${pagedCount.toLocaleString()}`}
          </p>
        </div>

        {!rowsLoading && rows.length === 0 && (
          <p className={styles.muted}>No people match this filter{debouncedQ ? ` and search "${debouncedQ}"` : ''}.</p>
        )}

        {rows.length > 0 && (
          <div className={tableStyles.tableWrap}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th onClick={() => toggleSort('name')}          style={sortableTh}>Name{sortIndicator('name')}</th>
                  <th onClick={() => toggleSort('email')}         style={sortableTh}>Email{sortIndicator('email')}</th>
                  <th>Tags</th>
                  <th onClick={() => toggleSort('inquiry_count')} style={sortableTh}>Inquiries{sortIndicator('inquiry_count')}</th>
                  <th onClick={() => toggleSort('order_count')}   style={sortableTh}>Orders{sortIndicator('order_count')}</th>
                  <th onClick={() => toggleSort('last_activity')} style={sortableTh}>Last activity{sortIndicator('last_activity')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
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

        {/* Pagination bar */}
        {pagedCount > pageSize && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 'var(--space-md)',
              marginTop: 'var(--space-md)',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || rowsLoading}
                className={tableStyles.chip}
                style={{ minWidth: 80 }}
              >
                ← Prev
              </button>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-4)' }}>
                Page {page.toLocaleString()} of {pageCount.toLocaleString()}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={page >= pageCount || rowsLoading}
                className={tableStyles.chip}
                style={{ minWidth: 80 }}
              >
                Next →
              </button>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ink-4)' }}>
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                style={{
                  padding: '4px 8px',
                  fontFamily: 'var(--sans)',
                  fontSize: 13,
                  border: '1px solid var(--rule)',
                  borderRadius: 4,
                  background: 'var(--paper-pure)',
                  color: 'var(--ink)',
                }}
              >
                {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>
        )}

        {/* Detail shelf */}
        {selectedId && draft && (
          <PersonEditShelf
            personId={selectedId}
            personEmail={selectedEmail}
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
