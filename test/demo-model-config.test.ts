import { streamText } from "ai";
import { createWorkersAI } from "workers-ai-provider";
import { describe, expect, it } from "vitest";
import {
  DEMO_FALLBACK_MODEL,
  DEMO_GATEWAY_ID_FALLBACK,
  DEMO_GROK_CONTROL_MODEL,
  DEMO_KIMI_CONTROL_MODEL,
  DEMO_MODEL,
  DEMO_MODEL_OVERRIDE_VAR,
  DEMO_MODELS,
  DEMO_OPENAI_API_MODE,
  DEMO_OPENAI_API_MODE_VAR,
  DEMO_PRIMARY_MODEL,
  DEMO_REASONING_EFFORT,
  DEMO_REASONING_EFFORT_OVERRIDE_VAR,
  DEMO_TEMPERATURE,
  demoEffectiveOpenAiApiMode,
  demoOpenAiApiModeFromOverride,
  demoOpenAiProviderOptions,
  demoGatewayTransportSettings,
  demoModelSettings,
  demoReasoningEffortFromOverride,
  demoReasoningEffortOverride,
  demoModelsFromOverride,
  demoSessionAffinity,
  demoWorkersAiReasoningEffort
} from "../src/demo/model-config";

describe("demo model config", () => {
  it("disables AI Gateway logging for every model transport", () => {
    for (const model of [DEMO_PRIMARY_MODEL, DEMO_GROK_CONTROL_MODEL, DEMO_KIMI_CONTROL_MODEL]) {
      expect(demoModelSettings(model, "demo-affinity", "high").extraHeaders).toMatchObject({
        "cf-aig-collect-log": "false",
        "x-session-affinity": "demo-affinity"
      });
    }
  });

  it("uses the gauntlet winner with a fast fallback, conservative sampling, and configured default reasoning", () => {
    expect(DEMO_PRIMARY_MODEL).toBe("openai/gpt-5.4");
    expect(DEMO_FALLBACK_MODEL).toBe("openai/gpt-5.4-mini");
    expect(DEMO_GROK_CONTROL_MODEL).toBe("xai/grok-4.5");
    expect(DEMO_KIMI_CONTROL_MODEL).toBe("@cf/moonshotai/kimi-k2.7-code");
    expect(DEMO_MODEL).toBe(DEMO_PRIMARY_MODEL);
    expect(DEMO_MODELS).toEqual([
      { model: DEMO_PRIMARY_MODEL, role: "primary" },
      { model: DEMO_FALLBACK_MODEL, role: "fallback" }
    ]);
    expect(DEMO_TEMPERATURE).toBe(0.1);
    expect(DEMO_OPENAI_API_MODE).toBe("responses");
    expect(DEMO_REASONING_EFFORT).toBe("none");
    expect(DEMO_REASONING_EFFORT_OVERRIDE_VAR).toBe("DEMO_REASONING_EFFORT_OVERRIDE");
    expect(DEMO_OPENAI_API_MODE_VAR).toBe("DEMO_OPENAI_API_MODE");
    expect(DEMO_GATEWAY_ID_FALLBACK).toBe("stellar-raven-demo");
    expect(DEMO_MODEL_OVERRIDE_VAR).toBe("DEMO_MODEL_OVERRIDE");
  });

  it("keeps default models unless the server env supplies a gauntlet override", () => {
    expect(demoModelsFromOverride(undefined)).toBe(DEMO_MODELS);
    expect(demoModelsFromOverride("  ")).toBe(DEMO_MODELS);
    expect(demoModelsFromOverride("openai/gpt-5.4-mini")).toEqual([
      { model: "openai/gpt-5.4-mini", role: "primary" }
    ]);
    expect(demoModelsFromOverride("openai/gpt-5.4-mini,anthropic/claude-haiku-4.5")).toEqual([
      { model: "openai/gpt-5.4-mini", role: "primary" },
      { model: "anthropic/claude-haiku-4.5", role: "fallback" }
    ]);
  });

  it("records none as the configured default unless the server env supplies a valid gauntlet override", () => {
    expect(demoReasoningEffortFromOverride(undefined)).toBe("none");
    expect(demoReasoningEffortFromOverride("")).toBe("none");
    expect(demoReasoningEffortFromOverride("nope")).toBe("none");
    expect(demoReasoningEffortFromOverride(" low ")).toBe("low");
    expect(demoReasoningEffortFromOverride("none")).toBe("none");
    expect(demoReasoningEffortFromOverride("minimal")).toBe("minimal");
    expect(demoReasoningEffortFromOverride("xhigh")).toBe("xhigh");
    expect(demoReasoningEffortOverride(undefined)).toBeUndefined();
    expect(demoReasoningEffortOverride("nope")).toBeUndefined();
    expect(demoReasoningEffortOverride(" low ")).toBe("low");
  });

  it("builds OpenAI-wire reasoning options for OpenAI and provider-native Grok slugs", () => {
    expect(demoOpenAiProviderOptions("openai/gpt-5.4", "low")).toEqual({
      providerOptions: {
        openai: {
          reasoningEffort: "low"
        }
      }
    });
    expect(demoOpenAiProviderOptions("openai/gpt-5.4", undefined)).toEqual({});
    expect(demoOpenAiProviderOptions("xai/grok-4.5", "medium")).toEqual({
      providerOptions: {
        openai: {
          reasoningEffort: "medium"
        }
      }
    });
    expect(demoOpenAiProviderOptions("@cf/openai/gpt-oss-120b", "low")).toEqual({});
  });

  it("pins Grok to the stored-key gateway transport rather than the unified catalog", () => {
    expect(demoGatewayTransportSettings("xai/grok-4.5")).toEqual({
      transport: "gateway",
      byokAlias: "default",
      resume: false
    });
    expect(demoGatewayTransportSettings("grok/grok-4.5")).toEqual({
      transport: "gateway",
      byokAlias: "default",
      resume: false
    });
    expect(demoGatewayTransportSettings("openai/gpt-5.4")).toEqual({ resume: false });
  });

  it("defaults OpenAI API mode to responses unless chat is explicitly requested", () => {
    expect(demoOpenAiApiModeFromOverride(undefined)).toBe("responses");
    expect(demoOpenAiApiModeFromOverride("")).toBe("responses");
    expect(demoOpenAiApiModeFromOverride("nope")).toBe("responses");
    expect(demoOpenAiApiModeFromOverride("chat")).toBe("chat");
    expect(demoOpenAiApiModeFromOverride(" responses ")).toBe("responses");
  });

  it("uses the same effective API-mode rule for the configured fallback tuple", () => {
    expect(demoEffectiveOpenAiApiMode(DEMO_MODELS, "responses")).toBe("responses");
    expect(demoEffectiveOpenAiApiMode([{ model: "openai/gpt-5.4" }, { model: "xai/grok-4.5" }], "responses")).toBe(
      "chat"
    );
    expect(demoEffectiveOpenAiApiMode(DEMO_MODELS, "chat")).toBe("chat");
  });

  it("maps demo reasoning values onto the narrower Workers AI catalog setting", () => {
    expect(demoWorkersAiReasoningEffort("none")).toBeNull();
    expect(demoWorkersAiReasoningEffort("minimal")).toBe("low");
    expect(demoWorkersAiReasoningEffort("low")).toBe("low");
    expect(demoWorkersAiReasoningEffort("medium")).toBe("medium");
    expect(demoWorkersAiReasoningEffort("high")).toBe("high");
    expect(demoWorkersAiReasoningEffort("xhigh")).toBe("high");
  });

  it("derives stable non-raw session affinity keys", async () => {
    const a = await demoSessionAffinity("subject@example.com");
    const b = await demoSessionAffinity("subject@example.com");
    const c = await demoSessionAffinity("other@example.com");
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toMatch(/^demo-[a-f0-9]{32}$/);
    expect(a).not.toContain("subject");
  });

  it("passes reasoning effort, temperature, and session affinity for Workers AI catalog models", async () => {
    const calls: Array<{ model: string; inputs: Record<string, unknown>; options?: { extraHeaders?: Record<string, string> } }> =
      [];
    const binding = {
      async run(model: string, inputs: Record<string, unknown>, options?: { extraHeaders?: Record<string, string> }) {
        calls.push({ model, inputs, options });
        return {
          choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content: "ok" } }],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 }
        };
      }
    };

    const workersai = createWorkersAI({ binding: binding as unknown as Ai });
    const result = streamText({
      model: workersai(
        DEMO_KIMI_CONTROL_MODEL,
        demoModelSettings(DEMO_KIMI_CONTROL_MODEL, "demo-test-affinity", DEMO_REASONING_EFFORT) as never
      ),
      system: "system",
      messages: [{ role: "user", content: "hi" }],
      maxOutputTokens: 16,
      temperature: DEMO_TEMPERATURE
    });
    for await (const _ of result.fullStream) {
      // Drain stream so the provider call runs.
    }

    expect(calls).toHaveLength(1);
    expect(calls[0]?.model).toBe(DEMO_KIMI_CONTROL_MODEL);
    expect(calls[0]?.inputs.temperature).toBe(DEMO_TEMPERATURE);
    expect(calls[0]?.inputs.reasoning_effort).toBe(demoWorkersAiReasoningEffort(DEMO_REASONING_EFFORT));
    expect(calls[0]?.options?.extraHeaders?.["x-session-affinity"]).toBe("demo-test-affinity");
    expect(calls[0]?.options?.extraHeaders?.["cf-aig-collect-log"]).toBe("false");
  });
});
