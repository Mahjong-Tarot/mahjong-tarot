"use server";

import { revalidateSurfaces } from "@/kernel/shell/surface";
import { companyOs } from "@/kernel/data/supabase";
import { requireRevenueAccess } from "@/kernel/identity/revenue-access";
import { recordAudit } from "@/kernel/audit/audit";
import { getBroadcast } from "@/entities/campaigns/lib/broadcasts";

// Its own file because actions.ts sits at the 400-line cap.

type ActionResult = { ok: true } | { ok: false; error: string };

// Draft or approved -> missed: the moment passed and it never went out. Not a
// cancellation, because nobody decided against it.
export async function markBroadcastMissed(id: string): Promise<ActionResult> {
  const admin = await requireRevenueAccess();
  const campaign = await getBroadcast(id);
  if (!campaign) return { ok: false, error: "Broadcast not found." };
  if (campaign.status !== "draft" && campaign.status !== "approved") {
    return { ok: false, error: `A ${campaign.status} broadcast cannot be marked missed.` };
  }

  const now = new Date().toISOString();
  const { error } = await companyOs.from("email_campaigns").update({ status: "missed", updated_at: now })
    .eq("id", id)
    .eq("status", campaign.status);
  if (error) return { ok: false, error: error.message };

  await recordAudit({
    table: "email_campaigns",
    recordId: id,
    operation: "update",
    actor: admin.email,
    context: { missed: true, from: campaign.status },
  });
  revalidateSurfaces("/revenue/marketing");
  revalidateSurfaces("/revenue/marketing/broadcasts");
  revalidateSurfaces(`/revenue/marketing/broadcasts/${id}`);
  return { ok: true };
}
