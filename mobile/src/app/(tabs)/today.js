import AlmanacDay from '../../components/AlmanacDay';
import { Screen } from '../../components/ui';
import { useBirth } from '../../lib/birthContext';

export default function Today() {
  const { birth } = useBirth();
  return (
    <Screen>
      <AlmanacDay birth={birth} />
    </Screen>
  );
}
