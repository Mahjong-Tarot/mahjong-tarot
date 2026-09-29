"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSurfaceBase } from "@/kernel/shell/surface-client";
import { ConfirmButton } from "@/kernel/ui/ConfirmButton";
import type { BroadcastRow } from "@/entities/campaigns/lib/broadcasts";
import type { BrandOption } from "@/entities/campaigns/lib/marketing-calendar-shared";
import type { BrandProfile } from "@/entities/campaigns/lib/brand-profiles";
import type { AudienceRow } from "@/entities/campaigns/lib/audience-rules";
import {
  approveBroadcast,
  buildRecipients,
  cancelBroadcast,
  deleteBroadcast,
  pauseBroadcast,
  renameBroadcast,
  startSending,
  updateBroadcast,
} from "../actions";
import { markBroadcastMissed } from "../missed-actions";
import { BroadcastBlocksEditor, type PostOption } from "./BroadcastBlocksEditor";
import { SendWindowField } from "./SendWindowField";
import { SendTestField } from "./SendTestField";
import { AudienceCard } from "./AudienceCard";

type Note = { tone: "ok" | "err"; text: string } | null;

// ISO (stored UTC) -> the "YYYY-MM-DDTHH:mm" a datetime-local input expects, in
// the operator's local time.
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function BroadcastEditor({
  campaign,
  pendingCount,
  brands,
  profiles,
  posts,
  audiences,
}: {
  campaign: BroadcastRow;
  pendingCount: number;
  brands: BrandOption[];
  profiles: BrandProfile[];
  posts: PostOption[];
  audiences: AudienceRow[];
}) {
  const router = useRouter();
  const base = useSurfaceBase();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState<Note>(null);

  const [name, setName] = useState(campaign.name);
  const [subject, setSubject] = useState(campaign.subject);
  const [preheader, setPreheader] = useState(campaign.preheader ?? "");
  const [bodyMd, setBodyMd] = useState(campaign.bodyMd);
  const [replyTo, setReplyTo] = useState(campaign.replyTo ?? "");
  const [brandId, setBrandId] = useState(campaign.brandId ?? "");
  const [scheduledAt, setScheduledAt] = useState(toLocalInput(campaign.scheduledAt));

  const isDraft = campaign.status === "draft";
  const activeProfile = profiles.find((p) => p.brandId === brandId) ?? null;

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    setNote(null);
    startTransition(async () => {
      const result = await fn();
      if (result.ok) {
        setNote({ tone: "ok", text: success });
        router.refresh();
      } else {
        setNote({ tone: "err", text: result.error ?? "Something went wrong." });
      }
    });
  }

  return (
    <>
      {note && (
        <div className={`admin-alert admin-alert--${note.tone} u-mb-4`}>
          {note.text}
        </div>
      )}

      <section className="admin-card admin-section-card">
        <div className="admin-card-title">Content</div>
        {!isDraft && (
          <div className="admin-hint u-mt-2">
            The content is frozen because this broadcast is {campaign.status}. Editing it mid-send
            would change what later recipients receive. The name and the brand are labels on the record and can still be changed.
          </div>
        )}
        <div className="admin-form u-mt-3">
          <div className="admin-field">
            <label className="admin-label" htmlFor="brand">
              Brand
            </label>
            <select
              id="brand"
              className="admin-input"
              value={brandId}
              disabled={pending}
              onChange={(e) => setBrandId(e.target.value)}
            >
              <option value="">— No brand —</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <div className="admin-hint">Which brand identity this send goes out as.</div>
            {activeProfile && (activeProfile.voiceMd || activeProfile.primaryCta || activeProfile.positioning) && (
              <details className="admin-card u-mt-2 u-p-3">
                <summary className="u-strong u-pointer">
                  {activeProfile.brandName} voice reference
                </summary>
                <div className="u-stack u-mt-2">
                  {activeProfile.positioning && (
                    <div><span className="admin-label">Positioning</span><div>{activeProfile.positioning}</div></div>
                  )}
                  {activeProfile.voiceMd && (
                    <div><span className="admin-label">Voice</span><div className="u-prewrap">{activeProfile.voiceMd}</div></div>
                  )}
                  {activeProfile.primaryCta && (
                    <div><span className="admin-label">Primary CTA</span><div>{activeProfile.primaryCta}</div></div>
                  )}
                  <a className="admin-btn admin-btn--sm" href="../../brands">Edit brand profile</a>
                </div>
              </details>
            )}
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="name">
              Internal name
            </label>
            <input
              id="name"
              className="admin-input"
              value={name}
              disabled={pending}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {!isDraft && (
            <div className="admin-form-actions">
              <button
                type="button"
                className="admin-btn admin-btn--sm"
                disabled={pending || !name.trim()}
                onClick={() => run(() => renameBroadcast(campaign.id, { name, brandId: brandId || null }), "Name and brand saved.")}
              >
                Save name and brand
              </button>
            </div>
          )}
          <div className="admin-field">
            <label className="admin-label" htmlFor="subject">
              Subject line
            </label>
            <input
              id="subject"
              className="admin-input"
              value={subject}
              disabled={!isDraft}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="preheader">
              Preheader
            </label>
            <input
              id="preheader"
              className="admin-input"
              value={preheader}
              disabled={!isDraft}
              onChange={(e) => setPreheader(e.target.value)}
            />
            <div className="admin-hint">
              The grey line the inbox shows after the subject. Hidden inside the email itself.
            </div>
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="body">
              Body
            </label>
            <textarea
              id="body"
              className="admin-textarea"
              rows={16}
              value={bodyMd}
              disabled={!isDraft}
              onChange={(e) => setBodyMd(e.target.value)}
            />
            <div className="admin-hint">
              Markdown: # headings, **bold**, *italic*, [links](https://…), and - lists. Write{" "}
              {"{first_name}"} for the reader&apos;s first name. The Mahjong Tarot wrapper, footer, and
              unsubscribe link are added automatically; featured posts and the call to action go below.
            </div>
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="replyTo">
              Reply-to
            </label>
            <input
              id="replyTo"
              className="admin-input"
              value={replyTo}
              disabled={!isDraft}
              placeholder="you@example.com"
              onChange={(e) => setReplyTo(e.target.value)}
            />
          </div>
          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              disabled={!isDraft || pending}
              onClick={() =>
                run(
                  () => updateBroadcast(campaign.id, { name, subject, preheader, bodyMd, replyTo, brandId: brandId || null }),
                  "Content saved.",
                )
              }
            >
              {pending ? "Saving…" : "Save content"}
            </button>
            <SendTestField campaignId={campaign.id} pending={pending} run={run} />
          </div>
        </div>
      </section>

      <BroadcastBlocksEditor campaignId={campaign.id} blocks={campaign.blocks} posts={posts} isDraft={isDraft} pending={pending} run={run} />

      <AudienceCard
        campaign={campaign}
        audiences={audiences}
        pendingCount={pendingCount}
        isDraft={isDraft}
        pending={pending}
        run={run}
        onBuild={() =>
          startTransition(async () => {
            setNote(null);
            const result = await buildRecipients(campaign.id);
            if (result.ok) {
              setNote({ tone: "ok", text: `Added ${result.added} recipient(s).` });
              router.refresh();
            } else {
              setNote({ tone: "err", text: result.error });
            }
          })
        }
      />

      <section className="admin-card admin-section-card">
        <div className="admin-card-title">Send</div>
        <p className="admin-page-sub u-mt-1">
          {campaign.status === "draft" &&
            (campaign.seriesId
              ? `${pendingCount} recipient(s) queued. This is a series issue: approving schedules it to send at the time below.`
              : `${pendingCount} recipient(s) queued. Approving does not send: you start the send separately.`)}
          {campaign.status === "approved" &&
            `Approved by ${campaign.approvedBy ?? "an admin"}. Nothing has been sent yet.`}
          {campaign.status === "sending" &&
            `Sending in batches of ${campaign.batchSize} every 15 minutes. ${pendingCount} left.`}
          {campaign.status === "sent" && "This broadcast has finished sending."}
          {campaign.status === "cancelled" && "This broadcast was cancelled."}
          {campaign.status === "missed" && "This broadcast was missed: its moment passed and it never went out."}
        </p>

        <div className="admin-form u-mt-3">
          <div className="admin-field">
            <label className="admin-label" htmlFor="schedule">
              Schedule
            </label>
            <input
              id="schedule"
              className="admin-input"
              type="datetime-local"
              value={scheduledAt}
              disabled={!isDraft}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
            <div className="admin-hint">
              {scheduledAt
                ? "Once started, the first batch waits until this time. Leave blank to send as soon as you start."
                : "No schedule: sending starts immediately when you press Start sending."}
            </div>
            <SendWindowField campaign={campaign} isDraft={isDraft} pending={pending} run={run} />
            {isDraft && (
              <div className="admin-form-actions u-mt-2">
                <button
                  type="button"
                  className="admin-btn"
                  disabled={pending}
                  onClick={() =>
                    run(
                      () => updateBroadcast(campaign.id, { scheduledAt: scheduledAt || null }),
                      scheduledAt ? "Schedule saved." : "Schedule cleared.",
                    )
                  }
                >
                  Save schedule
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="admin-form-actions u-mt-3">
          {campaign.status === "draft" && (
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              disabled={pending || pendingCount === 0}
              onClick={() =>
                run(() => approveBroadcast(campaign.id), campaign.seriesId ? "Approved. It sends at the scheduled time." : "Broadcast approved.")
              }
            >
              {campaign.seriesId ? "Approve and schedule" : "Approve"}
            </button>
          )}
          {campaign.status === "approved" && (
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              disabled={pending}
              onClick={() =>
                run(() => startSending(campaign.id), "Sending started. The first batch goes out within 15 minutes.")
              }
            >
              Start sending
            </button>
          )}
          {campaign.status === "sending" && (
            <button
              type="button"
              className="admin-btn"
              disabled={pending}
              title="Stops the next batch; Start sending resumes where it left off."
              onClick={() => run(() => pauseBroadcast(campaign.id), "Paused. Nothing more goes out until you start sending again.")}
            >
              Pause
            </button>
          )}
          {(campaign.status === "draft" || campaign.status === "approved") && (
            <button
              type="button"
              className="admin-btn"
              disabled={pending}
              onClick={() => run(() => markBroadcastMissed(campaign.id), "Marked missed.")}
            >
              Mark missed
            </button>
          )}
          {campaign.status !== "sent" && campaign.status !== "cancelled" && campaign.status !== "missed" && (
            <button
              type="button"
              className="admin-btn admin-btn--danger"
              disabled={pending}
              onClick={() => run(() => cancelBroadcast(campaign.id), "Broadcast cancelled.")}
            >
              Cancel broadcast
            </button>
          )}
          {campaign.status !== "sending" && (
            <ConfirmButton
              label="Delete"
              className="admin-btn admin-btn--danger"
              title="Delete this broadcast?"
              body={campaign.status === "sent" ? "It leaves the list and the calendar. Its recipients and results stay on record." : "It leaves the list and the calendar and will not send."}
              confirmLabel="Delete"
              disabled={pending}
              onConfirm={() => deleteBroadcast(campaign.id)}
              onDone={() => router.push(`${base}/revenue/marketing/broadcasts`)}
            />
          )}
        </div>
      </section>
    </>
  );
}
