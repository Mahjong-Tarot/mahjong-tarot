import { useEffect, useState } from 'react';
import styles from './SendNoteModal.module.css';

export default function SendNoteModal({ client, onClose, onSent }) {
  const defaultSubject = client ? `Following up — ${client.full_name}` : '';
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (client) {
      setSubject(`Following up — ${client.full_name}`);
      setBody('');
      setError('');
    }
  }, [client?.id]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && !sending) onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, sending]);

  if (!client) return null;

  async function handleSend(e) {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/admin/conversions/send-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id, subject: subject.trim(), body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send.');
      onSent?.({ client, id: data.id });
    } catch (err) {
      setError(err.message || 'Failed to send.');
      setSending(false);
    }
  }

  return (
    <div className={styles.backdrop} onClick={() => !sending && onClose()}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="send-note-title"
      >
        <header className={styles.head}>
          <h2 id="send-note-title" className={styles.title}>Send a note to {client.full_name}</h2>
          <p className={styles.subtitle}>
            Delivered to <strong>{client.email}</strong> via Resend.
          </p>
        </header>

        <form onSubmit={handleSend} className={styles.form}>
          <label className={styles.field}>
            <span className={styles.label}>Subject</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={styles.input}
              required
              disabled={sending}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Body (markdown)</span>
            <textarea
              rows={10}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className={styles.textarea}
              placeholder="Hi — wanted to reach out about…"
              required
              disabled={sending}
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={sending}>
              Cancel
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={sending || !subject.trim() || !body.trim()}>
              {sending ? 'Sending…' : 'Send note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
