"use server";

import { z } from "zod";
import { revalidateSurfaces } from "@/kernel/shell/surface";
import { requireRevenueAccess } from "@/kernel/identity/revenue-access";
import { recordAudit } from "@/kernel/audit/audit";
import { recordRoutineRun } from "@/kernel/audit/routine-runs";
import { zodIssuesToMessage } from "@/kernel/config/schemas";
import {
  addSkill,
  approveDrafted,
  archiveAgent as archiveAgentRow,
  createAgent as createAgentRow,
  getAgent,
  getMessage,
  updateAgent as updateAgentRow,
  updateMessage,
} from "@/entities/campaigns/lib/personal/data";
import { dryRun, runAgent, type DryRunResult, type RunSummary } from "@/entities/campaigns/lib/personal/run";
import { SOURCE_KEYS } from "@/entities/campaigns/lib/personal/types";

// The Personal pages' actions. Every one starts with the revenue guard. An
// agent is created paused with a starter skill; the skill is versioned on
// every save; a message is approved, edited or cancelled one at a time, and
// the drafted rest of a run is released in one go once its sample has been
// read.

type ActionResult = { ok: true } | { ok: false; error: string };

function refresh(id?: string) {
  revalidateSurfaces("/revenue/marketing/recurring");
  if (id) revalidateSurfaces(`/revenue/marketing/personal/${id}`);
}

const optionalEmail = z
  .string()
  .trim()
  .transform((v) => v || null)
  .pipe(z.string().email("Enter a full email address.").nullable());

const agentSchema = z.object({
  name: z.string().trim().min(1, "Give the agent a name."),
  audienceId: z.string().uuid("Pick a saved audience."),
  brandId: z.string().uuid().nullable(),
  fromEmail: optionalEmail,
  replyTo: optionalEmail,
  sources: z.array(z.enum(SOURCE_KEYS)).min(1, "Tick at least one source, or the agent knows nothing about anyone."),
  cadenceDays: z.number().int().min(1, "Cadence is between 1 and 365 days.").max(365, "Cadence is between 1 and 365 days."),
  sendHour: z.number().int().min(0).max(23),
  reviewMode: z.enum(["hold_all", "sample"]),
  sampleSize: z.number().int().min(1, "Sample is between 1 and 100.").max(100, "Sample is between 1 and 100."),
  maxWords: z.number().int().min(20, "Word cap is between 20 and 2000.").max(2000, "Word cap is between 20 and 2000."),
  active: z.boolean(),
});

const STARTER_SKILL = `# Goal
One short, useful note to this person about where they are and what would help next.

# Voice
Warm, direct, first person. A note from a person, not a newsletter.

# Structure
- Open with their first name.
- One paragraph on what the facts say about them.
- One paragraph with one concrete next step.
- Sign off with a name.

# Rules
- Say only what the facts say. No guesses about their week, their job or their feelings.
- One call to action, never two.
- Under 120 words.
- No pricing, no discounts, no urgency.
`;

export async function createAgent(input: { name: string; audienceId: string }): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const admin = await requireRevenueAccess();
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Give the agent a name." };
  if (!input.audienceId) return { ok: false, error: "Pick a saved audience." };
  // Created paused, with every source ticked and the starter brief: it writes
  // nothing until its skill has been tuned on a dry run and it is switched on.
  const created = await createAgentRow(
    { name, audienceId: input.audienceId, brandId: null, fromEmail: null, replyTo: null, sources: [...SOURCE_KEYS], cadenceDays: 14, sendHour: 8, reviewMode: "sample", sampleSize: 5, maxWords: 150, active: false },
    STARTER_SKILL,
    admin.email,
  );
  if (!created.ok) return created;
  await recordAudit({ table: "email_agents", recordId: created.data.id, operation: "insert", actor: admin.email, context: { name } });
  refresh(created.data.id);
  return { ok: true, id: created.data.id };
}

export async function updateAgent(id: string, input: unknown): Promise<ActionResult> {
  const admin = await requireRevenueAccess();
  const parsed = agentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: zodIssuesToMessage(parsed.error.issues) };
  const saved = await updateAgentRow(id, parsed.data);
  if (!saved.ok) return saved;
  await recordAudit({ table: "email_agents", recordId: id, operation: "update", actor: admin.email, newData: parsed.data });
  refresh(id);
  return { ok: true };
}

// Paused keeps the agent and its queue; the hourly run skips it.
export async function setAgentActive(id: string, active: boolean): Promise<ActionResult> {
  const admin = await requireRevenueAccess();
  const agent = await getAgent(id);
  if (!agent) return { ok: false, error: "Agent not found." };
  const saved = await updateAgentRow(id, { ...agent, active });
  if (!saved.ok) return saved;
  await recordAudit({ table: "email_agents", recordId: id, operation: "update", actor: admin.email, context: { active } });
  refresh(id);
  return { ok: true };
}

// The soft delete: archived and paused, so it runs no more and leaves the
// list; its messages and skill versions stay.
export async function deleteAgent(id: string): Promise<ActionResult> {
  const admin = await requireRevenueAccess();
  const saved = await archiveAgentRow(id);
  if (!saved.ok) return saved;
  await recordAudit({ table: "email_agents", recordId: id, operation: "update", actor: admin.email, context: { archived: true } });
  refresh(id);
  return { ok: true };
}

export async function saveSkill(agentId: string, input: { bodyMd: string; note: string }): Promise<{ ok: true; version: number } | { ok: false; error: string }> {
  const admin = await requireRevenueAccess();
  const bodyMd = input.bodyMd.trim();
  if (bodyMd.length < 40) return { ok: false, error: "The skill needs a goal, a voice and at least one rule; this is too short to write from." };
  const saved = await addSkill(agentId, bodyMd, input.note.trim() || null, admin.email);
  if (!saved.ok) return saved;
  await recordAudit({ table: "email_agent_skills", recordId: saved.data.id, operation: "insert", actor: admin.email, context: { agentId, version: saved.data.version } });
  refresh(agentId);
  return { ok: true, version: saved.data.version };
}

// Gather, write and validate for one person; nothing lands. Recorded as a
// routine run so the tokens it spends show on Settings > Agents.
export async function dryRunAgent(agentId: string, personId: string): Promise<DryRunResult> {
  await requireRevenueAccess();
  const agent = await getAgent(agentId);
  if (!agent) return { ok: false, error: "Agent not found." };
  let result: DryRunResult = { ok: false, error: "The dry run did not return." };
  await recordRoutineRun("/api/cron/email-agent", async () => {
    result = await dryRun(agent, personId);
    return Response.json(result.ok ? { dryRun: true, person: result.person.email, errors: result.errors, message: `Dry run for ${result.person.email}: ${result.errors.length === 0 ? "passes" : `${result.errors.length} check(s) failed`}.` } : { error: result.error });
  });
  return result;
}

// One tick of the agent now, the same as the hourly cron would run.
export async function runAgentNow(agentId: string): Promise<{ ok: true; summary: RunSummary } | { ok: false; error: string }> {
  await requireRevenueAccess();
  const agent = await getAgent(agentId);
  if (!agent) return { ok: false, error: "Agent not found." };
  let summary: RunSummary | null = null;
  await recordRoutineRun("/api/cron/email-agent", async () => {
    summary = await runAgent(agent, { limit: 8 });
    return Response.json({ ...summary, message: `${agent.name}: ${summary.drafted.length} drafted, ${summary.held.length} held, ${summary.skipped.length} skipped, ${summary.remaining} left.` });
  });
  refresh(agentId);
  if (!summary) return { ok: false, error: "The run did not return." };
  const s: RunSummary = summary;
  return s.error ? { ok: false, error: s.error } : { ok: true, summary: s };
}

async function messageForAction(id: string) {
  const message = await getMessage(id);
  if (!message) return { message: null, error: "Message not found." };
  return { message, error: null };
}

export async function approveMessage(id: string): Promise<ActionResult> {
  const admin = await requireRevenueAccess();
  const { message, error } = await messageForAction(id);
  if (!message) return { ok: false, error: error! };
  if (message.status !== "held" && message.status !== "drafted") return { ok: false, error: `The message is ${message.status}; only a held or drafted one can be approved.` };
  if (!message.subject.trim() || !message.bodyMd.trim()) return { ok: false, error: "The message has no subject or body; edit it first." };
  const now = new Date().toISOString();
  const saved = await updateMessage(id, { status: "approved", holdReason: null, approvedBy: admin.email, approvedAt: now });
  if (!saved.ok) return saved;
  await recordAudit({ table: "email_messages", recordId: id, operation: "update", actor: admin.email, context: { status: "approved" } });
  refresh(message.agentId);
  return { ok: true };
}

export async function editMessage(id: string, input: { subject: string; bodyMd: string }): Promise<ActionResult> {
  const admin = await requireRevenueAccess();
  const { message, error } = await messageForAction(id);
  if (!message) return { ok: false, error: error! };
  if (!["held", "drafted", "approved"].includes(message.status)) return { ok: false, error: `The message is ${message.status} and can no longer be edited.` };
  const subject = input.subject.trim();
  const bodyMd = input.bodyMd.trim();
  if (!subject || !bodyMd) return { ok: false, error: "Subject and body are both needed." };
  const saved = await updateMessage(id, { subject, bodyMd, editedAt: new Date().toISOString() });
  if (!saved.ok) return saved;
  await recordAudit({ table: "email_messages", recordId: id, operation: "update", actor: admin.email, context: { edited: true } });
  refresh(message.agentId);
  return { ok: true };
}

export async function cancelMessage(id: string): Promise<ActionResult> {
  const admin = await requireRevenueAccess();
  const { message, error } = await messageForAction(id);
  if (!message) return { ok: false, error: error! };
  if (message.status === "sent" || message.status === "sending") return { ok: false, error: "The message has already gone." };
  const saved = await updateMessage(id, { status: "cancelled", holdReason: `cancelled by ${admin.email}` });
  if (!saved.ok) return saved;
  await recordAudit({ table: "email_messages", recordId: id, operation: "update", actor: admin.email, context: { status: "cancelled" } });
  refresh(message.agentId);
  return { ok: true };
}

// Approving the sample releases the drafted rest of the run.
export async function releaseDrafted(agentId: string): Promise<{ ok: true; released: number } | { ok: false; error: string }> {
  const admin = await requireRevenueAccess();
  const released = await approveDrafted(agentId, admin.email);
  if (!released.ok) return released;
  await recordAudit({ table: "email_messages", recordId: agentId, operation: "update", actor: admin.email, context: { released: released.data.released } });
  refresh(agentId);
  return { ok: true, released: released.data.released };
}
