// Client-safe (no heavy imports): used inside page components.

// JSON for a <script type="application/ld+json"> body: escapes the characters
// that could close the script element or open an HTML comment.
export function jsonLdString(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}
