---
name: mahjong-designer-thursday
description: Every Thursday at 8 AM, dispatches the Designer subagent to generate hero images for all written but unimaged posts.
---

It is Thursday 8 AM. Today's date is YYYY-MM-DD.

Dispatch the Designer subagent:

```
Agent({
  subagent_type: "Designer",
  description: "Generate images for all written posts",
  prompt: "Generate hero images for all WRITTEN topics that don't have images yet. Today is YYYY-MM-DD."
})
```
