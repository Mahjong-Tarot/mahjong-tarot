---
name: generate-image
description: Generates blog hero and social channel images for The Mahjong Tarot using Gemini (gemini-3.1-flash-image-preview). Single canonical image generation skill. Works in both pipeline mode (called by mahjong-studio) and autonomous mode (called by Claude Code Routine). Always runs resolve-source first.
trigger: Called by mahjong-studio pipeline, OR autonomously by Claude Code Routine when unimaged slugs are found.
---

# Generate Image — Designer Skill

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
    has_blog = os.path.exists(os.path.join(slug_dir, "blog.md"))
    has_hero = bool(glob.glob(os.path.join(slug_dir, "*-hero.webp")))
    if has_blog and not has_hero:
        slugs_needing_images.append(slug)

for s in slugs_needing_images:
    print(s)
```

If none found, stop and log: `No unimaged slugs found.`

---

## Step 2 — Resolve source

Run `agents/image-designer/workflow/resolve-source.md` for each slug.

- Match found → set `source_path = "working_files/<filename>"`
- No match → set `source_path = None`

---

## Step 3 — Build prompt

Read `content/topics/<slug>/blog.md`. Apply two-path prompt construction:

**Path A — Known real-world subject** (real person, brand, team, cultural event):
1. List 2–3 specific, visually concrete objects associated with the subject
2. Build prompt from those objects in a specific scene or arrangement

**Path B — Concept or unknown topic:**
1. Extract the most specific concrete nouns from the post text
2. No abstract words — replace with physical objects or details

**Prompt structure:**
```
[Scene or arrangement of specific concrete objects].
[Lighting and surface details — specific, not generic].
Colors: [plain English color names only — no hex codes].
No text, letters, numbers, symbols, watermarks, or Western zodiac imagery anywhere in the image.
```

**Tone — alternate dark / light across posts:**

| Tone | Background | Accents |
|------|-----------|---------|
| Dark | Deep midnight navy | Warm antique gold, deep crimson |
| Light | Soft cream or warm white | Antique gold, navy or crimson accents |
| Mixed | One dark + one light element | Contrast within the frame |

Check `agents/image-designer/output/run-log.md` — if last 2–3 images used dark, use light or mixed.

Build one prompt per channel using the aspect ratio mapping:

| Channel | Aspect ratio | Target dimensions | Max KB |
|---------|-------------|------------------|--------|
| hero (website) | 16:9 | 1200×630 | 200 |
| og (Facebook EN, Facebook VN, LinkedIn, X) | 16:9 | 1200×630 | 200 |
| social (Instagram) | 1:1 | 1080×1080 | 150 |

Facebook EN and Facebook VN share one `og` image — generate once.

---

## Step 4 — Generate

Run using: `/opt/anaconda3/envs/mahjong-tarot/bin/python`

```python
from google import genai
from PIL import Image
from dotenv import load_dotenv
import os

load_dotenv()
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

SLUG = "<slug>"
CHANNEL = "<channel>"       # hero, og, social
PROMPT = "<constructed prompt>"
RAW_PATH = f"working_files/{SLUG}-{CHANNEL}-raw.png"

source_path = None          # set to "working_files/<file>" if resolve-source matched

contents = [PROMPT]
if source_path:
    contents.append(Image.open(source_path))

os.makedirs("working_files", exist_ok=True)

response = client.models.generate_content(
    model="gemini-3.1-flash-image-preview",
    contents=contents,
)
for part in response.parts:
    if part.inline_data is not None:
        part.as_image().save(RAW_PATH)
        print(f"Saved raw PNG → {RAW_PATH}")
        break
```

Archive a permanent copy: `content/topics/<slug>/<slug>-<channel>-original.png`

If the API call fails, shorten the prompt and retry once.

---

## Step 5 — Optimise to WebP

```python
from PIL import Image
import os, sys

SLUG = "<slug>"
CHANNEL = "<channel>"
SOURCE = f"working_files/{SLUG}-{CHANNEL}-raw.png"

specs = {
    "hero": (1200, 630, 200),
    "og":   (1200, 630, 200),
    "social": (1080, 1080, 150),
}
target_w, target_h, max_kb = specs[CHANNEL]
output_path = f"content/topics/{SLUG}/{SLUG}-{CHANNEL}.webp"
os.makedirs(os.path.dirname(output_path), exist_ok=True)

img = Image.open(SOURCE).convert("RGB")
img_ratio = img.width / img.height
target_ratio = target_w / target_h

if img_ratio > target_ratio:
    new_w = int(img.height * target_ratio)
    new_h = img.height
else:
    new_w = img.width
    new_h = int(img.width / target_ratio)

left = (img.width  - new_w) // 2
top  = (img.height - new_h) // 2
img  = img.crop((left, top, left + new_w, top + new_h))
img  = img.resize((target_w, target_h), Image.LANCZOS)

for quality in [82, 72, 65]:
    img.save(output_path, "webp", quality=quality)
    size_kb = os.path.getsize(output_path) / 1024
    if size_kb <= max_kb:
        print(f"PASS  {size_kb:.1f} KB → {output_path}")
        sys.exit(0)

print(f"FAIL  {size_kb:.1f} KB exceeds {max_kb} KB at q65")
sys.exit(1)
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
| Packages missing | `/opt/anaconda3/envs/mahjong-tarot/bin/pip install google-genai python-dotenv Pillow` |
