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

export default function WhatTheFavoritesTrainersMissedMahjongMirror() {
  return (
    <>
      <Head>
        <title>What Derby Favorites Missed: The Mahjong Mirror Obstacle Question | Mahjong Tarot</title>
        <meta name="description" content="The 2026 Derby favorites had talent and data. None asked the obstacle question. Here is how to run the Mahjong Mirror's Third Angle on your own plan." />
        <meta property="og:title" content="What the Favorites' Trainers Missed, and What You're Probably Missing in Your Own Plan" />
        <meta property="og:description" content="Every trainer at the Derby saw the same race. None asked the one question that would have changed everything. The Mahjong Mirror's obstacle angle, applied to the decision in front of you right now." />
        <meta property="og:image" content="https://www.mahjongtarot.com/images/blog/what-the-favorites-trainers-missed-mahjong-mirror.webp" />
        <meta property="og:site_name" content="The Mahjong Mirror" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://www.mahjongtarot.com/blog/posts/what-the-favorites-trainers-missed-mahjong-mirror" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'Article',
                headline: "What the Favorites' Trainers Missed, and What You're Probably Missing in Your Own Plan",
                author: { '@type': 'Person', name: 'Bill Hajdu' },
                datePublished: '2026-05-13',
                image: 'https://www.mahjongtarot.com/images/blog/what-the-favorites-trainers-missed-mahjong-mirror.webp',
                publisher: {
                  '@type': 'Organization',
                  name: 'Mahjong Tarot',
                  url: 'https://www.mahjongtarot.com',
                },
              },
              {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: [
                  {
                    '@type': 'Question',
                    name: "What is the Mahjong Mirror's Third Angle?",
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'The Third Angle of the Mahjong Mirror asks: what is opposing me? It looks at the specific obstacle already present in a plan that could prevent it from succeeding. Unlike general risk analysis, the Third Angle asks you to name the single most vulnerable condition in your plan and decide in advance what you will do if it fails.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: "What mistake did the favorites' trainers make at the 2026 Kentucky Derby?",
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: "The favorites' trainers at the 2026 Kentucky Derby did not account for the effect of a fast early pace on their horses' energy reserves in the final stretch. When the pace proved to be faster than normal from the start, horses that ran hard at the front burned their reserves and faded. Golden Tempo, trained to conserve energy and attack late, won from dead last position at the three-quarter mark.",
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'How do I apply the Mahjong Mirror to a decision I am making?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'The Mahjong Mirror Third Angle process has five steps: (1) Write the plan in one sentence. (2) List the conditions the plan depends on. (3) Find the most vulnerable condition. (4) Decide in advance what you do if that condition fails. (5) Determine whether the plan should change based on what the obstacle reveals.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'What is the Mahjong Mirror?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: "The Mahjong Mirror is a decision-making framework developed by Chinese astrology practitioner Bill Hajdu. It uses four angles of reflection to examine any significant decision from multiple perspectives. It is also the title of Bill's book, which teaches the framework for personal use without requiring a tile reading.",
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Why is the obstacle question especially important in the Fire Horse year?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: "The Fire Horse year (2026) operates at a faster pace than ordinary years. Decisions made without examining obstacles fail more quickly, with less warning, and more dramatically. The year's energy does not provide a grace period for untested assumptions.",
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
          <h1>What the Favorites&apos; Trainers Missed, and What You&apos;re Probably Missing in Your Own Plan</h1>
          <p className={styles.postMeta}>May 13, 2026 · Bill Hajdu · 6 min read</p>
        </header>

        <div className={styles.headerDivider}><hr /></div>

        <figure style={{ margin: '0 0 var(--space-2xl)' }}>
          <Image
            src="/images/blog/what-the-favorites-trainers-missed-mahjong-mirror.webp"
            alt="An open journal on a wooden desk, one page with a clear central question written in bold ink, the facing page blank and waiting. Morning light. The image of a plan being stress-tested before execution."
            width={1200}
            height={630}
            priority
            style={{ width: '100%', height: 'auto' }}
          />
          <figcaption style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.04em', color: 'var(--ink-4)', marginTop: 'var(--space-sm)', textAlign: 'center' }}>
            Stress-test the plan before the gun goes off.
          </figcaption>
        </figure>

        <div className={styles.body}>

          <p>Every trainer at the 2026 Kentucky Derby had access to the same data. They knew the other horses. They knew the track. They knew their own horse&apos;s performance history. They had experienced jockeys, expensive preparation, and genuine expertise.</p>

          <p>And most of them watched a 23-to-1 long shot come from dead last to win the race in the final thirty seconds.</p>

          <p>The difference was not talent. The difference was one question that the favorites&apos; teams did not ask.</p>

          <h2>The Question Nobody Asked</h2>

          <p>I am the Firepig. I have been doing readings for over 35 years, and in that time I have watched intelligent, well-prepared people make the same omission over and over: they plan for success without planning for the obstacle.</p>

          <p>The Mahjong Mirror framework I developed works through a set of angles. Each angle looks at the same decision from a different direction. The Third Angle asks: what is opposing me?</p>

          <p>Not &ldquo;what might go wrong eventually.&rdquo; Specifically: what is already in front of this plan that could stop it?</p>

          <p>At <Link href="/blog/posts/kentucky-derby-fire-horse-year-2026">the 2026 Kentucky Derby</Link>, a fast pace was set from the opening gun. A fast early pace in a horse race does one very specific thing: it burns through the energy reserves of every horse that matches it. The favorites&apos; trainers all saw the same fast pace developing. None of them, apparently, ran the question: if this pace holds, what happens to our horse in the final quarter mile?</p>

          <p>The trainer of Golden Tempo ran that question. The answer was: stay back, conserve, wait. When the leaders burned out at the end, Golden Tempo would have everything left that they had spent.</p>

          <p>That is not a surprising strategy in retrospect. It is obvious once you see it. But obvious in retrospect and obvious in advance are two entirely different things. The Mirror forces you to see it in advance, before the gun goes off and the pace takes over.</p>

          <h2>Why Smart People Skip the Obstacle</h2>

          <p>Here is what I see in readings, and it is consistent enough that I will say it plainly: people avoid the obstacle question because naming an obstacle feels like doubting the plan.</p>

          <p>If you have worked hard on something, if you are excited about it, if your partners and supporters are backing it, the last thing you want to do is sit down and list everything that can beat you. It feels like pessimism. It feels disloyal to your own effort.</p>

          <p>The favorites&apos; trainers were confident. Confidence is not a flaw. Their horses were talented. Talent is not a flaw. The flaw was mistaking confidence for thorough preparation. They thought past the question.</p>

          <p>The Mahjong Mirror does not ask you to doubt your plan. It asks you to stress-test it. There is a difference. Doubt says: this will probably fail. The Mirror says: let&apos;s find out exactly where this could fail, and decide in advance what we&apos;re going to do about it.</p>

          <h2>How to Run the Third Angle Right Now</h2>

          <p>You have a decision in front of you. Maybe it is a financial move. Maybe it is a career shift. Maybe it is a relationship situation you have been circling around without committing to a direction.</p>

          <p>Here is how to run the Third Angle:</p>

          <p><strong>Step 1: Name the plan clearly.</strong></p>

          <p>Write one sentence. Not a paragraph. One sentence that completes: &ldquo;My plan is to...&rdquo;</p>

          <p>If you cannot write that one sentence without qualifiers and hedges, the plan is not clear enough yet. The Mirror cannot reflect something that isn&apos;t solid.</p>

          <p><strong>Step 2: Name what this plan needs to be true.</strong></p>

          <p>List the conditions that have to hold for the plan to work. Not everything you hope for. The things the plan actually depends on.</p>

          <p>At the Derby: &ldquo;My horse can sustain this pace from the front and has enough in reserve for the final stretch.&rdquo; That was the assumption the favorites&apos; trainers were banking on. It was not tested.</p>

          <p><strong>Step 3: Ask which condition is most vulnerable.</strong></p>

          <p>Look at your list from Step 2. Pick the one condition that, if it changed, would collapse the plan most completely. That is your obstacle.</p>

          <p><strong>Step 4: Decide what you do if that condition fails.</strong></p>

          <p>Not whether it will fail. What you do if it does. This is the part people skip, because planning for failure feels like expecting failure. But it is the opposite. Planning for the failure of a condition means you are not surprised when the pace gets fast. You know what you are doing. You have already decided.</p>

          <p><strong>Step 5: Ask whether your plan should change given what the obstacle shows you.</strong></p>

          <p>Sometimes the answer is no. You see the obstacle, you name the contingency, and you proceed because the plan is still sound. Golden Tempo&apos;s trainer did not change horses because of the fast pace. He changed strategy.</p>

          <p>Sometimes the answer is yes. The obstacle reveals a flaw that goes deeper than a contingency plan can fix. That is also useful to know before you are standing in the final stretch watching your reserves run out.</p>

          <h2>The Year Makes This Urgent</h2>

          <p>In a slower year, an untested assumption might sit unexamined for months before it becomes a problem. The Fire Horse year does not offer that grace period.</p>

          <p>Things move fast in 2026. The pace is set fast from the start. The favorites who ran hard at the front of the year, the ones who committed to bold plans without naming their obstacle, are already finding out what the final stretch feels like when you have nothing left.</p>

          <p>This is not a year to skip the Third Angle. This is the year the Third Angle is the difference between the people who win and the people who shake their heads afterward and say: how did I miss that?</p>

          <p>In over 35 years of readings, the clients who hold up through volatile years are not the ones who have the best plans. They are the ones who know exactly what could go wrong and have already decided what they will do when it does.</p>

          <p>That is the Mirror discipline. And it is the most useful thing you can do with this week.</p>

          <p>If you want to work through this for a specific decision, the Mahjong Mirror book walks through all four angles in a form you can apply yourself: <Link href="/the-mahjong-mirror">The Mahjong Mirror</Link>.</p>

          <p>If you want to look at the tiles for your specific situation and what they show about the obstacle in front of you right now, a reading does that directly: <Link href="/readings">Book a reading</Link>.</p>

          <p>The trainer who wins is the one who asked the question everyone else was too confident to ask.</p>

          <hr />

          <h2>Frequently Asked Questions</h2>

          <FaqItem
            question="What is the Mahjong Mirror's Third Angle?"
            answer="The Third Angle of the Mahjong Mirror asks: what is opposing me? It looks at the specific obstacle already present in a plan that could prevent it from succeeding. Unlike general risk analysis, the Third Angle asks you to name the single most vulnerable condition in your plan and decide in advance what you will do if it fails."
          />
          <FaqItem
            question="What mistake did the favorites' trainers make at the 2026 Kentucky Derby?"
            answer="The favorites' trainers at the 2026 Kentucky Derby did not account for the effect of a fast early pace on their horses' energy reserves in the final stretch. When the pace proved to be faster than normal from the start, horses that ran hard at the front burned their reserves and faded. Golden Tempo, trained to conserve energy and attack late, won from dead last position at the three-quarter mark."
          />
          <FaqItem
            question="How do I apply the Mahjong Mirror to a decision I am making?"
            answer="The Mahjong Mirror Third Angle process has five steps: (1) Write the plan in one sentence. (2) List the conditions the plan depends on. (3) Find the most vulnerable condition. (4) Decide in advance what you do if that condition fails. (5) Determine whether the plan should change based on what the obstacle reveals."
          />
          <FaqItem
            question="What is the Mahjong Mirror?"
            answer="The Mahjong Mirror is a decision-making framework developed by Chinese astrology practitioner Bill Hajdu. It uses four angles of reflection to examine any significant decision from multiple perspectives. It is also the title of Bill's book, which teaches the framework for personal use without requiring a tile reading."
          />
          <FaqItem
            question="Why is the obstacle question especially important in the Fire Horse year?"
            answer="The Fire Horse year (2026) operates at a faster pace than ordinary years. Decisions made without examining obstacles fail more quickly, with less warning, and more dramatically. The year's energy does not provide a grace period for untested assumptions."
          />

          <nav className={styles.postNav}>
            <Link href="/blog/posts/kentucky-derby-fire-horse-year-2026" className={styles.navPrev}>
              &larr; I Went to the Kentucky Derby to See a Fire Horse Year in Action
            </Link>
            <span />
          </nav>

        </div>

        {/* ── Related Articles ── */}
        <div className={styles.relatedSection}>
          <h2>More Articles</h2>
          <div className={styles.relatedGrid}>
            <Link href="/blog/posts/kentucky-derby-fire-horse-year-2026" className={styles.relatedCard}>
              <div className={styles.relatedCardImage}>
                <Image
                  src="/images/blog/kentucky-derby-fire-horse-year-2026.webp"
                  alt="I Went to the Kentucky Derby to See a Fire Horse Year in Action"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <h3>I Went to the Kentucky Derby to See a Fire Horse Year in Action</h3>
              <span>May 11, 2026</span>
            </Link>
            <Link href="/blog/posts/the-decision-framework-for-career-crossroads" className={styles.relatedCard}>
              <div className={styles.relatedCardImage}>
                <Image
                  src="/images/blog/the-decision-framework-for-career-crossroads.webp"
                  alt="The Decision Framework for Career Crossroads"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <h3>The Decision Framework for Career Crossroads</h3>
              <span>Apr 22, 2026</span>
            </Link>
          </div>
        </div>

        {/* ── Post CTA ── */}
        <div className={styles.ctaSection}>
          <span className={styles.ctaOverline}>Stress-test the decision in front of you.</span>
          <h2>Book a Reading with Bill</h2>
          <p>Bring the plan you are about to commit to. Bill brings the tiles, and the obstacle question that the favorites at the Derby never asked.</p>
          <Link href="/readings#book" className="btn-primary" style={{ marginRight: 16 }}>Book a Reading</Link>
          <Link href="/the-mahjong-mirror" className="btn-secondary">Explore the Book</Link>
        </div>

      </main>

      <Footer />
    </>
  );
}
