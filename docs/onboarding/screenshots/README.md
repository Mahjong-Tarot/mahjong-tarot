# Screenshot capture checklist

Capture each screenshot below and save it in this directory with the **exact filename listed**. The markdown source (`../portal-user-guide.md`) references them by these names. Once they're all here, the PDF assembly step picks them up automatically.

**Tip:** On macOS use Cmd+Shift+4, then drag to select. The file gets saved to your Desktop — rename and move it here. Or use Cmd+Shift+5 → Options → "Save to" → set this directory once.

**Browser setup before you start:** sign in fresh, set your window to ~1400px wide so screenshots are consistent. Use Incognito if you want a clean state.

---

## Part 1 — Getting Started

### `01-sign-in.png`
- **URL:** `mahjongtarot.com/sign-in`
- **State:** signed out
- **Capture:** the whole sign-in form (centered)

### `02-portal-nav.png`
- **URL:** any `/portal/*` page
- **State:** signed in as Bill (or as yonavo astrologer)
- **Capture:** just the top navigation bar — focus on the right-side area showing "Bill" + Sign out button

---

## Part 2 — For Bill (sign in as astrologer)

### `03-sessions-list-upcoming.png`
- **URL:** `/portal`
- **State:** Upcoming tab + List view (defaults)
- **Capture:** full page; should show at least one upcoming session card grouped under "This week" or "Next week"

### `04-sessions-calendar.png`
- **URL:** `/portal`
- **State:** click Calendar toggle
- **Capture:** full month grid showing at least one session pill on a date

### `05-clients-list.png`
- **URL:** `/portal/clients`
- **Capture:** full page showing the list with the subscription icons on the right

### `06-client-new.png`
- **URL:** `/portal/clients/new`
- **Capture:** full form

### `07-client-profile.png`
- **URL:** `/portal/clients/<any client>`
- **Capture:** scroll to top, capture the header + contact info section (don't need the whole page — focus on the upper half showing name + subscription icon + edit button)

### `08-session-new.png`
- **URL:** `/portal/sessions/new?client=<id>` (launch from a client profile)
- **Capture:** full form

### `09-open-report-button.png`
- **URL:** `/portal/clients/<id>` — scroll to the Sessions table near the bottom
- **Capture:** just the Sessions table, showing at least one row with the "Open report" button visible on the right

### `10-report-empty.png`
- **URL:** `/portal/reports/<id>` — open a report that has no transcript / no body yet
- **Capture:** full page showing the three empty sections (session context, transcript, report)

### `11-report-transcript-pasted.png`
- **State:** paste some sample transcript text + summary, click Save, success message shown
- **Capture:** the Transcript & summary section with the text visible + the success message

### `12-report-body-pasted.png`
- **State:** paste sample markdown body (use real Mahjong Tarot example content if possible), click Save
- **Capture:** the Report section with the body text visible

### `13-report-send-button.png`
- **Capture:** zoom in on just the Send section at the bottom of the report page — the button + status badge

### `14-report-sent.png`
- **State:** click Send → confirm → wait for status to flip
- **Capture:** the Send section after sending, showing "Sent to … on …" + status badge changed to Sent

### `15-email-inbox.png`
- **Where:** your email client (Gmail, Apple Mail, etc.)
- **Capture:** the inbox list showing the email row from Mahjong Tarot. Don't show other personal mail.

### `16-email-opened.png`
- **State:** open the email
- **Capture:** full email — Mahjong Tarot header, the report body, and the CTA button at the bottom

---

## Part 3 — For Dave (sign in as admin: yon@edge8.co)

### `17-portal-nav-admin.png`
- **URL:** any `/portal/*` page, signed in as admin
- **Capture:** the top navigation bar — should show Sessions · Clients · **Conversions** links (the admin version has Conversions)

### `18-admin-conversions.png`
- **URL:** `/portal/admin/conversions`
- **State:** default filter (Conversion targets) + default sort (Warm leads)
- **Capture:** full page including the filter chips, sort dropdown, and at least one row

### `19-conversions-filters.png`
- **Capture:** zoom in on just the filter chip row at the top — focused crop showing all 6 chips

### `20-mark-subscribed.png`
- **State:** find a non-subscribed client → highlight or annotate the "Mark subscribed" button visible on the row
- **Capture:** one row of the table with the action buttons clearly visible

### `21-send-note-modal.png`
- **State:** click "Send note" on any row to open the modal
- **Capture:** the modal as it appears (with the subject pre-filled, body empty)

---

## When all 21 screenshots are in this folder

Reply to me with "screenshots done" and I'll build the PDF — `portal-user-guide.pdf` will land in both `docs/onboarding/` and `working_files/`.

If you skip any (e.g. the email inbox shot is awkward), tell me which ones and I'll either drop them from the doc or substitute a placeholder.
