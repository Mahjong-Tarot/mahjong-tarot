---
name: mahjong-publisher-weekday
description: Every weekday at 9 AM Asia/Saigon, finds all topic slugs that are ready to publish (have a blog post and a promoted hero image but no JSX component yet), builds each page with the build-page skill, updates the blog index, commits, opens a PR, and notifies Labs via Lark and email.
---

It is 9 AM Asia/Saigon. Today's date is YYYY-MM-DD. Day of week: <Monday/Tuesday/Wednesday/Thursday/Friday>.

Working directory: /Applications/E8/Innovations/mahjong-tarot

## Step 0 — Load credentials

```bash
_ENV_FILE=$([ -f .env.local ] && echo .env.local || echo .env)
RESEND_API_KEY=$(grep 'RESEND_API_KEY' "$_ENV_FILE" | cut -d= -f2- | tr -d '"')
RESEND_FROM=$(grep 'RESEND_FROM' "$_ENV_FILE" | cut -d= -f2- | tr -d '"')
RESEND_TO=$(grep 'RESEND_TO' "$_ENV_FILE" | cut -d= -f2- | tr -d '"')
LABS_CHAT="oc_e5fe68740864439744b3fb0f31f81040"
```

## Step 1 — Discover ready slugs

A slug is **ready to publish** when ALL of the following are true:
1. `content/topics/<slug>/blog-*.md` exists (blog post written)
2. `website/public/images/blog/<slug>.webp` exists (hero image promoted by designer)
3. `website/pages/blog/posts/<slug>.jsx` does NOT exist (page not yet built)

```python
import os, glob

topics_dir  = "content/topics"
posts_dir   = "website/pages/blog/posts"
images_dir  = "website/public/images/blog"
ready       = []

for slug in sorted(os.listdir(topics_dir)):
    slug_dir = os.path.join(topics_dir, slug)
    if not os.path.isdir(slug_dir):
        continue
    has_blog  = bool(glob.glob(os.path.join(slug_dir, "blog-*.md")))
    has_image = os.path.exists(os.path.join(images_dir, f"{slug}.webp"))
    has_page  = os.path.exists(os.path.join(posts_dir,  f"{slug}.jsx"))
    if has_blog and has_image and not has_page:
        ready.append(slug)

for s in ready:
    print(s)
```

**Today-first ordering:** Read each ready slug's blog front matter publish date. Sort so that slugs with publish dates on or before today come first — publish overdue content before future-dated content. Still publish future-dated slugs if they are ready, since the pipeline runs ahead of schedule by design.

If the list is empty, send a skip notification and stop:

```bash
LARK_MSG="🌐 Publisher (weekday YYYY-MM-DD) — nothing to publish
No slugs are ready yet (need both blog post and hero image). No action taken."
lark-cli im +messages-send --chat-id "$LABS_CHAT" --as bot --text "$LARK_MSG" 2>/dev/null || true
```

## Step 2 — Pull latest and create branch

```bash
git pull origin main
git checkout -b web-dev/publish-YYYY-MM-DD
```

## Step 3 — Build and publish each ready slug

For each slug in the ready list:

### 3a. Detect blog type

List files in `content/topics/<slug>/` and find the `blog-*.md` file. Extract the type suffix:
- `blog-fire-horse.md` → type = `fire-horse`
- `blog-mahjong-mirror.md` → type = `mahjong-mirror`
- `blog-feel-good-friday.md` → type = `feel-good-friday`

### 3b. Invoke build-page skill

Invoke the `build-page` skill at `.claude/skills/build-page/SKILL.md` with the explicit source path:

```
Source file: content/topics/<slug>/blog-<type>.md
```

Always pass the full explicit path. Do not allow the skill to fall back to listing `content/*.md`.

The build-page skill reads the blog markdown and writes a Next.js JSX component to `agents/web-developer/output/<slug>.jsx`.

### 3c. Verify image

Confirm `website/public/images/blog/<slug>.webp` exists before writing the component. If missing, skip this slug and log a warning — do not fail the entire run.

### 3d. Copy component to website

```bash
cp agents/web-developer/output/<slug>.jsx website/pages/blog/posts/<slug>.jsx
```

### 3e. Update blog index

Open `website/pages/blog/index.jsx`. Add a new post card at the **top** of the post grid, following the exact pattern of the card immediately below it.

Read values from the blog front matter and SEO guide (`content/topics/<slug>/seo-<type>.md`):

| Card field | Source |
|---|---|
| `href` | `/blog/posts/<slug>` |
| `src` | `/images/blog/<slug>.webp` |
| `alt` | Image Alt Text from `seo-<type>.md` |
| `category` | Blog front matter — must match approved list |
| `title` | Blog front matter |
| `excerpt` | Blog front matter |
| `meta` | `By Bill Hajdu · <date> · <X> min read` |

**Approved categories:** Mahjong and Tarot · Tarot · Mahjong Readings · Year of the Snake · Year of the Fire Horse · Blood Moon

If the category does not match, substitute the closest valid category, note it in the final report, and continue — do not stop the run.

Repeat Steps 3a–3e for every slug in the ready list.

## Step 4 — Stage and commit

```bash
# Repeat for every slug processed
git add website/pages/blog/posts/<slug>.jsx
git add website/public/images/blog/<slug>.webp   # already exists, ensures it's tracked

git add website/pages/blog/index.jsx             # once, after all slugs

git commit -m "publish(YYYY-MM-DD): <comma-separated list of post titles>"
git push origin web-dev/publish-YYYY-MM-DD
```

## Step 5 — Update publish log

Append one row per slug to `context/publish-log.md`. Create the file with a header if it does not exist:

```
| Date | Title | File | Category |
|------|-------|------|----------|
```

Then append:
```
| YYYY-MM-DD | <title> | <slug>.jsx | <category> |
```

```bash
git add context/publish-log.md
git commit --amend --no-edit   # fold into the existing commit
```

Wait — per global-engineering rules, never amend commits. Instead:
```bash
git add context/publish-log.md
git commit -m "publish-log(YYYY-MM-DD): update for <slugs>"
```

## Step 6 — Open PR

```bash
gh pr create \
  --title "Publish: YYYY-MM-DD — <N> posts" \
  --base main \
  --body "$(cat <<'EOF'
## Posts published

<one line per slug: • <title>  →  /blog/posts/<slug>>

## Warnings (if any)
<missing images, category substitutions — or "None">

🤖 Generated by mahjong-publisher-weekday scheduled task
EOF
)"
gh pr merge --merge --auto --delete-branch
git checkout main && git pull origin main
git branch -d web-dev/publish-YYYY-MM-DD 2>/dev/null || true
```

## Step 7 — Notify

```bash
PUBLISHED_LIST="<one line per slug: • <title> → /blog/posts/<slug>>"
WARNINGS="<or None>"

LARK_MSG="🌐 Published — YYYY-MM-DD
${PUBLISHED_LIST}
Run: git push origin main to go live."

EMAIL_SUBJECT="[Publisher] YYYY-MM-DD — <N> posts built and committed"
EMAIL_BODY="Web developer has built and committed the following posts:

${PUBLISHED_LIST}

Warnings: ${WARNINGS}

Run git push origin main from your terminal to publish to GitHub.
PR merged to main."

lark-cli im +messages-send --chat-id "$LABS_CHAT" --as bot --text "$LARK_MSG" 2>/dev/null || true

RESEND_API_KEY="$RESEND_API_KEY" resend emails send \
  --from "$RESEND_FROM" \
  --to $(echo "$RESEND_TO" | tr ',' ' ') \
  --subject "$EMAIL_SUBJECT" \
  --text "$EMAIL_BODY" 2>/dev/null || true
```
