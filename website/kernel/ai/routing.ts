/**
 * Where a model call may go, decided by the data class the call site declares.
 *
 * The rule (plan Part C1): sensitive work stays on the official Anthropic API,
 * and everything else may run on whatever passes its eval. The class lives in
 * code beside each call site, never in a table or an env var, so a
 * configuration change can move a model but can never move a sensitive call.
 *
 *   S  sensitive: ATS, people, the read-everything chat agents, money.
 *      api.anthropic.com only.
 *   C  confidential: internal business content. Claude goes direct; any other
 *      model only through OpenRouter with zero data retention and data
 *      collection denied.
 *   B  internal output (digests, ideas, sprint drafts).
 *   A  public output (published copy, images).
 *      B and A route the same way; the split records who can see the output.
 *
 * Fail closed, in three ways: an undeclared or unknown class is S; Claude,
 * whatever the class, always goes to api.anthropic.com, because through
 * OpenRouter a Claude request can be load-balanced onto Bedrock or Vertex and
 * lose structured output; and the check runs on every attempt (the gateway
 * calls routeFor per request, retries included), not once per process.
 *
 * No path-alias imports and no SDK imports here: scripts/check-ai-routing.mjs
 * imports this file under plain node, so the build check and the runtime
 * check are one function.
 */

export const AI_DATA_CLASSES = ["S", "C", "B", "A"] as const;

export type AiDataClass = (typeof AI_DATA_CLASSES)[number];

export type AiRoute = {
  provider: "anthropic" | "openrouter";
  /** OpenRouter's `provider` request field; null on the Anthropic API. */
  providerPrefs: Record<string, unknown> | null;
};

/** Thrown before any network call when a route would break its class. */
export class AiRouteRefused extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiRouteRefused";
  }
}

/** The declared class, or S for anything missing or unrecognised. */
export function dataClassOf(value: unknown): AiDataClass {
  return typeof value === "string" && (AI_DATA_CLASSES as readonly string[]).includes(value)
    ? (value as AiDataClass)
    : "S";
}

/**
 * A Claude model in the Anthropic API's own spelling. OpenRouter's slug
 * (`anthropic/claude-haiku-4.5`) is deliberately not one: it names the
 * OpenRouter route, which Claude never takes.
 */
export function isClaudeModel(model: string): boolean {
  return /^claude-/.test(model.trim());
}

/**
 * The route for one call, or AiRouteRefused. `dataClass` is `unknown` on
 * purpose: whatever reaches the gateway is judged here, so a missing constant
 * cannot widen what a call may do.
 */
export function routeFor(site: string, dataClass: unknown, model: string): AiRoute {
  const cls = dataClassOf(dataClass);
  const id = model.trim();
  if (!id) throw new AiRouteRefused(`AI route refused for ${site} (class ${cls}): no model is configured.`);
  if (isClaudeModel(id)) return { provider: "anthropic", providerPrefs: null };
  if (/claude/i.test(id)) {
    throw new AiRouteRefused(
      `AI route refused for ${site} (class ${cls}): ${id} is a Claude model spelled for another host; ` +
        `Claude goes to api.anthropic.com only, spelled claude-….`,
    );
  }
  if (cls === "S") {
    throw new AiRouteRefused(
      `AI route refused for ${site} (class S): ${id} is not a Claude model, and class S runs on the official Anthropic API only.`,
    );
  }
  if (cls === "C") {
    return { provider: "openrouter", providerPrefs: { zdr: true, data_collection: "deny", require_parameters: true } };
  }
  return { provider: "openrouter", providerPrefs: { require_parameters: true } };
}

/**
 * A call to a provider's own API that is neither Anthropic nor OpenRouter
 * (today only Gemini, for marketing images). No zero-retention promise covers
 * it, so it carries public or internal output only: classes B and A. Anything
 * else throws AiRouteRefused.
 */
export function checkOtherProvider(site: string, dataClass: unknown, provider: string): AiDataClass {
  const cls = dataClassOf(dataClass);
  if (cls === "B" || cls === "A") return cls;
  throw new AiRouteRefused(
    `AI route refused for ${site} (class ${cls}): ${provider} has no zero-retention route, so it carries classes B and A only.`,
  );
}
