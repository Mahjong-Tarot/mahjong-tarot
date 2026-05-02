# SKILL: import-subscribers

Import a cleaned CSV of subscribers into a MailerLite group, ranked by Western-name score, capped at the free-plan ceiling.

## When to use

- User uploads a ZeroBounce-processed folder and asks to add N subscribers
- User says "import these to MailerLite", "add 500 to the list", "top up the OCA group"

## Inputs

- **Source CSV** — a `*_valid_phase1.csv` (or explicitly named other tier) from ZeroBounce
- **Target group** — name + ID. If group does not exist, create it using the convention `<purpose> <month> <year> — <count>`
- **Cap** — defaults to `500 - current_subscriber_count`. Never exceed.

## Procedure

1. **Confirm headroom.** Call `get_subscriber_count`. Compute `cap = 500 - current`. If `cap <= 0`, stop and tell the user the list is full.
2. **Read the CSV via `ctx_execute_file`** — never load into context directly. Strip BOM. DictReader.
3. **Score every row:**
   - +3 if `ZB First Name` matches the Western first-name set (see persona / curated list)
   - +3 if `ZB Last Name` matches the Western last-name set
   - +2 bonus when both match
   - +1 if domain ∈ `{gmail.com, yahoo.com, aol.com, hotmail.com, outlook.com, msn.com, comcast.net, sbcglobal.net, att.net, verizon.net, bellsouth.net, cox.net, earthlink.net, me.com, icloud.com, mac.com, charter.net, optonline.net, frontier.com, windstream.net}`
   - -1 if both first and last names are empty
4. **Sort descending; dedupe on lowercase email; take top N = min(requested, cap).**
5. **Report the math** before importing: total rows, unique emails, score distribution of the selected slice, count of "both western", "first only", "last only", "neither" — so the user can sanity-check.
6. **Create the group if missing.** Use the naming convention.
7. **Batch import in chunks of 100** via `import_subscribers_to_group`. Pass `resubscribe: false`, `autoresponders: false`. Each subscriber is `{email, name?}` — only include `name` if both first and last are non-empty after `.title()` normalization.
8. **Verify final count** with `get_subscriber_count` and the group's `active_count`. Report the delta.
9. **Append to `agents/mailerlite-manager/context/send-log.md`:**
   ```
   | YYYY-MM-DD HH:MM | import | <group name> | +<n> imported, +<m> deduped | source: <csv path> |
   ```

## Hard rules

- Never import from `*_invalid_*`, `*_spamtrap_*`, `*_donotmail_*`, `*_abuse_*` CSVs.
- Never exceed 500 total active subscribers.
- Never use `resubscribe: true` without explicit user instruction.
- Never silently include role-based addresses (admin@, info@, support@, postmaster@, etc.) — flag and ask.

## Output format

```
Imported <n> to <group>. Group now <active_count>. Account total <total>/500.
Score distribution of imported set: {9: x, 8: y, ... 0: z}
Both Western: <a> | First only: <b> | Last only: <c> | Filler: <d>
```
