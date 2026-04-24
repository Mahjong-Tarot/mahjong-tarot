---
name: mahjong-publisher-weekday
description: Every weekday at 9 AM, dispatches the Web Developer subagent to build and publish any posts that have a blog post and hero image but no JSX page yet.
---

It is 9 AM. Today's date is YYYY-MM-DD.

## Step 1 — Check if there is anything to publish TODAY

You only publish posts that are **due today**. Today is YYYY-MM-DD.

A slug is ready when ALL of these are true:
1. `content/topics/<folder>/blog-*.md` exists (folder format: `YYYY-MM-DD-<type>-<topic>`)
2. The blog markdown's frontmatter `date:` equals **today's date** (YYYY-MM-DD). If it's tomorrow, Friday, next Monday — skip it. Never pull future-dated posts forward.
3. The hero image exists — either at `website/public/images/blog/<url-slug>.webp` (already promoted) or inside the topic folder (you'll promote it)
4. `website/pages/blog/posts/<url-slug>.jsx` does NOT exist (where `<url-slug>` is the frontmatter `slug:` field, not the folder name)

If no slugs meet ALL four criteria for today, send a skip notification and stop — do not create a branch:

```bash
lark-cli im +messages-send \
  --chat-id "oc_e5fe68740864439744b3fb0f31f81040" \
  --as bot \
  --text "🌐 Publisher (YYYY-MM-DD) — nothing ready to publish." 2>/dev/null || true
```

## Step 1b — Em dash quality gate

Before creating a branch, grep the source blog markdown for em dashes. Em dashes are banned in published content:

```bash
for f in <list of today's ready blog-*.md files>; do
  if grep -l "—" "$f"; then
    echo "BLOCKED: em dash found in $f"
    # Stop — notify and exit, do NOT create a branch or publish
  fi
done
```

If any ready post has an em dash, stop the run and notify Lark/email: "Publisher blocked on YYYY-MM-DD — em dashes in <file paths>. Rerun writer's Step 8 sweep." Do not silently strip them. Do not create a branch.

## Step 2 — Create a dedicated branch

Only if ready slugs were found AND the em dash gate passed:

```bash
git pull origin main
git checkout -b web-dev/publish-YYYY-MM-DD
```

Never work on main or on any branch whose name starts with a person's name (dave/, yon/, trac/, khang/).

## Step 3 — Dispatch the Web Developer subagent

```
Agent({
  subagent_type: "Web Developer",
  description: "Build and publish today's posts",
  prompt: "Today is YYYY-MM-DD. Build and publish ONLY the posts whose blog frontmatter date equals today. Do NOT build future-dated posts. A post is in scope when: (1) content/topics/<folder>/blog-*.md exists, (2) frontmatter date equals today, (3) a hero image is available (promote from topic folder if needed), (4) website/pages/blog/posts/<url-slug>.jsx does not exist. The url-slug comes from the blog frontmatter slug field — not the folder name. You are already on branch web-dev/publish-YYYY-MM-DD — do not create or switch branches."
})
```

## Step 4 — Commit, push, PR, and merge

After the subagent finishes:

```bash
# Stage all web-developer output — known paths only
git add website/pages/blog/posts/
git add website/pages/blog/index.jsx
git add website/public/images/blog/
git add context/publish-log.md

git diff --cached --quiet && echo "Nothing to commit — web-developer produced no output" && exit 0

git commit -m "publish(YYYY-MM-DD): <comma-separated post titles>"
git push origin web-dev/publish-YYYY-MM-DD

gh pr create \
  --title "Publish: YYYY-MM-DD" \
  --base main \
  --body "Automated publisher run — YYYY-MM-DD. New blog pages built and blog index updated."

gh pr merge --merge --delete-branch
git checkout main
git pull origin main
git branch -d web-dev/publish-YYYY-MM-DD 2>/dev/null || true
```
