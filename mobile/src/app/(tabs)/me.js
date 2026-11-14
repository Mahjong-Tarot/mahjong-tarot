import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Body, Button, Card, ErrorNote, Field, Overline, Screen, Title } from '../../components/ui';
import { trialDaysLeft, useAuth } from '../../lib/auth';
import { useBirth } from '../../lib/birthContext';
import { clearBirth, formatBirth } from '../../lib/birth';
import { deleteAccount } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { SITE_URL } from '../../lib/config';
import { color, font } from '../../lib/theme';

const PLAN = { yearly: 'Yearly member', lifetime: 'Lifetime member', founders: 'Founding member', standard: 'Member' };

export default function Me() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { birth } = useBirth();
  const [sub, setSub] = useState(null);
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  useFocusEffect(useCallback(() => {
    if (!user) { setSub(null); return; }
    supabase.from('member_subscriptions').select('plan, status, current_period_end').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => setSub(data || null));
  }, [user]));

  const open = (path) => WebBrowser.openBrowserAsync(`${SITE_URL}${path}`);

  const changePassword = async () => {
    if (pw.length < 8) { setError('Choose a password of at least 8 characters.'); return; }
    setBusy('pw'); setError(null);
    const { error: e } = await supabase.auth.updateUser({ password: pw });
    setBusy(null);
    if (e) setError(e.message); else { setPw(''); setNotice('Password changed.'); }
  };

  const confirmDelete = () => Alert.alert(
    'Delete your account?',
    'This deletes your account, readings and saved people for good, on the app and the website. A yearly membership is cancelled. This cannot be undone.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setBusy('delete'); setError(null);
          try {
            await deleteAccount();
            await signOut();
            await clearBirth();
            router.replace('/welcome');
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(null);
          }
        },
      },
    ],
  );

  if (!user) {
    return (
      <Screen>
        <Overline>Me</Overline>
        <Title size={30}>Your details</Title>
        <Card onPress={() => router.push('/birth')}>
          <Text style={st.label}>Birth details</Text>
          <Text style={st.value}>{formatBirth(birth) || 'Not set'}  <Text style={st.edit}>Edit</Text></Text>
        </Card>
        <Button title="Start free trial" onPress={() => router.push('/signup')} />
        <Button variant="ghost" title="Sign in" onPress={() => router.push('/sign-in')} />
        <Card onPress={() => open('/book-a-reading')}>
          <Text style={st.label}>Book a reading with Bill</Text>
          <Text style={st.value}>Opens the website</Text>
        </Card>
      </Screen>
    );
  }

  const active = sub && ['active', 'trialing', 'past_due'].includes(sub.status);
  const days = trialDaysLeft(profile, user);

  return (
    <Screen>
      <Overline>Me</Overline>
      <Title size={30}>{profile?.name || user.email}</Title>
      <Card tone="fill">
        {active ? <>
          <Text style={st.head}>{PLAN[sub.plan] || 'Member'}</Text>
          <Body small muted>{sub.plan === 'lifetime' ? 'Yours for life.' : 'Manage billing on the website.'}</Body>
        </> : <>
          <Text style={st.head}>Free trial</Text>
          <Body small muted>{days ? `${days} days left. We'll remind you before it ends.` : 'Your trial has ended. Membership is on the website.'}</Body>
        </>}
      </Card>
      <Card onPress={() => router.push('/birth')}>
        <Text style={st.label}>Birth details</Text>
        <Text style={st.value}>{formatBirth(birth) || 'Not set'}  <Text style={st.edit}>Edit</Text></Text>
      </Card>
      <Card>
        <Text style={st.label}>Daily almanac reminder</Text>
        <Text style={st.value}>Coming soon</Text>
      </Card>
      <Card onPress={() => open('/book-a-reading')}>
        <Text style={st.label}>Book a reading with Bill</Text>
        <Text style={st.value}>Opens the website</Text>
      </Card>

      <Field label="New password" value={pw} onChangeText={setPw} secureTextEntry autoComplete="new-password" textContentType="newPassword" />
      <Button variant="ghost" title="Change password" onPress={changePassword} loading={busy === 'pw'} />
      <ErrorNote>{error}</ErrorNote>
      {notice ? <Body small>{notice}</Body> : null}

      <Button variant="ghost" title="Sign out" onPress={signOut} />
      <Button variant="link" title="Delete account" onPress={confirmDelete} loading={busy === 'delete'} style={{ marginTop: 8 }} />
      <Body small muted style={{ textAlign: 'center' }}>{user.email}</Body>
    </Screen>
  );
}

const st = StyleSheet.create({
  label: { fontFamily: font.body, fontSize: 13, color: color.ink3 },
  value: { fontFamily: font.bodyMedium, fontSize: 16, color: color.ink },
  head: { fontFamily: font.heading, fontSize: 18, color: color.ink },
  edit: { color: color.fire600, fontFamily: font.bodySemi },
});
