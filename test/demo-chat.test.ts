import { APICallError } from "ai";
import { convertArrayToReadableStream, MockLanguageModelV4 } from "ai/test";
import { afterEach, describe, expect, it, vi } from "vitest";

const { createWorkersAiStub, modelStub } = vi.hoisted(() => ({
  createWorkersAiStub: vi.fn(),
  modelStub: vi.fn()
}));

vi.mock("workers-ai-provider", async (importOriginal) => ({
  ...(await importOriginal<typeof import("workers-ai-provider")>()),
  createWorkersAI: createWorkersAiStub
}));
vi.mock("../src/demo/tools.ts", async () => {
  const { tool } = await import("ai");
  const { z } = await import("zod");
  return {
    buildDemoTools: ({ emit }: { emit: (frame: unknown) => void }) => ({
      tools: {
        test: tool({
          inputSchema: z.object({}),
          execute: async () => {
            emit({ type: "tool-start", id: "test-call", tool: "search", input: { query: "test" } });
            emit({ type: "tool-result", id: "test-call", tool: "search", ok: true, output: {} });
            return "test result";
          }
        })
      }
    })
  };
});

import { handleDemoChat } from "../src/demo/chat";

const finish = (finishReason = "stop") => ({
  type: "finish",
  finishReason: { unified: finishReason, raw: finishReason },
  usage: {
    inputTokens: { total: 1, noCache: 1, cacheRead: 0, cacheWrite: 0 },
    outputTokens: { total: 0, text: 0, reasoning: 0 }
  }
});

function textAnswer(text: string): unknown[] {
  return [
    { type: "text-start", id: "text-1" },
    { type: "text-delta", id: "text-1", delta: text },
    { type: "text-end", id: "text-1" },
    finish()
  ];
}

function modelFor(parts: unknown[] | unknown[][]): MockLanguageModelV4 {
  const steps = Array.isArray(parts[0]) ? parts as unknown[][] : [parts as unknown[]];
  return new MockLanguageModelV4({
    doStream: steps.map((step) => ({ stream: convertArrayToReadableStream(step) })) as never
  });
}

const providerError = (message: string, statusCode: number) => new APICallError({
  message,
  url: "https://api.openai.com/v1/responses",
  requestBodyValues: {},
  statusCode
});

function testEnv(modelOverride?: string): Env {
  return {
    AI: {},
    DEV_ALLOW_UNAUTHENTICATED: "true",
    MCP_SERVER_SECRET: "test-only",
    DEMO_MODEL_OVERRIDE: modelOverride,
    OAUTH_KV: {
      get: vi.fn(async () => null),
      put: vi.fn(async () => undefined)
    }
  } as unknown as Env;
}

async function chatRequest(content: string, modelOverride?: string) {
  const pending: Promise<unknown>[] = [];
  const ctx = {
    waitUntil(promise: Promise<unknown>) {
      pending.push(promise);
    }
  } as unknown as ExecutionContext;
  const response = await handleDemoChat(
    new Request("http://localhost/demo/chat", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost" },
      body: JSON.stringify({ messages: [{ role: "user", content }] })
    }),
    testEnv(modelOverride),
    ctx
  );
  return { response, pending };
}

async function runChat(streams: unknown[][], modelOverride?: string, oneModel = false, content = "hello") {
  const models: MockLanguageModelV4[] = [];
  if (oneModel) {
    const model = modelFor(streams);
    models.push(model);
    modelStub.mockReturnValueOnce(model);
  } else {
    for (const parts of streams) {
      const model = modelFor(parts);
      models.push(model);
      modelStub.mockReturnValueOnce(model);
    }
  }
  const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
  const { response, pending } = await chatRequest(content, modelOverride);
  const body = await response.text();
  await Promise.all(pending);
  const event = log.mock.calls
    .map(([line]) => JSON.parse(String(line)) as Record<string, unknown>)
    .find((item) => item.evt === "demo-chat");
  expect(event).toBeDefined();
  return { event: event!, frames: sseFrames(body), models };
}

function sseFrames(body: string): Record<string, unknown>[] {
  return body
    .split("\n\n")
    .flatMap((event) => event.split("\n").filter((line) => line.startsWith("data:")))
    .map((line) => JSON.parse(line.slice(5)) as Record<string, unknown>);
}

afterEach(() => {
  createWorkersAiStub.mockClear();
  modelStub.mockReset();
  vi.restoreAllMocks();
});

createWorkersAiStub.mockImplementation(() => modelStub);

describe("demo chat provider failures", () => {
  it("keeps provider telemetry when a fallback finishes stop without text", async () => {
    const { event: finalEvent } = await runChat([
      [{ type: "error", error: providerError("provider unavailable", 503) }],
      [finish()]
    ]);
    expect(finalEvent).toMatchObject({
      attemptedModels: ["openai/gpt-5.6-terra", "openai/gpt-5.6-luna"],
      finishReason: "stop",
      stopReasonClass: "missing-final-text",
      hadFinalText: false,
      providerErrorStatus: 503,
      providerErrorAttempt: 1,
      providerErrorTerminal: true
    });
  });

  it.each([
    {
      name: "keeps the latest telemetry after two failed attempts",
      streams: () => [
        [{ type: "error", error: providerError("first unavailable", 503) }],
        [{ type: "error", error: providerError("latest rate limit", 429) }]
      ],
      expected: {
        attemptedModels: ["openai/gpt-5.6-terra", "openai/gpt-5.6-luna"],
        providerErrorStatus: 429,
        providerErrorAttempt: 2,
        providerErrorModel: "openai/gpt-5.6-luna",
        providerErrorTerminal: true
      },
      modelOverride: undefined
    },
    {
      name: "clears stale provider fields after successful final text",
      streams: () => [
        [{ type: "error", error: providerError("first unavailable", 503) }],
        textAnswer("grounded answer")
      ],
      expected: {
        finishReason: "stop",
        stopReasonClass: "complete",
        hadFinalText: true
      },
      providerFieldsAbsent: true,
      modelOverride: undefined
    },
  ])("$name", async ({ streams, modelOverride, expected, providerFieldsAbsent }) => {
    const { event: finalEvent } = await runChat(streams(), modelOverride);
    expect(finalEvent).toMatchObject(expected);
    if (providerFieldsAbsent) {
      expect(Object.keys(finalEvent).filter((key) => key.startsWith("providerError"))).toEqual([]);
    }
  });

  it("marks provider telemetry non-terminal when the client aborts a real model stream", async () => {
    let call = 0;
    const model = new MockLanguageModelV4({
      doStream: (options) => {
        call += 1;
        if (call === 1) {
          // A tool round starts the second stream. The test aborts that stream
          // after its provider-error frame arrives.
          return {
            stream: convertArrayToReadableStream([
            { type: "tool-call", toolCallId: "call-1", toolName: "test", input: "{}" },
            finish("tool-calls")
            ])
          } as never;
        }
        return {
          stream: new ReadableStream({
            start(controller) {
              controller.enqueue({
                type: "error",
                error: providerError("provider interrupted", 502)
              });
              options.abortSignal?.addEventListener("abort", () => controller.close(), { once: true });
            }
          })
        } as never;
      }
    });
    modelStub.mockReturnValueOnce(model);
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const { response, pending } = await chatRequest("hello", "openai/gpt-5.4");
    const reader = response.body?.getReader();
    if (!reader) throw new Error("expected an SSE response body");
    const decoder = new TextDecoder();
    let sawProviderError = false;
    while (!sawProviderError) {
      const part = await reader.read();
      if (part.done) break;
      sawProviderError = decoder.decode(part.value, { stream: true }).includes("provider interrupted");
    }

    expect(sawProviderError).toBe(true);
    await reader.cancel();
    await Promise.all(pending);

    const event = log.mock.calls
      .map(([line]) => JSON.parse(String(line)) as Record<string, unknown>)
      .find((item) => item.evt === "demo-chat");
    expect(event).toMatchObject({
      finishReason: "abort",
      stopReasonClass: "aborted",
      providerErrorStatus: 502,
      providerErrorTerminal: false
    });
  });
});

describe("demo chat user-message limit", () => {
  it.each([7999, 8000])("accepts %i-character messages without truncation", async (length) => {
    const content = "x".repeat(length);
    const { frames, models } = await runChat(
      [textAnswer("grounded answer")],
      "openai/gpt-5.6-terra",
      false,
      content
    );

    expect(modelStub).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(models[0]?.doStreamCalls[0]?.prompt)).toContain(content);
    expect(frames.at(-1)).toEqual({ type: "done", reason: "stop" });
  });

  it("rejects a bypassed 8001-character user message", async () => {
    const { response, pending } = await chatRequest("x".repeat(8001), "openai/gpt-5.6-terra");
    await Promise.all(pending);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "message_too_long",
      hint: "Each user message must contain at most 8000 characters."
    });
    expect(modelStub).not.toHaveBeenCalled();
  });
});

describe("demo chat terminal frame", () => {
  // streamText emits `finish` with reason `other` when a model stream ends
  // without its own finish chunk. The client must receive `incomplete`.
  it("emits done when the last model's stream ends without finish", async () => {
    const { event, frames } = await runChat(
      [[
        { type: "text-start", id: "text-1" },
        { type: "text-delta", id: "text-1", delta: "answer with no finish part" },
        { type: "text-end", id: "text-1" }
      ]],
      "openai/gpt-5.6-terra"
    );
    expect(frames.at(-1)).toEqual({ type: "done", reason: "incomplete" });
    expect(frames.filter((f) => f.type === "done" || f.type === "error")).toHaveLength(1);
    expect(event).toMatchObject({ finishReason: "other" });
  });

  // ai@7 treats `error` as terminal for the step but still emits `finish` from
  // its flush, so this ordering is what the real SDK produces on an errored
  // turn — not a synthetic case.
  it("keeps the provider error and drops the trailing done", async () => {
    const { frames } = await runChat(
      [[{ type: "error", error: providerError("provider exploded", 500) }, finish()]],
      "openai/gpt-5.6-terra"
    );
    expect(frames.filter((f) => f.type === "done" || f.type === "error")).toEqual([
      { type: "error", message: "provider exploded" }
    ]);
  });

  it("does not add a second terminal frame when the stream finishes normally", async () => {
    const { frames } = await runChat(
      [textAnswer("grounded answer")],
      "openai/gpt-5.6-terra"
    );
    expect(frames.filter((f) => f.type === "done" || f.type === "error")).toEqual([
      { type: "done", reason: "stop" }
    ]);
  });

  it("runs a model-stub tool call through the real AI tool loop", async () => {
    const { frames, models } = await runChat(
      [
        [{ type: "tool-call", toolCallId: "call-1", toolName: "test", input: "{}" }, finish("tool-calls")],
        textAnswer("grounded answer")
      ],
      "openai/gpt-5.6-terra",
      true
    );

    expect(modelStub).toHaveBeenCalledTimes(1);
    expect(models[0]?.doStreamCalls).toHaveLength(2);
    expect(frames).toContainEqual({ type: "token", text: "grounded answer" });
    expect(frames.at(-1)).toEqual({ type: "done", reason: "stop" });
  });
});
