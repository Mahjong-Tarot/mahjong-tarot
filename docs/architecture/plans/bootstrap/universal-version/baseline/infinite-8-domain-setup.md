# New Account Setup: Google Workspace + Domain + Vercel

## Overview

How to onboard a new operator account (e.g., Tracy) with a Google Workspace email under their own domain, fully connected to GitHub, Vercel, and Supabase.

---

## Steps

### 1. Log into the Master Google Workspace Account

- Go to **infinite-8.com** Google Workspace account
- Open Gmail, click the grid/apps menu, and select **Admin Console**

### 2. Add a Secondary Domain

- In the Admin Console, click **Add a domain**
- Select **Add as a secondary domain**
- Enter the new domain (e.g., `infiniteleverage-2.com` for Tracy)

### 3. Get the TXT Record for DNS Verification

- Google will provide a **TXT record** to verify domain ownership
- Copy that TXT record value

### 4. Add the TXT Record in Vercel

- Go to the Vercel account connected to the master setup
- Navigate to the domain's DNS settings
- Add the TXT record Google provided
- Once added, return to Google Admin Console and **verify the domain**

### 5. Set MX Records via Vercel

- After Google confirms the domain is verified, it will prompt email setup
- You do **not** need to add MX records manually
- In Vercel, use the option to **set MX records for Google** (this handles it automatically)

### 6. Create the Operator Email

- Back in Google Admin Console, create the new user email
- Example: `tracy@infiniteleverage-2.com`

### 7. Use the New Email to Set Up Services

With the new email address, set up the following accounts:

- **GitHub**
- **Vercel**
- **Supabase**

This gives the operator their own fully independent, fully controlled account stack.

---

## Result

The operator has a professional email under their own domain, with all dev services connected. Everything is traceable back to the master Google Workspace but independently operated.
