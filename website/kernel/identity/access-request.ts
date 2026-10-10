// The permission guard, under edge8-web's names (kernel/identity/access-request.ts
// there resolves roles and grants from its access tables; ADR 0014). Mahjong
// Tarot has one kind of operator: an admin by public.profiles.role. An admin
// holds every permission, anyone else holds none, so `requirePermission(atom)`
// is the admin gate and code copied from edge8-web ports unchanged.
import { redirect } from "next/navigation";
import { perRender } from "@/kernel/identity/per-render";
import { getAdminUser } from "@/kernel/identity/admin-auth";
import { supabase } from "@/kernel/data/supabase";
import type { SessionUser } from "@/kernel/identity/session-user";

export type RequestAccess = {
  readonly user: SessionUser;
  /** The admin's public.people id, matched by email; null when they have no people row. */
  readonly personId: string | null;
  readonly impersonation: null;
  may(permission: string, target?: unknown): boolean;
};

export const getAccess = perRender(async (): Promise<RequestAccess | null> => {
  const user = await getAdminUser();
  if (!user) return null;
  const { data, error } = await supabase.from("people").select("id").eq("email", user.email).maybeSingle();
  if (error) console.error("[access] people lookup failed:", error.message);
  return { user, personId: (data?.id as string | undefined) ?? null, impersonation: null, may: () => true };
});

/** The first statement of every guarded page and server action. */
export async function requirePermission(
  _permission: string,
  _target?: unknown,
  _options?: { asSignedIn?: boolean },
): Promise<RequestAccess> {
  const access = await getAccess();
  if (!access) redirect("/sign-in");
  return access;
}
