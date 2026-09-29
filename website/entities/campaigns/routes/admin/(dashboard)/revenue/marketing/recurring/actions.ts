"use server";

import { z } from "zod";
import { revalidateSurfaces } from "@/kernel/shell/surface";
import { companyOs } from "@/kernel/data/supabase";
import { requireRevenueAccess } from "@/kernel/identity/revenue-access";
import { recordAudit } from "@/kernel/audit/audit";
import { zodIssuesToMessage } from "@/kernel/config/schemas";

type ActionResult = { ok: true } | { ok: false; error: string };

function refresh(id?: string) {
  revalidateSurfaces("/revenue/marketing/recurring");
  if (id) revalidateSurfaces(`/revenue/marketing/recurring/${id}`);
}

function isZone(zone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

const optionalEmail = z
  .string()
  .trim()
  .transform((v) => v || null)
  .pipe(z.string().email("Enter a full email address.").nullable());

const seriesSchema = z.object({
  name: z.string().trim().min(1, "Give the series a name."),
  audienceId: z.string().uuid("Pick a saved audience."),
  brandId: z.string().uuid().nullable(),
  subject: z.string().trim(),
  bodyTemplate: z.string(),
  fromEmail: optionalEmail,
  replyTo: optionalEmail,
  timeZone: z.string().trim().refine(isZone, "Use a time zone name such as Australia/Perth."),
  draftWeekday: z.number().int().min(0).max(6),
  draftHour: z.number().int().min(0).max(23),
  sendWeekday: z.number().int().min(0).max(6),
  sendHour: z.number().int().min(0).max(23),
  batchSize: z.number().int().min(1, "Batch size must be between 1 and 1000.").max(1000, "Batch size must be between 1 and 1000."),
  active: z.boolean(),
});

export async function createSeries(input: { name: string; audienceId: string }): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const admin = await requireRevenueAccess();
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Give the series a name." };
  if (!input.audienceId) return { ok: false, error: "Pick a saved audience." };

  // Created paused: it opens nothing until its schedule has been checked and switched on.
  const { data, error } = await companyOs.from("email_series").insert({ name, audience_id: input.audienceId, active: false, created_by: admin.email })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "Series was not created." };
  await recordAudit({ table: "email_series", recordId: data.id, operation: "insert", actor: admin.email, context: { name } });
  refresh(data.id);
  return { ok: true, id: data.id };
}

export async function updateSeries(id: string, input: unknown): Promise<ActionResult> {
  const admin = await requireRevenueAccess();
  const parsed = seriesSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: zodIssuesToMessage(parsed.error.issues) };
  const s = parsed.data;

  const { error } = await companyOs.from("email_series").update({
      name: s.name,
      audience_id: s.audienceId,
      brand_id: s.brandId,
      subject: s.subject,
      body_template: s.bodyTemplate,
      from_email: s.fromEmail,
      reply_to: s.replyTo,
      time_zone: s.timeZone,
      draft_weekday: s.draftWeekday,
      draft_hour: s.draftHour,
      send_weekday: s.sendWeekday,
      send_hour: s.sendHour,
      batch_size: s.batchSize,
      active: s.active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  await recordAudit({ table: "email_series", recordId: id, operation: "update", actor: admin.email, newData: s });
  refresh(id);
  return { ok: true };
}

// Paused keeps the series and opens no issues; an issue already open is untouched.
export async function setSeriesActive(id: string, active: boolean): Promise<ActionResult> {
  const admin = await requireRevenueAccess();
  const { error } = await companyOs.from("email_series").update({ active, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  await recordAudit({ table: "email_series", recordId: id, operation: "update", actor: admin.email, context: { active } });
  refresh(id);
  return { ok: true };
}

// The soft delete: archived and paused, so it opens nothing and leaves the
// list; its issues keep pointing at it.
export async function deleteSeries(id: string): Promise<ActionResult> {
  const admin = await requireRevenueAccess();
  const now = new Date().toISOString();
  const { error } = await companyOs.from("email_series").update({ archived_at: now, active: false, updated_at: now }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  await recordAudit({ table: "email_series", recordId: id, operation: "update", actor: admin.email, context: { deleted: true } });
  refresh();
  return { ok: true };
}
