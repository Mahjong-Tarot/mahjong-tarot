# Mahjong Mirror — Web Style Guide
*Version 1.2 — Updated October 2026 to match the built system (UI review 2026-10-11)*

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
| `--ink-4` | `#6B6F79` | Captions, metadata, `.label-mono`, placeholders (5.0:1 on paper, AA) |
| `--rule` | `#E4E5EA` | Hairlines, card borders |
| `--rule-2` | `#EFEFF2` | Softer fills, row separators |

### Brand Red (Fire) Scale

| Token | Hex | Usage |
|---|---|---|
| `--fire-50` | `#FFF4F2` | Error and challenging-tone tints |
| `--fire-100` | `#FFE2DD` | Selection highlight, tinted backgrounds |
| `--fire-200`–`--fire-400` | `#FFB8AE` `#FF8B7C` `#F45A47` | Accents on dark surfaces (`em` in `.section-dark` uses `--fire-400`) |
| `--fire-500` | `#E63329` | Brand stamp — large fills (18.66px bold and up), dots, rules, focus ring |
| `--fire-600` | `#C8261C` | **Resting CTA fill**, links, small red text, `.overline` (5.6:1 with white) |
| `--fire-700` | `#9E1B14` | CTA hover / pressed, error text |
| `--fire-800` / `--fire-900` | `#75130E` `#4A0A07` | Danger-button hover; rarely needed |

### Accent and Semantic

| Token | Hex | Usage |
|---|---|---|
| `--gold` | `#B8893A` | Ritual moments — thin rules, icon accents |
| `--gold-soft` | `#EBD9B0` | Hover tints on gold-accented elements |
| `--success` | `#2A8A48` | Positive ratings, save confirmations |
| `--error-ink` / `--error-bg` / `--error-line` | fire-700 / fire-50 / fire-600 | `.error-block`, `.error-inline`, invalid fields |

### Translucent overlays

`--paper-a78` (body text on `--ink`), `--paper-a60` (muted text on ink), `--paper-a32` (hairlines on ink), `--paper-a12` (fills on ink), `--ink-a04` / `--ink-a08` (faint tints and hairlines), `--ink-a65` (scrims), `--fire-a12` (input focus ring), `--shadow-lift` (marketing-card hover only).

### Tone scale (ratings, verdicts) and elements

Five steps, each with a fill (`--tone-X`), a tint (`--tone-X-bg`) and an AA text colour (`--tone-X-ink`): `auspicious` (green, = `--success`), `favourable` (olive green), `neutral` (gold), `caution` (burnt orange), `challenging` (fire). `--tone-none` / `--tone-none-bg` cover missing data. Use them for the member dashboard ratings, compatibility tiers, almanac, horoscope and forecast verdicts. White text sits only on the `-ink` steps.

`--luck-lucky-*`, `--luck-neutral-*` and `--luck-unlucky-*` (almanac and Three Blessings verdicts) are aliases of the tone scale.

Five elements (BaZi swatches and bars, fills only): `--el-wood`, `--el-fire`, `--el-earth`, `--el-metal`, `--el-water`. `lib/bazi.js elementColor()` returns these as `var()` strings.

### Color Rules

- **Fire is earned.** Use `--fire-500` / `--fire-600` for one CTA per section. Never for decoration, borders, or backgrounds.
- **Ink anchors.** Dark sections use `--ink` as background with `--paper` text.
- **Gold warms, never shouts.** Thin dividers, icon fills. Never as a solid surface. Gold text on paper fails AA: use `--tone-neutral-ink` for small gold-family text, or `.overline.is-gold` on dark surfaces only.
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
(mono labels step up to 12px at ≤640px)
```

UI text tokens (use instead of literal px):

```
--text-2xs 10px · --text-xs 11px · --text-sm 13px · --text-md 14px
--text-base 16px · --text-lg 20px
--tracking-label 0.12em · --tracking-overline 0.18em
```

Page titles: the global `.page-header` (eyebrow + h1 lede band) sets its h1 at Fraunces 300, `clamp(40px, 5vw, 64px)`, ls -0.035em (`.is-wide` → 72px max, `.is-bounded` → 720px max width). The almanac and horoscope family uses `.page-intro` (centred overline + element h1, optional `.page-intro-lede`). Do not restyle page h1s per module.

### Typographic Conventions

- **Overlines precede section headlines.** Use the `.overline` global class (mono, fire-600, wide tracking, uppercase). Do not write new `*Eyebrow` / `sectionLabel` classes; compose `.overline` or `.label-mono`.
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
--space-sm2: 12px
--space-md:  16px
--space-lg:  24px
--space-lg2: 32px
--space-xl:  40px
--space-xl2: 48px
--space-2xl: 64px
--space-3xl: 96px
--space-4xl: 128px
```

The old `--d-1…8` scale is retired; its 12 / 32 / 48px steps became `--space-sm2` / `--space-lg2` / `--space-xl2`. Snap off-grid values (6, 10, 14, 18px) to the nearest token when you touch a rule.

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
- Accent divider: `2px solid var(--fire-500)` at `48px` width — use `.divider-fire` (`.divider-gold` is a legacy alias of the same rule)
- Full-width rule: `1px solid var(--rule)` — use `.divider-rule` class

---

## Components

### Navigation (global, `components/Nav`)

```
Promo bar:     --ink background, JetBrains Mono 11px uppercase, --paper-a78 text, fire pips
Nav bar:       --paper background, 72px tall (60px ≤768px), sticky, 1px --rule bottom border
Logo:          Fraunces 500, 22px, --ink, with a 22px square tile mark (fire centre)
Nav links:     Inter 500, 13px, ls 0.01em, sentence case, --ink-2
Hover/active:  --fire-600 text; active adds a 1px --fire-500 underline
Sign in:       Inter 400, 13px, --ink-3
CTA button:    .btn-primary at 13px / 9px 18px padding, 44px min height
Mobile:        ≤768px a 44px menu button opens a full-width panel; icons from components/Icon
```

The member area uses `components/MemberShell` (sidebar + top bar) with the same tokens.

### Buttons (use global classes from globals.css)

**Primary** `.btn-primary`
```
Background:   --fire-600   (white on --fire-500 is 4.31:1 and fails AA at 14px)
Text:         --paper, Inter 500, 14px
Padding:      12px 22px
Border-radius: --r-pill (999px)
Hover/press:  --fire-700 background
Disabled:     opacity .5, cursor not-allowed, no hover change
```

**Secondary** `.btn-secondary`
```
Background:   --ink
Text:         --paper, Inter 500, 14px
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

Modifiers: `.btn-lg` (15px, 16px 28px padding — booking and checkout CTAs), `.btn-block` (full width). Button groups sit in `.cta-row` (`.cta-row-spaced`, `.cta-row-center`).

Module-level buttons must not re-implement these. Compose the global instead:

```css
.submitBtn { composes: btn-primary btn-lg btn-block from global; margin-top: var(--space-md); }
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

### Forms and Inputs (global `.input`, `.select`, `.textarea`)

```
Font:          Inter 400, 14px, --ink   (16px at ≤640px so iOS does not zoom)
Background:    var(--paper-pure)
Border:        1px solid var(--rule)
Border-radius: var(--r-md)     8px
Padding:       12px 14px
Focus:         border-color --fire-500, box-shadow 0 0 0 3px var(--fire-a12)
Error:         aria-invalid="true" → border-color --error-line
```

Module inputs compose the global (`composes: input from global;`) and only add what differs. Never set `outline: none` without the ring.

Labels: `.field-label` — Inter 600, 12px, `--ink-2`, no uppercase tracking (UI labels differ from `.overline` style). Every control needs a programmatic label: a `<label htmlFor>`, an `aria-label`, or a visually hidden label (`.sr-only`). Placeholder text is not a label.

Errors: `.error-block` / `.error-inline` (`--error-ink` on `--error-bg`, 3px `--error-line` left rule). Module error classes compose `error-block`.

### Stamps and Tags `.stamp`

```
Border:        1px solid var(--fire-500)
Color:         var(--fire-600)
Font:          JetBrains Mono 500, 10px, ls 0.16em, UPPERCASE
Border-radius: var(--r-pill)
Has a 5px fire-red dot prefix (::before)
```

---

### Utilities

| Class | Use |
|---|---|
| `.page-section` / `.page-section-lg` | Section padding (96 / 128px; 40px on phones) |
| `.page-intro`, `.page-intro-lede` | Centred overline + h1 (almanac, horoscopes, find-a-good-day) |
| `.empty-note` | Centred italic missing-data note |
| `.cta-row` | Wrapping button group |
| `.sr-only` | Visually hidden text for screen readers |
| `.is-clickable` | Whole-row click targets in admin tables |

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
3. `.divider-fire` — `48px × 2px`, `--fire-500`, used before major section openers (`.divider-gold` is the legacy alias)

---

## Imagery

- **Aspect ratios:** 16:9 banners, 3:2 editorial, 1:1 portraits. No non-standard crops.
- **All images** must use `next/image` with correct `alt`, `width`, and `height`.
- **Tile imagery:** crisp, geometric, flat (no drop shadows).
- **Text-over-image overlays:** `--ink` at 60–70% opacity. Never white.
- **Hero images:** `.webp` format, delivered from `website/public/images/`.

---

## Iconography

- Public site and member area: `components/Icon.jsx` (inline SVG, `menu`, `close`, `caret`). Add new glyphs there; never use text glyphs (☰ × ▾) as icons.
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
- Touch targets: minimum 44×44px for all interactive elements (buttons, filter chips, share buttons, nav CTA, menu and close buttons). Use `min-height: 44px` rather than padding guesses.
- Prose links are underlined (`:where(p, li, figcaption, blockquote, td, .article, .reading) a:not([class])`, 1px, 2px offset). Colour alone is 2.46:1 against body text. Nav, footer and classed links stay undecorated.
- The base `a` rule is wrapped in `:where()` (zero specificity), so a link class never needs `!important`.
- Heading levels never skip (h1 → h2 → h3). Footer column titles are small-styled `<h2>`s.

---

## What NOT to do

- Never hardcode hex values in CSS modules or JSX — use tokens. JS colour maps return `var(--…)` strings or class names.
- Never use inline `style={{…}}` except for runtime values: a computed width/height, a data-driven series colour, an animation delay, `next/image` `objectFit`, and the spam honeypot.
- Never reference `Playfair Display`, `Source Sans 3`, or old palette hex values (`#1B1F3B`, `#C0392B`, `#FAF8F4`, `#C9A84C`) — these are from the v1.0 spec and have been superseded.
- Never set `border-radius: 0` globally — cards and inputs use `--r-md`.
- Never use `font-family` inline styles — always `var(--serif)`, `var(--sans)`, or `var(--mono)`.
- Never use `box-shadow` on cards unless absolutely necessary (hover lifts on marketing cards only).

---

## Blog Categories

The one list lives in `website/entities/site/lib/topics.ts` (`TOPICS`, re-exported by `website/lib/blogDb.js`). It drives the `/blog` filters in this order:

1. Love & Relationships
2. Money & Career
3. Forecasts & Timing (the default for an unmatched post)
4. The Mahjong Mirror

Do not invent categories in content or prompts; add one there first.

---

*Mahjong Mirror Style Guide v1.2 — Updated October 2026*
*Source of truth: `website/styles/globals.css`*
