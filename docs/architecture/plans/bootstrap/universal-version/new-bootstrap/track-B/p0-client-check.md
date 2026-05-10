# Track B — P0: Client Account Check

> **Who runs this**: Dave (sets up), client watches
> **Machine**: Client's existing personal laptop
> **Prerequisite**: Track A P0–P2 complete — all accounts exist, agents repo on GitHub, website live
> **Output**: Client laptop has Chrome, Homebrew, gh CLI; client is authenticated on all services

---

## Overview

No new accounts are created in Track B. Everything was set up in Track A. This phase just ensures the client's laptop has the minimum tools installed and that the client can log into all services.

---

## Step 1 — Check and install Chrome

```bash
# Check if Chrome is installed
ls /Applications/Google\ Chrome.app 2>/dev/null && echo "✅ Chrome installed" || echo "❌ Chrome missing"
```

If missing: download from `chrome.google.com` and install.

---

## Step 2 — Check and install Homebrew

```bash
brew --version 2>/dev/null && echo "✅ Homebrew installed" || echo "❌ Homebrew missing"
```

If missing:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After install, follow the printed instructions to add Homebrew to PATH.

---

## Step 3 — Check and install git

```bash
git --version 2>/dev/null && echo "✅ git installed" || brew install git
```

---

## Step 4 — Check and install gh CLI

```bash
gh --version 2>/dev/null && echo "✅ gh CLI installed" || brew install gh
```

---

## Step 5 — Authenticate GitHub

```bash
gh auth login
```

- Select: **GitHub.com**
- Protocol: **HTTPS**
- Authenticate: **Login with a web browser**
- Log in as the operator account (`{firstname}@{clientdomain}.com`)

Verify:
```bash
gh auth status
```

---

## Step 6 — Verify Claude Desktop is installed and logged in

1. Open Claude Desktop (download from `claude.ai/download` if not present)
2. Log in with the operator Claude Pro account
3. Verify Claude Code is accessible: open a terminal and run:
   ```bash
   claude --version 2>/dev/null && echo "✅ Claude Code installed" || echo "❌ Install Claude Code"
   ```
4. If Claude Code is not installed:
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

---

## Step 7 — Verify Vercel CLI

```bash
vercel --version 2>/dev/null && echo "✅ Vercel CLI installed" || npm install -g vercel
```

Log in:
```bash
vercel login
```
Authenticate with the operator GitHub account.

---

## Step 8 — Verify Supabase CLI

```bash
supabase --version 2>/dev/null && echo "✅ Supabase CLI installed" || npm install -g supabase
```

---

## Step 9 — Copy .env credentials from Mac Mini

Transfer the credentials file created in Track A P0 (`{project-slug}-credentials.md`) to the client laptop securely (AirDrop, encrypted message, or password manager share — never email).

---

## P0 complete — what you have now

- [ ] Chrome installed
- [ ] Homebrew installed and PATH configured
- [ ] git installed
- [ ] gh CLI installed and authenticated as operator account
- [ ] Claude Desktop installed and logged in
- [ ] Claude Code CLI installed
- [ ] Vercel CLI installed and authenticated
- [ ] Supabase CLI installed
- [ ] Credentials file transferred to client laptop

**Next**: [P1 — Laptop Setup](p1-client-setup.md)
