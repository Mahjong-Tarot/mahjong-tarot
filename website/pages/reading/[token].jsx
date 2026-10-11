// Public reading page — accessed by the guest via the link in the
// email Bill sends. Token-only auth: anyone with the link can view.
// Server-side render so the HTML is delivered ready-to-read with no
// loading flash. noindex so this never ends up in search.

import Head from 'next/head';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { sanitizeReadingHtml } from '../../lib/sanitizeHtml';
import { siteOrigin } from '../../lib/siteOrigin';
import styles from '../../styles/Reading.module.css';

const DATE_FMT = new Intl.DateTimeFormat('en-US', {
  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
});

const CONTACT_EMAIL = 'firepig@onlinechineseastrology.com';

export async function getServerSideProps({ params }) {
  const token = String(params?.token || '').trim();
  if (!token) return { notFound: true };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return { props: { error: 'Server not configured.' } };
  }

  const svc = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: booking, error } = await svc
    .from('bookings')
    .select('id, full_name, email, scheduled_at, final_reading_html')
    .eq('public_token', token)
    .maybeSingle();

  if (error)   return { props: { error: 'Could not load reading.' } };
  if (!booking) return { notFound: true };
  if (!booking.final_reading_html) return { notFound: true };

  // Absolute URL for OG tags; never from request headers (lib/siteOrigin.js).
  const origin = siteOrigin();

  // Look up the guest's purchase state so we render the right upsell.
  // Best-effort — if any of these fail we silently default to the cold
  // offer rather than blocking the page.
  let hasPremium = false;
  let hasBook    = false;
  const guestEmail = (booking.email || '').trim().toLowerCase();
  if (guestEmail) {
    try {
      // book_orders is keyed by email + status='paid'.
      const { data: orders } = await svc
        .from('book_orders')
        .select('id')
        .ilike('email', guestEmail)
        .eq('status', 'paid')
        .limit(1);
      hasBook = !!orders?.length;

      // member_subscriptions joins via auth.users.id — look that up first.
      const { data: authRows } = await svc
        .schema('auth')
        .from('users')
        .select('id')
        .eq('email', guestEmail)
        .limit(1);
      const userId = authRows?.[0]?.id;
      if (userId) {
        const { data: sub } = await svc
          .from('member_subscriptions')
          .select('status')
          .eq('user_id', userId)
          .maybeSingle();
        if (sub && ['active', 'trialing', 'past_due'].includes(sub.status)) {
          hasPremium = true;
        }
      }
    } catch {
      // swallow — upsell defaults to cold offer
    }
  }

  return {
    props: {
      guestName:    booking.full_name || 'friend',
      scheduledAt:  booking.scheduled_at || null,
      // Sanitized on read too: rows written before generate-reading
      // sanitized on write, and staff edits, still pass through here.
      readingHtml:  sanitizeReadingHtml(booking.final_reading_html),
      readingUrl:   `${origin}/reading/${token}`,
      ogImage:      `${origin}/images/hero.webp`,
      hasPremium,
      hasBook,
    },
  };
}

export default function PublicReadingPage({ guestName, scheduledAt, readingHtml, readingUrl, ogImage, hasPremium, hasBook, error }) {
  if (error) {
    return (
      <>
        <Head>
          <title>Reading | Mahjong Tarot</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <Nav />
        <main className={`containerNarrow ${styles.errorMain}`}>
          <p>{error}</p>
        </main>
        <Footer />
      </>
    );
  }

  const firstName = (guestName || '').trim().split(/\s+/)[0] || guestName;
  const callDateLine = scheduledAt
    ? `From your reading on ${DATE_FMT.format(new Date(scheduledAt))}`
    : null;

  return (
    <>
      <Head>
        <title>{`A reading for ${firstName} · Mahjong Tarot`}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:type"        content="article" />
        <meta property="og:title"       content={`A Mahjong Tarot reading for ${firstName}`} />
        <meta property="og:description" content="A personal reading from Bill Hajdu at Mahjong Tarot." />
        <meta property="og:url"         content={readingUrl} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content={`A Mahjong Tarot reading for ${firstName}`} />
        <meta name="twitter:description" content="A personal reading from Bill Hajdu at Mahjong Tarot." />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
      </Head>

      <Nav />

      <main className={styles.readingPage}>
        <article className={styles.letter}>
          <header className={styles.letterHeader}>
            <p className={styles.eyebrow}>A reading for</p>
            <h1 className={styles.title}>{firstName}</h1>
            {callDateLine && <p className={styles.dateline}>{callDateLine}</p>}
          </header>

          <div className={styles.reading} dangerouslySetInnerHTML={{ __html: readingHtml }} />

          <div className={styles.signoff}>
            <p>With warmth,</p>
            <p className={styles.signature}>Bill</p>
          </div>

          <UpsellPS hasPremium={hasPremium} hasBook={hasBook} />

          <footer className={styles.letterFooter}>
            <p className={styles.contact}>
              Got questions? Send us a note at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
          </footer>

        </article>
      </main>

      <Footer />

    </>
  );
}

function UpsellPS({ hasPremium, hasBook }) {
  // Three states, each a P.S. in Bill's voice. Subscriber gets a warm
  // thank-you + re-book; book-buyer-no-premium gets a focused Inner
  // Circle upsell; cold gets the full stack.
  if (hasPremium) {
    return (
      <section className={styles.ps} aria-label="A note from Bill">
        <p className={styles.psLabel}>P.S.</p>
        <p className={styles.psBody}>
          Thank you for being in the Inner Circle. The fact that you&apos;re already
          showing up daily is the work, really. When you&apos;re ready for the next
          conversation, just say the word.
        </p>
        <div className={styles.psCtas}>
          <Link href="/book-a-reading" className={styles.psBtnPrimary}>Book another reading</Link>
        </div>
        <p className={styles.psSig}>— Bill</p>
      </section>
    );
  }

  if (hasBook) {
    return (
      <section className={styles.ps} aria-label="A note from Bill">
        <p className={styles.psLabel}>P.S.</p>
        <p className={styles.psBody}>
          You already have the book on the way, which is half the picture.
          The other half is the daily side — your horoscope, the almanac of
          lucky and unlucky activities for the day, and your charts ready to
          look at every morning. That&apos;s what the Inner Circle is.
        </p>
        <p className={styles.psBody}>
          <strong>$49.50 for the year</strong>, locked in at Founders pricing
          (it goes to $99 in 2027). Cancel anytime. Your book stays yours
          either way.
        </p>
        <div className={styles.psCtas}>
          <Link href="/signup" className={styles.psBtnPrimary}>Add the Inner Circle — $49.50/yr</Link>
        </div>
        <p className={styles.psSig}>— Bill</p>
      </section>
    );
  }

  return (
    <section className={styles.ps} aria-label="A note from Bill">
      <p className={styles.psLabel}>P.S.</p>
      <p className={styles.psBody}>
        A few people have asked what&apos;s next. The honest answer: keep paying
        attention. If you want the daily version of what we did today, the
        <strong> Inner Circle</strong> is it — a Chinese-zodiac horoscope, an
        almanac of lucky and unlucky activities, and your own Bazi + Purple
        Star charts, in one place every morning.
      </p>
      <div className={styles.psStack}>
        <p className={styles.psStackTitle}>What&apos;s included <span className={styles.psStackPrice}>— $49.50/yr</span></p>
        <ul className={styles.psStackList}>
          <li><strong>The Mahjong Mirror</strong> — digital edition, included <em>($18.88 value)</em></li>
          <li><strong>Daily horoscope</strong> for your Chinese zodiac sign</li>
          <li><strong>Daily almanac</strong> — lucky &amp; unlucky activities for the day</li>
          <li><strong>Your Bazi &amp; Purple Star charts</strong>, computed and ready</li>
          <li><strong>Founders pricing locked in for life</strong> <em>(renews at $99 from 2027)</em></li>
        </ul>
        <p className={styles.psStackUrgency}>
          Founders pricing closes when the <strong>Year of the Fire Horse</strong> does — May 2026.
        </p>
      </div>
      <div className={styles.psCtas}>
        <Link href="/signup" className={styles.psBtnPrimary}>Join the Inner Circle — $49.50/yr</Link>
        <Link href="/the-mahjong-mirror/order?sku=digital" className={styles.psBtnSecondary}>I just want the book — $18.88</Link>
      </div>
      <p className={styles.psSig}>— Bill</p>
    </section>
  );
}
