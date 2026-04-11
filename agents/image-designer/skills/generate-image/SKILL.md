---
name: generate-image
description: "Generates a new blog image for The Mahjong Tarot website using the Gemini API (imagen-3.0-generate-002). Constructs a prompt from built-in brand knowledge, calls the API, saves the raw PNG, then optimises it to WebP for each requested image type."
allowed-tools: Read Write Bash Glob Grep
---

# Generate Image

## Purpose

Construct a brand-aligned prompt, call the Gemini image generation API, save the raw PNG, and optimise to WebP at the correct dimensions and file size for each requested image type.

---

## Brand knowledge

### Styles

| Style | Visual direction | Prompt hints |
|-------|-----------------|--------------|
| **Celestial & Mystical** | Deep cosmos, moonlit skies, glowing zodiac constellations, starfields with Chinese symbols | deep space atmosphere, soft moonlight, glowing constellation lines, floating Chinese characters, ethereal mist |
| **Elemental Drama** | Fire, water, earth, metal, wood rendered with cinematic intensity | cinematic depth of field, dramatic top-lighting, dynamic motion, sharp geometric sparks, intense color saturation |
| **Zodiac Portraiture** | The 12 animals rendered with beauty, character, and symbolic power | dignified animal portrait, symbolic accessories, rich textural detail, strong focal point |
| **Sacred & Symbolic** | Mahjong tiles, lotus flowers, lanterns, yin-yang, red thread of fate, Chinese brush art | flat-lay or close-up arrangement, ink wash texture, warm candlelight or lantern glow |
| **Seasonal & Nature** | Cherry blossom, autumn gold, winter snow, summer storms — tied to the Chinese calendar | wide landscape or macro nature, soft natural light, seasonal color palette |

### Brand colours

Midnight Indigo `#1B1F3B` · Celestial Gold `#C9A84C` · Mystic Fire `#C0392B` · Warm Cream `#FAF8F4`

### Exclusions (always append)

> No Western zodiac symbols, text overlays, watermarks, anime style, rounded or soft shapes, or generic stock photography.

### Prompt template

```
[Style name] style: [primary subject from post content or slug].
[Style prompt hints]. Colors: [relevant brand colours].
[Composition — focal point, depth, movement].
Aspect ratio: 16:9 for hero/thumbnail/og; 1:1 for card/social.
No Western zodiac symbols, text overlays, watermarks, anime style, rounded or soft shapes, or generic stock photography.
```

---

## Image specifications

| Type | Width | Height | Max KB | Output path |
|------|-------|--------|--------|-------------|
| hero | 1200 | 630 | 200 | `content/topics/{slug}/{slug}-hero.webp` |
| thumbnail | 600 | 315 | 80 | `content/topics/{slug}/{slug}-thumb.webp` |
| card | 400 | 400 | 60 | `content/topics/{slug}/{slug}-card.webp` |
| og | 1200 | 630 | 200 | `content/topics/{slug}/{slug}-og.webp` |
| social | 1080 | 1080 | 150 | `content/topics/{slug}/{slug}-social.webp` |

**Output path rule:** All outputs go to `content/topics/<slug>/` — this is the single canonical location for all topic images.

---

## Steps

### 1. Build the prompt

Read `content/topics/<slug>/blog.md` if it exists (optional context). Use the `style` from the request and the brand knowledge above to construct the prompt. If `prompt_override` is set in the request, use that directly. Proceed directly to generation — no user confirmation needed.

If the style name is not in the table above, stop and report the valid options.

### 2. Call the Gemini API

Always run using the `mahjong-tarot` conda environment: `/opt/anaconda3/envs/mahjong-tarot/bin/python`

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
        aspect_ratio="16:9",  # use "1:1" for card/social types
    ),
)

raw_path = f"working_files/{SLUG}-raw.png"
os.makedirs("working_files", exist_ok=True)
with open(raw_path, "wb") as f:
    f.write(response.generated_images[0].image.image_bytes)
print(f"Saved raw PNG → {raw_path}")
```

Also archive a permanent copy to `content/topics/<slug>/<slug>-<type>-original.png`.

If the API call fails, simplify the prompt (remove hex codes, reduce specificity) and retry once. If still failing, move the request to `failed/` and log.

### 3. Optimise to WebP

Run this for each requested image type, using the same raw PNG as source:

```python
from PIL import Image
import os, sys

source_path = f"working_files/{SLUG}-raw.png"
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
        print(f"PASS  {image_type} {size_kb:.1f}KB → {output_path}")
        sys.exit(0)

print(f"FAIL  {image_type} {size_kb:.1f}KB exceeds {max_kb}KB at q65")
sys.exit(1)
```

### 4. Log and move

Append to `agents/image-designer/output/run-log.md` per type:

```
| YYYY-MM-DD HH:MM | <slug> | <type> | generate | <output_path> | <size_kb> KB | ✅ OK |
```

Move the request file to `processed/` on full success, `failed/` on any failure.

---

## Edge cases

| Situation | Action |
|-----------|--------|
| `GEMINI_API_KEY` not set | Stop. Tell the user to add it to `.env` and retry. |
| API call fails | Simplify prompt, retry once. If still failing → `failed/`. |
| Generated image has baked-in text | Retry with: "No text, letters, numbers, symbols, or watermarks anywhere in the image." |
| Image doesn't match brand palette | Retry with: "Dominant colors must be deep navy (#1B1F3B) and gold (#C9A84C) with crimson accents (#C0392B) only." |
| Packages missing | Run `/opt/anaconda3/envs/mahjong-tarot/bin/pip install google-genai python-dotenv Pillow` |
