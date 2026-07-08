import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminShell from '../../components/AdminShell';
import { requirePage } from '../../lib/guards';
import { supabase } from '../../lib/supabase';
import { READINGS } from '../../lib/reading-meta';
import adminStyles from '../../styles/PortalAdmin.module.css';
import tableStyles from '../../styles/PortalAdminTable.module.css';
import styles from '../../styles/PortalQuickReading.module.css';

export async function getServerSideProps(ctx) {
  return requirePage('staff')(ctx);
}

// Reading types the astrologer can tick. Order matters — drives the
// checkbox grid AND the order of sections in the email. Names and keys
// come from the canonical reading metadata (lib/reading-meta.js).
const READING_OPTIONS = READINGS.map(({ key, label, hint }) => ({ id: key, label, hint }));

function readingLabel(id) {
  return READING_OPTIONS.find((r) => r.id === id)?.label || id;
}

function relTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export default function QuickReadingPage({ profile }) {
  const router = useRouter();
  const [tab, setTab] = useState('generate'); // 'generate' | 'past'

  // ── Generate-tab state ────────────────────────────────────────────
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [gender, setGender] = useState('');
  const [types, setTypes] = useState([]);

  const [partnerName, setPartnerName] = useState('');
  const [partnerBirthday, setPartnerBirthday] = useState('');
  const [partnerBirthTime, setPartnerBirthTime] = useState('');
  const [partnerGender, setPartnerGender] = useState('');

  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  // ── Past-tab state ────────────────────────────────────────────────
  const [pastRows, setPastRows] = useState([]);
  const [pastLoading, setPastLoading] = useState(false);
  const [pastError, setPastError] = useState('');
  const [pastLoaded, setPastLoaded] = useState(false);

  useEffect(() => {
    if (tab !== 'past' || pastLoaded || !supabase) return;
    setPastLoading(true);
    setPastError('');
    // Note: `html` is deliberately excluded — it is the full rendered
    // reading (tens of KB each) and would bloat the list payload. It is
    // fetched by the full-page view (/admin/quick-reading/[id]) on open.
    supabase
      .from('readings')
      .select('id, created_at, person1_name, person1_birthday, person2_name, person2_birthday, types, sent_to, public_token')
      .eq('type', 'admin')
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data, error: e }) => {
        if (e) setPastError(e.message);
        else   setPastRows(data ?? []);
        setPastLoading(false);
        setPastLoaded(true);
      });
  }, [tab, pastLoaded]);

  function toggleType(id) {
    setTypes((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);
  }

  async function generateReading() {
    if (!birthday) {
      setError('Date of birth is required.');
      return;
    }
    if (types.length === 0) {
      setError('Tick at least one reading type.');
      return;
    }
    if (types.includes('compatibility') && !partnerBirthday) {
      setError("Partner's date of birth is required for a compatibility reading.");
      return;
    }
    setError('');
    setSending(true);

    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(
        () => reject(new Error('Generation timed out after 30s. Try refreshing the page.')),
        30000,
      );
    });

    try {
      const res = await Promise.race([
        fetch('/api/admin/quick-reading', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name || null,
            birthday,
            birthTime: birthTime || null,
            birthPlace: birthPlace || null,
            gender: gender || null,
            types,
            partner: types.includes('compatibility') ? {
              name: partnerName || null,
              birthday: partnerBirthday,
              birthTime: partnerBirthTime || null,
              gender: partnerGender || null,
            } : null,
          }),
        }),
        timeout,
      ]);
      clearTimeout(timer);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate.');
      if (!data.readingId) {
        throw new Error('The reading was generated but could not be saved. Please try again.');
      }
      router.push(`/admin/quick-reading/${data.readingId}`);
    } catch (err) {
      clearTimeout(timer);
      // eslint-disable-next-line no-console
      console.error('[quick-reading] generate failed', err);
      setError(err?.message || 'Failed to generate.');
    } finally {
      setSending(false);
    }
  }

  const compatChecked = types.includes('compatibility');

  return (
    <>
      <Head>
        <title>Quick reading | Mahjong Tarot Portal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminShell profile={profile}>
        <p className={adminStyles.pageEyebrow}>Quick reading</p>
        <h1 className={adminStyles.pageTitle}>Generate a reading</h1>
        <p className={adminStyles.pageLede}>
          Run any combination of Bazi, Zi Wei, Three Blessings, Fire Horse
          forecast, or compatibility for any person.
        </p>

        <div className={tableStyles.controlsRow}>
          <div className={tableStyles.chipRow}>
            <button
              type="button"
              className={tab === 'generate' ? tableStyles.chipActive : tableStyles.chip}
              onClick={() => setTab('generate')}
            >
              Generate
            </button>
            <button
              type="button"
              className={tab === 'past' ? tableStyles.chipActive : tableStyles.chip}
              onClick={() => setTab('past')}
            >
              Past readings
            </button>
          </div>
        </div>

        {tab === 'generate' && (
          <form
            className={styles.form}
            onSubmit={(e) => { e.preventDefault(); generateReading(); }}
          >
            <p className={styles.sectionHead}>Subject</p>

            <label className={styles.field}>
              <span className={styles.label}>Customer name</span>
              <input
                type="text"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Chen"
              />
            </label>

            <div className={styles.row}>
              <label className={styles.field}>
                <span className={styles.label}>Date of birth *</span>
                <input
                  type="date"
                  className={styles.input}
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  required
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Time of birth (optional)</span>
                <input
                  type="time"
                  className={styles.input}
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  placeholder="HH:MM"
                />
              </label>
            </div>

            <div className={styles.row}>
              <label className={styles.field}>
                <span className={styles.label}>Place of birth (optional)</span>
                <input
                  type="text"
                  className={styles.input}
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  placeholder="City, State / Country"
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Gender (optional)</span>
                <select
                  className={styles.input}
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">—</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </label>
            </div>

            <p className={styles.sectionHead}>Readings to run</p>
            <div className={styles.checkGroup}>
              {READING_OPTIONS.map((opt) => {
                const active = types.includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    className={`${styles.check} ${active ? styles.checkActive : ''}`}
                  >
                    <input
                      type="checkbox"
                      className={styles.checkInput}
                      checked={active}
                      onChange={() => toggleType(opt.id)}
                    />
                    <span className={styles.checkBody}>
                      <span className={styles.checkTitle}>{opt.label}</span>
                      <span className={styles.checkHint}>{opt.hint}</span>
                    </span>
                  </label>
                );
              })}
            </div>

            {compatChecked && (
              <>
                <p className={styles.sectionHead}>Compatibility partner</p>
                <div className={styles.partnerBlock}>
                  <label className={styles.field}>
                    <span className={styles.label}>Partner name (optional)</span>
                    <input
                      type="text"
                      className={styles.input}
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="e.g. Daniel Park"
                    />
                  </label>

                  <div className={styles.row}>
                    <label className={styles.field}>
                      <span className={styles.label}>Partner date of birth *</span>
                      <input
                        type="date"
                        className={styles.input}
                        value={partnerBirthday}
                        onChange={(e) => setPartnerBirthday(e.target.value)}
                        required
                      />
                    </label>
                    <label className={styles.field}>
                      <span className={styles.label}>Partner time of birth (optional)</span>
                      <input
                        type="time"
                        className={styles.input}
                        value={partnerBirthTime}
                        onChange={(e) => setPartnerBirthTime(e.target.value)}
                        placeholder="HH:MM"
                      />
                    </label>
                  </div>

                  <label className={styles.field}>
                    <span className={styles.label}>Partner gender (optional)</span>
                    <select
                      className={styles.input}
                      value={partnerGender}
                      onChange={(e) => setPartnerGender(e.target.value)}
                    >
                      <option value="">—</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                  </label>
                </div>
              </>
            )}

            {error && <p className="error-inline">{error}</p>}

            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={sending}
              >
                {sending ? 'Generating…' : 'Generate reading'}
              </button>
            </div>
          </form>
        )}

        {tab === 'past' && (
          <>
            {pastError && <p className="error-block">{pastError}</p>}

            {pastLoading && <p className={adminStyles.muted}>Loading…</p>}

            {!pastLoading && pastRows.length === 0 && !pastError && (
              <p className={styles.emptyState}>
                No past readings yet. Run one from the Generate tab — it will
                appear here.
              </p>
            )}

            {!pastLoading && pastRows.length > 0 && (
              <div className={tableStyles.tableWrap}>
                <table className={tableStyles.table}>
                  <thead>
                    <tr>
                      <th>When</th>
                      <th>Subject</th>
                      <th>Partner</th>
                      <th>Readings</th>
                      <th>Sent to</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastRows.map((r) => (
                      <tr
                        key={r.id}
                        className={styles.rowClickable}
                        onClick={() => router.push(`/admin/quick-reading/${r.id}`)}
                      >
                        <td className={tableStyles.cellMuted}>{relTime(r.created_at)}</td>
                        <td className={tableStyles.cellPrimary}>
                          {r.person1_name || '(unnamed)'}
                          {r.person1_birthday && (
                            <div className={tableStyles.cellSecondary}>{r.person1_birthday}</div>
                          )}
                        </td>
                        <td className={tableStyles.cellSecondary}>
                          {r.person2_name || (r.person2_birthday ? '(unnamed)' : '—')}
                          {r.person2_birthday && (
                            <div className={tableStyles.cellSecondary}>{r.person2_birthday}</div>
                          )}
                        </td>
                        <td>
                          <div className={styles.typesCell}>
                            {(r.types || []).map((t) => (
                              <span key={t} className={styles.typeTag}>{readingLabel(t)}</span>
                            ))}
                          </div>
                        </td>
                        <td className={tableStyles.cellMuted}>{r.sent_to || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

      </AdminShell>
    </>
  );
}
