---
name: generate-image
description: Generates blog hero and social channel images using Gemini (gemini-3.1-flash-image-preview). Reads image prompts written by the Writer from content/topics/<slug>/image-prompts.md — does not write its own prompts. Works in pipeline mode (called by mahjong-studio) and autonomous mode. Uses curl + jq + base64 for generation and ffmpeg for WebP optimisation. No Python or Pillow required.
trigger: Called by mahjong-studio pipeline, OR autonomously by Claude Code Routine when unimaged slugs are found.
---

# Generate Image — Designer Skill

Reads prompts from the Writer's `image-prompts.md`. Calls Gemini via `curl` + `jq` + `base64`.
Converts raw PNG → WebP via `ffmpeg`. No Python or Pillow required.

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
    has_blog  = bool(glob.glob(os.path.join(slug_dir, "blog*.md")))
    has_hero  = bool(glob.glob(os.path.join(slug_dir, "*-hero.webp")))
    has_prompt = os.path.exists(os.path.join(slug_dir, "image-prompts.md"))
    if has_blog and has_prompt and not has_hero:
        slugs_needing_images.append(slug)

for s in slugs_needing_images:
    print(s)
```

If none found, stop and log: `No unimaged slugs found.`
If slugs are found but `image-prompts.md` is missing for any of them, stop and output:
`Writer has not finished prompts for: <slug list>. Run Writer first.`

---

## Step 2 — Resolve source

Check `working_files/` for a file whose name contains the slug or a recognisable excerpt of the topic title.

- Match found → set `SOURCE_PATH="working_files/<filename>"`
- No match → set `SOURCE_PATH=""`

---

## Step 3 — Read image prompts

Read `content/topics/<slug>/image-prompts.md` — written by the Writer. Do not modify it.

Extract `PROMPT` and `RATIO` (Aspect field) for each `## <channel>` block.

Channel → dimensions mapping:

| Channel | Aspect | Target dimensions | Max KB |
|---------|--------|------------------|--------|
| blog hero | 16:9 | 1200×630 | 200 |
| og (Facebook EN, Facebook VN, LinkedIn, X) | 16:9 | 1200×630 | 200 |
| social (Instagram) | 1:1 | 1080×1080 | 150 |

Facebook EN and Facebook VN share one `og` image — generate once, copy for both.

---

## Step 4 — Generate

Uses `curl` + `jq` + `base64` — no Python or SDK required.

Read `GEMINI_API_KEY` from `.env.local` (checked first) then `.env`:

```bash
GEMINI_API_KEY=$(grep -h 'GEMINI_API_KEY' .env.local .env 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")
SLUG="<slug>"
CHANNEL="<channel>"   # e.g., blog-hero, og, social
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

**With source image** (when Step 2 found a match at `$SOURCE_PATH`):

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

Check that `$RAW_PATH` is non-empty after the call. If empty, the API returned an error —
run the curl again with `| jq .` to see the error, shorten the prompt, and retry once.

Archive a permanent copy:
```bash
cp "$RAW_PATH" "content/topics/${SLUG}/${SLUG}-${CHANNEL}-original.png"
```

---

## Step 5 — Optimise to WebP

Uses `ffmpeg` — no Python or Pillow required.

```bash
# RATIO is "16:9" or "1:1" — read from image-prompts.md Aspect field
if [ "$RATIO" = "1:1" ]; then
  W=1080; H=1080; MAX_KB=150
else
  W=1200; H=630;  MAX_KB=200
fi

SOURCE="working_files/${SLUG}-${CHANNEL}-raw.png"
OUTPUT="content/topics/${SLUG}/${SLUG}-${CHANNEL}.webp"
mkdir -p "$(dirname "$OUTPUT")"

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
| `image-prompts.md` missing | Stop. Output: "Writer has not finished prompts for \<slug\>. Run Writer first." |
| API call returns empty file | Run curl again with `\| jq .` to see error. Shorten prompt and retry once. Log `❌` if still failing. |
| Image is too generic | Prompt is too abstract — ask Writer to revise the prompt in `image-prompts.md`, then retry Step 4. |
| Unwanted text or watermark | Ask Writer to add "No text, letters, numbers, symbols, or watermarks anywhere in the image." to the prompt. Retry. |
| `jq` not found | `brew install jq` |
| `ffmpeg` not found | `brew install ffmpeg` |
