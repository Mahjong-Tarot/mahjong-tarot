import { SurfaceLink as Link } from "@/kernel/shell/SurfaceLink";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHead } from "@/kernel/ui/PageHead";
import { requirePermission } from "@/kernel/identity/access-request";
import { getCampaign, getCampaignReport } from "@/entities/campaigns/lib/marketing-campaigns";
import { listBrands, listPillars, listEntriesByCampaign } from "@/entities/campaigns/lib/marketing-calendar";
import { getBrandProfile } from "@/entities/campaigns/lib/brand-profiles";
import { activeChannelsFrom } from "@/entities/campaigns/lib/writer/profile-rules";
import { publishApprovalView } from "@/entities/campaigns/lib/writer/publish-approval";
import { isWriterStep } from "@/entities/campaigns/lib/writer/steps";
import { CampaignHub } from "./CampaignHub";
import { WriterPanel, type WriterApproval } from "./WriterPanel";

export const metadata: Metadata = {
  title: "Campaign",
  description: "One campaign: the idea, its assets across every channel, and the plan.",
};

export default async function CampaignDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await requirePermission("campaigns.marketing");
  const campaign = await getCampaign(params.id);
  if (!campaign) notFound();

  const [entries, brands, pillars, report, profile] = await Promise.all([
    listEntriesByCampaign(campaign.id),
    listBrands(),
    listPillars(),
    getCampaignReport(campaign.id),
    campaign.brandId ? getBrandProfile(campaign.brandId) : Promise.resolve(null),
  ]);
  // A run at ready waits on its Publish approval (Y.16); a campaign whose writer
  // is not running may hold a post every publish refuses until it is asked
  // about again. Only a brand that publishes on approval is asked. A failed
  // read shows as unread on the panel, never as "no approval".
  let approval: WriterApproval | null = null;
  if (!isWriterStep(campaign.writerStep)) {
    try {
      approval = await publishApprovalView(campaign.id, !profile?.autoPublish);
    } catch (err) {
      approval = { pendingVersion: null, currentVersion: null, where: null, askable: false, unread: err instanceof Error ? err.message : String(err) };
    }
  }
  // The asset lanes are the channels the brand's profile marks active.
  const channels = profile ? activeChannelsFrom(profile) : [];

  return (
    <div>
      <PageHead
        eyebrow={
          <>
            <Link href="/admin/revenue/marketing">Marketing</Link> ·{" "}
            <Link href="/admin/revenue/marketing/campaigns">Campaigns</Link> ·{" "}
            {campaign.brandName ?? "No brand"}
          </>
        }
        title={campaign.name}
      />
      <WriterPanel campaign={campaign} entries={entries} approval={approval} />
      <CampaignHub campaign={campaign} entries={entries} report={report} brands={brands} pillars={pillars} channels={channels} />
    </div>
  );
}
