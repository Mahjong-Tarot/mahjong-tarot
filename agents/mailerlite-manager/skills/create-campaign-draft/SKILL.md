# SKILL: create-campaign-draft

Stage an email campaign in MailerLite as a draft, ready for Bill's review. Never sends.

## When to use

- User provides email copy and asks to "draft this in MailerLite"
- User asks for "3 variants" of an email — create one draft per variant
- The Writer Agent has produced `emails/drafts/YYYY-MM-DD.md` and the user says "push to MailerLite"

## Inputs

- **Subject line(s)** — one per variant
- **Body** — markdown or HTML. Convert markdown paragraphs to `<p>...</p>` tags.
- **Target group ID** — usually the latest `OCA Reactivation` group; ask if ambiguous
- **Variant count** — defaults to 1. If user says "give me N versions", create N drafts numbered V1..VN
- **Sender / reply-to** — defaults from persona. Only override on explicit request.

## Procedure

1. **Validate the group.** Confirm `active_count` > 0 and matches the user's expectation.
2. **Validate sender.** From and reply-to default to `Bill Hajdu <firepig@onlinechineseastrology.com>`. If a different sender is requested, do not assume it is verified — ask first.
3. **Pre-flight subject lines** with `suggest_subject_lines` (the validation tool, not generation). Surface any flags before creating.
4. **Build the HTML body:**
   - Each paragraph wrapped in `<p>...</p>`
   - Links as `<a href="...">...</a>`
   - Standard signature block:
     ```
     <p>Bill</p>
     <p>—<br>
     Bill Hajdu — The Firepig<br>
     <a href="http://mahjongtarot.com">mahjongtarot.com</a></p>
     ```
   - Do not insert images, tracking pixels, or unsubscribe footer markup — MailerLite injects those.
5. **Name the campaign** using the convention: `<list> — V<n> <angle> — <Month YYYY>`.
6. **Call `create_campaign`** with `type: "regular"`, `status` left to default (which is `draft`), `groups: [<id>]`. Capture the returned campaign id and `preview_url`.
7. **Repeat for each variant** if N > 1.
8. **Append to send-log:**
   ```
   | YYYY-MM-DD HH:MM | draft | <campaign name> | <recipient count> | preview: <url> |
   ```
9. **Output a table** of all drafts created: name, subject, recipient count, preview URL.

## Hard rules

- Status MUST be `draft`. Never `ready`, `scheduled`, or trigger a send.
- Never overwrite an existing draft. If the user wants to revise, create V<n+1>.
- The `from` field MUST be a verified sender. If unsure, run `get_auth_status` and check; if still unsure, ask.
- The reply-to MUST match the inbox the user will actually monitor. Default is `firepig@onlinechineseastrology.com`.
- For Sequence D / OCA list, target only the OCA Reactivation group — never `all_active_subscribers`.

## Output format

```
Drafted <n> campaigns in MailerLite, group <group name> (<count> recipients):

| # | Name | Subject | Preview |
|---|------|---------|---------|
| V1 | ... | ... | <preview_url> |
| V2 | ... | ... | ... |
```
