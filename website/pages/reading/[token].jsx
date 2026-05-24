// Public reading page — accessed by the guest via the link in the
// email Bill sends. Token-only auth: anyone with the link can view.
// Server-side render so the HTML is delivered ready-to-read with no
// loading flash. noindex so this never ends up in search.

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const DATE_FMT = new Intl.DateTimeFormat('en-US', {
  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
});

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
    .select('id, full_name, scheduled_at, final_reading_html')
    .eq('public_token', token)
    .maybeSingle();

  if (error)   return { props: { error: 'Could not load reading.' } };
  if (!booking) return { notFound: true };
  if (!booking.final_reading_html) return { notFound: true };

  // Build absolute URL for OG tags and share buttons.
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host  = req.headers['x-forwarded-host']  || req.headers.host;
  const origin = process.env.NEXT_PUBLIC_SITE_URL || `${proto}://${host}`;

  return {
    props: {
      guestName:    booking.full_name || 'friend',
      scheduledAt:  booking.scheduled_at || null,
      readingHtml:  booking.final_reading_html,
      readingUrl:   `${origin}/reading/${token}`,
      ogImage:      `${origin}/images/hero.webp`,
    },
  };
}

export default function PublicReadingPage({ guestName, scheduledAt, readingHtml, readingUrl, ogImage, error }) {
  const [shareStatus, setShareStatus] = useState('');

  function flashStatus(msg) {
    setShareStatus(msg);
    setTimeout(() => setShareStatus(''), 2500);
  }

  function copyLink(msg = 'Link copied') {
    if (typeof navigator === 'undefined') return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(readingUrl).then(
        () => flashStatus(msg),
        () => flashStatus('Could not copy — long-press to copy the address bar.'),
      );
    }
  }

  function shareFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(readingUrl)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'width=600,height=520,noopener,noreferrer');
    }
  }

  async function shareInstagram() {
    // Instagram has no web share API. If the device's native share
    // sheet is available (most mobile browsers), use it — Instagram
    // will be one of the targets. Otherwise just copy the link.
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ url: readingUrl, title: 'My Mahjong Tarot reading' });
        return;
      } catch { /* user cancelled — fall through to copy */ }
    }
    copyLink('Link copied — paste it into your Instagram post or story.');
  }

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

          <section className="share" aria-label="Share this reading">
            <p className="shareLabel">Share this reading</p>
            <div className="shareButtons">
              <button type="button" onClick={shareFacebook} className="shareBtn shareBtn--fb" aria-label="Share to Facebook">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
                </svg>
                <span>Facebook</span>
              </button>
              <button type="button" onClick={shareInstagram} className="shareBtn shareBtn--ig" aria-label="Share to Instagram">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
                </svg>
                <span>Instagram</span>
              </button>
              <button type="button" onClick={() => copyLink('Link copied')} className="shareBtn shareBtn--copy" aria-label="Copy link">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span>Copy link</span>
              </button>
            </div>
            <p className="shareStatus" aria-live="polite">{shareStatus || ' '}</p>
          </section>
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
        .share {
          margin: 28px 0 0;
          padding-top: 22px;
          border-top: 1px solid #ece6da;
          text-align: center;
        }
        .shareLabel {
          margin: 0 0 12px;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #9a8f81;
        }
        .shareButtons {
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .shareBtn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 14px;
          border: 1px solid #d1c3a5;
          background: #ffffff;
          color: #2a2a2a;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .shareBtn:hover { background: #f7f3ec; border-color: #b8a585; }
        .shareBtn--fb svg   { color: #1877F2; }
        .shareBtn--ig svg   { color: #d62976; }
        .shareBtn--copy svg { color: #6b6258; }
        .shareStatus {
          margin: 12px 0 0;
          min-height: 18px;
          font-size: 12px;
          color: #2a8a48;
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
