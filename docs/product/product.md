# Mahjong Tarot — Product Doc

*Draft v0.1 · 2026-04-28 · written in the voice of someone who reads a lot of Dan Shipper*

If you can read this whole document and not be able to tell a stranger, in one sentence, why we'd be sad if Mahjong Tarot didn't exist, then I've failed at writing it. Everything below is in service of that sentence.

---

## 1. The thesis

**Western tarot got generic. The people who already feel the pull of Eastern divination — Chinese astrology, the Tong Shu almanac, Mahjong as oracle — don't have a serious, modern home for it. We are betting that one practitioner-author with 35 years of credibility, paired with a digital surface that respects the reader's intelligence, can become that home.**

That's the bet. Not "we're building an astrology app." Astrology apps are a commodity (Co-Star solved that). The bet is that there's a specific, underserved audience that wants Eastern systems, treated seriously, with a human voice in the room — and that Bill Hajdu is the person who makes that defensible.

If we're wrong about this, no amount of feature work saves us.

---

## 2. Who this is for — concretely

She is 38. She lives in a city. She has done therapy and meditated through an app and dabbled in the I Ching once on a long flight. She is not a "spiritual person" in the influencer sense — she's allergic to it — but she's curious about systems older than her therapist. She got married last year and her father-in-law gave the couple a Tong Shu almanac as a wedding gift; she paged through it, laughed at how earnest it was, and quietly googled "is November 14th a good day to start a business" the next month.

She tried Co-Star and uninstalled it because the push notifications were "for someone twelve years younger than me." She read Sextrology in college. She's read at least one Pico Iyer essay this year.

She is not looking for predictions. She is looking for **a practice that doesn't insult her intelligence** — something that sits in the Venn diagram of *Eastern tradition*, *intellectual seriousness*, and *modern web typography*. That space is empty. That's the user.

There are at least three people she is *not*. She is not the daily-horoscope-as-meme reader (Co-Star already serves them). She is not the Western-occult-Tarot card practitioner (a fully different vocabulary). She is not someone seeking psychic predictions about specific outcomes. We confuse her by trying to be any of those.

---

## 3. The job they're hiring us for

When I strip away what she says she wants, here's what she's actually buying: **a quiet, recurring ritual that gives her permission to take a beat before deciding things**. The almanac says today isn't great for signing contracts. She wasn't going to anyway. But now she has a frame.

If we vanished tomorrow, what does she go back to using? She goes back to nothing — back to making decisions with the same anxious churn she did before, except now she's bookmarked one good Substack on Chinese astrology she never quite reads. The "competition" isn't another product. It's the absence of a practice. That's the gap we exist to fill.

This is also why the product can't be built around predictions. If we promise outcomes, we lose the audience the moment a prediction misses. If we promise *frame*, we are useful every day.

---

## 4. The wedge

The thing that gets her through the door is not the book. It's not even Bill (yet). It's the **daily almanac and the "Find a Good Day" search**.

Why this works as a wedge:

1. **It's specific and deterministic.** Today, 2026-04-28, is a Balance day in the Year of the Fire Horse. That's not a horoscope. That's a fact. She can verify it. The product isn't asking her to believe; it's giving her a structured object.
2. **It answers a real question.** "When should we get married?" "What's a good day to launch?" Real life decisions, mapped to ancient inputs. She can share the result with her partner. That's the share loop.
3. **It compounds.** Each visit teaches her one new word in the system (the 12 Day Officers, the 5 elements, the year-conflict sign). She gets smarter inside our walls. After 30 visits she has a vocabulary nobody else has given her. That's stickiness.

Today we have ~2,000 days of almanac data through Feb 2032 and a search that maps free-text ("get married") to specific lucky activities. **This is already our wedge. We just haven't recognized it as the front door yet.**

The home page should lead with this, not with Bill's bio. Bill is who they meet on day 30, not day 1.

---

## 5. The shape of the product 12 months out

In April 2027, the member experience looks like this:

A logged-in user lands on a single-screen dashboard. The top of the screen is **today's almanac** — date, day-officer, score, a one-paragraph reading written in a voice that is unmistakably ours (probabilistic, intelligent, no em-dashes). Below that is the **personal layer** — her own day, computed from her chart. "Your year-pillar is Wood Tiger; today's day-pillar feeds it. Tailwind day for you specifically." Below that is **one thing to ask** — a single prompt the system has noticed about her week. "You haven't done a Three Blessings reading yet this season. It's a good day for it."

She comes back daily because the daily layer changes. She goes deeper because the system gradually unlocks her own chart. She tells friends because the "Find a Good Day" search produces share-able artifacts ("April 18 is the year's best day for us to elope" — one screenshot).

The book ships and is a *deepening* mechanism, not the front door. Members get the digital edition free; non-members buy it and get a member trial included.

The 1-on-1 reading practice is the **roof**, not the floor. By the time someone books an hour with Bill, they've spent 60 days in the system, they have vocabulary, and the conversation can start at minute one instead of minute thirty. Bill becomes more efficient per session. Sessions become higher leverage.

If we have done this well, the moment someone tells a friend about Mahjong Tarot is when they say: *"I've been using this thing for three months and it's the only daily app that hasn't made me stupider."*

---

## 6. What we are explicitly not building

Saying no in writing protects against drift. We are not building:

- **A horoscope-of-the-day app for general audiences.** Co-Star and TheCut already serve this; we cannot win on volume.
- **A predictive tool** ("Will I get the job?"). Probabilistic framing only. The moment we predict outcomes, we lose the user we want.
- **A wellness app.** No mood tracking, no breathwork, no journaling-with-affirmations. Adjacent and tempting. Wrong audience.
- **A dating product**, even though compatibility is one of our reading types. Compatibility is a tool inside the system; it is not a market we compete in.
- **A "social" product.** No comments, no public profiles, no shared journals. The user we want explicitly came here to think, not to be seen thinking.
- **A general AI chatbot for divination questions.** A specific, bounded AI feature inside the system, yes — open-ended chat, no.

If a feature is being designed and it would fit in any of those products, we're drifting.

---

## 7. What I believe but can't yet prove

Three load-bearing assumptions. Each one would, if false, sink the strategy.

1. **There is a real, large-enough audience for Eastern-divination-treated-seriously.** I believe this from indirect evidence (the rise of Substacks like *Cult of Mac*-style verticals, the cultural moment of Chinese-influence aesthetics, the Lunar New Year coverage in mainstream press). I have not yet validated it with a paid acquisition test. **How it dies:** we run a $2k Meta + Reddit campaign in May, get <1.5% click-through and <0.5% conversion. The audience may exist but isn't reachable at price.

2. **The almanac is a wedge, not a niche.** I believe daily almanac use can pull a non-trivial fraction of users into the deeper member experience. **How it dies:** by month 3, the cohort that signed up for the almanac never opens any other reading. We're a free utility with a paid upsell nobody buys.

3. **Bill scales as a brand without being the bottleneck.** The 1-on-1 practice is high-leverage but he's one person. We need a content engine + voice that feels like Bill without being Bill personally writing every word. **How it dies:** content quality drops the moment Bill stops writing it himself, and members notice within two weeks.

These are the three places I'd watch.

---

## 8. How we know it's working

Two numbers. If we can't pick two, we don't yet know what we're optimizing.

**Leading: D7 almanac return rate.** Of users who land on `/dashboard/almanac` in week 1, what fraction come back at least 3 times in week 2? This tells us the wedge is converting attention into ritual. Target: 35% by month 3. If we're below 20%, we don't have a wedge — we have a curiosity.

**Trailing: paid retention at month 6.** Of free trial users who convert to paid, what fraction are still paid at month 6? Subscription products are won or lost on this number. Target: 70% by Q4 2026. Anything below 50% means the product isn't actually a habit, and we'll burn through whatever audience we acquire.

We don't optimize for signups, MAU, or session length. Those are vanity for this product.

---

## 9. The next 90 days (May 1 → Aug 1, 2026)

Three concrete bets. End-states, not roadmaps.

**Bet 1 — Wedge is provable.**
By June 1: the home page leads with today's almanac (not with Bill's bio). The almanac search has been hit by 500+ unique users. We have a measurable D7 return number for the first time. *If the number is below 20%, we stop and re-examine the thesis before doing anything else.*

**Bet 2 — Founder cohort is real.**
By July 1: 100 paying founder members ($49.50). They've each used the almanac search at least 3x and completed at least one personal reading (Purple Star, Three Blessings, or Compatibility). They have email addresses we can write to monthly. They are the source of every product decision for the next 12 months.

**Bet 3 — The voice is reproducible.**
By Aug 1: daily horoscope content has been live and consistent for 90 days. We have a written voice doc that any contractor could write to. Bill personally writes ≤20% of shipped daily content. A blind-tasting test (10 paragraphs, 5 by Bill, 5 by the system) is at least 50/50 indistinguishable to a member.

That's the next 90 days. Everything else — book launch, paid acquisition, mobile app, native iOS — is downstream of these three bets.

---

## What this doc deliberately does not do

It does not include a feature backlog. It does not list integration partners. It does not have a P&L. Those exist (or should) in other documents. This one exists to answer the only question that matters when we're a year in and considering a hard pivot:

**Is the bet still the bet?**

If the answer is yes, the rest is execution. If the answer is no, the rest doesn't matter.

— *DH, with Claude, 2026-04-28*
