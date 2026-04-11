---
name: generate-image
description: "Generates a new blog image for The Mahjong Tarot website using the Gemini API (imagen-4.0-generate-001). Constructs a prompt from built-in brand knowledge, calls the API, saves the raw PNG, then optimises it to WebP for each requested image type."
allowed-tools: Read Write Bash Glob Grep
---

# Generate Image

## Purpose

Construct a brand-aligned prompt, call the Gemini image generation API, save the raw PNG, and optimise to WebP at the correct dimensions and file size for each requested image type.

---

## Style system selection

There are two brand style systems. Choose the correct one before building the prompt.

### Which system to use

| Content signals | Style system |
|----------------|--------------|
| Mahjong Mirror, "the answer", mirror, reflection, reading, tiles, fortune, self-discovery, chapter reference | **Mahjong Mirror** — read `agents/image-designer/context/mahjong-mirror-style-guide.md` |
| Fire Horse, Chinese astrology, zodiac animals, celestial, elemental, seasonal | **Fire Horse** — use built-in styles below |

When in doubt, read the source `.md` file. If it mentions the Mahjong Mirror product or references chapters/tiles in a reading context → Mahjong Mirror system. If it's about Chinese astrology, zodiac animals, or elemental energy → Fire Horse system.

---

## Style System A — Fire Horse (Chinese Astrology)

### Styles

| Style | Visual direction | Prompt hints |
|-------|-----------------|--------------|
| **Celestial & Mystical** | Deep cosmos, moonlit skies, glowing zodiac constellations, starfields with Chinese symbols | deep space atmosphere, soft moonlight, glowing constellation lines, floating Chinese characters, ethereal mist |
| **Elemental Drama** | Fire, water, earth, metal, wood rendered with cinematic intensity | cinematic depth of field, dramatic top-lighting, dynamic motion, sharp geometric sparks, intense color saturation |
| **Zodiac Portraiture** | The 12 animals rendered with beauty, character, and symbolic power | dignified animal portrait, symbolic accessories, rich textural detail, strong focal point |
| **Sacred & Symbolic** | Mahjong tiles, lotus flowers, lanterns, yin-yang, red thread of fate, Chinese brush art | flat-lay or close-up arrangement, ink wash texture, warm candlelight or lantern glow |
| **Seasonal & Nature** | Cherry blossom, autumn gold, winter snow, summer storms — tied to the Chinese calendar | wide landscape or macro nature, soft natural light, seasonal color palette |

### Palette
Midnight Indigo `#1B1F3B` · Celestial Gold `#C9A84C` · Mystic Fire `#C0392B` · Warm Cream `#FAF8F4`

### Exclusions
> No Western zodiac symbols, text overlays, watermarks, anime style, rounded or soft shapes, or generic stock photography.

### Prompt template
```
[Style name] style: [primary subject].
[Style prompt hints]. Colors: [relevant brand colours].
[Composition — focal point, depth, movement].
No Western zodiac symbols, text overlays, watermarks, anime style, rounded or soft shapes, or generic stock photography.
```

---

## Style System B — Mahjong Mirror

**Always read `agents/image-designer/context/mahjong-mirror-style-guide.md` in full before building a Mahjong Mirror prompt.** That file is the authoritative source for styles, palette, prompt directions, style-to-content matrix, and non-negotiables.

Summary of the 8 styles (see the guide for full prompt directions):

| Style | Best for |
|-------|----------|
| Mystical Glassmorphism | Blog heroes, landing page, "reading ready" moments |
| Botanical Oracle | Blog headers, email, seasonal promos |
| Illustrated Line Art | Explainers, tile breakdowns, social carousels |
| Bold Serif Editorial | Quote graphics, thought leadership, Pinterest |
| Warm Editorial Photography | Instagram feed, brand storytelling, testimonials |
| Soft Gradient Abstract | App backgrounds, ambient social, story backgrounds |
| Collage / Mixed Media Oracle | Feature launches, seasonal campaigns, Pinterest |
| Napkin / Hand-Drawn Sketch | Building-in-public, founder story (NOT fortune content) |

### Palette
Midnight Jade `#0A1F1C` · Antique Gold `#C5A258` · Dusty Rose `#C48B8B` · Soft Sage `#A3B5A6` · Warm Ivory `#F5F0E8` · Deep Plum `#5B2245`

### Non-negotiables (in addition to those in the guide)
> No text overlays, watermarks, generic stock photography, neon/cyberpunk tones, cartoonish tiles, culturally insensitive imagery, or AI-robot imagery. Tiles must feel like real objects with weight and history.

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

1. Read the source `.md` file if it exists (optional context)
2. Determine which style system applies (Fire Horse or Mahjong Mirror) using the selection table above
3. If Mahjong Mirror: read `agents/image-designer/context/mahjong-mirror-style-guide.md` in full, then select the best style from the style-to-content matrix in that file
4. If Fire Horse: use the built-in style table above
5. If `prompt_override` is set in the request, skip steps 2–4 and use it directly
6. Proceed directly to generation — no user confirmation needed

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
