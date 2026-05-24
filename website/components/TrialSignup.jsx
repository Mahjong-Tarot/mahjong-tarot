import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import PasswordInput from './PasswordInput';
import { supabase } from '../lib/supabase';
import { pathForUser } from '../lib/signup';
import styles from '../styles/Signup.module.css';

export default function TrialSignup() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!supabase) {
      setError('Sign-up is temporarily unavailable. Please try again in a moment.');
      setSubmitting(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          birthday: birthday || null,
          birth_time: birthTime || null,
          signup_source: 'trial',
        },
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/member/dashboard` : undefined,
      },
    });

    if (authError) {
      setSubmitting(false);
      setError(authError.message);
      return;
    }

    setSubmitting(false);
    if (data?.session) {
      router.push(await pathForUser(data.session.user.id));
      return;
    }
    setSuccess(true);
  }

  return (
    <form
      className={`${styles.formCard} ${styles.formTrial}`}
      onSubmit={handleSubmit}
    >
      <h2 className={styles.formH}>
        Start your <em>90 days</em>
      </h2>
      <div className={styles.formSub}>
        // Step 1 of 1, takes about a minute
      </div>

      {success ? (
        <div className={styles.success}>
          <div className={styles.successPip} />
          <h3>Check your email</h3>
          <p>
            We just sent a confirmation link to <strong>{email}</strong>.
            Click it to finish setting up your Member Area.
          </p>
          <p className={styles.successHint}>
            Don&apos;t see it? Check your spam folder, or wait a minute and try again.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="first">First name</label>
              <input
                className={styles.input}
                id="first"
                placeholder="Bill"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="last">Last name</label>
              <input
                className={styles.input}
                id="last"
                placeholder="Hajdu"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                required
              />
            </div>
          </div>

          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={styles.fieldLabel} htmlFor="email">Email</label>
            <input
              className={styles.input}
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <div className={styles.fieldHint}>// We send your member link here, never anything else.</div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="bday">
                Birthday <span className={styles.opt}>(for your chart)</span>
              </label>
              <input
                className={styles.input}
                id="bday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="btime">
                Birth time <span className={styles.opt}>(4th Pillar if known)</span>
              </label>
              <input
                className={styles.input}
                id="btime"
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
              />
            </div>
          </div>

          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={styles.fieldLabel} htmlFor="pw">Choose a password</label>
            <PasswordInput
              id="pw"
              className={styles.input}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <label className={styles.checkRow}>
            <input className={styles.checkbox} type="checkbox" defaultChecked />
            <span>Email me occasional updates from Bill. Twice a month at most.</span>
          </label>
          <label className={styles.checkRow}>
            <input className={styles.checkbox} type="checkbox" required />
            <span>I agree to the <Link href="/contact">Terms</Link> and <Link href="/contact">Privacy Policy</Link>.</span>
          </label>

          {error && <div className={styles.formError}>{error}</div>}

          <button className={styles.submitBtn} type="submit" disabled={submitting}>
            {submitting
              ? 'Just a moment...'
              : <>Open my Member Area <span aria-hidden="true">→</span></>}
          </button>

          <div className={styles.reassure}>
            <span className={styles.reassureItem}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="7" width="10" height="7" rx="1" />
                <path d="M5 7V5a3 3 0 016 0v2" />
              </svg>
              No credit card
            </span>
            <span className={styles.reassureItem}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="6" />
                <path d="M8 5v3l2 1.5" />
              </svg>
              90 free days
            </span>
            <span className={styles.reassureItem}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 4l6-2 6 2v5c0 3-3 5-6 6-3-1-6-3-6-6V4z" />
              </svg>
              Cancel anytime
            </span>
          </div>

          <div className={styles.loginLine}>
            Already a member? <Link href="/sign-in">Sign in</Link>
          </div>
        </>
      )}
    </form>
  );
}
