import Head from 'next/head';
import { SignIn } from '@clerk/nextjs';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import styles from '../../styles/Account.module.css';

export default function SignInPage() {
  return (
    <>
      <Head>
        <title>Sign In | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <main className={`container ${styles.authCenter}`}>
        <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
      </main>
      <Footer />
    </>
  );
}
