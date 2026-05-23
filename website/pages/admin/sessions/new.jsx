import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import PortalNav from '../../../components/PortalNav';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth';
import { requirePortalUser } from '../../../lib/requirePortalUser';
import { listClients } from '../../../lib/clients';
import { createSession } from '../../../lib/sessions';
import portalStyles from '../../../styles/Portal.module.css';
import styles from '../../../styles/PortalClient.module.css';

export async function getServerSideProps(ctx) {
  return requirePortalUser(ctx);
}

function defaultScheduledAt() {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  // local datetime-input format: YYYY-MM-DDTHH:mm
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function NewSessionPage({ profile }) {
  const router = useRouter();
  const { user } = useAuth();
  const presetClientId = typeof router.query.client === 'string' ? router.query.client : '';

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    client_id: presetClientId,
    scheduled_at: defaultScheduledAt(),
    duration_minutes: 60,
    prep_notes: '',
  });

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    listClients(supabase)
      .then((rows) => setClients(rows))
      .catch((err) => setError(err.message || 'Failed to load clients.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (presetClientId && form.client_id !== presetClientId) {
      setForm((f) => ({ ...f, client_id: presetClientId }));
    }
    // only sync when router preset changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetClientId]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.client_id) {
      setError('Pick a client.');
      return;
    }
    if (!form.scheduled_at) {
      setError('Pick a date and time.');
      return;
    }
    if (!user?.id) {
      setError('Not signed in.');
      return;
    }
    setSubmitting(true);
    try {
      await createSession(supabase, {
        client_id: form.client_id,
        astrologer_id: user.id,
        scheduled_at: new Date(form.scheduled_at).toISOString(),
        duration_minutes: parseInt(form.duration_minutes, 10) || 60,
        prep_notes: form.prep_notes,
      });
      router.push(`/portal/clients/${form.client_id}`);
    } catch (err) {
      setError(err.message || 'Failed to schedule session.');
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Schedule session | Mahjong Tarot Portal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={portalStyles.shell}>
        <PortalNav profile={profile} />

        <main className={portalStyles.main}>
          <Link
            href={presetClientId ? `/portal/clients/${presetClientId}` : '/portal/clients'}
            className={styles.backLink}
          >
            ← {presetClientId ? 'Back to client' : 'All clients'}
          </Link>
          <p className={portalStyles.eyebrow}>Portal · Schedule session</p>
          <h1 className={portalStyles.h1}>Schedule a session</h1>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="client_id">Client</label>
              <select id="client_id" className={styles.input} value={form.client_id} onChange={set('client_id')} required disabled={loading}>
                <option value="">{loading ? 'Loading…' : 'Pick a client'}</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.full_name}</option>
                ))}
              </select>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="scheduled_at">When</label>
                <input id="scheduled_at" type="datetime-local" className={styles.input} value={form.scheduled_at} onChange={set('scheduled_at')} required />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="duration_minutes">Duration (min)</label>
                <input id="duration_minutes" type="number" min="15" step="15" className={styles.input} value={form.duration_minutes} onChange={set('duration_minutes')} />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="prep_notes">Prep notes</label>
              <textarea id="prep_notes" className={styles.textarea} value={form.prep_notes} onChange={set('prep_notes')} rows={4} placeholder="What to look at, questions the client raised, themes to revisit" />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.actions}>
              <Link
                href={presetClientId ? `/portal/clients/${presetClientId}` : '/portal/clients'}
                className={styles.btnSecondary}
              >
                Cancel
              </Link>
              <button type="submit" className={styles.btnPrimary} disabled={submitting}>
                {submitting ? 'Scheduling…' : 'Schedule session'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </>
  );
}
