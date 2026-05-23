import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { logSessionPayment } from '../lib/sessions';
import styles from './LogPaymentModal.module.css';

function todayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export default function LogPaymentModal({ session, onClose, onSaved }) {
  const [amount,   setAmount]   = useState(session?.payment_amount ?? '');
  const [paidAt,   setPaidAt]   = useState(
    session?.paid_at ? session.paid_at.slice(0, 10) : todayISO()
  );
  const [method,   setMethod]   = useState(session?.payment_method || 'offline');
  const [notes,    setNotes]    = useState(session?.payment_notes || '');
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  // Reset state when session changes (re-open with different row)
  useEffect(() => {
    setAmount(session?.payment_amount ?? '');
    setPaidAt(session?.paid_at ? session.paid_at.slice(0, 10) : todayISO());
    setMethod(session?.payment_method || 'offline');
    setNotes(session?.payment_notes || '');
    setError('');
  }, [session?.id]);

  if (!session) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const parsedAmount = amount === '' ? null : Number(amount);
      if (parsedAmount !== null && (Number.isNaN(parsedAmount) || parsedAmount < 0)) {
        throw new Error('Amount must be a positive number or blank.');
      }
      await logSessionPayment(supabase, {
        sessionId:     session.id,
        amount:        parsedAmount,
        paidAt:        paidAt ? new Date(`${paidAt}T00:00:00`).toISOString() : null,
        paymentMethod: method,
        notes:         notes.trim() || null,
      });
      if (onSaved) onSaved({ ...session, paid_at: paidAt, payment_method: method, payment_amount: parsedAmount, payment_notes: notes.trim() || null });
    } catch (err) {
      setError(err.message || 'Failed to log payment.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="log-payment-title"
      >
        <button type="button" onClick={onClose} className={styles.close} aria-label="Close">×</button>
        <h2 id="log-payment-title" className={styles.title}>Log payment</h2>
        <p className={styles.sub}>
          Reading session on {new Date(session.scheduled_at).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
          })}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span className={styles.label}>Method</span>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className={styles.input}
              disabled={saving}
            >
              <option value="offline">Offline (cash, bank transfer, etc.)</option>
              <option value="stripe">Stripe</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Amount</span>
            <input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              placeholder="e.g. 50.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={styles.input}
              disabled={saving}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Paid on</span>
            <input
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              className={styles.input}
              disabled={saving}
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={styles.textarea}
              rows={3}
              placeholder="Optional — reference number, payer, etc."
              disabled={saving}
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.secondary}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.primary}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
