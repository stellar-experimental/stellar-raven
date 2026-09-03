#!/usr/bin/env node
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  agentEnvironmentIdentity,
  assertExpectedAgentEnvironment,
  assertExpectedExecutable,
  executableIdentity
} from "../lib/executable-identity.mjs";
import {
  assertStableGitWorktreeIdentity,
  gitWorktreeIdentity
} from "../lib/bound-server-identity.mjs";
import {
  JUDGE_SELF_TEST_CANDIDATE_COUNT,
  P6_SELF_TEST_CALL_SCHEMA
} from "./judge.mjs";

export { P6_SELF_TEST_CALL_SCHEMA };

export const P6_SELF_TEST_CALLS = 7;
export const P6_SELF_TEST_PER_CALL_BUDGET = "0.50";
export const P6_SELF_TEST_SUMMARY_SCHEMA = "p6-judge-self-test-summary-v1";

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const REVISION_PATTERN = /^[a-f0-9]{40}$/;
const WRAPPER_PATH = fileURLToPath(import.meta.url);
const JUDGE_PATH = fileURLToPath(new URL("./judge.mjs", import.meta.url));
const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url));
const CALL_RECORD_KEYS = [
  "actual",
  "callNumber",
  "claudeBinarySha256",
  "claudeEnvironmentSha256",
  "claudePath",
  "claudeRealPath",
  "costReported",
  "costUsd",
  "costWithinCap",
  "expected",
  "gradeMatches",
  "index",
  "label",
  "maxBudgetUsd",
  "ok",
  "runnerDirty",
  "runnerRevision",
  "schema"
].sort();

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

export function p6SelfTestWrapperSha256() {
  return sha256(readFileSync(WRAPPER_PATH));
}

function requirePin(value, pattern, flag) {
  if (!pattern.test(String(value ?? ""))) throw new Error(`${flag} has an invalid value`);
  return value;
}

export function attestP6SelfTestIdentity(
  { runnerRevision, claudePath, claudeBinarySha256, claudeEnvironmentSha256 },
  {
    repoRoot = REPO_ROOT,
    env = process.env,
    gitIdentity = gitWorktreeIdentity,
    executableIdentityImpl = executableIdentity,
    environmentIdentityImpl = agentEnvironmentIdentity
  } = {}
) {
  requirePin(runnerRevision, REVISION_PATTERN, "--runner-revision");
  requirePin(claudeBinarySha256, SHA256_PATTERN, "--expect-claude-binary-sha256");
  requirePin(claudeEnvironmentSha256, SHA256_PATTERN, "--expect-claude-environment-sha256");
  if (typeof claudePath !== "string" || !claudePath) throw new Error("--claude-path is required");

  const runner = gitIdentity(repoRoot);
  if (runner.dirty) throw new Error("p6 judge self-test requires a clean runner worktree");
  if (runner.revision !== runnerRevision) {
    throw new Error(`p6 judge self-test runner revision mismatch: expected ${runnerRevision}, got ${runner.revision}`);
  }
  const binary = assertExpectedExecutable(
    executableIdentityImpl(claudePath, { env }),
    claudeBinarySha256,
    { label: "p6 Claude CLI" }
  );
  const environment = assertExpectedAgentEnvironment(
    environmentIdentityImpl(env),
    claudeEnvironmentSha256,
    { label: "p6 Claude environment" }
  );
  return { runner, binary, environment };
}

export function assertStableP6SelfTestIdentity(before, after) {
  const runner = assertStableGitWorktreeIdentity(before?.runner, after?.runner, {
    label: "p6 runner worktree"
  });
  const binaryFields = ["resolvedPath", "realPath", "sha256", "version"];
  const binaryChanged = binaryFields.filter((field) => before?.binary?.[field] !== after?.binary?.[field]);
  if (binaryChanged.length) {
    throw new Error(`p6 Claude binary identity changed during judge calls (${binaryChanged.join(", ")})`);
  }
  if (before?.environment?.sha256 !== after?.environment?.sha256) {
    throw new Error("p6 Claude environment identity changed during judge calls");
  }
  return { matches: true, runner, binaryChanged, environmentChanged: false };
}

function runStaticChild(spawnSyncImpl, judgePath) {
  const result = spawnSyncImpl(process.execPath, [judgePath, "--self-test-static"], {
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024
  });
  if (result.error || result.status !== 0) {
    throw new Error(String(result.stderr || result.error?.message || `static child exited ${result.status}`).trim());
  }
}

function parseStrictCallRecord(result, expectedIndex, expectedIdentity) {
  let record;
  try {
    record = JSON.parse(String(result.stdout ?? "").trim());
  } catch {
    throw new Error(`p6 candidate ${expectedIndex} did not return one strict JSON record`);
  }
  if (!record || Array.isArray(record) || typeof record !== "object") {
    throw new Error(`p6 candidate ${expectedIndex} returned a non-object JSON record`);
  }
  if (JSON.stringify(Object.keys(record).sort()) !== JSON.stringify(CALL_RECORD_KEYS)) {
    throw new Error(`p6 candidate ${expectedIndex} returned an unexpected JSON record shape`);
  }
  if (
    record.schema !== P6_SELF_TEST_CALL_SCHEMA ||
    record.index !== expectedIndex ||
    record.callNumber !== expectedIndex + 1 ||
    record.maxBudgetUsd !== Number(P6_SELF_TEST_PER_CALL_BUDGET)
  ) {
    throw new Error(`p6 candidate ${expectedIndex} returned mismatched call identity`);
  }
  if (
    record.runnerRevision !== expectedIdentity.runner.revision ||
    record.runnerDirty !== false ||
    record.claudePath !== expectedIdentity.binary.resolvedPath ||
    record.claudeRealPath !== expectedIdentity.binary.realPath ||
    record.claudeBinarySha256 !== expectedIdentity.binary.sha256 ||
    record.claudeEnvironmentSha256 !== expectedIdentity.environment.sha256
  ) {
    throw new Error(`p6 candidate ${expectedIndex} returned drifted runner or Claude identity`);
  }
  if (
    record.costReported !== true ||
    !Number.isFinite(record.costUsd) ||
    record.costUsd < 0 ||
    record.costUsd > Number(P6_SELF_TEST_PER_CALL_BUDGET) ||
    record.costWithinCap !== true
  ) {
    throw new Error(`p6 candidate ${expectedIndex} returned a missing, negative, or over-cap cost`);
  }
  if (result.error || result.status !== 0 || record.ok !== true || record.gradeMatches !== true) {
    throw new Error(String(result.stderr || result.error?.message || `p6 candidate ${expectedIndex} failed`).trim());
  }
  return record;
}

function candidateArgs(judgePath, index, identity) {
  return [
    judgePath,
    "--self-test-candidate",
    String(index),
    "--max-budget-usd",
    P6_SELF_TEST_PER_CALL_BUDGET,
    "--runner-revision",
    identity.runner.revision,
    "--claude-path",
    identity.binary.resolvedPath,
    "--expect-claude-binary-sha256",
    identity.binary.sha256,
    "--expect-claude-environment-sha256",
    identity.environment.sha256
  ];
}

export function runP6JudgeSelfTest({
  pins,
  spawnSyncImpl = spawnSync,
  judgePath = JUDGE_PATH,
  attestIdentity = (expected) => attestP6SelfTestIdentity(expected),
  log = console.log
} = {}) {
  if (JUDGE_SELF_TEST_CANDIDATE_COUNT !== P6_SELF_TEST_CALLS) {
    throw new Error(
      `p6 judge self-test requires exactly ${P6_SELF_TEST_CALLS} candidates; found ${JUDGE_SELF_TEST_CANDIDATE_COUNT}`
    );
  }
  const before = attestIdentity(pins);
  runStaticChild(spawnSyncImpl, judgePath);
  assertStableP6SelfTestIdentity(before, attestIdentity(pins));

  const callRecords = [];
  for (let index = 0; index < P6_SELF_TEST_CALLS; index++) {
    assertStableP6SelfTestIdentity(before, attestIdentity(pins));
    const child = spawnSyncImpl(process.execPath, candidateArgs(judgePath, index, before), {
      encoding: "utf8",
      maxBuffer: 4 * 1024 * 1024
    });
    const record = parseStrictCallRecord(child, index, before);
    if (callRecords.some((item) => item.index === record.index)) {
      throw new Error(`p6 candidate ${index} returned a duplicate call record`);
    }
    callRecords.push(record);
    assertStableP6SelfTestIdentity(before, attestIdentity(pins));
  }

  const reportedCosts = callRecords.map((record) => record.costUsd);
  const missingCosts = callRecords.filter((record) => !record.costReported).map((record) => record.index);
  const totalCostUsd = Number(reportedCosts.reduce((sum, cost) => sum + cost, 0).toFixed(12));
  if (callRecords.length !== P6_SELF_TEST_CALLS || missingCosts.length !== 0) {
    throw new Error("p6 judge self-test has incomplete call or cost records");
  }
  const summary = {
    schema: P6_SELF_TEST_SUMMARY_SCHEMA,
    implementationSha256: p6SelfTestWrapperSha256(),
    calls: P6_SELF_TEST_CALLS,
    perCallBudgetUsd: Number(P6_SELF_TEST_PER_CALL_BUDGET),
    maxAuthorizedCostUsd: P6_SELF_TEST_CALLS * Number(P6_SELF_TEST_PER_CALL_BUDGET),
    runnerRevision: before.runner.revision,
    claudePath: before.binary.resolvedPath,
    claudeRealPath: before.binary.realPath,
    claudeBinarySha256: before.binary.sha256,
    claudeEnvironmentSha256: before.environment.sha256,
    expected: callRecords.map((record) => record.expected),
    actual: callRecords.map((record) => record.actual),
    reportedCosts,
    missingCosts,
    totalCostUsd,
    callRecords
  };
  log(JSON.stringify(summary));
  return summary;
}

function parseCli(args) {
  if (args.length === 1 && args[0] === "--print-sha256") return { printSha256: true };
  const flags = new Set([
    "--runner-revision",
    "--claude-path",
    "--expect-claude-binary-sha256",
    "--expect-claude-environment-sha256"
  ]);
  if (args.length !== flags.size * 2) {
    throw new Error(`p6 judge self-test requires ${[...flags].join(", ")}`);
  }
  const values = {};
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index];
    const value = args[index + 1];
    if (!flags.has(flag) || !value || value.startsWith("--") || Object.hasOwn(values, flag)) {
      throw new Error("p6 judge self-test requires unique spaced identity flags");
    }
    values[flag] = value;
  }
  return {
    runnerRevision: requirePin(values["--runner-revision"], REVISION_PATTERN, "--runner-revision"),
    claudePath: values["--claude-path"],
    claudeBinarySha256: requirePin(
      values["--expect-claude-binary-sha256"],
      SHA256_PATTERN,
      "--expect-claude-binary-sha256"
    ),
    claudeEnvironmentSha256: requirePin(
      values["--expect-claude-environment-sha256"],
      SHA256_PATTERN,
      "--expect-claude-environment-sha256"
    )
  };
}

function main(args) {
  const parsed = parseCli(args);
  if (parsed.printSha256) {
    console.log(p6SelfTestWrapperSha256());
    return;
  }
  runP6JudgeSelfTest({ pins: parsed });
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(`p6 judge self-test failed: ${error.message}`);
    process.exit(1);
  }
}
