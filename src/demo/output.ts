/**
 * Pure fallback helpers for /playground/chat. Keep this separate from chat.ts so
 * unit tests can cover semantics without importing worker-only modules.
 */
import type { DemoFrame } from "./frames.ts";
import { hashPrefix } from "../observability.ts";

export type DemoUsage = {
  cacheReadTokens: number | undefined;
  cacheWriteTokens: number | undefined;
  inputTokens: number | undefined;
  outputTokens: number | undefined;
  reasoningTokens: number | undefined;
  totalTokens: number | undefined;
};
export type DemoStopReasonClass =
  | "complete"
  | "budget-exhausted"
  | "missing-final-text"
  | "provider-error"
  | "aborted"
  | "fallback"
  | "other";

export type DemoFinalTextTelemetry = {
  hadFinalText: boolean;
  answerChars: number;
  finalTextChars: number;
  endedWithToolCalls: boolean;
  missingFinalText: boolean;
  finalNeededButMissing: boolean;
  budgetExhausted: boolean;
  stopReasonClass: DemoStopReasonClass;
};
export type DemoInputTelemetry = {
  latestUserChars: number;
  historyMessages: number;
  historyChars: number;
  userMessages: number;
  subjectHash: string;
};
export type DemoProviderErrorTelemetry = {
  providerErrorName: string;
  providerErrorStatus: number | null;
  providerErrorProvider: string;
  providerErrorModel: string;
  providerErrorAttempt: number;
};
export type DemoTerminalProviderErrorTelemetry = DemoProviderErrorTelemetry & {
  providerErrorTerminal: boolean;
};

export function isMeaningfulDemoOutput(frame: DemoFrame): boolean {
  switch (frame.type) {
    case "token":
      return frame.text.length > 0;
    case "tool-start":
    case "tool-result":
      return true;
    default:
      return false;
  }
}

function addOptional(a: number | undefined, b: number | undefined): number | undefined {
  if (a === undefined) return b;
  if (b === undefined) return a;
  return a + b;
}

export function sumDemoUsage(reports: DemoUsage[]): DemoUsage | undefined {
  if (reports.length === 0) return undefined;
  return reports.reduce<DemoUsage>(
    (sum, usage) => ({
      cacheReadTokens: addOptional(sum.cacheReadTokens, usage.cacheReadTokens),
      cacheWriteTokens: addOptional(sum.cacheWriteTokens, usage.cacheWriteTokens),
      inputTokens: addOptional(sum.inputTokens, usage.inputTokens),
      outputTokens: addOptional(sum.outputTokens, usage.outputTokens),
      reasoningTokens: addOptional(sum.reasoningTokens, usage.reasoningTokens),
      totalTokens: addOptional(sum.totalTokens, usage.totalTokens)
    }),
    {
      cacheReadTokens: undefined,
      cacheWriteTokens: undefined,
      inputTokens: undefined,
      outputTokens: undefined,
      reasoningTokens: undefined,
      totalTokens: undefined
    }
  );
}

export function demoFinalTextTelemetry(finalText: string, finishReason: string): DemoFinalTextTelemetry {
  const hadFinalText = finalText.trim().length > 0;
  const endedWithToolCalls = finishReason === "tool-calls";
  const missingFinalText = !hadFinalText;
  const budgetExhausted = endedWithToolCalls || finishReason === "length";
  return {
    hadFinalText,
    answerChars: finalText.length,
    finalTextChars: finalText.length,
    endedWithToolCalls,
    missingFinalText,
    finalNeededButMissing: missingFinalText && finishReason !== "empty-fallback",
    budgetExhausted,
    stopReasonClass: classifyDemoStopReason(finishReason, hadFinalText)
  };
}

export async function demoInputTelemetry(
  messages: { role: "user" | "assistant"; content: string }[],
  subject: string
): Promise<DemoInputTelemetry> {
  const latestUser = [...messages].reverse().find((message) => message.role === "user")?.content ?? null;
  return {
    latestUserChars: latestUser?.length ?? 0,
    historyMessages: messages.length,
    historyChars: messages.reduce((sum, message) => sum + message.content.length, 0),
    userMessages: messages.filter((message) => message.role === "user").length,
    subjectHash: await hashPrefix(subject)
  };
}

export function demoProviderErrorTelemetry(
  error: unknown,
  model: string,
  attempt: number
): DemoProviderErrorTelemetry {
  const errorRecord =
    typeof error === "object" && error !== null
      ? (error as { name?: unknown })
      : undefined;
  const name = typeof errorRecord?.name === "string" ? errorRecord.name : typeof error;
  return {
    providerErrorName: name.slice(0, 80),
    providerErrorStatus: providerErrorStatus(error),
    providerErrorProvider: (model.startsWith("@") ? "workers-ai" : (model.split("/", 1)[0] || "unknown")).slice(0, 80),
    providerErrorModel: model.slice(0, 160),
    providerErrorAttempt: attempt
  };
}

export function demoTerminalProviderErrorTelemetry(
  telemetry: DemoProviderErrorTelemetry | undefined,
  stopReasonClass: DemoStopReasonClass,
  hadFinalText: boolean,
  turnAborted: boolean
): DemoTerminalProviderErrorTelemetry | undefined {
  if (!telemetry || (stopReasonClass !== "provider-error" && hadFinalText)) return undefined;
  return {
    ...telemetry,
    providerErrorTerminal: !turnAborted && stopReasonClass !== "aborted"
  };
}

function providerErrorStatus(error: unknown): number | null {
  const seen = new Set<object>();
  let inspected = 0;
  const queue: unknown[] = [error];
  // Six inspections cover one retry wrapper, three attempts, and two nested cause wrappers.
  // A status >=3 levels deep below a wide shallow level is deliberately unreachable within this wrapper-shaped budget.
  for (let index = 0; index < queue.length && inspected < 6; index += 1) {
    const current = queue[index];
    if (typeof current !== "object" || current === null || seen.has(current)) continue;
    seen.add(current);
    inspected += 1;
    const record = current as {
      statusCode?: unknown;
      lastError?: unknown;
      errors?: unknown;
      cause?: unknown;
    };
    if (
      typeof record.statusCode === "number" &&
      Number.isInteger(record.statusCode) &&
      record.statusCode >= 100 &&
      record.statusCode <= 599
    ) {
      return record.statusCode;
    }
    queue.push(
      ...(Array.isArray(record.errors) ? record.errors.slice(0, 3) : []),
      record.lastError,
      record.cause
    );
  }
  return null;
}

function classifyDemoStopReason(finishReason: string, hadFinalText: boolean): DemoStopReasonClass {
  if (finishReason === "stop") return hadFinalText ? "complete" : "missing-final-text";
  if (finishReason === "tool-calls" || finishReason === "length") return "budget-exhausted";
  if (finishReason === "abort") return "aborted";
  if (finishReason === "error" || finishReason === "exception") return "provider-error";
  if (finishReason === "empty-fallback") return "fallback";
  return hadFinalText ? "complete" : "other";
}
