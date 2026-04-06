# Style Guide

> This file is a reference for the web-developer agent. Follow these conventions when generating HTML pages.
> For the full project style guide, see `context/web-style-guide.md` at the repository root.

## General Principles
- Clean, minimal design — let the content breathe
- Consistent spacing and typography throughout
- Mobile-friendly layouts by default

## HTML Structure
Every generated page should follow this base structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{Page Title} — Mahjong Tarot</title>
  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <header>...</header>
  <main>...</main>
  <footer>...</footer>
</body>
</html>
```

## Typography
- Use semantic heading tags: `<h1>` for the page title, `<h2>` for sections, `<h3>` for subsections
- Body text in `<p>` tags — never bare text nodes
- Use `<strong>` for emphasis, `<em>` for italics

## Images
- Always include `alt` attributes
- Use relative paths (e.g. `/assets/images/`)

## Links
- Internal links use relative paths
- External links include `target="_blank" rel="noopener noreferrer"`

## CSS
- Do not write inline styles — rely on the project stylesheet (`/styles.css`)
- Use semantic class names that reflect content, not appearance (e.g. `.card-reading`, not `.blue-box`)
