# SKILL: oca-reactivation-sequence

Run the Sequence D ladder from `Mirror-campaign-plan.md` §11-13: re-permission the OCA list, then walk responders through the *Mahjong Mirror* launch via Brevo.

## When to use

- "Time to send D-0 / D-1 / D-2 / D-3 / D-4"
- "Purge non-responders"
- "Move responders to a new list"
- Any reference to OCA reactivation, Sequence D, or the Mahjong Mirror launch emails

## Schedule (absolute dates)

| Code | Window | Purpose | Source |
|------|--------|---------|--------|
| D-0 | May 19-21, 2026 (Tue/Wed/Thu) | Reconfirmation in 3 batches of ~290 | Brevo campaigns 1, 2, 3 |
| (purge) | ~June 1, 2026 | Build OCA Responders list | n/a |
| D-1 | June 15, 2026 | Announce *The Mahjong Mirror* — July 27 publish | Writer Agent draft |
| D-2 | July 1, 2026 | Pre-order opens | Writer Agent draft |
| D-3 | July 27, 2026 | Launch day | Writer Agent draft |
| D-4 | August 10, 2026 | Review nudge | Writer Agent draft |

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

## Purge after D-0

1. After 14 days from last D-0 batch, segment all 3 batch lists:
   - Responders = opened OR clicked any campaign
   - Non-responders = the rest
2. Create `OCA Responders <month> <year> — <count>`.
3. Move responders into the new list. Don't delete non-responders.

## D-1 through D-4

1. Read Writer Agent's draft from `emails/drafts/YYYY-MM-DD.md`.
2. Use `create-campaign-draft` skill, target the **Responders** list.
3. For D-2/D-3, swap in real Amazon / pre-order URLs before drafting.
4. Hand off to Bill for review.

## Hard rules

- D-0 → full reconfirmation set (batches 1-3). Every send after → **Responders only**.
- Never blast the original 870 with launch-pitch content (violates re-permission contract).
- Never queue > 300 sends in any 24h window without batching.
- Always log the milestone in `send-log.md`.

## Cross-references

- `working_files/Mirror-campaign-plan.md` (§11-13)
- `working_files/mahjong-email-plan.md`
- `working_files/workflows/oca-list-reactivation-playbook.html`
- `emails/drafts/`
