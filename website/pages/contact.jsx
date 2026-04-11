import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import styles from '../styles/Contact.module.css';
import form from '../styles/Forms.module.css';

export default function Contact() {
  const [fields, setFields] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle');

  function update(e) {
    setFields({ ...fields, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    if (!supabase) { setStatus('error'); return; }

    const { error } = await supabase.rpc('submit_contact', {
      p_name: fields.name,
      p_email: fields.email,
      p_phone: fields.phone || null,
      p_subject: fields.subject || null,
      p_message: fields.message,
    });

    if (error) {
      console.error('Contact form error:', error);
      setStatus('error');
    } else {
      setStatus('success');
    }
  }

  return (
    <>
      <Head>
        <title>Contact — Mahjong Tarot</title>
        <meta name="description" content="Get in touch with Bill Hajdu for questions about Mahjong Tarot readings, speaking engagements, or The Mahjong Mirror." />
        <meta property="og:title" content="Contact — Mahjong Tarot" />
        <meta property="og:description" content="Reach out to Bill Hajdu — questions, bookings, and collaborations welcome." />
        <meta name="twitter:card" content="summary" />
        <link rel="canonical" href="https://mahjong-tarot.com/contact" />
      </Head>

      <Nav />

      <main>
        <section className={`section-dark ${styles.pageHeader}`}>
          <div className="container">
            <span className="overline" style={{ color: 'var(--celestial-gold)' }}>Get in Touch</span>
            <h1>Contact Us</h1>
            <p className={styles.headerLead}>
              Have a question about readings, the book, or a speaking engagement?
              We&rsquo;d love to hear from you.
            </p>
            <div style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
              <Link href="/readings#book" className="btn-primary">Book a Reading</Link>
              <Link href="/the-mahjong-mirror#preorder" className="btn-ghost">Preorder the Book</Link>
            </div>
          </div>
        </section>

        <section className={styles.formSection}>
          <div className="container">
            <h2>Send a Message</h2>
            <p className={styles.formIntro}>
              Fill out the form below and Bill will get back to you as soon as possible.
            </p>

            {status === 'success' ? (
              <p className={form.successMsg}>
                Thank you for reaching out! Bill will be in touch soon.
              </p>
            ) : (
              <form className={form.contactForm} onSubmit={handleSubmit}>
                <div className={form.contactRow}>
                  <div className={form.formGroup}>
                    <label className={form.label} htmlFor="name">Name *</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className={form.input}
                      value={fields.name}
                      onChange={update}
                      required
                    />
                  </div>
                  <div className={form.formGroup}>
                    <label className={form.label} htmlFor="email">Email *</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={form.input}
                      value={fields.email}
                      onChange={update}
                      required
                    />
                  </div>
                </div>

                <div className={form.contactRow}>
                  <div className={form.formGroup}>
                    <label className={form.label} htmlFor="phone">Phone</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className={form.input}
                      value={fields.phone}
                      onChange={update}
                    />
                  </div>
                  <div className={form.formGroup}>
                    <label className={form.label} htmlFor="subject">Subject</label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      className={form.input}
                      value={fields.subject}
                      onChange={update}
                    />
                  </div>
                </div>

                <div className={form.formGroup}>
                  <label className={form.label} htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    className={form.textarea}
                    value={fields.message}
                    onChange={update}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={status === 'submitting'}>
                  {status === 'submitting' ? 'Sending…' : 'Send Message'}
                </button>

                {status === 'error' && (
                  <p className={form.errorText}>Something went wrong. Please try again.</p>
                )}
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
