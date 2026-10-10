"use client";

import { useEffect } from "react";
import { Badge, type BadgeTone } from "@/kernel/ui/Badge";
import { ConfirmButton } from "@/kernel/ui/ConfirmButton";
import { formatDate } from "@/kernel/ui/format";
import { useActionRunner } from "@/kernel/ui/useActionRunner";
import {
  describeLetterState,
  isLetterStep,
  LETTER_CANCELLED,
  LETTER_READY,
  LETTER_REJECTED,
  LETTER_RELEASED,
  LETTER_SCHEDULED,
  LETTER_STEPS,
  type LetterState,
} from "@/entities/campaigns/lib/letter/steps";
import { approveLetterSend, continueLetter, rejectLetterSend, retryLetterStep, startLetter, stopLetter } from "@/entities/campaigns/lib/letter/actions";

// The letter agent's corner of the broadcast page: start, the steps as badges
// while it runs, what the last step reported, the verbs. It refreshes while a
// run is in flight. A run that passes every check builds the list and asks for
// its send approval, then stops at ready (decision Y.54): nothing sends until a
// person approves the version this page shows. Approve schedules the send for
// the window; the agent driver releases it once it is due, and the broadcast's
// Cancel below stops it until then (Y.17).

const POLL_MS = 15_000;

export type LetterAgentState = {
  step: string | null;
  error: string | null;
  startedAt: string | null;
  checklist: string[];
  testSentTo: string | null;
  gathered: number;
};

/** The send approval a letter at ready waits on, as the page read it. */
export type LetterApproval = {
  pendingVersion: string | null;
  currentVersion: string | null;
  recipients: number | null;
  sendWindow: string | null;
  /** Set when the approval could not be read. */
  unread?: string;
};

export function LetterAgentPanel({
  campaignId,
  status,
  brandId,
  agent,
  approval = null,
  scheduledAt = null,
}: {
  campaignId: string;
  status: string;
  brandId: string | null;
  agent: LetterAgentState;
  approval?: LetterApproval | null;
  scheduledAt?: string | null;
}) {
  const { note, pending, run, router } = useActionRunner();
  const step = agent.step;
  const running = isLetterStep(step) && !agent.error;
  const scheduled = step === LETTER_SCHEDULED;
  const stopped = (isLetterStep(step) || scheduled) && Boolean(agent.error);
  const ready = step === LETTER_READY;
  // Approve approves the version on this page, so it needs one; a pending
  // approval for another version means the letter changed after it was asked for.
  const seen = approval?.currentVersion ?? null;
  const current = Boolean(approval?.pendingVersion) && approval?.pendingVersion === seen;
  const canStart = Boolean(brandId) && status === "draft" && !running;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => router.refresh(), POLL_MS);
    return () => clearInterval(t);
  }, [running, router]);

  const at = isLetterStep(step) ? LETTER_STEPS.findIndex((s) => s.id === step) : step ? LETTER_STEPS.length : -1;
  const toneFor = (i: number): BadgeTone => (i < at ? "ok" : i === at ? (stopped ? "err" : "info") : "neutral");

  return (
    <section className="admin-card admin-section-card">
      <div className="admin-card-head">
        <h2 className="admin-card-title">Letter agent</h2>
        <span className="admin-cell-muted u-sm">
          {step
            ? `${describeLetterState(step as LetterState)}${agent.startedAt ? `, started ${formatDate(agent.startedAt)}` : ""}`
            : "Gathers the week, picks three unsent posts, writes the letter, rotates the call to action, sends you a test, then stops at ready. Nothing sends until you approve it."}
        </span>
      </div>

      {step && (
        <p>
          {LETTER_STEPS.map((s, i) => (
            <Badge key={s.id} tone={toneFor(i)} dot={i === at && running}>
              {i + 1}. {s.label}
            </Badge>
          ))}{" "}
          <Badge tone={ready || scheduled || step === LETTER_RELEASED ? "ok" : step === LETTER_REJECTED || step === LETTER_CANCELLED ? "err" : "neutral"}>
            {isLetterStep(step) || ready ? "Ready" : describeLetterState(step as LetterState)}
          </Badge>
        </p>
      )}

      {!step && !brandId && <p className="admin-hint">Set the brand first; the agent reads its voice and posts from it.</p>}
      {ready && status === "draft" && current && (
        <p className="admin-alert admin-alert--ok">
          Every check passed and the test is in {agent.testSentTo ?? "your"} inbox. The letter waits on a send approval for version <code>{approval?.pendingVersion}</code>
          {approval?.recipients !== null && approval?.recipients !== undefined ? <>: {approval.recipients.toLocaleString()} recipients</> : null}
          {approval?.sendWindow ? <>, {approval.sendWindow}</> : null}. Nothing sends until you approve it here.
        </p>
      )}
      {ready && status === "draft" && !current && (
        <p className="admin-alert admin-alert--err">
          {approval?.unread
            ? `The send approval could not be read: ${approval.unread}`
            : approval?.pendingVersion
              ? "The letter changed after approval was asked for. Approve asks again for the letter as it is now; read it, then approve once more."
              : "No send approval is open for this letter. Approve asks for one for the version on this page; then approve once more to schedule it."}
        </p>
      )}
      {scheduled && !agent.error && (
        <p className="admin-alert admin-alert--ok">
          Approved and scheduled: it goes to the send {scheduledAt ? `from ${formatDate(scheduledAt)}` : "at its window"}, each person at the window in their own zone. Cancel the broadcast below to stop it before then.
        </p>
      )}
      {step === LETTER_RELEASED && <p className="admin-alert admin-alert--ok">Released to the send. The Send section below shows where it stands.</p>}
      {step === LETTER_REJECTED && <p className="admin-alert admin-alert--err">Rejected: nothing was sent and the broadcast is cancelled.</p>}
      {step === LETTER_CANCELLED && <p className="admin-alert admin-alert--err">Cancelled before it sent: nothing went to the list.</p>}
      {agent.error && (
        <p className="admin-alert admin-alert--err">
          <strong>Stopped at {isLetterStep(step) ? describeLetterState(step) : "the run"}.</strong> {agent.error}
        </p>
      )}
      {agent.checklist.length > 0 && (
        <details className="admin-hint">
          <summary>Validate checklist{agent.gathered ? ` · ${agent.gathered} data points gathered` : ""}</summary>
          <ul>
            {agent.checklist.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </details>
      )}
      {note && <p className={`admin-alert ${note.tone === "ok" ? "admin-alert--ok" : "admin-alert--err"}`}>{note.text}</p>}

      <div className="admin-card-actions">
        {(!step || ready) && (
          <button type="button" className={`admin-btn ${ready ? "" : "admin-btn--primary"}`} disabled={!canStart || pending} onClick={() => run(() => startLetter(campaignId), "Letter agent started; gathering the week.")}>
            {ready ? "Run the agent again" : "Run the letter agent"}
          </button>
        )}
        {stopped && (
          <button type="button" className="admin-btn admin-btn--primary" disabled={pending} onClick={() => run(() => retryLetterStep(campaignId), "Retrying the step.")}>
            Retry step
          </button>
        )}
        {running && (
          <button type="button" className="admin-btn" disabled={pending} onClick={() => run(() => continueLetter(campaignId), "Handed the run on to the next step.")}>
            Continue
          </button>
        )}
        {ready && status === "draft" && (
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            disabled={pending || !seen}
            onClick={() =>
              run(async () => {
                const res = await approveLetterSend(campaignId, seen ?? "");
                // A refused click may have asked again for a new version: show it.
                if (!res.ok) router.refresh();
                return res;
              }, "Approved. The send is scheduled for its window.")
            }
          >
            Approve and schedule
          </button>
        )}
        {ready && status === "draft" && current && (
          <ConfirmButton
            label="Reject"
            title="Reject this letter?"
            body="Nothing is sent, the broadcast is cancelled and the run closes. The next letter opens on its day."
            confirmLabel="Reject the letter"
            disabled={pending}
            onConfirm={() => rejectLetterSend(campaignId)}
            onDone={() => router.refresh()}
          />
        )}
        {(running || (stopped && !scheduled) || ready) && (
          <ConfirmButton
            label="Stop"
            title="Stop the letter agent?"
            body="The broadcast keeps what the steps so far wrote. Run the agent again to start from gather."
            confirmLabel="Stop the run"
            disabled={pending}
            onConfirm={() => stopLetter(campaignId)}
            onDone={() => router.refresh()}
          />
        )}
      </div>
    </section>
  );
}
