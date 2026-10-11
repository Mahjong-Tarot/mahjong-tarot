import { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminShell from '../../../components/AdminShell';
import { requirePage, serverSupabase } from '../../../lib/guards';
import adminStyles from '../../../styles/PortalAdmin.module.css';
import styles from '../../../styles/PortalPrivateReadings.module.css';

export async function getServerSideProps(ctx) {
  const guard = await requirePage('staff')(ctx);
  if (!guard.props) return guard; // unauthenticated / wrong role → redirect

  // Load the bookings server-side (RLS-scoped by the request's session) so
  // the list ships with the HTML — no post-hydration fetch or spinner.
  const supabase = serverSupabase(ctx);
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, full_name, scheduled_at, duration_minutes, status, question, is_relationship, partner_name, created_at')
    .order('scheduled_at', { ascending: false, nullsFirst: false })
    .limit(200);

  return {
    props: {
      ...guard.props,
      bookings: bookings ?? [],
      bookingsError: error?.message ?? null,
    },
  };
}

const STATUS_LABEL = {
  pending_payment: 'Pending payment',
  paid:            'Paid',
  scheduled:       'Scheduled',
  completed:       'Completed',
  cancelled:       'Cancelled',
  refunded:        'Refunded',
};

// Friendly, low-jargon time: "Today at 3:30 PM", "Tomorrow at 10:00 AM",
// "Tue, Jun 3 at 2:00 PM". Built for a quick glance, not precision.
function friendlyWhen(value) {
  if (!value) return 'Time to be scheduled';
  const d = new Date(value);
  const now = new Date();
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (sameDay(d, now)) return `Today at ${time}`;
  if (sameDay(d, tomorrow)) return `Tomorrow at ${time}`;
  const day = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  return `${day} at ${time}`;
}

export default function PrivateReadingsListPage({ profile, bookings, bookingsError }) {
  const [tab, setTab] = useState('upcoming');
  const rows  = bookings ?? [];
  const error = bookingsError ?? '';

  const now = Date.now();
  const { upcoming, past } = useMemo(() => {
    const u = [];
    const p = [];
    for (const r of rows) {
      const t = r.scheduled_at ? new Date(r.scheduled_at).getTime() : null;
      const isPast =
        r.status === 'completed' ||
        r.status === 'cancelled' ||
        r.status === 'refunded' ||
        (t !== null && t < now);
      (isPast ? p : u).push(r);
    }
    u.sort((a, b) => new Date(a.scheduled_at || 0) - new Date(b.scheduled_at || 0));
    return { upcoming: u, past: p };
  }, [rows, now]);

  const next         = upcoming[0] || null;
  const restUpcoming = upcoming.slice(1);
  const list         = tab === 'upcoming' ? restUpcoming : past;

  const isAstro = profile?.role === 'astrologer';
  const heading = isAstro ? 'My Consultations' : 'Private readings';

  return (
    <>
      <Head>
        <title>{heading} | Mahjong Tarot</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminShell profile={profile}>
        <p className={adminStyles.pageEyebrow}>{isAstro ? 'Astrologer' : 'Admin'}</p>
        <h1 className={adminStyles.pageTitle}>{heading}</h1>

        {error && <p className="error-block">{error}</p>}

        {!error && (
          <>
            {next ? <NextConsultationCard booking={next} /> : <EmptyNext />}

            <div className={styles.listSection}>
              <div className={styles.listTabs}>
                <TabButton active={tab === 'upcoming'} onClick={() => setTab('upcoming')}>
                  Coming up ({restUpcoming.length})
                </TabButton>
                <TabButton active={tab === 'past'} onClick={() => setTab('past')}>
                  Past ({past.length})
                </TabButton>
              </div>

              {list.length === 0 ? (
                <p className={styles.listEmpty}>
                  {tab === 'upcoming'
                    ? 'Nothing else on the calendar.'
                    : 'No past consultations yet.'}
                </p>
              ) : (
                <div>
                  {list.map((b) => <ConsultRow key={b.id} booking={b} />)}
                </div>
              )}
            </div>
          </>
        )}
      </AdminShell>
    </>
  );
}

function NextConsultationCard({ booking }) {
  const meta = [
    booking.duration_minutes ? `${booking.duration_minutes}-minute reading` : null,
    booking.is_relationship
      ? `relationship reading${booking.partner_name ? ` with ${booking.partner_name}` : ''}`
      : null,
  ].filter(Boolean).join(' · ');

  return (
    <Link href={`/admin/private-readings/${booking.id}`} className={styles.cardLink}>
      <div className={styles.nextCard}>
        <p className={styles.nextEyebrow}>Your next consultation</p>
        <h2 className={styles.nextName}>{booking.full_name || 'Guest'}</h2>
        <p className={styles.nextWhen}>{friendlyWhen(booking.scheduled_at)}</p>
        {meta && <p className={styles.nextMeta}>{meta}</p>}
        {booking.question && (
          <p className={styles.nextQuestion}>“{booking.question}”</p>
        )}
        <span className={styles.nextCta}>Prepare for this consultation →</span>
      </div>
    </Link>
  );
}

function EmptyNext() {
  return (
    <div className={styles.nextCard}>
      <p className={styles.nextEyebrow}>Your next consultation</p>
      <p className={styles.nextWhenEmpty}>Nothing scheduled right now.</p>
      <p className={styles.nextMetaEmpty}>When a guest books, it will appear here.</p>
    </div>
  );
}

function ConsultRow({ booking }) {
  return (
    <Link href={`/admin/private-readings/${booking.id}`} className={styles.cardLink}>
      <div className={styles.row}>
        <div>
          <div className={styles.rowName}>{booking.full_name || 'Guest'}</div>
          <div className={styles.rowWhen}>
            {friendlyWhen(booking.scheduled_at)}
            {booking.duration_minutes ? ` · ${booking.duration_minutes} min` : ''}
          </div>
        </div>
        <div className={styles.rowSide}>
          <span className={styles.rowStatus}>{STATUS_LABEL[booking.status] || booking.status}</span>
          <span aria-hidden="true" className={styles.rowChevron}>›</span>
        </div>
      </div>
    </Link>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? styles.listTabActive : styles.listTab}
    >
      {children}
    </button>
  );
}
