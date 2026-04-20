---
name: mahjong-studio
description: Full content pipeline — writer → designer → web-developer → git commit. Three modes: (1) all-missing — discovers and processes every unfinished week end-to-end with no review pauses; (2) full-week — processes one upcoming week; (3) single-slug — content already written. Use when user says "run the pipeline", "publish all missing posts", "mahjong-studio", or "publish <slug>".
trigger: Manual.
---

# Mahjong Studio — Full Content Pipeline

Orchestrates the complete pipeline: writer → designer → web-developer → git commit.

**Three modes:**
- **All-missing** — discovers every incomplete week and processes all of them end-to-end, fully autonomous
- **Full week** — runs the writer for one upcoming week, then processes its 3 slugs
- **Single slug** — skips the writer; processes one specific slug whose content already exists

---

## Notifications

Send a Lark message to the Labs group **and** an email to all members at every checkpoint. Both commands must fire — a failure in one should not block the other (`|| true`).

Read env vars from `.env.local` (checked first) then `.env`:

```bash
# Load notification env vars
_ENV_FILE=$([ -f .env.local ] && echo .env.local || echo .env)
RESEND_FROM=$(grep 'RESEND_FROM' "$_ENV_FILE" | cut -d= -f2- | tr -d '"')
RESEND_TO=$(grep 'RESEND_TO'   "$_ENV_FILE" | cut -d= -f2- | tr -d '"')
RESEND_API_KEY=$(grep 'RESEND_API_KEY' "$_ENV_FILE" | cut -d= -f2- | tr -d '"')
LABS_CHAT="oc_e5fe68740864439744b3fb0f31f81040"

# Lark — Labs group (always --as bot)
lark-cli im +messages-send \
  --chat-id "$LABS_CHAT" \
  --as bot \
  --text "$LARK_MSG" 2>/dev/null || true

# Email — all members (RESEND_TO is comma-separated; convert to space-separated for CLI)
RESEND_API_KEY="$RESEND_API_KEY" resend emails send \
  --from "$RESEND_FROM" \
  --to $(echo "$RESEND_TO" | tr ',' ' ') \
  --subject "$EMAIL_SUBJECT" \
  --text "$EMAIL_BODY" 2>/dev/null || true
```

Set `$LARK_MSG`, `$EMAIL_SUBJECT`, and `$EMAIL_BODY` to the checkpoint-specific content below before running these commands. Lark messages should be short (2–4 lines). Emails can include the full file list.

---

## Known gaps in upstream skills (do not break from — handle inline)

| Skill | Gap | Pipeline fix |
|-------|-----|-------------|
| `.claude/skills/generate-image/SKILL.md` | Reads `content/topics/<slug>/blog.md` — file never exists | Bypassed — pipeline uses designer skill which reads `image-prompts.md` |
| `agents/designer/skills/generate-image/SKILL.md` (old) | No prompt-writing step; prompt built from blog only | Designer skill now owns prompt-writing as Phase 1 (Step 2) |
| `.claude/skills/build-page/SKILL.md` | Falls back to listing `content/*.md` if no path given | Always pass the explicit path `content/topics/<slug>/blog-<type>.md` |
| No skill | Blog index update | Handled explicitly in Phase 4d |
| No skill | Image promotion to `website/public/images/blog/` | Handled explicitly in Phase 3e |

---

## Phase 0 — Determine mode and scope

If the user says "all missing", "fill in all missing posts", or similar → **All-missing mode**.
If the user says "this week" or "full week" → **Full-week mode**.
If the user names a specific slug → **Single-slug mode**.

If no mode is clear, ask:

> **Which mode?**
>
> **[1] All missing** — Discover and process every incomplete week end-to-end, no pauses.
> **[2] Full week** — Run the writer for the upcoming week, then generate images and build all 3 pages.
> **[3] Single slug** — Content is already written. Which slug?

---

## All-missing mode

This mode is fully autonomous. It discovers all incomplete weeks and runs each one through the full pipeline without pausing for review. Notifications fire at each major milestone so the team can follow along.

### A1. Discover incomplete weeks

Read `content/content-calendar/content-calendar.md`. For each week listed, check its three slugs:

A week is **complete** when all three slugs have a corresponding `.jsx` file under `website/pages/blog/posts/`.
A week is **incomplete** if any slug is missing its `.jsx` file.

List all incomplete weeks in calendar order (oldest first). Log the list:

```
Incomplete weeks found:
  • Week of <date1>: <slug1>, <slug2>, <slug3>
  • Week of <date2>: <slug4>, <slug5>, <slug6>
  ...
```

Notify:

```bash
LARK_MSG="🚀 Mahjong Studio starting — all-missing mode
Incomplete weeks: <N>
Processing oldest-first. Will notify at each milestone."
```

### A2. Process each week in sequence

For each incomplete week (oldest first), run the following sub-steps. Do not stop between weeks unless a hard error occurs.

#### A2a. Writer phase

Invoke the writer skill (`.claude/skills/writer/SKILL.md`) for this week. The skill reads the content calendar, identifies the week, and writes all deliverables.

If source material is thin for a Fire Horse topic, the writer skill will note this. Continue writing — use the available source material and flag the gap in the milestone notification rather than stopping.

After writing, note the three slugs produced.

Notify:

```bash
LARK_MSG="✍️ Writer done — Week of <monday-date>
• <fire-horse-title>
• <mahjong-mirror-title>
• <feel-good-friday-title>
Proceeding to images automatically."

EMAIL_SUBJECT="[Mahjong Studio] Writer done — Week of <monday-date>"
EMAIL_BODY="Writer has completed all content for the week of <monday-date>.

Posts written:
• <fire-horse-title>  →  content/topics/<monday-slug>/blog-fire-horse.md
• <mahjong-mirror-title>  →  content/topics/<wednesday-slug>/blog-mahjong-mirror.md
• <feel-good-friday-title>  →  content/topics/<friday-slug>/blog-feel-good-friday.md

Pipeline is continuing automatically to image generation.
To adjust a post before it gets an image, edit the blog file now — the designer will pick up your changes."
```

#### A2b. Designer phase (per slug)

For each slug in the week (fire-horse → mahjong-mirror → feel-good-friday):

1. **Write image prompts** — invoke designer's generate-image skill Steps 2a–2e (prompt-writing phase). The designer reads the style guide, reads all content files, designs visual concepts, and writes `image-prompts.md` and `image-prompts.json`.

2. **Check for source image** — scan `working_files/` for any file whose name contains the slug. If found, set `source_path` to that file; otherwise `source_path = None`.

3. **Generate hero image** — invoke designer's generate-image skill Steps 3–5 (generation phase) for the blog channel only:
   - Channel: `blog-<type>` (e.g., `blog-fire-horse`)
   - Prompt: from the `## blog-<type>.md` section of `image-prompts.md`
   - Aspect: `16:9`
   - Raw PNG → `working_files/<slug>-blog-<type>-raw.png`
   - Archive → `content/topics/<slug>/<slug>-blog-<type>-original.png`
   - WebP → `content/topics/<slug>/<slug>-blog-<type>.webp`

4. **Promote image to website**:
   ```bash
   mkdir -p website/public/images/blog
   cp content/topics/<slug>/<slug>-blog-<type>.webp website/public/images/blog/<slug>.webp
   ```

5. Notify after image is done:
   ```bash
   LARK_MSG="🖼️ Image done — <slug> (<X> KB)
   website/public/images/blog/<slug>.webp
   Proceeding to page build."
   ```

#### A2c. Web-developer phase (per slug)

For each slug (same order as A2b):

1. **Invoke build-page** — invoke the `build-page` skill (`.claude/skills/build-page/SKILL.md`) with the explicit source path `content/topics/<slug>/blog-<type>.md`.

2. **Verify image** — confirm `website/public/images/blog/<slug>.webp` exists before writing the component.

3. **Copy component**:
   ```bash
   cp agents/web-developer/output/<slug>.jsx website/pages/blog/posts/<slug>.jsx
   ```

4. **Update blog index** — open `website/pages/blog/index.jsx` and add a new post card at the top of the post grid following the exact pattern of the card immediately below it. Read title, category, excerpt, date, and read-time from the blog's YAML front matter. Card fields:
   - `href` → `/blog/posts/<slug>`
   - `src` → `/images/blog/<slug>.webp`
   - `alt` → from `content/topics/<slug>/seo-<type>.md` Image Alt Text field
   - `category` → from blog front matter (must match approved list — see Phase 4d note)
   - `title` → from blog front matter
   - `excerpt` → from blog front matter
   - `meta` → `By Bill Hajdu · <date> · <X> min read`

   **Approved categories:** Mahjong and Tarot · Tarot · Mahjong Readings · Year of the Snake · Year of the Fire Horse · Blood Moon

   If the category does not match, substitute the closest valid category and note it in the final report.

#### A2d. Milestone notification per week

After all 3 slugs in the week are fully processed (written, imaged, built, index updated):

```bash
LARK_MSG="✅ Week complete — Week of <monday-date>
• /blog/posts/<monday-slug>
• /blog/posts/<wednesday-slug>
• /blog/posts/<friday-slug>
Staging for commit."

EMAIL_SUBJECT="[Mahjong Studio] Week complete — Week of <monday-date>"
EMAIL_BODY="All posts for the week of <monday-date> are written, imaged, and built.

Pages:
• /blog/posts/<monday-slug>
• /blog/posts/<wednesday-slug>
• /blog/posts/<friday-slug>

Staging and committing now."
```

### A3. Git commit (once, after all weeks)

After all incomplete weeks are processed:

#### A3a. Stage explicitly

For every slug processed across all weeks:
```bash
git add website/pages/blog/posts/<slug>.jsx
git add website/public/images/blog/<slug>.webp
```

Stage shared files once:
```bash
git add website/pages/blog/index.jsx
git add content/content-calendar/content-calendar.md
git add content/topics/INDEX.md
```

Stage all new topic folders:
```bash
git add content/topics/<slug1>/
git add content/topics/<slug2>/
# ... one per slug
```

Never use `git add .` or `git add -A`.

#### A3b. Commit

```bash
git commit -m "publish: <N> posts — <list of post titles, comma-separated>"
```

#### A3c. Update publish log

Append one row per slug to `context/publish-log.md`. Create the file with a header row if it does not exist:

```
| Date | Title | File | Category |
|------|-------|------|----------|
| <YYYY-MM-DD> | <title> | <slug>.jsx | <category> |
```

#### A3d. Final report

```
ALL DONE ✓

Committed <N> posts across <W> weeks. Run this from your terminal to push to GitHub:

  cd ~/Documents/mahjong-tarot && git push origin main

Posts published:
  • <title>  → /blog/posts/<slug>
  • ...

Flags (if any):
  • <any noted issues — thin source material, category substitutions, image retries>
```

Notify:

```bash
LARK_MSG="🏁 Mahjong Studio complete — <N> posts published
Run: git push origin main to go live."

EMAIL_SUBJECT="[Mahjong Studio] All done — <N> posts ready to push"
EMAIL_BODY="Mahjong Studio has finished processing all missing weeks.

<N> posts committed. Run git push origin main from your terminal to publish to GitHub.

Posts:
<list of title → /blog/posts/<slug> lines>

Any flags:
<noted issues or 'None'>"
```

---

## Full-week mode

### 1a. Invoke the write-post skill

Invoke the `writer` skill (`.claude/skills/writer/SKILL.md`). The skill reads the content calendar, identifies the upcoming week, and writes all deliverables for all three topics.

### 1b. Record the three slugs

After the writer finishes, note the three topic slugs:
- **Monday slug** (`blog-fire-horse.md`) — Fire Horse post
- **Wednesday slug** (`blog-mahjong-mirror.md`) — Mahjong Mirror post
- **Friday slug** (`blog-feel-good-friday.md`) — Feel Good Friday post

### 1c. Notify + PAUSE — Writer review checkpoint

Send notifications, then pause.

```bash
LARK_MSG="✍️ Writer done — Week of <monday-date>
• <fire-horse-title>
• <mahjong-mirror-title>
• <feel-good-friday-title>
Review blog posts in content/topics/ before images are generated."

EMAIL_SUBJECT="[Mahjong Studio] Writer done — Week of <monday-date>"
EMAIL_BODY="Writer has completed all content for the week of <monday-date>.

Posts written:
• <fire-horse-title>  →  content/topics/<monday-slug>/blog-fire-horse.md
• <mahjong-mirror-title>  →  content/topics/<wednesday-slug>/blog-mahjong-mirror.md
• <feel-good-friday-title>  →  content/topics/<friday-slug>/blog-feel-good-friday.md

Review each blog post. Reply to Claude Code to continue."
```

Then pause:

```
WRITER DONE ✓  (Labs + email notified)

  • content/topics/<monday-slug>/blog-fire-horse.md
  • content/topics/<wednesday-slug>/blog-mahjong-mirror.md
  • content/topics/<friday-slug>/blog-feel-good-friday.md

Tell me when ready to continue, or describe any edits to make first.
```

Wait for explicit confirmation before proceeding to designer phase.

After confirmation, run designer phase (Phase 3) and web-developer phase (Phase 4) below for each slug, with pauses at 3b and 3f and 4e.

---

## Phase 3 — Designer (full-week and single-slug modes)

Run for each slug in order: fire-horse → mahjong-mirror → feel-good-friday.
In single-slug mode, run for the one slug only.

### 3a. Designer writes image prompts

Invoke the designer's generate-image skill **Steps 2a–2e** (prompt-writing phase). The designer reads the style guide, reads all content files, and writes `image-prompts.md` and `image-prompts.json`.

### 3b. Notify + PAUSE — Prompt review checkpoint

```bash
LARK_MSG="🎨 Image prompts ready — <slug>
$(grep '^## ' content/topics/<slug>/image-prompts.md | sed 's/## /• /' | head -6)
Review content/topics/<slug>/image-prompts.md before images are generated."

EMAIL_SUBJECT="[Mahjong Studio] Image prompts ready — <slug>"
EMAIL_BODY="Designer has written image prompts for <slug>.

Prompts written for:
$(grep '^## ' content/topics/<slug>/image-prompts.md | sed 's/## /• /')

Review content/topics/<slug>/image-prompts.md. Edit any prompt directly in the file,
then reply to continue with image generation."
```

Pause. Wait for explicit confirmation before generating images.

### 3c. Check for source image

Scan `working_files/` for any file whose name contains the slug. If found, note the path for source image conditioning.

### 3d. Generate hero image

Invoke designer's generate-image skill **Steps 3–5**:
- Channel: `blog-<type>`
- Aspect: `16:9`
- Raw PNG → `working_files/<slug>-blog-<type>-raw.png`
- Archive → `content/topics/<slug>/<slug>-blog-<type>-original.png`
- WebP → `content/topics/<slug>/<slug>-blog-<type>.webp`

### 3e. Promote hero image to website

```bash
mkdir -p website/public/images/blog
cp content/topics/<slug>/<slug>-blog-<type>.webp website/public/images/blog/<slug>.webp
```

### 3f. Notify + PAUSE — Image review checkpoint

```bash
LARK_MSG="🖼️ Hero image done — <slug> (<X> KB)
Prompt: \"<first 80 chars of prompt>...\"
website/public/images/blog/<slug>.webp
Reply approved / regenerate / regenerate: <change>"

EMAIL_SUBJECT="[Mahjong Studio] Hero image done — <slug>"
EMAIL_BODY="Hero image generated for <slug>.

  WebP archive: content/topics/<slug>/<slug>-blog-<type>.webp
  Website copy: website/public/images/blog/<slug>.webp
  Dimensions:   1200×630 · <X> KB

Prompt used:
  \"<full prompt text>\"

Reply to Claude Code:
  approved                     — continue to next slug
  regenerate                   — re-run with the same prompt
  regenerate: <what to change> — adjust prompt then re-run"
```

Pause. Wait for explicit confirmation before moving to Phase 4.

---

## Phase 4 — Web Developer (full-week and single-slug modes)

Run for each slug after its image is approved.

### 4a. Invoke build-page

Invoke the `build-page` skill (`.claude/skills/build-page/SKILL.md`) with the explicit source path:

```
Source file: content/topics/<slug>/blog-<type>.md
```

### 4b. Verify image is in place

Confirm `website/public/images/blog/<slug>.webp` exists. If not, re-run Phase 3e.

### 4c. Copy component to website

```bash
cp agents/web-developer/output/<slug>.jsx website/pages/blog/posts/<slug>.jsx
```

### 4d. Update the blog index

Open `website/pages/blog/index.jsx`. Add a new post card at the **top** of the post grid. Read values from blog front matter and SEO guide.

**Approved categories:** Mahjong and Tarot · Tarot · Mahjong Readings · Year of the Snake · Year of the Fire Horse · Blood Moon

If the category does not match, stop and ask the user which category to use.

### 4e. Notify + PAUSE — Web-developer review checkpoint

```bash
LARK_MSG="🌐 Page built — <slug>
  /blog/posts/<slug>  ·  <category>  ·  <X> min read
Review website/pages/blog/posts/<slug>.jsx and blog index."

EMAIL_SUBJECT="[Mahjong Studio] Page built — <slug>"
EMAIL_BODY="Web component built for <slug>.

  Component:  website/pages/blog/posts/<slug>.jsx
  Blog index: website/pages/blog/index.jsx (card added at top)
  URL path:   /blog/posts/<slug>
  Category:   <category>
  Read time:  <X> min read

Review both files. Reply to Claude Code:
  approved       — continue to next slug (or commit if last)
  fix: <issue>   — describe the change needed"
```

Pause. Wait for confirmation before the next slug or Phase 5.

---

## Phase 5 — Git commit (full-week and single-slug modes)

### 5a. Stage explicitly

```bash
git add website/pages/blog/posts/<slug>.jsx
git add website/public/images/blog/<slug>.webp
# repeat for each slug
git add website/pages/blog/index.jsx
git add content/topics/<slug1>/
git add content/content-calendar/content-calendar.md
git add content/topics/INDEX.md
```

### 5b. Commit

Full-week:
```bash
git commit -m "publish: Week of <monday-date> — <fire-horse-title>, <mahjong-mirror-title>, <feel-good-friday-title>"
```

Single-slug:
```bash
git commit -m "publish: <post-title>"
```

### 5c. Update publish log

Append one row per slug to `context/publish-log.md`.

### 5d. Report

```
ALL DONE ✓

Committed. Run this from your terminal to push to GitHub:

  cd ~/Documents/mahjong-tarot && git push origin main
```

---

## Error handling

| Situation | Action |
|---|---|
| `GEMINI_API_KEY` not set | Stop. Ask user to add it to `.env` and retry. |
| `image-prompts.md` missing | Fall back to prompt construction from blog markdown using `.claude/skills/generate-image/SKILL.md`. |
| API call fails | Shorten the prompt, retry once. Report failure if still failing. |
| Category tag not in approved list | All-missing mode: substitute closest valid category, note in final report. Full-week/single-slug: stop and ask user. |
| `website/public/images/blog/` does not exist | Run `mkdir -p website/public/images/blog` before the copy. |
| WebP optimisation fails at q65 | Note the file size in the final report and continue — do not stop the pipeline. |
| Source material thin for a Fire Horse topic | Continue writing with available material. Note the gap in milestone notification and final report. |
| Multiple `blog-*.md` files in a topic folder | All-missing mode: use the one whose name matches the week's type. Full-week/single-slug: ask user. |
| Writer marks a week STATUS: WRITTEN but topic folder missing | Re-run writer for that week. |
| `jq` not found | `brew install jq` |
| `ffmpeg` not found | `brew install ffmpeg` |
