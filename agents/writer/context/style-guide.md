# MahjongMirror Style Guide
> Brand design system for mahjongtarot.com · Extracted April 2026
> Reference this file when building post.html pages or describing visual style to the writer agent.

---

## Brand Summary

MahjongTarot.com is an East-meets-West spiritual guidance brand. The visual language blends classical Western elegance (Cormorant Garamond serifs, refined whitespace) with rich Chinese cultural symbolism (dragon motifs, gold and crimson, celestial imagery). Every design decision should feel both timeless and alive.

---

## Design Tokens

### Colors
```css
:root {
  --navy:     #0A053D;  /* Primary — headings, text, nav */
  --crimson:  #FF2A04;  /* Energy — primary CTA, fire accents */
  --gold:     #F4C76E;  /* Prestige — secondary CTA, stars, highlights */
  --lavender: #A89BFF;  /* Mystery — soft decorative accents */
  --cream:    #ECE1D8;  /* Warmth — card fills, soft backgrounds */
  --white:    #FFFFFF;  /* Space — page backgrounds */
  --gray:     #727272;  /* Utility — meta text, muted labels */
}
```

### Gradients
```css
/* Hero gradient title */
background: linear-gradient(135deg, var(--crimson), var(--gold));
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;

/* Navy band (intro section) */
background: var(--navy);

/* Subtle card glow */
box-shadow: 0 4px 24px rgba(10, 5, 61, 0.08);
```

---

## Typography

### Font Stack
```css
--font-display: 'Cormorant Garamond', cormorantgaramond, serif;
--font-body:    'Gilroy Light', 'DIN Next W01 Light', sans-serif;
--font-meta:    'DIN Next W01 Light', Arial, sans-serif;
```

### Google Fonts Import (for circle.html)
```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,700&display=swap" rel="stylesheet">
```
> Note: Gilroy is a custom web font on Wix. For circle.html, use `Inter` (Google Fonts) as the body substitute — it is clean, modern, and pairs well with Cormorant Garamond.

### Type Scale
| Token | Font | Size | Line Height | Weight |
|-------|------|------|-------------|--------|
| `--text-hero` | Cormorant Garamond | 72–96px | 1em | 300 |
| `--text-h1` | Cormorant Garamond | 48px | 1.1em | 300 |
| `--text-h2` | Cormorant Garamond | 36px | 1.1em | 300 |
| `--text-h3` | Cormorant Garamond | 24px | 1.2em | 700 italic |
| `--text-lead` | Inter | 20px | 1.5em | 600 |
| `--text-body` | Inter | 17px | 1.7em | 400 |
| `--text-meta` | Inter | 13px | 1.4em | 400 |

---

## Component Library

### Pill Badge (eyebrow label above hero title)
```html
<span class="eyebrow">Chinese Astrology · Year of the Fire Horse</span>
```
```css
.eyebrow {
  font: var(--text-meta);
  color: var(--gold);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  border: 1px solid var(--gold);
  border-radius: 999px;
  padding: 4px 14px;
}
```

### Primary Button
```html
<a class="btn-primary" href="#">Schedule a Reading</a>
```
```css
.btn-primary {
  background: var(--crimson);
  color: var(--white);
  border-radius: 999px;
  padding: 14px 32px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.04em;
}
```

### Secondary Button
```css
.btn-secondary {
  background: var(--gold);
  color: var(--navy);
  border-radius: 999px;
  padding: 14px 32px;
}
```

### Navy Intro Band
```html
<section class="intro-band">
  <p>Hook sentence or thesis that opens the post with impact.</p>
</section>
```
```css
.intro-band {
  background: var(--navy);
  color: var(--cream);
  padding: 60px 40px;
  font-size: 22px;
  line-height: 1.6;
  text-align: center;
}
```

### Content Card
```css
.card {
  background: var(--white);
  border: 1px solid var(--cream);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 24px rgba(10, 5, 61, 0.06);
}
```

### Section Divider
```html
<div class="divider">✦</div>
```
```css
.divider {
  text-align: center;
  color: var(--gold);
  font-size: 20px;
  margin: 40px 0;
  opacity: 0.6;
}
```

---

## circle.html Page Structure

Every blog post's `circle.html` file must follow this section order:

```
1. Hero           — eyebrow pill + gradient title + subtitle + topic pills
2. Intro Band     — navy background, hook sentence / thesis
3. Content        — cards, steps, callouts matching the blog format
4. CTA Section    — link to book a reading or explore the full site
5. Author Block   — Dave's name, credential line, avatar (optional)
6. Footer         — site name, nav links, copyright
```

### Page Max Width
- Content column: `760px` max-width, centered
- Full-bleed sections (intro band, CTA): `100vw`

---

## Image Guidelines

### Hero / Cover Images
- Aspect ratio: **16:9** (circle.html), **1:1** (blog card thumbnails)
- Style: Cinematic AI art — Chinese zodiac animals, elemental energy
- Mood palette: Deep navy/black backgrounds, gold and amber light, fire and celestial
- Never: generic stock photography, Western astrology imagery, clipart

### Zodiac Visual Language
- Fire signs: warm amber, orange flames, dynamic motion
- Water signs: deep teal, moonlight, fluid forms
- Earth signs: rich brown, stone, grounded and still
- Metal signs: silver, sharp geometry, clean lines
- Wood signs: jade green, organic growth, branching forms

---

## Voice & Tone

### Brand Voice in Three Words
**Warm. Mystical. Grounded.**

### Writing Rules
1. Open with something that makes the reader feel *seen*
2. Use "you" — speak to one person, not a crowd
3. Chinese Astrology content must come exclusively from provided source material
4. No invented interpretations, no Western astrology crossover (unless directed)
5. Current events, holidays, and seasonal dates may be woven in for timely context
6. Close with a clear takeaway or next step — never a vague ending

### Tone Examples
| ✅ On-brand | ❌ Off-brand |
|------------|-------------|
| "The Snake moves quietly. So should you." | "Your Mercury placement affects your chi." |
| "This is the year to choose depth over speed." | "The universe is sending you signs!" |
| "What the Rabbit sees, the Tiger overlooks." | "Everything happens for a reason." |

---

## Layout Spacing
```css
--space-xs:  8px;
--space-sm:  16px;
--space-md:  32px;
--space-lg:  64px;
--space-xl:  96px;
--space-xxl: 128px;
```
