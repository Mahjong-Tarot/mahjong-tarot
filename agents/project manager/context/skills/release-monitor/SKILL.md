---
name: release-monitor
description: Check deployment status via Vercel MCP, summarise what shipped and when, flag any failed deployments, and log release activity to the monthly report. Use this skill when someone asks "check deployment status", "what shipped?", "any releases today?", "deployment monitor", or during the weekly status report to populate the deployment frequency metric (DORA). Vercel MCP is already connected.
---

# Release Monitor Skill

## Purpose

Keep the team informed about what's actually running in production. Deployment frequency is a DORA metric that reflects team health — shipping often means fast feedback. This skill surfaces that data without anyone needing to check the Vercel dashboard manually.

## Tools used

- **Vercel MCP** — connected, use `list_deployments`, `get_deployment`, `get_deployment_build_logs`, `get_runtime_logs`

## Step-by-step

### 1. List recent deployments

Use the Vercel MCP to list deployments. Filter to the relevant time window:
- **Daily check**: last 24 hours
- **Weekly report**: last 7 days

For each deployment, capture:
- Deployment ID and URL
- Project name
- Status: `READY` / `ERROR` / `BUILDING` / `CANCELED`
- Branch / commit message
- Created timestamp

### 2. Classify deployments

| Status | Meaning | Action |
|--------|---------|--------|
| `READY` | Successfully deployed to production | Log ✅ |
| `ERROR` | Build or runtime failure | Flag 🔴 and fetch build logs |
| `BUILDING` | In progress | Note ⏳ |
| `CANCELED` | Manually cancelled | Log and note why if possible |

### 3. Fetch logs for failed deployments

For any `ERROR` deployment, run `get_deployment_build_logs` to extract the failure reason. Summarise in plain language — not the raw log dump, but what actually went wrong (e.g., "TypeScript type error in `src/components/Card.tsx` line 42").

### 4. Output summary

```
DEPLOYMENT STATUS — YYYY-MM-DD [HH:MM]

✅ SUCCESSFUL
- [Project] · [branch] · deployed [time ago]
  "[commit message]"

🔴 FAILED
- [Project] · [branch] · failed [time ago]
  Reason: [plain-language summary]
  Build log: [key error line]

⏳ IN PROGRESS
- [Project] · [branch] · started [time ago]

📊 WEEK SUMMARY (if weekly)
- Total deployments: X
- Success rate: X%
- Deployment frequency: X/day (DORA)
```

### 5. Log to monthly report (weekly cadence only)

When running as part of the Friday status report, append a `#### Deployments` sub-block under the weekly status entry in `reports/YYYY-MM.md`:

```markdown
#### Deployments this week
- X deployments · X successful · X failed
- Deployment frequency: X/day
- [Notable releases or failures]
```

## What to flag immediately

- Any production deployment in `ERROR` state → notify Dave via Gmail with the failure reason and build log summary.
- Deployment frequency dropping below 1/week for an active sprint → flag as 🟡 AMBER in the next status report.
