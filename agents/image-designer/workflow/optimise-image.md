---
name: optimise-image
description: Triggered when a request file contains workflow: optimise. Reads a source image from working_files/, applies colour grading, crops, resizes to the target image type dimensions, enforces the file-size gate, writes the final WebP to website/public/images/blog/, and logs the result.
trigger: Per image entry with workflow: optimise in a YAML request file
---

# Optimise Image Workflow

## Purpose

Transform an existing source image into a brand-ready WebP for the website. Takes a raw JPEG, PNG, or WebP from `working_files/`, applies Pillow colour adjustments, crops to the correct aspect ratio, resizes to exact target dimensions, and enforces the per-type file-size limit. The output is a production-ready WebP written directly to `website/public/images/blog/`.

---

## File locations

| File | Path | Notes |
|------|------|-------|
| Request file | `agents/web-designer/output/requests/<slug>-image-request.yaml` | Written by Web Designer agent |
| Source image | Path specified in `source` field of the request | Usually `working_files/<filename>` |
| WebP output | `website/public/images/blog/` (derived by type) | Final destination |
| Run log | `agents/image-designer/output/run-log.md` | Append one row per image |
| Error report | `agents/image-designer/output/errors/error-YYYY-MM-DD-<slug>-<type>.md` | Write on failure |
| Processed requests | `agents/web-designer/output/requests/processed/` | Move here on full success |
| Failed requests | `agents/web-designer/output/requests/failed/` | Move here on failure |

---

## Image type specifications

| Type | Width | Height | Aspect | Max KB | Output path |
|------|-------|--------|--------|--------|-------------|
| `hero` | 1200 | 630 | 16:9 | 200 | `website/public/images/blog/{slug}.webp` |
| `thumbnail` | 600 | 315 | 16:9 | 80 | `website/public/images/blog/{slug}-thumb.webp` |
| `card` | 400 | 400 | 1:1 | 60 | `website/public/images/blog/{slug}-card.webp` |
| `og` | 1200 | 630 | 16:9 | 200 | `website/public/images/blog/{slug}-og.webp` |
| `social` | 1080 | 1080 | 1:1 | 150 | `website/public/images/blog/{slug}-social.webp` |

---

## Step-by-step

### 1. Read the request file

Read the YAML at `agents/web-designer/output/requests/<slug>-image-request.yaml`.

For each image entry where `workflow: optimise`, extract:
- `slug` (top-level) — used to derive output paths
- `type` — look up target dimensions and size limit from the spec table above
- `source` — path to the source image file
- `filters` (optional) — `brightness`, `contrast`, `saturation`, `crop` anchor

If `type` is not in the spec table, log an error and skip this entry.

### 2. Verify the source file

Check that the file at `source` exists. If it does not:
- Log an error entry to `output/run-log.md` with status `❌ FAILED: source file not found`
- Write an error report to `output/errors/`
- Skip this image entry; continue with remaining entries in the request file

### 3. Run the Pillow pipeline

Execute the following Python via Bash. Substitute all values from the request entry.

```python
from PIL import Image, ImageEnhance
import os, sys

source_path = "<source>"
slug        = "<slug>"
image_type  = "<type>"
brightness  = <brightness or 1.0>
contrast    = <contrast or 1.0>
saturation  = <saturation or 1.0>
crop_anchor = "<crop or center>"   # center | top | bottom

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

# Colour grade
if brightness != 1.0:
    img = ImageEnhance.Brightness(img).enhance(brightness)
if contrast != 1.0:
    img = ImageEnhance.Contrast(img).enhance(contrast)
if saturation != 1.0:
    img = ImageEnhance.Color(img).enhance(saturation)

# Crop to target aspect ratio
img_ratio    = img.width / img.height
target_ratio = target_w / target_h
if img_ratio > target_ratio:
    new_h = img.height
    new_w = int(img.height * target_ratio)
else:
    new_w = img.width
    new_h = int(img.width / target_ratio)

left = (img.width - new_w) // 2
if crop_anchor == "top":
    top = 0
elif crop_anchor == "bottom":
    top = img.height - new_h
else:
    top = (img.height - new_h) // 2

img = img.crop((left, top, left + new_w, top + new_h))
img = img.resize((target_w, target_h), Image.LANCZOS)

# Size gate with quality fallback
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

### 4. Check the result

- **Exit 0 (pass)** — record the output path, type, and final KB for the log entry. Continue to Step 5.
- **Exit 1 (fail)** — log the failure; do NOT write to `website/`. Move the request file to `failed/` after all entries are attempted.

### 5. Write the run log entry

Append one row to `agents/image-designer/output/run-log.md`:

On success:
```
| YYYY-MM-DD HH:MM | <slug> | <type> | optimise | <output_path> | <size_kb> KB | ✅ OK |
```

On failure:
```
| YYYY-MM-DD HH:MM | <slug> | <type> | optimise | — | <size_kb> KB | ❌ FAILED: over size limit after q65 |
```

If the source file was missing, use:
```
| YYYY-MM-DD HH:MM | <slug> | <type> | optimise | — | — | ❌ FAILED: source file not found |
```

### 6. Write an error report (on failure only)

Write `agents/image-designer/output/errors/error-YYYY-MM-DD-<slug>-<type>.md`:

```markdown
# Error: <slug> / <type>

- **Request file:** agents/web-designer/output/requests/<slug>-image-request.yaml
- **Failure step:** [Step 2 — source not found | Step 3 — size gate]
- **Source:** <source_path>
- **Final size:** <size_kb> KB (limit: <max_kb> KB)
- **Suggested fix:** [Use a smaller or lower-detail source image, or request a lower-detail crop.]
```

### 7. Move the request file

Only move after all image entries in the file have been attempted:

- **All entries succeeded** → move to `agents/web-designer/output/requests/processed/`
- **Any entry failed** → move to `agents/web-designer/output/requests/failed/`

---

## Edge cases

| Situation | Action |
|-----------|--------|
| Source file missing | Log error, skip entry, continue with remaining entries |
| Unknown `type` value | Log error (`type X is not in the spec table`), skip entry |
| Source image smaller than target | Resize up (LANCZOS handles upscaling). Log a warning that the source was upscaled — quality may be degraded |
| `filters` block absent | Skip colour-grade step; proceed directly to crop and resize |
| Pillow not installed | Run `pip install Pillow --break-system-packages`, then retry |
| Multiple image entries in one request | Process each entry in sequence; move the request file only once all are done |
