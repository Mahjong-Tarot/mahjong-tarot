import Link from 'next/link';
import { useState } from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { ORGANIZATION, WEBSITE, PERSON_BILL, graph, breadcrumb } from '../lib/schema';
import { supabase } from '../lib/supabase';
import useSpamGuard from '../lib/useSpamGuard';
import styles from '../styles/Contact.module.css';
import form from '../styles/Forms.module.css';

export default function Contact() {
  const [fields, setFields] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle');
  const { checkSpam, SpamField } = useSpamGuard();

  function update(e) {
    setFields({ ...fields, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (checkSpam()) { setStatus('success'); return; } // silent reject
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
      <SEO
        title="Contact Bill Hajdu — Mahjong Tarot & Chinese Astrology"
        description="Get in touch with Bill Hajdu for questions about Mahjong Tarot readings, speaking engagements, media inquiries, or The Mahjong Mirror book."
        path="/contact"
        jsonLd={graph([
          ORGANIZATION,
          WEBSITE,
          PERSON_BILL,
          breadcrumb([
            { name: 'Home', url: '/' },
            { name: 'Contact', url: '/contact' },
          ]),
          {
            '@type': 'ContactPage',
            url: 'https://www.mahjongtarot.com/contact',
            about: { '@id': 'https://www.mahjongtarot.com/#bill-hajdu' },
          },
        ])}
      />

      <Nav />

      <main>
        <section className={styles.pageHeader}>
          <div className="container">
            <span className="overline">Get in Touch</span>
            <h1>Contact Us</h1>
            <p className={styles.headerLead}>
              Have a question about readings, the book, or a speaking engagement?
              We&rsquo;d love to hear from you.
            </p>
            <div style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
              <Link href="/readings#book" className="btn-primary">Book a Reading</Link>
              <Link href="/the-mahjong-mirror#preorder" className="btn-secondary">Preorder the Book</Link>
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
                <SpamField />
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
