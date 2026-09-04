import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  PAIRED_COLLECTION_DEADLINE_MS,
  PAIRED_COLLECTION_PLAN_SCHEMA,
  PAIRED_COLLECTION_RECEIPT_SCHEMA,
  pairedCollectionPlanSha256,
  supervisePairedChildren,
  validatePairedCollectionPlan
} from "../eval/qa/paired-collection-supervisor.mjs";
import { PAIRED_COLLECTION_CONTROL_SCHEMA } from "../eval/qa/paired-collection-control.mjs";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const devVarsPairs = [["ALPHA", "one"], ["ZETA", "two"]];

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

function setFlag(command, flag, value) {
  command[command.indexOf(flag) + 1] = value;
}

function removeFlag(command, flag) {
  const index = command.indexOf(flag);
  command.splice(index, 2);
}

function sendReadiness(plan, children, arm) {
  children[arm].emit("message", message(arm, "ready", {
    runnerWorktree: plan.worktrees[`${arm}Runner`],
    serverWorktree: plan.worktrees[`${arm}Server`],
    selectedIdsSha256: plan.selected.idsSha256,
    selectedContentSha256: plan.selected.contentSha256
  }));
}

function reachFinalBarrier(plan, children) {
  for (const arm of ["baseline", "candidate"]) sendReadiness(plan, children, arm);
  for (let index = 0; index < plan.selected.ids.length; index += 1) {
    for (const arm of ["baseline", "candidate"]) {
      children[arm].emit("message", message(arm, "row-complete", {
        index,
        id: plan.selected.ids[index]
      }));
    }
  }
  for (const arm of ["baseline", "candidate"]) {
    children[arm].emit("message", message(arm, "postflight-complete"));
  }
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
    stabilityRegisterSha256: sha256("register"),
    pairedCollectionSupervisorSha256: sha256("supervisor"),
    pairedCollectionControlSha256: sha256("control")
  };
  for (const arm of ["baseline", "candidate"]) {
    const runner = base.plan.worktrees[`${arm}Runner`];
    mkdirSync(path.join(runner, "eval", "qa"), { recursive: true });
    writeFileSync(path.join(runner, "eval", "qa", "cases.json"), casesBytes);
    writeFileSync(path.join(runner, "eval", "qa", "run-qa.mjs"), "run-qa");
    writeFileSync(path.join(runner, "eval", "qa", "paired-verdict.mjs"), "paired-verdict");
    writeFileSync(path.join(runner, "eval", "qa", "paired-collection-supervisor.mjs"), "supervisor");
    writeFileSync(path.join(runner, "eval", "qa", "paired-collection-control.mjs"), "control");
    writeFileSync(path.join(runner, "eval", "qa", "exact-old-runtime-adapter.mjs"), "adapter");
    writeFileSync(path.join(runner, "eval", "qa", "probe-remote-identities.mjs"), "probe");
    writeFileSync(path.join(runner, "stability.json"), "register");
    writeFileSync(path.join(base.plan.worktrees[`${arm}Server`], ".dev.vars"), "ZETA=two\nALPHA=one\n");
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
    "--variant", "A",
    "--surface", "search-execute",
    "--search-tool", "search",
    "--model", "answer-model",
    "--judge-model", "judge-model",
    "--max-panel-cases", "34",
    "--server-revision", arm === "baseline" ? "b".repeat(40) : "d".repeat(40),
    "--expect-sha256", arm === "baseline" ? "1".repeat(64) : "2".repeat(64),
    "--adapter-mode", arm === "baseline" ? "add-missing" : "verify-native",
    "--adapter-revision", "a".repeat(40),
    "--expect-agent-binary-sha256", inputHashes.agentBinarySha256,
    "--expect-agent-environment-sha256", inputHashes.agentEnvironmentSha256,
    "--expect-adapter-sha256", inputHashes.adapterImplementationSha256,
    "--remote-identity-probe", "eval/qa/probe-remote-identities.mjs",
    "--expect-remote-identity-probe-sha256", inputHashes.remoteIdentityProbeSha256,
    "--expect-remote-identity-sha256", inputHashes.remoteIdentityVectorSha256,
    "--stability-register", "stability.json",
    "--port", arm === "baseline" ? "8789" : "8788",
    "--upstream-port", arm === "baseline" ? "8790" : "8791"
  ];
  const judgeCommand = () => [
    process.execPath,
    "eval/qa/run-qa.mjs",
    "--judge-stored", "{artifact}",
    "--max-budget-usd", "120",
    "--judge-model", "judge-model",
    "--max-panel-cases", "34",
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
    devVars: {
      names: devVarsPairs.map(([name]) => name),
      sha256: sha256(JSON.stringify(devVarsPairs))
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
  base.inspectWorktree = (worktree) => ({
    root: worktree,
    commonDir: base.root,
    revision: worktree === base.plan.worktrees.baselineServer
      ? "b".repeat(40)
      : worktree === base.plan.worktrees.candidateServer
        ? "d".repeat(40)
        : "a".repeat(40)
  });
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
      const artifactPaths = {};
      for (const arm of ["baseline", "candidate"]) {
        const resultsDir = path.join(plan.worktrees[`${arm}Runner`], "eval", "qa", "results");
        mkdirSync(resultsDir, { recursive: true });
        artifactPaths[arm] = path.join(resultsDir, `${arm}.json`);
        writeFileSync(artifactPaths[arm], "{}");
      }
      let clock = 0;
      const run = supervisePairedChildren({
        children,
        plan,
        cancellationFile: path.join(root, "cancelled"),
        now: () => `time-${String(clock++).padStart(3, "0")}`
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
      children.baseline.emit("message", message("baseline", "complete", { resultsPath: artifactPaths.baseline }));
      children.candidate.emit("message", message("candidate", "complete", { resultsPath: artifactPaths.candidate }));
      children.baseline.emit("exit", 0, null);
      children.candidate.emit("exit", 0, null);
      children.baseline.emit("disconnect");
      children.candidate.emit("disconnect");

      await expect(run).resolves.toMatchObject({
        schema: PAIRED_COLLECTION_RECEIPT_SCHEMA,
        planSha256: pairedCollectionPlanSha256(plan),
        selectedIdsSha256: plan.selected.idsSha256,
        selectedContentSha256: plan.selected.contentSha256,
        rows: 2
      });
      const receipt = await run;
      expect(receipt.artifacts).toEqual({
        baseline: realpathSync(artifactPaths.baseline),
        candidate: realpathSync(artifactPaths.candidate)
      });
      expect(receipt.rowTimeline.map((row) => row.firstReleasedArm)).toEqual(["baseline", "candidate"]);
      expect(receipt.rowTimeline[0].releasedAt.baseline < receipt.rowTimeline[0].releasedAt.candidate).toBe(true);
      expect(receipt.rowTimeline[1].releasedAt.candidate < receipt.rowTimeline[1].releasedAt.baseline).toBe(true);
      expect(receipt.rowTimeline.every((row) => Object.values(row.releasedAt).every(Boolean))).toBe(true);
      expect(receipt.rowTimeline.every((row) => Object.values(row.completedAt).every(Boolean))).toBe(true);
      expect(Object.values(receipt.postflightAt).every(Boolean)).toBe(true);
      expect(receipt.collectionStartedAt).toBeTruthy();
      expect(receipt.finishedAt).toBeTruthy();
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
      children.candidate.emit("disconnect");
      children.baseline.emit("exit", null, "SIGTERM");

      await expect(run).rejects.toThrow(/candidate child exited/);
      expect(children.baseline.killed).toEqual(["SIGTERM"]);
      expect(children.candidate.killed).toEqual([]);
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

  it("settles after bounded hard termination when children never exit", async () => {
    const { root, plan, children } = fixture();
    try {
      const timers = [];
      const run = supervisePairedChildren({
        children,
        plan,
        cancellationFile: path.join(root, "cancelled"),
        setTimer: (callback, delay) => {
          timers.push({ callback, delay });
          return timers.length;
        },
        clearTimer: () => {}
      });
      children.baseline.emit("message", message("baseline", "failed", {
        code: "remote-identity-guard",
        message: "stopped"
      }));
      timers.find((timer) => timer.delay === 30_000).callback();
      expect(children.baseline.killed).toEqual(["SIGTERM"]);
      expect(children.candidate.killed).toEqual(["SIGTERM"]);
      timers.find((timer) => timer.delay === 5_000).callback();
      await expect(run).rejects.toThrow(/remote-identity-guard/);
      expect(children.baseline.killed).toEqual(["SIGTERM", "SIGKILL"]);
      expect(children.candidate.killed).toEqual(["SIGTERM", "SIGKILL"]);
      expect(existsSync(path.join(root, "cancelled"))).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("settles when IPC sends and termination fail on closed children", async () => {
    const { root, plan, children } = fixture();
    try {
      const timers = [];
      children.candidate.connected = false;
      children.baseline.send = () => { throw new Error("closed"); };
      const run = supervisePairedChildren({
        children,
        plan,
        cancellationFile: path.join(root, "cancelled"),
        setTimer: (callback, delay) => {
          timers.push({ callback, delay });
          return timers.length;
        },
        clearTimer: () => {},
        terminate: () => { throw new Error("missing process"); }
      });
      children.baseline.emit("error", new Error("failed"));
      timers.find((timer) => timer.delay === 5_000).callback();
      await expect(run).rejects.toThrow(/child error/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("creates one exclusive no-new-spend cancellation marker", async () => {
    const { root, plan, children } = fixture();
    const cancellationFile = path.join(root, "cancelled");
    try {
      const run = supervisePairedChildren({ children, plan, cancellationFile });
      children.baseline.emit("message", message("baseline", "failed", {
        code: "budget-exhausted",
        message: "stopped"
      }));
      expect(existsSync(cancellationFile)).toBe(true);
      expect(readFileSync(cancellationFile, "utf8")).toMatch(/budget-exhausted/);
      expect(() => writeFileSync(cancellationFile, "replacement", { flag: "wx" })).toThrow(/EEXIST/);
      children.baseline.emit("exit", 1, null);
      children.candidate.emit("exit", 1, null);
      await expect(run).rejects.toThrow(/budget-exhausted/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it.each([
    ["malformed readiness", () => ({ ...message("baseline", "ready"), runnerWorktree: 7 })],
    ["readiness realpath failure", () => message("baseline", "ready", {
      runnerWorktree: "/no/such/runner",
      serverWorktree: "/no/such/server",
      selectedIdsSha256: "a",
      selectedContentSha256: "b"
    })],
    ["malformed failure", () => message("baseline", "failed", { code: 7, message: "stopped" })],
    ["malformed IPC", () => null]
  ])("hard-cancels on %s", async (_label, makeMessage) => {
    const { root, plan, children } = fixture();
    try {
      const run = supervisePairedChildren({ children, plan, cancellationFile: path.join(root, "cancelled") });
      children.baseline.emit("message", makeMessage());
      children.baseline.emit("exit", 1, null);
      children.candidate.emit("exit", 1, null);
      await expect(run).rejects.toThrow(/protocol failure/);
      expect(children.baseline.killed).toContain("SIGTERM");
      expect(children.candidate.killed).toContain("SIGTERM");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it.each([
    ["duplicate readiness", (plan, children) => {
      sendReadiness(plan, children, "baseline");
      sendReadiness(plan, children, "baseline");
    }],
    ["wrong row index", (plan, children) => {
      for (const arm of ["baseline", "candidate"]) sendReadiness(plan, children, arm);
      children.baseline.emit("message", message("baseline", "row-complete", { index: 1, id: "case-b" }));
    }],
    ["wrong row ID", (plan, children) => {
      for (const arm of ["baseline", "candidate"]) sendReadiness(plan, children, arm);
      children.baseline.emit("message", message("baseline", "row-complete", { index: 0, id: "wrong" }));
    }],
    ["row before readiness", (_plan, children) => {
      children.baseline.emit("message", message("baseline", "row-complete", { index: 0, id: "case-a" }));
    }],
    ["early complete", (_plan, children) => {
      children.baseline.emit("message", message("baseline", "complete", { resultsPath: "/tmp/result.json" }));
    }]
  ])("rejects %s", async (_label, trigger) => {
    const { root, plan, children } = fixture();
    try {
      const run = supervisePairedChildren({ children, plan, cancellationFile: path.join(root, "cancelled") });
      trigger(plan, children);
      children.baseline.emit("exit", 1, null);
      children.candidate.emit("exit", 1, null);
      await expect(run).rejects.toThrow(/protocol failure/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("accepts completion IPC buffered after exit and before disconnect", async () => {
    const { root, plan, children } = fixture();
    try {
      const run = supervisePairedChildren({
        children,
        plan,
        cancellationFile: path.join(root, "cancelled"),
        validateArtifactPath: (_arm, reportedPath) => reportedPath
      });
      reachFinalBarrier(plan, children);
      children.baseline.emit("exit", 0, null);
      children.baseline.emit("message", message("baseline", "complete", { resultsPath: "/tmp/baseline.json" }));
      children.baseline.emit("disconnect");
      children.candidate.emit("message", message("candidate", "complete", { resultsPath: "/tmp/candidate.json" }));
      children.candidate.emit("exit", 0, null);
      children.candidate.emit("disconnect");
      await expect(run).resolves.toMatchObject({ rows: 2 });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it.each(["absent", "outside"])("hard-cancels when an artifact is %s", async (kind) => {
    const { root, plan, children } = fixture();
    try {
      for (const arm of ["baseline", "candidate"]) {
        mkdirSync(path.join(plan.worktrees[`${arm}Runner`], "eval", "qa", "results"), { recursive: true });
      }
      const reportedPath = path.join(root, `${kind}.json`);
      if (kind === "outside") writeFileSync(reportedPath, "{}");
      const run = supervisePairedChildren({ children, plan, cancellationFile: path.join(root, "cancelled") });
      reachFinalBarrier(plan, children);
      children.baseline.emit("message", message("baseline", "complete", {
        resultsPath: reportedPath
      }));
      children.baseline.emit("exit", 1, null);
      children.candidate.emit("exit", 1, null);
      await expect(run).rejects.toThrow(/protocol failure/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects frozen command mismatches before collection", () => {
    const cases = [
      ["same revisions", (plan) => setFlag(plan.arms.candidate.collectionCommand, "--server-revision", "b".repeat(40))],
      ["same surface hashes", (plan) => setFlag(plan.arms.candidate.collectionCommand, "--expect-sha256", "1".repeat(64))],
      ["server worktree revision mismatch", (plan) => setFlag(plan.arms.baseline.collectionCommand, "--server-revision", "e".repeat(40))],
      ["wrong baseline mode", (plan) => setFlag(plan.arms.baseline.collectionCommand, "--adapter-mode", "verify-native")],
      ["wrong candidate mode", (plan) => setFlag(plan.arms.candidate.collectionCommand, "--adapter-mode", "add-missing")],
      ["runner worktree revision mismatch", (plan) => {
        setFlag(plan.arms.baseline.collectionCommand, "--adapter-revision", "e".repeat(40));
        setFlag(plan.arms.candidate.collectionCommand, "--adapter-revision", "e".repeat(40));
      }],
      ["different shared flag", (plan) => setFlag(plan.arms.candidate.collectionCommand, "--variant", "B")],
      ["different judge flag", (plan) => setFlag(plan.arms.candidate.judgeCommand, "--judge-model", "other")],
      ["duplicate port", (plan) => setFlag(plan.arms.candidate.collectionCommand, "--upstream-port", "8789")],
      ["invalid revision", (plan) => setFlag(plan.arms.baseline.collectionCommand, "--server-revision", "bad")],
      ["invalid surface hash", (plan) => setFlag(plan.arms.baseline.collectionCommand, "--expect-sha256", "bad")],
      ["invalid adapter revision", (plan) => setFlag(plan.arms.baseline.collectionCommand, "--adapter-revision", "bad")],
      ["invalid public port", (plan) => setFlag(plan.arms.baseline.collectionCommand, "--port", "0")],
      ["invalid panel cap", (plan) => setFlag(plan.arms.baseline.collectionCommand, "--max-panel-cases", "none")],
      ["missing shared flag", (plan) => removeFlag(plan.arms.baseline.collectionCommand, "--model")]
    ];
    for (const [label, mutate] of cases) {
      const { root, plan, inspectWorktree } = planFixture();
      try {
        mutate(plan);
        expect(() => validatePairedCollectionPlan(plan, { inspectWorktree }), label).toThrow();
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    }
  });

  it("rejects .dev.vars drift and changed control bytes", () => {
    const first = planFixture();
    try {
      writeFileSync(path.join(first.plan.worktrees.candidateServer, ".dev.vars"), "ALPHA=changed\nZETA=two\n");
      expect(() => validatePairedCollectionPlan(first.plan, { inspectWorktree: first.inspectWorktree })).toThrow(
        /candidate server \.dev\.vars/
      );
    } finally {
      rmSync(first.root, { recursive: true, force: true });
    }
    const second = planFixture();
    try {
      writeFileSync(
        path.join(second.plan.worktrees.baselineRunner, "eval", "qa", "paired-collection-control.mjs"),
        "changed"
      );
      expect(() => validatePairedCollectionPlan(second.plan, { inspectWorktree: second.inspectWorktree })).toThrow(
        /control binaries/
      );
    } finally {
      rmSync(second.root, { recursive: true, force: true });
    }
  });
});
