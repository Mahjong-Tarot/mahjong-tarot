import Head from 'next/head';
import { UserProfile } from '@clerk/nextjs';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import styles from '../../styles/Account.module.css';

export default function ProfilePage() {
  return (
    <>
      <Head>
        <title>Profile | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <main className={`container ${styles.authCenter}`}>
        <UserProfile routing="hash" />
      </main>
      <Footer />
    </>
  );
}
