# Decisions Log

A running record of key decisions made during the project. Append new decisions at the top. Do not delete old entries — mark superseded decisions as `[SUPERSEDED]`.

---

## 2026-04-14

| Decision | Detail | Made by |
|----------|--------|---------|
| Designer agent workaround adopted | Designer agent is functional but consistently generates tiles-and-candles imagery regardless of prompt. Dave is proceeding with manual image runs (browser → Gemini pipeline) until the prompt issue is resolved. Not treated as a blocker. | Dave |
| Marketing team onboarding begun | Human marketing team training started today — file access and workflow orientation. Writer pipeline confirmed operational; designer pipeline manual for now. | Dave |
| EOD reminder channel confirmed (fallback) | Gmail remains unavailable; EOD reminders continue to be written to `agents/project-manager/output/alerts/` as fallback | PM Agent (automated) |

---

## 2026-04-13

| Decision | Detail | Made by |
|----------|--------|---------|
| Notification channel fallback confirmed | Telegram and Lark both unavailable for outbound messages; EOD and morning reminders continue to be written to `agents/project-manager/output/alerts/` as fallback until a send-capable channel is configured | PM Agent (automated) |
| Source material blocker escalation | "5 Chinese Zodiac Signs" post remains blocked at >96 hrs — escalated in RAID and flagged in EOD alert for immediate owner attention (Dave + Yon) | PM Agent (automated) |

---

## 2026-04-08

| Decision | Detail | Made by |
|----------|--------|---------|
| Blog hero image format | WebP at quality 82, target <200 KB, 1200×630 px | Yon |
| Image style standard | "Elemental Drama" — cinematic concept art using brand colours: navy `#0A053D`, crimson `#FF2A04`, gold `#F4C76E`, lavender `#A89BFF` | Yon |
| Image generation toolchain | Browser automation via Claude in Chrome → Gemini (NOT Gemini API) | Yon |
| `generate-image` skill method | Uses `find()` by ref, Canvas API download, `~/Downloads` mount step, ultra-detailed prompts | Yon |
| Primary repo | All production work goes into `Mahjong-Tarot/mahjong-tarot`, not `Dave-s-Test` | Team |
| Source material policy | Blog posts cannot be published until all sign/topic interpretations are verified against official source material | Team |

---

## 2026-04-12

| Decision | Detail | Made by |
|----------|--------|---------|
| PM output structure | Project manager outputs (alerts, decisions, RAID, triage) written to `agents/project-manager/output/` | PM Agent (automated) |
| EOD reminder channel | Gmail unavailable; EOD reminders written to `agents/project-manager/output/alerts/alert-YYYY-MM-DD.md` | PM Agent (automated) |

---

*Format: add new date sections at the top. One row per decision. Keep entries concise.*
