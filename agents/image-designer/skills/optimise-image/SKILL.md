---
name: optimise-image
description: "Modifies an existing source image for The Mahjong Tarot website. MUST be used when a request file contains workflow: optimise — applies colour grading, cropping, and resizing via Python/Pillow, then saves an optimised WebP at the standard output path for the image type."
allowed-tools: Read Write Bash Glob Grep
---

# Optimise Image

## Purpose

Takes a source image from `working_files/` (or any path specified in the request), applies Pillow transformations (colour grade, crop, resize), converts to WebP, enforces the file-size limit for the image type, and writes the final file to `content/topics/<slug>/`.

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
| hero | `content/topics/{slug}/{slug}-hero.webp` |
| thumbnail | `content/topics/{slug}/{slug}-thumb.webp` |
| card | `content/topics/{slug}/{slug}-card.webp` |
| og | `content/topics/{slug}/{slug}-og.webp` |
| social | `content/topics/{slug}/{slug}-social.webp` |

---

## Steps

### 1. Read the request file

Read the YAML at `agents/web-designer/output/requests/<slug>-image-request.yaml`.

Extract for each image entry where `workflow: optimise`:
- `slug` (top-level)
- `type` → look up target dimensions and size limit
- `source` → path to the source image file
- `filters` (optional) → `brightness`, `contrast`, `saturation`, `crop`

Verify the source file exists. If it does not, log an error and skip this image entry.

### 2. Run the Pillow pipeline

Run the following Python script via Bash. Substitute values from the request.

```python
from PIL import Image, ImageEnhance
import os, sys

# ── inputs (substitute per request entry) ─────────────────────────────────────
source_path   = "<source>"           # e.g. "working_files/fire-horse-raw.jpg"
slug          = "<slug>"
image_type    = "<type>"             # hero | thumbnail | card | og | social
brightness    = <brightness or 1.0>
contrast      = <contrast or 1.0>
saturation    = <saturation or 1.0>
crop_anchor   = "<crop or center>"   # center | top | bottom

# ── spec table ────────────────────────────────────────────────────────────────
SPECS = {
    "hero":      (1200, 630,  200),
    "thumbnail": (600,  315,   80),
    "card":      (400,  400,   60),
    "og":        (1200, 630,  200),
    "social":    (1080, 1080, 150),
}
PATH_PATTERNS = {
    "hero":      "content/topics/{slug}/{slug}-hero.webp",
    "thumbnail": "content/topics/{slug}/{slug}-thumb.webp",
    "card":      "content/topics/{slug}/{slug}-card.webp",
    "og":        "content/topics/{slug}/{slug}-og.webp",
    "social":    "content/topics/{slug}/{slug}-social.webp",
}

target_w, target_h, max_kb = SPECS[image_type]
output_path = PATH_PATTERNS[image_type].format(slug=slug)
os.makedirs(os.path.dirname(output_path), exist_ok=True)

# ── open and colour-grade ──────────────────────────────────────────────────────
img = Image.open(source_path).convert("RGB")

if brightness != 1.0:
    img = ImageEnhance.Brightness(img).enhance(brightness)
if contrast != 1.0:
    img = ImageEnhance.Contrast(img).enhance(contrast)
if saturation != 1.0:
    img = ImageEnhance.Color(img).enhance(saturation)

# ── crop to target aspect ratio ────────────────────────────────────────────────
img_ratio    = img.width / img.height
target_ratio = target_w / target_h

if img_ratio > target_ratio:
    # too wide — fit height, crop sides
    new_h = img.height
    new_w = int(img.height * target_ratio)
else:
    # too tall — fit width, crop top/bottom
    new_w = img.width
    new_h = int(img.width / target_ratio)

left = (img.width  - new_w) // 2
if crop_anchor == "top":
    top = 0
elif crop_anchor == "bottom":
    top = img.height - new_h
else:
    top = (img.height - new_h) // 2

img = img.crop((left, top, left + new_w, top + new_h))

# ── resize to exact target dimensions ─────────────────────────────────────────
img = img.resize((target_w, target_h), Image.LANCZOS)

# ── save as WebP with quality gate ────────────────────────────────────────────
for quality in [82, 72, 65]:
    img.save(output_path, "webp", quality=quality)
    size_kb = os.path.getsize(output_path) / 1024
    print(f"q{quality}: {size_kb:.1f} KB → {output_path}")
    if size_kb <= max_kb:
        print(f"PASS  {image_type} {target_w}x{target_h} {size_kb:.1f}KB (limit {max_kb}KB)")
        sys.exit(0)

print(f"FAIL  {image_type} still {size_kb:.1f}KB after q65 (limit {max_kb}KB)")
sys.exit(1)
```

### 3. Check the result

- **Exit 0** — image passed the size gate. Record the output path, type, and final KB for the log entry.
- **Exit 1** — image failed after three quality passes. Log the failure. Move the request file to `agents/web-designer/output/requests/failed/`.

### 4. Write the run log entry

Append to `agents/image-designer/output/run-log.md`:

```
| YYYY-MM-DD HH:MM | <slug> | <type> | optimise | <output_path> | <size_kb> KB | ✅ OK |
```

On failure:
```
| YYYY-MM-DD HH:MM | <slug> | <type> | optimise | — | <size_kb> KB | ❌ FAILED: over size limit after q65 |
```

Also write `agents/image-designer/output/errors/error-YYYY-MM-DD-<slug>-<type>.md` on failure:

```markdown
# Error: <slug> / <type>

- **Request file:** agents/web-designer/output/requests/<slug>-image-request.yaml
- **Failure step:** Step 2 — size gate
- **Source:** <source_path>
- **Final size:** <size_kb> KB (limit: <max_kb> KB)
- **Suggested fix:** Use a smaller source image, or request a lower-detail crop.
```

### 5. Move the request file

On success: move to `agents/web-designer/output/requests/processed/`
On failure: move to `agents/web-designer/output/requests/failed/`

If the request file contains multiple images, only move it once all entries have been attempted.

---

## Edge Cases

- **Source file missing**: Log error, skip this image entry, continue with remaining entries in the same request file.
- **Unknown image type**: Log error (`"type X is not in the spec table"`), skip this entry.
- **Pillow not installed**: Run `pip install Pillow --break-system-packages`, then retry.
- **Source image smaller than target dimensions**: Resize up (Pillow LANCZOS handles upscaling). Log a warning that the source was upscaled — quality may be degraded.
- **`filters` block absent**: Skip colour-grade step; proceed directly to crop and resize.
