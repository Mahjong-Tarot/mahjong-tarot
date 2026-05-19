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

export async function updateSession(supabase, id, payload) {
  const row = { ...payload, updated_at: new Date().toISOString() };
  const { data, error } = await supabase
    .from('sessions')
    .update(row)
    .eq('id', id)
    .select(SESSION_FIELDS)
    .single();
  if (error) throw error;
  return data;
}
