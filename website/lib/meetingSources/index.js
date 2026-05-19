/**
 * Meeting source adapter registry.
 *
 * Every adapter exports the same four-function shape:
 *   - startOAuth({ user_id, return_url }) → { authorize_url, state }
 *   - completeOAuth({ user_id, code, state, code_verifier }) → { ok, account_label, tokens }
 *   - listMeetings({ user_id, since, until, query }) → Array<MeetingSummary>
 *   - fetchMeeting({ user_id, external_id }) → MeetingDetail
 *
 * The portal NEVER imports adapter files directly. It always goes
 * through getActiveMeetingSource() so a future Zoom adapter is a
 * one-file addition with a one-line registry edit — no other
 * codebase changes.
 */

import * as krisp from './krisp.js';

const ADAPTERS = {
  krisp,
  // zoom,        // future — add the file + this line, no other edits
  // google_meet, // future
};

export const SUPPORTED_SOURCES = Object.keys(ADAPTERS);

/**
 * Returns { key, adapter } for the meeting source the given astrologer
 * has connected. Defaults to MEETING_SOURCE_DEFAULT (or 'krisp') if no
 * row exists. Throws if the configured source isn't in ADAPTERS.
 *
 * If multiple connections exist, the most-recently-updated wins
 * (matches the "active-source toggle" TODO in the implementation plan).
 *
 * @param {object} supabase
 * @param {string} user_id
 * @returns {Promise<{ key: string, adapter: object }>}
 */
export async function getActiveMeetingSource(supabase, user_id) {
  const { data } = await supabase
    .from('meeting_source_connections')
    .select('source')
    .eq('user_id', user_id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const key = data?.source || process.env.MEETING_SOURCE_DEFAULT || 'krisp';
  const adapter = ADAPTERS[key];
  if (!adapter) throw new Error(`Unknown meeting source: ${key}`);
  return { key, adapter };
}

/**
 * Resolve an adapter by source key. Used by the OAuth exchange route
 * which receives the source name in the request body (rather than
 * looking it up by user).
 */
export function getAdapter(source) {
  const adapter = ADAPTERS[source];
  if (!adapter) throw new Error(`Unknown meeting source: ${source}`);
  return adapter;
}
