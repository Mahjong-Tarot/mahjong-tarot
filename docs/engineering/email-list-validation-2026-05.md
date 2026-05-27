# MyEmailVerifier — Full Report (all 3 batches)

**Validated:** 2026-05-26/27
**Source:** the 124,062 Western-scored emails from `oca-150k-western.csv`, split into 3 upload batches.

---

## Batch results

| Batch | In | Valid | Unknown | Invalid | Catch-all | Deliverable* |
|---|---|---|---|---|---|---|
| 1 — top 100k | 100,000 | 34,083 (34.1%) | 58,788 (58.8%) | 6,749 (6.8%) | 380 (0.4%) | **34,080** |
| 2 — extra 200 | 200 | 56 (28.0%) | 119 (59.5%) | 23 (11.5%) | 2 (1.0%) | **56** |
| 3 — second pass | 23,962 | 3,870 (16.2%) | 7,854 (32.8%) | 8,202 (34.2%) | 4,036 (16.8%) | **3,839** |
| **Total** | **124,162** | **38,009** | **66,761** | **14,974** | **4,418** | **37,975** |

*Deliverable = Valid AND non-role-based.

---

## Master deliverable list

**File:** `working_files/oca-master-deliverable.csv` — **37,950 unique deliverable emails**

(37,975 raw deliverable − 25 cross-batch duplicates = 37,950 unique)

This is the clean, send-safe list across all 3 batches. Every address was confirmed Valid by SMTP verification, non-role-based.

---

## Key findings

### 1. Second-pass list was much dirtier — as predicted

Batch 3 (the "less Western" leftovers) came back **34% Invalid** vs. only 6.8% in batch 1. Validates the Western-likeness scorer — the high-confidence Western emails really were higher quality. Still rescued 3,839 deliverable from the second pass, so it was worth running.

### 2. Yahoo "Unknown" wall persists across all batches

~67k total Unknown, overwhelmingly Yahoo (`yahoodns.net`). Yahoo blocks live mailbox verification, so these can't be confirmed either way. ~50% are likely real but the rest are auto-deleted 2008-era accounts. **Excluded from the master list** — sending to them blind would tank deliverability.

### 3. Catch-all jumped in batch 3

16.8% catch-all in the second pass (vs 0.4% in batch 1). These are mostly smaller/international domains that accept all mail. Risky — excluded from master.

### 4. Buyer overlap

Of the 422 historical OCA buyers (`oca-buyers-unique-clean.csv`), **68 are already in the master deliverable**. The other 354 buyers were never run through MyEmailVerifier — recommend validating them too (they're your highest-value cohort: actual past purchasers).

---

## Where the 124k landed

```
124,162 verified
├── 37,950  ✅ deliverable      → oca-master-deliverable.csv  (USE THIS)
├── 66,761  ⚠️ unknown (Yahoo)  → hold; ~50% real but unconfirmable
├── 14,974  ❌ invalid          → discard (guaranteed bounce)
└──  4,418  ⚠️ catch-all        → skip; per-recipient risk
```

Plus parked separately:
- `oca-150k-vietnamese.csv` — 23,787 Vietnamese (for Hien's VN-language list)
- 354 net-new historical buyers (unvalidated, recommend verifying)

---

## Recommendation

### The usable asset: 37,950 deliverable emails

That's a serious list — 4.4% of the raw 870k... no, **44x larger than the 870** currently in Brevo. It changes the scale of the whole OCA reactivation.

### But it forces an ESP/plan decision NOW

Brevo Free = 300 sends/day. Sending to 37,950 would take **~127 days** (4+ months) at that rate. That doesn't fit any launch window.

Options:
1. **Brevo paid tier** — Business plan lifts daily limits; ~40k sends/month feasible at ~$69/mo. Reaches the full list in ~1 month.
2. **EmailOctopus** — at ~38k subscribers, ~$50-65/mo, sends unmetered. The August migration we discussed becomes relevant *now* given the list size.
3. **Phase it** — reactivate the original 870 first (Jun 2-4 D-0, already scheduled), prove the audience responds, THEN scale to the 37,950 with a paid plan once you have engagement evidence.

**Strong recommendation: Option 3.** Don't import 37,950 cold contacts before the 870 reactivation proves the concept. Sequence:
1. Run D-0 to the 870 (Jun 2-4) as planned
2. Measure open/reply/bounce
3. If green → import the 37,950, pick a paid ESP, run the same reactivation at scale
4. If yellow/red → the 37,950 would have the same problem; you saved yourself a months-long mistake

### Still pending

- **Whitelist Brevo IP** `14.169.149.82` to dedup the 37,950 against the existing 870 + buyers
- **Validate the 354 net-new buyers** (separate small MyEmailVerifier batch)
- **Decide ESP/plan** before importing the 37,950 (tied to Option 3 outcome)
