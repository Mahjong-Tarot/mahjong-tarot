import Link from 'next/link';
import Head from 'next/head';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

// Sign-in and confirm-email links sent from the iPhone app point here. With
// the app installed, iOS opens the app instead (Universal Links). This page
// only shows when the link is opened in a browser.
export default function AppAuthCallback() {
  return (
    <>
      <Head>
        <title>Open in the app | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <main className="containerNarrow page-section">
        <span className="overline">The Mahjong Tarot app</span>
        <h1>Open this link on your <em>iPhone</em></h1>
        <p>This sign-in link was made for the Mahjong Tarot iPhone app. Open the email on the iPhone where you asked for it, with the app installed.</p>
        <p>On a computer? <Link href="/sign-in">Sign in on the website</Link> instead.</p>
      </main>
      <Footer />
    </>
  );
}
