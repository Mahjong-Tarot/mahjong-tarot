import { SurfaceLink as Link } from "@/kernel/shell/SurfaceLink";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHead } from "@/kernel/ui/PageHead";
import { requireRevenueAccess } from "@/kernel/identity/revenue-access";
import { getCampaign, getCampaignReport } from "@/entities/campaigns/lib/marketing-campaigns";
import { listBrands, listPillars, listEntriesByCampaign } from "@/entities/campaigns/lib/marketing-calendar";
import { getBrandProfile } from "@/entities/campaigns/lib/brand-profiles";
import { activeChannelsFrom } from "@/entities/campaigns/lib/writer/profile-rules";
import { CampaignHub } from "./CampaignHub";
import { WriterPanel } from "./WriterPanel";

export const metadata: Metadata = {
  title: "Campaign",
  description: "One campaign: the idea, its assets across every channel, and the plan.",
};

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  await requireRevenueAccess();
  const campaign = await getCampaign(params.id);
  if (!campaign) notFound();

  const [entries, brands, pillars, report, profile] = await Promise.all([
    listEntriesByCampaign(campaign.id),
    listBrands(),
    listPillars(),
    getCampaignReport(campaign.id),
    campaign.brandId ? getBrandProfile(campaign.brandId) : Promise.resolve(null),
  ]);
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
      <WriterPanel campaign={campaign} entries={entries} />
      <CampaignHub campaign={campaign} entries={entries} report={report} brands={brands} pillars={pillars} channels={channels} />
    </div>
  );
}
