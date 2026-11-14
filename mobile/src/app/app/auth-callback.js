import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Body, Button, ErrorNote, Loading, Screen, Title } from '../../components/ui';
import { useAuth } from '../../lib/auth';

// https://www.mahjongtarot.com/app/auth-callback?code=… opens here through a
// Universal Link (magic link, confirm email, password reset). The PKCE
// verifier was stored on this iPhone when the email was requested.
export default function AuthCallback() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { exchangeCode } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = typeof params.code === 'string' ? params.code : null;
    const desc = typeof params.error_description === 'string' ? params.error_description : null;
    if (!code) { setError(desc || 'This link has expired or was already used.'); return; }
    exchangeCode(code).then(({ error: e }) => {
      if (e) setError('This link has expired or was opened on a different phone. Ask for a new one.');
      else router.replace('/readings');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.code]);

  return (
    <Screen>
      {error ? <>
        <Title size={26}>Could not sign you in</Title>
        <ErrorNote>{error}</ErrorNote>
        <Button title="Sign in" onPress={() => router.replace('/sign-in')} />
        <Button variant="link" title="Go to Today" onPress={() => router.replace('/today')} />
      </> : <>
        <Body muted>Signing you in…</Body>
        <Loading />
      </>}
    </Screen>
  );
}
