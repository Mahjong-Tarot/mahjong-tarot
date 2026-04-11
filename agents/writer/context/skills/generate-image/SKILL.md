---
name: generate-image
description: "Generates blog hero images and inline images for The Mahjong Tarot website using Nano Banana 2 (Google Gemini) via browser automation. MUST be used whenever: creating a hero image for a blog post, generating artwork for a page, the user says 'generate image', 'create image', 'make the hero image', 'nano banana', or any request involving AI image generation for the site. Also triggered by the Writer agent during Phase 8 of the content creation workflow."
---

# Generate Image — Nano Banana 2 via Browser Automation

Creates blog hero images and site artwork using Google's Nano Banana 2 image generator (inside Gemini) through Claude in Chrome browser automation. The Writer agent decides the image style per post based on content and mood.

## Before you start

Read these files in order — do NOT generate any images until you have read them:

1. `context/web-style-guide.md` — Master brand colors and imagery guidelines
2. `agents/writer/context/style-guide.md` — Image style catalogue and zodiac visual language

## Inputs

The skill accepts one of:

- **A complete image prompt** — ready to paste into Gemini (from the Writer agent's Phase 8)
- **A blog post slug or topic** — the skill will read the post content and craft the prompt
- **A general request** — e.g., "generate the hero image for the fire horse post"

If no prompt is provided, the skill reads the blog content and constructs one using the Writer agent's image style catalogue.

---

## Image Style Catalogue (Writer Agent Decides)

The Writer agent selects from these five styles based on the post's content and emotional angle:

| Style | Visual Direction | Best For |
|-------|-----------------|----------|
| **Celestial & Mystical** | Deep cosmos, moonlit skies, glowing zodiac constellations, starfields with Chinese symbols | Forecasts, yearly/monthly readings, fate and destiny themes |
| **Elemental Drama** | Fire, water, earth, metal, wood rendered with cinematic intensity. Rich color, dynamic energy | Elemental sign posts, seasonal energy, transformation themes |
| **Zodiac Portraiture** | The 12 animals rendered with beauty, character, and symbolic power | Sign-specific posts, compatibility, personality deep dives |
| **Sacred & Symbolic** | Mahjong tiles, lotus flowers, lanterns, yin-yang, red thread of fate, Chinese brush art | Origin stories, cultural context, myth-busters, spiritual guidance |
| **Seasonal & Nature** | Cherry blossom, autumn gold, winter snow, summer storms — tied to the Chinese calendar | Seasonal forecasts, holiday-tied posts, nature-grounded wisdom |

---

## Step-by-step process

### 1. Determine what image is needed

Read the blog post source file:
- Check `content/topics/[topic-slug]/blog.md` first
- Fall back to `content/[slug].md`
- Extract: title, category, emotional angle, key visual subjects

If the Writer agent has already selected an image style (from Phase 2.2 of the content workflow), use that. Otherwise, recommend a style from the catalogue above.

### 2. Construct the image prompt

Build a natural language prompt following these rules:

**Prompt structure:**
```
[Image Style Name] style: [Primary subject — zodiac animal, element, symbolic scene].
[Mood and lighting direction]. [Color palette aligned with brand tokens].
[Composition — foreground/background, focal point].
Aspect ratio: 16:9 for blog hero images.
Exclude: Western zodiac symbols, text overlays, watermarks, anime style, generic stock photography, rounded or soft shapes.
```

**Brand color references for prompts:**
- Midnight Indigo: deep navy-black `#1B1F3B` — for backgrounds, shadow areas
- Mystic Fire: rich crimson `#C0392B` — for fire elements, energy accents
- Celestial Gold: warm gold `#C9A84C` — for light, highlights, celestial glow
- Warm Cream: soft ivory `#FAF8F4` — for mist, ethereal light

**Zodiac visual language:**
- Fire signs: warm amber, orange flames, dynamic motion
- Water signs: deep teal, moonlight, fluid forms
- Earth signs: rich brown, stone, grounded and still
- Metal signs: silver, sharp geometry, clean lines
- Wood signs: jade green, organic growth, branching forms

**Example prompt:**
```
Elemental Drama style: A powerful horse galloping through a sea of crimson
and gold fire, mane blazing with celestial energy, sharp geometric sparks
trailing behind. Deep navy-black background (#1B1F3B) with dramatic
top-lighting in gold (#C9A84C) and crimson (#C0392B). Cinematic depth of
field, horse fills the center-right of the frame, flames sweep left to right.
Aspect ratio: 16:9. Exclude: Western zodiac symbols, text, watermarks,
anime style, rounded shapes, soft pastel colors.
```

Present the prompt to the user and ask: "Should I send this to Nano Banana to generate the image?"

Wait for confirmation before proceeding.

### 3. Open Gemini in the browser

Use Claude in Chrome browser automation:

1. Get tab context: `tabs_context_mcp` (create a tab group if needed)
2. Create a new tab: `tabs_create_mcp`
3. Navigate to: `https://gemini.google.com/app`
4. Wait for the page to load (take a screenshot to verify)

**If Gemini requires sign-in:**
- Stop and tell the user: "Gemini needs you to sign in. Please log into your Google account in the browser, then tell me to continue."
- Do NOT attempt to enter credentials

### 4. Enter the prompt and generate

1. Find the text input area on the Gemini page
2. Type the approved image prompt
3. Press Enter or click the send button
4. Wait for Gemini to generate the image (this may take 10-30 seconds)
5. Take a screenshot to verify the image was generated

**If generation fails or produces an error:**
- Take a screenshot and report the error to the user
- Suggest: simplify the prompt, remove specific color hex codes, or try a different style
- Retry once with a simplified prompt before asking the user for guidance

### 5. Download the generated image

1. Locate the generated image in the Gemini response
2. Right-click the image (or find the download/save option)
3. Save the image to the working directory

**Important:** Ask the user for permission before downloading: "The image has been generated. Can I download it?"

### 6. Optimize the image

Once the image is saved locally, convert it to WebP format using Python + Pillow:

```python
from PIL import Image
import os

# Open the downloaded image
img = Image.open("path/to/downloaded-image.png")

# Blog hero: 1200x630 (16:9 crop if needed)
target_width = 1200
target_height = 630

# Resize maintaining aspect ratio, then crop to exact dimensions
img_ratio = img.width / img.height
target_ratio = target_width / target_height

if img_ratio > target_ratio:
    # Image is wider — fit to height, crop width
    new_height = target_height
    new_width = int(target_height * img_ratio)
else:
    # Image is taller — fit to width, crop height
    new_width = target_width
    new_height = int(target_width / img_ratio)

img_resized = img.resize((new_width, new_height), Image.LANCZOS)

# Center crop to exact dimensions
left = (new_width - target_width) // 2
top = (new_height - target_height) // 2
img_cropped = img_resized.crop((left, top, left + target_width, top + target_height))

# Save as WebP
slug = "<post-slug>"
output_path = f"website/public/images/blog/{slug}.webp"
img_cropped.save(output_path, "webp", quality=82)

# Check file size
size_kb = os.path.getsize(output_path) / 1024
print(f"Saved: {output_path} ({size_kb:.0f} KB)")

# If over 200KB, retry with lower quality
if size_kb > 200:
    img_cropped.save(output_path, "webp", quality=72)
    size_kb = os.path.getsize(output_path) / 1024
    print(f"Re-saved at q72: {output_path} ({size_kb:.0f} KB)")
```

Also save the original PNG to the content topic folder:
```
content/topics/[topic-slug]/[slug]-hero.png
```

### 7. Verify and report

Take a final inventory and report to the user:

- **Original saved:** `content/topics/[topic-slug]/[slug]-hero.png`
- **WebP optimized:** `website/public/images/blog/[slug].webp`
- **Dimensions:** 1200×630 (16:9)
- **File size:** [X] KB
- **Style used:** [Image Style Name]
- **Prompt used:** [the prompt text]

If the user is not satisfied with the image:
- Ask what to change (mood, subject, color, composition)
- Adjust the prompt
- Re-run from Step 4

---

## Output files

| File | Location | Purpose |
|------|----------|---------|
| Original PNG | `content/topics/[topic-slug]/[slug]-hero.png` | Source archive |
| Optimized WebP (hero) | `website/public/images/blog/[slug].webp` | Blog post hero (1200×630) |

---

## Edge cases

| Situation | Action |
|-----------|--------|
| Gemini not signed in | Stop. Ask user to sign in. Resume after confirmation. |
| Image generation fails | Screenshot the error. Simplify prompt. Retry once. Report if still failing. |
| Image has text/watermark baked in | Regenerate with stronger exclusion prompt: "Absolutely no text, words, letters, or watermarks anywhere in the image." |
| Image doesn't match brand palette | Regenerate with explicit color direction: "Dominant colors must be deep navy and gold with crimson accents only." |
| Downloaded image is too small | Request "high resolution" or "2K resolution" in the prompt. Use Nano Banana Pro model if available. |
| User wants multiple image options | Generate 2-3 variations by slightly modifying the prompt (different angle, different focal point). Present all for selection. |
| Pillow not installed | Run `pip install Pillow --break-system-packages` before processing. |

---

## Integration with Writer Agent Workflow

This skill replaces **Phase 8, Step 8.2** of the Writer agent's content creation workflow (`agents/writer/context/workflows/content-creation-workflow.md`). The Writer agent still handles:

- **Phase 2, Step 2.2:** Selecting the image style (from the catalogue above)
- **Phase 8, Step 8.1:** Constructing the image prompt

This skill handles:

- **Phase 8, Step 8.2:** Generating the image via browser (instead of API)
- **Image optimization and file placement**

The handoff: Writer agent crafts the prompt → this skill generates and optimizes → Writer agent continues to Phase 9 (file creation).

---

## Quick reference — Prompt template

```
[STYLE] style: [SUBJECT].
[MOOD/LIGHTING]. [COLOR PALETTE — reference brand hex codes].
[COMPOSITION — placement, depth, movement].
Aspect ratio: 16:9.
Exclude: Western zodiac symbols, text overlays, watermarks, anime style,
generic stock photography, rounded or soft shapes.
```
