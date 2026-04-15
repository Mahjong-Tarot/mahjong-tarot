# CRM Design Document — The Mahjong Tarot

**Author:** Dave Hajdu  
**Date:** 2026-04-10  
**Status:** Implemented (v1)

---

## 1. Overview

The Mahjong Tarot CRM is a lightweight customer relationship management system built into the existing Next.js website. It captures leads from three public form types (newsletter signups, contact inquiries, booking requests), stores them in Supabase, and provides an admin dashboard for Bill Hajdu to manage, track, and respond to inquiries.

### Goals

- Give Bill a single place to see every inbound lead
- Enable status tracking from first contact through completion
- Allow direct email replies without leaving the dashboard
- Send real-time notifications (email + Telegram) on every new inquiry
- Keep the system simple enough to maintain without a dedicated ops team

### Non-Goals

- Multi-user access / team features
- Marketing automation or drip campaigns
- Payment processing or invoicing
- Full-featured CRM (contact tagging, pipeline forecasting, etc.)

---

## 2. Architecture

```
                         ┌──────────────────────┐
                         │   Public Website      │
                         │   (Next.js on Vercel) │
                         └──────┬───────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                  │
     ┌────────▼──────┐  ┌──────▼──────┐  ┌───────▼───────┐
     │ Newsletter    │  │ Contact     │  │ Booking       │
     │ Signup Form   │  │ Form        │  │ Form          │
     │ (Footer)      │  │ (/contact)  │  │ (/readings)   │
     └────────┬──────┘  └──────┬──────┘  └───────┬───────┘
              │                │                  │
              └────────────────┼──────────────────┘
                               │
                      Supabase RPC calls
                     (submit_newsletter,
                      submit_contact,
                      submit_booking)
                               │
                     ┌─────────▼──────────┐
                     │   Supabase         │
                     │   PostgreSQL       │
                     │                    │
                     │  ┌──────────────┐  │
                     │  │ people       │  │
                     │  │ inquiries    │  │
                     │  │ reading_types│  │
                     │  └──────────────┘  │
                     └─────────┬──────────┘
                               │
                     DB webhook on INSERT
                               │
                     ┌─────────▼──────────┐
                     │  Edge Function     │
                     │  notify-inquiry    │
                     └────┬──────────┬────┘
                          │          │
                 ┌────────▼──┐  ┌───▼──────────┐
                 │  Resend   │  │  Telegram    │
                 │  Email    │  │  Bot API     │
                 └───────────┘  └──────────────┘

              ┌──────────────────────────────┐
              │   Admin Dashboard (/admin)   │
              │                              │
              │  ┌─────────┐  ┌───────────┐  │
              │  │List View│  │Kanban View│  │
              │  └────┬────┘  └─────┬─────┘  │
              │       └──────┬──────┘        │
              │       Detail Panel           │
              │       (view/edit/reply)      │
              └──────────────┬───────────────┘
                             │
                    ┌────────┼────────┐
                    │        │        │
              Supabase   Supabase   /api/reply
              RPCs       RPCs       (Resend)
              (read)     (write)
```

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Supabase RPC functions** (not direct table access) | Encapsulates business logic server-side; allows row-level security later without frontend changes |
| **No external UI library** | Minimal dependencies; full control over the Mahjong tile aesthetic |
| **HTML5 native drag-and-drop** for kanban | Avoids react-beautiful-dnd (heavy) for a simple 5-column board |
| **Edge Function for notifications** | Async, non-blocking — notification failures never block form submissions |
| **Dual notification channels** (email + Telegram) | Redundancy; Telegram is faster for mobile, email creates a record |
| **No auth in v1** | Speed to ship; admin URL is unlisted and not linked in public nav |
| **Next.js API route** for email replies | Keeps Resend API key server-side; simple POST handler |
| **Pages Router** (not App Router) | Consistent with existing site; no migration needed |

---

## 3. Data Model

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌─────────────────┐
│ reading_types │       │    inquiries     │       │     people      │
├──────────────┤       ├──────────────────┤       ├─────────────────┤
│ id (PK)      │◄──────│ reading_type_id  │       │ id (PK)         │
│ slug         │  0..1 │ id (PK)          │  M..1 │ email (unique)  │
│ name         │       │ person_id (FK) ──│──────►│ name            │
│ duration     │       │ type             │       │ phone           │
│ description  │       │ subject          │       │ address         │
│ in_person    │       │ message          │       │ chinese_sign    │
│ online       │       │ source           │       │ birthday        │
│ via_ai       │       │ status           │       │ ok_to_contact   │
│ sort_order   │       │ created_at       │       │ created_at      │
│ is_active    │       └──────────────────┘       │ updated_at      │
│ created_at   │                                   └─────────────────┘
└──────────────┘
```

### Table Details

#### `people`
The canonical customer record. Upserted by email on every form submission — repeated submissions from the same email enrich the same person record.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK, auto-generated |
| `email` | text | Unique constraint; used for upsert matching |
| `name` | text | Nullable (newsletter signups may not have a name) |
| `phone` | text | Nullable |
| `address` | text | Nullable |
| `chinese_sign` | text | One of 12 zodiac animals; nullable |
| `birthday` | date | Nullable |
| `ok_to_contact` | boolean | Default true |
| `created_at` | timestamptz | Auto-set |
| `updated_at` | timestamptz | Auto-updated via trigger |

#### `inquiries`
One record per form submission. A person can have many inquiries.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK, auto-generated |
| `person_id` | UUID | FK to `people` |
| `type` | text | `newsletter` \| `contact` \| `booking` |
| `reading_type_id` | UUID | FK to `reading_types`; only for bookings |
| `subject` | text | For contact inquiries |
| `message` | text | Full message body |
| `source` | text | Where the form lives: `footer`, `blog`, `contact-page`, `readings` |
| `status` | text | `received` \| `read` \| `confirmed` \| `completed` \| `cancelled` |
| `created_at` | timestamptz | Auto-set |

**Indexes:** `person_id`, `type`, `status`

#### `reading_types`
Reference table for available reading sessions.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `slug` | text | Unique; e.g. `mahjong-mirror-session` |
| `name` | text | Display name |
| `duration` | text | e.g. "45-60 min" |
| `description` | text | |
| `in_person` | boolean | Availability flag |
| `online` | boolean | Availability flag |
| `via_ai` | boolean | Availability flag |
| `sort_order` | int | Display ordering |
| `is_active` | boolean | Soft delete |

### Status Lifecycle

```
                    ┌──────────┐
  Form submitted ──►│ received │
                    └────┬─────┘
                         │ Admin opens detail
                    ┌────▼─────┐
                    │   read   │
                    └────┬─────┘
                         │ Admin confirms/schedules
                    ┌────▼──────┐
                    │ confirmed │
                    └────┬──────┘
                    ┌────┼────────────┐
               ┌────▼─────┐   ┌──────▼────┐
               │completed │   │ cancelled │
               └──────────┘   └───────────┘
```

Any status can transition to any other status (no hard enforcement) — the admin has full control via dropdown or kanban drag.

---

## 4. API Surface

### Public RPC Functions (form submissions)

| Function | Inputs | Returns | Trigger |
|----------|--------|---------|---------|
| `submit_newsletter` | email, chinese_sign, source | inquiry_id | Newsletter signup |
| `submit_contact` | name, email, phone, subject, message | inquiry_id | Contact form |
| `submit_booking` | name, email, reading_type_slug, phone, chinese_sign, birthday, message | inquiry_id | Booking form |

All three upsert the `people` record by email, then insert into `inquiries`.

### Admin RPC Functions (dashboard)

| Function | Inputs | Returns |
|----------|--------|---------|
| `get_inquiries` | type?, status?, limit, offset | Array of inquiry + person + reading_type |
| `get_inquiry_detail` | inquiry_id | Single inquiry with full person + reading_type |
| `update_inquiry_status` | inquiry_id, status | Updated inquiry |
| `update_person` | person_id, ...optional fields | Updated person |
| `get_inquiry_counts` | (none) | Counts by type |

### Next.js API Route

| Endpoint | Method | Body | Action |
|----------|--------|------|--------|
| `/api/reply` | POST | `{ inquiry_id, to_email, to_name, subject, body }` | Send email via Resend |

---

## 5. Frontend Components

### Admin Dashboard (`/admin`)

The dashboard is a single-page React component with four major sections:

#### Summary Cards
Four count cards at the top: Total, Newsletter, Contact, Booking. Fetched via `get_inquiry_counts()` on mount.

#### View Toggle
Switch between **List View** (table) and **Kanban View** (board). Active view is stored in React state.

#### List View
- Sortable table with columns: Date, Type, Name, Email, Subject/Message, Status
- Type filter dropdown (all / newsletter / contact / booking)
- Click any row to open the detail panel
- "Load More" pagination (50 per page via offset)

#### Kanban View
- 5 columns: Received, Read, Confirmed, Completed, Cancelled
- Cards show: person name, type badge, created date, truncated message
- HTML5 drag-and-drop: dragging a card to a new column calls `update_inquiry_status`
- Click any card to open the detail panel

#### Detail Panel (Slide-over)
- **Person section:** Editable fields (name, email, phone, address, chinese sign, birthday) with Save button
- **Inquiry section:** Read-only type/source/date, editable status dropdown, full message display
- **Reply section:** Subject + body textarea + Send button (calls `/api/reply`)
- Closes via X button or clicking outside

### State Management
All state lives in React `useState` hooks within `admin.jsx`. No external state library. Data is refetched after mutations (status change, person save) to keep views in sync.

---

## 6. Notification System

### Trigger
A Supabase database webhook fires on every INSERT to the `inquiries` table, calling the `notify-inquiry` Edge Function.

### Email Notification (Resend)
- **Recipients:** firepig01@gmail.com, dave@edge8.ai
- **From:** notifications@mahjongtarot.com
- **Subject:** "New [Type] Inquiry from [Name]"
- **Body:** HTML-formatted with inquiry type, person details, message, and timestamp
- **Sender domain:** mahjongtarot.com (verified in Resend)

### Telegram Notification
- **Bot:** Custom bot created via @BotFather
- **Format:** Text message with type badge, person info, message excerpt
- **Delivery:** Near-instant push notification to Bill's phone

### Failure Handling
Both notifications are fire-and-forget. If Resend or Telegram fails, the error is logged but the form submission still succeeds. The inquiry record is already written before the webhook fires.

---

## 7. Security Model

### Current State (v1)

| Layer | Protection |
|-------|-----------|
| Admin page | URL obscurity only (`/admin` not linked in nav) |
| RPC functions | `security definer` + granted to `anon` role |
| Resend API key | Server-side only (`.env.local` / Vercel env vars) |
| Supabase keys | Anon key in client (read-only by design); service key in Edge Function only |
| Telegram secrets | Stored as Supabase secrets (Edge Function env) |

### Planned (v2) — Authentication

| Change | Detail |
|--------|--------|
| Supabase Auth | Email/password login for admin |
| Login page | `/admin/login` with redirect |
| RPC gating | Add `auth.role() = 'authenticated'` checks to admin RPCs |
| Session management | Supabase auth session with auto-refresh |

### Threat Model

| Threat | Likelihood | Mitigation |
|--------|-----------|------------|
| Someone discovers `/admin` URL | Low | No sensitive data exposed; status changes are non-destructive |
| Spam form submissions | Medium | Rate limiting at Vercel edge (future); Supabase has built-in rate limits |
| Resend API key leak | Low | Key is server-side only; never in client bundle |
| SQL injection via RPC | Very low | Supabase RPC uses parameterized queries |

---

## 8. Styling & Brand Consistency

The CRM follows the site's Mahjong tile aesthetic:

- **No border-radius** on any element (sharp corners = tile geometry)
- **Color palette:** Midnight Indigo `#1B1F3B`, Mystic Fire `#C0392B`, Celestial Gold `#C9A84C`, Warm Cream `#FAF8F4`
- **Status badges:** Color-coded (received=gray, read=lavender, confirmed=gold, completed=green, cancelled=red)
- **Typography:** Playfair Display (headings), Source Sans 3 (body/UI)
- **CSS Modules** (`Admin.module.css`) — no external CSS framework
- **Responsive:** Table scrolls horizontally on mobile; kanban columns stack vertically

---

## 9. File Inventory

### New Files (v1)

| File | Lines | Purpose |
|------|-------|---------|
| `website/pages/admin.jsx` | ~657 | Full CRM dashboard |
| `website/styles/Admin.module.css` | ~413 | Dashboard styling |
| `website/pages/api/reply.js` | ~46 | Email reply API route |
| `website/supabase/002_admin_dashboard.sql` | ~197 | Admin RPC functions |
| `website/supabase/003_seed_test_data.sql` | ~120 | Test data |
| `website/supabase/functions/notify-inquiry/index.ts` | ~127 | Notification Edge Function |

### Modified Files

| File | Change |
|------|--------|
| `website/next.config.js` | Removed `output: 'export'` to enable API routes |

---

## 10. Trade-offs & Known Limitations

| Item | Trade-off | Rationale |
|------|-----------|-----------|
| No auth | Anyone with the URL can view/edit | Fast to ship; low risk for a personal site with unlisted URL |
| Single admin page (~657 lines) | Large file | Avoids premature component extraction for a dashboard used by one person |
| No reply history | Can't see past replies in the dashboard | Replies are in Bill's email; adding thread storage is v2 scope |
| No search | Must scroll or filter to find an inquiry | Low volume expected; search is v2 |
| No optimistic UI | Mutations wait for server response | Simpler code; acceptable latency on Supabase |
| Anon key for admin reads | All inquiries readable with public key | No PII beyond names/emails; auth is the real fix |

---

## 11. Future Roadmap

### v2 — Authentication & History
- Supabase Auth (email/password)
- Login page and session management
- Reply history stored in a `replies` table
- Internal notes per inquiry

### v3 — Productivity
- Full-text search across inquiries
- CSV export
- Custom email templates with Mahjong Tarot branding
- Bulk status updates

### v4 — Analytics
- Inquiry volume trends (weekly/monthly)
- Conversion funnel (received -> confirmed -> completed)
- Source attribution (which form drives the most bookings)
- Response time tracking

---

## 12. Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 14.0.0 | Framework |
| `react` / `react-dom` | 18.0.0 | UI |
| `@supabase/supabase-js` | 2.103.0 | Database client |
| **Resend** | API only | Email delivery (no SDK; raw fetch) |
| **Telegram Bot API** | HTTP only | Notifications (no SDK; raw fetch) |

No additional runtime dependencies were introduced for the CRM.

---

## 13. Environment Variables

| Variable | Where | Required By |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + `.env.local` | Supabase client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + `.env.local` | Supabase client |
| `RESEND_API_KEY` | Vercel + `.env.local` | `/api/reply` route |
| `RESEND_FROM_EMAIL` | Vercel + `.env.local` | Reply sender address |
| `RESEND_REPLY_TO` | Vercel + `.env.local` | Reply-to header |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secrets | Edge Function |
| `TELEGRAM_BOT_TOKEN` | Supabase secrets | Edge Function |
| `TELEGRAM_CHAT_ID` | Supabase secrets | Edge Function |

---

*Design doc version: 1.0 — Reflects implemented v1 state as of 2026-04-10.*
