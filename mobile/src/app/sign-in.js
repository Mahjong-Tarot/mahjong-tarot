import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Body, Button, ErrorNote, Field, Overline, Screen, Title } from '../components/ui';
import { useAuth } from '../lib/auth';

export default function SignIn() {
  const router = useRouter();
  const { signIn, sendMagicLink, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const clean = email.trim().toLowerCase();

  const doSignIn = async () => {
    if (!clean || !password) { setError('Enter your email and password.'); return; }
    setBusy('password'); setError(null);
    const { error: e } = await signIn(clean, password);
    setBusy(null);
    if (e) { setError(e.message === 'Invalid login credentials' ? 'That email and password do not match.' : e.message); return; }
    router.dismissTo('/readings');
  };

  const doMagic = async () => {
    if (!clean) { setError('Enter your email first.'); return; }
    setBusy('magic'); setError(null);
    const { error: e } = await sendMagicLink(clean);
    setBusy(null);
    if (e) { setError(e.message); return; }
    setNotice(`We sent a sign-in link to ${clean}. Open it on this iPhone.`);
  };

  const doReset = async () => {
    if (!clean) { setError('Enter your email first.'); return; }
    setBusy('reset'); setError(null);
    const { error: e } = await resetPassword(clean);
    setBusy(null);
    if (e) { setError(e.message); return; }
    setNotice(`We sent a link to ${clean}. Open it on this iPhone, then choose a new password.`);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen edges={[]}>
        <Overline>Member sign in</Overline>
        <Title size={30}>Welcome back</Title>
        <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" />
        <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" textContentType="password" />
        <ErrorNote>{error}</ErrorNote>
        {notice ? <Body>{notice}</Body> : null}
        <Button title="Sign in" onPress={doSignIn} loading={busy === 'password'} />
        <Button variant="ghost" title="Email me a sign-in link" onPress={doMagic} loading={busy === 'magic'} />
        <Body small muted style={{ textAlign: 'center' }}>Same account as the website.</Body>
        <Button variant="link" title="Forgot password" onPress={doReset} loading={busy === 'reset'} />
        <Button variant="link" title="New here? Start a free trial" onPress={() => router.replace('/signup')} />
      </Screen>
    </KeyboardAvoidingView>
  );
}
