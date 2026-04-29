# The Mahjong Tarot — Epics

**Last updated:** 2026-04-28

These are thematic bundles of work, each with a thesis, the components inside the bundle, the mechanism by which it earns its place in the product, and the success criterion that says "this epic is done." Epics are not a sprint backlog — they are how we group features so we can reason about them at the level of strategy, not tickets.

For the load-bearing strategy these epics serve, read [`product.md`](./product.md).

---

## E1 · Daily Almanac

**Thesis:** The almanac is the front door. If it does not work as a daily ritual, nothing downstream matters.

**Bundle:**
- Today's date with day-officer, score, element pillar
- One-paragraph reading in our voice
- Yesterday/tomorrow chevrons for casual browsing
- "Why this score?" expandable explanation

**Mechanism:** Specific and deterministic content. Visitors verify the system; they do not have to believe it. Each visit teaches one new word in the system.

**Success criterion:** D7 return rate ≥ 35% by month 3 of phase 1.

---

## E2 · Find a Good Day

**Thesis:** The almanac is browse-shaped. "Find a Good Day" is intent-shaped — and intent converts.

**Bundle:**
- Free-text query box ("get married," "launch a business," "have a difficult conversation")
- Mapping from query → activity rules → date scoring
- Result page with shareable artifact ("April 18 is the year's best day for us to elope")
- Calendar download (.ics) for chosen date

**Mechanism:** Real-life decisions mapped to ancient inputs. The result is share-able with a partner, which creates the share loop that beats paid acquisition.

**Success criterion:** ≥ 500 unique users hit the search by June 1, 2026; ≥ 10% of result pages are shared (download, link copy, screenshot).

---

## E3 · Personal Pillar Layer

**Thesis:** The almanac is the same for everyone. The personal layer is what someone signs up for. Without it, we are a free utility.

**Bundle:**
- Birth-data capture (DOB, time, place — optional time)
- Year-pillar / day-pillar / month-pillar computation
- "Your day" reading — how today's almanac interacts with their pillars
- Year-conflict / harmony flags

**Mechanism:** The personalised reading is what justifies the subscription. The almanac gets her in the door; her own chart keeps her there.

**Success criterion:** ≥ 60% of paid users have completed birth-data capture by phase 4 close.

---

## E4 · Readings Catalogue

**Thesis:** Once a user has a chart, she returns for *occasions* — not just daily check-ins. Readings are the occasion shape.

**Bundle:**
- Purple Star (Zi Wei Dou Shu) reading
- Three Blessings reading
- Compatibility reading (between two charts)
- "What this reading is and is not" copy on every reading page

**Mechanism:** Each reading is a structured artifact she can revisit and share. Readings deepen the vocabulary the system has been quietly teaching since day 1.

**Success criterion:** ≥ 70% of paid users complete ≥ 1 personal reading within 14 days of signup.

---

## E5 · Voice & Content Engine

**Thesis:** Bill cannot personally write every word forever. The voice has to be reproducible by a contractor or a model and still feel like Bill.

**Bundle:**
- Written voice doc (probabilistic framing, intelligent, no em-dashes, the cadence)
- Daily horoscope content pipeline (writer agent → designer → web-developer → publish)
- Blog post pipeline for thematic essays
- Blind taste test rig (10 paragraphs, mixed Bill/system, can a member tell?)

**Mechanism:** A reproducible voice is what unlocks a scaled brand without making Bill the bottleneck. The 1-on-1 practice is high-leverage; the daily content is what sustains the surrounding habit.

**Success criterion:** Bill personally writes ≤ 20% of shipped daily content for 90 days running. Blind taste test ≥ 50/50.

---

## E6 · Founder Cohort & Subscription

**Thesis:** The first 100 paying members are not a revenue line. They are the source of every product decision for the next 12 months.

**Bundle:**
- Founder pricing tier ($49.50)
- Onboarding that captures birth data + first reading completion
- Direct email channel (monthly founder-only letter from Bill)
- Founder-only feedback surface (typeform / in-product)

**Mechanism:** A small, named, opinionated cohort is a leading indicator of fit. Their week-2 behaviour predicts month-6 retention.

**Success criterion:** 100 founders converted by July 1, 2026; each has used the almanac search ≥ 3 times and completed ≥ 1 personal reading.

---

## E7 · Book Integration

**Thesis:** The book is a deepening mechanism, not the front door. Members get the digital edition free; non-members buy it and get a member trial.

**Bundle:**
- Digital edition reader (web-based, member-gated)
- Cross-references from book chapters to live readings
- Book-promo flow for non-members (sample → purchase → trial)
- Print edition fulfilment integration

**Mechanism:** The book turns one-time book buyers into trial members; it turns trial members into committed members because the digital edition unlocks features in the live product.

**Success criterion:** ≥ 30% of book buyers start a member trial; ≥ 20% of trials convert to paid.

---

## E8 · 1-on-1 Practice Layer

**Thesis:** Bill's 1-on-1 practice is the roof, not the floor. By the time someone books, they have spent 60 days in the system and the conversation starts at minute one.

**Bundle:**
- In-product booking surface (calendar, payment)
- Pre-session brief generated from member's chart + recent readings
- Post-session note capture and follow-up reading
- Cohort summary for Bill (what's coming up this week)

**Mechanism:** Pre-loading the conversation makes Bill more efficient per session and the session more valuable per dollar. This is the high-margin layer.

**Success criterion:** Average session prep time for Bill drops from ~30 min to ≤ 10 min; member NPS for sessions ≥ 70.

---

## E9 · Share & Acquisition Loop

**Thesis:** The share loop is "Find a Good Day" producing screenshot-able artifacts. Paid acquisition is a top-up, not the engine.

**Bundle:**
- OG image generator for "Find a Good Day" results
- Branded share cards for personal readings
- Referral mechanic (founder gets 1 month free for each invited member)
- Light paid acquisition budget for testing audience reachability

**Mechanism:** The audience must be reachable cheaply or the strategy collapses. We test paid early to falsify assumption #1, but we lean on share loops as the durable engine.

**Success criterion:** Test campaign ($2k budget, May 2026) achieves CTR ≥ 1.5% and conversion ≥ 0.5%; share loop accounts for ≥ 30% of paid signups by Q4 2026.

---

## E10 · Member Dashboard

**Thesis:** The dashboard is the surface where almanac, personal layer, and "one thing to ask" live together. It is the daily-return surface.

**Bundle:**
- Single-screen layout (almanac top → personal layer middle → one prompt bottom)
- Notification rules (email/push) for "one thing to ask"
- Recent-readings rail
- Streak / vocabulary-learned counter (subtle, not gamified)

**Mechanism:** The dashboard is what makes the daily ritual concrete. Everything else is content; this is the place where the habit lives.

**Success criterion:** ≥ 50% of paid members visit the dashboard ≥ 5 days/week by Q4 2026.

---

## What we are not bundling

- No "horoscope feed" epic — we serve specific people, not general audiences
- No "social" epic — no public profiles, no comments, no shared journals
- No "wellness" epic — no mood tracking, no breathwork, no affirmations
- No "AI chatbot" epic — bounded AI inside readings only, no open-ended divination chat

If a feature is being designed and it would fit better in any of those bundles, we are drifting.

---

## How epics map to phases

| Phase | Primary epics |
|---|---|
| 1 — Wedge | E1, E2, E10 (almanac surface), E5 (initial voice) |
| 2 — Founder cohort | E6, plus E1/E2 polish |
| 3 — Voice engine | E5 (full pipeline + blind taste) |
| 4 — Personal layer | E3, E10 (dashboard upgrade) |
| 5 — Readings depth | E4 |
| 6 — Book + 1-on-1 | E7, E8, E9 (share loop matures) |

Epic status glyphs and percent-done estimates live in [`epic-status.md`](./epic-status.md).
