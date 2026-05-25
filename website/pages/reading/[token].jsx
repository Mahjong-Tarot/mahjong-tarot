// Public reading page — accessed by the guest via the link in the
// email Bill sends. Token-only auth: anyone with the link can view.
// Server-side render so the HTML is delivered ready-to-read with no
// loading flash. noindex so this never ends up in search.

import Head from 'next/head';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

const DATE_FMT = new Intl.DateTimeFormat('en-US', {
  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
});

const CONTACT_EMAIL = 'firepig@onlinechineseastrology.com';

export async function getServerSideProps({ params, req }) {
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

  // Build absolute URL for OG tags.
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host  = req.headers['x-forwarded-host']  || req.headers.host;
  const origin = process.env.NEXT_PUBLIC_SITE_URL || `${proto}://${host}`;

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
      readingHtml:  booking.final_reading_html,
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
        <main className="containerNarrow" style={{ padding: '60px 16px', textAlign: 'center' }}>
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

      <main className="readingPage">
        <article className="letter">
          <header className="letterHeader">
            <p className="eyebrow">A reading for</p>
            <h1 className="title">{firstName}</h1>
            {callDateLine && <p className="dateline">{callDateLine}</p>}
          </header>

          <div className="reading" dangerouslySetInnerHTML={{ __html: readingHtml }} />

          <div className="signoff">
            <p>With warmth,</p>
            <p className="signature">Bill</p>
          </div>

          <UpsellPS hasPremium={hasPremium} hasBook={hasBook} />

          <footer className="letterFooter">
            <p className="contact">
              Got questions? Send us a note at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
          </footer>

        </article>
      </main>

      <Footer />

      <style jsx>{`
        .readingPage {
          padding: 32px 20px 56px;
          background: var(--paper);
        }
        .letter {
          max-width: 760px;
          margin: 0 auto;
          background: var(--paper-pure);
          border: 1px solid #ece6da;
          border-radius: 12px;
          padding: 44px 56px 36px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        @media (max-width: 640px) {
          .letter { padding: 26px 22px 26px; border-radius: 10px; }
        }
        .letterHeader {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 14px;
          margin: 0 0 24px;
        }
        .eyebrow {
          margin: 0 0 4px;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink-4);
        }
        .title {
          margin: 0 0 6px;
          font-family: var(--serif);
          font-size: 38px;
          line-height: 1.15;
          font-weight: 600;
          color: var(--ink);
        }
        @media (max-width: 640px) {
          .title { font-size: 30px; }
        }
        .dateline {
          margin: 0;
          font-size: 13px;
          color: var(--ink-3);
        }
        .reading :global(h2) {
          font-family: var(--serif);
          font-size: 24px;
          margin: 32px 0 12px;
          font-weight: 600;
          color: var(--ink);
        }
        .reading :global(h2):first-child { margin-top: 8px; }
        .reading :global(h3) {
          font-family: var(--serif);
          font-size: 18px;
          margin: 22px 0 10px;
          font-weight: 600;
          color: var(--ink);
        }
        .reading :global(p) {
          margin: 0 0 14px;
          line-height: 1.7;
          font-size: 16px;
          color: var(--ink-2);
        }
        .reading :global(ul),
        .reading :global(ol) {
          padding-left: 22px;
          margin: 0 0 16px;
        }
        .reading :global(li) {
          margin: 6px 0;
          line-height: 1.65;
          font-size: 16px;
          color: var(--ink-2);
        }
        .reading :global(blockquote) {
          border-left: 3px solid #d1c3a5;
          padding: 4px 0 4px 16px;
          margin: 16px 0;
          color: var(--ink-3);
          font-style: italic;
        }
        .reading :global(strong) { font-weight: 600; color: var(--ink); }
        .reading :global(em)     { font-style: italic; }
        .signoff {
          margin: 32px 0 0;
          padding-top: 22px;
          border-top: 1px solid #ece6da;
          font-size: 15px;
          color: var(--ink-2);
        }
        .signoff p { margin: 4px 0; }
        .signature {
          font-family: var(--serif);
          font-size: 20px;
          color: var(--ink);
        }
        .letterFooter {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 14px;
          margin: 30px 0 0;
          padding-top: 20px;
          border-top: 1px solid #ece6da;
        }
        .contact {
          margin: 0;
          font-size: 13px;
          color: var(--ink-3);
          min-width: 0;
        }
        .contact :global(a) {
          color: var(--ink-2);
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .contact :global(a:hover) { color: var(--ink); }
      `}</style>
    </>
  );
}

function UpsellPS({ hasPremium, hasBook }) {
  // Three states, each a P.S. in Bill's voice. Subscriber gets a warm
  // thank-you + re-book; book-buyer-no-premium gets a focused Inner
  // Circle upsell; cold gets the full stack.
  if (hasPremium) {
    return (
      <section className="ps ps--member" aria-label="A note from Bill">
        <p className="psLabel">P.S.</p>
        <p className="psBody">
          Thank you for being in the Inner Circle. The fact that you&apos;re already
          showing up daily is the work, really. When you&apos;re ready for the next
          conversation, just say the word.
        </p>
        <div className="psCtas">
          <Link href="/book-a-reading" className="psBtnPrimary">Book another reading</Link>
        </div>
        <p className="psSig">— Bill</p>
        <UpsellStyles />
      </section>
    );
  }

  if (hasBook) {
    return (
      <section className="ps ps--book" aria-label="A note from Bill">
        <p className="psLabel">P.S.</p>
        <p className="psBody">
          You already have the book on the way, which is half the picture.
          The other half is the daily side — your horoscope, the almanac of
          lucky and unlucky activities for the day, and your charts ready to
          look at every morning. That&apos;s what the Inner Circle is.
        </p>
        <p className="psBody">
          <strong>$49.50 for the year</strong>, locked in at Founders pricing
          (it goes to $99 in 2027). Cancel anytime. Your book stays yours
          either way.
        </p>
        <div className="psCtas">
          <Link href="/signup" className="psBtnPrimary">Add the Inner Circle — $49.50/yr</Link>
        </div>
        <p className="psSig">— Bill</p>
        <UpsellStyles />
      </section>
    );
  }

  return (
    <section className="ps ps--cold" aria-label="A note from Bill">
      <p className="psLabel">P.S.</p>
      <p className="psBody">
        A few people have asked what&apos;s next. The honest answer: keep paying
        attention. If you want the daily version of what we did today, the
        <strong> Inner Circle</strong> is it — a Chinese-zodiac horoscope, an
        almanac of lucky and unlucky activities, and your own Bazi + Purple
        Star charts, in one place every morning.
      </p>
      <div className="psStack">
        <p className="psStackTitle">What&apos;s included <span className="psStackPrice">— $49.50/yr</span></p>
        <ul className="psStackList">
          <li><strong>The Mahjong Mirror</strong> — digital edition, included <em>($18.88 value)</em></li>
          <li><strong>Daily horoscope</strong> for your Chinese zodiac sign</li>
          <li><strong>Daily almanac</strong> — lucky &amp; unlucky activities for the day</li>
          <li><strong>Your Bazi &amp; Purple Star charts</strong>, computed and ready</li>
          <li><strong>Founders pricing locked in for life</strong> <em>(renews at $99 from 2027)</em></li>
        </ul>
        <p className="psStackUrgency">
          Founders pricing closes when the <strong>Year of the Fire Horse</strong> does — May 2026.
        </p>
      </div>
      <div className="psCtas">
        <Link href="/signup" className="psBtnPrimary">Join the Inner Circle — $49.50/yr</Link>
        <Link href="/the-mahjong-mirror/order?sku=digital" className="psBtnSecondary">I just want the book — $18.88</Link>
      </div>
      <p className="psSig">— Bill</p>
      <UpsellStyles />
    </section>
  );
}

function UpsellStyles() {
  return (
    <style jsx>{`
      .ps {
        margin: 32px 0 0;
        padding: 24px 24px 22px;
        background: #faf6ef;
        border: 1px solid #ece6da;
        border-radius: 10px;
      }
      .psLabel {
        margin: 0 0 8px;
        font-family: var(--serif);
        font-size: 13px;
        letter-spacing: 0.04em;
        color: var(--ink-3);
      }
      .psBody {
        margin: 0 0 12px;
        font-size: 15px;
        line-height: 1.65;
        color: var(--ink-2);
      }
      .psBody :global(strong) { color: var(--ink); font-weight: 600; }
      .psStack {
        margin: 16px 0;
        padding: 16px 18px;
        background: var(--paper-pure);
        border: 1px solid #e3dccf;
        border-radius: 8px;
      }
      .psStackTitle {
        margin: 0 0 10px;
        font-family: var(--serif);
        font-size: 15px;
        font-weight: 600;
        color: var(--ink);
      }
      .psStackPrice {
        font-family: var(--sans);
        font-size: 13px;
        font-weight: 500;
        color: var(--ink-3);
      }
      .psStackList {
        margin: 0;
        padding: 0 0 0 18px;
        font-size: 14px;
        line-height: 1.6;
        color: var(--ink-2);
      }
      .psStackList li { margin: 4px 0; }
      .psStackList :global(strong) { color: var(--ink); font-weight: 600; }
      .psStackList :global(em) { font-style: normal; color: var(--ink-4); }
      .psStackUrgency {
        margin: 12px 0 0;
        font-size: 12px;
        color: var(--ink-3);
        font-style: italic;
      }
      .psStackUrgency :global(strong) { font-style: normal; color: var(--ink-2); font-weight: 600; }
      .psCtas {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin: 16px 0 12px;
      }
      .psBtnPrimary {
        display: inline-block;
        padding: 12px 22px;
        background: var(--ink);
        color: var(--paper-pure);
        border-radius: 6px;
        text-decoration: none;
        font-family: var(--sans);
        font-size: 14px;
        font-weight: 500;
        transition: opacity 0.15s ease;
      }
      .psBtnPrimary:hover { opacity: 0.9; }
      .psBtnSecondary {
        display: inline-block;
        padding: 12px 22px;
        background: var(--paper-pure);
        color: var(--ink-2);
        border: 1px solid #d1c3a5;
        border-radius: 6px;
        text-decoration: none;
        font-family: var(--sans);
        font-size: 14px;
        font-weight: 500;
        transition: background 0.15s ease;
      }
      .psBtnSecondary:hover { background: #f7f3ec; }
      .psSig {
        margin: 0;
        font-family: var(--serif);
        font-size: 14px;
        color: var(--ink-3);
      }
    `}</style>
  );
}

