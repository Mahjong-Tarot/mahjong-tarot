---
name: notify-social-media
description: Sends a social media handoff email to the social media manager (Hien Dang) after a blog post is published. Attaches social markdown captions, image-prompts.json, and hero images as .webp files. If attachments exceed 5 MB or 5 files, uploads images to Supabase storage bucket "social-media" and sends download links instead. Invoke after every blog post publish — whenever the web-developer agent finishes building and committing a new post.
---

# Notify Social Media — Handoff Email

Sends Hien Dang everything she needs to post on social channels: the live URL, caption drafts, image prompts, and generated images.

---

## Inputs

Received from the calling agent (web-developer):
- `SLUG` — the published post slug (e.g. `fire-horse-travel-danger-2026`)
- `BLOG_TYPE` — `fire-horse` / `mahjong-mirror` / `feel-good-friday`
- `POST_TITLE` — title from the blog front matter
- `POST_DATE` — publish date from the blog front matter

---

## Step 1 — Load env vars

```bash
_ENV_FILE=$([ -f .env.local ] && echo .env.local || echo .env)

RESEND_API_KEY=$(grep 'RESEND_API_KEY' "$_ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'")
RESEND_FROM=$(grep 'RESEND_FROM' "$_ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'")
RESEND_TO_SOCIAL=$(grep 'RESEND_TO_SOCIAL_MEDIA' "$_ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'")

# Supabase — try multiple key names in precedence order
SUPABASE_URL=$(grep -m1 'NEXT_PUBLIC_SUPABASE_URL\|PUBLIC_SUPABASE_URL\b' "$_ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'")
SUPABASE_SERVICE_KEY=$(grep -m1 'PUBLIC_SUPABASE_SERVICE_KEY\|SUPABASE_SERVICE_ROLE_KEY\b' "$_ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'")
```

Stop and report if any of these are empty: `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_TO_SOCIAL`.
Supabase vars are only required if the attachment fallback is triggered — note their absence but continue.

---

## Step 2 — Collect assets

```bash
SLUG="<slug>"
TOPIC_DIR="content/topics/${SLUG}"
```

**Social captions** — all `.md` files in `$TOPIC_DIR` except `blog-*.md`, `seo-*.md`, and `image-prompts.md`:
```bash
SOCIAL_FILES=$(find "$TOPIC_DIR" -maxdepth 1 -name "*.md" \
  ! -name "blog-*.md" ! -name "seo-*.md" ! -name "image-prompts.md" | sort)
```

**Image prompts JSON:**
```bash
PROMPTS_JSON="${TOPIC_DIR}/image-prompts.json"
# Include if it exists; skip silently if not
```

**Images** — all `.webp` files in `$TOPIC_DIR`:
```bash
IMAGE_FILES=$(find "$TOPIC_DIR" -maxdepth 1 -name "*.webp" | sort)
IMAGE_COUNT=$(echo "$IMAGE_FILES" | grep -c '.webp' || echo 0)
IMAGE_TOTAL_KB=$(du -ck $IMAGE_FILES 2>/dev/null | tail -1 | cut -f1)
IMAGE_TOTAL_MB=$(echo "scale=1; $IMAGE_TOTAL_KB / 1024" | bc)
```

**Blog type label** (for email header):
```
fire-horse        → "Fire Horse"
mahjong-mirror    → "Mahjong Mirror"
feel-good-friday  → "Feel Good Friday"
```

---

## Step 3 — Decide attachment vs. Supabase fallback

- If `IMAGE_COUNT ≤ 5` AND `IMAGE_TOTAL_MB < 5` → **attach images directly** (Step 4A)
- Otherwise → **upload to Supabase, send links** (Step 4B)

---

## Step 4A — Send email with attachments

Build the `IMAGES_SECTION` HTML:
```html
<p style="margin:0;color:#0D0D0D;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;">
  Generated images are attached as <code style="background:#fff;padding:1px 4px;border-radius:2px;">.webp</code> files
  (<strong>{{IMAGE_COUNT}} file(s), {{IMAGE_TOTAL_MB}} MB</strong>).
  Open directly or import into Canva, Figma, or your scheduling tool.
</p>
```

Build the `SOCIAL_FILES_LIST` HTML — one monospace line per file:
```html
<p style="margin:0 0 4px;color:#1B1F3B;font-family:'Courier New',Courier,monospace;font-size:13px;">mon-facebook-en.md</p>
<!-- repeat for each file -->
```

Read the HTML template from `.claude/skills/notify-social-media/assets/social-media-handoff.html`.
Substitute all `{{PLACEHOLDER}}` values. Write the rendered HTML to `/tmp/social-handoff-${SLUG}.html`.

Build the Resend API payload. Attachments array includes:
- Every social `.md` file (content-type: `text/markdown`)
- `image-prompts.json` if it exists (content-type: `application/json`)
- Every `.webp` image (content-type: `image/webp`)

For each file, base64-encode and add to the attachments array:
```bash
ATTACHMENT_B64=$(base64 -i "$FILE_PATH" | tr -d '\n')
```

Build JSON payload with Python (handles escaping reliably):
```python
import json, base64, os, subprocess

slug     = os.environ["SLUG"]
topic    = f"content/topics/{slug}"
html_path = f"/tmp/social-handoff-{slug}.html"

with open(html_path) as f:
    html_body = f.read()

attachments = []

# Social captions
for path in sorted([p for p in os.listdir(topic)
    if p.endswith(".md") and not p.startswith(("blog-", "seo-")) and p != "image-prompts.md"]):
    full = os.path.join(topic, path)
    with open(full, "rb") as f:
        attachments.append({"filename": path, "content": base64.b64encode(f.read()).decode()})

# Image prompts JSON
json_path = os.path.join(topic, "image-prompts.json")
if os.path.exists(json_path):
    with open(json_path, "rb") as f:
        attachments.append({"filename": "image-prompts.json", "content": base64.b64encode(f.read()).decode()})

# Images
for path in sorted([p for p in os.listdir(topic) if p.endswith(".webp")]):
    full = os.path.join(topic, path)
    with open(full, "rb") as f:
        attachments.append({"filename": path, "content": base64.b64encode(f.read()).decode()})

payload = {
    "from": os.environ["RESEND_FROM"],
    "to": [os.environ["RESEND_TO_SOCIAL"]],
    "subject": f"[Social Media] New post ready — {os.environ['POST_TITLE']}",
    "html": html_body,
    "attachments": attachments,
}

with open(f"/tmp/resend-payload-{slug}.json", "w") as f:
    json.dump(payload, f)

print("Payload written")
```

Send via Resend API:
```bash
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer ${RESEND_API_KEY}" \
  -H "Content-Type: application/json" \
  -d @"/tmp/resend-payload-${SLUG}.json")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -1)

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  echo "Email sent ✅  (HTTP $HTTP_CODE)"
  rm -f "/tmp/resend-payload-${SLUG}.json" "/tmp/social-handoff-${SLUG}.html"
else
  echo "Email failed (HTTP $HTTP_CODE): $BODY"
  echo "Falling back to Supabase upload..."
  # Run Step 4B
fi
```

If the send fails (non-2xx), fall through to Step 4B regardless of file size.

---

## Step 4B — Upload images to Supabase, send links

Only images are uploaded to Supabase (captions and JSON are always attached directly — they are tiny).

### Check/create bucket

```bash
BUCKET_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  "${SUPABASE_URL}/storage/v1/bucket/social-media" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}")

if [ "$BUCKET_STATUS" = "404" ]; then
  curl -s -X POST "${SUPABASE_URL}/storage/v1/bucket" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
    -H "apikey: ${SUPABASE_SERVICE_KEY}" \
    -H "Content-Type: application/json" \
    -d '{"id":"social-media","name":"social-media","public":true}'
  echo "Bucket created"
fi
```

If `SUPABASE_URL` or `SUPABASE_SERVICE_KEY` is empty, stop and log:
`ERROR: Supabase credentials missing — cannot upload images. Email aborted.`

### Upload each .webp file

```bash
IMAGE_LINKS=""
for IMAGE_PATH in $IMAGE_FILES; do
  FILENAME=$(basename "$IMAGE_PATH")
  UPLOAD_PATH="${SLUG}/${FILENAME}"

  UPLOAD_STATUS=$(curl -s -o /tmp/upload-response.json -w "%{http_code}" \
    -X POST "${SUPABASE_URL}/storage/v1/object/social-media/${UPLOAD_PATH}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
    -H "apikey: ${SUPABASE_SERVICE_KEY}" \
    -H "Content-Type: image/webp" \
    --data-binary @"$IMAGE_PATH")

  if [ "$UPLOAD_STATUS" -ge 200 ] && [ "$UPLOAD_STATUS" -lt 300 ]; then
    PUBLIC_URL="${SUPABASE_URL}/storage/v1/object/public/social-media/${UPLOAD_PATH}"
    IMAGE_LINKS="${IMAGE_LINKS}<p style=\"margin:0 0 6px;\"><a href=\"${PUBLIC_URL}\" style=\"color:#1B1F3B;font-family:'Courier New',Courier,monospace;font-size:13px;\">${FILENAME}</a></p>"
    echo "Uploaded: $FILENAME ✅"
  else
    echo "Upload failed for $FILENAME: $(cat /tmp/upload-response.json)"
    IMAGE_LINKS="${IMAGE_LINKS}<p style=\"margin:0 0 6px;color:#C0392B;font-family:Arial,sans-serif;font-size:13px;\">⚠ ${FILENAME} — upload failed</p>"
  fi
done
```

Build `IMAGES_SECTION` HTML with download links:
```html
<p style="margin:0 0 12px;color:#0D0D0D;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;">
  Images are hosted on Supabase. Click each link to download:
</p>
{{IMAGE_LINKS}}
```

Build payload without image attachments (social captions + JSON only), substitute updated `IMAGES_SECTION`, and send via the same Resend API curl call as Step 4A.

---

## Step 5 — Report

Log the outcome:
```
notify-social-media: DONE
  Recipient:   <RESEND_TO_SOCIAL>
  Post:        <POST_TITLE>
  URL:         <POST_URL>
  Attachments: <N social .md files> + image-prompts.json + <N images or "links (Supabase)">
  Status:      ✅ sent / ❌ failed
```

---

## Error handling

| Situation | Action |
|---|---|
| `RESEND_TO_SOCIAL_MEDIA` not set | Stop. Log error. Do not attempt send. |
| `RESEND_API_KEY` not set | Stop. Log error. |
| No social `.md` files found | Send email without caption attachments; note absence in email body |
| `image-prompts.json` missing | Skip that attachment silently |
| No `.webp` images found | Send email without image section; note absence |
| Supabase upload fails for one file | Note failure in email, continue with others |
| Both Resend send AND Supabase path fail | Log `FATAL: notification not sent for <slug>`. Do not retry — leave for human. |
