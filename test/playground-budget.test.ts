import { describe, expect, it } from "vitest";
// @ts-expect-error executable test seam
import { orchestratePlaygroundRun, parseArgs, exitCodeForRunDisposition } from "../scripts/run-playground-semantic-eval.mjs";
// @ts-expect-error evaluator contract
import { assertNotPlaygroundQuarantine } from "../eval/playground/artifact-contract.mjs";

async function run(cap: number, answerCosts: unknown[], judgeCosts: unknown[], judgeEnabled = true) {
  const calls: unknown[] = [];
  const result = await orchestratePlaygroundRun({
    cases: [{ id: "a" }, { id: "b" }], maxBudgetUsd: cap,
    treeAtStart: { generationSha256: "same" }, startMeta: {}, judgeEnabled,
    snapshotTree: async () => ({ generationSha256: "same" }),
    runAnswer: async (item: any, remaining: number) => {
      calls.push(["answer", item.id, remaining]);
      return { answer: "text", costUsd: answerCosts.shift() };
    },
    judgeAnswer: async (item: any, _run: any, remaining: number) => {
      calls.push(["judge", item.id, remaining]);
      return { score: "correct", costUsd: judgeCosts.shift() };
    },
    makeRow: (item: any, answer: any) => ({ ...item, ...answer }),
    buildNormalArtifact: (rows: any[]) => ({ meta: {}, rows, summary: {} }),
    writeNormalArtifact: async () => {}, writeQuarantineArtifact: async () => {}
  });
  return { ...result, calls };
}

describe("Playground method budget", () => {
  it("requires one spaced decimal cap and rejects duplicates before paid work", () => {
    expect(() => parseArgs(["--confirm-paid"])).toThrow(/exactly one/);
    expect(() => parseArgs(["--max-budget-usd", "1", "--max-budget-usd", "2"])).toThrow(/Duplicate/);
    for (const value of ["NaN", "Infinity", "-1", "1e3"]) {
      expect(() => parseArgs(["--max-budget-usd", value])).toThrow();
    }
    expect(() => parseArgs(["--max-budget-usd=1"])).toThrow();
    expect(parseArgs(["--dry-run"]).maxBudgetUsd).toBeNull();
  });

  it("counts both costs and gives each judge only the remaining dollars", async () => {
    const result = await run(1, [0.2, 0.1], [0.3, 0.4]);
    expect(result.calls).toEqual([["answer", "a", 1], ["judge", "a", 0.8], ["answer", "b", 0.5], ["judge", "b", 0.4]]);
    expect(result.artifact.budget).toMatchObject({ status: "complete", reportedSpendUsd: 1, missingCosts: 0 });
  });

  it("stops the next call at exhaustion and retains the original denominator", async () => {
    const result = await run(0.5, [0.2], [0.3]);
    expect(result.calls).toHaveLength(2);
    expect(result.artifact.budget).toMatchObject({ status: "incomplete", selectedCaseIds: ["a", "b"], incompleteCaseIds: ["b"], unattemptedCaseIds: ["b"] });
    expect(result.artifact.summary).toBeNull();
    expect(exitCodeForRunDisposition(result)).toBe(1);
    expect(() => assertNotPlaygroundQuarantine(result.artifact)).toThrow(/non-promotable/);
  });

  it("retains an answer when exhaustion prevents its judge", async () => {
    const result = await run(0.2, [0.2], []);
    expect(result.calls).toHaveLength(1);
    expect(result.artifact.rows[0].answer).toBe("text");
    expect(result.artifact.budget.incompleteCaseIds).toEqual(["a", "b"]);
  });

  it("invalidates missing costs from either stage, including no-judge runs", async () => {
    for (const result of [await run(1, [undefined], []), await run(1, [0.2], [undefined]), await run(1, [null], [], false)]) {
      expect(result.artifact.budget).toMatchObject({ status: "invalid", error: "missing-reported-cost", missingCosts: 1 });
      expect(result.artifact.summary).toBeNull();
      expect(result.calls.length).toBeLessThanOrEqual(2);
    }
  });

  it("preserves overspend evidence and permits no later calls", async () => {
    const result = await run(0.1, [0.2], []);
    expect(result.calls).toHaveLength(1);
    expect(result.artifact.budget).toMatchObject({ status: "invalid", error: "budget-cost", reportedSpendUsd: 0.2 });
    const zero = await run(0, [], []);
    expect(zero.calls).toEqual([]);
    expect(zero.artifact.budget.unattemptedCaseIds).toEqual(["a", "b"]);
  });
});
