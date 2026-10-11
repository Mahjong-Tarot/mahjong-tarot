import { aiSite } from "@/kernel/ai/gateway";
import { fillPrompt } from "@/kernel/ai/prompts";
import { BRAND_WRITER_PROMPT, type ENTRY_COPY_PROMPT } from "./brand-writer.prompt";
import type { AiDataClass } from "@/kernel/ai/routing";
import { getBrandProfile, type BrandProfile } from "@/entities/campaigns/lib/brand-profiles";
import { jsonSchemaFor, readStructuredOutput } from "@/kernel/ai/response";
import { z } from "zod/v4";

// The AI writer. Given a brand and a source (a blog post or a brief), it drafts
// content by following the brand's own content_rules_md. Nothing about the
// output is hardwired here: which deliverables to produce, the lens, and the
// per-channel rules all come from the brand profile the admin edits. Same shape
// as lib/ai/idea-plan.ts: never throws, no-ops without a key.
//
// Runs on the frontier tier (Fable 5.1): the drafts are the product, and one
// run is one operator click. On Fable, max_tokens caps thinking plus the reply,
// so the ceiling is well above the copy itself (a 2,500-word blog plus three
// channel posts, SEO and image briefs is roughly 8k tokens of output), and the
// request gets its own timeout because the shared 120s client default was
// sized for Sonnet.

export const BRAND_WRITER_CLASS: AiDataClass = "A";
const AI = aiSite({ site: "brand-writer", dataClass: BRAND_WRITER_CLASS, tier: "frontier" });
const MODEL = AI.model;
const MAX_TOKENS = 32_000;
const TIMEOUT_MS = 600_000;

export type WriterOutput = {
  channel: "email" | "linkedin" | "facebook" | "twitter" | "blog";
  title?: string;
  subject?: string; // email only
  preheader?: string; // email only
  bodyMd: string;
  blogStyle?: string; // blog only, a slug from the brand's preferred blog types
  socialStyle?: string; // linkedin/facebook only
  imageStyle?: string; // a slug from the brand's preferred image styles
  seoMd?: string; // blog only, the Patel SEO package
  imageBriefMd?: string; // the design brief
};

export type WriterResult =
  | { ok: true; outputs: WriterOutput[] }
  | { ok: false; error: string };

export const brandWriterOutput = z.object({
  outputs: z.array(z.object({
    channel: z.enum(["email", "linkedin", "facebook", "twitter", "blog"]),
    title: z.string().describe("Short internal label for this deliverable.").optional(),
    subject: z.string().describe("Email subject line. Email channel only.").optional(),
    preheader: z.string().describe("Email preheader. Email channel only.").optional(),
    body_md: z.string().describe("The copy in Markdown (headings, bold, lists, links). For email, exclude the unsubscribe footer; it is added automatically."),
    blog_style: z.string().describe("Blog only: a slug from the brand's preferred blog types.").optional(),
    social_style: z.string().describe("LinkedIn/Facebook/Twitter only: a slug from the brand's preferred social styles.").optional(),
    image_style: z.string().describe("A slug from the brand's preferred image styles that fits this piece.").optional(),
    seo_md: z.string().describe("Blog only: the SEO package (title tag, meta description, slug, primary and secondary keywords, five link ideas) run through the SEO lens.").optional(),
    image_brief_md: z.string().describe("A short image brief: hero concept, palette, and ratios, following the brand's image style. Where the style carries words (a typographic splash, a data diagram, a concept card), give the exact headline or figure and label to set, a handful of words, spelled out in quotes.").optional(),
  })).describe("One entry per deliverable the brand's content rules call for. Produce exactly the channels the rules specify, no more."),
});

const OUTPUT_SCHEMA = jsonSchemaFor(brandWriterOutput);

// The brand-voice system text, filled from the profile. Shared with
// entry-copy, which passes its own prompt: both prompts declare the same text
// (./brand-writer.prompt.ts), and each site sends the one named after it.
export function systemPrompt(
  profile: BrandProfile,
  prompt: typeof BRAND_WRITER_PROMPT | typeof ENTRY_COPY_PROMPT = BRAND_WRITER_PROMPT,
): string {
  const s = (v: string | null) => v ?? prompt.parts.notSet;
  return fillPrompt(prompt.system, {
    brandName: profile.brandName,
    positioning: s(profile.positioning),
    audience: s(profile.audience),
    offer: s(profile.offer),
    primaryCta: s(profile.primaryCta),
    author: s(profile.authorMd),
    voice: s(profile.voiceMd),
    rules: s(profile.rulesMd),
    channels: s(profile.channelsMd),
    process: s(profile.processMd),
    blogStyles: s(profile.blogStylesMd),
    editingLens: s(profile.editingLensMd),
    seoLens: s(profile.seoLensMd),
    imageStyle: s(profile.imageStyleMd),
    blogTypes: profile.preferredBlogTypes.join(", ") || prompt.parts.noneSet,
    imageStyles: profile.preferredImageStyles.join(", ") || prompt.parts.noneSet,
    socialStyles: profile.preferredSocialStyles.join(", ") || prompt.parts.noneSet,
  });
}

export async function writeForBrand(input: {
  brandId: string;
  sourceText: string;
  sourceUrl?: string | null;
  brief?: string | null;
  // The brand's recent posts as ledgerLines() renders them, so the writer
  // chooses a shape and a keyword against what the last posts used.
  history?: string | null;
  // The campaign plan (planMdFrom), decided before drafting: the styles and
  // the primary question the drafts follow rather than choose again.
  plan?: string | null;
}): Promise<WriterResult> {
  try {
    const llm = AI.clientIfConfigured();
    if (!llm) {
      return { ok: false, error: "ANTHROPIC_API_KEY is not configured." };
    }

    const profile = await getBrandProfile(input.brandId);
    if (!profile) return { ok: false, error: "Brand not found." };
    if (!profile.channelsMd && !profile.voiceMd) {
      return { ok: false, error: "This brand has no writing profile yet. Fill it in under Marketing > Brands." };
    }

    const P = BRAND_WRITER_PROMPT;
    const userMsg = fillPrompt(P.user, {
      sourceUrlLine: input.sourceUrl ? fillPrompt(P.parts.sourceUrlLine, { url: input.sourceUrl }) : "",
      briefLine: input.brief ? fillPrompt(P.parts.briefLine, { brief: input.brief }) : "",
      sourceText: input.sourceText || P.parts.noSourceText,
      planSection: input.plan ? fillPrompt(P.parts.planSection, { plan: input.plan }) : "",
      historySection: input.history ? fillPrompt(P.parts.historySection, { history: input.history }) : "",
    });

    const response = await llm.messages.create(
      {
        prompt: BRAND_WRITER_PROMPT,
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt(profile),
        output_config: { effort: "high", format: { type: "json_schema", schema: OUTPUT_SCHEMA } },
        messages: [{ role: "user", content: userMsg }],
      },
      { timeout: TIMEOUT_MS },
    );

    const out = readStructuredOutput(
      "brand-writer",
      MODEL,
      response,
      brandWriterOutput,
      "The model declined to draft this content.",
    );
    if (!out.ok) return { ok: false, error: out.error };

    const parsed = out.data;
    const outputs: WriterOutput[] = (parsed.outputs ?? [])
      .filter((o) => o.body_md && o.channel)
      .map((o) => ({
        channel: o.channel as WriterOutput["channel"],
        title: o.title,
        subject: o.subject,
        preheader: o.preheader,
        bodyMd: o.body_md,
        blogStyle: o.blog_style,
        socialStyle: o.social_style,
        imageStyle: o.image_style,
        seoMd: o.seo_md,
        imageBriefMd: o.image_brief_md,
      }));

    if (outputs.length === 0) return { ok: false, error: "The writer produced nothing usable." };
    return { ok: true, outputs };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[brand-writer] failed:", msg);
    return { ok: false, error: msg };
  }
}

// Fetches a public URL and reduces it to plain text for use as source material.
// Best-effort: returns empty string on any failure so the caller can fall back
// to a brief.
//
// The URL is admin-supplied but fetched server-side, so it is SSRF-hardened:
// https only, every hop's host must resolve to public addresses (no loopback,
// private, link-local or metadata ranges), redirects are followed by hand (and
// re-checked) at most 3 times, 10 s timeout, 2 MB body cap. A DNS answer that
// changes between the check and the fetch (rebinding) is not covered.
const SOURCE_FETCH_TIMEOUT_MS = 10_000;
const SOURCE_FETCH_MAX_BYTES = 2 * 1024 * 1024;
const SOURCE_FETCH_MAX_REDIRECTS = 3;

function isPrivateIPv4(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19))
  );
}

function isPrivateAddress(ip: string, family: number): boolean {
  if (family === 4) return isPrivateIPv4(ip);
  const v6 = ip.toLowerCase();
  const mapped = v6.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  if (v6.startsWith("::ffff:")) return true; // hex-form v4-mapped: refuse
  return (
    v6 === "::" || v6 === "::1" ||
    v6.startsWith("fc") || v6.startsWith("fd") || // fc00::/7 unique local
    /^fe[89ab]/.test(v6) || // fe80::/10 link-local
    v6.startsWith("ff") || // multicast
    v6.startsWith("64:ff9b:") // NAT64 can reach v4 internals
  );
}

async function assertPublicHttpsUrl(raw: string): Promise<URL> {
  const url = new URL(raw);
  if (url.protocol !== "https:") throw new Error("only https URLs are fetched");
  if (url.username || url.password) throw new Error("credentials in URL");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const { lookup } = await import("node:dns/promises");
  const addrs = await lookup(host, { all: true, verbatim: true });
  if (addrs.length === 0 || addrs.some((a) => isPrivateAddress(a.address, a.family))) {
    throw new Error("host resolves to a non-public address");
  }
  return url;
}

async function readCapped(res: Response, maxBytes: number): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      break;
    }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

export async function fetchSourceText(url: string, maxChars = 6000): Promise<string> {
  try {
    const signal = AbortSignal.timeout(SOURCE_FETCH_TIMEOUT_MS);
    let target = await assertPublicHttpsUrl(url);
    let res: Response | null = null;
    for (let hop = 0; hop <= SOURCE_FETCH_MAX_REDIRECTS; hop++) {
      res = await fetch(target, {
        headers: { "user-agent": "MahjongTarot-Writer/1.0" },
        redirect: "manual",
        signal,
      });
      const location = res.status >= 300 && res.status < 400 ? res.headers.get("location") : null;
      if (!location) break;
      target = await assertPublicHttpsUrl(new URL(location, target).toString());
      res = null;
    }
    if (!res || !res.ok) return "";
    const html = await readCapped(res, SOURCE_FETCH_MAX_BYTES);
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return text.slice(0, maxChars);
  } catch {
    return "";
  }
}
