# Mahjong Tarot — Site Configuration

## Tech Stack
- Next.js 14 (Pages Router — NOT App Router)
- React 18
- Supabase
- CSS Modules + globals.css (custom properties)
- Static export capable
- Deploy: GitHub → Vercel or GitHub Pages

## Paths
- Website root: `/Users/davepro/Documents/Code Projects/mahjong-tarot/website/`
- Blog index: `website/pages/blog/index.jsx`
- Blog posts: `website/pages/blog/posts/{slug}.jsx`
- Blog images: `website/public/images/blog/{slug}.webp`
- Blog styles: `website/styles/BlogPost.module.css`
- Global styles: `website/styles/globals.css`
- Content source (mahjong-tarot native): `content/topics/{slug}/blog.md`
- Content source (content studio): `/Users/davepro/Documents/Code Projects/content-studio/mahjong-tarot/content/`
- Agent output staging: `agents/web-developer/output/`
- Publish log: `context/publish-log.md`

## Domain
- Production: https://mahjongtarot.com
- OG site_name: The Mahjong Mirror

## Git
- Remote: https://github.com/Mahjong-Tarot/mahjong-tarot.git
- Branch: main
- Deploy command: `cd ~/Documents/Code\ Projects/mahjong-tarot && git push origin main`

## Design System - Warm Editorial

Inspired by wellness editorial sites (mindbodygreen, Sakara, theSkimm). Target audience: middle-aged women interested in astrology, tarot, mahjong, and self-reflection. Design must feel warm, bright, inviting - not dark and heavy.

### Palette - cream dominant, navy as accent
- Midnight Indigo: #1B1F3B - headings, text, ONE dark contrast section max per page
- Mystic Fire: #C0392B - category pills, pull quote borders, pivot banner accents, breadcrumb links, CTA buttons
- Celestial Gold: #C9A84C - prediction boxes, nav hover states, section dividers
- Warm Cream: #FAF8F4 - base page background
- Soft Lavender: #C8B8D8 - secondary accents
- Light Stone: #EDEBE5 - subtle borders on cards
- Body text: #333 (not pure black)
- White: primary card and section backgrounds (not cream - white cards on cream page)

### Typography
- Headings: Playfair Display (400 italic for logo, 700 for headings)
- Body: Source Sans 3 (400, 600)
- Blog post body: 18px, line-height 1.8
- H1: 44px on blog posts, clamp(36px, 3.6vw, 52px) on home
- H2: 28-30px, H3: 22px

### Buttons
- Pill-shaped (border-radius: 100px) - not blocky squares
- Not uppercase - sentence case, 14px, font-weight 600
- Primary: red bg, white text
- Secondary: transparent with navy border, pill shape

### Cards
- White background with subtle #ebe8e2 border
- No heavy dark blocks

### Navigation
- White background, subtle bottom border (#f0ede8)
- Logo: Playfair Display italic 400 weight, 24px
- Links: Source Sans 3 600, 13px, uppercase, navy text, gold hover/active underline

### Footer
- Light warm gray (#f7f5f0), not dark navy
- Newsletter signup uses light variant (not dark)

### Blog Post Layout
- No hero images at top of posts - text-forward editorial layout
- Header: breadcrumb -> red category pill -> Playfair title -> meta -> thin divider
- Body: 720px max-width, centered
- Components: risk cards, pivot banners (red top-border on pink tint), prediction boxes (gold top-border on gold tint), pull quotes (red left-border), collapsible FAQ
- Images: small and purposeful, not decorative filler. Use side-by-side pairs in framed cards for comparisons. Prefer bright warm images.
- Related articles grid at bottom (2 posts with thumbnails)
- Every post needs: FAQ schema, internal links, external links, breadcrumb, prev/next nav

### Blog Categories
Romance, Year of the Fire Horse, Mahjong Reading, Chinese Astrology. Posts can have multiple categories (stored as array).

## Author
- Bill Hajdu — Mahjong and tarot practitioner, author of "The Mahjong Mirror"

## Blog Architecture Note — IMPORTANT
This site uses **JSX components** for blog posts (Pages Router pattern).

Each post is a full React component in `website/pages/blog/posts/{slug}.jsx`:
- Uses `Head` from `next/head` for SEO
- Uses `Image` from `next/image` for optimized images
- Uses `Nav` and `Footer` shared components
- Uses `BlogPost.module.css` for styling
- Component renders full page with metadata, content, and navigation

To publish a new post:
1. Generate JSX component (use existing `build-page` skill or manual build)
2. Save to `website/pages/blog/posts/{slug}.jsx`
3. Optimize image to WebP → `website/public/images/blog/{slug}.webp`
4. Update `website/pages/blog/index.jsx` — add post card to POSTS array
5. Update `context/publish-log.md`
6. Git commit with explicit files
7. User runs `git push origin main`

Blog categories: Mahjong and Tarot, Tarot, Mahjong Readings, Year of the Snake, Year of the Fire Horse, Blood Moon

## Existing Skills
This project already has its own skills in `.claude/skills/`:
- `build-page` — converts markdown to Next.js JSX
- `generate-image` — hero images via Nanobanana/Gemini
These can be used alongside or instead of the web developer workflow.
