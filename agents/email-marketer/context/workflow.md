# Email Marketer — Workflow

## Phase 1 — Find the latest published post

Read `content/content-calendar/content-calendar.md` and find the most recent entry with `STATUS: PUBLISHED`.

Note the slug, title, and publish date.

Then read `content/topics/<slug>/blog.md` to extract:
- Post title and subtitle
- Key takeaways or main points (for email body)
- Post URL: `https://mahjongtarot.com/blog/posts/<slug>`

---

## Phase 2 — Draft the nurture email

Using the post content and the lead's `source` (from the `leads` table), draft an email that:

- Opens personally (Hi {{name}},)
- References the latest post naturally — not as a hard sell
- Includes a clear link to read the full post
- Closes with a soft CTA appropriate to the lead's source:
  - `newsletter` → invite to explore the blog
  - `contact` → offer to answer questions
  - `readings` → gentle nudge toward booking
  - `mirror` → highlight a relevant Mirror feature

Save the draft to `agents/email-marketer/context/email-index.md` under the appropriate stage before sending. Confirm with the user if this is a new stage being added.

---

## Phase 3 — Query due leads

Query Supabase for leads ready to receive their next email:

```sql
SELECT id, email, name, source, stage, metadata
FROM public.leads
WHERE status = 'active'
  AND next_send_at <= now()
ORDER BY next_send_at ASC;
```

Use Supabase MCP tools (`mcp__supabase__*`) for all database operations.

---

## Phase 4 — Send emails

For each lead returned:

1. Look up their `stage` in `email-index.md` to get the subject and body
2. Personalise: substitute `{{name}}`, `{{source}}`, and any metadata fields
3. Send via Brevo transactional API:

```bash
curl -X POST https://api.brevo.com/v3/smtp/email \
  -H "api-key: $BREVO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sender": {"name": "Bill Hajdu", "email": "firepig@mahjongtarot.com"},
    "to": [{"email": "<lead_email>", "name": "<lead_name>"}],
    "subject": "<subject>",
    "htmlContent": "<html_body>"
  }'
```

4. On 2xx response → proceed to Phase 5
5. On error → log failure, skip update, continue to next lead

---

## Phase 5 — Update lead status

After a confirmed send:

```sql
UPDATE public.leads
SET
  stage = stage + 1,
  last_emailed_at = now(),
  next_send_at = now() + INTERVAL '<delay from email-index>',
  status = CASE
    WHEN stage + 1 > <total_stages> THEN 'completed'
    ELSE 'active'
  END
WHERE id = '<lead_id>';
```

If `stage + 1` exceeds the total number of stages in `email-index.md`, set `status = 'completed'`.

---

## Phase 6 — Report

After processing all due leads, output a summary:

```
Latest post used: <title> (<slug>)
Sent: X emails
Failed: Y emails (list IDs)
Completed sequence: Z leads
Still active: N leads
Next batch due: <earliest next_send_at>
```

---

## Error handling

| Situation | Action |
|-----------|--------|
| No `STATUS: PUBLISHED` post found | Stop and tell the user — do not send without content |
| `email-index.md` is empty | Draft from the latest post (Phase 1-2), then confirm with user before sending |
| Brevo API key missing | Stop and ask user to set `BREVO_API_KEY` in environment |
| Supabase query fails | Stop and report the error — do not guess |
| Lead has no name | Use "there" as fallback (e.g. "Hi there,") |
| Send fails after 2 retries | Log as failed, move to next lead |
