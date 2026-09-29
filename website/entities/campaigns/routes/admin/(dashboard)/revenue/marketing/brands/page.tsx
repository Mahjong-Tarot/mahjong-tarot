import { SurfaceLink as Link } from "@/kernel/shell/SurfaceLink";
import type { Metadata } from "next";
import { PageHead } from "@/kernel/ui/PageHead";
import { requireRevenueAccess } from "@/kernel/identity/revenue-access";
import { listBrandProfiles } from "@/entities/campaigns/lib/brand-profiles";

export const metadata: Metadata = {
  title: "Brands",
  description: "Voice, channels, and the writing process each brand's content follows.",
};

export default async function BrandsPage() {
  await requireRevenueAccess();
  const brands = await listBrandProfiles();

  return (
    <div>
      <PageHead
        eyebrow={<>Revenue · <Link href="/admin/revenue/marketing">Marketing</Link></>}
        title="Brands"
        sub="Each brand's voice, channels, and writing process. The broadcast editor and the AI writer read from here."
      />

      {brands.length === 0 ? (
        <div className="admin-empty">No active brands.</div>
      ) : (
        <div className="admin-kpi-grid">
          {brands.map((b) => (
            <Link
              key={b.brandId}
              href={`/admin/revenue/marketing/brands/${b.brandSlug}`}
              className="admin-card admin-section-card u-block u-link-plain"
            >
              <div className="admin-card-title">{b.brandName}</div>
              <p className="admin-page-sub u-mt-2">
                {b.positioning ?? "No profile yet."}
              </p>
              <span className="admin-btn admin-btn--sm u-mt-3">
                Edit profile
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
