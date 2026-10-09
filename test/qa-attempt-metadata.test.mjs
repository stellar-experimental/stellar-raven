import { describe, expect, it, vi, afterEach } from "vitest";
import { parseAgentResult } from "../eval/qa/agent-result.mjs";
import { buildTranscriptEvidence, createPanelCaseBudget, judgeInputSha256 } from "../eval/qa/judge.mjs";
import {
  agentAttemptRecord,
  collectionAggregates,
  judgeRowWithRetry
} from "../eval/qa/run-qa.mjs";
import {
  createRemoteIdentityGuard,
  REMOTE_IDENTITY_VECTOR_SCHEMA,
  remoteIdentityVectorSha256,
  runRemoteIdentityGuardedCall
} from "../eval/qa/remote-identity-guard.mjs";
import { createSpendLedger, authorizeSpend, recordSpend, spendLedgerRecord } from "../eval/qa/spend-budget.mjs";

const START = Date.parse("2026-10-09T12:00:00.000Z");
const iso = (offset) => new Date(START + offset).toISOString();
const vector = {
  schema: REMOTE_IDENTITY_VECTOR_SCHEMA,
  services: {
    scout: { openapiVersion: "test", canonicalOpenapiSha256: "1".repeat(64) },
    lumenloop: { advertisedContractIdentity: "test", canonicalInventorySha256: "2".repeat(64) },
    stellarDocs: { indexSettingsSha256: "3".repeat(64), canonicalTitleSetSha256: "4".repeat(64) }
  }
};
const input = {
  id: "fixture",
  question: "Question?",
  golden: { answer: "Answer.", keyFacts: [], avoid: [], notes: "" },
  tags: { freshness: "live-data" },
  candidateAnswer: "Answer.",
  transcript: []
};

function outcome(failure = null) {
  return {
    answer: failure ? "" : "Answer.",
    failure,
    transcript: [],
    inputSha256: "a".repeat(64),
    answerSha256: "b".repeat(64),
    costUsd: 0.1
  };
}

function collection(captures) {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(START);
  const order = [];
  const saved = [];
  const ledger = createSpendLedger(1);
  const guard = createRemoteIdentityGuard({
    probeIdentity: { artifactPath: "fixture", sha256: "a".repeat(64) },
    expectedVectorSha256: remoteIdentityVectorSha256(vector),
    capture: () => {
      order.push("capture");
      vi.setSystemTime(Date.now() + 10);
      const next = captures.shift();
      if (next instanceof Error) throw next;
      return next;
    }
  });
  const run = (id, number, result = outcome()) => {
    const startedAtMs = Date.now();
    return runRemoteIdentityGuardedCall({
      guard,
      context: { id, attempt: number },
      authorize: () => {
        order.push("authorize");
        return authorizeSpend(ledger, { method: "agent", id, attempt: number });
      },
      call: () => {
        order.push("call");
        vi.setSystemTime(Date.now() + 20);
        return result;
      },
      onCompleted: (completed) => {
        order.push("save");
        saved.push({ id, ...agentAttemptRecord(completed, number, startedAtMs, Date.now()) });
      },
      recordSpend: (authorization, completed) => {
        order.push("spend");
        recordSpend(ledger, authorization, completed.costUsd);
      }
    });
  };
  return { guard, run, saved, order, ledger };
}

afterEach(() => vi.useRealTimers());

describe("QA attempt timestamps and identity capture links", () => {
  it("saves a successful attempt with the existing duration and call order", () => {
    const f = collection([vector, vector, vector]);
    f.run("fixture", 1);
    f.guard.postflight();
    expect(f.saved[0]).toMatchObject({ number: 1, startedAt: iso(0), endedAt: iso(30), durationMs: 30 });
    expect(f.order).toEqual(["authorize", "capture", "call", "save", "spend", "capture", "capture"]);
    expect(f.guard.record().captures).toMatchObject([
      { id: "fixture", attempt: 1, capturedAt: iso(10), phase: "before" },
      { id: "fixture", attempt: 1, capturedAt: iso(40), phase: "after" },
      { id: null, attempt: null, capturedAt: iso(50), phase: "postflight" }
    ]);
    expect(f.ledger.reportedSpendUsd).toBe(0.1);
  });

  it("keeps distinct intervals for a transport retry and the first outcome", () => {
    const f = collection([vector, vector, vector, vector]);
    f.run("fixture", 1, outcome({ class: "transport", retryable: true }));
    f.run("fixture", 2);
    expect(f.saved).toMatchObject([
      { number: 1, failureClass: "transport", startedAt: iso(0), endedAt: iso(30) },
      { number: 2, failureClass: null, startedAt: iso(40), endedAt: iso(70) }
    ]);
    for (const attempt of f.saved) {
      expect(f.guard.record().captures.filter((c) => c.id === attempt.id && c.attempt === attempt.number))
        .toHaveLength(2);
    }
  });

  it("retains the completed interval when an after-call guard fails", () => {
    const f = collection([vector, new Error("probe failed")]);
    expect(() => f.run("fixture", 1)).toThrow(/probe is unavailable/);
    expect(f.saved[0]).toMatchObject({ startedAt: iso(0), endedAt: iso(30), durationMs: 30 });
    expect(f.guard.record().failure).toMatchObject({ id: "fixture", attempt: 1, phase: "after", failedAt: iso(40) });
    expect(f.ledger.reportedSpendUsd).toBe(0.1);
  });

  it("retains partial collection without inventing an attempt after a before-call failure", () => {
    const f = collection([vector, vector, new Error("probe failed")]);
    f.run("first", 1);
    expect(() => f.run("second", 1)).toThrow(/probe is unavailable/);
    f.guard.postflight();
    const rows = [{ id: "first", answer: f.saved[0].answer, agent: f.saved[0].agent,
      attempts: { agent: [f.saved[0]], judge: [] }, verdict: null }];
    const artifact = JSON.parse(JSON.stringify({ rows, guard: f.guard.record() }));
    expect(artifact.rows).toHaveLength(1);
    expect(artifact.rows[0].attempts.agent[0]).toMatchObject({ startedAt: iso(0), endedAt: iso(30) });
    expect(artifact.guard.failure).toMatchObject({ id: "second", attempt: 1, phase: "before", failedAt: iso(50) });
    expect(artifact.guard.postflight.skippedReason).toBe("guard-already-stopped");
    const aggregates = collectionAggregates(rows, [{ id: "first" }, { id: "second" }], { judging: false });
    expect(aggregates.summary).toBeNull();
    expect(aggregates.completeness.missingIds).toEqual(["second"]);
    expect(f.order.filter((event) => event === "call")).toHaveLength(1);
  });
});

function judgeOptions(judge) {
  return {
    judgeModel: "fixture",
    judgePanel: 1,
    judge,
    stabilityRegister: { status: "absent", cases: {} },
    panelBudget: createPanelCaseBudget(0),
    spendLedger: createSpendLedger(1)
  };
}

describe("QA judge attempt metadata", () => {
  it("records method and call intervals across a judge retry", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(START);
    let count = 0;
    const options = judgeOptions(async () => {
      vi.setSystemTime(Date.now() + 20);
      return { score: ++count === 1 ? "error" : "correct", failureClass: count === 1 ? "cli" : null,
        costUsd: 0.1, promptSha256: "fixture" };
    });
    const saved = await judgeRowWithRetry(input, options);
    expect(saved).toMatchObject([
      { number: 1, startedAt: iso(0), endedAt: iso(20),
        calls: [{ startedAt: iso(0), endedAt: iso(20) }] },
      { number: 2, startedAt: iso(20), endedAt: iso(40),
        calls: [{ startedAt: iso(20), endedAt: iso(40) }] }
    ]);
    expect(options.spendLedger.reportedSpendUsd).toBe(0.2);
  });

  it("keeps the timeout class beside the budget stop on the stored row verdict", async () => {
    const options = judgeOptions(async () => ({ score: "error", failureClass: "timeout", costUsd: null }));
    let failure;
    try {
      await judgeRowWithRetry(input, options);
    } catch (error) {
      failure = error;
    }
    const attempt = failure.judgeAttempt;
    const row = JSON.parse(JSON.stringify({ verdict: attempt.verdict, attempts: { judge: [attempt] } }));
    expect(row.verdict).toMatchObject({ score: "error", failureClass: "budget-cost", originalFailureClass: "timeout" });
    expect(row.attempts.judge[0].calls[0].failureClass).toBe("timeout");
    expect(Date.parse(attempt.startedAt)).toBeLessThanOrEqual(Date.parse(attempt.endedAt));
    expect(spendLedgerRecord(options.spendLedger).missingCosts).toBe(1);
  });
});

function assistant(content, usage) {
  return { type: "assistant", message: { content, ...(usage ? { usage } : {}) } };
}
function tool(id) {
  return { type: "tool_use", id, name: "mcp__raven__execute", input: { code: "return {};" } };
}
function parse(messages) {
  return parseAgentResult({ stdout: messages.map((message) => JSON.stringify(message)).join("\n"), status: 0 });
}

describe("QA assistant-turn boundaries", () => {
  it("separates single tool calls and counts text-only messages without usage", () => {
    const parsed = parse([
      assistant([tool("one")], { input_tokens: 1, output_tokens: 1 }),
      assistant([{ type: "text", text: "Continue." }]),
      assistant([tool("two")], { input_tokens: 2, output_tokens: 2 })
    ]);
    expect(parsed.transcript.map((entry) => entry.assistantTurn)).toEqual([1, 3]);
    expect(parsed.usage.perTurn.map((entry) => entry.turn)).toEqual([1, 3]);
  });

  it("groups several tool calls in one turn and resets for a new attempt", () => {
    const messages = [assistant([tool("one"), tool("two"), tool("three")]), assistant([tool("four")])];
    expect(parse(messages).transcript.map((entry) => entry.assistantTurn)).toEqual([1, 1, 1, 2]);
    expect(parse([assistant([tool("retry")])]).transcript[0].assistantTurn).toBe(1);
  });

  it("preserves evidence and judge input bytes when turn metadata is absent", () => {
    const transcript = parse([assistant([tool("one"), tool("two")])]).transcript.map((entry) => ({
      ...entry, result: '{"answer":"Answer."}', isError: false
    }));
    const legacy = transcript.map(({ assistantTurn, ...entry }) => entry);
    expect(buildTranscriptEvidence({ ...input, transcript })).toBe(buildTranscriptEvidence({ ...input, transcript: legacy }));
    expect(judgeInputSha256({ ...input, transcript })).toBe(judgeInputSha256({ ...input, transcript: legacy }));
  });
});
