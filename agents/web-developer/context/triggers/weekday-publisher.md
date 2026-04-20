---
name: mahjong-publisher-weekday
description: Every weekday at 9 AM, dispatches the Web Developer subagent to build and publish any posts that have a blog post and hero image but no JSX page yet.
---

It is 9 AM. Today's date is YYYY-MM-DD.

Dispatch the Web Developer subagent:

```
Agent({
  subagent_type: "Web Developer",
  description: "Build and publish ready posts",
  prompt: "Build pages for all posts that are ready to publish — those with a blog-*.md and a promoted hero image in website/public/images/blog/ but no JSX page yet. Today is YYYY-MM-DD."
})
```

If the subagent reports nothing ready, send a brief skip notification to the Labs Lark group (chat ID: oc_e5fe68740864439744b3fb0f31f81040):

```bash
_ENV_FILE=$([ -f .env.local ] && echo .env.local || echo .env)
lark-cli im +messages-send \
  --chat-id "oc_e5fe68740864439744b3fb0f31f81040" \
  --as bot \
  --text "🌐 Publisher (YYYY-MM-DD) — nothing ready to publish." 2>/dev/null || true
```
