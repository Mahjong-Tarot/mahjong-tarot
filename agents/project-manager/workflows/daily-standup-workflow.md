# Daily Stand-Up Workflow

**Owner:** Project Manager Agent
**Trigger:** Daily at 9:00 AM
**Purpose:** Compile individual check-ins, coordinate agent tasks, detect conflicts, and distribute the daily stand-up to the team.

---

## Folder Structure

```
standup/
├── checkins/
│   ├── alice.md          # Individual human check-in
│   ├── bob.md            # Individual human check-in
│   ├── data-agent.md     # Agent check-in
│   └── ...
├── agents/
│   ├── data-agent/
│   │   ├── skills/       # What this agent can do
│   │   └── schedule/     # Standing daily jobs
│   ├── content-agent/
│   │   ├── skills/
│   │   └── schedule/
│   └── ...
└── 2026-04/
    ├── 2026-04-09.md     # Compiled stand-up for the day
    ├── 2026-04-10.md
    └── ...
```

---

## Workflow Steps

### Step 1: Gather Individual Check-Ins

At 9:00 AM, the Project Manager agent scans the `standup/checkins/` folder. Each team member (human or agent) is expected to have a `.md` file titled with their name (e.g., `alice.md`, `data-agent.md`).

For each file found, extract:

- **What they did yesterday**
- **What they're working on today**
- **Blockers or requests** — specifically, any requests directed at an agent (e.g., "need @data-agent to pull the Q1 report")

If a team member's file is missing or empty, note them as "no check-in submitted" in the compiled report.

---

### Step 2: Review Agent Daily Jobs

For each agent listed in the `standup/agents/` folder, the PM agent opens that agent's `schedule/` directory and reads the standing daily tasks.

These are recurring jobs the agent runs every day regardless of whether anyone asked — things like data syncs, report generation, monitoring, etc.

Add each agent's daily jobs to the compiled stand-up under that agent's section.

---

### Step 3: Route Human Requests to Agents

Go back through the check-ins gathered in Step 1. For any request that names or implies an agent:

1. Identify which agent is being asked.
2. Confirm the request falls within that agent's `skills/`.
3. Add the request to that agent's task list for the day, alongside their standing daily jobs from Step 2.

If a human requests something that doesn't match any agent's skills, flag it in the compiled report as **"unassigned — needs manual routing."**

---

### Step 4: Detect Conflicts and Overlaps

Before compiling the final report, compare all "working on today" items across every team member — humans and agents alike.

**What counts as a conflict:**

- Two humans working on the same feature, module, or deliverable
- A human and an agent both touching the same dataset or system
- Two agents assigned overlapping tasks (e.g., both pulling the same report)

**What to do when a conflict is found:**

Insert a **Conflict Alert** in the compiled stand-up that names both parties and tells them to sync up. For example:

> **⚠️ Conflict Detected:** Alice and Bob are both working on the onboarding flow redesign. Please coordinate before proceeding — ping each other or the PM agent to align.

---

### Step 5: Compile the Daily Stand-Up File

Assemble everything into a single markdown file with the following structure:

```markdown
# Daily Stand-Up — [YYYY-MM-DD]

## Conflict Alerts
(Any overlap warnings from Step 4, or "None" if clear.)

## Team Check-Ins

### Alice
- **Yesterday:** ...
- **Today:** ...
- **Blockers:** ...

### Bob
- **Yesterday:** ...
- **Today:** ...
- **Blockers:** ...

(Repeat for all humans.)

## Agent Tasks

### data-agent
**Standing daily jobs:**
- Sync warehouse tables
- Generate daily KPI snapshot

**Requested today:**
- Pull Q1 revenue report (requested by Alice)

### content-agent
**Standing daily jobs:**
- Draft social post queue

**Requested today:**
- None

(Repeat for all agents.)

## Missing Check-Ins
- charlie (no file submitted)
```

Save this file to the monthly folder:
`standup/YYYY-MM/YYYY-MM-DD.md`

If the monthly folder doesn't exist yet, create it.

---

### Step 6: Push to Telegram

Send a summary message to the team's Telegram group. The message should include:

1. **Conflict alerts** (if any) — these go at the top so they're seen first.
2. **Quick summary** — one line per person with what they're focused on today.
3. **Agent task summary** — what each agent is doing today (standing + requested).
4. **Missing check-ins** — who didn't submit.
5. **Closing note:**

> "That's today's stand-up. If anything changes or you need to update your tasks, ping the PM agent and I'll adjust."

---

## Check-In File Format

Each team member should structure their `.md` file like this:

```markdown
# [Name] — Check-In

## Yesterday
- Completed the API integration for user auth

## Today
- Working on the onboarding flow redesign
- Need @data-agent to pull Q1 user retention numbers

## Blockers
- Waiting on design sign-off from the client
```

The key conventions:

- Use `@agent-name` to direct a request at a specific agent.
- Keep it brief — this isn't a journal, it's a status update.
- Update or replace the file before 9:00 AM each day.

---

## Edge Cases

**Late check-ins:** If someone submits after 9:00 AM, they can ping the PM agent to issue an addendum to Telegram. The compiled file should be updated in place.

**Agent is down or unavailable:** If the PM agent can't read an agent's schedule folder (permissions, missing files, etc.), note it in the compiled report and flag it on Telegram so the team knows that agent may not run its daily jobs.

**No conflicts found:** Still include the Conflict Alerts section — just write "None — all clear." This confirms the check was actually run.

**New team member or agent:** As long as they have a `.md` file in `checkins/` or a folder in `agents/`, they'll be picked up automatically. No config changes needed.
