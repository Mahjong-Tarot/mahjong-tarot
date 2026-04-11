# Decision Log — Mahjong Tarot Project

> One entry per significant decision. Append new entries at the top.

---

## 2026-04-11

> No commits or significant decisions recorded today. EOD automated check ran at 5 PM; stand-up reminders filed to alerts/. RAID log reviewed and updated.

---

## 2026-04-08

### Migrate PM workflow from Cowork to Claude Code
- **Decision:** Replace Cowork-based PM setup with Claude Code as the primary agentic platform for the project manager agent
- **Rationale:** Claude Code offers better workflow integration, scheduling support, and is the team's forward direction for automation
- **Commit:** `157d871`
- **Owner:** Trac

### Replace Cowork setup guide with Claude Code onboarding
- **Decision:** Retire `context/cowork-setup-guide.md`, replace with `context/setup-guide.md` targeting Claude Code workflows
- **Rationale:** Aligns documentation with the Cowork → Claude Code migration; avoids confusing new contributors
- **Commit:** `432efff`
- **Owner:** Trac

### Add comprehensive onboarding prompt for new team members
- **Decision:** Create `context/onboarding-setup-prompt.md` as a canonical entry point for new contributors to configure their Claude Code environment
- **Rationale:** Streamlines onboarding and reduces setup friction for Dave, Yon, and future contributors
- **Commit:** `d071125`
- **Owner:** Trac

### Initialize PM agent output structure (alerts, decisions, RAID, reports)
- **Decision:** Establish standardised output directories under `agents/project manager/output/` for alerts, decisions, RAID, and reports
- **Rationale:** Gives the PM agent a persistent, structured record of project state that persists across sessions
- **Commit:** `aae4e93`
- **Owner:** Trac

---

## 2026-04-07

### Add writer agent to agents folder
- **Decision:** Scaffold writer agent under `agents/writer/`
- **Commit:** `6f6d2b0`
- **Owner:** Yon

---

## Earlier (pre-2026-04-07)

### Fix static export compatibility — replace SSR redirects with client-side
- **Decision:** Switch from server-side redirects to client-side redirects so the site can be built as a fully static export
- **Rationale:** Next.js static export mode does not support `getServerSideProps` redirects; fixes deployment pipeline
- **Commit:** `dd58bed`
- **Owner:** Dave

### Rename site from 'The Mahjong Tarot' to 'Mahjong Tarot' site-wide
- **Decision:** Drop the 'The' from the site name across all pages and components
- **Rationale:** Cleaner brand identity, easier to reference
- **Commit:** `18fc78d`
- **Owner:** Dave

### Home page hero redesign
- **Decision:** Replace old hero with split-panel layout — solid Midnight Indigo left, clean image right, no overlay
- **Commits:** `b12811d`, `a218c62`
- **Owner:** Dave

### Publish Fire Horse blog posts
- **Decision:** Ship batch of Fire Horse category blog posts to production
- **Commit:** `83c887f`
- **Owner:** Dave
