date: 2026-04-15
name: Trac

## Today's focus
- Refine, validate, and finalize the complete-infinite-leverage-blueprint bootstrap setup prompt
- Figure out Claude Code channels to receive messages from Lark (two-way communication)

## Notes
- Single Lark app serves as mediator bot for all agent-to-human notifications
- One-shot setup prompts documented at https://edge8company.sg.larksuite.com/wiki/WX7rwqpAaitcyLkLyx7lqBedg5y
- Lark Auth scope reference: https://edge8company.sg.larksuite.com/docx/Y1AFdbiiOokq3LxicWRl84ergoe
- Claude Code CLI permission guide for smooth scheduled task execution: https://edge8company.sg.larksuite.com/wiki/LGRKw5RJviqncnkJDbmldwtag6g

## Blockers
- Messages are one-way only (Claude Code → Lark group); no reply path back from Lark to Claude Code
- RemoteTrigger cannot access Lark CLI, Resend CLI, or their APIs — scheduled notifications must run locally
- Local triggers must still be configured manually; cannot be set up by prompting Claude Code
