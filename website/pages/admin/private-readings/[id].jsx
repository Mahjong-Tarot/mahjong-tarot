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
import { computeThreeBlessings } from '../../../lib/tb/engine.mjs';
import { tables as tbTables } from '../../../lib/tb/data.mjs';
import { buildFourPillarsChart } from '../../../lib/fp/chart.mjs';
import { calculatePurpleStar } from '../../../lib/purpleStar';
import { buildReadingBrief } from '../../../lib/readingBrief';
import adminStyles from '../../../styles/PortalAdmin.module.css';
import styles from '../../../styles/PortalPrivateReadings.module.css';

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
    if (!birthday) return null;
    try {
      return computeThreeBlessings(
        buildFourPillarsChart({ birthday, birthTime: birthTime || null }),
        tbTables,
        birthday,
      );
    }
    catch { return null; }
  }, [birthday, birthTime]);

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
        <Link href="/admin/private-readings" className={`${adminStyles.muted} ${styles.backLink}`}>
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
                  <div className={adminStyles.grid2}>
                    <Detail label="Email">{person?.email || booking?.email || <Missing />}</Detail>
                    <Detail label="Phone">{person?.phone || booking?.phone || <Missing />}</Detail>
                  </div>
                  {person?.id && (
                    <p className={`${adminStyles.muted} ${styles.note}`}>
                      Edit these in the <Link href={`/admin/people?focus=${person.id}`} className={styles.inlineLink}>People shelf</Link>.
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
                  <div className={adminStyles.grid3}>
                    <div>
                      <div className={styles.fieldLabel}>Birthday</div>
                      <input
                        type="date"
                        value={draft.birthday}
                        onChange={(e) => setDraft({ ...draft, birthday: e.target.value })}
                        onBlur={() => (booking.birthday || '') !== draft.birthday && saveField('birthday')}
                        className={styles.inputCompact}
                      />
                    </div>
                    <div>
                      <div className={styles.fieldLabel}>Birth time</div>
                      <input
                        type="time"
                        value={hhmm(draft.birth_time)}
                        onChange={(e) => setDraft({ ...draft, birth_time: e.target.value })}
                        onBlur={() => hhmm(booking.birth_time) !== hhmm(draft.birth_time) && saveField('birth_time')}
                        className={styles.inputCompact}
                      />
                      {!draft.birth_time && (
                        <div className={styles.missingNote}>
                          missing — Hour Pillar unavailable
                        </div>
                      )}
                    </div>
                    <Detail label="Birth place">{person?.birth_place || <Missing label="missing" />}</Detail>
                  </div>
                  {(savingField === 'birthday' || savingField === 'birth_time') && (
                    <span className={adminStyles.muted}>Saving…</span>
                  )}
                  <p className={`${adminStyles.muted} ${styles.note}`}>
                    Editing here saves to this reading — the charts below update on save.
                  </p>
                </Section>

                {/* Relationship / second person */}
                <Section title="Relationship / second person">
                  <label className={`${styles.checkRow} ${booking.is_relationship ? styles.checkRowOpen : ''}`}>
                    <input
                      type="checkbox"
                      checked={!!booking.is_relationship}
                      onChange={(e) => saveRaw('is_relationship', e.target.checked)}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkLabel}>This reading is about a relationship with another person</span>
                  </label>

                  {booking.is_relationship && (
                    <>
                      <div className={adminStyles.grid2}>
                        <div>
                          <div className={styles.fieldLabel}>Their name</div>
                          <input
                            type="text"
                            value={draft.partner_name}
                            onChange={(e) => setDraft({ ...draft, partner_name: e.target.value })}
                            onBlur={() => (booking.partner_name || '') !== draft.partner_name && saveField('partner_name')}
                            placeholder="The other person"
                            className={styles.inputCompact}
                          />
                        </div>
                        <div>
                          <div className={styles.fieldLabel}>Their gender</div>
                          <select
                            value={draft.partner_gender || ''}
                            onChange={(e) => saveRaw('partner_gender', e.target.value || null)}
                            className={styles.inputCompact}
                          >
                            <option value="">—</option>
                            <option value="F">Female</option>
                            <option value="M">Male</option>
                          </select>
                        </div>
                        <div>
                          <div className={styles.fieldLabel}>Their birthday</div>
                          <input
                            type="date"
                            value={draft.partner_birthday}
                            onChange={(e) => setDraft({ ...draft, partner_birthday: e.target.value })}
                            onBlur={() => (booking.partner_birthday || '') !== draft.partner_birthday && saveField('partner_birthday')}
                            className={styles.inputCompact}
                          />
                        </div>
                        <div>
                          <div className={styles.fieldLabel}>Their birth time</div>
                          <input
                            type="time"
                            value={hhmm(draft.partner_birth_time)}
                            onChange={(e) => setDraft({ ...draft, partner_birth_time: e.target.value })}
                            onBlur={() => hhmm(booking.partner_birth_time) !== hhmm(draft.partner_birth_time) && saveField('partner_birth_time')}
                            className={styles.inputCompact}
                          />
                        </div>
                      </div>
                      {savingField.startsWith('partner_') && <span className={adminStyles.muted}>Saving…</span>}

                      {partnerPillars ? (
                        <div className={styles.spaced18}>
                          <p className={`${adminStyles.muted} ${styles.spacedBelow10}`}>
                            <strong>{draft.partner_name || 'Second person'}:</strong>{' '}
                            Day Master {partnerPillars.day?.stem?.element} {partnerPillars.day?.stem?.polarity} ·{' '}
                            Zodiac {partnerZodiac || '—'} ·{' '}
                            Dominant {partnerDominant || '—'}
                          </p>
                          <table className={styles.table}>
                            <thead>
                              <tr>
                                <th>Pillar</th>
                                <th>Stem</th>
                                <th>Branch</th>
                                <th>Animal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[['Year', partnerPillars.year], ['Month', partnerPillars.month], ['Day', partnerPillars.day], ['Hour', partnerPillars.hour]].map(([label, p]) => (
                                <tr key={label}>
                                  <td className={label === 'Day' ? styles.cellStrong : undefined}>{label}</td>
                                  <td>{p ? `${p.stem.en} ${p.gan} (${p.stem.element} · ${p.stem.polarity})` : '—'}</td>
                                  <td>{p ? `${p.branch.en} ${p.zhi} (${p.branch.element})` : '—'}</td>
                                  <td>{p?.branch?.animal || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {partnerPurpleStar && (
                            <p className={`${adminStyles.muted} ${styles.spaced10}`}>
                              <strong>Purple Star — Life Palace:</strong>{' '}
                              {partnerPurpleStar.lifePalace?.branchHan || '—'} ({partnerPurpleStar.lifePalace?.animal || '—'})
                            </p>
                          )}
                          {pillars && (
                            <div className={`${styles.callout} ${styles.spaced14}`}>
                              <strong>Compatibility at a glance</strong>
                              <div className={styles.calloutBody}>
                                {guestFirstName}: {pillars.day?.stem?.element} {pillars.day?.stem?.polarity} day master · {zodiac || '—'}
                                <br />
                                {draft.partner_name || 'Second person'}: {partnerPillars.day?.stem?.element} {partnerPillars.day?.stem?.polarity} day master · {partnerZodiac || '—'}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className={`${adminStyles.muted} ${styles.hintTop}`}>
                          Add their birthday to compute their chart.
                        </p>
                      )}
                    </>
                  )}
                </Section>

                {/* Four Pillars */}
                {pillars && (
                  <Section title="Four Pillars (computed live)">
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Pillar</th>
                          <th>Stem</th>
                          <th>Branch</th>
                          <th>Element</th>
                          <th>Animal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[['Year', pillars.year], ['Month', pillars.month], ['Day', pillars.day], ['Hour', pillars.hour]].map(([label, p]) => (
                          <tr key={label}>
                            <td className={label === 'Day' ? styles.cellStrong : undefined}>{label}</td>
                            <td>{p ? `${p.stem.en} ${p.gan} (${p.stem.element} · ${p.stem.polarity})` : '—'}</td>
                            <td>{p ? `${p.branch.en} ${p.zhi} (${p.branch.element})` : '—'}</td>
                            <td>{p ? p.stem.element : '—'}</td>
                            <td>{p?.branch?.animal || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className={`${adminStyles.muted} ${styles.spaced10}`}>
                      <strong>Day Master:</strong> {pillars.day?.stem?.element} {pillars.day?.stem?.polarity} ·{' '}
                      <strong>Zodiac:</strong> {zodiac || '—'} ·{' '}
                      <strong>Dominant element:</strong> {dominant || '—'}
                    </p>
                  </Section>
                )}

                {/* Brief — start here (rule-based synthesis from the chart) */}
                {briefMarkdown && (
                  <Section title="Brief — start here">
                    <div className={styles.brief}>
                      {briefMarkdown.split('\n\n').map((para, i) => (
                        <p key={i} dangerouslySetInnerHTML={{
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
                    <p className={`${adminStyles.muted} ${styles.spacedBelow10}`}>
                      <strong>Life Palace:</strong> {purpleStar.lifePalace?.branchHan || '—'} ({purpleStar.lifePalace?.animal || '—'}) ·{' '}
                      <strong>Body Palace:</strong> {purpleStar.bodyPalace?.branchHan || '—'}
                    </p>
                    <table className={`${styles.table} ${styles.tableCompact}`}>
                      <thead>
                        <tr>
                          <th>Palace</th>
                          <th>Branch</th>
                          <th>Major stars</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(purpleStar.palaces || []).slice(0, 12).map((pl, i) => (
                          <tr key={i}>
                            <td className={pl.isMing ? styles.cellStrong : undefined}>
                              {pl.name}{pl.isMing && ' ★'}
                            </td>
                            <td>{pl.branchHan} ({pl.animal})</td>
                            <td>{(pl.majorStars || []).map((s) => s.name).join(', ') || '—'}</td>
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
                    <ul className={styles.blessings}>
                      {[
                        ['luck', 'Happiness (Phúc)'],
                        ['prosperity', 'Prosperity (Lộc)'],
                        ['longevity', 'Longevity (Thọ)'],
                      ].map(([key, label]) => {
                        const b = threeBlessings[key];
                        if (!b) return null;
                        const verdict = { 1: 'Lucky', 2: 'Neutral', 3: 'Unlucky' }[b.verdict] || 'Neutral';
                        return (
                          <li key={key}>
                            <strong>{label}:</strong> {verdict} ({b.tally.L}L / {b.tally.N}N / {b.tally.U}U)
                            {b.conclusion ? <> — {b.conclusion}</> : null}
                          </li>
                        );
                      })}
                    </ul>
                    {threeBlessings.grand?.narrative && (
                      <p className={styles.grand}>
                        <strong>Grand conclusion:</strong> {threeBlessings.grand.narrative}
                      </p>
                    )}
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
                    className={styles.textarea}
                  />
                  {savingField === 'prep_notes' && <span className={adminStyles.muted}>Saving…</span>}
                </Section>
              </>
            )}

            {activeTab === 'notes' && (
              <>
                {/* Upload Transcript */}
                <Section title="Upload transcript">
                  <p className={`${adminStyles.muted} ${styles.hint}`}>
                    Plain text, markdown, or VTT. Uploading replaces the saved transcript.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,.vtt,text/plain,text/markdown"
                    onChange={handleFileChange}
                    className={styles.hidden}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={savingField === 'transcript_text'}
                    className={styles.btnPrimary}
                  >
                    {savingField === 'transcript_text' ? 'Uploading…' : (draft.transcript_text ? 'Replace transcript file' : 'Upload transcript file')}
                  </button>
                  {draft.transcript_text && (
                    <div className={styles.spaced14}>
                      <div className={styles.fieldLabel}>
                        Current transcript ({draft.transcript_text.length.toLocaleString()} chars)
                      </div>
                      <textarea
                        value={draft.transcript_text}
                        onChange={(e) => setDraft({ ...draft, transcript_text: e.target.value })}
                        onBlur={() => booking.transcript_text !== draft.transcript_text && saveField('transcript_text')}
                        rows={10}
                        className={styles.textareaMono}
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
                    className={styles.textarea}
                  />
                  {savingField === 'post_call_notes' && <span className={adminStyles.muted}>Saving…</span>}
                </Section>

                {/* Generate */}
                <Section title="Generate the final reading">
                  <p className={`${adminStyles.muted} ${styles.hint}`}>
                    Sends the prep brief, transcript, and notes to Claude. The result appears in the Final Reading tab.
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={generating || (!draft.transcript_text && !draft.post_call_notes)}
                    className={styles.btnPrimary}
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
                      <p className={`error-block ${styles.errorSpaced}`}>{generateError}</p>
                      <button type="button" onClick={handleGenerate} className={styles.btnPrimary}>
                        Try again
                      </button>
                    </>
                  ) : !draft.final_reading_html ? (
                    <p className={adminStyles.muted}>
                      Nothing yet. Go to <strong>Notes and Transcript</strong> and click <strong>Generate final reading</strong>.
                    </p>
                  ) : (
                    <>
                      <div className={styles.editorFrame}>
                        <EditorToolbar editor={editor} />
                        <div className={styles.editorBody}>
                          <EditorContent editor={editor} />
                        </div>
                      </div>
                      {savingField === 'final_reading_html' && (
                        <span className={`${adminStyles.muted} ${styles.savingBlock}`}>Saving…</span>
                      )}
                      <div className={styles.actions}>
                        <button
                          type="button"
                          onClick={handleSendEmail}
                          disabled={sending || !booking?.email}
                          className={styles.btnPrimary}
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
                          className={styles.btnSecondary}
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
                        <p className={`${adminStyles.muted} ${styles.noEmail}`}>
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
    <div className={styles.progress}>
      <p className={styles.progressNote}>
        Sit tight — this usually takes 20–30 seconds.
      </p>
      <ol className={styles.progressList}>
        {steps.map((s) => {
          const isDone   = step > s.id;
          const isActive = step === s.id;
          return (
            <li key={s.id} className={isDone || isActive ? styles.stepLive : styles.step}>
              <span className={styles.stepIcon}>
                {isDone ? (
                  <span className={styles.stepDone}>✓</span>
                ) : isActive ? (
                  <span className={styles.spinner} aria-hidden="true" />
                ) : (
                  <span className={styles.stepDot} />
                )}
              </span>
              <span className={isActive ? styles.stepLabelActive : styles.stepLabel}>{s.label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function SendStatus({ sending, sentAt, sentTo, publicToken, error }) {
  if (sending) {
    return <p className={styles.sending}>Sending email…</p>;
  }
  if (error) {
    return <p className={`error-block ${styles.errorTop}`}>{error}</p>;
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
    <div className={styles.sent}>
      <span className={styles.sentText}>✓ Sent to <strong>{sentTo}</strong> on {when}.</span>
      {link && (
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(link)}
          className={styles.copyLink}
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
      className={isActive ? styles.toolButtonActive : styles.toolButton}
    >
      {label}
    </button>
  );
  const divider = (key) => (
    <span key={key} className={styles.toolDivider} />
  );

  return (
    <div className={styles.toolbar}>
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
    <div className={styles.tabBar}>
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={t.id === active ? styles.tabActive : styles.tab}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

function Detail({ label, children }) {
  return (
    <div>
      <div className={styles.fieldLabel}>{label}</div>
      <div className={styles.fieldValue}>{children}</div>
    </div>
  );
}

function Missing({ label = 'missing' }) {
  return <span className={styles.missing}>⚠ {label}</span>;
}

function EditableField({ label, value, onChange, onBlur, placeholder, saving }) {
  return (
    <div className={styles.field}>
      <div className={styles.fieldLabel}>{label}</div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={styles.input}
      />
      {saving && <span className={styles.saving}>Saving…</span>}
    </div>
  );
}
