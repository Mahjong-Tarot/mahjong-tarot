import { useState } from 'react';
import { useRouter } from 'expo-router';
import BirthForm from '../components/BirthForm';
import { Body, Screen } from '../components/ui';
import { useBirth } from '../lib/birthContext';
import { useAuth } from '../lib/auth';

export default function EditBirth() {
  const router = useRouter();
  const { user } = useAuth();
  const { birth, update } = useBirth();
  const [busy, setBusy] = useState(false);

  const submit = async (next) => {
    setBusy(true);
    await update(next);
    setBusy(false);
    router.back();
  };

  return (
    <Screen edges={[]}>
      <Body muted>{user ? 'Saved to your account, so the website shows the same chart.' : 'Kept on this phone only.'}</Body>
      <BirthForm initial={birth} submitLabel="Save" onSubmit={submit} busy={busy} />
    </Screen>
  );
}
