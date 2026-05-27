# MyEmailVerifier — Batch 1 Report (100,000 emails)

**Source file:** `~/Downloads/oca-100000-most-western_all.csv`
**Validated:** 2026-05-26
**Total rows in:** 100,000 emails (the top-Western-scored subset of `oca-150k-western.csv`)

---

## Headline numbers

| Bucket | Count | % | Sendable? |
|---|---|---|---|
| **Valid** | **34,083** | 34.08% | ✅ Yes — clean deliverable |
| Unknown | 58,788 | 58.79% | ⚠️ Risky — most are unverifiable Yahoo accounts |
| Invalid | 6,749 | 6.75% | ❌ No — guaranteed bounce |
| Catch-all | 380 | 0.38% | ⚠️ Domain accepts everything; per-recipient risk |
| **Total** | **100,000** | 100.00% | |

Real deliverable yield: **~34,080 emails** (34%). Below original 40-60% estimate — MyEmailVerifier marked a lot as Unknown rather than picking Valid/Invalid for ambiguous Yahoo addresses.

---

## Why so much "Unknown"

Look at the MX provider breakdown:

| MX provider | Count | Share |
|---|---|---|
| **yahoodns.net** | 60,784 | 60.78% |
| outlook.com | 18,372 | 18.37% |
| google.com | 18,308 | 18.31% |
| comcast.net | 550 | 0.55% |
| openwave.ai | 312 | 0.31% |
| bigpond.com | 289 | 0.29% |
| cloudfilter.net | 198 | 0.20% |
| icloud.com | 191 | 0.19% |
| atmailcloud.com | 160 | 0.16% |
| earthlink-vadesecure.net | 148 | 0.15% |

**~61% of the list is Yahoo.** Yahoo's SMTP servers haven't accepted real-time mailbox verification queries for ~3 years now (since they tightened anti-validation defenses in 2023). Every verification service hits a wall on Yahoo. The 58,788 Unknowns are almost entirely Yahoo addresses — MyEmailVerifier can't tell you whether they're real because Yahoo refuses to answer the question.

Industry consensus on Unknown-Yahoo handling:
- **~50-60% will actually be deliverable** if you sent to them
- **~40-50% will hard-bounce** because Yahoo deletes accounts after 12 months of inactivity (this list is from 2008-2012 OCA buyers — most will have been auto-deleted)
- **No way to know which is which without sending and observing**

---

## Quality details

| Metric | Value |
|---|---|
| Role-based (info@, sales@, admin@) | 18 (0.02%) — negligible |
| Free-domain (gmail/yahoo/hotmail/aol/etc.) | 99,681 (99.68%) — heavily consumer |
| Catch-all domains | 380 (0.38%) — low |
| Invalid syntax / hard-fail | 6,749 (6.75%) |

The 99.68% free-domain rate confirms this is a **consumer reactivation list**, not B2B. Good for OCA → book launch.

---

## Output files

| File | Rows | Use case |
|---|---|---|
| `oca-100000-deliverable.csv` | 34,080 | ✅ **Send to these.** Confirmed Valid + non-role-based. Ready for import to Brevo (or whatever ESP). |
| `oca-100000-unknown.csv` | 58,788 | ⚠️ Yahoo-dominated. Don't blanket-send — would torch your domain reputation. See "Recommended treatment" below. |
| `oca-100000-catchall.csv` | 380 | ⚠️ Skip for now. Catch-all domains accept everything; per-recipient validity is unknown. |

Invalid (6,749) and role-based (18) are discarded automatically.

---

## Recommended treatment of the Unknown bucket

Three honest options:

### Option A — Drop them entirely (safest)
- Final list: 34,080 deliverable
- Cost: lose 58k potential Yahoo subscribers from 2008-2012 era
- Risk: zero

### Option B — Validate again with a different tool
Some verifiers handle Yahoo differently. Worth running the Unknown bucket through:
- **Bouncer** (~$0.005/email) — uses live SMTP probes; handles Yahoo slightly better
- **Kickbox** (~$0.008/email) — strong Yahoo coverage via behavioral inference
- **NeverBounce** (~$0.008/email)

Cost on 58,788: $290-470. Might rescue 10-20k more deliverable emails.

### Option C — Phased seed send (highest value, highest risk if mishandled)
1. Take a small random sample (200-500 Unknowns)
2. Send a single low-risk message (the same D-0 "the horse year briefly" template)
3. Watch the bounce rate
   - **If bounce rate ≤ 8%:** the Unknown bucket is mostly real — send to all 58k in batches of 500/day over a few weeks
   - **If bounce rate 8-20%:** marginal — consider re-validating with a different tool first
   - **If bounce rate > 20%:** drop them; the 2008-era Yahoo accounts are gone

This is the most accurate way to know — but it must happen on a **separate sub-domain** so the high bounce rate doesn't poison your main domain reputation. Risky to do on `firepig@onlinechineseastrology.com` directly.

---

## My recommendation

**Take the 34,080 deliverable list and move forward.** That's a strong list — confirmed Valid by SMTP verification, non-role-based, 99.7% free consumer domains, predominantly US (yahoo + gmail + outlook + msn). That's exactly the OCA reactivation audience.

The 58k Unknowns are a "free option" — you can come back to them later via Option B or C if the 34k campaign performs well and you want to expand. No need to act on them now.

For batch 2 (the remaining 23,962 in `oca-second-pass-western.csv` and the 200 in `oca-extra-200-most-western.csv`), upload to MyEmailVerifier the same way once your credits refresh.

---

## Next steps in your Sequence D workflow

1. **Whitelist current IP at Brevo** (`14.169.149.82` at https://app.brevo.com/security/authorised_ips) — still blocking REST API access from this machine.
2. **Dedup the 34,080 deliverable against existing Brevo list 5 (870 already imported)** — will likely show ~870 overlap or close to it; net new ~33,000-34,000.
3. **Dedup against `oca-buyers-unique-clean.csv` (422 buyers)** — small overlap expected.
4. **Decide: import to Brevo now, or hold for post-D-0?**
   - Importing now = boost your D-0 reach from 870 → 34,000+ contacts
   - But this list hasn't been re-permissioned; if the dormant 870 send (Jun 2-4) goes well, you have evidence the audience remembers OCA. Then you can scale to the 34k with the same reactivation strategy.
   - Caveat: Brevo Free plan has no subscriber cap but the 300/day send rate makes a 34k campaign run ~3.5 months. Need a paid plan or different ESP to reach 34k inside a launch window.

This is your decision. The clean list is sitting in `working_files/oca-100000-deliverable.csv`, ready when you are.
