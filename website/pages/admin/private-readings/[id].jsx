import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AdminShell from '../../../components/AdminShell';
import { supabase } from '../../../lib/supabase';
import { requirePage } from '../../../lib/guards';
import {
  calculatePillars,
  getZodiacAnimal,
  tallyElements,
  dominantElement,
  STEMS,
  BRANCHES,
} from '../../../lib/bazi';
import { computeThreeBlessings } from '../../../lib/three-blessings';
import { calculatePurpleStar } from '../../../lib/purpleStar';
import { buildReadingBrief } from '../../../lib/readingBrief';
import adminStyles from '../../../styles/PortalAdmin.module.css';

export async function getServerSideProps(ctx) {
  return requirePage('staff')(ctx);
}

const DATE_FMT = new Intl.DateTimeFormat(undefined, {
  weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  hour: 'numeric', minute: '2-digit',
});

const STATUS_LABEL = {
  pending_payment: 'Pending payment',
  paid:            'Paid',
  scheduled:       'Scheduled',
  completed:       'Completed',
  cancelled:       'Cancelled',
  refunded:        'Refunded',
};

export default function ReadingBriefPage({ profile }) {
  const router = useRouter();
  const { id } = router.query;

  const [booking, setBooking] = useState(null);
  const [person, setPerson]   = useState(null);
  const [inquiry, setInquiry] = useState(null);
  const [deal, setDeal]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const [savingField, setSavingField] = useState('');
  const [draft, setDraft]             = useState({ prep_notes: '', post_call_notes: '', summary_text: '', question: '' });

  useEffect(() => {
    if (!router.isReady || !supabase) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const { data: b, error: be } = await supabase
          .from('bookings')
          .select('id, full_name, email, scheduled_at, duration_minutes, status, amount_cents, currency, astrologer_id, question, birthday, birth_time, meeting_source, meeting_external_id, prep_notes, post_call_notes, transcript_text, summary_text')
          .eq('id', id)
          .maybeSingle();
        if (be) throw be;
        if (!b) throw new Error('Booking not found');
        if (cancelled) return;
        setBooking(b);
        setDraft({
          prep_notes:      b.prep_notes      || '',
          post_call_notes: b.post_call_notes || '',
          summary_text:    b.summary_text    || '',
          question:        b.question        || '',
        });

        // People: match by email (canonical identity)
        const { data: pp } = await supabase
          .from('people')
          .select('id, name, email, phone, birthday, birth_time, birth_place, lifecycle_stage, gender')
          .ilike('email', b.email)
          .maybeSingle();
        if (cancelled) return;
        setPerson(pp || null);

        // Inquiry (latest) for this person, if any
        if (pp?.id) {
          const { data: iq } = await supabase
            .from('inquiries')
            .select('id, type, status, source, subject, message, created_at')
            .eq('person_id', pp.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (cancelled) return;
          setInquiry(iq || null);
        }

        // Deal for this booking
        const { data: dl } = await supabase
          .from('deals')
          .select('id, amount_cents, currency, source, won_at, notes')
          .eq('booking_id', b.id)
          .maybeSingle();
        if (cancelled) return;
        setDeal(dl || null);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load booking.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [router.isReady, id]);

  // Birthday + birth_time: prefer the person's canonical record; fall
  // back to the booking-specific copy (legacy behaviour).
  const birthday  = person?.birthday  || booking?.birthday  || null;
  const birthTime = person?.birth_time || booking?.birth_time || null;

  const pillars = useMemo(() => birthday ? calculatePillars(birthday, birthTime) : null, [birthday, birthTime]);
  const zodiac  = useMemo(() => birthday ? getZodiacAnimal(birthday) : null, [birthday]);
  const tally   = useMemo(() => tallyElements(pillars), [pillars]);
  const dominant = useMemo(() => dominantElement(tally), [tally]);
  const threeBlessings = useMemo(() => {
    if (!pillars) return null;
    try { return computeThreeBlessings({ birthday, birthTime, pillars }); }
    catch { return null; }
  }, [pillars, birthday, birthTime]);

  const purpleStar = useMemo(() => {
    if (!birthday || !birthTime || !person?.gender) return null;
    try { return calculatePurpleStar({ birthday, birthTime, gender: person.gender }); }
    catch { return null; }
  }, [birthday, birthTime, person?.gender]);

  const briefMarkdown = useMemo(() => {
    if (!booking) return '';
    return buildReadingBrief({
      person, booking, inquiry, pillars, zodiac, dominant,
    });
  }, [person, booking, inquiry, pillars, zodiac, dominant]);

  async function saveField(field) {
    if (!booking) return;
    setSavingField(field);
    const { error: e } = await supabase
      .from('bookings')
      .update({ [field]: draft[field] || null })
      .eq('id', booking.id);
    setSavingField('');
    if (e) { setError(e.message); return; }
    setBooking({ ...booking, [field]: draft[field] });
  }

  return (
    <>
      <Head>
        <title>Private Reading | Mahjong Tarot Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminShell profile={profile}>
        <Link href="/admin/private-readings" className={adminStyles.muted} style={{ display: 'inline-block', marginBottom: 16 }}>
          ← Back to readings
        </Link>

        {loading && <p className={adminStyles.muted}>Loading…</p>}
        {error && <p className={adminStyles.error}>{error}</p>}

        {!loading && booking && (
          <>
            {/* Header */}
            <p className={adminStyles.pageEyebrow}>Private Reading</p>
            <h1 className={adminStyles.pageTitle}>{booking.full_name || person?.name || 'Unnamed'}</h1>
            <p className={adminStyles.pageLede}>
              {booking.scheduled_at ? DATE_FMT.format(new Date(booking.scheduled_at)) : 'unscheduled'} ·{' '}
              {booking.duration_minutes ? `${booking.duration_minutes} min` : ''} ·{' '}
              <strong>{STATUS_LABEL[booking.status] || booking.status}</strong>
              {deal && <> · ${(deal.amount_cents / 100).toFixed(2)} {(deal.currency || 'usd').toUpperCase()}</>}
            </p>

            {/* Contact */}
            <Section title="Contact">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <Detail label="Email">{person?.email || booking?.email || <Missing />}</Detail>
                <Detail label="Phone">{person?.phone || booking?.phone || <Missing />}</Detail>
              </div>
              {person?.id && (
                <p className={adminStyles.muted} style={{ fontSize: 12, marginTop: 10 }}>
                  Edit these in the <Link href={`/admin/people?focus=${person.id}`} style={{ textDecoration: 'underline', color: 'inherit' }}>People shelf</Link>.
                </p>
              )}
            </Section>

            {/* What she's bringing */}
            <Section title="What she's bringing">
              {inquiry?.message && (
                <Detail label={`First contact (inquiry, ${inquiry.status})`}>
                  <em>“{inquiry.message}”</em>
                </Detail>
              )}
              <EditableField
                label="Reading question"
                placeholder="What is she here to learn about? Add it here if she didn't say at booking."
                value={draft.question}
                onChange={(v) => setDraft({ ...draft, question: v })}
                onBlur={() => booking.question !== draft.question && saveField('question')}
                saving={savingField === 'question'}
              />
            </Section>

            {/* Birth data */}
            <Section title="Birth data">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <Detail label="Birthday">{birthday || <Missing />}</Detail>
                <Detail label="Birth time">{birthTime || <Missing label="missing — Hour Pillar unavailable" />}</Detail>
                <Detail label="Birth place">{person?.birth_place || <Missing label="missing" />}</Detail>
              </div>
            </Section>

            {/* Four Pillars */}
            {pillars && (
              <Section title="Four Pillars (computed live)">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#6b7280', fontSize: 12 }}>
                      <th style={{ padding: 8 }}>Pillar</th>
                      <th style={{ padding: 8 }}>Stem</th>
                      <th style={{ padding: 8 }}>Branch</th>
                      <th style={{ padding: 8 }}>Element</th>
                      <th style={{ padding: 8 }}>Animal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[['Year', pillars.year], ['Month', pillars.month], ['Day', pillars.day], ['Hour', pillars.hour]].map(([label, p]) => (
                      <tr key={label} style={{ borderTop: '1px solid #e5e7eb' }}>
                        <td style={{ padding: 8, fontWeight: label === 'Day' ? 600 : 400 }}>{label}</td>
                        <td style={{ padding: 8 }}>{p ? `${p.stem.en} ${p.gan} (${p.stem.element} · ${p.stem.polarity})` : '—'}</td>
                        <td style={{ padding: 8 }}>{p ? `${p.branch.en} ${p.zhi} (${p.branch.element})` : '—'}</td>
                        <td style={{ padding: 8 }}>{p ? p.stem.element : '—'}</td>
                        <td style={{ padding: 8 }}>{p?.branch?.animal || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className={adminStyles.muted} style={{ marginTop: 10 }}>
                  <strong>Day Master:</strong> {pillars.day?.stem?.element} {pillars.day?.stem?.polarity} ·{' '}
                  <strong>Zodiac:</strong> {zodiac || '—'} ·{' '}
                  <strong>Dominant element:</strong> {dominant || '—'}
                </p>
              </Section>
            )}

            {/* Brief — start here (rule-based synthesis from the chart) */}
            {briefMarkdown && (
              <Section title="Brief — start here">
                <div style={{ background: '#fffaf3', border: '1px solid #f0e0c8', borderRadius: 8, padding: 16, lineHeight: 1.6, fontSize: 14 }}>
                  {briefMarkdown.split('\n\n').map((para, i) => (
                    <p key={i} style={{ margin: i === 0 ? 0 : '10px 0 0' }} dangerouslySetInnerHTML={{
                      __html: para.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                                   .replace(/_([^_]+)_/g, '<em>$1</em>')
                                   .replace(/\n/g, '<br/>')
                    }} />
                  ))}
                </div>
              </Section>
            )}

            {/* Purple Star */}
            {purpleStar ? (
              <Section title="Purple Star (Zi Wei Dou Shu)">
                <p className={adminStyles.muted} style={{ marginBottom: 10 }}>
                  <strong>Life Palace:</strong> {purpleStar.lifePalace?.branchHan || '—'} ({purpleStar.lifePalace?.animal || '—'}) ·{' '}
                  <strong>Body Palace:</strong> {purpleStar.bodyPalace?.branchHan || '—'}
                </p>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#6b7280', fontSize: 12 }}>
                      <th style={{ padding: 6 }}>Palace</th>
                      <th style={{ padding: 6 }}>Branch</th>
                      <th style={{ padding: 6 }}>Major stars</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(purpleStar.palaces || []).slice(0, 12).map((pl, i) => (
                      <tr key={i} style={{ borderTop: '1px solid #e5e7eb' }}>
                        <td style={{ padding: 6, fontWeight: pl.isMing ? 600 : 400 }}>
                          {pl.name}{pl.isMing && ' ★'}
                        </td>
                        <td style={{ padding: 6 }}>{pl.branchHan} ({pl.animal})</td>
                        <td style={{ padding: 6 }}>{(pl.majorStars || []).map((s) => s.name).join(', ') || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Section>
            ) : (
              <Section title="Purple Star (Zi Wei Dou Shu)">
                <p className={adminStyles.muted}>
                  Requires <strong>birth time</strong> and <strong>gender</strong> on the customer's people record. Add them via the People shelf and refresh.
                </p>
              </Section>
            )}

            {/* Three Blessings */}
            {threeBlessings && (
              <Section title="Three Blessings">
                <ul style={{ paddingLeft: 18, lineHeight: 1.7 }}>
                  {['phuc', 'loc', 'tho'].map((key) => {
                    const b = threeBlessings[key];
                    if (!b?.personalLine) return null;
                    return (
                      <li key={key} style={{ marginBottom: 8 }}>
                        <strong>{b.position?.name} — {b.position?.label}:</strong> {b.personalLine}
                      </li>
                    );
                  })}
                </ul>
              </Section>
            )}

            {/* Prep notes */}
            <Section title="Prep notes">
              <textarea
                value={draft.prep_notes}
                onChange={(e) => setDraft({ ...draft, prep_notes: e.target.value })}
                onBlur={() => booking.prep_notes !== draft.prep_notes && saveField('prep_notes')}
                placeholder="What you've gathered before the call. Saves on blur."
                rows={5}
                style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8, fontFamily: 'inherit', fontSize: 14 }}
              />
              {savingField === 'prep_notes' && <span className={adminStyles.muted}>Saving…</span>}
            </Section>

            {/* Post-call notes */}
            <Section title="Post-call notes">
              <textarea
                value={draft.post_call_notes}
                onChange={(e) => setDraft({ ...draft, post_call_notes: e.target.value })}
                onBlur={() => booking.post_call_notes !== draft.post_call_notes && saveField('post_call_notes')}
                placeholder="What she actually heard / what was decided."
                rows={5}
                style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8, fontFamily: 'inherit', fontSize: 14 }}
              />
              {savingField === 'post_call_notes' && <span className={adminStyles.muted}>Saving…</span>}
            </Section>

            {/* Summary */}
            <Section title="Summary (sent to her)">
              <textarea
                value={draft.summary_text}
                onChange={(e) => setDraft({ ...draft, summary_text: e.target.value })}
                onBlur={() => booking.summary_text !== draft.summary_text && saveField('summary_text')}
                placeholder="The follow-up summary you'll email her."
                rows={6}
                style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8, fontFamily: 'inherit', fontSize: 14 }}
              />
              {savingField === 'summary_text' && <span className={adminStyles.muted}>Saving…</span>}
            </Section>
          </>
        )}
      </AdminShell>
    </>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid #e5e7eb' }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 14 }}>{title}</h2>
      {children}
    </section>
  );
}

function Detail({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b7280', fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

function Missing({ label = 'missing' }) {
  return <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>⚠ {label}</span>;
}

function EditableField({ label, value, onChange, onBlur, placeholder, saving }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b7280', fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, fontFamily: 'inherit' }}
      />
      {saving && <span style={{ fontSize: 11, color: '#6b7280', marginLeft: 4 }}>Saving…</span>}
    </div>
  );
}
