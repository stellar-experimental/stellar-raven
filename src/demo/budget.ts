/**
 * Cost-control caps and clamp helpers for `/playground`. The
 * real enforcement is in-request (caller wires DEMO_CAPS into `stepCountIs`,
 * the tool `execute:` closures, and the request-size checks); `demoThrottle`
 * is an HONEST best-effort cross-request bucket only — Workers KV has no
 * atomic consume, so concurrent requests can overrun it. That's acceptable
 * because the WorkOS gate already bounds the audience;
 * do not upgrade this to a hard cap without a new design (DO or a
 * Cloudflare rate-limiting product).
 *
 * Pure module except `demoThrottle`, which only touches the KV binding
 * passed in — no cloudflare:workers import, safe under plain Node
 * (test/demo-budget.test.ts uses an in-memory KV fake).
 */

import type { EvidenceRecoveryHint } from "../policy/evidence-checkpoint.ts";
// Throttle lifetime derives from the retention leaf that privacy disclosures
// quote — one source, no independent two-hour literal.
import { RETENTION } from "../auth/retention.ts";

export const DEMO_CAPS = {
  /** stepCountIs(7) — bounded recovery room, with the final step reserved for synthesis. */
  maxSteps: 7,
  /**
   * streamText maxOutputTokens per request. Sized for a reasoning-capable
   * model. Hidden reasoning can consume the output budget before visible
   * text. The KV throttle and gateway rate limit are the aggregate guards.
   */
  maxOutputTokens: 4096,
  /** clampHistory: max replayed messages, oldest dropped first. */
  maxHistoryMessages: 20,
  /** clampHistory: max total content chars across replayed history. */
  maxHistoryChars: 24000,
  /** search tool: input.limit is clamped to this ceiling. */
  maxSearchLimit: 6,
  /** search tool: closure-counted calls allowed per chat turn. */
  maxSearchCallsPerTurn: 3,
  /** execute tool: closure-counted calls allowed per chat turn. */
  maxExecuteCallsPerTurn: 3,
  /** execute tool: input.code length ceiling. */
  maxExecuteCodeChars: 8000,
  /**
   * POST /playground/chat: max chars per user-role message (mirrors the composer's
   * maxlength). Deliberately NOT applied to replayed assistant messages —
   * they can legitimately exceed it, and truncating them corrupts the
   * model's view of its own prior answers; clampHistory bounds the total.
   */
  maxUserMessageChars: 4000,
  /** demoThrottle: chats allowed per subject per fixed UTC-hour bucket. */
  chatsPerHour: 30
} as const;

export type DemoOperationSummary = {
  total: number;
  ok: number;
  error: number;
  softEmpty: number;
};

export type DemoToolBudget = {
  searchCalls: number;
  /** Search calls whose consulted match pool exceeded the returned page. */
  searchTruncatedCalls: number;
  executeCalls: number;
  searchRefusals: number;
  executeRefusals: number;
  unknownServiceSearches: number;
  executeFailures: number;
  executeResultTruncated: number;
  operations: DemoOperationSummary;
  /** Execute calls that produced narrow-only or conditional-alternative advice. */
  recoveryHintedExecutes: number;
  /** One host-prompted hint cycle is allowed per Playground turn. */
  recoveryAdviceDelivered: boolean;
  /** Later hint-bearing executes suppressed after the turn latch is delivered. */
  recoveryAdviceSuppressed: number;
  latestOperations: DemoOperationSummary;
  latestExecuteEvidence:
    | "service-data"
    | "service-inconclusive"
    | "skill-content"
    | "artifact-data"
    | "none"
    | null;
  latestRecoveryHint: EvidenceRecoveryHint | null;
};

function zeroOperationSummary(): DemoOperationSummary {
  return { total: 0, ok: 0, error: 0, softEmpty: 0 };
}

export function createDemoToolBudget(): DemoToolBudget {
  return {
    searchCalls: 0,
    searchTruncatedCalls: 0,
    executeCalls: 0,
    searchRefusals: 0,
    executeRefusals: 0,
    unknownServiceSearches: 0,
    executeFailures: 0,
    executeResultTruncated: 0,
    operations: zeroOperationSummary(),
    recoveryHintedExecutes: 0,
    recoveryAdviceDelivered: false,
    recoveryAdviceSuppressed: 0,
    latestOperations: zeroOperationSummary(),
    latestExecuteEvidence: null,
    latestRecoveryHint: null
  };
}

export const THROTTLE_TTL_SECONDS = RETENTION.demoThrottleSeconds;
const HOUR_MS = 60 * 60 * 1000;

type ThrottleCounter = { count: number };

/**
 * Drop oldest messages beyond `maxHistoryMessages`, then drop oldest
 * (excluding the final message) until total content chars is within
 * `maxHistoryChars`. The final message (the new user turn) is never
 * dropped, even if its content alone exceeds the char cap.
 */
export function clampHistory(
  messages: { role: string; content: string }[]
): { role: string; content: string }[] {
  if (messages.length === 0) return messages;

  let clamped = messages;
  if (clamped.length > DEMO_CAPS.maxHistoryMessages) {
    const keep = Math.max(DEMO_CAPS.maxHistoryMessages, 1);
    clamped = clamped.slice(clamped.length - keep);
  }

  while (clamped.length > 1 && totalChars(clamped) > DEMO_CAPS.maxHistoryChars) {
    clamped = clamped.slice(1);
  }

  return clamped;
}

function totalChars(messages: { role: string; content: string }[]): number {
  return messages.reduce((sum, m) => sum + m.content.length, 0);
}

/**
 * Best-effort per-subject rate limit: a JSON counter in KV keyed by subject
 * and the current UTC-hour bucket, `expirationTtl` 2h (covers the bucket's
 * own hour plus slack for clock skew). Racy by design (read-then-write, no
 * CAS) — concurrent requests in the same hour can both read the same count
 * and both be allowed, overrunning `chatsPerHour` by a small margin. That
 * is an accepted tradeoff, not a bug to fix here.
 */
export async function demoThrottle(
  kv: KVNamespace,
  subject: string
): Promise<{ allowed: boolean; remaining: number }> {
  const hourBucket = Math.floor(Date.now() / HOUR_MS);
  const key = `demo-throttle:${subject}:${hourBucket}`;

  const stored = await kv.get(key);
  const count = stored ? (JSON.parse(stored) as ThrottleCounter).count : 0;

  if (count >= DEMO_CAPS.chatsPerHour) {
    return { allowed: false, remaining: 0 };
  }

  const next = count + 1;
  await kv.put(key, JSON.stringify({ count: next } satisfies ThrottleCounter), {
    expirationTtl: THROTTLE_TTL_SECONDS
  });
  return { allowed: true, remaining: DEMO_CAPS.chatsPerHour - next };
}
