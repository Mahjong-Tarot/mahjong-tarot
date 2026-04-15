import { useState } from 'react';
import { supabase } from '../lib/supabase';
import useSpamGuard from '../lib/useSpamGuard';
import styles from '../styles/Forms.module.css';

const CHINESE_SIGNS = [
  'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
  'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig',
];

export default function NewsletterSignup({ source = 'footer', variant = 'dark' }) {
  const [email, setEmail] = useState('');
  const [sign, setSign] = useState('');
  const [status, setStatus] = useState('idle');
  const { checkSpam, SpamField } = useSpamGuard();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    if (checkSpam()) { setStatus('success'); return; }

    setStatus('submitting');
    if (!supabase) { setStatus('error'); return; }
    const { error } = await supabase.rpc('submit_newsletter', {
      p_email: email,
      p_chinese_sign: sign || null,
      p_source: source,
    });

    if (error) {
      console.error('Newsletter signup error:', error);
      setStatus('error');
    } else {
      setStatus('success');
      setEmail('');
      setSign('');
    }
  }

  const isFooter = variant === 'footer';
  const isLight = variant === 'light' || isFooter;

  if (status === 'success') {
    const wrapperClass = variant === 'dark'
      ? styles.newsletter
      : isFooter
        ? `${styles.blogNewsletter} ${styles.footerNewsletter}`
        : styles.blogNewsletter;
    return (
      <div className={wrapperClass}>
        <p className={variant === 'dark' || isFooter ? styles.successMsgLight : styles.successMsg}>
          You&rsquo;re in! Watch your inbox for wisdom from the tiles.
        </p>
      </div>
    );
  }

  if (isLight) {
    return (
      <div className={isFooter ? `${styles.blogNewsletter} ${styles.footerNewsletter}` : styles.blogNewsletter}>
        <h2>Stay Connected</h2>
        <p>Get insights on Mahjong, tarot, and Chinese astrology delivered to your inbox.</p>
        <form onSubmit={handleSubmit}>
          <SpamField />
          <div className={styles.blogNewsletterInputs}>
            <input
              type="email"
              className={styles.input}
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Joining…' : 'Subscribe'}
            </button>
          </div>
          <select
            className={styles.select}
            value={sign}
            onChange={(e) => setSign(e.target.value)}
            style={{ marginTop: 'var(--space-sm)', maxWidth: 480, width: '100%', marginLeft: isFooter ? 0 : 'auto', marginRight: isFooter ? 0 : 'auto', display: 'block' }}
          >
            <option value="">Your Chinese sign (optional)</option>
            {CHINESE_SIGNS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </form>
        {status === 'error' && <p className={styles.errorText}>Something went wrong. Please try again.</p>}
      </div>
    );
  }

  return (
    <div className={styles.newsletter}>
      <p className={styles.newsletterTitle}>Newsletter</p>
      <form onSubmit={handleSubmit}>
        <SpamField />
        <div className={styles.newsletterRow}>
          <input
            type="email"
            className={styles.inputDark}
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Joining…' : 'Subscribe'}
          </button>
        </div>
        <div className={styles.newsletterSign}>
          <select
            className={styles.select}
            value={sign}
            onChange={(e) => setSign(e.target.value)}
          >
            <option value="">Your Chinese sign (optional)</option>
            {CHINESE_SIGNS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </form>
      {status === 'error' && <p className={styles.errorText}>Something went wrong. Please try again.</p>}
    </div>
  );
}
