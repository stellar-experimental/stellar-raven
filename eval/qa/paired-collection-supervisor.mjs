#!/usr/bin/env node
import { spawn, execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { PAIRED_COLLECTION_CONTROL_SCHEMA } from "./paired-collection-control.mjs";

export const PAIRED_COLLECTION_PLAN_SCHEMA = "qa-paired-collection-plan-v1";
export const PAIRED_COLLECTION_RECEIPT_SCHEMA = "qa-paired-collection-receipt-v1";
export const PAIRED_COLLECTION_DEADLINE_MS = 4 * 60 * 60 * 1_000;
const SHA256 = /^[a-f0-9]{64}$/;
const ARMS = ["baseline", "candidate"];

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function flagValue(command, flag) {
  const indexes = command.flatMap((value, index) => value === flag ? [index] : []);
  if (indexes.length !== 1 || command[indexes[0] + 1] === undefined) {
    throw new Error(`${flag} must occur exactly once in the frozen command`);
  }
  return command[indexes[0] + 1];
}

function inspectGitWorktree(worktree) {
  const root = execFileSync("git", ["-C", worktree, "rev-parse", "--show-toplevel"], {
    encoding: "utf8"
  }).trim();
  const commonDir = execFileSync("git", ["-C", worktree, "rev-parse", "--git-common-dir"], {
    encoding: "utf8"
  }).trim();
  return {
    root: realpathSync(root),
    commonDir: realpathSync(path.resolve(worktree, commonDir))
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
  }
  return command;
}

export function validatePairedCollectionPlan(plan, {
  inspectWorktree = inspectGitWorktree,
  readSelectedCases = selectedCasesFromWorktree
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
      "pairedVerdictSha256"
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
    "pairedVerdictSha256"
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

export function supervisePairedChildren({
  children,
  plan,
  cancellationFile,
  deadlineMs = PAIRED_COLLECTION_DEADLINE_MS,
  setTimer = setTimeout,
  clearTimer = clearTimeout,
  writeCancellation = (reason) => writeFileSync(cancellationFile, `${reason}\n`, { flag: "wx" }),
  terminate = (child) => child.kill("SIGTERM")
}) {
  return new Promise((resolve, reject) => {
    const state = Object.fromEntries(ARMS.map((arm) => [arm, {
      ready: false,
      row: -1,
      postflight: false,
      complete: null,
      exited: false,
      status: null
    }]));
    let settled = false;
    let failureReason = null;
    const maybeReject = () => {
      if (settled || !failureReason || !ARMS.every((arm) => state[arm].exited)) return;
      settled = true;
      reject(new Error(failureReason));
    };
    const cancel = (reason, { hard = false } = {}) => {
      if (settled || failureReason) return;
      failureReason = reason;
      try { writeCancellation(failureReason); } catch (error) {
        if (error?.code !== "EEXIST") failureReason += `; cancellation marker failed: ${error.message}`;
      }
      clearTimer(timer);
      for (const arm of ARMS) {
        children[arm].send?.({
          schema: PAIRED_COLLECTION_CONTROL_SCHEMA,
          type: "cancel",
          reason: failureReason
        });
        if (hard) terminate(children[arm]);
      }
      maybeReject();
    };
    const maybeResolve = () => {
      if (settled) return;
      if (!ARMS.every((arm) => state[arm].complete && state[arm].exited && state[arm].status === 0)) return;
      settled = true;
      clearTimer(timer);
      resolve({
        schema: PAIRED_COLLECTION_RECEIPT_SCHEMA,
        selectedIdsSha256: plan.selected.idsSha256,
        selectedContentSha256: plan.selected.contentSha256,
        rows: plan.selected.ids.length,
        artifacts: Object.fromEntries(ARMS.map((arm) => [arm, state[arm].complete.resultsPath]))
      });
    };
    const timer = setTimer(() => cancel("paired collection exceeded the four-hour deadline", { hard: true }), deadlineMs);

    for (const arm of ARMS) {
      const child = children[arm];
      child.on("error", (error) => cancel(`${arm} child error: ${error.message}`, { hard: true }));
      child.on("exit", (status, signal) => {
        state[arm].exited = true;
        state[arm].status = status;
        if (failureReason) {
          maybeReject();
          return;
        }
        if (!state[arm].complete || status !== 0) {
          cancel(`${arm} child exited before successful completion: status ${status}, signal ${signal}`, { hard: true });
          return;
        }
        maybeResolve();
      });
      child.on("message", (message) => {
        if (settled || message?.schema !== PAIRED_COLLECTION_CONTROL_SCHEMA || message.arm !== arm) return;
        if (message.type === "failed") {
          cancel(cancellationReason(message, arm));
          return;
        }
        if (message.type === "ready") {
          if (state[arm].ready) return cancel(`${arm} sent duplicate readiness`);
          const expectedRunner = realpathSync(plan.worktrees[`${arm}Runner`]);
          const expectedServer = realpathSync(plan.worktrees[`${arm}Server`]);
          if (message.selectedIdsSha256 !== plan.selected.idsSha256 ||
              message.selectedContentSha256 !== plan.selected.contentSha256 ||
              realpathSync(message.runnerWorktree) !== expectedRunner ||
              realpathSync(message.serverWorktree) !== expectedServer) {
            return cancel(`${arm} readiness does not match the frozen launch plan`);
          }
          state[arm].ready = true;
          if (ARMS.every((name) => state[name].ready)) {
            for (const name of ARMS) children[name].send({
              schema: PAIRED_COLLECTION_CONTROL_SCHEMA,
              type: "start"
            });
          }
          return;
        }
        if (message.type === "row-complete") {
          const next = state[arm].row + 1;
          if (message.index !== next || message.id !== plan.selected.ids[next]) {
            return cancel(`${arm} broke the ordered row barrier at index ${message.index}`);
          }
          state[arm].row = next;
          const peer = arm === "baseline" ? "candidate" : "baseline";
          if (state[peer].row === next) {
            for (const name of ARMS) children[name].send({
              schema: PAIRED_COLLECTION_CONTROL_SCHEMA,
              type: "continue",
              index: next
            });
          }
          return;
        }
        if (message.type === "complete") {
          if (!state[arm].postflight || !message.resultsPath) {
            return cancel(`${arm} completed before every row barrier`);
          }
          state[arm].complete = message;
          maybeResolve();
          return;
        }
        if (message.type === "postflight-complete") {
          if (state[arm].row !== plan.selected.ids.length - 1 || state[arm].postflight) {
            return cancel(`${arm} broke the final postflight barrier`);
          }
          state[arm].postflight = true;
          if (ARMS.every((name) => state[name].postflight)) {
            for (const name of ARMS) children[name].send({
              schema: PAIRED_COLLECTION_CONTROL_SCHEMA,
              type: "finalize"
            });
          }
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
  try {
    const children = Object.fromEntries(ARMS.map((arm) => [arm, spawnArm(plan, arm, cancellationFile)]));
    const receipt = await supervisePairedChildren({
      children,
      plan,
      cancellationFile,
      terminate: (child) => {
        try { process.kill(-child.pid, "SIGTERM"); } catch {}
      }
    });
    process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
  } finally {
    rmSync(controlDir, { recursive: true, force: true });
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((error) => {
    process.stderr.write(`paired collection failed: ${error.message}\n`);
    process.exitCode = 1;
  });
}
