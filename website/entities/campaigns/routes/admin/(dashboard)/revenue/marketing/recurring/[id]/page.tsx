import { SurfaceLink as Link } from "@/kernel/shell/SurfaceLink";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { companyOs } from "@/kernel/data/supabase";
import { PageHead } from "@/kernel/ui/PageHead";
import { Badge } from "@/kernel/ui/Badge";
import { formatDate } from "@/kernel/ui/format";
import { requireRevenueAccess } from "@/kernel/identity/revenue-access";
import { listAudiences } from "@/entities/campaigns/lib/audiences";
import { listBrands } from "@/entities/campaigns/lib/marketing-calendar";
import { getSeries } from "@/entities/campaigns/lib/series";
import { SeriesEditor } from "./SeriesEditor";

export const metadata: Metadata = {
  title: "Recurring broadcasts",
  description: "A recurring broadcast's audience, schedule and issues.",
};

export default async function SeriesDetailPage({ params }: { params: { id: string } }) {
  await requireRevenueAccess();
  const [series, audiences, brands, issues] = await Promise.all([
    getSeries(params.id),
    listAudiences(),
    listBrands(),
    companyOs.from("email_campaigns").select("id, name, status, scheduled_at")
      .eq("series_id", params.id)
      .order("scheduled_at", { ascending: false })
      .limit(26),
  ]);
  if (!series) notFound();
  if (issues.error) console.error("[campaigns/series] issues", issues.error);

  return (
    <div>
      <PageHead
        eyebrow={<><Link href="/admin/revenue/marketing/recurring">← Recurring</Link> · Broadcast series</>}
        title={series.name}
        sub={
          <>
            A recurring broadcast: one template, filled once a week, and every reader gets the same issue.{" "}
            {series.active ? "Active: the draft for each week opens on schedule." : "Paused: no new issues open until it is switched on."}{" "}
           
          </>
        }
      />
      <SeriesEditor series={series} audiences={audiences.rows.map((a) => ({ id: a.id, name: a.name }))} brands={brands} />
      <section className="admin-card admin-section-card">
        <div className="admin-card-title">Issues</div>
        {(issues.data ?? []).length === 0 ? (
          <div className="admin-empty u-mt-3">No issues yet. The first opens at the next draft moment while the series is active.</div>
        ) : (
          <div className="admin-list u-mt-3">
            {(issues.data ?? []).map((i) => (
              <div className="admin-list-row" key={i.id}>
                <div className="admin-list-main">
                  <div className="admin-list-title">
                    <Link href={`/admin/revenue/marketing/broadcasts/${i.id}`}>{i.name}</Link>
                  </div>
                  <div className="admin-list-sub">Sends {formatDate(i.scheduled_at)}</div>
                </div>
                <div className="admin-list-aside">
                  <Badge>{i.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
