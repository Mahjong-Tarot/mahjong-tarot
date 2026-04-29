# Fire Horse 2026 — Forecast Methodology

This is the scoring engine for the Fire Horse interactive report. Every number a user sees on the page is produced by this methodology — no hand-tuned scores. The prose layer is written **on top of** the scores; if a sign's number says 0.82, the prose has to be consistent with "very favorable."

## Provenance

The base scoring system is ported directly from the 2014 Wood Horse forecast (`architecture/readings/2014 Personal Forecast - Horse/Year of the Horse Math.xlsx`). Two structural changes were made for 2026:

1. **Year element is Fire, not Wood.** Year and month element adjustments recompute against Fire as the year element.
2. **Fire Horse Volatility model** layered on top. The 2014 system was tuned for a Wood Horse year (gentle, generally favorable). A Fire Horse — once every 60 years, "double fire" (Bing-stem Yang Fire + Wu-branch Fixed Fire) — is structurally more polarized. The source material (`fire-horse-extremes-and-danger.md`, `Interview Notes - Money in the Year of the Fire Horse.md`) is explicit that outcomes get pushed to both extremes. The volatility model encodes this mathematically (see § Fire Horse Adjustments). Other Horse years (Earth Horse, Metal Horse, Water Horse) would use the standard formula without the volatility additions.

## The Five Elements (Wuxing)

```
        Wood
       /    \
    Water   Fire
      |      |
    Metal — Earth
```

**Productive cycle (生):** Wood → Fire → Earth → Metal → Water → Wood.
**Destructive cycle (克):** Wood → Earth → Water → Fire → Metal → Wood.

### Element Relationship Matrix

For two elements (context, user) — where context is the year or month element and user is the customer's element — the relationship value is:

| Relationship                                   | Value | Examples (context-user)                    |
|---|---|---|
| Same element                                   |   0   | Fire-Fire, Wood-Wood                       |
| Productive forward (context produces user)     |  +5   | Wood-Fire, Fire-Earth, Earth-Metal, Metal-Water, Water-Wood |
| Productive reverse (user produces context)     |  +3   | Fire-Wood, Earth-Fire, Metal-Earth, Water-Metal, Wood-Water |
| Destructive forward (context destroys user)    |  −5   | Wood-Earth, Earth-Water, Water-Fire, Fire-Metal, Metal-Wood |
| Destructive reverse (user destroys context)    |  −3   | Earth-Wood, Water-Earth, Fire-Water, Metal-Fire, Wood-Metal |

This produces a 5×5 matrix that's used in two places — the year adjustment and the month adjustment.

## Signs and Fixed Elements

Every sign has a **fixed element** that defines its base nature:

| Element | Signs                  |
|---|---|
| Water   | Pig, Rat, Ox           |
| Wood    | Tiger, Rabbit, Dragon  |
| Fire    | Snake, Horse, Sheep    |
| Metal   | Monkey, Rooster, Dog   |

For the **12-sign view**, the user's element = their sign's fixed element.

For the **60-sign view** (5 elements × 12 signs), the user's element comes from their birth year (e.g., a Fire Rat born in 1996 has element=Fire, overriding water). The 60-sign extension uses birth element in the year/month adjustments.

### 60-cycle birth-year lookup

The Chinese 60-year cycle pairs each sign with one specific element, repeating every 60 years. To find element from birth year:

```
stem  = (year − 4) mod 10           # 0=Jia, 1=Yi, ..., 9=Gui
element_index = stem // 2           # 0=Wood, 1=Fire, 2=Earth, 3=Metal, 4=Water
sign  = (year − 4) mod 12           # 0=Rat, 1=Ox, ..., 11=Pig
```

Example: 1996 → stem = 1992 mod 10 = 2 (Bing) → element_index = 1 → Fire. Sign = 1992 mod 12 = 0 → Rat. **Fire Rat.** ✓

The Fire Horse year itself: 2026 → stem = 2022 mod 10 = 2 → Fire. Sign = 2022 mod 12 = 6 → Horse. **Fire Horse.** ✓

## 2026 Lunar Calendar (Bing-Wu / 丙午)

Year boundary: **Feb 17, 2026 → Feb 5, 2027** (lunar new year to lunar new year, 354 days, 12 lunar months, no leap month).

The heavenly stem of each lunar month is determined by the year stem. For Bing-Wu (year stem Bing = 3), the 12 lunar months get stems Geng, Xin, Ren, Gui, Jia, Yi, Bing, Ding, Wu, Ji, Geng, Xin — producing this sign-element pairing:

| #  | Lunar month  | Stem-Branch | Element-Sign  | Begin       | End         |
|----|--------------|-------------|----------------|-------------|-------------|
| 1  | Tiger month  | Geng-Yin    | Metal Tiger    | 2026-02-17  | 2026-03-18  |
| 2  | Rabbit       | Xin-Mao     | Metal Rabbit   | 2026-03-19  | 2026-04-16  |
| 3  | Dragon       | Ren-Chen    | Water Dragon   | 2026-04-17  | 2026-05-16  |
| 4  | Snake        | Gui-Si      | Water Snake    | 2026-05-17  | 2026-06-14  |
| 5  | Horse        | Jia-Wu      | **Wood Horse** | 2026-06-15  | 2026-07-13  |
| 6  | Sheep        | Yi-Wei      | Wood Sheep     | 2026-07-14  | 2026-08-12  |
| 7  | Monkey       | Bing-Shen   | Fire Monkey    | 2026-08-13  | 2026-09-10  |
| 8  | Rooster      | Ding-You    | Fire Rooster   | 2026-09-11  | 2026-10-09  |
| 9  | Dog          | Wu-Xu       | Earth Dog      | 2026-10-10  | 2026-11-08  |
| 10 | Pig          | Ji-Hai      | Earth Pig      | 2026-11-09  | 2026-12-08  |
| 11 | Rat          | Geng-Zi     | Metal Rat      | 2026-12-09  | 2027-01-07  |
| 12 | Ox           | Xin-Chou    | Metal Ox       | 2027-01-08  | 2027-02-05  |

**Note:** The 5th lunar month — Wood Horse — is the energetic equivalent of the entire 2014 Wood Horse year condensed into ~30 days. It's expected to be the most consequential month of the year for many signs. The own-year month (Horse-month) is also when the Horse animal's signature shows up most directly.

## Sign-vs-Horse Year Compatibility (Compat)

Each sign's fixed compatibility with the Horse year animal. This is **constant across all Horse years** (Wood, Fire, Earth, Metal, Water). The year *element* affects the YrElemAdj adjustment separately.

| Sign     | Compat |
|----------|--------|
| Rat      |   11   |
| Ox       |   16   |
| Tiger    |   95   |
| Rabbit   |   38   |
| Dragon   |   77   |
| Snake    |   35   |
| Horse    |   40   |
| Sheep    |   90   |
| Monkey   |   33   |
| Rooster  |   63   |
| Dog      |   95   |
| Pig      |   48   |

## Sign-vs-Sign Compatibility (BaseScore)

The 12×12 base score matrix, used for any (user_sign × any_other_sign) lookup including monthly compatibility. Read user-sign as row, target-sign as column.

|         |  rat |   ox | tiger |rabbit|dragon|snake |horse |sheep |monkey|roost.|  dog |  pig |
|---------|-----:|-----:|------:|-----:|-----:|-----:|-----:|-----:|-----:|-----:|-----:|-----:|
| rat     |   69 |   62 |    41 |   31 |   96 |   76 |   11 |   29 |   96 |   25 |   49 |   78 |
| ox      |   62 |   49 |     7 |   77 |   24 |   95 |   16 |    8 |   42 |   95 |   36 |   47 |
| tiger   |   41 |    7 |    36 |   68 |   71 |   17 |   95 |   34 |    9 |   32 |   95 |   77 |
| rabbit  |   31 |   77 |    68 |   89 |   46 |   72 |   38 |   96 |   17 |    7 |   78 |   95 |
| dragon  |   96 |   24 |    71 |   46 |   55 |   75 |   77 |   22 |   96 |   53 |    9 |   76 |
| snake   |   76 |   95 |    17 |   72 |   75 |   45 |   35 |   87 |   43 |   95 |   77 |   12 |
| horse   |   11 |   13 |    95 |   38 |   77 |   33 |   40 |   90 |   33 |   63 |   95 |   48 |
| sheep   |   29 |    8 |    34 |   96 |   22 |   87 |   90 |   74 |   44 |   21 |   22 |   95 |
| monkey  |   96 |   42 |     9 |   17 |   96 |   43 |   33 |   44 |   92 |   20 |   77 |   67 |
| rooster |   25 |   95 |    32 |    7 |   53 |   95 |   63 |   21 |   20 |   14 |   38 |   61 |
| dog     |   49 |   36 |    95 |   78 |    9 |   77 |   95 |   22 |   77 |   38 |   86 |   71 |
| pig     |   78 |   47 |    77 |   95 |   76 |   12 |   48 |   95 |   67 |   61 |   71 |   37 |

The matrix has minor asymmetries inherited from the 2014 source (e.g., `horse-ox = 13` vs `ox-horse = 16`). These are preserved as-is for fidelity to the original system. Lookups always read user-sign-as-row.

## Standard Scoring Formula

For a given user (user_sign, user_element) and a given month (month_sign, month_element) in the Horse year:

```
ElemAdj(context, user) = lookup in 5×5 element relationship matrix
                        (returns one of {+5, +3, 0, −3, −5})

MoElemAdj_base = ElemAdj(month_element, user_element)
YrElemAdj_base = ElemAdj(year_element,  user_element)

AdjScore   = BaseScore[user_sign][month_sign] + MoElemAdj
YrCompat   = Compat[user_sign]                + YrElemAdj

MoFinal    = (AdjScore + YrCompat) / 200
YrFinal    = mean of the 12 MoFinal values for this user across the 12 lunar months
```

For Wood Horse (2014), set `year_element = Wood` and use the formula directly.

## Fire Horse Adjustments

For 2026 Fire Horse — and **only** for Fire Horse years — apply two additional steps. Both encode the polarized "all or nothing" character documented in the source material.

### Adjustment 1: Element Amplification (×1.4)

Multiply both element adjustments by 1.4 before adding them in:

```
MoElemAdj_FH = MoElemAdj_base × 1.4    # ±5 → ±7,  ±3 → ±4
YrElemAdj_FH = YrElemAdj_base × 1.4
```

**Why:** Source material (`fire-horse-extremes-and-danger.md`): *"That energy amplified through double fire means consequences are bigger, decisions matter more, and the margin for error is smaller."* In Wuxing, fire is the amplifying element. A double-fire year amplifies all element relationships, both productive and destructive. This term scales with the strength of the relationship — same-element pairs (which produce 0) are unaffected; the amplifier only boosts cells where elements actually push against each other.

### Adjustment 2: Distribution Stretch (logit, k=1.5)

After computing `MoFinal` with the amplified adjustments, push the score away from 0.5:

```
stretch(p) = p^k / (p^k + (1−p)^k)        with k = 1.5

MoFinal_FH = stretch(MoFinal)
```

**Why:** Source material: *"This is not a halfway year. It is not a boring year. It's all or nothing."* The standard formula produces a mostly-flat distribution; the stretch pulls scores toward the extremes. Favorable cells get more favorable, unfavorable get more unfavorable, the boring middle shrinks.

The function is symmetric around 0.5, monotonic, and bounded in (0, 1). Sample values:

| Input | Stretched (k=1.5) | Δ      |
|-------|-------------------|--------|
| 0.10  | 0.036             | −0.064 |
| 0.30  | 0.219             | −0.081 |
| 0.50  | 0.500             | 0.000  |
| 0.70  | 0.781             | +0.081 |
| 0.90  | 0.964             | +0.064 |

### Adjustment 3: Bound to [0.05, 0.95]

```
MoFinal_FH = max(0.05, min(0.95, MoFinal_FH))
```

No one is at exactly 0 or 1 in any year. Even the worst sign has some good days; even the best sign can stumble.

### Final Fire Horse Formula

```
MoElemAdj  = ElemAdj(month_element, user_element) × 1.4
YrElemAdj  = ElemAdj(Fire,          user_element) × 1.4
AdjScore   = BaseScore[user_sign][month_sign] + MoElemAdj
YrCompat   = Compat[user_sign]                + YrElemAdj
raw        = (AdjScore + YrCompat) / 200
MoFinal_FH = clip(stretch(raw, k=1.5), 0.05, 0.95)
YrFinal_FH = mean(12 monthly MoFinal_FH values)
```

## Worked Examples

### Tiger user (Wood element, fixed) in 2026

- `Compat[Tiger] = 95`. `YrElemAdj = ElemAdj(Fire, Wood) = +3` (productive reverse: Wood produces Fire). `YrElemAdj × 1.4 = +4.2`.
- `YrCompat = 95 + 4.2 = 99.2`.

Across the 12 lunar months:

| Month        | MonthElem | BaseScore | MoElemAdj×1.4 | AdjScore | raw   | MoFinal_FH |
|--------------|-----------|----------:|--------------:|---------:|------:|-----------:|
| Tiger (Metal)|  Metal    |    7      | −5×1.4 = −7   |    0     | 0.496 | **0.494** |
| Rabbit (M)   |  Metal    |   68      | −7            |   61     | 0.802 | **0.879** |
| Dragon (W)   |  Water    |   71      | +5×1.4 = +7   |   78     | 0.887 | **0.940** |
| Snake (W)    |  Water    |   17      | +7            |   24     | 0.617 | **0.687** |
| **Horse (Wd)** |  Wood   | **95**    | 0             |   95     | 0.971 | **0.95** (cap) |
| Sheep (Wood) |  Wood     |   34      | 0             |   34     | 0.667 | **0.747** |
| Monkey (Fire)|  Fire     |    9      | +3×1.4 = +4.2 |   13.2   | 0.562 | **0.628** |
| Rooster (F)  |  Fire     |   32      | +4.2          |   36.2   | 0.677 | **0.758** |
| Dog (Earth)  |  Earth    |   95      | −3×1.4 = −4.2 |   90.8   | 0.950 | **0.95** (cap) |
| Pig (Earth)  |  Earth    |   77      | −4.2          |   72.8   | 0.860 | **0.918** |
| Rat (Metal)  |  Metal    |   41      | −7            |   34     | 0.667 | **0.747** |
| Ox (Metal)   |  Metal    |    7      | −7            |    0     | 0.496 | **0.494** |

`YrFinal_FH = mean(...) ≈ 0.77` — extremely favorable year for Tiger. Eight of twelve months above 0.7. Matches source material: *"Tiger — bold, aggressive, prepared … this is your year for passion … the Fire Horse is generally favorable for the Tiger."*

The own-element month (Tiger, Metal Tiger month) and Ox month (Metal Ox) are flatter — fire doesn't help wood much when the month is already destructive (Metal-Wood). The Horse and Dog months hit the cap — these are the windows where Tiger wins decisively.

### Rat user (Water element, fixed) in 2026

- `Compat[Rat] = 11`. `YrElemAdj = ElemAdj(Fire, Water) = −3` (destructive reverse). `YrElemAdj × 1.4 = −4.2`.
- `YrCompat = 11 − 4.2 = 6.8`.

The lowest YrCompat in the chart. This shifts Rat's entire 12-month curve downward. Combined with mostly destructive month-element relationships, the year is structurally hostile. Expected `YrFinal_FH ≈ 0.30`.

### Fire Rat (60-sign view) in 2026

Same sign (Rat), different element (Fire instead of Water).

- `Compat[Rat] = 11` (unchanged — sign-vs-Horse is fixed).
- `YrElemAdj = ElemAdj(Fire, Fire) = 0` (same element). `YrElemAdj × 1.4 = 0`.
- `YrCompat = 11 + 0 = 11`.

Fire Rat has YrCompat = 11 vs standard Rat's 6.8 — meaningfully better. The Fire element shields the Rat user from the Fire year's destructive pull on Water-element people. Fire Rats still face the bad sign-vs-Horse base (11), but they avoid the additional element penalty. Expected ~0.04 lift on every monthly score vs the default Water Rat.

This is the entire point of the 60-sign extension: showing that not all Rats have the same year, that birth element changes the picture meaningfully.

## Score Interpretation

A simple band system for the prose layer to write against:

| Score range | Band            | Tone of prose                                  |
|-------------|-----------------|------------------------------------------------|
| 0.85 – 0.95 | Peak window     | Major opportunity, act decisively              |
| 0.70 – 0.85 | Favorable       | Conditions are with you, push                  |
| 0.55 – 0.70 | Mildly positive | Workable; maintain momentum                    |
| 0.45 – 0.55 | Neutral         | Conserve energy, observe                       |
| 0.30 – 0.45 | Mildly adverse  | Slow down, defensive posture                   |
| 0.15 – 0.30 | Difficult       | Avoid major moves, protect what you have       |
| 0.05 – 0.15 | Severe          | Do not initiate, manage risk only              |

In a Fire Horse year, expect more cells in the **Peak** and **Severe** bands than in a Wood Horse year. That's the polarization — and it's exactly what the volatility model is for.

---

*Sources: Bill interview April 19, 2026 (career, money); Bill interview April 13, 2026 (love); `fire-horse-extremes-and-danger.md`; 2014 Wood Horse Math sheet (`architecture/readings/2014 Personal Forecast - Horse/Year of the Horse Math.xlsx`).*
