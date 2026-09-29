"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/kernel/ui/Badge";
import { formatDate } from "@/kernel/ui/format";
import type { MessageRow, MessageStatus } from "@/entities/campaigns/lib/personal/types";
import { MESSAGE_STATUSES, SOURCE_LABEL } from "@/entities/campaigns/lib/personal/types";
import { approveMessage, cancelMessage, editMessage, releaseDrafted } from "../actions";

// The queue: every message the agent has written, held first. A message
// opens to the facts on the left and the email on the right; a person reads,
// edits, approves or cancels. When the sample is read and approved, the
// drafted rest of the run releases in one go.
type Note = { tone: "ok" | "err"; text: string } | null;

const ORDER: MessageStatus[] = ["held", "drafted", "approved", "sending", "sent", "skipped", "cancelled"];
const TONE: Record<MessageStatus, "ok" | "warn" | "err" | "info" | "neutral"> = {
  held: "warn",
  drafted: "info",
  approved: "ok",
  sending: "ok",
  sent: "ok",
  skipped: "neutral",
  cancelled: "err",
};

function MessageCard({ message, onNote }: { message: MessageRow; onNote: (n: Note) => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [subject, setSubject] = useState(message.subject);
  const [bodyMd, setBodyMd] = useState(message.bodyMd);
  const open = message.status === "held" || message.status === "drafted" || message.status === "approved";

  const run = (action: () => Promise<{ ok: true } | { ok: false; error: string }>, done: string) =>
    startTransition(async () => {
      onNote(null);
      const result = await action();
      if (result.ok) {
        onNote({ tone: "ok", text: done });
        setEditing(false);
        router.refresh();
      } else onNote({ tone: "err", text: result.error });
    });

  return (
    <div className="admin-card admin-section-card u-mt-3">
      <div className="admin-label-row">
        <div>
          <span className="admin-cell-strong">{message.recipientName ?? message.personEmail ?? message.personId}</span>
          {message.recipientName && message.personEmail && <span className="admin-cell-muted"> · {message.personEmail}</span>}
        </div>
        <div className="u-row">
          {message.skillVersion !== null && <span className="admin-cell-muted u-sm">skill v{message.skillVersion}</span>}
          <Badge tone={TONE[message.status]}>{message.status}</Badge>
        </div>
      </div>
      {message.holdReason && <div className="admin-callout u-mt-3">{message.holdReason}</div>}
      {message.skipReason && <div className="admin-cell-muted u-mt-3">Skipped: {message.skipReason}</div>}
      {message.error && <div className="admin-alert admin-alert--err u-mt-3">{message.error}</div>}
      {message.status !== "skipped" && (
        <div className="u-grid-2 u-gap-3 u-mt-3">
          <div>
            <div className="admin-label">Facts ({message.facts.length})</div>
            <ul className="admin-list u-mt-3">
              {message.facts.map((f, i) => (
                <li className="admin-list-row" key={i}>
                  <div className="admin-list-main">
                    <div className="admin-list-title">{f.fact}</div>
                    <div className="admin-list-sub">{f.date} · {SOURCE_LABEL[f.source]}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="admin-label">The email</div>
            {editing ? (
              <div className="admin-form u-mt-3">
                <input className="admin-input" value={subject} aria-label="Subject" onChange={(e) => setSubject(e.target.value)} />
                <textarea className="admin-textarea" rows={10} value={bodyMd} aria-label="Body" onChange={(e) => setBodyMd(e.target.value)} />
              </div>
            ) : (
              <div className="u-mt-3">
                <div className="admin-cell-strong">{message.subject}</div>
                <div className="u-prewrap u-mt-3">{message.bodyMd}</div>
              </div>
            )}
            <div className="admin-cell-muted u-sm u-mt-3">
              {message.sendAfter && `Sends after ${formatDate(message.sendAfter)}. `}
              {message.sentAt && `Sent ${formatDate(message.sentAt)}. `}
              {message.editedAt && "Edited by hand. "}
              {message.approvedBy && `Approved by ${message.approvedBy}.`}
            </div>
          </div>
        </div>
      )}
      {open && (
        <div className="admin-form-actions u-mt-3">
          {editing ? (
            <>
              <button type="button" className="admin-btn admin-btn--primary" disabled={pending} onClick={() => run(() => editMessage(message.id, { subject, bodyMd }), "Saved.")}>
                Save
              </button>
              <button type="button" className="admin-btn" disabled={pending} onClick={() => setEditing(false)}>Cancel edit</button>
            </>
          ) : (
            <>
              {message.status !== "approved" && (
                <button type="button" className="admin-btn admin-btn--primary" disabled={pending} onClick={() => run(() => approveMessage(message.id), "Approved; it sends at the person's hour.")}>
                  Approve
                </button>
              )}
              <button type="button" className="admin-btn" disabled={pending} onClick={() => setEditing(true)}>Edit</button>
              <button type="button" className="admin-btn admin-btn--danger" disabled={pending} onClick={() => run(() => cancelMessage(message.id), "Cancelled; it will not send.")}>
                Don&apos;t send
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function MessageQueue({ agentId, messages, error }: { agentId: string; messages: MessageRow[]; error: string | null }) {
  const router = useRouter();
  const [note, setNote] = useState<Note>(null);
  const [filter, setFilter] = useState<MessageStatus | "all">("all");
  const [pending, startTransition] = useTransition();

  const counts = new Map<MessageStatus, number>();
  for (const m of messages) counts.set(m.status, (counts.get(m.status) ?? 0) + 1);
  const shown = messages
    .filter((m) => filter === "all" || m.status === filter)
    .sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status) || b.createdAt.localeCompare(a.createdAt));
  const heldSample = messages.filter((m) => m.status === "held" && (m.holdReason ?? "").startsWith("review: sample")).length;
  const drafted = counts.get("drafted") ?? 0;

  return (
    <section className="admin-card admin-section-card">
      <div className="admin-label-row">
        <div className="admin-card-title">Queue</div>
        <nav className="admin-tabs u-mb-0">
          <button type="button" className={`admin-tab${filter === "all" ? " is-active" : ""}`} onClick={() => setFilter("all")}>All {messages.length}</button>
          {MESSAGE_STATUSES.filter((s) => counts.get(s)).map((s) => (
            <button key={s} type="button" className={`admin-tab${filter === s ? " is-active" : ""}`} onClick={() => setFilter(s)}>
              {s} {counts.get(s)}
            </button>
          ))}
        </nav>
      </div>
      {error && <div className="admin-alert admin-alert--err u-mt-3">{error}</div>}
      {note && <div className={`admin-alert admin-alert--${note.tone} u-mt-3`}>{note.text}</div>}
      {drafted > 0 && (
        <div className="admin-callout u-mt-3">
          {heldSample > 0
            ? `${heldSample} sample message${heldSample === 1 ? "" : "s"} still to read. Approve or cancel each, then release the ${drafted} drafted.`
            : `The sample is read. ${drafted} drafted message${drafted === 1 ? "" : "s"} can release now.`}
          <button
            type="button"
            className="admin-btn admin-btn--sm admin-btn--primary u-ml-2"
            disabled={pending || heldSample > 0}
            onClick={() =>
              startTransition(async () => {
                setNote(null);
                const result = await releaseDrafted(agentId);
                if (result.ok) {
                  setNote({ tone: "ok", text: `Released ${result.released} message${result.released === 1 ? "" : "s"}; each sends at its person's hour.` });
                  router.refresh();
                } else setNote({ tone: "err", text: result.error });
              })
            }
          >
            Release the rest
          </button>
        </div>
      )}
      {shown.length === 0 ? (
        <div className="admin-empty u-mt-3">{messages.length === 0 ? "Nothing written yet. Run one tick, or wait for the hourly run once the agent is active." : "Nothing in this status."}</div>
      ) : (
        shown.map((m) => <MessageCard key={m.id} message={m} onNote={setNote} />)
      )}
    </section>
  );
}
