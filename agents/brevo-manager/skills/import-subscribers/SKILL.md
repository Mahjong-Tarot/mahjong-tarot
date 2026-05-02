# SKILL: import-subscribers

Import a cleaned CSV of contacts into Brevo, batched to respect the 300/day Free-plan send cap.

## When to use

- User uploads a ZeroBounce-processed folder and asks to add contacts to Brevo
- User says "import these to Brevo", "add to the OCA list", "split into batches"

## Inputs

- **Source CSV** — a `*_valid_phase1.csv` from ZeroBounce
- **List strategy** — single master list, OR split-into-N-batches for daily-cap pacing
- **Batch size** — defaults to **290** (Free plan headroom; 10 reserved for tests)

## Procedure

1. **Confirm Brevo auth** with `mcp__brevo__accounts_get_account`.
2. **Read the CSV via `ctx_execute_file`.** Strip BOM. DictReader. Dedupe on lowercased email.
3. **Map ZeroBounce columns to Brevo attributes:**
   - `ZB First Name` → `FIRSTNAME`
   - `ZB Last Name` → `LASTNAME`
   - Email → `email`
4. **Output a JSON array** of `{email, attributes: {FIRSTNAME, LASTNAME}}` to `/tmp/brevo_<purpose>.json`. Skip attributes if both names empty.
5. **For batched imports:** chunk into ≤ 290 each. Each chunk = its own Brevo list.
6. **Create new list(s)** via the import endpoint's `newList: {listName, folderId: 1}`.
7. **Call `POST /v3/contacts/import`** via REST (MCP doesn't expose this). Pass:
   - `jsonBody`: contact array
   - `newList`: `{listName, folderId: 1}`
   - `updateExistingContacts: true`
   - `disableNotification: true`
   - `emailBlacklist: false`, `smsBlacklist: false`
8. **Verify counts** with `GET /v3/contacts/lists` after import (wait 3-5s for async processing).
9. **Append to `send-log.md`:**
   ```
   | YYYY-MM-DD HH:MM | import | <list name> (id <n>) | +<n> contacts | source: <csv path> |
   ```

## Hard rules

- Never import from `*_invalid_*`, `*_spamtrap_*`, `*_donotmail_*`, `*_abuse_*` CSVs.
- Never blacklist on import.
- Never overwrite existing FIRSTNAME/LASTNAME if the CSV value is empty (`emptyContactsAttributes: false`).
- Always dedupe on lowercased email.

## Output format

```
Imported <n> to <list name> (id <list_id>). Total in account: <n>.
Batches created: <list ids>. Each batch <count> contacts.
```
