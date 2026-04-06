# Mahjong Mirror — Web Style Guide
*Editorial aesthetic inspired by Brené Brown's site. Version 1.0*

---

## Design Philosophy

Mahjong Mirror is built on confidence and stillness. The visual language borrows from editorial publishing — generous whitespace, strong typographic hierarchy, a restrained palette — and layers in the angular geometry of Mahjong tiles. Nothing is soft or rounded. Every element earns its place on the page.

The guiding tension: **ancient game, modern introspection.**

---

## Color Palette

### Primary Colors

| Name | Hex | Usage |
|---|---|---|
| Midnight Indigo | `#1B1F3B` | Primary headings, dark sections, footer backgrounds |
| Mystic Fire | `#C0392B` | CTAs only, overline accents — never decorative |
| Celestial Gold | `#C9A84C` | Secondary highlights, dividers, icon accents |
| Warm Cream | `#FAF8F4` | Page background — the "paper" the site is printed on |
| Black | `#0D0D0D` | Body text |

### Supporting Colors

| Name | Hex | Usage |
|---|---|---|
| Soft Lavender | `#C8B8D8` | Hover states, tints, subtle supporting tone — never a primary surface |
| Light Stone | `#EDEBE5` | Card backgrounds, inset sections, subtle separation |
| Mid Gray | `#888880` | Captions, metadata, placeholder text |

### Color Rules

- **Mystic Fire is earned.** Use it for one CTA per section, never for decoration, borders, or backgrounds. It signals action.
- **Midnight Indigo anchors.** Dark sections, primary H1s, and the global nav all live here. It grounds the page.
- **Celestial Gold warms, never shouts.** Thin rule lines, icon fills, subtle highlights. Never as a background unless the element is very small.
- **Lavender supports, never leads.** Hover backgrounds, light-wash tints on cards. It should feel like a whisper.
- **Warm Cream is the page.** Not white. The slight warmth is intentional — it reads as paper, not screen.

---

## Typography

### Typeface Pairing

| Role | Typeface | Weights | Notes |
|---|---|---|---|
| Display / Headings | **Playfair Display** | 400, 700, 900 | Serif. Carries gravitas at large sizes. |
| Body / Navigation | **Source Sans 3** | 300, 400, 600 | Clean workhorse. Handles everything else. |

### Type Scale

```
Display (H1)     Playfair Display 700    56px / line-height 1.1    letter-spacing -0.02em
Section (H2)     Playfair Display 700    40px / line-height 1.15   letter-spacing -0.01em
Subhead (H3)     Playfair Display 400    28px / line-height 1.3
Overline         Source Sans 3 600       11px / line-height 1.4    letter-spacing 0.14em   ALL CAPS
Body Large       Source Sans 3 300       20px / line-height 1.7
Body             Source Sans 3 400       17px / line-height 1.75
Caption          Source Sans 3 400       13px / line-height 1.6    color: #888880
Navigation       Source Sans 3 600       14px / line-height 1      letter-spacing 0.06em
CTA / Button     Source Sans 3 600       14px / line-height 1      letter-spacing 0.08em   ALL CAPS
```

### Typographic Conventions

- **Overlines precede section headlines.** Set in Source Sans 3 600, 11px, tracked wide, uppercase, Mystic Fire. Example: `SELF-REFLECTION` above a features heading.
- **Pull quotes** use Playfair Display 400 italic at 28–36px, Midnight Indigo, with a Celestial Gold left-border rule (3px).
- **Never justify body text.** Left-align always.
- **Paragraph spacing** equals 1.25× the line height. Never use extra blank lines — control spacing in CSS.

---

## Grid & Spacing

### Grid

- **Desktop:** 12-column grid, 1200px max-width, 24px gutters, 80px outer margin
- **Tablet:** 8-column, 40px outer margin
- **Mobile:** 4-column, 20px outer margin

### Spacing Scale

Based on an 8px base unit:

```
4px    —  xs  (tight label gaps, icon padding)
8px    —  sm  (inline element gaps)
16px   —  md  (paragraph spacing, form fields)
24px   —  lg  (component internal padding)
40px   —  xl  (between related components)
64px   —  2xl (section interior padding)
96px   —  3xl (between major page sections)
128px  —  4xl (hero sections, editorial breathing room)
```

### Whitespace Philosophy

Whitespace is not empty space — it is structure. When in doubt, add more. Sections breathe at `96px` top and bottom on desktop. The editorial feel lives in the margins.

---

## Borders & Shape Language

**No rounded corners. Anywhere.**

Every border-radius is `0`. This is non-negotiable. The hard edge references Mahjong tile geometry and holds the editorial seriousness of the design. Rounded corners read as friendly/casual — this brand is confident and considered.

| Element | Border |
|---|---|
| Buttons | `0` border-radius, `2px solid` border |
| Cards | `0` border-radius, no border (use background contrast) |
| Input fields | `0` border-radius, `1px solid #888880` border |
| Dividers | `1px solid #EDEBE5` or `2px solid #C9A84C` (accent) |
| Pull quote rule | `3px solid #C9A84C` left border |

---

## Components

### Navigation

```
Background:     #1B1F3B  (Midnight Indigo)
Text:           #FAF8F4  (Warm Cream)
Height:         64px desktop, 56px mobile
Logo:           Playfair Display 700, 20px, Warm Cream
Nav links:      Source Sans 3 600, 13px, tracked 0.06em, uppercase
Hover state:    Celestial Gold underline (2px, bottom offset 4px)
Active state:   Mystic Fire underline
CTA button:     Mystic Fire background, Warm Cream text, 0 border-radius
```

No drop shadow on the nav. It sits flush against the page.

### Buttons

**Primary (CTA)**
```
Background:     #C0392B  (Mystic Fire)
Text:           #FAF8F4, Source Sans 3 600, 13px, tracked 0.08em, uppercase
Padding:        14px 32px
Border:         none
Border-radius:  0
Hover:          background #A93226 (10% darker)
```

**Secondary (Ghost)**
```
Background:     transparent
Text:           #1B1F3B, Source Sans 3 600, 13px, tracked 0.08em, uppercase
Padding:        12px 30px
Border:         2px solid #1B1F3B
Border-radius:  0
Hover:          background #1B1F3B, text #FAF8F4
```

**Tertiary (Text link)**
```
Color:          #1B1F3B
Text:           Source Sans 3 600, underline
Hover:          color #C0392B
```

### Cards

Cards use background contrast against the page — no box shadows unless absolutely necessary.

**Standard Card**
```
Background:     #EDEBE5  (Light Stone)
Padding:        40px
Border-radius:  0
Border:         none
Overline:       Source Sans 3 600, 11px, Mystic Fire, tracked 0.14em
Heading:        Playfair Display 700, 24px, Midnight Indigo
Body:           Source Sans 3 400, 17px, #0D0D0D
```

**Feature Card (dark)**
```
Background:     #1B1F3B  (Midnight Indigo)
Text:           #FAF8F4
Heading:        Playfair Display 700, 28px
Accent detail:  Celestial Gold overline or thin rule
```

### Forms & Inputs

```
Label:          Source Sans 3 600, 12px, tracked 0.08em, uppercase, #0D0D0D
Input:          Source Sans 3 400, 17px, #0D0D0D
Background:     #FAF8F4
Border:         1px solid #888880
Border-radius:  0
Padding:        12px 16px
Focus state:    border-color #1B1F3B, outline none
Error state:    border-color #C0392B
```

### Section Dividers

Use sparingly. Three acceptable dividers:

1. **Whitespace only** — the preferred option. Sections breathe.
2. **Light rule:** `1px solid #EDEBE5` — subtle page division
3. **Gold accent rule:** `2px solid #C9A84C` at 80px width, centered — used before major section openers

---

## Imagery Guidelines

- **Photography:** High contrast, editorial tone. Desaturated or muted color treatment preferred. No stock photo aesthetic.
- **Aspect ratios:** 16:9 for banners, 3:2 for editorial, 1:1 for portraits. Never crop to non-standard ratios.
- **Tile imagery:** Mahjong tile illustrations should be crisp, geometric, and rendered at sufficient resolution. No drop shadows on tiles — let them sit flat.
- **Overlays:** When text sits over imagery, use a Midnight Indigo overlay at 60–70% opacity. Never white overlays.

---

## Iconography

- Line-weight icons only. No filled icons.
- Stroke weight: `1.5px`
- Size: `20px` default, `24px` for feature contexts, `16px` inline with text
- Color: inherits from context (Midnight Indigo on light, Warm Cream on dark, Celestial Gold for accent icons)
- No icon libraries with rounded shapes. Use geometric, angular icon sets.

---

## Motion & Animation

Minimal. Every transition should feel deliberate, not decorative.

```
Default transition:   all 200ms ease-out
Hover transitions:    200ms ease-out
Page entrances:       opacity 0 → 1, translateY 12px → 0, 400ms ease-out
Stagger delay:        80ms between list items
Avoid:                bounce, elastic, or any spring physics
```

Never animate size, rotation, or scale in the nav or primary content. Animation is for reinforcement, not entertainment.

---

## Voice & Tone (Design Expression)

The visual language reflects the written voice:

- **Confident, not loud.** Whitespace speaks. Don't fill every pixel.
- **Thoughtful, not slow.** Information is scannable. Hierarchy is clear.
- **Grounded, not heavy.** Midnight Indigo is used with intention — the page shouldn't feel oppressive.
- **Warm, not cute.** The Warm Cream background and Celestial Gold accents add warmth. No pastels, no playful flourishes.

---

## Accessibility

- All body text must meet **WCAG AA** contrast minimum (4.5:1). Preferred: AAA (7:1).
- Mystic Fire `#C0392B` on Warm Cream `#FAF8F4` passes AA for large text only — **never use for body copy**.
- Celestial Gold `#C9A84C` on dark backgrounds only — fails on light.
- Focus states: `2px solid #C9A84C` outline, `2px offset` — visible, on-brand.
- All interactive elements minimum touch target: `44×44px`.

---

*Mahjong Mirror Style Guide v1.0 — Last updated April 2026*
