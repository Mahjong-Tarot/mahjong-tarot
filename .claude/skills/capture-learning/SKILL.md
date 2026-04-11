# Skill: capture-learning

## Purpose

Capture a validated learning from the current session into the correct CLAUDE.md section. Invoke this skill only after a solution has been explicitly approved by the user or confirmed working (tests passed, build succeeded, user said yes/correct/perfect).

Invocation: `/capture-learning` or "capture this learning"

---

## Steps

1. **Identify the learning**
   Ask (or infer from context): what was the problem, and what was the validated solution?

2. **Classify scope**
   - Is this applicable to any project on this machine? → **[GLOBAL]** block in CLAUDE.md
   - Is this specific to this repo's stack, workflow, or conventions? → project section of CLAUDE.md

3. **Write the rule**
   - One sentence, imperative voice: "Always...", "Never...", "When X, do Y"
   - Add a one-line `<!-- Rationale: ... -->` comment immediately after
   - Append to the correct section — never overwrite existing rules

4. **Confirm with the user**
   Show the exact text to be appended and the target section. Wait for confirmation before writing.

5. **Write to file**
   Append to CLAUDE.md using Edit. Do not touch any other content.

---

## Guard conditions — do not capture if:

- The solution was not tested or the outcome is unknown
- The user has not confirmed it worked
- It is a workaround, not a root fix
- It duplicates an existing rule
