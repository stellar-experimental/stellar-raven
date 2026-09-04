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
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  PAIRED_CAPACITY_CONTRACT,
  PAIRED_CAPACITY_SCHEMA,
  capacityRejectionReasons
} from "./check-paired-capacity.mjs";
import { PAIRED_COLLECTION_CONTROL_SCHEMA } from "./paired-collection-control.mjs";
import {
  P6_SELF_TEST_CALL_SCHEMA,
  P6_SELF_TEST_CALLS,
  P6_SELF_TEST_PER_CALL_BUDGET,
  P6_SELF_TEST_SUMMARY_SCHEMA
} from "./run-p6-judge-self-test.mjs";
import { JUDGE_RUBRIC } from "./judge.mjs";
import { PACK_VERSION } from "./evidence-pack.mjs";

export const PAIRED_COLLECTION_PLAN_SCHEMA = "qa-paired-collection-plan-v2";
export const PAIRED_COLLECTION_RECEIPT_SCHEMA = "qa-paired-collection-receipt-v1";
export const PAIRED_COLLECTION_DEADLINE_MS = 4 * 60 * 60 * 1_000;
export const PAIRED_COLLECTION_DRAIN_MS = 30_000;
export const PAIRED_COLLECTION_TERMINATION_GRACE_MS = 5_000;
export const PAIRED_COLLECTION_IPC_DRAIN_MS = 1_000;
const SHA256 = /^[a-f0-9]{64}$/;
const REVISION = /^[a-f0-9]{40}$/;
const ARMS = ["baseline", "candidate"];
const SELECTED_CASE_COUNT = 200;
const ACTIVE_CORPUS_COUNT = 500;
const P6_MAX_AUTHORIZED_COST_USD = 3.5;
const FLIP_REJUDGE_CAP_USD = 15;
const CONTRACT_FILES = Object.freeze({
  capacity: "eval/qa/check-paired-capacity.mjs",
  p6Wrapper: "eval/qa/run-p6-judge-self-test.mjs",
  p6Judge: "eval/qa/judge.mjs",
  evidencePack: "eval/qa/evidence-pack.mjs",
  rejudge: "eval/qa/re-judge.mjs"
});

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
}

function commandValueAt(command, index) {
  if (!Array.isArray(command) || index >= command.length) return "<end>";
  const encoded = JSON.stringify(command[index]);
  if (encoded.length <= 200) return encoded;
  return `${JSON.stringify(String(command[index]).slice(0, 160))} (truncated)`;
}

function firstCommandDifference(expected, actual) {
  if (!Array.isArray(actual)) {
    return { index: 0, expected: commandValueAt(expected, 0), actual: `<${typeof actual}>` };
  }
  const length = Math.max(expected.length, actual.length);
  for (let index = 0; index < length; index++) {
    if (expected[index] !== actual[index]) {
      return {
        index,
        expected: commandValueAt(expected, index),
        actual: commandValueAt(actual, index)
      };
    }
  }
  return null;
}

export function pairedCollectionPlanSha256(plan) {
  return sha256(JSON.stringify(canonicalize(plan)));
}

export function validateAuthorizedPairedCollectionPlan(plan, authorizedPlanSha256) {
  validateHash(authorizedPlanSha256, "authorized plan SHA-256");
  const actual = pairedCollectionPlanSha256(plan);
  if (authorizedPlanSha256 !== actual) {
    throw new Error(`authorized plan SHA-256 does not match the canonical plan: expected ${actual}`);
  }
  if (Object.hasOwn(plan ?? {}, "authorization")) {
    throw new Error("the authorization record must stay external to the canonical plan");
  }
  return actual;
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

export function devVarsIdentity(worktree, salt) {
  validateHash(salt, "devVars.salt");
  let source;
  try {
    source = readFileSync(path.join(worktree, ".dev.vars"), "utf8");
  } catch {
    throw new Error(".dev.vars is missing or unreadable");
  }
  const entries = [];
  const names = new Set();
  for (const [index, sourceLine] of source.split(/\r?\n/).entries()) {
    const line = sourceLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = /^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!match) throw new Error(`.dev.vars line ${index + 1} is malformed`);
    if (names.has(match[1])) throw new Error(`.dev.vars has duplicate name ${match[1]}`);
    names.add(match[1]);
    entries.push([match[1], match[2]]);
  }
  entries.sort(([left], [right]) => compareText(left, right));
  return {
    names: entries.map(([name]) => name),
    sha256: sha256(JSON.stringify({ salt, entries }))
  };
}

function executingControlHashes() {
  const supervisorPath = fileURLToPath(import.meta.url);
  const controlPath = fileURLToPath(new URL("./paired-collection-control.mjs", import.meta.url));
  return {
    pairedCollectionSupervisorSha256: sha256(readFileSync(supervisorPath)),
    pairedCollectionControlSha256: sha256(readFileSync(controlPath))
  };
}

function pathInside(root, candidate, label) {
  let realRoot;
  let realCandidate;
  try {
    realRoot = realpathSync(root);
    realCandidate = realpathSync(candidate);
  } catch {
    throw new Error(`${label} is missing or unreadable inside its runner worktree`);
  }
  const relative = path.relative(realRoot, realCandidate);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`${label} must resolve inside its runner worktree`);
  }
  return realCandidate;
}

function validateHash(value, label) {
  if (!SHA256.test(value ?? "")) throw new Error(`${label} must be a lowercase SHA-256`);
}

function selectedCasesFromWorktree(worktree, casesPath, selectedIds) {
  const absolutePath = pathInside(
    worktree,
    path.resolve(worktree, casesPath),
    "--cases"
  );
  let bytes;
  try {
    bytes = readFileSync(absolutePath);
  } catch {
    throw new Error("--cases is missing or unreadable inside its runner worktree");
  }
  const parsed = JSON.parse(bytes);
  if (!Array.isArray(parsed.cases)) throw new Error("--cases has no cases[]");
  const corpusIds = parsed.cases.map((item) => item?.id);
  if (corpusIds.some((id) => typeof id !== "string" || !id)) {
    throw new Error("--cases has a case without a valid ID");
  }
  if (new Set(corpusIds).size !== corpusIds.length) {
    throw new Error("--cases has duplicate corpus IDs");
  }
  const active = parsed.cases.filter((item) => item?.truth?.lifecycle?.state === "active");
  const activeIds = active.map((item) => item.id);
  const selected = active.filter((item) => selectedIds.includes(item.id));
  if (selected.length !== selectedIds.length || selected.some((item, index) => item.id !== selectedIds[index])) {
    throw new Error("--cases does not reproduce the ordered active selected IDs");
  }
  return { bytes, selected, activeIds };
}

function readJsonArtifact(artifactPath, label) {
  let bytes;
  try {
    bytes = readFileSync(artifactPath);
  } catch {
    throw new Error(`${label} is missing or unreadable`);
  }
  try {
    return { bytes, value: JSON.parse(bytes) };
  } catch {
    throw new Error(`${label} must contain valid JSON`);
  }
}

function validateContractFileHash(worktree, relativePath, expectedSha256, label) {
  validateHash(expectedSha256, label);
  const filePath = path.resolve(worktree, relativePath);
  let actual;
  try {
    actual = sha256(readFileSync(filePath));
  } catch {
    throw new Error(`${label} file is missing or unreadable`);
  }
  if (actual !== expectedSha256) throw new Error(`${label} does not match the frozen hash`);
}

function validateCapacityContract(plan, runnerWorktrees, nowMs) {
  const capacity = plan.capacity;
  if (JSON.stringify(capacity?.contract) !== JSON.stringify(PAIRED_CAPACITY_CONTRACT)) {
    throw new Error("capacity.contract must match the fixed paired capacity contract");
  }
  validateHash(capacity?.instrumentSha256, "capacity.instrumentSha256");
  validateHash(capacity?.artifactSha256, "capacity.artifactSha256");
  if (typeof capacity?.artifactPath !== "string" || !path.isAbsolute(capacity.artifactPath)) {
    throw new Error("capacity.artifactPath must be an absolute path");
  }
  const expectedCommand = [
    process.execPath,
    CONTRACT_FILES.capacity,
    "--out",
    capacity.artifactPath
  ];
  if (JSON.stringify(capacity.command) !== JSON.stringify(expectedCommand)) {
    throw new Error("capacity.command must freeze the exact free capacity check command");
  }
  const executingPath = fileURLToPath(new URL("./check-paired-capacity.mjs", import.meta.url));
  if (sha256(readFileSync(executingPath)) !== capacity.instrumentSha256) {
    throw new Error("capacity instrument does not match the executing bytes");
  }
  for (const worktree of runnerWorktrees) {
    validateContractFileHash(worktree, CONTRACT_FILES.capacity, capacity.instrumentSha256, "capacity instrument");
  }
  const artifact = readJsonArtifact(capacity.artifactPath, "capacity artifact");
  if (sha256(artifact.bytes) !== capacity.artifactSha256) {
    throw new Error("capacity artifact does not match capacity.artifactSha256");
  }
  if (artifact.value.schema !== PAIRED_CAPACITY_SCHEMA || artifact.value.accepted !== true) {
    throw new Error("capacity artifact is not an accepted paired capacity result");
  }
  const reasons = capacityRejectionReasons(artifact.value, capacity.contract);
  if (reasons.length) throw new Error(`capacity artifact failed its fixed thresholds: ${reasons.join("; ")}`);
  const completedAtMs = Date.parse(artifact.value.completedAt);
  if (!Number.isFinite(completedAtMs) || completedAtMs > nowMs ||
      nowMs - completedAtMs > capacity.contract.freshnessMs) {
    throw new Error(`capacity artifact must be at most ${capacity.contract.freshnessMs} ms old`);
  }
}

function validateP6Contract(plan, identities) {
  const p6 = plan.p6;
  if (p6?.calls !== P6_SELF_TEST_CALLS ||
      p6?.perCallBudgetUsd !== Number(P6_SELF_TEST_PER_CALL_BUDGET) ||
      p6?.maxAuthorizedCostUsd !== P6_MAX_AUTHORIZED_COST_USD) {
    throw new Error("p6 contract must freeze seven calls, each capped at $0.50, with a $3.50 maximum");
  }
  validateHash(p6?.wrapperSha256, "p6.wrapperSha256");
  validateHash(p6?.judgeSha256, "p6.judgeSha256");
  if (!ARMS.includes(p6?.runnerArm)) throw new Error("p6.runnerArm must name baseline or candidate");
  if (typeof p6?.summaryArtifactPath !== "string" || !path.isAbsolute(p6.summaryArtifactPath)) {
    throw new Error("p6.summaryArtifactPath must be an absolute path");
  }
  const runner = plan.worktrees[`${p6.runnerArm}Runner`];
  const runnerIdentity = identities[p6.runnerArm === "baseline" ? 0 : 1];
  const hashes = plan.arms[p6.runnerArm].inputHashes;
  const expectedCommand = [
    process.execPath,
    CONTRACT_FILES.p6Wrapper,
    "--runner-revision",
    runnerIdentity.revision,
    "--claude-path",
    p6.claudePath,
    "--expect-claude-binary-sha256",
    hashes.agentBinarySha256,
    "--expect-claude-environment-sha256",
    hashes.agentEnvironmentSha256,
    "--out",
    p6.summaryArtifactPath
  ];
  if (JSON.stringify(p6.command) !== JSON.stringify(expectedCommand)) {
    throw new Error("p6.command must freeze the exact wrapper command and identity flags");
  }
  validateContractFileHash(runner, CONTRACT_FILES.p6Wrapper, p6.wrapperSha256, "p6 wrapper");
  validateContractFileHash(runner, CONTRACT_FILES.p6Judge, p6.judgeSha256, "p6 judge implementation");
  const summary = readJsonArtifact(p6.summaryArtifactPath, "p6 summary artifact").value;
  const callCosts = Array.isArray(summary.callRecords)
    ? summary.callRecords.map((record) => record.costUsd)
    : [];
  const computedTotalCostUsd = Number(callCosts.reduce((sum, cost) => sum + cost, 0).toFixed(12));
  if (summary.schema !== P6_SELF_TEST_SUMMARY_SCHEMA ||
      summary.implementationSha256 !== p6.wrapperSha256 ||
      summary.calls !== P6_SELF_TEST_CALLS ||
      summary.perCallBudgetUsd !== Number(P6_SELF_TEST_PER_CALL_BUDGET) ||
      summary.maxAuthorizedCostUsd !== P6_MAX_AUTHORIZED_COST_USD ||
      summary.runnerRevision !== runnerIdentity.revision ||
      summary.claudePath !== p6.claudePath ||
      summary.claudeBinarySha256 !== hashes.agentBinarySha256 ||
      summary.claudeEnvironmentSha256 !== hashes.agentEnvironmentSha256 ||
      !Array.isArray(summary.callRecords) || summary.callRecords.length !== P6_SELF_TEST_CALLS ||
      summary.callRecords.some((record, index) =>
        record.schema !== P6_SELF_TEST_CALL_SCHEMA ||
        record.index !== index || record.callNumber !== index + 1 ||
        record.maxBudgetUsd !== Number(P6_SELF_TEST_PER_CALL_BUDGET) ||
        record.costWithinCap !== true || record.costReported !== true ||
        record.ok !== true || record.gradeMatches !== true || record.runnerDirty !== false ||
        record.runnerRevision !== runnerIdentity.revision ||
        record.claudePath !== p6.claudePath ||
        record.claudeBinarySha256 !== hashes.agentBinarySha256 ||
        record.claudeEnvironmentSha256 !== hashes.agentEnvironmentSha256 ||
        !Number.isFinite(record.costUsd) || record.costUsd < 0 ||
        record.costUsd > Number(P6_SELF_TEST_PER_CALL_BUDGET)) ||
      !Number.isFinite(summary.totalCostUsd) || summary.totalCostUsd < 0 ||
      summary.totalCostUsd > P6_MAX_AUTHORIZED_COST_USD ||
      summary.totalCostUsd !== computedTotalCostUsd ||
      JSON.stringify(summary.reportedCosts) !== JSON.stringify(callCosts) ||
      !Array.isArray(summary.missingCosts) || summary.missingCosts.length !== 0) {
    throw new Error("p6 summary artifact does not satisfy the frozen wrapper contract");
  }
}

function validateFlipRejudgeContract(plan, runnerWorktrees) {
  const contract = plan.flipRejudge;
  validateHash(contract?.implementationSha256, "flipRejudge.implementationSha256");
  validateHash(contract?.judgeImplementationSha256, "flipRejudge.judgeImplementationSha256");
  validateHash(contract?.evidencePackImplementationSha256, "flipRejudge.evidencePackImplementationSha256");
  if (contract?.perArmBudgetUsd !== FLIP_REJUDGE_CAP_USD) {
    throw new Error("flipRejudge.perArmBudgetUsd must equal 15");
  }
  for (const [index, arm] of ARMS.entries()) {
    validateContractFileHash(
      runnerWorktrees[index],
      CONTRACT_FILES.rejudge,
      contract.implementationSha256,
      `${arm} re-judge implementation`
    );
    validateContractFileHash(
      runnerWorktrees[index],
      CONTRACT_FILES.p6Judge,
      contract.judgeImplementationSha256,
      `${arm} flip judge implementation`
    );
    validateContractFileHash(
      runnerWorktrees[index],
      CONTRACT_FILES.evidencePack,
      contract.evidencePackImplementationSha256,
      `${arm} flip evidence-pack implementation`
    );
    const peer = arm === "baseline" ? "candidate" : "baseline";
    const collection = plan.arms[arm].collectionCommand;
    const panel = optionalFlagValue(collection, "--judge-panel");
    const expectedTuple = {
      model: flagValue(collection, "--judge-model"),
      rubric: JUDGE_RUBRIC,
      packVersion: PACK_VERSION,
      judgePanel: panel === null ? 1 : Number(panel)
    };
    if (JSON.stringify(contract?.judgeTuple) !== JSON.stringify(expectedTuple)) {
      throw new Error("flipRejudge.judgeTuple does not match the frozen model, rubric, pack, and panel");
    }
    const expected = [
      process.execPath,
      CONTRACT_FILES.rejudge,
      `{${arm}Artifact}`,
      "--flips-vs",
      `{${peer}Artifact}`,
      "--judge-model",
      flagValue(collection, "--judge-model"),
      ...(panel === null ? [] : ["--judge-panel", panel]),
      "--claude-path",
      plan.p6.claudePath,
      "--expect-agent-binary-sha256",
      plan.arms[arm].inputHashes.judgeBinarySha256,
      "--expect-agent-environment-sha256",
      plan.arms[arm].inputHashes.judgeEnvironmentSha256,
      "--cases-ref",
      flagValue(collection, "--adapter-revision"),
      "--allow-empty",
      "--max-budget-usd",
      String(FLIP_REJUDGE_CAP_USD)
    ];
    const difference = firstCommandDifference(expected, contract?.commands?.[arm]);
    if (difference) {
      throw new Error(
        `${arm} flip re-judge command differs at index ${difference.index}: ` +
        `expected ${difference.expected}, actual ${difference.actual}`
      );
    }
  }
  if (contract.judgeImplementationSha256 !== plan.p6.judgeSha256) {
    throw new Error("P6 and flip re-judging must bind the same judge implementation");
  }
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
    if (flagValue(command, "--judge-stored") !== `{${arm}Artifact}`) {
      throw new Error(`${arm} judgeCommand must freeze {${arm}Artifact} as its result placeholder`);
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
  readDevVarsIdentity = devVarsIdentity,
  nowMs = Date.now()
} = {}) {
  if (plan?.schema !== PAIRED_COLLECTION_PLAN_SCHEMA) {
    throw new Error(`paired collection plan must use ${PAIRED_COLLECTION_PLAN_SCHEMA}`);
  }
  if (plan.deadlineMs !== PAIRED_COLLECTION_DEADLINE_MS) {
    throw new Error("paired collection plan must use the four-hour deadline");
  }
  if (plan.selected?.count !== SELECTED_CASE_COUNT ||
      !Array.isArray(plan.selected?.ids) || plan.selected.ids.length !== SELECTED_CASE_COUNT) {
    throw new Error(`paired collection plan requires exactly ${SELECTED_CASE_COUNT} selected IDs`);
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
  if (plan.selected.activeCorpusCount !== ACTIVE_CORPUS_COUNT) {
    throw new Error(`paired collection plan requires exactly ${ACTIVE_CORPUS_COUNT} active corpus IDs`);
  }
  validateHash(plan.selected.activeCorpusIdsSha256, "selected.activeCorpusIdsSha256");
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
  validateCapacityContract(plan, [plan.worktrees.baselineRunner, plan.worktrees.candidateRunner], nowMs);
  validateHash(plan.devVars?.salt, "devVars.salt");
  validateHash(plan.devVars?.sha256, "devVars.sha256");
  if (!Array.isArray(plan.devVars?.names) ||
      plan.devVars.names.some((name) => typeof name !== "string") ||
      !plan.devVars.names.every((name, index, names) =>
        index === 0 || compareText(names[index - 1], name) < 0)) {
    throw new Error("devVars.names must be a sorted unique name list");
  }
  for (const arm of ARMS) {
    let identity;
    try {
      identity = readDevVarsIdentity(plan.worktrees[`${arm}Server`], plan.devVars.salt);
    } catch (error) {
      throw new Error(`${arm} server launch gate: ${error instanceof Error ? error.message : String(error)}`);
    }
    if (identity.sha256 !== plan.devVars.sha256 ||
        JSON.stringify(identity.names) !== JSON.stringify(plan.devVars.names)) {
      throw new Error(`${arm} server .dev.vars does not match the frozen identity`);
    }
  }
  const executingHashes = executingControlHashes();

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
    if (hashes.pairedCollectionSupervisorSha256 !== executingHashes.pairedCollectionSupervisorSha256 ||
        hashes.pairedCollectionControlSha256 !== executingHashes.pairedCollectionControlSha256) {
      throw new Error(`${arm} manifest does not pin the executing paired collection control bytes`);
    }
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
    let snapshot;
    try {
      snapshot = readSelectedCases(runner, casesPath, plan.selected.ids);
    } catch (error) {
      throw new Error(`${arm} runner launch gate: ${error instanceof Error ? error.message : String(error)}`);
    }
    if (sha256(snapshot.bytes) !== plan.selected.casesFileSha256 ||
        sha256(JSON.stringify(snapshot.selected)) !== plan.selected.contentSha256 ||
        snapshot.activeIds.length !== ACTIVE_CORPUS_COUNT ||
        new Set(snapshot.activeIds).size !== ACTIVE_CORPUS_COUNT ||
        sha256(JSON.stringify(snapshot.activeIds)) !== plan.selected.activeCorpusIdsSha256) {
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
  validateP6Contract(plan, identities);
  validateFlipRejudgeContract(plan, [
    plan.worktrees.baselineRunner,
    plan.worktrees.candidateRunner
  ]);
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
  let artifact;
  try {
    artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
  } catch {
    throw new Error(`${arm} artifact must contain readable JSON`);
  }
  if (artifact.meta?.comparable !== true) {
    throw new Error(`${arm} artifact must stamp meta.comparable: true`);
  }
  const artifactIds = Array.isArray(artifact.rows) ? artifact.rows.map((row) => row?.id) : null;
  if (!artifactIds || JSON.stringify(artifactIds) !== JSON.stringify(plan.selected.ids) ||
      sha256(JSON.stringify(artifactIds)) !== plan.selected.idsSha256 ||
      artifact.meta?.inputSnapshot?.caseIdsSha256 !== plan.selected.idsSha256) {
    throw new Error(`${arm} artifact does not match the frozen selected IDs`);
  }
  if (artifact.meta.selectedIds !== undefined &&
      JSON.stringify(artifact.meta.selectedIds) !== JSON.stringify(plan.selected.ids)) {
    throw new Error(`${arm} artifact selectedIds does not match the frozen selected IDs`);
  }
  if (artifact.meta.inputSnapshot.casesSha256 !== plan.selected.contentSha256) {
    throw new Error(`${arm} artifact does not match the frozen selected content`);
  }
  const frozenServerRevision = flagValue(plan.arms[arm].collectionCommand, "--server-revision");
  if (artifact.meta?.sourceIdentity?.serverRevision !== frozenServerRevision) {
    throw new Error(`${arm} artifact does not match its frozen server revision`);
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
      releaseSequence: { baseline: null, candidate: null },
      releasedAt: { baseline: null, candidate: null },
      completedAt: { baseline: null, candidate: null }
    }));
    const collectionStartedAt = now();
    const releaseSequence = [];
    let nextReleaseSequence = 1;
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
        releaseSequence,
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
      for (const name of ARMS) {
        if (children[name].connected === false) {
          throw new Error(`${name} IPC channel is closed before row release`);
        }
      }
      for (const name of orderedArms) {
        const control = nextIndex === 0
          ? { schema: PAIRED_COLLECTION_CONTROL_SCHEMA, type: "start" }
          : { schema: PAIRED_COLLECTION_CONTROL_SCHEMA, type: "continue", index: completedIndex };
        sendControl(name, control);
        if (nextIndex < receiptTimeline.length) {
          const sequence = nextReleaseSequence++;
          receiptTimeline[nextIndex].releaseSequence[name] = sequence;
          receiptTimeline[nextIndex].releasedAt[name] = now();
          releaseSequence.push({ sequence, index: nextIndex, id: plan.selected.ids[nextIndex], arm: name });
        }
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
  if (args[0] === "--print-plan-sha256" &&
      ((args.length === 2) || (args.length === 3 && args[1] === "--plan"))) {
    const planPath = path.resolve(args.at(-1));
    const parsedPlan = JSON.parse(readFileSync(planPath, "utf8"));
    process.stdout.write(`${pairedCollectionPlanSha256(parsedPlan)}\n`);
    return;
  }
  if (args.length !== 4 || args[0] !== "--plan" || args[2] !== "--authorized-plan-sha256") {
    throw new Error(
      "usage: paired-collection-supervisor.mjs --plan <plan.json> --authorized-plan-sha256 <sha256> | --print-plan-sha256 <plan.json>"
    );
  }
  const planPath = path.resolve(args[1]);
  const parsedPlan = JSON.parse(readFileSync(planPath, "utf8"));
  validateAuthorizedPairedCollectionPlan(parsedPlan, args[3]);
  const plan = validatePairedCollectionPlan(parsedPlan);
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
