"use client";

import { ConfirmButton } from "@/kernel/ui/ConfirmButton";
import type { MarketingCampaignStatus } from "@/entities/campaigns/lib/marketing-campaigns-shared";
import { updateCampaign } from "../actions";

// The two lifecycle verbs beside Edit on a campaign: pause or resume (the
// writer schedule starts only an active campaign) and delete (the archived
// status, which keeps the assets and the report and leaves the lists).
type ActionResult = { ok: true } | { ok: false; error: string };

export function CampaignLifecycle({
  campaignId,
  status,
  pending,
  run,
  onDeleted,
}: {
  campaignId: string;
  status: MarketingCampaignStatus;
  pending: boolean;
  run: (action: () => Promise<ActionResult>, done: string) => void;
  onDeleted: () => void;
}) {
  return (
    <>
      {(status === "active" || status === "paused") && (
        <button
          type="button"
          className="admin-btn admin-btn--sm"
          disabled={pending}
          title={status === "active" ? "Keep the campaign, stop the writer starting it." : "Let the writer start it again on its date."}
          onClick={() => run(() => updateCampaign(campaignId, { status: status === "active" ? "paused" : "active" }), status === "active" ? "Campaign paused." : "Campaign resumed.")}
        >
          {status === "active" ? "Pause" : "Resume"}
        </button>
      )}
      <ConfirmButton
        label="Delete"
        className="admin-btn admin-btn--sm admin-btn--danger"
        title="Delete this campaign?"
        body="It leaves the Campaigns list and the pickers. Its assets, posts and report stay where they are."
        confirmLabel="Delete"
        disabled={pending}
        onConfirm={() => updateCampaign(campaignId, { status: "archived" })}
        onDone={onDeleted}
      />
    </>
  );
}
