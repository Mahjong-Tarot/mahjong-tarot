// Public reading page — accessed by the guest via the link in the
// email Bill sends. Token-only auth: anyone with the link can view.
// Server-side render so the HTML is delivered ready-to-read with no
// loading flash. noindex so this never ends up in search.

import { useState } from 'react';
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
    // Instagram has no web share API. Try navigator.share() (mobile
    // gets the system share sheet with IG as a target); otherwise
    // copy with a "paste into Instagram" hint.
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
            <div className="letterTitleBlock">
              <p className="eyebrow">A reading for</p>
              <h1 className="title">{firstName}</h1>
              {callDateLine && <p className="dateline">{callDateLine}</p>}
            </div>
            <ShareBar
              onFb={shareFacebook}
              onIg={shareInstagram}
              onCopy={() => copyLink('Link copied')}
              position="top"
            />
          </header>

          <div className="reading" dangerouslySetInnerHTML={{ __html: readingHtml }} />

          <div className="signoff">
            <p>With warmth,</p>
            <p className="signature">Bill</p>
          </div>

          <footer className="letterFooter">
            <p className="contact">
              Got questions? Send us a note at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
            <ShareBar
              onFb={shareFacebook}
              onIg={shareInstagram}
              onCopy={() => copyLink('Link copied')}
              position="bottom"
            />
          </footer>

          <p className="shareStatus" aria-live="polite">{shareStatus || ' '}</p>
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
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin: 0 0 24px;
        }
        @media (max-width: 640px) {
          .letterHeader { flex-direction: column; align-items: stretch; }
        }
        .letterTitleBlock { flex: 1; min-width: 0; }
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
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin: 30px 0 0;
          padding-top: 20px;
          border-top: 1px solid #ece6da;
        }
        @media (max-width: 640px) {
          .letterFooter { flex-direction: column; align-items: stretch; gap: 16px; }
        }
        .contact {
          margin: 0;
          font-size: 13px;
          color: var(--ink-3);
          flex: 1;
          min-width: 0;
        }
        .contact :global(a) {
          color: var(--ink-2);
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .contact :global(a:hover) { color: var(--ink); }
        .shareStatus {
          margin: 14px 0 0;
          min-height: 18px;
          text-align: right;
          font-size: 12px;
          color: #2a8a48;
        }
      `}</style>
    </>
  );
}

function ShareBar({ onFb, onIg, onCopy, position }) {
  return (
    <div className={`shareBar shareBar--${position}`} role="group" aria-label="Share this reading">
      <button type="button" onClick={onFb} className="shareBtn shareBtn--fb" aria-label="Share to Facebook" title="Share to Facebook">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
        </svg>
        <span>Facebook</span>
      </button>
      <button type="button" onClick={onIg} className="shareBtn shareBtn--ig" aria-label="Share to Instagram" title="Share to Instagram">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
        </svg>
        <span>Instagram</span>
      </button>
      <button type="button" onClick={onCopy} className="shareBtn shareBtn--copy" aria-label="Copy link" title="Copy link">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <span>Copy link</span>
      </button>

      <style jsx>{`
        .shareBar {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
        }
        @media (min-width: 641px) {
          .shareBar--top    { justify-content: flex-end; margin-top: 4px; }
          .shareBar--bottom { justify-content: flex-end; }
        }
        @media (max-width: 640px) {
          .shareBar { justify-content: flex-end; flex-wrap: wrap; }
        }
        .shareBtn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 12px;
          border: 1px solid #e3dccf;
          background: var(--paper-pure);
          color: var(--ink-2);
          border-radius: 6px;
          font-family: var(--sans);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .shareBtn:hover { background: #faf6ef; border-color: #c8b893; }
        .shareBtn--fb svg   { color: #1877F2; }
        .shareBtn--ig svg   { color: #d62976; }
        .shareBtn--copy svg { color: var(--ink-3); }
      `}</style>
    </div>
  );
}
