// HTML sanitizers for content that ends up in dangerouslySetInnerHTML.
//
// renderBlogMarkdown: the public blog's markdown → HTML. Same pipeline as
//   entities/site/lib/posts.ts renderPostMarkdown (raw HTML parsed by
//   hast-util-raw, then judged against POST_HTML_SCHEMA), plus GFM so tables
//   keep rendering as they did under `marked`.
// sanitizeReadingHtml: private-reading HTML (model-written, then edited in the
//   staff TipTap editor). Only the tags the generate-reading prompt asks for,
//   plus the few the editor adds, survive; the only attribute is a link href
//   restricted to http/https/mailto.

import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import { toHast } from 'mdast-util-to-hast';
import { raw } from 'hast-util-raw';
import { sanitize } from 'hast-util-sanitize';
import { toHtml } from 'hast-util-to-html';
import { POST_HTML_SCHEMA } from '../kernel/config/post-html-schema';

const gfmProcessor = remark().use(remarkGfm);

export function renderBlogMarkdown(markdown) {
  const mdast = gfmProcessor.runSync(gfmProcessor.parse(markdown || ''));
  const hast = sanitize(raw(toHast(mdast, { allowDangerousHtml: true })), POST_HTML_SCHEMA);
  return toHtml(hast);
}

const READING_SCHEMA = {
  strip: ['script', 'style'],
  tagNames: [
    'h2', 'h3', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'blockquote', 'br',
    'h1', 'h4', 'hr', 'u', 's', 'code', 'pre', 'a',
  ],
  attributes: { a: ['href'] },
  protocols: { href: ['http', 'https', 'mailto'] },
  ancestors: {},
};

export function sanitizeReadingHtml(html) {
  if (!html) return '';
  const tree = raw({ type: 'root', children: [{ type: 'raw', value: String(html) }] });
  return toHtml(sanitize(tree, READING_SCHEMA));
}

// Plain text from an HTML/markdown fragment (FAQ answers render as text and
// go into JSON-LD, so they carry no markup at all).
export function toPlainText(s) {
  return String(s ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}
