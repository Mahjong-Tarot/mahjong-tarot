---
name: mahjong-publisher-weekday
description: Every weekday at 9 AM, dispatches the Web Developer subagent to build and publish any posts that have a blog post and hero image but no JSX page yet.
---

It is 9 AM. Today's date is YYYY-MM-DD.

## Step 1 — Check if there is anything to publish

A slug is ready when `content/topics/<slug>/blog-*.md` exists, `website/public/images/blog/<slug>.webp` exists, and `website/pages/blog/posts/<slug>.jsx` does NOT exist.

If no ready slugs exist, send a skip notification and stop — do not create a branch:

```bash
lark-cli im +messages-send \
  --chat-id "oc_e5fe68740864439744b3fb0f31f81040" \
  --as bot \
  --text "🌐 Publisher (YYYY-MM-DD) — nothing ready to publish." 2>/dev/null || true
```

## Step 2 — Create a dedicated branch

Only if ready slugs were found:

```bash
git pull origin main
git checkout -b web-dev/publish-YYYY-MM-DD
```

Never work on main or on any branch whose name starts with a person's name (dave/, yon/, trac/, khang/).

## Step 3 — Dispatch the Web Developer subagent

```
Agent({
  subagent_type: "Web Developer",
  description: "Build and publish ready posts",
  prompt: "Build pages for all posts that are ready to publish — those with a blog-*.md and a promoted hero image in website/public/images/blog/ but no JSX page yet. Today is YYYY-MM-DD. You are already on branch web-dev/publish-YYYY-MM-DD — do not create or switch branches."
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
