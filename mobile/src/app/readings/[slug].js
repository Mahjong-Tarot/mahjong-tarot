import { useEffect, useState } from 'react';
import { Alert, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import CompatibilityReport from '../../components/CompatibilityReport';
import { Button, ErrorNote, Loading, Screen } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

export default function RelationshipReading() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [row, setRow] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) { router.replace('/sign-in'); return; }
    supabase.from('readings').select('*').eq('user_id', user.id).eq('slug', String(slug)).maybeSingle()
      .then(({ data, error: e }) => {
        if (e || !data) setError('We could not find this reading.');
        else setRow(data);
      });
  }, [user, slug, router]);

  const remove = () => Alert.alert('Delete this reading?', 'This cannot be undone.', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: async () => {
        const { error: e } = await supabase.from('readings').delete().eq('id', row.id);
        if (e) setError('Could not delete the reading.'); else router.back();
      },
    },
  ]);

  if (error) return <Screen edges={[]}><ErrorNote>{error}</ErrorNote></Screen>;
  if (!row) return <Loading />;

  const p1 = row.person1_name || 'You';
  const p2 = row.person2_name || 'Partner';

  return (
    <Screen edges={[]}>
      <CompatibilityReport result={row.report} person1Label={p1} person2Label={p2} />
      <Button
        variant="ghost"
        title="Share"
        onPress={() => Share.share({ message: `${p1} × ${p2}: ${row.rating != null ? `${Math.round(row.rating)}% match` : 'our match'} on The Mahjong Tarot. ${row.report?.generalMatchDescription || ''}`.trim() })}
      />
      <Button variant="link" title="Delete this reading" onPress={remove} />
    </Screen>
  );
}
