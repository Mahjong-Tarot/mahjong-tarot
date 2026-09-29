"use client";

import { useState } from "react";
import type { BroadcastRow } from "@/entities/campaigns/lib/broadcasts";
import { describeWindow, TUESDAY_FRIDAY_EIGHT } from "@/entities/campaigns/lib/send-window";
import { updateBroadcast } from "../actions";

// Delivery in each contact's own morning. On, approval stamps every recipient
// with the next Tuesday or Friday 08:00 in their zone and the cron releases one
// zone at a time; off, the send starts on the next tick after Start sending (or
// the schedule above). Saved into the audience settings, beside the personas.

type Run = (fn: () => Promise<{ ok: boolean; error?: string }>, success: string) => void;

export function SendWindowField({ campaign, isDraft, pending, run }: { campaign: BroadcastRow; isDraft: boolean; pending: boolean; run: Run }) {
  const [on, setOn] = useState(Boolean(campaign.segment.sendWindow));
  return (
    <div className="admin-field">
      <label className="u-row">
        <input
          type="checkbox"
          checked={on}
          disabled={!isDraft || pending}
          onChange={(e) => {
            const next = e.target.checked;
            setOn(next);
            run(
              () => updateBroadcast(campaign.id, { segment: { ...campaign.segment, sendWindow: next ? TUESDAY_FRIDAY_EIGHT : undefined } }),
              next ? `Delivery set to ${describeWindow(TUESDAY_FRIDAY_EIGHT)}.` : "Delivery window cleared.",
            );
          }}
        />
        Deliver {describeWindow(TUESDAY_FRIDAY_EIGHT)}
      </label>
      <div className="admin-hint">
        Zones come from the contact&apos;s recorded time zone, then city, then country; contacts with none get Ho Chi Minh City time.
        Approving stamps the next of those moments on each recipient.
      </div>
    </div>
  );
}
