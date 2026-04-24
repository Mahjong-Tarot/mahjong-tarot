# P0 — Account Setup
> **Who:** You. In your browser and terminal.
> **Time:** ~45 min
> **Done when:** Every checkbox is ticked.

---

## INSTRUCTIONS FOR CLAUDE CHAT

At the start of this phase, tell the user:

```
⚠️  Heads up: do not try to open or read any files during this process.
    It's highly technical — you don't need to understand it.
    Just follow the steps below and answer when I ask you something.
```

Then immediately output this agenda:

```
P0 — Account Setup (~45 min)
Here's what we're setting up today:

  1. Claude Desktop
  2. GitHub account
  3. Vercel account
  4. Supabase project + API keys
  5. Google Gemini API key
  6. Communication app (Lark — optional)
  7. Social media logins
  8. Domain (optional)
  9. Email platform (Resend or managed email)
 10. Homebrew + git

I'll walk you through each one. If you already have something, we'll skip it.
Let's go.
```

Walk the user through each step in order. Do not explain what things are. If they already have an account, skip that step.

---

## STEP 1 — Claude Desktop

□ Go to https://claude.ai/download — download and install the latest version.
□ Sign in with your Anthropic account.
□ If you don't have Pro: go to https://claude.ai/upgrade and upgrade now.
□ Confirm you see Chat and Code tabs in the left sidebar.

---

## STEP 2 — GitHub

□ Go to https://github.com/signup — create a free account. Skip if you have one.
□ Verify your email — check your inbox and click the verification link now before continuing.
□ Write down your username: ________________________________
□ Do NOT create a repository.

---

## STEP 3 — Vercel

□ Go to https://vercel.com/signup
□ Click "Continue with GitHub" — approve the access request.
□ Write down your Vercel username: ________________________________
□ Do NOT create a project.

---

## STEP 4 — Supabase

□ Go to https://supabase.com — create a free account.
□ Create a new organisation.
□ Create a new project:
  - Name: `{your-business-name}-marketing`
  - Region: pick the closest to your customers
  - Write down your database password: ________________________
□ Wait for the project to finish setting up (takes ~1 min).
□ Go to **Project Settings → API**. Copy and write down:
  - Project URL: ____________________________________________
  - Anon/Public key: ________________________________________
□ Go to https://supabase.com/dashboard/account/tokens
□ Click "Generate new token" — name it `{your-business-name}-claude`.
□ Copy it immediately — it only shows once: __________________
  ⚠️  Open a notes app and paste that token right now before closing this page. It cannot be recovered.

---

## STEP 5 — Google AI Studio

□ Go to https://aistudio.google.com/apikey — sign in with Google.
□ Click "Create API key" → "Create API key in new project".
□ Copy the key immediately: ________________________________

---

## STEP 6 — Communication App

Ask the user: "Does your team use Lark / Feishu for notifications? (yes / no)"

**Lark / Feishu:**
□ Go to https://open.larksuite.com/app (Feishu: https://open.feishu.cn/app)
□ Create a Custom App — name it `{business-name}-notifications`
□ Go to Credentials & Basic Info — copy App ID and App Secret
□ Go to Add Capabilities → Messenger → enable Send Message
□ Go to Security Settings → add your workspace domain
□ Publish the app → Install to workspace
□ Open the Lark chat where you want notifications → right-click → Copy Chat ID
□ Write down — App ID: ________________  App Secret: ________________  Chat ID: ________________

Note: Lark is one-way. Claude sends messages to Lark but cannot receive replies without a custom integration.

**No / skip:**
□ Continue to Step 7. Email-only notifications will be set up in Step 9.

---

## STEP 7 — Social Media

For each platform you plan to post on, confirm you can log in:

□ Instagram — username: ______________________________________
□ TikTok — username: _________________________________________
□ LinkedIn — profile URL: ____________________________________
□ Twitter/X — username: ______________________________________
□ Facebook Page — page name: _________________________________
□ YouTube — channel name: ____________________________________

---

## STEP 8 — Domain (optional)

□ Already have a domain: ______________________________________
□ Want to buy one: go to namecheap.com or domains.google.com
□ No domain — using Vercel subdomain for now ✓

---

## STEP 9 — Email Platform

Ask the user: "Does your domain run on Google Workspace, Outlook 365, or another managed email service? (yes / no)"

**Google Workspace or managed email:**
□ Log in to your admin console.
□ Create a notification-only inbox — e.g. `notifications@{yourdomain.com}`
□ Write down the address: ____________________________________________
□ Skip Resend — this inbox is your sender address.

**No managed email — use Resend:**
□ Go to https://resend.com — sign up with your GitHub account.
□ Go to Domains → Add Domain — enter your domain (or use `onboarding@resend.dev` to start without a domain).
□ If adding your domain: paste the DNS records shown into your registrar → wait for verification (usually minutes, up to 24h).
□ Go to API Keys → Create API Key — name it `{business-name}-notifications`.
□ Copy the key immediately: ________________________________________________

---

## STEP 10 — Developer Prerequisites

Open **Terminal** (Mac: search "Terminal" in Spotlight. Windows: skip to the Windows note below).

**Install Homebrew — paste this and press Enter:**
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
When it asks for your password — type it and press Enter. You won't see the characters — that's normal.

**Install git — paste this and press Enter:**
```
brew install git
```
⚠️  During the Homebrew install, a popup may appear saying "Install Developer Tools" — click Install and wait for it to finish before Homebrew continues. This is normal and takes 5–10 minutes.

**If Homebrew fails with "not currently available from the Software Update server":**
```
sw_vers -productVersion
```
Note your macOS version (15.x = Sequoia, 14.x = Sonoma, 13.x = Ventura), then:
1. Go to https://developer.apple.com/downloads — sign in with your Apple ID (free, no paid account needed)
2. Search: `Command Line Tools for Xcode`
3. Download the version that matches your macOS (Sequoia → Xcode 16, Sonoma → Xcode 15, Ventura → Xcode 14)
4. Open the .dmg → run the .pkg installer → wait for it to complete
5. Re-run the Homebrew install command

**Confirm it worked — paste this:**
```
git --version
```
You should see `git version 2.x.x`. ✅

**Windows:** Download and install git from https://git-scm.com/download/win — run the installer with all default settings.

---

## Credentials Summary

Confirm you have all of these before moving on:

| Item | Have it? |
|------|----------|
| GitHub username | □ |
| Supabase Project URL | □ |
| Supabase Anon Key | □ |
| Supabase Personal Access Token | □ |
| Google Gemini API key | □ |
| Resend API key (or managed notification email address) | □ |
| Lark App ID + App Secret + Chat ID (if using Lark) | □ |

---

```
✅ P0 complete.

Open Claude Desktop → switch to the Code tab → attach p1-local-setup.md → send it.
```
