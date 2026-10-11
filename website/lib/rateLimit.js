// Small in-memory sliding-window rate limiter for public Pages Router APIs.
//
// PER-INSTANCE ONLY: counts live in this serverless instance's memory, so
// the effective limit is `limit x warm instances`, and a cold start resets
// it. It stops a single script hammering one warm function, not a
// distributed attack. For a hard global limit add a Vercel Firewall
// rate-limit rule (or a shared store such as Upstash) in front of these
// routes.

import { createHash } from 'crypto';

const MAX_KEYS = 10_000;
const buckets = new Map(); // key -> array of hit timestamps (ms), oldest first

export function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  const first = Array.isArray(fwd) ? fwd[0] : (fwd || '').split(',')[0];
  return (
    first.trim() ||
    String(req.headers['x-real-ip'] || '').trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

// Short stable hash of the caller's IP, for keying rows without storing
// the raw address.
export function ipHash(req) {
  return createHash('sha256').update(clientIp(req)).digest('hex').slice(0, 16);
}

/**
 * Returns true when the request may proceed. When the caller is over the
 * limit it sends a 429 with Retry-After and returns false; the handler
 * should just `return`.
 *
 *   if (!rateLimit(req, res, { name: 'hold', limit: 10, windowMs: 600_000 })) return;
 */
export function rateLimit(req, res, { name, limit, windowMs }) {
  const now = Date.now();
  const key = `${name}:${clientIp(req)}`;
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);

  if (hits.length >= limit) {
    buckets.set(key, hits);
    const retryAfter = Math.max(1, Math.ceil((hits[0] + windowMs - now) / 1000));
    res.setHeader('Retry-After', String(retryAfter));
    res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
    return false;
  }

  hits.push(now);
  buckets.delete(key); // re-insert so Map order tracks recency
  buckets.set(key, hits);
  if (buckets.size > MAX_KEYS) {
    buckets.delete(buckets.keys().next().value);
  }
  return true;
}
