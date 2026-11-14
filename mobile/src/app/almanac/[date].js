import { useLocalSearchParams } from 'expo-router';
import AlmanacDay from '../../components/AlmanacDay';
import { Screen } from '../../components/ui';
import { useBirth } from '../../lib/birthContext';

// Opened from website links (/almanac/2026-11-14) via Universal Links.
export default function AlmanacDate() {
  const { date } = useLocalSearchParams();
  const { birth } = useBirth();
  const valid = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date);
  return (
    <Screen edges={[]}>
      <AlmanacDay date={valid ? date : undefined} birth={birth} />
    </Screen>
  );
}
