import Head from 'next/head';
import { SignUp } from '@clerk/nextjs';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import styles from '../../styles/Account.module.css';

export default function SignUpPage() {
  return (
    <>
      <Head>
        <title>Sign Up | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <main className={`container ${styles.authCenter}`}>
        <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
      </main>
      <Footer />
    </>
  );
}
