# Weekly RAG Report — Week of 2026-04-14

_Generated: Friday 2026-04-17 16:00 Asia/Saigon_
_Coverage: 2026-04-14 through 2026-04-17_

---

## 🟢 GREEN — On Track

- **PM agent notifications**: Lark + Resend dual-channel fully operational; delivering to all 3 team emails. Morning standups, EOD reminders, and daily check-ins running on schedule all week.
- **Designer agent**: Tiles-and-candles prompt regression resolved 2026-04-15. Confirmed functional in production. Manual blog image workarounds no longer required.
- **Human marketing team training**: Completed 2026-04-15. Team operational on file access and workflows.
- **Web developer agent**: Major week — PRs #69–72 merged (Lark inquiry notifications, home hero redesign, real mahjong cards + Bill portrait, SEO/schema/42-card-pages). Site improvements live in production.
- **Blog content pipeline**: Two posts published this week — "Your Love Life in the Fire Horse Year" (Apr 15, Yon) and "The Mahjong Mirror Way to Plan a Wedding" (Apr 15, Dave).
- **Bootstrap restructure**: Modular P0–P4 architecture with INDEX router, OVERVIEW doc, HTML diagram, and TESTING.md — completed and merged (PR #81, PR #83).
- **Project infrastructure**: Branch cleanup automated on all PM workflow PRs. Lark unified under single bot identity. All 4 PM trigger prompts standardised and tested.

---

## 🟡 AMBER — Needs Attention

- **Writer agent skill gaps** | Owner: Dave/Trac | Resolution: 2026-04-20
  Skill gaps documented; fixes applied by Dave and Trac. Writer agent has had no scheduled run since Apr 13 to confirm fixes. Must verify on next run before content calendar depends on it.

- **Web developer auto-schedule** | Owner: Dave | Resolution: 2026-04-20 (Monday target)
  Dave's goal was to get the web developer agent running on a schedule so all posts produce automatically by Monday. Travel week may have pushed implementation. Status unconfirmed — needs check-in from Dave this weekend.

- **Yon gh auth default** | Owner: Yon | Resolution: ASAP
  `gh auth default` still set to `GeauxLsuTigers` — PR creation from Yon's machine fails for Mahjong-Tarot org. Must switch to `yon-create` before next PR from Yon's terminal.

- **Khang check-in stale** | Owner: Khang | Resolution: 2026-04-20
  Last check-in: 2026-04-11 (6 days stale). No Git activity attributed to Khang since Apr 13 image-designer PRs (#51, #54, #55). D-02 (designer agent wiring, Khang-owned) status unknown. Needs Monday check-in.

- **edge8.ai Resend domain verification** | Owner: Trac | Resolution: TBD
  Still pending formal domain verification in Resend (A-03). Team emails delivering via current config, but formal verification recommended for production reliability.

- **Coaching assistant operationalization** | Owner: Dave | Resolution: TBD
  Dave's Apr 16 goal — status unclear after travel day. Not referenced in Apr 17 check-in. Needs explicit status update.

---

## 🔴 RED — Needs Escalation

- **"5 Chinese Zodiac Signs" source material unverified** | Impact: Blocks publication | Action: Dave/Yon to confirm by 2026-04-20
  Flagged 2026-04-09 (>8 days open), still unresolved as of last reference in Apr 13 standup. Prevents this post entering the publishing workflow. No update found in subsequent standups — ownership must be confirmed by Monday.

---

## 📋 UPCOMING — Key Milestones (Next 2 Weeks)

- **2026-04-20 (Mon)**: Web developer auto-schedule target — Dave's commitment
- **2026-04-20 (Mon)**: Writer agent fix verification — confirm on first scheduled run
- **2026-04-20 (Mon)**: Eric + AIO rollout begins — Dave preparing this weekend
- **2026-04-20 (Mon)**: James onboarding kick-off — Dave/Yon codebase review this weekend
- **2026-04-24 (Fri)**: Writer agent first full Friday run — D-03 (content calendar + source material must be ready)
- **TBD**: Auto-publishing checklist sign-off — product manager waiting on Dave's review
- **TBD**: edge8.ai Resend domain verification completed — Trac

---

## ⚠️ RISKS — Top 3

| # | Risk | Probability | Impact | Mitigation |
|---|------|-------------|--------|-----------|
| 1 | Writer agent skill gaps not fixed before Friday run | Medium | High | Dave/Trac run manual dry-run before 2026-04-24; confirm gaps resolved in test environment |
| 2 | Web developer auto-schedule slips past Monday | Medium | Medium | Dave confirms implementation scope before EOD Sunday; Trac to assist if needed |
| 3 | Khang silent for second week — D-02 stalls | Low | Medium | PM agent flags as AMBER; Dave to ping Khang directly before Monday standup |

---

## 🔔 DECISIONS NEEDED

| Item | Deadline | Who Decides |
|------|----------|-------------|
| Auto-publishing checklist — implementation sign-off | 2026-04-20 | Dave |
| Writer agent first run — source material approved for D-03 | 2026-04-23 | Dave |
| "5 Chinese Zodiac Signs" source verification — publish or pause | 2026-04-20 | Dave + Yon |
| Web developer schedule config — Trac authorised to make changes? | 2026-04-19 (Sat) | Dave |

---

## 📊 Agent Status Summary

| Agent | Status | Next Action |
|-------|--------|------------|
| project-manager | 🟢 Active | Continue standup/EOD/weekly-RAG schedule |
| web-developer | 🟢 Active | Monitor production; await next approved content |
| writer | 🟡 Standby | Verify skill fix; run test before Friday pipeline |
| product-manager | 🟡 Standby | Auto-publishing checklist sign-off from Dave |
| image-designer | 🟡 Standby | Ready for hero image gen; no active queue |

---

_PM Agent — The Mahjong Tarot — weekly-rag-2026-04-17.md_
