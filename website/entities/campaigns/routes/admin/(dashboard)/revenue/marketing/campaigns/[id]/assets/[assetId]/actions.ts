"use server";

import { revalidateSurfaces } from "@/kernel/shell/surface";
import { companyOs } from "@/kernel/data/supabase";
import { requireRevenueAccess } from "@/kernel/identity/revenue-access";
import { recordAudit } from "@/kernel/audit/audit";
import { marketingMarkdownToHtml } from "@/entities/campaigns/lib/markdown";
import { generateEntryImage, buildEntryImagePrompt } from "@/entities/campaigns/lib/ai/brand-image";
import { generateEntryCopy, buildEntryCopyPrompt } from "@/entities/campaigns/lib/ai/entry-copy";
import { listAssetImages, setSelectedImage, type AssetImage } from "@/entities/campaigns/lib/marketing-images";
import { BLOG_TYPES } from "@/entities/campaigns/lib/style-catalogues";

type CopyResult = { ok: true; html: string } | { ok: false; error: string };
type ImagesResult = { ok: true; images: AssetImage[] } | { ok: false; error: string };
type PromptResult = { ok: true; prompt: string } | { ok: false; error: string };

function refresh(campaignId: string, assetId: string) {
  revalidateSurfaces(`/revenue/marketing/campaigns/${campaignId}/assets/${assetId}`);
  revalidateSurfaces(`/revenue/marketing/campaigns/${campaignId}`);
  revalidateSurfaces("/revenue/marketing/calendar");
}

// Saves the post copy and returns the freshly rendered HTML so the detail page
// can update its preview without a full reload.
export async function saveAssetCopy(
  campaignId: string,
  assetId: string,
  copyMd: string,
): Promise<CopyResult> {
  const admin = await requireRevenueAccess();
  const { error } = await companyOs.from("marketing_content").update({ copy_md: copyMd || null })
    .eq("id", assetId);
  if (error) return { ok: false, error: error.message };

  await recordAudit({
    table: "marketing_content",
    recordId: assetId,
    operation: "update",
    actor: admin.email,
    context: { fields: ["copy_md"] },
  });
  refresh(campaignId, assetId);
  return { ok: true, html: await marketingMarkdownToHtml(copyMd) };
}

// Saves the blog style picked on the preview so the full-page preview can
// switch presentation without a round trip through the calendar drawer.
export async function saveAssetBlogStyle(
  campaignId: string,
  assetId: string,
  blogStyle: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireRevenueAccess();
  if (blogStyle && !BLOG_TYPES.some((o) => o.value === blogStyle)) {
    return { ok: false, error: "Unknown blog style." };
  }
  const { error } = await companyOs.from("marketing_content").update({ blog_style: blogStyle || null })
    .eq("id", assetId);
  if (error) return { ok: false, error: error.message };

  await recordAudit({
    table: "marketing_content",
    recordId: assetId,
    operation: "update",
    actor: admin.email,
    context: { fields: ["blog_style"] },
  });
  refresh(campaignId, assetId);
  return { ok: true };
}

// The assembled prompts, shown in the regenerate modal so they can be edited
// before running. The exact string returned is what the matching regenerate
// action sends when passed back.
export async function getImagePrompt(assetId: string): Promise<PromptResult> {
  await requireRevenueAccess();
  return buildEntryImagePrompt(assetId);
}

export async function getCopyPrompt(assetId: string): Promise<PromptResult> {
  await requireRevenueAccess();
  return buildEntryCopyPrompt(assetId);
}

// Generates a new image version (kept, not overwritten) and returns the full
// version list so the gallery re-syncs. An edited prompt is sent verbatim.
export async function regenerateAssetImage(
  campaignId: string,
  assetId: string,
  prompt?: string,
): Promise<ImagesResult> {
  const admin = await requireRevenueAccess();
  const r = await generateEntryImage(assetId, { createdBy: admin.email, prompt });
  if (!r.ok) return { ok: false, error: r.error };
  refresh(campaignId, assetId);
  return { ok: true, images: await listAssetImages(assetId) };
}

// Regenerates the copy in the brand's voice and returns the rendered HTML plus
// the new markdown so the editor and preview both re-sync. An edited prompt is
// sent verbatim.
export async function regenerateAssetCopy(
  campaignId: string,
  assetId: string,
  prompt?: string,
): Promise<{ ok: true; html: string; bodyMd: string } | { ok: false; error: string }> {
  await requireRevenueAccess();
  const r = await generateEntryCopy(assetId, { prompt });
  if (!r.ok) return { ok: false, error: r.error };
  refresh(campaignId, assetId);
  return { ok: true, html: await marketingMarkdownToHtml(r.bodyMd), bodyMd: r.bodyMd };
}

// Marks an earlier version as the selected one (revert), returns the fresh list.
export async function selectAssetImage(
  campaignId: string,
  assetId: string,
  imageId: string,
): Promise<ImagesResult> {
  await requireRevenueAccess();
  const r = await setSelectedImage(assetId, imageId);
  if (!r.ok) return { ok: false, error: r.error };
  refresh(campaignId, assetId);
  return { ok: true, images: await listAssetImages(assetId) };
}
