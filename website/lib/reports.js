const REPORT_FIELDS = [
  'id',
  'created_at',
  'updated_at',
  'client_id',
  'session_id',
  'generated_by',
  'meeting_source',
  'meeting_external_id',
  'source_transcript',
  'source_summary',
  'status',
  'title',
  'body_markdown',
  'sent_at',
  'sent_to_email',
  'email_message_id',
  'generation_error',
].join(', ');

export async function getReport(supabase, id) {
  const { data, error } = await supabase
    .from('reports')
    .select(REPORT_FIELDS)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getReportBySessionId(supabase, sessionId) {
  const { data, error } = await supabase
    .from('reports')
    .select(REPORT_FIELDS)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateReport(supabase, id, payload) {
  const row = { ...payload, updated_at: new Date().toISOString() };
  const { data, error } = await supabase
    .from('reports')
    .update(row)
    .eq('id', id)
    .select(REPORT_FIELDS)
    .single();
  if (error) throw error;
  return data;
}

export async function getOrCreateReportForSession(supabase, sessionId, clientId, currentUserId) {
  const existing = await getReportBySessionId(supabase, sessionId);
  if (existing) return existing;

  const insert = {
    session_id: sessionId,
    client_id: clientId,
    status: 'draft',
    generated_by: currentUserId || null,
  };
  const { data, error } = await supabase
    .from('reports')
    .insert(insert)
    .select(REPORT_FIELDS)
    .single();
  if (error) throw error;
  return data;
}
