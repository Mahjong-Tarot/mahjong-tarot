"use server";

import { revalidateSurfaces } from "@/kernel/shell/surface";
import { utmSlug } from "@/entities/campaigns/lib/marketing-campaigns";
import { companyOs, type CompanyOsUpdate } from "@/kernel/data/supabase";
import { requireRevenueAccess } from "@/kernel/identity/revenue-access";
import { recordAudit } from "@/kernel/audit/audit";
import { generateCampaignSeoGeo } from "@/entities/campaigns/lib/ai/campaign-seo";
import { planCampaign } from "@/entities/campaigns/lib/ai/campaign-plan";
import type { MarketingCampaignStatus } from "@/entities/campaigns/lib/marketing-campaigns";

type ActionResult = { ok: true } | { ok: false; error: string };
type CreateResult = { ok: true; id: string } | { ok: false; error: string };

const STATUSES = new Set<MarketingCampaignStatus>(["draft", "active", "paused", "done", "archived"]);
const CHANNELS = new Set(["blog", "email", "linkedin", "facebook", "twitter"]);

function refresh(id?: string) {
  revalidateSurfaces("/revenue/marketing/campaigns");
  if (id) revalidateSurfaces(`/revenue/marketing/campaigns/${id}`);
  // Assets live on the calendar too.
  revalidateSurfaces("/revenue/marketing/calendar");
}

// A short handle derived from the idea when the operator leaves the name blank:
// the first line, trimmed to a title length. Used in lists, breadcrumbs, and the
// hub header where the full idea would not fit.
function deriveName(idea: string): string {
  const firstLine = idea.split("\n")[0].trim();
  return firstLine.length > 80 ? `${firstLine.slice(0, 79).trimEnd()}…` : firstLine;
}

// A slug nobody else holds: the name's, or the name's with -2, -3, … appended.
async function uniqueUtm(base: string): Promise<string | null> {
  if (!base) return null;
  const { data, error } = await companyOs.from("marketing_campaigns").select("utm_campaign").like("utm_campaign", `${base}%`);
  if (error) return null;
  const taken = new Set(((data ?? []) as { utm_campaign: string | null }[]).map((r) => r.utm_campaign));
  if (!taken.has(base)) return base;
  for (let n = 2; n < 100; n++) if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
  return null;
}

export async function createCampaign(input: {
  idea: string;
  name?: string | null;
  brandId?: string | null;
  objective?: string | null;
  pillarId?: string | null;
  startsOn?: string | null;
  endsOn?: string | null;
}): Promise<CreateResult> {
  const admin = await requireRevenueAccess();
  const idea = input.idea.trim();
  if (!idea) return { ok: false, error: "Write the idea first." };
  const name = input.name?.trim() || deriveName(idea);

  const { data, error } = await companyOs.from("marketing_campaigns").insert({
      name,
      idea,
      brand_id: input.brandId || null,
      objective: input.objective?.trim() || null,
      pillar_id: input.pillarId || null,
      starts_on: input.startsOn || null,
      ends_on: input.endsOn || null,
      // The link slug the site forms send back; derived from the name, made
      // unique with a short suffix when the name is already taken.
      utm_campaign: await uniqueUtm(utmSlug(name)),
      created_by: admin.email,
    })
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Campaign was not created." };

  const id = (data as { id: string }).id;
  await recordAudit({
    table: "marketing_campaigns",
    recordId: id,
    operation: "insert",
    actor: admin.email,
    context: { name },
  });
  refresh(id);
  return { ok: true, id };
}

export async function updateCampaign(
  id: string,
  patch: {
    name?: string;
    idea?: string;
    brandId?: string | null;
    objective?: string | null;
    pillarId?: string | null;
    seoGeoMd?: string | null;
    utmCampaign?: string | null;
    startsOn?: string | null;
    endsOn?: string | null;
    status?: string;
  },
): Promise<ActionResult> {
  const admin = await requireRevenueAccess();

  const update: CompanyOsUpdate<"marketing_campaigns"> = {};
  if (patch.idea !== undefined) {
    const t = patch.idea.trim();
    if (!t) return { ok: false, error: "The idea cannot be empty." };
    update.idea = t;
  }
  if (patch.name !== undefined) {
    const t = patch.name.trim();
    if (!t) return { ok: false, error: "Name cannot be empty." };
    update.name = t;
  }
  if (patch.brandId !== undefined) update.brand_id = patch.brandId || null;
  if (patch.objective !== undefined) update.objective = patch.objective?.trim() || null;
  if (patch.pillarId !== undefined) update.pillar_id = patch.pillarId || null;
  if (patch.seoGeoMd !== undefined) update.seo_geo_md = patch.seoGeoMd || null;
  if (patch.utmCampaign !== undefined) {
    const slug = patch.utmCampaign ? utmSlug(patch.utmCampaign) : "";
    if (patch.utmCampaign && !slug) return { ok: false, error: "The UTM slug needs at least one letter or digit." };
    update.utm_campaign = slug || null;
  }
  if (patch.startsOn !== undefined) update.starts_on = patch.startsOn || null;
  if (patch.endsOn !== undefined) update.ends_on = patch.endsOn || null;
  if (patch.status !== undefined) {
    if (!STATUSES.has(patch.status as MarketingCampaignStatus)) {
      return { ok: false, error: "Unknown status." };
    }
    update.status = patch.status;
  }
  if (Object.keys(update).length === 0) return { ok: true };

  const { error } = await companyOs.from("marketing_campaigns").update(update).eq("id", id);
  if (error) return { ok: false, error: error.message };

  await recordAudit({
    table: "marketing_campaigns",
    recordId: id,
    operation: "update",
    actor: admin.email,
    context: { fields: Object.keys(update) },
  });
  refresh(id);
  return { ok: true };
}

// Creates a new asset (calendar entry) under this campaign, inheriting the
// campaign's brand and pillar so the writer and image steps have the voice.
export async function addAssetToCampaign(
  campaignId: string,
  input: { title: string; channel: string; publishDate?: string | null },
): Promise<CreateResult> {
  const admin = await requireRevenueAccess();
  const title = input.title.trim();
  if (!title) return { ok: false, error: "Give the asset a title." };
  if (!CHANNELS.has(input.channel)) return { ok: false, error: "Pick a channel." };

  const { data: campaign, error: campErr } = await companyOs.from("marketing_campaigns").select("id, brand_id, pillar_id")
    .eq("id", campaignId)
    .maybeSingle();
  if (campErr) return { ok: false, error: campErr.message };
  if (!campaign) return { ok: false, error: "Campaign not found." };

  const c = campaign as { id: string; brand_id: string | null; pillar_id: string | null };
  const { data, error } = await companyOs.from("marketing_content").insert({
      title,
      channel: input.channel,
      brand_id: c.brand_id,
      pillar_id: c.pillar_id,
      campaign_id: campaignId,
      publish_date: input.publishDate || null,
      created_by: admin.email,
    })
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Asset was not created." };

  const id = (data as { id: string }).id;
  await recordAudit({
    table: "marketing_content",
    recordId: id,
    operation: "insert",
    actor: admin.email,
    context: { title, channel: input.channel, campaign_id: campaignId },
  });
  refresh(campaignId);
  return { ok: true, id };
}

// Plans the campaign from its idea: the primary question, keyword, blog type,
// hero image style and social styles, checked against the brand's recent
// posts and saved as the Plan section the hub header and the writer read.
export async function planCampaignFromIdea(
  campaignId: string,
): Promise<{ ok: true; seoGeoMd: string } | { ok: false; error: string }> {
  const admin = await requireRevenueAccess();
  const r = await planCampaign(campaignId);
  if (!r.ok) return r;
  await recordAudit({
    table: "marketing_campaigns",
    recordId: campaignId,
    operation: "update",
    actor: admin.email,
    context: { plan_generated: true },
  });
  refresh(campaignId);
  return { ok: true, seoGeoMd: r.seoGeoMd };
}

// Drafts the campaign's Search / FAQ / GEO plan with the brand's SEO lens and
// saves it. Returns the markdown so the editor re-syncs without a reload.
export async function generateSeoGeoPlan(
  campaignId: string,
): Promise<{ ok: true; seoGeoMd: string } | { ok: false; error: string }> {
  const admin = await requireRevenueAccess();
  const r = await generateCampaignSeoGeo(campaignId);
  if (!r.ok) return r;
  await recordAudit({
    table: "marketing_campaigns",
    recordId: campaignId,
    operation: "update",
    actor: admin.email,
    context: { seo_geo_generated: true },
  });
  refresh(campaignId);
  return r;
}
