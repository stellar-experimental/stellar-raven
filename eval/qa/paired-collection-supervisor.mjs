#!/usr/bin/env node
import { spawn, execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { PAIRED_COLLECTION_CONTROL_SCHEMA } from "./paired-collection-control.mjs";

export const PAIRED_COLLECTION_PLAN_SCHEMA = "qa-paired-collection-plan-v1";
export const PAIRED_COLLECTION_RECEIPT_SCHEMA = "qa-paired-collection-receipt-v1";
export const PAIRED_COLLECTION_DEADLINE_MS = 4 * 60 * 60 * 1_000;
export const PAIRED_COLLECTION_DRAIN_MS = 30_000;
export const PAIRED_COLLECTION_TERMINATION_GRACE_MS = 5_000;
export const PAIRED_COLLECTION_IPC_DRAIN_MS = 1_000;
const SHA256 = /^[a-f0-9]{64}$/;
const REVISION = /^[a-f0-9]{40}$/;
const ARMS = ["baseline", "candidate"];

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
}

export function pairedCollectionPlanSha256(plan) {
  return sha256(JSON.stringify(canonicalize(plan)));
}

function flagValue(command, flag) {
  const indexes = command.flatMap((value, index) => value === flag ? [index] : []);
  if (indexes.length !== 1 || command[indexes[0] + 1] === undefined ||
      command[indexes[0] + 1].startsWith("--")) {
    throw new Error(`${flag} must occur exactly once in the frozen command`);
  }
  return command[indexes[0] + 1];
}

function optionalFlagValue(command, flag) {
  if (!command.includes(flag)) return null;
  return flagValue(command, flag);
}

function validatePort(value, label) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65_535 || String(port) !== value) {
    throw new Error(`${label} must be an integer from 1 through 65535`);
  }
  return port;
}

function validatePositiveInteger(value, label) {
  if (!/^\d+$/.test(value) || Number(value) < 1) {
    throw new Error(`${label} must be a positive integer`);
  }
}

function inspectGitWorktree(worktree) {
  const root = execFileSync("git", ["-C", worktree, "rev-parse", "--show-toplevel"], {
    encoding: "utf8"
  }).trim();
  const commonDir = execFileSync("git", ["-C", worktree, "rev-parse", "--git-common-dir"], {
    encoding: "utf8"
  }).trim();
  const revision = execFileSync("git", ["-C", worktree, "rev-parse", "HEAD"], {
    encoding: "utf8"
  }).trim();
  return {
    root: realpathSync(root),
    commonDir: realpathSync(path.resolve(worktree, commonDir)),
    revision
  };
}

function devVarsIdentity(worktree) {
  const source = readFileSync(path.join(worktree, ".dev.vars"), "utf8");
  const entries = [];
  const names = new Set();
  for (const [index, sourceLine] of source.split(/\r?\n/).entries()) {
    const line = sourceLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = /^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!match) throw new Error(`${worktree} has malformed .dev.vars line ${index + 1}`);
    if (names.has(match[1])) throw new Error(`${worktree} has duplicate .dev.vars name ${match[1]}`);
    names.add(match[1]);
    entries.push([match[1], match[2]]);
  }
  entries.sort(([left], [right]) => left.localeCompare(right));
  return {
    names: entries.map(([name]) => name),
    sha256: sha256(JSON.stringify(entries))
  };
}

function validateHash(value, label) {
  if (!SHA256.test(value ?? "")) throw new Error(`${label} must be a lowercase SHA-256`);
}

function selectedCasesFromWorktree(worktree, casesPath, selectedIds) {
  const absolutePath = path.resolve(worktree, casesPath);
  const bytes = readFileSync(absolutePath);
  const parsed = JSON.parse(bytes);
  if (!Array.isArray(parsed.cases)) throw new Error(`${absolutePath} has no cases[]`);
  const selected = parsed.cases.filter((item) => selectedIds.includes(item.id));
  if (selected.length !== selectedIds.length || selected.some((item, index) => item.id !== selectedIds[index])) {
    throw new Error(`${worktree} does not reproduce the ordered selected IDs`);
  }
  return { bytes, selected };
}

function validateCommand(plan, arm, kind) {
  const command = plan.arms[arm][`${kind}Command`];
  if (!Array.isArray(command) || command.some((part) => typeof part !== "string") || command.length < 3) {
    throw new Error(`${arm} ${kind}Command must be an exact argument array`);
  }
  if (path.resolve(command[0]) !== path.resolve(process.execPath)) {
    throw new Error(`${arm} ${kind}Command must pin process.execPath`);
  }
  if (kind === "collection") {
    if (!command.includes("--no-judge") || command.includes("--judge-stored")) {
      throw new Error(`${arm} collectionCommand must use --no-judge only`);
    }
    if (command.includes("--sample")) {
      throw new Error(`${arm} collectionCommand must freeze explicit IDs, not a sample size`);
    }
    if (flagValue(command, "--ids") !== plan.selected.ids.join(",")) {
      throw new Error(`${arm} collectionCommand does not contain the frozen ordered IDs`);
    }
    if (flagValue(command, "--paired-control-arm") !== arm) {
      throw new Error(`${arm} collectionCommand does not contain its paired control arm`);
    }
    if (Number(flagValue(command, "--max-budget-usd")) !== plan.caps[arm].collectionUsd) {
      throw new Error(`${arm} collectionCommand does not use its collection cap`);
    }
    const expectedMode = arm === "baseline" ? "add-missing" : "verify-native";
    if (flagValue(command, "--adapter-mode") !== expectedMode) {
      throw new Error(`${arm} collectionCommand must use --adapter-mode ${expectedMode}`);
    }
    if (!REVISION.test(flagValue(command, "--server-revision"))) {
      throw new Error(`${arm} collectionCommand has an invalid server revision`);
    }
    if (!REVISION.test(flagValue(command, "--adapter-revision"))) {
      throw new Error(`${arm} collectionCommand has an invalid adapter revision`);
    }
    validateHash(flagValue(command, "--expect-sha256"), `${arm} expected surface hash`);
    validatePort(flagValue(command, "--port"), `${arm} public port`);
    validatePort(flagValue(command, "--upstream-port"), `${arm} upstream port`);
    if (!["A", "B"].includes(flagValue(command, "--variant").toUpperCase())) {
      throw new Error(`${arm} collectionCommand has an invalid --variant`);
    }
    if (!["search-execute", "per-operation"].includes(flagValue(command, "--surface"))) {
      throw new Error(`${arm} collectionCommand has an invalid --surface`);
    }
    for (const flag of ["--search-tool", "--model", "--judge-model"]) flagValue(command, flag);
    validatePositiveInteger(flagValue(command, "--max-panel-cases"), `${arm} --max-panel-cases`);
    const judgePanel = optionalFlagValue(command, "--judge-panel");
    if (judgePanel !== null && !["2", "3"].includes(judgePanel)) {
      throw new Error(`${arm} collectionCommand has an invalid --judge-panel`);
    }
  } else {
    if (command.includes("--paired-control-arm")) {
      throw new Error(`${arm} judgeCommand must not use paired collection control`);
    }
    if (!command.includes("--judge-stored") || command.includes("--no-judge")) {
      throw new Error(`${arm} judgeCommand must use --judge-stored only`);
    }
    if (flagValue(command, "--judge-stored") !== "{artifact}") {
      throw new Error(`${arm} judgeCommand must freeze {artifact} as its result placeholder`);
    }
    if (Number(flagValue(command, "--max-budget-usd")) !== plan.caps[arm].cumulativeUsd) {
      throw new Error(`${arm} judgeCommand must use its cumulative arm cap`);
    }
    flagValue(command, "--judge-model");
    validatePositiveInteger(flagValue(command, "--max-panel-cases"), `${arm} --max-panel-cases`);
    const judgePanel = optionalFlagValue(command, "--judge-panel");
    if (judgePanel !== null && !["2", "3"].includes(judgePanel)) {
      throw new Error(`${arm} judgeCommand has an invalid --judge-panel`);
    }
  }
  return command;
}

export function validatePairedCollectionPlan(plan, {
  inspectWorktree = inspectGitWorktree,
  readSelectedCases = selectedCasesFromWorktree,
  readDevVarsIdentity = devVarsIdentity
} = {}) {
  if (plan?.schema !== PAIRED_COLLECTION_PLAN_SCHEMA) {
    throw new Error(`paired collection plan must use ${PAIRED_COLLECTION_PLAN_SCHEMA}`);
  }
  if (plan.deadlineMs !== PAIRED_COLLECTION_DEADLINE_MS) {
    throw new Error("paired collection plan must use the four-hour deadline");
  }
  if (!Array.isArray(plan.selected?.ids) || plan.selected.ids.length === 0) {
    throw new Error("paired collection plan requires selected.ids");
  }
  if (plan.selected.ids.some((id) => typeof id !== "string" || !id)) {
    throw new Error("paired collection selected IDs must be non-empty strings");
  }
  if (new Set(plan.selected.ids).size !== plan.selected.ids.length) {
    throw new Error("paired collection selected IDs must be unique");
  }
  validateHash(plan.selected.idsSha256, "selected.idsSha256");
  validateHash(plan.selected.contentSha256, "selected.contentSha256");
  validateHash(plan.selected.casesFileSha256, "selected.casesFileSha256");
  if (sha256(JSON.stringify(plan.selected.ids)) !== plan.selected.idsSha256) {
    throw new Error("selected.idsSha256 does not match selected.ids");
  }

  const worktreePaths = [
    plan.worktrees?.baselineRunner,
    plan.worktrees?.candidateRunner,
    plan.worktrees?.baselineServer,
    plan.worktrees?.candidateServer
  ];
  if (worktreePaths.some((value) => typeof value !== "string" || !value)) {
    throw new Error("paired collection plan requires four worktree paths");
  }
  const identities = worktreePaths.map(inspectWorktree);
  if (new Set(identities.map((item) => item.root)).size !== 4) {
    throw new Error("paired collection requires four distinct worktrees");
  }
  if (new Set(identities.map((item) => item.commonDir)).size !== 1) {
    throw new Error("paired collection worktrees must belong to one repository");
  }
  if (plan.concurrentLoad?.accepted !== true ||
      plan.concurrentLoad?.answeringAgents !== 2 ||
      typeof plan.concurrentLoad?.evidence !== "string" ||
      !plan.concurrentLoad.evidence.trim()) {
    throw new Error("paired collection requires an accepted two-agent capacity record");
  }
  validateHash(plan.devVars?.sha256, "devVars.sha256");
  if (!Array.isArray(plan.devVars?.names) ||
      plan.devVars.names.some((name) => typeof name !== "string") ||
      !plan.devVars.names.every((name, index, names) => index === 0 || names[index - 1] < name)) {
    throw new Error("devVars.names must be a sorted unique name list");
  }
  for (const arm of ARMS) {
    const identity = readDevVarsIdentity(plan.worktrees[`${arm}Server`]);
    if (identity.sha256 !== plan.devVars.sha256 ||
        JSON.stringify(identity.names) !== JSON.stringify(plan.devVars.names)) {
      throw new Error(`${arm} server .dev.vars does not match the frozen identity`);
    }
  }

  for (const arm of ARMS) {
    const cap = plan.caps?.[arm];
    if (!(cap?.collectionUsd > 0) || !(cap?.cumulativeUsd > cap.collectionUsd)) {
      throw new Error(`${arm} caps must increase from collection to cumulative judging`);
    }
    validateCommand(plan, arm, "collection");
    validateCommand(plan, arm, "judge");
    const hashes = plan.arms[arm].inputHashes;
    for (const name of [
      "agentBinarySha256",
      "agentEnvironmentSha256",
      "judgeBinarySha256",
      "judgeEnvironmentSha256",
      "adapterImplementationSha256",
      "remoteIdentityProbeSha256",
      "remoteIdentityVectorSha256",
      "stabilityRegisterSha256",
      "runQaSha256",
      "pairedVerdictSha256",
      "pairedCollectionSupervisorSha256",
      "pairedCollectionControlSha256"
    ]) validateHash(hashes?.[name], `${arm}.inputHashes.${name}`);
    const collection = plan.arms[arm].collectionCommand;
    const judge = plan.arms[arm].judgeCommand;
    if (flagValue(collection, "--expect-agent-binary-sha256") !== hashes.agentBinarySha256 ||
        flagValue(collection, "--expect-agent-environment-sha256") !== hashes.agentEnvironmentSha256 ||
        flagValue(collection, "--expect-adapter-sha256") !== hashes.adapterImplementationSha256 ||
        flagValue(collection, "--expect-remote-identity-probe-sha256") !== hashes.remoteIdentityProbeSha256 ||
        flagValue(collection, "--expect-remote-identity-sha256") !== hashes.remoteIdentityVectorSha256 ||
        flagValue(judge, "--expect-agent-binary-sha256") !== hashes.judgeBinarySha256 ||
        flagValue(judge, "--expect-agent-environment-sha256") !== hashes.judgeEnvironmentSha256) {
      throw new Error(`${arm} command hashes do not match its frozen input hashes`);
    }
    if (hashes.agentBinarySha256 !== hashes.judgeBinarySha256 ||
        hashes.agentEnvironmentSha256 !== hashes.judgeEnvironmentSha256) {
      throw new Error(`${arm} must use one binary and environment pin for collection and judging`);
    }
    const runner = plan.worktrees[`${arm}Runner`];
    const casesPath = collection.includes("--cases") ? flagValue(collection, "--cases") : "eval/qa/cases.json";
    const snapshot = readSelectedCases(runner, casesPath, plan.selected.ids);
    if (sha256(snapshot.bytes) !== plan.selected.casesFileSha256 ||
        sha256(JSON.stringify(snapshot.selected)) !== plan.selected.contentSha256) {
      throw new Error(`${arm} runner does not reproduce the frozen case hashes`);
    }
    const runQaPath = path.resolve(runner, collection[1]);
    if (sha256(readFileSync(runQaPath)) !== hashes.runQaSha256) {
      throw new Error(`${arm} run-qa binary does not match its frozen hash`);
    }
    const pairedVerdictPath = path.resolve(runner, "eval/qa/paired-verdict.mjs");
    if (sha256(readFileSync(pairedVerdictPath)) !== hashes.pairedVerdictSha256) {
      throw new Error(`${arm} paired verdict binary does not match its frozen hash`);
    }
    const supervisorPath = path.resolve(runner, "eval/qa/paired-collection-supervisor.mjs");
    const controlPath = path.resolve(runner, "eval/qa/paired-collection-control.mjs");
    if (sha256(readFileSync(supervisorPath)) !== hashes.pairedCollectionSupervisorSha256 ||
        sha256(readFileSync(controlPath)) !== hashes.pairedCollectionControlSha256) {
      throw new Error(`${arm} paired collection control binaries do not match their frozen hashes`);
    }
    const adapterPath = path.resolve(runner, "eval/qa/exact-old-runtime-adapter.mjs");
    const probePath = path.resolve(runner, flagValue(collection, "--remote-identity-probe"));
    const collectionRegister = path.resolve(runner, flagValue(collection, "--stability-register"));
    const judgeRegister = path.resolve(runner, flagValue(judge, "--stability-register"));
    if (collectionRegister !== judgeRegister) {
      throw new Error(`${arm} collection and judge commands use different stability registers`);
    }
    if (sha256(readFileSync(adapterPath)) !== hashes.adapterImplementationSha256 ||
        sha256(readFileSync(probePath)) !== hashes.remoteIdentityProbeSha256 ||
        sha256(readFileSync(collectionRegister)) !== hashes.stabilityRegisterSha256) {
      throw new Error(`${arm} input files do not match the frozen hashes`);
    }
  }
  if (plan.caps.twoArmCumulativeUsd !==
      plan.caps.baseline.cumulativeUsd + plan.caps.candidate.cumulativeUsd) {
    throw new Error("two-arm cumulative cap must equal both cumulative arm caps");
  }
  const collections = Object.fromEntries(ARMS.map((arm) => [arm, plan.arms[arm].collectionCommand]));
  const judges = Object.fromEntries(ARMS.map((arm) => [arm, plan.arms[arm].judgeCommand]));
  const baselineRevision = flagValue(collections.baseline, "--server-revision");
  const candidateRevision = flagValue(collections.candidate, "--server-revision");
  if (baselineRevision === candidateRevision) {
    throw new Error("baseline and candidate server revisions must differ");
  }
  if (identities[2].revision !== baselineRevision || identities[3].revision !== candidateRevision) {
    throw new Error("server worktrees do not match the frozen exact revisions");
  }
  if (flagValue(collections.baseline, "--expect-sha256") ===
      flagValue(collections.candidate, "--expect-sha256")) {
    throw new Error("baseline and candidate surface hashes must differ");
  }
  if (flagValue(collections.baseline, "--adapter-revision") !==
      flagValue(collections.candidate, "--adapter-revision")) {
    throw new Error("baseline and candidate adapter revisions must match");
  }
  const adapterRevision = flagValue(collections.baseline, "--adapter-revision");
  if (identities[0].revision !== adapterRevision || identities[1].revision !== adapterRevision) {
    throw new Error("runner worktrees do not match the frozen adapter revision");
  }
  const ports = ARMS.flatMap((arm) => [
    validatePort(flagValue(collections[arm], "--port"), `${arm} public port`),
    validatePort(flagValue(collections[arm], "--upstream-port"), `${arm} upstream port`)
  ]);
  if (new Set(ports).size !== 4) {
    throw new Error("paired collection requires four pairwise-distinct ports");
  }
  for (const flag of ["--variant", "--surface", "--search-tool", "--model", "--judge-model", "--max-panel-cases"]) {
    if (flagValue(collections.baseline, flag) !== flagValue(collections.candidate, flag)) {
      throw new Error(`collection commands must share ${flag}`);
    }
  }
  for (const flag of ["--judge-model", "--max-panel-cases", "--judge-panel"]) {
    const expected = optionalFlagValue(collections.baseline, flag);
    for (const arm of ARMS) {
      if (optionalFlagValue(collections[arm], flag) !== expected ||
          optionalFlagValue(judges[arm], flag) !== expected) {
        throw new Error(`collection and judge commands must share ${flag}`);
      }
    }
  }
  const comparison = plan.comparisonCommand;
  if (!Array.isArray(comparison) || comparison.length !== 5 ||
      path.resolve(comparison[0]) !== path.resolve(process.execPath) ||
      comparison[1] !== "eval/qa/paired-verdict.mjs" ||
      comparison[2] !== "{baselineArtifact}" ||
      comparison[3] !== "{candidateArtifact}" ||
      comparison[4] !== "--json") {
    throw new Error("comparisonCommand must freeze the paired JSON comparison");
  }
  for (const name of [
    "agentBinarySha256",
    "agentEnvironmentSha256",
    "judgeBinarySha256",
    "judgeEnvironmentSha256",
    "adapterImplementationSha256",
    "remoteIdentityProbeSha256",
    "remoteIdentityVectorSha256",
    "stabilityRegisterSha256",
    "runQaSha256",
    "pairedVerdictSha256",
    "pairedCollectionSupervisorSha256",
    "pairedCollectionControlSha256"
  ]) {
    if (plan.arms.baseline.inputHashes[name] !== plan.arms.candidate.inputHashes[name]) {
      throw new Error(`cross-arm frozen input hash differs: ${name}`);
    }
  }
  return plan;
}

function cancellationReason(message, arm) {
  const code = message?.code ? ` (${message.code})` : "";
  return `${arm} collection failed${code}: ${message?.message ?? "unknown failure"}`;
}

function artifactPathFromArm(plan, arm, reportedPath) {
  if (typeof reportedPath !== "string" || !reportedPath) {
    throw new Error(`${arm} did not report an artifact path`);
  }
  const resultsRoot = realpathSync(path.join(plan.worktrees[`${arm}Runner`], "eval", "qa", "results"));
  const artifactPath = realpathSync(reportedPath);
  const relative = path.relative(resultsRoot, artifactPath);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative) || !statSync(artifactPath).isFile()) {
    throw new Error(`${arm} artifact must be a file below its runner results directory`);
  }
  return artifactPath;
}

function validControlMessage(message, arm) {
  if (!message || typeof message !== "object" || Array.isArray(message) ||
      message.schema !== PAIRED_COLLECTION_CONTROL_SCHEMA || message.arm !== arm) {
    throw new Error(`${arm} sent malformed paired collection IPC data`);
  }
  if (!["failed", "ready", "row-complete", "postflight-complete", "complete"].includes(message.type)) {
    throw new Error(`${arm} sent an unknown paired collection IPC message`);
  }
}

export function supervisePairedChildren({
  children,
  plan,
  cancellationFile,
  deadlineMs = PAIRED_COLLECTION_DEADLINE_MS,
  drainMs = PAIRED_COLLECTION_DRAIN_MS,
  terminationGraceMs = PAIRED_COLLECTION_TERMINATION_GRACE_MS,
  ipcDrainMs = PAIRED_COLLECTION_IPC_DRAIN_MS,
  setTimer = setTimeout,
  clearTimer = clearTimeout,
  writeCancellation = (reason) => writeFileSync(cancellationFile, `${reason}\n`, { flag: "wx" }),
  terminate = (child, signal) => child.kill(signal),
  validateArtifactPath = (arm, reportedPath) => artifactPathFromArm(plan, arm, reportedPath),
  now = () => new Date().toISOString()
}) {
  return new Promise((resolve, reject) => {
    const state = Object.fromEntries(ARMS.map((arm) => [arm, {
      ready: false,
      row: -1,
      postflight: false,
      complete: null,
      exited: false,
      disconnected: false,
      status: null,
      signal: null,
      ipcDrainTimer: null,
      postflightAt: null,
      finishedAt: null
    }]));
    const receiptTimeline = plan.selected.ids.map((id, index) => ({
      index,
      id,
      firstReleasedArm: index % 2 === 0 ? "baseline" : "candidate",
      releasedAt: { baseline: null, candidate: null },
      completedAt: { baseline: null, candidate: null }
    }));
    const collectionStartedAt = now();
    let settled = false;
    let failureReason = null;
    let deadlineTimer = null;
    let drainTimer = null;
    let terminationTimer = null;
    const clearAllTimers = () => {
      for (const timer of [deadlineTimer, drainTimer, terminationTimer]) {
        if (timer !== null) clearTimer(timer);
      }
      for (const arm of ARMS) {
        if (state[arm].ipcDrainTimer !== null) clearTimer(state[arm].ipcDrainTimer);
      }
    };
    const settleFailure = () => {
      if (settled) return;
      settled = true;
      clearAllTimers();
      reject(new Error(failureReason));
    };
    const maybeReject = () => {
      if (settled || !failureReason || !ARMS.every((arm) => state[arm].exited)) return;
      settleFailure();
    };
    const terminateUnsettled = (signal) => {
      for (const arm of ARMS) {
        if (state[arm].exited) continue;
        try { terminate(children[arm], signal); } catch {}
      }
    };
    const beginTermination = () => {
      if (settled) return;
      terminateUnsettled("SIGTERM");
      terminationTimer = setTimer(() => {
        terminateUnsettled("SIGKILL");
        settleFailure();
      }, terminationGraceMs);
    };
    const sendControl = (arm, message, required = true) => {
      const child = children[arm];
      if (child.connected === false) {
        if (required) throw new Error(`${arm} IPC channel is closed`);
        return false;
      }
      try {
        child.send(message, (error) => {
          if (error && required && !settled) {
            cancel(`${arm} IPC send failed: ${error.message}`, { hard: true });
          }
        });
        return true;
      } catch (error) {
        if (required) throw error;
        return false;
      }
    };
    const cancel = (reason, { hard = false } = {}) => {
      if (settled || failureReason) return;
      failureReason = reason;
      try { writeCancellation(failureReason); } catch (error) {
        if (error?.code !== "EEXIST") failureReason += `; cancellation marker failed: ${error.message}`;
      }
      if (deadlineTimer !== null) clearTimer(deadlineTimer);
      for (const arm of ARMS) {
        sendControl(arm, {
          schema: PAIRED_COLLECTION_CONTROL_SCHEMA,
          type: "cancel",
          reason: failureReason
        }, false);
      }
      if (hard) beginTermination();
      else drainTimer = setTimer(beginTermination, drainMs);
      maybeReject();
    };
    const maybeResolve = () => {
      if (settled) return;
      if (!ARMS.every((arm) => state[arm].complete && state[arm].exited &&
          state[arm].disconnected && state[arm].status === 0)) return;
      settled = true;
      clearAllTimers();
      resolve({
        schema: PAIRED_COLLECTION_RECEIPT_SCHEMA,
        planSha256: pairedCollectionPlanSha256(plan),
        selectedIdsSha256: plan.selected.idsSha256,
        selectedContentSha256: plan.selected.contentSha256,
        rows: plan.selected.ids.length,
        collectionStartedAt,
        rowTimeline: receiptTimeline,
        postflightAt: Object.fromEntries(ARMS.map((arm) => [arm, state[arm].postflightAt])),
        finishedAt: now(),
        arms: Object.fromEntries(ARMS.map((arm) => [arm, { finishedAt: state[arm].finishedAt }])),
        artifacts: Object.fromEntries(ARMS.map((arm) => [arm, state[arm].complete.resultsPath]))
      });
    };
    const releaseAfterBarrier = (completedIndex) => {
      const nextIndex = completedIndex + 1;
      const orderedArms = nextIndex % 2 === 0 ? ARMS : [...ARMS].reverse();
      for (const name of orderedArms) {
        const control = nextIndex === 0
          ? { schema: PAIRED_COLLECTION_CONTROL_SCHEMA, type: "start" }
          : { schema: PAIRED_COLLECTION_CONTROL_SCHEMA, type: "continue", index: completedIndex };
        sendControl(name, control);
        if (nextIndex < receiptTimeline.length) receiptTimeline[nextIndex].releasedAt[name] = now();
      }
    };
    const evaluateExit = (arm) => {
      if (!state[arm].exited || !state[arm].disconnected) return;
      if (failureReason) return maybeReject();
      if (!state[arm].complete || state[arm].status !== 0) {
        cancel(
          `${arm} child exited before successful completion: status ${state[arm].status}, signal ${state[arm].signal}`,
          { hard: true }
        );
        return;
      }
      maybeResolve();
    };
    deadlineTimer = setTimer(
      () => cancel("paired collection exceeded the four-hour deadline", { hard: true }),
      deadlineMs
    );

    for (const arm of ARMS) {
      const child = children[arm];
      child.on("error", (error) => cancel(`${arm} child error: ${error.message}`, { hard: true }));
      child.on("exit", (status, signal) => {
        state[arm].exited = true;
        state[arm].status = status;
        state[arm].signal = signal;
        if (failureReason) return maybeReject();
        state[arm].ipcDrainTimer = setTimer(() => {
          if (!state[arm].disconnected) {
            cancel(`${arm} IPC did not close after child exit`, { hard: true });
          }
        }, ipcDrainMs);
        evaluateExit(arm);
      });
      child.on("disconnect", () => {
        state[arm].disconnected = true;
        if (state[arm].ipcDrainTimer !== null) clearTimer(state[arm].ipcDrainTimer);
        evaluateExit(arm);
      });
      child.on("message", (message) => {
        if (settled || failureReason) return;
        try {
          validControlMessage(message, arm);
          if (message.type === "failed") {
            if (typeof message.code !== "string" || !message.code ||
                typeof message.message !== "string" || !message.message) {
              throw new Error(`${arm} sent malformed failure data`);
            }
            cancel(cancellationReason(message, arm));
            return;
          }
          if (message.type === "ready") {
            if (state[arm].ready) throw new Error(`${arm} sent duplicate readiness`);
            for (const name of ["runnerWorktree", "serverWorktree", "selectedIdsSha256", "selectedContentSha256"]) {
              if (typeof message[name] !== "string") throw new Error(`${arm} sent malformed readiness`);
            }
            const expectedRunner = realpathSync(plan.worktrees[`${arm}Runner`]);
            const expectedServer = realpathSync(plan.worktrees[`${arm}Server`]);
            if (message.selectedIdsSha256 !== plan.selected.idsSha256 ||
                message.selectedContentSha256 !== plan.selected.contentSha256 ||
                realpathSync(message.runnerWorktree) !== expectedRunner ||
                realpathSync(message.serverWorktree) !== expectedServer) {
              throw new Error(`${arm} readiness does not match the frozen launch plan`);
            }
            state[arm].ready = true;
            if (ARMS.every((name) => state[name].ready)) releaseAfterBarrier(-1);
            return;
          }
          if (message.type === "row-complete") {
            if (!state[arm].ready || !ARMS.every((name) => state[name].ready)) {
              throw new Error(`${arm} completed a row before both arms were ready`);
            }
            if (!Number.isInteger(message.index) || typeof message.id !== "string") {
              throw new Error(`${arm} sent malformed row completion`);
            }
            const next = state[arm].row + 1;
            if (message.index !== next || message.id !== plan.selected.ids[next]) {
              throw new Error(`${arm} broke the ordered row barrier at index ${message.index}`);
            }
            state[arm].row = next;
            receiptTimeline[next].completedAt[arm] = now();
            const peer = arm === "baseline" ? "candidate" : "baseline";
            if (state[peer].row === next) releaseAfterBarrier(next);
            return;
          }
          if (message.type === "complete") {
            if (!state[arm].postflight || state[arm].complete) {
              throw new Error(`${arm} completed before the final postflight barrier`);
            }
            const resultsPath = validateArtifactPath(arm, message.resultsPath);
            state[arm].finishedAt = now();
            state[arm].complete = { ...message, resultsPath };
            maybeResolve();
            return;
          }
          if (message.type === "postflight-complete") {
            if (state[arm].row !== plan.selected.ids.length - 1 || state[arm].postflight) {
              throw new Error(`${arm} broke the final postflight barrier`);
            }
            state[arm].postflight = true;
            state[arm].postflightAt = now();
            if (ARMS.every((name) => state[name].postflight)) {
              for (const name of ARMS) sendControl(name, {
                schema: PAIRED_COLLECTION_CONTROL_SCHEMA,
                type: "finalize"
              });
            }
          }
        } catch (error) {
          cancel(`${arm} protocol failure: ${error.message}`, { hard: true });
        }
      });
    }
  });
}

function spawnArm(plan, arm, cancellationFile) {
  const command = plan.arms[arm].collectionCommand;
  const child = spawn(command[0], command.slice(1), {
    cwd: plan.worktrees[`${arm}Runner`],
    env: { ...process.env, QA_PAIRED_CANCELLATION_FILE: cancellationFile },
    detached: true,
    stdio: ["ignore", "pipe", "pipe", "ipc"]
  });
  child.stdout.on("data", (chunk) => process.stderr.write(`[${arm}] ${chunk}`));
  child.stderr.on("data", (chunk) => process.stderr.write(`[${arm}] ${chunk}`));
  return child;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 2 || args[0] !== "--plan") {
    throw new Error("usage: paired-collection-supervisor.mjs --plan <plan.json>");
  }
  const planPath = path.resolve(args[1]);
  const plan = validatePairedCollectionPlan(JSON.parse(readFileSync(planPath, "utf8")));
  const controlDir = mkdtempSync(path.join(os.tmpdir(), "qa-paired-control-"));
  const cancellationFile = path.join(controlDir, "cancelled");
  let preserveCancellation = false;
  try {
    const children = Object.fromEntries(ARMS.map((arm) => [arm, spawnArm(plan, arm, cancellationFile)]));
    const receipt = await supervisePairedChildren({
      children,
      plan,
      cancellationFile,
      terminate: (child, signal) => {
        try { process.kill(-child.pid, signal); } catch {}
      }
    });
    process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
  } catch (error) {
    preserveCancellation = existsSync(cancellationFile);
    throw error;
  } finally {
    if (!preserveCancellation) rmSync(controlDir, { recursive: true, force: true });
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((error) => {
    process.stderr.write(`paired collection failed: ${error.message}\n`);
    process.exitCode = 1;
  });
}
