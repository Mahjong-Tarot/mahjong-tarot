# Features — Index

Per-feature proposal and design folders. Each feature in active design or build gets its own subfolder under `features/`.

---

## Convention

For any non-trivial feature (anything more than a one-day change), create `features/<slug>/` with the following files as needed:

| File | Purpose |
|---|---|
| `feature-proposal.md` | The pitch — problem, audience, mechanism, success criterion. Written before any code. |
| `system-design.md` | Technical design — flows, data model deltas, dependencies. Written after the proposal is approved. |
| `database-design.md` | Schema additions, indexes, RLS policies. If only a few rows of detail, fold into `system-design.md`. |
| `voice-brief.md` | Optional — raw voice memo or product owner brief that started the feature. Verbatim, not edited. |

The proposal is the gate. Approval = "yes, build it." Without an approved proposal, no `system-design.md` is written.

---

## Active features

| Feature | Phase | Status | Folder |
|---|---|---|---|
| _(none yet — first feature folder will appear here)_ | | | |

When a feature ships, leave the folder in place — historical proposals are useful. Move folders to [`../archive/`](../archive/) only if the feature was abandoned without shipping.

---

## What lives elsewhere

- Product strategy and roadmap → [`../product/`](../product/)
- System-wide architecture → [`../architecture/`](../architecture/)
- Sprint and change records → [`../engineering/`](../engineering/)
