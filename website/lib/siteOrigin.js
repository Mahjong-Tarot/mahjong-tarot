// Absolute origin for links the server sends out (Stripe redirect URLs,
// emailed reading links, magic-link redirects).
//
// Never derived from request headers: a forged Host / X-Forwarded-Host would
// otherwise put an attacker's domain into an emailed bearer link. Production
// fails closed when NEXT_PUBLIC_SITE_URL is missing; previews use the
// deployment's own VERCEL_URL, local dev uses localhost.
export function siteOrigin() {
  const configured = (process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/+$/, '');
  if (configured) return configured;
  if (process.env.VERCEL_ENV === 'production') {
    throw new Error('NEXT_PUBLIC_SITE_URL is not set.');
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT || 3000}`;
}
