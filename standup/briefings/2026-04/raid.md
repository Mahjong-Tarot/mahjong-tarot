# RAID Log — April 2026

**Last reviewed:** 2026-04-11 17:00 Asia/Saigon
**Reviewed by:** Project Manager Agent

---

## RISKS

| ID | Description | Probability | Impact | Owner | Mitigation | Status | Date Logged |
|----|-------------|-------------|--------|-------|------------|--------|-------------|
| R-001 | Blog posts drafted without verified source material may contain inaccurate zodiac interpretations and go live | High | High | Yon | Source Material Policy enforced — posts blocked from publishing until official sources reviewed | OPEN | 2026-04-09 |
| R-002 | Three blog posts exist only in `Dave-s-Test` repo and have not been ported to `mahjong-tarot` — risk of content loss or repo divergence | Medium | High | Yon | Port posts to `mahjong-tarot` as priority; do not develop further in wrong repo | OPEN | 2026-04-09 |
| R-003 | PR #14 and `Yon/standup-and-skill-fixes-2026-04-08` branch are unmerged — branch backlog accumulating | Medium | Medium | Yon | Merge both PRs before opening new branches | OPEN | 2026-04-09 |
| R-004 | Telegram and Lark MCP tools unavailable — PM agent cannot deliver real-time notifications to team | High | Medium | PM Agent / Dave | Fallback alert files written to repo; team must check repo on each session start | OPEN | 2026-04-11 |
| R-005 | CRM admin tooling (visitor monitoring, inquiry management) not yet built — live site has no operational visibility | Medium | High | Dave | Dave's 2026-04-10 focus: build CRM admin tools; off-site session 2026-04-11 targeted at this | OPEN | 2026-04-10 |

---

## ASSUMPTIONS

| ID | Description | Owner | Validation method | Status | Date Logged |
|----|-------------|-------|-------------------|--------|-------------|
| A-001 | Dave and Yon check the repo at start of each working session and read alert files | Dave / Yon | Alert files serve as fallback delivery; confirmed as agreed fallback channel | ASSUMED | 2026-04-06 |
| A-002 | Official source material for Chinese Astrology content exists and can be located by the team | Dave / Yon | Yon to locate files; unconfirmed as of 2026-04-09 | ASSUMED — UNCONFIRMED | 2026-04-09 |
| A-003 | `mahjong-tarot` is the single source of truth repo; `Dave-s-Test` is scratch only | Dave / Yon | Confirmed by Dave 2026-04-08 session | CONFIRMED | 2026-04-08 |
| A-004 | Trac and Khang are active team members who will submit check-ins for the 9 AM stand-up | Dave | Not yet confirmed — added to distribution 2026-04-11 | ASSUMED — UNCONFIRMED | 2026-04-11 |

---

## ISSUES (BLOCKERS)

| ID | Description | Probability | Impact | Owner | Resolution / Next Action | Status | Date Logged | Age (days) |
|----|-------------|-------------|--------|-------|--------------------------|--------|-------------|------------|
| I-001 | "5 Chinese Zodiac Signs Facing Their Biggest Life Change in 2026" — source material not provided; post blocked from publishing | — | High | Yon / Dave | Locate official Chinese Astrology source files; verify all sign interpretations before building JSX page | OPEN — BLOCKER | 2026-04-09 | 2 |
| I-002 | Hero images for `fire-horse-love-2026` and `zodiac-element-heartbreak` not yet generated | — | Medium | Yon | Run `generate-image` skill for both slugs | OPEN | 2026-04-09 | 2 |
| I-003 | `fire-horse-love-2026` and `zodiac-element-heartbreak` posts not ported from `Dave-s-Test` to `mahjong-tarot` | — | High | Yon | Port blog.md content; run build-page skill; update blog index | OPEN | 2026-04-09 | 2 |
| I-004 | Trac and Khang have no check-in files yet at `standup/individual/trac.md` and `standup/individual/khang.md` | — | Low | Trac / Khang | Create files using standard check-in format before 2026-04-12 9 AM stand-up | OPEN | 2026-04-11 | 0 |

**ESCALATION NOTE:** I-001 has been open for 2 days. If source material is not located by end of 2026-04-12, this must be escalated — the post cannot be published and content pipeline is blocked.

---

## DEPENDENCIES

| ID | Description | Depends on | Owner | Required by | Status | Date Logged |
|----|-------------|------------|-------|-------------|--------|-------------|
| DEP-001 | Blog post publishing pipeline requires hero image to be generated before build-page runs | `generate-image` skill | Yon | Each post publish | ACTIVE | 2026-04-08 |
| DEP-002 | "5 Chinese Zodiac Signs" post JSX build depends on source material verification | Official Chinese Astrology source files | Dave / Yon | Before JSX build | BLOCKING | 2026-04-09 |
| DEP-003 | Resend email setup depends on Dave completing account and API key configuration | Dave | Dave | CRM launch | PENDING | 2026-04-10 |
| DEP-004 | Telegram site integration depends on Dave completing bot setup and webhook configuration | Dave | Dave | CRM launch | PENDING | 2026-04-10 |
| DEP-005 | Off-site working session productivity depends on CRM plan being scoped in advance | `architecture/admin-crm-plan.md` | Dave | 2026-04-11 session | ACTIVE | 2026-04-10 |
