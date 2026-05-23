# Leads and People — relationship & lifecycle

Two tables, two purposes. One person can exist as both.

## Tables

- **`public.leads`** — mailing-list state. One row per email we may send to. Tracks nurture sequence (`stage`, `status`, `last_emailed_at`, `next_send_at`).
- **`public.people`** — CRM contact record. One row per known human. Tracks identity (`name`, `phone`, `birthday`, `address`, `chinese_sign`, `company`, `role`) and the master kill-switch (`ok_to_contact`).
- **`public.leads.person_id`** — nullable FK to `people.id`. When set, the lead has been "promoted" — we know more about this person than just an email.

```
leads.person_id = NULL  → lead-only (mailing list, no CRM record)
leads.person_id = uuid  → promoted; CRM record exists
```

## When a lead becomes a person

| Event | Promote? | Notes |
|---|---|---|
| Newsletter signup or legacy import | No | Stays a lead until they engage |
| Lead opens 3+ emails or clicks any link | Yes | Warm signal — create `people` row, set `leads.person_id` |
| Lead replies to a nurture email | Yes | Explicit signal |
| Lead fills out the contact form | Yes | Already handled by the contact flow |
| Lead books a reading or pays | Yes | Already handled by the booking flow |
| Lead unsubscribes | No | Mark `leads.status='unsubscribed'`; if linked, set `people.ok_to_contact=false` |

## When a person already exists but no lead does

If someone shows up via contact form / booking / direct payment without first being on a list, the existing flow already creates the `people` row. **Also create a `leads` row** with `source='contact'` (or similar) and `next_send_at=NULL` so they can be opted into nurture later without a second insert.

## Source-of-truth rules

| Field | Master | Notes |
|---|---|---|
| `email` | denormalized in both — must match | enforce on writes |
| `name`, `phone`, `birthday`, `address` | `people` | one-way sync: people → leads on update |
| `status` (active / unsub / completed / converted) | `leads` | local to the nurture sequence |
| `ok_to_contact` | `people` | **master kill-switch** — the nurture agent must check it before sending, regardless of `leads.status` |

## Implementation notes

- The nurture agent's "send eligible" query should be:
  ```sql
  select l.* from public.leads l
  left join public.people p on p.id = l.person_id
  where  l.status = 'active'
    and  l.next_send_at is not null
    and  l.next_send_at <= now()
    and  coalesce(p.ok_to_contact, true) = true;
  ```
- Promotion is application-level (not a DB trigger) so the rules above can evolve without a migration.
- `leads.person_id` uses `on delete set null` — deleting a person preserves their nurture history.
