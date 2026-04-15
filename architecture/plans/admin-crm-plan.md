# Plan: Admin CRM Dashboard + Email/Telegram Notifications

**Project**: The Mahjong Tarot  
**Date**: 2026-04-10  
**Status**: Proposed

---

## Context

The Mahjong Tarot site has three forms (newsletter, contact, booking) that write to Supabase, but there's no way to view submissions, track lead status, or respond. We need a mini CRM admin dashboard and a notification system.

---

## What We're Building

### Admin CRM at `/admin` (no auth for now, not linked in public nav)

- **List view**: Filterable table of all inquiries — filter by type (newsletter / contact / booking)
- **Kanban view**: Drag cards between status columns (received → read → confirmed → completed / cancelled)
- **Detail panel**: Click any inquiry to open a slide-over with full details + editable person info
- **Edit person**: Update name, email, phone, address, chinese sign, birthday directly from the detail panel
- **Reply by email**: Compose and send an email reply directly from the detail panel
- **Status updates**: Change lead status from the detail panel dropdown or by dragging cards in kanban view
- **Summary cards**: At-a-glance counts — Total, Newsletter, Contact, Booking

### Notifications (triggered on every new inquiry)

- **Email**: Sends to firepig01@gmail.com and dave@edge8.ai via [Resend](https://resend.com) (free tier — 100 emails/day)
- **Telegram**: Sends via Telegram Bot API (new bot to be created via @BotFather)

---

## Technical Architecture

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js 14 (Pages Router) | Existing stack |
| Database | Supabase (Postgres) | Existing — adding RPC functions |
| Email (replies) | Resend API via Next.js API route | New — requires `RESEND_API_KEY` |
| Email (notifications) | Resend API via Supabase Edge Function | New — triggered on insert |
| Telegram (notifications) | Telegram Bot API via Edge Function | New — requires bot token + chat ID |
| Styling | CSS Modules + existing design tokens | Consistent with site brand |

---

## Implementation Steps

### Step 1: Remove Static Export

**File**: `website/next.config.js`

Remove `output: 'export'` to enable Next.js API routes. The email reply feature requires a server-side endpoint.

### Step 2: Database Migration — RPC Functions

**New file**: `website/supabase/002_admin_dashboard.sql`

| Function | Purpose |
|----------|---------|
| `get_inquiries(type, status, limit, offset)` | Paginated list of inquiries joined with people + reading types |
| `get_inquiry_detail(inquiry_id)` | Full details for a single inquiry + person |
| `update_inquiry_status(inquiry_id, status)` | Change lead status |
| `update_person(person_id, name, email, phone, address, chinese_sign, birthday)` | Edit person info |
| `get_inquiry_counts()` | Counts grouped by type and status |

All functions use `security definer` (same pattern as existing submit functions). Granted to `anon` since there's no auth yet — will be locked down when auth is added.

### Step 3: API Route for Email Replies

**New file**: `website/pages/api/reply.js`

- Receives: `{ inquiry_id, to_email, to_name, subject, body }`
- Sends email via Resend API
- Returns success/error JSON

### Step 4: Admin Dashboard Page

**New file**: `website/pages/admin.jsx`

#### Page Layout

```
┌─ Page Header (dark section) ─────────────────────────────┐
│  "Inquiry Dashboard"                                      │
│  [Total: 42]  [Newsletter: 18]  [Contact: 15]  [Booking: 9] │
└───────────────────────────────────────────────────────────┘

┌─ Toolbar ─────────────────────────────────────────────────┐
│  [List View]  [Kanban View]              Filter: [Type ▼] │
└───────────────────────────────────────────────────────────┘

┌─ List View ───────────────────────────────────────────────┐
│  Date  │  Type  │  Name  │  Email  │  Subject  │  Status  │
│  (click any row to open detail panel)                      │
│  [Load More]                                               │
└───────────────────────────────────────────────────────────┘

┌─ Kanban View (alternate) ─────────────────────────────────┐
│  Received │  Read  │  Confirmed │  Completed │  Cancelled  │
│  (drag cards between columns to update status)             │
└───────────────────────────────────────────────────────────┘

┌─ Detail Slide-over Panel (right side) ────────────────────┐
│                                                            │
│  PERSON INFO (editable)                                    │
│  Name: [__________]    Email: [__________]                 │
│  Phone: [_________]    Address: [_________]                │
│  Chinese Sign: [▼___]  Birthday: [__________]              │
│  [Save Person]                                             │
│                                                            │
│  INQUIRY                                                   │
│  Type: Contact    Source: contact-page    Date: Apr 10      │
│  Status: [▼ Received]                                      │
│  Message: "Full message text displayed here..."            │
│                                                            │
│  ─── REPLY ───                                             │
│  Subject: [__________________________]                     │
│  Body:    [textarea_________________]                      │
│  [Send Reply]                                              │
└───────────────────────────────────────────────────────────┘
```

#### Kanban Details
- Native HTML5 drag-and-drop (no external library)
- 5 columns: Received, Read, Confirmed, Completed, Cancelled
- Cards show: name, type badge, date, truncated message
- Dropping a card on a new column triggers `update_inquiry_status`

### Step 5: Styling

**New file**: `website/styles/Admin.module.css`

- Uses existing design tokens (midnight indigo, warm cream, celestial gold, etc.)
- Status badges: color-coded (received=gray, read=lavender, confirmed=gold, completed=green, cancelled=red)
- No border-radius (Mahjong tile aesthetic — consistent with rest of site)
- Responsive: table scrolls horizontally on mobile, kanban columns stack vertically

### Step 6: Notification Edge Function

**New file**: `website/supabase/functions/notify-inquiry/index.ts`

Triggered by a Supabase database webhook on `inquiries` INSERT:
1. Receives the new inquiry record
2. Fetches person details from the database
3. Sends formatted email via Resend to both addresses
4. Sends formatted Telegram message via Bot API
5. Returns 200 (notification failures are logged but don't block the form submission)

### Step 7: Seed Test Data

**New file**: `website/supabase/003_seed_test_data.sql`

Inserts 10 realistic test rows:
- 3 newsletter signups (varied chinese signs)
- 4 contact inquiries (different subjects and messages)
- 3 booking requests (with reading type and messages)
- Mix of statuses: most "received", a couple "read", one "confirmed"

---

## New Files

| File | Purpose |
|------|---------|
| `website/supabase/002_admin_dashboard.sql` | RPC functions for reading/updating inquiries + people |
| `website/supabase/003_seed_test_data.sql` | 10 test inquiry rows for QA |
| `website/pages/admin.jsx` | Full CRM dashboard (list + kanban + detail + reply) |
| `website/styles/Admin.module.css` | Dashboard styling |
| `website/pages/api/reply.js` | API route to send email replies via Resend |
| `website/supabase/functions/notify-inquiry/index.ts` | Edge Function for email + Telegram notifications |

## Modified Files

| File | Change |
|------|--------|
| `website/next.config.js` | Remove `output: 'export'` to enable API routes |

---

## External Setup Required

| Task | Details |
|------|---------|
| **Resend account** | Sign up at [resend.com](https://resend.com) → create API key → add as `RESEND_API_KEY` env var |
| **Telegram bot** | Create via @BotFather in Telegram → get bot token + chat ID → store as Supabase secrets |
| **Database webhook** | Supabase Dashboard → Database → Webhooks → INSERT on `inquiries` → call Edge Function |
| **Deploy Edge Function** | `supabase functions deploy notify-inquiry` |
| **Run SQL migrations** | Execute `002` and `003` SQL files in Supabase SQL Editor |

---

## Verification Checklist

- [ ] `002_admin_dashboard.sql` and `003_seed_test_data.sql` run successfully in Supabase
- [ ] `/admin` loads and shows 10 test inquiries in list view
- [ ] Toggle between list view and kanban view works
- [ ] Filtering by type (newsletter/contact/booking) works in list view
- [ ] Click an inquiry → detail panel slides open with full info
- [ ] Edit person fields and save → changes persist
- [ ] Change inquiry status from detail panel → list/kanban updates
- [ ] Drag a kanban card to a new column → status updates
- [ ] Send a reply email from detail panel → email arrives
- [ ] Submit a real form on the public site → notification email arrives at both addresses
- [ ] Submit a real form → Telegram notification arrives

---

## Security Notes

- The admin page has **no authentication** for now — it's accessible to anyone who knows the URL `/admin`
- RPC functions are callable with the public anon key
- When auth is added later: gate RPC functions with `auth.role() = 'authenticated'`, add a login page, use `supabase.auth.signInWithPassword()`
- The Resend API key is stored server-side only (in `.env.local` and Vercel env vars), never exposed to the client

---

## Future Enhancements (out of scope for now)

- Admin authentication (Supabase Auth with email/password)
- Reply history / conversation thread per inquiry
- Notes/internal comments on inquiries
- Export to CSV
- Search across all inquiries
- Custom email templates with branding
