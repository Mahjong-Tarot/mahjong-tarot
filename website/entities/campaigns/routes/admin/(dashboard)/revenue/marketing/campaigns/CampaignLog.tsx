"use client";

import { SurfaceLink as Link } from "@/kernel/shell/SurfaceLink";
import { formatDate } from "@/kernel/ui/format";
import { ExternalLink } from "@/kernel/ui/ExternalLink";
import { blogTypeLabel, imageStyleLabel, socialStyleLabel } from "@/entities/campaigns/lib/style-catalogues";
import { CHANNEL_LABEL, type CalendarChannel } from "@/entities/campaigns/lib/marketing-calendar-shared";
import type { LedgerRow } from "@/entities/campaigns/lib/campaign-ledger-shared";

// The Log view: the ledger the writer reads, shown to a person. One row per
// campaign with the keyword, the primary question, the blog type, the hero
// style and each social channel's style, newest first, with a tally of each
// dimension above it so a run of the same shape is visible before the writer
// is asked for the next one.

function tally(values: (string | null)[], label: (v: string | null) => string | null): { name: string; n: number }[] {
  const counts = new Map<string, number>();
  for (const v of values) if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts].map(([v, n]) => ({ name: label(v) ?? v, n })).sort((a, b) => b.n - a.n || a.name.localeCompare(b.name));
}

function Tally({ title, items }: { title: string; items: { name: string; n: number }[] }) {
  return (
    <div className="admin-card admin-section-card">
      <div className="admin-card-title">{title}</div>
      {items.length === 0 ? (
        <div className="admin-cell-muted u-mt-2">None recorded.</div>
      ) : (
        <div className="admin-campaign-chip-row u-mt-2">
          {items.map((i) => (
            <span key={i.name} className="admin-chip">
              {i.name} <span className="admin-cell-mono">{i.n}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function CampaignLog({ rows }: { rows: LedgerRow[] }) {
  const socialStyles = rows.flatMap((r) => r.social.map((s) => s.socialStyle));
  return (
    <>
      <div className="admin-campaign-log-tallies u-mb-4">
        <Tally title="Blog types" items={tally(rows.map((r) => r.blogType), blogTypeLabel)} />
        <Tally title="Hero image styles" items={tally(rows.map((r) => r.imageStyle), imageStyleLabel)} />
        <Tally title="Social styles" items={tally(socialStyles, socialStyleLabel)} />
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
          <table className="admin-table admin-campaign-log-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Campaign</th>
                <th>Primary keyword</th>
                <th>Primary question</th>
                <th>Blog type</th>
                <th>Hero image</th>
                <th>Social</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.campaignId}>
                  <td className="admin-cell-mono">{formatDate(r.date)}</td>
                  <td className="admin-cell-strong">
                    <Link href={`/admin/revenue/marketing/campaigns/${r.campaignId}`}>{r.title ?? r.campaignName}</Link>
                    {r.postedUrl && (
                      <div className="admin-cell-muted u-mt-1">
                        <ExternalLink href={r.postedUrl} fallback={r.postedUrl}>{r.slug ? `/post/${r.slug}/` : r.postedUrl}</ExternalLink>
                      </div>
                    )}
                  </td>
                  <td>{r.primaryKeyword ?? <span className="admin-cell-muted">—</span>}</td>
                  <td className="admin-campaign-log-question">{r.primaryQuestion ? <span title={r.primaryQuestion}>{r.primaryQuestion}</span> : <span className="admin-cell-muted">—</span>}</td>
                  <td>{blogTypeLabel(r.blogType) ?? <span className="admin-cell-muted">—</span>}</td>
                  <td>{imageStyleLabel(r.imageStyle) ?? <span className="admin-cell-muted">—</span>}</td>
                  <td>
                    {r.social.length === 0 ? (
                      <span className="admin-cell-muted">—</span>
                    ) : (
                      <div className="admin-campaign-chip-row">
                        {r.social.map((s) => (
                          <span key={s.channel} className="admin-chip" title={imageStyleLabel(s.imageStyle) ?? undefined}>
                            {CHANNEL_LABEL[s.channel as CalendarChannel] ?? s.channel}: {socialStyleLabel(s.socialStyle) ?? "—"}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
