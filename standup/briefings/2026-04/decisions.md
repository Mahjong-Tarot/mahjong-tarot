# Decisions Log — April 2026

| Date | Decision | Owner | Context |
|------|----------|-------|---------|

## 2026-04-08

| # | Decision | Owner | Rationale |
|---|----------|-------|-----------|
| D-001 | Blog hero images use WebP format at Pillow quality 82 (target <200 KB, 1200x630 px) | Yon | Balances file size and visual quality for blog listing cards |
| D-002 | Image style standard: "Elemental Drama" — cinematic concept art using brand colours (navy #0A053D, crimson #FF2A04, gold #F4C76E, lavender #A89BFF) | Yon | Establishes visual identity consistent with The Mahjong Tarot brand |
| D-003 | `generate-image` skill uses browser automation (Claude in Chrome → Gemini), NOT the Gemini API | Yon | API access was not available; browser automation was reliable |
| D-004 | Primary repo is `Mahjong-Tarot/mahjong-tarot` — all published content goes here, not `Dave-s-Test` | Dave / Yon | Clarified after content was mistakenly developed in wrong repo |
| D-005 | `generate-image` skill: use `find()` by ref for Gemini element, Canvas API for image download, mount `~/Downloads` folder | Yon | Four live-test refinements applied during image generation session |

## 2026-04-09

| # | Decision | Owner | Rationale |
|---|----------|-------|-----------|
| D-006 | Source Material Policy enforced: blog posts cannot be published until sign-by-sign interpretations are verified against official source files | Dave / Yon | Yon flagged that "5 Chinese Zodiac Signs" post was drafted without official sources — policy prevents inaccurate content going live |
| D-007 | Daily standup cron job configured to read from `standup/Individual/yon.md` at 8 AM | Yon | Aligns automated briefing with canonical check-in file location |
| D-008 | `publish-post-claude-code` skill created — full Claude Code terminal publish pipeline as a reusable skill | Yon | Reduces manual steps for future post publishing |

## 2026-04-10

| # | Decision | Owner | Rationale |
|---|----------|-------|-----------|
| D-009 | Dave to set up Telegram integration for the site | Dave | Enables real-time visitor/inquiry notifications |
| D-010 | Dave to set up Resend for transactional email | Dave | Following PM agent recommendation; replaces ad-hoc email setup |
| D-011 | Off-site working session scheduled (4-hour crank session) on 2026-04-11 | Dave | Concentrated sprint to advance CRM and integrations |

## 2026-04-11

| # | Decision | Owner | Rationale |
|---|----------|-------|-----------|
| D-012 | PM agent EOD workflow formalised: branch `pm/eod/YYYY-MM-DD`, alert file, decisions log, RAID review, commit and PR per session | PM Agent | Ensures PM artifacts are versioned, reviewable, and auditable |
| D-013 | Team expanded to include Trac and Khang — both added to check-in reminder distribution | PM Agent | Check-in reminders updated to cover full team roster |
