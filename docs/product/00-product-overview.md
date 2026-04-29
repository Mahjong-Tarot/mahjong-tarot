# The Mahjong Tarot — Product Overview

**Domain:** mahjongtarot.com
**Stack:** Next.js (Pages Router) · React · Supabase · Vercel
**Practitioner:** Bill Hajdu (35 years)
**Owner:** Dave Hajdu
**Last updated:** 2026-04-28

---

## One-sentence why

Eastern divination — Chinese astrology, the Tong Shu almanac, Mahjong as oracle — does not have a serious modern home. Bill's 35-year practice plus a digital surface that respects the reader's intelligence is the bet to become that home.

The full step-back vision is in [`product.md`](./product.md).

---

## Audience

She is 38, lives in a city, has done therapy and meditated through an app. Allergic to influencer-spirituality. Curious about systems older than her therapist. She uninstalled Co-Star because the push notifications were "for someone twelve years younger."

She is **not** the daily-horoscope-as-meme reader, the Western-occult-Tarot practitioner, or someone seeking psychic predictions. Confusing her by trying to be any of those is a failure mode.

---

## Job-to-be-done

> A quiet, recurring ritual that gives her permission to take a beat before deciding things.

The competition is not another product. It is the **absence of a practice**. We exist to fill that gap with something probabilistic, intelligent, and culturally specific.

---

## The wedge

**Today's almanac + "Find a Good Day" search.**

- Specific and deterministic. Today is a Balance day in the Year of the Fire Horse. That is a fact, not a horoscope.
- Answers a real question. "When should we get married?" "What's a good day to launch?" Maps real-life decisions to ancient inputs.
- Compounds. Each visit teaches one new word in the system. After 30 visits she has a vocabulary nobody else has given her.

We have ~2,000 days of almanac data through Feb 2032 already in the database.

---

## Twelve-month shape

A logged-in user lands on a single-screen dashboard:

1. **Today's almanac** — date, day-officer, score, one-paragraph reading in our voice
2. **Personal layer** — her own day, computed from her chart
3. **One thing to ask** — a single prompt the system has noticed about her week

The book ships as a *deepening* mechanism (not the front door). The 1-on-1 reading practice is the roof, not the floor.

---

## How we know it's working

Two numbers only.

| Metric | Definition | Target |
|---|---|---|
| **D7 almanac return rate** (leading) | Of users who land on `/dashboard/almanac` in week 1, fraction who return ≥3 times in week 2 | 35% by month 3 |
| **Paid retention at month 6** (trailing) | Of free trial users who convert to paid, fraction still paid at month 6 | 70% by Q4 2026 |

We do not optimise for signups, MAU, or session length. Those are vanity for this product.

---

## What we are explicitly not building

- A horoscope-of-the-day app for general audiences (Co-Star/TheCut serve this)
- A predictive tool ("Will I get the job?")
- A wellness app (no mood tracking, breathwork, journaling)
- A dating product
- A social product (no public profiles, comments, shared journals)
- An open-ended AI chatbot for divination questions

If a feature would fit in any of those, we are drifting.

---

## Three load-bearing assumptions

Each one would, if false, sink the strategy:

1. There is a real, large-enough audience for Eastern-divination-treated-seriously.
2. The almanac is a wedge, not a niche — it pulls users into deeper member experience.
3. Bill scales as a brand without being the bottleneck.

Validation tests for each are in [`product.md`](./product.md) §7.

---

## Where to read next

- [Product step-back vision](./product.md) — the load-bearing strategy doc
- [Epics](./epics.md) — thematic bundles of work
- [Epic Status](./epic-status.md) — at-a-glance dashboard
- [Product Timeline](./01-product-timeline.md) — phased roadmap
