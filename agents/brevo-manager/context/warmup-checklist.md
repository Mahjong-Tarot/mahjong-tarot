# Sender Domain Warmup — May 12 → Jun 1, 2026

Goal: Get `firepig@onlinechineseastrology.com` out of Gmail spam before D-0 fires on Jun 2-4.

The May 2-3 test send to `yon@edge8.co` landed in **Gmail spam** despite DKIM + DMARC being set. Cause: brand-new sender domain with zero positive signal history. Fix: 21 days of controlled, replied-to sends from real recipients before opening the floodgates to 870 dormant contacts.

## Status

| Item | State |
|---|---|
| Campaigns 1/2/3 | `suspended`, scheduled Jun 2/3/4 14:00Z, 290 recipients each. Do NOT unsuspend until inbox-placement test passes. |
| Sender | `Bill Hajdu <firepig@onlinechineseastrology.com>` (Brevo sender id 2, active). |
| DNS | DKIM (brevo1/brevo2), DMARC `p=none`, SPF — all live at GoDaddy. |
| Brevo daily cap | 300 sends/day (Free plan). |

## Phase 1 — Personal warmup (May 12 – May 18, week 1)

Bill sends **plain-text personal emails** from his own Gmail/Mail.app, signed-in as `firepig@onlinechineseastrology.com` (via Brevo SMTP relay or direct IMAP/SMTP), to known contacts. No marketing. No links to mahjongtarot.com. No images. Just real correspondence.

Daily target: **5 sends/day**, 30+ total over 7 days.

Recipients (Bill curates from his own contacts):
- 10 close friends/family — ask them to reply with a short message
- 10 prior OCA customers Bill has talked to recently — re-establish contact
- 10 colleagues/peers — short check-ins

Replies are the most valuable signal — every reply to `firepig@…` tells Gmail "this address is wanted".

**Daily checklist (Bill):**
- [ ] Send 5 plain-text emails
- [ ] Get at least 2 replies the same day
- [ ] No more than 1 image, no PDF attachments
- [ ] No identical wording across recipients

## Phase 2 — Brevo seed sends (May 19 – May 25, week 2)

Switch to **Brevo as the sending pipe**, but to a tiny known-good list. This is the critical phase — Gmail learns to trust mail from Brevo's IPs sent under your DKIM-signed domain.

Steps:

1. **Create seed list** in Brevo:
   - Name: `Seed — warmup — May 2026`
   - Recipients: 20-30 of Bill's personal contacts across **Gmail (10+), Yahoo (3+), Outlook/Hotmail (3+), iCloud (3+)**. Mix of providers is essential.
   - Each must have agreed in advance to reply once.

2. **Send 2 short "soft" Brevo campaigns** (Tue + Thu of week 2):
   - Subject: something personal like "quick note — Bill"
   - Body: 3-4 sentences plain text. No marketing pitch.
   - Reply-to: `firepig@onlinechineseastrology.com` (Bill's inbox).
   - From the dashboard, send immediately to the seed list only.

3. **Track replies** — aim for ≥ 50% reply rate. If lower than 30%, extend Phase 2 by a week and reduce volume.

**Week 2 checklist (Bill + Brevo Manager Agent):**
- [ ] Seed list created (Brevo)
- [ ] Tuesday May 19 send: ≤ 30 recipients
- [ ] Thursday May 21 send: ≤ 30 recipients
- [ ] Mail-tester.com score ≥ 9/10 on both sends (use a `test-XXXX@mail-tester.com` address in each)
- [ ] At least 1 reply per send received in `firepig@…`

## Phase 2b — MT domain warmup (parallel, May 26 – Jun 8)

`firepig@mahjongtarot.com` is cold. Its first scheduled send is the Bridge to Responders on Jun 9 (~50-150 recipients). The recipients will be engaged (just replied to D-0), which gives Gmail strong positive signal — but a domain with literally zero send history is still suspicious. We need minimal MT warmup before the Bridge fires.

Bill sends **2 personal plain-text emails/day** from `firepig@mahjongtarot.com` (via Google Workspace), May 26 → Jun 8 (14 days). Same playbook as Phase 1 but lower volume:

- Recipients: same friend/family/contact pool from Phase 1. They'll get one note from each address — naturally pairs the two senders in their minds.
- Content: anything personal. Don't reference "the book launch" — keep it private correspondence.
- Get replies. 1+ reply per day target.

**Why only 2/day instead of 5/day:** Phase 1 already builds a strong sender-name "Bill Hajdu" reputation in friends' inboxes. The MT domain just needs to ride coattails — its DKIM signature must appear in Gmail's "this person sometimes writes" model before the Bridge.

**Daily checklist (Bill):**
- [ ] Send 2 plain-text emails from `firepig@mahjongtarot.com`
- [ ] Get ≥ 1 reply
- [ ] No marketing language, no links, no images

**Phase 2b gate (Jun 8 morning):** mail-tester.com score ≥ 9/10 from `firepig@mahjongtarot.com`. If lower, the Bridge becomes a Phase 3 mini inbox-placement test before going to the full Responders list.

## Phase 3 — Inbox placement test (May 26 – Jun 1, week 3)

Verify Gmail Inbox placement before unsuspending the real D-0 campaigns.

1. **Set up seed accounts** (Bill or Yon):
   - Gmail personal address (not yon@edge8.co — that one's tainted from the May 2 spam test).
   - Yahoo personal.
   - Outlook/Hotmail personal.
   - iCloud personal.
   - One **glockapps.com** or **mail-tester.com** seed account (for objective scoring).

2. **Send one warmup-test campaign via Brevo** (replicate campaign 1, edit list to seed list + test addresses, send immediately):
   - Status check: must land in **Inbox** on Gmail, Yahoo, Outlook, iCloud — not Spam, not Promotions tab (Promotions is acceptable but Inbox is the win).
   - mail-tester.com score: **≥ 9/10**.
   - GlockApps Inbox placement: **≥ 80% Inbox**.

3. **Decision gate (Jun 1 evening, Saigon time):**
   - **All green** → Brevo Manager Agent unsuspends campaigns 1/2/3 → they fire Jun 2/3/4 at 14:00Z.
   - **Yellow** (lands in Promotions tab on Gmail) → unsuspend, but watch batch 1 stats Wed Jun 3 morning before letting 2 and 3 fire.
   - **Red** (lands in Spam, score < 7) → keep suspended. Extend warmup another 2 weeks. Push D-1 announcement from Jun 15 → Jun 29.

**Week 3 checklist:**
- [ ] Seed accounts set up across 4+ providers
- [ ] Test campaign via Brevo to seed list — record screenshots
- [ ] mail-tester.com score recorded
- [ ] Gmail placement: Inbox / Promotions / Spam — recorded
- [ ] Decision recorded in `send-log.md`

## Hard rules

1. **Never unsuspend campaigns 1/2/3 without passing Phase 3.** They will go to 870 dormant contacts and one Spam classification will tank the domain for months.
2. **No links to mahjongtarot.com during Phases 1-2.** New domain × new recipient list × marketing link = automatic spam flag.
3. **No PDFs, no images > 100KB during warmup.**
4. **Stop on first complaint.** A single "report spam" click in Phases 1-2 means a recipient list cleanup, not just a "send less".
5. **Log every campaign send to `send-log.md`** with delivered/spam/bounced counts.

## Owner

- Phases 1-2: Bill (executes the sends from his own inbox / Brevo dashboard)
- Phase 3 decision gate: Brevo Manager Agent + Bill jointly
- D-0 unsuspend: Brevo Manager Agent on Bill's go-ahead, Jun 1 evening
