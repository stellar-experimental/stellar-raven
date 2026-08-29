#!/usr/bin/env node
/**
 * Compare two stored QA runs with a paired ordinal non-inferiority rule.
 *
 * The method keeps both cumulative cutpoints of wrong < partial < correct:
 * strict-correct and non-wrong. It does not assign a numeric value to partial.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const PAIRED_VERDICT_METHOD = "qa-paired-ordinal-ni-v1";
export const CASE_INPUT_IDENTITY = "qa-judge-case-v1";
export const NON_INFERIORITY_MARGIN = 0.08;
export const MINIMUM_ELIGIBLE_IDS = 50;
export const MAX_PAIRED_RUNS = 2;
export const LOOK_ALPHA = 0.007143;
export const LOOK_Z = 2.45;

const GRADES = ["wrong", "partial", "correct"];
const GRADE_RANK = new Map(GRADES.map((grade, index) => [grade, index]));
const T4_FAILURE_CLASSES = new Set(["spawn", "protocol", "unclassified"]);
const T5_FAILURE_CLASSES = new Set(["provider-safeguard", "transport", "timeout"]);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function caseInputSha256(kase) {
  return sha256(JSON.stringify({
    question: kase.question,
    golden: kase.golden,
    tags: kase.tags
  }));
}

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
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
        stabilityThreshold: tiering.stabilityThreshold ?? null,
        stabilityRegisterStatus: tiering.stabilityRegisterStatus ?? null,
        stabilityRegisterSha256: tiering.stabilityRegisterSha256 ?? null,
        maxPanelCases: tiering.maxPanelCases ?? null
      }
    : null;
}

function collectionTuple(result) {
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
    caseIdentitySchema: result.meta?.caseIdentitySchema ?? null
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
  if (result.rows.some((row) => !/^[a-f0-9]{64}$/.test(row?.caseInputSha256 ?? ""))) {
    problems.push(reason("invalid-case-identity", `${label} has a row without a valid caseInputSha256`));
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
  return problems;
}

function comparisonProblems(baselineRuns, candidateRuns) {
  const problems = [];
  if (baselineRuns.length !== candidateRuns.length) {
    problems.push(reason("unpaired-runs", "baseline and candidate run counts differ"));
    return problems;
  }
  if (baselineRuns.length < 1 || baselineRuns.length > MAX_PAIRED_RUNS) {
    problems.push(reason("repeat-count", `the method requires one or two paired runs`));
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
  if (!expectedTuple.tiering?.policy) {
    problems.push(reason("missing-tiering-tuple", "the judge tiering policy is missing"));
  }
  if (
    expectedTuple.tiering?.stabilityRegisterStatus === "available" &&
    !expectedTuple.tiering.stabilityRegisterSha256
  ) {
    problems.push(reason("missing-tiering-hash", "the available stability register has no hash"));
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

export function statisticalDecision(caseDeltas, {
  margin = NON_INFERIORITY_MARGIN,
  minimumEligibleIds = MINIMUM_ELIGIBLE_IDS
} = {}) {
  if (caseDeltas.length < minimumEligibleIds) {
    return {
      verdict: "INDETERMINATE",
      reason: `eligible denominator ${caseDeltas.length} is below ${minimumEligibleIds}`,
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
  if (values.every((estimate) => estimate.lower > -margin)) {
    return {
      verdict: "PASS",
      reason: `both ordinal cutpoints clear the -${(margin * 100).toFixed(1)} pp margin`,
      estimates
    };
  }
  const failed = values.filter((estimate) => estimate.upper < -margin);
  if (failed.length) {
    return {
      verdict: "FAIL",
      reason: `${failed.map((estimate) => estimate.label).join(" and ")} falls below the ` +
        `-${(margin * 100).toFixed(1)} pp margin`,
      estimates
    };
  }
  return {
    verdict: "INDETERMINATE",
    reason: `the confidence bounds cross the -${(margin * 100).toFixed(1)} pp margin`,
    estimates
  };
}

function stageData(baselineRuns, candidateRuns) {
  const selectedIds = rowIds(baselineRuns[0]);
  const runMaps = baselineRuns.map((baseline, index) => ({
    baseline: new Map(baseline.rows.map((row) => [row.id, row])),
    candidate: new Map(candidateRuns[index].rows.map((row) => [row.id, row]))
  }));
  const transitionMatrix = emptyMatrix();
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
        pair.baseline.track !== pair.candidate.track &&
        !candidateOnly[pair.candidate.track].includes(id)
      ) {
        candidateOnly[pair.candidate.track].push(id);
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

    const deltas = [0, 0];
    for (const pair of classified) {
      transitionMatrix[pair.baseline.grade][pair.candidate.grade] += 1;
      const baselineRank = GRADE_RANK.get(pair.baseline.grade);
      const candidateRank = GRADE_RANK.get(pair.candidate.grade);
      deltas[0] += Number(candidateRank >= 2) - Number(baselineRank >= 2);
      deltas[1] += Number(candidateRank >= 1) - Number(baselineRank >= 1);
    }
    caseDeltas.push(deltas.map((delta) => delta / classified.length));
  }

  return { selectedIds, caseDeltas, transitionMatrix, exclusions, candidateOnly };
}

function analyzeRuns(baselineRuns, candidateRuns) {
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
      transitionMatrix: emptyMatrix(),
      exclusions: { content: [], T4: [], T5: [] },
      candidateOnly: { T4: [], T5: [] },
      rubricTuple: rubricTuple(baselineRuns[0] ?? {})
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
  const statistical = statisticalDecision(data.caseDeltas);
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
      rubricTuple: rubricTuple(baselineRuns[0])
    };
  }
  return {
    method: PAIRED_VERDICT_METHOD,
    verdict: statistical.verdict,
    denominator: data.caseDeltas.length,
    selected: data.selectedIds.length,
    runPairs: baselineRuns.length,
    reasons: [reason("statistical-decision", statistical.reason)],
    estimates: statistical.estimates,
    ...data,
    rubricTuple: rubricTuple(baselineRuns[0])
  };
}

function isStatisticalIndeterminate(result) {
  return result.verdict === "INDETERMINATE" &&
    result.denominator >= MINIMUM_ELIGIBLE_IDS &&
    result.reasons.length === 1 &&
    result.reasons[0].code === "statistical-decision";
}

export function comparePairedArtifacts({ baselineRuns, candidateRuns }) {
  const initial = analyzeRuns(baselineRuns.slice(0, 1), candidateRuns.slice(0, 1));
  if (baselineRuns.length === 1 && candidateRuns.length === 1) {
    if (isStatisticalIndeterminate(initial)) {
      return {
        ...initial,
        reasons: [
          ...initial.reasons,
          reason("repeat-required", "run exactly one paired repeat before the final verdict")
        ]
      };
    }
    return initial;
  }

  if (baselineRuns.length !== 2 || candidateRuns.length !== 2) {
    return analyzeRuns(baselineRuns, candidateRuns);
  }
  if (!isStatisticalIndeterminate(initial)) {
    return {
      ...initial,
      verdict: "INDETERMINATE",
      runPairs: 2,
      reasons: [
        reason(
          "repeat-rule",
          initial.verdict === "INDETERMINATE"
            ? "the initial blocker is not statistical uncertainty; do not repeat"
            : `the initial verdict was ${initial.verdict}; the fixed rule stops after it`
        )
      ]
    };
  }
  return analyzeRuns(baselineRuns, candidateRuns);
}

function exclusionCount(result) {
  return result.exclusions.content.length + result.exclusions.T4.length + result.exclusions.T5.length;
}

export function formatPairedVerdict(result) {
  const reasonText = result.reasons.map((item) => item.message).join("; ");
  return (
    `${result.verdict} denominator=${result.denominator}/${result.selected} eligible IDs ` +
    `(content=${result.exclusions.content.length}, T4=${result.exclusions.T4.length}, ` +
    `T5=${result.exclusions.T5.length}, excluded=${exclusionCount(result)}) ` +
    `runPairs=${result.runPairs} reasons=${reasonText}`
  );
}

function readArtifact(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function parseArgs(argv) {
  const positional = [];
  let baselineRepeat;
  let candidateRepeat;
  let json = false;
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === "--baseline-repeat") baselineRepeat = argv[++index];
    else if (arg === "--candidate-repeat") candidateRepeat = argv[++index];
    else if (arg === "--json") json = true;
    else if (arg === "--help" || arg === "-h") {
      return { help: true };
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
    json
  };
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
    if (args.help) {
      console.log(
        "usage: node eval/qa/paired-verdict.mjs <baseline.json> <candidate.json> " +
        "[--baseline-repeat <json> --candidate-repeat <json>] [--json]"
      );
      return;
    }
    const baselineRuns = [readArtifact(args.baseline)];
    const candidateRuns = [readArtifact(args.candidate)];
    if (args.baselineRepeat) {
      baselineRuns.push(readArtifact(args.baselineRepeat));
      candidateRuns.push(readArtifact(args.candidateRepeat));
    }
    const result = comparePairedArtifacts({ baselineRuns, candidateRuns });
    console.log(args.json ? JSON.stringify(result, null, 2) : formatPairedVerdict(result));
    process.exitCode = result.verdict === "PASS" ? 0 : result.verdict === "FAIL" ? 1 : 2;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`INDETERMINATE denominator=0/0 eligible IDs reasons=${message}`);
    process.exitCode = 2;
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) await main();
