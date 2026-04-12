# Image Designer Agent — Plan

## What This Agent Is

The Image Designer is an autonomous production agent for **The Mahjong Tarot** website. It owns all image work — no other agent or human manually produces or optimises images. Its sole input is a structured YAML request file; its sole output is a set of optimised WebP images written to `website/public/images/blog/`.

It does not make creative decisions. Style, mood, palette, and composition are specified by the upstream agent (or human) in the request file. The Image Designer executes, optimises, logs, and reports.

---

## Trigger Modes

| Mode | How | When |
|------|-----|------|
| Scheduled | Cron — every Monday 9:00 AM | Processes all queued `.yaml` files automatically |
| Manual | `@image-designer process <slug>` | Processes a single slug on demand |

---

## Capabilities

### 1. Optimise an existing image (Workflow A)

Takes a source image (JPEG, PNG, or WebP) from `working_files/` and transforms it into brand-ready WebP output.

- Applies colour grading: brightness, contrast, saturation via Pillow
- Crops to the correct aspect ratio (center / top / bottom anchor)
- Resizes to exact pixel dimensions for the requested image type
- Enforces a per-type file-size limit; retries at lower quality (q82 → q72 → q65) if over
- Writes the final WebP to `website/public/images/blog/`

### 2. Generate a new image via AI (Workflow B)

Constructs a Gemini prompt from the request's style selection, generates the image via browser automation, and runs the same optimisation pipeline.

- Reads the style catalogue (`context/styles.json`) to build the prompt — visual direction, brand colours, exclusions
- Uses a `prompt_override` directly if supplied in the request
- Presents the prompt to the user for confirmation before opening Gemini
- Opens `https://gemini.google.com/app` via browser automation, submits the prompt, waits for generation
- Downloads the generated PNG; archives it to `content/topics/<slug>/`
- Runs the full Pillow pipeline (crop → resize → WebP → size gate)

### 3. Multi-type output from a single request

A single request file can specify multiple image types (hero, thumbnail, card, og, social). The agent processes each type in sequence, deriving the correct dimensions and output path per type from the same source or generated image.

### 4. Error handling and recovery

- Missing source file → logs error, skips that entry, continues with remaining entries
- Size gate failure after q65 → logs failure, does not write to `website/`, moves request to `failed/`
- Gemini sign-in required → stops, notifies user, leaves request in place for next run
- Gemini generation fails → simplifies prompt, retries once; if still failing, moves to `failed/`
- Unknown image type → logs error, skips entry

### 5. Logging and audit trail

After every image (success or failure), appends a row to `output/run-log.md`. On failure, also writes a detailed error report to `output/errors/`. This gives the team a full audit trail of every image produced.

### 6. Request lifecycle management

- Successfully processed request files → moved to `agents/web-designer/output/requests/processed/`
- Failed request files → moved to `agents/web-designer/output/requests/failed/`
- Request files are only moved once all image entries in the file have been attempted

---

## Image Types Produced

| Type | Dimensions | Max Size | Use |
|------|-----------|----------|-----|
| `hero` | 1200 × 630 | 200 KB | Blog post hero image |
| `thumbnail` | 600 × 315 | 80 KB | Blog listing card |
| `card` | 400 × 400 | 60 KB | Square card or sidebar |
| `og` | 1200 × 630 | 200 KB | Open Graph / social share |
| `social` | 1080 × 1080 | 150 KB | Instagram / square social |

---

## Skills

| Skill | File | Purpose |
|-------|------|---------|
| `optimise-image` | `skills/optimise-image/SKILL.md` | Full Pillow pipeline for existing source images |
| `generate-image` | `skills/generate-image/SKILL.md` | Prompt construction, Gemini browser automation, Pillow pipeline |

---

## What This Agent Does NOT Do

- Make creative decisions — style, palette, and mood come from the request file
- Push images to GitHub — that is always a manual `git push` by the user
- Write blog post content or React components — those belong to other agents
- Process requests that lack a valid YAML file — no improvising
