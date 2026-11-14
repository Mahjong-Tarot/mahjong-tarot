import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Body, Button, Card, ErrorNote, Loading, Overline, Screen, Title } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { readingByKey } from '../../lib/shared';
import { color, font } from '../../lib/theme';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const short = (iso) => { const d = new Date(iso); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; };

function SignedOut() {
  const router = useRouter();
  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <Overline>Reports</Overline>
        <Title size={30}>Your readings</Title>
        {[0, 1, 2].map((i) => <View key={i} style={st.ghost} />)}
      </Screen>
      <View style={st.dim}>
          <View style={st.sheet}>
            <View style={st.grab} />
            <Title size={22} em="readings">Unlock your </Title>
            <Body>Your Purple Star map and relationship readings with anyone you care about. Free for 90 days, no card needed.</Body>
            <Button title="Start free trial" onPress={() => router.push('/signup')} />
            <Button variant="link" title="I already have an account · Sign in" onPress={() => router.push('/sign-in')} />
            <Pressable onPress={() => router.navigate('/today')}><Text style={st.later}>Not now</Text></Pressable>
        </View>
      </View>
    </View>
  );
}

export default function Readings() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);

  useFocusEffect(useCallback(() => {
    if (!user) return undefined;
    let alive = true;
    supabase.from('readings')
      .select('id, slug, type, person1_name, person2_name, rating, created_at')
      .eq('user_id', user.id).eq('type', 'compatibility')
      .order('created_at', { ascending: false })
      .then(({ data, error: e }) => {
        if (!alive) return;
        if (e) setError('Could not load your readings.'); else { setRows(data || []); setError(null); }
      });
    return () => { alive = false; };
  }, [user]));

  if (!user) return <SignedOut />;

  const ps = readingByKey.ziwei;
  const first = (profile?.name || '').split(' ')[0] || 'You';

  return (
    <Screen>
      <Overline>{`Reports · ${user.email}`}</Overline>
      <Title size={30}>Your readings</Title>
      <Card onPress={() => router.push('/readings/purple-star')}>
        <Text style={st.cardTitle}>Purple Star</Text>
        <Body small muted>{ps?.blurb}</Body>
      </Card>

      <Text style={st.section}>Relationships</Text>
      <ErrorNote>{error}</ErrorNote>
      {rows == null && !error ? <Loading /> : null}
      {rows?.length === 0 ? <Body small muted>No relationship readings yet. Compare your chart with a partner, a friend or family.</Body> : null}
      {rows?.map((r) => (
        <Card key={r.id} onPress={() => router.push(`/readings/${encodeURIComponent(r.slug)}`)}>
          <Text style={st.cardTitle}>{r.person1_name || first} × {r.person2_name || 'Partner'}</Text>
          <Body small muted>{short(r.created_at)}{r.rating != null ? ` · ${Math.round(r.rating)}% match` : ''}</Body>
        </Card>
      ))}
      <Button variant="ghost" title="+ New relationship reading" onPress={() => router.push('/readings/new')} />
      <Body small muted style={{ textAlign: 'center' }}>Four Pillars, Three Blessings and Fire Horse are on the website for now.</Body>
    </Screen>
  );
}

const st = StyleSheet.create({
  ghost: { height: 64, borderRadius: 8, backgroundColor: color.rule2 },
  dim: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', backgroundColor: 'rgba(20,22,27,0.25)' },
  sheet: { backgroundColor: color.paper, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 22, paddingBottom: 28, gap: 12 },
  grab: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: color.rule, marginBottom: 4 },
  later: { textAlign: 'center', fontFamily: font.body, color: color.ink3, fontSize: 14 },
  cardTitle: { fontFamily: font.heading, fontSize: 18, color: color.ink },
  section: { fontFamily: font.bodySemi, fontSize: 13, letterSpacing: 2, color: color.fire600, marginTop: 8 },
});
