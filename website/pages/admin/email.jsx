import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import AdminShell from '../../components/AdminShell';
import { supabase } from '../../lib/supabase';
import { requirePage } from '../../lib/guards';
import adminStyles from '../../styles/PortalAdmin.module.css';
import tableStyles from '../../styles/PortalAdminTable.module.css';

export async function getServerSideProps(ctx) {
  return requirePage('admin')(ctx);
}

// Campaign-plan §8 gate thresholds for the warm-up review.
const GATE_OPEN_RATE_FLOOR = 0.08;
const GATE_COMPLAINT_CEILING = 0.002;

const SUPPRESSION_LABELS = {
  hard_bounce: 'Hard bounce',
  hardbounce: 'Hard bounce',
  spam: 'Spam complaint',
  complaint: 'Spam complaint',
  unsubscribe: 'Unsubscribed',
  unsubscribed: 'Unsubscribed',
};

function pct(numerator, denominator) {
  if (!denominator) return null;
  return numerator / denominator;
}

function fmtPct(ratio, digits = 1) {
  if (ratio === null || ratio === undefined) return '—';
  return `${(ratio * 100).toFixed(digits)}%`;
}

function fmtTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

function shortUrl(url) {
  try {
    const u = new URL(url);
    const path = u.pathname === '/' ? '' : u.pathname;
    return `${u.hostname.replace(/^www\./, '')}${path}`;
  } catch {
    return url;
  }
}

// Folds raw hourly rows (one per event_type) into per-hour buckets
// of opens + clicks, capped at the most recent `hours`.
function buildTimeline(rows, hours = 48) {
  const byHour = new Map();
  for (const r of rows) {
    const entry = byHour.get(r.bucket) || { opens: 0, clicks: 0 };
    if (r.event_type === 'opened' || r.event_type === 'unique_opened') entry.opens += r.events;
    if (r.event_type === 'click') entry.clicks += r.events;
    byHour.set(r.bucket, entry);
  }
  return [...byHour.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-hours)
    .map(([bucket, counts]) => ({ bucket, ...counts }));
}

export default function EmailDashboard({ profile }) {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [topLinks, setTopLinks] = useState([]);
  const [domains, setDomains] = useState([]);
  const [replies, setReplies] = useState([]);
  const [suppressed, setSuppressed] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Campaign list first; everything else is keyed off the selection.
  useEffect(() => {
    if (!supabase) {
      setError('Supabase not configured.');
      setLoading(false);
      return;
    }
    supabase
      .from('admin_email_campaign_stats')
      .select('*')
      .order('last_event_at', { ascending: false })
      .then(({ data, error: e }) => {
        if (e) {
          setError(e.message);
          setLoading(false);
          return;
        }
        setCampaigns(data ?? []);
        setSelectedId((data ?? [])[0]?.campaign_id ?? null);
        if (!(data ?? []).length) setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!supabase || selectedId === null) return;
    setLoading(true);
    const filter = (q) =>
      selectedId === undefined ? q : q.eq('campaign_id', selectedId);

    Promise.all([
      filter(supabase.from('admin_email_event_timeline').select('*')).order('bucket'),
      filter(supabase.from('admin_email_top_links').select('*'))
        .order('clicks', { ascending: false })
        .limit(10),
      filter(supabase.from('admin_email_domain_stats').select('*'))
        .order('delivered', { ascending: false })
        .limit(8),
      supabase
        .from('email_replies')
        .select('from_email, from_name, subject, text_body, forwarded_at, created_at')
        .order('created_at', { ascending: false })
        .limit(25),
      supabase
        .from('admin_email_suppressed')
        .select('*')
        .order('suppressed_at', { ascending: false })
        .limit(50),
      supabase
        .from('email_events')
        .select('event_type, email, campaign_name, url, occurred_at')
        .order('occurred_at', { ascending: false })
        .limit(25),
    ]).then((results) => {
      const firstError = results.find((r) => r.error);
      if (firstError) {
        setError(firstError.error.message);
        setLoading(false);
        return;
      }
      const [tl, links, doms, reps, supp, rec] = results.map((r) => r.data ?? []);
      setTimeline(buildTimeline(tl));
      setTopLinks(links);
      setDomains(doms);
      setReplies(reps);
      setSuppressed(supp);
      setRecent(rec);
      setLoading(false);
    });
  }, [selectedId]);

  const stats = useMemo(
    () => campaigns.find((c) => c.campaign_id === selectedId) || null,
    [campaigns, selectedId],
  );

  const derived = useMemo(() => {
    if (!stats) return null;
    const d = stats.delivered || 0;
    return {
      openRate: pct(stats.unique_opens, d),
      clickRate: pct(stats.unique_clicks, d),
      clickToOpen: pct(stats.unique_clicks, stats.unique_opens),
      bounceRate: pct(stats.hard_bounces + stats.soft_bounces, d),
      unsubRate: pct(stats.unsubscribes, d),
      complaintRate: pct(stats.spam_complaints, d),
    };
  }, [stats]);

  // Warm-up gate verdict (campaign plan §8): needs delivered volume
  // to be meaningful, so it stays "pending" until events arrive.
  const gate = useMemo(() => {
    if (!stats || !derived || !stats.delivered) return { verdict: 'pending' };
    const openOk = derived.openRate >= GATE_OPEN_RATE_FLOOR;
    const complaintsOk = (derived.complaintRate ?? 0) <= GATE_COMPLAINT_CEILING;
    if (openOk && complaintsOk) return { verdict: 'pass', openOk, complaintsOk };
    return { verdict: 'fail', openOk, complaintsOk };
  }, [stats, derived]);

  const maxTimelineCount = Math.max(1, ...timeline.map((t) => t.opens + t.clicks));
  const maxLinkClicks = Math.max(1, ...topLinks.map((l) => l.clicks));

  return (
    <>
      <Head>
        <title>Email | Mahjong Tarot Portal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminShell profile={profile}>
        <p className={adminStyles.pageEyebrow}>Admin</p>
        <h1 className={adminStyles.pageTitle}>Email</h1>
        <p className={adminStyles.pageLede}>
          Campaign engagement, replies, and list health — mirrored live from Brevo
          into Supabase. Raw send totals live in the{' '}
          <a href="https://app.brevo.com/marketing-dashboard" target="_blank" rel="noreferrer">
            Brevo dashboard
          </a>.
        </p>

        {error && <p className={tableStyles.error}>{error}</p>}
        {loading && <p className={adminStyles.muted}>Loading…</p>}

        {!loading && !error && !campaigns.length && (
          <p className={adminStyles.muted}>
            No email events yet. Events appear here from the first campaign send onward.
          </p>
        )}

        {!loading && !error && campaigns.length > 0 && (
          <>
            <div className={tableStyles.chipRow} style={{ marginBottom: 16 }}>
              {campaigns.map((c) => (
                <button
                  key={c.campaign_id ?? 'none'}
                  type="button"
                  className={`${tableStyles.chip} ${c.campaign_id === selectedId ? tableStyles.chipActive : ''}`}
                  onClick={() => setSelectedId(c.campaign_id)}
                >
                  {c.campaign_name || `Campaign ${c.campaign_id ?? '—'}`}
                </button>
              ))}
            </div>

            {stats && derived && (
              <>
                <div className={adminStyles.statRow}>
                  <div className={adminStyles.statCard}>
                    <p className={adminStyles.statLabel}>Delivered</p>
                    <p className={adminStyles.statValue}>{stats.delivered.toLocaleString()}</p>
                    <p className={adminStyles.statHint}>unique recipients</p>
                  </div>
                  <div className={adminStyles.statCard}>
                    <p className={adminStyles.statLabel}>Open rate</p>
                    <p className={adminStyles.statValue}>{fmtPct(derived.openRate)}</p>
                    <p className={adminStyles.statHint}>
                      {stats.unique_opens.toLocaleString()} unique · {stats.total_opens.toLocaleString()} total
                    </p>
                  </div>
                  <div className={adminStyles.statCard}>
                    <p className={adminStyles.statLabel}>Click rate</p>
                    <p className={adminStyles.statValue}>{fmtPct(derived.clickRate)}</p>
                    <p className={adminStyles.statHint}>
                      {stats.unique_clicks.toLocaleString()} unique · CTOR {fmtPct(derived.clickToOpen)}
                    </p>
                  </div>
                  <div className={adminStyles.statCard}>
                    <p className={adminStyles.statLabel}>Replies</p>
                    <p className={adminStyles.statValue}>{replies.length.toLocaleString()}</p>
                    <p className={adminStyles.statHint}>captured + forwarded to Bill</p>
                  </div>
                </div>

                <div className={adminStyles.statRow}>
                  <div className={adminStyles.statCard}>
                    <p className={adminStyles.statLabel}>Bounce rate</p>
                    <p className={adminStyles.statValue}>{fmtPct(derived.bounceRate)}</p>
                    <p className={adminStyles.statHint}>
                      {stats.hard_bounces} hard · {stats.soft_bounces} soft
                    </p>
                  </div>
                  <div className={adminStyles.statCard}>
                    <p className={adminStyles.statLabel}>Unsubscribes</p>
                    <p className={adminStyles.statValue}>{fmtPct(derived.unsubRate)}</p>
                    <p className={adminStyles.statHint}>{stats.unsubscribes} contacts</p>
                  </div>
                  <div className={adminStyles.statCard}>
                    <p className={adminStyles.statLabel}>Spam complaints</p>
                    <p className={adminStyles.statValue}>{fmtPct(derived.complaintRate, 2)}</p>
                    <p className={adminStyles.statHint}>{stats.spam_complaints} contacts</p>
                  </div>
                  <div className={adminStyles.statCard}>
                    <p className={adminStyles.statLabel}>Warm-up gate</p>
                    <p className={adminStyles.statValue}>
                      {gate.verdict === 'pass' && '✅ Pass'}
                      {gate.verdict === 'fail' && '🔴 Review'}
                      {gate.verdict === 'pending' && '⏳ Pending'}
                    </p>
                    <p className={adminStyles.statHint}>
                      opens ≥ {fmtPct(GATE_OPEN_RATE_FLOOR, 0)} · complaints ≤ {fmtPct(GATE_COMPLAINT_CEILING, 1)}
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className={adminStyles.gridTwo}>
              <div className={adminStyles.panel}>
                <div className={adminStyles.panelHeader}>
                  <h2 className={adminStyles.panelTitle}>Activity — opens &amp; clicks by hour</h2>
                </div>
                {!timeline.length && <p className={adminStyles.muted}>No activity yet.</p>}
                <div className={adminStyles.barList}>
                  {timeline.map((t) => (
                    <div className={adminStyles.barRow} key={t.bucket}>
                      <span className={adminStyles.barLabel}>{fmtTime(t.bucket)}</span>
                      <span className={adminStyles.barTrack}>
                        <span
                          className={adminStyles.barFill}
                          style={{ width: `${((t.opens + t.clicks) / maxTimelineCount) * 100}%` }}
                        />
                      </span>
                      <span className={adminStyles.barCount}>
                        {t.opens} {t.opens === 1 ? 'open' : 'opens'} · {t.clicks} {t.clicks === 1 ? 'click' : 'clicks'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={adminStyles.panel}>
                <div className={adminStyles.panelHeader}>
                  <h2 className={adminStyles.panelTitle}>Top clicked links</h2>
                </div>
                {!topLinks.length && <p className={adminStyles.muted}>No clicks yet.</p>}
                <div className={adminStyles.barList}>
                  {topLinks.map((l) => (
                    <div className={adminStyles.barRow} key={l.url}>
                      <span className={adminStyles.barLabel} title={l.url}>{shortUrl(l.url)}</span>
                      <span className={adminStyles.barTrack}>
                        <span
                          className={adminStyles.barFill}
                          style={{ width: `${(l.clicks / maxLinkClicks) * 100}%` }}
                        />
                      </span>
                      <span className={adminStyles.barCount}>
                        {l.clicks} ({l.unique_clicks} uniq)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={adminStyles.gridTwo}>
              <div className={adminStyles.panel}>
                <div className={adminStyles.panelHeader}>
                  <h2 className={adminStyles.panelTitle}>Replies</h2>
                </div>
                {!replies.length && <p className={adminStyles.muted}>No replies captured yet.</p>}
                <div className={adminStyles.feed}>
                  {replies.map((r) => (
                    <div className={adminStyles.feedItem} key={`${r.from_email}-${r.created_at}`}>
                      <p className={adminStyles.feedTitle}>
                        {r.from_name || r.from_email} — {r.subject || '(no subject)'}
                        {r.forwarded_at ? ' ✓' : ' (not forwarded)'}
                      </p>
                      <p className={adminStyles.feedDetail}>
                        {(r.text_body || '').slice(0, 140) || '(empty body)'}
                      </p>
                      <p className={adminStyles.feedTime}>{fmtTime(r.created_at)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className={adminStyles.panel}>
                <div className={adminStyles.panelHeader}>
                  <h2 className={adminStyles.panelTitle}>Engagement by mail provider</h2>
                </div>
                {!domains.length && <p className={adminStyles.muted}>No data yet.</p>}
                {domains.length > 0 && (
                  <table className={tableStyles.ordersTable}>
                    <thead>
                      <tr>
                        <th>Domain</th>
                        <th>Delivered</th>
                        <th>Opens</th>
                        <th>Bounces</th>
                        <th>Complaints</th>
                      </tr>
                    </thead>
                    <tbody>
                      {domains.map((d) => (
                        <tr key={d.domain}>
                          <td>{d.domain}</td>
                          <td>{d.delivered}</td>
                          <td>{d.opens} ({fmtPct(pct(d.opens, d.delivered), 0)})</td>
                          <td>{d.bounces}</td>
                          <td>{d.complaints}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className={adminStyles.gridTwo}>
              <div className={adminStyles.panel}>
                <div className={adminStyles.panelHeader}>
                  <h2 className={adminStyles.panelTitle}>Suppressed contacts</h2>
                </div>
                {!suppressed.length && <p className={adminStyles.muted}>Nobody suppressed. Clean list.</p>}
                {suppressed.length > 0 && (
                  <table className={tableStyles.ordersTable}>
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Reason</th>
                        <th>Campaign</th>
                        <th>When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suppressed.map((s) => (
                        <tr key={s.email}>
                          <td>{s.email}</td>
                          <td>{SUPPRESSION_LABELS[s.event_type] || s.event_type}</td>
                          <td>{s.campaign_name || '—'}</td>
                          <td>{fmtTime(s.suppressed_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className={adminStyles.panel}>
                <div className={adminStyles.panelHeader}>
                  <h2 className={adminStyles.panelTitle}>Latest events</h2>
                </div>
                {!recent.length && <p className={adminStyles.muted}>No events yet.</p>}
                <div className={adminStyles.feed}>
                  {recent.map((e, i) => (
                    <div className={adminStyles.feedItem} key={`${e.email}-${e.occurred_at}-${i}`}>
                      <p className={adminStyles.feedTitle}>
                        {e.event_type} — {e.email}
                      </p>
                      <p className={adminStyles.feedDetail}>
                        {e.campaign_name || ''}{e.url ? ` · ${shortUrl(e.url)}` : ''}
                      </p>
                      <p className={adminStyles.feedTime}>{fmtTime(e.occurred_at)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </AdminShell>
    </>
  );
}
