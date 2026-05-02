# SKILL: oca-reactivation-sequence

Run the Sequence D ladder from `Mirror-campaign-plan.md` §11-13: re-permission the OCA list, then walk responders through the *Mahjong Mirror* launch.

## When to use

- "Time to send D-0 / D-1 / D-2 / D-3 / D-4"
- "Purge non-responders"
- "Move responders to a new group"
- Any reference to OCA reactivation, Sequence D, or the Mahjong Mirror launch emails

## The schedule (absolute dates)

| Code | Window | Purpose | Source |
|------|--------|---------|--------|
| D-0 | May 15-20, 2026 | Reconfirmation. No pitch. Subject: "the horse year briefly" or variant. | 3 drafts already in MailerLite |
| (purge) | ~June 1, 2026 | Auto-remove non-responders to D-0 | n/a |
| D-1 | June 15, 2026 | Announce *The Mahjong Mirror* — July 27 publish date | Writer Agent draft |
| D-2 | July 1, 2026 | Pre-order opens | Writer Agent draft |
| D-3 | July 27, 2026 | Launch day — "it's live, here's your link" | Writer Agent draft |
| D-4 | August 10, 2026 | Review nudge — Amazon 1-2 line review ask | Writer Agent draft |

## Procedure for each milestone

### D-0 (reconfirmation)
1. Confirm the OCA Reactivation group exists with the current cleaned subscriber set.
2. The drafts may already exist (V1/V2/V3). If yes, ask Bill which to keep; archive the rest.
3. Verify the chosen draft via the preview URL.
4. **Do not schedule.** Hand the campaign id + preview URL to Bill; he sends from the dashboard.

### Purge after D-0
1. After 14 days from D-0 send, segment the group:
   - Responders = opened OR clicked any link
   - Non-responders = the rest
2. Create a new group `OCA Responders <month> <year> — <count>`.
3. Move responders into the new group (do not delete them from the old group; tag both).
4. Mark non-responders inactive — do **not** delete the records (in case of re-engagement later).

### D-1 through D-4
1. Read the Writer Agent's draft from `emails/drafts/YYYY-MM-DD.md` (date matches the milestone above).
2. Use the `create-campaign-draft` skill, target the **Responders** group (not the full OCA group).
3. For D-2 and D-3, swap in real Amazon / pre-order URLs before drafting.
4. Hand off to Bill for review and send.

## Hard rules

- D-0 goes to the full reconfirmation group. Every send after that goes to **Responders only**.
- Never blast the original 500 with launch-pitch content — that violates the re-permission contract from D-0.
- Never schedule a send. Always draft, always hand off.
- Always log the milestone in `send-log.md` with the D-code, send date, recipient count, and outcome (open/click rates after a few days).

## Cross-references

- Full plan: `working_files/Mirror-campaign-plan.md` (sections 11, 12, 13)
- Weekly newsletter context: `working_files/mahjong-email-plan.md`
- Reactivation playbook: `working_files/workflows/oca-list-reactivation-playbook.html`
- Past send drafts: `emails/drafts/`
