/**
 * DEMO_CAPS + clampHistory + demoThrottle — src/demo/budget.ts. Per design
 * Decision 5, demoThrottle is a documented best-effort bucket (no atomic
 * consume); these tests assert the honest read-then-write behavior, not a
 * hard guarantee.
 */
import { describe, expect, it } from "vitest";
import { DEMO_CAPS, clampHistory, createDemoToolBudget, demoThrottle } from "../src/demo/budget";

// ---------------------------------------------------------------------------
// Stub (same shape as test/auth.test.ts's memoryKv)

function memoryKv(): KVNamespace & { store: Map<string, string>; putCalls: { key: string; options: unknown }[] } {
  const store = new Map<string, string>();
  const putCalls: { key: string; options: unknown }[] = [];
  return {
    store,
    putCalls,
    async get(key: string) {
      return store.get(key) ?? null;
    },
    async put(key: string, value: string, options?: unknown) {
      store.set(key, value);
      putCalls.push({ key, options });
    },
    async delete(key: string) {
      store.delete(key);
    },
    async list() {
      return { keys: [], list_complete: true, cacheStatus: null };
    }
  } as unknown as KVNamespace & { store: Map<string, string>; putCalls: { key: string; options: unknown }[] };
}

function msg(role: string, content: string) {
  return { role, content };
}

describe("DEMO_CAPS", () => {
  it("matches the accepted design's cap values exactly", () => {
    expect(DEMO_CAPS).toEqual({
      maxSteps: 7,
      maxOutputTokens: 4096,
      maxHistoryMessages: 20,
      maxHistoryChars: 24000,
      maxSearchLimit: 6,
      maxSearchCallsPerTurn: 3,
      maxExecuteCallsPerTurn: 3,
      maxExecuteCodeChars: 8000,
      maxUserMessageChars: 4000,
      chatsPerHour: 30
    });
  });
});

describe("createDemoToolBudget", () => {
  it("initializes every per-turn aggregate counter to zero", () => {
    expect(createDemoToolBudget()).toEqual({
      searchCalls: 0,
      searchTruncatedCalls: 0,
      executeCalls: 0,
      searchRefusals: 0,
      executeRefusals: 0,
      unknownServiceSearches: 0,
      executeFailures: 0,
      executeResultTruncated: 0,
      operations: { total: 0, ok: 0, error: 0, softEmpty: 0 },
      recoveryHintedExecutes: 0,
      recoveryAdviceDelivered: false,
      recoveryAdviceSuppressed: 0,
      latestOperations: { total: 0, ok: 0, error: 0, softEmpty: 0 },
      latestExecuteEvidence: null,
      latestRecoveryHint: null
    });
  });

  it("creates distinct aggregate and latest summaries", () => {
    const budget = createDemoToolBudget();
    expect(budget.operations).not.toBe(budget.latestOperations);
  });
});

describe("clampHistory", () => {
  it("returns an empty array unchanged", () => {
    expect(clampHistory([])).toEqual([]);
  });

  it("is a no-op when under both caps", () => {
    const messages = [msg("user", "hi"), msg("assistant", "hello")];
    expect(clampHistory(messages)).toEqual(messages);
  });

  it("drops the oldest messages beyond maxHistoryMessages, keeping the newest N", () => {
    const messages = Array.from({ length: 25 }, (_, i) => msg(i % 2 === 0 ? "user" : "assistant", `m${i}`));
    const clamped = clampHistory(messages);
    expect(clamped).toHaveLength(DEMO_CAPS.maxHistoryMessages);
    expect(clamped[0]).toEqual(msg("assistant", "m5")); // messages 0-4 dropped
    expect(clamped[clamped.length - 1]).toEqual(msg("user", "m24"));
  });

  it("after the count cap, drops oldest again to satisfy the char cap", () => {
    const big = "x".repeat(DEMO_CAPS.maxHistoryChars); // one message alone hits the char cap
    const messages = [msg("user", "old"), msg("assistant", "older"), msg("user", big)];
    const clamped = clampHistory(messages);
    expect(clamped).toEqual([msg("user", big)]);
  });

  it("never drops the final message even if it alone exceeds the char cap", () => {
    const huge = "x".repeat(DEMO_CAPS.maxHistoryChars + 1000);
    const messages = [msg("user", "context"), msg("user", huge)];
    const clamped = clampHistory(messages);
    expect(clamped).toEqual([msg("user", huge)]);
  });

  it("keeps the newest messages under the char cap and drops only what's needed", () => {
    const chunk = "x".repeat(1000);
    // 30 messages * 1000 chars = 30000 > 24000 cap; expect oldest dropped
    // until the remaining tail fits.
    const messages = Array.from({ length: 30 }, (_, i) => msg("user", `${chunk}${i}`));
    const clamped = clampHistory(messages);
    const total = clamped.reduce((sum, m) => sum + m.content.length, 0);
    expect(total).toBeLessThanOrEqual(DEMO_CAPS.maxHistoryChars);
    // The very last message (newest) must always survive.
    expect(clamped[clamped.length - 1]).toEqual(messages[messages.length - 1]);
  });
});

describe("demoThrottle", () => {
  it("allows the first chat and reports remaining = chatsPerHour - 1", async () => {
    const kv = memoryKv();
    const result = await demoThrottle(kv, "subject-a");
    expect(result).toEqual({ allowed: true, remaining: DEMO_CAPS.chatsPerHour - 1 });
  });

  it("increments the counter across calls within the same hour bucket", async () => {
    const kv = memoryKv();
    await demoThrottle(kv, "subject-b");
    const second = await demoThrottle(kv, "subject-b");
    expect(second).toEqual({ allowed: true, remaining: DEMO_CAPS.chatsPerHour - 2 });
  });

  it("denies once the subject has reached chatsPerHour in the current bucket", async () => {
    const kv = memoryKv();
    for (let i = 0; i < DEMO_CAPS.chatsPerHour; i++) {
      const r = await demoThrottle(kv, "subject-c");
      expect(r.allowed).toBe(true);
    }
    const denied = await demoThrottle(kv, "subject-c");
    expect(denied).toEqual({ allowed: false, remaining: 0 });
  });

  it("keys the counter by subject and hour bucket, and sets a 2h expirationTtl", async () => {
    const kv = memoryKv();
    await demoThrottle(kv, "subject-d");
    const hourBucket = Math.floor(Date.now() / (60 * 60 * 1000));
    expect(kv.store.has(`demo-throttle:subject-d:${hourBucket}`)).toBe(true);
    expect(kv.putCalls[0]?.options).toEqual({ expirationTtl: 2 * 60 * 60 });
  });

  it("keeps separate counters per subject", async () => {
    const kv = memoryKv();
    for (let i = 0; i < DEMO_CAPS.chatsPerHour; i++) await demoThrottle(kv, "subject-e");
    const otherSubject = await demoThrottle(kv, "subject-f");
    expect(otherSubject.allowed).toBe(true);
  });
});
