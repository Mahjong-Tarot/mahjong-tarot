# Purple Star Report — Generate from Local Data

**Status:** PLAN for review — nothing built yet
**Date:** 2026-06-04
**Author:** Claude (with Dave)
**Owner of content:** Bill Hajdu (40-yr practitioner; star naming + voice are his)

---

## 1. The problem

Purple Star (Zi Wei Dou Shu) is the **only** reading on the site with no
local-data interpretation layer. [`lib/purpleStar.js`](../../../website/lib/purpleStar.js)
computes the *chart skeleton* (which stars land in which palace, via the `iztro`
package) and returns **zero interpretation text**. Two surfaces fill that vacuum
with content that isn't Bill's:

1. **Private-reading generator** — [`api/admin/generate-reading.js`](../../../website/pages/api/admin/generate-reading.js)
   is the only LLM call in the site. Its prompt asks Claude for *"the Bazi / Zi
   Wei reading,"* but the brief it's handed ([`lib/readingBrief.js`](../../../website/lib/readingBrief.js))
   contains **only Bazi** — zero Zi Wei. Claude invents the Purple Star half from
   training knowledge. **This is the "making things up."**
2. **Member page** — [`member/dashboard/readings/purple-star.jsx`](../../../website/pages/member/dashboard/readings/purple-star.jsx)
   shows the real chart but pairs it with hardcoded generic `PALACE_MEANINGS`
   blurbs, plus `iztro`'s idiosyncratic star nicknames (`emperor`, `wolf`,
   `judge`, `money`) — not Bill's names, not Bill's interpretations.

Every other reading is already deterministic and data-driven:
`compatibility.js` → `data/love-secrets.json`; `three-blessings.js` → inline
tables; `fire-horse-forecast.js` → `data/fire-horse/`. Purple Star needs the
same treatment — but stored in the **database** (Dave's call: single source of
truth, no ambiguity between the 5 near-duplicate Excel files).

---

## 2. What we're building

A **Purple Star Luck Report** generated entirely from local data:

- **Deterministic core** — compute the chart, classify each star's luck from its
  brightness, score & rank palaces / decades / years, and look up Bill's authored
  narratives. No invention.
- **Bill's voice** — the report reads like a **weather forecast** (his words):
  probabilistic not fatalistic ("≈75–80% chance of a high position"),
  cross-checked across palaces, leaving room for free will. No "winner/loser"
  decrees.
- **Bill's star names** — his in-progress re-naming of the stars, authored into
  the DB, with graceful fallback for the ~30 not yet named.
- **Constrained, reviewable LLM polish** — an optional pass that only smooths
  prose; forbidden from adding any claim, and never auto-shipped.

---

## 3. Source material

All under `docs/architecture/readings/`:

| File | Role | Use |
|---|---|---|
| `Purple-Star-Luck/Purple Star Luck - MergedUpdated.xlsx` | **Recommended canonical** narrative DB (9 core sheets + 2 monthly) | ETL → DB |
| `PurpleStar/Purple Star Review Notes.docx` | Bill's QA of the original prototype = **de-facto spec** | algorithm rules |
| `Purple-Star-Luck/Purple Star Houses.docx` | Per-palace trait bank by luck level (VL/L/Mixed/UL/VUL) | polish grounding |
| `PurpleStar/Purple Star Luck Reading-sample-1.doc`, `Purple Star ReadingSH1.doc` | Gold output samples | **calibration** |
| `Star Notes word.docx` (Dave's Downloads) | Bill's star re-naming + philosophy | naming + voice |

**Canonical source:** `MergedUpdated.xlsx` and `Merged yon.xlsx` are the fullest
(both have the monthly sheets); `Final Excel.xlsx` and `PurpleStar/Merged.xlsx`
are older (no monthly). **Recommendation:** use `MergedUpdated.xlsx`; in PR1 diff
it against `Merged yon.xlsx` and flag any cell-level differences before ETL.
⚠️ The monthly sheets ("Months 2012 Dragon/Snake") are near-empty (~112 chars) —
month-level forecast data effectively does not exist (see §6, deferred).

### The 9 narrative sheets

| Sheet | Rows | Keyed by | Provides |
|---|---|---|---|
| `Stars` | 37 | romanization | star dictionary (Chinese → Kwok Man-Ho English → Major/Minor) |
| `Luckiest_Palcace` | 15 | palace | narrative when this is your luckiest / unluckiest palace |
| `Luckiest_Time_Period` | 13 | decade # | narrative for luckiest / unluckiest decade |
| `Major-Minor_Stars` | 36 | luck-code combo (VL/L/U/VUL ×3) | the **scoring engine** — narrative per star-luck combination, across Decade/Year/ThisYear/Month × Major/Minor |
| `Decade_Yun` | 11 | decade # + Yun rating | decade fortune narrative |
| `Decade_Start_Narrative` | 18 | auspiciousness | how a decade starts (templated, "Lucky ages are XXXX") |
| `Year_Descriptions` | 117 | age bucket | per-age narrative by luck category |
| `Palace_Conclusion` | 14 | palace + luck category | the conclusion paragraph per palace |
| `Next Year` | 8 | luck rating | next-12-months forecast |

Total narrative text ≈ 246 KB → fits one seed migration (under the ~540 KB SQL-editor limit).

---

## 4. The star-identity layer  *(synthesis + recommendation)*

### 4.1 What Bill's notes change

Bill **rejects** the standard Western translations. The English names in the old
`Stars` sheet are **Kwok Man-Ho's 1987 book** ("Pure Virtue", "Heavenly Secret",
"Greedy Wolf") — exactly what he calls "pitiful." He is re-deriving each name
from the original Chinese character etymology + the star's Imperial-Court /
Five-Elements **role**. This is an **active authoring project**, very early:

| Star | hanzi | Old (Kwo Man-Ho) | Bill's status | Bill's direction |
|---|---|---|---|---|
| Zi Wei | 紫微 | Purple Star | **LOCKED** | **Purple Star / Emperor** — the controlling will |
| Tian Ji | 天機 | Heavenly Secret | **LOCKED** | **The Matrix** (also: Engine, Mechanism) |
| Tai Yang | 太陽 | Sun | **LOCKED** | **The Sun** — raw force / energy |
| Lian Zhen | 廉貞 | Pure Virtue | landed (awkward) | "Righteous Moral Energy" — likely to refine |
| Wu Qu | 武曲 | Military Music | resting | "Barrel / Chamber" |
| Tian Tong | 天同 | Heavenly Unity | resting | unnamed (yin-yang equilibrium) |
| Tai Yin | 太陰 | Moon | next up | (Moon; "Revenue Collector") |
| *~30 others* | | | untouched | court roles only, from Gemini |

→ **Do NOT seed display names from the old sheet.** Keep them only as a
`legacy_alias` (hidden), never as the public name.

### 4.2 The canonical join

`iztro` is the runtime source of the chart and emits **both** the Chinese
characters (`zh-CN`) and its own nickname (`en-US`). The characters are the
stable key:

```
紫微  →  iztro "emperor"   →  Bill "Purple Star"
天機  →  iztro "advisor"   →  Bill "The Matrix"
貪狼  →  iztro "wolf"      →  (Kwo Man-Ho "Greedy Wolf", Bill TBD)
```

So: **`hanzi` is the primary key**, `iztro_key` is the runtime join, romanization
bridges the old Excel, and Bill's name is a separate authored column. Full
mapping table in Appendix A.

### 4.3 RECOMMENDATION — what the chart displays per star

Resolve the label in this order:

1. **Bill's name, if `status = locked`** → e.g. "Purple Star", "The Matrix".
2. **Otherwise: pinyin + characters** → e.g. "Tiān Jī 天機". Neutral, accurate,
   never a rejected name.

Always show two supporting bits when available (because Bill's whole thesis is
that *meaning > label*):

- a short **court-role descriptor** (e.g. "the Emperor's mechanism") — previews
  his lens without committing to a final name;
- the **element** (e.g. "Yin Wood").

Rules:
- **Kwok Man-Ho names are never the primary.** Store as `legacy_alias`; default
  hidden from members (optionally surfaced in admin as "also translated as…").
- **Draft (non-locked) Bill names** appear only in the admin editor with a
  "draft" badge — not public until locked, so the member view doesn't churn.

Why: respects Bill's rejection, never shows a name he hasn't blessed, degrades
gracefully as the project completes, and the chart improves **immediately**
(pinyin + characters already beats `iztro`'s "emperor/wolf") with zero locked
names required.

---

## 5. The scoring / "weather" engine  *(synthesis + recommendation)*

### 5.1 Brightness → luck code

`iztro` returns the classic 7-level brightness scale. Recommended mapping to
Bill's codes (the `Major-Minor_Stars` sheet keys on these):

| Brightness (zh / en) | Luck code | Weight |
|---|---|---|
| 庙 miao `[+3/+4]`, 旺 wang | **VL** Very Lucky | +2 |
| 得 de `[+2]`, 利 li `[+1]` | **L** Lucky | +1 |
| 平 ping `[0]` | neutral | 0 |
| 不 bu `[-1]` | **U** Unlucky | −1 |
| 陷 xian `[-3]` | **VUL** Very Unlucky | −2 |

Mutagen (Si Hua) overlay: **Hua Lu / Quan / Ke** (祿權科) shift a star up one
band; **Hua Ji** (忌) shifts it down. (`purpleStar.js` already extracts both
brightness and mutagen.)

⚠️ **Calibration required:** these thresholds are the single biggest unknown.
PR3 calibrates them by reproducing the two sample `.doc` readings (and the Jan-2013
prototype) and diffing the scores.

### 5.2 Palace / decade / year scoring

- **Palace score** = sum of its stars' weights (Review Notes confirm range ≈ ±16).
  → ranks palaces to find the **luckiest** and **unluckiest** (drives
  `Luckiest_Palcace` + `Palace_Conclusion` lookups).
- **Empty-palace borrowing** — a palace with no major stars **borrows the opposite
  palace's** major stars (standard 對宮借星; the Review Notes flag the prototype's
  failure to do this as a real bug).
- **Decade Yun** — each 10-yr palace gets a Yun rating from its score →
  `Decade_Yun` + `Luckiest_Time_Period`.
- **Year/age scoring** — each age inherits its governing palace's score plus
  transient overlays → rank for **10 luckiest / 10 unluckiest ages**
  (Review Notes: "we did the 10, not 5") → `Year_Descriptions`.

### 5.3 Weather framing (Bill's model)

Convert a palace score into a **probability band**, then **cross-modulate** per
Bill's explicit method:

> "Ming gives ~60% baseline; supportive stars push to 75–80%; then check Wealth
> (resources), Parents/Bosses (the ceiling), Health (the battery) to adjust."

- Ming base band ← Ming score.
- Adjust ± from **Wealth, Career, Parents (bosses), Health** palace scores.
- Always pair the forecast with a **free-will / Wu Wei** line — the chart maps the
  terrain, not the destiny.

This modulation will be **simple, transparent, and tunable** (a small weights
table Bill can adjust), not a black box.

### 5.4 Age convention — OPEN

The Review Notes never resolved **Chinese age (1 at birth) vs Western (0)**.
Recommendation: default to **Chinese age** (classical standard) but make it a
single config flag; confirm by matching the samples. Flag for Bill.

---

## 6. Narrative + voice

Two layers:

1. **Deterministic narratives** (from the Excel/DB), re-voiced toward the weather
   model — probabilities, "likely / probably," cross-palace caveats, a free-will
   close. This is the source of truth and always viewable.
2. **Constrained LLM polish** — optional, reviewable. Grounded **only** in (a) the
   deterministic report JSON, (b) Bill's philosophy notes, (c) the relevant
   `Houses.docx` trait bank for that palace × luck level.

**Polish guardrails (given Bill's well-earned distrust of AI invention):**
- System prompt forbids adding any age, star, probability, or claim not in the input.
- A post-generation check diffs the output for any **new number or star name** and
  flags it.
- **Never auto-applied** to member-facing content in v1 — it's a "Polish draft"
  button Bill reviews and edits before anything ships.

**Fix the private-reading generator:** feed the deterministic Zi Wei report into
`generate-reading.js` as grounding, so the private-reading LLM stops inventing.
Keep its existing "only echo what's grounded in the transcript" rule.

**Deferred:** true month-by-month forecasting — the monthly sheets are empty.
v1 uses the `Next Year` (8-row, luck-rating-keyed) "next 12 months" section only.

---

## 7. Database design

Reference content, public-read (like `almanac_days`), staff-write.

**`purple_star_stars`** — Bill's authoring home + the join table:

| column | notes |
|---|---|
| `hanzi` | PK (e.g. 紫微) |
| `pinyin` | Tiān Jī |
| `iztro_key` | runtime join (e.g. "emperor") |
| `kind` | major / minor / mutagen / adjective (Bill's split, from his sheet) |
| `element` | e.g. Yin Wood |
| `court_role` | e.g. "the Emperor's mechanism" |
| `name` | Bill's chosen display name (nullable) |
| `name_status` | locked / draft / resting / unnamed |
| `meaning_short`, `meaning_long` | Bill's authored meaning |
| `legacy_alias` | Kwok Man-Ho name (hidden) |

**`purple_star_narratives`** — the 9 sheets, normalized:

| column | notes |
|---|---|
| `category` | palace_luckiest / time_period / star_combo / decade_yun / decade_start / year_desc / palace_conclusion / next_year |
| `key1` | palace / decade# / age-bucket / star-combo / yun-rating |
| `key2` | luck_category (nullable) |
| `scope` | decade / year / this_year / month (nullable) |
| `text` | the narrative |

**Migrations** (numbered, current max = 042):
- `043_purple_star_schema.sql` — tables + RLS.
- `044_seed_purple_star_stars.sql` — the star reference.
- `045_seed_purple_star_narratives.sql` — ETL output (~250 KB; split if needed).

Applied via the Supabase MCP (per global rules). The DB becomes the single
source of truth, retiring the 5 ambiguous Excel copies.

---

## 8. Surfaces

| Surface | Change |
|---|---|
| Member page `purple-star.jsx` | Bill's star names (fallback per §4.3); deterministic report replaces generic blurbs |
| `generate-reading.js` | grounded on the deterministic Zi Wei report — stops inventing |
| Quick-reading email (`quickReadingHtml.js`) | optional: add the prose Zi Wei section |
| `/admin` (new) | (PR2) star editor for Bill |

---

## 9. Phased delivery

| PR | Scope | Depends on | Built by | Verify |
|---|---|---|---|---|
| **PR1** | DB schema + ETL of deterministic Excel content; seed star reference (objective data + locked names); wire `purpleStar.js` to Bill's names w/ fallback | — | eng | chart shows "Purple Star / The Matrix / Tiān Jī 天機", no "emperor/wolf"; rows in DB |
| **PR2** *(recommended)* | `/admin` star editor — Bill names/defines stars in-app; locked names flow to chart | PR1 | eng + **Bill authors** | Bill edits a star, member chart updates |
| **PR3** | Engine `lib/purpleStarReport.js` — scoring, borrowing, cross-palace weather probability; render on member page | PR1 | eng | scores reproduce the sample `.doc` readings within tolerance |
| **PR4** | Constrained reviewable polish; ground `generate-reading.js` on the report | PR3 | eng + **Bill reviews voice** | private reading contains no un-grounded Zi Wei claim |

Naming completeness **never blocks** shipping — fallback covers unnamed stars.
Bill's authoring (names, voice, narrative re-voicing) runs in parallel with eng.

---

## 10. Recommendations summary

1. **Canonical source:** `MergedUpdated.xlsx` (diff vs `Merged yon` in PR1).
2. **Star key:** `hanzi`; never use Kwok Man-Ho names as display (legacy alias only).
3. **Unnamed-star display:** Bill's locked name → else **pinyin + characters**, with
   court-role + element as supporting text. Draft names admin-only.
4. **Storage:** Supabase tables, public-read; DB is the single source of truth.
5. **Luck scoring:** 7-level brightness → VL/L/neutral/U/VUL (§5.1), mutagen overlay,
   calibrated against the samples.
6. **Borrowing rule:** implement (opposite-palace), per Review Notes.
7. **Voice:** weather-forecast — probabilistic, cross-palace, free-will; no fatalism.
8. **LLM:** deterministic is canonical; polish is constrained + reviewable + never
   auto-shipped; ground `generate-reading.js` to kill the fabrication.
9. **Admin editor (PR2):** recommended — gives Bill a home for the naming project.
10. **Age convention:** default Chinese age, configurable; confirm vs samples.

---

## 11. Open questions for Dave / Bill

1. **Audience for v1** — fix the member page, the private-reading LLM, or both first?
   (Same engine underneath; affects which PR ships first.)
2. **Age convention** — Chinese (1 at birth) or Western? (§5.4)
3. **Narrative re-voicing scope** — keep the Kwok Man-Ho-derived Excel narratives as-is
   (re-voiced by tone only), or does Bill want to rewrite the per-palace substance over
   time? (Affects whether narratives also need an editor.)
4. **Polish** — confirm reviewable/opt-in (recommended) vs auto-applied.
5. **PR2 editor** — build now or seed-and-defer?

---

## Appendix A — Star reference (majors + mutagens)

`hanzi | pinyin | iztro_key | Kwo Man-Ho (legacy) | element | Bill status → name`

```
紫微  Zǐwēi     emperor    Purple Star            Yin Earth   LOCKED  → Purple Star / Emperor
天機  Tiānjī    advisor    Heavenly Secret        Yin Wood    LOCKED  → The Matrix
太陽  Tàiyáng   sun        Sun                    Yang Fire   LOCKED  → The Sun (Force/Energy)
武曲  Wǔqū      general    Military Music         Yin Metal   RESTING → Barrel / Chamber
天同  Tiāntóng  fortunate  Heavenly Unity         Yang Water  RESTING → (unnamed)
廉貞  Liánzhēn  judge      Pure Virtue            Yin Fire    LANDED  → Righteous Moral Energy (refine)
天府  Tiānfǔ    empress    Southern Star          Yang Earth  TBD     → (Treasury / Finance Minister)
太陰  Tàiyīn    moon       Moon                   Yin Water   NEXT    → (Moon / Revenue Collector)
貪狼  Tānláng   wolf       Greedy Wolf            Yang Wood   TBD
巨門  Jùmén     advocator  Great Door             Yin Water   TBD     → (Spokesman / The Mouth)
天相  Tiānxiàng minister   Heavenly Minister      Yang Water  TBD     → (Prime Minister / Keeper of Seal)
天梁  Tiānliáng sage       Heavenly Roof-Beam     Yang Earth  TBD
七殺  Qīshā     marshal    Seven Killings         Yin Metal   TBD     → (Marshal / Commander)
破軍  Pòjūn     rebel      Broken Army            Yin Water   TBD     → (Vanguard / Demolitionist)

化祿  Huà Lù    —          Transforming Salary    —           Si Hua  → Prosperity / Flow
化權  Huà Quán  —          Transforming Authority —           Si Hua  → Authority / Sage
化科  Huà Kē    —          Transforming Exam      —           Si Hua  → Fame / Intellect
化忌  Huà Jì    —          Transforming Jealousy  —           Si Hua  → Cloud / Karma
```

The remaining ~22 minor/adjective stars (左輔/右弼, 文昌/文曲, 火星/鈴星, 擎羊/陀羅,
祿存, 天馬, 紅鸞/天喜, etc.) are mapped hanzi→iztro_key→legacy during PR1 ETL using
the same join. Element/court-role columns vary slightly by school — seed the
14 majors + 4 mutagens with confidence; mark minors `TBD` for Bill.
