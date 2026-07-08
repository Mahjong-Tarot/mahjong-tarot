// Public Quick Reading page — reached via the share link the astrologer
// copies from the Quick Reading drawer. Token-only auth: anyone with the
// link can view. The stored HTML is a complete document, so it renders
// full-viewport in a sandboxed iframe. noindex so it never gets crawled.

import Head from 'next/head';
import { createClient } from '@supabase/supabase-js';

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

  const { data: reading, error } = await svc
    .from('readings')
    .select('person1_name, html')
    .eq('public_token', token)
    .maybeSingle();

  if (error) return { props: { error: 'Could not load reading.' } };
  if (!reading?.html) return { notFound: true };

  return { props: { name: reading.person1_name || null, html: reading.html } };
}

export default function PublicQuickReading({ name, html, error }) {
  if (error) {
    return <p style={{ padding: '3rem 1rem', textAlign: 'center' }}>{error}</p>;
  }
  return (
    <>
      <Head>
        <title>{`Reading${name ? ` for ${name}` : ''} | Mahjong Tarot`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <iframe
        srcDoc={html}
        title={`Reading${name ? ` for ${name}` : ''}`}
        sandbox="allow-scripts"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 0, background: '#f7f3ec' }}
      />
    </>
  );
}
