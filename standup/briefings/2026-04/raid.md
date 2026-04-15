# RAID Log — April 2026

## Risks

| ID | Risk | Likelihood | Impact | Owner | Status |
|----|------|-----------|--------|-------|--------|
| R-01 | Resend domain not verified — email notifications only reach account owner | Low | Medium | Trac | Mitigated — Resend confirmed delivering to full team as of 2026-04-14 EOD; verify edge8.ai domain for production |
| R-02 | Individual check-ins stale — Yon last updated 2026-04-11 (4 days stale); Khang not tracked in current workflow | Medium | Medium | Yon | Open — EOD Git-status reminder sent to Dave/Yon 2026-04-15 17:00; Dave and Trac filed 2026-04-15, Yon still pending |
| R-03 | Automation environment occasionally has network unreachable errors (seen 2026-04-13) | Low | Low | Trac | Monitoring — Lark succeeded 2026-04-14, network stable |
| R-04 | Gmail MCP in scheduled-task environment exposes no send capability (only create_draft) — limits channel options for triggers that specify Gmail | Low | Low | Trac | Open — documented 2026-04-15; Lark + Resend remain primary channels for team notifications |

## Assumptions

| ID | Assumption | Owner | Validation |
|----|-----------|-------|-----------|
| A-01 | Bill Hajdu approves content before it enters the publishing workflow | Bill/Dave | Confirmed by CLAUDE.md workflow |
| A-02 | Writer agent Friday runs will use content/topics/ structure consistently | Dave | Defined 2026-04-11 |
| A-03 | edge8.ai Resend domain verification is in progress | Trac | Pending |

## Issues

| ID | Issue | Priority | Owner | Status |
|----|-------|---------|-------|--------|
| I-01 | Resend email limited to account owner in testing mode | Medium | Trac | Resolved — full team delivery confirmed 2026-04-14; domain verification still recommended for production |
| I-02 | Check-in files stale — Yon still on 2026-04-11 | Medium | Yon | Open — Dave/Trac refreshed 2026-04-15; Git-status reminder sent to Yon 2026-04-15 17:00 |
| I-03 | Designer agent tiles-and-candles prompt regression (flagged 2026-04-14) | High | Dave | Resolved 2026-04-15 — designer agent confirmed functional in production |

## Dependencies

| ID | Dependency | Dependent On | Owner | Status |
|----|-----------|-------------|-------|--------|
| D-01 | Email notifications to full team | edge8.ai domain verification in Resend | Trac | Unblocked — delivery confirmed 2026-04-14; formal domain verification still pending |
| D-02 | Designer agent activation | Khang CLAUDE.md wiring + Yon persona | Yon/Khang | In progress as of 2026-04-11 |
| D-03 | Writer agent first run | Content calendar populated + source material ready | Dave | Pending |
