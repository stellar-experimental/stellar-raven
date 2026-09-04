#!/usr/bin/env node
/**
 * Compare stored QA runs with an experimental paired ordinal decision rule.
 *
 * The method keeps both cumulative cutpoints of wrong < partial < correct.
 * It does not assign a numeric value to partial.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { RUNTIME_ADAPTER_SCHEMA } from "./exact-old-runtime-adapter.mjs";
import {
  REMOTE_IDENTITY_GUARD_SCHEMA,
  compareRemoteIdentityVectors,
  parseRemoteIdentityVector,
  remoteIdentityVectorSha256
} from "./remote-identity-guard.mjs";

export const PAIRED_VERDICT_METHOD = "qa-paired-ordinal-ni-v1";
export const CASE_INPUT_IDENTITY = "qa-judge-case-v2";
export const NO_CHANGE_CONFIDENCE_RADIUS = 0.08;
export const MINIMUM_ELIGIBLE_IDS = 100;
export const MAX_PAIRED_RUNS = 2;
export const LOOK_ALPHA = 0.007143;

const GRADES = ["wrong", "partial", "correct"];
const GRADE_RANK = new Map(GRADES.map((grade, index) => [grade, index]));
const T4_FAILURE_CLASSES = new Set(["spawn", "protocol", "unclassified"]);
const T5_FAILURE_CLASSES = new Set(["provider-safeguard", "transport", "timeout"]);

/** Acklam's inverse-normal approximation. The absolute error is below 1.2e-9. */
export function inverseStandardNormal(probability) {
  if (!(probability > 0 && probability < 1)) {
    throw new Error(`normal probability must be between 0 and 1, got ${probability}`);
  }
  const a = [
    -3.969683028665376e1,
    2.209460984245205e2,
    -2.759285104469687e2,
    1.38357751867269e2,
    -3.066479806614716e1,
    2.506628277459239
  ];
  const b = [
    -5.447609879822406e1,
    1.615858368580409e2,
    -1.556989798598866e2,
    6.680131188771972e1,
    -1.328068155288572e1
  ];
  const c = [
    -7.784894002430293e-3,
    -3.223964580411365e-1,
    -2.400758277161838,
    -2.549732539343734,
    4.374664141464968,
    2.938163982698783
  ];
  const d = [
    7.784695709041462e-3,
    3.224671290700398e-1,
    2.445134137142996,
    3.754408661907416
  ];
  const lower = 0.02425;
  const upper = 1 - lower;
  if (probability < lower) {
    const q = Math.sqrt(-2 * Math.log(probability));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (probability > upper) {
    const q = Math.sqrt(-2 * Math.log(1 - probability));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  const q = probability - 0.5;
  const r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
    (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

export const LOOK_Z = inverseStandardNormal(1 - LOOK_ALPHA);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])])
    );
  }
  return value;
}

export function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

export function caseInputPayload(kase) {
  return canonicalize({
    question: kase.question,
    golden: kase.golden,
    tags: {
      freshness: kase.tags?.freshness ?? null,
      trap: kase.tags?.trap ?? null
    }
  });
}

export function caseInputSha256(kase) {
  return sha256(canonicalJson(caseInputPayload(kase)));
}

function same(left, right) {
  return canonicalJson(left) === canonicalJson(right);
}

function reason(code, message, extra = {}) {
  return { code, message, ...extra };
}

function rubricTuple(result) {
  return {
    judgeModel: result.meta?.judgeModel ?? null,
    rubric: result.meta?.judgeRubric ?? null,
    pack: result.meta?.packVersion ?? null
  };
}

function tieringTuple(result) {
  const tiering = result.meta?.judgeTiering;
  return tiering
    ? {
        policy: tiering.policy ?? null,
        judgePanel: result.meta?.judgePanel ?? tiering.judgePanel ?? null,
        tieringJudgePanel: tiering.judgePanel ?? null,
        stabilityThreshold: tiering.stabilityThreshold ?? null,
        stabilityRegisterStatus: tiering.stabilityRegisterStatus ?? null,
        stabilityRegisterSource: tiering.stabilityRegisterSource ?? null,
        stabilityRegisterSha256: tiering.stabilityRegisterSha256 ?? null,
        maxPanelCases: tiering.maxPanelCases ?? null,
        maxPanelCasesSource: tiering.maxPanelCasesSource ?? null,
        defaultPanelPolicy: tiering.defaultPanelPolicy ?? null
      }
    : null;
}

function collectionTuple(result) {
  const remoteGuard = result.meta?.remoteIdentityGuard;
  return {
    variant: result.meta?.variant ?? null,
    surface: result.meta?.surface ?? null,
    answeringModel: result.meta?.model ?? null,
    rubric: rubricTuple(result),
    tiering: tieringTuple(result),
    resultsSchema: result.meta?.resultsSchema ?? null,
    promptAppend: result.meta?.promptAppend ?? null,
    agentBinarySha256: result.meta?.agentBinary?.sha256 ?? null,
    agentEnvironmentSha256: result.meta?.agentEnvironment?.inherited?.sha256 ?? null,
    qaImplementationSha256: result.meta?.sourceIdentity?.qaImplementationSha256 ?? null,
    caseIdentitySchema: result.meta?.caseIdentitySchema ?? null,
    remoteIdentity: remoteGuard
      ? {
          schema: remoteGuard.schema ?? null,
          probeSha256: remoteGuard.probe?.sha256 ?? null,
          baselineVector: remoteGuard.baselineVector ?? null
        }
      : null
  };
}

function rowIds(result) {
  return Array.isArray(result?.rows) ? result.rows.map((row) => row?.id) : [];
}

function artifactProblems(result, label) {
  const problems = [];
  if (!Array.isArray(result?.rows)) {
    problems.push(reason("missing-rows", `${label} has no rows[]`));
    return problems;
  }
  const ids = rowIds(result);
  if (ids.some((id) => typeof id !== "string" || !id)) {
    problems.push(reason("invalid-row-id", `${label} has an invalid row id`));
  }
  if (new Set(ids).size !== ids.length) {
    problems.push(reason("duplicate-row-id", `${label} has duplicate row ids`));
  }
  for (const row of result.rows) {
    if (!/^[a-f0-9]{64}$/.test(row?.caseInputSha256 ?? "")) {
      problems.push(reason("invalid-case-identity", `${label} has a row without a valid caseInputSha256`));
      break;
    }
    const input = row?.caseInput;
    const inputShapeIsComplete =
      input &&
      typeof input.question === "string" &&
      input.golden &&
      typeof input.golden === "object" &&
      input.tags &&
      typeof input.tags === "object" &&
      Object.hasOwn(input.tags, "freshness") &&
      Object.hasOwn(input.tags, "trap") &&
      same(input, caseInputPayload(input));
    if (!inputShapeIsComplete || caseInputSha256(input) !== row.caseInputSha256) {
      problems.push(
        reason("invalid-case-identity", `${label} has a row whose canonical case input does not match its hash`)
      );
      break;
    }
  }
  if (result.meta?.comparable !== true) {
    problems.push(reason("artifact-not-comparable", `${label} does not stamp meta.comparable: true`));
  }
  if (
    result.meta?.completeness?.complete !== true ||
    result.meta?.completeness?.aggregatesAllowed !== true
  ) {
    problems.push(reason("artifact-incomplete", `${label} does not have complete, allowed aggregates`));
  }
  const remoteGuard = result.meta?.remoteIdentityGuard;
  try {
    if (
      remoteGuard?.schema !== REMOTE_IDENTITY_GUARD_SCHEMA ||
      remoteGuard.matches !== true ||
      remoteGuard.failure !== null ||
      remoteGuard.sameAuthorizationResumeAllowed !== false ||
      remoteGuard.requiresNewAuthorization !== false ||
      remoteGuard.probe?.matches !== true ||
      !/^[a-f0-9]{64}$/.test(remoteGuard.probe?.sha256 ?? "") ||
      remoteGuard.probe.sha256 !== remoteGuard.probe.expectedSha256 ||
      !Number.isInteger(remoteGuard.completedAnsweringCalls) ||
      remoteGuard.completedAnsweringCalls < result.rows.length ||
      remoteGuard.successfulCaptureCount !== remoteGuard.completedAnsweringCalls * 2 + 1 ||
      !Array.isArray(remoteGuard.captures) ||
      remoteGuard.captures.length !== remoteGuard.successfulCaptureCount ||
      remoteGuard.postflight?.attempted !== true ||
      remoteGuard.postflight.matches !== true ||
      remoteGuard.postflight.skippedReason !== null
    ) {
      throw new Error("incomplete guard record");
    }
    const baseline = parseRemoteIdentityVector(remoteGuard.baselineVector);
    const final = parseRemoteIdentityVector(remoteGuard.finalVector);
    const baselineSha256 = remoteIdentityVectorSha256(baseline);
    const finalSha256 = remoteIdentityVectorSha256(final);
    if (
      remoteGuard.expectedBaselineVectorSha256 !== baselineSha256 ||
      remoteGuard.baselineVectorSha256 !== baselineSha256 ||
      remoteGuard.postflight.vectorSha256 !== finalSha256
    ) {
      throw new Error("guard vector pins differ");
    }
    if (!compareRemoteIdentityVectors(remoteGuard.baselineVector, remoteGuard.finalVector).matches) {
      throw new Error("guard vectors differ");
    }
    const callCaptures = remoteGuard.captures.slice(0, -1);
    if (
      remoteGuard.captures.at(-1)?.phase !== "postflight" ||
      remoteGuard.captures.at(-1)?.sequence !== remoteGuard.successfulCaptureCount ||
      remoteGuard.captures.some((capture) => capture.vectorSha256 !== baselineSha256) ||
      callCaptures.some((capture, index) => (
        capture.sequence !== index + 1 || capture.phase !== (index % 2 === 0 ? "before" : "after")
      ))
    ) {
      throw new Error("guard capture sequence is incomplete");
    }
  } catch {
    problems.push(
      reason("remote-identity-guard", `${label} does not contain a complete remote identity guard`)
    );
  }
  return problems;
}

function adapterArtifactProblems(result, label, expectedMode) {
  const problems = [];
  const adapter = result.meta?.runtimeAdapter;
  const fail = (message) => problems.push(reason("runtime-adapter-pairing", `${label} ${message}`));
  if (!adapter || typeof adapter !== "object") {
    fail("does not contain the required runtime adapter record");
    return problems;
  }
  if (adapter.schema !== RUNTIME_ADAPTER_SCHEMA) fail(`uses runtime adapter schema ${adapter.schema ?? "none"}`);
  if (adapter.mode !== expectedMode) fail(`uses runtime adapter mode ${adapter.mode ?? "none"}; expected ${expectedMode}`);
  if (!/^[a-f0-9]{40}$/.test(adapter.adapterRevision ?? "")) fail("has an invalid adapter revision");
  if (!/^[a-f0-9]{64}$/.test(adapter.implementationSha256 ?? "")) fail("has an invalid adapter SHA-256");
  if (!Number.isInteger(adapter.publicPort) || !Number.isInteger(adapter.upstreamPort)) {
    fail("has invalid public or private ports");
  } else if (adapter.publicPort === adapter.upstreamPort) {
    fail("uses one port for both listeners");
  }
  if (adapter.publicPort !== result.meta?.port) fail("does not match the artifact public port");

  const serverRevision = result.meta?.sourceIdentity?.serverRevision;
  if (!/^[a-f0-9]{40}$/.test(serverRevision ?? "") || adapter.sourceRevision !== serverRevision) {
    fail("does not match the pinned server revision");
  }

  const listenerPair = result.meta?.listenerPair;
  const listenerPairAfter = result.meta?.listenerPairAfter;
  if (!listenerPair || !listenerPairAfter || !same(listenerPair, listenerPairAfter)) {
    fail("does not contain matching preflight and postflight listener attestations");
  } else if (
    listenerPair.adapter?.port !== adapter.publicPort ||
    listenerPair.adapter?.revision !== adapter.adapterRevision ||
    listenerPair.upstream?.port !== adapter.upstreamPort ||
    listenerPair.upstream?.revision !== serverRevision
  ) {
    fail("listener attestations do not match the registered adapter topology");
  }
  const listenerGuard = result.meta?.listenerPairGuard;
  if (
    listenerGuard?.matches !== true ||
    listenerGuard.adapter?.matches !== true ||
    listenerGuard.upstream?.matches !== true
  ) {
    fail("does not contain a successful dual-listener stability guard");
  }

  const attestation = adapter.attestation;
  const attestationAfter = adapter.attestationAfter;
  if (!attestation || !attestationAfter || !same(attestation, attestationAfter)) {
    fail("does not contain matching preflight and postflight adapter attestations");
  } else if (
    attestation.matches !== true ||
    attestation.schema !== RUNTIME_ADAPTER_SCHEMA ||
    attestation.mode !== expectedMode ||
    attestation.sourceRevision !== serverRevision ||
    attestation.implementationSha256 !== adapter.implementationSha256 ||
    attestation.upstream?.port !== adapter.upstreamPort ||
    attestation.upstream?.revision !== serverRevision ||
    attestation.upstream?.dirty !== false
  ) {
    fail("adapter attestation does not match the registered adapter topology");
  }
  return problems;
}

function adapterPairingProblems(baselineRuns, candidateRuns) {
  const artifacts = baselineRuns.flatMap((baseline, index) => [
    { result: baseline, label: `baseline run ${index + 1}`, mode: "add-missing" },
    { result: candidateRuns[index], label: `candidate run ${index + 1}`, mode: "verify-native" }
  ]);
  const problems = artifacts.flatMap(({ result, label, mode }) =>
    adapterArtifactProblems(result, label, mode)
  );
  const adapters = artifacts.map(({ result }) => result.meta?.runtimeAdapter).filter(Boolean);
  if (adapters.length === artifacts.length) {
    const expected = {
      adapterRevision: adapters[0].adapterRevision,
      implementationSha256: adapters[0].implementationSha256,
      publicPort: adapters[0].publicPort,
      upstreamPort: adapters[0].upstreamPort
    };
    for (const { result, label } of artifacts) {
      const adapter = result.meta.runtimeAdapter;
      const actual = {
        adapterRevision: adapter.adapterRevision,
        implementationSha256: adapter.implementationSha256,
        publicPort: adapter.publicPort,
        upstreamPort: adapter.upstreamPort
      };
      if (!same(actual, expected)) {
        problems.push(reason(
          "runtime-adapter-pairing",
          `${label} does not use the shared adapter revision, hash, and ports`
        ));
      }
    }
  }
  return problems;
}

function comparisonProblems(baselineRuns, candidateRuns) {
  const problems = [];
  if (baselineRuns.length !== candidateRuns.length) {
    problems.push(reason("unpaired-runs", "baseline and candidate run counts differ"));
    return problems;
  }
  if (baselineRuns.length < 1 || baselineRuns.length > MAX_PAIRED_RUNS) {
    problems.push(reason("repeat-count", "the method requires one or two paired runs"));
    return problems;
  }

  const artifacts = baselineRuns.flatMap((baseline, index) => [
    { result: baseline, label: `baseline run ${index + 1}` },
    { result: candidateRuns[index], label: `candidate run ${index + 1}` }
  ]);
  for (const artifact of artifacts) {
    problems.push(...artifactProblems(artifact.result, artifact.label));
  }
  if (problems.length) return problems;
  problems.push(...adapterPairingProblems(baselineRuns, candidateRuns));
  if (problems.length) return problems;

  const expectedIds = rowIds(baselineRuns[0]);
  const expectedIdsSha256 = baselineRuns[0].meta?.inputSnapshot?.caseIdsSha256 ?? null;
  const expectedTuple = collectionTuple(baselineRuns[0]);
  if (expectedIdsSha256 !== sha256(JSON.stringify(expectedIds))) {
    problems.push(reason("selected-id-hash", "baseline run 1 caseIdsSha256 does not match its rows"));
  }
  for (const { result, label } of artifacts) {
    if (!same(rowIds(result), expectedIds)) {
      problems.push(reason("selected-ids", `${label} selected ids or order differ`));
    }
    if ((result.meta?.inputSnapshot?.caseIdsSha256 ?? null) !== expectedIdsSha256) {
      problems.push(reason("selected-id-hash", `${label} caseIdsSha256 differs`));
    }
    if (!same(collectionTuple(result), expectedTuple)) {
      problems.push(reason("measurement-tuple", `${label} measurement tuple differs`));
    }
  }

  if (!expectedTuple.rubric.judgeModel || !expectedTuple.rubric.rubric || !expectedTuple.rubric.pack) {
    problems.push(reason("missing-rubric-tuple", "the judge model, rubric, and pack tuple is incomplete"));
  }
  if (
    !expectedTuple.surface ||
    (expectedTuple.surface === "search-execute" && !expectedTuple.variant) ||
    !expectedTuple.answeringModel ||
    !expectedTuple.resultsSchema ||
    !expectedTuple.agentBinarySha256 ||
    !expectedTuple.agentEnvironmentSha256 ||
    !expectedTuple.qaImplementationSha256 ||
    expectedTuple.remoteIdentity?.schema !== REMOTE_IDENTITY_GUARD_SCHEMA ||
    !expectedTuple.remoteIdentity?.probeSha256 ||
    !expectedTuple.remoteIdentity?.baselineVector
  ) {
    problems.push(reason("measurement-tuple", "the load-bearing collection tuple is incomplete"));
  }
  const tiering = expectedTuple.tiering;
  if (
    !tiering?.policy ||
    ![1, 2, 3].includes(tiering.judgePanel) ||
    tiering.tieringJudgePanel !== tiering.judgePanel ||
    !Number.isFinite(tiering.stabilityThreshold) ||
    !Number.isInteger(tiering.maxPanelCases) ||
    tiering.maxPanelCases < 0 ||
    !tiering.maxPanelCasesSource ||
    !tiering.defaultPanelPolicy
  ) {
    problems.push(reason("missing-tiering-tuple", "the load-bearing judge tier tuple is incomplete"));
  }
  if (
    tiering?.stabilityRegisterSource !== "pinned" ||
    tiering?.stabilityRegisterStatus !== "available" ||
    !/^[a-f0-9]{64}$/.test(tiering?.stabilityRegisterSha256 ?? "")
  ) {
    problems.push(
      reason(
        "measurement-tuple",
        "all artifacts must use one available pinned stability register with a SHA-256 hash"
      )
    );
  }
  if (expectedTuple.caseIdentitySchema !== CASE_INPUT_IDENTITY) {
    problems.push(
      reason(
        "missing-case-identities",
        `artifacts must stamp meta.caseIdentitySchema: ${CASE_INPUT_IDENTITY}`
      )
    );
  }
  return problems;
}

export function classifyPairedRow(row) {
  const failureClass = row?.agent?.failure?.class ?? null;
  if (failureClass === "agent") {
    return { track: "T1", grade: "wrong", reason: "agent-limit/system failure" };
  }
  if (T5_FAILURE_CLASSES.has(failureClass)) {
    return { track: "T5", grade: null, reason: failureClass };
  }
  if (failureClass && T4_FAILURE_CLASSES.has(failureClass)) {
    return { track: "T4", grade: null, reason: failureClass };
  }
  if (failureClass) {
    return { track: "T4", grade: null, reason: `unknown failure class ${failureClass}` };
  }
  const score = row?.verdict?.score;
  if (GRADE_RANK.has(score)) return { track: "T1", grade: score, reason: null };
  return {
    track: "T4",
    grade: null,
    reason: score === "error" ? "judge/verdict error" : "missing valid verdict"
  };
}

function emptyMatrix() {
  return Object.fromEntries(
    GRADES.map((baseline) => [baseline, Object.fromEntries(GRADES.map((candidate) => [candidate, 0]))])
  );
}

function emptyTransitions(runPairs) {
  return {
    perLook: Array.from({ length: runPairs }, (_, index) => ({
      look: index + 1,
      unit: "attempts",
      matrix: emptyMatrix()
    })),
    perId: {
      unit: "ids",
      basis: "first-look",
      matrix: emptyMatrix()
    }
  };
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardError(values, valueMean) {
  if (values.length < 2) return null;
  const variance = values.reduce((sum, value) => sum + (value - valueMean) ** 2, 0) /
    (values.length - 1);
  return Math.sqrt(variance / values.length);
}

function bounded(value) {
  return Math.max(-1, Math.min(1, value));
}

/**
 * Decide one paired look.
 *
 * FAIL demonstrates a loss because one upper bound is below zero. Otherwise,
 * PASS uses the experimental margin. All overlapping bounds are indeterminate.
 */
export function statisticalDecision(caseDeltas, {
  margin = NO_CHANGE_CONFIDENCE_RADIUS,
  minimumEligibleIds = MINIMUM_ELIGIBLE_IDS
} = {}) {
  if (!(Number.isFinite(margin) && margin > 0 && margin < 1)) {
    throw new Error(`margin must be a number between 0 and 1, got ${margin}`);
  }
  if (caseDeltas.length < minimumEligibleIds) {
    return {
      verdict: "INDETERMINATE",
      code: "denominator-below-powered-n",
      reason: `eligible denominator ${caseDeltas.length} is below powered n=${minimumEligibleIds}`,
      estimates: null
    };
  }
  const definitions = [
    { key: "strictCorrect", label: "P(correct)" },
    { key: "nonWrong", label: "P(correct or partial)" }
  ];
  const estimates = {};
  for (const [index, definition] of definitions.entries()) {
    const values = caseDeltas.map((deltas) => deltas[index]);
    const estimate = mean(values);
    const se = standardError(values, estimate);
    const radius = se == null ? Infinity : LOOK_Z * se;
    estimates[definition.key] = {
      label: definition.label,
      estimate,
      standardError: se,
      lower: bounded(estimate - radius),
      upper: bounded(estimate + radius)
    };
  }

  const values = Object.values(estimates);
  const failed = values.filter((estimate) => estimate.upper < 0);
  if (failed.length) {
    return {
      verdict: "FAIL",
      code: "loss-demonstrated",
      reason: `${failed.map((estimate) => estimate.label).join(" and ")} has an upper bound below zero`,
      estimates
    };
  }
  if (values.every((estimate) => estimate.lower > -margin)) {
    return {
      verdict: "PASS",
      code: "experimental-margin-cleared",
      reason: `both ordinal cutpoints clear the experimental -${(margin * 100).toFixed(1)} pp margin`,
      estimates
    };
  }
  return {
    verdict: "INDETERMINATE",
    code: "confidence-bounds-overlap",
    reason: "the bounds neither demonstrate a loss nor clear the experimental margin",
    estimates
  };
}

function stageData(baselineRuns, candidateRuns) {
  const selectedIds = rowIds(baselineRuns[0]);
  const runMaps = baselineRuns.map((baseline, index) => ({
    baseline: new Map(baseline.rows.map((row) => [row.id, row])),
    candidate: new Map(candidateRuns[index].rows.map((row) => [row.id, row]))
  }));
  const transitions = emptyTransitions(runMaps.length);
  const exclusions = { content: [], T4: [], T5: [] };
  const candidateOnly = { T4: [], T5: [] };
  const caseDeltas = [];

  for (const id of selectedIds) {
    const observations = runMaps.map(({ baseline, candidate }) => ({
      baseline: baseline.get(id),
      candidate: candidate.get(id)
    }));
    const hashes = observations.flatMap(({ baseline, candidate }) => [
      baseline?.caseInputSha256,
      candidate?.caseInputSha256
    ]);
    if (hashes.some((hash) => typeof hash !== "string") || new Set(hashes).size !== 1) {
      exclusions.content.push(id);
      continue;
    }

    const classified = observations.map(({ baseline, candidate }) => ({
      baseline: classifyPairedRow(baseline),
      candidate: classifyPairedRow(candidate)
    }));
    for (const pair of classified) {
      if (
        (pair.candidate.track === "T4" || pair.candidate.track === "T5") &&
        pair.baseline.track === "T1" &&
        !candidateOnly[pair.candidate.track].includes(id)
      ) {
        candidateOnly[pair.candidate.track].push(id);
      }
    }
    for (const [lookIndex, pair] of classified.entries()) {
      if (pair.baseline.track === "T1" && pair.candidate.track === "T1") {
        transitions.perLook[lookIndex].matrix[pair.baseline.grade][pair.candidate.grade] += 1;
      }
    }
    const excludedTrack = classified.some((pair) => pair.baseline.track === "T5" || pair.candidate.track === "T5")
      ? "T5"
      : classified.some((pair) => pair.baseline.track === "T4" || pair.candidate.track === "T4")
        ? "T4"
        : null;
    if (excludedTrack) {
      exclusions[excludedTrack].push(id);
      continue;
    }

    const first = classified[0];
    transitions.perId.matrix[first.baseline.grade][first.candidate.grade] += 1;
    const deltas = [0, 0];
    for (const pair of classified) {
      const baselineRank = GRADE_RANK.get(pair.baseline.grade);
      const candidateRank = GRADE_RANK.get(pair.candidate.grade);
      deltas[0] += Number(candidateRank >= 2) - Number(baselineRank >= 2);
      deltas[1] += Number(candidateRank >= 1) - Number(baselineRank >= 1);
    }
    caseDeltas.push(deltas.map((delta) => delta / classified.length));
  }

  return { selectedIds, caseDeltas, transitions, exclusions, candidateOnly };
}

function resultContract(margin) {
  return {
    poweredN: MINIMUM_ELIGIBLE_IDS,
    lookAlpha: LOOK_ALPHA,
    lookZ: LOOK_Z,
    failThreshold: 0,
    margin,
    marginLabel: margin === NO_CHANGE_CONFIDENCE_RADIUS
      ? "experimental margin (no-change radius; not a product tolerance)"
      : "experimental operator-supplied margin (not an accepted product tolerance)"
  };
}

function analyzeRuns(baselineRuns, candidateRuns, { margin }) {
  const problems = comparisonProblems(baselineRuns, candidateRuns);
  if (problems.length) {
    return {
      method: PAIRED_VERDICT_METHOD,
      verdict: "INDETERMINATE",
      denominator: 0,
      selected: rowIds(baselineRuns[0] ?? {}).length,
      runPairs: baselineRuns.length,
      reasons: problems,
      estimates: null,
      transitions: emptyTransitions(baselineRuns.length),
      exclusions: { content: [], T4: [], T5: [] },
      candidateOnly: { T4: [], T5: [] },
      rubricTuple: rubricTuple(baselineRuns[0] ?? {}),
      contract: resultContract(margin)
    };
  }

  const data = stageData(baselineRuns, candidateRuns);
  const blocking = [];
  if (data.candidateOnly.T4.length) {
    blocking.push(
      reason(
        "candidate-only-T4",
        `candidate added T4 outcomes on ${data.candidateOnly.T4.length} id(s)`,
        { ids: data.candidateOnly.T4 }
      )
    );
  }
  if (data.candidateOnly.T5.length) {
    blocking.push(
      reason(
        "candidate-only-T5",
        `candidate added T5 outcomes on ${data.candidateOnly.T5.length} id(s)`,
        { ids: data.candidateOnly.T5 }
      )
    );
  }
  const statistical = statisticalDecision(data.caseDeltas, { margin });
  if (blocking.length) {
    return {
      method: PAIRED_VERDICT_METHOD,
      verdict: "INDETERMINATE",
      denominator: data.caseDeltas.length,
      selected: data.selectedIds.length,
      runPairs: baselineRuns.length,
      reasons: blocking,
      estimates: statistical.estimates,
      ...data,
      rubricTuple: rubricTuple(baselineRuns[0]),
      contract: resultContract(margin)
    };
  }
  return {
    method: PAIRED_VERDICT_METHOD,
    verdict: statistical.verdict,
    denominator: data.caseDeltas.length,
    selected: data.selectedIds.length,
    runPairs: baselineRuns.length,
    reasons: [reason(statistical.code, statistical.reason)],
    estimates: statistical.estimates,
    ...data,
    rubricTuple: rubricTuple(baselineRuns[0]),
    contract: resultContract(margin)
  };
}

function isStatisticalIndeterminate(result) {
  return result.verdict === "INDETERMINATE" &&
    result.denominator >= MINIMUM_ELIGIBLE_IDS &&
    result.reasons.length === 1 &&
    result.reasons[0].code === "confidence-bounds-overlap";
}

export function comparePairedArtifacts({
  baselineRuns,
  candidateRuns,
  margin = NO_CHANGE_CONFIDENCE_RADIUS
}) {
  const initial = analyzeRuns(baselineRuns.slice(0, 1), candidateRuns.slice(0, 1), { margin });
  if (baselineRuns.length === 1 && candidateRuns.length === 1) {
    if (isStatisticalIndeterminate(initial)) {
      return labeledResult({
        ...initial,
        reasons: [
          ...initial.reasons,
          reason("repeat-required", "run exactly one paired repeat before the final verdict")
        ]
      });
    }
    return labeledResult(initial);
  }

  if (baselineRuns.length !== 2 || candidateRuns.length !== 2) {
    return labeledResult(analyzeRuns(baselineRuns, candidateRuns, { margin }));
  }
  if (!isStatisticalIndeterminate(initial)) {
    return labeledResult({
      ...initial,
      verdict: "INDETERMINATE",
      runPairs: 2,
      reasons: [
        ...initial.reasons,
        reason(
          "repeat-rule",
          initial.verdict === "INDETERMINATE"
            ? "the initial blocker is not statistical uncertainty; do not repeat"
          : `the initial verdict was ${initial.verdict}; the fixed rule stops after it`
        )
      ]
    });
  }
  return labeledResult(analyzeRuns(baselineRuns, candidateRuns, { margin }));
}

export function calibrationFromPairedArtifacts(baseline, candidate) {
  const problems = comparisonProblems([baseline], [candidate]);
  if (problems.length) {
    throw new Error(problems.map((item) => `${item.code}: ${item.message}`).join("; "));
  }
  const data = stageData([baseline], [candidate]);
  if (!data.caseDeltas.length) throw new Error("the recalibration pair has no eligible IDs");
  return {
    denominator: data.caseDeltas.length,
    selected: data.selectedIds.length,
    strictCorrectDiscordance:
      data.caseDeltas.filter((deltas) => deltas[0] !== 0).length / data.caseDeltas.length,
    nonWrongDiscordance:
      data.caseDeltas.filter((deltas) => deltas[1] !== 0).length / data.caseDeltas.length,
    exclusions: data.exclusions,
    candidateOnly: data.candidateOnly,
    transitions: data.transitions,
    tuple: collectionTuple(baseline)
  };
}

function exclusionCount(result) {
  return result.exclusions.content.length + result.exclusions.T4.length + result.exclusions.T5.length;
}

function fixed(value) {
  return Number.isFinite(value) ? value.toFixed(4) : "unavailable";
}

function estimateText(result) {
  if (!result.estimates) return "strictCorrect=unavailable nonWrong=unavailable";
  const format = (estimate) =>
    `${fixed(estimate.estimate)}[${fixed(estimate.lower)},${fixed(estimate.upper)}]`;
  return `strictCorrect=${format(result.estimates.strictCorrect)} ` +
    `nonWrong=${format(result.estimates.nonWrong)}`;
}

function displayedVerdict(result) {
  if (result.verdict !== "PASS") return result.verdict;
  const margin = result.contract.margin.toFixed(2);
  return result.contract.margin === NO_CHANGE_CONFIDENCE_RADIUS
    ? `PASS (experimental margin ${margin} = no-change radius; not a product tolerance)`
    : `PASS (experimental operator margin ${margin}; not an accepted product tolerance)`;
}

function labeledResult(result) {
  return { ...result, verdictLabel: displayedVerdict(result) };
}

export function formatPairedVerdict(result) {
  const reasonText = result.reasons.map((item) => `${item.code}: ${item.message}`).join("; ");
  return (
    `${displayedVerdict(result)} eligible=${result.denominator}/${result.selected} ` +
    `excluded=${exclusionCount(result)} (content=${result.exclusions.content.length}, ` +
    `T4=${result.exclusions.T4.length}, T5=${result.exclusions.T5.length}) ` +
    `look=${result.runPairs}/${MAX_PAIRED_RUNS} ${estimateText(result)} reasons=${reasonText}`
  );
}

function readArtifact(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function parseMargin(value) {
  if (value === undefined || value.startsWith("--")) throw new Error("--margin requires a number");
  const margin = Number(value);
  if (!(Number.isFinite(margin) && margin > 0 && margin < 1)) {
    throw new Error(`--margin must be between 0 and 1, got ${value}`);
  }
  return margin;
}

function parseArgs(argv) {
  const positional = [];
  let baselineRepeat;
  let candidateRepeat;
  let margin = NO_CHANGE_CONFIDENCE_RADIUS;
  let json = false;
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === "--baseline-repeat") baselineRepeat = argv[++index];
    else if (arg === "--candidate-repeat") candidateRepeat = argv[++index];
    else if (arg === "--margin") margin = parseMargin(argv[++index]);
    else if (arg === "--json") json = true;
    else if (arg === "--help" || arg === "-h") {
      return { help: true, json };
    } else if (arg.startsWith("--")) {
      throw new Error(`unknown flag ${arg}`);
    } else positional.push(arg);
  }
  if (positional.length !== 2) throw new Error("provide baseline and candidate results paths");
  if (Boolean(baselineRepeat) !== Boolean(candidateRepeat)) {
    throw new Error("provide both --baseline-repeat and --candidate-repeat");
  }
  return {
    baseline: positional[0],
    candidate: positional[1],
    baselineRepeat,
    candidateRepeat,
    margin,
    json
  };
}

function commandFailure(message) {
  return labeledResult({
    method: PAIRED_VERDICT_METHOD,
    verdict: "INDETERMINATE",
    denominator: 0,
    selected: 0,
    runPairs: 0,
    reasons: [reason("command-error", message)],
    estimates: null,
    transitions: emptyTransitions(0),
    exclusions: { content: [], T4: [], T5: [] },
    candidateOnly: { T4: [], T5: [] },
    rubricTuple: { judgeModel: null, rubric: null, pack: null },
    contract: resultContract(NO_CHANGE_CONFIDENCE_RADIUS)
  });
}

async function main() {
  const argv = process.argv.slice(2);
  const jsonRequested = argv.includes("--json");
  try {
    const args = parseArgs(argv);
    if (args.help) {
      console.log(
        "usage: node eval/qa/paired-verdict.mjs <baseline.json> <candidate.json> " +
        "[--baseline-repeat <json> --candidate-repeat <json>] [--margin <0..1>] [--json]"
      );
      return;
    }
    const baselineRuns = [readArtifact(args.baseline)];
    const candidateRuns = [readArtifact(args.candidate)];
    if (args.baselineRepeat) {
      baselineRuns.push(readArtifact(args.baselineRepeat));
      candidateRuns.push(readArtifact(args.candidateRepeat));
    }
    const result = comparePairedArtifacts({ baselineRuns, candidateRuns, margin: args.margin });
    console.log(args.json ? JSON.stringify(result, null, 2) : formatPairedVerdict(result));
    process.exitCode = result.verdict === "PASS" ? 0 : result.verdict === "FAIL" ? 1 : 2;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const failure = commandFailure(message);
    console.log(jsonRequested ? JSON.stringify(failure, null, 2) : formatPairedVerdict(failure));
    process.exitCode = 2;
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) await main();
