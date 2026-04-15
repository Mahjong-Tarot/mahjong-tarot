# Image Designer Agent — Workflow

**Owner:** Image Designer Agent
**Schedule:** Every Monday 9:00 AM (cron) — or on-demand via `@image-designer process <slug>`
**Purpose:** Produce all optimised WebP images for blog posts and site pages — either by generating new images via the Gemini API or by optimising existing source images via Pillow.

---

## Prerequisites

Before the Image Designer runs, these things should already be in place:

- A YAML request file has been placed at `agents/web-designer/output/requests/<slug>-image-request.yaml`
- For **generate** workflow: `GEMINI_API_KEY` is set in `.env`
- For **optimise** workflow: the source image exists at the path specified in the request file (usually `working_files/`)
- The `mahjong-tarot` conda environment is active with `google-genai`, `python-dotenv`, and `Pillow` installed

---

## Folder Structure

```
agents/image-designer/
├── context/
│   └── persona.md                        # Agent identity, rules, output specs
├── skills/
│   ├── generate-image/SKILL.md           # Gemini API generation + Pillow pipeline
│   ├── optimise-image/SKILL.md           # Pillow pipeline for existing source images
│   └── evals/evals.json                  # Test cases for both skills
└── workflow/
    ├── plan.md                            # Agent capabilities overview
    ├── generate-image.md                  # Step-by-step for Workflow B
    └── optimise-image.md                  # Step-by-step for Workflow A

agents/web-designer/output/requests/
├── <slug>-image-request.yaml             # Incoming — queued for processing
├── processed/                             # Moved here on success
└── failed/                               # Moved here on failure

working_files/                            # Source images and temp raw PNGs (git-ignored)

website/public/images/
├── blog/                                  # Blog post images
│   ├── {slug}.webp                        # hero
│   ├── {slug}-thumb.webp                  # thumbnail
│   ├── {slug}-card.webp                   # card
│   ├── {slug}-og.webp                     # Open Graph
│   └── {slug}-social.webp                 # social square
└── {slug}.webp                            # Site-wide assets (homepage, about, etc.)

content/topics/<slug>/
└── <slug>-<type>-original.png            # Archived original PNG (generate workflow only)
```

---

## Image Type Specifications

| Type | Dimensions | Aspect | Max Size | Use |
|------|-----------|--------|----------|-----|
| hero | 1200 × 630 | 16:9 | 200 KB | Blog post hero / page hero |
| thumbnail | 600 × 315 | 16:9 | 80 KB | Blog listing card |
| card | 400 × 400 | 1:1 | 60 KB | Square card or sidebar |
| og | 1200 × 630 | 16:9 | 200 KB | Open Graph / social share meta |
| social | 1080 × 1080 | 1:1 | 150 KB | Instagram / square social post |

**Output path rule:** If `content/topics/<slug>/blog.md` exists → output to `website/public/images/blog/`. Otherwise → `website/public/images/` (site-wide assets).

---

## Workflow A — Optimise an Existing Image

**Trigger:** Request entry has `workflow: optimise`

1. Read the request YAML — extract `slug`, `type`, `source`, and optional `filters`
2. Verify the source file exists — log error and skip if missing
3. Run the Pillow pipeline: colour grade (brightness / contrast / saturation) → crop to target aspect ratio → resize to exact dimensions
4. Save as WebP; enforce the file-size limit (q82 → q72 → q65 fallback)
5. Write a run log entry — success or failure
6. Move request file to `processed/` on success, `failed/` on failure

---

## Workflow B — Generate a New Image

**Trigger:** Request entry has `workflow: generate`

1. Read the request YAML — extract `slug`, `type`, `style`, and optional `prompt_override`
2. Read `content/topics/<slug>/blog.md` for context if it exists (optional)
3. Construct the Gemini prompt from built-in brand knowledge (5 styles, 4 brand colours, standard exclusions) — or use `prompt_override` directly
4. Call the Gemini API (`imagen-4.0-generate-001`) using `/opt/anaconda3/envs/mahjong-tarot/bin/python`
5. Save the raw PNG to `working_files/<slug>-raw.png`; archive to `content/topics/<slug>/`
6. Run the Pillow pipeline for each requested image type (crop → resize → WebP → size gate)
7. Write a run log entry — success or failure
8. Move request file to `processed/` on success, `failed/` on failure

---

## Brand Styles

| Style | Best for |
|-------|----------|
| Celestial & Mystical | Forecasts, yearly/monthly readings, fate and destiny |
| Elemental Drama | Elemental sign posts, seasonal energy, transformation |
| Zodiac Portraiture | Sign-specific posts, compatibility, personality deep dives |
| Sacred & Symbolic | Origin stories, cultural context, spiritual guidance |
| Seasonal & Nature | Seasonal forecasts, holiday-tied posts |

---

## Request File Format

```yaml
slug: <post-slug>
post_path: content/topics/<slug>/blog.md

images:
  - type: hero
    workflow: generate
    style: "Elemental Drama"
    prompt_override: null

  - type: thumbnail
    workflow: optimise
    source: working_files/fire-horse-raw.jpg
    filters:
      brightness: 1.1
      contrast: 1.2
      crop: center
```

---

## Error Handling

| Situation | Action |
|-----------|--------|
| Source file missing (Workflow A) | Log error, skip entry, continue with remaining entries |
| `GEMINI_API_KEY` not set (Workflow B) | Stop. Tell user to add it to `.env`. Leave request in place. |
| API call fails | Simplify prompt, retry once. If still failing → `failed/`. |
| Image over size limit after q65 | Log failure, do not write to `website/`. Move to `failed/`. |
| Unrecognised style name | Stop immediately. Report valid style names. Do not call API. |
