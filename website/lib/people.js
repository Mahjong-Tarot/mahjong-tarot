// Server-only helpers for resolving Stripe customers ↔ public.people.
//
// The booking funnel + member subscription flows store the buyer's
// email but don't link directly to a public.people row. When the
// Stripe webhook fires, we use these helpers to find an existing
// person or create one so deals can be attributed.

const PROMOTABLE_FROM = new Set([
  'subscriber', 'lead', 'mql', 'sql', 'opportunity',
]);

/**
 * Find an existing person by email (case-insensitive) or create a
 * minimal new row. Returns the row.
 *
 * `serviceSupabase` MUST be the service-role client — the people
 * table has RLS, and we may be running in a context with no auth
 * (Stripe webhook).
 */
export async function findOrCreatePersonByEmail(serviceSupabase, {
  email,
  name = null,
  source = 'stripe',
  source_site = 'mahjongtarot.com',
}) {
  if (!email) return null;
  const normalised = email.trim().toLowerCase();

  const { data: existing, error: findErr } = await serviceSupabase
    .from('people')
    .select('id, email, name, lifecycle_stage')
    .ilike('email', normalised)
    .limit(1)
    .maybeSingle();

  if (findErr) throw findErr;
  if (existing) return existing;

  // Create — start as 'customer' since we only call this from the
  // webhook in response to a paid event.
  const { data: created, error: createErr } = await serviceSupabase
    .from('people')
    .insert({
      email: normalised,
      name: name || null,
      source,
      source_site,
      lifecycle_stage: 'customer',
      ok_to_contact: true,
    })
    .select('id, email, name, lifecycle_stage')
    .single();

  if (createErr) throw createErr;
  return created;
}

/**
 * Bump a person's lifecycle_stage to 'customer' if they're earlier
 * in the funnel. No-op if they're already customer or evangelist.
 */
export async function promoteToCustomer(serviceSupabase, personId, currentStage) {
  if (!personId) return;
  if (!PROMOTABLE_FROM.has(currentStage)) return;
  await serviceSupabase
    .from('people')
    .update({ lifecycle_stage: 'customer' })
    .eq('id', personId);
}
