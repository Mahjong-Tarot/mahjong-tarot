# Email System — High-Level Overview

**Status:** Draft for stakeholder sign-off
**Owner:** Engineering (Yon)
**Date:** 2026-05-31
**Audience:** Bill (firepig01@gmail.com), Dave (dave@edge8.ai), Yon (yon@edge8.co)

---

## TL;DR

| Channel | Today | Proposed |
|---|---|---|
| **Transactional email** (inquiry alerts, staff replies) | ✅ Resend — working | ✅ Stay on Resend (no change) |
| **Marketing / newsletter** | ⚠️ Collecting subscribers only — no send platform | ➡️ Adopt **Brevo** for list management + campaigns |
| **Internal alerts** (booking / contact notifications) | ✅ Telegram + Lark — working | ✅ No change |

**What we need sign-off on:** the direction to move marketing/newsletter to Brevo, and the three scope decisions in [Section 5](#5-decisions-needed-before-build).

---

## 1. Current State — Transactional Email

**Provider:** [Resend](https://resend.com)
**Sending domain:** `mahjongtarot.com`
**Default sender:** `Mahjong Tarot <notifications@mahjongtarot.com>`
**Default reply-to:** `firepig01@gmail.com` (Bill)

### Two transactional flows

**1. Inbound inquiry notifications**
When someone submits a booking, contact form, or reading request on the site, a Supabase edge function (`notify-inquiry`) fires and:
- Emails Bill + Dave with the inquiry details via Resend
- Sends the same content to Telegram and Lark for fast-glance visibility
- Triggered by a database webhook on `inquiries` table inserts

**2. Staff replies to inquirers**
When a staff member replies to an inquiry from the admin dashboard:
- `POST /api/reply` looks up the inquirer's email server-side (so the endpoint can't be abused as an open relay)
- Sends the reply from `notifications@mahjongtarot.com` via Resend
- Reply-to is set to Bill's address so responses come back to him

### Operational notes
- All Resend API keys live in environment variables (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_REPLY_TO`) — never hardcoded
- No backup/fallback provider configured
- No bounce/complaint webhook handling yet — Resend dashboard is the only visibility

---

## 2. Current State — Marketing / Newsletter

**Provider:** None yet — subscribers are being **collected only**, not emailed.

### How it works today
- Footer and blog pages render a `NewsletterSignup` component
- On submit, the email is written to Supabase via a `submit_newsletter` RPC
- Subscribers sit in the database; no send pipeline exists
- Newsletter drafts are kept as Markdown in `emails/drafts/` (e.g. `2026-04-27.md`) but are not connected to any sending system

### Gap
We are accumulating subscribers we cannot reach. The longer this gap stays open, the colder the list gets, and the higher the risk of spam complaints when we eventually do send (subscribers forget they signed up).

---

## 3. Current State — Internal Alerts

Out of scope for this overview, but for completeness: inquiry notifications also flow to Telegram (`TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID`) and a Lark Labs webhook (`LARK_LABS_WEBHOOK_URL`). These remain unchanged under the proposal.

---

## 4. Proposed Direction — Brevo for Marketing/Newsletter

### Why Brevo
- Built specifically for marketing campaigns + subscriber management (Resend is transactional-first)
- Generous free tier suitable for current list size
- Strong list segmentation, double opt-in, GDPR / CAN-SPAM compliance tooling out of the box
- API and dashboard both first-class — we can start dashboard-only and add automation later
- Brevo MCP integration is already available in the team's tooling environment

### What stays where

| System | Used for | Why this split |
|---|---|---|
| **Resend** | Transactional only (1-to-1 emails triggered by user action) | Optimised for deliverability of system-generated mail; we already trust it |
| **Brevo** | Marketing only (1-to-many newsletters, campaigns, broadcasts) | Specialised tooling for list health, segmentation, and unsubscribe compliance |

### High-level data flow (proposed)

```
Newsletter signup form
        │
        ▼
Supabase newsletter table  ◄──── source of truth, audit log, RLS-protected
        │
        ▼ (Supabase webhook)
Brevo contacts API  ◄──── marketing list, segmentation, send target
        │
        ▼
Brevo campaign (composed in dashboard)
        │
        ▼
Subscriber's inbox
```

Supabase stays the system of record. Brevo holds a mirror of the list used for sending. If we ever switch ESPs, Supabase data is portable.

### One-time work
- Bulk-export current Supabase newsletter subscribers
- Import into a Brevo "Mahjong Tarot Newsletter" list
- Verify sending domain (`mahjongtarot.com`) in Brevo with SPF / DKIM / DMARC records — likely a small DNS change

### Go-forward work
- Build a Supabase → Brevo sync (database trigger → edge function → Brevo API)
- Add unsubscribe handling that writes back to Supabase (so a Brevo unsub also marks the Supabase row inactive)
- Stand up a basic welcome email in Brevo for new signups

---

## 5. Decisions Needed Before Build

Three scope questions for stakeholder sign-off:

### Decision 1 — Sync method
How do newsletter signups reach Brevo?
- **A. Supabase webhook → Brevo (recommended).** DB trigger fires an edge function that adds the contact to Brevo. Supabase stays the source of truth.
- **B. Direct API call at signup.** Simpler but risks drift if either call fails.
- **C. Brevo only.** Drop Supabase storage, post straight to Brevo. Cleanest but loses local audit log.

### Decision 2 — Existing subscribers
- **A. One-time bulk import to Brevo (recommended).** Pull current list out of Supabase, import to Brevo, then let sync handle new ones.
- **B. Leave existing subscribers in Supabase only.** Only new signups reach Brevo.
- **C. No existing subscribers to worry about.** Start clean.

### Decision 3 — Campaign composition
- **A. Brevo dashboard only (recommended).** Compose and send from Brevo's UI. `emails/drafts/` becomes reference, not automation input. Zero code.
- **B. Dashboard + later API automation.** Start with dashboard, build a draft → Brevo importer later.
- **C. Fully API-driven from this repo.** Build a tool that turns `emails/drafts/*.md` into scheduled Brevo campaigns. Most work, most control.

---

## 6. Risks & Open Questions

| Risk | Mitigation |
|---|---|
| Subscribers who signed up months ago may have forgotten us → spam complaints on first send | Welcome / re-engagement email first; segment older signups; consider double opt-in re-confirmation |
| Domain reputation hit if we send to bad addresses | Re-run list validation (we already have `email-list-validation-2026-05*.md` reports — apply those before first send) |
| Resend + Brevo both sending from `mahjongtarot.com` could create DNS / authentication conflicts | Use a subdomain for Brevo (e.g. `news.mahjongtarot.com`) to isolate marketing reputation from transactional |
| GDPR / CAN-SPAM compliance for stored subscribers | Brevo provides unsubscribe links and consent logging by default — ensure double opt-in is enabled |
| Vendor lock-in | Mitigated by keeping Supabase as source of truth |

---

## 7. Costs (Indicative)

| Provider | Plan needed | Estimated cost |
|---|---|---|
| Resend | Existing plan, no change | $0 incremental |
| Brevo | Free tier (≤ 300 emails/day, unlimited contacts) likely sufficient at current scale | $0 to start; ~$9–25/mo if we exceed daily send limit |

To be confirmed once current subscriber count and expected send cadence are known.

---

## 8. Sign-Off

| Stakeholder | Role | Decision | Date |
|---|---|---|---|
| Bill Hajdu | Founder / Owner | ☐ Approve  ☐ Revise |  |
| Dave | Edge8 lead |  ☐ Approve  ☐ Revise |  |
| Yon | Engineering |  ☐ Approve  ☐ Revise |  |

Once approved, engineering will:
1. Confirm decisions 1–3 above
2. Verify sending domain in Brevo (DNS work)
3. Bulk-import existing subscribers (if applicable)
4. Build the sync layer
5. Author the first welcome email in Brevo
6. Document the runbook in `docs/engineering/`

---

*Document version: 1.0 — Draft. Update as decisions are made.*
