date: 2026-05-12

---

## project-manager

**Completed:**
- PR #198: pm(standup-morning): 2026-05-11 — merged 2026-05-11 00:08 UTC
- PR #199: pm(standup-compile): 2026-05-11 — merged 2026-05-11 02:11 UTC

**Next:**
- This 07:00 morning trigger is in flight (`pm/standup-morning/2026-05-12`)
- 09:00 standup-compile run later this morning

**Blockers:**
- Lark bot auth still failing (`[10014] app secret invalid`) — carrying forward from 2026-05-08 (now 12 consecutive working days). App secret for App ID `cli_a95707d3b57a5eed` needs rotation, and `LARK_CHAT_ID` (`oc_e5fe68740864439744b3fb0f31f81040`) still missing from root `.env`. `lark-cli` upgrade (1.0.10 → 1.0.23+) also pending.

---

## web-developer

**Completed:**
- No activity in the 2026-05-11 00:00 UTC → 2026-05-12 00:00 UTC window.

**Next:**
- No open PRs.
- Per content calendar: writer just delivered three new bundles for week of 2026-05-18 (PR #200) — `2026-05-18-horse-love-signs`, `2026-05-20-mirror-love-signs`, `2026-05-22-feel-good-love`. These are ahead of any 2026-05-15 publish slot and now sit ready for hero image generation + page build.

**Blockers:**
None

---

## writer

**Completed:**
- PR #200: Writer: Week of 2026-05-18 — merged 2026-05-11 18:23 UTC. Three weekly bundles landed:
  - Mon 2026-05-18 — `Your Love Life in 2026: What the Fire Horse Actually Means for Your Sign` (~1,800 words, sign-by-sign breakdown)
  - Wed 2026-05-20 — `What the Fire Horse Is Really Opposing in Your Love Life` (~1,300 words, explainer)
  - Fri 2026-05-22 — `Feel Good Friday: The Sheep Year Is Coming` (~1,100 words, manifesto)
- All three include blog drafts, SEO guides, FB/IG social copy (EN + VN) and `image-prompts.json`.

**Next:**
- No open PRs.
- Content calendar through end-of-May still has slots needing drafts beyond 2026-05-22.

**Blockers:**
None — but PR #200 note flags that Vietnamese translations require a fluent reviewer before publish, and sign-by-sign guidance is grounded in the 2026-05-04 post and recommends human review.

---

## product-manager

**Completed:**
- No activity in the 2026-05-11 00:00 UTC → 2026-05-12 00:00 UTC window.

**Next:**
- Review auto-publishing checklist with Dave for implementation sign-off.

**Blockers:**
None

---

## image-designer

**Completed:**
- No activity in the 2026-05-11 00:00 UTC → 2026-05-12 00:00 UTC window.

**Next:**
- No open work detected.
- Three new `image-prompts.json` files just delivered by the writer (2026-05-18 / 2026-05-20 / 2026-05-22) — hero + social images required ahead of the 2026-05-18 publish slot.
- Hero/social images for `2026-05-15-derby-feel-good` still outstanding from the prior queue.

**Blockers:**
- Repo `.env` `GEMINI_API_KEY` rejection (carry-forward from 2026-05-06): agent fell back to `/content-studio/.env`. Repo key needs rotation/refresh before next autonomous run.
- `ffmpeg` on Dave's machine lacks `libwebp`; SKILL.md `-q:v` flag silently fails — `cwebp` workaround in place. SKILL update or `ffmpeg --with-libwebp` install pending.

---

## other-agents

**Completed:**
- No other agent-attributed activity in the window. PR #200 was author `dhajdu` (Dave's identity) but commit message and branch (`writer/tuesday-2026-05-12`) match the writer agent trigger — counted under writer above.

**Next:**
- No open PRs across the repo as of 2026-05-12 07:00 Asia/Saigon.

**Blockers:**
None
