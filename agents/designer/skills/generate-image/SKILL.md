---
name: generate-image
description: Generates blog hero and social channel images for The Mahjong Tarot. Phase 1 — writes image-prompts.md by reading the topic content and applying the designer's style guide. Phase 2 — calls the Gemini API to generate images from those prompts. The designer owns both phases. The writer does not produce image prompts.
trigger: Called by mahjong-studio pipeline, OR autonomously by Claude Code Routine when unimaged slugs are found.
---

# Generate Image — Designer Skill

Two-phase skill. The designer reads content, decides the visual concept, writes prompts, then generates images. Prompt quality is a creative act — it belongs here, not in the writer.

Uses `gemini-3.1-flash-image-preview` via `generate_content`. Supports source image conditioning from `working_files/`.

---

## Inputs

When called from **mahjong-studio**: receives `slug` and `channel` list.
When called **autonomously**: discovers slugs itself (Step 1).

---

## Step 1 — Discover slugs (autonomous mode only)

Skip this step when called from mahjong-studio with a slug already provided.

```python
import os, glob

topics_dir = "content/topics"
slugs_needing_images = []

for slug in sorted(os.listdir(topics_dir)):
    slug_dir = os.path.join(topics_dir, slug)
    if not os.path.isdir(slug_dir):
        continue
    # Blog files are named blog-*.md, not blog.md
    has_blog = bool(glob.glob(os.path.join(slug_dir, "blog-*.md")))
    has_hero = bool(glob.glob(os.path.join(slug_dir, "*-hero.webp")))
    if has_blog and not has_hero:
        slugs_needing_images.append(slug)

for s in slugs_needing_images:
    print(s)
```

If none found, stop and log: `No unimaged slugs found.`

---

## Step 2 — Write image prompts

This step produces `image-prompts.md` and `image-prompts.json`. Run before any generation.

### 2a. Read the style guide

Read `agents/designer/context/style-guide.md` in full. Pay attention to:
- **Brand palette** — use plain English color names from this palette in every prompt
- **Image prompt guidelines** — no repetitive motifs, vary medium and subject, stretch beyond the obvious first idea
- **Style inspiration categories** — use these as a menu to choose from, or combine/invent
- **Non-negotiables** — no text in images, no generic stock, women never face camera directly

### 2b. Read the topic content

List all files in `content/topics/<slug>/`. Read:
- The blog markdown (`blog-fire-horse.md`, `blog-mahjong-mirror.md`, or `blog-feel-good-friday.md`)
- Every social file (`mon-facebook-en.md`, `mon-instagram.md`, etc.)

For each file, identify:
- The **emotional core** — what does the reader feel, fear, or want?
- The **most specific concrete nouns** in the text — objects, places, physical things
- The **tone** — provocative (Fire Horse), educational (Mahjong Mirror), or warm/uplifting (Feel Good Friday)?

### 2c. Design a visual concept per file

For each content file, decide:
- **Image style** — pick from the style guide (e.g., The Oracle Portrait, Hands of the Reader, Nature as Metaphor, Object Still Life) or invent a style if none fits
- **Subject and composition** — specific scene that captures the emotional core without illustrating it literally
- **Tone** — dark / light / mixed. Check `agents/image-designer/output/run-log.md` — if the last 2–3 images used the same tone, use a different one

Rules:
- No two files in the same week should use the same hero motif (tiles, flames, candles, etc.)
- Facebook and blog images for the same day can share a style family but must have distinct compositions
- Instagram images are 1:1 — compositions must read well as a square without cropping

Channel → aspect ratio mapping:

| Content type | Aspect | Target dimensions | Max KB |
|---|---|---|---|
| `blog-*` | 16:9 | 1200×630 | 200 |
| `*-facebook-*` | 16:9 | 1200×630 | 200 |
| `*-instagram` | 1:1 | 1080×1080 | 150 |

Facebook EN and Facebook VN share one image — write one prompt, apply to both.

### 2d. Write image-prompts.md

Save to `content/topics/<slug>/image-prompts.md`.

```markdown
# Image Prompts — <Post Title>

**Topic:** <one sentence on the core idea>

**Phrases:** *(key lines from the post for post-production text overlays)*
- "<phrase 1>"
- "<phrase 2>"

---

## <content-filename>.md

**Concept:** <what the image shows and why it works for this content>
**Image Style:** <style name, e.g., HUMAN — The Oracle Portrait>
**Aspect:** <16:9 (1200x630) or 1:1 (1080x1080)>

Prompt: <full Gemini prompt — concrete objects, scene, lighting, surface, colors in plain English. Ends with: No watermarks or Western zodiac imagery anywhere in the image.>

---
```

Repeat the `## <filename>` block for every content file in the folder.

### 2e. Write image-prompts.json

Save to `content/topics/<slug>/image-prompts.json`.

```json
{
  "slug": "<slug>",
  "files": [
    {
      "content_type": "<content-filename-without-.md>",
      "aspect_ratio": "16:9",
      "prompt": "<full prompt text>"
    }
  ]
}
```

### 2f. Notify and pause (pipeline mode) / notify and continue (autonomous mode)

Send notifications regardless of mode, then handle the pause.

```bash
_ENV_FILE=$([ -f .env.local ] && echo .env.local || echo .env)
RESEND_FROM=$(grep 'RESEND_FROM' "$_ENV_FILE" | cut -d= -f2- | tr -d '"')
RESEND_TO=$(grep 'RESEND_TO' "$_ENV_FILE" | cut -d= -f2- | tr -d '"')
RESEND_API_KEY=$(grep 'RESEND_API_KEY' "$_ENV_FILE" | cut -d= -f2- | tr -d '"')
LABS_CHAT="oc_e5fe68740864439744b3fb0f31f81040"

LARK_MSG="🎨 Image prompts ready — <slug>
$(grep '^## ' content/topics/<slug>/image-prompts.md | sed 's/## /• /' | head -6)
Review content/topics/<slug>/image-prompts.md before images are generated."

EMAIL_SUBJECT="[Designer] Image prompts ready — <slug>"
EMAIL_BODY="Designer has written image prompts for <slug>.

Prompts written for:
$(grep '^## ' content/topics/<slug>/image-prompts.md | sed 's/## /• /')

Review content/topics/<slug>/image-prompts.md.
Edit any prompt in the file, then reply to continue with image generation."

lark-cli im +messages-send --chat-id "$LABS_CHAT" --as bot --text "$LARK_MSG" 2>/dev/null || true

RESEND_API_KEY="$RESEND_API_KEY" resend emails send \
  --from "$RESEND_FROM" \
  --to $(echo "$RESEND_TO" | tr ',' ' ') \
  --subject "$EMAIL_SUBJECT" \
  --text "$EMAIL_BODY" 2>/dev/null || true
```

**Pipeline mode** — pause after notifying:
```
IMAGE PROMPTS WRITTEN ✓  (Labs + email notified)

  • blog-<type>       (16:9) — <style>: <one-line concept>
  • mon-facebook-en   (16:9) — <style>: <one-line concept>
  • mon-instagram     (1:1)  — <style>: <one-line concept>

Review content/topics/<slug>/image-prompts.md.
"approved" to generate, "regenerate: <file>" to rewrite a specific prompt.
```

**Autonomous mode** — continue directly to Step 3.

---

## Step 3 — Resolve source

Check `working_files/` for a file whose name contains the slug or a recognisable excerpt of the topic title.

- Match found → set `source_path = "working_files/<filename>"`
- No match → set `source_path = None`

---

## Step 4 — Generate

For each entry in `image-prompts.md`, run the generation call. Run one file at a time — do not batch.

Read `PROMPT` and `RATIO` from the relevant `## <file>.md` section of `image-prompts.md`.

Uses `curl` + `jq` + `base64` — no Python or SDK required.

Read `GEMINI_API_KEY` from `.env.local` (checked first) then `.env`:

```bash
GEMINI_API_KEY=$(grep -h 'GEMINI_API_KEY' .env.local .env 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")
SLUG="<slug>"
CHANNEL="<channel>"   # e.g., blog-fire-horse, mon-facebook-en, mon-instagram
RAW_PATH="working_files/${SLUG}-${CHANNEL}-raw.png"
mkdir -p working_files
```

**Without source image:**

```bash
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

**With source image** (when Step 3 found a match at `$SOURCE_PATH`):

```bash
SOURCE_B64=$(base64 -i "$SOURCE_PATH")
PAYLOAD=$(jq -n --arg prompt "$PROMPT" --arg img "$SOURCE_B64" '{
  contents: [{ parts: [{ text: $prompt }, { inlineData: { mimeType: "image/png", data: $img } }] }],
  generationConfig: { responseModalities: ["IMAGE"] }
}')

curl -s -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${GEMINI_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  | jq -r '.candidates[0].content.parts[] | select(.inlineData) | .inlineData.data' \
  | base64 --decode > "$RAW_PATH"
```

Check that `$RAW_PATH` is non-empty after the call. If it is empty, the API returned an error — run the curl again with `| jq .` to see the error message, shorten the prompt, and retry once.

Archive a permanent copy:
```bash
cp "$RAW_PATH" "content/topics/${SLUG}/${SLUG}-${CHANNEL}-original.png"
```

---

## Step 5 — Optimise to WebP

Uses `ffmpeg` (already installed). No Python or Pillow required.

Set dimensions based on `RATIO` from `image-prompts.md`:

```bash
# RATIO is "16:9" or "1:1" — set from image-prompts.md Aspect field
if [ "$RATIO" = "1:1" ]; then
  W=1080; H=1080; MAX_KB=150
else
  W=1200; H=630;  MAX_KB=200
fi

SOURCE="working_files/${SLUG}-${CHANNEL}-raw.png"
OUTPUT="content/topics/${SLUG}/${SLUG}-${CHANNEL}.webp"
mkdir -p "$(dirname "$OUTPUT")"

# Scale to cover, crop to exact dimensions, try quality steps until under MAX_KB
for Q in 82 72 65; do
  ffmpeg -y -i "$SOURCE" \
    -vf "scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}" \
    -q:v $Q "$OUTPUT" 2>/dev/null
  SIZE_KB=$(du -k "$OUTPUT" | cut -f1)
  if [ "$SIZE_KB" -le "$MAX_KB" ]; then
    echo "PASS  ${SIZE_KB} KB → $OUTPUT"
    break
  fi
done

if [ "$SIZE_KB" -gt "$MAX_KB" ]; then
  echo "WARN  ${SIZE_KB} KB exceeds ${MAX_KB} KB at q65 — using as-is"
fi
```

---

## Step 6 — Log results

Append to `agents/image-designer/output/run-log.md`:

```
| YYYY-MM-DD HH:MM | <slug> | gemini-3.1-flash-image-preview | generate-image | <channel> | <size KB> | ✅ |
```

---

## Error handling

| Situation | Action |
|---|---|
| `GEMINI_API_KEY` not set | Stop. Ask user (pipeline) or log and halt (autonomous). |
| API call fails | Shorten the prompt, retry once. Log `❌` if still failing. |
| Image is too generic | Prompt is too abstract — replace abstract words with specific objects, retry Step 4. |
| Unwanted text or watermark | Add "No text, letters, numbers, symbols, or watermarks anywhere in the image." Retry. |
| Prompt contains abstract nouns | Replace with physical objects (e.g., "opposing forces" → "a cracked compass and a spinning needle"). |
| `jq` not found | `brew install jq` |
| `ffmpeg` not found | `brew install ffmpeg` |
| `cwebp` not found | Not needed — ffmpeg handles WebP |
