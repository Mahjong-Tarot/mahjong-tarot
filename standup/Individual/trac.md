date: 2026-04-14
name: Trac

## Today's focus
- Testing Project Manager agent notifications via Lark Group Webhook and email using Resend.
- Finalize the setup guideline for the infinite leverage framework.
- Generate and test the infinite leverage framework with the agent generating skill.
- Share the guidelines and test with designers.

## Notes
- RemoteTriggers disabled — Anthropic cloud cannot reach Lark webhook or Resend CLI; all 4 PM triggers to be set up as local cron jobs
- All 4 trigger prompts standardised: env vars (`LARK_WEBHOOK_URL`, `RESEND_API_KEY`, `RESEND_FROM`) loaded from `.env.local`; team roster read from `persona.md`
- `RESEND_FROM` must be added to `.env.local`; domain verification required in Resend before emails deliver

## Blockers
None
