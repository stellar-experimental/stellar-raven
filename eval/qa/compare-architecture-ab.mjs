#!/usr/bin/env node
/**
 * Compare the search+execute and manifest-derived per-operation QA arms using
 * the metrics pre-registered for Solo todo 903. Full result/transcript files
 * stay local and gitignored; this writes a local comparison sidecar whose
 * stamped aggregates are copied into the committed eval record after review.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { extractPlainOperationTool, gradeRow, loadRunnerOps, summarizePlan } from "../plan/grade-plan.mjs";
import { AGENT_RESULT_SCHEMA } from "./agent-result.mjs";

const TRUNCATION_MARKERS = ["--- TRUNCATED ---", "--- SOURCE BASIS ---"];

function scoreOf(row) {
  return row.verdict?.score ?? "error";
}

function isRavenTool(entry) {
  return /^mcp__raven__/.test(String(entry?.tool ?? ""));
}

function isSearchTool(entry) {
  return /^mcp__raven__search$/.test(String(entry?.tool ?? ""));
}

function isExecuteTool(entry) {
  return String(entry?.tool ?? "").endsWith("execute");
}

function resultIsTruncated(result) {
  return TRUNCATION_MARKERS.some((marker) => String(result ?? "").includes(marker));
}

function resultIsError(entry) {
  const result = String(entry?.result ?? "");
  return Boolean(
    entry?.isError ||
      result.startsWith("Execution failed:") ||
      result.startsWith("Plain operation proxy failed:")
  );
}

function visibleEnvelopeOutcome(result) {
  if (typeof result !== "string" || resultIsTruncated(result)) return null;
  const consoleAt = result.indexOf("\n\n--- console (");
  const body = consoleAt >= 0 ? result.slice(0, consoleAt) : result;
  try {
    const parsed = JSON.parse(body);
    if (parsed?.ok === true && Object.hasOwn(parsed, "data")) return "ok";
    if (parsed?.ok === false && parsed?.error?.kind === "soft-empty") return "soft-empty";
    if (parsed?.ok === false && parsed?.error) return "error";
  } catch {
    // Execute scripts may return arbitrary projections; not an envelope.
  }
  return null;
}

function addNumericUsage(target, source) {
  if (!source || typeof source !== "object") return target;
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === "number") target[key] = (target[key] ?? 0) + value;
    else if (value && typeof value === "object" && !Array.isArray(value)) {
      target[key] = addNumericUsage(target[key] ?? {}, value);
    }
  }
  return target;
}

function finiteOrNull(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function sumCosts(values) {
  return Number(values.reduce((total, value) => total + value, 0).toFixed(12));
}

export function analyzeArchitectureRow(row) {
  const transcript = row.transcript ?? [];
  let searchCalls = 0;
  let executeCalls = 0;
  let operationToolCalls = 0;
  let toolResultChars = 0;
  let truncatedToolResults = 0;
  let toolErrors = 0;
  const visibleEnvelopes = { ok: 0, error: 0, "soft-empty": 0 };
  for (const entry of transcript) {
    if (isSearchTool(entry)) searchCalls++;
    if (isExecuteTool(entry)) executeCalls++;
    if (extractPlainOperationTool(entry.tool)) operationToolCalls++;
    if (typeof entry.result === "string") {
      toolResultChars += entry.result.length;
      if (resultIsTruncated(entry.result)) truncatedToolResults++;
      if (resultIsError(entry)) toolErrors++;
      const outcome = visibleEnvelopeOutcome(entry.result);
      if (outcome) visibleEnvelopes[outcome]++;
    } else if (entry.isError) {
      toolErrors++;
    }
  }
  const ravenToolCalls = transcript.filter(isRavenTool).length;
  const agentError = Boolean(row.agent?.failure);
  const judgeExpected = Boolean(row.answer) && !agentError;
  const agentCostUsd = finiteOrNull(row.agent?.costUsd);
  const judgeCostUsd = judgeExpected ? finiteOrNull(row.verdict?.costUsd) : null;
  return {
    id: row.id,
    truth: row.truth ?? null,
    verdict: scoreOf(row),
    turns: row.agent?.turns ?? null,
    agentCostUsd,
    judgeCostUsd,
    totalCostUsd:
      agentCostUsd !== null && (!judgeExpected || judgeCostUsd !== null)
        ? agentCostUsd + (judgeCostUsd ?? 0)
        : null,
    promptChars: row.agent?.promptChars ?? null,
    // Post-parser rows carry the provider's final usage under agent.usage.final
    // (agent.usage.perTurn holds the per-turn numeric series).
    usage: row.agent?.usage?.final ?? null,
    transcriptToolCalls: transcript.length,
    ravenToolCalls,
    harnessToolCalls: transcript.length - ravenToolCalls,
    searchCalls,
    executeCalls,
    operationToolCalls,
    toolResultChars,
    truncatedToolResults,
    toolErrors,
    agentError,
    agentFailureClass: row.agent?.failure?.class ?? null,
    judgeExpected,
    judgeError: judgeExpected && scoreOf(row) === "error",
    visibleEnvelopes
  };
}

export function summarizeArchitecture(rows) {
  const analyzed = rows.map(analyzeArchitectureRow);
  const sum = (field) => analyzed.reduce((total, row) => total + (row[field] ?? 0), 0);
  const reported = (field, candidates = analyzed) =>
    candidates.map((row) => row[field]).filter((value) => value !== null);
  const meanReported = (field) => {
    const values = reported(field);
    return values.length ? values.reduce((total, value) => total + value, 0) / values.length : null;
  };
  const verdicts = { correct: 0, partial: 0, wrong: 0, error: 0 };
  const visibleEnvelopes = { ok: 0, error: 0, "soft-empty": 0 };
  const agentUsage = {};
  const agentFailureClasses = {};
  for (const row of analyzed) {
    verdicts[row.verdict in verdicts ? row.verdict : "error"]++;
    for (const key of Object.keys(visibleEnvelopes)) visibleEnvelopes[key] += row.visibleEnvelopes[key];
    addNumericUsage(agentUsage, row.usage);
    if (row.agentFailureClass) {
      agentFailureClasses[row.agentFailureClass] = (agentFailureClasses[row.agentFailureClass] ?? 0) + 1;
    }
  }
  const judged = analyzed.filter((row) => row.judgeExpected);
  const reportedAgentCosts = reported("agentCostUsd");
  const reportedJudgeCosts = reported("judgeCostUsd", judged);
  const missingAgentCosts = analyzed.length - reportedAgentCosts.length;
  const missingJudgeCosts = judged.length - reportedJudgeCosts.length;
  const agentCostUsd = sumCosts(reportedAgentCosts);
  const judgeCostUsd = sumCosts(reportedJudgeCosts);
  return {
    cases: analyzed.length,
    verdicts,
    meanTurns: meanReported("turns"),
    agentCostUsd,
    judgeCostUsd,
    totalCostUsd: sumCosts([agentCostUsd, judgeCostUsd]),
    costAccounting: {
      agent: {
        expected: analyzed.length,
        reported: reportedAgentCosts.length,
        missing: missingAgentCosts
      },
      judge: {
        expected: judged.length,
        reported: reportedJudgeCosts.length,
        missing: missingJudgeCosts
      },
      totalCostIsLowerBound: missingAgentCosts + missingJudgeCosts > 0
    },
    agentUsage,
    agentFailureClasses,
    meanPromptChars: meanReported("promptChars"),
    transcriptToolCalls: sum("transcriptToolCalls"),
    ravenToolCalls: sum("ravenToolCalls"),
    harnessToolCalls: sum("harnessToolCalls"),
    searchCalls: sum("searchCalls"),
    executeCalls: sum("executeCalls"),
    operationToolCalls: sum("operationToolCalls"),
    capturedToolResultChars: sum("toolResultChars"),
    capturedToolResultScope:
      "execute and direct-operation bodies only; search result bodies are not captured, so this value is not comparable across arms",
    truncatedToolResults: sum("truncatedToolResults"),
    truncatedCases: analyzed.filter((row) => row.truncatedToolResults > 0).length,
    toolErrors: sum("toolErrors"),
    agentErrors: analyzed.filter((row) => row.agentError).length,
    judgeErrors: analyzed.filter((row) => row.judgeError).length,
    visibleEnvelopes
  };
}

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function planPathFor(resultsPath) {
  return resultsPath.replace(/\.json$/, ".plan.json");
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export async function verifyPlanSourceAssociation(label, plan, resultsPath, results, planPath = null) {
  const fail = (message) => {
    throw new Error(`incomparable A/B inputs: ${label} ${message}`);
  };
  if (typeof plan?.meta?.resultsPath !== "string") fail("plan has no meta.resultsPath");
  if (path.resolve(plan.meta.resultsPath) !== path.resolve(resultsPath)) {
    fail("plan meta.resultsPath does not identify the compared results");
  }

  const sourceText = readFileSync(resultsPath, "utf8");
  let sourceFromDisk;
  try {
    sourceFromDisk = JSON.parse(sourceText);
  } catch (error) {
    fail(`results are not valid JSON: ${error.message}`);
  }
  if (JSON.stringify(sourceFromDisk) !== JSON.stringify(results)) {
    fail("parsed results do not match meta.resultsPath");
  }
  let planSha256 = null;
  if (planPath) {
    const planText = readFileSync(planPath, "utf8");
    let planFromDisk;
    try {
      planFromDisk = JSON.parse(planText);
    } catch (error) {
      fail(`plan is not valid JSON: ${error.message}`);
    }
    if (JSON.stringify(planFromDisk) !== JSON.stringify(plan)) {
      fail("parsed plan does not match the saved sidecar");
    }
    planSha256 = sha256(planText);
  }

  const rulesPath = plan.meta.rulesPath;
  const opClassesPath = plan.meta.opClassesPath;
  if (typeof rulesPath !== "string" || typeof opClassesPath !== "string") {
    fail("plan has no exact rulesPath or opClassesPath");
  }
  const rules = JSON.parse(readFileSync(rulesPath, "utf8"));
  const opClasses = JSON.parse(readFileSync(opClassesPath, "utf8")).classes;
  if (plan.meta.rulesVersion !== rules.version) fail("plan rulesVersion does not match rulesPath");

  const { runnerOps } = await loadRunnerOps();
  if (runnerOps) {
    const expectedRunnerIds = Object.keys(runnerOps).sort();
    if (JSON.stringify(plan.meta.runnerRegistry?.runnableIds) !== JSON.stringify(expectedRunnerIds)) {
      fail("plan runner registry does not match the current exact registry");
    }
  } else if (!plan.meta.runnerRegistry?.absent) {
    fail("plan runner registry claims runners when the current registry is absent");
  }

  const expectedRows = results.rows.map((row) => gradeRow(row, rules, opClasses, runnerOps));
  if (JSON.stringify(plan.rows) !== JSON.stringify(expectedRows)) {
    fail("plan rows do not match source results");
  }
  const expectedSummary = summarizePlan(expectedRows);
  if (JSON.stringify(plan.summary) !== JSON.stringify(expectedSummary)) {
    fail("plan summary does not match source results");
  }
  return {
    sourceResultsSha256: sha256(sourceText),
    ...(planSha256 ? { planSha256 } : {})
  };
}

function assertComparable(search, perOperation) {
  const fail = (message) => {
    throw new Error(`incomparable A/B inputs: ${message}`);
  };
  if (search.meta?.surface !== "search-execute") fail(`first surface is ${search.meta?.surface}`);
  if (perOperation.meta?.surface !== "per-operation") fail(`second surface is ${perOperation.meta?.surface}`);
  // This reader knows exactly ONE row shape: the post-parser one
  // (agent.usage.final, agent.failure). Any other artifact — older, newer, or
  // unstamped — would compare as empty usage and zero agent errors, a false
  // clean bill rather than a refusal. Agreement between the arms is not enough;
  // both must be the schema this reader actually understands.
  for (const [label, meta] of [
    ["first", search.meta],
    ["second", perOperation.meta]
  ]) {
    if (meta?.resultsSchema !== AGENT_RESULT_SCHEMA) {
      fail(
        `${label} artifact has meta.resultsSchema ${JSON.stringify(meta?.resultsSchema ?? null)}, this reader requires ${JSON.stringify(AGENT_RESULT_SCHEMA)} — its usage/failure fields cannot be read otherwise; re-collect`
      );
    }
    if (!/^[a-f0-9]{40}$/i.test(meta?.sourceIdentity?.serverRevision ?? "")) {
      fail(`${label} artifact has no immutable serverRevision`);
    }
    if (!/^[a-f0-9]{64}$/.test(meta?.sourceIdentity?.qaImplementationSha256 ?? "")) {
      fail(`${label} artifact has no exact qaImplementationSha256`);
    }
    if (meta?.sourceIdentityGuard?.matches !== true) {
      fail(`${label} artifact has no passing sourceIdentityGuard`);
    }
  }
  for (const key of ["model", "judgeModel", "judgeRubric", "packVersion", "casesPath", "caseContract", "sampleN"]) {
    if (search.meta?.[key] !== perOperation.meta?.[key]) {
      fail(`${key} differs (${JSON.stringify(search.meta?.[key])} vs ${JSON.stringify(perOperation.meta?.[key])})`);
    }
  }
  const searchIds = search.rows.map((row) => row.id);
  const perOperationIds = perOperation.rows.map((row) => row.id);
  if (JSON.stringify(searchIds) !== JSON.stringify(perOperationIds)) fail("case ids/order differ");
  if (JSON.stringify(search.meta?.inputSnapshot) !== JSON.stringify(perOperation.meta?.inputSnapshot)) {
    fail("input snapshots differ");
  }
  for (const key of ["sourceIdentity", "promptAppend"]) {
    if (JSON.stringify(search.meta?.[key]) !== JSON.stringify(perOperation.meta?.[key])) {
      fail(`${key} differs`);
    }
  }
}

function assertPlanComplete(label, plan, expectedIds) {
  if (!plan || !Array.isArray(plan.rows)) {
    throw new Error(`incomparable A/B inputs: ${label} plan rows are missing`);
  }
  const planIds = plan.rows.map((row) => row.id);
  if (JSON.stringify(planIds) !== JSON.stringify(expectedIds)) {
    throw new Error(`incomparable A/B inputs: ${label} plan row ids/order differ`);
  }
  if (plan.summary?.cases !== expectedIds.length) {
    throw new Error(`incomparable A/B inputs: ${label} plan summary cases differ`);
  }
}

export function compareArchitectureResults({ search, perOperation, searchPlan, perOperationPlan }) {
  assertComparable(search, perOperation);
  const expectedIds = search.rows.map((row) => row.id);
  assertPlanComplete("search+execute", searchPlan, expectedIds);
  assertPlanComplete("per-operation", perOperationPlan, expectedIds);
  const searchById = new Map(search.rows.map((row) => [row.id, row]));
  const searchPlanById = new Map(searchPlan.rows.map((row) => [row.id, row]));
  const perOperationPlanById = new Map(perOperationPlan.rows.map((row) => [row.id, row]));
  const transitions = {};
  const rows = perOperation.rows.map((row) => {
    const left = searchById.get(row.id);
    const transition = `${scoreOf(left)}→${scoreOf(row)}`;
    transitions[transition] = (transitions[transition] ?? 0) + 1;
    return {
      id: row.id,
      searchExecute: {
        ...analyzeArchitectureRow(left),
        planRequiredCovered: searchPlanById.get(row.id)?.requiredCovered ?? null,
        planOnPlanRatio: searchPlanById.get(row.id)?.onPlanRatio ?? null
      },
      perOperation: {
        ...analyzeArchitectureRow(row),
        planRequiredCovered: perOperationPlanById.get(row.id)?.requiredCovered ?? null,
        planOnPlanRatio: perOperationPlanById.get(row.id)?.onPlanRatio ?? null
      }
    };
  });
  return {
    meta: {
      comparedAt: new Date().toISOString(),
      model: search.meta.model,
      judgeModel: search.meta.judgeModel,
      judgeRubric: search.meta.judgeRubric,
      packVersion: search.meta.packVersion,
      casesPath: search.meta.casesPath,
      caseContract: search.meta.caseContract,
      sampleN: search.meta.sampleN,
      promptAppend: search.meta.promptAppend,
      sourceIdentity: search.meta.sourceIdentity,
      caseCount: rows.length,
      metricLimitations: {
        advertisedWireSurface:
          "tool-surface character counts describe serialized MCP wire definitions, not model-consumed context; use agent usage/cache tokens for consumption",
        capturedToolResultChars:
          "search result bodies are absent from search+execute transcripts, so captured result characters are excluded from cross-arm interpretation"
      }
    },
    searchExecute: {
      toolSurface: search.meta.toolSurface,
      metrics: summarizeArchitecture(search.rows),
      plan: searchPlan.summary
    },
    perOperation: {
      toolSurface: perOperation.meta.toolSurface,
      metrics: summarizeArchitecture(perOperation.rows),
      plan: perOperationPlan.summary
    },
    verdictTransitions: transitions,
    rows
  };
}

function tableRow(label, arm) {
  const m = arm.metrics;
  const v = m.verdicts;
  const p = arm.plan;
  return {
    arm: label,
    verdicts: `${v.correct}C/${v.partial}P/${v.wrong}W/${v.error}E`,
    turns: m.meanTurns?.toFixed(2) ?? "n/a",
    totalCostUsd: `${m.totalCostUsd.toFixed(3)}${m.costAccounting.totalCostIsLowerBound ? "+ lower-bound" : ""}`,
    toolCount: arm.toolSurface?.toolCount ?? "n/a",
    advertisedWireChars: arm.toolSurface?.advertisedWireChars ?? arm.toolSurface?.contextChars ?? "n/a",
    toolCalls: m.ravenToolCalls,
    truncations: `${m.truncatedToolResults} (${m.truncatedCases} cases)`,
    errors: `${m.toolErrors} tool/${m.agentErrors} agent/${m.judgeErrors} judge`,
    plan: `${p.requiredCoveredCount}/${p.cases}`
  };
}

async function main() {
  const [searchPath, perOperationPath] = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
  if (!searchPath || !perOperationPath) {
    throw new Error("usage: compare-architecture-ab.mjs <search-execute-results.json> <per-operation-results.json>");
  }
  const searchPlanPath = planPathFor(searchPath);
  const perOperationPlanPath = planPathFor(perOperationPath);
  for (const file of [searchPlanPath, perOperationPlanPath]) {
    if (!existsSync(file)) throw new Error(`missing plan sidecar: ${file}`);
  }
  const search = readJson(searchPath);
  const perOperation = readJson(perOperationPath);
  const searchPlan = readJson(searchPlanPath);
  const perOperationPlan = readJson(perOperationPlanPath);
  const searchPlanAssociation = await verifyPlanSourceAssociation(
    "search+execute",
    searchPlan,
    searchPath,
    search,
    searchPlanPath
  );
  const perOperationPlanAssociation = await verifyPlanSourceAssociation(
    "per-operation",
    perOperationPlan,
    perOperationPath,
    perOperation,
    perOperationPlanPath
  );
  const comparison = compareArchitectureResults({ search, perOperation, searchPlan, perOperationPlan });
  comparison.meta.planSourceAssociations = {
    searchExecute: searchPlanAssociation,
    perOperation: perOperationPlanAssociation
  };
  comparison.meta.searchResultsPath = searchPath;
  comparison.meta.perOperationResultsPath = perOperationPath;
  comparison.meta.searchPlanPath = searchPlanPath;
  comparison.meta.perOperationPlanPath = perOperationPlanPath;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outPath = searchPath.replace(/[^/]+$/, `${stamp}-architecture-ab.json`);
  writeFileSync(outPath, `${JSON.stringify(comparison, null, 2)}\n`);
  console.table([
    tableRow("search+execute", comparison.searchExecute),
    tableRow("per-operation", comparison.perOperation)
  ]);
  console.log(`verdict transitions: ${JSON.stringify(comparison.verdictTransitions)}`);
  console.log(`wrote ${outPath}`);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) await main();
