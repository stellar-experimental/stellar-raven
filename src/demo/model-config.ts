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

/**
 * The newest AI Gateway catalog model of each family the demo uses. No provider offers a family or
 * `latest` alias, so these are exact catalog IDs. Bump an entry when the catalog lists a newer
 * model of that family, and check `DEMO_ANTHROPIC_5X_MODEL` in the same change.
 */
export const DEMO_CATALOG_LATEST = {
  terra: "openai/gpt-6.1-terra",
  haiku: "anthropic/claude-haiku-5.5",
  grok: "xai/grok-4.7"
} as const;
export const DEMO_PRIMARY_MODEL = DEMO_CATALOG_LATEST.terra;
export const DEMO_FALLBACK_MODEL = DEMO_CATALOG_LATEST.haiku;
export const DEMO_GROK_CONTROL_MODEL = DEMO_CATALOG_LATEST.grok;
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
  // Zero Data Retention gateway: OpenAI does not persist response items, so `store: false`
  // makes @ai-sdk/openai request `reasoning.encrypted_content` instead of replaying by id (which 404s).
  // Sent only to OpenAI; xAI chat has no `store` field.
  const retention = model.startsWith("openai/") ? { store: false } : {};
  const openai = { ...effort, ...retention };
  return Object.keys(openai).length === 0 ? {} : ({ providerOptions: { openai } } as const);
}

/**
 * Claude 5.x models use explicit adaptive thinking + effort (`low|medium|high|xhigh`, flooring
 * `none`/`minimal` to `low`) instead of `thinking: { type: "disabled" }` or unified
 * `streamText({ reasoning })`: Claude 5 rejects disabled thinking at high/xhigh effort and we
 * keep the exact Anthropic payload under our control. Matches both dot (Cloudflare) and dash
 * (Anthropic) spellings; older 4.x ids fall through to `{}` because 5.x config 400s on them.
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
 * Select Gateway dispatch per vendor (`transport: "gateway"` passthrough vs omitted `"run"`):
 * - `anthropic/*` uses `"run"` (Unified Billing): passthrough strips auth headers and lacks
 *   some 5.x models (e.g. Fable 5), causing upstream 401s. Gateway limits and headers still apply.
 * - `google/*` stays on passthrough: `"run"` rejects Gemini tool-result replays with 7003.
 * - `openai/*` and `xai/*` stay on passthrough (Responses mode over `"run"` is unverified).
 * Probe before moving any vendor between dispatches.
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
 * Vendors absent from `workers-ai-provider`'s slug registry; routed via plain `binding.run`
 * instead of the plugin delegate. Add a vendor only after confirming `Unknown gateway provider`.
 */
export const DEMO_UNIFIED_RUN_PREFIXES = ["moonshotai/", "meta/", "particle/"] as const;

export function demoUsesUnifiedRun(model: string): boolean {
  return DEMO_UNIFIED_RUN_PREFIXES.some((prefix) => model.startsWith(prefix));
}

/**
 * Required for third-party catalog slugs on `binding.run` so `aig-entry` converts the
 * chat-completions body for Responses-only models instead of returning 7003. `@cf/*` does not need it.
 */
export const DEMO_UNIFIED_RUN_REQUEST_FORMAT = { openaiEndpoint: "/v1/chat/completions" } as const;

/**
 * Catalog models whose native format is Responses: `stream: true` returns native Responses
 * SSE events that the chat-completions parser cannot read, whereas `stream: false` converts
 * cleanly. Add an id only after confirming `Request formats: Responses` on its Cloudflare docs page.
 */
export const DEMO_RESPONSES_FORMAT_CATALOG_MODELS = ["meta/muse-spark-1.3"] as const;

/** Proxy `binding.run` to force `stream: false` for Responses-format catalog models above. */
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

/** Moonshot Kimi models accept only `temperature: 1` and unified run has no SDK to normalize it. */
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
    // Disable response replay because the playground serves live data and evals measure inference latency.
    "cf-aig-skip-cache": "true"
  } as const;
  if (demoUsesCatalogRun(model)) {
    const effort = demoWorkersAiReasoningEffort(reasoningEffort);
    // Omit `reasoning_effort` rather than sending `null` (models such as GLM reject null with 8006).
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
