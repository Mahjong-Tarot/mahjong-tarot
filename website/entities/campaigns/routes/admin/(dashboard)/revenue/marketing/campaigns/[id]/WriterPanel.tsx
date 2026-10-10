"use client";

import { useEffect } from "react";
import { SurfaceLink as Link } from "@/kernel/shell/SurfaceLink";
import { Badge, type BadgeTone } from "@/kernel/ui/Badge";
import { ConfirmButton } from "@/kernel/ui/ConfirmButton";
import { formatDate } from "@/kernel/ui/format";
import { useActionRunner } from "@/kernel/ui/useActionRunner";
import { describeState, isWriterStep, WRITER_DONE, WRITER_READY, WRITER_REJECTED, WRITER_STEPS, type WriterState } from "@/entities/campaigns/lib/writer/steps";
import { continueWriter, publishWriterDraft, reaskWriterDraft, rejectWriterDraft, retryWriterStep, startWriter, stopWriter } from "@/entities/campaigns/lib/writer/actions";
import type { MarketingCampaignRow } from "@/entities/campaigns/lib/marketing-campaigns";
import type { CalendarEntryRow } from "@/entities/campaigns/lib/marketing-calendar-shared";

// The writer agent's corner of the campaign hub: one button to start the run,
// the steps as badges while it advances, the last change log from the blog
// asset's notes, the error when a step's check fails, and the verbs to retry,
// continue or stop. It refreshes the page while a run is in flight so the
// operator watches the steps land without reloading. A run at ready waits on
// its Publish approval (Y.16): Publish approves the version this page shows and
// publishes it, Reject closes the run.

const POLL_MS = 15_000;

// The notes carry one "## Heading (stamp)" block per pass; show the last one.
export function lastNotesBlock(notes: string | null): { heading: string; lines: string[] } | null {
  if (!notes) return null;
  const blocks = notes.split(/\n(?=## )/).filter((b) => b.trim().startsWith("## "));
  const last = blocks.at(-1);
  if (!last) return null;
  const [head, ...rest] = last.trim().split("\n");
  return { heading: head.replace(/^## /, ""), lines: rest.map((l) => l.replace(/^- /, "")).filter(Boolean) };
}

/** The Publish approval a run at ready waits on, as the page read it. */
export type WriterApproval = {
  pendingVersion: string | null;
  currentVersion: string | null;
  where: string | null;
  /**
   * The post has approval history and is no version approved or awaited, so
   * every publish refuses it until it is asked about again (Ask for approval).
   */
  askable?: boolean;
  /**
   * The post is live on a campaign that publishes on approval, so every edit of
   * its title, copy, SEO plan, hero image or date is refused until it is
   * unpublished (Y.91).
   */
  editsLocked?: boolean;
  /** Set when the approval could not be read. */
  unread?: string;
};

export function WriterPanel({ campaign, entries, approval = null }: { campaign: MarketingCampaignRow; entries: CalendarEntryRow[]; approval?: WriterApproval | null }) {
  const { note, pending, run, router } = useActionRunner();
  const step = campaign.writerStep;
  const running = isWriterStep(step) && !campaign.writerError;
  const stopped = isWriterStep(step) && Boolean(campaign.writerError);
  const ready = step === WRITER_READY;
  const done = step === WRITER_DONE;
  const rejected = step === WRITER_REJECTED;
  // Publish approves the version on this page, so it needs one; a pending
  // approval for another version means the post changed after it was asked for.
  const seen = approval?.currentVersion ?? null;
  const current = Boolean(approval?.pendingVersion) && approval?.pendingVersion === seen;
  // A post every publish refuses (stopped, rejected, or edited since its
  // approval), for a writer that is not running: Ask for approval reopens it.
  const askable = !isWriterStep(step) && !ready && Boolean(approval?.askable);
  const editsLocked = Boolean(approval?.editsLocked);
  const canStart = Boolean(campaign.brandId && campaign.idea?.trim()) && !running;
  const blog = entries.find((e) => e.channel === "blog") ?? null;
  // The blog asset already carries written content — from a completed run, a
  // stopped one, the calendar's "Draft with AI", or a manual edit. None of
  // those set writer_step, so the run pointer alone would prompt "Run the
  // writer" as if the post were empty. Key the empty-start prompt off content.
  const hasContent = Boolean(blog?.copyMd?.trim() || blog?.bodyHtml?.trim());
  const changeLog = lastNotesBlock(blog?.notes ?? null);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => router.refresh(), POLL_MS);
    return () => clearInterval(t);
  }, [running, router]);

  // Where the run is on the step list. A parked run sits after validate; a
  // finished one is past every step.
  const at = isWriterStep(step) ? WRITER_STEPS.findIndex((s) => s.id === step) : ready ? 8 : done ? WRITER_STEPS.length : -1;
  const toneFor = (i: number): BadgeTone => (i < at ? "ok" : i === at ? (stopped ? "err" : "info") : "neutral");

  return (
    <section className="admin-card admin-section-card u-mb-5">
      <div className="admin-card-head">
        <h2 className="admin-card-title">Writer agent</h2>
        <span className="admin-cell-muted u-sm">
          {step
            ? `${describeState(step as WriterState)}${campaign.writerStartedAt ? `, started ${formatDate(campaign.writerStartedAt)}` : ""}`
            : "From approved idea to a finished, formatted, SEO-complete post, by the brand's own process."}
        </span>
      </div>

      <div className="u-stack u-gap-3 u-mt-3">
      {step && (
        <div className="u-row u-wrap u-gap-1">
          {WRITER_STEPS.map((s, i) => (
            <Badge key={s.id} tone={toneFor(i)} dot={i === at && running}>
              {i + 1}. {s.label}
            </Badge>
          ))}
          <Badge tone={ready || done ? "ok" : rejected ? "err" : "neutral"}>{done ? "Published" : rejected ? "Rejected" : "Ready"}</Badge>
        </div>
      )}

      {!step && !canStart && !hasContent && <p className="admin-hint">Set the brand and write the idea first; the writer needs both.</p>}
      {!step && hasContent && blog && !editsLocked && (
        <p className="admin-alert admin-alert--ok">
          This post already has written content.{" "}
          <Link href={`/admin/revenue/marketing/campaigns/${campaign.id}/assets/${blog.id}`}>Open the post to edit or publish it.</Link>{" "}
          Running the writer again rewrites it from the draft.
        </p>
      )}
      {ready && current && (
        <p className="admin-alert admin-alert--ok">
          Every check passed. The post waits on a Publish approval for version <code>{approval?.pendingVersion}</code>
          {approval?.where ? <>, and goes public at {approval.where}</> : null}.{" "}
          {blog && <Link href={`/admin/revenue/marketing/campaigns/${campaign.id}/assets/${blog.id}`}>Read the post</Link>}, then Publish or Reject.
        </p>
      )}
      {ready && !current && (
        <p className="admin-alert admin-alert--err">
          {approval?.unread
            ? `The Publish approval could not be read: ${approval.unread}`
            : approval?.pendingVersion
              ? "The post changed after approval was asked for. Publish asks again for the post as it is now; read it, then press Publish once more."
              : "No Publish approval is open for this post. Publish asks for one for the version on this page; then press Publish once more to approve it."}
        </p>
      )}
      {rejected && (
        <p className="admin-alert admin-alert--err">
          The post was rejected and nothing was published. Edit it and press Ask for approval, or run the writer again.
        </p>
      )}
      {askable && !rejected && blog?.status === "published" && (
        <p className="admin-alert admin-alert--err">
          This post is live in a version its Publish approval does not cover (it was edited before edits to a live post were refused, or its approval was
          withdrawn). Ask for approval, read it, then Publish to record an approval for it as it is. Edits stay refused while it is live: to change it, drag it
          out of Published on the Workboard tab first.
        </p>
      )}
      {editsLocked && !askable && !ready && blog && (
        <p className="admin-hint">
          This post is live, so edits to its title, copy, SEO plan, hero image and date are refused: they would reach the public page without an approval. To
          change it, drag it out of Published on the Workboard tab (that unpublishes it), edit it, then Ask for approval and Publish.
        </p>
      )}
      {askable && !rejected && blog?.status !== "published" && (
        <p className="admin-alert admin-alert--err">
          This post has no Publish approval for the version it is now (the run was stopped, or the post changed after its approval), so nothing will publish
          it. Ask for approval, read it, then Publish.
        </p>
      )}
      {done && blog && (
        <p className="u-mt-0">
          Published and the channel posts re-derived from it.{" "}
          <Link href={`/admin/revenue/marketing/campaigns/${campaign.id}/assets/${blog.id}`}>Open the post.</Link>
        </p>
      )}
      {campaign.writerError && (
        <p className="admin-alert admin-alert--err">
          <strong>Stopped at {isWriterStep(step) ? describeState(step) : "the run"}.</strong> {campaign.writerError}
        </p>
      )}
      {changeLog && (
        <details className="admin-hint">
          <summary>Last change log: {changeLog.heading}</summary>
          <ul>
            {changeLog.lines.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </details>
      )}
      {note && <p className={`admin-alert ${note.tone === "ok" ? "admin-alert--ok" : "admin-alert--err"}`}>{note.text}</p>}
      </div>

      <div className="admin-card-actions">
        {ready && (
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            disabled={pending || !seen}
            onClick={() =>
              run(async () => {
                const res = await publishWriterDraft(campaign.id, seen ?? "");
                // A refused click may have asked again for a new version: show it.
                if (!res.ok) router.refresh();
                return res;
              }, "Approved. Publishing now.")
            }
          >
            Publish
          </button>
        )}
        {ready && current && (
          <ConfirmButton
            label="Reject"
            title="Reject this post?"
            body="Nothing is published and the writer run closes. The post keeps what the writer wrote."
            confirmLabel="Reject the post"
            disabled={pending}
            onConfirm={() => rejectWriterDraft(campaign.id)}
            onDone={() => router.refresh()}
          />
        )}
        {askable && (
          <button type="button" className="admin-btn admin-btn--primary" disabled={pending} onClick={() => run(() => reaskWriterDraft(campaign.id), "A Publish approval is open for the post as it is. Read it, then Publish.")}>
            Ask for approval
          </button>
        )}
        {(!step || done || rejected) && (
          <button type="button" className={`admin-btn ${!step && hasContent ? "" : "admin-btn--primary"}`} disabled={!canStart || pending} onClick={() => run(() => startWriter(campaign.id), "Writer started; the draft is being written.")}>
            {done || rejected || hasContent ? "Run the writer again" : "Run the writer"}
          </button>
        )}
        {stopped && (
          <button type="button" className="admin-btn admin-btn--primary" disabled={pending} onClick={() => run(() => retryWriterStep(campaign.id), "Retrying the step.")}>
            Retry step
          </button>
        )}
        {running && (
          <button type="button" className="admin-btn" disabled={pending} onClick={() => run(() => continueWriter(campaign.id), "Handed the run on to the next step.")}>
            Continue
          </button>
        )}
        {(running || stopped || ready) && (
          <ConfirmButton
            label="Stop"
            title="Stop the writer run?"
            body="The assets keep what the steps so far wrote. Run the writer again to start from the draft."
            confirmLabel="Stop the run"
            disabled={pending}
            onConfirm={() => stopWriter(campaign.id)}
            onDone={() => router.refresh()}
          />
        )}
      </div>
    </section>
  );
}
