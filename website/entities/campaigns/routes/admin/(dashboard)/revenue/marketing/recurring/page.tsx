import { SurfaceLink as Link } from "@/kernel/shell/SurfaceLink";
import type { Metadata } from "next";
import { PageHead } from "@/kernel/ui/PageHead";
import { Badge } from "@/kernel/ui/Badge";
import { requirePermission } from "@/kernel/identity/access-request";
import { listAudiences } from "@/entities/campaigns/lib/audiences";
import { listSeries } from "@/entities/campaigns/lib/series";
import { WEEKDAYS, hourLabel } from "./schedule-labels";
import { NewRecurringForm } from "./NewRecurringForm";

export const metadata: Metadata = {
  title: "Recurring",
  description: "Every broadcast series that emails on its own schedule.",
};

// One list of the broadcast series: each sends everyone the same issue, filled
// from a template and approved by a person. Recurring means runs on a schedule.
type Row = {
  id: string;
  name: string;
  audience: string | null;
  rhythm: string;
  review: string;
  active: boolean;
  href: string;
};

export default async function RecurringPage() {
  await requirePermission("campaigns.marketing");
  const [series, audiences] = await Promise.all([listSeries(), listAudiences()]);
  const error = series.error ?? audiences.error;

  const rows: Row[] = series.rows
    .map((s): Row => ({
      id: s.id,
      name: s.name,
      audience: s.audienceName,
      rhythm: `${WEEKDAYS[s.sendWeekday]} ${hourLabel(s.sendHour)}, ${s.timeZone}`,
      review: "a person approves each issue",
      active: s.active,
      href: `/admin/revenue/marketing/recurring/${s.id}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <PageHead
        eyebrow={<>Revenue · <Link href="/admin/revenue/marketing">Marketing</Link></>}
        title="Recurring"
        sub="Every broadcast series that emails on its own schedule. A series sends everyone the same issue, and a person approves each one."
        action={<NewRecurringForm audiences={audiences.rows.map((a) => ({ id: a.id, name: a.name }))} />}
      />
      {error && <div className="admin-alert admin-alert--err u-mb-4">{error}</div>}
      <div className="admin-table-wrap">
        {rows.length === 0 ? (
          <div className="admin-empty">Nothing recurring yet. Create a broadcast series for a saved audience.</div>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Audience</th>
                  <th>Rhythm</th>
                  <th>Review</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="admin-cell-strong">
                      <Link href={r.href}>{r.name}</Link>
                    </td>
                    <td className="admin-cell-muted">{r.audience ?? "—"}</td>
                    <td className="admin-cell-muted">{r.rhythm}</td>
                    <td className="admin-cell-muted">{r.review}</td>
                    <td>{r.active ? <Badge tone="ok">Active</Badge> : <Badge tone="neutral">Paused</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
