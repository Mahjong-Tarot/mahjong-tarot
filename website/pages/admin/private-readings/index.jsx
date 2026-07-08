import { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminShell from '../../../components/AdminShell';
import { requirePage, serverSupabase } from '../../../lib/guards';
import adminStyles from '../../../styles/PortalAdmin.module.css';

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

            <div style={{ marginTop: 40 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                <TabButton active={tab === 'upcoming'} onClick={() => setTab('upcoming')}>
                  Coming up ({restUpcoming.length})
                </TabButton>
                <TabButton active={tab === 'past'} onClick={() => setTab('past')}>
                  Past ({past.length})
                </TabButton>
              </div>

              {list.length === 0 ? (
                <p style={{ fontSize: 16, color: '#6b7280', padding: '8px 2px' }}>
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
    <Link
      href={`/admin/private-readings/${booking.id}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <div style={{ background: '#fffaf3', border: '1px solid #f0e0c8', borderRadius: 14, padding: '28px 30px' }}>
        <p style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 13, color: '#9a7b3f', fontWeight: 600, margin: 0 }}>
          Your next consultation
        </p>
        <h2 style={{ fontSize: 32, fontWeight: 700, margin: '8px 0 6px', color: '#1a1a1a', lineHeight: 1.15 }}>
          {booking.full_name || 'Guest'}
        </h2>
        <p style={{ fontSize: 21, color: '#1a1a1a', margin: '0 0 4px', fontWeight: 500 }}>
          {friendlyWhen(booking.scheduled_at)}
        </p>
        {meta && <p style={{ fontSize: 15, color: '#6b7280', margin: 0 }}>{meta}</p>}
        {booking.question && (
          <p style={{ fontSize: 17, lineHeight: 1.5, color: '#1a1a1a', margin: '18px 0 0', fontStyle: 'italic' }}>
            “{booking.question}”
          </p>
        )}
        <span style={{ display: 'inline-block', marginTop: 24, background: '#1a1a1a', color: '#fff', padding: '14px 26px', borderRadius: 10, fontSize: 17, fontWeight: 600 }}>
          Prepare for this consultation →
        </span>
      </div>
    </Link>
  );
}

function EmptyNext() {
  return (
    <div style={{ background: '#fffaf3', border: '1px solid #f0e0c8', borderRadius: 14, padding: '28px 30px' }}>
      <p style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 13, color: '#9a7b3f', fontWeight: 600, margin: 0 }}>
        Your next consultation
      </p>
      <p style={{ fontSize: 21, color: '#1a1a1a', margin: '10px 0 0', fontWeight: 500 }}>
        Nothing scheduled right now.
      </p>
      <p style={{ fontSize: 15, color: '#6b7280', margin: '4px 0 0' }}>
        When a guest books, it will appear here.
      </p>
    </div>
  );
}

function ConsultRow({ booking }) {
  return (
    <Link
      href={`/admin/private-readings/${booking.id}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '18px 20px', border: '1px solid #e5e7eb', borderRadius: 10, marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a' }}>
            {booking.full_name || 'Guest'}
          </div>
          <div style={{ fontSize: 15, color: '#6b7280', marginTop: 2 }}>
            {friendlyWhen(booking.scheduled_at)}
            {booking.duration_minutes ? ` · ${booking.duration_minutes} min` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <span style={{ fontSize: 13, color: '#6b7280' }}>{STATUS_LABEL[booking.status] || booking.status}</span>
          <span aria-hidden="true" style={{ fontSize: 22, color: '#9ca3af' }}>›</span>
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
      style={{
        padding: '10px 18px',
        borderRadius: 999,
        border: '1px solid ' + (active ? '#1a1a1a' : '#d1d5db'),
        background: active ? '#1a1a1a' : '#fff',
        color: active ? '#fff' : '#1a1a1a',
        fontSize: 15,
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}
