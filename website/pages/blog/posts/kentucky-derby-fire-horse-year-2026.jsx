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

export default function KentuckyDerbyFireHorseYear2026() {
  return (
    <>
      <Head>
        <title>Kentucky Derby 2026: Fire Horse Energy in Real Life | Mahjong Tarot</title>
        <meta name="description" content="Bill Hajdu was at the 2026 Kentucky Derby when Golden Tempo went from last to first in 30 seconds. What it reveals about Fire Horse year energy." />
        <meta property="og:title" content="I Went to the Kentucky Derby to See a Fire Horse Year in Action" />
        <meta property="og:description" content="Golden Tempo went from dead last to first in 30 seconds. Cherie DeVaux became the first woman trainer in 152 years to win. I was there, and the Fire Horse year put on a show." />
        <meta property="og:image" content="https://www.mahjongtarot.com/images/blog/kentucky-derby-fire-horse-year-2026.webp" />
        <meta property="og:site_name" content="The Mahjong Mirror" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://www.mahjongtarot.com/blog/posts/kentucky-derby-fire-horse-year-2026" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'Article',
                headline: 'I Went to the Kentucky Derby to See a Fire Horse Year in Action',
                author: { '@type': 'Person', name: 'Bill Hajdu' },
                datePublished: '2026-05-11',
                image: 'https://www.mahjongtarot.com/images/blog/kentucky-derby-fire-horse-year-2026.webp',
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
                    name: 'What happened at the 2026 Kentucky Derby?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'The 2026 Kentucky Derby was widely called the most astonishing race in the event’s 152-year history. Golden Tempo, a 23-to-1 long shot, went from dead last at the three-quarter mark to first place in roughly thirty seconds. Trainer Cherie DeVaux became the first woman to train a Kentucky Derby winner in 152 years. Jockey Jose Ortiz won both the Oaks on Friday and the Derby on Saturday, completing his Triple Crown. Third place went to a 70-to-1 horse named Ocelli who only entered the race when another horse was scratched at the gate.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'What is the Fire Horse year in Chinese astrology?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'The Fire Horse year (2026) is a rare cycle that comes once every sixty years, combining the Horse animal sign with the Fire element. It is known for fast, dramatic events: big highs and big disasters that often happen simultaneously. Things that would take years in an ordinary cycle happen in days or hours.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'What does the Kentucky Derby result mean for 2026?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'According to Chinese astrology practitioner Bill Hajdu, the Derby result illustrates the core pattern of the Fire Horse year: the favorites who chased a fast early pace burned out, while the patient, prepared long shot won. The lesson for 2026 is to avoid getting swept into the crowd’s pace and to have your strategy ready before the gun goes off.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Who is Bill Hajdu?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Bill Hajdu is a Chinese astrology and Mahjong tile reading practitioner with over 35 years of experience. He is the author of The Mahjong Mirror, a decision-making framework based on his reading practice.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'What was the trifecta payout at the 2026 Kentucky Derby?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'The $1 trifecta bet paid $11,250. It is estimated that about 15 people hit the winning combination. The high payout was driven by a 23-to-1 winner (Golden Tempo) and a 70-to-1 third-place finisher (Ocelli).',
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
          <h1>I Went to the Kentucky Derby to See a Fire Horse Year in Action</h1>
          <p className={styles.postMeta}>May 11, 2026 · Bill Hajdu · 7 min read</p>
        </header>

        <div className={styles.headerDivider}><hr /></div>

        <figure style={{ margin: '0 0 var(--space-2xl)' }}>
          <Image
            src="/images/blog/kentucky-derby-fire-horse-year-2026.webp"
            alt="Bill Hajdu (the Firepig) and his companion in lavender and purple Derby attire standing in front of the Churchill Downs entrance, with the Barbaro statue visible in the background"
            width={1200}
            height={630}
            priority
            style={{ width: '100%', height: 'auto' }}
          />
          <figcaption style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.04em', color: 'var(--ink-4)', marginTop: 'var(--space-sm)', textAlign: 'center' }}>
            Outside Churchill Downs, Derby Day 2026.
          </figcaption>
        </figure>

        <div className={styles.body}>

          <p>I went to Louisville because I wanted to see Fire Horse energy with my own eyes.</p>

          <p>In all my years of working with Chinese astrology, I have explained the Fire Horse year to clients through history, through readings, through the patterns I see in the tiles. The year comes once every sixty years. It is fast, loud, dramatic. Big highs and big disasters, often in the same afternoon. I have said this hundreds of times.</p>

          <p>I thought: if I can watch horses run, real horses, in a Fire Horse year, something will click that no amount of explanation can achieve.</p>

          <p>The race exceeded my expectations. And I was expecting a lot.</p>

          <h2>The Gun Goes Off</h2>

          <p>I&apos;m the Firepig. I have attended more events in my life than I can count. I have never quite experienced the moment of a Kentucky Derby start.</p>

          <p>The gun goes off, and twenty horses leave the gate at the same instant. There is no hesitation, no gradual build. One second they are still; the next, twenty animals are at full speed. Thousands of people screaming at once. The ground shaking. The whole infield in motion.</p>

          <p>That is what happens in a Fire Horse year. Things do not build gradually. The gun goes off, and the world shifts. The people who were ready for that moment move. The people who weren&apos;t stand there blinking.</p>

          <p>The 2026 Kentucky Derby was, according to multiple pundits afterward, one of the most astonishing races in 152 years of <a href="https://www.kentuckyderby.com/" target="_blank" rel="noopener noreferrer">Derby history</a>. Looking back now, that assessment feels correct. But I want to take you through it the way it happened, because the sequence matters.</p>

          <h2>The Favorites and the Fast Pace</h2>

          <p>This particular race was set at a faster pace than most Derbies. That fact is important.</p>

          <p>When the pace is fast, horses that go out hard at the beginning burn their reserves early. The favorites at any race are usually the ones with the most prior success, the most money behind them, the most confident owners on camera the morning of the race. And the most confident owners were very much on camera that morning. I watched them. <em>Go Commandant, going to be a great race, going to be our day.</em> You know the type.</p>

          <p>Out of the top three betting favorites, only one horse made the final top three. The horse that the pundits predicted to win the whole thing came in second. The others? The highest any of them finished was seventh place.</p>

          <p>The favorites got sucked into the fast pace. They ran hard from the front. And then, in the final stretch, they did not have enough left.</p>

          <p>In over 35 years of doing readings, I have watched this pattern play out in human decisions more times than I can count. Someone sees a fast pace. Everybody around them is moving, spending, committing, chasing. The crowd is running. And instead of sticking to their plan, they join the crowd. And the crowd leads them right into the wall.</p>

          <h2>The 23-to-1 Horse Who Wasn&apos;t Interviewed</h2>

          <p>The owner of Golden Tempo was not interviewed the morning of the Derby. I noticed that.</p>

          <p>All the favorites&apos; owners were talking. Golden Tempo&apos;s people were quiet. And then the race started, and at the three-quarter mark, Golden Tempo was dead last.</p>

          <p>Dead last. Every other horse ahead of him. If you had walked away from your seat at that moment to buy a drink, you would have missed the whole thing.</p>

          <p>In roughly thirty seconds, Golden Tempo went from last place to first. That is not a typo. One pundit described it this way:</p>

          <blockquote>
            The equine equivalent of a long-distance runner clocking a world-record sprint speed in the final one hundred meters of a marathon.
          </blockquote>

          <p>The horse was doing twenty-four-foot jumps in that final stretch. Think about what it takes to move eleven hundred pounds twenty-four feet through the air, repeatedly, for half a minute, after already running a mile. The power required is almost unimaginable.</p>

          <p>That is Fire Horse energy. That final burst of speed, everything held in reserve until the exact right moment, then released completely. Not wasted on the early pace. Not burned up competing with the crowd. Saved. And then spent all at once.</p>

          <p>The trainer had a plan. The owner was quiet the morning of the race because they were not performing confidence. They were executing strategy.</p>

          <h2>The Jockey Who Had Never Won Before</h2>

          <p>Jose Ortiz had ridden in six previous Kentucky Derbies. He had not won any of them. Six tries and nothing to show for it.</p>

          <p>This year, he won the Oaks on Friday. Then he came back on Saturday and won the Derby. Winning both races in two days, with two different owners and two different trainers, has only been accomplished about six times in 152 years of racing. Six times.</p>

          <p>And now, because he had previously won the Belmont and the Preakness, Jose Ortiz is a <a href="https://en.wikipedia.org/wiki/Triple_Crown_of_Thoroughbred_Racing" target="_blank" rel="noopener noreferrer">Triple Crown</a> jockey. All three major races, over the course of a career, checked off. He joins a group of roughly thirteen people in the history of the sport.</p>

          <p>This is the Fire Horse year. Not a year of gradual ascent. A year where someone who has tried six times and failed walks out of one weekend as a legend.</p>

          <p>He was not a rookie. He had the experience and the skill. He had shown up six times before without the result. And this year, this weekend, everything came together. The year rewards the people who have prepared and are ready when the moment arrives.</p>

          <h2>The 70-to-1 Horse Who Shouldn&apos;t Have Been There</h2>

          <p>The trifecta paid $11,250 on a one-dollar bet. About fifteen people won it. Millions lost.</p>

          <p>That payout happened partly because of Golden Tempo at 23-to-1. But it happened especially because the third-place horse was a 70-to-1 long shot named Ocelli.</p>

          <p>Ocelli almost did not run. In the final minutes before the horses entered the gate, one horse became agitated and had to be scratched. The spot opened. Ocelli was the replacement. He had never won a major race. By the rankings, he should not have been in the field at all. Seventy-to-one is the market&apos;s way of saying: <em>this horse is here as a formality.</em></p>

          <p>He finished third.</p>

          <p>A French jockey&apos;s disaster became Ocelli&apos;s opportunity. And Ocelli was ready for it.</p>

          <p>This is the part of the Fire Horse year that people overlook when they talk about luck. Yes, Ocelli got lucky. A slot opened that would not have opened otherwise. But luck is not sufficient. Ocelli had to be ready to run that race at that pace on that day. The opportunity arrived from someone else&apos;s misfortune. The readiness was entirely his own.</p>

          <h2>What This Means for the Rest of the Year</h2>

          <p>I rode home thinking about what I had just watched. The pundits were already calling it historic. Multiple network segments. Social media. The commentators going over the replay again and again.</p>

          <p>I was thinking: <em>yes. This is exactly what I have been describing to clients and readers all year.</em></p>

          <p>The <Link href="/blog">Fire Horse year</Link> is not a metaphor. It is a pattern. Things happen fast. The person who prepared quietly and ignored the crowd&apos;s early pace wins. The person who joined the fast start because everyone else was running, burns out in the stretch. The long shot who was ready when a door opened by accident finishes on the podium.</p>

          <p>And there are disasters, too, because in a Fire Horse year the disasters trump the gains. Millions of people lost money on those favorites. Owners who put months of work and enormous resources behind horses that finished seventh. That is the other half of the year. The wins are spectacular. The losses are also spectacular.</p>

          <p>Readiness is all. When the gun goes off, you take action. The year does not wait for you to feel ready. It does not warm up slowly. It goes off, and then it is already happening, and the question is whether you prepared for this moment or spent your energy running at the early pace with the crowd.</p>

          <p>Cherie DeVaux, the first woman trainer to win in 152 years of Derby history, did not arrive at that result by accident. She had a strategy, she kept it quiet, and she executed it. The year rewarded that.</p>

          <p>If you want to understand how the Fire Horse year&apos;s energy applies to your specific chart and the decisions you&apos;re making right now, <Link href="/readings">a personal reading is the clearest way to see it</Link>. Or, for the framework I use to read every chart, see <Link href="/the-mahjong-mirror">The Mahjong Mirror</Link>.</p>

          <p>The horse who wins is not always the favorite. This year especially.</p>

          <hr />

          <h2>Frequently Asked Questions</h2>

          <FaqItem
            question="What happened at the 2026 Kentucky Derby?"
            answer="The 2026 Kentucky Derby was widely called the most astonishing race in the event's 152-year history. Golden Tempo, a 23-to-1 long shot, went from dead last at the three-quarter mark to first place in roughly thirty seconds. Trainer Cherie DeVaux became the first woman to train a Kentucky Derby winner in 152 years. Jockey Jose Ortiz won both the Oaks on Friday and the Derby on Saturday, completing his Triple Crown. Third place went to a 70-to-1 horse named Ocelli who only entered the race when another horse was scratched at the gate."
          />
          <FaqItem
            question="What is the Fire Horse year in Chinese astrology?"
            answer="The Fire Horse year (2026) is a rare cycle that comes once every sixty years, combining the Horse animal sign with the Fire element. It is known for fast, dramatic events: big highs and big disasters that often happen simultaneously. Things that would take years in an ordinary cycle happen in days or hours."
          />
          <FaqItem
            question="What does the Kentucky Derby result mean for 2026?"
            answer="According to Chinese astrology practitioner Bill Hajdu, the Derby result illustrates the core pattern of the Fire Horse year: the favorites who chased a fast early pace burned out, while the patient, prepared long shot won. The lesson for 2026 is to avoid getting swept into the crowd's pace and to have your strategy ready before the gun goes off."
          />
          <FaqItem
            question="Who is Bill Hajdu?"
            answer="Bill Hajdu is a Chinese astrology and Mahjong tile reading practitioner with over 35 years of experience. He is the author of The Mahjong Mirror, a decision-making framework based on his reading practice."
          />
          <FaqItem
            question="What was the trifecta payout at the 2026 Kentucky Derby?"
            answer="The $1 trifecta bet paid $11,250. It is estimated that about 15 people hit the winning combination. The high payout was driven by a 23-to-1 winner (Golden Tempo) and a 70-to-1 third-place finisher (Ocelli)."
          />

          <nav className={styles.postNav}>
            <Link href="/blog/posts/opposites-attract-is-a-lie-fire-horse-love-2026" className={styles.navPrev}>
              &larr; &lsquo;Opposites Attract&rsquo; Is a Lie the Fire Horse Year Will Expose
            </Link>
            <span />
          </nav>

        </div>

        {/* ── Related Articles ── */}
        <div className={styles.relatedSection}>
          <h2>More Articles</h2>
          <div className={styles.relatedGrid}>
            <Link href="/blog/posts/opposites-attract-is-a-lie-fire-horse-love-2026" className={styles.relatedCard}>
              <div className={styles.relatedCardImage}>
                <Image
                  src="/images/blog/opposites-attract-is-a-lie-fire-horse-love-2026.webp"
                  alt="'Opposites Attract' Is a Lie the Fire Horse Year Will Expose"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <h3>&lsquo;Opposites Attract&rsquo; Is a Lie the Fire Horse Year Will Expose</h3>
              <span>May 4, 2026</span>
            </Link>
            <Link href="/blog/posts/fire-horse-will-blow-up-your-career" className={styles.relatedCard}>
              <div className={styles.relatedCardImage}>
                <Image
                  src="/images/blog/fire-horse-will-blow-up-your-career.webp"
                  alt="The Fire Horse Year Will Blow Up Your Career"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <h3>The Fire Horse Year Will Blow Up Your Career, One Way or Another</h3>
              <span>Apr 27, 2026</span>
            </Link>
          </div>
        </div>

        {/* ── Post CTA ── */}
        <div className={styles.ctaSection}>
          <span className={styles.ctaOverline}>Know What&apos;s Actually in the Tiles.</span>
          <h2>Book a Reading with Bill</h2>
          <p>Sit across the table from someone who&apos;s been holding the Mirror for nearly four decades. Bring your question about this year. Bill brings the tiles.</p>
          <Link href="/readings#book" className="btn-primary" style={{ marginRight: 16 }}>Book a Reading</Link>
          <Link href="/the-mahjong-mirror" className="btn-secondary">Explore the Book</Link>
        </div>

      </main>

      <Footer />
    </>
  );
}
