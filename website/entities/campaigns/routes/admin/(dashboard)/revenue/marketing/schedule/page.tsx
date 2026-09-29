import { SurfaceLink as Link } from "@/kernel/shell/SurfaceLink";
import type { Metadata } from "next";
import { PageHead } from "@/kernel/ui/PageHead";
import { requireRevenueAccess } from "@/kernel/identity/revenue-access";
import { getEmailSchedule } from "@/entities/campaigns/lib/email-schedule";
import { formatDate } from "@/kernel/ui/format";
import { ScheduleCalendar } from "./ScheduleCalendar";

export const metadata: Metadata = {
  title: "Email schedule",
  description: "Every email send, past and projected, on one calendar.",
};

export default async function EmailSchedulePage() {
  await requireRevenueAccess();
  const { items, unscheduled, error } = await getEmailSchedule();
  const unwritten = items.filter((i) => i.status === "unwritten").length;

  return (
    <div>
      <PageHead
        eyebrow={<>Revenue · <Link href="/admin/revenue/marketing">Marketing</Link></>}
        title="Email schedule"
        sub={
          <>
            Broadcasts on the day they go, and each recurring series projected eight weeks ahead. Days are company time (GMT+7).
            {unwritten > 0 && <> <strong>{unwritten} series send{unwritten === 1 ? "" : "s"} past the draft moment with no issue.</strong></>}
          </>
        }
      />
      {error && <div className="admin-alert admin-alert--err u-mb-4">{error}</div>}

      <ScheduleCalendar items={items} />

      {unscheduled.length > 0 && (
        <div className="admin-table-wrap u-mt-4">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Draft with no send date</th>
                  <th>Brand</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {unscheduled.map((b) => (
                  <tr key={b.id}>
                    <td className="admin-cell-strong">
                      <Link href={`/admin/revenue/marketing/broadcasts/${b.id}`}>{b.name}</Link>
                    </td>
                    <td className="admin-cell-muted">{b.brandName ?? "—"}</td>
                    <td className="admin-cell-muted">{formatDate(b.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
