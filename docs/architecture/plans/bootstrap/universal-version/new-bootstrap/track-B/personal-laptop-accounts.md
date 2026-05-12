# Personal Laptop — P0: First Login

> **Who runs this**: Dave (sets up), client watches — client takes the keyboard from Step 6 onward
> **Machine**: Client's existing personal laptop
> **Prerequisite**: Track A P0–P2 complete — all accounts exist, website live on Vercel, agents repo on GitHub
> **Output**: Client laptop has all tools installed, GitHub authenticated, and the live project running locally

---

## Why P0 ends with the site running on your laptop

Most setup guides make you wait. You install things for an hour with nothing to show for it.

This is different. By the end of P0 you'll have your live website — already deployed, already live — cloned to your machine and running at `http://localhost:3000`. Everything in P1 and P2 builds on top of it. The accounts and deployment already exist. This phase just gets you connected.

---

## Step 1 — Check and install Chrome

```bash
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

After install, follow the printed instructions to add Homebrew to PATH:

```bash
# These two lines will be printed for you — copy them from YOUR terminal output
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

Verify:
```bash
brew --version
```

---

## Step 3 — Check and install git, gh CLI, and Node

```bash
git --version 2>/dev/null && echo "✅ git installed" || brew install git
gh --version 2>/dev/null && echo "✅ gh CLI installed" || brew install gh
node --version 2>/dev/null && echo "✅ Node installed" || brew install node
```

---

## Step 4 — Authenticate with GitHub

```bash
gh auth login
```

Answer the prompts:
- **Where do you use GitHub?** → `GitHub.com`
- **Protocol?** → `HTTPS`
- **Authenticate with browser?** → Yes

Log in as the operator account (`{firstname}@{clientdomain}.com`). Come back to Terminal when it says you're done.

Verify:
```bash
gh auth status
```

---

## Step 5 — Verify Claude Code

```bash
claude --version 2>/dev/null && echo "✅ Claude Code installed" || echo "❌ Install Claude Code"
```

If not installed:
```bash
npm install -g @anthropic-ai/claude-code
```

Log in (uses the operator Claude Pro subscription):
```bash
claude
```

On first launch, complete authentication in the browser. Then `/exit` — we'll come back in P1.

---

## Step 6 — Verify Vercel CLI

```bash
vercel --version 2>/dev/null && echo "✅ Vercel CLI installed" || npm install -g vercel
```

Log in:
```bash
vercel login
```

Authenticate with the operator GitHub account.

---

## Step 7 — Copy .env credentials from Mac Mini

Transfer `{project-slug}-credentials.md` from the Mac Mini to the client laptop securely (AirDrop, encrypted message, or password manager share — never email).

This file contains all API keys and service URLs needed in P1.

---

## Step 8 — Clone the live project and run it

This is the quick win. Your website is already live. Let's get it running on your machine too.

```bash
mkdir -p ~/code-projects
cd ~/code-projects
gh repo clone {clientslug}/{project-slug}
cd {project-slug}
npm install --prefix website
```

Start the dev server:
```bash
npm run dev --prefix website
```

Open `http://localhost:3000` — your live site, running locally.

```bash
# Stop the server
Ctrl+C
```

You just cloned a live, deployed website and ran it in under 3 minutes. **That's the stack.**

---

## P0 complete — what you have now

- [ ] Chrome installed
- [ ] Homebrew installed and PATH configured
- [ ] git, gh CLI, Node installed
- [ ] GitHub authenticated as operator account
- [ ] Claude Code installed and authenticated
- [ ] Vercel CLI installed and authenticated
- [ ] Credentials file transferred to client laptop
- [ ] Live project cloned to `~/code-projects/{project-slug}/`
- [ ] Dev server verified at `http://localhost:3000`

**Next**: [P1 — Machine Setup](personal-laptop-p1.md)
