import { SurfaceLink as Link } from "@/kernel/shell/SurfaceLink";
import type { Metadata } from "next";
import { PageHead } from "@/kernel/ui/PageHead";
import { requireRevenueAccess } from "@/kernel/identity/revenue-access";
import { selectCompanies } from "@/kernel/identity/reads";
import { selectTags } from "@/entities/contacts";
import { formatDate } from "@/kernel/ui/format";
import { RELATIONSHIP_LABEL, listAudiences, type AudienceRules } from "@/entities/campaigns/lib/audiences";
import { NewAudienceButton } from "./NewAudienceButton";

export const metadata: Metadata = {
  title: "Audiences",
  description: "Saved email audiences, resolved from relationships, companies and tags.",
};

function describeRules(rules: AudienceRules, companyNames: Map<string, string>, tagNames: Map<string, string>): string {
  const parts: string[] = [];
  if (rules.relationships.length) parts.push(rules.relationships.map((r) => RELATIONSHIP_LABEL[r]).join(" or "));
  if (rules.companyIds.length) parts.push(`at ${rules.companyIds.map((id) => companyNames.get(id) ?? "a removed company").join(" or ")}`);
  if (rules.tagIds.length) parts.push(`tagged ${rules.tagIds.map((id) => tagNames.get(id) ?? "a removed tag").join(" or ")}`);
  if (rules.excludeTagIds.length) parts.push(`not tagged ${rules.excludeTagIds.map((id) => tagNames.get(id) ?? "a removed tag").join(" or ")}`);
  return parts.length ? parts.join(", ") : "Every subscribed contact";
}

export default async function AudiencesPage() {
  await requireRevenueAccess();
  const [{ rows, error }, companies, tags] = await Promise.all([
    listAudiences(),
    selectCompanies("id, name"),
    selectTags("id, label"),
  ]);
  if (companies.error) console.error("[campaigns/audiences] companies", companies.error);
  if (tags.error) console.error("[campaigns/audiences] tags", tags.error);
  const companyNames = new Map(((companies.data ?? []) as { id: string; name: string }[]).map((c) => [c.id, c.name]));
  const tagNames = new Map(((tags.data ?? []) as { id: string; label: string }[]).map((t) => [t.id, t.label]));

  return (
    <div>
      <PageHead
        eyebrow={<>Revenue · <Link href="/admin/revenue/marketing">Marketing</Link></>}
        title="Audiences"
        sub="Who a broadcast or series reaches, worked out from the CRM each time a list is built."
        action={<NewAudienceButton />}
      />
      {error && <div className="admin-alert admin-alert--err u-mb-4">{error}</div>}
      <div className="admin-table-wrap">
        {rows.length === 0 ? (
          <div className="admin-empty">No saved audiences yet.</div>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Rules</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="admin-cell-strong">
                      <Link href={`/admin/revenue/marketing/audiences/${row.id}`}>{row.name}</Link>
                    </td>
                    <td className="admin-cell-muted">{describeRules(row.rules, companyNames, tagNames)}</td>
                    <td className="admin-cell-mono">{formatDate(row.createdAt)}</td>
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
