import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "./supabase/database.types";

// The jsonb value type, re-exported so a caller writing a jsonb column can name
// the shape the generated row type expects without reaching past this door.
export type { Json };

// Server-only Supabase client for the mahjong-tarot project. Uses the
// service-role key, which bypasses RLS. NEVER import from a client component.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  console.warn(
    "Supabase env vars not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY). Database features will not work."
  );
}

export const supabase = createClient<Database>(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseSecretKey || "placeholder-key",
  {
    auth: { persistSession: false },
  }
);

// Query builder scoped to the `company_os` schema: the marketing platform's
// tables, plus `company_os.people`, a view over public.people
// (website/supabase/053_company_os_foundation.sql). Storage stays on the base
// `supabase` client (buckets are schema-independent).
export const companyOs = supabase.schema("company_os");

// The query builders with the schema types dropped, for helpers that take a
// table name as a runtime string.
export const supabaseUntyped = supabase as unknown as SupabaseClient;
export const companyOsUntyped = supabaseUntyped.schema("company_os");

// Supabase's type generator renders a SQL argument declared `DEFAULT NULL` as
// optional but not nullable (`p_note?: string`), so a call that passes an
// explicit `null` — which PostgREST forwards, and the function accepts — fails
// to type-check even though it is exactly what the function was written for.
// Wrapping the argument object restores the nullability the generator dropped,
// while still checking the argument NAMES against the function's signature.
export function rpcArgs<T extends Record<string, unknown>>(
  args: T,
): { [K in keyof T]: Exclude<T[K], null> } {
  return args as { [K in keyof T]: Exclude<T[K], null> };
}

// Row/Insert/Update shapes for a `company_os` table, so an action's patch
// accumulator can name the table it writes instead of `Record<string, unknown>`
// — which, now that the clients are typed, would silently opt that write out of
// PostgREST's column checking.
export type CompanyOsUpdate<T extends keyof Database["company_os"]["Tables"]> =
  Database["company_os"]["Tables"][T]["Update"];
export type CompanyOsInsert<T extends keyof Database["company_os"]["Tables"]> =
  Database["company_os"]["Tables"][T]["Insert"];
