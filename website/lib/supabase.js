import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * No-op replacement for @supabase/ssr's default Web Locks–based lock.
 *
 * Background: by default, the browser client uses navigator.locks to
 * coordinate auth state (token refresh, session reads) across tabs.
 * In practice this has been observed to deadlock — once any tab
 * crashes / closes while holding the lock, every subsequent supabase
 * call in this tab hangs forever with no network activity and no
 * error. Symptom: the portal sticks on "Loading sessions…" until the
 * user fully quits and reopens the browser. Documented as Gotcha #2
 * in the original session handoff.
 *
 * Disabling the lock is safe for this app:
 *   - The portal is a single-tab workflow per user; cross-tab refresh
 *     races would be vanishingly rare.
 *   - Auth still persists via cookies (SSR-friendly).
 *   - If two refresh attempts ever did race, the worst case is one
 *     extra network call — not a deadlock.
 *
 * If we later add multi-tab features that need cross-tab auth
 * coordination, replace this with a JS-promise-based queue keyed by
 * `name` instead of returning to navigator.locks.
 */
const noLock = async (_name, _acquireTimeout, fn) => fn();

// Cookie-backed client so the same session is visible to server-side
// gates (requirePortalUser / requireAdmin) on the next request. Drop-in
// SupabaseClient API — only persistence behaviour changes vs. createClient.
//
// Additional auth options (added 2026-05-20 after watchdog still
// fired on transcript save):
//   - isSingleton: false — bypass @supabase/ssr's cached singleton
//     so the no-op lock above is always applied. Without this,
//     hot-reloads / soft navigations could hand back an older
//     client that's still using the navigator.locks default.
//   - lockAcquireTimeout: 1000 — belt-and-suspenders. If anything
//     still routes through a real lock somehow, fail fast instead
//     of waiting 15s for the UI watchdog.
export const supabase = supabaseUrl
  ? createBrowserClient(supabaseUrl, supabaseAnonKey, {
      isSingleton: false,
      auth: {
        lock: noLock,
        lockAcquireTimeout: 1000,
      },
    })
  : null;
