---
name: generate-image
description: Generates blog hero and social channel images for The Mahjong Tarot. Loads the writer's pre-authored `image-prompts.json`, validates it against the designer's style guide, patches structural issues, and calls the Gemini API. The designer does NOT rewrite creative prompts — the writer owns that brief.
trigger: Called by mahjong-studio pipeline, OR autonomously by Claude Code Routine when unimaged slugs with complete `image-prompts.json` are found.
---

# Generate Image — Designer Skill

Generation-focused skill. The writer authors image prompts as part of writing the content (they know the emotional core best). The designer loads those prompts, validates structure, and calls the image API reliably.

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

## Step 2 — Load and validate the writer's prompts

The writer authored `content/topics/<folder>/image-prompts.json` as the final step of writing. You do NOT rewrite it — you load, validate, and pass the prompts to Gemini.

### 2a. Load the JSON

Read `content/topics/<folder>/image-prompts.json`. If the file does not exist, STOP and report to the human — the writer must be rerun. Do not fabricate prompts.

### 2b. Validate against the style guide

Read `agents/designer/context/style-guide.md` as reference, then scan each entry:

- Every entry has `image_style` (HUMAN / TEXT / SCENE), `aspect_ratio`, `dimensions`, `prompt`
- Styles are mixed within the topic — flag if 3+ entries share a style (does not apply to the FGF card pair described below)
- Aspect ratios match the file type:

| Content type | Aspect | Target dimensions | Max KB |
|---|---|---|---|
| `blog-*` | 16:9 | 1200×630 | 200 |
| `*-facebook-*` | 16:9 | 1200×630 | 200 |
| `*-instagram` | 1:1 | 1080×1080 | 150 |
| `card` / `card-vn` | 1:1 | 1080×1080 | 150 |

- Facebook EN and Facebook VN share one image — expect one prompt covering both
- Every `prompt` ends with `No watermarks or Western zodiac imagery anywhere in the image.` — append it to any prompt that's missing it
- **Feel Good Friday affirmation cards.** Every folder matching `YYYY-MM-DD-feel-good-<topic>` MUST include two TEXT-style entries with `content_type: card` (English) and `content_type: card-vn` (Vietnamese). Both use the Journal Page style (antique inked calligraphy on aged cream paper). Output filenames: `<url-slug>-card.png` and `<url-slug>-card-vn.png`. If either is missing from a FGF folder, STOP and flag — do not fabricate the prompt yourself. This is distinct from the Mahjong Mirror `card` field (a reference to a specific deck tile on Wednesday posts), which is a different concept: the Wednesday field is literally spelled `"card": "<card name>"` inside an entry, not `content_type: card`.
- Mahjong Mirror deck `card` *field* appears only on `wed-*.md` entries — flag violations (still applies to Wednesday entries only; unrelated to FGF card content_type above)

### 2c. Patch or flag

- **Structural fixes** (missing tail sentence, obvious aspect ratio typo) — patch the JSON in place, note the patch in your final report
- **Creative concerns** (concept feels off, wrong tone) — do NOT rewrite. Generate what the writer asked for and flag the concern to the human

### 2d. Continue to generation

No notification step here — the writer already notified the humans that prompts are ready for review. Proceed directly to Step 3.

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
