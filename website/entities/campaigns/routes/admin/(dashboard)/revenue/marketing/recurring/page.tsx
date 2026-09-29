import { SurfaceLink as Link } from "@/kernel/shell/SurfaceLink";
import type { Metadata } from "next";
import { PageHead } from "@/kernel/ui/PageHead";
import { Badge } from "@/kernel/ui/Badge";
import { requireRevenueAccess } from "@/kernel/identity/revenue-access";
import { listAudiences } from "@/entities/campaigns/lib/audiences";
import { listSeries } from "@/entities/campaigns/lib/series";
import { listAgents, messageCounts } from "@/entities/campaigns/lib/personal/data";
import { WEEKDAYS, hourLabel } from "./schedule-labels";
import { NewRecurringForm } from "./NewRecurringForm";

export const metadata: Metadata = {
  title: "Recurring",
  description: "Everything that emails on its own schedule: broadcast series and personal agents.",
};

// One list for everything that runs on a rhythm, told apart by type: a
// broadcast series sends everyone the same issue; a personal agent writes one
// email per person. Three words, one meaning each: Broadcast (same email to
// everyone), Personal (one email per person), Recurring (runs on a schedule).
type Row = {
  id: string;
  type: "broadcast" | "personal";
  name: string;
  audience: string | null;
  rhythm: string;
  review: string;
  waiting: number | null;
  active: boolean;
  href: string;
};

export default async function RecurringPage() {
  await requireRevenueAccess();
  const [series, agents, audiences] = await Promise.all([listSeries(), listAgents(), listAudiences()]);
  const counts = await messageCounts(agents.rows.map((a) => a.id));
  const error = series.error ?? agents.error ?? audiences.error;

  const rows: Row[] = [
    ...series.rows.map((s): Row => ({
      id: s.id,
      type: "broadcast",
      name: s.name,
      audience: s.audienceName,
      rhythm: `${WEEKDAYS[s.sendWeekday]} ${hourLabel(s.sendHour)}, ${s.timeZone}`,
      review: "a person approves each issue",
      waiting: null,
      active: s.active,
      href: `/admin/revenue/marketing/recurring/${s.id}`,
    })),
    ...agents.rows.map((a): Row => ({
      id: a.id,
      type: "personal",
      name: a.name,
      audience: a.audienceName,
      rhythm: `every ${a.cadenceDays} days, ${hourLabel(a.sendHour)} their time`,
      review: a.reviewMode === "hold_all" ? "every message is read" : `a sample of ${a.sampleSize} is read`,
      waiting: counts.get(a.id)?.held ?? 0,
      active: a.active,
      href: `/admin/revenue/marketing/personal/${a.id}`,
    })),
  ].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <PageHead
        eyebrow={<>Revenue · <Link href="/admin/revenue/marketing">Marketing</Link></>}
        title="Recurring"
        sub="Everything that emails on its own schedule. A broadcast series sends everyone the same issue; a personal agent writes one email per person from what we know about them."
        action={<NewRecurringForm audiences={audiences.rows.map((a) => ({ id: a.id, name: a.name }))} />}
      />
      {error && <div className="admin-alert admin-alert--err u-mb-4">{error}</div>}
      <div className="admin-table-wrap">
        {rows.length === 0 ? (
          <div className="admin-empty">Nothing recurring yet. Create a broadcast series or a personal agent for a saved audience.</div>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Audience</th>
                  <th>Rhythm</th>
                  <th>Review</th>
                  <th className="u-right">Waiting</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={`${r.type}:${r.id}`}>
                    <td className="admin-cell-strong">
                      <Link href={r.href}>{r.name}</Link>
                    </td>
                    <td>{r.type === "broadcast" ? <Badge tone="info">Broadcast</Badge> : <Badge tone="ok">Personal</Badge>}</td>
                    <td className="admin-cell-muted">{r.audience ?? "—"}</td>
                    <td className="admin-cell-muted">{r.rhythm}</td>
                    <td className="admin-cell-muted">{r.review}</td>
                    <td className="u-right">{r.waiting === null ? <span className="admin-cell-muted">—</span> : r.waiting > 0 ? <Badge tone="warn">{r.waiting}</Badge> : <span className="admin-cell-muted">0</span>}</td>
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
