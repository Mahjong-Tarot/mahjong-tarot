# Decisions Log — April 2026

| Date | Decision | Owner | Notes |
|------|----------|-------|-------|
| 2026-04-11 | Writer agent scaffold defined — runs every Friday; produces blog.md, seo.md, social posts per content calendar topic | Dave | Gold standard: content/topics/the-danger-of-love-when-fire-runs-wild/ |
| 2026-04-11 | Designer agent scaffold defined — owns visual identity, component style guide, hero image briefs, layout reviews | Yon | Aligned with web developer build-page skill specs |
| 2026-04-11 | CLAUDE.md structure standardised across all agent folders — convention: context/, skills/, workflows/ | Khang | Coordinated with Yon for designer agent wiring |
| 2026-04-13 | Notification system switched from Telegram to Lark webhook + Resend email dual-channel | Trac | Resend limited to verified domain; Lark is primary channel until edge8.ai domain is verified in Resend |
| 2026-04-13 | PM agent standup workflow re-run × 3 — branch pm(standup-morning):2026-04-13 merged at 16:42 UTC | PM Agent | Confirmed via agents.md |
| 2026-04-14 | EOD reminder delivered via Lark (HTTP 200); Resend blocked — unverified domain testing constraint (known) | PM Agent | No fallback log required; Lark delivery confirmed |
| 2026-04-14 | EOD 5 PM reminder sent — both Lark (HTTP 200) and Resend email (id: af83ffe8) delivered successfully | PM Agent | Resend now confirmed working with User-Agent header; team notified for 2026-04-15 stand-up |
| 2026-04-15 | Designer agent confirmed functional in production — earlier tiles-and-candles prompt issue resolved | Dave | Closes the Apr-14 workaround; manual blog image runs no longer required |
| 2026-04-15 | Human marketing team training completed — team operational on file access and workflows | Dave | Writer pipeline now fully operational with human hand-off |
| 2026-04-15 | Single Lark app will serve as the sole mediator bot for all agent-to-human notifications | Trac | Consolidates Lark access under one bot identity; simpler auth, one set of scopes |
| 2026-04-15 | Scheduled notification triggers will run locally (not via RemoteTrigger) — confirmed architectural constraint | Trac | RemoteTrigger cannot reach Lark CLI, Resend CLI, or their APIs; local cron is the only path |
| 2026-04-15 | EOD Git-status reminder delivered via file fallback (Gmail MCP has no send tool in current environment) | PM Agent | Alert file: agents/project-manager/output/alerts/alert-2026-04-15.md; Dave and Yon to action before 9 AM stand-up |
