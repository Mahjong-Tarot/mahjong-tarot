import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AdminShell from '../../../components/AdminShell';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth';
import { requireAdmin } from '../../../lib/requireAdmin';
import { createClient as createClientRow } from '../../../lib/clients';
import adminStyles from '../../../styles/PortalAdmin.module.css';
import styles from '../../../styles/PortalClient.module.css';

export async function getServerSideProps(ctx) {
  return requireAdmin(ctx);
}

export default function NewClientPage({ profile }) {
  const router = useRouter();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    birthday: '',
    birth_time: '',
    birth_place: '',
    gender: '',
    notes: '',
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.full_name.trim()) {
      setError('Full name is required.');
      return;
    }
    setSubmitting(true);
    try {
      const row = await createClientRow(supabase, form, user?.id);
      router.push(`/admin/private-readings/${row.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create client.');
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>New client | Mahjong Tarot Portal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminShell profile={profile}>
          <Link href="/admin/private-readings" className={styles.backLink}>← Private readings</Link>
          <p className={adminStyles.pageEyebrow}>Admin · New private reading</p>
          <h1 className={adminStyles.pageTitle}>Add a client</h1>
          <p className={adminStyles.pageLede}>
            Manual entry for now. Auto-creation from bookings comes later.
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="full_name">Full name</label>
              <input id="full_name" className={styles.input} value={form.full_name} onChange={set('full_name')} required autoFocus />
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
                <input id="birth_place" className={styles.input} value={form.birth_place} onChange={set('birth_place')} placeholder="City, country" />
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
              <textarea id="notes" className={styles.textarea} value={form.notes} onChange={set('notes')} rows={4} placeholder="Anything to remember about this client" />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.actions}>
              <Link href="/admin/private-readings" className={styles.btnSecondary}>Cancel</Link>
              <button type="submit" className={styles.btnPrimary} disabled={submitting}>
                {submitting ? 'Creating…' : 'Create client'}
              </button>
            </div>
          </form>
      </AdminShell>
    </>
  );
}
