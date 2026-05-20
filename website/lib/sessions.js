const SESSION_FIELDS = [
  'id',
  'created_at',
  'updated_at',
  'client_id',
  'astrologer_id',
  'scheduled_at',
  'duration_minutes',
  'status',
  'meeting_source',
  'meeting_external_id',
  'prep_notes',
  'post_call_notes',
  'transcript_text',
  'summary_text',
].join(', ');

// Same as SESSION_FIELDS but without the large free-text columns. Use
// this for list views that don't need transcript/summary content —
// past sessions can carry kilobytes of transcript and we don't want
// the dashboard query to ship all of it across the wire.
const SESSION_LIST_FIELDS = [
  'id',
  'created_at',
  'updated_at',
  'client_id',
  'astrologer_id',
  'scheduled_at',
  'duration_minutes',
  'status',
  'meeting_source',
  'meeting_external_id',
  'prep_notes',
].join(', ');

export async function listSessions(supabase, { clientId, since, until } = {}) {
  let q = supabase.from('sessions').select(SESSION_FIELDS).order('scheduled_at', { ascending: true });
  if (clientId) q = q.eq('client_id', clientId);
  if (since) q = q.gte('scheduled_at', since);
  if (until) q = q.lte('scheduled_at', until);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getSession(supabase, id) {
  const { data, error } = await supabase
    .from('sessions')
    .select(SESSION_FIELDS)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createSession(supabase, payload) {
  const row = {
    client_id: payload.client_id,
    astrologer_id: payload.astrologer_id,
    scheduled_at: payload.scheduled_at,
    duration_minutes: payload.duration_minutes || 60,
    prep_notes: payload.prep_notes?.trim() || null,
    status: payload.status || 'scheduled',
  };
  const { data, error } = await supabase
    .from('sessions')
    .insert(row)
    .select(SESSION_FIELDS)
    .single();
  if (error) throw error;
  return data;
}

const CLIENT_EMBED_FIELDS = [
  'id',
  'full_name',
  'email',
  'phone',
  'birthday',
  'birth_time',
  'birth_place',
  'subscription_status',
].join(', ');

export async function listUpcomingSessions(supabase, { withinDays = 14 } = {}) {
  const now = new Date();
  const horizon = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000);
  const { data, error } = await supabase
    .from('sessions')
    .select(`${SESSION_FIELDS}, client:clients(${CLIENT_EMBED_FIELDS})`)
    .gte('scheduled_at', now.toISOString())
    .lte('scheduled_at', horizon.toISOString())
    .neq('status', 'cancelled')
    .order('scheduled_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/**
 * List sessions in a date range, with the embedded client row.
 * @param {object} opts
 * @param {'upcoming'|'past'} opts.range - 'upcoming' returns sessions at or after now; 'past' returns sessions strictly before now.
 * @param {string} [opts.since] - ISO timestamp lower bound (inclusive). Overrides the range default if provided.
 * @param {string} [opts.until] - ISO timestamp upper bound (inclusive). Overrides the range default if provided.
 * @param {boolean} [opts.includeCancelled=false]
 */
export async function listSessionsWithClient(supabase, { range = 'upcoming', since, until, includeCancelled = false } = {}) {
  const nowIso = new Date().toISOString();
  let q = supabase
    .from('sessions')
    .select(`${SESSION_LIST_FIELDS}, client:clients(${CLIENT_EMBED_FIELDS})`);

  if (since) q = q.gte('scheduled_at', since);
  else if (range === 'upcoming') q = q.gte('scheduled_at', nowIso);

  if (until) q = q.lte('scheduled_at', until);
  else if (range === 'past') q = q.lt('scheduled_at', nowIso);

  if (!includeCancelled) q = q.neq('status', 'cancelled');

  q = q.order('scheduled_at', { ascending: range === 'upcoming' });

  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function updateSession(supabase, id, payload) {
  const row = { ...payload, updated_at: new Date().toISOString() };
  // Diagnostic logging: if the call hangs we'll see "begin" but not
  // "end" in the browser console, proving the supabase-js call
  // itself never returned. Remove once the hang is resolved.
  // eslint-disable-next-line no-console
  console.info('[updateSession] begin', { id, fields: Object.keys(row) });
  const t0 = Date.now();
  try {
    const { data, error } = await supabase
      .from('sessions')
      .update(row)
      .eq('id', id)
      .select(SESSION_FIELDS)
      .single();
    // eslint-disable-next-line no-console
    console.info('[updateSession] end', { id, ms: Date.now() - t0, error });
    if (error) throw error;
    return data;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[updateSession] threw', { id, ms: Date.now() - t0, err });
    throw err;
  }
}
