# OCA Book Launch + Ongoing Email Campaign — Attack Plan

**Status:** Draft for stakeholder sign-off
**Owner:** Engineering (Yon)
**Date:** 2026-06-03
**Audience:** Bill (firepig01@gmail.com), Dave (dave@edge8.ai), Yon (yon@edge8.co)
**Related docs:** [email-system-overview.md](./email-system-overview.md) · [email-list-validation-2026-05.md](./email-list-validation-2026-05.md)

---

## TL;DR — One-page summary

| Item | Decision |
|---|---|
| **Goal** | Launch Bill's book and establish ongoing 2x/month engagement with the OCA audience |
| **Business priorities (CTA hierarchy in every send)** | #1 Book sales → #2 Membership purchases → #3 Private readings with Bill → #4 Newsletter signups |
| **Audience** | 37,950 SMTP-validated emails (Brevo list **OCA Master Deliverable — June 2026 — 37,950**, ID **9**) |
| **Cadence** | **2 sends per month**, ~14 days apart, ongoing |
| **Monthly send volume** | ~75,900 emails/month (37,950 × 2) |
| **Brevo plan** | Upgrade from Standard 40k → **Standard 80k tier** |
| **Approx monthly cost** | **~$49–65/mo** (replaces current Standard 40k plan; exact price set by Brevo's volume slider at checkout) |
| **Incremental cost vs today** | ~$15–30/mo above current Standard 40k plan |
| **First send** | Week of **June 16, 2026** — Book launch announcement |
| **Second send** | Week of **June 30, 2026** — Follow-up / re-engagement |
| **Ongoing rhythm** | Sends on weeks 2 and 4 of each month (e.g. Jul 14 + Jul 28, Aug 11 + Aug 25, etc.) |
| **Risk level** | Medium for first month, low after warm-up establishes reputation |
| **What we need approval on** | Plan upgrade, cadence, content per send, sender identity, the strategy below |

---

## 1. Current Position (Already Done)

- ✅ **37,950 SMTP-validated emails imported** to Brevo list `OCA Master Deliverable — June 2026 — 37,950` (list ID **9**)
- ✅ Brevo account on **Standard 40k plan**, renews monthly on the 3rd
- ✅ Total contacts in Brevo: **38,281 / 500,000** (massive headroom; contact storage will not be a constraint)
- ✅ Resend handling transactional flows separately — no conflict with marketing
- ✅ Source-of-truth backup: every email also in Supabase / `working_files/oca-master-deliverable.csv`

## 2. The Plan — 2 Sends Per Month, Ongoing

### Cadence

**Twice a month, 14 days apart, every month.** Mid-month send + end-of-month send.

| Month | Send 1 (mid-month) | Send 2 (end-of-month) | Total credits used |
|---|---|---|---|
| June 2026 | Jun 16–22 (book launch) | Jun 30 – Jul 2 (follow-up) | ~75,450 / 80,000 (incl. 3,000 warm-up; list 10 excluded from Send 1 — see below) |
| July 2026 | Jul 14–20 | Jul 28 – Aug 1 | ~75,900 / 80,000 |
| August 2026 | Aug 11–17 | Aug 25–29 | ~75,900 / 80,000 |
| … ongoing | week 2 of month | week 4 of month | ~75,900 / 80,000 |

**June credit math (corrected in v2.1):** the warm-up wave (3,000 emails) shares the June billing cycle (Jun 3 – Jul 3) with both sends. To keep June under budget AND avoid sending warm-up recipients 3 emails in one month, **Send 1 excludes warm-up list 10** via Brevo's campaign exclusion-list feature. June total = 3,000 warm-up + ~34,950 Send 1 + ~37,500 Send 2 ≈ **75,450**. Warm-up recipients still receive Send 2, so nobody misses the launch message entirely.

**Headroom:** ~4,550 credits in June (with the exclusion), ~4,100/month from July onward — buffer for transactional drift or A/B variants.

**⚠️ Unverified assumption — mid-cycle upgrade credits:** the 40k→80k upgrade happens mid-cycle (~Jun 9), and it is NOT yet confirmed whether Brevo grants the additional 40k immediately or only at the Jul 3 renewal. **Verify in Plans & Billing (or with Brevo support) before approving the June dates.** Fallback if extra credits only arrive Jul 3: Send 1 still fits June on the current 40k plan (3,000 + 34,950 = 37,950 ≤ 40,000 thanks to the list-10 exclusion); move Send 2 to Jul 3 or later, where it draws on fresh July credits.

### Why 14 days apart (not 7, not 30)

- **7 days = too aggressive** for a once-cold list. Spam complaint risk climbs sharply.
- **30 days = too sparse** to build momentum during a launch.
- **14 days** matches the industry norm for engaged-list newsletter cadence and gives each send enough breathing room that engagement metrics from send N inform send N+1.

### Why upgrade to 80k Standard tier (not Starter)

You're already on Standard. **Standard plan benefits we keep:**
- A/B testing on subject lines (use sparingly — costs extra credits per variant)
- Send-time optimization (Brevo picks best time per recipient)
- Advanced statistics and heatmaps
- Multi-user support (1 marketing seat now; can add later)
- No Brevo branding in emails by default

Downgrading to Starter to save ~$10/mo would lose A/B testing and send-time optimization — both useful for an ongoing program.

### How to confirm exact price

Log into Brevo → Plans & Billing → **Email volume slider** → drag to 80,000. Brevo will show the exact monthly price for the Standard 80k tier. From public pricing data the range is **~$49–65/mo**. Confirm at checkout.

## 3. June 2026 — Book Launch Month (Detailed)

### Send 1 — Book Launch Announcement (June 16–22)

| Field | Value |
|---|---|
| Audience | List 9 (37,950) **excluding warm-up list 10** → ~34,950 recipients |
| Sender | `Bill Hajdu <bill@news.mahjongtarot.com>` *(see §5 on marketing subdomain)* |
| Reply-to | `firepig@mahjongtarot.com` (Bill) |
| Subject (recommended) | *"I'm the Firepig. After 35 years, my book is here."* (from the draft; 4 alternates in the draft file) |
| Send window | 3-day staggered batch, ~11,650/day, weekdays preferred |
| Credits used | ~34,950 |

**Content shape:**
- Short personal note from Bill (3–5 sentences)
- *"Why you're getting this"* line near the top — reminds them of OCA signup
- Book cover image
- 3-line value pitch (who it's for, what they get)
- **3 clear SKU options visible in email:**
  - Digital edition
  - Hardcopy
  - Signed hardcopy + Mahjong Mirror Card Set
- Primary CTA: **Pre-order The Mahjong Mirror** → `https://www.mahjongtarot.com/the-mahjong-mirror/order`
- Secondary CTA: read sample chapter on mahjongtarot.com
- Standard unsubscribe footer (Brevo handles automatically)

### Send 2 — Follow-up / Re-engagement (June 30 – July 2)

| Field | Value |
|---|---|
| Audience | All 37,950 (Brevo auto-excludes unsubscribers from Send 1) |
| Sender | Same as Send 1 |
| Subject placeholder | *"Did you see this 2 weeks ago? — [book title] is out"* OR *"One reader said: '…'"* |
| Send window | 3-day staggered batch, ~12,650/day |
| Credits used | ~37,500 (lower due to Send 1 unsubscribers) |

**Content shape:**
- Acknowledge: *"if you saw this two weeks ago, thanks for engaging"*
- Reader testimonial OR book excerpt (different content than Send 1)
- Same primary CTA: **Order the book**
- Reminder of pricing / any launch-period offer ending

**Why 14 days after Send 1:** late enough to avoid feeling pushy, early enough that Send 1 awareness hasn't faded.

## 4. Ongoing Months (July onward) — Template

Each month after the launch follows the same shape but the **content evolves away from launch and toward sustained reader engagement**:

| Send | Content theme example | CTA |
|---|---|---|
| Month N Send 1 (mid-month) | New article, almanac reading, seasonal forecast | Read on site / book the reading |
| Month N Send 2 (end-of-month) | Reader Q&A, deeper dive, testimonial | Engage / book / share |

**CTA hierarchy (fixed business priorities, per stakeholders 2026-06-11):** every send leads with the highest-priority CTA that fits the content: **#1 book sales, #2 membership, #3 private readings with Bill, #4 newsletter signup.** During launch months the book is always primary; membership and readings rotate as secondary CTAs from Send 2 onward.

Stakeholders sign off on monthly content themes in a **monthly content review meeting** (proposed: first Monday of each month).

## 5. Deliverability Protections

This is the hardest part of the plan and the most likely failure point. **Skip these and the program dies in month 2 from Brevo account suspension.**

### 5.1 Use a marketing subdomain — `news.mahjongtarot.com`

Sends from `news.mahjongtarot.com` instead of bare `mahjongtarot.com`.

**Why:** isolates marketing reputation from transactional. If marketing complaints spike, transactional email (booking confirmations, contact-form replies via Resend) keeps working from `notifications@mahjongtarot.com`.

**Status: ✅ DONE (2026-06-03).** 3 DNS records added at Vercel (Brevo verification TXT + 2 DKIM CNAMEs); SPF and DMARC inherit from the parent domain, so only 3 of the originally-planned 4 records were needed. Domain shows verified + authenticated in Brevo. Details: [brevo-news-subdomain-setup.md](./brevo-news-subdomain-setup.md).

**Still required before first send:** create the sender identity `bill@news.mahjongtarot.com` in Brevo (Senders & IPs → Senders → Add sender). Domain authentication alone does not create a sender.

### 5.2 Warm-up wave before Send 1 (Jun 9–13)

Before sending to all 37,950, send to a small slice to build IP/domain reputation.

**Built (✅ 2026-06-03) — Brevo list 10 `OCA Warm-up Wave — June 2026 — 3000`, actual composition:**
1. 68 historical OCA buyers (the subset of the 422 that passed SMTP validation)
2. 316 from the pre-existing active 870 (Brevo list 5)
3. 55 from `oca-extra-200-most-western.csv`
4. 2,561 from the top of `oca-100000-most-western.csv` (western-scored rank used as an engagement proxy)

CSV backup: `working_files/oca-warmup-wave-june-2026.csv`.

**Honest caveat:** only the first two tiers (~384 contacts) have any proven engagement. The 2,616 most-western contacts are scored, not engagement-proven, so the warm-up's reputation signal may be weaker than a true engaged-segment warm-up. Watch the warm-up metrics closely; if opens land under ~8%, pause and reassess before Send 1.

**Warm-up email:** a softer version of Send 1 — same offer, lower-key subject (e.g. *"A quiet announcement to long-time readers"*). Gives Brevo a clean engagement signal before the main blast.

### 5.3 Staged daily batches

Send 1 and Send 2 each split across 3 days, ~12,650/day. Brevo's "staggered delivery" feature handles this automatically.

**Why:** lets us **pause sends if reputation drops mid-campaign**. A single-day blast offers no chance to react.

### 5.4 Live monitoring during sends

- Brevo dashboard open during each send day
- Stop conditions: bounce rate > 5%, complaint rate > 0.2%
- If stopped: campaign paused, problem investigated, then resumed with adjusted audience

### 5.5 Engagement-based pruning (after month 2)

By end of July (after 4 sends) Brevo will have engagement data per contact. Stakeholders approve quarterly an **engagement-based prune**:

- Contacts who haven't opened any of the last ~6 emails → moved to a "dormant" segment, not sent for 3 months
- After 3 months dormant with no engagement → suppressed entirely

This keeps the active list healthy without permanently deleting anyone (re-engagement campaigns can resurface dormant contacts).

### 5.6 Consent and unsubscribe

- Every email has a one-click unsubscribe (Brevo handles)
- Send 1 includes explicit *"you signed up at OCA — here's why you're hearing from us"* line
- Anyone who unsubscribes from any send is automatically excluded from all future sends (Brevo handles)

## 6. Audience Note — Who Is the OCA List?

37,950 SMTP-validated addresses from the Online Chinese Astrology (OCA) historical base. Most have not received an email from this brand in **months to years**.

**Implication:** treat this as a "warm-cold" list. They opted in originally but won't remember unless we tell them. Send 1 must explicitly remind them why they're hearing from us.

A `Why you're getting this` line near the top of Send 1 is non-negotiable — both ethically and to keep spam complaints below Brevo's 0.3% suspension threshold.

After Send 1 + warm-up, the list is "warmed". By Send 3 (July mid-month), it behaves like a normal engaged list.

## 7. Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | High bounce rate from stale addresses | Medium | High — could suspend account | List was SMTP-validated; warm-up wave; live monitoring with stop conditions |
| 2 | Spam complaints from forgotten signups | Medium | High — Brevo suspends > 0.3% | Marketing subdomain; clear "why you're getting this" line; warm-up first |
| 3 | Gmail/Outlook silently filter to spam folder | Medium-High | Medium — sends "land" but no one sees them | New subdomain auth (SPF/DKIM/DMARC); warm-up; staggered batches |
| 4 | Book launch URL / fulfilment not ready when Send 1 goes out | Low | High — wasted send | Confirm Bill's order page is live + tested before scheduling |
| 5 | Bill or Dave wants content changes after schedule is locked | Medium | Low | Lock content 48 hours before send; any changes push the date |
| 6 | Campaign performance disappoints | Medium | Low — informational | Post-send report after each send; learnings feed into the next |
| 7 | Credit overrun (sends > 80k in a billing cycle) | Low | Medium — Brevo blocks send | 4,100-credit buffer per month; sends scheduled with pre-check |
| 8 | Cadence fatigue — 2x/month feels too much for some subscribers | Medium | Low — natural unsubscribes | Engagement pruning §5.5; consider monthly preference center after Q1 |
| 9 | Account compromise (Brevo key + Vercel token pasted in chat) | Low | Medium | **Action**: rotate both credentials before any further work (see §9) |
| 10 | Mid-cycle upgrade may not grant extra credits until Jul 3 renewal | Unknown | High — June Send 2 impossible on 40k | Verify with Brevo before approving dates; fallback = Send 2 moves to Jul 3+ (June still fits: warm-up + Send 1 with list-10 exclusion = 37,950 ≤ 40k) |
| 11 | Warm-up engagement weaker than expected (2,616 of 3,000 are scored, not engagement-proven) | Medium | Medium — weak reputation signal before Send 1 | Warm-up metrics review gate (Jun 13–15) before Send 1 is scheduled |
| 12 | Reply flood to firepig@mahjongtarot.com — even 0.1% reply rate on ~35k = dozens of replies plus hundreds of out-of-office autoresponders | High | Low — inbox noise | Warn Bill in advance; don't use that inbox for time-critical mail during send weeks |

## 8. Success Metrics

Realistic targets for a 7-year-old re-engagement list, **first send**:

| Metric | Floor (problem) | Target | Stretch |
|---|---|---|---|
| Delivered rate | 85% | 92% | 96% |
| Open rate | 8% | 15% | 22% |
| Click rate (of delivered) | 0.5% | 1.5% | 3% |
| Bounce rate | < 5% | < 3% | < 2% |
| Complaint rate | < 0.3% | < 0.1% | < 0.05% |
| Unsubscribe rate | < 1% | < 0.5% | < 0.3% |
| Book orders attributed | — | TBD with Bill | TBD with Bill |

**Attribution mechanism:** every CTA link carries UTM parameters (`utm_source=brevo`, `utm_campaign=book-launch-send1` etc.). Orders are attributed by cross-referencing Stripe order timestamps against Brevo click data and UTM-tagged sessions. Without this tagging the "book orders attributed" metric cannot be measured — it is an action item in §9.

**Targets shift up over time** as list warms:

| Send | Open rate target | Notes |
|---|---|---|
| Send 1 (Jun 16) | 15% | Cold-warm baseline |
| Send 2 (Jun 30) | 18% | Slightly higher — riding Send 1 awareness |
| Send 3 (Jul 14) | 20% | List is now "warm" |
| Send 4 (Jul 28) | 20% | Steady state |
| Send 5+ | 20–25% | Healthy engaged-list range |

A post-campaign report is added to `docs/engineering/` after each send.

## 9. Action Items Before Send 1

Roughly in order. Owner in brackets.

- [ ] **Approve this plan** [Bill, Dave, Yon — by Jun 6]
- [ ] **Rotate Brevo API key AND Vercel API token** — both were pasted in chat history [Yon — today]
- [ ] **Verify mid-cycle upgrade credit behavior** — does 40k→80k grant credits immediately or at Jul 3 renewal? Determines whether June Send 2 needs to move to Jul 3+ [Dave or Yon — by Jun 6, BEFORE approving dates]
- [ ] **Upgrade Brevo to Standard 80k tier** [Dave or Yon — by Jun 9]
- [x] **Create sender `bill@news.mahjongtarot.com` in Brevo** [Yon — done 2026-06-03] ✅ Sender id 4, active, SPF + DKIM pass
- [x] **Postal address for CAN-SPAM footer** [done 2026-06-11] ✅ Verified in Brevo account settings: Online Chinese Astrology, Federal Way, WA 98023, US. Brevo auto-inserts it into the default campaign footer — confirm the footer block is present when building each campaign.
- [x] **Add UTM parameters to all email CTA links** [Yon — done 2026-06-11] ✅ Send 1 + warm-up drafts tagged (`utm_campaign=book-launch-send1` / `book-launch-warmup`, `utm_content` per CTA)
- [x] **Export site newsletter signups from Supabase → add to Brevo lists 9 + 10** [Yon — done 2026-06-11] ✅ 6 contacts imported; list 9 now 37,955, list 10 now 3,006. Repeat export before every send until sync layer is built [recurring]
- [x] **Verify `news.mahjongtarot.com` in Brevo + add DNS records** [Yon + Bill for DNS — by Jun 9] ✅ DONE 2026-06-03 — see [brevo-news-subdomain-setup.md](./brevo-news-subdomain-setup.md)
- [x] **Confirm book order page is live and tested** [Bill — by Jun 10] ✅ Confirmed live 2026-06-03 — URL: https://www.mahjongtarot.com/the-mahjong-mirror/order (3 SKUs: digital, hardcopy, signed+cards. Stripe checkout integrated.)
- [x] **Fix `og:image` on pre-order page** [Yon — done 2026-06-11] ✅ Order page now passes `image="/images/book-cover.webp"` + `type="book"` to the SEO component ([order/index.jsx](../../website/pages/the-mahjong-mirror/order/index.jsx)). Needs deploy via git push to go live.
- [x] **Draft Send 1 content** [Yon — done 2026-06-03] ✅ Draft at [emails/drafts/2026-06-16_send1_book-launch.md](../../emails/drafts/2026-06-16_send1_book-launch.md) — awaiting Bill's review/approval
- [ ] **Bill approves Send 1 draft** [Bill — by Jun 12]
- [x] **Build warm-up audience (~3k engaged contacts)** [Yon — done 2026-06-03] ✅ Brevo list 10 `OCA Warm-up Wave — June 2026 — 3000`, composition: 68 buyers + 316 active + 55 extra-western + 2,561 top-most-western. CSV backup at `working_files/oca-warmup-wave-june-2026.csv`.
- [x] **Draft warm-up email** [Yon — done 2026-06-11] ✅ Draft at [emails/drafts/2026-06-12_warmup_book-launch.md](../../emails/drafts/2026-06-12_warmup_book-launch.md) — includes reply-bait ("tell me your zodiac sign") for reputation building
- [ ] **Bill approves warm-up email** [Bill — ASAP; gates the warm-up send, now targeting Jun 12–16]
- [ ] **Send warm-up wave** [Yon — Jun 9–13]
- [ ] **Review warm-up metrics before proceeding** — if open rate < ~8% or complaints > 0.2%, pause and reassess Send 1 [Yon + Dave — Jun 13–15, gates Send 1]
- [ ] **Schedule Send 1 in Brevo (3-day stagger)** [Yon — Jun 15]
- [ ] **Live monitoring during Jun 16–22** [Yon primary, Dave secondary]
- [ ] **Post-Send-1 report** [Yon — by Jun 28]
- [ ] **Draft + approve Send 2 content** [Bill drafts — by Jun 26]
- [ ] **Schedule Send 2** [Yon — Jun 29]
- [ ] **Post-Send-2 report** [Yon — by Jul 7]
- [ ] **Monthly content review meeting cadence established** [Dave — by Jul 1]

## 10. What We Are NOT Doing (Out of Scope)

To keep this focused:

- ❌ Building a Supabase → Brevo sync layer for new signups (separate work, scheduled after launch)
- ❌ Newsletter signup form changes (still writes to Supabase only for now)
- ❌ Welcome / drip automations for new subscribers (after launch; needs separate sign-off)
- ❌ Sending to the 23,787 Vietnamese list (Hien's team owns that)
- ❌ Sending to the unvalidated portion of the historical OCA buyers (354 emails not yet SMTP-checked)
- ❌ Aggressive A/B testing of subject lines (saves credits; add after baseline established)
- ❌ Migrating away from Resend for transactional (Resend stays as-is)
- ❌ Bumping cadence above 2x/month before Q4 review

## 11. Costs Summary

### Monthly recurring (Brevo Standard 80k tier)

| Item | Amount |
|---|---|
| Brevo Standard 80k subscription | **~$49–65/mo** (exact at checkout) |
| Incremental vs current 40k plan | ~$15–30/mo |
| DNS for `news.mahjongtarot.com` | $0 (existing domain) |
| **Total monthly recurring** | **~$49–65/mo** |

### One-time (book launch month only)

| Item | Amount |
|---|---|
| Engineering setup (subdomain, warm-up, first 2 sends) | ~12 hours (Yon) |
| Content creation for launch | Bill's time |
| **Total one-time** | $0 cash, ~12 engineering hours |

### Annual estimate (12 months × 24 sends to ~38k each)

| Item | Year-1 |
|---|---|
| Brevo Standard 80k | $588–780/year |
| Engineering (ongoing campaign management, ~2hr/month) | ~24 hours |
| **Total Year-1** | **~$600–780 + ~36 hours engineering** |

Compare to: **one nicely-printed direct-mail postcard to 37,950 = ~$15,000–25,000**. Email is the cheapest reach you have.

## 12. Decisions Needed for Sign-Off

Five decisions stakeholders need to make for this plan to proceed:

### Decision 1 — Approve the 2 sends/month, 14-day cadence
- ☐ **Approve as-is** (Send 1 Jun 16, Send 2 Jun 30, then weeks 2 + 4 each month)
- ☐ **Approve with date shift** (specify dates)
- ☐ **Revise cadence** (specify — e.g. weekly, monthly, every 10 days)

### Decision 2 — Approve Brevo plan upgrade (Standard 40k → Standard 80k)
- ☐ **Approve** — ~$49–65/mo, enables the 2x/month cadence
- ☐ **Approve with cost ceiling** — proceed up to specified $/mo, escalate if higher
- ☐ **Reject — stay on 40k** — June still fits warm-up + Send 1 (37,950 total with the list-10 exclusion), but Send 2 must move to Jul 3+ and the ongoing cadence drops to 1 send/month

### Decision 3 — Approve the marketing subdomain (`news.mahjongtarot.com`)
- ☐ **Approve** — protects transactional reputation, industry standard
- ☐ **Reject — use bare domain** — accept reputation-coupling risk
- ☐ **Revise** — propose alternate subdomain

### Decision 4 — Approve the warm-up wave (~3,000 emails on Jun 9–13)
- ☐ **Approve** — strongly recommended for first send to old list
- ☐ **Skip** — accept higher account-suspension risk
- ☐ **Revise size or audience** — specify

### Decision 5 — Approve monthly content review cadence
- ☐ **Approve** — first Monday of each month, ~30 min, Bill + Dave + Yon
- ☐ **Approve with revision** — specify rhythm
- ☐ **Reject** — content reviewed ad-hoc, accept risk of last-minute scrambles

## 13. Sign-Off

| Stakeholder | Role | D1 | D2 | D3 | D4 | D5 | Date |
|---|---|---|---|---|---|---|---|
| Bill Hajdu | Founder / Owner | ☐ | ☐ | ☐ | ☐ | ☐ | |
| Dave | Edge8 lead | ☐ | ☐ | ☐ | ☐ | ☐ | |
| Yon | Engineering | ☐ | ☐ | ☐ | ☐ | ☐ | |

Once all five decisions are signed off, engineering proceeds with action items in §9.

---

*Document version: 2.1 — Review pass 2026-06-03: corrected June credit math to include the warm-up wave, added list-10 exclusion from Send 1, flagged unverified mid-cycle upgrade credit behavior, added sender creation / CAN-SPAM address / UTM attribution / warm-up draft+gate / Supabase signup export action items, expanded risk register (10–12), synced subject line with approved draft. Supersedes v2.0.*
