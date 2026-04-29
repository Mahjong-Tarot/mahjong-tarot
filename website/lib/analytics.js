// Thin wrapper around Vercel Analytics so each event has a single
// named entry-point. All event names follow `e2_<verb>_<noun>` for
// easy filtering in the Vercel Analytics dashboard.
//
// All functions are best-effort — they swallow errors so analytics
// can never break a page render.

import { track } from '@vercel/analytics';

function safeTrack(name, props) {
  if (typeof window === 'undefined') return;
  try {
    track(name, props);
  } catch (_) {
    // analytics is best-effort; never let it break the page
  }
}

export function trackSearchSubmitted({ activityKey }) {
  safeTrack('e2_search_submitted', {
    activity: activityKey || 'unknown',
  });
}

export function trackResultViewed({ activityKey, date, score }) {
  safeTrack('e2_result_viewed', {
    activity: activityKey || 'unknown',
    date: date || 'unknown',
    score: typeof score === 'number' ? score : -1,
  });
}

export function trackShareClicked({ method, activityKey, date }) {
  safeTrack('e2_share_clicked', {
    method: method || 'unknown',
    activity: activityKey || 'unknown',
    date: date || 'unknown',
  });
}
