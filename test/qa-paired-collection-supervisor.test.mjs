import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  PAIRED_COLLECTION_DEADLINE_MS,
  PAIRED_COLLECTION_PLAN_SCHEMA,
  PAIRED_COLLECTION_RECEIPT_SCHEMA,
  supervisePairedChildren,
  validatePairedCollectionPlan
} from "../eval/qa/paired-collection-supervisor.mjs";
import { PAIRED_COLLECTION_CONTROL_SCHEMA } from "../eval/qa/paired-collection-control.mjs";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");

class FakeChild extends EventEmitter {
  constructor() {
    super();
    this.sent = [];
    this.killed = [];
  }

  send(message) {
    this.sent.push(message);
  }

  kill(signal) {
    this.killed.push(signal);
  }
}

function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), "qa-paired-supervisor-"));
  const worktrees = {};
  for (const name of ["baselineRunner", "candidateRunner", "baselineServer", "candidateServer"]) {
    worktrees[name] = path.join(root, name);
    mkdirSync(worktrees[name]);
  }
  const ids = ["case-a", "case-b"];
  return {
    root,
    plan: {
      selected: {
        ids,
        idsSha256: sha256(JSON.stringify(ids)),
        contentSha256: "c".repeat(64)
      },
      worktrees
    },
    children: { baseline: new FakeChild(), candidate: new FakeChild() }
  };
}

function message(arm, type, extra = {}) {
  return { schema: PAIRED_COLLECTION_CONTROL_SCHEMA, arm, type, ...extra };
}

function planFixture() {
  const base = fixture();
  const cases = [
    { id: "case-a", question: "A?" },
    { id: "case-b", question: "B?" }
  ];
  const casesBytes = JSON.stringify({ cases });
  const files = {
    runQaSha256: sha256("run-qa"),
    pairedVerdictSha256: sha256("paired-verdict"),
    adapterImplementationSha256: sha256("adapter"),
    remoteIdentityProbeSha256: sha256("probe"),
    stabilityRegisterSha256: sha256("register")
  };
  for (const arm of ["baseline", "candidate"]) {
    const runner = base.plan.worktrees[`${arm}Runner`];
    mkdirSync(path.join(runner, "eval", "qa"), { recursive: true });
    writeFileSync(path.join(runner, "eval", "qa", "cases.json"), casesBytes);
    writeFileSync(path.join(runner, "eval", "qa", "run-qa.mjs"), "run-qa");
    writeFileSync(path.join(runner, "eval", "qa", "paired-verdict.mjs"), "paired-verdict");
    writeFileSync(path.join(runner, "eval", "qa", "exact-old-runtime-adapter.mjs"), "adapter");
    writeFileSync(path.join(runner, "eval", "qa", "probe-remote-identities.mjs"), "probe");
    writeFileSync(path.join(runner, "stability.json"), "register");
  }
  const inputHashes = {
    agentBinarySha256: "a".repeat(64),
    agentEnvironmentSha256: "b".repeat(64),
    judgeBinarySha256: "a".repeat(64),
    judgeEnvironmentSha256: "b".repeat(64),
    remoteIdentityVectorSha256: "d".repeat(64),
    ...files
  };
  const collectionCommand = (arm) => [
    process.execPath,
    "eval/qa/run-qa.mjs",
    "--ids", base.plan.selected.ids.join(","),
    "--no-judge",
    "--paired-control-arm", arm,
    "--max-budget-usd", "80",
    "--expect-agent-binary-sha256", inputHashes.agentBinarySha256,
    "--expect-agent-environment-sha256", inputHashes.agentEnvironmentSha256,
    "--expect-adapter-sha256", inputHashes.adapterImplementationSha256,
    "--remote-identity-probe", "eval/qa/probe-remote-identities.mjs",
    "--expect-remote-identity-probe-sha256", inputHashes.remoteIdentityProbeSha256,
    "--expect-remote-identity-sha256", inputHashes.remoteIdentityVectorSha256,
    "--stability-register", "stability.json",
    "--port", arm === "baseline" ? "8789" : "8788"
  ];
  const judgeCommand = () => [
    process.execPath,
    "eval/qa/run-qa.mjs",
    "--judge-stored", "{artifact}",
    "--max-budget-usd", "120",
    "--expect-agent-binary-sha256", inputHashes.judgeBinarySha256,
    "--expect-agent-environment-sha256", inputHashes.judgeEnvironmentSha256,
    "--stability-register", "stability.json"
  ];
  base.plan = {
    schema: PAIRED_COLLECTION_PLAN_SCHEMA,
    deadlineMs: PAIRED_COLLECTION_DEADLINE_MS,
    selected: {
      ...base.plan.selected,
      casesFileSha256: sha256(casesBytes),
      contentSha256: sha256(JSON.stringify(cases))
    },
    worktrees: base.plan.worktrees,
    caps: {
      baseline: { collectionUsd: 80, cumulativeUsd: 120 },
      candidate: { collectionUsd: 80, cumulativeUsd: 120 },
      twoArmCumulativeUsd: 240
    },
    concurrentLoad: {
      accepted: true,
      answeringAgents: 2,
      evidence: "free capacity check record"
    },
    comparisonCommand: [
      process.execPath,
      "eval/qa/paired-verdict.mjs",
      "{baselineArtifact}",
      "{candidateArtifact}",
      "--json"
    ],
    arms: Object.fromEntries(["baseline", "candidate"].map((arm) => [arm, {
      collectionCommand: collectionCommand(arm),
      judgeCommand: judgeCommand(),
      inputHashes: { ...inputHashes }
    }]))
  };
  base.inspectWorktree = (worktree) => ({ root: worktree, commonDir: base.root });
  return base;
}

describe("paired QA collection supervisor", () => {
  it("enforces four worktrees and cumulative collection-to-judge caps", () => {
    const { root, plan, inspectWorktree } = planFixture();
    try {
      expect(validatePairedCollectionPlan(plan, { inspectWorktree })).toBe(plan);

      const duplicate = structuredClone(plan);
      duplicate.worktrees.candidateServer = duplicate.worktrees.baselineServer;
      expect(() => validatePairedCollectionPlan(duplicate, { inspectWorktree })).toThrow(
        /four distinct worktrees/
      );

      const resetCap = structuredClone(plan);
      const budgetIndex = resetCap.arms.candidate.judgeCommand.indexOf("--max-budget-usd") + 1;
      resetCap.arms.candidate.judgeCommand[budgetIndex] = "40";
      expect(() => validatePairedCollectionPlan(resetCap, { inspectWorktree })).toThrow(
        /cumulative arm cap/
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("releases each row only after both arms reach the ordered barrier", async () => {
    const { root, plan, children } = fixture();
    try {
      const run = supervisePairedChildren({
        children,
        plan,
        cancellationFile: path.join(root, "cancelled")
      });
      for (const arm of ["baseline", "candidate"]) {
        children[arm].emit("message", message(arm, "ready", {
          runnerWorktree: plan.worktrees[`${arm}Runner`],
          serverWorktree: plan.worktrees[`${arm}Server`],
          selectedIdsSha256: plan.selected.idsSha256,
          selectedContentSha256: plan.selected.contentSha256
        }));
      }
      expect(children.baseline.sent.at(-1).type).toBe("start");
      expect(children.candidate.sent.at(-1).type).toBe("start");

      children.baseline.emit("message", message("baseline", "row-complete", { index: 0, id: "case-a" }));
      expect(children.baseline.sent.at(-1).type).toBe("start");
      children.candidate.emit("message", message("candidate", "row-complete", { index: 0, id: "case-a" }));
      expect(children.baseline.sent.at(-1)).toMatchObject({ type: "continue", index: 0 });
      expect(children.candidate.sent.at(-1)).toMatchObject({ type: "continue", index: 0 });

      for (const arm of ["candidate", "baseline"]) {
        children[arm].emit("message", message(arm, "row-complete", { index: 1, id: "case-b" }));
      }
      children.baseline.emit("message", message("baseline", "postflight-complete"));
      expect(children.baseline.sent.at(-1).type).toBe("continue");
      children.candidate.emit("message", message("candidate", "postflight-complete"));
      expect(children.baseline.sent.at(-1).type).toBe("finalize");
      expect(children.candidate.sent.at(-1).type).toBe("finalize");
      children.baseline.emit("message", message("baseline", "complete", { resultsPath: "/tmp/baseline.json" }));
      children.candidate.emit("message", message("candidate", "complete", { resultsPath: "/tmp/candidate.json" }));
      children.baseline.emit("exit", 0, null);
      children.candidate.emit("exit", 0, null);

      await expect(run).resolves.toEqual({
        schema: PAIRED_COLLECTION_RECEIPT_SCHEMA,
        selectedIdsSha256: plan.selected.idsSha256,
        selectedContentSha256: plan.selected.contentSha256,
        rows: 2,
        artifacts: { baseline: "/tmp/baseline.json", candidate: "/tmp/candidate.json" }
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it.each([
    ["guard stop", "remote-identity-guard"],
    ["budget stop", "budget-exhausted"]
  ])("cancels both arms and produces no receipt after a %s", async (_label, code) => {
    const { root, plan, children } = fixture();
    try {
      const cancellations = [];
      const run = supervisePairedChildren({
        children,
        plan,
        cancellationFile: path.join(root, "cancelled"),
        writeCancellation: (reason) => cancellations.push(reason)
      });
      children.baseline.emit("message", message("baseline", "failed", {
        code,
        message: "stopped"
      }));
      children.baseline.emit("exit", 1, null);
      children.candidate.emit("exit", 1, null);

      await expect(run).rejects.toThrow(code);
      expect(cancellations).toHaveLength(1);
      expect(children.baseline.sent.at(-1).type).toBe("cancel");
      expect(children.candidate.sent.at(-1).type).toBe("cancel");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("cancels and terminates both arms after a child exit", async () => {
    const { root, plan, children } = fixture();
    try {
      const run = supervisePairedChildren({
        children,
        plan,
        cancellationFile: path.join(root, "cancelled")
      });
      children.candidate.emit("exit", 7, null);
      children.baseline.emit("exit", null, "SIGTERM");

      await expect(run).rejects.toThrow(/candidate child exited/);
      expect(children.baseline.killed).toEqual(["SIGTERM"]);
      expect(children.candidate.killed).toEqual(["SIGTERM"]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("cancels and terminates both arms at the four-hour deadline", async () => {
    const { root, plan, children } = fixture();
    try {
      let deadline;
      let delay;
      const run = supervisePairedChildren({
        children,
        plan,
        cancellationFile: path.join(root, "cancelled"),
        setTimer: (callback, timeout) => {
          deadline = callback;
          delay = timeout;
          return 1;
        },
        clearTimer: () => {}
      });
      expect(delay).toBe(PAIRED_COLLECTION_DEADLINE_MS);
      deadline();
      children.baseline.emit("exit", null, "SIGTERM");
      children.candidate.emit("exit", null, "SIGTERM");

      await expect(run).rejects.toThrow(/four-hour deadline/);
      expect(children.baseline.killed).toEqual(["SIGTERM"]);
      expect(children.candidate.killed).toEqual(["SIGTERM"]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
