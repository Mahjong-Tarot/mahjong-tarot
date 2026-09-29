"use client";

import { useState } from "react";
import type { BroadcastRow } from "@/entities/campaigns/lib/broadcasts";
import type { AudienceRow } from "@/entities/campaigns/lib/audience-rules";
import { clearRecipients, updateBroadcast } from "../actions";

const PERSONA_CHOICES = [
  { value: "prospect", label: "Prospects" },
  { value: "client", label: "Clients" },
];

type Run = (fn: () => Promise<{ ok: boolean; error?: string }>, success: string) => void;

// Who a broadcast reaches: a saved audience, or the persona tick-boxes when none
// is picked, plus the batch size and the recipient list controls.
export function AudienceCard({
  campaign,
  audiences,
  pendingCount,
  isDraft,
  pending,
  run,
  onBuild,
}: {
  campaign: BroadcastRow;
  audiences: AudienceRow[];
  pendingCount: number;
  isDraft: boolean;
  pending: boolean;
  run: Run;
  onBuild: () => void;
}) {
  const [batchSize, setBatchSize] = useState(String(campaign.batchSize));
  const [personas, setPersonas] = useState<string[]>(campaign.segment.personas ?? []);
  const [audienceId, setAudienceId] = useState(campaign.audienceId ?? "");

  function togglePersona(value: string) {
    setPersonas((prev) => (prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]));
  }

  return (
  <section className="admin-card admin-section-card">
    <div className="admin-card-title">Audience</div>
    <p className="admin-page-sub u-mt-1">
      Only contacts who are marked subscribed can be reached. Job seekers and anyone flagged
      do-not-contact are excluded no matter what you pick here.
    </p>
    <p className="admin-page-sub u-mt-1">
      {audienceId
        ? "A saved audience decides who this reaches, whatever the brand."
        : campaign.brandName && campaign.brandName !== "Mahjong Tarot"
          ? `This is a ${campaign.brandName} broadcast, so it reaches only ${campaign.brandName}'s brand audience.`
          : "With no brand (or the Mahjong Tarot brand) set, this reaches the full house list. Pick a guest brand to scope the send to that brand's audience only."}
    </p>
    <div className="admin-form u-mt-3">
      <div className="admin-field">
        <label className="admin-label" htmlFor="audience">
          Saved audience
        </label>
        <select
          id="audience"
          className="admin-input"
          value={audienceId}
          disabled={!isDraft}
          onChange={(e) => setAudienceId(e.target.value)}
        >
          <option value="">— None: use personas —</option>
          {audiences.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <div className="admin-hint">
          Resolved again when you build the list and when you approve. <a href="../audiences">Manage audiences</a>.
        </div>
      </div>
      {!audienceId && (
      <div className="admin-field">
        <span className="admin-label">Personas</span>
        <div className="u-row u-gap-4 u-wrap u-mt-2">
          {PERSONA_CHOICES.map((choice) => (
            <label key={choice.value} className="u-row">
              <input
                type="checkbox"
                checked={personas.includes(choice.value)}
                disabled={!isDraft}
                onChange={() => togglePersona(choice.value)}
              />
              {choice.label}
            </label>
          ))}
        </div>
        <div className="admin-hint">Leave both unticked to reach every subscribed contact.</div>
      </div>
      )}
      <div className="admin-field">
        <label className="admin-label" htmlFor="batch">
          Batch size
        </label>
        <input
          id="batch"
          className="admin-input"
          type="number"
          min={1}
          max={1000}
          value={batchSize}
          disabled={!isDraft}
          onChange={(e) => setBatchSize(e.target.value)}
        />
        <div className="admin-hint">
          Emails per 15-minute tick. Keep this low for the first sends so bounces surface before
          the whole list has gone out.
        </div>
      </div>
      <div className="admin-form-actions">
        <button
          type="button"
          className="admin-btn"
          disabled={!isDraft || pending}
          onClick={() =>
            run(
              () => updateBroadcast(campaign.id, {
                segment: { ...campaign.segment, personas },
                audienceId: audienceId || null,
                batchSize: Number(batchSize),
              }),
              "Audience settings saved.",
            )
          }
        >
          Save audience
        </button>
        <button type="button" className="admin-btn admin-btn--primary" disabled={!isDraft || pending} onClick={onBuild}>
          Build recipient list
        </button>
        {pendingCount > 0 && isDraft && (
          <button
            type="button"
            className="admin-btn admin-btn--danger"
            disabled={pending}
            onClick={() => run(() => clearRecipients(campaign.id), "Recipient list cleared.")}
          >
            Clear list
          </button>
        )}
      </div>
    </div>
  </section>
  );
}
