// Operator notices. edge8-web posts these to Lark chats; mahjong-tarot emails
// them to MARKETING_NOTIFY_EMAIL instead (Dave, 2026-09-28). The module keeps
// edge8's path and export names so code copied from edge8-web ports unchanged.

import { sendTransactionalEmail } from "@/kernel/messaging/email";
import { escapeHtml } from "@/kernel/config/html";

/** Plain text, or a Lark interactive card (sent as its text content). */
export type LarkMessage = string | { card: Record<string, unknown> };

// A card's readable text: every string value under a `content` or `text` key,
// in order. Good enough for the notices, which are lists of lines and links.
function cardText(card: unknown): string {
  const out: string[] = [];
  const walk = (v: unknown, key?: string) => {
    if (typeof v === "string") {
      if (key === "content" || key === "text") out.push(v);
    } else if (Array.isArray(v)) v.forEach((x) => walk(x, key));
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, k);
  };
  walk(card);
  return out.join("\n");
}

async function notify(kind: string, message: LarkMessage): Promise<boolean> {
  const to = process.env.MARKETING_NOTIFY_EMAIL;
  if (!to) {
    console.warn(`[notify] MARKETING_NOTIFY_EMAIL not set; skipping ${kind} notice`);
    return false;
  }
  const text = typeof message === "string" ? message : cardText(message.card);
  const firstLine = text.split("\n").find((l) => l.trim()) ?? kind;
  const subject = `[Mahjong Tarot ${kind}] ${firstLine.replace(/[*_`#]/g, "").slice(0, 120)}`;
  const html = `<pre style="font-family:inherit;white-space:pre-wrap">${escapeHtml(text)}</pre>`;
  return sendTransactionalEmail({ to, subject, html, logMeta: { source: `notice:${kind}` } });
}

export async function notifyMarketing(message: LarkMessage): Promise<boolean> {
  return notify("marketing", message);
}

export async function notifyOps(message: LarkMessage): Promise<boolean> {
  return notify("ops", message);
}
