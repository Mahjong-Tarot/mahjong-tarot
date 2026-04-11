---
name: generate-image
description: "Generates blog hero images and site artwork for The Mahjong Tarot website using the Gemini API (imagen-3.0-generate-002). MUST be used whenever: creating a hero image for a blog post, generating artwork for a page, the user says 'generate image', 'create image', 'make the hero image', 'nano banana', or any request involving AI image generation for the site."
---

# Generate Image — Gemini API

Generates blog hero images and site artwork by calling the Gemini image generation API. Reads post content for context, constructs a brand-aligned prompt, calls the API, and optimises the output to WebP.

---

## Inputs

- **A blog post slug or topic** — skill reads the post content and crafts the prompt
- **A complete prompt** — used directly (still presented for confirmation)
- **A general request** — e.g., "generate the hero image for the fire horse post"

---

## Brand styles

| Style | Visual direction | Best for | Prompt hints |
|-------|-----------------|----------|--------------|
| **Celestial & Mystical** | Deep cosmos, moonlit skies, glowing zodiac constellations, starfields with Chinese symbols | Forecasts, yearly/monthly readings, fate and destiny | deep space atmosphere, soft moonlight, glowing constellation lines, ethereal mist |
| **Elemental Drama** | Fire, water, earth, metal, wood with cinematic intensity | Elemental sign posts, seasonal energy, transformation | cinematic depth of field, dramatic top-lighting, dynamic motion, sharp geometric sparks |
| **Zodiac Portraiture** | The 12 animals rendered with beauty, character, and symbolic power | Sign-specific posts, compatibility, personality deep dives | dignified animal portrait, symbolic accessories, rich textural detail |
| **Sacred & Symbolic** | Mahjong tiles, lotus flowers, lanterns, yin-yang, red thread of fate, Chinese brush art | Origin stories, cultural context, spiritual guidance | ink wash texture, warm candlelight or lantern glow, reverent composition |
| **Seasonal & Nature** | Cherry blossom, autumn gold, winter snow, summer storms — tied to the Chinese calendar | Seasonal forecasts, holiday-tied posts | wide landscape or macro nature, soft natural light, seasonal color palette |

## Brand colours

Midnight Indigo `#1B1F3B` · Celestial Gold `#C9A84C` · Mystic Fire `#C0392B` · Warm Cream `#FAF8F4`

## Exclusions (always append)

> No Western zodiac symbols, text overlays, watermarks, anime style, rounded or soft shapes, or generic stock photography.

## Prompt template

```
[Style name] style: [primary subject].
[Style prompt hints]. Colors: [relevant brand colours].
[Composition — focal point, depth, movement].
Aspect ratio: 16:9.
No Western zodiac symbols, text overlays, watermarks, anime style, rounded or soft shapes, or generic stock photography.
```

---

## Steps

### 1. Determine what is needed

Read `content/topics/<slug>/blog.md` if it exists. Extract title, category, emotional angle, key visual subjects. If no content file exists, work from the slug and any context the user provided.

### 2. Construct the prompt

Select the most appropriate style from the table above based on the post content. Build the prompt using the template and proceed directly to generation — no confirmation needed.

### 3. Call the Gemini API

Requires `GEMINI_API_KEY` set in `.env`. Always run using the `mahjong-tarot` conda environment:
`/opt/anaconda3/envs/mahjong-tarot/bin/python`

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

Archive a permanent copy to `content/topics/<slug>/<slug>-hero-original.png`.

If the API call fails, simplify the prompt (remove hex codes, reduce specificity) and retry once.

### 4. Optimise to WebP

```python
from PIL import Image
import os, sys

source_path  = f"working_files/{SLUG}-raw.png"
target_w, target_h, max_kb = 1200, 630, 200
output_path  = f"content/topics/{SLUG}/{SLUG}-hero.webp"
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
        sys.exit(0)

print(f"FAIL  {size_kb:.1f}KB exceeds {max_kb}KB at q65")
sys.exit(1)
```

### 5. Report to the user

```
Original PNG:  content/topics/<slug>/<slug>-hero-original.png
WebP output:   content/topics/<slug>/<slug>-hero.webp
Dimensions:    1200×630
File size:     X KB
Style used:    [style name]
Prompt used:   [prompt text]
```

If the user is not satisfied, ask what to change and re-run from Step 2.

---

## Edge cases

| Situation | Action |
|-----------|--------|
| `GEMINI_API_KEY` not set | Stop. Tell the user to add it to `.env` and retry. |
| API call fails | Simplify prompt, retry once. Report if still failing. |
| Image has baked-in text or watermark | Retry with: "No text, letters, numbers, symbols, or watermarks anywhere in the image." |
| Image doesn't match brand palette | Retry with: "Dominant colors must be deep navy (#1B1F3B) and gold (#C9A84C) with crimson accents (#C0392B) only." |
| packages missing | Run `/opt/anaconda3/envs/mahjong-tarot/bin/pip install google-genai python-dotenv Pillow` |
| User wants variations | Re-run Step 3 with a slightly adjusted prompt (different angle, focal point, or lighting). |
