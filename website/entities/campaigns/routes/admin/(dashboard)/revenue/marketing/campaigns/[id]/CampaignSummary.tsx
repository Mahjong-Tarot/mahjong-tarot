"use client";

import type { ReactNode } from "react";
import { CHANNEL_LABEL, type CalendarChannel } from "@/entities/campaigns/lib/marketing-calendar-shared";
import type { CampaignPlan } from "@/entities/campaigns/lib/campaign-plan-shared";
import { blogTypeLabel, imageStyleLabel, socialStyleLabel } from "@/entities/campaigns/lib/style-catalogues";

// The hub header's read view: the campaign plan first (what the campaign is
// about and the shape it takes), then where it sits. Plain aligned text in the
// design system's key-value list, so every row lines up however long a value is.

const notPlanned = <span className="admin-cell-muted">Not planned yet</span>;

export function CampaignSummary({
  plan,
  objective,
  windowLabel,
  pillarName,
  brandName,
  utmCampaign,
}: {
  plan: CampaignPlan | null;
  objective: string;
  windowLabel: string;
  pillarName: string | null;
  brandName: string | null;
  utmCampaign: string;
}) {
  const social = plan ? Object.entries(plan.social) : [];
  const rows: [string, ReactNode][] = [
    ["Angle", plan?.angle || notPlanned],
    ["Primary question", plan?.question ?? notPlanned],
    ["Primary keyword", plan?.keyword ?? notPlanned],
    ["Blog type", plan ? blogTypeLabel(plan.blogType) : notPlanned],
    ["Hero image", plan ? imageStyleLabel(plan.heroImageStyle) : notPlanned],
    ["Social", social.length ? social.map(([c, s]) => `${CHANNEL_LABEL[c as CalendarChannel] ?? c}: ${socialStyleLabel(s)}`).join("; ") : notPlanned],
    ["Goal", objective || "—"],
    ["Window", windowLabel],
    ["Pillar", pillarName || "—"],
    ["Brand", brandName || "—"],
    ["UTM", utmCampaign || "—"],
  ];
  return (
    <dl className="admin-kv u-mt-4">
      {rows.map(([label, value]) => (
        <div key={label} className="u-contents">
          <dt>{label}</dt>
          <dd title={label === "UTM" ? "Add ?utm_campaign=<slug> to a link and an inquiry from it is attributed to this campaign." : undefined}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
