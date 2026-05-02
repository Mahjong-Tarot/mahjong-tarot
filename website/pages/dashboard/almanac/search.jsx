import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import AlmanacSearch from '../../../components/AlmanacSearch';
import { useAuth } from '../../../lib/auth';

export default function AlmanacSearchPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace('/sign-in');
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <>
      <Head>
        <title>Find a Good Day | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <main>
        <section style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-3xl)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
            <span className="overline">Almanac Search</span>
            <h1 style={{ marginTop: 'var(--space-xs)' }}>Find a Good Day To…</h1>
            <p style={{
              marginTop: 'var(--space-sm)',
              color: 'var(--color-text-muted, #777)',
              fontSize: '0.95rem',
              maxWidth: 520,
              margin: 'var(--space-sm) auto 0',
            }}>
              Search auspicious dates for any activity, wedding, move, business launch, and more.
            </p>
          </div>

          <AlmanacSearch
            buildResultHref={(date) => `/dashboard/almanac/${date}`}
            backHref="/dashboard/almanac"
            backLabel="← Back to Today’s Almanac"
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
