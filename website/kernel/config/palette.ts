// Brand palette for renderers that cannot read CSS custom properties:
// Open Graph images (Satori, via entities/site/lib/ogRender.js), QR codes, and HTML email
// sent to external inboxes. Everything rendered in the browser must use the
// tokens instead. In mahjong-tarot the values are the site's brand tokens
// (styles/globals.css): slate ink, Fire red (#E63329) where edge8 has blue,
// and gold where edge8 has mint/violet. The key names stay edge8's so the
// ported renderers read them unchanged.
import palette from "./palette.json";

export const PALETTE = palette as Readonly<typeof palette>;
