import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import PortalNav from '../../../components/PortalNav';
import { supabase } from '../../../lib/supabase';
import { requirePortalUser } from '../../../lib/requirePortalUser';
import { getReport, updateReport } from '../../../lib/reports';
import { getSession, updateSession } from '../../../lib/sessions';
import { getClient } from '../../../lib/clients';
import portalStyles from '../../../styles/Portal.module.css';
import styles from '../../../styles/PortalReport.module.css';

export async function getServerSideProps(ctx) {
  return requirePortalUser(ctx);
}

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const STATUS_LABEL = {
  draft: 'Draft',
  generating: 'Generating',
  ready: 'Ready',
  sent: 'Sent',
  failed: 'Failed',
};

export default function ReportPage({ profile }) {
  const router = useRouter();
  const { id } = router.query;

  const [report, setReport] = useState(null);
  const [session, setSession] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [savingMeeting, setSavingMeeting] = useState(false);
  const [meetingMessage, setMeetingMessage] = useState('');

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [savingReport, setSavingReport] = useState(false);
  const [reportMessage, setReportMessage] = useState('');

  useEffect(() => {
    if (!id || !supabase) return;
    let active = true;
    setLoading(true);
    setError('');

    (async () => {
      try {
        const r = await getReport(supabase, id);
        if (!r) throw new Error('Report not found.');
        if (!active) return;
        setReport(r);
        setTitle(r.title || '');
        setBody(r.body_markdown || '');

        const [s, c] = await Promise.all([
          r.session_id ? getSession(supabase, r.session_id) : Promise.resolve(null),
          getClient(supabase, r.client_id),
        ]);
        if (!active) return;
        setSession(s);
        setClient(c);
        setTranscript(s?.transcript_text || '');
        setSummary(s?.summary_text || '');
      } catch (err) {
        if (active) setError(err.message || 'Failed to load report.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [id]);

  async function handleSaveMeeting(e) {
    e.preventDefault();
    if (!session) return;
    setSavingMeeting(true);
    setMeetingMessage('');
    try {
      const updated = await updateSession(supabase, session.id, {
        transcript_text: transcript || null,
        summary_text: summary || null,
      });
      setSession(updated);
      setMeetingMessage('Transcript and summary saved.');
    } catch (err) {
      setMeetingMessage(err.message || 'Failed to save.');
    } finally {
      setSavingMeeting(false);
    }
  }

  async function handleSaveReport(e) {
    e.preventDefault();
    setSavingReport(true);
    setReportMessage('');
    try {
      const updated = await updateReport(supabase, report.id, {
        title: title.trim() || null,
        body_markdown: body || null,
      });
      setReport(updated);
      setReportMessage('Report saved.');
    } catch (err) {
      setReportMessage(err.message || 'Failed to save.');
    } finally {
      setSavingReport(false);
    }
  }

  return (
    <ShellLayout profile={profile} title={client?.full_name || 'Report'}>
      <Link href={client ? `/portal/clients/${client.id}` : '/portal'} className={styles.backLink}>
        ← {client ? `Back to ${client.full_name}` : 'Back to portal'}
      </Link>

      <header className={styles.head}>
        <div>
          <p className={portalStyles.eyebrow}>Portal · Report</p>
          <h1 className={portalStyles.h1}>
            {client?.full_name || 'Report'}
          </h1>
          {session && (
            <p className={styles.subtitle}>
              Session on {formatDateTime(session.scheduled_at)}
              {session.duration_minutes ? ` · ${session.duration_minutes} min` : ''}
            </p>
          )}
        </div>
        {report && (
          <span className={`${styles.statusBadge} ${styles[`status_${report.status}`] || ''}`}>
            {STATUS_LABEL[report.status] || report.status}
            {report.status === 'sent' && report.sent_at && (
              <> · {formatDateTime(report.sent_at)}</>
            )}
          </span>
        )}
      </header>

      {error && <p className={styles.error}>{error}</p>}
      {loading && <p className={portalStyles.muted}>Loading report…</p>}

      {!loading && report && (
        <>
          {/* ─── Session context ─── */}
          {session && (
            <section className={styles.section}>
              <h2 className={styles.sectionHeading}>Session context</h2>
              <dl className={styles.contextGrid}>
                <div>
                  <dt>Client</dt>
                  <dd>{client?.full_name || '—'}</dd>
                </div>
                <div>
                  <dt>Scheduled</dt>
                  <dd>{formatDateTime(session.scheduled_at)}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{session.status}</dd>
                </div>
                {session.duration_minutes && (
                  <div>
                    <dt>Duration</dt>
                    <dd>{session.duration_minutes} min</dd>
                  </div>
                )}
              </dl>
              {session.prep_notes && (
                <div className={styles.notes}>
                  <p className={styles.notesLabel}>Prep notes</p>
                  <p className={styles.notesBody}>{session.prep_notes}</p>
                </div>
              )}
            </section>
          )}

          {/* ─── Transcript & summary (saves to session) ─── */}
          {session && (
            <section className={styles.section}>
              <h2 className={styles.sectionHeading}>Transcript &amp; summary</h2>
              <p className={styles.sectionLede}>
                Paste the raw transcript and a short summary from your recording
                service. These live on the session record, so you can revise
                them at any time.
              </p>
              <form onSubmit={handleSaveMeeting} className={styles.form}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Transcript</span>
                  <textarea
                    className={styles.textarea}
                    rows={14}
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Paste the call transcript here…"
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Summary (optional)</span>
                  <textarea
                    className={styles.textarea}
                    rows={6}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="A few sentences capturing the key themes…"
                  />
                </label>
                <div className={styles.formActions}>
                  <button type="submit" className={styles.btnPrimary} disabled={savingMeeting}>
                    {savingMeeting ? 'Saving…' : 'Save transcript & summary'}
                  </button>
                  {meetingMessage && <span className={styles.formMessage}>{meetingMessage}</span>}
                </div>
              </form>
            </section>
          )}

          {/* ─── Report body (saves to report) ─── */}
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>Report</h2>
            <p className={styles.sectionLede}>
              Paste the polished report you produced from your Claude.ai
              Project. Markdown is supported — headings, lists, emphasis. The
              client receives this in PR #8 once you click <em>Send</em>.
            </p>
            <form onSubmit={handleSaveReport} className={styles.form}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Title</span>
                <input
                  type="text"
                  className={styles.input}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={client ? `${client.full_name}'s reading` : 'Reading title'}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Body (markdown)</span>
                <textarea
                  className={styles.textarea}
                  rows={22}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Paste the polished report markdown here…"
                />
              </label>
              <div className={styles.formActions}>
                <button type="submit" className={styles.btnPrimary} disabled={savingReport}>
                  {savingReport ? 'Saving…' : 'Save report'}
                </button>
                {reportMessage && <span className={styles.formMessage}>{reportMessage}</span>}
              </div>
            </form>
          </section>
        </>
      )}
    </ShellLayout>
  );
}

function ShellLayout({ profile, title, children }) {
  return (
    <>
      <Head>
        <title>{title ? `${title} · Report` : 'Report'} | Mahjong Tarot Portal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className={portalStyles.shell}>
        <PortalNav profile={profile} />
        <main className={portalStyles.main}>{children}</main>
      </div>
    </>
  );
}
