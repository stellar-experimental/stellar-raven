import { APICallError } from "ai";
import { afterEach, describe, expect, it, vi } from "vitest";

const streamTextMock = vi.hoisted(() => vi.fn());

vi.mock("ai", async (importOriginal) => ({
  ...(await importOriginal<typeof import("ai")>()),
  streamText: streamTextMock
}));
vi.mock("../src/demo/tools.ts", () => ({
  buildDemoTools: () => ({ tools: {} })
}));

import { handleDemoChat } from "../src/demo/chat";

function fullStream(parts: unknown[]): AsyncIterable<unknown> {
  return {
    async *[Symbol.asyncIterator]() {
      yield* parts;
    }
  };
}

const finish = () => ({
  type: "finish",
  finishReason: "stop",
  totalUsage: {
    inputTokens: 1,
    inputTokenDetails: { cacheReadTokens: 0, cacheWriteTokens: 0 },
    outputTokens: 0,
    outputTokenDetails: { reasoningTokens: 0 },
    totalTokens: 1
  }
});

const providerError = (message: string, statusCode: number) => new APICallError({
  message,
  url: "https://api.openai.com/v1/responses",
  requestBodyValues: {},
  statusCode
});

async function runChat(streams: unknown[][], modelOverride?: string) {
  for (const parts of streams) {
    streamTextMock.mockReturnValueOnce({ fullStream: fullStream(parts) });
  }
  const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
  const pending: Promise<unknown>[] = [];
  const ctx = {
    waitUntil(promise: Promise<unknown>) {
      pending.push(promise);
    }
  } as unknown as ExecutionContext;
  const env = {
    AI: {},
    DEV_ALLOW_UNAUTHENTICATED: "true",
    MCP_SERVER_SECRET: "test-only",
    DEMO_MODEL_OVERRIDE: modelOverride,
    OAUTH_KV: {
      get: vi.fn(async () => null),
      put: vi.fn(async () => undefined)
    }
  } as unknown as Env;

  const response = await handleDemoChat(
    new Request("http://localhost/demo/chat", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost" },
      body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] })
    }),
    env,
    ctx
  );
  const body = await response.text();
  await Promise.all(pending);
  const event = log.mock.calls
    .map(([line]) => JSON.parse(String(line)) as Record<string, unknown>)
    .find((item) => item.evt === "demo-chat");
  expect(event).toBeDefined();
  return { event: event!, frames: sseFrames(body) };
}

function sseFrames(body: string): Record<string, unknown>[] {
  return body
    .split("\n\n")
    .flatMap((event) => event.split("\n").filter((line) => line.startsWith("data:")))
    .map((line) => JSON.parse(line.slice(5)) as Record<string, unknown>);
}

afterEach(() => {
  streamTextMock.mockReset();
  vi.restoreAllMocks();
});

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
      }
    },
    {
      name: "clears stale provider fields after successful final text",
      streams: () => [
        [{ type: "error", error: providerError("first unavailable", 503) }],
        [{ type: "text-delta", text: "grounded answer" }, finish()]
      ],
      expected: {
        finishReason: "stop",
        stopReasonClass: "complete",
        hadFinalText: true
      },
      providerFieldsAbsent: true
    },
    {
      name: "marks provider telemetry non-terminal on abort",
      streams: () => [[
        { type: "error", error: providerError("provider interrupted", 502) },
        { type: "abort" }
      ]],
      modelOverride: "openai/gpt-5.4",
      expected: {
        finishReason: "abort",
        stopReasonClass: "aborted",
        providerErrorStatus: 502,
        providerErrorTerminal: false
      }
    }
  ])("$name", async ({ streams, modelOverride, expected, providerFieldsAbsent }) => {
    const { event: finalEvent } = await runChat(streams(), modelOverride);
    expect(finalEvent).toMatchObject(expected);
    if (providerFieldsAbsent) {
      expect(Object.keys(finalEvent).filter((key) => key.startsWith("providerError"))).toEqual([]);
    }
  });
});

describe("demo chat terminal frame", () => {
  // `fullStream` is not contractually required to yield `finish`. When the last
  // model's stream just ends, the turn used to close having emitted no terminal
  // frame at all, leaving the client to infer one from the socket closing.
  it("emits done when the last model's stream ends without finish", async () => {
    const { event, frames } = await runChat(
      [[{ type: "text-delta", text: "answer with no finish part" }]],
      "openai/gpt-5.6-terra"
    );
    expect(frames.at(-1)).toEqual({ type: "done", reason: "incomplete" });
    expect(frames.filter((f) => f.type === "done" || f.type === "error")).toHaveLength(1);
    expect(event).toMatchObject({ finishReason: "none" });
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
      [[{ type: "text-delta", text: "grounded answer" }, finish()]],
      "openai/gpt-5.6-terra"
    );
    expect(frames.filter((f) => f.type === "done" || f.type === "error")).toEqual([
      { type: "done", reason: "stop" }
    ]);
  });
});
