---
name: mahjong-designer-thursday
description: Every Thursday at 8 AM Asia/Saigon, finds all topic folders that have written blog posts but no hero image, writes image prompts and generates hero images via the Gemini API, promotes WebP files to website/public/images/blog/, commits on a branch, opens a PR, and notifies Labs via Lark and email.
---

It is Thursday 8 AM Asia/Saigon. Today's date is YYYY-MM-DD.

Working directory: /Applications/E8/Innovations/mahjong-tarot

## Step 0 — Load credentials

```bash
_ENV_FILE=$([ -f .env.local ] && echo .env.local || echo .env)
GEMINI_API_KEY=$(grep 'GEMINI_API_KEY' "$_ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'")
RESEND_API_KEY=$(grep 'RESEND_API_KEY' "$_ENV_FILE" | cut -d= -f2- | tr -d '"')
RESEND_FROM=$(grep 'RESEND_FROM' "$_ENV_FILE" | cut -d= -f2- | tr -d '"')
RESEND_TO=$(grep 'RESEND_TO' "$_ENV_FILE" | cut -d= -f2- | tr -d '"')
LABS_CHAT="oc_e5fe68740864439744b3fb0f31f81040"

if [ -z "$GEMINI_API_KEY" ]; then
  echo "ERROR: GEMINI_API_KEY not set in .env or .env.local"
  exit 1
fi
```

Verify `jq` and `ffmpeg` are available:
```bash
command -v jq   >/dev/null || { echo "ERROR: jq not found — brew install jq";    exit 1; }
command -v ffmpeg >/dev/null || { echo "ERROR: ffmpeg not found — brew install ffmpeg"; exit 1; }
```

## Step 1 — Discover slugs needing images

Find all topic folders that have a blog post file but no generated hero WebP:

```python
import os, glob

topics_dir = "content/topics"
unimaged = []

for slug in sorted(os.listdir(topics_dir)):
    slug_dir = os.path.join(topics_dir, slug)
    if not os.path.isdir(slug_dir):
        continue
    has_blog  = bool(glob.glob(os.path.join(slug_dir, "blog-*.md")))
    has_image = bool(glob.glob(os.path.join(slug_dir, "*.webp")))
    if has_blog and not has_image:
        unimaged.append(slug)

for s in unimaged:
    print(s)
```

If the list is empty, send a skip notification and stop:

```bash
LARK_MSG="🎨 Designer (Thursday) — nothing to image
All written posts already have hero images. No action taken."
lark-cli im +messages-send --chat-id "$LABS_CHAT" --as bot --text "$LARK_MSG" 2>/dev/null || true
```

**IMPORTANT:** Process slugs in calendar order (earliest publish date first) so the web-developer can pick them up in sequence.

## Step 2 — Pull latest and create branch

```bash
git pull origin main
git checkout -b designer/thursday-YYYY-MM-DD
mkdir -p working_files website/public/images/blog
```

## Step 3 — Process each slug

For each slug discovered in Step 1, run the full designer flow:

### 3a. Write image prompts

Invoke the designer generate-image skill at `agents/designer/skills/generate-image/SKILL.md` **Steps 2a–2e only** (prompt-writing phase):

1. Read `agents/designer/context/style-guide.md` in full
2. Read all content files in `content/topics/<slug>/`
3. Design visual concepts per channel
4. Write `content/topics/<slug>/image-prompts.md` and `image-prompts.json`

Check the run log at `agents/image-designer/output/run-log.md` to avoid repeating the same tone or motif as the last 2–3 images.

### 3b. Check for source image

```bash
SOURCE_PATH=$(ls working_files/${SLUG}-* 2>/dev/null | head -1)
# SOURCE_PATH will be empty if no match — generation proceeds without source conditioning
```

### 3c. Generate hero image

Read the blog channel prompt from `content/topics/<slug>/image-prompts.md` (the `## blog-<type>.md` section). Then:

```bash
SLUG="<current-slug>"
CHANNEL="blog-<type>"   # e.g. blog-fire-horse, blog-mahjong-mirror, blog-feel-good-friday
PROMPT="<full prompt text from image-prompts.md>"
RAW_PATH="working_files/${SLUG}-${CHANNEL}-raw.png"

PAYLOAD=$(jq -n --arg prompt "$PROMPT" '{
  contents: [{ parts: [{ text: $prompt }] }],
  generationConfig: { responseModalities: ["IMAGE"] }
}')

curl -s -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${GEMINI_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  | jq -r '.candidates[0].content.parts[] | select(.inlineData) | .inlineData.data' \
  | base64 --decode > "$RAW_PATH"
```

If `$SOURCE_PATH` is non-empty, include the source image in the payload (see `agents/designer/skills/generate-image/SKILL.md` Step 4 — "With source image" variant).

Check the raw file is non-empty. If empty, run curl again with `| jq .` to diagnose the error, shorten the prompt, and retry once. If still failing, log `❌` for this slug and continue to the next slug.

### 3d. Archive raw PNG

```bash
cp "$RAW_PATH" "content/topics/${SLUG}/${SLUG}-${CHANNEL}-original.png"
```

### 3e. Optimise to WebP

Determine ratio from `image-prompts.md` Aspect field for this channel (16:9 for blog):

```bash
W=1200; H=630; MAX_KB=200
OUTPUT="content/topics/${SLUG}/${SLUG}-${CHANNEL}.webp"

for Q in 82 72 65; do
  ffmpeg -y -i "$RAW_PATH" \
    -vf "scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}" \
    -q:v $Q "$OUTPUT" 2>/dev/null
  SIZE_KB=$(du -k "$OUTPUT" | cut -f1)
  if [ "$SIZE_KB" -le "$MAX_KB" ]; then
    echo "PASS  ${SIZE_KB} KB → $OUTPUT"
    break
  fi
done
[ "$SIZE_KB" -gt "$MAX_KB" ] && echo "WARN  ${SIZE_KB} KB exceeds ${MAX_KB} KB at q65 — using as-is"
```

### 3f. Promote image to website

```bash
cp "$OUTPUT" "website/public/images/blog/${SLUG}.webp"
echo "Promoted: website/public/images/blog/${SLUG}.webp (${SIZE_KB} KB)"
```

### 3g. Append to run log

```bash
mkdir -p agents/image-designer/output
echo "| YYYY-MM-DD HH:MM | ${SLUG} | gemini-3.1-flash-image-preview | generate-image | ${CHANNEL} | ${SIZE_KB} KB | ✅ |" \
  >> agents/image-designer/output/run-log.md
```

Repeat Steps 3a–3g for every slug in the list.

## Step 4 — Stage and commit

```bash
# Stage each processed slug's folder and its promoted image
# (repeat for every slug processed)
git add content/topics/<slug>/
git add website/public/images/blog/<slug>.webp
git add agents/image-designer/output/run-log.md

git commit -m "designer(thursday-YYYY-MM-DD): hero images for <comma-separated list of slugs>"
git push origin designer/thursday-YYYY-MM-DD
```

## Step 5 — Open PR

```bash
gh pr create \
  --title "Designer: Hero images — YYYY-MM-DD" \
  --base main \
  --body "$(cat <<'EOF'
## Images generated

<one line per slug: • <slug> — <X> KB — <style used>>

## Failures (if any)
<slug + error — or "None">

🤖 Generated by mahjong-designer-thursday scheduled task
EOF
)"
gh pr merge --merge --auto --delete-branch
git checkout main && git pull origin main
git branch -d designer/thursday-YYYY-MM-DD 2>/dev/null || true
```

## Step 6 — Notify

```bash
PROCESSED_LIST=$(echo "<slug1>, <slug2>, ...")
FAILED_LIST=$(echo "<failed slugs> or None")

LARK_MSG="🎨 Designer done — YYYY-MM-DD
Images: ${PROCESSED_LIST}
Failures: ${FAILED_LIST}
Web developer publishes on weekdays when ready."

EMAIL_SUBJECT="[Designer] Hero images done — YYYY-MM-DD"
EMAIL_BODY="Designer has generated hero images for the following posts:

${PROCESSED_LIST}

Failures: ${FAILED_LIST}

Images are in website/public/images/blog/. The web-developer will pick them up automatically on weekdays.
PR merged to main."

lark-cli im +messages-send --chat-id "$LABS_CHAT" --as bot --text "$LARK_MSG" 2>/dev/null || true

RESEND_API_KEY="$RESEND_API_KEY" resend emails send \
  --from "$RESEND_FROM" \
  --to $(echo "$RESEND_TO" | tr ',' ' ') \
  --subject "$EMAIL_SUBJECT" \
  --text "$EMAIL_BODY" 2>/dev/null || true
```
