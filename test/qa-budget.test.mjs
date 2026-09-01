import { describe, expect, it } from "vitest";
import { buildJudgeArgs, createPanelCaseBudget } from "../eval/qa/judge.mjs";
import {
  buildAgentSpawn,
  isRetryableAgentFailure,
  judgeRowWithRetry,
  parseRequiredBudgetFlag
} from "../eval/qa/run-qa.mjs";
import {
  BudgetAuthorizationExceededError,
  BudgetExhaustedError,
  MissingReportedCostError,
  authorizeSpend,
  createSpendLedger,
  parseMaxBudgetUsd,
  recordSpend,
  resumeSpendLedger,
  spendLedgerRecord
} from "../eval/qa/spend-budget.mjs";
import { parseArgs as parseRejudgeArgs, rejudgeRows } from "../eval/qa/re-judge.mjs";

const judgeInput = {
  id: "budget-case",
  question: "Question?",
  golden: { answer: "Answer.", keyFacts: [], avoid: [], notes: "" },
  tags: { freshness: "stable" },
  candidateAnswer: "Answer.",
  transcript: []
};

function judgeOptions(judge, spendLedger) {
  return {
    judgeModel: "stub",
    judgePanel: 1,
    judge,
    stabilityRegister: { status: "absent", cases: {} },
    panelBudget: createPanelCaseBudget(0),
    spendLedger
  };
}

describe("QA sequential budget", () => {
  it("parses a finite decimal cap and rejects malformed values", () => {
    expect(parseMaxBudgetUsd(undefined)).toBeNull();
    expect(parseMaxBudgetUsd("1.25")).toBe(1.25);
    expect(parseMaxBudgetUsd(".5")).toBe(0.5);
    for (const value of ["", "-1", "NaN", "Infinity", "1e2"]) {
      expect(() => parseMaxBudgetUsd(value)).toThrow(/max-budget-usd/);
    }
  });

  it("reduces the ledger and stops the next spend", () => {
    const ledger = createSpendLedger(0.3);
    const first = authorizeSpend(ledger, { method: "agent", id: "a", attempt: 1 });
    expect(first.maxBudgetUsd).toBe(0.3);
    recordSpend(ledger, first, 0.1);
    const second = authorizeSpend(ledger, { method: "judge", id: "a", attempt: 1 });
    expect(second.maxBudgetUsd).toBe(0.2);
    recordSpend(ledger, second, 0.2);
    expect(() => authorizeSpend(ledger, { method: "agent", id: "b", attempt: 1 }))
      .toThrow(BudgetExhaustedError);
    expect(spendLedgerRecord(ledger)).toMatchObject({
      claimed: true,
      reportedSpendUsd: 0.3,
      remainingUsd: 0,
      exhausted: true
    });
  });

  it("rejects a missing reported cost only when a cap is claimed", () => {
    const claimed = createSpendLedger(1);
    const authorization = authorizeSpend(claimed, { method: "judge", id: "a", attempt: 1 });
    expect(() => recordSpend(claimed, authorization, null)).toThrow(MissingReportedCostError);
    expect(spendLedgerRecord(claimed)).toMatchObject({ expectedCalls: 1, reportedCalls: 0, missingCosts: 1 });

    const unclaimed = createSpendLedger();
    expect(() => recordSpend(
      unclaimed,
      authorizeSpend(unclaimed, { method: "judge", id: "a", attempt: 1 }),
      null
    )).not.toThrow();
  });

  it("records a provider overspend before it rejects the call", () => {
    const ledger = createSpendLedger(0.1);
    const authorization = authorizeSpend(ledger, { method: "judge", id: "a", attempt: 1 });

    expect(() => recordSpend(ledger, authorization, 0.2)).toThrow(/above its \$0\.1 authorization/);
    expect(spendLedgerRecord(ledger)).toMatchObject({
      reportedSpendUsd: 0.2,
      remainingUsd: 0,
      expectedCalls: 1,
      reportedCalls: 1
    });
  });

  it("restores prior spend and gives a stored resume only the new remainder", () => {
    const first = createSpendLedger(0.25);
    const authorization = authorizeSpend(first, { method: "judge", id: "one", attempt: 1 });
    recordSpend(first, authorization, 0.25);

    const resumed = resumeSpendLedger(0.5, spendLedgerRecord(first));
    expect(authorizeSpend(resumed, { method: "judge", id: "two", attempt: 1 }).maxBudgetUsd).toBe(0.25);
    expect(spendLedgerRecord(resumed)).toMatchObject({
      authorizedUsd: 0.5,
      reportedSpendUsd: 0.25,
      remainingUsd: 0.25,
      expectedCalls: 1
    });
  });

  it("passes only the authorized remainder to answering and judge CLIs", () => {
    const spawn = buildAgentSpawn({
      prompt: "prompt",
      allowedTools: [],
      mcpConfigPath: "/tmp/mcp.json",
      model: "model",
      cwd: "/tmp/qa-budget-cwd",
      maxBudgetUsd: 0.75
    });
    const agentIndex = spawn.args.indexOf("--max-budget-usd");
    expect(spawn.args.slice(agentIndex, agentIndex + 2)).toEqual(["--max-budget-usd", "0.75"]);

    const judgeArgs = buildJudgeArgs({ maxBudgetUsd: 0.25 });
    const judgeIndex = judgeArgs.indexOf("--max-budget-usd");
    expect(judgeArgs.slice(judgeIndex, judgeIndex + 2)).toEqual(["--max-budget-usd", "0.25"]);
  });

  it("requires one budget flag on each paid runner CLI", () => {
    expect(parseRequiredBudgetFlag(["--max-budget-usd", "1.5"])).toBe(1.5);
    expect(() => parseRequiredBudgetFlag([])).toThrow(/requires --max-budget-usd/);
    expect(() => parseRequiredBudgetFlag([
      "--max-budget-usd", "1", "--max-budget-usd", "2"
    ])).toThrow(/exactly once/);
    expect(() => parseRequiredBudgetFlag(["--max-budget-usd=1"])).toThrow(/=<value> is not supported/);

    expect(() => parseRejudgeArgs(["source.json", "--ids", "one"])).toThrow(/requires --max-budget-usd/);
    expect(parseRejudgeArgs(["source.json", "--ids", "one", "--dry-run"]).maxBudgetUsd).toBeNull();
    expect(() => parseRejudgeArgs([
      "source.json", "--ids", "one", "--dry-run",
      "--max-budget-usd", "1", "--max-budget-usd", "2"
    ])).toThrow(/exactly once/);
  });

  it.each([
    ["cli", 2],
    ["parse", 2],
    ["provider-safeguard", 1],
    ["timeout", 1],
    ["consistency", 1]
  ])("applies the one-retry rule to %s", async (failureClass, expectedCalls) => {
    const budgets = [];
    let calls = 0;
    const judge = async (_input, options) => {
      budgets.push(options.maxBudgetUsd);
      calls += 1;
      if (calls === 1) {
        return {
          score: "error",
          failureClass,
          costUsd: 0.1,
          promptSha256: "input-hash",
          consistencyViolations: failureClass === "consistency" ? ["contradiction"] : []
        };
      }
      return { score: "correct", costUsd: 0.2, promptSha256: "input-hash" };
    };
    const ledger = createSpendLedger(1);
    const attempts = await judgeRowWithRetry(judgeInput, judgeOptions(judge, ledger), []);

    expect(calls).toBe(expectedCalls);
    expect(attempts).toHaveLength(expectedCalls);
    expect(attempts[0].inputSha256).toBe("input-hash");
    expect(attempts[0].answerSha256).toHaveLength(64);
    expect(attempts[0].failureClass).toBe(failureClass);
    expect(budgets).toEqual(expectedCalls === 2 ? [1, 0.9] : [1]);
  });

  it("keeps one retry total across stored resumes", async () => {
    let calls = 0;
    const first = {
      number: 1,
      kind: "initial",
      inputSha256: "input-hash",
      answerSha256: "answer-hash",
      failureClass: "cli",
      costUsd: 0.1,
      verdict: { score: "error", failureClass: "cli", costUsd: 0.1 }
    };
    const attempts = [first];
    const judge = async () => {
      calls += 1;
      return { score: "error", failureClass: "parse", costUsd: 0.1, promptSha256: "input-hash" };
    };
    await judgeRowWithRetry(judgeInput, judgeOptions(judge, createSpendLedger()), attempts);
    await judgeRowWithRetry(judgeInput, judgeOptions(judge, createSpendLedger()), attempts);

    expect(calls).toBe(1);
    expect(attempts).toHaveLength(2);
  });

  it("stops a retry when the first judge call exhausts the cap", async () => {
    const attempts = [];
    const judge = async () => ({
      score: "error",
      failureClass: "cli",
      costUsd: 0.2,
      promptSha256: "input-hash"
    });
    await expect(
      judgeRowWithRetry(judgeInput, judgeOptions(judge, createSpendLedger(0.2)), attempts)
    ).rejects.toThrow(BudgetExhaustedError);
    expect(attempts).toHaveLength(1);
  });

  it("preserves a partial judge panel as an ungraded budget failure", async () => {
    const judge = async () => ({
      score: "correct",
      costUsd: 0.1,
      promptSha256: "input-hash"
    });
    let failure;
    try {
      await judgeRowWithRetry(
        judgeInput,
        { ...judgeOptions(judge, createSpendLedger(0.1)), judgePanel: 2 },
        []
      );
    } catch (error) {
      failure = error;
    }

    expect(failure).toBeInstanceOf(BudgetExhaustedError);
    expect(failure.judgeAttempt.calls).toHaveLength(1);
    expect(failure.judgeAttempt.calls[0].verdict.score).toBe("correct");
    expect(failure.judgeAttempt.verdict).toMatchObject({
      score: "error",
      failureClass: "budget-exhausted"
    });
  });

  it("keeps answer retries transport-only", () => {
    expect(isRetryableAgentFailure({ class: "transport", retryable: true })).toBe(true);
    for (const klass of ["provider-safeguard", "timeout", "spawn", "protocol", "agent", "unclassified"]) {
      expect(isRetryableAgentFailure({ class: klass, retryable: false })).toBe(false);
    }
    expect(isRetryableAgentFailure({ class: "transport", retryable: false })).toBe(false);
  });

  it("stops re-judge before the next row and preserves its ID", async () => {
    const selectedRows = ["one", "two"].map((id) => ({
      id,
      answer: "Answer.",
      transcript: [],
      agent: { failure: null },
      verdict: { score: "wrong" }
    }));
    const runState = {};
    const seenBudgets = [];
    const rows = await rejudgeRows({
      selectedRows,
      caseById: new Map(selectedRows.map((row) => [row.id, { ...judgeInput, id: row.id }])),
      judgeModel: "stub",
      judge: async (_input, options) => {
        seenBudgets.push(options.maxBudgetUsd);
        return { score: "correct", costUsd: 0.1, promptSha256: "judge-input" };
      },
      checkpoint: () => {},
      log: () => {},
      spendLedger: createSpendLedger(0.1),
      runState
    });

    expect(rows.map((row) => row.id)).toEqual(["one"]);
    expect(rows[0].attempts.judgeCalls[0]).toMatchObject({
      inputSha256: "judge-input",
      answerSha256: expect.stringMatching(/^[a-f0-9]{64}$/),
      costUsd: 0.1
    });
    expect(seenBudgets).toEqual([0.1]);
    expect(runState.unattemptedIds).toEqual(["two"]);
  });

  it("preserves a partial panel and later IDs when its next call exceeds the cap", async () => {
    const selectedRows = ["one", "two"].map((id) => ({
      id,
      answer: "Answer.",
      transcript: [],
      agent: { failure: null },
      verdict: { score: "wrong" }
    }));
    const runState = {};
    const rows = await rejudgeRows({
      selectedRows,
      caseById: new Map(selectedRows.map((row) => [row.id, { ...judgeInput, id: row.id }])),
      judgeModel: "stub",
      judgePanel: 2,
      judge: async () => ({ score: "correct", costUsd: 0.1, promptSha256: "judge-input" }),
      checkpoint: () => {},
      log: () => {},
      spendLedger: createSpendLedger(0.1),
      runState
    });

    expect(rows.map((row) => row.id)).toEqual(["one"]);
    expect(rows[0].attempts.judgeCalls).toHaveLength(1);
    expect(rows[0].new).toMatchObject({ score: "error", failureClass: "budget-exhausted" });
    expect(rows[0].attempts.judgeCalls[0].verdict).toMatchObject({ score: "correct", costUsd: 0.1 });
    expect(runState.incompleteIds).toEqual(["one"]);
    expect(runState.unattemptedIds).toEqual(["two"]);
  });

  it.each([
    ["missing cost", undefined, MissingReportedCostError],
    ["authorization overspend", 2, BudgetAuthorizationExceededError]
  ])("checkpoints a re-judge %s with incomplete and unattempted IDs", async (_label, costUsd, ErrorClass) => {
    const selectedRows = ["one", "two"].map((id) => ({
      id,
      answer: "Answer.",
      transcript: [],
      agent: { failure: null },
      verdict: { score: "wrong" }
    }));
    const runState = {};
    const checkpoints = [];

    await expect(rejudgeRows({
      selectedRows,
      caseById: new Map(selectedRows.map((row) => [row.id, { ...judgeInput, id: row.id }])),
      judgeModel: "stub",
      judge: async () => ({ score: "correct", costUsd, promptSha256: "judge-input" }),
      checkpoint: (rows) => checkpoints.push({
        rows: structuredClone(rows),
        incompleteIds: [...(runState.incompleteIds ?? [])],
        unattemptedIds: [...(runState.unattemptedIds ?? [])]
      }),
      log: () => {},
      spendLedger: createSpendLedger(1),
      runState
    })).rejects.toThrow(ErrorClass);

    expect(checkpoints.at(-1)).toMatchObject({
      incompleteIds: ["one"],
      unattemptedIds: ["two"]
    });
    expect(checkpoints.at(-1).rows[0].attempts.judgeCalls).toHaveLength(1);
    expect(runState.incompleteIds).toEqual(["one"]);
    expect(runState.unattemptedIds).toEqual(["two"]);
  });
});
