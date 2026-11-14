import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import BirthForm from '../../components/BirthForm';
import { Body, ErrorNote, Field, Overline, Screen } from '../../components/ui';
import { fetchCompatibility } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { useBirth } from '../../lib/birthContext';
import { formatBirth } from '../../lib/birth';
import { supabase } from '../../lib/supabase';
import { color, font } from '../../lib/theme';

// Same as website/lib/readings.js buildSlug + saveReading.
const slugify = (s) => (s || 'unknown').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'unknown';

async function saveReading(userId, person1, person2, report) {
  const base = `${slugify(person1.name)}-${slugify(person2.name)}-${new Date().toISOString().slice(0, 10)}`;
  for (let i = 0; i < 50; i += 1) {
    const slug = i === 0 ? base : `${base}-${i + 1}`;
    const { data, error } = await supabase.from('readings').insert({
      user_id: userId,
      slug,
      type: 'compatibility',
      person1_name: person1.name || null,
      person1_birthday: person1.birthday,
      person1_birth_time: person1.birthTime || null,
      person1_gender: person1.gender || null,
      person2_name: person2.name || null,
      person2_birthday: person2.birthday,
      person2_birth_time: person2.birthTime || null,
      person2_gender: person2.gender || null,
      rating: report?.rating ?? null,
      report,
    }).select('id, slug').single();
    if (!error) return data;
    if (error.code !== '23505') throw new Error('Could not save the reading.');
  }
  throw new Error('Could not save the reading.');
}

const toPerson = (name, b) => ({
  name,
  birthday: b.date,
  birthTime: b.time || '',
  gender: b.gender === 'f' ? 'F' : 'M',
});

export default function NewRelationship() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { birth } = useBirth();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const myName = (profile?.name || '').split(' ')[0] || 'You';

  const submit = async (other) => {
    if (!birth?.date) { setError('Add your own birth details first (My Chart).'); return; }
    if (!name.trim()) { setError('Enter their name.'); return; }
    setBusy(true); setError(null);
    try {
      const p1 = toPerson(myName, birth);
      const p2 = toPerson(name.trim(), other);
      const report = await fetchCompatibility(p1, p2);
      const saved = await saveReading(user.id, p1, p2, report);
      router.replace(`/readings/${encodeURIComponent(saved.slug)}`);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen edges={[]}>
        <Overline>Relationship reading</Overline>
        <Text style={st.me}>{myName}: {formatBirth(birth) || 'add your birth details on My Chart'}</Text>
        <Body muted small>Compare your chart with a partner, friend or family member. Their details are saved only with this reading.</Body>
        <Field label="Their name" value={name} onChangeText={setName} autoCapitalize="words" />
        <ErrorNote>{error}</ErrorNote>
        <BirthForm submitLabel="Read our match" onSubmit={submit} busy={busy} />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  me: { fontFamily: font.bodyMedium, fontSize: 15, color: color.ink },
});
