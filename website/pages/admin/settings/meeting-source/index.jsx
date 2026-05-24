import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminShell from '../../../../components/AdminShell';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../lib/auth';
import { requirePage } from '../../../../lib/guards';
import { SUPPORTED_SOURCES } from '../../../../lib/meetingSources';
import * as krisp from '../../../../lib/meetingSources/krisp';
import adminStyles from '../../../../styles/PortalAdmin.module.css';
import styles from '../../../../styles/PortalSettings.module.css';

export async function getServerSideProps(ctx) {
  return requirePage('staff')(ctx);
}

const SOURCE_META = {
  krisp: {
    name: 'Krisp',
    blurb: 'Auto-transcribes your readings and exposes them via MCP. Required for the report-generation flow.',
    accent: 'krisp',
    adapter: krisp,
  },
};

function formatRelative(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function MeetingSourceSettingsPage({ profile }) {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  async function loadConnections() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('meeting_source_connections')
        .select('source, account_label, account_metadata, updated_at, token_expires_at')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setConnections(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load connections.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (supabase) loadConnections(); }, []);

  function findConnection(sourceKey) {
    return connections.find((c) => c.source === sourceKey) || null;
  }

  async function handleConnect(sourceKey) {
    const meta = SOURCE_META[sourceKey];
    if (!meta?.adapter) {
      setError(`${sourceKey} adapter isn't available yet.`);
      return;
    }
    setError('');
    setBusy(sourceKey);
    try {
      const { authorize_url } = await meta.adapter.startOAuth({ user_id: user?.id });
      window.location.href = authorize_url;
    } catch (err) {
      setError(err.message || 'Failed to start connection.');
      setBusy('');
    }
  }

  async function handleDisconnect(sourceKey) {
    if (!confirm(`Disconnect ${SOURCE_META[sourceKey]?.name || sourceKey}?`)) return;
    setError('');
    setBusy(sourceKey);
    try {
      const { error } = await supabase
        .from('meeting_source_connections')
        .delete()
        .eq('source', sourceKey);
      if (error) throw error;
      await loadConnections();
    } catch (err) {
      setError(err.message || 'Disconnect failed.');
    } finally {
      setBusy('');
    }
  }

  return (
    <>
      <Head>
        <title>Meeting source · Settings | Mahjong Tarot Portal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminShell profile={profile}>
          <Link href="/admin/sessions" className={styles.backLink}>← Sessions</Link>
          <p className={adminStyles.pageEyebrow}>Settings · Meeting source</p>
          <h1 className={adminStyles.pageTitle}>Connect your meeting source</h1>
          <p className={adminStyles.pageLede}>
            Connect a recording service so the portal can pull transcripts and
            generate reports for your clients. Only one source needs to be
            connected at a time.
          </p>

          <div className={styles.onHoldBanner} role="note">
            <strong>Meeting-source automation is on hold.</strong> Admins schedule
            sessions and paste transcripts manually for now. The connectors below
            are kept available for future use — no action needed today.
          </div>

          {error && <p className={styles.error}>{error}</p>}

          {loading ? (
            <p className={styles.muted}>Loading current connections…</p>
          ) : (
            <ul className={styles.list}>
              {SUPPORTED_SOURCES.map((key) => {
                const meta = SOURCE_META[key];
                if (!meta) return null;
                const conn = findConnection(key);
                const connected = !!conn;
                const adapterAvailable = !!meta.adapter;
                const isBusy = busy === key;
                return (
                  <li key={key} className={`${styles.card} ${styles[`accent_${meta.accent}`] || ''}`}>
                    <div className={styles.cardHead}>
                      <div>
                        <h2 className={styles.cardName}>{meta.name}</h2>
                        <p className={styles.cardBlurb}>{meta.blurb}</p>
                      </div>
                      {connected ? (
                        <span className={styles.statusConnected}>Connected</span>
                      ) : adapterAvailable ? (
                        <span className={styles.statusReady}>Available</span>
                      ) : (
                        <span className={styles.statusPlanned}>Planned</span>
                      )}
                    </div>

                    {connected && (
                      <dl className={styles.connDetails}>
                        {conn.account_label && (
                          <div className={styles.detail}>
                            <dt>Account</dt>
                            <dd>{conn.account_label}</dd>
                          </div>
                        )}
                        <div className={styles.detail}>
                          <dt>Connected</dt>
                          <dd>{formatRelative(conn.updated_at)}</dd>
                        </div>
                        {conn.token_expires_at && (
                          <div className={styles.detail}>
                            <dt>Token expires</dt>
                            <dd>{formatRelative(conn.token_expires_at)}</dd>
                          </div>
                        )}
                      </dl>
                    )}

                    <div className={styles.cardActions}>
                      {connected ? (
                        <button
                          type="button"
                          className={styles.btnSecondary}
                          onClick={() => handleDisconnect(key)}
                          disabled={isBusy}
                        >
                          {isBusy ? 'Disconnecting…' : `Disconnect ${meta.name}`}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={styles.btnPrimary}
                          onClick={() => handleConnect(key)}
                          disabled={!adapterAvailable || isBusy}
                          title={!adapterAvailable ? 'Adapter not built yet' : undefined}
                        >
                          {isBusy ? 'Opening…' : `Connect ${meta.name}`}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
      </AdminShell>
    </>
  );
}
