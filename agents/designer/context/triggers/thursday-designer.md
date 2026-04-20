---
name: mahjong-designer-thursday
description: Every Thursday at 8 AM, dispatches the Designer subagent to generate hero images for all written but unimaged posts.
---

It is Thursday 8 AM. Today's date is YYYY-MM-DD.

## Step 1 — Create a dedicated branch

```bash
git pull origin main
git checkout -b designer/thursday-YYYY-MM-DD
```

Never work on main or on any branch whose name starts with a person's name (dave/, yon/, trac/, khang/).

## Step 2 — Dispatch the Designer subagent

```
Agent({
  subagent_type: "Designer",
  description: "Generate images for all written posts",
  prompt: "Generate hero images for all WRITTEN topics that don't have images yet. Today is YYYY-MM-DD. You are already on branch designer/thursday-YYYY-MM-DD — do not create or switch branches."
})
```

## Step 3 — Commit, push, PR, and merge

After the subagent finishes:

```bash
# Stage all designer output — known paths only
git add content/topics/
git add website/public/images/blog/
git add agents/image-designer/output/run-log.md

git diff --cached --quiet && echo "Nothing to commit — designer produced no output" && exit 0

git commit -m "designer(thursday-YYYY-MM-DD): hero images for <list of slugs>"
git push origin designer/thursday-YYYY-MM-DD

gh pr create \
  --title "Designer: Hero images — YYYY-MM-DD" \
  --base main \
  --body "Automated designer run — Thursday YYYY-MM-DD. Hero images generated and promoted to website/public/images/blog/."

gh pr merge --merge --delete-branch
git checkout main
git pull origin main
git branch -d designer/thursday-YYYY-MM-DD 2>/dev/null || true
```
