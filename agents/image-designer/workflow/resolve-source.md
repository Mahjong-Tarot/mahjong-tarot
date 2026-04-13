---
name: resolve-source
description: Runs before generate-image or optimise-image. Scans all images in working_files/, reads the slug and post content, then uses AI judgment to decide if any available image is topically suitable. If a match is found, routes to optimise. If not, routes to generate.
trigger: Always run this before deciding whether to generate or optimise for any slug.
---

# Resolve Source Workflow

## Purpose

Before calling the Gemini API, check whether any image already in `working_files/` is topically suitable for this post. The agent reads the post content and all available image filenames, then decides using its own judgment. If a suitable image exists, use it. Only generate if nothing fits.

---

## Step-by-step

### 1. List all images in working_files/

```python
import os, glob

extensions = ["jpg", "jpeg", "png", "webp", "tiff", "bmp", "JPG", "JPEG", "PNG", "WEBP"]
candidates = []
for ext in extensions:
    candidates += glob.glob(f"working_files/*.{ext}")

candidates = sorted(candidates)
for f in candidates:
    print(os.path.basename(f))
```

If `working_files/` is empty or has no image files, skip to Step 4 (generate).

### 2. Read the post

Read `content/topics/<slug>/blog.md` if it exists. Extract:
- The post title
- The main subject (person, event, concept, zodiac topic)
- Key nouns from the first 2–3 paragraphs

If `blog.md` does not exist, use the slug (hyphens → spaces) as the subject.

### 3. Agent judgment — does any image fit?

Review the list of filenames from Step 1 against the post subject from Step 2.

**Match criteria:** The image filename suggests it is topically related to this post. Filename inference only — do not open or view the image files.

Examples:
| Post subject | Filename | Match? |
|---|---|---|
| Taylor Swift & Travis Kelce wedding | `taylor-swift-eras-tour.jpg` | ✅ Yes — Taylor Swift is the subject |
| Taylor Swift & Travis Kelce wedding | `travis-kelce-superbowl.png` | ✅ Yes — Travis Kelce is the subject |
| Fire Horse year forecast | `fire-horse-painting.jpg` | ✅ Yes — direct topic match |
| Fire Horse year forecast | `taylor-swift-eras-tour.jpg` | ❌ No — unrelated |
| Snake compatibility post | `jade-snake-sculpture.png` | ✅ Yes — matches topic |
| Snake compatibility post | `red-candles-ceremony.jpg` | ❌ No — too generic, not topically related |

If multiple images match, prefer the one whose filename is most specific to the post subject.

### 4. Route based on judgment

| Outcome | Route |
|---------|-------|
| Suitable image found | Set `source = working_files/<filename>`. Proceed to `workflow/optimise-image.md`. |
| No suitable image | Proceed to `workflow/generate-image.md`. |

Log the decision to `agents/image-designer/output/run-log.md`:

On match:
```
| YYYY-MM-DD HH:MM | <slug> | — | resolve-source | Source matched: working_files/<filename> → optimise | — | ℹ️ |
```

On no match:
```
| YYYY-MM-DD HH:MM | <slug> | — | resolve-source | No suitable source in working_files/ → generate | — | ℹ️ |
```

---

## Notes

- Filename inference only — never open or view the image files to assess them
- "Topically related" means the image is about the same person, event, or subject as the post — not just mood or visual style
- Never delete or move source files from `working_files/` after use — leave them in place
- If the source image is lower resolution than the target, the optimise workflow handles upscaling — proceed anyway and log a warning
- `working_files/` is git-ignored — files here are staging/scratch only
