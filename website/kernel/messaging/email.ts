import { Resend } from "resend";
import { companyOs } from "@/kernel/data/supabase";

// Resend wrapper. Silently no-ops if RESEND_API_KEY is absent. Preview
// environments and local dev should never hard-fail on email send.

const resendApiKey = process.env.RESEND_API_KEY;
// No fallback on purpose. An unset EMAIL_FROM makes Resend reject the send,
// which is loud; a default would quietly send a fork's mail under the upstream's
// name and domain, which is not.
const emailFrom = process.env.EMAIL_FROM ?? "";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Every accepted send is logged to company_os.interactions — one row per
// recipient, matched to the person by email when the address is in the CRM.
// Best-effort: a logging failure never fails (or retroactively "unfails") a
// send that already happened.
async function logSentEmail(opts: {
  to: string[];
  subject: string;
  html: string;
  meta?: Record<string, unknown>;
}): Promise<void> {
  const occurredAt = new Date().toISOString();
  for (const recipient of opts.to) {
    const email = recipient.trim().toLowerCase();
    try {
      const { data: person, error: personError } = await companyOs
        .from("people")
        .select("id")
        .eq("email", email)
        .is("archived_at", null)
        .maybeSingle();
      if (personError) console.error("[kernel] people read failed:", personError.message);
      const { error } = await companyOs.from("interactions").insert({
        kind: "email",
        subject: opts.subject,
        body: opts.html,
        person_id: person?.id ?? null,
        occurred_at: occurredAt,
        metadata: { source: "system", format: "html", to: email, ...(opts.meta ?? {}) },
      });
      if (error) console.error("[email] interaction log failed:", error.message);
    } catch (err) {
      console.error("[email] interaction log failed:", err);
    }
  }
}

// Returns true only when Resend accepted the send — callers that stamp
// "sent" markers (e.g. event_registrations.confirmation_sent_at) must not
// stamp on a no-op or failure, or the real send never happens.
// `logMeta` is merged into the interactions metadata (e.g. a source label).
// `from` overrides the default sender — only for addresses on the verified domain
// (e.g. the acting admin), so DKIM still aligns. `logBody` is stored in the
// CRM interactions log instead of `html`: used when the email carries a secret
// (e.g. a temp password) that must not be persisted.
export async function sendTransactionalEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  logMeta?: Record<string, unknown>;
  logBody?: string;
}): Promise<boolean> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set, skipping send to", opts.to);
    return false;
  }

  const { error } = await resend.emails.send({
    from: opts.from || emailFrom,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
  });

  if (error) {
    console.error("[email] send failed:", error);
    return false;
  }

  await logSentEmail({
    to: Array.isArray(opts.to) ? opts.to : [opts.to],
    subject: opts.subject,
    html: opts.logBody ?? opts.html,
    meta: opts.logMeta,
  });
  return true;
}
