import Anthropic from "@anthropic-ai/sdk";
import type { MessageStream } from "@anthropic-ai/sdk/lib/MessageStream";
import { anthropic, anthropicIfConfigured, openRouter, openRouterIfConfigured } from "@/kernel/ai/client";
import { inputHashOf, recordAiCall, type AiCallErrorKind, type AiCallProvider } from "@/kernel/ai/calls";
import { modelFor, type Tier } from "@/kernel/ai/models";
import {
  checkOtherProvider,
  dataClassOf,
  isClaudeModel,
  routeFor,
  type AiDataClass,
  type AiRoute,
} from "@/kernel/ai/routing";
import type { AiUsage } from "@/kernel/audit/routine-runs";
import { log } from "@/kernel/config/log";

/**
 * The model gateway, first slice (plan Part C0 step 1): every model call goes
 * through here, names its site and its data class, and leaves one ai_calls row.
 *
 * A call site declares itself once, at module scope:
 *
 *   export const MEETING_SUMMARY_CLASS: AiDataClass = "C";
 *   const AI = aiSite({ site: "meeting-summary", dataClass: MEETING_SUMMARY_CLASS, tier: "fast" });
 *
 * and then uses `AI.model` and `AI.clientIfConfigured()` exactly where it used
 * `modelFor(...)` and `anthropicIfConfigured()`: the client keeps the SDK's
 * `messages.create` / `messages.stream` shape (plan Part C2, "no call site is
 * rewritten"), so the request a site builds is the request that is sent.
 *
 * What the gateway adds to each request, and nothing else:
 *
 *  - The class check, on the model the request actually carries, every time
 *    `create` or `stream` is called. A retry or a fallback that picks another
 *    model is judged again. A refused route throws AiRouteRefused before any
 *    network call and writes no row, because no call was made.
 *  - The client: api.anthropic.com for every Claude model, OpenRouter (same
 *    SDK, another base URL) for anything else the class allows, with the
 *    class's provider preferences in OpenRouter's `provider` field.
 *  - One ai_calls row per call through kernel/ai/calls.ts: tokens, latency
 *    measured here, the prompt version, a hash of the messages, and whether
 *    the output was usable. Never a body; the gateway logs none either.
 *
 * `model` is resolved through `modelFor` when the site is declared, exactly as
 * the call sites did before, so no site's model changes with this module and
 * nothing reaches OpenRouter until a site's model is moved on purpose.
 */

type SdkMessages = Anthropic["messages"];
type RequestOptions = Parameters<SdkMessages["create"]>[1];
type AiMessageStream = MessageStream;

/** The part of the SDK client a call site uses, with the gateway inside it. */
export interface AiClient {
  messages: {
    create(body: Anthropic.MessageCreateParamsNonStreaming, options?: RequestOptions): Promise<Anthropic.Message>;
    stream(body: Anthropic.MessageStreamParams, options?: RequestOptions): AiMessageStream;
  };
}

export type AiSiteDeclaration = {
  /** The name logAiUsage logs and ai_calls records. */
  site: string;
  /**
   * The site's data class, a typed constant beside the call site. Missing or
   * unknown is S. scripts/check-ai-routing.mjs fails a declaration without one.
   */
  dataClass: AiDataClass | undefined;
  tier: Tier;
  /**
   * The name modelFor resolves the model (and its env override) under, when it
   * differs from `site`. The writer's steps are one model, `brand-writer`,
   * under a site name per step.
   */
  modelSite?: string;
  /** Bump when the site's prompt changes. Defaults to "1". */
  promptVersion?: string;
};

export type AiSite = {
  readonly site: string;
  readonly dataClass: AiDataClass;
  readonly model: string;
  readonly promptVersion: string;
  /** The gateway client. Throws (from the SDK) when the provider's key is unset. */
  client(): AiClient;
  /** The gateway client, or null when the provider's key is unset. */
  clientIfConfigured(): AiClient | null;
};

export function aiSite(decl: AiSiteDeclaration): AiSite {
  const dataClass = dataClassOf(decl.dataClass);
  const model = modelFor(decl.modelSite ?? decl.site, decl.tier);
  const promptVersion = decl.promptVersion ?? "1";
  const ctx: CallContext = { site: decl.site, dataClass, promptVersion };
  // The provider the resolved model would take. The route is still checked on
  // every call; this only decides which key "configured" means.
  const provider: AiRoute["provider"] = isClaudeModel(model) ? "anthropic" : "openrouter";
  return {
    site: decl.site,
    dataClass,
    model,
    promptVersion,
    client: () => gatewayClient(ctx, provider, provider === "anthropic" ? anthropic() : openRouter()),
    clientIfConfigured: () => {
      const base = provider === "anthropic" ? anthropicIfConfigured() : openRouterIfConfigured();
      return base ? gatewayClient(ctx, provider, base) : null;
    },
  };
}

type CallContext = { site: string; dataClass: AiDataClass; promptVersion: string };

function gatewayClient(ctx: CallContext, baseProvider: AiRoute["provider"], base: Anthropic): AiClient {
  const clientFor = (provider: AiRoute["provider"]): Anthropic =>
    provider === baseProvider ? base : provider === "anthropic" ? anthropic() : openRouter();

  return {
    messages: {
      async create(body, options) {
        const route = checkRoute(ctx, body.model);
        const target = clientFor(route.provider);
        const sent = withProviderPrefs(body, route);
        const started = Date.now();
        let response: Anthropic.Message;
        try {
          response = await (options === undefined ? target.messages.create(sent) : target.messages.create(sent, options));
        } catch (e) {
          await recordAiCall(failedCall(ctx, route, body, started, e));
          throw e;
        }
        await recordAiCall(finishedCall(ctx, route, body, started, response));
        return response;
      },

      stream(body, options) {
        const route = checkRoute(ctx, body.model);
        const target = clientFor(route.provider);
        const sent = withProviderPrefs(body, route);
        const started = Date.now();
        const stream = options === undefined ? target.messages.stream(sent) : target.messages.stream(sent, options);
        // The caller consumes the stream; the gateway only listens. Calling
        // finalMessage() here would race the caller for the same result.
        let recorded = false;
        stream.on("finalMessage", (message: Anthropic.Message) => {
          if (recorded) return;
          recorded = true;
          void recordAiCall(finishedCall(ctx, route, body, started, message));
        });
        stream.on("error", (e: unknown) => {
          if (recorded) return;
          recorded = true;
          void recordAiCall(failedCall(ctx, route, body, started, e));
        });
        return stream;
      },
    },
  };
}

function checkRoute(ctx: CallContext, model: string): AiRoute {
  try {
    return routeFor(ctx.site, ctx.dataClass, model);
  } catch (e) {
    // Greppable as `ai-route-refused`: a refusal is a configuration that would
    // have sent class-S data somewhere it must not go.
    log("error", "ai-route-refused", { site: ctx.site, class: ctx.dataClass, model });
    throw e;
  }
}

/** OpenRouter reads its routing preferences from the request body's `provider` field. */
function withProviderPrefs<B extends object>(body: B, route: AiRoute): B {
  return route.providerPrefs ? ({ ...body, provider: route.providerPrefs } as B) : body;
}

type UsageWithCost = Anthropic.Usage & { cost?: number | null };

function finishedCall(ctx: CallContext, route: AiRoute, body: { model: string; messages: unknown }, started: number, response: Anthropic.Message) {
  const usage = (response.usage ?? null) as UsageWithCost | null;
  const errorKind: AiCallErrorKind | null =
    response.stop_reason === "refusal" ? "refusal" : response.stop_reason === "max_tokens" ? "max_tokens" : null;
  return {
    ...ctx,
    provider: route.provider as AiCallProvider,
    model: body.model,
    usage,
    costUsd: typeof usage?.cost === "number" ? usage.cost : null,
    latencyMs: Date.now() - started,
    inputHash: inputHashOf(body.messages),
    ok: errorKind === null,
    errorKind,
  };
}

function failedCall(ctx: CallContext, route: AiRoute, body: { model: string; messages: unknown }, started: number, error: unknown) {
  return {
    ...ctx,
    provider: route.provider as AiCallProvider,
    model: body.model,
    usage: null,
    costUsd: null,
    latencyMs: Date.now() - started,
    inputHash: inputHashOf(body.messages),
    ok: false,
    errorKind: errorKindOf(error),
  };
}

export type OtherProviderOutcome<T> = {
  value: T;
  usage: AiUsage | null;
  ok: boolean;
  errorKind?: AiCallErrorKind | null;
};

/**
 * A call to a provider's own HTTP API that the SDK does not speak (today only
 * Gemini, for marketing images). The class is checked first
 * (`checkOtherProvider`: B and A only), the latency is measured here, and the
 * call gets its ai_calls row like any other. `input` is hashed, never stored.
 * A throw from `run` is recorded as a failed call and rethrown.
 */
export async function otherProviderCall<T>(
  decl: {
    site: string;
    dataClass: AiDataClass | undefined;
    provider: Exclude<AiCallProvider, "anthropic" | "openrouter">;
    model: string;
    promptVersion?: string;
    input: unknown;
  },
  run: () => Promise<OtherProviderOutcome<T>>,
): Promise<T> {
  let dataClass: AiDataClass;
  try {
    dataClass = checkOtherProvider(decl.site, decl.dataClass, decl.provider);
  } catch (e) {
    log("error", "ai-route-refused", { site: decl.site, class: dataClassOf(decl.dataClass), model: decl.model });
    throw e;
  }
  const base = {
    site: decl.site,
    dataClass,
    provider: decl.provider,
    model: decl.model,
    promptVersion: decl.promptVersion ?? "1",
    inputHash: inputHashOf(decl.input),
    costUsd: null,
  };
  const started = Date.now();
  let outcome: OtherProviderOutcome<T>;
  try {
    outcome = await run();
  } catch (e) {
    await recordAiCall({ ...base, usage: null, latencyMs: Date.now() - started, ok: false, errorKind: "unknown" });
    throw e;
  }
  await recordAiCall({
    ...base,
    usage: outcome.usage,
    latencyMs: Date.now() - started,
    ok: outcome.ok,
    errorKind: outcome.ok ? null : (outcome.errorKind ?? "unknown"),
  });
  return outcome.value;
}

/** The error kind for a non-2xx HTTP status from a provider's own API. */
export function httpErrorKind(status: number): AiCallErrorKind {
  if (status === 429) return "rate_limit";
  if (status === 408 || status === 504) return "timeout";
  return "api_error";
}

/** The SDK's error classes, most specific first; anything else is unknown. */
export function errorKindOf(error: unknown): AiCallErrorKind {
  if (error instanceof Anthropic.APIConnectionTimeoutError) return "timeout";
  if (error instanceof Anthropic.APIConnectionError) return "connection";
  if (error instanceof Anthropic.RateLimitError) return "rate_limit";
  if (error instanceof Anthropic.APIError) return "api_error";
  return "unknown";
}
