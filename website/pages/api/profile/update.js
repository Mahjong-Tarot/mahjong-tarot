import { requireUserApi } from '../../../lib/requireUserApi';

const ALLOWED_FIELDS = new Set([
  'name',
  'birthday',
  'birth_time',
  'birth_place',
  'gender',
  'pillars',
]);

const RETURN_FIELDS = [
  'user_id',
  'name',
  'birthday',
  'birth_time',
  'birth_place',
  'gender',
  'pillars',
  'role',
  'updated_at',
].join(', ');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requireUserApi(req, res);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
  const { supabase, user } = auth;

  const fields = req.body?.fields || {};
  if (typeof fields !== 'object' || Array.isArray(fields)) {
    return res.status(400).json({ error: 'Missing fields.' });
  }

  const row = { user_id: user.id, updated_at: new Date().toISOString() };
  for (const [k, v] of Object.entries(fields)) {
    if (!ALLOWED_FIELDS.has(k)) {
      return res.status(400).json({ error: `Field not allowed: ${k}` });
    }
    row[k] = v;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(row, { onConflict: 'user_id' })
      .select(RETURN_FIELDS)
      .single();
    if (error) {
      console.error('profile upsert error:', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ profile: data });
  } catch (err) {
    console.error('profile upsert threw:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
