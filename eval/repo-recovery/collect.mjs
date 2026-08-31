#!/usr/bin/env node
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  agentAttemptRecord,
  agentPrompt,
  assertCollectionSourceIdentity,
  assertPinnedServerRevision,
  isRequiredMcpServerFailure,
  isRetryableAgentFailure,
  parseRequiredBudgetFlag,
  probeLiveSurface,
  runAgent,
  sourceIdentity,
  sourceIdentityGuard
} from "../qa/run-qa.mjs";
import { hasSuccessfulAnswer } from "../qa/judge.mjs";
import {
  authorizeSpend,
  createSpendLedger,
  recordSpend,
  spendLedgerRecord
} from "../qa/spend-budget.mjs";
import {
  REQUIRED_MCP_SERVER_NAME,
  answeringAgentIsolationArgs,
  answeringAgentIsolationRecord,
  assertNeutralAgentCwd,
  assertRunPlan,
  runCompleteness
} from "../lib/harness-guards.mjs";
import {
  agentEnvironmentIdentity,
  assertExpectedExecutable,
  executableIdentity
} from "../lib/executable-identity.mjs";
import {
  assertStableBoundServerIdentity,
  assertStableGitWorktreeIdentity,
  boundServerIdentity,
  gitWorktreeIdentity
} from "../lib/bound-server-identity.mjs";
import {
  assertExpectedSourceRevision,
  assertExpectedSurface,
  parseMcpHttpPayload
} from "../lib/mcp-surface.mjs";
import {
  COLLECTION_SCHEMA,
  MAX_ATTEMPTS_PER_CASE,
  RECOVERY_COST_PLAN,
  artifactSha256,
  authorizePaidCall,
  createPaidCallLedger,
  paidCallLedgerRecord,
  projectTranscript
} from "./artifact.mjs";
import { argValue, requiredArg } from "./cli-args.mjs";
import { sha256, suiteIdentity } from "./contract.mjs";
import { DEFAULT_SUITE_PATH, lintSuite, loadManifest, loadSuite } from "./lint.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..", "..");
const DEFAULT_MODEL = "claude-sonnet-5";
const SEARCH_TOOL = "search";
const DOCS_READINESS_SCHEMA = "repository-recovery-docs-readiness-v1";

function positiveDocsReadinessPlan(suite) {
  const required = [];
  const seen = new Set();
  for (const caseEntry of suite.cases ?? []) {
    if (caseEntry.class !== "positive") continue;
    const id = caseEntry.initialEvidence?.id;
    if (typeof id !== "string" || !id.startsWith("stellarDocs.")) {
      throw new Error(`positive case ${caseEntry.id ?? "<unknown>"} lacks a Stellar Docs initial operation`);
    }
    if (seen.has(id)) continue;
    const operation = id.slice("stellarDocs.".length);
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(operation)) {
      throw new Error(`Stellar Docs initial operation is not callable as an exact member: ${id}`);
    }
    seen.add(id);
    required.push({
      id,
      operation,
      args: { query: caseEntry.question, hitsPerPage: 1, includeContent: false }
    });
  }
  if (required.length === 0) throw new Error("repository-recovery suite has no positive Stellar Docs initial operation");
  return required;
}

function docsReadinessCode(required) {
  const calls = required.map(({ operation, args }, index) =>
    `  const result${index} = await stellarDocs.${operation}(${JSON.stringify(args)});
  const error${index} = result${index}.ok === false ? result${index}.error : null;`
  ).join("\n");
  const operations = required.map(({ id }, index) =>
    `{ id: ${JSON.stringify(id)}, ok: result${index}.ok === true, errorKind: typeof error${index}?.kind === "string" ? error${index}.kind : null, ...(Number.isFinite(error${index}?.status) ? { errorStatus: error${index}.status } : {}) }`
  ).join(",\n");
  return `async () => {
  const catalog = await codemode.catalog({ service: "stellarDocs", kind: "operation", compact: true });
  const required = ${JSON.stringify(required.map(({ id, args }) => ({ id, args })))};
  const available = Array.isArray(catalog?.entries) ? catalog.entries.map((entry) => entry.id) : [];
  const unavailable = required.filter((entry) => !available.includes(entry.id));
  if (unavailable.length > 0) return { unavailable: unavailable.map((entry) => entry.id), operations: [] };
${calls}
  return { unavailable: [], operations: [${operations}] };
}`;
}

function readinessPayload(toolResult) {
  if (toolResult?.isError === true) return null;
  const text = (toolResult?.content ?? []).find((entry) => entry?.type === "text")?.text;
  if (typeof text !== "string") return null;
  const result = text.split("\n\n---", 1)[0];
  try {
    return JSON.parse(result);
  } catch {
    return null;
  }
}

function readinessRecord(required, failure, transport = null) {
  return {
    schema: DOCS_READINESS_SCHEMA,
    ready: false,
    requiredOperations: required.map(({ id, args }) => ({ id, args })),
    operations: [],
    ...(transport ? { transport } : {}),
    failures: [failure]
  };
}

function projectDocsReadinessOperation(id, operation) {
  const errorKind = typeof operation?.errorKind === "string" ? operation.errorKind : null;
  const errorStatus = Number.isFinite(operation?.errorStatus) ? operation.errorStatus : null;
  return {
    id,
    ok: operation?.ok === true,
    errorKind,
    ...(errorStatus === null ? {} : { errorStatus })
  };
}

function readinessFailure(operation) {
  if (operation.ok || operation.errorKind === "soft-empty") return null;
  return {
    id: operation.id,
    reason: operation.errorKind === "error" ? "service-error" : "non-ready-result",
    errorKind: operation.errorKind,
    ...(operation.errorStatus === undefined ? {} : { errorStatus: operation.errorStatus })
  };
}

function readinessError(readiness) {
  const failed = readiness.failures.map((failure) => `${failure.id ?? "live Raven"} (${failure.reason})`).join(", ");
  const error = new Error(`Stellar Docs readiness failed: ${failed}`);
  error.code = "stellar-docs-readiness";
  return error;
}

/**
 * Exercise every distinct positive-suite Stellar Docs initial operation before
 * the collector authorizes a paid answering call. This direct Raven call uses
 * no model or credentials. The artifact retains only redacted classifications.
 */
export async function checkStellarDocsReadiness({ suite, port, fetchImpl = fetch }) {
  const required = positiveDocsReadinessPlan(suite);
  const code = docsReadinessCode(required);
  let response = null;
  try {
    const httpResponse = await fetchImpl(`http://localhost:${port}/mcp`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        connection: "close"
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: { name: "execute", arguments: { code } }
      }),
      signal: AbortSignal.timeout(70_000)
    });
    const body = await httpResponse.text();
    if (!httpResponse.ok) {
      return readinessRecord(required, {
        id: null,
        reason: "transport-error"
      }, { status: httpResponse.status, bodySha256: sha256(body) });
    }
    response = parseMcpHttpPayload(body);
  } catch (error) {
    return readinessRecord(required, {
      id: null,
      reason: "transport-error"
    });
  }
  if (response.error) {
    return readinessRecord(required, { id: null, reason: "protocol-error" });
  }
  if (response.result?.isError === true) {
    return readinessRecord(required, { id: null, reason: "tool-error" });
  }
  const payload = readinessPayload(response.result);
  if (!payload || !Array.isArray(payload.unavailable) || !Array.isArray(payload.operations)) {
    return readinessRecord(required, { id: null, reason: "invalid-response" });
  }
  const unavailable = payload.unavailable.filter((id) => typeof id === "string");
  if (unavailable.length > 0) {
    return readinessRecord(required, { id: unavailable[0], reason: "unavailable-operation" });
  }
  const operationById = new Map(payload.operations.map((entry) => [entry?.id, entry]));
  const operations = required.map(({ id }) => projectDocsReadinessOperation(id, operationById.get(id)));
  const failures = operations.map(readinessFailure).filter(Boolean);
  return {
    schema: DOCS_READINESS_SCHEMA,
    ready: failures.length === 0,
    requiredOperations: required.map(({ id, args }) => ({ id, args })),
    operations,
    failures
  };
}

export function parseMaxPaidCalls(value) {
  if (!/^\d+$/.test(String(value ?? ""))) throw new Error("--max-paid-calls must contain decimal digits");
  return Number(value);
}

export function parsePort(value) {
  if (!/^\d+$/.test(String(value ?? ""))) throw new Error("--port must contain decimal digits");
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("--port must be an integer from 1 through 65535");
  }
  return port;
}

export function assertRecoveryBudget(maxBudgetUsd) {
  if (maxBudgetUsd !== RECOVERY_COST_PLAN.hardCapUsd) {
    throw new Error(`--max-budget-usd must equal the reviewed recovery cap of $${RECOVERY_COST_PLAN.hardCapUsd.toFixed(2)}`);
  }
  return maxBudgetUsd;
}

export function implementationIdentity() {
  const files = [
    { label: "collect.mjs", filePath: path.join(HERE, "collect.mjs") },
    { label: "cli-args.mjs", filePath: path.join(HERE, "cli-args.mjs") },
    { label: "artifact.mjs", filePath: path.join(HERE, "artifact.mjs") },
    { label: "contract.mjs", filePath: path.join(HERE, "contract.mjs") },
    { label: "grade-results.mjs", filePath: path.join(HERE, "grade-results.mjs") },
    { label: "review-results.mjs", filePath: path.join(HERE, "review-results.mjs") },
    { label: "lint.mjs", filePath: path.join(HERE, "lint.mjs") },
    { label: "src/catalog/vendor/normalize.ts", filePath: path.join(REPO_ROOT, "src", "catalog", "vendor", "normalize.ts") }
  ];
  const records = files.map(({ label, filePath }) => `${label}\0${sha256(readFileSync(filePath))}`).join("\n");
  return {
    schema: "repository-recovery-implementation-v1",
    sha256: sha256(records),
    files: files.map(({ label }) => label)
  };
}

function exactPromptIdentity() {
  const sentinel = "__FROZEN_REPOSITORY_RECOVERY_QUESTION__";
  const prompt = agentPrompt(sentinel, { surface: "search-execute", searchTool: SEARCH_TOOL });
  return {
    schema: "qa-agent-prompt-v1",
    sha256: sha256(prompt),
    chars: prompt.length,
    questionSentinel: sentinel
  };
}

async function assertLiveIdentity({ port, expectedSurfaceSha256, serverRevision, baselineProcess }) {
  let live = null;
  let processIdentity = null;
  try {
    live = await probeLiveSurface(port, {
      surface: "search-execute",
      searchTool: SEARCH_TOOL,
      plainSurface: null
    });
    processIdentity = boundServerIdentity(port, serverRevision);
    const surfacePin = assertExpectedSurface(live.metrics, expectedSurfaceSha256, {
      label: "repository-recovery live MCP surface"
    });
    const sourceRevisionPin = assertExpectedSourceRevision(live.serverInfo, serverRevision, {
      label: "repository-recovery live Worker"
    });
    const processGuard = baselineProcess
      ? assertStableBoundServerIdentity(baselineProcess, processIdentity)
      : null;
    return { live, surfacePin, sourceRevisionPin, processIdentity, processGuard };
  } catch (error) {
    error.identityObservation = { live, processIdentity };
    throw error;
  }
}

function identityFailureRecord(error) {
  const observation = error?.identityObservation ?? null;
  return {
    code: error?.code ?? null,
    message: String(error?.message ?? error),
    surface: observation?.live?.metrics ?? null,
    serverInfo: observation?.live?.serverInfo ?? null,
    serverProcess: observation?.processIdentity ?? null
  };
}

function collectedRow(caseEntry, attempts, model, collectionStop = null) {
  const selected = [...attempts].reverse().find((attempt) =>
    hasSuccessfulAnswer(attempt.answer, attempt.agent?.failure)
  ) ?? attempts[attempts.length - 1];
  const projection = projectTranscript(selected?.transcript ?? []);
  return {
    id: caseEntry.id,
    class: caseEntry.class,
    question: caseEntry.question,
    answer: selected?.answer ?? "",
    transcript: selected?.transcript ?? [],
    toolCalls: projection.toolCalls,
    operations: projection.operations,
    operationParseErrors: projection.parseErrors,
    agent: {
      model,
      selectedAttempt: selected?.number ?? null,
      inputSha256: selected?.inputSha256 ?? null,
      answerSha256: selected?.answerSha256 ?? null,
      mcpServers: selected?.agent?.mcpServers ?? null,
      failure: selected?.agent?.failure ?? null,
      turns: selected?.agent?.turns ?? null,
      usage: selected?.agent?.usage ?? null,
      costUsd: selected?.costUsd ?? null
    },
    attempts: { answer: attempts },
    retryCount: Math.max(0, attempts.length - 1),
    collectionStop
  };
}

export async function collectRepositoryRecovery(options) {
  const {
    suite,
    port,
    model,
    maxBudgetUsd,
    maxPaidCalls,
    expectedSurfaceSha256,
    expectedAgentBinarySha256,
    serverRevision,
    collectorAuthor,
    orchestrator,
    outputPath,
    runAgentImpl = runAgent,
    executableIdentityImpl = executableIdentity,
    probeIdentityImpl = assertLiveIdentity,
    suiteLintImpl = (value) => lintSuite(value, loadManifest()),
    pinnedRevisionImpl = assertPinnedServerRevision,
    gitWorktreeIdentityImpl = gitWorktreeIdentity,
    sourceIdentityImpl = sourceIdentity,
    sourceIdentityGuardImpl = sourceIdentityGuard,
    agentEnvironmentIdentityImpl = agentEnvironmentIdentity,
    docsReadinessImpl = checkStellarDocsReadiness,
    environment = process.env
  } = options;
  assertRecoveryBudget(maxBudgetUsd);
  if (existsSync(outputPath)) throw new Error(`refusing to overwrite existing collection artifact: ${outputPath}`);
  const suiteErrors = suiteLintImpl(suite);
  if (suiteErrors.length) throw new Error(`suite lint failed: ${suiteErrors.join("; ")}`);
  assertRunPlan(suite.cases.map((entry) => entry.id), { label: "repository-recovery collection" });
  if (environment.QA_AGENT_PROMPT_APPEND?.trim()) {
    throw new Error("repository-recovery collection forbids QA_AGENT_PROMPT_APPEND");
  }
  answeringAgentIsolationArgs(environment);

  const pinnedRevision = pinnedRevisionImpl(serverRevision, REPO_ROOT);
  const runnerWorktree = gitWorktreeIdentityImpl(REPO_ROOT);
  if (runnerWorktree.dirty) throw new Error("repository-recovery collection requires a clean runner worktree");
  if (runnerWorktree.revision !== pinnedRevision) {
    throw new Error("repository-recovery collection requires the runner and server revision to match exactly");
  }
  const collectionSource = assertCollectionSourceIdentity(sourceIdentityImpl(pinnedRevision));
  const agentBinary = assertExpectedExecutable(
    executableIdentityImpl("claude"),
    expectedAgentBinarySha256,
    { label: "repository-recovery Claude CLI" }
  );
  const agentEnvironment = agentEnvironmentIdentityImpl(environment);
  const spendLedger = createSpendLedger(maxBudgetUsd);
  const callLedger = createPaidCallLedger(maxPaidCalls);
  const preflight = await probeIdentityImpl({
    port,
    expectedSurfaceSha256,
    serverRevision: pinnedRevision,
    baselineProcess: null
  });
  const docsReadiness = await docsReadinessImpl({ suite, port });
  const docsReadinessError = docsReadiness.ready ? null : readinessError(docsReadiness);

  const mcpDir = mkdtempSync(path.join(os.tmpdir(), "repo-recovery-mcp-"));
  const agentCwd = mkdtempSync(path.join(os.tmpdir(), "repo-recovery-agent-"));
  assertNeutralAgentCwd(agentCwd, { repoRoot: REPO_ROOT, label: "repository-recovery answering agent" });
  const mcpConfigPath = path.join(mcpDir, "mcp.json");
  writeFileSync(mcpConfigPath, JSON.stringify({
    mcpServers: {
      [REQUIRED_MCP_SERVER_NAME]: { type: "http", url: `http://localhost:${port}/mcp` }
    }
  }));

  const rows = [];
  const startedAt = new Date().toISOString();
  let collectionError = docsReadinessError;
  let finalIdentity = null;
  let identityFailure = null;
  try {
    if (docsReadinessError) throw docsReadinessError;
    for (const [caseIndex, caseEntry] of suite.cases.entries()) {
      const attempts = [];
      process.stdout.write(`[${caseIndex + 1}/${suite.cases.length}] ${caseEntry.id} … `);
      try {
        for (let attemptNumber = 1; attemptNumber <= MAX_ATTEMPTS_PER_CASE; attemptNumber++) {
          const authorization = authorizeSpend(spendLedger, {
            method: "repository-recovery-answer",
            id: caseEntry.id,
            attempt: attemptNumber
          });
          authorizePaidCall(callLedger, { id: caseEntry.id, attempt: attemptNumber });
          const attemptStartedAt = Date.now();
          const run = runAgentImpl(caseEntry.question, {
            surface: "search-execute",
            searchTool: SEARCH_TOOL,
            allowedTools: ["mcp__raven__search", "mcp__raven__execute"],
            mcpConfigPath,
            model,
            agentCwd,
            agentCommand: agentBinary.resolvedPath,
            maxBudgetUsd: authorization.maxBudgetUsd
          });
          const attempt = agentAttemptRecord(run, attemptNumber, Date.now() - attemptStartedAt);
          attempts.push(attempt);
          recordSpend(spendLedger, authorization, run.costUsd);
          try {
            finalIdentity = await probeIdentityImpl({
              port,
              expectedSurfaceSha256,
              serverRevision: pinnedRevision,
              baselineProcess: preflight.processIdentity
            });
          } catch (error) {
            identityFailure = identityFailureRecord(error);
            throw error;
          }
          assertStableGitWorktreeIdentity(runnerWorktree, gitWorktreeIdentityImpl(REPO_ROOT), {
            label: "repository-recovery runner worktree"
          });
          if (isRequiredMcpServerFailure(run.failure)) {
            const error = new Error(`Raven disconnected during ${caseEntry.id}: ${run.failure.reason}`);
            error.code = "raven-disconnected";
            throw error;
          }
          if (attemptNumber === 1 && isRetryableAgentFailure(run.failure)) continue;
          break;
        }
        if (attempts.length > 1 && attempts.some((attempt) => attempt.inputSha256 !== attempts[0].inputSha256)) {
          throw new Error(`transport retry changed the answering prompt for ${caseEntry.id}`);
        }
        const row = collectedRow(caseEntry, attempts, model);
        rows.push(row);
        console.log(`${row.agent.failure ? row.agent.failure.class : "answered"} (${attempts.length} attempt(s))`);
      } catch (error) {
        if (attempts.length > 0) {
          rows.push(collectedRow(caseEntry, attempts, model, {
            code: error?.code ?? null,
            message: String(error?.message ?? error),
            afterPaidCall: true
          }));
        }
        throw error;
      }
    }
  } catch (error) {
    collectionError = error;
  } finally {
    rmSync(mcpDir, { recursive: true, force: true });
    rmSync(agentCwd, { recursive: true, force: true });
  }

  finalIdentity = null;
  try {
    finalIdentity = await probeIdentityImpl({
      port,
      expectedSurfaceSha256,
      serverRevision: pinnedRevision,
      baselineProcess: preflight.processIdentity
    });
  } catch (error) {
    identityFailure ??= identityFailureRecord(error);
    collectionError ??= error;
  }
  const finalSource = sourceIdentityImpl(pinnedRevision);
  const sourceGuard = sourceIdentityGuardImpl(collectionSource, finalSource);
  if (!sourceGuard.matches) collectionError ??= new Error(`source identity changed: ${sourceGuard.changedKeys.join(", ")}`);
  const completeness = runCompleteness({
    expectedIds: suite.cases.map((entry) => entry.id),
    rows,
    judging: false
  });
  const comparable = !collectionError && completeness.complete;
  const artifact = {
    artifactSchema: COLLECTION_SCHEMA,
    ...suiteIdentity(suite),
    meta: {
      startedAt,
      finishedAt: new Date().toISOString(),
      comparable,
      comparabilityReasons: [
        ...(collectionError ? [String(collectionError.message ?? collectionError)] : []),
        ...completeness.reasons
      ],
      completeness,
      unattemptedIds: suite.cases.map((entry) => entry.id).filter((id) => !rows.some((row) => row.id === id)),
      answering: {
        model,
        prompt: exactPromptIdentity(),
        binary: agentBinary,
        environment: agentEnvironment,
        isolation: answeringAgentIsolationRecord(),
        cwdOutsideRepository: true
      },
      roles: { collectorAuthor, orchestrator },
      serverRevision: pinnedRevision,
      surfaceSha256: preflight.live.metrics.surfaceSha256,
      docsReadiness,
      serverInfo: preflight.live.serverInfo,
      surfaceAfter: finalIdentity?.live.metrics ?? identityFailure?.surface ?? null,
      serverInfoAfter: finalIdentity?.live.serverInfo ?? identityFailure?.serverInfo ?? null,
      surfacePin: preflight.surfacePin,
      surfacePinAfter: finalIdentity?.surfacePin ?? null,
      sourceRevisionPin: preflight.sourceRevisionPin,
      sourceRevisionPinAfter: finalIdentity?.sourceRevisionPin ?? null,
      serverProcess: preflight.processIdentity,
      serverProcessAfter: finalIdentity?.processIdentity ?? identityFailure?.serverProcess ?? null,
      serverProcessGuard: finalIdentity?.processGuard ?? null,
      identityFailure,
      sourceIdentity: collectionSource,
      sourceIdentityGuard: sourceGuard,
      implementation: implementationIdentity(),
      budget: spendLedgerRecord(spendLedger),
      paidCalls: paidCallLedgerRecord(callLedger),
      retryPolicy: {
        maximumAttemptsPerCase: MAX_ATTEMPTS_PER_CASE,
        retryableFailureClasses: ["transport"],
        byteIdenticalPromptRequired: true
      }
    },
    rows
  };
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(artifact, null, 2) + "\n");
  console.log(`wrote ${outputPath} · sha256 ${artifactSha256(artifact)}`);
  if (collectionError) throw collectionError;
  return artifact;
}

async function main(args) {
  const suitePath = path.resolve(argValue(args, "--suite") ?? DEFAULT_SUITE_PATH);
  const serverRevision = requiredArg(args, "--server-revision");
  const maxPaidCalls = parseMaxPaidCalls(requiredArg(args, "--max-paid-calls"));
  const maxBudgetUsd = assertRecoveryBudget(
    parseRequiredBudgetFlag(args, { label: "repository-recovery collection" })
  );
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outputPath = path.resolve(argValue(args, "--output") ?? path.join(HERE, "results", `${stamp}-collection.json`));
  await collectRepositoryRecovery({
    suite: loadSuite(suitePath),
    port: parsePort(argValue(args, "--port") ?? 8788),
    model: argValue(args, "--model") ?? DEFAULT_MODEL,
    maxBudgetUsd,
    maxPaidCalls,
    expectedSurfaceSha256: requiredArg(args, "--expect-sha256"),
    expectedAgentBinarySha256: requiredArg(args, "--expect-agent-binary-sha256"),
    serverRevision,
    collectorAuthor: requiredArg(args, "--collector-author"),
    orchestrator: requiredArg(args, "--orchestrator"),
    outputPath
  });
}

const isMain = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isMain) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(`repository-recovery collection failed: ${error.message}`);
    process.exitCode = 1;
  });
}
