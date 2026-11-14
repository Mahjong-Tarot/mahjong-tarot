import { Redirect } from 'expo-router';
import { useAuth } from '../lib/auth';
import { useBirth } from '../lib/birthContext';

export default function Index() {
  const { ready: authReady, user } = useAuth();
  const { ready, birth } = useBirth();
  if (!authReady || !ready) return null;
  return <Redirect href={birth?.date || user ? '/today' : '/welcome'} />;
}
