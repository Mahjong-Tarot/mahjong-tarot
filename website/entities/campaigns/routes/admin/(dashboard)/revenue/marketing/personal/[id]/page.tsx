import { SurfaceLink as Link } from "@/kernel/shell/SurfaceLink";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHead } from "@/kernel/ui/PageHead";
import { requireRevenueAccess } from "@/kernel/identity/revenue-access";
import { getAudience, listAudiences, resolveAudienceIds } from "@/entities/campaigns/lib/audiences";
import { listBrands } from "@/entities/campaigns/lib/marketing-calendar";
import { getAgent, listMessages, listSkills, loadRecipients } from "@/entities/campaigns/lib/personal/data";
import { AgentEditor } from "./AgentEditor";
import { SkillPanel } from "./SkillPanel";
import { DryRunPanel } from "./DryRunPanel";
import { MessageQueue } from "./MessageQueue";

export const metadata: Metadata = {
  title: "Personal email agent",
  description: "An agent's context, skill, rhythm, dry run and queue.",
};

// The first hundred people of the audience, for the dry-run picker. Enough to
// tune a skill on; the run itself resolves the whole audience.
async function audienceSample(audienceId: string): Promise<{ id: string; label: string }[]> {
  const audience = await getAudience(audienceId);
  if (!audience) return [];
  const { ids } = await resolveAudienceIds(audience.rules);
  const { rows } = await loadRecipients(ids.slice(0, 100));
  return rows
    .map((p) => ({ id: p.id, label: `${p.name} <${p.email}>` }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export default async function PersonalAgentPage({ params }: { params: { id: string } }) {
  await requireRevenueAccess();
  const agent = await getAgent(params.id);
  if (!agent) notFound();
  const [audiences, brands, skills, messages, people] = await Promise.all([
    listAudiences(),
    listBrands(),
    listSkills(agent.id),
    listMessages(agent.id),
    audienceSample(agent.audienceId),
  ]);

  return (
    <div>
      <PageHead
        eyebrow={<><Link href="/admin/revenue/marketing/recurring">← Recurring</Link> · Personal agent</>}
        title={agent.name}
        sub={agent.active ? "Active: the hourly run writes to whoever is due." : "Paused: tune the skill on a dry run, then switch it on."}
      />
      <AgentEditor agent={agent} audiences={audiences.rows.map((a) => ({ id: a.id, name: a.name }))} brands={brands} />
      <SkillPanel agentId={agent.id} skills={skills} />
      <DryRunPanel agentId={agent.id} people={people} />
      <MessageQueue agentId={agent.id} messages={messages.rows} error={messages.error ?? null} />
    </div>
  );
}
