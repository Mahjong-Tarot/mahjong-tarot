// Server-only admin auth gate. NEVER import from a client component.
//
// A request is "admin" iff it carries a valid Supabase session AND the user's
// public.profiles row has role 'admin' — the same rule as requirePage('admin')
// in lib/guards.js, which gates the Pages Router admin. company_os has RLS
// enabled with no policies and no grants to the anon key, so all marketing data
// flows through the service-role client (kernel/data/supabase). This gate —
// enforced in the admin layout and at the top of EVERY server action — is
// therefore the security boundary.
//
// It revalidates the JWT against GoTrue on every call (auth.getUser), wrapped
// in perRender() so one render resolves it once.

import { perRender } from "./per-render";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/kernel/data/supabase/server";
import { supabase } from "@/kernel/data/supabase";

export type AdminUser = { id: string; email: string };

// True if the auth user's profile is an admin. A DB error counts as "not an
// admin": fail closed.
async function isAdminUser(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("profiles lookup failed:", error.message);
    return false;
  }
  return data?.role === "admin";
}

// Returns the signed-in admin, or null if not signed in / not an admin.
export const getAdminUser = perRender(async (): Promise<AdminUser | null> => {
  const session = createSessionClient();
  const {
    data: { user },
  } = await session.auth.getUser();
  const email = user?.email?.toLowerCase();
  if (!user || !email || !(await isAdminUser(user.id))) return null;
  return { id: user.id, email };
});

// Server-side gate. Call at the top of the admin layout and every server action.
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) redirect("/sign-in");
  return user;
}
