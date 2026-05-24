import { useState } from 'react';
import { supabase } from '../lib/supabase';
import useSpamGuard from '../lib/useSpamGuard';
import { CHINESE_SIGNS } from '../lib/readings-content';
import form from '../styles/Forms.module.css';

export default function BookingForm() {
  const [fields, setFields] = useState({
    name: '', email: '', phone: '', sign: '', birthday: '', message: '',
  });
  const [bookingStatus, setBookingStatus] = useState('idle');
  const { checkSpam, SpamField } = useSpamGuard();

  function update(e) {
    setFields({ ...fields, [e.target.name]: e.target.value });
  }

  async function handleBooking(e) {
    e.preventDefault();
    if (checkSpam()) { setBookingStatus('success'); return; }
    setBookingStatus('submitting');

    if (!supabase) { setBookingStatus('error'); return; }
    const { error } = await supabase.rpc('submit_booking', {
      p_name: fields.name,
      p_email: fields.email,
      p_reading_type_slug: 'mahjong-mirror-session',
      p_phone: fields.phone || null,
      p_chinese_sign: fields.sign || null,
      p_birthday: fields.birthday || null,
      p_message: fields.message || null,
    });

    if (error) {
      console.error('Booking error:', error);
      setBookingStatus('error');
    } else {
      setBookingStatus('success');
    }
  }

  if (bookingStatus === 'success') {
    return (
      <p className={form.successMsg}>
        Thank you! Bill will be in touch soon to schedule your session.
      </p>
    );
  }

  return (
    <form className={form.bookingForm} onSubmit={handleBooking}>
      <SpamField />
      <div className={form.bookingRow}>
        <div className={form.formGroup}>
          <label className={form.label} htmlFor="book-name">Name *</label>
          <input
            id="book-name"
            name="name"
            type="text"
            className={form.input}
            value={fields.name}
            onChange={update}
            required
          />
        </div>
        <div className={form.formGroup}>
          <label className={form.label} htmlFor="book-email">Email *</label>
          <input
            id="book-email"
            name="email"
            type="email"
            className={form.input}
            value={fields.email}
            onChange={update}
            required
          />
        </div>
      </div>

      <div className={form.bookingRow}>
        <div className={form.formGroup}>
          <label className={form.label} htmlFor="book-phone">Phone</label>
          <input
            id="book-phone"
            name="phone"
            type="tel"
            className={form.input}
            value={fields.phone}
            onChange={update}
          />
        </div>
        <div className={form.formGroup}>
          <label className={form.label} htmlFor="book-sign">Chinese Sign</label>
          <select
            id="book-sign"
            name="sign"
            className={form.select}
            value={fields.sign}
            onChange={update}
          >
            <option value="">Select (optional)</option>
            {CHINESE_SIGNS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={form.formGroup}>
        <label className={form.label} htmlFor="book-birthday">Birthday</label>
        <input
          id="book-birthday"
          name="birthday"
          type="date"
          className={form.input}
          value={fields.birthday}
          onChange={update}
        />
      </div>

      <div className={form.formGroup}>
        <label className={form.label} htmlFor="book-message">Message</label>
        <textarea
          id="book-message"
          name="message"
          className={form.textarea}
          placeholder="What would you like guidance on?"
          value={fields.message}
          onChange={update}
        />
      </div>

      <div className={form.bookingSubmit}>
        <button type="submit" className="btn-primary" disabled={bookingStatus === 'submitting'}>
          {bookingStatus === 'submitting' ? 'Sending…' : 'Request a Reading'}
        </button>
      </div>

      {bookingStatus === 'error' && (
        <p className={form.errorText}>Something went wrong. Please try again.</p>
      )}
    </form>
  );
}
