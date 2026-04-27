---
name: mahjong-writer-tuesday
description: Every Tuesday at 8 AM, dispatches the Writer subagent to write content for the upcoming week.
---

It is Tuesday 8 AM. Today's date is YYYY-MM-DD.

## Step 1 — Create a dedicated branch

```bash
git pull origin main
git checkout -b writer/tuesday-YYYY-MM-DD
```

Never work on main or on any branch whose name starts with a person's name (dave/, yon/, trac/, khang/).

## Step 2 — Dispatch the Writer subagent

```
Agent({
  subagent_type: "Writer",
  description: "Write this week's content",
  prompt: "Write all content for the upcoming week. Today is YYYY-MM-DD. You are already on branch writer/tuesday-YYYY-MM-DD — do not create or switch branches."
})
```

## Step 3 — Commit, push, PR, and merge

After the subagent finishes:

```bash
# Stage all writer output — known paths only
git add content/topics/
git add content/content-calendar/content-calendar.md
git add content/topics/INDEX.md
git add emails/drafts/

git diff --cached --quiet && echo "Nothing to commit — writer produced no output" && exit 0

git commit -m "writer(tuesday-YYYY-MM-DD): content for week of <monday-date>"
git push origin writer/tuesday-YYYY-MM-DD

gh pr create \
  --title "Writer: Week of <monday-date>" \
  --base main \
  --body "Automated writer run — Tuesday YYYY-MM-DD. All blog posts, social content, and SEO guides for the week. **Review required before merge.**"
```

## Step 4 — Stop for human review

Do NOT auto-merge. Post the PR URL and stop. Bill reviews the content, then merges manually from GitHub (or asks Claude to merge after review).

Rationale: generated content may need wording tweaks, fact-checks, or voice corrections before it ships. Auto-merge locks Bill out of that review loop.
