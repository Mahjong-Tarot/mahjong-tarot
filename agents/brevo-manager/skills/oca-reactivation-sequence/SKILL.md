# SKILL: oca-reactivation-sequence

Run the Sequence D ladder from `Mirror-campaign-plan.md` §11-13: re-permission the OCA list, then walk responders through the *Mahjong Mirror* launch via Brevo.

## When to use

- "Time to send D-0 / D-1 / D-2 / D-3 / D-4"
- "Purge non-responders"
- "Move responders to a new list"
- Any reference to OCA reactivation, Sequence D, or the Mahjong Mirror launch emails

## Schedule (absolute dates)

| Code | Window | Sender | Purpose | Source |
|------|--------|--------|---------|--------|
| D-0 | Jun 2-4, 2026 (Tue/Wed/Thu) | OCA (id 2) | Reconfirmation in 3 batches of ~290 | Brevo campaigns 1, 2, 3 |
| (purge) | Jun 8, 2026 | — | Build `OCA Responders` list | n/a |
| **Bridge** | **Jun 9, 2026** | **MT (id 3)** | **Trust-transfer + brand handoff. Plain text, no pitch.** | **Drafted in `sequence-d-plan.md` §3b** |
| D-1 | Jun 15, 2026 | MT (id 3) | Announce *The Mahjong Mirror* — July 27 publish | Writer Agent draft |
| D-2 | Jul 1, 2026 | MT (id 3) | Pre-order opens | Writer Agent draft |
| D-3 | Jul 27, 2026 | MT (id 3) | Launch day | Writer Agent draft |
| D-4 | Aug 10, 2026 | MT (id 3) | Review nudge | Writer Agent draft |

**Canonical plan:** `agents/brevo-manager/context/sequence-d-plan.md`

## D-0 (reconfirmation, 3-batch send)

1. Confirm OCA-870 master list exists (Brevo list id 5).
2. Split into 3 lists ≤ 290 each (`Tuesday May 19 / Wednesday May 20 / Thursday May 21 — Batch N`). Currently lists 6, 7, 8.
3. Create 3 Brevo campaigns: same subject/body, different list per batch.
4. Schedule all three at 14:00 UTC (= 10am EDT).
5. Send a test from campaign 1 to `dhajdu@gmail.com` + `yon@edge8.co`.
6. Hand off campaign IDs + dashboard URL to Bill.

## Stats check after D-0 batch 1

1. ~12-18h after batch 1 send, pull stats: `GET /v3/emailCampaigns/<id>` plus `mcp__brevo__campaign_analytics_get_*`.
2. Classify: GREEN (open >15%, bounce <5%, spam <0.1%), YELLOW, RED.
3. If RED: tell Bill to **unschedule batches 2 + 3** in the Brevo dashboard before they fire.

## Purge after D-0 (Jun 8)

1. Pull `email_campaign_management_get_email_campaign` (with `statistics: globalStats`) for campaigns 1, 2, 3.
2. Pull `campaign_analytics_get_email_event_report` for `opened`, `clicks`, `unsubscribed`, `hardBounces`, `spam` per campaign.
3. Responders = `(opened OR clicked) AND NOT (unsubscribed OR complained OR hardBounced)`.
4. Create new Brevo list `OCA Responders Jun 2026 — <count>` in folder 1.
5. `lists_add_contact_to_list` for each Responder. Delete hard-bounces + complaints (`contacts_delete_contact`).
6. Log Responders count + signal breakdown to `send-log.md`.

## Bridge send (Jun 9, MT domain)

1. Confirm `OCA Responders` list exists with > 20 contacts.
2. Use `create-campaign-draft` skill. Sender id `3` (firepig@mahjongtarot.com). Subject + body per `sequence-d-plan.md` §3b.
3. Schedule for `2026-06-09T14:00:00.000Z`.
4. Send test to `dhajdu@gmail.com` + `yon@edge8.co` first. Inspect rendering.
5. Confirm with Bill before letting it go live.

## D-1 through D-4

1. Read Writer Agent's draft from `emails/drafts/YYYY-MM-DD.md`.
2. Use `create-campaign-draft` skill, sender id `3`, target the **Responders** list.
3. D-1 opening line must bridge from D-0 — see `sequence-d-plan.md` §3c.
4. For D-2/D-3, swap in real Amazon / pre-order URLs before drafting.
5. Hand off to Bill for review.

## Hard rules

- D-0 fires from sender id `2` (OCA). Bridge + D-1+ fire from sender id `3` (MT). **Don't cross-mix mid-campaign.**
- D-0 → full reconfirmation set (batches 1-3). Every send after → **Responders only**.
- Never blast the original 870 with launch-pitch content (violates re-permission contract).
- Never queue > 300 sends in any 24h window without batching.
- Always log the milestone in `send-log.md`.
- After `update_email_campaign` on `scheduledAt`, status auto-flips to `queued` — re-`suspended` if intent is to hold.

## Cross-references

- `working_files/Mirror-campaign-plan.md` (§11-13)
- `working_files/mahjong-email-plan.md`
- `working_files/workflows/oca-list-reactivation-playbook.html`
- `emails/drafts/`
