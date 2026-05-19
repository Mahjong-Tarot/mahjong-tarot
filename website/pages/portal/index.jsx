import Head from 'next/head';
import PortalNav from '../../components/PortalNav';
import { requirePortalUser } from '../../lib/requirePortalUser';
import styles from '../../styles/Portal.module.css';

export async function getServerSideProps(ctx) {
  return requirePortalUser(ctx);
}

const ROLE_LABEL = {
  astrologer: 'Astrologer',
  admin: 'Operator',
};

export default function PortalHome({ profile }) {
  const firstName = profile?.name?.split(' ')[0];
  const greeting = firstName ? `Welcome back, ${firstName}` : 'Welcome to the portal';
  const roleLabel = ROLE_LABEL[profile?.role] || 'Portal';

  return (
    <>
      <Head>
        <title>Portal | Mahjong Tarot</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={styles.shell}>
        <PortalNav profile={profile} />

        <main className={styles.main}>
          <p className={styles.eyebrow}>{roleLabel} · Portal home</p>
          <h1 className={styles.h1}>{greeting}</h1>
          <p className={styles.lede}>
            Your upcoming clients, session notes, and reports will live here. We&apos;re
            wiring this up over the next few releases — each section will light up as it
            ships.
          </p>

          <div className={styles.grid}>
            <section className={styles.card}>
              <p className={styles.cardEyebrow}>Coming next</p>
              <h2 className={styles.cardTitle}>Upcoming clients</h2>
              <p className={styles.cardBody}>
                A two-week look-ahead of scheduled sessions, with prep notes and a
                subscription badge next to each name.
              </p>
            </section>

            <section className={styles.card}>
              <p className={styles.cardEyebrow}>Coming next</p>
              <h2 className={styles.cardTitle}>Clients</h2>
              <p className={styles.cardBody}>
                A searchable list of every client. Profile pages show birth info,
                session history, past reports, and subscription status.
              </p>
            </section>

            <section className={styles.card}>
              <p className={styles.cardEyebrow}>Coming next</p>
              <h2 className={styles.cardTitle}>Reports</h2>
              <p className={styles.cardBody}>
                After a session, pull in the transcript from your connected meeting
                source, generate a polished report, and email it to the client.
              </p>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
