date: 2026-05-13
name: Yon

## Today's focus
- Send Phase 1 OCA warmup emails (5 plain-text personal emails from `firepig@onlinechineseastrology.com`) to begin sender-domain warmup for the Mahjong Mirror launch sequence
- Reply to any incoming replies same day — the reciprocity loop is the actual reputation signal
- Curate the warmup recipient list across providers (Gmail, Yahoo, Outlook, iCloud) for downstream inbox-placement testing

## Notes
Heavy infrastructure day on May 12 — full Sequence D plan now implemented end-to-end:

**Brevo MCP wired up.** Installed at user scope; surfaced 282 tools after fixing an IPv6 whitelist issue (Brevo silently filters `tools/list` to zero on un-whitelisted IPs). New IPs authorized: `2405:4802:980f:a090::/64` + `118.68.21.204`.

**Dual-domain reputation strategy adopted.** D-0 reactivation sends from sacrificial `firepig@onlinechineseastrology.com`. D-1 onwards (book launch) from pristine `firepig@mahjongtarot.com`. Added Bridge step Jun 9 to transfer trust between the two senders before marketing content arrives. Updated copy: D-0 P.S. addendum telegraphs the upcoming switch.

**Sender id 3 (`firepig@mahjongtarot.com`) verified** and `mahjongtarot.com` domain authenticated via Vercel DNS — DKIM `brevo1/brevo2`, DMARC `p=none`, brevo-code TXT, merged SPF `v=spf1 include:_spf.google.com include:spf.brevo.com ~all`.

**D-0 campaigns rescheduled** from May 19-21 → Jun 2-4 14:00Z (10am EDT) and re-suspended. Warmup must pass an inbox-placement decision gate on Jun 1 before they unsuspend.

**Bridge campaign 4 drafted** (sender id 3, placeholder list 2 — to be re-pointed to OCA Responders after Jun 8 purge).

**New canonical docs** at `agents/brevo-manager/context/`:
- `sequence-d-plan.md` — single source of truth for the campaign
- `warmup-checklist.md` — 3-phase 21-day plan (Phase 1 OCA + 2b MT + 3 inbox test)
- `warmup-templates.md` — Bill's-voice subject lines and openers
- `send-log.md` — full audit trail of all actions

**Hard rule added (persona §7):** every scheduled send pairs with a `brevo-preview-*` task firing 48h prior — test-sends to dhajdu+yon, displays body, asks for approval. Never let a scheduled campaign fire without 48h preview.

**Scheduled tasks queued:**
- `firepig-warmup-daily` — fires 10am Saigon daily, posts phase/day/openers, auto-disables Jun 8
- `brevo-preview-d0-batch1/2/3` — 48h pre-flight reviews (May 31 / Jun 1 / Jun 2 at 21:00 Saigon)
- `brevo-preview-bridge` — 48h pre-flight (Jun 7 21:00 Saigon)
- `brevo-d0-decision-gate` — Mon Jun 1 18:00 Saigon, classifies warmup GREEN/YELLOW/RED, unsuspends or pushes +14 days

**PR #203 merged to main** (commit `d41cd2a`) — `brevo-manager: Sequence D dual-domain plan + warmup automation`.

**Still pending (not blocking today):** Brevo MCP token sits in chat history — should be rotated at https://app.brevo.com/sso/account → SMTP & API → API Keys.

## Blockers
None
