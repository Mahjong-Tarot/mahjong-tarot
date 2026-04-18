# P0 — Manual Account & Tool Setup
> **Who runs this:** You, the business owner — no AI tools required yet.
> **Where:** Your browser and your computer. Claude Chat can assist if you need guidance.
> **Time:** ~45–60 minutes
> **Done when:** Every checkbox is ticked and credentials are noted.

---

## INSTRUCTIONS FOR CLAUDE CHAT

You are a setup guide. Walk the user through each step below in order.
Do not skip steps. If the user already has an account, tick it off and move on.
At the end of each section, confirm what was completed before moving to the next.

---

## STEP 1 — Claude Desktop                                     ⏱ ~5 min

```
Let's get your AI workspace ready.
```

□ Download Claude Desktop from: https://claude.ai/download
□ Open Claude Desktop → sign in with your Anthropic account
□ Confirm you have a **Pro plan** (required for Cowork and Code tabs)
  → If not: claude.ai/upgrade
□ Check you can see three tabs in the left sidebar: **Chat**, **Cowork**, **Code**

---

## STEP 2 — GitHub (code repository)                          ⏱ ~5 min

```
GitHub stores your entire marketing system — website code, agent files, content.
It's free and your AI team uses it for every change.
```

□ Go to: https://github.com/signup
  (skip if you already have an account)
□ Choose a username (this will be part of your repo URL)
□ Verify your email address
□ Note your GitHub username: ________________________________

**Do NOT create a repository yet** — Claude Code will do that in P1.

---

## STEP 3 — Vercel (website hosting)                          ⏱ ~5 min

```
Vercel hosts your website. It deploys automatically every time your AI team
pushes an update — no manual uploads needed.
```

□ Go to: https://vercel.com/signup
  (free — use "Continue with GitHub" for the easiest setup)
□ Authorise Vercel to access your GitHub account when prompted
□ Note your Vercel team/username: ________________________________

**Do NOT create a project yet** — Claude Code will scaffold and connect it in P2.

---

## STEP 4 — Supabase (database)                               ⏱ ~10 min

```
Supabase is your database — it stores contact form submissions,
newsletter signups, and any data your website collects.
```

□ Go to: https://supabase.com (free tier is sufficient to start)
□ Create an account → Create a new organisation
□ Create a new project:
  - Name: `{your-business-name}-marketing`
  - Region: pick the one closest to your customers
  - Note your database password somewhere safe: ________________
□ Once the project is ready, go to:
  **Project Settings → API** and copy:
  - Project URL: ________________________________________________
  - Anon/Public key: ____________________________________________

**Keep these — you'll paste them into Vercel in P2.**

---

## STEP 5 — Email Platform                                    ⏱ ~10 min

```
Your AI team writes newsletters and campaigns. This platform sends them.
Brevo is recommended — free up to 300 emails/day.
```

**If using Brevo (recommended):**
□ Sign up at: https://brevo.com
□ Go to: Account → SMTP & API → API Keys → Create a new key
□ Name it: `{business-name}-marketing`
□ Copy the API key: ____________________________________________
□ Create a contact list: name it "Newsletter"
□ Note the List ID (shown in the list settings): ________________

**If using another platform (Mailchimp, ConvertKit, etc.):**
□ Log in and locate your API key
□ Note the API key: ____________________________________________
□ Note your main subscriber list ID: ___________________________

---

## STEP 6 — Telegram Bot (optional — for AI team notifications) ⏱ ~5 min

```
Your AI team can send you daily updates and draft-ready alerts via Telegram.
Skip this if you prefer not to use Telegram.
```

Do you want Telegram notifications? **Yes / No**

**If YES:**
□ Open Telegram → search `@BotFather` → tap Start
□ Send: `/newbot`
□ Name your bot: `{BusinessName}MarketingBot`
□ Username: `{businessname}marketing_bot` (must end in `_bot`)
□ Copy the token BotFather gives you: _________________________
□ Send your bot a message (any text) to activate it
□ Note your Telegram username: ________________________________

---

## STEP 7 — Social Media Accounts                             ⏱ ~5 min

```
Your AI team drafts content for your platforms. Let's confirm which ones
you have access to.
```

For each platform you plan to use, confirm you can log in:

□ Instagram — username: ______________________________________
□ TikTok — username: _________________________________________
□ LinkedIn — profile URL: ____________________________________
□ Twitter/X — username: ______________________________________
□ Facebook Page — page name: _________________________________
□ YouTube Channel — channel name: ____________________________
□ Other: _______________________ username: ___________________

**Social scheduling tool** (Buffer, Later, Hootsuite, etc.):
□ Name: _________________________ Account active: Yes / No
□ API key (if available): ______________________________________

---

## STEP 8 — Domain Name (optional)                            ⏱ ~15 min

```
You can start with a free Vercel subdomain (yoursite.vercel.app) and add
a custom domain later. If you already own a domain, note it here.
```

□ Already have a domain: ______________________________________
□ Want to buy one: go to namecheap.com or domains.google.com
□ No domain yet — will use Vercel subdomain for now ✓

---

## STEP 9 — Credentials Summary

Before moving to P1, confirm you have noted:

| Item | Have it? |
|------|----------|
| GitHub username | □ |
| Supabase Project URL | □ |
| Supabase Anon Key | □ |
| Email platform API key | □ |
| Email subscriber list ID | □ |
| Telegram bot token (if using) | □ |
| Domain name (if applicable) | □ |

---

```
✅ P0 complete. All accounts created and credentials noted.

Next:
  1. Open Claude Desktop
  2. Switch to the Cowork tab
  3. Click the 📎 attachment icon (bottom-left of the message box)
  4. Select p1-local-setup.md from your files
  5. Send it — Claude will take over from there
```
