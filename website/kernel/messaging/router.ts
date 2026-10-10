// The notification router, under edge8-web's names (there it sends to Lark
// chats and DMs, holds quiet hours and queues a morning digest). Mahjong Tarot
// emails every notice to MARKETING_NOTIFY_EMAIL (kernel/messaging/lark.ts),
// once per dedupe key through the effect ledger, and nothing in a shadow run.
import { once } from "@/kernel/audit/effects";
import { currentRunMode } from "@/kernel/audit/run-context";
import type { RoutineFailure } from "@/kernel/audit/routine-result";
import { notifyMarketing, notifyOps, type LarkMessage } from "./lark";
import type { MessageCategory } from "./message-category";

export type Urgency = "normal" | "urgent";

export const NOTICE_KINDS = {
  "ops.alert": { about: "Something broke and a person must act." },
  "ops.digest": { about: "Operations news that can wait." },
  "revenue.weekly-pulse": { about: "The weekly marketing pulse." },
  "revenue.closed-cards": { about: "Cards closed on the Revenue board." },
  "revenue.marketing-digest": { about: "Posts due to go out by hand." },
  "revenue.blog-published": { about: "Scheduled blog posts put live, and any that could not be." },
} as const;

export type NoticeKind = keyof typeof NOTICE_KINDS;

/** A person by email, or a named group chat; both arrive as one email here. */
export type NoticeTo = { person: string } | { chat: string };

export type NotifyInput = {
  kind: NoticeKind;
  to: NoticeTo;
  message: LarkMessage;
  subject?: string;
  dedupeKey: string;
  urgency?: Urgency;
  category?: MessageCategory;
};

export type NotifyResult =
  | { status: "sent" }
  | { status: "held"; until: string }
  | { status: "queued"; until: string }
  | { status: "duplicate"; reason: string }
  | { status: "shadow"; reason: string }
  | { status: "declined"; reason: string }
  | { status: "failed"; error: string };

/** The failure a routine step reports for a notice that did not go, or none. */
export function failureOf(result: NotifyResult, subject: string, step: string): RoutineFailure[] {
  return result.status === "failed" ? [{ subject, step, error: result.error }] : [];
}

export async function notify(input: NotifyInput): Promise<NotifyResult> {
  if (!(input.kind in NOTICE_KINDS)) return { status: "failed", error: `unknown notice kind ${String(input.kind)}` };
  if (!input.dedupeKey.trim()) return { status: "failed", error: `notice ${input.kind}: a dedupe key is required` };
  if (currentRunMode() === "shadow") return { status: "shadow", reason: "shadow run: nothing is sent" };
  const send = input.kind.startsWith("ops.") ? notifyOps : notifyMarketing;
  const r = await once(`notice:${input.dedupeKey}`, "webhook", async () =>
    (await send(input.message)) ? { ok: true } : { ok: false, error: "the notice email was not sent (MARKETING_NOTIFY_EMAIL or Resend)" },
  );
  if (r.acted) return r.outcome.ok ? { status: "sent" } : { status: "failed", error: r.outcome.error };
  return { status: "duplicate", reason: r.reason };
}
