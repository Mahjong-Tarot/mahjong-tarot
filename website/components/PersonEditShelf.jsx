import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { LIFECYCLE_STAGES, formatDate } from '../lib/admin-people';
import tableStyles from '../styles/PortalAdminTable.module.css';

// ── Shelf primitives ────────────────────────────────────────────────
const shelfBackdrop = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 60,
};
const shelfPanel = {
  position: 'fixed', top: 0, right: 0, bottom: 0,
  width: 'min(440px, 92vw)', background: '#fff', boxShadow: '-12px 0 32px rgba(0,0,0,0.15)',
  padding: 20, overflowY: 'auto', zIndex: 61,
};
const shelfHeader = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #e5e7eb',
};
const shelfClose = {
  background: 'transparent', border: 'none', fontSize: 28, cursor: 'pointer',
  lineHeight: 1, color: '#6b7280', padding: '0 4px',
};
const shelfErr = {
  background: '#fef2f2', color: '#991b1b', padding: '8px 12px', borderRadius: 6,
  fontSize: 13, marginBottom: 12,
};
const fieldWrap = { marginBottom: 14 };
const fieldLabel = {
  display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em',
  color: '#6b7280', fontWeight: 500, marginBottom: 4,
};
const fieldInput = {
  display: 'block', width: '100%', padding: '8px 10px',
  border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, fontFamily: 'inherit',
  background: '#fff',
};
const fieldSaving = {
  display: 'inline-block', fontSize: 11, color: '#6b7280', marginLeft: 6,
};

// ── Tab strip ───────────────────────────────────────────────────────
const tabRow = {
  display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid #e5e7eb',
};
const tabBase = {
  background: 'transparent', border: 'none', padding: '8px 14px',
  fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', color: '#6b7280',
  borderBottom: '2px solid transparent', marginBottom: -1,
};
const tabActive = {
  ...tabBase, color: '#111827', fontWeight: 600, borderBottomColor: '#111827',
};

// ── Activity section primitives ─────────────────────────────────────
const sectionWrap   = { marginBottom: 22 };
const sectionTitle  = {
  fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em',
  color: '#6b7280', fontWeight: 600, marginBottom: 8,
};
const muted         = { fontSize: 13, color: '#9ca3af', fontStyle: 'italic' };
const errMuted      = { fontSize: 13, color: '#991b1b' };
const itemRow       = {
  display: 'flex', flexDirection: 'column', gap: 4,
  padding: '10px 0', borderTop: '1px solid #f1f5f9',
};
const itemMeta      = {
  display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
  fontSize: 13, color: '#374151',
};
const itemNote      = { fontSize: 12, color: '#6b7280' };
const itemLink      = { fontSize: 12, color: '#287BE8', textDecoration: 'none' };

function Field({ label, name, type = 'text', draft, setDraft, onSave, saving, readOnly = false }) {
  const initial = draft[name];
  return (
    <div style={fieldWrap}>
      <label style={fieldLabel}>{label}{saving && <span style={fieldSaving}>Saving…</span>}</label>
      <input
        type={type}
        readOnly={readOnly}
        value={draft[name] ?? ''}
        onChange={(e) => setDraft({ ...draft, [name]: e.target.value })}
        onBlur={() => !readOnly && draft[name] !== initial && onSave?.(name, draft[name])}
        style={{ ...fieldInput, background: readOnly ? '#f9fafb' : '#fff' }}
      />
    </div>
  );
}

function SelectField({ label, name, draft, setDraft, options, optionLabels, onSave, saving }) {
  const initial = draft[name];
  return (
    <div style={fieldWrap}>
      <label style={fieldLabel}>{label}{saving && <span style={fieldSaving}>Saving…</span>}</label>
      <select
        value={draft[name] ?? ''}
        onChange={(e) => {
          const next = e.target.value;
          setDraft({ ...draft, [name]: next });
          if (next !== initial) onSave?.(name, next);
        }}
        style={fieldInput}
      >
        {options.map((o) => <option key={o || '_blank'} value={o}>{(optionLabels && optionLabels[o]) || o}</option>)}
      </select>
    </div>
  );
}

function CheckField({ label, name, draft, setDraft, onSave, saving }) {
  return (
    <div style={{ ...fieldWrap, display: 'flex', alignItems: 'center', gap: 10 }}>
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
      <label htmlFor={`f-${name}`} style={{ ...fieldLabel, marginBottom: 0 }}>
        {label}{saving && <span style={fieldSaving}>Saving…</span>}
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
  if (!items.length) return <p style={muted}>No deals yet</p>;
  return (
    <div>
      {items.map((d) => {
        const isBookOrder = (d.notes || '').startsWith('Book order');
        const dateValue   = d.won_at || d.created_at;
        return (
          <div key={d.id} style={itemRow}>
            <div style={itemMeta}>
              <span>{formatDate(dateValue)}</span>
              <span>{formatMoney(d.amount_cents, d.currency)}</span>
              <span className={statusTagClass(d.status)}>{d.status}</span>
              {d.source && <span style={itemNote}>via {d.source}</span>}
            </div>
            {d.notes && (
              <p style={itemNote}>
                {d.notes.length > 90 ? `${d.notes.slice(0, 90)}…` : d.notes}
              </p>
            )}
            {d.booking_id && (
              <Link href={`/admin/private-readings/${d.booking_id}`} style={itemLink}>
                → Reading details
              </Link>
            )}
            {!d.booking_id && isBookOrder && (
              <span style={itemNote}>→ Book order</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function BookingsSection({ items }) {
  if (!items.length) return <p style={muted}>No private readings yet</p>;
  return (
    <div>
      {items.map((b) => (
        <div key={b.id} style={itemRow}>
          <div style={itemMeta}>
            <span>{b.scheduled_at ? formatDate(b.scheduled_at) : formatDate(b.created_at)}</span>
            <span>{b.duration_minutes} min</span>
            <span>{formatMoney(b.amount_cents, b.currency)}</span>
            <span className={statusTagClass(b.status)}>{b.status}</span>
          </div>
          <Link href={`/admin/private-readings/${b.id}`} style={itemLink}>
            → Booking details
          </Link>
        </div>
      ))}
    </div>
  );
}

function BookOrdersSection({ items }) {
  if (!items.length) return <p style={muted}>No book orders yet</p>;
  return (
    <div>
      {items.map((o) => (
        <div key={o.id} style={itemRow}>
          <div style={itemMeta}>
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
      <section style={sectionWrap}>
        <h3 style={sectionTitle}>Deals</h3>
        {deals.loading && <p style={muted}>Loading…</p>}
        {!deals.loading && deals.error && <p style={errMuted}>{deals.error}</p>}
        {!deals.loading && !deals.error && <DealsSection items={deals.items} />}
      </section>

      <section style={sectionWrap}>
        <h3 style={sectionTitle}>Private readings</h3>
        {bookings.loading && <p style={muted}>Loading…</p>}
        {!bookings.loading && bookings.error && <p style={errMuted}>{bookings.error}</p>}
        {!bookings.loading && !bookings.error && <BookingsSection items={bookings.items} />}
      </section>

      <section style={sectionWrap}>
        <h3 style={sectionTitle}>Book orders</h3>
        {bookOrders.loading && <p style={muted}>Loading…</p>}
        {!bookOrders.loading && bookOrders.error && <p style={errMuted}>{bookOrders.error}</p>}
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
      <div onClick={onClose} style={shelfBackdrop} />
      <aside style={shelfPanel} onClick={(e) => e.stopPropagation()}>
        <header style={shelfHeader}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            {draft.name || draft.email || 'Untitled person'}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" style={shelfClose}>×</button>
        </header>

        <div role="tablist" style={tabRow}>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'details'}
            style={tab === 'details' ? tabActive : tabBase}
            onClick={() => switchTab('details')}
          >
            Details
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'activity'}
            style={tab === 'activity' ? tabActive : tabBase}
            onClick={() => switchTab('activity')}
          >
            Activity
          </button>
        </div>

        {shelfError && tab === 'details' && <p style={shelfErr}>{shelfError}</p>}

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
          <div style={{ display: tab === 'activity' ? 'block' : 'none' }}>
            <ActivityTab personId={personId} personEmail={personEmail} />
          </div>
        )}
      </aside>
    </>
  );
}
