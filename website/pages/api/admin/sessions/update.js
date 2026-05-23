import { requireStaffApi } from '../../../../lib/requireStaffApi';

const ALLOWED_FIELDS = new Set([
  'transcript_text',
  'summary_text',
  'prep_notes',
  'post_call_notes',
  'status',
  'duration_minutes',
  'scheduled_at',
]);

const RETURN_FIELDS = [
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requireStaffApi(req, res);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
  const { supabase } = auth;

  const { sessionId, fields } = req.body || {};
  if (!sessionId || !fields || typeof fields !== 'object') {
    return res.status(400).json({ error: 'Missing sessionId or fields.' });
  }

  // Whitelist
  const row = { updated_at: new Date().toISOString() };
  for (const [k, v] of Object.entries(fields)) {
    if (!ALLOWED_FIELDS.has(k)) {
      return res.status(400).json({ error: `Field not allowed: ${k}` });
    }
    row[k] = v;
  }

  try {
    const { data, error } = await supabase
      .from('sessions')
      .update(row)
      .eq('id', sessionId)
      .select(RETURN_FIELDS)
      .single();
    if (error) {
      console.error('sessions update error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ session: data });
  } catch (err) {
    console.error('sessions update threw:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
