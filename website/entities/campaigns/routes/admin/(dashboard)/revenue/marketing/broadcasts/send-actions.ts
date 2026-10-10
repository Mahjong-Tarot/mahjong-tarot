"use server";

import { revalidateSurfaces } from "@/kernel/shell/surface";
import { companyOs } from "@/kernel/data/supabase";
import { requirePermission } from "@/kernel/identity/access-request";
import { recordAudit } from "@/kernel/audit/audit";
import type { Result } from "@/kernel/data/result";
import { getBroadcast } from "@/entities/campaigns/lib/broadcasts";
import { letterManualStart, letterSentByHand } from "@/entities/campaigns/lib/letter/send-step";

// A broadcast's send by hand: Start sending and Pause. Split from ./actions at
// the file-size cap when both learned the letter's approval (Y.17 review): a
// letter at ready has no approval to send on, a scheduled one sends at its
// window and starts early only while still the version approved, and once a
// person has started or paused a scheduled letter its run is past its send, so
// the agent driver never releases it a second time.

function refresh(id: string) {
  revalidateSurfaces("/revenue/marketing");
  revalidateSurfaces("/revenue/marketing/broadcasts");
  revalidateSurfaces(`/revenue/marketing/broadcasts/${id}`);
}

// Approved -> sending. Separate from approve so the send is a second, deliberate
// press: approving says "this copy is right", starting says "go now".
export async function startSending(id: string): Promise<Result> {
  const { user: admin } = await requirePermission("campaigns.marketing");
  const campaign = await getBroadcast(id);
  if (!campaign) return { ok: false, error: "Broadcast not found." };
  if (campaign.status !== "approved") {
    return { ok: false, error: "Only an approved broadcast can start sending." };
  }
  const refused = await letterManualStart(id);
  if (refused) return { ok: false, error: refused };

  const now = new Date().toISOString();
  const { error } = await companyOs.from("email_campaigns").update({ status: "sending", updated_at: now })
    .eq("id", id)
    .eq("status", "approved");
  if (error) return { ok: false, error: error.message };
  const unclosed = await letterSentByHand(id);

  await recordAudit({
    table: "email_campaigns",
    recordId: id,
    operation: "update",
    actor: admin.email,
    context: { sending: true },
  });
  refresh(id);
  return unclosed ? { ok: false, error: unclosed } : { ok: true };
}

// Sending -> approved. The send cron only works on a sending broadcast, so
// this stops the next batch; Start sending resumes it where it left off.
export async function pauseBroadcast(id: string): Promise<Result> {
  const { user: admin } = await requirePermission("campaigns.marketing");
  const campaign = await getBroadcast(id);
  if (!campaign) return { ok: false, error: "Broadcast not found." };
  if (campaign.status !== "sending") return { ok: false, error: "Only a broadcast that is sending can be paused." };
  const now = new Date().toISOString();
  const { error } = await companyOs.from("email_campaigns").update({ status: "approved", updated_at: now }).eq("id", id).eq("status", "sending");
  if (error) return { ok: false, error: error.message };
  // A letter still scheduled (the driver's release raced this pause) is past
  // its send now: a paused letter resumes only by a person's Start sending.
  const unclosed = await letterSentByHand(id);
  await recordAudit({ table: "email_campaigns", recordId: id, operation: "update", actor: admin.email, context: { paused: true } });
  refresh(id);
  return unclosed ? { ok: false, error: unclosed } : { ok: true };
}
