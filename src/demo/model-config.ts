import { createOpenAI } from "@ai-sdk/openai";
import type { ProviderPlugin } from "workers-ai-provider";

export type DemoModelConfig = {
  model: string;
  role: "primary" | "fallback";
};

export type DemoReasoningEffort = "none" | "minimal" | "low" | "medium" | "high" | "xhigh";
export type DemoOpenAiApiMode = "chat" | "responses";

export const DEMO_PRIMARY_MODEL = "openai/gpt-5.4";
export const DEMO_FALLBACK_MODEL = "openai/gpt-5.4-mini";
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
// The 2026-07-08 Responses-mode smoke picked `none` for demo speed and fallback
// reliability. Non-OpenAI Workers AI catalog models receive the mapped setting
// below.
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

export function demoGatewayTransportSettings(model: string) {
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

export function demoModelSettings(
  model: string,
  sessionAffinity: string,
  reasoningEffort: DemoReasoningEffort
) {
  const extraHeaders = {
    "x-session-affinity": sessionAffinity,
    "cf-aig-collect-log-payload": "false"
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
