import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import PortalNav from '../../../components/PortalNav';
import { supabase } from '../../../lib/supabase';
import { requirePortalUser } from '../../../lib/requirePortalUser';
import { getClient, updateClient, markSubscription } from '../../../lib/clients';
import { listSessions } from '../../../lib/sessions';
import portalStyles from '../../../styles/Portal.module.css';
import styles from '../../../styles/PortalClient.module.css';

export async function getServerSideProps(ctx) {
  return requirePortalUser(ctx);
}

const SUB_LABEL = {
  none: 'Not subscribed',
  active: 'Subscribed',
  lapsed: 'Lapsed',
  cancelled: 'Cancelled',
};

const SUB_CLASS = {
  none: 'subNone',
  active: 'subActive',
  lapsed: 'subLapsed',
  cancelled: 'subCancelled',
};

const SESSION_STATUS_LABEL = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  no_show: 'No-show',
  cancelled: 'Cancelled',
};

function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ClientProfilePage({ profile }) {
  const router = useRouter();
  const { id } = router.query;

  const [client, setClient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [savingSub, setSavingSub] = useState(false);

  useEffect(() => {
    if (!id || !supabase) return;
    let active = true;
    setLoading(true);
    Promise.all([getClient(supabase, id), listSessions(supabase, { clientId: id })])
      .then(([c, s]) => {
        if (!active) return;
        setClient(c);
        setSessions(s);
        setForm(toForm(c));
      })
      .catch((err) => setError(err.message || 'Failed to load client.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  function toForm(c) {
    if (!c) return null;
    return {
      full_name: c.full_name || '',
      email: c.email || '',
      phone: c.phone || '',
      birthday: c.birthday || '',
      birth_time: c.birth_time || '',
      birth_place: c.birth_place || '',
      gender: c.gender || '',
      notes: c.notes || '',
    };
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function handleSave(e) {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const updated = await updateClient(supabase, id, form);
      setClient(updated);
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to save.');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleSubChange(newStatus) {
    setSavingSub(true);
    try {
      const updated = await markSubscription(supabase, id, newStatus);
      setClient(updated);
    } catch (err) {
      setError(err.message || 'Failed to update subscription.');
    } finally {
      setSavingSub(false);
    }
  }

  if (loading) {
    return (
      <ShellLayout profile={profile}>
        <p className={styles.empty}>Loading client…</p>
      </ShellLayout>
    );
  }

  if (!client) {
    return (
      <ShellLayout profile={profile}>
        <Link href="/portal/clients" className={styles.backLink}>← All clients</Link>
        <p className={portalStyles.eyebrow}>Portal · Client</p>
        <h1 className={portalStyles.h1}>Client not found</h1>
        <p className={portalStyles.lede}>That ID doesn&apos;t match a client you can see.</p>
      </ShellLayout>
    );
  }

  return (
    <ShellLayout profile={profile} title={client.full_name}>
      <Link href="/portal/clients" className={styles.backLink}>← All clients</Link>
      <p className={portalStyles.eyebrow}>Portal · Client</p>

      <header className={styles.profileHeader}>
        <div>
          <h1 className={portalStyles.h1}>{client.full_name}</h1>
          <span className={`${styles.badge} ${styles[SUB_CLASS[client.subscription_status]] || ''}`}>
            {SUB_LABEL[client.subscription_status] || client.subscription_status}
          </span>
        </div>
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={() => { setForm(toForm(client)); setEditing((v) => !v); }}
        >
          {editing ? 'Cancel edit' : 'Edit client'}
        </button>
      </header>

      {error && <p className={styles.error}>{error}</p>}

      {/* ─── Contact + birth ─── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Contact &amp; birth</h2>

        {editing ? (
          <form className={styles.form} onSubmit={handleSave}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="full_name">Full name</label>
              <input id="full_name" className={styles.input} value={form.full_name} onChange={set('full_name')} required />
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">Email</label>
                <input id="email" type="email" className={styles.input} value={form.email} onChange={set('email')} />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="phone">Phone</label>
                <input id="phone" className={styles.input} value={form.phone} onChange={set('phone')} />
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="birthday">Birthday</label>
                <input id="birthday" type="date" className={styles.input} value={form.birthday} onChange={set('birthday')} />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="birth_time">Birth time</label>
                <input id="birth_time" type="time" className={styles.input} value={form.birth_time} onChange={set('birth_time')} />
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="birth_place">Birth place</label>
                <input id="birth_place" className={styles.input} value={form.birth_place} onChange={set('birth_place')} />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="gender">Gender</label>
                <select id="gender" className={styles.input} value={form.gender} onChange={set('gender')}>
                  <option value="">—</option>
                  <option value="F">Female</option>
                  <option value="M">Male</option>
                  <option value="X">Other</option>
                </select>
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="notes">Notes</label>
              <textarea id="notes" className={styles.textarea} value={form.notes} onChange={set('notes')} rows={4} />
            </div>
            <div className={styles.actions}>
              <button type="button" className={styles.btnSecondary} onClick={() => setEditing(false)} disabled={savingEdit}>Cancel</button>
              <button type="submit" className={styles.btnPrimary} disabled={savingEdit}>{savingEdit ? 'Saving…' : 'Save changes'}</button>
            </div>
          </form>
        ) : (
          <dl className={styles.fields}>
            <Field label="Email" value={client.email} />
            <Field label="Phone" value={client.phone} />
            <Field label="Birthday" value={client.birthday} />
            <Field label="Birth time" value={client.birth_time} />
            <Field label="Birth place" value={client.birth_place} />
            <Field label="Gender" value={client.gender} />
            <Field label="Notes" value={client.notes} long />
          </dl>
        )}
      </section>

      {/* ─── Subscription ─── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Subscription</h2>
        <div className={styles.subscriptionPanel}>
          <div>
            <span className={`${styles.badge} ${styles[SUB_CLASS[client.subscription_status]] || ''}`}>
              {SUB_LABEL[client.subscription_status] || client.subscription_status}
            </span>
            <div className={styles.subDates}>
              {client.subscription_started_at && <span>Started {new Date(client.subscription_started_at).toLocaleDateString()}</span>}
              {client.subscription_ended_at && <span> · Ended {new Date(client.subscription_ended_at).toLocaleDateString()}</span>}
            </div>
          </div>
          <div className={styles.subButtons}>
            {['none', 'active', 'lapsed', 'cancelled'].map((s) => (
              <button
                key={s}
                type="button"
                className={s === client.subscription_status ? styles.btnPrimary : styles.btnSecondary}
                onClick={() => handleSubChange(s)}
                disabled={savingSub || s === client.subscription_status}
              >
                {SUB_LABEL[s]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Sessions ─── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Sessions</h2>
          <Link href={`/portal/sessions/new?client=${client.id}`} className={styles.linkAction}>+ Schedule session</Link>
        </div>
        {sessions.length === 0 ? (
          <p className={styles.muted}>No sessions yet.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>When</th>
                <th>Status</th>
                <th>Meeting</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td>{formatDateTime(s.scheduled_at)}</td>
                  <td>{SESSION_STATUS_LABEL[s.status] || s.status}</td>
                  <td>{s.meeting_external_id ? `${s.meeting_source}: ${s.meeting_external_id.slice(0, 8)}…` : '—'}</td>
                  <td className={styles.notesCell}>{s.prep_notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </ShellLayout>
  );
}

function ShellLayout({ profile, title, children }) {
  return (
    <>
      <Head>
        <title>{title ? `${title} · Client` : 'Client'} | Mahjong Tarot Portal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className={portalStyles.shell}>
        <PortalNav profile={profile} />
        <main className={portalStyles.main}>{children}</main>
      </div>
    </>
  );
}

function Field({ label, value, long }) {
  return (
    <div className={long ? styles.fieldFull : styles.fieldInline}>
      <dt className={styles.fieldKey}>{label}</dt>
      <dd className={styles.fieldVal}>{value || '—'}</dd>
    </div>
  );
}
