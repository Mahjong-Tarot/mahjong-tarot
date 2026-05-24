import { requireApi } from '../../../../lib/guards';

const ALLOWED_FIELDS = new Set([
  'title',
  'body_markdown',
  'status',
]);

const RETURN_FIELDS = [
  'id',
  'created_at',
  'updated_at',
  'client_id',
  'session_id',
  'generated_by',
  'status',
  'title',
  'body_markdown',
  'sent_at',
  'sent_to_email',
  'email_message_id',
].join(', ');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requireApi('staff')(req, res);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
  const { supabase } = auth;

  const { reportId, fields } = req.body || {};
  if (!reportId || !fields || typeof fields !== 'object') {
    return res.status(400).json({ error: 'Missing reportId or fields.' });
  }

  const row = { updated_at: new Date().toISOString() };
  for (const [k, v] of Object.entries(fields)) {
    if (!ALLOWED_FIELDS.has(k)) {
      return res.status(400).json({ error: `Field not allowed: ${k}` });
    }
    row[k] = v;
  }

  try {
    const { data, error } = await supabase
      .from('reports')
      .update(row)
      .eq('id', reportId)
      .select(RETURN_FIELDS)
      .single();
    if (error) {
      console.error('reports update error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ report: data });
  } catch (err) {
    console.error('reports update threw:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
