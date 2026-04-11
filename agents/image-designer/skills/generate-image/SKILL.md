---
name: generate-image
description: "Generates a new blog image for The Mahjong Tarot website using Nano Banana 2 (Google Gemini) via browser automation. MUST be used when a request file contains workflow: generate — constructs a Gemini prompt from the Web Designer's style selection, generates the image, optimises it to WebP at the standard size for each image type, and archives the original PNG."
allowed-tools: Read Write Bash Glob Grep
---

# Generate Image

## Purpose

Reads a Web Designer request file, constructs or uses a supplied Gemini prompt, generates the image via browser automation, applies the Pillow optimisation pipeline for each requested image type, and writes the final files to `website/public/images/blog/`. Archives the original generated PNG to `content/topics/<slug>/`.

This skill delegates browser automation to the shared `generate-image` skill at `agents/writer/context/skills/generate-image/SKILL.md`. Read that file for the full browser workflow (Steps 3–5 there). This skill handles everything before and after it: reading the request, constructing the prompt, and running the Pillow pipeline on the result.

---

## Standard Image Specifications

| Type | Width | Height | Max KB |
|------|-------|--------|--------|
| hero | 1200 | 630 | 200 |
| thumbnail | 600 | 315 | 80 |
| card | 400 | 400 | 60 |
| og | 1200 | 630 | 200 |
| social | 1080 | 1080 | 150 |

## Output Path Derivation

| Type | Path |
|------|------|
| hero | `website/public/images/blog/{slug}.webp` |
| thumbnail | `website/public/images/blog/{slug}-thumb.webp` |
| card | `website/public/images/blog/{slug}-card.webp` |
| og | `website/public/images/blog/{slug}-og.webp` |
| social | `website/public/images/blog/{slug}-social.webp` |

---

## Steps

### 1. Read the request file

Read the YAML at `agents/web-designer/output/requests/<slug>-image-request.yaml`.

For each image entry where `workflow: generate`, extract:
- `slug` (top-level)
- `type` → look up target dimensions and size limit
- `style` → one of the five styles from the catalogue below
- `prompt_override` → if set, skip Step 2 and use this prompt directly

### 2. Read context and construct the prompt

Read in order:
1. `agents/image-designer/context/styles.json` — full style catalogue with prompt hints, color emphasis, and exclusions
2. Post file at `post_path` (if present) — title, category, emotional angle, key subjects

If `prompt_override` is set in the request, skip to Step 3.

Otherwise, look up the `style` name from the request in `styles.json`. Use its `visual_direction`, `prompt_hints`, `color_emphasis`, and `exclude` fields to construct the prompt:

```
[style.name] style: [Primary subject — derived from post content or slug].
[style.prompt_hints]. Colors: [style.color_emphasis joined as a list].
[Composition — foreground/background, focal point, movement].
Aspect ratio: 16:9 for hero/thumbnail/og; 1:1 for card/social.
Exclude: [style.exclude].
```

If the `style` name in the request does not match any entry in `styles.json`, stop and report: "Style '<name>' not found in agents/image-designer/context/styles.json. Add it to the file or correct the request."

Present the constructed prompt to the user and ask for confirmation before proceeding to Gemini.

### 3. Generate the image via Gemini

Use Claude in Chrome browser automation:

1. Create a new tab and navigate to `https://gemini.google.com/app`
2. Wait for the page to load (take a screenshot to verify)
3. **If Gemini requires sign-in:** Stop and tell the user: "Gemini needs you to sign in. Please log into your Google account in the browser, then tell me to continue." Do NOT attempt to enter credentials. Leave the request file in place for the next run.
4. Find the text input area, type the approved prompt, and press Enter or click the send button
5. Wait for generation (10–30 seconds); take a screenshot to verify the image appeared
6. **If generation fails:** Screenshot the error, simplify the prompt (remove hex codes, reduce specificity), and retry once. If still failing, move request to `failed/` and log.
7. Right-click the generated image and download it (ask user for permission first: "The image has been generated. Can I download it?")

Save the raw downloaded file temporarily as `working_files/<slug>-<type>-raw.png`.

Also archive a permanent copy to `content/topics/<slug>/<slug>-<type>-original.png`.

### 4. Optimise each image type

For **every** `type` in the request's generate entries for this slug, run the Pillow pipeline below. Note: if only one image was generated but multiple types are needed, derive each type by resizing and cropping the same original.

```python
from PIL import Image
import os, sys

# ── inputs (substitute per image type) ────────────────────────────────────────
source_path  = "working_files/<slug>-<type>-raw.png"
slug         = "<slug>"
image_type   = "<type>"

SPECS = {
    "hero":      (1200, 630,  200),
    "thumbnail": (600,  315,   80),
    "card":      (400,  400,   60),
    "og":        (1200, 630,  200),
    "social":    (1080, 1080, 150),
}
PATH_PATTERNS = {
    "hero":      "website/public/images/blog/{slug}.webp",
    "thumbnail": "website/public/images/blog/{slug}-thumb.webp",
    "card":      "website/public/images/blog/{slug}-card.webp",
    "og":        "website/public/images/blog/{slug}-og.webp",
    "social":    "website/public/images/blog/{slug}-social.webp",
}

target_w, target_h, max_kb = SPECS[image_type]
output_path = PATH_PATTERNS[image_type].format(slug=slug)
os.makedirs(os.path.dirname(output_path), exist_ok=True)

img = Image.open(source_path).convert("RGB")

# Crop to target aspect ratio (center)
img_ratio    = img.width / img.height
target_ratio = target_w / target_h
if img_ratio > target_ratio:
    new_h = img.height
    new_w = int(img.height * target_ratio)
else:
    new_w = img.width
    new_h = int(img.width / target_ratio)
left = (img.width  - new_w) // 2
top  = (img.height - new_h) // 2
img = img.crop((left, top, left + new_w, top + new_h))

img = img.resize((target_w, target_h), Image.LANCZOS)

for quality in [82, 72, 65]:
    img.save(output_path, "webp", quality=quality)
    size_kb = os.path.getsize(output_path) / 1024
    print(f"q{quality}: {size_kb:.1f} KB → {output_path}")
    if size_kb <= max_kb:
        print(f"PASS  {image_type} {size_kb:.1f}KB")
        sys.exit(0)

print(f"FAIL  {image_type} {size_kb:.1f}KB exceeds {max_kb}KB at q65")
sys.exit(1)
```

### 5. Write the run log entry

Append to `agents/image-designer/output/run-log.md` for each type produced:

```
| YYYY-MM-DD HH:MM | <slug> | <type> | generate | <output_path> | <size_kb> KB | ✅ OK |
```

On failure:
```
| YYYY-MM-DD HH:MM | <slug> | <type> | generate | — | <size_kb> KB | ❌ FAILED: over size limit after q65 |
```

Write `agents/image-designer/output/errors/error-YYYY-MM-DD-<slug>-<type>.md` on failure.

### 6. Move the request file

On full success: move to `agents/web-designer/output/requests/processed/`
On any failure: move to `agents/web-designer/output/requests/failed/`

---

## Edge Cases

- **Gemini not signed in**: Stop. Tell the user: "Gemini needs you to sign in. Please log in, then re-run the request." Do not move the request file — leave it in place for the next cron run.
- **Image generation fails in Gemini**: Screenshot the error. Simplify the prompt (remove hex codes, reduce specificity). Retry once. If still failing, move to `failed/` and log.
- **Generated image contains baked-in text or watermark**: Regenerate with the addition: "Absolutely no text, words, letters, numbers, symbols, or watermarks anywhere in the image."
- **Generated image doesn't match brand palette**: Regenerate with: "Dominant colors must be deep navy (#1B1F3B) and gold (#C9A84C) with crimson accents (#C0392B) only."
- **Multiple types requested, single Gemini generation**: Derive all types from the same downloaded PNG (Step 4 handles this — loop over each type using the same source).
- **Pillow not installed**: Run `pip install Pillow --break-system-packages`, then retry Step 4.
- **`post_path` file missing**: Skip reading it. Construct the prompt from `style` and `slug` alone. Note the gap in the log.

---

## File Paths Summary

| Operation | Path |
|-----------|------|
| Read request | `agents/web-designer/output/requests/<slug>-image-request.yaml` |
| Read style catalogue | `agents/image-designer/context/styles.json` |
| Read post content | `content/topics/<slug>/blog.md` |
| Temp raw download | `working_files/<slug>-<type>-raw.png` |
| PNG archive | `content/topics/<slug>/<slug>-<type>-original.png` |
| WebP output | `website/public/images/blog/` (derived by type) |
| Run log | `agents/image-designer/output/run-log.md` |
| Error report | `agents/image-designer/output/errors/error-YYYY-MM-DD-<slug>-<type>.md` |
| Processed requests | `agents/web-designer/output/requests/processed/` |
| Failed requests | `agents/web-designer/output/requests/failed/` |
