const CLIENT_FIELDS = [
  'id',
  'created_at',
  'updated_at',
  'user_id',
  'full_name',
  'email',
  'phone',
  'birthday',
  'birth_time',
  'birth_place',
  'gender',
  'notes',
  'subscription_status',
  'subscription_started_at',
  'subscription_ended_at',
  'created_by',
].join(', ');

export async function listClients(supabase) {
  const { data, error } = await supabase
    .from('clients')
    .select(CLIENT_FIELDS)
    .order('full_name', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getClient(supabase, id) {
  const { data, error } = await supabase
    .from('clients')
    .select(CLIENT_FIELDS)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createClient(supabase, payload, createdBy) {
  const row = {
    full_name: payload.full_name?.trim(),
    email: payload.email?.trim() || null,
    phone: payload.phone?.trim() || null,
    birthday: payload.birthday || null,
    birth_time: payload.birth_time || null,
    birth_place: payload.birth_place?.trim() || null,
    gender: payload.gender || null,
    notes: payload.notes?.trim() || null,
    created_by: createdBy || null,
  };
  const { data, error } = await supabase
    .from('clients')
    .insert(row)
    .select(CLIENT_FIELDS)
    .single();
  if (error) throw error;
  return data;
}

export async function updateClient(supabase, id, payload) {
  const row = {
    full_name: payload.full_name?.trim(),
    email: payload.email?.trim() || null,
    phone: payload.phone?.trim() || null,
    birthday: payload.birthday || null,
    birth_time: payload.birth_time || null,
    birth_place: payload.birth_place?.trim() || null,
    gender: payload.gender || null,
    notes: payload.notes?.trim() || null,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('clients')
    .update(row)
    .eq('id', id)
    .select(CLIENT_FIELDS)
    .single();
  if (error) throw error;
  return data;
}

export async function markSubscription(supabase, id, status) {
  const row = {
    subscription_status: status,
    updated_at: new Date().toISOString(),
  };
  if (status === 'active') {
    row.subscription_started_at = new Date().toISOString();
    row.subscription_ended_at = null;
  } else if (status === 'lapsed' || status === 'cancelled') {
    row.subscription_ended_at = new Date().toISOString();
  } else if (status === 'none') {
    row.subscription_started_at = null;
    row.subscription_ended_at = null;
  }
  const { data, error } = await supabase
    .from('clients')
    .update(row)
    .eq('id', id)
    .select(CLIENT_FIELDS)
    .single();
  if (error) throw error;
  return data;
}
