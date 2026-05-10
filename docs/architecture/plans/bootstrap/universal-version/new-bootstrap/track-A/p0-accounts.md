# Track A — P0: Accounts

> **Who runs this**: Dave (the developer)
> **Machine**: Any machine with browser access (not the Mac Mini itself)
> **Prerequisite**: Access to the master `infinite-8.com` Google Workspace account
> **Output**: Operator email created, all service accounts ready, all API keys collected

---

## Overview

P0 establishes the operator's identity — a professional email under their own domain, connected to all services the AI team will use. Everything flows from Google Workspace outward: GitHub, Vercel, Supabase, and every API key.

---

## Step 1 — Log into master Google Workspace

1. Open a browser and go to `gmail.com`
2. Log in as the `infinite-8.com` master account
3. Click the **grid/apps icon** (top right) → select **Admin Console**

---

## Step 2 — Add the client's domain as a secondary domain

1. In Admin Console, navigate to **Domains** → **Manage Domains**
2. Click **Add a domain**
3. Select **Add as a secondary domain**
4. Enter the client's domain (e.g. `clientname.com`)
5. Click **Continue and verify domain ownership**

---

## Step 3 — Copy the TXT verification record

1. Google will display a **TXT record** for DNS verification
2. Copy the full TXT record value — you will need it in Step 4

---

## Step 4 — Add TXT record to Vercel DNS

1. Log into **Vercel** (master account or the account managing the client's domain)
2. Navigate to: **Domains** → select the client's domain → **DNS Records**
3. Add a new record:
   - **Type**: `TXT`
   - **Name**: `@` (or as instructed by Google)
   - **Value**: the TXT record copied from Step 3
4. Return to Google Admin Console → click **Verify**
5. Wait for verification to complete (usually under 2 minutes)

---

## Step 5 — Set MX records for Google Workspace email

1. After domain is verified, Google will prompt for email setup
2. In Vercel, on the same domain DNS page, look for **Set MX records for Google**
3. Click it — Vercel auto-configures the correct MX records
4. No manual MX entry needed

---

## Step 6 — Create the operator email

1. In Google Admin Console → **Users** → **Add new user**
2. First name: client's first name
3. Last name: client's last name (or company name)
4. Email: `{firstname}@{clientdomain}.com`
5. Set a temporary password, note it securely
6. **Log in once** as the operator email to activate the account and set a permanent password

---

## Step 7 — Create service accounts using the operator email

Use `{firstname}@{clientdomain}.com` to create:

### GitHub
1. Go to `github.com` → **Sign up**
2. Use operator email
3. Username: `{clientslug}` (all lowercase, hyphens OK)
4. Complete email verification

### Claude (Pro)
1. Go to `claude.ai` → **Sign up**
2. Use operator email
3. Select **Pro plan** (required for Claude Code usage)

### Vercel
1. Go to `vercel.com` → **Sign up**
2. **Sign up with GitHub** — links the two accounts
3. Complete setup, skip team creation for now

### Supabase
1. Go to `supabase.com` → **Sign up**
2. Use operator email (or sign up via GitHub)
3. Create a new project — name: `{project-slug}`
4. Region: closest to client's primary users
5. Generate and **save the database password** securely

---

## Step 8 — Generate all API keys

Collect the following keys and store them in a secure credential document (NOT committed to any repo):

### Gemini API key (for Designer agent)
1. Go to `aistudio.google.com`
2. Log in with the operator Google account
3. Click **Get API key** → **Create API key**
4. Copy and save as `GEMINI_API_KEY`

### Resend API key + domain verification (for Email Marketer agent)

**API key:**
1. Go to `resend.com` → **Sign up** with operator email
2. After login: **API Keys** → **Create API Key**
3. Name: `{project-slug}-email-marketer`
4. Copy and save as `RESEND_API_KEY`

**Domain verification** (so emails send from `{firstname}@{clientdomain}.com`, not a Resend subdomain):
1. In Resend dashboard → **Domains** → **Add Domain**
2. Enter `{clientdomain}.com` — Resend will display DNS records to add
3. Return to Vercel → **Domains** → `{clientdomain}.com` → **DNS Records** (same panel as Steps 3–5)
4. Add each record Resend provides — typically:
   - **TXT** on `resend._domainkey` — DKIM key (Resend will show the exact name and value)
   - **MX** on `bounce` — for bounce tracking (optional but recommended)
   - **TXT** on `@` — SPF record (add `include:amazonses.com` to any existing SPF, or create new)
5. Back in Resend → click **Verify DNS Records**
6. Status turns green when verified (usually under 5 minutes)
7. Save as `RESEND_DOMAIN={clientdomain}.com`

> **Brevo note**: If Brevo is added later, it follows the same pattern — Brevo provides TXT (SPF + DKIM) records to add in the same Vercel DNS panel. No new DNS provider needed.

### Lark API credentials (for PM agent notifications)
1. Go to `open.larksuite.com` or `open.feishu.cn` (if China region)
2. Create a Bot App for internal notifications
3. Save as `LARK_APP_ID` and `LARK_APP_SECRET`
4. Note the bot webhook URL as `LARK_WEBHOOK_URL`

### Supabase credentials (from Step 7)
From the Supabase project dashboard:
- `SUPABASE_URL` — Project Settings → API → Project URL
- `SUPABASE_ANON_KEY` — Project Settings → API → anon public
- `SUPABASE_SERVICE_ROLE_KEY` — Project Settings → API → service_role (keep secret)

---

## Step 9 — Collect credentials for P1

Create a local file (not in any repo) named `{project-slug}-credentials.md` with all of the following:

```
# {Project Name} — Operator Credentials

## Operator Identity
- Email: {firstname}@{clientdomain}.com
- GitHub username: {clientslug}

## Service URLs
- GitHub: https://github.com/{clientslug}
- Vercel: https://vercel.com/{clientslug}
- Supabase: https://app.supabase.com/project/{project-ref}

## API Keys
- GEMINI_API_KEY=
- RESEND_API_KEY=
- RESEND_DOMAIN=
- LARK_APP_ID=
- LARK_APP_SECRET=
- LARK_WEBHOOK_URL=
- SUPABASE_URL=
- SUPABASE_ANON_KEY=
- SUPABASE_SERVICE_ROLE_KEY=

## GitHub Repositories (to be created in P1)
- {project-slug}-website
- {project-slug}-agents
```

---

## Step 10 — Install Homebrew on the Mac Mini

Run this on the Mac Mini itself (not the machine you've been using for the browser steps):

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After install, follow the printed instructions to add Homebrew to PATH (Apple Silicon requires adding to `~/.zprofile`):

```bash
# These lines will be printed for you — copy them from YOUR terminal output
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

Verify:
```bash
brew --version
```

---

## Step 11 — Install git

```bash
brew install git
```

Verify:
```bash
git --version
```

> Everything else (gh, node, jq, ffmpeg, vercel CLI, supabase CLI) is installed in P1 — Claude Code handles those steps automatically.

---

## P0 complete — what you have now

- [ ] Operator email active: `{firstname}@{clientdomain}.com`
- [ ] GitHub account created and verified
- [ ] Claude Pro account active
- [ ] Vercel account linked to GitHub
- [ ] Supabase project created, database password saved
- [ ] Gemini API key generated
- [ ] Resend API key generated
- [ ] Resend domain verified: `{clientdomain}.com`
- [ ] Lark bot credentials collected
- [ ] All credentials saved to local `{project-slug}-credentials.md`
- [ ] Homebrew installed on Mac Mini
- [ ] git installed

**Next**: [P1 — Machine Setup](p1-machine-setup.md)
