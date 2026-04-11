---
name: scan-topics
description: Reads content/topics/INDEX.md, finds every row where the Image column is "TO DO", generates a brand-aligned image for each one, saves it to content/topics/<slug>/, and updates INDEX.md with the full relative path.
trigger: Every Thursday 2:00 AM cron, or manual invocation via "@image-designer scan-topics"
---

# Scan Topics Workflow

## Purpose

`content/topics/INDEX.md` is the single source of truth for what images need to be generated. Every file row with `TO DO` in the Image column needs an image. This workflow reads INDEX.md, generates each missing image, and writes the output path back into the table.

---

## Image type by channel

| Channel value | Image type | Dimensions | Aspect | Max KB |
|---------------|------------|------------|--------|--------|
| Website (blog post) | `hero` | 1200 × 630 | 16:9 | 200 |
| Facebook EN | `og` | 1200 × 630 | 16:9 | 200 |
| Facebook VN | `og` | 1200 × 630 | 16:9 | 200 |
| Instagram | `social` | 1080 × 1080 | 1:1 | 150 |
| `—` or SEO | **skip** | — | — | — |

---

## Step 1 — Parse INDEX.md for TO DO rows

Read `content/topics/INDEX.md` and extract every row where the Image column is exactly `TO DO`.

```python
import re, os

index_path = "content/topics/INDEX.md"
with open(index_path) as f:
    content = f.read()

current_slug = None
tasks = []

for line in content.split("\n"):
    # Detect topic slug from heading: ### Topic: <slug>
    heading = re.match(r"###\s+Topic:\s+(.+)", line)
    if heading:
        current_slug = heading.group(1).strip()
        continue

    # Detect table row with TO DO in Image column
    if current_slug and "TO DO" in line and line.startswith("|"):
        parts = [p.strip() for p in line.split("|") if p.strip()]
        # Expected: File | Type | Day | Channel | Image | Published
        if len(parts) >= 5 and parts[4] == "TO DO":
            filename = parts[0].strip("`")
            channel  = parts[3]
            if channel == "—" or parts[1] == "SEO":
                continue  # skip SEO and no-image rows
            tasks.append({
                "slug":     current_slug,
                "filename": filename,
                "channel":  channel,
                "line":     line,   # original line — used for targeted replacement later
            })

print(f"Found {len(tasks)} images to generate")
for t in tasks:
    print(f"  {t['slug']} / {t['filename']} ({t['channel']})")
```

---

## Step 2 — Determine image type per task

For each task, resolve the image type and output dimensions:

```python
TYPE_MAP = {
    "Website":      ("hero",   1200, 630,  200, "16:9"),
    "Facebook EN":  ("og",     1200, 630,  200, "16:9"),
    "Facebook VN":  ("og",     1200, 630,  200, "16:9"),
    "Instagram":    ("social", 1080, 1080, 150, "1:1"),
}

for task in tasks:
    mapping = TYPE_MAP.get(task["channel"])
    if not mapping:
        print(f"SKIP unknown channel: {task['channel']}")
        task["skip"] = True
        continue
    task["image_type"], task["w"], task["h"], task["max_kb"], task["aspect"] = mapping
    task["skip"] = False
    base = os.path.splitext(task["filename"])[0]
    task["output_path"] = f"content/topics/{task['slug']}/{base}.webp"
    task["raw_path"]    = f"working_files/{task['slug']}-{base}-raw.png"
    task["archive_path"] = f"content/topics/{task['slug']}/{base}-original.png"
```

---

## Step 3 — Read file content for prompt context

For each task (not skipped), read the corresponding `.md` file:

```python
for task in tasks:
    if task["skip"]:
        continue
    file_path = f"content/topics/{task['slug']}/{task['filename']}"
    if os.path.exists(file_path):
        with open(file_path) as f:
            task["file_content"] = f.read()
    else:
        task["file_content"] = ""
        print(f"WARNING: {file_path} not found — will construct prompt from slug only")
```

---

## Step 4 — Construct the Gemini prompt

For each task, first determine the style system, then select a style and build the prompt. Full style details are in `agents/image-designer/skills/generate-image/SKILL.md`.

### Step 4a — Choose the style system

| Content signals in file or slug | Style system |
|----------------------------------|--------------|
| mahjong-mirror, "the answer", mirror, reading, tiles, chapter, fortune, self-discovery | **Mahjong Mirror** → read `agents/image-designer/context/mahjong-mirror-style-guide.md` |
| fire-horse, astrology, zodiac, element, celestial, travel, career, love (Chinese astrology angle) | **Fire Horse** → use built-in styles below |

When in doubt, read the `.md` file content. Mentions of chapters, tile readings, or the Mirror product = Mahjong Mirror system.

### Step 4b — Fire Horse style selection

| Content signals | Style |
|-----------------|-------|
| fire, horse, career, blow up, energy, amplifier, explosive | Elemental Drama |
| travel, journey, movement, star, wandering, trip | Celestial & Mystical |
| love, relationship, compatibility, attract, heart, challenge | Zodiac Portraiture |
| challenge, weekly, season, nature | Seasonal & Nature |
| (no match) | Celestial & Mystical |

### Step 4c — Mahjong Mirror style selection

Read `agents/image-designer/context/mahjong-mirror-style-guide.md` and use the Style-to-Content Matrix in that file. Key defaults:
- Blog hero → Mystical Glassmorphism
- Instagram → Warm Editorial Photography
- Facebook → Botanical Oracle

### Step 4d — Channel-specific composition

- **Instagram (`social`, 1:1):** Add to prompt: "Square format, strong centered focal point, minimal negative space."
- **Facebook (`og`, 16:9) / Website (`hero`, 16:9):** Wide cinematic framing, standard template.

### Prompt templates

**Fire Horse:**
```
[Style] style: [primary subject].
[Style prompt hints]. Colors: Midnight Indigo #1B1F3B, Celestial Gold #C9A84C, Mystic Fire #C0392B, Warm Cream #FAF8F4.
[Composition]. No Western zodiac symbols, text overlays, watermarks, anime style, rounded or soft shapes, or generic stock photography.
```

**Mahjong Mirror:**
```
[Style prompt direction from style guide]: [primary subject derived from file content].
Colors: [palette from style guide relevant to chosen style].
[Composition]. No text overlays, watermarks, generic stock photography, neon tones, or cartoonish tiles.
```

---

## Step 5 — Call the Gemini API

Always use `/opt/anaconda3/envs/mahjong-tarot/bin/python`. Load `GEMINI_API_KEY` from `.env`.

```python
from google import genai
from google.genai import types
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    raise SystemExit("GEMINI_API_KEY not set — cannot generate images")

client = genai.Client(api_key=api_key)

# Call per task
response = client.models.generate_images(
    model="imagen-4.0-generate-001",
    prompt=task["prompt"],
    config=types.GenerateImagesConfig(
        number_of_images=1,
        aspect_ratio=task["aspect"],
    ),
)

os.makedirs("working_files", exist_ok=True)
with open(task["raw_path"], "wb") as f:
    f.write(response.generated_images[0].image.image_bytes)
print(f"Raw PNG → {task['raw_path']}")
```

If the API call fails, simplify the prompt (remove hex codes) and retry once. If still failing, log ❌ for that task and continue — do not halt the entire run.

---

## Step 6 — Archive PNG and optimise to WebP

```python
import shutil
from PIL import Image
import sys

# Archive original
os.makedirs(os.path.dirname(task["archive_path"]), exist_ok=True)
shutil.copy2(task["raw_path"], task["archive_path"])

# Optimise
target_w, target_h, max_kb = task["w"], task["h"], task["max_kb"]
output_path = task["output_path"]
os.makedirs(os.path.dirname(output_path), exist_ok=True)

img = Image.open(task["raw_path"]).convert("RGB")

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

passed = False
for quality in [82, 72, 65]:
    img.save(output_path, "webp", quality=quality)
    size_kb = os.path.getsize(output_path) / 1024
    if size_kb <= max_kb:
        print(f"PASS  {size_kb:.1f}KB at q{quality} → {output_path}")
        task["size_kb"] = round(size_kb, 1)
        task["status"]  = "ok"
        passed = True
        break

if not passed:
    print(f"FAIL  {size_kb:.1f}KB exceeds {max_kb}KB at q65")
    task["status"] = "failed"
```

---

## Step 7 — Update INDEX.md

After each successful image, update `content/topics/INDEX.md` immediately — replace the `TO DO` in the matching row with the full relative output path.

```python
with open(index_path) as f:
    index_content = f.read()

# Replace the exact original line, swapping TO DO → output path
updated_line = task["line"].replace("| TO DO |", f"| {task['output_path']} |")
index_content = index_content.replace(task["line"], updated_line)

with open(index_path, "w") as f:
    f.write(index_content)

print(f"INDEX.md updated: {task['filename']} → {task['output_path']}")
```

Write after each image (not batched at the end) so partial progress is saved if the run is interrupted.

---

## Step 8 — Write the run log entry

Append to `agents/image-designer/output/run-log.md` after each image:

On success:
```
| YYYY-MM-DD HH:MM | <slug> | <image_type> | scan-topics | <output_path> | <size_kb> KB | ✅ OK |
```

On failure:
```
| YYYY-MM-DD HH:MM | <slug> | <image_type> | scan-topics | — | — | ❌ FAILED: <reason> |
```

---

## Step 9 — Print run summary

```
Scan Topics — YYYY-MM-DD HH:MM
────────────────────────────────
Rows scanned:        <N>
Already complete:    <N>
Generated this run:  <N>
Failed:              <N>

✅ <slug>/<filename>.webp  (<size> KB)
...
❌ <slug>/<filename> — <reason>
...
```

---

## Edge Cases

| Situation | Action |
|-----------|--------|
| INDEX.md not found | Stop. Report: "content/topics/INDEX.md not found." |
| No TO DO rows found | Report "All images up to date" and exit cleanly |
| `.md` file missing for a row | Construct prompt from slug + filename alone; note warning in log |
| Unknown channel value | Skip that row; log a warning |
| API call fails after retry | Log ❌; continue with remaining tasks |
| Image fails size gate at q65 | Log ❌; do not write the WebP; do not update INDEX.md for that row |
| `GEMINI_API_KEY` not set | Stop the entire run immediately |
| Row line not unique in INDEX.md | Use slug + filename combination to locate the correct row before replacing |
