# Daily Horoscope Rule Engine

Encodes the BaZi-based daily horoscope system used in the original 2013 master file, so a writer (LLM or human) only has to do the **prose layer** — every other input is deterministic and reproducible.

Source spreadsheets (in the parent folder):
- `horoscope-Matrix.xls` — the keyword grid (user_sign × day_sign × 11 life domains)
- `horoscopeKeywords.xls` — element→domain weighting + 60×12 sexagenary score grid
- `SignMatches.xls` — pillar lookup samples used for verification (still in `~/Downloads/` — not in repo)

## Files

```
encoding/
├── README.md                  ← this file
├── extract_data.py            ← one-time: source xls → data/*.json
├── pillars.py                 ← Year/Month/Day pillar calculator
├── signals.py                 ← get_signals(date, user_sign) — the rule API
├── prose.py                   ← signal payload → 50-word horoscope (Anthropic SDK + caching)
├── verify_pillars.py          ← runs all 532 SignMatches dates through pillars.py
├── generate_2026.py           ← writes the 2026 deliverables to out/
├── data/
│   ├── matrix.json            user_sign → day_sign → domain → keyword phrase
│   ├── scores_user_x_day.json user_sign → day_sign → {score, flag}        (12×12 = 144 scores)
│   ├── scores_sexagenary.json "Element Sign" → user_sign → score          (60×12 = 720 scores)
│   ├── sign_descriptors.json  user_sign → {likes, dislikes, traits[]}     (voice cues)
│   ├── houses.json            day_sign → house description                 (5 houses, 12 mappings)
│   ├── element_domains.json   element → [amplified life domains]          (5 elements)
│   ├── few_shot_examples.json 5 voice exemplars (one per tone) from 2013 master
│   └── lunar_calendar.json    Chinese New Year + lunar month start dates  (2009-2027 covered)
└── out/
    ├── 2026-pillars.csv          365 rows: every day of 2026 with all three pillars
    ├── 2026-signals-preview.json 84 full payloads (LNY week × 12 user signs)
    ├── 2026-loaded-days.csv      ~93 days where pillars collide or a Western moment fires
    └── 2026-02-17-sample.json    sample horoscopes (12 signs, LNY day) — manual quality demo
```

## Generating prose at scale

```bash
pip install anthropic
export ANTHROPIC_API_KEY=sk-...

python3 prose.py 2026-02-17 Tiger          # one horoscope
python3 prose.py 2026-02-17                 # one full day (12 signs)
python3 prose.py 2026-02-15 2026-02-21      # a week × 12 signs = 84
```

`prose.py` uses Sonnet 4.6 with prompt caching — system prompt + 5 few-shot examples are cached across calls, so each per-call cost is just the signal payload (~300 tokens) + the output (~70 tokens).

Estimated cost for the full year (4,380 horoscopes): roughly **$15–25** with caching.

## Quick start

```python
from signals import get_signals, render_signal_brief

payload = get_signals("2026-04-27", "Tiger")
print(render_signal_brief(payload))
```

Or in bulk:
```bash
python3 generate_2026.py    # writes the three CSV/JSON deliverables
```

## The pattern

The 2013 system uses three Chinese-astrology pillars per date:

| Pillar | Boundary | Notes |
|---|---|---|
| **Year** | Lunar New Year | 2026 = Fire Horse, starts 2026-02-17 |
| **Month** | New moon (lunar months) | Tiger month = lunar 1, ..., Ox month = lunar 12 |
| **Day** | Continuous 60-day sexagenary cycle | Anchored on 2010-05-04 = Wood Tiger |

The month **stem** is derived from the year stem via the standard *Wu Hu Dun* (五虎遁元歌) BaZi rule, encoded as `TIGER_MONTH_STEM` in `pillars.py`.

**Verified**: all 532 dates × 3 pillars in `SignMatches.xls` (2010–2012) match this calculator exactly.

## What `get_signals(date, user_sign)` returns

```python
{
  "date": "2026-04-27",
  "user_sign": "Tiger",
  "pillars": {
    "year":  {"element": "Fire",  "sign": "Horse"},
    "month": {"element": "Water", "sign": "Dragon"},
    "day":   {"element": "Metal", "sign": "Sheep"}
  },
  "scores": {
    "primary": 29,                  # 0-100, drives the tone
    "sexagenary_60x12": 29,         # the precise lookup ("Metal Sheep" × Tiger)
    "matrix_12x12": 41,             # the simpler day-sign-only fallback (Tiger row × Sheep col)
    "matrix_flag": ""               # any "*", "???", "L," markers Bill left in the cell
  },
  "tone": "cautionary",             # auspicious | favorable | neutral | cautionary | challenging
  "amplified_domains": ["Action", "Financial", "Mental"],   # driven by day's element
  "matrix_keywords": {              # keyword phrases for the amplified domains
    "Action":    "Cool off & let matters simmer down* ...",
    "Financial": "Lucky* -",
    "Mental":    "Learn tranquility -"
  },
  "all_domain_keywords": { ... },   # all 11 domains, in case the writer needs more
  "house": "House of Gender-Sheep female gender is favored ...",
  "voice": {                        # user-sign character cues
    "likes":    "...",
    "dislikes": "...",
    "traits":   ["...", "..."]
  },
  "match_day": null,                # or e.g. ["year_day"], ["year_month"], ["triple"]
  "user_sign_relations": null,      # or e.g. ["ben_ming_nian"], ["year_clash", "month_clash"]
  "western_moment": null            # or e.g. "New Year's Day", "Independence Day (US)"
}
```

### Score → tone mapping

```
≥80   auspicious      80%+ of cells get a positive lean
60-79 favorable
40-59 neutral
20-39 cautionary
<20   challenging
```

### Match-day flags (Year/Month/Day pillar collisions)
- `year_day` — Year sign = Day sign (loaded; e.g., a Horse day in Year of Horse)
- `month_day` — Month sign = Day sign
- `year_month` — Year sign = Month sign (the **2026 Horse-month-of-Horse-year** is one — June 15 → July 13)
- `triple` — all three align (very rare, very loaded)

### User-sign relations
- `ben_ming_nian` — user IS the year sign (their zodiac year, traditionally turbulent)
- `ben_ming_yue` / `ben_ming_ri` — same idea for month / day
- `year_clash` / `month_clash` / `day_clash` — user's directional opposite is in that pillar (the 6 BaZi clashes: Rat-Horse, Ox-Sheep, Tiger-Monkey, Rabbit-Rooster, Dragon-Dog, Snake-Pig)

## How to write a horoscope from a payload

The 2013 master is the style reference. Hit these targets:

| Attribute | Target |
|---|---|
| Length | 22–91 words; aim for 50 |
| Voice | 2nd person, conversational, encouraging |
| Mention sign by name | ~11% of the time (e.g., "Onward and upward, Tiger.") |
| Top openings | "Have you been...", "Today is a...", "It's time to...", "Feeling a little..." |
| Holiday hooks | Use sparingly — only if `western_moment` is set AND it adds something |

Ordering of inputs by importance for prose:
1. **`tone`** — sets the affect of the whole horoscope
2. **`matrix_keywords`** — the actual content (keywords from the amplified domains)
3. **`voice`** — character cues that shape *how* it's said
4. **`match_day` / `user_sign_relations`** — when set, lean into them; they're the "today is special because..." angle
5. **`house`** — useful framing for what the day favors generally
6. **`western_moment`** — only if it organically fits

## Extending to other years

Add a new entry to `data/lunar_calendar.json`:

```json
"2028": {
  "new_year": "2028-01-26",
  "stem_branch": "Wu Shen",
  "element_sign": "Earth Monkey",
  "leap_month": 5,
  "month_starts": {
    "1": "2028-01-26", "2": "2028-02-25", "3": "2028-03-26",
    "4": "2028-04-25", "5": "2028-05-24", "leap_5": "2028-06-22",
    "6": "2028-07-22", "7": "2028-08-20", "8": "2028-09-19",
    "9": "2028-10-18", "10": "2028-11-17", "11": "2028-12-16",
    "12": "2029-01-15"
  }
}
```

Source these dates from a reliable Chinese astronomical calendar (most lunar-calendar tables show new-moon dates for each lunar month). Then:

```bash
python3 verify_pillars.py    # if you have authoritative pillar data, sanity-check
```

## Known data quirks

- **Encoded `` in keyword phrases** — em-dash artifact from the original .xls export. Treat as a hyphen when generating prose.
- **`???` flag on Rat-row scores** in `scores_user_x_day.json` — Bill's uncertainty markers from the original sheet. The 60×12 sexagenary score (`scores_sexagenary.json`) is the more reliable signal.
- **Empty keyword cells** — some (user_sign × day_sign × domain) cells are blank in the original. The signal payload preserves these as empty strings; the writer should fall back to `all_domain_keywords` or use `voice` cues.
- **2025 leap month** — 2025 has a leap 6th lunar month (闰六月). The lunar calendar file handles this; the day pillar continues unbroken through it.
