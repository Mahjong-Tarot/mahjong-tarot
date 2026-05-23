import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import styles from '../../styles/Booking.module.css';

const TIERS = {
  30: { title: 'A focused look',  price: 49,  label: '30 min' },
  60: { title: 'The full mirror', price: 69,  label: '60 min' },
  90: { title: 'Deep counsel',    price: 129, label: '90 min' },
};

const STORAGE_KEY = 'mt:booking-draft:v1';

function readDraft() {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}
function writeDraft(d) {
  if (typeof window === 'undefined') return;
  try { window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {}
}

const DAY_FMT  = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
const TIME_FMT = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });

export default function BookingSchedule() {
  const router = useRouter();
  const [duration, setDuration] = useState(60);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const draft = readDraft();
    const q = parseInt(router.query.duration, 10);
    const effective = [30, 60, 90].includes(q) ? q : (draft.duration || 60);
    setDuration(effective);

    // If they haven't filled details yet, bounce back.
    if (!draft.email) {
      router.replace(`/book-a-reading/details?duration=${effective}`);
      return;
    }

    setLoading(true);
    fetch(`/api/bookings/slots?duration=${effective}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setSlots(json.slots || []);
      })
      .catch((err) => setError(err.message || 'Could not load slots.'))
      .finally(() => setLoading(false));
  }, [router, router.isReady, router.query.duration]);

  const tier = TIERS[duration] || TIERS[60];

  const grouped = useMemo(() => {
    const out = new Map();
    for (const s of slots) {
      const d = new Date(s.slot_start);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
      if (!out.has(key)) out.set(key, { date: d, label: DAY_FMT.format(d), items: [] });
      out.get(key).items.push(s);
    }
    return Array.from(out.values()).slice(0, 14); // up to 14 days
  }, [slots]);

  async function handleContinue() {
    if (!selectedId) { setError('Pick a time to continue.'); return; }
    setReserving(true);
    setError('');
    try {
      const r = await fetch('/api/bookings/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot_id: selectedId, duration }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || 'Could not hold that slot.');
      const draft = readDraft();
      writeDraft({
        ...draft,
        slot_id: json.slot.id,
        slot_start: json.slot.slot_start,
        hold_token: json.hold_token,
        held_until: json.held_until,
      });
      router.push(`/book-a-reading/pay?duration=${duration}`);
    } catch (err) {
      setError(err.message);
      setReserving(false);
    }
  }

  return (
    <>
      <SEO
        title="Schedule · Book a Private Reading | Mahjong Tarot"
        description="Pick a time for your private reading with Bill."
        path="/book-a-reading/schedule"
      />
      <Nav />

      <main className={styles.main}>
        <div className="container">

          <div className={styles.stepper}>
            <Link href={`/book-a-reading/details?duration=${duration}`} className={styles.back}>
              <span aria-hidden="true">←</span> Back to details
            </Link>
            <ol className={styles.steps}>
              <li><span className={styles.stepNum}>01</span><span className={styles.stepLabel}>Choose</span></li>
              <li><span className={styles.stepNum}>02</span><span className={styles.stepLabel}>Your details</span></li>
              <li className={styles.stepActive}><span className={styles.stepNum}>03</span><span className={styles.stepLabel}>Schedule</span></li>
              <li><span className={styles.stepNum}>04</span><span className={styles.stepLabel}>Pay</span></li>
            </ol>
          </div>

          <header className={styles.header}>
            <span className={styles.eyebrow}>Step 03 · Schedule</span>
            <h1 className={styles.title}>Pick a <em>time</em></h1>
            <p className={styles.lede}>
              Times shown in your local timezone. The slot is held for 10 minutes
              while you complete payment.
            </p>
          </header>

          <div className={styles.summaryMini}>
            <span>Private Reading · <b>{tier.label}</b> · {tier.title}</span>
            <b>${tier.price}</b>
          </div>

          <div className={styles.formCard}>
            {loading && <div className={styles.slotEmpty}>Loading available times…</div>}

            {!loading && grouped.length === 0 && (
              <div className={styles.slotEmpty}>
                No times available in the next 30 days.{' '}
                <Link href="/contact">Send Bill a note</Link> and he&apos;ll open more.
              </div>
            )}

            {!loading && grouped.map((day) => (
              <div key={day.label} className={styles.slotsDayGroup}>
                <div className={styles.slotsDayHeader}>{day.label}</div>
                <div className={styles.slotsRow}>
                  {day.items.map((s) => {
                    const isSelected = s.id === selectedId;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedId(s.id)}
                        className={`${styles.slotChip} ${isSelected ? styles.slotChipSelected : ''}`}
                        aria-pressed={isSelected}
                      >
                        {TIME_FMT.format(new Date(s.slot_start))}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {error && <div className={styles.formError}>{error}</div>}

            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedId || reserving}
              className={styles.submitBtn}
            >
              {reserving ? 'Reserving your slot…' : <>Continue to payment <span aria-hidden="true">→</span></>}
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
