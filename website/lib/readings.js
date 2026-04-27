import { supabase } from './supabase';

export function slugify(s) {
  return (s || 'unknown')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'unknown';
}

export function buildSlug(name1, name2, dateString) {
  return `${slugify(name1)}-${slugify(name2)}-${dateString}`;
}

/**
 * Persist a compatibility reading. If the slug is taken for this user,
 * appends -2, -3, etc. until unique. Returns the saved row.
 */
export async function saveReading({ userId, person1, person2, report }) {
  if (!supabase || !userId) throw new Error('Not signed in');
  const today = new Date().toISOString().slice(0, 10);
  const baseSlug = buildSlug(person1.name, person2.name, today);

  for (let i = 0; i < 50; i++) {
    const slug = i === 0 ? baseSlug : `${baseSlug}-${i + 1}`;
    const payload = {
      user_id: userId,
      slug,
      type: 'compatibility',
      person1_name: person1.name || null,
      person1_birthday: person1.birthday || null,
      person1_birth_time: person1.birthTime || null,
      person1_gender: person1.gender || null,
      person2_name: person2.name || null,
      person2_birthday: person2.birthday || null,
      person2_birth_time: person2.birthTime || null,
      person2_gender: person2.gender || null,
      rating: report?.rating ?? null,
      report,
    };
    const { data, error } = await supabase
      .from('readings')
      .insert(payload)
      .select('id, slug')
      .single();
    if (!error) return data;
    // 23505 = unique_violation
    if (error.code !== '23505') throw error;
  }
  throw new Error('Could not generate a unique slug');
}
