import { describe, expect, it } from "vitest";
import { APICallError, RetryError } from "ai";
import {
  demoInputTelemetry,
  demoFinalTextTelemetry,
  demoProviderErrorTelemetry,
  demoTerminalProviderErrorTelemetry,
  isMeaningfulDemoOutput,
  sumDemoUsage
} from "../src/demo/output";

describe("isMeaningfulDemoOutput", () => {
  it("does not count liveness-only frames as fallback-suppressing output", () => {
    expect(isMeaningfulDemoOutput({ type: "ready" })).toBe(false);
    expect(isMeaningfulDemoOutput({ type: "thinking", text: "reasoning tail" })).toBe(false);
    expect(isMeaningfulDemoOutput({ type: "done", reason: "stop" })).toBe(false);
    expect(isMeaningfulDemoOutput({ type: "error", message: "provider failed" })).toBe(false);
  });

  it("counts visible text and tool trace frames as useful output", () => {
    expect(isMeaningfulDemoOutput({ type: "token", text: "answer" })).toBe(true);
    expect(isMeaningfulDemoOutput({ type: "tool-start", id: "t1", tool: "search", input: { query: "soroban" } })).toBe(
      true
    );
    expect(isMeaningfulDemoOutput({ type: "tool-result", id: "t1", tool: "search", ok: true, output: { hits: [] } })).toBe(
      true
    );
  });

  it("does not count empty text deltas", () => {
    expect(isMeaningfulDemoOutput({ type: "token", text: "" })).toBe(false);
  });
});

describe("sumDemoUsage", () => {
  it("returns undefined when no model attempt reported usage", () => {
    expect(sumDemoUsage([])).toBeUndefined();
  });

  it("sums token usage across model attempts while preserving unknown fields", () => {
    expect(
      sumDemoUsage([
        {
          inputTokens: 10,
          cacheReadTokens: undefined,
          cacheWriteTokens: 2,
          outputTokens: 20,
          reasoningTokens: 18,
          totalTokens: 30
        },
        {
          inputTokens: 11,
          cacheReadTokens: 4,
          cacheWriteTokens: undefined,
          outputTokens: 21,
          reasoningTokens: 0,
          totalTokens: 32
        }
      ])
    ).toEqual({
      inputTokens: 21,
      cacheReadTokens: 4,
      cacheWriteTokens: 2,
      outputTokens: 41,
      reasoningTokens: 18,
      totalTokens: 62
    });
  });
});

describe("demoFinalTextTelemetry", () => {
  it("records compact final text metadata without logging the full answer", () => {
    const text = `Here is the grounded answer.\n${"x".repeat(220)}`;

    expect(demoFinalTextTelemetry(text, "stop")).toEqual({
      hadFinalText: true,
      answerChars: text.length,
      finalTextChars: text.length,
      endedWithToolCalls: false,
      missingFinalText: false,
      finalNeededButMissing: false,
      budgetExhausted: false,
      stopReasonClass: "complete"
    });
  });

  it("flags unfinished tool-call stops as budget exhaustion with missing final text", () => {
    expect(demoFinalTextTelemetry("", "tool-calls")).toEqual({
      hadFinalText: false,
      answerChars: 0,
      finalTextChars: 0,
      endedWithToolCalls: true,
      missingFinalText: true,
      finalNeededButMissing: true,
      budgetExhausted: true,
      stopReasonClass: "budget-exhausted"
    });
  });

  it("classifies length stops as budget exhaustion even with partial visible text", () => {
    expect(demoFinalTextTelemetry("partial", "length")).toMatchObject({
      hadFinalText: true,
      budgetExhausted: true,
      stopReasonClass: "budget-exhausted"
    });
  });
});

describe("demoInputTelemetry", () => {
  it("records only counts and the subject join hash", async () => {
    const fakeStellarSeed = "SA" + "A".repeat(54);
    const latest = `Can you check ada@example.com and this Stellar secret ${fakeStellarSeed}?`;
    const telemetry = await demoInputTelemetry(
      [
        { role: "user", content: "earlier" },
        { role: "assistant", content: "reply" },
        { role: "user", content: latest }
      ],
      "subject-123"
    );

    expect(telemetry).toMatchObject({
      latestUserChars: latest.length,
      historyMessages: 3,
      historyChars: "earlier".length + "reply".length + latest.length,
      userMessages: 2
    });
    expect(telemetry.subjectHash).toMatch(/^[a-f0-9]{16}$/);
    expect(telemetry).not.toHaveProperty("latestUserHash");
    expect(telemetry).not.toHaveProperty("latestUserPreview");
    expect(JSON.stringify(telemetry)).not.toContain("ada@example.com");
    expect(JSON.stringify(telemetry)).not.toContain(fakeStellarSeed);
  });
});

describe("demoProviderErrorTelemetry", () => {
  it("extracts a nested AI SDK retry status while keeping only flat scrubbed diagnostics", () => {
    const sampleBearer = "abcdef1234567890";
    const apiError = new APICallError({
      message: `429 from provider Authorization: Bearer ${sampleBearer} ${"x".repeat(400)}`,
      url: "https://api.openai.com/v1/responses",
      requestBodyValues: {},
      statusCode: 429,
      responseBody: `raw body ${sampleBearer}`,
      responseHeaders: { authorization: `Bearer ${sampleBearer}` }
    });
    const retryError = new RetryError({
      message: `Failed after 3 attempts. Last error: ${apiError.message}`,
      reason: "maxRetriesExceeded",
      errors: [new Error("first attempt"), new Error("wrapped", { cause: apiError })]
    });

    const telemetry = demoProviderErrorTelemetry(
      retryError,
      "openai/gpt-5.4-mini",
      2
    );

    expect(telemetry).toMatchObject({
      providerErrorName: "AI_RetryError",
      providerErrorStatus: 429,
      providerErrorProvider: "openai",
      providerErrorModel: "openai/gpt-5.4-mini",
      providerErrorAttempt: 2
    });
    expect(telemetry).not.toHaveProperty("providerErrorMessagePreview");
    expect(telemetry).not.toHaveProperty("providerErrorReason");
    expect(JSON.stringify(telemetry)).not.toContain(sampleBearer);
    expect(JSON.stringify(telemetry)).not.toContain("raw body");
    expect(Object.values(telemetry).every((value) => value === null || typeof value !== "object")).toBe(true);
  });

  it("takes the first HTTP status from a mixed AI SDK retry sequence", () => {
    const unauthorized = new APICallError({
      message: "unauthorized",
      url: "https://api.openai.com/v1/responses",
      requestBodyValues: {},
      statusCode: 401
    });
    const rateLimited = new APICallError({
      message: "rate limited",
      url: "https://api.openai.com/v1/responses",
      requestBodyValues: {},
      statusCode: 429
    });
    const retryError = new RetryError({
      message: "mixed retry failures",
      reason: "maxRetriesExceeded",
      errors: [unauthorized, rateLimited, new TypeError("fetch failed")]
    });

    expect(demoProviderErrorTelemetry(retryError, "openai/gpt-5.4", 1))
      .toMatchObject({ providerErrorStatus: 401 });
  });

  it("finds a shallow retry status before a deep statusless first branch exhausts the bound", () => {
    const deepStatusless = {
      cause: { cause: { cause: { cause: { cause: new Error("deep") } } } }
    };
    const error = {
      errors: [deepStatusless, { statusCode: 429 }]
    };

    expect(demoProviderErrorTelemetry(error, "openai/gpt-5.4", 1))
      .toMatchObject({ providerErrorStatus: 429 });
  });

  it("reaches a status exposed only through lastError", () => {
    const error = { lastError: { statusCode: 503 } };

    expect(demoProviderErrorTelemetry(error, "openai/gpt-5.4", 1))
      .toMatchObject({ providerErrorStatus: 503 });
  });

  it("terminates on cyclic provider error wrappers", () => {
    const error: { cause?: unknown } = {};
    error.cause = error;

    expect(demoProviderErrorTelemetry(error, "openai/gpt-5.4", 1))
      .toMatchObject({ providerErrorStatus: null });
  });

  it("emits provider diagnostics for unanswered failures and marks aborts non-provider-terminal", () => {
    const telemetry = demoProviderErrorTelemetry(new Error("failed"), "openai/gpt-5.4", 1);

    expect(demoTerminalProviderErrorTelemetry(telemetry, "complete", true, false)).toBeUndefined();
    expect(demoTerminalProviderErrorTelemetry(telemetry, "provider-error", true, false))
      .toMatchObject({ providerErrorTerminal: true });
    expect(demoTerminalProviderErrorTelemetry(telemetry, "missing-final-text", false, false))
      .toMatchObject({ providerErrorTerminal: true });
    expect(demoTerminalProviderErrorTelemetry(telemetry, "fallback", false, false))
      .toMatchObject({ providerErrorTerminal: true });
    expect(demoTerminalProviderErrorTelemetry(telemetry, "aborted", false, true))
      .toMatchObject({ providerErrorTerminal: false });
  });
});
