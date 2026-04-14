# Generate Image

## Purpose

Generate one image from a pre-planned prompt via the Gemini Python SDK (Nano Banana 2).

## Inputs

- `slug` — the topic slug
- `content_type` — content filename without `.md` (e.g., `blog-fire-horse`, `mon-facebook-en`)
- `prompt` — the full Gemini prompt (already written in image-prompts.md)
- `aspect_ratio` — `16:9` or `1:1`

## Steps

```python
from google import genai
from google.genai import types
from dotenv import load_dotenv
import os

load_dotenv()
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

SLUG = "the-slug"
TYPE = "the-content-type"
PROMPT = "the prompt text"
RATIO = "16:9"  # or "1:1"

response = client.models.generate_images(
    model="imagen-4.0-generate-001",
    prompt=PROMPT,
    config=types.GenerateImagesConfig(
        number_of_images=1,
        aspect_ratio=RATIO,
    ),
)

output_path = f"content/topics/{SLUG}/{SLUG}-{TYPE}.png"
with open(output_path, "wb") as f:
    f.write(response.generated_images[0].image.image_bytes)
print(f"Saved → {output_path}")
```

Run using the mahjong-tarot conda environment:
`/opt/anaconda3/envs/mahjong-tarot/bin/python`

## Output

- `content/topics/<slug>/<slug>-<content-type>.png` — generated image

## Error handling

| Situation | Action |
|---|---|
| `GEMINI_API_KEY` not set | Stop. Tell the user to add it to `.env`. |
| API call fails | Shorten the prompt, retry once. |
| Quota exceeded | Report and stop. |
| Packages missing | Run `/opt/anaconda3/envs/mahjong-tarot/bin/pip install google-genai python-dotenv` |
