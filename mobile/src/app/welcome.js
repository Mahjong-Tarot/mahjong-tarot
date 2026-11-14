import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import BirthForm from '../components/BirthForm';
import { Body, Button, Overline, Screen, Title } from '../components/ui';
import { useBirth } from '../lib/birthContext';

export default function Welcome() {
  const router = useRouter();
  const { update } = useBirth();
  const [busy, setBusy] = useState(false);

  const submit = async (birth) => {
    setBusy(true);
    await update(birth);
    setBusy(false);
    router.replace('/chart');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen contentStyle={{ paddingTop: 40 }}>
        <Overline>The Mahjong Tarot</Overline>
        <Title size={32} em="It takes a minute.">See your chart. </Title>
        <Body muted>Free. No account needed. Your birth details stay on this phone unless you start a trial or sign in.</Body>
        <BirthForm onSubmit={submit} busy={busy} />
        <Button variant="link" title="I'm a member · Sign in" onPress={() => router.push('/sign-in')} />
      </Screen>
    </KeyboardAvoidingView>
  );
}
