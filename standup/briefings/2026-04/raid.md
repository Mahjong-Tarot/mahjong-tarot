# RAID Log — April 2026

## Risks

| ID | Risk | Likelihood | Impact | Owner | Status |
|----|------|-----------|--------|-------|--------|
| R-01 | Resend domain not verified — email notifications only reach account owner | Low | Medium | Trac | Mitigated — Resend confirmed delivering to full team as of 2026-04-14 EOD; verify edge8.ai domain for production |
| R-02 | Individual check-ins (dave.md, yon.md, trac.md, khang.md) last updated 2026-04-11 — stale for 3 days | Medium | Medium | Dave/Yon/Trac/Khang | Open — EOD reminders sent 2026-04-14 (multiple runs); Gmail drafts to Dave + Yon created 17:00 |
| R-03 | Automation environment occasionally has network unreachable errors (seen 2026-04-13) | Low | Low | Trac | Monitoring — Lark succeeded 2026-04-14, network stable |

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
| I-02 | Check-in files not updated since 2026-04-11 | Medium | All | Open — EOD reminders sent multiple times on 2026-04-14; Gmail drafts to Dave + Yon created at 17:00; awaiting check-in updates for 2026-04-15 stand-up |

## Dependencies

| ID | Dependency | Dependent On | Owner | Status |
|----|-----------|-------------|-------|--------|
| D-01 | Email notifications to full team | edge8.ai domain verification in Resend | Trac | Unblocked — delivery confirmed 2026-04-14; formal domain verification still pending |
| D-02 | Designer agent activation | Khang CLAUDE.md wiring + Yon persona | Yon/Khang | In progress as of 2026-04-11 |
| D-03 | Writer agent first run | Content calendar populated + source material ready | Dave | Pending |
