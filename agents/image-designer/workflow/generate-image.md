---
name: generate-image
description: Triggered when a request file contains workflow: generate. Reads the style catalogue and optional post content, constructs a Gemini prompt, presents it for user approval, generates the image via browser automation, archives the original PNG, runs the Pillow optimisation pipeline for each requested image type, and logs the result.
trigger: Per image entry with workflow: generate in a YAML request file
---

# Generate Image Workflow

## Purpose

Produce a brand-new image for a blog post or page using Google Gemini (Nano Banana 2) via browser automation. Takes the style selection from the request file, constructs a prompt aligned with The Mahjong Tarot brand, generates the image, and optimises it to WebP at the correct dimensions and file size for each requested image type. The user must confirm the prompt before generation begins.

---

## File locations

| File | Path | Notes |
|------|------|-------|
| Request file | `agents/web-designer/output/requests/<slug>-image-request.yaml` | Written by Web Designer agent |
| Style catalogue | `agents/image-designer/context/styles.json` | All five brand styles with prompt hints, colours, exclusions |
| Post content | `content/topics/<slug>/blog.md` | Optional — read for prompt context |
| Temp raw download | `working_files/<slug>-<type>-raw.png` | Temporary — cleaned up after optimisation |
| PNG archive | `content/topics/<slug>/<slug>-<type>-original.png` | Permanent archive of the generated image |
| WebP output | `website/public/images/blog/` (derived by type) | Final destination |
| Run log | `agents/image-designer/output/run-log.md` | Append one row per image type |
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

For each image entry where `workflow: generate`, extract:
- `slug` (top-level) — used to derive output paths and archive paths
- `type` — look up target dimensions and size limit from the spec table above
- `style` — must match a name in `agents/image-designer/context/styles.json`
- `prompt_override` — if set and non-null, skip Steps 2 and 3; use this prompt directly

If `type` is not in the spec table, log an error and skip this entry.

### 2. Read context

Read in order:
1. `agents/image-designer/context/styles.json` — full style catalogue
2. `content/topics/<slug>/blog.md` (if it exists) — title, category, emotional angle, key subjects

If `post_path` file is missing, skip reading it; construct the prompt from `style` and `slug` alone, and note the gap in the log.

### 3. Construct the Gemini prompt

Look up `style` from the request in `styles.json`. If the style name does not match any entry, stop and report:

> "Style '<name>' not found in agents/image-designer/context/styles.json. Add it to the file or correct the request."

Otherwise, build the prompt using this template:

```
[style.name] style: [Primary subject — derived from post content or slug].
[style.prompt_hints]. Colors: [style.color_emphasis joined as a list].
[Composition — foreground/background, focal point, movement].
Aspect ratio: 16:9 for hero/thumbnail/og; 1:1 for card/social.
Exclude: [style.exclude].
```

If `prompt_override` is set in the request, use that value directly instead.

### 4. Present the prompt for user confirmation

Show the constructed (or overridden) prompt to the user and ask:

> "Should I send this to Gemini to generate the image?"

Wait for explicit confirmation before proceeding. Do not open the browser until the user approves.

### 5. Generate the image via Gemini

Use browser automation:

1. Create a new tab and navigate to `https://gemini.google.com/app`
2. Take a screenshot to verify the page loaded
3. **If Gemini requires sign-in:** Stop. Tell the user: "Gemini needs you to sign in. Please log into your Google account in the browser, then tell me to continue." Leave the request file in place; do not move it.
4. Find the text input area, type the approved prompt, press Enter or click send
5. Wait for generation (10–30 seconds); take a screenshot to confirm the image appeared
6. Ask the user for permission to download: "The image has been generated. Can I download it?"
7. Right-click the image and save it

### 6. Save and archive the downloaded image

Save the raw downloaded file to `working_files/<slug>-<type>-raw.png` (temporary).

Also archive a permanent copy to `content/topics/<slug>/<slug>-<type>-original.png`.

### 7. Run the Pillow pipeline for each requested type

If the request contains multiple `generate` entries for this slug (e.g., hero + thumbnail + card), derive each type by resizing and cropping the same downloaded PNG — do not re-run Gemini.

For each type, run:

```python
from PIL import Image
import os, sys

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

### 8. Write the run log entry

Append one row per type to `agents/image-designer/output/run-log.md`:

On success:
```
| YYYY-MM-DD HH:MM | <slug> | <type> | generate | <output_path> | <size_kb> KB | ✅ OK |
```

On failure:
```
| YYYY-MM-DD HH:MM | <slug> | <type> | generate | — | <size_kb> KB | ❌ FAILED: over size limit after q65 |
```

### 9. Write an error report (on failure only)

Write `agents/image-designer/output/errors/error-YYYY-MM-DD-<slug>-<type>.md`:

```markdown
# Error: <slug> / <type>

- **Request file:** agents/web-designer/output/requests/<slug>-image-request.yaml
- **Failure step:** [Step 5 — Gemini generation | Step 7 — size gate]
- **Prompt used:** <prompt text>
- **Final size:** <size_kb> KB (limit: <max_kb> KB)
- **Suggested fix:** [Simplify prompt / use smaller source / request lower-detail crop]
```

### 10. Move the request file

Only move after all image entries in the file have been attempted:

- **All entries succeeded** → move to `agents/web-designer/output/requests/processed/`
- **Any entry failed** → move to `agents/web-designer/output/requests/failed/`

---

## Edge cases

| Situation | Action |
|-----------|--------|
| Gemini not signed in | Stop. Tell the user to sign in. Leave request file in place — do not move it. |
| Generation fails in Gemini | Screenshot the error. Simplify the prompt (remove hex codes, reduce specificity). Retry once. If still failing, move to `failed/` and log. |
| Generated image contains baked-in text or watermark | Regenerate with: "Absolutely no text, words, letters, numbers, symbols, or watermarks anywhere in the image." |
| Generated image doesn't match brand palette | Regenerate with: "Dominant colors must be deep navy (#1B1F3B) and gold (#C9A84C) with crimson accents (#C0392B) only." |
| Multiple types from one generation | Derive all types from the same downloaded PNG — loop over each type in Step 7 using the same source. Do not re-run Gemini. |
| `prompt_override` set | Skip Steps 2 and 3. Still present the override to the user for confirmation in Step 4. |
| Style name not found in styles.json | Stop immediately. Report the missing style name. Do not proceed to Gemini. |
| `post_path` file missing | Skip reading it. Construct the prompt from `style` and `slug` alone. Note the gap in the log. |
| Pillow not installed | Run `pip install Pillow --break-system-packages`, then retry Step 7. |
