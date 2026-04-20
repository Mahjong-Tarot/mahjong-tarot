# Blog Index

Source of truth for all published blog posts. Used by the writer agent (topic planning, keyword deconfliction) and the web developer agent (build-page, blog index updates).

## Fields

- **Order** — Integer. Auto-increments with each new post. Used for prev/next navigation.
- **Slug** — Kebab-case. Matches the topic folder name in `content/topics/`, the `.jsx` filename in `website/pages/blog/posts/`, and the hero image in `website/public/images/blog/`.
- **Primary Keyword** — The SEO target keyword for this post. One keyword per post, no duplicates across posts (prevents cannibalization).
- **Blog Style** — One of the ten styles from the writer style guide: The Provocation, The Manifesto, The Explainer, The Sign-by-Sign Breakdown, The Story/Parable, The Prediction, The Listicle, The Myth Buster, The How-To/Practical Guide, The Historical Deep Dive.
- **Category** — One of: Mahjong and Tarot, Tarot, Mahjong Readings, Year of the Snake, Year of the Fire Horse, Blood Moon.
- **Date Created** — YYYY-MM-DD. The original publish date.

## Posts

| Order | Slug | Primary Keyword | Blog Style | Category | Date Created |
|-------|------|-----------------|------------|----------|--------------|
| 1 | blood-moon-rising-in-the-year-of-the-fire-horse | blood moon | The Story/Parable | Blood Moon | 2026-04-04 |
| 2 | who-has-the-most-luck-in-the-fire-horse-year | luck in the horse year | The Prediction | Year of the Fire Horse | 2026-04-05 |
| 3 | love-in-the-fire-horse-year | fire horse love | The Explainer | Year of the Fire Horse | 2026-04-06 |
| 4 | the-danger-of-love-when-fire-runs-wild | fire horse affairs | The Explainer | Year of the Fire Horse | 2026-04-11 |
| 5 | taylor-swift-travis-kelce-wedding | taylor swift travis kelce chinese astrology | The Myth Buster | Year of the Fire Horse | 2026-04-14 |
| 6 | your-love-life-in-the-fire-horse-year | fire horse year love horoscope | The Sign-by-Sign Breakdown | Year of the Fire Horse | 2026-04-15 |
| 7 | money-in-the-year-of-the-fire-horse | fire horse year money | The Provocation | Year of the Fire Horse | 2026-04-20 |
