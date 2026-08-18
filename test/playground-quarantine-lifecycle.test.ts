import { describe, expect, it } from "vitest";
// @ts-expect-error local executable module intentionally exposes a test seam.
import { orchestratePlaygroundRun } from "../scripts/run-playground-semantic-eval.mjs";

const startTree = {
  headRevision: "a".repeat(40),
  dirty: false,
  statusSha256: "a".repeat(64),
  trackedDiffSha256: "b".repeat(64),
  untrackedFilesSha256: "c".repeat(64),
  generationSha256: "start"
};
const changedTree = { ...startTree, generationSha256: "changed" };
const cases = [{ id: "a" }, { id: "b" }];

function harness(
  snapshotTree: () => Promise<any>,
  calls: string[],
  { quarantineWriteError = false, judgeEnabled = true, answer = (item: { id: string }) => ({ answer: `answer:${item.id}` }), verdict = () => ({ score: "pass", costUsd: 0.25 }) }:
    { quarantineWriteError?: boolean; judgeEnabled?: boolean; answer?: (item: { id: string }) => any; verdict?: () => any } = {}
) {
  return orchestratePlaygroundRun({
    cases,
    treeAtStart: startTree,
    startMeta: { fixture: true },
    judgeEnabled,
    snapshotTree,
    runAnswer: async (item: { id: string }) => {
      calls.push(`answer:${item.id}`);
      return answer(item);
    },
    judgeAnswer: async (item: { id: string }) => {
      calls.push(`judge:${item.id}`);
      return verdict();
    },
    makeRow: (item: { id: string }, run: any, verdict: any) => ({ id: item.id, answer: run.answer, verdict }),
    buildNormalArtifact: (rows: any[]) => ({ rows }),
    buildQuarantine: ({ rows, reason, spend }: any) => ({ rows: structuredClone(rows), reason, spend }),
    writeNormalArtifact: async () => calls.push("write:normal"),
    writeQuarantineArtifact: async () => {
      calls.push("write:quarantine");
      if (quarantineWriteError) throw new Error("disk full");
    },
    onAnswerStart: ({ item }: { item: { id: string } }) => calls.push(`start:${item.id}`),
    now: () => "2026-07-14T00:00:00.000Z"
  });
}

describe("playground quarantine lifecycle", () => {
  it("keeps the stable run ordering and writes only the normal artifact", async () => {
    const calls: string[] = [];
    const result = await harness(async () => {
      calls.push("snapshot");
      return startTree;
    }, calls);
    expect(result.kind).toBe("normal");
    expect(calls).toEqual([
      "snapshot", "start:a", "answer:a", "snapshot", "judge:a",
      "snapshot", "start:b", "answer:b", "snapshot", "judge:b",
      "snapshot", "write:normal"
    ]);
  });

  it("quarantines before a judge without spending it or synthesizing a verdict", async () => {
    const calls: string[] = [];
    let snapshots = 0;
    const result: any = await harness(async () => {
      snapshots += 1;
      calls.push(`snapshot:${snapshots}`);
      return snapshots === 2 ? changedTree : startTree;
    }, calls);
    expect(result.kind).toBe("quarantined");
    expect(result.artifact.reason.phase).toBe("before-judge");
    expect(result.artifact.rows).toEqual([{ id: "a", answer: "answer:a", verdict: null }]);
    expect(result.spend.actual).toMatchObject({ answerCallsStarted: 1, judgeCallsStarted: 0 });
    expect(result.spend.caseIdsAttempted).toEqual(["a"]);
    expect(calls).toEqual(["snapshot:1", "start:a", "answer:a", "snapshot:2", "write:quarantine"]);
  });

  it("quarantines a narrow post-spend snapshot failure and stops future calls", async () => {
    const calls: string[] = [];
    let snapshots = 0;
    const result: any = await harness(async () => {
      snapshots += 1;
      calls.push(`snapshot:${snapshots}`);
      if (snapshots === 3) throw new Error("git failed");
      return startTree;
    }, calls);
    expect(result.kind).toBe("quarantined");
    expect(result.artifact.reason).toMatchObject({ code: "generation-check-error", phase: "before-answer" });
    expect(result.spend.actual).toMatchObject({ answerCallsStarted: 1, judgeCallsStarted: 1 });
    expect(result.spend.caseIdsJudged).toEqual(["a"]);
    expect(calls).toEqual(["snapshot:1", "start:a", "answer:a", "snapshot:2", "judge:a", "snapshot:3", "write:quarantine"]);
  });

  it("does not fall back to a normal artifact when quarantine persistence fails", async () => {
    const calls: string[] = [];
    let snapshots = 0;
    await expect(
      harness(async () => {
        snapshots += 1;
        return snapshots === 2 ? changedTree : startTree;
      }, calls, { quarantineWriteError: true })
    ).rejects.toThrow(/disk full/);
    expect(calls).toEqual(["start:a", "answer:a", "write:quarantine"]);
  });

  it("does not write a quarantine when a checkpoint fails before any answer starts", async () => {
    const calls: string[] = [];
    await expect(harness(async () => { throw new Error("git unavailable"); }, calls)).rejects.toThrow(/git unavailable/);
    expect(calls).toEqual([]);
  });

  it("keeps all judge accounting at zero for a no-judge quarantine", async () => {
    const calls: string[] = [];
    let snapshots = 0;
    const result: any = await harness(async () => {
      snapshots += 1;
      return snapshots === 2 ? changedTree : startTree;
    }, calls, { judgeEnabled: false });
    expect(result.spend.actual).toMatchObject({ answerCallsStarted: 1, judgeCallsStarted: 0 });
    expect(result.artifact.rows[0].verdict).toBeNull();
  });

  it("keeps synthetic empty answers unjudged and separates costless paid verdicts", async () => {
    const emptyCalls: string[] = [];
    let emptySnapshots = 0;
    const empty: any = await harness(async () => {
      emptySnapshots += 1;
      return emptySnapshots === 3 ? changedTree : startTree;
    }, emptyCalls, { answer: () => ({ answer: "" }), verdict: () => ({ score: "error" }) });
    expect(empty.spend.actual).toMatchObject({ judgeCallsStarted: 0, reportedJudgeCalls: 0 });
    expect(empty.spend.caseIdsJudged).toEqual([]);
    expect(empty.artifact.rows[0].verdict).toEqual({ score: "error" });

    const costlessCalls: string[] = [];
    let costlessSnapshots = 0;
    const costless: any = await harness(async () => {
      costlessSnapshots += 1;
      return costlessSnapshots === 3 ? changedTree : startTree;
    }, costlessCalls, { verdict: () => ({ score: "error" }) });
    expect(costless.spend.actual).toMatchObject({ judgeCallsStarted: 1, reportedJudgeCalls: 0, reportedJudgeCostUsd: 0 });
    expect(costless.spend.caseIdsJudged).toEqual(["a"]);
  });

  it("does not broaden thrown answer or judge failures into quarantine artifacts", async () => {
    const answerCalls: string[] = [];
    await expect(harness(async () => startTree, answerCalls, { answer: () => { throw new Error("answer failed"); } })).rejects.toThrow(/answer failed/);
    expect(answerCalls).toEqual(["start:a", "answer:a"]);
    const judgeCalls: string[] = [];
    await expect(harness(async () => startTree, judgeCalls, { verdict: () => { throw new Error("judge failed"); } })).rejects.toThrow(/judge failed/);
    expect(judgeCalls).toEqual(["start:a", "answer:a", "judge:a"]);
  });
});
