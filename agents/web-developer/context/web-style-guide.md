# Mahjong Mirror — Web Style Guide
*Version 1.1 — Updated May 2026 to match implemented design system*

> The source of truth for all tokens is `website/styles/globals.css`.
> This document describes the system as built and deployed, not an aspirational spec.

---

## Design Philosophy

Mahjong Mirror is built on confidence and stillness. The visual language borrows from editorial publishing — generous whitespace, strong typographic hierarchy, a restrained palette — and layers in the angular geometry of Mahjong tiles. Every element earns its place on the page.

The guiding tension: **ancient game, modern introspection.**

---

## Color Palette

All colors are defined as CSS custom properties in `globals.css`. Never hardcode hex values in component stylesheets — always reference a token.

### Neutral Scale

| Token | Hex | Usage |
|---|---|---|
| `--paper` / `--paper-pure` | `#FFFFFF` | Page and card surfaces |
| `--ink` | `#14161B` | Primary headings, near-black |
| `--ink-2` | `#2A2D35` | Body text |
| `--ink-3` | `#50545E` | Secondary / supporting text |
| `--ink-4` | `#8A8E98` | Captions, metadata, muted text |
| `--rule` | `#E4E5EA` | Hairlines, card borders |
| `--rule-2` | `#EFEFF2` | Softer fills, row separators |

### Brand Red (Fire) Scale

| Token | Hex | Usage |
|---|---|---|
| `--fire-500` | `#E63329` | Brand stamp — CTAs, overline accents |
| `--fire-600` | `#C8261C` | Hover state for fire elements |
| `--fire-700` | `#9E1B14` | Pressed / active state |
| `--fire-100` | `#FFE2DD` | Selection highlight, tinted backgrounds |

### Accent and Semantic

| Token | Hex | Usage |
|---|---|---|
| `--gold` | `#B8893A` | Ritual moments — thin rules, icon accents |
| `--gold-soft` | `#EBD9B0` | Hover tints on gold-accented elements |
| `--success` | `#2A8A48` | Positive ratings, save confirmations |

### Color Rules

- **Fire is earned.** Use `--fire-500` / `--fire-600` for one CTA per section. Never for decoration, borders, or backgrounds.
- **Ink anchors.** Dark sections use `--ink` as background with `--paper` text.
- **Gold warms, never shouts.** Thin dividers, icon fills. Never as a solid surface.
- **Paper is the page.** White (`#FFFFFF`), not cream. The editorial feel comes from typography and spacing, not tinted paper.

---

## Typography

All typefaces are loaded via Google Fonts in `globals.css`. Reference only via CSS custom properties.

### Typeface Stack

| Token | Typeface | Weights | Role |
|---|---|---|---|
| `var(--serif)` | **Fraunces** | 300, 400, 500, 600, 700 (+ italic) | Display, headings, pull quotes |
| `var(--sans)` | **Inter** | 400, 500, 600, 700 | Body, navigation, UI labels |
| `var(--mono)` | **JetBrains Mono** | 400, 500 | Overlines, meta labels, code |

### Type Scale (from globals.css)

```
h1   — Fraunces 400  56px / lh 1.05  ls -0.025em
h2   — Fraunces 400  40px / lh 1.1   ls -0.02em
h3   — Fraunces 500  26px / lh 1.25  ls -0.01em
h4   — Fraunces 500  20px / lh 1.3   ls -0.005em
```

```
Body large   — Inter 300    20px / lh 1.7
Body         — Inter 400    16px / lh 1.6
Strong       — Inter 600    color: --ink
Caption      — Inter 400    13px  color: --ink-3
```

```
Overline     — JetBrains Mono 500  11px  ls 0.18em  UPPERCASE  color: --fire-600
Label mono   — JetBrains Mono 500  11px  ls 0.12em  UPPERCASE  color: --ink-4
Post meta    — JetBrains Mono 400  11px  ls 0.04em  color: --ink-4
```

### Typographic Conventions

- **Overlines precede section headlines.** Use the `.overline` global class (mono, fire-600, wide tracking, uppercase).
- **Italic Fraunces in fire red** is the signature headline gesture — `<em>` inside a heading renders this automatically via globals.css.
- **Blockquotes** use Fraunces 400, 22px, with a 2px `--fire-500` left border.
- **Never justify body text.** Left-align always.
- **Paragraph spacing** = `margin-bottom: 1.25em`. Never use blank lines in markup.

---

## Grid and Spacing

### Container

```css
.container        { max-width: 1240px; padding: 0 80px; }   /* desktop */
.containerNarrow  { max-width: 960px;  padding: 0 80px; }
/* Tablet ≤1024px: outer-margin becomes 40px */
/* Mobile ≤640px:  outer-margin becomes 20px */
```

### Spacing Scale

All spacing tokens are multiples of 4px. Always use tokens — no magic numbers.

```
--space-xs:   4px
--space-sm:   8px
--space-md:  16px
--space-lg:  24px
--space-xl:  40px
--space-2xl: 64px
--space-3xl: 96px
--space-4xl: 128px
```

Sections breathe at `--space-3xl` (96px) top and bottom on desktop.

---

## Borders and Shape Language

The system uses **intentional rounding**, not sharp or fully rounded. Cards sit at `--r-md`; buttons are pill-shaped.

| Token | Value | Usage |
|---|---|---|
| `--r-sm` | `4px` | Inline badges, tiny chips |
| `--r-md` | `8px` | Cards, input fields, panels |
| `--r-lg` | `12px` | Large modal surfaces |
| `--r-pill` | `999px` | All buttons, status tags |

**`border-radius: 50%` is reserved for circular avatar/avatar-like shapes only.**

### Border Colors

- Default card border: `1px solid var(--rule)` — `#E4E5EA`
- Row separators: `1px solid var(--rule-2)` — `#EFEFF2`
- Accent divider: `2px solid var(--fire-500)` at `48px` width — use `.divider-gold` class
- Full-width rule: `1px solid var(--rule)` — use `.divider-rule` class

---

## Components

### Navigation (global)

```
Background:    var(--ink)       #14161B
Text:          var(--paper)     #FFFFFF
Logo:          Fraunces 700, 20px, --paper
Nav links:     Inter 600, 13px, ls 0.06em, uppercase
Active state:  --fire-500 underline
CTA button:    --fire-500 bg, pill shape, --paper text
```

### Buttons (use global classes from globals.css)

**Primary** `.btn-primary`
```
Background:   --fire-500
Text:         #fff, Inter 500, 14px
Padding:      12px 22px
Border-radius: --r-pill (999px)
Hover:        --fire-600 background
```

**Secondary** `.btn-secondary`
```
Background:   --ink
Text:         #fff, Inter 500, 14px
Border-radius: --r-pill
Hover:        --ink-2 background
```

**Ghost** `.btn-ghost`
```
Background:   transparent
Border:       1px solid var(--rule)
Text:         --ink, Inter 500, 14px
Border-radius: --r-pill
Hover:        border-color --ink
```

### Cards (use global `.card` class or mirror it in CSS modules)

**Standard card**
```
Background:    var(--paper-pure)   #FFFFFF
Border:        1px solid var(--rule)
Padding:       var(--space-xl)     40px
Border-radius: var(--r-md)         8px
No box-shadow by default
```

**Dark card** `.card-dark`
```
Background:   var(--ink)   #14161B
Text:         var(--paper)
Border-radius: var(--r-md)
```

### Forms and Inputs (Account.module.css `.authInput`)

```
Font:          Inter 400, 14px, --ink
Background:    var(--paper-pure)
Border:        1px solid var(--rule)
Border-radius: var(--r-md)     8px
Padding:       12px 14px
Focus:         border-color --fire-500, box-shadow 0 0 0 3px rgba(230,51,41,.12)
Error:         border-color --fire-500
```

Labels: Inter 600, 12px, `--ink-2`, no uppercase tracking (UI labels differ from `.overline` style).

### Stamps and Tags `.stamp`

```
Border:        1px solid var(--fire-500)
Color:         var(--fire-600)
Font:          JetBrains Mono 500, 10px, ls 0.16em, UPPERCASE
Border-radius: var(--r-pill)
Has a 5px fire-red dot prefix (::before)
```

---

## Section Variants

| Class | Description |
|---|---|
| `.section-dark` | `--ink` background, `--paper` text, `em` uses `--fire-400` |
| `.section-stone` | `--paper-pure` bg with top/bottom `--rule` borders |

---

## Dividers

Use sparingly. Three options:

1. **Whitespace only** — always the first choice.
2. `.divider-rule` — full-width `1px solid var(--rule)`
3. `.divider-gold` — `48px × 2px`, `--fire-500`, used before major section openers

---

## Imagery

- **Aspect ratios:** 16:9 banners, 3:2 editorial, 1:1 portraits. No non-standard crops.
- **All images** must use `next/image` with correct `alt`, `width`, and `height`.
- **Tile imagery:** crisp, geometric, flat (no drop shadows).
- **Text-over-image overlays:** `--ink` at 60–70% opacity. Never white.
- **Hero images:** `.webp` format, delivered from `website/public/images/`.

---

## Iconography

- **Line-weight only.** No filled icons.
- Stroke: `1.5px`
- Default size: `20px`. Feature: `24px`. Inline: `16px`.
- Color: context-inheriting (`--ink` on light, `--paper` on dark, `--gold` for ritual accents).
- Use geometric, angular sets — no rounded/bubbly icon families.

---

## Motion

Minimal. Deliberate. Not decorative.

```
--transition: 160ms ease    (set in :root — use this token everywhere)

Hover:        var(--transition) on color, border-color, background-color
Page entry:   opacity 0→1, translateY 12px→0, 400ms ease-out
List stagger: 80ms delay between items

Avoid: bounce, spring, elastic physics, scale on primary content
```

---

## Accessibility

- Body text must meet **WCAG AA** (4.5:1). Preferred: AAA (7:1).
- `--fire-500` on white passes AA for large text only — never use for body copy.
- `--gold` (`#B8893A`) on `--paper` fails AA — use on dark surfaces only.
- Focus ring: `2px solid var(--fire-500)`, `outline-offset: 2px` (set globally via `*:focus-visible`).
- Touch targets: minimum 44×44px for all interactive elements.

---

## What NOT to do

- Never hardcode hex values in CSS modules — use tokens.
- Never reference `Playfair Display`, `Source Sans 3`, or old palette hex values (`#1B1F3B`, `#C0392B`, `#FAF8F4`, `#C9A84C`) — these are from the v1.0 spec and have been superseded.
- Never set `border-radius: 0` globally — cards and inputs use `--r-md`.
- Never use `font-family` inline styles — always `var(--serif)`, `var(--sans)`, or `var(--mono)`.
- Never use `box-shadow` on cards unless absolutely necessary (hover lifts on marketing cards only).

---

*Mahjong Mirror Style Guide v1.1 — Updated May 2026*
*Source of truth: `website/styles/globals.css`*
