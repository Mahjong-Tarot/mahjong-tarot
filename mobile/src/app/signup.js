import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { Body, Button, Card, ErrorNote, Field, Overline, Screen, Title } from '../components/ui';
import { useAuth } from '../lib/auth';
import { useBirth } from '../lib/birthContext';
import { formatBirth } from '../lib/birth';
import { SITE_URL } from '../lib/config';
import { color, font } from '../lib/theme';

function Check({ value, onChange, children }) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: value }} onPress={() => onChange(!value)} style={st.check}>
      <Ionicons name={value ? 'checkbox' : 'square-outline'} size={22} color={value ? color.fire500 : color.ink3} />
      <Text style={st.checkText}>{children}</Text>
    </Pressable>
  );
}

// Same account and fields as the website's trial form (TrialSignup.jsx).
export default function Signup() {
  const router = useRouter();
  const { startTrial } = useAuth();
  const { birth } = useBirth();
  const [firstName, setFirst] = useState('');
  const [lastName, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newsletter, setNewsletter] = useState(true);
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [sentTo, setSentTo] = useState(null);

  const submit = async () => {
    const clean = email.trim().toLowerCase();
    if (!firstName.trim() || !clean) { setError('Enter your first name and email.'); return; }
    if (password.length < 8) { setError('Choose a password of at least 8 characters.'); return; }
    if (!terms) { setError('Please agree to the Terms and Privacy Policy.'); return; }
    setBusy(true); setError(null);
    const { data, error: e } = await startTrial({ email: clean, password, firstName: firstName.trim(), lastName: lastName.trim(), birth, newsletter });
    setBusy(false);
    if (e) { setError(e.message); return; }
    if (data?.session) { router.dismissTo('/readings'); return; }
    setSentTo(clean);
  };

  if (sentTo) {
    return (
      <Screen edges={[]}>
        <Overline>Almost there</Overline>
        <Title size={28} em="email">Confirm your </Title>
        <Body>We sent a link to {sentTo}. Open it on this iPhone and your free trial starts straight away.</Body>
        <Button variant="ghost" title="Done" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen edges={[]}>
        <Overline>Free for 90 days · No card</Overline>
        <Title size={30} em="free trial">Start your </Title>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Field style={{ flex: 1 }} label="First name" value={firstName} onChangeText={setFirst} autoComplete="given-name" textContentType="givenName" />
          <Field style={{ flex: 1 }} label="Last name" value={lastName} onChangeText={setLast} autoComplete="family-name" textContentType="familyName" />
        </View>
        <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" />
        <Field label="Choose a password" placeholder="At least 8 characters" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" textContentType="newPassword" />
        {birth?.date ? (
          <Card tone="fill" onPress={() => router.push('/birth')}>
            <Text style={st.small}>Your birth details</Text>
            <Text style={st.birth}>{formatBirth(birth)}  <Text style={st.edit}>Edit</Text></Text>
          </Card>
        ) : null}
        <Check value={newsletter} onChange={setNewsletter}>Email me occasional updates from Bill. Twice a month at most.</Check>
        <Check value={terms} onChange={setTerms}>
          I agree to the <Text style={st.link} onPress={() => WebBrowser.openBrowserAsync(`${SITE_URL}/contact`)}>Terms and Privacy Policy</Text>.
        </Check>
        <ErrorNote>{error}</ErrorNote>
        <Button title="Start free trial" onPress={submit} loading={busy} />
        <Button variant="link" title="I already have an account · Sign in" onPress={() => router.replace('/sign-in')} />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  check: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  checkText: { flex: 1, fontFamily: font.body, fontSize: 15, lineHeight: 21, color: color.ink2 },
  link: { color: color.fire600, fontFamily: font.bodySemi },
  small: { fontFamily: font.body, fontSize: 13, color: color.ink3 },
  birth: { fontFamily: font.bodyMedium, fontSize: 15, color: color.ink },
  edit: { color: color.fire600, fontFamily: font.bodySemi },
});
