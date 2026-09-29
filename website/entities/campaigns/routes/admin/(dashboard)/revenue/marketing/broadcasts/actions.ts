"use server";

import { revalidateSurfaces } from "@/kernel/shell/surface";
import { companyOs, type CompanyOsUpdate } from "@/kernel/data/supabase";
import { requireRevenueAccess } from "@/kernel/identity/revenue-access";
import { recordAudit } from "@/kernel/audit/audit";
import { z } from "zod";
import { zodIssuesToMessage } from "@/kernel/config/schemas";
import { broadcastBlocksSchema } from "../../../../../../lib/marketing-email-blocks";
import { sendMarketingEmail } from "../../../../../../lib/marketing-email";
import { utmCampaignFor } from "../../../../../../lib/marketing-email-utm";
import { getBroadcast, type BroadcastSegment } from "@/entities/campaigns/lib/broadcasts";
import { materializeRecipients } from "@/entities/campaigns/lib/recipients";
import { getAudience } from "@/entities/campaigns/lib/audiences";
import { loadLearners } from "@/entities/campaigns/lib/learner-progress";
import { fillPersonalSections, hasPersonalSections, personalSections } from "@/entities/campaigns/lib/personal-sections";
import { INTRO_MARKER } from "@/entities/campaigns/lib/series-template";
import { resolveBroadcastBlocks } from "@/entities/campaigns/lib/broadcast-blocks";
import { stampSendWindow } from "@/entities/campaigns/lib/send-window-stamp";
import { type GreetedPerson, GREETING_COLUMNS, greetingName } from "@/kernel/config/people-name";

type ActionResult = { ok: true } | { ok: false; error: string };
type CreateResult = { ok: true; id: string } | { ok: false; error: string };

function refresh(id?: string) {
  revalidateSurfaces("/revenue/marketing");
  revalidateSurfaces("/revenue/marketing/broadcasts");
  if (id) revalidateSurfaces(`/revenue/marketing/broadcasts/${id}`);
}

export async function createBroadcast(input: { name: string; subject: string }): Promise<CreateResult> {
  const admin = await requireRevenueAccess();
  const name = input.name.trim();
  const subject = input.subject.trim();
  if (!name) return { ok: false, error: "Give the broadcast a name." };
  if (!subject) return { ok: false, error: "Give the broadcast a subject line." };

  const { data, error } = await companyOs.from("email_campaigns").insert({ name, subject, created_by: admin.email })
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Broadcast was not created." };

  const id = (data as { id: string }).id;
  await recordAudit({
    table: "email_campaigns",
    recordId: id,
    operation: "insert",
    actor: admin.email,
    context: { name },
  });
  refresh(id);
  return { ok: true, id };
}

export async function updateBroadcast(
  id: string,
  patch: {
    name?: string;
    subject?: string;
    preheader?: string;
    bodyMd?: string;
    segment?: BroadcastSegment;
    replyTo?: string;
    batchSize?: number;
    brandId?: string | null;
    audienceId?: string | null;
    scheduledAt?: string | null;
    // Featured posts and the call to action; validated against broadcastBlocksSchema.
    blocks?: unknown;
  },
): Promise<ActionResult> {
  const admin = await requireRevenueAccess();
  const campaign = await getBroadcast(id);
  if (!campaign) return { ok: false, error: "Broadcast not found." };

  // Editing an approved or sent campaign would change what recipients receive
  // partway through a send, so the body is frozen once it leaves draft.
  if (campaign.status !== "draft") {
    return { ok: false, error: `A ${campaign.status} broadcast cannot be edited. Cancel it first.` };
  }

  const update: CompanyOsUpdate<"email_campaigns"> = { updated_at: new Date().toISOString() };
  if (patch.name !== undefined) update.name = patch.name.trim();
  if (patch.subject !== undefined) update.subject = patch.subject.trim();
  if (patch.preheader !== undefined) update.preheader = patch.preheader.trim() || null;
  if (patch.bodyMd !== undefined) update.body_md = patch.bodyMd;
  if (patch.segment !== undefined) update.segment = patch.segment;
  if (patch.replyTo !== undefined) update.reply_to = patch.replyTo.trim() || null;
  if (patch.batchSize !== undefined) {
    if (!Number.isFinite(patch.batchSize) || patch.batchSize < 1 || patch.batchSize > 1000) {
      return { ok: false, error: "Batch size must be between 1 and 1000." };
    }
    update.batch_size = Math.floor(patch.batchSize);
  }
  if (patch.brandId !== undefined) update.brand_id = patch.brandId || null;
  if (patch.audienceId !== undefined) {
    if (patch.audienceId && !(await getAudience(patch.audienceId))) return { ok: false, error: "That saved audience does not exist." };
    update.audience_id = patch.audienceId || null;
  }
  if (patch.blocks !== undefined) {
    const parsed = broadcastBlocksSchema.safeParse(patch.blocks);
    if (!parsed.success) return { ok: false, error: zodIssuesToMessage(parsed.error.issues) };
    update.blocks = parsed.data;
  }
  if (patch.scheduledAt !== undefined) {
    // datetime-local sends a wall-clock string with no zone; normalise to ISO.
    update.scheduled_at = patch.scheduledAt ? new Date(patch.scheduledAt).toISOString() : null;
  }
  if (update.name === "") return { ok: false, error: "Name cannot be empty." };
  if (update.subject === "") return { ok: false, error: "Subject cannot be empty." };

  const { error } = await companyOs.from("email_campaigns").update(update).eq("id", id);
  if (error) return { ok: false, error: error.message };

  await recordAudit({
    table: "email_campaigns",
    recordId: id,
    operation: "update",
    actor: admin.email,
    context: { fields: Object.keys(update) },
  });
  refresh(id);
  return { ok: true };
}

// Materialises the audience into email_campaign_recipients (lib/recipients.ts).
// Re-runnable while the campaign is a draft: it only ever adds newcomers.
export async function buildRecipients(id: string): Promise<{ ok: true; added: number } | { ok: false; error: string }> {
  const admin = await requireRevenueAccess();
  const campaign = await getBroadcast(id);
  if (!campaign) return { ok: false, error: "Broadcast not found." };
  if (campaign.status !== "draft") {
    return { ok: false, error: "Recipients can only be built while the broadcast is a draft." };
  }

  const built = await materializeRecipients(campaign);
  if (!built.ok) return built;
  if (built.added > 0) {
    await recordAudit({
      table: "email_campaign_recipients",
      recordId: id,
      operation: "bulk_update",
      actor: admin.email,
      context: { added: built.added },
    });
  }
  refresh(id);
  return built;
}

export async function clearRecipients(id: string): Promise<ActionResult> {
  const admin = await requireRevenueAccess();
  const campaign = await getBroadcast(id);
  if (!campaign) return { ok: false, error: "Broadcast not found." };
  if (campaign.status !== "draft") {
    return { ok: false, error: "Recipients can only be cleared while the broadcast is a draft." };
  }

  const { error } = await companyOs.from("email_campaign_recipients").delete().eq("campaign_id", id);
  if (error) return { ok: false, error: error.message };

  await recordAudit({
    table: "email_campaign_recipients",
    recordId: id,
    operation: "bulk_delete",
    actor: admin.email,
  });
  refresh(id);
  return { ok: true };
}

const testAddressSchema = z.string().trim().email("Enter a full email address for the test.");

// Sends the campaign to one address, the acting admin's by default. Never
// touches the recipient list, so it can be run as many times as it takes to
// get the copy right. The unsubscribe token and the CRM log need a person: the
// contact matching the address, else the admin's own contact, so a test to a
// personal inbox still renders a working footer.
export async function sendTest(id: string, to?: string): Promise<ActionResult> {
  const admin = await requireRevenueAccess();
  const campaign = await getBroadcast(id);
  if (!campaign) return { ok: false, error: "Broadcast not found." };

  let target = admin.email;
  if (to !== undefined) {
    const parsed = testAddressSchema.safeParse(to);
    if (!parsed.success) return { ok: false, error: zodIssuesToMessage(parsed.error.issues) };
    target = parsed.data;
  }

  const { data: people, error: personError } = await companyOs
    .from("people")
    .select(`id, ${GREETING_COLUMNS}`)
    .in("email", Array.from(new Set([target, admin.email])));
  if (personError) return { ok: false, error: personError.message };
  const rows = (people ?? []) as ({ id: string } & GreetedPerson)[];
  const person = rows.find((p) => p.email === target) ?? rows.find((p) => p.email === admin.email);
  if (!person) {
    return { ok: false, error: `No contact in the CRM matches ${target} or ${admin.email}, so the test cannot be personalised.` };
  }

  const blocks = await resolveBroadcastBlocks(campaign.blocks);
  // A test shows the personal sections as the addressee would see them.
  const learners = hasPersonalSections(campaign.bodyMd) ? await loadLearners([target]) : null;
  const result = await sendMarketingEmail({
    to: target,
    personId: person.id,
    subject: `[TEST] ${campaign.subject}`,
    preheader: campaign.preheader,
    bodyMd: hasPersonalSections(campaign.bodyMd)
      ? fillPersonalSections(campaign.bodyMd, personalSections(learners?.byEmail.get(target.toLowerCase()), learners))
      : campaign.bodyMd,
    blocks,
    firstName: greetingName(person, null),
    utmCampaign: utmCampaignFor({ subject: campaign.subject, date: new Date().toISOString() }),
    from: campaign.fromEmail,
    replyTo: campaign.replyTo,
    campaignId: campaign.id,
    logSource: "marketing_test",
  });

  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true };
}

// The approval gate. Nothing reaches a recipient without passing through here.
export async function approveBroadcast(id: string): Promise<ActionResult> {
  const admin = await requireRevenueAccess();
  const campaign = await getBroadcast(id);
  if (!campaign) return { ok: false, error: "Broadcast not found." };
  if (campaign.status !== "draft") {
    return { ok: false, error: `Broadcast is already ${campaign.status}.` };
  }
  if (!campaign.bodyMd.trim()) {
    return { ok: false, error: "Write the email body before approving." };
  }
  if (campaign.bodyMd.includes(INTRO_MARKER)) {
    return { ok: false, error: "Write this week's intro before approving." };
  }
  // A saved audience is resolved again at approval, so anyone who joined it
  // since the list was built (a new tag, a new client) is included.
  if (campaign.audienceId) {
    const built = await materializeRecipients(campaign);
    if (!built.ok) return { ok: false, error: built.error };
  }

  const { count, error: countError } = await companyOs.from("email_campaign_recipients").select("id", { count: "exact", head: true })
    .eq("campaign_id", id)
    .eq("status", "pending");

  if (countError) return { ok: false, error: countError.message };
  if (!count) {
    return { ok: false, error: "Build the recipient list before approving." };
  }

  // A series issue already has its send moment in scheduled_at, so approving it
  // is the go: it moves straight to sending and the send cron waits for the moment.
  if (campaign.seriesId && !campaign.scheduledAt) {
    return { ok: false, error: "This series issue has no send time. Set a schedule before approving." };
  }
  const now = new Date().toISOString();
  const { error } = await companyOs.from("email_campaigns").update({ status: campaign.seriesId ? "sending" : "approved", approved_at: now, approved_by: admin.email, updated_at: now })
    .eq("id", id)
    .eq("status", "draft");

  if (error) return { ok: false, error: error.message };

  // A send window stamps each recipient's own moment now, counted from this
  // approval, so "next Tuesday" means the one after a person said go.
  let stamped: Record<string, number> | null = null;
  if (campaign.segment.sendWindow) {
    const result = await stampSendWindow(id, campaign.segment.sendWindow);
    if (!result.ok) return { ok: false, error: `Approved, but the delivery window could not be stamped: ${result.error}` };
    stamped = { ...result.summary.sources, stamped: result.summary.stamped };
  }

  await recordAudit({
    table: "email_campaigns",
    recordId: id,
    operation: "update",
    actor: admin.email,
    context: { approved: true, recipients: count, sendWindow: stamped, scheduled: campaign.seriesId ? campaign.scheduledAt : undefined },
  });
  refresh(id);
  return { ok: true };
}

export async function cancelBroadcast(id: string): Promise<ActionResult> {
  const admin = await requireRevenueAccess();
  const campaign = await getBroadcast(id);
  if (!campaign) return { ok: false, error: "Broadcast not found." };
  if (campaign.status === "sent") {
    return { ok: false, error: "A sent broadcast cannot be cancelled." };
  }

  const now = new Date().toISOString();
  const { error } = await companyOs.from("email_campaigns").update({ status: "cancelled", updated_at: now })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await recordAudit({
    table: "email_campaigns",
    recordId: id,
    operation: "update",
    actor: admin.email,
    context: { cancelled: true, from: campaign.status },
  });
  refresh(id);
  return { ok: true };
}

// Approved -> sending. Separate from approve so the send is a second, deliberate
// press: approving says "this copy is right", starting says "go now".
export async function startSending(id: string): Promise<ActionResult> {
  const admin = await requireRevenueAccess();
  const campaign = await getBroadcast(id);
  if (!campaign) return { ok: false, error: "Broadcast not found." };
  if (campaign.status !== "approved") {
    return { ok: false, error: "Only an approved broadcast can start sending." };
  }

  const now = new Date().toISOString();
  const { error } = await companyOs.from("email_campaigns").update({ status: "sending", updated_at: now })
    .eq("id", id)
    .eq("status", "approved");
  if (error) return { ok: false, error: error.message };

  await recordAudit({
    table: "email_campaigns",
    recordId: id,
    operation: "update",
    actor: admin.email,
    context: { sending: true },
  });
  refresh(id);
  return { ok: true };
}

// Sending -> approved. The send cron only works on a sending broadcast, so
// this stops the next batch; Start sending resumes it where it left off.
export async function pauseBroadcast(id: string): Promise<ActionResult> {
  const admin = await requireRevenueAccess();
  const campaign = await getBroadcast(id);
  if (!campaign) return { ok: false, error: "Broadcast not found." };
  if (campaign.status !== "sending") return { ok: false, error: "Only a broadcast that is sending can be paused." };
  const now = new Date().toISOString();
  const { error } = await companyOs.from("email_campaigns").update({ status: "approved", updated_at: now }).eq("id", id).eq("status", "sending");
  if (error) return { ok: false, error: error.message };
  await recordAudit({ table: "email_campaigns", recordId: id, operation: "update", actor: admin.email, context: { paused: true } });
  refresh(id);
  return { ok: true };
}

// The soft delete: the row keeps its recipients and events and leaves every
// list and the calendar. A broadcast mid-send is paused first, never deleted
// under a running batch.
export async function deleteBroadcast(id: string): Promise<ActionResult> {
  const admin = await requireRevenueAccess();
  const campaign = await getBroadcast(id);
  if (!campaign) return { ok: false, error: "Broadcast not found." };
  if (campaign.status === "sending") return { ok: false, error: "Pause the broadcast before deleting it." };
  const now = new Date().toISOString();
  const { error } = await companyOs.from("email_campaigns").update({
      archived_at: now,
      archived_by: admin.email,
      status: campaign.status === "sent" ? "sent" : "cancelled",
      updated_at: now,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  await recordAudit({ table: "email_campaigns", recordId: id, operation: "update", actor: admin.email, context: { deleted: true, from: campaign.status } });
  refresh();
  return { ok: true };
}

// The internal name and the brand are labels on the record, not content a
// reader received, so they stay editable in every status: a sent broadcast
// filed under the wrong name or brand is a wrong report, not a wrong email.
export async function renameBroadcast(id: string, patch: { name: string; brandId: string | null }): Promise<ActionResult> {
  const admin = await requireRevenueAccess();
  const campaign = await getBroadcast(id);
  if (!campaign) return { ok: false, error: "Broadcast not found." };
  const name = patch.name.trim();
  if (!name) return { ok: false, error: "Give the broadcast a name." };
  const { error } = await companyOs.from("email_campaigns").update({ name, brand_id: patch.brandId || null, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  await recordAudit({ table: "email_campaigns", recordId: id, operation: "update", actor: admin.email, context: { renamed: true, from: campaign.name, brandId: patch.brandId } });
  refresh(id);
  return { ok: true };
}
