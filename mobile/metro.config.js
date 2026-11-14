// The app imports shared logic (lib/bazi.js, lib/reading-meta.js) straight
// from ../website so the website and the app never disagree. Metro watches
// that folder and resolves its imports (lunar-typescript) from this app.
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const websiteLib = path.resolve(projectRoot, '../website/lib');

const config = getDefaultConfig(projectRoot);
config.watchFolders = [websiteLib];
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];

// Web preview only (expo start --web, used to check layouts): the browser
// blocks cross-origin calls to the website's API, so the dev server
// forwards /api/* there. The iPhone app calls the website directly.
const SITE = (process.env.EXPO_PUBLIC_SITE_URL || 'https://www.mahjongtarot.com').replace(/\/$/, '');
config.server = config.server || {};
const prev = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware, server) => {
  const base = prev ? prev(middleware, server) : middleware;
  return async (req, res, next) => {
    if (!req.url.startsWith('/api/')) return base(req, res, next);
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const upstream = await fetch(SITE + req.url, {
      method: req.method,
      headers: { 'content-type': req.headers['content-type'] || 'application/json', authorization: req.headers.authorization || '' },
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks),
    });
    res.statusCode = upstream.status;
    res.setHeader('content-type', upstream.headers.get('content-type') || 'application/json');
    res.end(Buffer.from(await upstream.arrayBuffer()));
  };
};

module.exports = config;
