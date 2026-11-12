import Link from 'next/link';
import Image from 'next/image';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import styles from '../styles/Membership.module.css';

const YEARLY_HREF = '/signup?plan=yearly';
const LIFETIME_HREF = '/signup?plan=lifetime';

const STATS = [
  { num: '27¢ a day', label: 'is what $99 a year works out to' },
  { num: '35+ years', label: "of Bill's practice behind every reading" },
  { num: '2,400+', label: 'sessions read in person' },
];

const USUAL = [
  'Your animal sign, and nothing else',
  'A chart with no one to explain it',
  'One reading, paid for each time you ask',
  'Only yourself, never the people around you',
];

const MEMBERS = [
  'Four Pillars, Purple Star, Three Blessings and your year ahead',
  "Every chart explained in Bill's own words",
  'Unlimited readings, whenever you have a question',
  'Charts and compatibility for your inner circle',
];

const STACK = [
  {
    title: 'Unlimited online readings',
    desc: "Four Pillars, Purple Star, Three Blessings and your Fire Horse year. Bill's own words, built from your birth details. $19.95 each on their own.",
    value: '$79.80',
    note: 'your 4 readings × $19.95',
  },
  {
    title: 'Unlimited relationship comparisons',
    desc: 'Not only romance. Compare your chart with a business partner, a parent, a child or a friend, as often as you like.',
    value: '$79.80',
    note: '4 comparisons × $19.95',
  },
  {
    title: 'Unlimited Mahjong readings',
    desc: 'Draw from the 42-card Mahjong Mirror deck online, as often as you have a question.',
    included: true,
  },
  {
    title: 'Readings for your inner circle',
    desc: 'Add your partner, children and friends, and run the same full readings for each of them.',
    value: '$239.40',
    note: '3 people × 4 readings',
  },
  {
    title: 'The full almanac and your horoscope',
    desc: 'Every day of the calendar, a monthly view, and a search for a good day to marry, sign or move.',
    included: true,
  },
];

const TESTIMONIALS = [
  {
    quote: 'Beautiful, intuitive, and accurate. The tiles described exactly how I felt.',
    who: 'Saharan Louret · Cleveland, OH',
  },
  {
    quote: 'A calming, grounding experience. I left feeling lighter and clearer.',
    who: 'Fabian Baracca · Minneapolis, MN',
  },
  {
    quote: 'My relationship reading was spot on. It changed how I approached our conversation.',
    who: 'Mouna Gonzato · Newark, NJ',
  },
];

const LIFETIME = [
  {
    title: 'Everything, for life',
    desc: 'Every reading, the almanac and your inner circle. Nothing to renew.',
  },
  {
    title: 'A one-hour consultation with Bill',
    desc: 'Live and one-on-one. $88 on its own, included here.',
  },
  {
    title: 'An autographed copy of the book',
    desc: 'The Mahjong Mirror, signed by Bill.',
  },
];

const COMPARE = [
  ['Unlimited readings and relationship comparisons', 'Yes', 'Yes, for life'],
  ['Inner circle, almanac and horoscope', 'Yes', 'Yes, for life'],
  ['The Mahjong Mirror', 'Digital copy', 'Autographed copy'],
  ['One-hour consultation with Bill', 'Half price, $44', 'One included'],
  ['Further readings with Bill', 'Half off', 'Half off, for life'],
  ['Renewal', '$99 each year', 'Never'],
];

const FAQ = [
  {
    q: 'Do I need to know Mahjong?',
    a: 'No. No prior knowledge of Mahjong is required.',
  },
  {
    q: 'What do I need to get started?',
    a: 'Your birth date. Add your birth time as well and you also get your Purple Star chart, which needs it.',
  },
  {
    q: 'Can I move from yearly to lifetime later?',
    a: 'No. Lifetime is a one-time offer, available only when you join.',
  },
  {
    q: 'How do I book my consultation with Bill?',
    a: 'Use the online booking tool and pick a time that suits you. It is very easy.',
  },
];

export default function Membership() {
  return (
    <>
      <SEO
        title="Membership · Unlimited Readings for $99 a Year | Mahjong Tarot"
        description="Join The Mahjong Mirror membership: unlimited readings from Bill Hajdu, relationship comparisons, readings for your inner circle and the full almanac for $99 a year, or $299 for life."
        path="/membership"
        image="/images/book-cover.webp"
      />

      <Nav />

      <main className={styles.page}>
        {/* Offer hero */}
        <section className={styles.hero}>
          <div className={styles.wrap}>
            <div className={styles.heroInner}>
              <div className={styles.eyebrow}>The Mahjong Mirror membership</div>
              <h1 className={styles.heroTitle}>
                Twenty readings cost $399. <em>A year of unlimited readings is $99.</em>
              </h1>
              <p className={styles.heroLede}>
                Join once and read as often as you like. Every reading Bill Hajdu has written,
                run from your birth details whenever you have a question, for you and the people
                you care about.
              </p>
              <Link href={YEARLY_HREF} className={styles.btnPrimary}>
                Join for $99 a year <span aria-hidden="true">→</span>
              </Link>
              <a href="#lifetime" className={styles.textLink}>Or see the lifetime offer</a>
              <div className={styles.stats}>
                {STATS.map((s) => (
                  <div key={s.num} className={styles.stat}>
                    <div className={styles.statNum}>{s.num}</div>
                    <div className={styles.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* The contrast */}
        <section className={styles.section}>
          <div className={styles.wrap}>
            <h2 className={`${styles.h2} ${styles.contrastTitle}`}>
              The year you were born is only one angle of the mirror.
            </h2>
            <p className={styles.sub}>
              Most places stop at your animal sign. Members look from every angle Bill uses.
            </p>
            <div className={styles.contrast}>
              <div className={styles.contrastCard}>
                <div className={styles.cardLabel}>What you usually get</div>
                <ul className={styles.contrastList}>
                  {USUAL.map((item) => (
                    <li key={item} className={styles.usualItem}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className={`${styles.contrastCard} ${styles.contrastCardStrong}`}>
                <div className={`${styles.cardLabel} ${styles.cardLabelFire}`}>What members get</div>
                <ul className={styles.contrastList}>
                  {MEMBERS.map((item) => (
                    <li key={item} className={styles.memberItem}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* The offer sheet */}
        <section id="yearly" className={`${styles.section} ${styles.sectionTint}`}>
          <div className={styles.wrap}>
            <h2 className={`${styles.h2} ${styles.centered}`}>Here is everything you get</h2>

            <div className={styles.sheet}>
              {STACK.map((row) => (
                <div key={row.title} className={styles.row}>
                  <div className={styles.rowMain}>
                    <div className={styles.rowTitle}>{row.title}</div>
                    <div className={styles.rowDesc}>{row.desc}</div>
                  </div>
                  {row.included ? (
                    <div className={styles.included}>Included</div>
                  ) : (
                    <div className={styles.rowValue}>
                      <div className={styles.rowPrice}>{row.value}</div>
                      <div className={styles.rowNote}>{row.note}</div>
                    </div>
                  )}
                </div>
              ))}

              <div className={`${styles.row} ${styles.rowBonus}`}>
                <Image
                  src="/images/book-cover.webp"
                  alt="Cover of The Mahjong Mirror"
                  width={64}
                  height={102}
                  className={styles.bonusCover}
                />
                <div className={styles.rowMain}>
                  <div className={styles.bonusLabel}>Bonus 1</div>
                  <div className={styles.rowTitle}>A free copy of The Mahjong Mirror</div>
                  <div className={styles.rowDesc}>Bill&apos;s book, the digital edition, yours for joining.</div>
                </div>
                <div className={styles.rowValue}>
                  <div className={styles.rowPrice}>$12.95</div>
                  <div className={styles.free}>Free</div>
                </div>
              </div>

              <div className={`${styles.row} ${styles.rowBonus} ${styles.rowBonusLast}`}>
                <Image
                  src="/images/about-portrait.webp"
                  alt="Bill Hajdu"
                  width={64}
                  height={64}
                  className={styles.bonusPortrait}
                />
                <div className={styles.rowMain}>
                  <div className={styles.bonusLabel}>Bonus 2</div>
                  <div className={styles.rowTitle}>Half off a personal reading with Bill</div>
                  <div className={styles.rowDesc}>
                    Live and one-on-one. 30 minutes for $24, 60 for $44, 90 for $64. Add one when
                    you join, or any time after.
                  </div>
                </div>
                <div className={styles.rowValue}>
                  <div className={styles.rowPrice}>$64</div>
                  <div className={styles.rowNote}>saved on a 90-minute reading</div>
                </div>
              </div>

              <div className={styles.total}>
                <div>
                  <div className={styles.totalLabel}>
                    Total value · 20 readings for you and three people close to you
                  </div>
                  <div className={styles.totalStrike}>$475.95</div>
                  <div className={styles.payLabel}>You pay · five readings and it has paid for itself</div>
                  <div className={styles.payPrice}>
                    $99 <span className={styles.payPer}>a year</span>
                  </div>
                </div>
                <Link href={YEARLY_HREF} className={styles.btnPrimary}>
                  Join for $99 a year <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Proof */}
        <section className={styles.section}>
          <div className={styles.wrap}>
            <div className={styles.eyebrowLeft}>From people Bill has read for</div>
            <div className={styles.quotes}>
              {TESTIMONIALS.map((t) => (
                <blockquote key={t.who} className={styles.quote}>
                  <p className={styles.quoteText}>&ldquo;{t.quote}&rdquo;</p>
                  <footer className={styles.quoteWho}>{t.who}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* The lifetime offer */}
        <section id="lifetime" className={styles.lifetime}>
          <div className={styles.wrap}>
            <div className={styles.lifetimeHead}>
              <div className={styles.eyebrow}>One-time offer · only when you join</div>
              <h2 className={styles.lifetimeTitle}>
                <em>$299.</em> Yours for life.
              </h2>
              <p className={styles.lifetimeLede}>
                Three years of membership costs $297. For two dollars more you never renew again,
                and you get an hour with Bill worth $88.
              </p>
            </div>

            <div className={styles.lifetimeGrid}>
              {LIFETIME.map((item, i) => (
                <div key={item.title} className={styles.lifetimeCard}>
                  <div className={styles.lifetimeNum}>{i + 1}</div>
                  <div className={styles.lifetimeCardTitle}>{item.title}</div>
                  <div className={styles.lifetimeCardDesc}>{item.desc}</div>
                </div>
              ))}
            </div>

            <div className={styles.lifetimeCta}>
              <Link href={LIFETIME_HREF} className={styles.btnPrimary}>
                Join for life, $299 <span aria-hidden="true">→</span>
              </Link>
              <div className={styles.lifetimeNote}>
                Plus half off every further reading with Bill, for life.
              </div>
            </div>
          </div>
        </section>

        {/* Side by side */}
        <section className={styles.section}>
          <div className={styles.wrap}>
            <h2 className={styles.h2}>Side by side</h2>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col" className={styles.thFirst}>What you get</th>
                    <th scope="col" className={styles.th}>Yearly · $99</th>
                    <th scope="col" className={`${styles.th} ${styles.thLifetime}`}>Lifetime · $299</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map(([label, yearly, lifetime]) => (
                    <tr key={label}>
                      <th scope="row" className={styles.rowHead}>{label}</th>
                      <td className={styles.td}>{yearly}</td>
                      <td className={`${styles.td} ${styles.tdLifetime}`}>{lifetime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.addOn}>
              <div className={styles.addOnMain}>
                <div className={styles.addOnLabel}>Add at checkout</div>
                <div className={styles.addOnTitle}>A personal reading with Bill, at the member price</div>
              </div>
              <div className={styles.addOnPrices}>30 min $24 · 60 min $44 · 90 min $64</div>
            </div>
          </div>
        </section>

        {/* Questions */}
        <section className={`${styles.section} ${styles.sectionTint}`}>
          <div className={styles.wrap}>
            <h2 className={styles.h2}>Questions people ask</h2>
            <div className={styles.faq}>
              {FAQ.map((item) => (
                <div key={item.q} className={styles.faqItem}>
                  <h3 className={styles.faqQ}>{item.q}</h3>
                  <p className={styles.faqA}>{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final call */}
        <section className={styles.final}>
          <div className={styles.wrap}>
            <div className={styles.finalInner}>
              <h2 className={`${styles.h2} ${styles.finalTitle}`}>
                The year you were born is only one angle of the mirror.
              </h2>
              <div className={styles.finalCtas}>
                <Link href={LIFETIME_HREF} className={styles.btnPrimarySm}>Join for life, $299</Link>
                <Link href={YEARLY_HREF} className={styles.btnOutline}>Join for $99 a year</Link>
              </div>
              <Link href="/chart" className={styles.textLink}>
                Not ready? See your free chart first
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
