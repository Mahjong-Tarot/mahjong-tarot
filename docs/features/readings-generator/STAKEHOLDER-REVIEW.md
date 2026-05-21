# Quick Reading Email Tool — For your approval

**For:** Bill Hajdu, Dave Hajdu
**From:** Yon
**Date:** 2026-05-20

---

## What you're approving

A new page inside the portal where Bill can type in a customer's
name + birth info, click a button, and the readings the website
already produces land in Bill's inbox (or wherever he asks).

That's the entire feature.

---

## Why we're building it

Today, when Bill takes a live Zoom call for a Mahjong Mirror
reading, he's flipping between 4–5 tabs — Bazi calculator, almanac
page, horoscope page, etc. — and re-typing the customer's birth
info into each one. That's friction, error-prone, and slows the
flow during a paid consultation.

This tool collapses all of that into one form. One submission.
One email. Bill walks into every call with everything in front of
him.

---

## What Bill will see

A new page in the portal called **Quick reading**:

```
┌────────────────────────────────────────────────────┐
│ Generate a reading                                  │
├────────────────────────────────────────────────────┤
│ Customer name        [ Sarah Chen          ]        │
│ Date of birth        [ 1989-03-14         ]         │
│ Time of birth        [ 07:22  ]  (optional)         │
│ Place of birth       [ San Francisco, CA  ] (opt)   │
│ Gender               [ Female ▾ ]  (optional)       │
│ Consultation date    [ 2026-05-20 ]  (defaults today)│
├────────────────────────────────────────────────────┤
│  [ Email to me ]    [ Email to another address ]    │
└────────────────────────────────────────────────────┘
```

Bill types. Bill clicks. Done.

---

## What lands in the email

A single, beautifully-formatted email containing **every reading
the site already produces** for that birth data:

1. **Bazi snapshot** — Four Pillars chart, element balance, dominant element
2. **Zi Wei summary** — 12-palace chart, current Big Limit highlighted
3. **Three Blessings** — when applicable to the chart
4. **Almanac for the consultation date** — auspicious / inauspicious activities
5. **Daily horoscope** — Chinese zodiac (primary) + Western zodiac

Same Mahjong Tarot branding as the existing session-report emails.
Looks professional. Forwardable. Printable.

---

## Who can use it

- **Bill** (astrologer role)
- **Dave + Yon** (admin role)

Not visible to regular customers.

---

## What this doesn't do

So expectations are clear:

- ❌ Doesn't save anything to the database — every submission is a one-shot email
- ❌ Doesn't connect to existing client records (you type the birth info each time)
- ❌ Doesn't send to the customer directly (only to Bill, or whoever Bill specifies)
- ❌ Doesn't charge anything — no Stripe, no payment
- ❌ Doesn't replace the existing session → report → email flow

If we want any of the above later, separate feature.

---

## Effort + timeline

- **~2–3 hours of engineering** once you approve
- **1 pull request, 1 merge**
- **Ships same day** as approval

---

## What I need from you

Reply with one of:

- **"Approved — ship it"** → I build immediately and Bill is using it within hours
- **"Approved with changes: ..."** → I tweak then ship
- **"Hold — let's talk"** → we schedule a quick chat

---

*Detailed engineering spec lives at
`docs/features/readings-generator/SPEC.md` if you want to read it.
You don't need to.*
