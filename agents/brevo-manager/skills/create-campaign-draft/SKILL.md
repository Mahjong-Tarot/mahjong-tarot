# SKILL: create-campaign-draft

Stage one or more email campaigns in Brevo, scheduled but unsent, with test sends pre-flighted to confirmation inboxes.

## When to use

- User provides email copy and asks to "schedule this in Brevo"
- User asks for a multi-batch send to respect the 300/day cap
- The Writer Agent has produced `emails/drafts/YYYY-MM-DD.md` and the user says "push to Brevo"

## Inputs

- **Subject line(s)** — one per variant, or shared across batches
- **Body** — markdown or HTML. Convert markdown paragraphs to `<p>...</p>`.
- **Target list ID(s)** — usually one list per batch. ≤ 290 recipients each.
- **Schedule** — UTC timestamps. Standard pattern: 14:00Z (= 10am EDT) on Tue/Wed/Thu.
- **Test recipients** — default `dhajdu@gmail.com` + `yon@edge8.co`. Both must already exist as contacts AND be in at least one list, or Brevo's `sendTest` returns 400.

## Procedure

1. **Verify sender.** `GET /v3/senders` — confirm sender id `2` is `active: true`.
2. **Verify domain auth.** `GET /v3/senders/domains` — confirm `authenticated: true` for `onlinechineseastrology.com`.
3. **Build HTML body.** Each paragraph wrapped in `<p>...</p>`. Standard signature:
   ```
   <p>Bill</p>
   <p>—<br>
   Bill Hajdu — The Firepig<br>
   <a href="http://mahjongtarot.com">mahjongtarot.com</a></p>
   ```
   Do NOT add unsubscribe or physical address — Brevo injects them.
4. **Pre-flight test recipients.** Ensure both test inboxes are in at least one Brevo list.
5. **POST `/v3/emailCampaigns`** for each batch:
   - `name`, `subject`, `htmlContent`
   - `sender: {id: 2}`
   - `replyTo: "firepig@onlinechineseastrology.com"`
   - `type: "classic"`
   - `recipients: {listIds: [<batch list>]}`
   - `scheduledAt: "<YYYY-MM-DD>T14:00:00Z"`
6. **POST `/v3/emailCampaigns/{id}/sendTest`** for the first campaign:
   - `emailTo: ["dhajdu@gmail.com", "yon@edge8.co"]` → 204 on success
7. **Log to send-log.md** for each schedule + each test.
8. **Output a table** of all created campaigns: id, name, recipients, scheduled UTC.

## Hard rules

- Status must end as `queued` (scheduled). Never `instant` unless user says "send now".
- `from` is sender id 2 unless user names a different verified sender.
- Reply-to: `firepig@onlinechineseastrology.com` unless overridden.
- Daily send window: campaigns at least 24h apart on Free plan.
- Test send refusals on missing-list recipients: silently add the test addresses to a generic list (id 2) and retry.
