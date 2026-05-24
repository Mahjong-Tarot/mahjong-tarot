import Image from 'next/image';
import Link from 'next/link';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import ReadingTypeCard from '../components/ReadingTypeCard';
import BookingForm from '../components/BookingForm';
import { PERSON_BILL, ORGANIZATION, WEBSITE, graph, breadcrumb, faqPage } from '../lib/schema';
import {
  READING_TYPES,
  HOW_IT_WORKS_STEPS,
  WHAT_YOU_GAIN,
  TESTIMONIALS,
  FAQ_ITEMS,
  SERVICE_SCHEMA,
  SCHEMA_FAQS,
} from '../lib/readings-content';
import styles from '../styles/Readings.module.css';

export default function Readings() {
  return (
    <>
      <SEO
        title="Book a Mahjong Tarot Reading Online with Bill Hajdu | Mahjong Tarot"
        description="Live online Mahjong Tarot readings with Bill Hajdu, One-Tile Insight (10–15 min), Three-Tile Spread (20–30 min), or Mahjong Mirror Session (45–60 min). 35+ years of divination practice."
        path="/readings"
        image="/images/readings-hero.webp"
        jsonLd={graph([
          ORGANIZATION,
          WEBSITE,
          PERSON_BILL,
          breadcrumb([
            { name: 'Home', url: '/' },
            { name: 'Readings', url: '/readings' },
          ]),
          SERVICE_SCHEMA,
          faqPage(SCHEMA_FAQS),
        ])}
      />

      <Nav />

      <main>
        {/* ── Page Header ── */}
        <section className="page-header is-bounded">
          <div className="container">
            <span className="overline">Personal Sessions</span>
            <h1>Mahjong Tarot Readings Online with Bill Hajdu</h1>
            <p className={styles.headerLead}>
              A divination experience using the symbolic language of Mahjong tiles
              to illuminate your path, clarify your choices, and connect you with
              deeper intuition.
            </p>
            <div style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
              <Link href="/book-a-reading" className="btn-primary">Book a Private Reading</Link>
              <Link href="/the-mahjong-mirror/order" className="btn-secondary">Pre-Order the Book</Link>
            </div>
          </div>
        </section>

        {/* ── What is a Reading ── */}
        <section>
          <div className={`container ${styles.whatIs}`}>
            <div className={styles.whatIsImage}>
              <Image
                src="/images/readings-hero.webp"
                alt="Bill Hajdu conducting a Mahjong Tarot reading with a client"
                width={560}
                height={420}
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
            <div className={styles.whatIsText}>
              <span className="overline">The Practice</span>
              <h2>What Is a Mahjong Tarot Reading?</h2>
              <div className="divider-gold" />
              <p>
                A Mahjong Tarot reading transforms the familiar imagery of Mahjong
                tiles into a symbolic map of energy, insight, and direction, where
                each tile carries its own story representing influences,
                opportunities, emotional patterns, or emerging possibilities.
              </p>
              <p>
                Like tarot, it reveals what lies beneath the surface. Yet unlike
                tarot, it speaks through a visual language rooted in East Asian
                symbolism, blending intuition with timeless archetypes to offer
                honest, meaningful guidance for love, career, healing, and life
                transitions.
              </p>
            </div>
          </div>
        </section>

        {/* ── Types of Readings ── */}
        <section className="section-stone">
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="overline">Choose Your Session</span>
              <h2>Types of Readings</h2>
              <div className="divider-gold centered" />
            </div>

            <div className={styles.readingTypes}>
              {READING_TYPES.map((rt) => (
                <ReadingTypeCard key={rt.id} {...rt} />
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="overline">The Process</span>
              <h2>How a Reading Works</h2>
              <div className="divider-gold centered" />
            </div>
            <div className={styles.steps}>
              {HOW_IT_WORKS_STEPS.map((s) => (
                <div key={s.n} className={styles.step}>
                  <span className={styles.stepNumber}>{s.n}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What You Gain ── */}
        <section className="section-stone">
          <div className={`container ${styles.gainLayout}`}>
            <div>
              <span className="overline">What You'll Receive</span>
              <h2>What You'll Gain</h2>
              <div className="divider-gold" />
              <ul className={styles.gainList}>
                {WHAT_YOU_GAIN.map((item) => (
                  <li key={item} className={styles.gainItem}>
                    <span className={styles.gainDot} />
                    {item}
                  </li>
                ))}
              </ul>
              <blockquote className={styles.gainQuote}>
                A reading is not just prediction, it's reflection, empowerment,
                and alignment.
              </blockquote>
            </div>
            <div className={styles.gainImage}>
              <Image
                src="/images/readings-session.webp"
                alt="Client choosing Mahjong tiles during a reading"
                width={480}
                height={560}
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="overline">Client Experiences</span>
              <h2>Testimonials</h2>
              <div className="divider-gold centered" />
            </div>
            <div className={styles.testimonials}>
              {TESTIMONIALS.map((t) => (
                <blockquote key={t.name} className={styles.testimonial}>
                  <p>"{t.quote}"</p>
                  <footer>, {t.name}, {t.location}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* ── Mid-page CTA ── */}
        <section className="section-stone">
          <div className="container" style={{ textAlign: 'center', padding: 'var(--space-2xl) 0' }}>
            <span className="overline">Don't Wait -- The Tiles Are Ready</span>
            <h2 style={{ margin: 'var(--space-md) 0' }}>Book Your Reading Today</h2>
            <p style={{ maxWidth: 480, margin: '0 auto var(--space-xl)' }}>
              Sessions are conducted online with flexible scheduling. Bill follows up personally within 24 hours.
            </p>
            <Link href="/book-a-reading" className="btn-primary">Book a Private Reading</Link>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="section-stone">
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="overline">Common Questions</span>
              <h2>Frequently Asked Questions</h2>
              <div className="divider-gold centered" />
            </div>
            <div className={styles.faq}>
              {FAQ_ITEMS.map((item) => (
                <div key={item.q} className={styles.faqItem}>
                  <h4>{item.q}</h4>
                  <p>{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Book a Reading ── */}
        <section id="book" className="section-stone">
          <div className={`container ${styles.bookCta}`}>
            <span className="overline">Begin Your Journey</span>
            <h2>Ready to See What the Tiles Reveal?</h2>
            <p>
              Fill out the form below to request a Mahjong Mirror Session.
              Bill will follow up to confirm your reading.
            </p>
            <BookingForm />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
