# PM PR Watch

**Name**: `PM PR Watch`

**Description**: Every 30 minutes on weekdays during work hours (9 AM – 6 PM Asia/Saigon), checks GitHub for newly opened PRs and notifies the Labs group chat in Lark. Uses a local state file (`/tmp/pm-pr-watch-last.json`) to remember which PR numbers have already been announced so the same PR is never notified twice. No files are created in the repo. No git commits.

---

## Prompt

```
It is work hours on a weekday in Asia/Saigon.

## Step 0 — Load credentials

Run this Python snippet to load secrets before doing anything else. Stop and report if any key is missing.

```python
def parse_env(path):
    vals = {}
    try:
        with open(path) as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, _, v = line.partition("=")
                vals[k.strip()] = v.strip().strip('"').strip("'")
    except FileNotFoundError:
        pass
    return vals

env = {}
env.update(parse_env(".env"))
env.update(parse_env(".env.development"))
env.update(parse_env(".env.production"))
env.update(parse_env(".env.local"))

missing = [k for k in ("LARK_CHAT_ID",) if not env.get(k)]
if missing:
    raise SystemExit(f"ERROR: missing from env files: {missing}")

LARK_CHAT_ID = env["LARK_CHAT_ID"]
```

After running the snippet above, immediately export the value into the current shell session:

```bash
export LARK_CHAT_ID='<value-from-python>'
```

## Step 1 — Fetch currently open PRs

```bash
gh pr list \
  --state open \
  --json number,title,author,headRefBase,url,createdAt,isDraft \
  --limit 50 \
  > /tmp/pm-pr-watch-current.json
```

Parse the JSON. Exclude any PR where `isDraft` is true — drafts are not ready for review.

If the resulting list is empty, the work is done. Exit immediately.

## Step 2 — Compare against last-seen state

State file: `/tmp/pm-pr-watch-last.json`. It contains a JSON array of PR numbers previously announced.

```python
import json, os
STATE_PATH = "/tmp/pm-pr-watch-last.json"
try:
    with open(STATE_PATH) as f:
        seen = set(json.load(f))
except (FileNotFoundError, json.JSONDecodeError):
    seen = set()

with open("/tmp/pm-pr-watch-current.json") as f:
    current = [pr for pr in json.load(f) if not pr.get("isDraft")]

current_numbers = {pr["number"] for pr in current}
new_prs = [pr for pr in current if pr["number"] not in seen]
```

IMPORTANT: On the very first run, `seen` is empty and every open PR will look "new". If `seen` was empty AND there are more than 3 PRs in the current list, assume this is a cold start — write all current PR numbers to the state file and exit without notifying. This prevents a spam burst on first install.

Otherwise, if `new_prs` is empty, the work is done. Write `current_numbers` back to the state file and exit.

## Step 3 — Send Lark notification for new PRs

For each PR in `new_prs`, build a single Lark message listing them all:

```
🔔 New PR(s) opened

• #<number> <title> — <author login>
  <url>
• ...
```

Send with:

```bash
lark-cli im +messages-send --as bot --chat-id "$LARK_CHAT_ID" \
  --text $'<BUILT_MESSAGE>'
LARK_EXIT=$?
```

Replace `<BUILT_MESSAGE>` with the exact message built above, using `$'...'` with `\n` for line breaks.

If LARK_EXIT is non-zero, self-diagnose and retry through each option in order until one succeeds — do not stop at the first failure:
1. **Check auth**: run `lark-cli whoami` — if it fails, re-authenticate with `lark-cli auth login --as bot`, then retry
2. **Check chat ID**: verify `$LARK_CHAT_ID` is set; if empty, re-export from .env and retry
3. **Try `--markdown` instead of `--text`**: wrap the message in markdown and retry
4. **Send via HTTP**: call the Lark OpenAPI directly with `curl` using a fresh `tenant_access_token` from `lark-cli auth token --as bot`
5. Only mark Lark as failed after all four options above are exhausted

## Step 4 — Update state file

Whether Lark succeeded or failed, write the current set of PR numbers to the state file so we don't re-notify on the next run:

```python
import json
with open("/tmp/pm-pr-watch-last.json", "w") as f:
    json.dump(sorted(current_numbers), f)
```

After all steps are complete, your work is done. Do not create branches, commits, or PRs.
```

---

**Schedule**: Every 30 minutes on weekdays from 9 AM to 6 PM Asia/Saigon (`*/30 9-17 * * 1-5` in local time). Runs ad-hoc outside those hours — do not fire at night or on weekends.
