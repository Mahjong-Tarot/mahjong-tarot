---
name: generate-image
description: "Generates blog hero images and site artwork for The Mahjong Tarot website using the Gemini API (imagen-4.0-generate-001). MUST be used whenever: creating a hero image for a blog post, generating artwork for a page, the user says 'generate image', 'create image', 'make the hero image', 'nano banana', or any request involving AI image generation for the site."
---

# Generate Image — Gemini API

Generates specific, concrete hero images for blog posts. Specificity is everything — abstract concepts produce generic images. Every prompt must be built from real, nameable objects and details.

---

## Inputs

- **A blog post slug** — skill reads the post content and follows the two-path approach below
- **A prompt override** — used directly, no prompt construction needed
- **A general request** — e.g., "generate the hero image for the Taylor Swift post"

---

## Two-path prompt construction

### Path A — Known subject (use when the post is about a real person, brand, team, cultural moment, or recognisable object)

1. Identify what you already know about the subject from your training data
2. List 2–3 **specific, concrete, visually recognisable objects** associated with that subject — not their personality, not their theme, actual *things*
3. Build the prompt from those objects in a specific scene or arrangement

Examples:
| Subject | Concrete objects to use |
|---------|------------------------|
| Taylor Swift | Friendship bracelets, a 1989 cassette, a tour setlist, red lipstick, a sequined costume |
| Travis Kelce | Kansas City Chiefs jersey, a football, a locker room, a touchdown spike |
| Chinese New Year | Red envelope, firecracker string, lion dance costume, tangerine tree |
| Year of the Snake | Coiled jade sculpture, shed snakeskin, a bamboo garden |

### Path B — Unknown or abstract subject (use when the post is about a concept, forecast, or lesser-known topic)

1. Read `content/topics/<slug>/blog.md`
2. Extract the **most specific concrete nouns** from the post itself — objects, places, physical things mentioned in the text
3. Do not use the theme or emotional angle — use the actual things named in the post
4. If the post has no concrete objects, use the most specific physical metaphor you can construct for the core tension

**The rule for both paths:** No abstract concepts in the prompt. "Opposing forces" → bad. "A jade bracelet and a football helmet on a silk cloth" → good.

---

## Prompt structure

```
[Scene or arrangement of specific concrete objects].
[Lighting and surface details — specific, not generic].
Colors: [brand colours in plain English].
No text, letters, numbers, symbols, watermarks, or Western zodiac imagery anywhere in the image.
```

**Tone — alternate between dark and light across posts. Do not default to dark every time.**

| Tone | Background | Accents | When to use |
|------|-----------|---------|-------------|
| Dark | Deep midnight navy | Warm antique gold, deep crimson | Drama, danger, mystery, night energy |
| Light | Soft cream or warm white | Antique gold details, navy or crimson accents | Joy, celebration, clarity, daytime energy |
| Mixed | One dark element + one light | Contrast within the frame | Tension between opposites, transition |

Check the run log before generating: if the last 2–3 images used dark backgrounds, use light or mixed this time.

Plain English only — never hex codes.

Example — Taylor Swift + Travis Kelce wedding post:
> Photorealistic flat lay of a stack of friendship bracelets, a Kansas City Chiefs pennant, and a single white peony on dark velvet, soft warm candlelight from the left, deep navy background with gold accents. No text, letters, numbers, symbols, watermarks, or Western zodiac imagery anywhere in the image.

Example — abstract Fire Horse forecast post:
> Photorealistic close-up of a burning red candle dripping onto a cracked antique compass, the needle spinning, dark wooden surface, dramatic side lighting in deep crimson and gold. No text, letters, numbers, symbols, watermarks, or Western zodiac imagery anywhere in the image.

---

## Channel → image type mapping

| Channel | Image type | Aspect ratio | Dimensions | Max KB |
|---------|-----------|-------------|------------|--------|
| Website | `hero` | 16:9 | 1200×630 | 200 |
| Facebook EN | `og` | 16:9 | 1200×630 | 200 |
| Facebook VN | `og` | 16:9 | 1200×630 | 200 |
| Instagram | `social` | 1:1 | 1080×1080 | 150 |
| LinkedIn | `og` | 16:9 | 1200×630 | 200 |
| X | `og` | 16:9 | 1200×630 | 200 |

Facebook EN and Facebook VN share the same `og` image — generate once, apply to both.

Use `aspect_ratio="1:1"` for `social`; `"16:9"` for everything else.

---

## Steps

### 1. Determine the subject

Read `content/topics/<slug>/blog.md`. Decide: is this post about a known real-world subject (person, team, brand, event) or an abstract/unknown topic? Choose Path A or Path B accordingly.

If no content file exists, ask the user for the subject and key concrete details before proceeding.

### 2. Build the prompt

Apply the two-path approach above. Build using the prompt structure. Check: does the prompt contain any abstract words (tension, energy, forces, power, emotion, opposing)? If yes, replace them with specific physical objects or details.

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

If the API call fails, shorten the prompt and retry once.

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
Path used:     A (known subject) / B (abstract)
Prompt used:   [prompt text]
```

If the user is not satisfied, ask what specific objects or details to change and re-run from Step 2.

---

## Edge cases

| Situation | Action |
|-----------|--------|
| `GEMINI_API_KEY` not set | Stop. Tell the user to add it to `.env` and retry. |
| API call fails | Shorten the prompt, retry once. Report if still failing. |
| Image is generic / could be for any post | Prompt was too abstract. Identify more specific concrete objects and retry from Step 2. |
| Unwanted text or watermark in image | Retry adding: "No text, letters, numbers, symbols, or watermarks anywhere in the image." |
| Image doesn't match brand palette | Retry adding: "Dominant colors must be deep midnight navy and warm antique gold with deep crimson accents only." |
| Packages missing | Run `/opt/anaconda3/envs/mahjong-tarot/bin/pip install google-genai python-dotenv Pillow` |
| User wants a variation | Change the specific objects or scene arrangement and re-run Step 3. |
