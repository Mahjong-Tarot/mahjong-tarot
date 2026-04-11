# RAID Log — Mahjong Tarot Project

> **RAID** = Risks · Assumptions · Issues · Dependencies  
> Last updated: 2026-04-11 (EOD automated update)

---

## 🔴 Issues (active problems affecting progress)

| ID | Issue | Owner | Status | Raised | Notes |
|----|-------|-------|--------|--------|-------|
| I-01 | Dave missing standups from 2026-04-07 through 2026-04-11 | Dave | Open | 2026-04-08 | EOD alerts sent via alert-2026-04-08.md and alert-2026-04-11.md; Dave's last check-in was 2026-04-06 |
| I-02 | Yon missing standups from 2026-04-08 through 2026-04-11 | Yon | Open | 2026-04-08 | Yon filed 2026-04-07 check-in but none since; EOD alerts sent |
| I-03 | Gmail MCP unavailable — email alerts not deliverable | Trac | Open | 2026-04-07 | Workaround: file-based alerts in `agents/project manager/output/alerts/`. Resolve when Gmail MCP is connected |

---

## ⚠️ Risks (potential future problems)

| ID | Risk | Likelihood | Impact | Owner | Mitigation |
|----|------|-----------|--------|-------|------------|
| R-01 | Gmail MCP remains unavailable, alerts go unread | Medium | Medium | Trac | Monitor; add Gmail MCP to onboarding checklist for new sessions |
| R-02 | Agent pipeline (writer → designer → web-developer) not fully wired — content may stall before publishing | Medium | High | Dave/Yon | Dave's stated goal is to complete the pipeline; track in stand-ups |
| R-03 | Static export mode incompatibility if new SSR features are added | Low | Medium | Dave | Client-side redirects in place (commit `dd58bed`); review before adding new dynamic routes |

---

## 💡 Assumptions

| ID | Assumption | Owner | Review Date | Notes |
|----|-----------|-------|-------------|-------|
| A-01 | Site will remain a static export (no server runtime needed) | Dave | 2026-05-01 | Drives redirect strategy and deployment pipeline; revisit if a server is added |
| A-02 | Stand-up cadence is daily — previous day's update expected each morning | All | Ongoing | Confirmed in `fix(pm)` commit `410cc4f` |
| A-03 | Claude Code is the canonical platform going forward (not Cowork) | Trac | 2026-04-15 | Formalised in `157d871` migration; confirm with Bill/Dave |

---

## 🔗 Dependencies

| ID | Dependency | On | Needed By | Status | Notes |
|----|-----------|----|-----------| -------|-------|
| D-01 | Writer agent spec complete | Yon | TBD | In progress | Yon's goal: finish writer agent `.md` file; added to `agents/writer/` (commit `6f6d2b0`) |
| D-02 | Designer agent integration (Nano Banana) | Dave | TBD | Not started | Dave listed as a goal in 2026-04-06 check-in; no commit yet |
| D-03 | Web-developer agent publishing pipeline | Dave | TBD | In progress | Dave's 2026-04-06 goal; partial — blog posts published manually via `83c887f` |
| D-04 | Gmail MCP connection | Trac/setup | Next session | Blocked | Required for automated email alerts (R-01, I-03) |
