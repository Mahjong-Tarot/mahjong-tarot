# Sequence D — OCA Reactivation → Mahjong Mirror Launch (canonical plan)

**Owner:** Brevo Manager Agent
**Updated:** 2026-05-12
**Status:** Pre-D-0. All 3 D-0 campaigns rescheduled to Jun 2-4 and suspended pending warmup completion.

This document is the single source of truth for the Sequence D track. The persona, skills, send-log, and warmup-checklist all reference it.

---

## 1. The strategy

We're reactivating an 870-contact dormant list from Bill's old Online Chinese Astrology business, then converting the engaged subset (Responders) into book buyers for *The Mahjong Mirror*. The dormancy is the constraint: most senders die on first contact with a 4+ year stale list because Gmail / Outlook punish them for the inevitable bounces and "who?" reactions.

Two design choices keep us alive:

### 1a. Dual-domain reputation isolation

| Domain | Role | Why |
|---|---|---|
| `firepig@onlinechineseastrology.com` (sender id `2`) | **D-0 only** — the reactivation send to all 870 | Sender↔message coherence ("remember online chinese astrology?"). Absorbs any bounces / complaints / negative reputation from the dormant cold restart. This domain is *sacrificial* — Bill is winding down the OCA brand. |
| `firepig@mahjongtarot.com` (sender id `3`) | **D-Bridge → D-4** — everything for engaged Responders | Pristine, brand-aligned with the book launch. Only receives mail to people who *just replied to D-0*, so Gmail trust builds fast. Used long-term post-launch. |

### 1b. The Bridge step (inserted between D-0 and D-1)

A 7-10 day gap normally exists between D-0 send and D-1 announce. We use that gap to send a single short plain-text email from `firepig@mahjongtarot.com` to the freshly-built Responders list. Three jobs in one email:

1. **Trust transfer** — establishes the new sender domain in each Responder's Gmail "good sender" model *before* marketing content arrives.
2. **List confirmation** — implicit compliance signal (they're acknowledged, in the right list, can opt out).
3. **Anticipation** — telegraphs the upcoming book news without pitching.

Without the Bridge, the D-1 announcement is the first time `firepig@mahjongtarot.com` shows up in the inbox — and even engaged recipients may experience the domain switch as a stranger. With the Bridge, D-1 is the second message from a familiar address.

---

## 2. Schedule

All times in UTC. EDT = UTC-4 in summer; 14:00Z = 10:00am EDT = 21:00 Saigon.

| Code | Date / Time | Sender | List | Recipients | Subject (draft) | Status |
|------|-------------|--------|------|------------|------------------|--------|
| **D-0 batch 1** | Tue Jun 2, 14:00Z | OCA (id 2) | List `6` | 290 | the horse year briefly | Brevo campaign `1`, **suspended** |
| **D-0 batch 2** | Wed Jun 3, 14:00Z | OCA (id 2) | List `7` | 290 | the horse year briefly | Brevo campaign `2`, **suspended** |
| **D-0 batch 3** | Thu Jun 4, 14:00Z | OCA (id 2) | List `8` | 290 | the horse year briefly | Brevo campaign `3`, **suspended** |
| **Purge** | Mon Jun 8 (manual) | — | — | — | — | Brevo Manager Agent processes engagement data → creates new list `OCA Responders` |
| **Bridge** | Tue Jun 9, 14:00Z | MT (id 3) | `OCA Responders` | est. 50-150 | my new address — Bill | Not yet created |
| **D-1 announce** | Mon Jun 15, 14:00Z | MT (id 3) | `OCA Responders` | est. 50-150 | (TBD — Writer Agent) | Not yet created |
| **D-2 pre-order** | Wed Jul 1, 14:00Z | MT (id 3) | `OCA Responders` | est. 50-150 | (TBD) | Not yet created |
| **D-3 launch** | Mon Jul 27, 14:00Z | MT (id 3) | `OCA Responders` | est. 50-150 | (TBD) | Not yet created |
| **D-4 review nudge** | Mon Aug 10, 14:00Z | MT (id 3) | `Book Buyers` (subset) | TBD | (TBD) | Not yet created |

**D-1 date — open for revision.** Jun 15 is tight (only 6 days after Bridge, 11 days after D-0 batch 3). Push to Jun 22 if Bill wants more breathing room for the purge + bridge engagement to land. Bill confirmed Jun 15 earlier; assuming we hold there unless he changes his mind.

**Token rotation reminder.** The Brevo MCP token was pasted in chat history. Bill / Yon to revoke + regenerate at https://app.brevo.com/sso/account → SMTP & API → API Keys.

---

## 3. The copy

### 3a. D-0 — currently in Brevo (unchanged) + proposed P.S. addendum

**Current body** (in campaigns 1/2/3, identical):

```
Hi,

It's Bill Hajdu. If you signed up at Online Chinese Astrology some years back, this is me — same guy, same readings. We haven't been in touch in a long time. My fault.

I wanted to put one useful thing in your inbox before I write again. 2026 is a Fire Horse year. It shows up in the Chinese sexagenary cycle every sixty years, and historically it's when people start making decisions they've been postponing — marriages, moves, career pivots, hard conversations. The Horse pushes. The Fire makes it harder to ignore.

That's the whole email.

If you'd like to keep hearing from me — occasionally, never daily — hit reply with anything, or just open the next one. If not, I'll get the message and stop.

Bill

—
Bill Hajdu — The Firepig
mahjongtarot.com
```

**Proposed P.S. — to be inserted before the signature** (telegraphs the upcoming domain switch so the Bridge doesn't feel cold):

```
P.S. Going forward I'll write from a new address — firepig@mahjongtarot.com. Same me, fresh project. If you reply to this one, I'll add you to that list.
```

If approved, I'll update `htmlContent` on campaigns 1/2/3 to insert this paragraph before `<p>Bill</p>`. One MCP call per campaign.

### 3b. Bridge — new draft (Jun 9 send, from MT domain)

**From:** Bill Hajdu \<firepig@mahjongtarot.com\>
**Reply-to:** firepig@mahjongtarot.com
**Subject:** my new address — Bill
**To:** OCA Responders list (built Jun 8)

```
Hi {first name},

Quick one. You replied to my last email — thank you. I moved you over to my new list at The Mahjong Tarot, so this is the first message from my new address. Saving it in your contacts now means future mail from me lands where it should.

The book news goes out next week.

Bill

—
Bill Hajdu — The Firepig
mahjongtarot.com
```

Notes:
- Plain text feel, short, no marketing pitch — keeps Bridge from triggering spam filters.
- Mentions "{first name}" personalisation. Brevo attributes are FIRSTNAME on contacts that had names parsed by ZeroBounce; for unparsed contacts, default fallback should be "there" (Brevo `params` + `toField` settings).
- "Save in contacts" is the one explicit ask — proven to lift Gmail trust scores.
- "Book news goes out next week" sets expectation for D-1 without spoiling.

### 3c. D-1 opener — proposed first line

When the Writer Agent drafts D-1, the opening line should explicitly bridge from D-0:

> *Two weeks ago I wrote from Online Chinese Astrology — and you replied. Thank you. Here's what's next ...*

Rest of D-1 to be drafted by the Writer Agent into `emails/drafts/2026-06-15.md`. Brevo Manager Agent then pushes it as a campaign per the standard workflow.

---

## 4. Prerequisites — warmup gate

The Jun 2 D-0 send is gated by a 21-day sender domain warmup. See `agents/brevo-manager/context/warmup-checklist.md` for the full 3-phase plan (May 12–Jun 1).

**Decision gate:** Jun 1 evening Saigon time, Brevo Manager Agent + Bill jointly review:
- mail-tester.com score (target ≥ 9/10)
- Gmail / Yahoo / Outlook / iCloud placement (target: Inbox or Promotions tab, not Spam)
- Phase 1 reply rate (≥ 30%)

All green → Brevo Manager Agent unsuspends campaigns 1/2/3.
Yellow → unsuspend batch 1 only; observe stats before batches 2 and 3 fire.
Red → keep suspended, extend warmup 2 weeks, push D-1 from Jun 15 → Jun 29.

---

## 5. Purge logic (Jun 8)

The purge is what turns "1 of 870 dormant contacts" into "1 of N engaged Responders". On Jun 8 morning Saigon, the Brevo Manager Agent will:

1. Pull `email_campaign_management_get_email_campaign` for campaigns 1, 2, 3 — `globalStats`.
2. Pull `campaign_analytics_get_email_event_report` for `event=opened`, `event=clicks`, `event=unsubscribed`, `event=hardBounces`, `event=softBounces`, `event=spam` across all 3.
3. Define Responder = (opened OR clicked OR replied) AND NOT (unsubscribed OR complained OR hard-bounced).
   - "Replied" is the gold signal but isn't captured in Brevo's open/click data — Brevo Manager Agent cross-references `firepig@onlinechineseastrology.com` inbox if reply tracking can be set up. For Sequence D MVP, fall back to opened-or-clicked as the proxy.
4. Create new list `OCA Responders` in Brevo (folder 1).
5. Add responder contact IDs to that list.
6. Remove hard-bounces and complaints from the original list (don't email them again).
7. Log to `send-log.md` with response counts.

Outputs to log: total Responders count, breakdown by signal type, contacts deleted for bounces/complaints.

---

## 6. What's implemented vs. what's pending

### Implemented
- [x] Brevo MCP wired up (282 tools, IP whitelist live)
- [x] Sender id 2 (OCA) — verified, domain authenticated
- [x] Sender id 3 (MT) — verified, domain authenticated
- [x] D-0 campaigns 1/2/3 — created, rescheduled Jun 2-4, suspended
- [x] D-0 campaigns 1/2/3 — htmlContent updated with P.S. addendum (2026-05-12)
- [x] Lists 6/7/8 — 290 contacts each, populated
- [x] Bridge campaign id `4` — drafted, sender id 3, placeholder list 2 (re-point after purge)
- [x] 4 × `brevo-preview-*` scheduled tasks created (48h pre-flight reviews for batches 1/2/3 + Bridge)
- [x] Warmup checklist written (incl. Phase 2b MT domain warmup)
- [x] This plan doc written

### Pending — Bill / Yon approval needed
- [ ] **Approve D-0 P.S. addendum** copy (section 3a). If approved, I update campaigns 1/2/3 htmlContent.
- [ ] **Approve Bridge subject + body** copy (section 3b). If approved, I create the Bridge campaign as a Brevo draft (status `draft`, no schedule yet — schedule on Jun 8 after purge runs).
- [ ] **Confirm D-1 date** — Jun 15 (default) or Jun 22.
- [ ] **Rotate the Brevo MCP token** (pasted in chat history → compromised).
- [ ] **Phase 1 warmup execution** (May 12–18) — Bill sends 5 plain-text personal emails/day from `firepig@onlinechineseastrology.com`. See `warmup-checklist.md`.

### Pending — Brevo Manager Agent next runs
- [ ] (After approval) Update campaigns 1/2/3 htmlContent with P.S. addendum.
- [ ] (After approval) Create Bridge campaign draft in Brevo (no schedule).
- [ ] (Jun 1 evening) Run inbox-placement decision gate → unsuspend D-0 if green.
- [ ] (Jun 8 morning) Run purge logic, create `OCA Responders` list.
- [ ] (Jun 8 evening) Schedule Bridge campaign for Jun 9 14:00Z.
- [ ] (Jun 10) Confirm Bridge sent, check delivery + open rates.
- [ ] (Jun 14 evening) Receive D-1 draft from Writer Agent → push as Brevo campaign → schedule Jun 15 14:00Z.

### Scheduled tasks already created
- `oca-d1-book-announcement-prep` — fires Mon Jun 1 09:00 Saigon, first checks whether D-0 actually went out before drafting D-1.

(Old task `oca-v1-batch1-results-check` was removed May 3; will need a new equivalent for Jun 3 morning to check batch 1 stats before batches 2-3 fire.)

---

## 7. Risks and stop conditions

| Risk | Trigger | Response |
|---|---|---|
| Warmup fails Phase 3 | mail-tester < 7 OR Gmail goes Spam on Jun 1 test | Keep campaigns 1/2/3 suspended. Push D-0 by 2 weeks → Jun 16-18. Cascade D-1 to Jun 29. |
| D-0 batch 1 generates > 0.3% complaints | Reported in batch 1 stats Jun 3 morning | Suspend batches 2 + 3 immediately. Review complaint reasons. May indicate list quality worse than ZB suggested. |
| Responders count < 20 after purge | Jun 8 morning | Bridge + D-1 still viable but volume too small for the book launch ROI Bill is targeting. Discuss with Bill whether to extend D-0 reach or add a new acquisition channel. |
| Bridge generates > 5% unsubscribes | Bridge stats Jun 10 | Don't send D-1 to that list. Treat as signal the brand transition failed; rethink. |
| Token rotation forgotten | Indefinite | Token sits in chat history. Risk of unauthorized Brevo access. Address ASAP. |

---

## 8. Where to look

- Daily / per-action log: `agents/brevo-manager/context/send-log.md`
- Warmup execution: `agents/brevo-manager/context/warmup-checklist.md`
- Operating rules / account context: `agents/brevo-manager/context/persona.md`
- Skill that orchestrates this sequence: `agents/brevo-manager/skills/oca-reactivation-sequence/SKILL.md`
- Original campaign strategy doc (high-level, pre-Brevo): `working_files/Mirror-campaign-plan.md`
