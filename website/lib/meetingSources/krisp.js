/**
 * Krisp adapter — implements the meeting source interface against
 * Krisp's MCP server (https://mcp.krisp.ai/mcp). OAuth 2.0 with PKCE.
 * Endpoints discovered at runtime via .well-known so no hardcoded URLs.
 *
 * Env vars (all NEXT_PUBLIC_* because the OAuth client ID and the
 * redirect URI are not secrets and need to be visible in both browser
 * and API-route contexts):
 *   - NEXT_PUBLIC_KRISP_OAUTH_CLIENT_ID
 *   - NEXT_PUBLIC_KRISP_OAUTH_REDIRECT_URI
 *     (defaults to `${origin}/portal/settings/meeting-source/callback?source=krisp`)
 *
 * Public scope identifiers:
 *   - SOURCE_KEY  = 'krisp'
 *   - PROTECTED_RESOURCE_URL = the MCP endpoint we'll ultimately call
 *
 * Storage of PKCE verifier + state between the startOAuth redirect and
 * the callback page uses sessionStorage so it survives the cross-site
 * round trip but doesn't persist across browser sessions.
 */

const SOURCE_KEY = 'krisp';
const PROTECTED_RESOURCE_URL = 'https://mcp.krisp.ai/mcp';
const PKCE_STORAGE_KEY = 'krisp.oauth.pkce';

// ─── PKCE helpers (Web Crypto API) ────────────────────────────────

function randomString(length = 64) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

function base64UrlEncode(input) {
  // input: Uint8Array or ArrayBuffer
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function pkceChallenge(verifier) {
  const buf = new TextEncoder().encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return base64UrlEncode(hash);
}

// ─── OAuth endpoint discovery ─────────────────────────────────────

async function discoverEndpoints() {
  // 1. Get the authorization server from the protected resource's metadata
  const prRes = await fetch(`${PROTECTED_RESOURCE_URL}/.well-known/oauth-protected-resource`);
  if (!prRes.ok) {
    throw new Error(`Krisp OAuth discovery failed (protected-resource ${prRes.status})`);
  }
  const prMeta = await prRes.json();
  const authServer = prMeta?.authorization_servers?.[0];
  if (!authServer) throw new Error('Krisp OAuth discovery: no authorization_servers in metadata');

  // 2. Fetch the authorization server's metadata for the actual endpoints
  const asRes = await fetch(`${authServer.replace(/\/$/, '')}/.well-known/oauth-authorization-server`);
  if (!asRes.ok) {
    throw new Error(`Krisp OAuth discovery failed (authorization-server ${asRes.status})`);
  }
  const asMeta = await asRes.json();
  if (!asMeta.authorization_endpoint || !asMeta.token_endpoint) {
    throw new Error('Krisp OAuth discovery: missing authorization_endpoint or token_endpoint');
  }
  return {
    authorization_endpoint: asMeta.authorization_endpoint,
    token_endpoint: asMeta.token_endpoint,
    scopes_supported: asMeta.scopes_supported || [],
  };
}

// ─── Config helpers ───────────────────────────────────────────────

function clientId() {
  const id = process.env.NEXT_PUBLIC_KRISP_OAUTH_CLIENT_ID;
  if (!id) {
    throw new Error('NEXT_PUBLIC_KRISP_OAUTH_CLIENT_ID is not configured. Add it to Vercel env vars.');
  }
  return id;
}

function redirectUri() {
  const env = process.env.NEXT_PUBLIC_KRISP_OAUTH_REDIRECT_URI;
  if (env) return env;
  if (typeof window === 'undefined') {
    throw new Error('NEXT_PUBLIC_KRISP_OAUTH_REDIRECT_URI must be set for server-side OAuth exchange.');
  }
  return `${window.location.origin}/portal/settings/meeting-source/callback?source=${SOURCE_KEY}`;
}

// ─── Interface methods ────────────────────────────────────────────

/**
 * Begin the OAuth flow client-side. Generates a PKCE pair, stores
 * the verifier + state in sessionStorage, builds the authorization
 * URL, and returns it so the caller can redirect the browser.
 *
 * @param {object} args
 * @param {string} [args.user_id]    — informational; tokens get attached server-side via auth cookie
 * @param {string} [args.return_url] — where to send the user once OAuth completes (defaults to settings page)
 * @returns {Promise<{ authorize_url: string, state: string }>}
 */
export async function startOAuth({ user_id, return_url } = {}) {
  if (typeof window === 'undefined') {
    throw new Error('krisp.startOAuth must be called in the browser.');
  }
  const { authorization_endpoint, scopes_supported } = await discoverEndpoints();
  const verifier = randomString(64);
  const challenge = await pkceChallenge(verifier);
  const state = randomString(24);
  const finalReturn = return_url || '/portal/settings/meeting-source';

  // Stash the verifier + state so the callback page can complete the flow.
  sessionStorage.setItem(
    PKCE_STORAGE_KEY,
    JSON.stringify({ verifier, state, return_url: finalReturn, user_id: user_id ?? null }),
  );

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId(),
    redirect_uri: redirectUri(),
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state,
  });
  // Request all advertised scopes — Krisp's authorization server decides
  // which apply. If empty, the server's default scopes are used.
  if (scopes_supported.length) {
    params.set('scope', scopes_supported.join(' '));
  }

  return {
    authorize_url: `${authorization_endpoint}?${params.toString()}`,
    state,
  };
}

/**
 * Read the stored PKCE state from sessionStorage. Used by the callback
 * page to retrieve the verifier + state for token exchange.
 * Returns null if nothing's stored or it's been consumed.
 */
export function readStoredPkce() {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(PKCE_STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

/** Clear the stored PKCE state. Call after successful exchange or on error. */
export function clearStoredPkce() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(PKCE_STORAGE_KEY);
}

/**
 * Complete the OAuth flow server-side. Exchanges the authorization
 * code for access + refresh tokens by POSTing to Krisp's token
 * endpoint. Returns the tokens plus an account label for display.
 *
 * Called from the /api/portal/meeting-source/oauth-exchange route.
 *
 * @param {object} args
 * @param {string} args.code           — authorization code from Krisp callback
 * @param {string} args.code_verifier  — PKCE verifier from sessionStorage
 * @returns {Promise<{ ok: true, account_label: string|null, tokens: { access_token, refresh_token?, expires_in? } }>}
 */
export async function completeOAuth({ code, code_verifier }) {
  if (!code || !code_verifier) {
    throw new Error('krisp.completeOAuth: missing code or code_verifier');
  }
  const { token_endpoint } = await discoverEndpoints();

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    code_verifier,
    client_id: clientId(),
    redirect_uri: redirectUri(),
  });

  const res = await fetch(token_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Krisp token exchange failed (${res.status}): ${text.slice(0, 500)}`);
  }
  let payload;
  try { payload = JSON.parse(text); } catch {
    throw new Error('Krisp token exchange returned non-JSON response.');
  }
  if (!payload.access_token) {
    throw new Error('Krisp token exchange returned no access_token.');
  }

  return {
    ok: true,
    account_label: payload.email || payload.account || null,
    tokens: {
      access_token: payload.access_token,
      refresh_token: payload.refresh_token || null,
      expires_in: payload.expires_in || null,
    },
  };
}

// ─── Stubs for PR #6 ──────────────────────────────────────────────

export async function listMeetings(/* { user_id, since, until, query } */) {
  throw new Error('krisp.listMeetings: not implemented yet — ships in PR #6.');
}

export async function fetchMeeting(/* { user_id, external_id } */) {
  throw new Error('krisp.fetchMeeting: not implemented yet — ships in PR #6.');
}
