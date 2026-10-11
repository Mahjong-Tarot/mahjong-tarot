import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import MemberShell from '../../../../components/MemberShell';
import Footer from '../../../../components/Footer';
import AlmanacSearch from '../../../../components/AlmanacSearch';
import { useAuth } from '../../../../lib/auth';

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
      <MemberShell>
      <main>
        <section className="page-section">
          <div className="page-intro">
            <span className="overline">Almanac Search</span>
            <h1>Find a Good Day To…</h1>
            <p className="page-intro-lede">
              Search auspicious dates for any activity, wedding, move, business launch, and more.
            </p>
          </div>

          <AlmanacSearch
            buildResultHref={(date) => `/member/dashboard/almanac/${date}`}
            backHref="/member/dashboard/almanac"
            backLabel="← Back to Today’s Almanac"
          />
        </section>
      </main>
      <Footer />
      </MemberShell>
    </>
  );
}
