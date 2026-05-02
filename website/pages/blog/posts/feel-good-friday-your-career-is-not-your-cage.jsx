import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import styles from '../../../styles/BlogPost.module.css';

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.faqItem} onClick={() => setOpen(!open)}>
      <h3 className={styles.faqQuestion}>
        <span>{question}</span>
        <span className={`${styles.faqIcon} ${open ? styles.faqIconOpen : ''}`}>+</span>
      </h3>
      {open && <p className={styles.faqAnswer}>{answer}</p>}
    </div>
  );
}

export default function FeelGoodFridayYourCareerIsNotYourCage() {
  return (
    <>
      <Head>
        <title>Your Career Is Not Your Cage — Fire Horse Career Frustration Explained | Mahjong Tarot</title>
        <meta name="description" content="If the Fire Horse year is amplifying frustration in your career, that's not a curse. It's a signal. Bill Hajdu explains what to do with it — with a story from the reading table." />
        <meta property="og:title" content="Feel Good Friday: Your Career Is Not Your Cage" />
        <meta property="og:description" content="If the Fire Horse year is amplifying frustration in your career, that's not a curse — it's a signal. A story from the reading table about what that signal means, and what to do with it." />
        <meta property="og:image" content="https://mahjongtarot.com/images/blog/feel-good-friday-your-career-is-not-your-cage.webp" />
        <meta property="og:site_name" content="The Mahjong Mirror" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://mahjongtarot.com/blog/posts/feel-good-friday-your-career-is-not-your-cage" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'Article',
                headline: 'Feel Good Friday: Your Career Is Not Your Cage',
                author: { '@type': 'Person', name: 'Bill Hajdu' },
                datePublished: '2026-05-01',
                image: 'https://mahjongtarot.com/images/blog/feel-good-friday-your-career-is-not-your-cage.webp',
                publisher: {
                  '@type': 'Organization',
                  name: 'Mahjong Tarot',
                  url: 'https://mahjongtarot.com',
                },
              },
              {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: [
                  {
                    '@type': 'Question',
                    name: 'Why does my career feel worse in the Fire Horse year?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: "The Fire Horse year is an amplifier — it intensifies whatever was already present in your career. If frustration feels louder in 2026, it's because the year is removing your ability to ignore signals that were already there. This is information, not punishment.",
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'What does career frustration in the Fire Horse year mean in Chinese astrology?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: "In Chinese astrology, the Fire Horse year's high energy amplifies existing dissatisfaction, making it harder to tolerate situations that were previously manageable. This is viewed as a signal that you're ready for something bigger — not a sign that things are going wrong.",
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'What is the weekend challenge Bill Hajdu recommends for career clarity?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Write down the sentence: "What I actually want is..." — not what seems realistic, not what looks good on a resume, but what you actually want at the center of this phase of your life. This is the first step of the Mahjong Mirror framework — identifying your central theme.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: "Should I quit my job if I'm frustrated in the Fire Horse year?",
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: "Not necessarily. The frustration is a signal pointing toward what you want — not necessarily away from where you are. One client resolved her career frustration by identifying an undeveloped opportunity within her existing company and proposing to lead it. The container was too small; the solution wasn't always to leave.",
                    },
                  },
                ],
              },
            ]),
          }}
        />
      </Head>

      <Nav />

      <main className={styles.article}>

        <header className={styles.header}>
          <nav className={styles.breadcrumb}>
            <Link href="/blog">Blog</Link> <span>/</span> <span>Year of the Fire Horse</span>
          </nav>
          <span className={styles.categoryPill}>Year of the Fire Horse</span>
          <h1>Feel Good Friday: Your Career Is Not Your Cage</h1>
          <p className={styles.postMeta}>May 1, 2026 · Bill Hajdu · 5 min read</p>
        </header>

        <div className={styles.headerDivider}><hr /></div>

        <figure style={{ margin: '0 0 var(--space-2xl)' }}>
          <Image
            src="/images/blog/feel-good-friday-your-career-is-not-your-cage.webp"
            alt="A woman writes down her career central theme, answering the Mahjong Mirror's first question in the Fire Horse year"
            width={1200}
            height={630}
            priority
            style={{ width: '100%', height: 'auto' }}
          />
        </figure>

        <div className={styles.body}>

          <p>She came in certain she needed to change jobs.</p>

          <p>She&apos;d been at the same company for seven years. The work was fine. The people were fine. The salary was fine. But this year — and she said it exactly this way — &ldquo;everything feels louder.&rdquo; The commute felt longer. The meetings felt more pointless. The gap between what she was doing and what she wanted to be doing felt impossible to ignore.</p>

          <p>She thought the Fire Horse year was making everything worse.</p>

          <p>I told her it wasn&apos;t.</p>

          <h2>The Amplifier, Not the Problem</h2>

          <p>The Fire Horse year doesn&apos;t create problems. It amplifies what&apos;s already there.</p>

          <p>What she was feeling — the loudness, the gap, the restlessness — wasn&apos;t new. It had been there for years. She had learned to manage it, to keep it at a volume she could live with. Weekends, vacations, the occasional project she actually cared about. The volume had been manageable.</p>

          <p>The Fire Horse turned it up.</p>

          <p>That&apos;s not punishment. That&apos;s information.</p>

          <p>When I laid out the cards and looked at her central theme — the First Angle of the Mahjong Mirror — what appeared wasn&apos;t a job question. It was an authorship question. For seven years, she had been executing other people&apos;s strategies, building other people&apos;s products, serving other people&apos;s visions. She was good at it. But what she actually wanted — what she&apos;d been sitting on — was to lead something of her own.</p>

          <p>The frustration she was feeling wasn&apos;t telling her to run. It was telling her she was ready for something bigger.</p>

          <h2>Frustration Is a Direction</h2>

          <p>Most people experience frustration as a wall. Something that stops you, blocks you, tells you this isn&apos;t working.</p>

          <p>I experience it differently after <Link href="/about">35 years</Link> of sitting across the table from people at exactly this kind of crossroads. Frustration has a direction. It points. It doesn&apos;t just say &ldquo;this isn&apos;t working&rdquo; — it says &ldquo;and here&apos;s the direction you should be heading.&rdquo;</p>

          <p>When the volume goes up in a high-energy year and something in your career feels unbearable — the repetition, the invisibility, the sense that you&apos;re operating so far below what you&apos;re capable of — that&apos;s not the year making things worse. That&apos;s the year removing your ability to ignore something you already knew.</p>

          <p>She knew she wanted to lead something. The Fire Horse year just stopped letting her pretend she didn&apos;t.</p>

          <h2>What She Did</h2>

          <p>She didn&apos;t quit that day. She didn&apos;t need to.</p>

          <p>She went back to her company and identified a product area that had been sitting undeveloped for two years — something her organization knew it needed but hadn&apos;t prioritized. She built a proposal. She pitched it. She got the green light to lead it.</p>

          <p>Six months into a different version of the same job, she sent me a message. The frustration was gone. Not because the company was different or the commute was shorter. Because she was no longer a passenger. She was driving.</p>

          <blockquote>
            <p>The Fire Horse year didn&apos;t break her career. It broke the container that was too small for it.</p>
          </blockquote>

          <h2>Your Challenge for This Weekend</h2>

          <p>The Mahjong Mirror&apos;s <Link href="/blog/posts/the-decision-framework-for-career-crossroads">First Angle</Link> begins with a simple instruction: write down your central theme. Not your job description. Not your goals for this quarter. The thing at the center of it — what you&apos;re actually trying to build, become, or create in this phase of your life.</p>

          <p>If you&apos;ve been feeling <Link href="/blog/posts/fire-horse-will-blow-up-your-career">the Fire Horse year amplifies careers</Link> — if the frustration is louder than usual — that&apos;s the signal to listen to this weekend.</p>

          <p>Name what it&apos;s pointing toward.</p>

          <p>Write down the sentence that starts with: <strong>&ldquo;What I actually want is...&rdquo;</strong></p>

          <p>Not what you think is realistic. Not what makes sense on a resume. What you actually want.</p>

          <p>Because the Fire Horse year is going to keep turning up the volume until you listen. You can resist that, or you can use it. The ones who use it — who hear the signal and move toward it with intention — those are the people this year is building.</p>

          <hr />

          <p><em>If you want to work through the central theme question and the full four-angle framework with me, <Link href="/readings">book a personal reading</Link>. Or start with <Link href="/the-mahjong-mirror">The Mahjong Mirror</Link> — the book walks you through every angle in full.</em></p>

          <h2>Frequently Asked Questions</h2>

          <FaqItem
            question="Why does my career feel worse in the Fire Horse year?"
            answer="The Fire Horse year is an amplifier — it intensifies whatever was already present in your career. If frustration feels louder in 2026, it's because the year is removing your ability to ignore signals that were already there. This is information, not punishment."
          />
          <FaqItem
            question="What does career frustration in the Fire Horse year mean in Chinese astrology?"
            answer="In Chinese astrology, the Fire Horse year's high energy amplifies existing dissatisfaction, making it harder to tolerate situations that were previously manageable. This is viewed as a signal that you're ready for something bigger — not a sign that things are going wrong."
          />
          <FaqItem
            question="What is the weekend challenge Bill Hajdu recommends for career clarity?"
            answer={'Write down the sentence: "What I actually want is..." — not what seems realistic, not what looks good on a resume, but what you actually want at the center of this phase of your life. This is the first step of the Mahjong Mirror framework — identifying your central theme.'}
          />
          <FaqItem
            question="Should I quit my job if I'm frustrated in the Fire Horse year?"
            answer="Not necessarily. The frustration is a signal pointing toward what you want — not necessarily away from where you are. One client resolved her career frustration by identifying an undeveloped opportunity within her existing company and proposing to lead it. The container was too small; the solution wasn't always to leave."
          />

          <nav className={styles.postNav}>
            <Link href="/blog/posts/the-decision-framework-for-career-crossroads" className={styles.navPrev}>
              ← The Decision Framework That Was Built for Career Crossroads
            </Link>
            <span />
          </nav>

        </div>

        {/* ── Related Articles ── */}
        <div className={styles.relatedSection}>
          <h2>More Articles</h2>
          <div className={styles.relatedGrid}>
            <Link href="/blog/posts/fire-horse-will-blow-up-your-career" className={styles.relatedCard}>
              <div className={styles.relatedCardImage}>
                <Image
                  src="/images/blog/fire-horse-will-blow-up-your-career.webp"
                  alt="The Fire Horse Year Will Blow Up Your Career"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <h3>The Fire Horse Year Will Blow Up Your Career</h3>
              <span>Apr 27, 2026</span>
            </Link>
            <Link href="/blog/posts/the-decision-framework-for-career-crossroads" className={styles.relatedCard}>
              <div className={styles.relatedCardImage}>
                <Image
                  src="/images/blog/the-decision-framework-for-career-crossroads.webp"
                  alt="The Decision Framework That Was Built for Career Crossroads"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <h3>The Decision Framework That Was Built for Career Crossroads</h3>
              <span>Apr 29, 2026</span>
            </Link>
          </div>
        </div>

        {/* ── Post CTA ── */}
        <div className={styles.ctaSection}>
          <span className={styles.ctaOverline}>Hear the Signal. Move with Intention.</span>
          <h2>Book a Reading with Bill</h2>
          <p>Sit across the table from someone who&apos;s been holding the Mirror for nearly four decades. Bring your career question. Bill brings the tiles.</p>
          <Link href="/readings#book" className="btn-primary" style={{ marginRight: 16 }}>Book a Reading</Link>
          <Link href="/the-mahjong-mirror" className="btn-secondary">Explore the Book</Link>
        </div>

      </main>

      <Footer />
    </>
  );
}
