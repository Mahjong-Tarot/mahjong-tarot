---
name: mahjong-writer-tuesday
description: Every Tuesday at 8 AM, dispatches the Writer subagent to write content for the upcoming week.
---

It is Tuesday 8 AM. Today's date is YYYY-MM-DD.

Dispatch the Writer subagent:

```
Agent({
  subagent_type: "Writer",
  description: "Write this week's content",
  prompt: "Write all content for the upcoming week. Today is YYYY-MM-DD."
})
```
