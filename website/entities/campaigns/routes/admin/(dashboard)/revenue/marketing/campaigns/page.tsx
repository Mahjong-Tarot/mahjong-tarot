import { SurfaceLink as Link } from "@/kernel/shell/SurfaceLink";
import type { Metadata } from "next";
import { PageHead } from "@/kernel/ui/PageHead";
import { requireRevenueAccess } from "@/kernel/identity/revenue-access";
import { listCampaigns } from "@/entities/campaigns/lib/marketing-campaigns";
import { listCampaignLedger } from "@/entities/campaigns/lib/campaign-ledger";
import { listBrands, listPillars, listEntries } from "@/entities/campaigns/lib/marketing-calendar";
import { NewCampaignButton } from "./NewCampaignButton";
import { CampaignsView } from "./CampaignsView";

export const metadata: Metadata = {
  title: "Campaigns",
  description: "Founder-led campaigns: one idea, assets across every channel.",
};

export default async function CampaignsPage() {
  await requireRevenueAccess();
  const [{ rows, error }, brands, pillars, { rows: allEntries }, { rows: ledger, error: ledgerError }] = await Promise.all([
    listCampaigns(),
    listBrands(),
    listPillars(),
    listEntries(),
    listCampaignLedger(),
  ]);

  // The calendar view is a view of campaign assets, so it only shows entries
  // that belong to a campaign.
  const campaignEntries = allEntries.filter((e) => e.campaignId);

  return (
    <div>
      <PageHead
        eyebrow={<>Revenue · <Link href="/admin/revenue/marketing">Marketing</Link></>}
        title="Campaigns"
        sub={`${rows.length} campaign${rows.length === 1 ? "" : "s"}. A campaign is the idea; it spawns assets across every channel.`}
        action={<NewCampaignButton brands={brands} pillars={pillars} />}
      />

      {(error || ledgerError) && (
        <div className="admin-alert admin-alert--err u-mb-4">
          {error ?? ledgerError}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="admin-table-wrap">
          <div className="admin-empty">No campaigns yet. Start one with “+ New campaign”.</div>
        </div>
      ) : (
        <CampaignsView rows={rows} entries={campaignEntries} ledger={ledger} />
      )}
    </div>
  );
}
