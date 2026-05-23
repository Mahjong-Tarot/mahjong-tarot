import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AdminShell from '../../../../components/AdminShell';
import { requirePortalUser } from '../../../../lib/requirePortalUser';
import * as krisp from '../../../../lib/meetingSources/krisp';
import adminStyles from '../../../../styles/PortalAdmin.module.css';
import styles from '../../../../styles/PortalSettings.module.css';

export async function getServerSideProps(ctx) {
  return requirePortalUser(ctx);
}

const ADAPTER_BY_SOURCE = {
  krisp,
};

export default function MeetingSourceCallback({ profile }) {
  const router = useRouter();
  const [status, setStatus] = useState('working'); // 'working' | 'ok' | 'error'
  const [message, setMessage] = useState('Completing the connection…');

  useEffect(() => {
    if (!router.isReady) return;

    const { source, code, state, error: oauthError, error_description } = router.query;

    if (oauthError) {
      setStatus('error');
      setMessage(`${oauthError}${error_description ? `: ${error_description}` : ''}`);
      return;
    }

    if (!source || !code || !state) {
      setStatus('error');
      setMessage('Missing required parameters from the OAuth callback.');
      return;
    }

    const adapter = ADAPTER_BY_SOURCE[source];
    if (!adapter) {
      setStatus('error');
      setMessage(`Unsupported source: ${source}.`);
      return;
    }

    const stored = adapter.readStoredPkce?.();
    if (!stored || !stored.verifier || !stored.state) {
      setStatus('error');
      setMessage(
        'OAuth state was lost between starting and finishing the flow. ' +
        'Did this tab survive the redirect? Try the connect button again.',
      );
      return;
    }

    if (stored.state !== state) {
      adapter.clearStoredPkce?.();
      setStatus('error');
      setMessage('OAuth state mismatch — possible CSRF. Aborting and starting over.');
      return;
    }

    let cancelled = false;
    fetch('/api/admin/meeting-source/oauth-exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, code, state, code_verifier: stored.verifier }),
    })
      .then(async (res) => {
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload?.error || `Exchange failed (${res.status})`);
        return payload;
      })
      .then((payload) => {
        if (cancelled) return;
        adapter.clearStoredPkce?.();
        setStatus('ok');
        setMessage(
          payload?.account_label
            ? `Connected as ${payload.account_label}. Redirecting…`
            : 'Connection saved. Redirecting…',
        );
        // Brief pause so the user sees the success message before the redirect.
        setTimeout(() => {
          router.replace(stored.return_url || '/admin/settings/meeting-source');
        }, 1200);
      })
      .catch((err) => {
        if (cancelled) return;
        adapter.clearStoredPkce?.();
        setStatus('error');
        setMessage(err.message || 'Token exchange failed.');
      });

    return () => { cancelled = true; };
  }, [router.isReady, router.query]);

  return (
    <>
      <Head>
        <title>Completing connection… | Mahjong Tarot Portal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminShell profile={profile}>
          <p className={adminStyles.pageEyebrow}>Settings · Meeting source</p>
          <h1 className={adminStyles.pageTitle}>Connecting your meeting source</h1>

          <div className={`${styles.callbackPanel} ${styles[`callback_${status}`] || ''}`}>
            <p className={styles.callbackMessage}>{message}</p>
            {status === 'error' && (
              <div className={styles.cardActions}>
                <Link href="/admin/settings/meeting-source" className={styles.btnSecondary}>
                  Back to settings
                </Link>
              </div>
            )}
          </div>
      </AdminShell>
    </>
  );
}
