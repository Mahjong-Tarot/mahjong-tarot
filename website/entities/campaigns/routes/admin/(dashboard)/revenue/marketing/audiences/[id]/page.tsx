import { SurfaceLink as Link } from "@/kernel/shell/SurfaceLink";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHead } from "@/kernel/ui/PageHead";
import { requireRevenueAccess } from "@/kernel/identity/revenue-access";
import { selectCompanies } from "@/kernel/identity/reads";
import { selectTags } from "@/entities/contacts";
import { getAudience } from "@/entities/campaigns/lib/audiences";
import { AudienceEditor } from "./AudienceEditor";

export const metadata: Metadata = {
  title: "Audience",
  description: "Edit a saved email audience and preview who it reaches.",
};

export default async function AudiencePage({ params }: { params: { id: string } }) {
  await requireRevenueAccess();
  const [audience, companies, tags] = await Promise.all([
    getAudience(params.id),
    selectCompanies("id, name").is("archived_at", null).order("name"),
    selectTags("id, label").order("label"),
  ]);
  if (!audience) notFound();
  if (companies.error) console.error("[campaigns/audiences] companies", companies.error);
  if (tags.error) console.error("[campaigns/audiences] tags", tags.error);

  return (
    <div>
      <PageHead
        eyebrow={<Link href="/admin/revenue/marketing/audiences">← Audiences</Link>}
        title={audience.name}
        sub="Every rule you fill in must match; within a rule, any choice matches. Consent and do-not-contact always apply."
      />
      <AudienceEditor
        audience={audience}
        companies={((companies.data ?? []) as { id: string; name: string }[]).map((c) => ({ value: c.id, label: c.name }))}
        tags={((tags.data ?? []) as { id: string; label: string }[]).map((t) => ({ value: t.id, label: t.label }))}
      />
    </div>
  );
}
