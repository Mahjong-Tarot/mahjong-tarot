import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import BirthForm from '../../components/BirthForm';
import ChartView from '../../components/ChartView';
import { Body, Button, Card, ErrorNote, Loading, Overline, Screen, Title } from '../../components/ui';
import { fetchChart } from '../../lib/api';
import { formatBirth } from '../../lib/birth';
import { useBirth } from '../../lib/birthContext';
import { useAuth } from '../../lib/auth';
import { color, font } from '../../lib/theme';

export default function MyChart() {
  const router = useRouter();
  const { user } = useAuth();
  const { birth, update } = useBirth();
  const [chart, setChart] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const key = birth?.date ? `${birth.date}|${birth.time}|${birth.gender}` : null;

  useEffect(() => {
    if (!key) return;
    let alive = true;
    setLoading(true); setError(null);
    fetchChart(birth)
      .then((c) => { if (alive) setChart(c); })
      .catch((e) => { if (alive) setError(e.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!birth?.date) {
    return (
      <Screen>
        <Overline>My Chart</Overline>
        <Title size={28} em="It takes a minute.">See your chart. </Title>
        <BirthForm onSubmit={update} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Overline>My Chart</Overline>
      <Title size={30} em="one angle" after=".">That is </Title>
      <Text style={{ fontFamily: font.body, fontSize: 14, color: color.ink3 }}>
        {formatBirth(birth)}  <Text onPress={() => router.push('/birth')} style={{ color: color.fire600, fontFamily: font.bodySemi }}>Edit</Text>
      </Text>
      {loading && !chart ? <Loading /> : null}
      <ErrorNote>{error}</ErrorNote>
      {chart ? <ChartView chart={chart} /> : null}
      <Card tone="highlight" onPress={() => router.push(user ? '/readings' : '/signup')}>
        <Text style={{ fontFamily: font.heading, fontSize: 18, color: color.ink }}>There is more to your chart.</Text>
        <Body small>{user ? 'Read your Purple Star map and your relationship readings.' : 'Your Purple Star map and relationship readings. Free for 90 days, no card needed.'}</Body>
        <Button title={user ? 'Open my reports' : 'Start free trial'} onPress={() => router.push(user ? '/readings' : '/signup')} style={{ marginTop: 6 }} />
      </Card>
    </Screen>
  );
}
