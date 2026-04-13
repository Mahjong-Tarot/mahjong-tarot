---
name: generate-image
description: Triggered when a request file contains workflow: generate. Constructs a Gemini prompt from built-in brand knowledge and optional post content, calls the Gemini API to generate the image, archives the original PNG, runs the Pillow optimisation pipeline for each requested image type, and logs the result.
trigger: Per image entry with workflow: generate in a YAML request file
---

# Generate Image Workflow

## Purpose

Produce a brand-new image for a blog post or page by calling the Gemini image generation API (`imagen-3.0-generate-002`). The agent constructs the prompt from its built-in brand knowledge, calls the API with `GEMINI_API_KEY`, saves the raw PNG, then optimises to WebP at the correct dimensions and file size for each requested image type.

---

## File locations

| File | Path | Notes |
|------|------|-------|
| Post content | `content/topics/<slug>/blog.md` | Optional — read for prompt context |
| Temp raw PNG | `working_files/<slug>-<type>-raw.png` | Temporary — cleaned up after optimisation |
| PNG archive | `content/topics/<slug>/<slug>-hero-original.png` | Permanent archive of the generated image |
| WebP output | `content/topics/<slug>/` (derived by type — see path table) | Final destination |
| Run log | `agents/image-designer/output/run-log.md` | Append one row per image type |
| Error report | `agents/image-designer/output/errors/error-YYYY-MM-DD-<slug>-<type>.md` | Write on failure |

---

## Image type specifications

| Type | Width | Height | Aspect | Max KB | Output path |
|------|-------|--------|--------|--------|-------------|
| `hero` | 1200 | 630 | 16:9 | 200 | `content/topics/{slug}/{slug}-hero.webp` |
| `thumbnail` | 600 | 315 | 16:9 | 80 | `content/topics/{slug}/{slug}-thumb.webp` |
| `card` | 400 | 400 | 1:1 | 60 | `content/topics/{slug}/{slug}-card.webp` |
| `og` | 1200 | 630 | 16:9 | 200 | `content/topics/{slug}/{slug}-og.webp` |
| `social` | 1080 | 1080 | 1:1 | 150 | `content/topics/{slug}/{slug}-social.webp` |

**Output path rule:** All outputs go to `content/topics/<slug>/` — this is the single canonical location for all topic images.

---

## Step-by-step

### 1. Read the request file

The caller provides a `slug` and one or more image entries (type, workflow, style/source). Read `content/topics/<slug>/blog.md` if it exists for additional context.

For each image entry where `workflow: generate`, extract:
- `slug` (top-level) — used to derive output paths and archive paths
- `type` — look up target dimensions and size limit from the spec table above
- `style` — optional hint only; agent uses its own judgment (see Step 3)
- `prompt_override` — if set and non-null, skip Steps 2 and 3; use this prompt directly

If `type` is not in the spec table, log an error and skip this entry.

### 2. Read context

Read if present:
- `content/topics/<slug>/blog.md` — title, category, emotional angle, key subjects (optional — skip if missing, note gap in log)

### 3. Construct the Gemini prompt

If `prompt_override` is set in the request, use that value directly — skip to Step 4.

Otherwise, follow the two-path approach in `skills/generate-image/SKILL.md`:

**Step 3a — Check the run log for duplicates**

Read `agents/image-designer/output/run-log.md`. Scan the last 20 Prompt entries. Note any objects, surfaces, or lighting setups already used. Your new prompt must not reuse them.

**Step 3b — Decide: is the post about a known real-world subject (person, team, brand, cultural event)?**

- **Yes → Path A:** Use your training knowledge. List 2–3 specific, concrete, visually recognisable objects associated with that subject — not their personality, not their theme, actual *things* that exist in the world. Build the prompt from those objects in a specific scene or arrangement.
- **No → Path B:** Read `content/topics/<slug>/blog.md`. Extract the most specific concrete nouns from the post text — physical objects, places, things actually named. Use those. If the post has no concrete objects, construct a physical metaphor from the core tension (e.g. a cracked object, two incompatible items placed together).

**Step 3c — Build two prompts: one for 16:9, one for 1:1**

The 16:9 and 1:1 API calls must use **different compositions**, not the same scene cropped:
- **16:9 prompt:** Wide or medium shot — scene, environment, arrangement of objects with context
- **1:1 prompt:** Close-up or detail shot of one or two of the same objects — tighter framing, different angle or surface

**Step 3d — Self-check both prompts**

Does either prompt contain abstract words like: tension, energy, forces, power, emotion, opposing, mystical, celestial, dramatic? If yes — replace them with specific physical objects or scene details.

Prompt structure for both:
```
[Scene or arrangement of specific concrete objects].
[Lighting and surface details — specific, not generic].
Colors: [brand colours in plain English — never hex codes].
No text, letters, numbers, symbols, watermarks, or Western zodiac imagery anywhere in the image.
```

Any `style` hint passed in the request is advisory only — the agent uses its own judgment. Do not error on unrecognised style names.

### 4. Call the Gemini API

Use `GEMINI_API_KEY` from the environment. See `skills/generate-image/SKILL.md` for the full Python snippet.

- Model: `imagen-3.0-generate-002`
- Aspect ratio: `16:9` for hero/thumbnail/og; `1:1` for card/social
- Save the raw PNG to `working_files/<slug>-raw.png`
- Archive a permanent copy to `content/topics/<slug>/<slug>-hero-original.png`

If the API call fails, simplify the prompt and retry once. If still failing, move to `failed/` and log.

### 5. Run the Pillow pipeline for each requested type

Derive each requested type by resizing and cropping the same raw PNG — do not re-call the API per type.

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
    "hero":      "content/topics/{slug}/{slug}-hero.webp",
    "thumbnail": "content/topics/{slug}/{slug}-thumb.webp",
    "card":      "content/topics/{slug}/{slug}-card.webp",
    "og":        "content/topics/{slug}/{slug}-og.webp",
    "social":    "content/topics/{slug}/{slug}-social.webp",
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

### 6. Write the run log entry

Append one row per type to `agents/image-designer/output/run-log.md`:

On success:
```
| YYYY-MM-DD HH:MM | <slug> | <type> | generate | <output_path> | <size_kb> KB | ✅ OK | <prompt text> |
```

On failure:
```
| YYYY-MM-DD HH:MM | <slug> | <type> | generate | — | <size_kb> KB | ❌ FAILED: over size limit after q65 | <prompt text> |
```

### 7. Write an error report (on failure only)

Write `agents/image-designer/output/errors/error-YYYY-MM-DD-<slug>-<type>.md`:

```markdown
# Error: <slug> / <type>

- **Failure step:** [Step 4 — Gemini generation | Step 5 — size gate]
- **Prompt used:** <prompt text>
- **Final size:** <size_kb> KB (limit: <max_kb> KB)
- **Suggested fix:** [Simplify prompt / use smaller source / request lower-detail crop]
```

---

## Edge cases

| Situation | Action |
|-----------|--------|
| `GEMINI_API_KEY` not set | Stop. Tell the user to set the env var and retry. Do not move the request file. |
| API call fails | Simplify the prompt (remove hex codes, reduce specificity), retry once. If still failing → `failed/`. |
| Generated image has baked-in text or watermark | Retry with: "No text, letters, numbers, symbols, or watermarks anywhere in the image." |
| Generated image doesn't match brand palette | Retry with: "Dominant colors must be deep midnight navy and warm antique gold with deep crimson accents only." (plain English — no hex codes) |
| Multiple types requested | Derive all types from the same raw PNG in Step 5 — do not re-call the API. |
| `prompt_override` set | Skip Steps 2 and 3. Use the override directly in Step 4. |
| Style hint unrecognised | Ignore it. Construct the prompt from blog content using the creative variety rules. |
| `post_path` file missing | Skip reading it. Construct the prompt from `style` and `slug` alone. Note the gap in the log. |
| Pillow not installed | Run `pip install Pillow google-generativeai --break-system-packages`, then retry. |
