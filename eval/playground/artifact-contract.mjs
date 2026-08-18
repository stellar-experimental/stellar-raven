import { createHash } from "node:crypto";

export const PLAYGROUND_ARTIFACT_CONTRACT = "playground-semantic-result/v2";
export const PLAYGROUND_QUARANTINE_CONTRACT = "playground-semantic-quarantine/v1";
export const PLAYGROUND_INPUT_SNAPSHOT_CONTRACT = "playground-semantic-input/v1";
export const PLAYGROUND_ROUND_CAP_CONTRACT = "playground-semantic-round-cap/v1";
export const PLAYGROUND_LANE = "playground-semantic-v1";

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function sha256Json(value) {
  return sha256(JSON.stringify(value));
}

export function treeGenerationSha256(tree) {
  return sha256Json({
    headRevision: tree.headRevision,
    trackedDiffSha256: tree.trackedDiffSha256,
    untrackedFilesSha256: tree.untrackedFilesSha256
  });
}

export function assertModelBackedRunInputs({ serverGeneration, roundCapContext }) {
  if (typeof serverGeneration !== "string" || !/^[a-f0-9]{64}$/.test(serverGeneration)) {
    throw new Error(
      "--server-generation is required for a model-backed run and must be a lowercase SHA-256 operator assertion"
    );
  }
  if (typeof roundCapContext !== "string" || !roundCapContext) {
    throw new Error(`--round-cap-context is required for a model-backed run (${PLAYGROUND_ROUND_CAP_CONTRACT})`);
  }
}

export function buildPlaygroundArtifactMeta({
  run,
  answering,
  judge,
  capContext,
  inputFiles,
  selectedCases,
  tree,
  server
}) {
  const inputSnapshot = {
    contract: PLAYGROUND_INPUT_SNAPSHOT_CONTRACT,
    casesSha256: sha256Json(selectedCases),
    caseIdsSha256: sha256Json(selectedCases.map((item) => item.id)),
    corpusFileSha256: inputFiles.corpusFileSha256,
    manifestFileSha256: inputFiles.manifestFileSha256,
    superSpecFileSha256: inputFiles.superSpecFileSha256,
    runnerFileSha256: inputFiles.runnerFileSha256,
    modelConfigFileSha256: inputFiles.modelConfigFileSha256,
    judgeFileSha256: inputFiles.judgeFileSha256,
    evidencePackFileSha256: inputFiles.evidencePackFileSha256,
    tree,
    serverGenerationSha256: server.generationSha256,
    answeringConfigSha256: sha256Json(answering),
    judgeTupleSha256: sha256Json(judge),
    capContextSha256: sha256Json(capContext)
  };

  const meta = {
    artifactContract: PLAYGROUND_ARTIFACT_CONTRACT,
    lane: PLAYGROUND_LANE,
    transport: "POST /playground/chat SSE",
    authentication: "run-scoped signed demo cookie (loopback only)",
    ...run,
    server,
    answering,
    judge,
    capContext,
    inputSnapshot
  };
  assertPlaygroundArtifactMeta(meta);
  return meta;
}

export function assertPlaygroundArtifactMeta(meta) {
  const fail = (message) => {
    throw new Error(`invalid ${PLAYGROUND_ARTIFACT_CONTRACT}: ${message}`);
  };
  const requiredString = (value, field) => {
    if (typeof value !== "string" || !value) fail(`${field} is required`);
  };
  const requiredSha = (value, field) => {
    requiredString(value, field);
    if (!/^[a-f0-9]{64}$/.test(value)) fail(`${field} must be a lowercase SHA-256`);
  };

  if (!meta || typeof meta !== "object") fail("meta must be an object");
  if (meta.artifactContract !== PLAYGROUND_ARTIFACT_CONTRACT) {
    fail(`artifactContract must be ${PLAYGROUND_ARTIFACT_CONTRACT}`);
  }
  if (meta.lane !== PLAYGROUND_LANE) fail(`lane must be ${PLAYGROUND_LANE}`);

  const answering = meta.answering;
  if (!answering || typeof answering !== "object") fail("answering is required");
  requiredString(answering.primaryModel, "answering.primaryModel");
  if (!Array.isArray(answering.fallbackModels)) fail("answering.fallbackModels must be an explicit array");
  if (answering.fallbackModels.some((model) => typeof model !== "string" || !model)) {
    fail("answering.fallbackModels must contain only non-empty model ids");
  }
  if (!Array.isArray(answering.models) || answering.models.length === 0) {
    fail("answering.models must contain the ordered primary/fallback attempts");
  }
  if (answering.models[0]?.model !== answering.primaryModel || answering.models[0]?.role !== "primary") {
    fail("answering.models must begin with answering.primaryModel as primary");
  }
  const modelFallbacks = answering.models.slice(1).map((entry) => entry?.model);
  if (JSON.stringify(modelFallbacks) !== JSON.stringify(answering.fallbackModels)) {
    fail("answering.fallbackModels does not match ordered answering.models");
  }
  requiredString(answering.apiMode?.requested, "answering.apiMode.requested");
  requiredString(answering.apiMode?.effective, "answering.apiMode.effective");
  requiredString(answering.reasoningEffort?.value, "answering.reasoningEffort.value");
  requiredString(answering.reasoningEffort?.source, "answering.reasoningEffort.source");
  if (typeof answering.temperature !== "number" || !Number.isFinite(answering.temperature)) {
    fail("answering.temperature must be a finite number");
  }
  requiredString(answering.configurationBasis, "answering.configurationBasis");
  if (answering.runtimeIntrospection !== "not-available" || answering.observedAttemptedModels !== null) {
    fail("answering must explicitly record unavailable runtime attempt introspection");
  }
  requiredString(answering.proofLimit, "answering.proofLimit");

  const judge = meta.judge;
  if (!judge || typeof judge !== "object" || typeof judge.enabled !== "boolean") {
    fail("judge.enabled is required");
  }
  if (judge.enabled) {
    requiredString(judge.model, "judge.model");
    requiredString(judge.rubric, "judge.rubric");
  } else if (judge.model !== null || judge.rubric !== null) {
    fail("disabled judge must use explicit null model and rubric");
  }
  requiredString(judge.packVersion, "judge.packVersion");
  if (judge.temperature?.value !== null || judge.temperature?.semantics !== "provider-default-unpinned") {
    fail("judge.temperature must explicitly record the unpinned provider default");
  }

  const caps = meta.capContext;
  if (!caps || typeof caps !== "object" || !caps.demo || !caps.evaluator) {
    fail("capContext.demo and capContext.evaluator are required");
  }
  for (const field of [
    "maxSteps",
    "maxOutputTokens",
    "maxHistoryMessages",
    "maxHistoryChars",
    "maxSearchLimit",
    "maxSearchCallsPerTurn",
    "maxExecuteCallsPerTurn",
    "maxExecuteCodeChars",
    "maxUserMessageChars",
    "chatsPerHour"
  ]) {
    if (!Number.isInteger(caps.demo[field]) || caps.demo[field] <= 0) fail(`capContext.demo.${field} is required`);
  }
  if (!Number.isInteger(caps.evaluator.timeoutMs) || caps.evaluator.timeoutMs <= 0) {
    fail("capContext.evaluator.timeoutMs is required");
  }
  if (!Number.isInteger(caps.evaluator.maxCasesPerRunSubject) || caps.evaluator.maxCasesPerRunSubject <= 0) {
    fail("capContext.evaluator.maxCasesPerRunSubject is required");
  }
  if (caps.evaluator.answerCallsThisRun !== caps.evaluator.selectedCases) {
    fail("capContext.evaluator.answerCallsThisRun must equal selectedCases");
  }
  if (![0, caps.evaluator.selectedCases].includes(caps.evaluator.judgeCallsThisRun)) {
    fail("capContext.evaluator.judgeCallsThisRun must be zero or selectedCases");
  }
  assertRoundCapContext(caps.roundAuthorization, caps.evaluator, fail);

  const snapshot = meta.inputSnapshot;
  if (!snapshot || typeof snapshot !== "object") fail("inputSnapshot is required");
  if (snapshot.contract !== PLAYGROUND_INPUT_SNAPSHOT_CONTRACT) {
    fail(`inputSnapshot.contract must be ${PLAYGROUND_INPUT_SNAPSHOT_CONTRACT}`);
  }
  for (const field of [
    "casesSha256",
    "caseIdsSha256",
    "corpusFileSha256",
    "manifestFileSha256",
    "superSpecFileSha256",
    "runnerFileSha256",
    "modelConfigFileSha256",
    "judgeFileSha256",
    "evidencePackFileSha256",
    "serverGenerationSha256",
    "answeringConfigSha256",
    "judgeTupleSha256",
    "capContextSha256"
  ]) {
    requiredSha(snapshot[field], `inputSnapshot.${field}`);
  }

  const tree = snapshot.tree;
  if (!tree || typeof tree !== "object") fail("inputSnapshot.tree is required");
  requiredString(tree.headRevision, "inputSnapshot.tree.headRevision");
  if (typeof tree.dirty !== "boolean") fail("inputSnapshot.tree.dirty is required");
  for (const field of ["statusSha256", "trackedDiffSha256", "untrackedFilesSha256", "generationSha256"]) {
    requiredSha(tree[field], `inputSnapshot.tree.${field}`);
  }
  if (tree.generationSha256 !== treeGenerationSha256(tree)) {
    fail("inputSnapshot.tree.generationSha256 does not match the tree components");
  }

  const server = meta.server;
  if (!server || typeof server !== "object") fail("server is required");
  requiredString(server.endpoint, "server.endpoint");
  if (server.generationBasis !== "operator-asserted-local-working-tree") {
    fail("server.generationBasis must explicitly be operator-asserted-local-working-tree");
  }
  requiredSha(server.generationSha256, "server.generationSha256");
  requiredSha(server.operatorAssertionSha256, "server.operatorAssertionSha256");
  if (server.operatorAssertionSha256 !== server.generationSha256) {
    fail("server operator assertion must match server.generationSha256");
  }
  if (server.runtimeIntrospection !== "not-available") {
    fail("server.runtimeIntrospection must honestly be not-available");
  }
  requiredString(server.proofLimit, "server.proofLimit");
  if (server.generationSha256 !== tree.generationSha256) {
    fail("server generation does not match the pinned local working-tree generation");
  }
  if (snapshot.serverGenerationSha256 !== server.generationSha256) {
    fail("inputSnapshot.serverGenerationSha256 does not match server.generationSha256");
  }
  if (snapshot.answeringConfigSha256 !== sha256Json(answering)) {
    fail("inputSnapshot.answeringConfigSha256 does not match answering");
  }
  if (snapshot.judgeTupleSha256 !== sha256Json(judge)) {
    fail("inputSnapshot.judgeTupleSha256 does not match judge");
  }
  if (snapshot.capContextSha256 !== sha256Json(caps)) {
    fail("inputSnapshot.capContextSha256 does not match capContext");
  }
}

const QUARANTINE_ALLOWED_USES = ["spend-reconciliation", "runner-forensics"];
const QUARANTINE_PROHIBITED_USES = [
  "factual-evidence",
  "upstream-finding-evidence",
  "eval-result",
  "causal-claim",
  "scoring",
  "rejudge",
  "aggregation",
  "comparison",
  "ordinary-result-claim"
];

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function assertNonNegativeInteger(value, field, fail) {
  if (!Number.isInteger(value) || value < 0) fail(`${field} must be a non-negative integer`);
}

function assertExactArray(value, expected, field, fail) {
  if (JSON.stringify(value) !== JSON.stringify(expected)) fail(`${field} must be ${JSON.stringify(expected)}`);
}

function assertTree(tree, field, fail) {
  if (!tree || typeof tree !== "object") fail(`${field} must be an object`);
  if (typeof tree.headRevision !== "string" || !tree.headRevision) fail(`${field}.headRevision is required`);
  if (typeof tree.dirty !== "boolean") fail(`${field}.dirty is required`);
  for (const key of ["statusSha256", "trackedDiffSha256", "untrackedFilesSha256", "generationSha256"]) {
    if (typeof tree[key] !== "string" || !/^[a-f0-9]{64}$/.test(tree[key])) fail(`${field}.${key} must be a lowercase SHA-256`);
  }
  if (tree.generationSha256 !== treeGenerationSha256(tree)) {
    fail(`${field}.generationSha256 must match its tree components`);
  }
}

const CHECK_ERROR_NAME = /^[A-Za-z][A-Za-z0-9_.-]{0,63}$/;
const CHECK_ERROR_CONTROL = /[\u0000-\u001F\u007F-\u009F\u2028\u2029]/g;

export function sanitizeGenerationCheckError(error) {
  const rawName = error && typeof error === "object" && "name" in error ? String(error.name) : "Error";
  const rawMessage = error && typeof error === "object" && "message" in error ? String(error.message) : String(error ?? "");
  const name = CHECK_ERROR_NAME.test(rawName) ? rawName : "Error";
  const message = (rawMessage.replace(CHECK_ERROR_CONTROL, " ").replace(/\s+/g, " ").trim() || "working-tree snapshot failed").slice(0, 500);
  return { name, message };
}

function assertUniqueIds(ids, field, fail) {
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string" || !id)) fail(`${field} must be string ids`);
  if (new Set(ids).size !== ids.length) fail(`${field} must not contain duplicate ids`);
}

function assertPrefix(prefix, values, field, fail) {
  if (prefix.length > values.length || prefix.some((id, index) => id !== values[index])) fail(`${field} must be an ordered prefix`);
}

function assertOrderedSubset(subset, values, field, fail) {
  let at = 0;
  for (const id of subset) {
    at = values.indexOf(id, at);
    if (at === -1) fail(`${field} must be an ordered subset`);
    at += 1;
  }
}

function assertExactKeys(value, expected, field, fail) {
  const actual = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(sortedExpected)) {
    fail(`${field} must contain only ${sortedExpected.join(", ")}`);
  }
}

/**
 * Reject artifacts whose content was intentionally quarantined after local
 * provenance attestation failed. This guard is deliberately structural and
 * recognises the two cheapest single-key tampering variants too.
 */
export function assertNotPlaygroundQuarantine(value, label = "artifact") {
  if (
    value?.artifactContract === PLAYGROUND_QUARANTINE_CONTRACT ||
    value?.quarantinedMeta?.artifactContract === PLAYGROUND_QUARANTINE_CONTRACT ||
    value?.meta?.artifactContract === PLAYGROUND_QUARANTINE_CONTRACT
  ) {
    throw new Error(
      `${label} is a non-promotable playground quarantine; it is allowed only for spend reconciliation and runner forensics`
    );
  }
}

/** Build a distinct, non-promotable preservation artifact after attestation fails. */
export function buildQuarantineArtifact({ meta, rows, treeAtStart, treeAtFinish, reason, spend }) {
  const quarantinedMeta = {
    ...structuredClone(meta),
    artifactContract: PLAYGROUND_QUARANTINE_CONTRACT,
    quarantinedFrom: PLAYGROUND_ARTIFACT_CONTRACT
  };
  const quarantinedRows = structuredClone(rows);
  const artifact = {
    artifactContract: PLAYGROUND_QUARANTINE_CONTRACT,
    status: "quarantined-non-evidence",
    nonPromotable: true,
    allowedUses: QUARANTINE_ALLOWED_USES,
    prohibitedUses: QUARANTINE_PROHIBITED_USES,
    quarantinedMeta,
    reason: {
      ...reason,
      serverChangeEstablished: false,
      continuousMonitoring: false
    },
    provenanceFailure: {
      treeAtStart,
      treeAtDetection: treeAtFinish,
      expectedGenerationSha256: treeAtStart.generationSha256,
      observedGenerationSha256: treeAtFinish?.generationSha256 ?? null,
      serverChangeEstablished: false,
      continuousMonitoring: false
    },
    spend,
    preserved: {
      quarantinedRowsSha256: sha256Json(quarantinedRows)
    },
    quarantinedRows
  };
  assertQuarantineArtifact(artifact);
  return artifact;
}

/** Derive quarantine summaries from the canonical stored state. */
export function deriveQuarantineState(artifact) {
  const spend = artifact.spend;
  const completedCaseIds = artifact.quarantinedRows.map((row) => row?.id);
  const fullyJudgedRowCount = spend.caseIdsJudged.length;
  return {
    planned: {
      answerCalls: spend.selectedCaseIds.length,
      judgeCalls: artifact.quarantinedMeta.judge.enabled ? spend.selectedCaseIds.length : 0
    },
    actual: {
      answerCallsCompleted: completedCaseIds.length,
      judgeCallsCompleted: fullyJudgedRowCount
    },
    caseIdsCompleted: completedCaseIds,
    caseIdsNotRun: spend.selectedCaseIds.slice(spend.caseIdsAttempted.length),
    nextLedgerMinimumIncrements: {
      answerCalls: spend.actual.answerCallsStarted,
      judgeCalls: spend.actual.judgeCallsStarted
    },
    preserved: {
      rowCount: completedCaseIds.length,
      fullyJudgedRowCount,
      unjudgedRowCount: completedCaseIds.length - fullyJudgedRowCount
    }
  };
}

export function assertQuarantineArtifact(artifact) {
  const fail = (message) => {
    throw new Error(`invalid ${PLAYGROUND_QUARANTINE_CONTRACT}: ${message}`);
  };
  if (!artifact || typeof artifact !== "object") fail("artifact must be an object");
  if (artifact.artifactContract !== PLAYGROUND_QUARANTINE_CONTRACT) fail("artifactContract is required");
  for (const key of ["meta", "rows", "summary"]) {
    if (hasOwn(artifact, key)) fail(`top-level ${key} is forbidden`);
  }
  if (artifact.status !== "quarantined-non-evidence" || artifact.nonPromotable !== true) {
    fail("status and nonPromotable must mark the artifact non-promotable");
  }
  assertExactArray(artifact.allowedUses, QUARANTINE_ALLOWED_USES, "allowedUses", fail);
  assertExactArray(artifact.prohibitedUses, QUARANTINE_PROHIBITED_USES, "prohibitedUses", fail);
  if (!artifact.quarantinedMeta || typeof artifact.quarantinedMeta !== "object") fail("quarantinedMeta is required");
  if (artifact.quarantinedMeta.artifactContract !== PLAYGROUND_QUARANTINE_CONTRACT) {
    fail("quarantinedMeta.artifactContract is required");
  }
  if (artifact.quarantinedMeta.quarantinedFrom !== PLAYGROUND_ARTIFACT_CONTRACT) {
    fail("quarantinedMeta.quarantinedFrom is required");
  }
  const restoredMeta = structuredClone(artifact.quarantinedMeta);
  delete restoredMeta.quarantinedFrom;
  restoredMeta.artifactContract = PLAYGROUND_ARTIFACT_CONTRACT;
  assertPlaygroundArtifactMeta(restoredMeta);
  if (!Array.isArray(artifact.quarantinedRows)) fail("quarantinedRows must be an array");
  if (!artifact.preserved || typeof artifact.preserved !== "object") fail("preserved is required");
  assertExactKeys(artifact.preserved, ["quarantinedRowsSha256"], "preserved", fail);
  if (artifact.preserved?.quarantinedRowsSha256 !== sha256Json(artifact.quarantinedRows)) {
    fail("preserved.quarantinedRowsSha256 does not match quarantinedRows");
  }

  const reason = artifact.reason;
  if (!reason || typeof reason !== "object") fail("reason is required");
  if (!["local-provenance-generation-mismatch", "generation-check-error"].includes(reason.code)) {
    fail("reason.code is invalid");
  }
  if (reason.serverChangeEstablished !== false || reason.continuousMonitoring !== false) fail("reason flags must deny server change and continuous monitoring");
  const provenance = artifact.provenanceFailure;
  if (!provenance || typeof provenance !== "object") fail("provenanceFailure is required");
  assertTree(provenance.treeAtStart, "provenanceFailure.treeAtStart", fail);
  if (provenance.expectedGenerationSha256 !== provenance.treeAtStart.generationSha256) {
    fail("provenanceFailure.expectedGenerationSha256 must match treeAtStart");
  }
  if (provenance.serverChangeEstablished !== false || provenance.continuousMonitoring !== false) {
    fail("provenanceFailure must not claim a server change or continuous monitoring");
  }
  if (reason.code === "local-provenance-generation-mismatch") {
    if (!["before-answer", "before-judge", "finalize"].includes(reason.phase)) fail("mismatch reason.phase is invalid");
    assertTree(provenance.treeAtDetection, "provenanceFailure.treeAtDetection", fail);
    if (provenance.treeAtDetection.generationSha256 === provenance.treeAtStart.generationSha256) {
      fail("mismatch reason requires differing start and detection generations");
    }
    if (provenance.observedGenerationSha256 !== provenance.treeAtDetection.generationSha256 || reason.checkError != null) {
      fail("mismatch reason must carry the observed generation and no checkError");
    }
  } else {
    if (!["before-answer", "before-judge", "finalize"].includes(reason.phase)) fail("generation-check-error reason.phase is invalid");
    if (provenance.treeAtDetection !== null || provenance.observedGenerationSha256 !== null) {
      fail("generation-check-error requires a null detection snapshot");
    }
    const normalized = sanitizeGenerationCheckError(reason.checkError);
    if (reason.checkError?.name !== normalized.name || reason.checkError?.message !== normalized.message) fail("generation-check-error requires a normalized checkError");
  }

  const spend = artifact.spend;
  if (!spend || typeof spend !== "object") fail("spend is required");
  assertExactKeys(
    spend,
    ["accountingPolicy", "actual", "selectedCaseIds", "caseIdsAttempted", "caseIdsJudged", "infraRetryAuthorized"],
    "spend",
    fail
  );
  const actual = spend.actual;
  if (!actual || typeof actual !== "object") fail("spend.actual is required");
  assertExactKeys(
    actual,
    [
      "answerCallsStarted",
      "judgeCallsStarted",
      "reportedJudgeCalls",
      "reportedJudgeCostUsd",
      "answerProviderCostUsd",
      "answerProviderCostSemantics",
      "observedAttemptedModels"
    ],
    "spend.actual",
    fail
  );
  for (const key of ["answerCallsStarted", "judgeCallsStarted", "reportedJudgeCalls"]) {
    assertNonNegativeInteger(actual[key], `spend.actual.${key}`, fail);
  }
  const derived = deriveQuarantineState(artifact);
  if (actual.answerCallsStarted < 1) fail("quarantine is allowed only after an answer call started");
  if (actual.answerCallsStarted < derived.actual.answerCallsCompleted) {
    fail("answer call accounting is not conservative");
  }
  if (actual.judgeCallsStarted < derived.actual.judgeCallsCompleted || derived.actual.judgeCallsCompleted < actual.reportedJudgeCalls) {
    fail("judge call accounting is not conservative");
  }
  if (actual.answerProviderCostUsd !== null || actual.answerProviderCostSemantics !== "not-emitted-by-playground-artifact") {
    fail("answer provider cost must remain explicitly unavailable");
  }
  if (actual.observedAttemptedModels !== null) fail("observed attempted models must remain unavailable");
  if (typeof actual.reportedJudgeCostUsd !== "number" || !Number.isFinite(actual.reportedJudgeCostUsd) || actual.reportedJudgeCostUsd < 0) {
    fail("reportedJudgeCostUsd must be a non-negative numeric sum");
  }
  for (const key of ["selectedCaseIds", "caseIdsAttempted", "caseIdsJudged"]) assertUniqueIds(spend[key], `spend.${key}`, fail);
  assertUniqueIds(derived.caseIdsCompleted, "derived caseIdsCompleted", fail);
  assertUniqueIds(derived.caseIdsNotRun, "derived caseIdsNotRun", fail);
  if (sha256Json(spend.selectedCaseIds) !== artifact.quarantinedMeta.inputSnapshot.caseIdsSha256) fail("spend.selectedCaseIds must match quarantinedMeta input snapshot");
  if (spend.accountingPolicy !== "started-calls-count-conservatively; quarantine releases no authorization or reserve") fail("spend.accountingPolicy is invalid");
  if (spend.caseIdsAttempted.length !== actual.answerCallsStarted) {
    fail("answer call ids must match accounting");
  }
  assertPrefix(spend.caseIdsAttempted, spend.selectedCaseIds, "spend.caseIdsAttempted", fail);
  assertPrefix(derived.caseIdsCompleted, spend.caseIdsAttempted, "derived caseIdsCompleted", fail);
  assertOrderedSubset(spend.caseIdsJudged, derived.caseIdsCompleted, "spend.caseIdsJudged", fail);
  const judgedIds = new Set(spend.caseIdsJudged);
  let reportedJudgeCalls = 0;
  let reportedJudgeCostUsd = 0;
  for (const row of artifact.quarantinedRows) {
    const cost = row?.verdict?.costUsd;
    if (cost === undefined || cost === null) continue;
    if (typeof cost !== "number" || !Number.isFinite(cost) || cost < 0) fail(`row ${row?.id ?? "unknown"} has invalid verdict.costUsd`);
    if (!judgedIds.has(row.id)) fail(`row ${row.id} has a cost without a completed paid judge`);
    reportedJudgeCalls += 1;
    reportedJudgeCostUsd += cost;
  }
  if (actual.reportedJudgeCalls !== reportedJudgeCalls || actual.reportedJudgeCostUsd !== reportedJudgeCostUsd) fail("reported judge cost accounting does not match judged rows");
  if (spend.infraRetryAuthorized !== false) fail("quarantine cannot authorize an infra retry");
}

function assertRoundCapContext(round, evaluator, fail) {
  if (!round || typeof round !== "object") fail("capContext.roundAuthorization is required");
  if (round.contract !== PLAYGROUND_ROUND_CAP_CONTRACT) {
    fail(`capContext.roundAuthorization.contract must be ${PLAYGROUND_ROUND_CAP_CONTRACT}`);
  }
  if (typeof round.experimentId !== "string" || !round.experimentId) {
    fail("capContext.roundAuthorization.experimentId is required");
  }
  if (typeof round.sourceFile?.path !== "string" || !round.sourceFile.path) {
    fail("capContext.roundAuthorization.sourceFile.path is required");
  }
  if (typeof round.sourceFile?.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(round.sourceFile.sha256)) {
    fail("capContext.roundAuthorization.sourceFile.sha256 must be a lowercase SHA-256");
  }
  const fields = [
    "plannedAnswerCalls",
    "absoluteAnswerCallCap",
    "answerCallsConsumedBeforeRun",
    "plannedJudgeCalls",
    "absoluteJudgeCallCap",
    "judgeCallsConsumedBeforeRun",
    "infraRetryReserve",
    "infraRetryConsumedBeforeRun",
    "savedAnswerRejudgeReserve",
    "savedAnswerRejudgesConsumedBeforeRun"
  ];
  if (round.kind === "not-applicable") {
    if (typeof round.reason !== "string" || !round.reason) {
      fail("not-applicable round authorization requires a non-empty reason");
    }
    for (const field of fields) {
      if (round[field] !== null) fail(`not-applicable round authorization must set ${field} to null`);
    }
    if (round.runAllocation !== null) fail("not-applicable round authorization must set runAllocation to null");
    return;
  }
  if (round.kind !== "reviewed-round") {
    fail("capContext.roundAuthorization.kind must be reviewed-round or not-applicable");
  }
  for (const field of fields) {
    if (!Number.isInteger(round[field]) || round[field] < 0) {
      fail(`reviewed round authorization requires non-negative integer ${field}`);
    }
  }
  if (round.runAllocation !== "planned" && round.runAllocation !== "infra-retry") {
    fail("reviewed round authorization requires runAllocation planned or infra-retry");
  }
  if (round.plannedAnswerCalls > round.absoluteAnswerCallCap) {
    fail("plannedAnswerCalls exceeds absoluteAnswerCallCap");
  }
  if (round.plannedJudgeCalls > round.absoluteJudgeCallCap) {
    fail("plannedJudgeCalls exceeds absoluteJudgeCallCap");
  }
  if (round.answerCallsConsumedBeforeRun + evaluator.answerCallsThisRun > round.absoluteAnswerCallCap) {
    fail("this run would exceed absoluteAnswerCallCap");
  }
  if (round.judgeCallsConsumedBeforeRun + evaluator.judgeCallsThisRun > round.absoluteJudgeCallCap) {
    fail("this run would exceed absoluteJudgeCallCap");
  }
  if (round.infraRetryConsumedBeforeRun > round.infraRetryReserve) {
    fail("infraRetryConsumedBeforeRun exceeds infraRetryReserve");
  }
  if (round.savedAnswerRejudgesConsumedBeforeRun > round.savedAnswerRejudgeReserve) {
    fail("savedAnswerRejudgesConsumedBeforeRun exceeds savedAnswerRejudgeReserve");
  }
  if (round.runAllocation === "planned") {
    if (round.answerCallsConsumedBeforeRun + evaluator.answerCallsThisRun > round.plannedAnswerCalls) {
      fail("this planned run would exceed plannedAnswerCalls");
    }
    if (round.judgeCallsConsumedBeforeRun + evaluator.judgeCallsThisRun > round.plannedJudgeCalls) {
      fail("this planned run would exceed plannedJudgeCalls");
    }
  } else if (evaluator.answerCallsThisRun > round.infraRetryReserve - round.infraRetryConsumedBeforeRun) {
    fail("this infra-retry run would exceed the remaining infraRetryReserve");
  }
}
