// Full-page view of a single Quick Reading. Reached after generating a
// reading or by clicking a row in the Past readings tab. The header
// carries the share/email actions; the reading fills the rest of the
// viewport so the Purple Star chart renders at full size.
//
// The readings select runs through the user-scoped client, so RLS keeps
// each astrologer's readings private to them.

import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { requirePage } from '../../../lib/guards';
import { supabase } from '../../../lib/supabase';
import adminStyles from '../../../styles/PortalAdmin.module.css';
import styles from '../../../styles/PortalQuickReading.module.css';

export async function getServerSideProps(ctx) {
  return requirePage('staff')(ctx);
}

function relTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export default function QuickReadingView() {
  const router = useRouter();
  const { id } = router.query;

  const [reading, setReading] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [loaded, setLoaded] = useState(false);

  const [copied, setCopied] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailMsg, setEmailMsg] = useState('');
  const [emailErr, setEmailErr] = useState('');

  useEffect(() => {
    if (!id || !supabase) return;
    let cancelled = false;
    supabase
      .from('readings')
      .select('id, created_at, person1_name, person2_name, sent_to, public_token, html')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error: e }) => {
        if (cancelled) return;
        if (e) setLoadError(e.message);
        else setReading(data);
        setLoaded(true);
      });
    return () => { cancelled = true; };
  }, [id]);

  function copyPublicLink() {
    if (!reading?.public_token) return;
    const url = `${window.location.origin}/reading/q/${reading.public_token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  async function sendEmails() {
    const emails = emailInput.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean);
    if (emails.length === 0) {
      setEmailErr('Enter at least one email address.');
      return;
    }
    const bad = emails.find((e) => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));
    if (bad) {
      setEmailErr(`Invalid email address: ${bad}`);
      return;
    }
    setEmailErr('');
    setEmailMsg('');
    setEmailSending(true);
    try {
      const res = await fetch('/api/admin/email-quick-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reading.id, emails }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send.');
      setEmailMsg(`Sent to ${data.sentTo.join(', ')}.`);
      setEmailInput('');
      setReading((r) => (r ? { ...r, sent_to: data.sentToAll } : r));
    } catch (err) {
      setEmailErr(err?.message || 'Failed to send.');
    } finally {
      setEmailSending(false);
    }
  }

  const title = reading
    ? `${reading.person1_name || '(unnamed)'}${reading.person2_name ? ` × ${reading.person2_name}` : ''}`
    : 'Reading';

  return (
    <>
      <Head>
        <title>{`${title} | Mahjong Tarot Portal`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={styles.fullPage}>
        <div className={styles.fullHeader}>
          <div className={styles.fullHeaderLeft}>
            <Link href="/admin/quick-reading" className={styles.backLink}>← Quick readings</Link>
            <h1 className={styles.drawerTitle}>{title}</h1>
            {reading && (
              <div className={styles.drawerMeta}>
                <span className={styles.drawerDate}>{relTime(reading.created_at)}</span>
                {reading.sent_to && (
                  <>
                    <span className={styles.metaDot} aria-hidden="true">·</span>
                    <span className={styles.drawerSent}>Sent to {reading.sent_to}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {reading && (
            <div className={styles.fullHeaderRight}>
              <div className={styles.fullHeaderActions}>
                {reading.public_token && (
                  <button type="button" className={styles.btnSecondary} onClick={copyPublicLink}>
                    {copied ? 'Link copied ✓' : 'Copy public link'}
                  </button>
                )}
                <div className={styles.emailGroup}>
                  <input
                    type="text"
                    className={styles.emailInput}
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendEmails(); } }}
                    placeholder="one@example.com, two@example.com"
                    disabled={emailSending}
                  />
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={sendEmails}
                    disabled={emailSending || !emailInput.trim()}
                  >
                    {emailSending ? 'Sending…' : 'Email'}
                  </button>
                </div>
              </div>
              {emailMsg && <p className={styles.actionMsg}>{emailMsg}</p>}
              {emailErr && <p className={`${styles.actionMsg} ${styles.actionMsgError}`}>{emailErr}</p>}
            </div>
          )}
        </div>

        <div className={styles.fullBody}>
          {!loaded && <p className={adminStyles.muted} style={{ padding: 20 }}>Loading…</p>}
          {loaded && loadError && <p className="error-block" style={{ margin: 20 }}>{loadError}</p>}
          {loaded && !loadError && !reading && (
            <p className={adminStyles.muted} style={{ padding: 20 }}>Reading not found.</p>
          )}
          {loaded && reading && (
            <iframe
              className={styles.drawerFrame}
              sandbox="allow-scripts"
              srcDoc={reading.html || '<p style="padding:20px; font-family:sans-serif;">No saved HTML for this reading.</p>'}
              title={title}
            />
          )}
        </div>
      </div>
    </>
  );
}
