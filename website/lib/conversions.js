/**
 * Cross-astrologer client list for the admin conversions dashboard.
 *
 * Returns one row per client with denormalized session + report
 * aggregates so the admin can sort/filter for warm leads.
 *
 * Volume is small (handful of clients × handful of sessions/reports),
 * so we trade query complexity for clarity: load clients with the
 * embedded session/report rows we need, then aggregate in JS. RLS
 * is enforced by the embedded selects.
 */

const CLIENT_FIELDS = [
  'id',
  'full_name',
  'email',
  'phone',
  'subscription_status',
  'subscription_started_at',
  'subscription_ended_at',
  'created_at',
].join(', ');

const ACTIVE_STATUSES = new Set(['none', 'lapsed', 'cancelled']);

export async function listConversionTargets(supabase, { statusFilter = 'targets', sort = 'warm' } = {}) {
  const clientsQ = supabase
    .from('clients')
    .select(`${CLIENT_FIELDS}, sessions(id, scheduled_at, astrologer_id), reports(id, status, sent_at)`);

  const { data: clients, error } = await clientsQ;
  if (error) throw error;

  const profiles = await loadAstrologerProfiles(supabase, clients ?? []);

  const rows = (clients ?? []).map((c) => {
    const sessions = (c.sessions ?? []).slice().sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at));
    const sentReports = (c.reports ?? []).filter((r) => r.status === 'sent' && r.sent_at);
    sentReports.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));

    const lastSession = sessions[0] || null;
    const astrologer = lastSession ? profiles.get(lastSession.astrologer_id) : null;

    return {
      id: c.id,
      full_name: c.full_name,
      email: c.email,
      phone: c.phone,
      subscription_status: c.subscription_status,
      subscription_started_at: c.subscription_started_at,
      subscription_ended_at: c.subscription_ended_at,
      session_count: sessions.length,
      last_session_at: lastSession?.scheduled_at || null,
      last_report_sent_at: sentReports[0]?.sent_at || null,
      astrologer_name: astrologer?.name || null,
      astrologer_id: lastSession?.astrologer_id || null,
    };
  });

  const filtered = applyStatusFilter(rows, statusFilter);
  return applySort(filtered, sort);
}

async function loadAstrologerProfiles(supabase, clients) {
  const astrologerIds = new Set();
  for (const c of clients) {
    for (const s of c.sessions ?? []) {
      if (s.astrologer_id) astrologerIds.add(s.astrologer_id);
    }
  }
  if (astrologerIds.size === 0) return new Map();

  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, name, role')
    .in('user_id', [...astrologerIds]);
  if (error) throw error;

  const map = new Map();
  for (const p of data ?? []) map.set(p.user_id, p);
  return map;
}

function applyStatusFilter(rows, statusFilter) {
  if (statusFilter === 'all') return rows;
  if (statusFilter === 'targets') return rows.filter((r) => ACTIVE_STATUSES.has(r.subscription_status));
  return rows.filter((r) => r.subscription_status === statusFilter);
}

function applySort(rows, sort) {
  const sorted = rows.slice();
  if (sort === 'alphabetical') {
    sorted.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
  } else if (sort === 'recent') {
    sorted.sort((a, b) => timeOrNeg(b.last_session_at) - timeOrNeg(a.last_session_at));
  } else {
    // 'warm' — non-subscribed clients with a recent session, ordered by recency
    sorted.sort((a, b) => {
      const aWarm = ACTIVE_STATUSES.has(a.subscription_status) && a.last_session_at;
      const bWarm = ACTIVE_STATUSES.has(b.subscription_status) && b.last_session_at;
      if (aWarm && !bWarm) return -1;
      if (!aWarm && bWarm) return 1;
      return timeOrNeg(b.last_session_at) - timeOrNeg(a.last_session_at);
    });
  }
  return sorted;
}

function timeOrNeg(iso) {
  return iso ? new Date(iso).getTime() : -Infinity;
}
