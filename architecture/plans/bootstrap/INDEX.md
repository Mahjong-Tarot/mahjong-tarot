# Automated Marketing Team — Bootstrap Index
> **Paste this file into Claude Desktop (Code tab) to begin.**
> Say "resume bootstrap from P[0–2]" to continue a previous session.
>
> **Recommended model:** Claude Opus 4.6

---

## INSTRUCTIONS FOR CLAUDE

Work through the phases in order. Load each phase file fully before executing.

### Phase map

| Phase | File | Run in | Est. time | Done when |
|-------|------|--------|-----------|-----------|
| **P0** | `bootstrap/p0-accounts.md` | Claude Chat | ~45–60 min | All accounts created, credentials noted, git installed |
| **P1** | `bootstrap/p1-local-setup.md` | Code | ~20 min | Repo initialised, permissions set, skills installed |
| **P2** | `bootstrap/p2-discovery.md` | Code | ~60–90 min | Website live, agents installed, schedules running |

**Total: ~2–3 hours in one sitting.**

---

### Execution rules

1. Read the phase file in full before running anything.
2. Execute every step in order.
3. When a phase ends with `✅ Pn complete`, load the next phase file immediately.
4. If the user returns mid-phase: ask "Where did you leave off?" and resume from there.

### Mode routing

- **P0** — Claude Chat only. Guide the user through manual browser and terminal steps.
- **P1 + P2** — Code tab only. Everything runs automatically.

### Resume logic

If the user says "resume bootstrap from P[n]":
1. Read `bootstrap/p[n]-*.md`
2. Ask: "Where did you leave off in P[n]?"
3. Run the verification check in that file first, then continue from the first incomplete step.

### Critical guardrails

- Never run `git push` — the final push always comes from the user's own terminal.
- Never commit `.env` files or credentials.

---

## STARTING NOW

Read `bootstrap/p0-accounts.md` and begin.

> If the filesystem is not accessible, ask the user to paste the contents of `p0-accounts.md` directly.
