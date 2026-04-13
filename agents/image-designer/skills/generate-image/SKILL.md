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

### The fundamental rule

**Specificity produces good images. Abstraction produces generic images.**

"Opposing forces" → generic storm split-screen every time.
"A Kansas City Chiefs pennant and a friendship bracelet on dark velvet" → specific, recognisable, ownable.

Every prompt must be built from real, nameable, physical objects — not emotions, themes, or concepts.

---

### Two-path prompt construction

#### Path A — Known subject (real person, brand, team, cultural moment, recognisable object)

Use what you already know. List 2–3 specific, concrete, visually recognisable objects associated with that subject — not their personality, not their theme, actual *things* that exist in the world.

| Subject | Concrete objects to use |
|---------|------------------------|
| Taylor Swift | Friendship bracelets, 1989 cassette, tour setlist, red lipstick, sequined costume |
| Travis Kelce | Kansas City Chiefs jersey, football, locker room, touchdown spike |
| Chinese New Year | Red envelope, firecracker string, lion dance costume, tangerine tree |
| Year of the Snake | Coiled jade sculpture, shed snakeskin, bamboo garden |

#### Path B — Unknown or abstract subject

1. Read `content/topics/<slug>/blog.md`
2. Extract the most specific **concrete nouns** from the post — objects, places, physical things named in the text
3. Use those, not the theme or emotional angle
4. If the post has no concrete objects, construct the most specific physical metaphor you can for the core tension — a cracked object, a burning thing, two incompatible items placed together

---

### Prompt structure

```
[Scene or arrangement of specific concrete objects].
[Lighting and surface details — specific, not generic].
Colors: [brand colours in plain English].
No text, letters, numbers, symbols, watermarks, or Western zodiac imagery anywhere in the image.
```

**Brand colours (plain English only — never hex codes):** deep midnight navy · warm antique gold · deep crimson · soft cream

**Self-check before generating:** Does the prompt contain abstract words like: tension, energy, forces, power, emotion, opposing, mystical, celestial, dramatic? If yes — replace them with specific physical objects or details.

Example — Taylor Swift + Travis Kelce:
> Photorealistic flat lay of a stack of friendship bracelets, a Kansas City Chiefs pennant, and a single white peony on dark velvet, soft warm candlelight from the left, deep navy background with gold accents. No text, letters, numbers, symbols, watermarks, or Western zodiac imagery anywhere in the image.

Example — abstract Fire Horse forecast:
> Photorealistic close-up of a burning red candle dripping onto a cracked antique compass, the needle spinning, dark wooden surface, dramatic side lighting in deep crimson and gold. No text, letters, numbers, symbols, watermarks, or Western zodiac imagery anywhere in the image.

---

### Brand colours (plain English in prompts — no hex codes)

Deep midnight navy · warm antique gold · deep crimson · soft cream

### Exclusions (always append)

> No text, letters, numbers, symbols, watermarks, or Western zodiac imagery anywhere in the image.

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

Read `content/topics/<slug>/blog.md` if it exists. Extract the post's core emotional tension — not its topic, its *feeling*. What is the reader meant to feel: dread, longing, hope, danger, excitement?

Apply the creative variety rules above. Pick a medium from the menu that fits that feeling. Choose a subject that carries the emotion without literally illustrating the topic. Build the prompt using the structure above.

If `prompt_override` is set in the request, use that directly. Proceed to generation — no user confirmation needed.

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

If the API call fails, simplify the prompt (shorter title text, fewer background details) and retry once.

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

### 4. Log

Append to `agents/image-designer/output/run-log.md`:

```
| YYYY-MM-DD HH:MM | <slug> | <type> | generate | <output_path> | <size_kb> KB | ✅ OK |
```

---

## Edge cases

| Situation | Action |
|-----------|--------|
| `GEMINI_API_KEY` not set | Stop. Tell the user to add it to `.env` and retry. |
| API call fails | Shorten the prompt, retry once. |
| Title text not legible | Retry adding: "Large, clearly legible serif letterforms, high contrast between text and background." |
| Unwanted extra words in image | Retry adding: "No other words, labels, captions, symbols, or watermarks anywhere in the image." |
| Packages missing | Run `/opt/anaconda3/envs/mahjong-tarot/bin/pip install google-genai python-dotenv Pillow` |
