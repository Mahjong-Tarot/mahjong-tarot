# RAID Log — The Mahjong Tarot

**Last reviewed:** 2026-04-14
**Open items:** 3 Issues, 1 Risk, 2 Assumptions, 2 Dependencies

---

## Issues (I) — Active problems affecting the project

### [I] Issue: Source material unverified for "5 Chinese Zodiac Signs" post
Description: The blog draft for "5 Chinese Zodiac Signs Facing Their Biggest Life Change in 2026" contains sign-by-sign interpretations (Ox, Rabbit, Horse, Dog, Goat) written without official source material. Per the Source Material Policy, the post cannot be published until all interpretations are verified against authoritative Chinese astrology sources.
Owner: Dave (must locate and provide source files); Yon (review and sign off)
Impact: H — post is fully drafted and hero image is done; this is the only thing blocking publication
Age: Open since 2026-04-09 (**5 days as of 2026-04-14**)
Status: Open — CRITICAL
Date opened: 2026-04-09
Update 2026-04-12: Still unresolved. Escalated to RAID log. Reminder sent to Dave and Yon in EOD alert.
Update 2026-04-13: Still unresolved. Flagged again in EOD alert. No check-in updates received from Dave or Yon today.
Update 2026-04-14: Still unresolved. Dave checked in today but did not mention source material. Yon has no check-in for today. Now at 5 days — must be resolved before next publication attempt.

---

### [I] Issue: Designer agent ignores prompts — generates tiles-and-candles imagery regardless of input
Description: The designer agent in Claude Code (Content Studio) generates tiles-and-candles imagery regardless of what prompt is given. Dave attempted to fix this by starting from scratch but the issue persists. Manual browser → Gemini image runs are being used as a workaround.
Owner: Dave
Impact: M — slows image production; workaround is in place but not scalable for marketing team onboarding
Age: Identified 2026-04-14
Status: Open (workaround active — not blocking)
Date opened: 2026-04-14

---

### [I] Issue: Three blog posts exist only in Dave-s-Test repo — not ported to mahjong-tarot
Description: `big-life-change-2026-signs`, `fire-horse-love-2026`, and `zodiac-element-heartbreak` were drafted in the Dave-s-Test repo and have not been ported to the production `mahjong-tarot` repo. No `.jsx` pages exist for any of them in `website/pages/blog/posts/`.
Owner: Yon
Impact: M — hero image for `big-life-change-2026-signs` is already in production repo; page just hasn't been built
Age: Open since 2026-04-08
Status: Open
Date opened: 2026-04-08

---

## Risks (R) — Future uncertainties

### [R] Risk: Unmerged PR #14 may create branch conflicts
Description: PR #14 (`Yon/working-branch` → `main`) was opened 2026-04-08 and may still be unmerged. If new branches are cut from stale main, rebase conflicts could slow publication.
Probability: M / Impact: M
Owner: Yon
Mitigation: Verify PR #14 status; merge before opening any new branches
Status: Open
Date: 2026-04-08

---

## Assumptions (A)

### [A] Assumption: Resend is the chosen email provider
Description: Dave's standup (2026-04-10) listed "Set up Resend for email based on Claude's recommendations." Assumed that Resend is the final chosen provider and no other email providers are under evaluation.
Owner: Dave
Status: Open — not yet confirmed
Date: 2026-04-10

---

### [A] Assumption: Telegram integration is for live site notifications (not a new product feature)
Description: Dave's standup lists Telegram integration without specifying scope. Assuming this is for admin/notification use (e.g., inquiry alerts), not a public-facing chat feature.
Owner: Dave
Status: Open — not yet confirmed
Date: 2026-04-10

---

## Dependencies (D)

### [D] Dependency: Hero images needed for fire-horse-love-2026 and zodiac-element-heartbreak
Description: Two posts are waiting on hero image generation before they can be built and published. Images must be generated via Nano Banana 2 / Claude in Chrome → Gemini pipeline.
Owner: Yon
Waiting on: generate-image skill run
Status: Open
Date: 2026-04-09

---

### [D] Dependency: CRM admin tools depend on Supabase schema being finalised
Description: Dave's CRM build-out (admin tools to monitor visitors and inquiries) depends on the Supabase schema being stable. Any schema changes after CRM is built will require migration work.
Owner: Dave
Waiting on: Supabase schema sign-off
Status: Open
Date: 2026-04-10

---

## Closed items

*None yet.*
