import { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
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

const detailLabelStyle = {
  fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em',
  color: '#6b7280', fontWeight: 500, marginBottom: 4,
};

const inlineInputStyle = {
  width: '100%', padding: '8px 10px', border: '1px solid #d1d5db',
  borderRadius: 6, fontSize: 14, fontFamily: 'inherit',
};

// HTML <input type="time"> wants HH:MM; Postgres time comes back HH:MM:SS.
const hhmm = (v) => (v || '').slice(0, 5);

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
    birthday:           '',
    birth_time:         '',
    partner_name:       '',
    partner_birthday:   '',
    partner_birth_time: '',
    partner_gender:     '',
  });
  const [activeTab, setActiveTab]         = useState('prep'); // 'prep' | 'notes' | 'reading'
  const [generating, setGenerating]       = useState(false);
  const [generationStep, setGenerationStep] = useState(0); // 0 idle, 1–3 active
  const [generateError, setGenerateError] = useState('');
  const [sending, setSending]             = useState(false);
  const [sendError, setSendError]         = useState('');
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
          .select('id, full_name, email, scheduled_at, duration_minutes, status, amount_cents, currency, astrologer_id, question, birthday, birth_time, meeting_source, meeting_external_id, prep_notes, post_call_notes, transcript_text, summary_text, final_reading_html, public_token, final_reading_sent_at, is_relationship, partner_name, partner_birthday, partner_birth_time, partner_gender')
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
          birthday:           b.birthday           || '',
          birth_time:         b.birth_time         || '',
          partner_name:       b.partner_name       || '',
          partner_birthday:   b.partner_birthday   || '',
          partner_birth_time: b.partner_birth_time || '',
          partner_gender:     b.partner_gender     || '',
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

  // Birthday + birth_time: prefer the value entered on the booking
  // (the prep tab is authoritative — it lets the astrologer fill in a
  // missing birthday and have it take), then the person's canonical
  // record.
  const birthday  = booking?.birthday  || person?.birthday  || null;
  const birthTime = booking?.birth_time || person?.birth_time || null;

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

  // Second person (relationship reading). Charts compute off the
  // booking's saved partner_* fields, mirroring the guest's charts.
  const partnerBirthday  = booking?.partner_birthday  || null;
  const partnerBirthTime = booking?.partner_birth_time || null;
  const partnerGender    = booking?.partner_gender || null;
  const partnerPillars  = useMemo(() => (partnerBirthday ? calculatePillars(partnerBirthday, partnerBirthTime) : null), [partnerBirthday, partnerBirthTime]);
  const partnerZodiac   = useMemo(() => (partnerBirthday ? getZodiacAnimal(partnerBirthday) : null), [partnerBirthday]);
  const partnerTally    = useMemo(() => tallyElements(partnerPillars), [partnerPillars]);
  const partnerDominant = useMemo(() => dominantElement(partnerTally), [partnerTally]);
  const partnerPurpleStar = useMemo(() => {
    if (!partnerBirthday || !partnerBirthTime || !partnerGender) return null;
    try { return calculatePurpleStar({ birthday: partnerBirthday, birthTime: partnerBirthTime, gender: partnerGender }); }
    catch { return null; }
  }, [partnerBirthday, partnerBirthTime, partnerGender]);

  const briefMarkdown = useMemo(() => {
    if (!booking) return '';
    return buildReadingBrief({
      person, booking, inquiry, pillars, zodiac, dominant,
      partnerPillars, partnerZodiac, partnerDominant,
    });
  }, [person, booking, inquiry, pillars, zodiac, dominant, partnerPillars, partnerZodiac, partnerDominant]);

  const guestFirstName = useMemo(() => {
    const full = person?.name || booking?.full_name || '';
    return (full.trim().split(/\s+/)[0]) || 'their';
  }, [person?.name, booking?.full_name]);

  // Rich-text editor for the final reading. Always-on (the toolbar is
  // the affordance that "this is editable"). Saves on blur.
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        code: false,
        horizontalRule: false,
      }),
    ],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: { class: 'reading-editor' },
    },
  });

  // Sync editor content when draft changes externally (initial load, regen).
  // We compare against the editor's own HTML to avoid clobbering in-flight edits.
  useEffect(() => {
    if (!editor) return;
    const target = draft.final_reading_html || '';
    if (!target) return;
    if (editor.getHTML() !== target) {
      editor.commands.setContent(target, { emitUpdate: false });
    }
  }, [editor, draft.final_reading_html]);

  // Save on editor blur (matches the textarea-blur-save pattern used elsewhere on this page).
  useEffect(() => {
    if (!editor || !booking) return;
    const handler = () => {
      const html = editor.getHTML();
      if (booking.final_reading_html !== html) {
        saveValue('final_reading_html', html);
      }
    };
    editor.on('blur', handler);
    return () => { editor.off('blur', handler); };
  }, [editor, booking?.final_reading_html]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Save a raw value with no falsy→null coercion — for the
  // is_relationship boolean and the partner gender select, where
  // `false` / cleared must round-trip exactly.
  async function saveRaw(field, value) {
    if (!booking) return;
    setSavingField(field);
    const { error: e } = await supabase
      .from('bookings')
      .update({ [field]: value })
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

  async function handleSendEmail() {
    if (!booking) return;
    setSending(true);
    setSendError('');
    try {
      const r = await fetch('/api/admin/email-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || 'Failed to send email.');
      setBooking({
        ...booking,
        public_token:          data.publicToken || booking.public_token,
        final_reading_sent_at: data.sentAt || new Date().toISOString(),
      });
    } catch (err) {
      setSendError(err.message || 'Failed to send email.');
    } finally {
      setSending(false);
    }
  }

  async function handleGenerate() {
    if (!booking) return;
    setActiveTab('reading');          // jump straight to the progress view
    setGenerating(true);
    setGenerateError('');
    setGenerationStep(1);
    const stepTimer = setInterval(() => {
      setGenerationStep((s) => (s < 3 ? s + 1 : s));
    }, 10000);
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
    } catch (err) {
      setGenerateError(err.message || 'Failed to generate reading.');
    } finally {
      clearInterval(stepTimer);
      setGenerating(false);
      setGenerationStep(0);
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

                {/* Birth data — editable; saves to this booking */}
                <Section title="Birth data">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    <div>
                      <div style={detailLabelStyle}>Birthday</div>
                      <input
                        type="date"
                        value={draft.birthday}
                        onChange={(e) => setDraft({ ...draft, birthday: e.target.value })}
                        onBlur={() => (booking.birthday || '') !== draft.birthday && saveField('birthday')}
                        style={inlineInputStyle}
                      />
                    </div>
                    <div>
                      <div style={detailLabelStyle}>Birth time</div>
                      <input
                        type="time"
                        value={hhmm(draft.birth_time)}
                        onChange={(e) => setDraft({ ...draft, birth_time: e.target.value })}
                        onBlur={() => hhmm(booking.birth_time) !== hhmm(draft.birth_time) && saveField('birth_time')}
                        style={inlineInputStyle}
                      />
                      {!draft.birth_time && (
                        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4, fontStyle: 'italic' }}>
                          missing — Hour Pillar unavailable
                        </div>
                      )}
                    </div>
                    <Detail label="Birth place">{person?.birth_place || <Missing label="missing" />}</Detail>
                  </div>
                  {(savingField === 'birthday' || savingField === 'birth_time') && (
                    <span className={adminStyles.muted}>Saving…</span>
                  )}
                  <p className={adminStyles.muted} style={{ fontSize: 12, marginTop: 10 }}>
                    Editing here saves to this reading — the charts below update on save.
                  </p>
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

                {/* Relationship / second person */}
                <Section title="Relationship / second person">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: booking.is_relationship ? 18 : 0 }}>
                    <input
                      type="checkbox"
                      checked={!!booking.is_relationship}
                      onChange={(e) => saveRaw('is_relationship', e.target.checked)}
                      style={{ width: 16, height: 16 }}
                    />
                    <span style={{ fontSize: 14 }}>This reading is about a relationship with another person</span>
                  </label>

                  {booking.is_relationship && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                        <div>
                          <div style={detailLabelStyle}>Their name</div>
                          <input
                            type="text"
                            value={draft.partner_name}
                            onChange={(e) => setDraft({ ...draft, partner_name: e.target.value })}
                            onBlur={() => (booking.partner_name || '') !== draft.partner_name && saveField('partner_name')}
                            placeholder="The other person"
                            style={inlineInputStyle}
                          />
                        </div>
                        <div>
                          <div style={detailLabelStyle}>Their gender</div>
                          <select
                            value={draft.partner_gender || ''}
                            onChange={(e) => saveRaw('partner_gender', e.target.value || null)}
                            style={inlineInputStyle}
                          >
                            <option value="">—</option>
                            <option value="F">Female</option>
                            <option value="M">Male</option>
                          </select>
                        </div>
                        <div>
                          <div style={detailLabelStyle}>Their birthday</div>
                          <input
                            type="date"
                            value={draft.partner_birthday}
                            onChange={(e) => setDraft({ ...draft, partner_birthday: e.target.value })}
                            onBlur={() => (booking.partner_birthday || '') !== draft.partner_birthday && saveField('partner_birthday')}
                            style={inlineInputStyle}
                          />
                        </div>
                        <div>
                          <div style={detailLabelStyle}>Their birth time</div>
                          <input
                            type="time"
                            value={hhmm(draft.partner_birth_time)}
                            onChange={(e) => setDraft({ ...draft, partner_birth_time: e.target.value })}
                            onBlur={() => hhmm(booking.partner_birth_time) !== hhmm(draft.partner_birth_time) && saveField('partner_birth_time')}
                            style={inlineInputStyle}
                          />
                        </div>
                      </div>
                      {savingField.startsWith('partner_') && <span className={adminStyles.muted}>Saving…</span>}

                      {partnerPillars ? (
                        <div style={{ marginTop: 18 }}>
                          <p className={adminStyles.muted} style={{ marginBottom: 10 }}>
                            <strong>{draft.partner_name || 'Second person'}:</strong>{' '}
                            Day Master {partnerPillars.day?.stem?.element} {partnerPillars.day?.stem?.polarity} ·{' '}
                            Zodiac {partnerZodiac || '—'} ·{' '}
                            Dominant {partnerDominant || '—'}
                          </p>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead>
                              <tr style={{ textAlign: 'left', color: '#6b7280', fontSize: 12 }}>
                                <th style={{ padding: 8 }}>Pillar</th>
                                <th style={{ padding: 8 }}>Stem</th>
                                <th style={{ padding: 8 }}>Branch</th>
                                <th style={{ padding: 8 }}>Animal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[['Year', partnerPillars.year], ['Month', partnerPillars.month], ['Day', partnerPillars.day], ['Hour', partnerPillars.hour]].map(([label, p]) => (
                                <tr key={label} style={{ borderTop: '1px solid #e5e7eb' }}>
                                  <td style={{ padding: 8, fontWeight: label === 'Day' ? 600 : 400 }}>{label}</td>
                                  <td style={{ padding: 8 }}>{p ? `${p.stem.en} ${p.gan} (${p.stem.element} · ${p.stem.polarity})` : '—'}</td>
                                  <td style={{ padding: 8 }}>{p ? `${p.branch.en} ${p.zhi} (${p.branch.element})` : '—'}</td>
                                  <td style={{ padding: 8 }}>{p?.branch?.animal || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {partnerPurpleStar && (
                            <p className={adminStyles.muted} style={{ marginTop: 10 }}>
                              <strong>Purple Star — Life Palace:</strong>{' '}
                              {partnerPurpleStar.lifePalace?.branchHan || '—'} ({partnerPurpleStar.lifePalace?.animal || '—'})
                            </p>
                          )}
                          {pillars && (
                            <div style={{ marginTop: 14, padding: 14, background: '#fffaf3', border: '1px solid #f0e0c8', borderRadius: 8, fontSize: 14, lineHeight: 1.6 }}>
                              <strong>Compatibility at a glance</strong>
                              <div style={{ marginTop: 6 }}>
                                {guestFirstName}: {pillars.day?.stem?.element} {pillars.day?.stem?.polarity} day master · {zodiac || '—'}
                                <br />
                                {draft.partner_name || 'Second person'}: {partnerPillars.day?.stem?.element} {partnerPillars.day?.stem?.polarity} day master · {partnerZodiac || '—'}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className={adminStyles.muted} style={{ marginTop: 14, fontSize: 13 }}>
                          Add their birthday to compute their chart.
                        </p>
                      )}
                    </>
                  )}
                </Section>

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
                </Section>
              </>
            )}

            {activeTab === 'reading' && (
              <>
                <Section title="Final reading">
                  {generating ? (
                    <GenerationProgress step={generationStep} guestFirstName={guestFirstName} />
                  ) : generateError ? (
                    <>
                      <p className="error-block" style={{ marginBottom: 14 }}>{generateError}</p>
                      <button type="button" onClick={handleGenerate} style={primaryButtonStyle}>
                        Try again
                      </button>
                    </>
                  ) : !draft.final_reading_html ? (
                    <p className={adminStyles.muted}>
                      Nothing yet. Go to <strong>Notes and Transcript</strong> and click <strong>Generate final reading</strong>.
                    </p>
                  ) : (
                    <>
                      <div style={{ border: '1px solid #f0e0c8', borderRadius: 8, overflow: 'hidden', background: '#fffaf3' }}>
                        <EditorToolbar editor={editor} />
                        <div style={{ padding: '20px 24px' }}>
                          <EditorContent editor={editor} />
                        </div>
                      </div>
                      <style jsx global>{`
                        .reading-editor { outline: none; line-height: 1.65; font-size: 15px; color: #1a1a1a; min-height: 200px; }
                        .reading-editor h2 { font-family: Georgia, 'Times New Roman', serif; font-size: 22px; margin: 18px 0 10px; font-weight: 600; color: #1a1a1a; }
                        .reading-editor h2:first-child { margin-top: 0; }
                        .reading-editor h3 { font-family: Georgia, 'Times New Roman', serif; font-size: 17px; margin: 16px 0 8px; font-weight: 600; color: #1a1a1a; }
                        .reading-editor p { margin: 0 0 12px; }
                        .reading-editor ul, .reading-editor ol { padding-left: 22px; margin: 0 0 14px; }
                        .reading-editor li { margin: 4px 0; }
                        .reading-editor li p { margin: 0; }
                        .reading-editor blockquote { border-left: 3px solid #d1c3a5; padding: 2px 0 2px 14px; margin: 12px 0; color: #6b6258; font-style: italic; }
                        .reading-editor strong { font-weight: 600; }
                        .reading-editor em { font-style: italic; }
                      `}</style>
                      {savingField === 'final_reading_html' && (
                        <span className={adminStyles.muted} style={{ display: 'inline-block', marginTop: 8 }}>Saving…</span>
                      )}
                      <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={handleSendEmail}
                          disabled={sending || !booking?.email}
                          style={primaryButtonStyle}
                          title={!booking?.email ? 'No guest email on file' : undefined}
                        >
                          {sending
                            ? 'Sending…'
                            : (booking?.final_reading_sent_at ? 'Email link again' : 'Email link to guest')}
                        </button>
                        <button
                          type="button"
                          onClick={handleGenerate}
                          disabled={generating}
                          style={secondaryButtonStyle}
                        >
                          Regenerate
                        </button>
                      </div>
                      <SendStatus
                        sending={sending}
                        sentAt={booking?.final_reading_sent_at}
                        sentTo={booking?.email}
                        publicToken={booking?.public_token}
                        error={sendError}
                      />
                      {!booking?.email && (
                        <p className={adminStyles.muted} style={{ marginTop: 8, fontSize: 12 }}>
                          No guest email on file — add one to the booking first.
                        </p>
                      )}
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

function GenerationProgress({ step, guestFirstName }) {
  const steps = [
    { id: 1, label: 'Analysing the transcript' },
    { id: 2, label: `Checking ${guestFirstName}'s charts` },
    { id: 3, label: 'Preparing the report' },
  ];
  return (
    <div style={{ padding: '32px 24px', background: '#fffaf3', border: '1px solid #f0e0c8', borderRadius: 8 }}>
      <p style={{ margin: '0 0 24px', color: '#6b7280', fontSize: 13 }}>
        Sit tight — this usually takes 20–30 seconds.
      </p>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {steps.map((s) => {
          const isDone   = step > s.id;
          const isActive = step === s.id;
          return (
            <li key={s.id} style={{
              display:      'flex',
              alignItems:   'center',
              gap:          14,
              padding:      '12px 0',
              fontSize:     15,
              color:        isDone || isActive ? '#1a1a1a' : '#9ca3af',
              opacity:      isDone || isActive ? 1 : 0.6,
              transition:   'opacity 0.4s ease, color 0.4s ease',
            }}>
              <span style={{ width: 22, display: 'inline-flex', justifyContent: 'center' }}>
                {isDone ? (
                  <span style={{ color: '#2a8a48', fontSize: 18, fontWeight: 600 }}>✓</span>
                ) : isActive ? (
                  <span className="rprog-spinner" aria-hidden="true" />
                ) : (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d1d5db', display: 'inline-block' }} />
                )}
              </span>
              <span style={{ fontWeight: isActive ? 600 : 500 }}>{s.label}</span>
            </li>
          );
        })}
      </ol>

      <style jsx>{`
        .rprog-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #e7d8c0;
          border-top-color: #1a1a1a;
          border-radius: 50%;
          display: inline-block;
          animation: rprog-spin 0.8s linear infinite;
        }
        @keyframes rprog-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function SendStatus({ sending, sentAt, sentTo, publicToken, error }) {
  if (sending) {
    return <p style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>Sending email…</p>;
  }
  if (error) {
    return <p className="error-block" style={{ marginTop: 12 }}>{error}</p>;
  }
  if (!sentAt) return null;
  const when = new Date(sentAt).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
  const link = publicToken
    ? (typeof window !== 'undefined' ? `${window.location.origin}/reading/${publicToken}` : `/reading/${publicToken}`)
    : null;
  return (
    <div style={{ marginTop: 12, padding: '10px 14px', background: '#f0f9f3', border: '1px solid #c8e6c9', borderRadius: 6, fontSize: 13, color: '#1a3a22' }}>
      <span style={{ marginRight: 8 }}>✓ Sent to <strong>{sentTo}</strong> on {when}.</span>
      {link && (
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(link)}
          style={{
            background: 'transparent',
            border:     'none',
            color:      '#1a3a22',
            textDecoration: 'underline',
            cursor:     'pointer',
            fontSize:   13,
            padding:    0,
          }}
        >
          Copy link
        </button>
      )}
    </div>
  );
}

function EditorToolbar({ editor }) {
  if (!editor) return null;
  const btn = (action, isActive, title, label, disabled) => (
    <button
      key={title}
      type="button"
      onClick={action}
      disabled={disabled}
      title={title}
      aria-pressed={!!isActive}
      style={{
        padding:      '4px 10px',
        minWidth:     30,
        height:       28,
        fontSize:     13,
        fontWeight:   500,
        border:       '1px solid ' + (isActive ? '#1a1a1a' : '#d1d5db'),
        background:   isActive ? '#1a1a1a' : '#fff',
        color:        isActive ? '#fff' : '#1a1a1a',
        borderRadius: 4,
        cursor:       disabled ? 'not-allowed' : 'pointer',
        opacity:      disabled ? 0.4 : 1,
      }}
    >
      {label}
    </button>
  );
  const divider = (key) => (
    <span key={key} style={{ width: 1, background: '#e5e7eb', margin: '0 4px', alignSelf: 'stretch' }} />
  );

  return (
    <div style={{
      display:       'flex',
      gap:           4,
      padding:       '8px 12px',
      borderBottom:  '1px solid #f0e0c8',
      background:    '#fffaf3',
      flexWrap:      'wrap',
      alignItems:    'center',
    }}>
      {btn(() => editor.chain().focus().toggleBold().run(),                editor.isActive('bold'),                  'Bold (⌘B)',          <strong>B</strong>)}
      {btn(() => editor.chain().focus().toggleItalic().run(),              editor.isActive('italic'),                'Italic (⌘I)',        <em>I</em>)}
      {divider('d1')}
      {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }), 'Heading 2',          'H2')}
      {btn(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }), 'Heading 3',          'H3')}
      {btn(() => editor.chain().focus().setParagraph().run(),              editor.isActive('paragraph'),             'Paragraph',          'P')}
      {divider('d2')}
      {btn(() => editor.chain().focus().toggleBulletList().run(),          editor.isActive('bulletList'),            'Bullet list',        '•')}
      {btn(() => editor.chain().focus().toggleOrderedList().run(),         editor.isActive('orderedList'),           'Numbered list',      '1.')}
      {btn(() => editor.chain().focus().toggleBlockquote().run(),          editor.isActive('blockquote'),            'Quote',              '“')}
      {divider('d3')}
      {btn(() => editor.chain().focus().undo().run(),                      false,                                    'Undo (⌘Z)',          '↶', !editor.can().undo())}
      {btn(() => editor.chain().focus().redo().run(),                      false,                                    'Redo (⇧⌘Z)',         '↷', !editor.can().redo())}
    </div>
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
