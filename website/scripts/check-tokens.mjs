#!/usr/bin/env node
// npm run check:tokens — reports raw colour literals (hex, rgb(), rgba(),
// hsl(), hsla()) outside the token files. The design system lives in
// styles/globals.css (site) and app/admin/revenue/tokens.css (Revenue admin);
// everything else should read a token by name: var(--fire-500), and
// color-mix(in srgb, var(--ink) 40%, transparent) for a translucent one.
//
// Allowed by design: the two token files, and the renderers that must inline
// colours because their output leaves the page (email HTML, iframe/srcdoc
// report HTML). Exits 1 when it finds anything, so it can gate CI later.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIRS = ['app', 'components', 'entities', 'kernel', 'lib', 'pages', 'styles'];
const EXTS = /\.(css|js|jsx|mjs|ts|tsx)$/;

const ALLOW = new Set([
  // Token sources
  'styles/globals.css',
  'app/admin/revenue/tokens.css',
  'kernel/config/palette.ts',
  // Email and iframe/report renderers: colours must be inlined
  'lib/quickReadingHtml.js',
  'lib/order-notify.js',
  'lib/fp/render.mjs',
  'lib/ps/render.mjs',
  'pages/api/admin/email-reading.js',
  'pages/api/admin/generate-reading.js',
  'entities/campaigns/lib/marketing-email-template.tsx',
]);

const HEX = '#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-zA-Z_-])';
const FN = '\\b(?:rgba?|hsla?)\\(';
// CSS: any literal. JS: only inside a string literal, so "PR #1403" in a
// comment or a `#anchor` href is not a hit.
const CSS_RE = new RegExp(`${HEX}|${FN}`, 'g');
const JS_RE = new RegExp(`(['"\`])[^'"\`\\n]*?(?:${HEX}|${FN})`, 'g');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (EXTS.test(name)) out.push(p);
  }
  return out;
}

const stripCssComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));

let hits = 0;
const byFile = new Map();
for (const d of DIRS) {
  for (const file of walk(join(ROOT, d))) {
    const rel = relative(ROOT, file).split(sep).join('/');
    if (ALLOW.has(rel)) continue;
    const isCss = file.endsWith('.css');
    const text = isCss ? stripCssComments(readFileSync(file, 'utf8')) : readFileSync(file, 'utf8');
    text.split('\n').forEach((line, i) => {
      const trimmed = line.trim();
      if (!isCss && (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*'))) return;
      const re = isCss ? CSS_RE : JS_RE;
      re.lastIndex = 0;
      if (re.test(line)) {
        hits += 1;
        if (!byFile.has(rel)) byFile.set(rel, []);
        byFile.get(rel).push(`${i + 1}: ${trimmed.slice(0, 120)}`);
      }
    });
  }
}

if (hits === 0) {
  console.log('check:tokens: no raw colour literals outside the token files.');
  process.exit(0);
}
for (const [file, lines] of [...byFile].sort()) {
  console.log(`\n${file} (${lines.length})`);
  for (const l of lines) console.log(`  ${l}`);
}
console.log(`\ncheck:tokens: ${hits} line(s) in ${byFile.size} file(s) use a raw colour. Use a token from styles/globals.css.`);
process.exit(1);
