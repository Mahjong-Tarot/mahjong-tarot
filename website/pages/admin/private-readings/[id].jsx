import { useEffect, useMemo, useRef, useState } from 'react';
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

const primaryButtonStyle = {
  display: 'inline-block', padding: '10px 18px', background: '#1a1a1a', color: '#fff',
  border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer',
};

const secondaryButtonStyle = {
  display: 'inline-block', padding: '10px 18px', background: '#fff', color: '#1a1a1a',
  border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer',
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
  const [draft, setDraft]             = useState({
    prep_notes:         '',
    post_call_notes:    '',
    summary_text:       '',
    question:           '',
    transcript_text:    '',
    final_reading_html: '',
  });
  const [activeTab, setActiveTab]         = useState('prep'); // 'prep' | 'notes' | 'reading'
  const [generating, setGenerating]       = useState(false);
  const [generateError, setGenerateError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!router.isReady || !supabase) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const { data: b, error: be } = await supabase
          .from('bookings')
          .select('id, full_name, email, scheduled_at, duration_minutes, status, amount_cents, currency, astrologer_id, question, birthday, birth_time, meeting_source, meeting_external_id, prep_notes, post_call_notes, transcript_text, summary_text, final_reading_html')
          .eq('id', id)
          .maybeSingle();
        if (be) throw be;
        if (!b) throw new Error('Booking not found');
        if (cancelled) return;
        setBooking(b);
        setDraft({
          prep_notes:         b.prep_notes         || '',
          post_call_notes:    b.post_call_notes    || '',
          summary_text:       b.summary_text       || '',
          question:           b.question           || '',
          transcript_text:    b.transcript_text    || '',
          final_reading_html: b.final_reading_html || '',
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

  // Save a value directly (used by the transcript-upload flow, which
  // doesn't go through the draft → blur cycle).
  async function saveValue(field, value) {
    if (!booking) return;
    setSavingField(field);
    const { error: e } = await supabase
      .from('bookings')
      .update({ [field]: value || null })
      .eq('id', booking.id);
    setSavingField('');
    if (e) { setError(e.message); return; }
    setBooking({ ...booking, [field]: value });
    setDraft((d) => ({ ...d, [field]: value }));
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result || '').trim();
      if (!text) {
        setError('File was empty or unreadable.');
        return;
      }
      saveValue('transcript_text', text);
    };
    reader.onerror = () => setError('Could not read the file.');
    reader.readAsText(file);
    // Reset so the same file can be re-picked later.
    e.target.value = '';
  }

  async function handleGenerate() {
    if (!booking) return;
    setGenerating(true);
    setGenerateError('');
    try {
      const r = await fetch('/api/admin/generate-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || 'Failed to generate reading.');
      const html = data.html || '';
      setBooking({ ...booking, final_reading_html: html });
      setDraft((d) => ({ ...d, final_reading_html: html }));
      setActiveTab('reading');
    } catch (err) {
      setGenerateError(err.message || 'Failed to generate reading.');
    } finally {
      setGenerating(false);
    }
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
        {error && <p className="error-block">{error}</p>}

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

            {/* Tabs */}
            <TabBar
              active={activeTab}
              onChange={setActiveTab}
              tabs={[
                { id: 'prep',    label: 'Prep' },
                { id: 'notes',   label: 'Notes and Transcript' },
                { id: 'reading', label: 'Final Reading' },
              ]}
            />

            {activeTab === 'prep' && (
              <>
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
              </>
            )}

            {activeTab === 'notes' && (
              <>
                {/* Upload Transcript */}
                <Section title="Upload transcript">
                  <p className={adminStyles.muted} style={{ fontSize: 13, marginBottom: 10 }}>
                    Plain text, markdown, or VTT. Uploading replaces the saved transcript.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,.vtt,text/plain,text/markdown"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={savingField === 'transcript_text'}
                    style={primaryButtonStyle}
                  >
                    {savingField === 'transcript_text' ? 'Uploading…' : (draft.transcript_text ? 'Replace transcript file' : 'Upload transcript file')}
                  </button>
                  {draft.transcript_text && (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b7280', fontWeight: 500, marginBottom: 4 }}>
                        Current transcript ({draft.transcript_text.length.toLocaleString()} chars)
                      </div>
                      <textarea
                        value={draft.transcript_text}
                        onChange={(e) => setDraft({ ...draft, transcript_text: e.target.value })}
                        onBlur={() => booking.transcript_text !== draft.transcript_text && saveField('transcript_text')}
                        rows={10}
                        style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
                      />
                      {savingField === 'transcript_text' && <span className={adminStyles.muted}>Saving…</span>}
                    </div>
                  )}
                </Section>

                {/* Notes */}
                <Section title="Notes">
                  <textarea
                    value={draft.post_call_notes}
                    onChange={(e) => setDraft({ ...draft, post_call_notes: e.target.value })}
                    onBlur={() => booking.post_call_notes !== draft.post_call_notes && saveField('post_call_notes')}
                    placeholder="What she actually heard / what was decided. Saves on blur."
                    rows={6}
                    style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8, fontFamily: 'inherit', fontSize: 14 }}
                  />
                  {savingField === 'post_call_notes' && <span className={adminStyles.muted}>Saving…</span>}
                </Section>

                {/* Generate */}
                <Section title="Generate the final reading">
                  <p className={adminStyles.muted} style={{ fontSize: 13, marginBottom: 10 }}>
                    Sends the prep brief, transcript, and notes to Claude. The result appears in the Final Reading tab.
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={generating || (!draft.transcript_text && !draft.post_call_notes)}
                    style={primaryButtonStyle}
                  >
                    {generating
                      ? 'Generating… (10–30 sec)'
                      : (booking.final_reading_html ? 'Regenerate reading' : 'Generate final reading')}
                  </button>
                  {generateError && <p className="error-block" style={{ marginTop: 10 }}>{generateError}</p>}
                </Section>
              </>
            )}

            {activeTab === 'reading' && (
              <>
                <Section title="Final reading">
                  {!draft.final_reading_html ? (
                    <p className={adminStyles.muted}>
                      Nothing yet. Go to <strong>Notes and Transcript</strong> and click <strong>Generate final reading</strong>.
                    </p>
                  ) : (
                    <>
                      <div
                        style={{ background: '#fffaf3', border: '1px solid #f0e0c8', borderRadius: 8, padding: 24, lineHeight: 1.65, fontSize: 15 }}
                        dangerouslySetInnerHTML={{ __html: draft.final_reading_html }}
                      />
                      <details style={{ marginTop: 18 }}>
                        <summary style={{ cursor: 'pointer', fontSize: 13, color: '#6b7280' }}>Edit HTML source</summary>
                        <textarea
                          value={draft.final_reading_html}
                          onChange={(e) => setDraft({ ...draft, final_reading_html: e.target.value })}
                          onBlur={() => booking.final_reading_html !== draft.final_reading_html && saveField('final_reading_html')}
                          rows={20}
                          style={{ width: '100%', marginTop: 10, padding: 12, border: '1px solid #d1d5db', borderRadius: 8, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
                        />
                        {savingField === 'final_reading_html' && <span className={adminStyles.muted}>Saving…</span>}
                      </details>
                      <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
                        <button
                          type="button"
                          onClick={() => alert('Email PDF is phase 2 — not wired up yet.')}
                          style={primaryButtonStyle}
                        >
                          Email PDF to guest
                        </button>
                        <button
                          type="button"
                          onClick={handleGenerate}
                          disabled={generating}
                          style={secondaryButtonStyle}
                        >
                          {generating ? 'Regenerating…' : 'Regenerate'}
                        </button>
                      </div>
                    </>
                  )}
                </Section>
              </>
            )}
          </>
        )}
      </AdminShell>
    </>
  );
}

function TabBar({ active, onChange, tabs }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 24, borderBottom: '1px solid #e5e7eb' }}>
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: 'transparent',
              color: isActive ? '#1a1a1a' : '#6b7280',
              fontSize: 14,
              fontWeight: isActive ? 600 : 500,
              cursor: 'pointer',
              borderBottom: isActive ? '2px solid #1a1a1a' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
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
