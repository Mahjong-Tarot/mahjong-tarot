---
name: scan-topics
description: Scans all folders in content/topics/, checks run-log.md to find slugs without a generated hero image, and generates missing images using the generate-image workflow.
trigger: Every Thursday 2:00 AM cron, or manual invocation via "@image-designer scan-topics"
---

# Scan Topics Workflow

## Purpose

Ensure every topic folder in `content/topics/` has a hero image. On each run, scan all topic folders, cross-reference the run log to find any slug that has never had a successful hero image generated, and generate the missing ones.

---

## Step 1 — List all topic slugs

```python
import os

topics_dir = "content/topics"
slugs = [
    name for name in os.listdir(topics_dir)
    if os.path.isdir(os.path.join(topics_dir, name))
]
print("Found slugs:", slugs)
```

---

## Step 2 — Read the run log

Read `agents/image-designer/output/run-log.md`. If the file does not exist, treat it as empty (all slugs need generation).

Parse every row and collect slugs that have a `hero` entry with status `✅ OK`:

```python
import re

run_log_path = "agents/image-designer/output/run-log.md"
generated = set()

if os.path.exists(run_log_path):
    with open(run_log_path) as f:
        for line in f:
            # Row format: | date | slug | type | workflow | path | size | status |
            parts = [p.strip() for p in line.strip().split("|") if p.strip()]
            if len(parts) >= 7:
                slug_col  = parts[1]
                type_col  = parts[2]
                status_col = parts[6]
                if type_col == "hero" and "✅" in status_col:
                    generated.add(slug_col)

missing = [s for s in slugs if s not in generated]
print("Already generated:", sorted(generated))
print("Needs generation:", missing)
```

---

## Step 3 — Generate missing images

For each slug in `missing`:

### 3a. Read context (optional)

Read `content/topics/<slug>/blog.md` if it exists — extract the title and any emotional angle or key visual subjects to inform the prompt. If `blog.md` does not exist, use the slug itself to construct the prompt (convert hyphens to spaces, title-case).

### 3b. Select a style

Choose the most appropriate brand style based on the blog content or slug name:

| Slug contains… | Default style |
|----------------|--------------|
| fire, horse, dragon, tiger, metal, water, wood, earth | Elemental Drama |
| moon, star, celestial, cosmos, fate, destiny, year | Celestial & Mystical |
| rat, ox, rabbit, snake, sheep, monkey, rooster, dog, pig | Zodiac Portraiture |
| mahjong, tile, lantern, lotus, mirror, fortune | Sacred & Symbolic |
| spring, summer, autumn, winter, blossom, season | Seasonal & Nature |
| (no match) | Celestial & Mystical |

### 3c. Construct the Gemini prompt

Use the brand prompt template from `agents/image-designer/skills/generate-image/SKILL.md`. Proceed directly to generation — no user confirmation needed.

### 3d. Call the Gemini API

Use `GEMINI_API_KEY` from `.env`. Always run via `/opt/anaconda3/envs/mahjong-tarot/bin/python`.

```python
from google import genai
from google.genai import types
from dotenv import load_dotenv
import os

load_dotenv()
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

response = client.models.generate_images(
    model="imagen-4.0-generate-001",
    prompt=PROMPT,
    config=types.GenerateImagesConfig(
        number_of_images=1,
        aspect_ratio="16:9",
    ),
)

raw_path = f"working_files/{SLUG}-raw.png"
os.makedirs("working_files", exist_ok=True)
with open(raw_path, "wb") as f:
    f.write(response.generated_images[0].image.image_bytes)
print(f"Saved raw → {raw_path}")
```

If the API call fails, simplify the prompt (remove hex codes, reduce specificity) and retry once. If still failing, log the error and move on to the next slug — do not halt the entire run.

### 3e. Save the PNG archive

```python
import shutil

archive_path = f"content/topics/{SLUG}/{SLUG}-hero-original.png"
os.makedirs(os.path.dirname(archive_path), exist_ok=True)
shutil.copy2(raw_path, archive_path)
print(f"Archived → {archive_path}")
```

### 3f. Optimise to WebP

```python
from PIL import Image
import sys

source_path = f"working_files/{SLUG}-raw.png"
target_w, target_h, max_kb = 1200, 630, 200
output_path = f"content/topics/{SLUG}/{SLUG}-hero.webp"
os.makedirs(os.path.dirname(output_path), exist_ok=True)

img = Image.open(source_path).convert("RGB")

img_ratio    = img.width / img.height
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
        print(f"PASS  {size_kb:.1f}KB → {output_path}")
        break
else:
    print(f"FAIL  {size_kb:.1f}KB exceeds {max_kb}KB at q65")
    sys.exit(1)
```

---

## Step 4 — Write the run log entry

Append one row per slug to `agents/image-designer/output/run-log.md`:

On success:
```
| YYYY-MM-DD HH:MM | <slug> | hero | scan-topics | content/topics/<slug>/<slug>-hero.webp | <size_kb> KB | ✅ OK |
```

On failure:
```
| YYYY-MM-DD HH:MM | <slug> | hero | scan-topics | — | — | ❌ FAILED: <reason> |
```

---

## Step 5 — Report summary

After processing all missing slugs, output a summary:

```
Scan Topics — YYYY-MM-DD HH:MM
────────────────────────────────
Total topic folders:   <N>
Already had images:    <N>
Generated this run:    <N>
Failed:                <N>

Generated:
  ✅ <slug> → content/topics/<slug>/<slug>-hero.webp (<size> KB)
  ...

Failed:
  ❌ <slug> — <reason>
  ...
```

---

## Edge Cases

| Situation | Action |
|-----------|--------|
| `content/topics/` is empty | Log "No topic folders found" and exit cleanly |
| `run-log.md` does not exist | Treat all slugs as needing generation |
| `blog.md` missing for a slug | Construct prompt from slug name alone; note gap in log |
| API call fails after retry | Log ❌ for that slug; continue with remaining slugs |
| Generated image has baked-in text | Retry with: "No text, letters, numbers, symbols, or watermarks anywhere in the image." |
| Image fails size gate at q65 | Log ❌; do not write the WebP; continue |
| `GEMINI_API_KEY` not set | Stop the entire run. Report: "GEMINI_API_KEY is not set — cannot generate images." |
