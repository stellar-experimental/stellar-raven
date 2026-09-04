import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
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
  devVarsIdentity,
  pairedCollectionPlanSha256,
  supervisePairedChildren,
  validateAuthorizedPairedCollectionPlan,
  validatePairedCollectionPlan
} from "../eval/qa/paired-collection-supervisor.mjs";
import { PAIRED_COLLECTION_CONTROL_SCHEMA } from "../eval/qa/paired-collection-control.mjs";
import {
  PAIRED_CAPACITY_CONTRACT,
  PAIRED_CAPACITY_SCHEMA
} from "../eval/qa/check-paired-capacity.mjs";
import {
  P6_SELF_TEST_CALL_SCHEMA,
  P6_SELF_TEST_SUMMARY_SCHEMA
} from "../eval/qa/run-p6-judge-self-test.mjs";
import { JUDGE_RUBRIC } from "../eval/qa/judge.mjs";
import { PACK_VERSION } from "../eval/qa/evidence-pack.mjs";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const devVarsPairs = [["ALPHA", "one"], ["ZETA", "two"]];
const DEV_VARS_SALT = "9".repeat(64);
const SERVER_REVISIONS = {
  baseline: "b".repeat(40),
  candidate: "d".repeat(40)
};
const devVarsSha256 = (pairs = devVarsPairs) => sha256(JSON.stringify({
  salt: DEV_VARS_SALT,
  entries: pairs
}));

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
      worktrees,
      arms: Object.fromEntries(["baseline", "candidate"].map((arm) => [arm, {
        collectionCommand: [process.execPath, "eval/qa/run-qa.mjs", "--server-revision", SERVER_REVISIONS[arm]]
      }]))
    },
    children: { baseline: new FakeChild(), candidate: new FakeChild() }
  };
}

function message(arm, type, extra = {}) {
  return { schema: PAIRED_COLLECTION_CONTROL_SCHEMA, arm, type, ...extra };
}

function serverRevision(plan, arm) {
  const command = plan.arms[arm].collectionCommand;
  return command[command.indexOf("--server-revision") + 1];
}

function artifactForPlan(plan, arm, overrides = {}) {
  return {
    ...overrides,
    meta: {
      comparable: true,
      selectedIds: [...plan.selected.ids],
      inputSnapshot: {
        caseIdsSha256: plan.selected.idsSha256,
        casesSha256: plan.selected.contentSha256
      },
      sourceIdentity: {
        serverRevision: serverRevision(plan, arm)
      },
      ...overrides.meta
    },
    rows: overrides.rows ?? plan.selected.ids.map((id) => ({ id }))
  };
}

function setFlag(command, flag, value) {
  command[command.indexOf(flag) + 1] = value;
}

function removeFlag(command, flag) {
  const index = command.indexOf(flag);
  command.splice(index, 2);
}

function rewriteJsonArtifact(filePath, mutate) {
  const value = JSON.parse(readFileSync(filePath, "utf8"));
  mutate(value);
  const bytes = `${JSON.stringify(value, null, 2)}\n`;
  writeFileSync(filePath, bytes);
  return bytes;
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
  const cases = Array.from({ length: 500 }, (_, index) => ({
    id: `case-${String(index).padStart(3, "0")}`,
    question: `${index}?`,
    truth: { lifecycle: { state: "active", reviewState: "none" } }
  }));
  const ids = cases.slice(0, 200).map((item) => item.id);
  const casesBytes = JSON.stringify({ cases });
  const supervisorBytes = readFileSync(path.resolve("eval/qa/paired-collection-supervisor.mjs"));
  const controlBytes = readFileSync(path.resolve("eval/qa/paired-collection-control.mjs"));
  const files = {
    runQaSha256: sha256("run-qa"),
    pairedVerdictSha256: sha256("paired-verdict"),
    adapterImplementationSha256: sha256("adapter"),
    remoteIdentityProbeSha256: sha256("probe"),
    stabilityRegisterSha256: sha256("register"),
    pairedCollectionSupervisorSha256: sha256(supervisorBytes),
    pairedCollectionControlSha256: sha256(controlBytes),
    p6WrapperSha256: sha256("p6-wrapper"),
    p6JudgeSha256: sha256("p6-judge"),
    evidencePackSha256: sha256("evidence-pack"),
    rejudgeSha256: sha256("rejudge")
  };
  const capacityBytes = readFileSync(path.resolve("eval/qa/check-paired-capacity.mjs"));
  for (const arm of ["baseline", "candidate"]) {
    const runner = base.plan.worktrees[`${arm}Runner`];
    mkdirSync(path.join(runner, "eval", "qa"), { recursive: true });
    writeFileSync(path.join(runner, "eval", "qa", "cases.json"), casesBytes);
    writeFileSync(path.join(runner, "eval", "qa", "run-qa.mjs"), "run-qa");
    writeFileSync(path.join(runner, "eval", "qa", "paired-verdict.mjs"), "paired-verdict");
    writeFileSync(path.join(runner, "eval", "qa", "paired-collection-supervisor.mjs"), supervisorBytes);
    writeFileSync(path.join(runner, "eval", "qa", "paired-collection-control.mjs"), controlBytes);
    writeFileSync(path.join(runner, "eval", "qa", "exact-old-runtime-adapter.mjs"), "adapter");
    writeFileSync(path.join(runner, "eval", "qa", "probe-remote-identities.mjs"), "probe");
    writeFileSync(path.join(runner, "eval", "qa", "check-paired-capacity.mjs"), capacityBytes);
    writeFileSync(path.join(runner, "eval", "qa", "run-p6-judge-self-test.mjs"), "p6-wrapper");
    writeFileSync(path.join(runner, "eval", "qa", "judge.mjs"), "p6-judge");
    writeFileSync(path.join(runner, "eval", "qa", "evidence-pack.mjs"), "evidence-pack");
    writeFileSync(path.join(runner, "eval", "qa", "re-judge.mjs"), "rejudge");
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
    "--ids", ids.join(","),
    "--no-judge",
    "--paired-control-arm", arm,
    "--max-budget-usd", "80",
    "--variant", "A",
    "--surface", "search-execute",
    "--search-tool", "search",
    "--model", "answer-model",
    "--judge-model", "judge-model",
    "--max-panel-cases", "34",
    "--server-revision", SERVER_REVISIONS[arm],
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
  const completedAt = new Date().toISOString();
  const capacityService = (responses) => ({
    requests: responses,
    responses,
    successfulResponses: responses,
    httpErrors: 0,
    transportErrors: 0,
    retryEvents: 0,
    retryAfterObserved: 0,
    latency: { count: responses, minMs: 1, p50Ms: 2, p95Ms: 3, maxMs: 3, meanMs: 2 }
  });
  const capacityArtifact = {
    schema: PAIRED_CAPACITY_SCHEMA,
    contract: PAIRED_CAPACITY_CONTRACT,
    startedAt: completedAt,
    completedAt,
    durationMs: 10,
    method: {
      schedule: PAIRED_CAPACITY_CONTRACT.schedule.kind,
      agentsReleasedTogether: 2,
      capturesPerAgent: 1,
      publicRequestPattern: "one committed seven-response remote-identity capture per agent",
      expectedRequestsPerSuccessfulAgent: 7,
      paidModelCalls: 0,
      localServerUsed: false
    },
    observed: {
      maximumActiveFetches: 2,
      requests: 14,
      responses: 14,
      successfulResponses: 14,
      httpErrors: 0,
      transportErrors: 0,
      retries: 0,
      retryAfterObserved: 0,
      responsesByService: { scout: 2, lumenloop: 6, stellarDocs: 6 },
      services: {
        scout: capacityService(2),
        lumenloop: capacityService(6),
        stellarDocs: capacityService(6)
      },
      captureLatency: { count: 2, minMs: 5, p50Ms: 5, p95Ms: 6, maxMs: 6, meanMs: 6 },
      vectorsMatch: true,
      captureWindowsOverlap: true
    },
    agents: [
      {
        agent: "agent-a",
        status: "success",
        captureStartedMonotonicMs: 1,
        captureCompletedMonotonicMs: 10,
        vectorSha256: "f".repeat(64)
      },
      {
        agent: "agent-b",
        status: "success",
        captureStartedMonotonicMs: 2,
        captureCompletedMonotonicMs: 11,
        vectorSha256: "f".repeat(64)
      }
    ],
    accepted: true,
    rejectionReasons: []
  };
  const capacityArtifactPath = path.join(base.root, "capacity.json");
  const capacityArtifactBytes = `${JSON.stringify(capacityArtifact, null, 2)}\n`;
  writeFileSync(capacityArtifactPath, capacityArtifactBytes);
  const p6SummaryArtifactPath = path.join(base.root, "p6-summary.json");
  const p6CallRecords = Array.from({ length: 7 }, (_, index) => ({
    schema: P6_SELF_TEST_CALL_SCHEMA,
    index,
    callNumber: index + 1,
    maxBudgetUsd: 0.5,
    costWithinCap: true,
    costReported: true,
    costUsd: 0.1,
    ok: true,
    gradeMatches: true,
    runnerDirty: false,
    runnerRevision: "a".repeat(40),
    claudePath: "/usr/bin/claude",
    claudeBinarySha256: inputHashes.agentBinarySha256,
    claudeEnvironmentSha256: inputHashes.agentEnvironmentSha256
  }));
  const p6Summary = {
    schema: P6_SELF_TEST_SUMMARY_SCHEMA,
    implementationSha256: files.p6WrapperSha256,
    calls: 7,
    perCallBudgetUsd: 0.5,
    maxAuthorizedCostUsd: 3.5,
    runnerRevision: "a".repeat(40),
    claudePath: "/usr/bin/claude",
    claudeBinarySha256: inputHashes.agentBinarySha256,
    claudeEnvironmentSha256: inputHashes.agentEnvironmentSha256,
    reportedCosts: p6CallRecords.map((record) => record.costUsd),
    missingCosts: [],
    totalCostUsd: 0.7,
    callRecords: p6CallRecords
  };
  writeFileSync(p6SummaryArtifactPath, `${JSON.stringify(p6Summary, null, 2)}\n`);
  base.plan = {
    schema: PAIRED_COLLECTION_PLAN_SCHEMA,
    deadlineMs: PAIRED_COLLECTION_DEADLINE_MS,
    selected: {
      count: 200,
      ids,
      idsSha256: sha256(JSON.stringify(ids)),
      casesFileSha256: sha256(casesBytes),
      contentSha256: sha256(JSON.stringify(cases.slice(0, 200))),
      activeCorpusCount: 500,
      activeCorpusIdsSha256: sha256(JSON.stringify(cases.map((item) => item.id)))
    },
    worktrees: base.plan.worktrees,
    caps: {
      baseline: { collectionUsd: 80, cumulativeUsd: 120 },
      candidate: { collectionUsd: 80, cumulativeUsd: 120 },
      twoArmCumulativeUsd: 240
    },
    capacity: {
      command: [process.execPath, "eval/qa/check-paired-capacity.mjs", "--out", capacityArtifactPath],
      instrumentSha256: sha256(capacityBytes),
      artifactPath: capacityArtifactPath,
      artifactSha256: sha256(capacityArtifactBytes),
      contract: PAIRED_CAPACITY_CONTRACT
    },
    devVars: {
      salt: DEV_VARS_SALT,
      names: devVarsPairs.map(([name]) => name),
      sha256: devVarsSha256()
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
      judgeCommand: judgeCommand().map((value) => value === "{artifact}" ? `{${arm}Artifact}` : value),
      inputHashes: { ...inputHashes }
    }])),
    p6: {
      runnerArm: "baseline",
      command: [
        process.execPath,
        "eval/qa/run-p6-judge-self-test.mjs",
        "--runner-revision", "a".repeat(40),
        "--claude-path", "/usr/bin/claude",
        "--expect-claude-binary-sha256", inputHashes.agentBinarySha256,
        "--expect-claude-environment-sha256", inputHashes.agentEnvironmentSha256,
        "--out", p6SummaryArtifactPath
      ],
      summaryArtifactPath: p6SummaryArtifactPath,
      claudePath: "/usr/bin/claude",
      wrapperSha256: files.p6WrapperSha256,
      judgeSha256: files.p6JudgeSha256,
      calls: 7,
      perCallBudgetUsd: 0.5,
      maxAuthorizedCostUsd: 3.5
    },
    flipRejudge: {
      implementationSha256: files.rejudgeSha256,
      judgeImplementationSha256: files.p6JudgeSha256,
      evidencePackImplementationSha256: files.evidencePackSha256,
      perArmBudgetUsd: 15,
      judgeTuple: {
        model: "judge-model",
        rubric: JUDGE_RUBRIC,
        packVersion: PACK_VERSION,
        judgePanel: 1
      },
      commands: Object.fromEntries(["baseline", "candidate"].map((arm) => {
        const peer = arm === "baseline" ? "candidate" : "baseline";
        return [arm, [
          process.execPath,
          "eval/qa/re-judge.mjs",
          `{${arm}Artifact}`,
          "--flips-vs",
          `{${peer}Artifact}`,
          "--judge-model",
          "judge-model",
          "--claude-path",
          "/usr/bin/claude",
          "--expect-agent-binary-sha256",
          inputHashes.judgeBinarySha256,
          "--expect-agent-environment-sha256",
          inputHashes.judgeEnvironmentSha256,
          "--cases-ref",
          "a".repeat(40),
          "--allow-empty",
          "--max-budget-usd",
          "15"
        ]];
      }))
    }
  };
  base.inspectWorktree = (worktree) => ({
    root: worktree,
    commonDir: base.root,
    revision: worktree === base.plan.worktrees.baselineServer
      ? SERVER_REVISIONS.baseline
      : worktree === base.plan.worktrees.candidateServer
        ? SERVER_REVISIONS.candidate
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
        writeFileSync(artifactPaths[arm], JSON.stringify(artifactForPlan(plan, arm)));
      }
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
      expect(receipt.rowTimeline[0].releaseSequence).toEqual({ baseline: 1, candidate: 2 });
      expect(receipt.rowTimeline[1].releaseSequence).toEqual({ baseline: 4, candidate: 3 });
      expect(receipt.releaseSequence.map(({ sequence, index, arm }) => ({ sequence, index, arm }))).toEqual([
        { sequence: 1, index: 0, arm: "baseline" },
        { sequence: 2, index: 0, arm: "candidate" },
        { sequence: 3, index: 1, arm: "candidate" },
        { sequence: 4, index: 1, arm: "baseline" }
      ]);
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

  it("accepts the production complete-disconnect-exit event order", async () => {
    const { root, plan, children } = fixture();
    try {
      const run = supervisePairedChildren({
        children,
        plan,
        cancellationFile: path.join(root, "cancelled"),
        validateArtifactPath: (_arm, reportedPath) => reportedPath
      });
      reachFinalBarrier(plan, children);
      for (const arm of ["baseline", "candidate"]) {
        children[arm].emit("message", message(arm, "complete", { resultsPath: `/tmp/${arm}.json` }));
        children[arm].emit("disconnect");
        children[arm].emit("exit", 0, null);
      }
      await expect(run).resolves.toMatchObject({ rows: 2 });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("hard-cancels when IPC does not close after child exit", async () => {
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
      children.baseline.emit("exit", 0, null);
      timers.find((timer) => timer.delay === 1_000).callback();
      expect(children.candidate.killed).toEqual(["SIGTERM"]);
      timers.find((timer) => timer.delay === 5_000).callback();
      await expect(run).rejects.toThrow(/IPC did not close after child exit/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("cancels before releasing either arm when a peer channel is closed", async () => {
    const { root, plan, children } = fixture();
    try {
      children.candidate.connected = false;
      const run = supervisePairedChildren({ children, plan, cancellationFile: path.join(root, "cancelled") });
      sendReadiness(plan, children, "baseline");
      sendReadiness(plan, children, "candidate");
      expect(children.baseline.sent.some((item) => item.type === "start")).toBe(false);
      children.baseline.emit("exit", 1, null);
      children.candidate.emit("exit", 1, null);
      await expect(run).rejects.toThrow(/closed before row release/);
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

  it.each([
    ["non-comparable", (artifact) => { artifact.meta.comparable = false; }],
    ["wrong selected digest", (artifact) => { artifact.meta.inputSnapshot.caseIdsSha256 = "0".repeat(64); }],
    ["wrong row IDs", (artifact) => { artifact.rows[0].id = "wrong"; }],
    ["wrong selectedIds", (artifact) => { artifact.meta.selectedIds[0] = "wrong"; }],
    ["missing content identity", (artifact) => { delete artifact.meta.inputSnapshot.casesSha256; }],
    ["wrong content identity", (artifact) => { artifact.meta.inputSnapshot.casesSha256 = "0".repeat(64); }]
  ])("hard-cancels for a %s artifact before receipt", async (_label, mutate) => {
    const { root, plan, children } = fixture();
    try {
      const artifactPaths = {};
      for (const arm of ["baseline", "candidate"]) {
        const resultsDir = path.join(plan.worktrees[`${arm}Runner`], "eval", "qa", "results");
        mkdirSync(resultsDir, { recursive: true });
        artifactPaths[arm] = path.join(resultsDir, `${arm}.json`);
        const artifact = artifactForPlan(plan, arm);
        if (arm === "baseline") mutate(artifact);
        writeFileSync(artifactPaths[arm], JSON.stringify(artifact));
      }
      const run = supervisePairedChildren({ children, plan, cancellationFile: path.join(root, "cancelled") });
      reachFinalBarrier(plan, children);
      children.baseline.emit("message", message("baseline", "complete", {
        resultsPath: artifactPaths.baseline
      }));
      children.baseline.emit("exit", 1, null);
      children.candidate.emit("exit", 1, null);
      await expect(run).rejects.toThrow(/artifact/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it.each(["baseline", "candidate"])(
    "hard-cancels when the %s artifact reports another server revision",
    async (driftedArm) => {
      const { root, plan, children } = fixture();
      try {
        const artifactPaths = {};
        for (const arm of ["baseline", "candidate"]) {
          const resultsDir = path.join(plan.worktrees[`${arm}Runner`], "eval", "qa", "results");
          mkdirSync(resultsDir, { recursive: true });
          artifactPaths[arm] = path.join(resultsDir, `${arm}.json`);
          const artifact = artifactForPlan(plan, arm);
          if (arm === driftedArm) artifact.meta.sourceIdentity.serverRevision = "e".repeat(40);
          writeFileSync(artifactPaths[arm], JSON.stringify(artifact));
        }
        const run = supervisePairedChildren({ children, plan, cancellationFile: path.join(root, "cancelled") });
        reachFinalBarrier(plan, children);
        for (const arm of ["baseline", "candidate"]) {
          children[arm].emit("message", message(arm, "complete", { resultsPath: artifactPaths[arm] }));
          if (arm === driftedArm) break;
        }
        children.baseline.emit("exit", 1, null);
        children.candidate.emit("exit", 1, null);
        await expect(run).rejects.toThrow(new RegExp(`${driftedArm} artifact.*frozen server revision`));
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    }
  );

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

  it("uses one exact sort order for mixed-case .dev.vars names", () => {
    const { root, plan, inspectWorktree } = planFixture();
    try {
      const pairs = [["BETA", "one"], ["alpha", "two"]];
      for (const arm of ["baseline", "candidate"]) {
        writeFileSync(path.join(plan.worktrees[`${arm}Server`], ".dev.vars"), "alpha=two\nBETA=one\n");
      }
      plan.devVars.names = pairs.map(([name]) => name);
      plan.devVars.sha256 = devVarsSha256(pairs);
      expect(devVarsIdentity(plan.worktrees.baselineServer, DEV_VARS_SALT).names).toEqual([
        "BETA",
        "alpha"
      ]);
      expect(validatePairedCollectionPlan(plan, { inspectWorktree })).toBe(plan);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("reports a clear launch-gate error for a missing .dev.vars file", () => {
    const { root, plan, inspectWorktree } = planFixture();
    try {
      rmSync(path.join(plan.worktrees.baselineServer, ".dev.vars"));
      expect(() => validatePairedCollectionPlan(plan, { inspectWorktree })).toThrow(
        /baseline server launch gate: \.dev\.vars is missing or unreadable/
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects control pins that differ from the executing modules", () => {
    const { root, plan, inspectWorktree } = planFixture();
    try {
      for (const arm of ["baseline", "candidate"]) {
        plan.arms[arm].inputHashes.pairedCollectionSupervisorSha256 = "0".repeat(64);
      }
      expect(() => validatePairedCollectionPlan(plan, { inspectWorktree })).toThrow(
        /executing paired collection control bytes/
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects a cases path outside its runner worktree", () => {
    const { root, plan, inspectWorktree } = planFixture();
    try {
      const externalCases = path.join(root, "external-cases.json");
      writeFileSync(externalCases, readFileSync(path.join(plan.worktrees.baselineRunner, "eval", "qa", "cases.json")));
      for (const arm of ["baseline", "candidate"]) {
        plan.arms[arm].collectionCommand.push("--cases", externalCases);
      }
      expect(() => validatePairedCollectionPlan(plan, { inspectWorktree })).toThrow(
        /--cases must resolve inside its runner worktree/
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it.each([
    ["missing", "missing-cases.json"],
    ["unreadable", "eval/qa"]
  ])("reports a clear launch-gate error for a %s cases path", (_label, casesPath) => {
    const { root, plan, inspectWorktree } = planFixture();
    try {
      plan.arms.baseline.collectionCommand.push("--cases", casesPath);
      let error;
      try {
        validatePairedCollectionPlan(plan, { inspectWorktree });
      } catch (caught) {
        error = caught;
      }
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(
        "baseline runner launch gate: --cases is missing or unreadable inside its runner worktree"
      );
      expect(error.message).not.toContain(root);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("requires the per-plan salt for the .dev.vars digest", () => {
    const { root, plan, inspectWorktree } = planFixture();
    try {
      delete plan.devVars.salt;
      expect(() => validatePairedCollectionPlan(plan, { inspectWorktree })).toThrow(/devVars\.salt/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("requires one external authorization for the canonical plan hash", () => {
    const { root, plan } = planFixture();
    try {
      const expected = pairedCollectionPlanSha256(plan);
      expect(validateAuthorizedPairedCollectionPlan(plan, expected)).toBe(expected);
      const reordered = Object.fromEntries(Object.entries(plan).reverse());
      expect(pairedCollectionPlanSha256(reordered)).toBe(expected);
      expect(() => validateAuthorizedPairedCollectionPlan(plan, "0".repeat(64))).toThrow(
        /does not match the canonical plan/
      );
      plan.authorization = { signature: "not allowed inside the plan" };
      expect(() => validateAuthorizedPairedCollectionPlan(
        plan,
        pairedCollectionPlanSha256(plan)
      )).toThrow(/authorization record must stay external/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("requires the authorized hash on the launch command line", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "qa-paired-auth-cli-"));
    try {
      const planPath = path.join(root, "plan.json");
      writeFileSync(planPath, "{}\n");
      const script = path.resolve("eval/qa/paired-collection-supervisor.mjs");
      const printed = spawnSync(process.execPath, [script, "--print-plan-sha256", "--plan", planPath], {
        encoding: "utf8"
      });
      expect(printed.status).toBe(0);
      expect(printed.stdout.trim()).toBe(pairedCollectionPlanSha256({}));

      const missing = spawnSync(process.execPath, [script, "--plan", planPath], { encoding: "utf8" });
      expect(missing.status).toBe(1);
      expect(missing.stderr).toMatch(/--authorized-plan-sha256/);

      const wrong = spawnSync(process.execPath, [
        script,
        "--plan",
        planPath,
        "--authorized-plan-sha256",
        "0".repeat(64)
      ], { encoding: "utf8" });
      expect(wrong.status).toBe(1);
      expect(wrong.stderr).toMatch(/does not match the canonical plan/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it.each([
    ["selected count", (plan) => { plan.selected.count = 199; }, /exactly 200 selected IDs/],
    ["selected list length", (plan) => { plan.selected.ids.pop(); }, /exactly 200 selected IDs/],
    ["selected ID digest", (plan) => { plan.selected.idsSha256 = "0".repeat(64); }, /does not match selected.ids/],
    ["selected content digest", (plan) => { plan.selected.contentSha256 = "0".repeat(64); }, /frozen case hashes/],
    ["cases file digest", (plan) => { plan.selected.casesFileSha256 = "0".repeat(64); }, /frozen case hashes/],
    ["active corpus count", (plan) => { plan.selected.activeCorpusCount = 499; }, /exactly 500 active corpus IDs/],
    ["active corpus digest", (plan) => { plan.selected.activeCorpusIdsSha256 = "0".repeat(64); }, /frozen case hashes/]
  ])("rejects a mismatched corpus field: %s", (_label, mutate, expected) => {
    const { root, plan, inspectWorktree } = planFixture();
    try {
      mutate(plan);
      expect(() => validatePairedCollectionPlan(plan, { inspectWorktree })).toThrow(expected);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it.each([
    ["duplicate corpus ID", (cases) => { cases[499].id = cases[498].id; }, /duplicate corpus IDs/],
    ["inactive corpus row", (cases) => { cases[499].truth.lifecycle.state = "quarantined"; }, /frozen case hashes/],
    ["changed selected content", (cases) => { cases[0].question = "changed"; }, /frozen case hashes/]
  ])("recomputes and rejects %s in a runner worktree", (_label, mutate, expected) => {
    const { root, plan, inspectWorktree } = planFixture();
    try {
      const casesPath = path.join(plan.worktrees.baselineRunner, "eval", "qa", "cases.json");
      const parsed = JSON.parse(readFileSync(casesPath, "utf8"));
      mutate(parsed.cases);
      writeFileSync(casesPath, JSON.stringify(parsed));
      expect(() => validatePairedCollectionPlan(plan, { inspectWorktree })).toThrow(expected);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it.each([
    ["P6 call count", (plan) => { plan.p6.calls = 6; }, /seven calls/],
    ["P6 identity flag", (plan) => setFlag(plan.p6.command, "--runner-revision", "b".repeat(40)), /exact wrapper command/],
    ["P6 wrapper hash", (plan) => { plan.p6.wrapperSha256 = "0".repeat(64); }, /p6 wrapper does not match/],
    ["P6 judge hash", (plan) => { plan.p6.judgeSha256 = "0".repeat(64); }, /p6 judge implementation does not match/],
    ["flip source order", (plan) => {
      [plan.flipRejudge.commands.baseline[2], plan.flipRejudge.commands.baseline[4]] =
        [plan.flipRejudge.commands.baseline[4], plan.flipRejudge.commands.baseline[2]];
    }, /differs at index 2/],
    ["flip cases reference", (plan) => setFlag(plan.flipRejudge.commands.baseline, "--cases-ref", "b".repeat(40)), /differs at index 14/],
    ["flip judge tuple", (plan) => setFlag(plan.flipRejudge.commands.baseline, "--judge-model", "other"), /differs at index 6/],
    ["flip Claude path", (plan) => setFlag(plan.flipRejudge.commands.baseline, "--claude-path", "/other/claude"), /differs at index 8/],
    ["flip binary identity", (plan) => setFlag(plan.flipRejudge.commands.baseline, "--expect-agent-binary-sha256", "0".repeat(64)), /differs at index 10/],
    ["flip environment identity", (plan) => setFlag(plan.flipRejudge.commands.baseline, "--expect-agent-environment-sha256", "0".repeat(64)), /differs at index 12/],
    ["flip rubric tuple", (plan) => { plan.flipRejudge.judgeTuple.rubric = "other"; }, /judgeTuple/],
    ["flip cap", (plan) => setFlag(plan.flipRejudge.commands.baseline, "--max-budget-usd", "16"), /differs at index 17/],
    ["flip zero-flip flag", (plan) => {
      plan.flipRejudge.commands.baseline.splice(plan.flipRejudge.commands.baseline.indexOf("--allow-empty"), 1);
    }, /differs at index 15/],
    ["re-judge implementation hash", (plan) => { plan.flipRejudge.implementationSha256 = "0".repeat(64); }, /re-judge implementation does not match/]
  ])("rejects an invalid paid-command contract: %s", (_label, mutate, expected) => {
    const { root, plan, inspectWorktree } = planFixture();
    try {
      mutate(plan);
      expect(() => validatePairedCollectionPlan(plan, { inspectWorktree })).toThrow(expected);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("reports safe expected and actual values for the first flip-command difference", () => {
    const { root, plan, inspectWorktree } = planFixture();
    try {
      setFlag(plan.flipRejudge.commands.baseline, "--cases-ref", "b".repeat(40));
      expect(() => validatePairedCollectionPlan(plan, { inspectWorktree })).toThrow(
        `baseline flip re-judge command differs at index 14: expected ${JSON.stringify("a".repeat(40))}, actual ${JSON.stringify("b".repeat(40))}`
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("bounds a long flip-command value in the mismatch diagnostic", () => {
    const { root, plan, inspectWorktree } = planFixture();
    try {
      const longValue = `${"x".repeat(250)}hidden-tail`;
      setFlag(plan.flipRejudge.commands.baseline, "--cases-ref", longValue);
      let message = "";
      try {
        validatePairedCollectionPlan(plan, { inspectWorktree });
      } catch (error) {
        message = error.message;
      }
      expect(message).toContain("differs at index 14");
      expect(message).toContain("(truncated)");
      expect(message).not.toContain("hidden-tail");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects a P6 summary with an internal call above $0.50", () => {
    const { root, plan, inspectWorktree } = planFixture();
    try {
      rewriteJsonArtifact(plan.p6.summaryArtifactPath, (summary) => {
        summary.callRecords[3].costUsd = 0.51;
      });
      expect(() => validatePairedCollectionPlan(plan, { inspectWorktree })).toThrow(
        /does not satisfy the frozen wrapper contract/
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it.each([
    ["command", (plan) => { plan.capacity.command[1] = "wrong.mjs"; }, /exact free capacity check command/],
    ["instrument hash", (plan) => { plan.capacity.instrumentSha256 = "0".repeat(64); }, /executing bytes/],
    ["artifact hash", (plan) => { plan.capacity.artifactSha256 = "0".repeat(64); }, /artifactSha256/],
    ["schedule", (plan) => { plan.capacity.contract.schedule.answeringAgents = 1; }, /fixed paired capacity contract/],
    ["threshold", (plan) => { plan.capacity.contract.thresholds.responses = 13; }, /fixed paired capacity contract/]
  ])("rejects a mismatched capacity binding: %s", (_label, mutate, expected) => {
    const { root, plan, inspectWorktree } = planFixture();
    try {
      plan.capacity.contract = structuredClone(plan.capacity.contract);
      mutate(plan);
      expect(() => validatePairedCollectionPlan(plan, { inspectWorktree })).toThrow(expected);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it.each([
    ["13 responses", (artifact) => { artifact.observed.responses = 13; }, /responses must equal 14/],
    ["one HTTP error", (artifact) => { artifact.observed.httpErrors = 1; }, /httpErrors must equal 0/],
    ["one transport error", (artifact) => { artifact.observed.transportErrors = 1; }, /transportErrors must equal 0/],
    ["one retry", (artifact) => { artifact.observed.retries = 1; }, /retries must equal 0/],
    ["one Retry-After", (artifact) => { artifact.observed.retryAfterObserved = 1; }, /retryAfterObserved must equal 0/],
    ["different vectors", (artifact) => { artifact.observed.vectorsMatch = false; }, /capture vectors differ/],
    ["sequential fetches", (artifact) => { artifact.observed.maximumActiveFetches = 1; }, /real request concurrency/],
    ["non-overlapping captures", (artifact) => { artifact.observed.captureWindowsOverlap = false; }, /capture windows did not overlap/]
  ])("rejects a capacity artifact with %s", (_label, mutate, expected) => {
    const { root, plan, inspectWorktree } = planFixture();
    try {
      const bytes = rewriteJsonArtifact(plan.capacity.artifactPath, mutate);
      plan.capacity.artifactSha256 = sha256(bytes);
      expect(() => validatePairedCollectionPlan(plan, { inspectWorktree })).toThrow(expected);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("accepts the exact 24-hour freshness boundary and rejects one millisecond more", () => {
    const { root, plan, inspectWorktree } = planFixture();
    try {
      const completedAtMs = Date.parse(JSON.parse(readFileSync(plan.capacity.artifactPath)).completedAt);
      expect(PAIRED_CAPACITY_CONTRACT.freshnessMs).toBe(86_400_000);
      expect(validatePairedCollectionPlan(plan, {
        inspectWorktree,
        nowMs: completedAtMs + PAIRED_CAPACITY_CONTRACT.freshnessMs
      })).toBe(plan);
      expect(() => validatePairedCollectionPlan(plan, {
        inspectWorktree,
        nowMs: completedAtMs + PAIRED_CAPACITY_CONTRACT.freshnessMs + 1
      })).toThrow(/must be at most 86400000 ms old/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
