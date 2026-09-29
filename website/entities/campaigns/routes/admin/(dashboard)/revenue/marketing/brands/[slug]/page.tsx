import { SurfaceLink as Link } from "@/kernel/shell/SurfaceLink";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHead } from "@/kernel/ui/PageHead";
import { requireRevenueAccess } from "@/kernel/identity/revenue-access";
import { getBrandProfileBySlug } from "@/entities/campaigns/lib/brand-profiles";
import { BrandProfileTabs } from "./BrandProfileTabs";
import { AutoPublishToggle } from "./AutoPublishToggle";

export const metadata: Metadata = {
  title: "Brand profile",
  description: "Voice, channels, and writing process for a brand.",
};

export default async function BrandProfilePage({ params }: { params: { slug: string } }) {
  await requireRevenueAccess();
  const profile = await getBrandProfileBySlug(params.slug);
  if (!profile) notFound();

  return (
    <div>
      <PageHead
        eyebrow={
          <>
            <Link href="/admin/revenue/marketing">Marketing</Link> ·{" "}
            <Link href="/admin/revenue/marketing/brands">Brands</Link> · Profile
          </>
        }
        title={profile.brandName}
        sub="The voice, channels, and writing process the AI writer follows for this brand."
      />
      <AutoPublishToggle brandId={profile.brandId} on={profile.autoPublish} />
      <BrandProfileTabs profile={profile} />
    </div>
  );
}
