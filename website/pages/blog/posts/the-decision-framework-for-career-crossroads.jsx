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

export default function TheDecisionFrameworkForCareerCrossroads() {
  return (
    <>
      <Head>
        <title>The Decision Framework Built for Career Crossroads | Mahjong Mirror</title>
        <meta name="description" content="Most career analysis skips the most important question. The Mahjong Mirror's four angles — applied to career decisions — show you what you're actually deciding. Bill Hajdu explains." />
        <meta property="og:title" content="The Decision Framework That Was Built for Career Crossroads" />
        <meta property="og:description" content="The Mahjong Mirror's four angles applied to career decisions. Most people skip three of them. The third angle — what's really opposing you — is where the breakthrough hides." />
        <meta property="og:image" content="https://mahjongtarot.com/images/blog/the-decision-framework-for-career-crossroads.webp" />
        <meta property="og:site_name" content="The Mahjong Mirror" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://mahjongtarot.com/blog/posts/the-decision-framework-for-career-crossroads" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'Article',
                headline: 'The Decision Framework That Was Built for Career Crossroads',
                author: { '@type': 'Person', name: 'Bill Hajdu' },
                datePublished: '2026-04-29',
                image: 'https://mahjongtarot.com/images/blog/the-decision-framework-for-career-crossroads.webp',
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
                    name: 'What is the Mahjong Mirror framework for career decisions?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'The Mahjong Mirror applies four angles to any career decision: (1) Central Theme — what is this decision really about at its core; (2) Self-Knowledge — who you are and who you need to be to execute the move; (3) Opposition — what internal and external forces are working against you; (4) Future — a realistic assessment of where this leads.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'How do I identify my central theme in a career decision?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Set aside the specific choice and ask: what is this career situation fundamentally about at a deeper level? The surface question might be "should I take this job?" but the central theme might be "I need to be building something of my own." The central theme is the compass for all other analysis.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'What is the most important question to ask at a career crossroads?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'According to the Mahjong Mirror framework, the most overlooked question is: what is opposing you — specifically, both the internal patterns (overextension, impatience, unrealistic expectations) and the external factors (market shifts, relationship obstacles, resource gaps) that stand between you and your goal.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Is the Mahjong Mirror a tarot card reading?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: "No. The Mahjong Mirror is a decision-making framework developed by Bill Hajdu that uses Mahjong tiles as a reflective tool. It doesn't predict the future — it provides a structured way to examine decisions from four angles you might otherwise miss. You don't need to know Mahjong to use the framework.",
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'How does the Fire Horse year affect career decisions?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'The Fire Horse year (2026) rewards people who move with clarity and preparation. It is particularly unforgiving of overextension — taking on more than you can sustain. The fourth angle of the Mirror (realistic future assessment) is especially important this year.',
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
          <h1>The Decision Framework That Was Built for Career Crossroads</h1>
          <p className={styles.postMeta}>Apr 29, 2026 · Bill Hajdu · 8 min read</p>
        </header>

        <div className={styles.headerDivider}><hr /></div>

        <figure style={{ margin: '0 0 var(--space-2xl)' }}>
          <Image
            src="/images/blog/the-decision-framework-for-career-crossroads.webp"
            alt="Bill Hajdu applies the Mahjong Mirror framework to a career crossroads reading"
            width={1200}
            height={630}
            priority
            style={{ width: '100%', height: 'auto' }}
          />
        </figure>

        <div className={styles.body}>

          <p>Career crossroads are the hardest decisions most people face. Not because the information isn&apos;t there &mdash; it usually is. Because the emotions are so entangled with the logic that you can&apos;t see the shape of the decision clearly.</p>

          <p>I&apos;m the Firepig, and in <Link href="/about">over 35 years of readings</Link>, career decisions are what bring more people to the table than anything else. More than relationship questions. More than money. Career crossroads arrive with a particular weight: the sense that getting this wrong doesn&apos;t just cost you money or time &mdash; it costs you a version of yourself you were trying to become.</p>

          <p>The Mahjong Mirror was built for exactly this.</p>

          <p>It doesn&apos;t tell you what to choose. It doesn&apos;t predict outcomes. What it does is give you a structured way to see your career situation from four angles &mdash; and when you see all four honestly, the right path tends to become obvious.</p>

          <p>Here&apos;s how to apply it.</p>

          <h2>Step 1: Identify Your Central Theme</h2>

          <p>Before anything else, you need to know what this career decision is actually about.</p>

          <p>Not the job title. Not the salary. The thing underneath.</p>

          <p>Chapter 1 of <em>The Mahjong Mirror</em> begins here for a reason. Every career decision has a surface question and a central theme, and they are rarely the same thing. The surface question is: should I take this job, or stay, or go, or pivot? The central theme is what&apos;s actually driving the situation &mdash; the deeper pattern that connects your career dissatisfaction, your sense of being stuck, your excitement about what could be.</p>

          <p>A client came to me recently asking whether she should accept a promotion. Different city, more money, more title. On the surface, the question was straightforward. When we looked at the central theme, what came up was this: for years, she had been building other people&apos;s visions. She was good at it, and she got rewarded for it. But the central theme of her situation was not advancement &mdash; it was authorship. She wanted to be building something of her own.</p>

          <p>The promotion would have given her more of what she already had and less of what she actually needed.</p>

          <p>That&apos;s what identifying the central theme does. It stops you from answering the wrong question.</p>

          <p>To apply this yourself: set aside the specific choice in front of you and ask &mdash; what is this career situation fundamentally about? What is the deeper current running through it? What does it represent beyond the practical terms?</p>

          <p>Write it down. That sentence is your compass for everything that follows.</p>

          <h2>Step 2: Know Who You Are and Who You Need to Be</h2>

          <p>The second angle turns the mirror on you.</p>

          <p>Most career analysis is purely external: is the market right, is the company solid, is the compensation fair? The Mahjong Mirror asks a different question &mdash; are you the right person for this move right now?</p>

          <p>This is not asking whether you&apos;re talented enough. It&apos;s asking whether you&apos;re aligned.</p>

          <p>The Fire Horse year has specific demands. It rewards people who are proactive, decisive, and focused. It is unforgiving of people who need extensive deliberation time, who scatter their energy, or who are operating from fear rather than clarity. If you&apos;re considering a major career move, you need to be honest about which of those descriptions fits you right now &mdash; not in general, but at this specific moment.</p>

          <p>Ask yourself: what are my actual strengths in a fast-moving, high-stakes environment? Where do I tend to undermine myself? What version of me shows up under pressure &mdash; the one who rises, or the one who freezes?</p>

          <p>This is not about judgment. It&apos;s about preparation. If you know your tendency is to overcommit and then burn out, that&apos;s useful information before you accept a role that requires 110% for six months. If you know you lose confidence when things move fast, that&apos;s useful before you join a startup in a Fire Horse year.</p>

          <p>The second angle gives you a realistic picture of the person who is going to execute this decision. Not the ideal version. The actual one.</p>

          <h2>Step 3: Name Your Opposition &mdash; Honestly</h2>

          <p>This is the step most people skip. And it&apos;s the one that matters most.</p>

          <p>Chapter 6 of <em>The Mahjong Mirror</em> covers the Third Angle: examining what stands in opposition to your goal. Not theoretically &mdash; specifically. The West position in a Mahjong spread reveals three cards: two that name the obstacles, and one in the center that suggests how to navigate them.</p>

          <p>There are two kinds of opposition that come up repeatedly in career readings: internal and external.</p>

          <p>Internal opposition is when you are standing in your own way. This might look like: overambition that keeps you reaching before you&apos;re ready. Impatience that makes you quit at exactly the wrong moment. Unrealistic expectations that set you up to feel like a failure when you&apos;re actually succeeding. A tendency to start things and not finish them when the energy wears off.</p>

          <p><Link href="/blog/posts/fire-horse-will-blow-up-your-career">The Fire Horse year has a particular internal opposition trap</Link>: it makes you feel like your energy is unlimited. It isn&apos;t. People overextend, overcommit, and burn themselves out in high-energy years. If this has been your pattern before &mdash; taking on too much and then falling apart &mdash; this is the year to name it before it names you.</p>

          <p>External opposition comes in as many forms as careers do. A boss whose interests don&apos;t align with yours. A market that&apos;s contracting in your field. A resource problem &mdash; capital, time, or access &mdash; that you&apos;ve been assuming will sort itself out. A relationship in your professional network that&apos;s quietly working against you.</p>

          <p>Here is what <a href="https://en.wikipedia.org/wiki/Sun_Tzu" target="_blank" rel="noopener noreferrer">Sun Tzu</a> understood: knowing what opposes you doesn&apos;t make you pessimistic. It makes you prepared. The sailor who studies the weather before setting out isn&apos;t afraid of the ocean. They just want to arrive.</p>

          <p>Take a piece of paper and write down every obstacle between you and where you want your career to go. External. Internal. Things you know and things you suspect. When you can see the opposition clearly, it stops being the thing that catches you off guard and becomes the thing you navigate with skill.</p>

          <p>And then &mdash; the center card &mdash; look for the seed of resolution inside the opposition. Chapter 7 of <em>The Mahjong Mirror</em> makes this point: within every challenge lies a path through it. The card that names the obstacle usually carries a clue about how to work with it, not just around it.</p>

          <p>If your internal opposition is overextension, the resolution might be ruthless prioritization &mdash; learning to say no to the things that are exciting but not essential. If your external opposition is a difficult boss, the resolution might not be leaving &mdash; it might be understanding what your boss needs and providing it. If your opposition is a market shift, the resolution might be the creative pivot you&apos;ve been resisting.</p>

          <h2>Step 4: Assess the Future &mdash; Realistically, Not Hopefully</h2>

          <p>The fourth angle tests the decision against probability.</p>

          <p>This is not fortune telling. It&apos;s disciplined thinking about what is likely to happen given what you know about yourself, your field, and the current year&apos;s energy.</p>

          <p>In the Fire Horse year specifically, this angle asks: does this career move serve the next two or three years, not just the next month? The year&apos;s energy is so immediate and compelling that it&apos;s easy to optimize for excitement and ignore sustainability. The best career moves I&apos;ve seen in this year are ones made with medium-range vision &mdash; what does this build toward?</p>

          <p>Ask: if I make this move, what does the realistic trajectory look like? Not the optimistic one &mdash; the realistic one. What does it require me to sustain for 6, 12, 18 months? Can I sustain it? What would success actually look like in concrete terms?</p>

          <p>If the future picture holds up under that kind of honest scrutiny, you&apos;re aligned. If it only holds up when you squint, keep looking.</p>

          <h2>What to Do With All Four Angles</h2>

          <p>Here is the practical synthesis.</p>

          <p>Write a single paragraph that answers: what is my central theme, who do I need to be, what is the opposition, and where does this realistically lead?</p>

          <p>If that paragraph feels clear and honest, you have a decision you can execute with confidence.</p>

          <p>If one of the four angles is still fuzzy &mdash; if you can&apos;t quite articulate the central theme, or you&apos;re not sure whether you&apos;re naming the opposition honestly &mdash; that&apos;s the work to do before moving. The fog doesn&apos;t go away by acting faster. It goes away by looking harder.</p>

          <div className={styles.pullQuote}>
            <p>The Fire Horse year rewards people who move with clarity. Not people who move to escape the discomfort of not knowing.</p>
          </div>

          <p>Those are different things. The Mirror was built to show you which one you&apos;re doing.</p>

          <p><em>The full four-angle framework for career decisions &mdash; and for every other major life decision &mdash; is in my book, <Link href="/the-mahjong-mirror">The Mahjong Mirror: Your Path to Wiser Decisions</Link>. If you&apos;d prefer to go through your specific career situation with me directly, <Link href="/readings">book a reading</Link>.</em></p>

          <h2>Frequently Asked Questions</h2>

          <FaqItem
            question="What is the Mahjong Mirror framework for career decisions?"
            answer="The Mahjong Mirror applies four angles to any career decision: (1) Central Theme — what is this decision really about at its core; (2) Self-Knowledge — who you are and who you need to be to execute the move; (3) Opposition — what internal and external forces are working against you; (4) Future — a realistic assessment of where this leads."
          />
          <FaqItem
            question="How do I identify my central theme in a career decision?"
            answer={'Set aside the specific choice and ask: what is this career situation fundamentally about at a deeper level? The surface question might be "should I take this job?" but the central theme might be "I need to be building something of my own." The central theme is the compass for all other analysis.'}
          />
          <FaqItem
            question="What is the most important question to ask at a career crossroads?"
            answer="According to the Mahjong Mirror framework, the most overlooked question is: what is opposing you — specifically, both the internal patterns (overextension, impatience, unrealistic expectations) and the external factors (market shifts, relationship obstacles, resource gaps) that stand between you and your goal."
          />
          <FaqItem
            question="Is the Mahjong Mirror a tarot card reading?"
            answer="No. The Mahjong Mirror is a decision-making framework developed by Bill Hajdu that uses Mahjong tiles as a reflective tool. It doesn't predict the future — it provides a structured way to examine decisions from four angles you might otherwise miss. You don't need to know Mahjong to use the framework."
          />
          <FaqItem
            question="How does the Fire Horse year affect career decisions?"
            answer="The Fire Horse year (2026) rewards people who move with clarity and preparation. It is particularly unforgiving of overextension — taking on more than you can sustain. The fourth angle of the Mirror (realistic future assessment) is especially important this year."
          />

          <nav className={styles.postNav}>
            <Link href="/blog/posts/fire-horse-will-blow-up-your-career" className={styles.navPrev}>
              ← The Fire Horse Year Will Blow Up Your Career — One Way or Another
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
            <Link href="/blog/posts/how-to-know-if-this-is-the-year-for-you-to-take-a-financial-risk" className={styles.relatedCard}>
              <div className={styles.relatedCardImage}>
                <Image
                  src="/images/blog/how-to-know-if-this-is-the-year-for-you-to-take-a-financial-risk.webp"
                  alt="How to Know If This Is the Year for You to Take a Financial Risk"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <h3>How to Know If This Is the Year for You to Take a Financial Risk</h3>
              <span>Apr 22, 2026</span>
            </Link>
          </div>
        </div>

        {/* ── Post CTA ── */}
        <div className={styles.ctaSection}>
          <span className={styles.ctaOverline}>Move With Clarity, Not Noise</span>
          <h2>Book a Reading with Bill</h2>
          <p>Bring your career crossroads to someone who has guided people through decisions like yours for nearly four decades. Bill brings the tiles.</p>
          <Link href="/readings#book" className="btn-primary" style={{ marginRight: 16 }}>Book a Reading</Link>
          <Link href="/the-mahjong-mirror" className="btn-secondary">Preorder the Book</Link>
        </div>

      </main>

      <Footer />
    </>
  );
}
