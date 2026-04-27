"""Fire Horse 2026 forecast score generator.

Implements methodology.md (year-pillar) and methodology-day-master.md (Day Master overlay).
Run from any working dir:
    python3 compute_scores.py

Outputs (alongside this script):
    - year-overview.json        Year metadata, lunar calendar, framing constants
    - signs-scores.json         60 entries (12 signs x 5 elements), each with yearly score
                                and 12 monthly scores. The 12-sign view is the subset where
                                element == sign's fixed element.
    - day-master-scores.json    10 entries (one per Heavenly Stem), each with the year-pillar
                                lift and 12 monthly lifts. Layered on top of signs-scores.json
                                at read time by the website.
    - score-summary.txt         Human-readable distribution summary

No prose. Numbers only.
"""

import json
from pathlib import Path
from statistics import mean

# ---------------------------------------------------------------------------
# Constants — see methodology.md for citations
# ---------------------------------------------------------------------------

SIGNS = ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake',
         'horse', 'sheep', 'monkey', 'rooster', 'dog', 'pig']

ELEMENTS = ['wood', 'fire', 'earth', 'metal', 'water']

# Fixed element of each sign (12-sign default)
FIXED_ELEMENT = {
    'rat': 'water', 'ox': 'water', 'pig': 'water',
    'tiger': 'wood', 'rabbit': 'wood', 'dragon': 'wood',
    'snake': 'fire', 'horse': 'fire', 'sheep': 'fire',
    'monkey': 'metal', 'rooster': 'metal', 'dog': 'metal',
}

# Sign-vs-Horse base compatibility (Compat column from 2014 Math sheet, fixed)
COMPAT_HORSE = {
    'rat': 11, 'ox': 16, 'tiger': 95, 'rabbit': 38, 'dragon': 77, 'snake': 35,
    'horse': 40, 'sheep': 90, 'monkey': 33, 'rooster': 63, 'dog': 95, 'pig': 48,
}

# 12x12 sign-vs-sign base score matrix (rows = user_sign, cols = month_sign)
# Source: Year of the Horse Math.xlsx, columns D-E
BASE_SCORE = {
    'rat':     [69, 62, 41, 31, 96, 76, 11, 29, 96, 25, 49, 78],
    'ox':      [62, 49,  7, 77, 24, 95, 16,  8, 42, 95, 36, 47],
    'tiger':   [41,  7, 36, 68, 71, 17, 95, 34,  9, 32, 95, 77],
    'rabbit':  [31, 77, 68, 89, 46, 72, 38, 96, 17,  7, 78, 95],
    'dragon':  [96, 24, 71, 46, 55, 75, 77, 22, 96, 53,  9, 76],
    'snake':   [76, 95, 17, 72, 75, 45, 35, 87, 43, 95, 77, 12],
    'horse':   [11, 13, 95, 38, 77, 33, 40, 90, 33, 63, 95, 48],
    'sheep':   [29,  8, 34, 96, 22, 87, 90, 74, 44, 21, 22, 95],
    'monkey':  [96, 42,  9, 17, 96, 43, 33, 44, 92, 20, 77, 67],
    'rooster': [25, 95, 32,  7, 53, 95, 63, 21, 20, 14, 38, 61],
    'dog':     [49, 36, 95, 78,  9, 77, 95, 22, 77, 38, 86, 71],
    'pig':     [78, 47, 77, 95, 76, 12, 48, 95, 67, 61, 71, 37],
}

# Element relationship matrix — value of (context, user)
# Productive forward (+5): context produces user
# Productive reverse (+3): user produces context
# Same element (0)
# Destructive forward (-5): context destroys user
# Destructive reverse (-3): user destroys context
ELEM_REL = {
    # productive forward +5
    ('wood', 'fire'): 5, ('fire', 'earth'): 5, ('earth', 'metal'): 5,
    ('metal', 'water'): 5, ('water', 'wood'): 5,
    # productive reverse +3
    ('fire', 'wood'): 3, ('earth', 'fire'): 3, ('metal', 'earth'): 3,
    ('water', 'metal'): 3, ('wood', 'water'): 3,
    # destructive forward -5
    ('wood', 'earth'): -5, ('earth', 'water'): -5, ('water', 'fire'): -5,
    ('fire', 'metal'): -5, ('metal', 'wood'): -5,
    # destructive reverse -3
    ('earth', 'wood'): -3, ('water', 'earth'): -3, ('fire', 'water'): -3,
    ('metal', 'fire'): -3, ('wood', 'metal'): -3,
    # same element 0
    **{(e, e): 0 for e in ELEMENTS},
}

# 2026 lunar calendar (Bing-Wu / Fire Horse year)
# Stem cycle for year stem 3 (Bing): months get Geng, Xin, Ren, Gui, Jia, Yi,
# Bing, Ding, Wu, Ji, Geng, Xin -> elements Metal, Metal, Water, Water, Wood, Wood,
# Fire, Fire, Earth, Earth, Metal, Metal
LUNAR_MONTHS = [
    {'index': 1,  'sign': 'tiger',   'element': 'metal', 'stem_branch': 'Geng-Yin', 'begin': '2026-02-17', 'end': '2026-03-18'},
    {'index': 2,  'sign': 'rabbit',  'element': 'metal', 'stem_branch': 'Xin-Mao',  'begin': '2026-03-19', 'end': '2026-04-16'},
    {'index': 3,  'sign': 'dragon',  'element': 'water', 'stem_branch': 'Ren-Chen', 'begin': '2026-04-17', 'end': '2026-05-16'},
    {'index': 4,  'sign': 'snake',   'element': 'water', 'stem_branch': 'Gui-Si',   'begin': '2026-05-17', 'end': '2026-06-14'},
    {'index': 5,  'sign': 'horse',   'element': 'wood',  'stem_branch': 'Jia-Wu',   'begin': '2026-06-15', 'end': '2026-07-13'},
    {'index': 6,  'sign': 'sheep',   'element': 'wood',  'stem_branch': 'Yi-Wei',   'begin': '2026-07-14', 'end': '2026-08-12'},
    {'index': 7,  'sign': 'monkey',  'element': 'fire',  'stem_branch': 'Bing-Shen','begin': '2026-08-13', 'end': '2026-09-10'},
    {'index': 8,  'sign': 'rooster', 'element': 'fire',  'stem_branch': 'Ding-You', 'begin': '2026-09-11', 'end': '2026-10-09'},
    {'index': 9,  'sign': 'dog',     'element': 'earth', 'stem_branch': 'Wu-Xu',    'begin': '2026-10-10', 'end': '2026-11-08'},
    {'index': 10, 'sign': 'pig',     'element': 'earth', 'stem_branch': 'Ji-Hai',   'begin': '2026-11-09', 'end': '2026-12-08'},
    {'index': 11, 'sign': 'rat',     'element': 'metal', 'stem_branch': 'Geng-Zi',  'begin': '2026-12-09', 'end': '2027-01-07'},
    {'index': 12, 'sign': 'ox',      'element': 'metal', 'stem_branch': 'Xin-Chou', 'begin': '2027-01-08', 'end': '2027-02-05'},
]

# Fire Horse volatility constants
YEAR_ELEMENT = 'fire'
ELEM_AMP = 1.4   # element-adjustment amplifier for double-fire years
STRETCH_K = 1.5  # logit-style distribution stretch
SCORE_FLOOR, SCORE_CAP = 0.05, 0.95

# ---------------------------------------------------------------------------
# Day Master layer (methodology-day-master.md)
# ---------------------------------------------------------------------------

# 10 Heavenly Stems — ported from website/lib/bazi.js for parity
STEMS = {
    'Jia':  {'hanzi': '甲', 'element': 'wood',  'polarity': 'Yang'},
    'Yi':   {'hanzi': '乙', 'element': 'wood',  'polarity': 'Yin'},
    'Bing': {'hanzi': '丙', 'element': 'fire',  'polarity': 'Yang'},
    'Ding': {'hanzi': '丁', 'element': 'fire',  'polarity': 'Yin'},
    'Wu':   {'hanzi': '戊', 'element': 'earth', 'polarity': 'Yang'},
    'Ji':   {'hanzi': '己', 'element': 'earth', 'polarity': 'Yin'},
    'Geng': {'hanzi': '庚', 'element': 'metal', 'polarity': 'Yang'},
    'Xin':  {'hanzi': '辛', 'element': 'metal', 'polarity': 'Yin'},
    'Ren':  {'hanzi': '壬', 'element': 'water', 'polarity': 'Yang'},
    'Gui':  {'hanzi': '癸', 'element': 'water', 'polarity': 'Yin'},
}

YEAR_STEM = 'Bing'  # 丙 — Yang Fire — the year stem of 2026 Bing-Wu

# 12 lunar month stems for a Bing-Wu year (year-stem index 3, so months start at Geng)
MONTH_STEMS = ['Geng', 'Xin', 'Ren', 'Gui', 'Jia', 'Yi',
               'Bing', 'Ding', 'Wu', 'Ji', 'Geng', 'Xin']

# 10 Gods quality tier — year-pillar lift values (see methodology-day-master.md § 10 Gods)
TEN_GODS_YEAR_LIFT = {
    'Direct Resource':    +0.10,  # 正印
    'Direct Wealth':      +0.07,  # 正财
    'Indirect Wealth':    +0.05,  # 偏财
    'Output':             +0.05,  # 食神
    'Indirect Resource':  +0.03,  # 偏印
    'Direct Officer':     +0.02,  # 正官
    'Hurt Officer':        0.00,  # 伤官
    'Friend':             -0.02,  # 比肩
    'Rob Wealth':         -0.05,  # 劫财
    'Seven Killings':     -0.10,  # 七杀
}

# Per-month lift is half magnitude (subtler context)
TEN_GODS_MONTH_LIFT = {k: round(v / 2, 3) for k, v in TEN_GODS_YEAR_LIFT.items()}


def ten_gods(dm_stem, other_stem):
    """Return the 10 Gods relationship FROM dm_stem's perspective looking AT other_stem."""
    dm = STEMS[dm_stem]
    other = STEMS[other_stem]
    same_polarity = dm['polarity'] == other['polarity']

    if dm['element'] == other['element']:
        return 'Friend' if same_polarity else 'Rob Wealth'

    rel = ELEM_REL[(dm['element'], other['element'])]
    # rel is from "context, user" frame where context=dm, user=other.
    # +5 dm produces other; +3 other produces dm; -5 dm destroys other; -3 other destroys dm.
    if rel == 5:    # dm produces other
        return 'Output' if same_polarity else 'Hurt Officer'
    if rel == -5:   # dm destroys other
        return 'Indirect Wealth' if same_polarity else 'Direct Wealth'
    if rel == 3:    # other produces dm
        return 'Indirect Resource' if same_polarity else 'Direct Resource'
    if rel == -3:   # other destroys dm
        return 'Seven Killings' if same_polarity else 'Direct Officer'
    raise ValueError(f'unexpected element relationship: {dm_stem} vs {other_stem} = {rel}')

# ---------------------------------------------------------------------------
# Math
# ---------------------------------------------------------------------------

def stretch(p, k=STRETCH_K):
    """Symmetric logit-style stretch around 0.5. Pulls scores toward extremes."""
    if p <= 0:
        return 0.0
    if p >= 1:
        return 1.0
    return (p ** k) / ((p ** k) + ((1 - p) ** k))


def monthly_score(user_sign, user_element, month_sign, month_element,
                  year_element=YEAR_ELEMENT, fire_horse=True):
    """Compute one cell's monthly score per the methodology."""
    base = BASE_SCORE[user_sign][SIGNS.index(month_sign)]
    mo_adj = ELEM_REL[(month_element, user_element)]
    yr_adj = ELEM_REL[(year_element, user_element)]

    if fire_horse:
        mo_adj *= ELEM_AMP
        yr_adj *= ELEM_AMP

    adj_score = base + mo_adj
    yr_compat = COMPAT_HORSE[user_sign] + yr_adj
    raw = (adj_score + yr_compat) / 200.0

    if fire_horse:
        raw = stretch(raw)
        raw = max(SCORE_FLOOR, min(SCORE_CAP, raw))

    return round(raw, 4)


def yearly_score(user_sign, user_element, **kw):
    """Mean of the 12 monthly scores."""
    months = [
        monthly_score(user_sign, user_element, m['sign'], m['element'], **kw)
        for m in LUNAR_MONTHS
    ]
    return round(mean(months), 4), months


# ---------------------------------------------------------------------------
# Build outputs
# ---------------------------------------------------------------------------

def build_signs_scores():
    """60 entries: 12 signs x 5 elements."""
    out = []
    for sign in SIGNS:
        for element in ELEMENTS:
            year_score, monthly = yearly_score(sign, element)
            entry = {
                'sign': sign,
                'element': element,
                'is_default': element == FIXED_ELEMENT[sign],
                'year_score': year_score,
                'year_compat_pre_amp': COMPAT_HORSE[sign] + ELEM_REL[(YEAR_ELEMENT, element)],
                'year_compat_post_amp': round(COMPAT_HORSE[sign] + ELEM_REL[(YEAR_ELEMENT, element)] * ELEM_AMP, 2),
                'monthly_scores': [
                    {'month': m['index'], 'sign': m['sign'], 'element': m['element'],
                     'score': s}
                    for m, s in zip(LUNAR_MONTHS, monthly)
                ],
            }
            out.append(entry)
    return out


def build_day_master_scores():
    """10 entries, one per Heavenly Stem possible as a Day Master."""
    out = []
    for stem_en, info in STEMS.items():
        year_god = ten_gods(stem_en, YEAR_STEM)
        year_lift = TEN_GODS_YEAR_LIFT[year_god]

        monthly = []
        for i, m_stem in enumerate(MONTH_STEMS, start=1):
            god = ten_gods(stem_en, m_stem)
            lift = TEN_GODS_MONTH_LIFT[god]
            monthly.append({
                'month': i,
                'month_stem': m_stem,
                'month_stem_hanzi': STEMS[m_stem]['hanzi'],
                'ten_gods': god,
                'lift': lift,
            })

        out.append({
            'stem': stem_en,
            'hanzi': info['hanzi'],
            'element': info['element'],
            'polarity': info['polarity'],
            'year_stem': YEAR_STEM,
            'year_stem_hanzi': STEMS[YEAR_STEM]['hanzi'],
            'ten_gods_year': year_god,
            'year_lift': year_lift,
            'monthly_lifts': monthly,
        })
    return out


def build_year_overview():
    return {
        'year_name': 'Fire Horse',
        'stem_branch': 'Bing-Wu (丙午)',
        'gregorian_range': {'begin': '2026-02-17', 'end': '2027-02-05'},
        'days_in_year': 354,
        'leap_month': None,
        'year_element': YEAR_ELEMENT,
        'year_sign': 'horse',
        'year_polarity': 'Yang',
        'cycle_position': '60-year-cycle: occurs once every 60 years (last: 1966; next: 2086)',
        'volatility_model': {
            'element_amplifier': ELEM_AMP,
            'distribution_stretch_k': STRETCH_K,
            'score_floor': SCORE_FLOOR,
            'score_cap': SCORE_CAP,
            'rationale': 'Double-fire amplifier (Bing year stem + Wu fire-fixed branch). Source: fire-horse-extremes-and-danger.md.',
        },
        'lunar_months': LUNAR_MONTHS,
        'core_themes': [
            'extremes', 'all-or-nothing', 'double fire', 'speed and decisiveness',
            'risk amplified', 'opportunity amplified', 'no halfway',
        ],
        'favored_industries': [
            'energy', 'defense', 'fashion and design', 'technology and innovation',
            'entrepreneurship and startups', 'sports and entertainment',
        ],
        'thrives': {
            'characteristics': [
                'bold and prepared', 'decisive action-takers', 'able to operate at speed',
                'willing to step out of comfort zone', 'good self-control (avoids burnout)',
            ],
            'signs': ['tiger', 'dog', 'sheep'],
        },
        'struggles': {
            'characteristics': [
                'timid or unprepared', 'overthinkers', 'reckless without preparation',
                'cannot maintain focus',
            ],
            'signs': ['rat', 'ox', 'monkey', 'pig'],
            'birth_elements': ['metal', 'water'],
        },
        'note_horse_month': (
            'The 5th lunar month — Wood Horse (Jia-Wu, Jun 15 to Jul 13, 2026) — '
            'is the energetic equivalent of the entire 2014 Wood Horse year condensed '
            'into ~30 days. Expected to be the most consequential month for many signs.'
        ),
    }


def main():
    here = Path(__file__).parent
    overview = build_year_overview()
    signs = build_signs_scores()
    dm_scores = build_day_master_scores()

    (here / 'year-overview.json').write_text(
        json.dumps(overview, indent=2, ensure_ascii=False) + '\n'
    )
    (here / 'signs-scores.json').write_text(
        json.dumps(signs, indent=2) + '\n'
    )
    (here / 'day-master-scores.json').write_text(
        json.dumps(dm_scores, indent=2, ensure_ascii=False) + '\n'
    )

    # Distribution summary
    lines = ['Fire Horse 2026 — Score Distribution Summary', '=' * 60, '']
    lines.append(f'{len(signs)} entries (12 signs x 5 elements)')
    lines.append(f'Each entry has 12 monthly scores -> {len(signs)*12} total cells')
    lines.append('')

    # Year scores by sign × element
    lines.append('YEARLY SCORES (60-grid, sign x element):')
    lines.append('')
    header = '  sign      ' + '   '.join(f'{e:>5}' for e in ELEMENTS) + '   |  default'
    lines.append(header)
    lines.append('  ' + '-' * (len(header) - 2))
    for sign in SIGNS:
        cells = []
        for element in ELEMENTS:
            entry = next(e for e in signs if e['sign'] == sign and e['element'] == element)
            mark = '*' if entry['is_default'] else ' '
            cells.append(f"{entry['year_score']:.3f}{mark}")
        default = next(e['year_score'] for e in signs if e['sign'] == sign and e['is_default'])
        lines.append(f'  {sign:<8}  ' + '  '.join(cells) + f'   |  {default:.3f}')
    lines.append('')
    lines.append('  * = default entry (user element = sign fixed element)')
    lines.append('')

    # Distribution stats over all 720 cells
    all_monthly = [m['score'] for e in signs for m in e['monthly_scores']]
    in_band = lambda lo, hi: sum(1 for s in all_monthly if lo <= s < hi)
    lines.append('MONTHLY-CELL DISTRIBUTION (all 720 cells):')
    lines.append(f'  min:    {min(all_monthly):.3f}')
    lines.append(f'  max:    {max(all_monthly):.3f}')
    lines.append(f'  mean:   {mean(all_monthly):.3f}')
    lines.append(f'  median: {sorted(all_monthly)[360]:.3f}')
    lines.append('')
    lines.append('  Band              | Count |  %')
    lines.append('  ' + '-' * 38)
    bands = [
        ('Peak       0.85-0.95', 0.85, 0.951),
        ('Favorable  0.70-0.85', 0.70, 0.85),
        ('Mild +     0.55-0.70', 0.55, 0.70),
        ('Neutral    0.45-0.55', 0.45, 0.55),
        ('Mild -     0.30-0.45', 0.30, 0.45),
        ('Difficult  0.15-0.30', 0.15, 0.30),
        ('Severe     0.05-0.15', 0.04, 0.15),
    ]
    for name, lo, hi in bands:
        n = in_band(lo, hi)
        pct = 100 * n / len(all_monthly)
        bar = '#' * int(pct / 2)
        lines.append(f'  {name}  | {n:>4}  | {pct:5.1f}%  {bar}')

    # Top/bottom 5 sign×element yearly scores
    lines.append('')
    lines.append('TOP 5 (sign, element):')
    for e in sorted(signs, key=lambda x: -x['year_score'])[:5]:
        flag = '*' if e['is_default'] else ' '
        lines.append(f'  {e["element"]:>5} {e["sign"]:<8}  {e["year_score"]:.3f}{flag}')
    lines.append('')
    lines.append('BOTTOM 5 (sign, element):')
    for e in sorted(signs, key=lambda x: x['year_score'])[:5]:
        flag = '*' if e['is_default'] else ' '
        lines.append(f'  {e["element"]:>5} {e["sign"]:<8}  {e["year_score"]:.3f}{flag}')

    # Compare each sign's 5-element spread
    lines.append('')
    lines.append('ELEMENT SPREAD per sign (max - min across 5 element variants):')
    for sign in SIGNS:
        entries = [e for e in signs if e['sign'] == sign]
        scores = [e['year_score'] for e in entries]
        spread = max(scores) - min(scores)
        best = max(entries, key=lambda x: x['year_score'])
        worst = min(entries, key=lambda x: x['year_score'])
        lines.append(f'  {sign:<8}  spread={spread:.3f}  best={best["element"]:<5} ({best["year_score"]:.3f})  worst={worst["element"]:<5} ({worst["year_score"]:.3f})')

    # Day Master layer
    lines.append('')
    lines.append('=' * 60)
    lines.append('DAY MASTER LAYER (Phase 2 — methodology-day-master.md)')
    lines.append('=' * 60)
    lines.append('')
    lines.append('Year-pillar lift per Day Master in Bing-Wu year:')
    lines.append('')
    lines.append(f'  {"DM":<6} {"Element":<7} {"Polarity":<6} {"10 Gods":<22} {"Year lift":>10}')
    lines.append('  ' + '-' * 56)
    for dm in dm_scores:
        lines.append(
            f'  {dm["stem"]+" "+dm["hanzi"]:<6} {dm["element"]:<7} '
            f'{dm["polarity"]:<6} {dm["ten_gods_year"]:<22} {dm["year_lift"]:+10.2f}'
        )

    # Sample composite reading: Tiger user across all 10 DMs
    lines.append('')
    lines.append('Composite year scores — Tiger (Wood default) + each DM:')
    tiger = next(e for e in signs if e['sign'] == 'tiger' and e['is_default'])
    base = tiger['year_score']
    lines.append(f'  Year-pillar baseline: Tiger Wood = {base:.3f}')
    lines.append('')
    lines.append(f'  {"DM":<10} {"+lift":>7}  {"=final":>8}  band')
    lines.append('  ' + '-' * 40)
    for dm in dm_scores:
        composite = max(SCORE_FLOOR, min(SCORE_CAP, base + dm['year_lift']))
        if composite >= 0.85:
            band = 'Peak'
        elif composite >= 0.70:
            band = 'Favorable'
        elif composite >= 0.55:
            band = 'Mild +'
        elif composite >= 0.45:
            band = 'Neutral'
        elif composite >= 0.30:
            band = 'Mild -'
        elif composite >= 0.15:
            band = 'Difficult'
        else:
            band = 'Severe'
        lines.append(
            f'  {dm["stem"]+" "+dm["hanzi"]:<10} {dm["year_lift"]:+7.2f}  '
            f'{composite:>8.3f}  {band}'
        )

    out = '\n'.join(lines) + '\n'
    (here / 'score-summary.txt').write_text(out)
    print(out)


if __name__ == '__main__':
    main()
