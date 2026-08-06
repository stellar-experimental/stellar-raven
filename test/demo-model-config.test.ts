import { streamText } from "ai";
import { createWorkersAI } from "workers-ai-provider";
import { openai } from "workers-ai-provider/openai";
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
  demoAnthropicProviderOptions,
  demoEffectiveOpenAiApiMode,
  demoGatewayOptions,
  demoOpenAiApiModeFromOverride,
  demoOpenAiProviderOptions,
  demoGatewayTransportSettings,
  demoModelSettings,
  demoTemperatureFor,
  demoUsesUnifiedRun,
  demoReasoningEffortFromOverride,
  demoReasoningEffortOverride,
  demoModelsFromOverride,
  openAiResponses,
  demoSessionAffinity,
  demoWorkersAiReasoningEffort
} from "../src/demo/model-config";

function openAiSseResponse(model: string): Response {
  const chunks = [
    {
      id: "test",
      object: "chat.completion.chunk",
      created: 1,
      model,
      choices: [{ index: 0, delta: { role: "assistant", content: "ok" }, finish_reason: null }]
    },
    {
      id: "test",
      object: "chat.completion.chunk",
      created: 1,
      model,
      choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
      usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 }
    }
  ];
  const body = `${chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join("")}data: [DONE]\n\n`;
  return new Response(body, { headers: { "content-type": "text/event-stream" } });
}

function openAiResponsesSseResponse(model: string): Response {
  const chunks = [
    { type: "response.created", response: { id: "resp-test", created_at: 1, model } },
    { type: "response.output_item.added", output_index: 0, item: { type: "message", id: "msg-test" } },
    { type: "response.output_text.delta", item_id: "msg-test", delta: "ok" },
    { type: "response.output_item.done", output_index: 0, item: { type: "message", id: "msg-test" } },
    {
      type: "response.completed",
      response: { usage: { input_tokens: 1, output_tokens: 1 } }
    }
  ];
  return new Response(chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join(""), {
    headers: { "content-type": "text/event-stream" }
  });
}

describe("demo model config", () => {
  it("disables AI Gateway logging at the binding boundary", () => {
    expect(demoGatewayOptions("test-gateway")).toEqual({ id: "test-gateway", collectLog: false });
  });

  it("uses the gauntlet winner with a fast fallback, conservative sampling, and configured default reasoning", () => {
    expect(DEMO_PRIMARY_MODEL).toBe("openai/gpt-5.6-terra");
    expect(DEMO_FALLBACK_MODEL).toBe("openai/gpt-5.6-luna");
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

  it("configures Claude 5 reasoning without using the unified reasoning field", () => {
    // Never `thinking: { type: "disabled" }` — Opus 5 400s on it above high
    // effort and the SDK does not guard Fable 5 or Sonnet 5 at all.
    for (const model of [
      "anthropic/claude-opus-5",
      "anthropic/claude-sonnet-5",
      "anthropic/claude-fable-5",
      "anthropic/claude-sonnet-5-20260101"
    ]) {
      expect(demoAnthropicProviderOptions(model, "none")).toEqual({
        providerOptions: { anthropic: { thinking: { type: "adaptive" }, effort: "low" } }
      });
    }
    expect(demoAnthropicProviderOptions("anthropic/claude-sonnet-5", "medium")).toEqual({
      providerOptions: { anthropic: { thinking: { type: "adaptive" }, effort: "medium" } }
    });
    // "minimal" is not in Anthropic's effort enum; it must floor to "low".
    expect(demoAnthropicProviderOptions("anthropic/claude-opus-5", "minimal")).toEqual({
      providerOptions: { anthropic: { thinking: { type: "adaptive" }, effort: "low" } }
    });
    // Dashes, never dots — a dotted Anthropic id authenticates and returns
    // "model … was not found", which reads like a provider outage.
    expect(demoAnthropicProviderOptions("anthropic/claude-haiku-4-5", "none")).toEqual({});
    expect(demoAnthropicProviderOptions("openai/gpt-5.6-terra", "none")).toEqual({});
  });

  it("pins provider models to the gateway transport so request-scoped privacy controls reach the wire", () => {
    expect(demoGatewayTransportSettings("xai/grok-4.5")).toEqual({
      transport: "gateway",
      byokAlias: "default",
      resume: false,
      collectLog: false
    });
    expect(demoGatewayTransportSettings("grok/grok-4.5")).toEqual({
      transport: "gateway",
      byokAlias: "default",
      resume: false,
      collectLog: false
    });
    expect(demoGatewayTransportSettings("openai/gpt-5.4")).toEqual({
      transport: "gateway",
      resume: false,
      collectLog: false
    });
    // Anthropic and Google MUST omit `transport`. That selects the binding run
    // path, whose Unified Billing catalog is wider than provider passthrough's —
    // passthrough strips auth headers and does not carry claude-fable-5, so it
    // was reaching api.anthropic.com with no credential and 401ing. Asserting
    // absence, not a value, because absence is the whole fix.
    for (const model of ["anthropic/claude-fable-5", "anthropic/claude-sonnet-5", "google/gemini-3.6-flash"]) {
      const settings = demoGatewayTransportSettings(model);
      expect("transport" in settings, model).toBe(false);
      expect(settings).toEqual({ resume: false, collectLog: false });
    }
  });

  it("routes registry-unknown vendors through the plain binding, with their temperature quirk", () => {
    // workers-ai-provider has no `moonshotai` entry, so the plugin delegate
    // throws before any network call. The binding run path resolves it instead.
    expect(demoUsesUnifiedRun("moonshotai/kimi-k3")).toBe(true);
    expect(demoUsesUnifiedRun("anthropic/claude-fable-5")).toBe(false);
    expect(demoUsesUnifiedRun("@cf/zai-org/glm-5.2")).toBe(false);
    // That path has no SDK to normalize parameters, and K3 accepts only 1.
    expect(demoTemperatureFor("moonshotai/kimi-k3")).toBe(1);
    expect(demoTemperatureFor("openai/gpt-5.6-terra")).toBe(DEMO_TEMPERATURE);
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
    const calls: Array<{
      model: string;
      inputs: Record<string, unknown>;
      options?: { extraHeaders?: Record<string, string>; gateway?: { id: string; collectLog?: boolean } };
    }> = [];
    const binding = {
      async run(model: string, inputs: Record<string, unknown>, options?: (typeof calls)[number]["options"]) {
        calls.push({ model, inputs, options });
        return {
          choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content: "ok" } }],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 }
        };
      }
    };

    const workersai = createWorkersAI({
      binding: binding as unknown as Ai,
      gateway: demoGatewayOptions("test-gateway")
    });
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
    expect(await result.text).toBe("ok");

    expect(calls).toHaveLength(1);
    expect(calls[0]?.model).toBe(DEMO_KIMI_CONTROL_MODEL);
    expect(calls[0]?.inputs.temperature).toBe(DEMO_TEMPERATURE);
    // At the default effort ("none") the key must be ABSENT, not null: GLM
    // rejects an explicit null with `8006: Invalid data for reasoning_effort`,
    // which took a live probe to find because every other @cf model ignores it.
    expect(demoWorkersAiReasoningEffort(DEMO_REASONING_EFFORT)).toBeNull();
    expect("reasoning_effort" in (calls[0]?.inputs ?? {})).toBe(false);
    // A real effort still rides through.
    expect(demoModelSettings(DEMO_KIMI_CONTROL_MODEL, "a", "high")).toMatchObject({
      reasoning_effort: "high"
    });
    expect(calls[0]?.options?.extraHeaders?.["x-session-affinity"]).toBe("demo-test-affinity");
    expect(calls[0]?.options?.gateway?.collectLog).toBe(false);
  });

  it("emits both privacy controls through the OpenAI gateway transport", async () => {
    let entries: Array<{ headers: Record<string, string> }> = [];
    const binding = {
      gateway(id: string) {
        expect(id).toBe("test-gateway");
        return {
          async run(nextEntries: Array<{ headers: Record<string, string> }>) {
            entries = nextEntries;
            return openAiSseResponse(DEMO_PRIMARY_MODEL);
          }
        };
      }
    };
    const workersai = createWorkersAI({
      binding: binding as unknown as Ai,
      gateway: demoGatewayOptions("test-gateway"),
      providers: [openai],
      resume: false
    });
    const result = streamText({
      model: workersai(
        DEMO_PRIMARY_MODEL,
        demoModelSettings(DEMO_PRIMARY_MODEL, "demo-test-affinity", DEMO_REASONING_EFFORT) as never
      ),
      messages: [{ role: "user", content: "hi" }]
    });
    expect(await result.text).toBe("ok");
    expect(entries).toHaveLength(1);
    expect(entries[0]?.headers["cf-aig-collect-log"]).toBe("false");
    expect(entries[0]?.headers["cf-aig-collect-log-payload"]).toBe("false");
    // Gateway cache_ttl is 300; without this the demo replays another visitor's
    // answer and every measured run mixes cache hits into its numbers.
    expect(entries[0]?.headers["cf-aig-skip-cache"]).toBe("true");
    expect(entries[0]?.headers["x-session-affinity"]).toBe("demo-test-affinity");
  });

  it("emits both privacy controls through the production OpenAI Responses transport", async () => {
    let entries: Array<{ endpoint: string; headers: Record<string, string> }> = [];
    const binding = {
      gateway(id: string) {
        expect(id).toBe("test-gateway");
        return {
          async run(nextEntries: Array<{ endpoint: string; headers: Record<string, string> }>) {
            entries = nextEntries;
            return openAiResponsesSseResponse(DEMO_PRIMARY_MODEL);
          }
        };
      }
    };
    const workersai = createWorkersAI({
      binding: binding as unknown as Ai,
      gateway: demoGatewayOptions("test-gateway"),
      providers: [openAiResponses],
      resume: false
    });
    const result = streamText({
      model: workersai(
        DEMO_PRIMARY_MODEL,
        demoModelSettings(DEMO_PRIMARY_MODEL, "demo-test-affinity", DEMO_REASONING_EFFORT) as never
      ),
      messages: [{ role: "user", content: "hi" }]
    });
    expect(await result.text).toBe("ok");
    expect(entries).toHaveLength(1);
    expect(entries[0]?.endpoint).toBe("v1/responses");
    expect(entries[0]?.headers["cf-aig-collect-log"]).toBe("false");
    expect(entries[0]?.headers["cf-aig-collect-log-payload"]).toBe("false");
    // Gateway cache_ttl is 300; without this the demo replays another visitor's
    // answer and every measured run mixes cache hits into its numbers.
    expect(entries[0]?.headers["cf-aig-skip-cache"]).toBe("true");
  });

  it("passes collectLog=false through the stored-key gateway transport", async () => {
    let entries: Array<{ headers: Record<string, string> }> = [];
    const binding = {
      gateway(id: string) {
        expect(id).toBe("test-gateway");
        return {
          async run(nextEntries: Array<{ headers: Record<string, string> }>) {
            entries = nextEntries;
            return openAiSseResponse(DEMO_GROK_CONTROL_MODEL);
          }
        };
      }
    };
    const workersai = createWorkersAI({
      binding: binding as unknown as Ai,
      gateway: demoGatewayOptions("test-gateway"),
      providers: [openai],
      resume: false
    });
    const result = streamText({
      model: workersai(
        DEMO_GROK_CONTROL_MODEL,
        demoModelSettings(DEMO_GROK_CONTROL_MODEL, "demo-test-affinity", DEMO_REASONING_EFFORT) as never
      ),
      messages: [{ role: "user", content: "hi" }]
    });
    expect(await result.text).toBe("ok");
    expect(entries).toHaveLength(1);
    expect(entries[0]?.headers["cf-aig-collect-log"]).toBe("false");
    expect(entries[0]?.headers["cf-aig-collect-log-payload"]).toBe("false");
    // Gateway cache_ttl is 300; without this the demo replays another visitor's
    // answer and every measured run mixes cache hits into its numbers.
    expect(entries[0]?.headers["cf-aig-skip-cache"]).toBe("true");
    expect(entries[0]?.headers["x-session-affinity"]).toBe("demo-test-affinity");
  });
});
