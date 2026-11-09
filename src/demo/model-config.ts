import { createOpenAI } from "@ai-sdk/openai";
import type { ProviderPlugin } from "workers-ai-provider";

export type DemoModelConfig = {
  model: string;
  role: "primary" | "fallback";
  /** Used unless the server supplies a valid effort override. */
  reasoningEffort?: DemoReasoningEffort;
};

export type DemoReasoningEffort = "none" | "minimal" | "low" | "medium" | "high" | "xhigh";
export type DemoOpenAiApiMode = "chat" | "responses";

export const DEMO_PRIMARY_MODEL = "openai/gpt-5.6-terra";
export const DEMO_FALLBACK_MODEL = "anthropic/claude-haiku-5.5";
export const DEMO_GROK_CONTROL_MODEL = "xai/grok-4.6";
export const DEMO_KIMI_CONTROL_MODEL = "@cf/moonshotai/kimi-k2.7-code";
export const DEMO_MODELS: readonly DemoModelConfig[] = [
  { model: DEMO_PRIMARY_MODEL, role: "primary" },
  { model: DEMO_FALLBACK_MODEL, role: "fallback" }
] as const;
export const DEMO_MODEL_OVERRIDE_VAR = "DEMO_MODEL_OVERRIDE";
export const DEMO_REASONING_EFFORT_OVERRIDE_VAR = "DEMO_REASONING_EFFORT_OVERRIDE";
export const DEMO_OPENAI_API_MODE_VAR = "DEMO_OPENAI_API_MODE";
export const DEMO_MODEL = DEMO_PRIMARY_MODEL;
export const DEMO_OPENAI_API_MODE: DemoOpenAiApiMode = "responses";
// `none` keeps the demo fast and makes fallback more reliable. Non-OpenAI
// Workers AI catalog models receive the mapped setting below.
export const DEMO_REASONING_EFFORT: DemoReasoningEffort = "none";
export const DEMO_TEMPERATURE = 0.1;
export const DEMO_GATEWAY_ID_FALLBACK = "stellar-raven-demo";

export const openAiResponses: ProviderPlugin = {
  wireFormat: "openai",
  create: ({ modelId, fetch, baseURL }) =>
    createOpenAI({ apiKey: "unused", fetch, ...(baseURL ? { baseURL } : {}) }).responses(modelId)
};

export function demoModelsFromOverride(override: string | undefined): readonly DemoModelConfig[] {
  const models = (override ?? "")
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean)
    .slice(0, 4);
  if (models.length === 0) return DEMO_MODELS;
  return models.map((model, index) => ({ model, role: index === 0 ? "primary" : "fallback" }));
}

export function demoReasoningEffortFromOverride(override: string | undefined): DemoReasoningEffort {
  return demoReasoningEffortOverride(override) ?? DEMO_REASONING_EFFORT;
}

export function demoReasoningEffortFor(
  config: Pick<DemoModelConfig, "reasoningEffort">,
  override: DemoReasoningEffort | undefined
): DemoReasoningEffort {
  return override ?? config.reasoningEffort ?? DEMO_REASONING_EFFORT;
}

export function demoReasoningEffortOverride(override: string | undefined): DemoReasoningEffort | undefined {
  const value = override?.trim();
  if (
    value === "none" ||
    value === "minimal" ||
    value === "low" ||
    value === "medium" ||
    value === "high" ||
    value === "xhigh"
  ) {
    return value;
  }
  return undefined;
}

export function demoOpenAiApiModeFromOverride(override: string | undefined): DemoOpenAiApiMode {
  const value = override?.trim();
  if (value === "chat" || value === "responses") return value;
  return DEMO_OPENAI_API_MODE;
}

/**
 * Only attempts sharing the OpenAI wire plugin constrain its mode. Anthropic,
 * Google and catalog-run attempts use separate paths. Unknown vendors remain
 * conservative: an OpenAI-compatible vendor needs the chat plugin. Require an
 * OpenAI attempt so single-model non-OpenAI effective-mode labels stay stable.
 * Shared by runtime and evaluator to keep recorded modes tied to real selection.
 */
export function demoEffectiveOpenAiApiMode(
  models: readonly { model: string }[],
  requestedMode: DemoOpenAiApiMode
): DemoOpenAiApiMode {
  if (requestedMode !== "responses") return "chat";
  const hasOpenAi = models.some(({ model }) => model.startsWith("openai/"));
  const compatible = models.every(({ model }) =>
    model.startsWith("openai/") || model.startsWith("anthropic/") ||
    model.startsWith("google/") || demoUsesCatalogRun(model)
  );
  return hasOpenAi && compatible ? "responses" : "chat";
}

export function demoOpenAiProviderOptions(model: string, reasoningEffort: DemoReasoningEffort | undefined) {
  // The provider-native Grok gateway transport uses the OpenAI-compatible
  // chat wire format too, including reasoning_effort.
  const effort = reasoningEffort && (model.startsWith("openai/") || model.startsWith("xai/") || model.startsWith("grok/"))
    ? { reasoningEffort }
    : {};
  // The demo gateway is Zero Data Retention, so OpenAI never persists response
  // items. With the SDK default `store: true` a later step replays a reasoning
  // item by id and OpenAI answers 404 `Items are not persisted for Zero Data
  // Retention organizations` (gpt-6-astra at low, 2026-11-04). `store: false`
  // makes @ai-sdk/openai request `reasoning.encrypted_content`, so the replay
  // carries the item itself. Sent only to OpenAI: the xAI chat wire has no
  // such field.
  const retention = model.startsWith("openai/") ? { store: false } : {};
  const openai = { ...effort, ...retention };
  return Object.keys(openai).length === 0 ? {} : ({ providerOptions: { openai } } as const);
}

/**
 * Claude 5 reasoning, sent explicitly instead of inheriting the server default.
 *
 * NEVER `thinking: { type: "disabled" }`, even for effort "none". Anthropic's
 * own guidance is that "where adaptive thinking is available, effort is the
 * recommended way to control thinking depth", and disabled thinking is the
 * restricted path: Opus 5 hard-400s on it at xhigh/max, which
 * `@ai-sdk/anthropic` knows (`rejectsThinkingDisabledAboveHighEffort: true` for
 * opus-5) but does NOT know for fable-5 or sonnet-5 — both are grouped with a
 * `false`, so the SDK would happily send a request Fable rejects. Adaptive plus
 * a low effort is the sanctioned way to buy latency, and it collapses every
 * model to one path.
 *
 * This is also why the unified `streamText({ reasoning })` field is unusable
 * here: it maps "none" straight to `thinking: { type: "disabled" }` for EVERY
 * model, with no per-model guard.
 *
 * `adaptive` is a thinking MODE, never an effort value — the two are separate
 * fields and Anthropic calls out the confusion explicitly. `effort` accepts
 * low|medium|high|xhigh|max only, so "none" and "minimal" both floor to "low".
 *
 * The whole 5.x family takes this path: Fable 5 and 5.1, Opus 5 and 5.5,
 * Sonnet 5 and 5.5, and Haiku 5.5. Anthropic's effort reference lists all five
 * effort levels and adaptive thinking for each of them, including Haiku 5.5
 * (checked 2026-11-03). The Cloudflare catalog writes the point release with a
 * dot (`claude-sonnet-5.5`); Anthropic's own ids use a dash (`claude-sonnet-5-5`).
 * Both spellings match. Unmatched Claude ids (4.x) fall through to `{}` and the
 * server default on purpose: 5-family config 400s on older models, and the
 * model override accepts arbitrary slugs.
 */
export const DEMO_ANTHROPIC_5X_MODEL = /^anthropic\/claude-(?:fable|opus|sonnet|haiku)-5(?:$|[.-])/;

export function demoAnthropicProviderOptions(model: string, reasoningEffort: DemoReasoningEffort) {
  if (!DEMO_ANTHROPIC_5X_MODEL.test(model)) return {};
  return {
    providerOptions: {
      anthropic: {
        thinking: { type: "adaptive" },
        effort: reasoningEffort === "none" || reasoningEffort === "minimal" ? "low" : reasoningEffort
      }
    }
  } as const;
}

/**
 * `transport` picks the DISPATCH, and the two dispatches have different Unified
 * Billing catalogs — which is why coverage looked per-model and unexplainable.
 *
 * `transport: "gateway"` uses provider-native PASSTHROUGH, which deliberately
 * strips `x-api-key`/`authorization`. Passthrough's Unified Billing list is
 * narrower than the run catalog: Sonnet 5 and Opus 5 are on it, Fable 5 is
 * not — so Fable was forwarded to api.anthropic.com with NO credential, and
 * the PROVIDER answered `x-api-key header is required`. A provider error, not
 * a gateway error, which is what made it read as a billing problem.
 *
 * Omitting `transport` selects `"run"` -> `binding.run(slug, body, { gateway })`,
 * the Unified Billing path. The gateway is NOT dropped: the rate limit and the
 * account spend rule still apply, and extraHeaders (`cf-aig-collect-log-payload`,
 * `x-session-affinity`) are still forwarded. What passthrough uniquely offers —
 * response caching, server-side fallback, BYOK aliases — this demo never uses,
 * and chat.ts runs its own client-side fallback loop.
 *
 * Gemini is the opposite case. The run path accepts its first call but rejects
 * the tool-result replay with `7003 User Input Error` (probed 2026-11-03,
 * google/gemini-3.8-flash), while the Google AI Studio passthrough completes the
 * whole tool loop under Unified Billing. So google/* takes the default
 * passthrough branch below.
 *
 * Deliberately narrow: openai/* and xai/* stay on passthrough because both are
 * green today and Responses-mode over the run path is unverified. Do not move
 * a vendor between the two dispatches without probing the models it would move.
 */
export function demoGatewayTransportSettings(model: string) {
  if (model.startsWith("anthropic/")) {
    return { resume: false, collectLog: false } as const;
  }
  if (model.startsWith("xai/") || model.startsWith("grok/")) {
    return {
      transport: "gateway",
      byokAlias: "default",
      resume: false,
      collectLog: false
    } as const;
  }
  // The gateway transport materializes request-scoped controls as cf-aig-* entry headers.
  return { transport: "gateway", resume: false, collectLog: false } as const;
}

export function demoGatewayOptions(id: string) {
  return { id, collectLog: false } as const;
}

/**
 * Vendors absent from workers-ai-provider's slug registry (22 keys in 4.0.0, no
 * registration hook), so the plugin delegate throws `Unknown gateway provider`
 * before any network call. They are still reachable keyless through the plain
 * binding run path, which resolves slugs against Cloudflare's catalog instead.
 *
 * Keep this allowlist narrow, and add a vendor only after an offline dispatch
 * probe shows the registry error: `meta/` and `particle/` were probed on
 * 2026-11-03 (sweep record in research/audits). The plain binding path has no
 * provider SDK to remove unsupported parameters, so these models take the same
 * catalog `reasoning_effort` mapping as `@cf/*` models.
 */
export const DEMO_UNIFIED_RUN_PREFIXES = ["moonshotai/", "meta/", "particle/"] as const;

export function demoUsesUnifiedRun(model: string): boolean {
  return DEMO_UNIFIED_RUN_PREFIXES.some((prefix) => model.startsWith(prefix));
}

/**
 * Third-party catalog models on the plain binding path need the request format
 * named. The provider builds an OpenAI chat-completions body, but `/run`
 * validates a third-party slug against the serving provider's NATIVE schema
 * unless the call carries `openaiEndpoint`, which `aig-entry` turns into the
 * run request's `requestFormat` and converts the body. Cloudflare's own
 * `agents/models/ai-sdk` provider sends exactly this option. Without it,
 * Responses-only models (`meta/muse-spark-1.3`, probed 2026-11-03) reject the
 * body with `7003 User Input Error`. workers-ai-provider forwards unknown
 * settings keys to `binding.run`'s options, so this rides along with the
 * gateway and header settings. `@cf/*` models are native and do not need it.
 */
export const DEMO_UNIFIED_RUN_REQUEST_FORMAT = { openaiEndpoint: "/v1/chat/completions" } as const;

/**
 * Catalog models whose catalog page lists `Request formats | Responses`. For
 * these the gateway converts a chat-completions REQUEST, but a `stream: true`
 * call comes back as the serving provider's native Responses event stream
 * (`response.created`, `response.output_item.added`, ...), which the
 * chat-completions parser cannot read: Muse Spark 1.3 answered every turn with
 * three `[object Object]` tokens and no tool call (2026-11-04, gateway log
 * `01a1a3cf-4ad7-7418-bc61-d495dfd92820`). A `stream: false` call is converted
 * correctly, and workers-ai-provider's JSON-reply branch synthesizes the
 * stream. Keyed on the catalog property, not on the vendor, so chat-format
 * catalog models keep their live token stream.
 *
 * Source: https://developers.cloudflare.com/ai/models/meta/muse-spark-1.3/
 * ("Request formats" row). Add an id only after reading its catalog page.
 */
export const DEMO_RESPONSES_FORMAT_CATALOG_MODELS = ["meta/muse-spark-1.3"] as const;

/**
 * The plain binding used by the unified-run client. It forwards everything
 * untouched except `run` for the models above, which it asks for one JSON
 * reply instead of a stream.
 */
export function demoUnifiedRunBinding(binding: Ai): Ai {
  const jsonReplyModels: readonly string[] = DEMO_RESPONSES_FORMAT_CATALOG_MODELS;
  return new Proxy(binding, {
    get(target, key) {
      if (key === "run") return (...args: Parameters<Ai["run"]>) => {
        const [model, inputs, options] = args;
        const wantsJsonReply = jsonReplyModels.includes(model) && inputs && typeof inputs === "object" && "stream" in inputs;
        return target.run(model, (wantsJsonReply ? { ...inputs, stream: false } : inputs) as never, options);
      };
      const value = Reflect.get(target, key, target);
      return typeof value === "function" ? value.bind(target) : value;
    }
  });
}

/** Models whose request body is built by the catalog run path, not a provider SDK. */
export function demoUsesCatalogRun(model: string): boolean {
  return model.startsWith("@") || demoUsesUnifiedRun(model);
}

/**
 * Kimi K3 accepts only `temperature: 1` ("only 1 is allowed"), and the unified
 * run path has no SDK to normalize that away. The quirk is Moonshot's, not the
 * run path's: other registry-unknown vendors keep the demo temperature.
 * Returning undefined lets the caller omit the field entirely where a model
 * has no opinion.
 */
export function demoTemperatureFor(model: string): number | undefined {
  return model.startsWith("moonshotai/") ? 1 : DEMO_TEMPERATURE;
}

export function demoModelSettings(
  model: string,
  sessionAffinity: string,
  reasoningEffort: DemoReasoningEffort
) {
  const extraHeaders = {
    "x-session-affinity": sessionAffinity,
    "cf-aig-collect-log-payload": "false",
    // Disable response replay because the playground serves live data and the
    // evals must measure inference latency. The rate limiter handles abuse.
    "cf-aig-skip-cache": "true"
  } as const;
  if (demoUsesCatalogRun(model)) {
    const effort = demoWorkersAiReasoningEffort(reasoningEffort);
    // OMIT the key rather than sending `reasoning_effort: null`. Providers
    // disagree about an explicit null: Workers AI's own models ignore it, but
    // GLM rejects the whole request with `8006: Invalid data for
    // reasoning_effort - reason value must be a string`. "No preference" is
    // absence, not null, and absence is what every provider accepts.
    const run = demoUsesUnifiedRun(model) ? { extraHeaders, ...DEMO_UNIFIED_RUN_REQUEST_FORMAT } : { extraHeaders };
    return effort === null ? run : { ...run, reasoning_effort: effort };
  }
  return {
    ...demoGatewayTransportSettings(model),
    extraHeaders
  } as const;
}

export function demoWorkersAiReasoningEffort(
  reasoningEffort: DemoReasoningEffort
): "low" | "medium" | "high" | null {
  if (reasoningEffort === "none") return null;
  if (reasoningEffort === "minimal") return "low";
  if (reasoningEffort === "xhigh") return "high";
  return reasoningEffort;
}

export async function demoSessionAffinity(subject: string): Promise<string> {
  const bytes = new TextEncoder().encode(`demo:${subject}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return `demo-${[...new Uint8Array(digest)]
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;
}
