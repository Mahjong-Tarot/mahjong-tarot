// Public reading page — accessed by the guest via the link in the
// email Bill sends. Token-only auth: anyone with the link can view.
// Server-side render so the HTML is delivered ready-to-read with no
// loading flash. noindex so this never ends up in search.

import Head from 'next/head';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const DATE_FMT = new Intl.DateTimeFormat('en-US', {
  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
});

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
    .select('id, full_name, scheduled_at, final_reading_html')
    .eq('public_token', token)
    .maybeSingle();

  if (error)   return { props: { error: 'Could not load reading.' } };
  if (!booking) return { notFound: true };
  if (!booking.final_reading_html) return { notFound: true };

  return {
    props: {
      guestName:    booking.full_name || 'friend',
      scheduledAt:  booking.scheduled_at || null,
      readingHtml:  booking.final_reading_html,
    },
  };
}

export default function PublicReadingPage({ guestName, scheduledAt, readingHtml, error }) {
  if (error) {
    return (
      <>
        <Head>
          <title>Reading | Mahjong Tarot</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div style={{ padding: 40, textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
          <p>{error}</p>
        </div>
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
        <title>{`Your reading · Mahjong Tarot`}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page">
        <header className="brand">
          <Link href="/" className="brandMark">Mahjong Tarot</Link>
        </header>

        <main className="letter">
          <p className="eyebrow">A reading for</p>
          <h1 className="title">{firstName}</h1>
          {callDateLine && <p className="dateline">{callDateLine}</p>}

          <article className="reading" dangerouslySetInnerHTML={{ __html: readingHtml }} />

          <footer className="signoff">
            <p>With warmth,</p>
            <p className="signature">Bill</p>
          </footer>
        </main>

        <footer className="pageFooter">
          <p>
            This link is private to you. Reply to the email if you have
            questions, or <Link href="/readings">book another reading</Link>{' '}
            when you&apos;re ready.
          </p>
        </footer>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f7f3ec;
          padding: 24px 16px 60px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #1a1a1a;
        }
        .brand {
          max-width: 720px;
          margin: 0 auto 24px;
          text-align: center;
        }
        .brandMark {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 14px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #6b6258;
          text-decoration: none;
        }
        .letter {
          max-width: 720px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 10px;
          padding: 48px 56px 40px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        @media (max-width: 600px) {
          .letter { padding: 28px 22px 30px; }
        }
        .eyebrow {
          margin: 0 0 4px;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #9a8f81;
        }
        .title {
          margin: 0 0 6px;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 36px;
          font-weight: 600;
          color: #1a1a1a;
        }
        .dateline {
          margin: 0 0 28px;
          font-size: 13px;
          color: #6b6258;
        }
        .reading :global(h2) {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 22px;
          margin: 28px 0 12px;
          font-weight: 600;
          color: #1a1a1a;
        }
        .reading :global(h3) {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 17px;
          margin: 22px 0 10px;
          font-weight: 600;
          color: #1a1a1a;
        }
        .reading :global(p) {
          margin: 0 0 14px;
          line-height: 1.7;
          font-size: 16px;
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
        }
        .reading :global(blockquote) {
          border-left: 3px solid #d1c3a5;
          padding: 4px 0 4px 16px;
          margin: 16px 0;
          color: #6b6258;
          font-style: italic;
        }
        .reading :global(strong) { font-weight: 600; }
        .reading :global(em) { font-style: italic; }
        .signoff {
          margin: 32px 0 0;
          padding-top: 20px;
          border-top: 1px solid #ece6da;
          font-size: 15px;
          color: #2a2a2a;
        }
        .signoff p { margin: 4px 0; }
        .signature {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 18px;
        }
        .pageFooter {
          max-width: 720px;
          margin: 24px auto 0;
          text-align: center;
          font-size: 12px;
          color: #9a8f81;
        }
        .pageFooter :global(a) { color: #6b6258; }
      `}</style>
    </>
  );
}
