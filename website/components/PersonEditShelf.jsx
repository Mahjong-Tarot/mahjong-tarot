import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { LIFECYCLE_STAGES, formatDate } from '../lib/admin-people';
import tableStyles from '../styles/PortalAdminTable.module.css';
import shelf from './Shelf.module.css';

// Shelf layout and field styles live in Shelf.module.css (shared with
// SalesDetailDrawer).

function Field({ label, name, type = 'text', draft, setDraft, onSave, saving, readOnly = false }) {
  const initial = draft[name];
  return (
    <div className={shelf.field}>
      <label htmlFor={`f-${name}`} className={shelf.label}>{label}{saving && <span className={shelf.saving}>Saving…</span>}</label>
      <input
        id={`f-${name}`}
        type={type}
        readOnly={readOnly}
        value={draft[name] ?? ''}
        onChange={(e) => setDraft({ ...draft, [name]: e.target.value })}
        onBlur={() => !readOnly && draft[name] !== initial && onSave?.(name, draft[name])}
        className={shelf.input}
      />
    </div>
  );
}

function SelectField({ label, name, draft, setDraft, options, optionLabels, onSave, saving }) {
  const initial = draft[name];
  return (
    <div className={shelf.field}>
      <label htmlFor={`f-${name}`} className={shelf.label}>{label}{saving && <span className={shelf.saving}>Saving…</span>}</label>
      <select
        id={`f-${name}`}
        value={draft[name] ?? ''}
        onChange={(e) => {
          const next = e.target.value;
          setDraft({ ...draft, [name]: next });
          if (next !== initial) onSave?.(name, next);
        }}
        className={shelf.input}
      >
        {options.map((o) => <option key={o || '_blank'} value={o}>{(optionLabels && optionLabels[o]) || o}</option>)}
      </select>
    </div>
  );
}

function CheckField({ label, name, draft, setDraft, onSave, saving }) {
  return (
    <div className={`${shelf.field} ${shelf.fieldCheck}`}>
      <input
        id={`f-${name}`}
        type="checkbox"
        checked={!!draft[name]}
        onChange={(e) => {
          const next = e.target.checked;
          setDraft({ ...draft, [name]: next });
          onSave?.(name, next);
        }}
      />
      <label htmlFor={`f-${name}`} className={shelf.label}>
        {label}{saving && <span className={shelf.saving}>Saving…</span>}
      </label>
    </div>
  );
}

// ── Activity helpers ────────────────────────────────────────────────
function formatMoney(amount_cents, currency) {
  if (amount_cents == null) return '';
  const amount = (amount_cents / 100).toFixed(2);
  const cur    = (currency || 'usd').toUpperCase();
  return `${cur} ${amount}`;
}

function statusTagClass(status) {
  // Map deal/booking/order statuses to existing tag classes from
  // PortalAdminTable.module.css — no new CSS introduced.
  switch (status) {
    case 'won':
    case 'paid':
    case 'scheduled':
    case 'completed':
      return tableStyles.tagActive;
    case 'lost':
    case 'cancelled':
    case 'refunded':
      return tableStyles.tagLapsed;
    case 'open':
    case 'pending_payment':
      return tableStyles.tagLegacy;
    default:
      return tableStyles.tag;
  }
}

function DealsSection({ items }) {
  if (!items.length) return <p className={shelf.muted}>No deals yet</p>;
  return (
    <div>
      {items.map((d) => {
        const isBookOrder = (d.notes || '').startsWith('Book order');
        const dateValue   = d.won_at || d.created_at;
        return (
          <div key={d.id} className={shelf.itemRow}>
            <div className={shelf.itemMeta}>
              <span>{formatDate(dateValue)}</span>
              <span>{formatMoney(d.amount_cents, d.currency)}</span>
              <span className={statusTagClass(d.status)}>{d.status}</span>
              {d.source && <span className={shelf.itemNote}>via {d.source}</span>}
            </div>
            {d.notes && (
              <p className={shelf.itemNote}>
                {d.notes.length > 90 ? `${d.notes.slice(0, 90)}…` : d.notes}
              </p>
            )}
            {d.booking_id && (
              <Link href={`/admin/private-readings/${d.booking_id}`} className={shelf.itemLink}>
                → Reading details
              </Link>
            )}
            {!d.booking_id && isBookOrder && (
              <span className={shelf.itemNote}>→ Book order</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function BookingsSection({ items }) {
  if (!items.length) return <p className={shelf.muted}>No private readings yet</p>;
  return (
    <div>
      {items.map((b) => (
        <div key={b.id} className={shelf.itemRow}>
          <div className={shelf.itemMeta}>
            <span>{b.scheduled_at ? formatDate(b.scheduled_at) : formatDate(b.created_at)}</span>
            <span>{b.duration_minutes} min</span>
            <span>{formatMoney(b.amount_cents, b.currency)}</span>
            <span className={statusTagClass(b.status)}>{b.status}</span>
          </div>
          <Link href={`/admin/private-readings/${b.id}`} className={shelf.itemLink}>
            → Booking details
          </Link>
        </div>
      ))}
    </div>
  );
}

function BookOrdersSection({ items }) {
  if (!items.length) return <p className={shelf.muted}>No book orders yet</p>;
  return (
    <div>
      {items.map((o) => (
        <div key={o.id} className={shelf.itemRow}>
          <div className={shelf.itemMeta}>
            <span>{formatDate(o.created_at)}</span>
            <span>{o.sku}</span>
            <span>{formatMoney(o.amount_cents, o.currency)}</span>
            <span className={statusTagClass(o.status)}>{o.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityTab({ personId, personEmail }) {
  const [deals, setDeals]           = useState({ loading: true, error: '', items: [] });
  const [bookings, setBookings]     = useState({ loading: true, error: '', items: [] });
  const [bookOrders, setBookOrders] = useState({ loading: true, error: '', items: [] });

  useEffect(() => {
    let cancelled = false;
    if (!supabase) {
      const msg = 'Supabase not configured.';
      setDeals({ loading: false, error: msg, items: [] });
      setBookings({ loading: false, error: msg, items: [] });
      setBookOrders({ loading: false, error: msg, items: [] });
      return () => {};
    }

    setDeals({ loading: true, error: '', items: [] });
    setBookings({ loading: true, error: '', items: [] });
    setBookOrders({ loading: true, error: '', items: [] });

    // Deals — by person_id (always available)
    supabase
      .from('deals')
      .select('id, amount_cents, currency, status, source, won_at, created_at, booking_id, notes')
      .eq('person_id', personId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setDeals({ loading: false, error: error.message, items: [] });
        else       setDeals({ loading: false, error: '', items: data ?? [] });
      });

    // Bookings + book_orders — link by email (no person_id FK on those tables)
    if (personEmail) {
      supabase
        .from('bookings')
        .select('id, status, scheduled_at, duration_minutes, amount_cents, currency, created_at')
        .eq('email', personEmail)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (cancelled) return;
          if (error) setBookings({ loading: false, error: error.message, items: [] });
          else       setBookings({ loading: false, error: '', items: data ?? [] });
        });

      supabase
        .from('book_orders')
        .select('id, sku, status, amount_cents, currency, created_at')
        .eq('email', personEmail)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (cancelled) return;
          if (error) setBookOrders({ loading: false, error: error.message, items: [] });
          else       setBookOrders({ loading: false, error: '', items: data ?? [] });
        });
    } else {
      setBookings({ loading: false, error: '', items: [] });
      setBookOrders({ loading: false, error: '', items: [] });
    }

    return () => { cancelled = true; };
  }, [personId, personEmail]);

  return (
    <div>
      <section className={shelf.section}>
        <h3 className={shelf.sectionTitle}>Deals</h3>
        {deals.loading && <p className={shelf.muted}>Loading…</p>}
        {!deals.loading && deals.error && <p className={shelf.errMuted}>{deals.error}</p>}
        {!deals.loading && !deals.error && <DealsSection items={deals.items} />}
      </section>

      <section className={shelf.section}>
        <h3 className={shelf.sectionTitle}>Private readings</h3>
        {bookings.loading && <p className={shelf.muted}>Loading…</p>}
        {!bookings.loading && bookings.error && <p className={shelf.errMuted}>{bookings.error}</p>}
        {!bookings.loading && !bookings.error && <BookingsSection items={bookings.items} />}
      </section>

      <section className={shelf.section}>
        <h3 className={shelf.sectionTitle}>Book orders</h3>
        {bookOrders.loading && <p className={shelf.muted}>Loading…</p>}
        {!bookOrders.loading && bookOrders.error && <p className={shelf.errMuted}>{bookOrders.error}</p>}
        {!bookOrders.loading && !bookOrders.error && <BookOrdersSection items={bookOrders.items} />}
      </section>
    </div>
  );
}

export default function PersonEditShelf({
  personId, personEmail, draft, setDraft, savingField, shelfError, onSave, onClose,
}) {
  const [tab, setTab]                 = useState('details');
  const [activityLoaded, setLoaded]   = useState(false);

  function switchTab(next) {
    setTab(next);
    if (next === 'activity') setLoaded(true);
  }

  return (
    <>
      <div onClick={onClose} className={shelf.backdrop} />
      <aside className={shelf.panel} onClick={(e) => e.stopPropagation()}>
        <header className={shelf.header}>
          <h2 className={shelf.title}>
            {draft.name || draft.email || 'Untitled person'}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className={shelf.close}>×</button>
        </header>

        <div role="tablist" className={shelf.tabs}>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'details'}
            className={tab === 'details' ? `${shelf.tab} ${shelf.tabActive}` : shelf.tab}
            onClick={() => switchTab('details')}
          >
            Details
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'activity'}
            className={tab === 'activity' ? `${shelf.tab} ${shelf.tabActive}` : shelf.tab}
            onClick={() => switchTab('activity')}
          >
            Activity
          </button>
        </div>

        {shelfError && tab === 'details' && <p className={shelf.err}>{shelfError}</p>}

        {tab === 'details' && (
          <>
            <Field label="Name" name="name" draft={draft} setDraft={setDraft}
                   saving={savingField === 'name'} onSave={onSave} />
            <Field label="Email" name="email" draft={draft} setDraft={setDraft}
                   saving={savingField === 'email'} onSave={onSave} />
            <Field label="Phone" name="phone" draft={draft} setDraft={setDraft}
                   saving={savingField === 'phone'} onSave={onSave} />
            <Field label="Address" name="address" draft={draft} setDraft={setDraft}
                   saving={savingField === 'address'} onSave={onSave} />
            <Field label="Birthday" name="birthday" type="date" draft={draft} setDraft={setDraft}
                   saving={savingField === 'birthday'} onSave={onSave} />
            <Field label="Birth time" name="birth_time" type="time" draft={draft} setDraft={setDraft}
                   saving={savingField === 'birth_time'} onSave={onSave} />
            <Field label="Birth place" name="birth_place" draft={draft} setDraft={setDraft}
                   saving={savingField === 'birth_place'} onSave={onSave} />
            <SelectField label="Gender (needed for Purple Star chart)" name="gender" draft={draft} setDraft={setDraft}
                   options={['', 'F', 'M']} optionLabels={{'': '— not set —', F: 'Female', M: 'Male'}}
                   saving={savingField === 'gender'} onSave={onSave} />
            <Field label="Chinese sign" name="chinese_sign" draft={draft} setDraft={setDraft}
                   saving={savingField === 'chinese_sign'} onSave={onSave} />
            <Field label="Company" name="company" draft={draft} setDraft={setDraft}
                   saving={savingField === 'company'} onSave={onSave} />
            <Field label="Role" name="role" draft={draft} setDraft={setDraft}
                   saving={savingField === 'role'} onSave={onSave} />
            <SelectField label="Lifecycle stage" name="lifecycle_stage" draft={draft} setDraft={setDraft}
                   options={LIFECYCLE_STAGES} saving={savingField === 'lifecycle_stage'} onSave={onSave} />
            <Field label="Nurture stage" name="nurture_stage" type="number" draft={draft} setDraft={setDraft}
                   saving={savingField === 'nurture_stage'} onSave={onSave} />
            <Field label="Nurture status" name="nurture_status" draft={draft} setDraft={setDraft}
                   saving={savingField === 'nurture_status'} onSave={onSave} />
            <Field label="Membership status" name="membership_status" draft={draft} setDraft={setDraft}
                   saving={savingField === 'membership_status'} onSave={onSave} />
            <Field label="Source" name="source" draft={draft} setDraft={setDraft}
                   saving={savingField === 'source'} onSave={onSave} />
            <Field label="Source site" name="source_site" draft={draft} setDraft={setDraft}
                   saving={savingField === 'source_site'} onSave={onSave} />
            <CheckField label="OK to contact (newsletter / outreach)" name="ok_to_contact" draft={draft} setDraft={setDraft}
                   saving={savingField === 'ok_to_contact'} onSave={onSave} />
          </>
        )}

        {/* Mount ActivityTab only after the user clicks Activity at least once,
            then keep it mounted so its query results aren't thrown away on tab
            flips back. Refetch on personId change is handled by the effect. */}
        {activityLoaded && (
          <div className={tab === 'activity' ? undefined : shelf.hidden}>
            <ActivityTab personId={personId} personEmail={personEmail} />
          </div>
        )}
      </aside>
    </>
  );
}
