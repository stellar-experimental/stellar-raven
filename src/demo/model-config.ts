import { createOpenAI } from "@ai-sdk/openai";
import type { ProviderPlugin } from "workers-ai-provider";

export type DemoModelConfig = {
  model: string;
  role: "primary" | "fallback";
};

export type DemoReasoningEffort = "none" | "minimal" | "low" | "medium" | "high" | "xhigh";
export type DemoOpenAiApiMode = "chat" | "responses";

export const DEMO_PRIMARY_MODEL = "openai/gpt-5.6-terra";
export const DEMO_FALLBACK_MODEL = "openai/gpt-5.6-luna";
export const DEMO_GROK_CONTROL_MODEL = "xai/grok-4.5";
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
 * Responses transport is valid only when every configured attempt is an
 * OpenAI model. Keep this decision shared by the runtime and evaluator so an
 * artifact's recorded effective mode describes the route's real selection.
 */
export function demoEffectiveOpenAiApiMode(
  models: readonly { model: string }[],
  requestedMode: DemoOpenAiApiMode
): DemoOpenAiApiMode {
  if (requestedMode !== "responses") return "chat";
  return models.every(({ model }) => model.startsWith("openai/")) ? "responses" : "chat";
}

export function demoOpenAiProviderOptions(model: string, reasoningEffort: DemoReasoningEffort | undefined) {
  // The provider-native Grok gateway transport uses the OpenAI-compatible
  // chat wire format too, including reasoning_effort.
  if (
    !reasoningEffort ||
    !(model.startsWith("openai/") || model.startsWith("xai/") || model.startsWith("grok/"))
  ) {
    return {};
  }
  return {
    providerOptions: {
      openai: {
        reasoningEffort
      }
    }
  } as const;
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
 * Unmatched Claude ids (haiku, 4.x) fall through to `{}` and the server
 * default on purpose: 5-family config 400s on older models, and the model
 * override accepts arbitrary slugs.
 */
export function demoAnthropicProviderOptions(model: string, reasoningEffort: DemoReasoningEffort) {
  if (!/^anthropic\/claude-(?:fable|opus|sonnet)-5(?:$|-)/.test(model)) return {};
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
 * narrower than the run catalog: Sonnet 5 and Opus 5 are on it, Fable 5 and
 * Gemini are not — so those two were forwarded to api.anthropic.com and
 * generativelanguage.googleapis.com with NO credential, and the PROVIDER
 * answered `x-api-key header is required` / `Method doesn't allow unregistered
 * callers`. Provider errors, not gateway errors, which is what made it read as
 * a billing problem.
 *
 * Omitting `transport` selects `"run"` -> `binding.run(slug, body, { gateway })`,
 * the Unified Billing path. The gateway is NOT dropped: the rate limit and the
 * account spend rule still apply, and extraHeaders (`cf-aig-collect-log-payload`,
 * `x-session-affinity`) are still forwarded. What passthrough uniquely offers —
 * response caching, server-side fallback, BYOK aliases — this demo never uses,
 * and chat.ts runs its own client-side fallback loop.
 *
 * Deliberately narrow: openai/* and xai/* stay on passthrough because both are
 * green today and Responses-mode over the run path is unverified. Do not widen
 * this without probing the models it would move.
 */
export function demoGatewayTransportSettings(model: string) {
  if (model.startsWith("anthropic/") || model.startsWith("google/")) {
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
 * Vendors absent from workers-ai-provider's slug registry (26 keys, no
 * registration hook), so the plugin delegate throws `Unknown gateway provider`
 * before any network call. They are still reachable keyless through the plain
 * binding run path, which resolves slugs against Cloudflare's catalog instead.
 *
 * Keep this allowlist narrow. The plain binding path has no provider SDK to
 * remove unsupported parameters.
 */
export const DEMO_UNIFIED_RUN_PREFIXES = ["moonshotai/"] as const;

export function demoUsesUnifiedRun(model: string): boolean {
  return DEMO_UNIFIED_RUN_PREFIXES.some((prefix) => model.startsWith(prefix));
}

/**
 * Kimi K3 accepts only `temperature: 1` ("only 1 is allowed"), and the unified
 * run path has no SDK to normalize that away. Returning undefined lets the
 * caller omit the field entirely where a model has no opinion.
 */
export function demoTemperatureFor(model: string): number | undefined {
  return demoUsesUnifiedRun(model) ? 1 : DEMO_TEMPERATURE;
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
  if (model.startsWith("@")) {
    const effort = demoWorkersAiReasoningEffort(reasoningEffort);
    // OMIT the key rather than sending `reasoning_effort: null`. Providers
    // disagree about an explicit null: Workers AI's own models ignore it, but
    // GLM rejects the whole request with `8006: Invalid data for
    // reasoning_effort - reason value must be a string`. "No preference" is
    // absence, not null, and absence is what every provider accepts.
    return effort === null ? ({ extraHeaders } as const) : ({ extraHeaders, reasoning_effort: effort } as const);
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
