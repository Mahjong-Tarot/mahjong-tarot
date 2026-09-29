"use server";

import { revalidateSurfaces } from "@/kernel/shell/surface";
import { companyOs } from "@/kernel/data/supabase";
import { requireRevenueAccess } from "@/kernel/identity/revenue-access";
import { recordAudit } from "@/kernel/audit/audit";
import { zodIssuesToMessage } from "@/kernel/config/schemas";
import { resolveAudience } from "@/entities/campaigns/lib/broadcasts";
import { audienceRulesSchema, resolveAudienceIds } from "@/entities/campaigns/lib/audiences";

type ActionResult = { ok: true } | { ok: false; error: string };

function refresh(id?: string) {
  revalidateSurfaces("/revenue/marketing/audiences");
  if (id) revalidateSurfaces(`/revenue/marketing/audiences/${id}`);
}

export async function createAudience(input: { name: string }): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const admin = await requireRevenueAccess();
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Give the audience a name." };

  const { data, error } = await companyOs.from("email_audiences").insert({ name, rules: {}, created_by: admin.email })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "Audience was not created." };
  await recordAudit({ table: "email_audiences", recordId: data.id, operation: "insert", actor: admin.email, context: { name } });
  refresh(data.id);
  return { ok: true, id: data.id };
}

export async function updateAudience(id: string, input: { name: string; rules: unknown }): Promise<ActionResult> {
  const admin = await requireRevenueAccess();
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Name cannot be empty." };
  const rules = audienceRulesSchema.safeParse(input.rules);
  if (!rules.success) return { ok: false, error: zodIssuesToMessage(rules.error.issues) };

  const { error } = await companyOs.from("email_audiences").update({ name, rules: rules.data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  await recordAudit({ table: "email_audiences", recordId: id, operation: "update", actor: admin.email, newData: { name, rules: rules.data } });
  refresh(id);
  return { ok: true };
}

// Who the rules reach right now, after consent and do-not-contact: the same
// resolution a broadcast build uses, so the preview is the list you would get.
export async function previewAudience(input: { rules: unknown }): Promise<{ ok: true; count: number; names: string[] } | { ok: false; error: string }> {
  await requireRevenueAccess();
  const rules = audienceRulesSchema.safeParse(input.rules);
  if (!rules.success) return { ok: false, error: zodIssuesToMessage(rules.error.issues) };

  const { ids, error } = await resolveAudienceIds(rules.data);
  if (error) return { ok: false, error };
  const { members, error: resolveError } = await resolveAudience({}, null, ids);
  if (resolveError) return { ok: false, error: resolveError };
  const names = members.map((m) => (m.name ? `${m.name} <${m.email}>` : m.email)).sort((a, b) => a.localeCompare(b));
  return { ok: true, count: members.length, names };
}
