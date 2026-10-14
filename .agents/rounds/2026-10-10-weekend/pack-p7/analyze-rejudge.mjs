#!/usr/bin/env node
// Offline reading of the paired p6/p7 re-judge artifacts. It makes no model call.
// Input: rejudge-artifacts.json (invocation, arm, artifact path, artifact SHA-256).
// Output (stdout): per-row panel scores, votes, costs, pack hashes, and evidence-support checks,
// plus per-stage reading-rule results. Rationales for changed scores are included for review.
//
// Usage (from the repository root):
//   node .agents/rounds/2026-10-10-weekend/pack-p7/analyze-rejudge.mjs > rejudge-summary.json
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const DIR = ".agents/rounds/2026-10-10-weekend/pack-p7";
const RANK = { wrong: 0, partial: 1, correct: 2 };
const STAGE_OF = (invocation) => Number(invocation.slice(1, 2));
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

const manifest = JSON.parse(readFileSync(`${DIR}/rejudge-artifacts.json`, "utf8"));
const rows = new Map();
const invocations = [];
for (const entry of manifest.artifacts) {
  const bytes = readFileSync(entry.path);
  if (sha256(bytes) !== entry.sha256) throw new Error(`${entry.path}: SHA-256 differs from the manifest`);
  const artifact = JSON.parse(bytes);
  const source = JSON.parse(readFileSync(artifact.meta.sourceResultsPath, "utf8"));
  invocations.push({
    invocation: entry.invocation,
    arm: entry.arm,
    artifact: entry.path,
    status: artifact.meta.outcome?.status ?? null,
    casesMode: artifact.meta.casesMode,
    casesSha256: artifact.meta.casesSha256,
    packVersion: artifact.meta.packVersion,
    capUsd: artifact.meta.budget?.authorizedUsd ?? null,
    costUsd: artifact.meta.budget?.reportedSpendUsd ?? null,
    calls: artifact.meta.budget?.reportedCalls ?? null,
    maxCallUsd: Math.max(...(artifact.meta.budget?.calls ?? []).map((call) => call.costUsd ?? 0)),
    missingCosts: artifact.meta.budget?.missingCosts ?? null,
    incompleteIds: artifact.meta.incompleteIds ?? [],
    unattemptedIds: artifact.meta.unattemptedIds ?? []
  });
  for (const row of artifact.rows) {
    const key = `${entry.invocation}|${row.id}`;
    const record = rows.get(key) ?? {
      stage: STAGE_OF(entry.invocation),
      invocation: entry.invocation,
      sourceFile: artifact.meta.sourceResultsPath.split("/eval/qa/results/")[1],
      id: row.id,
      stored: { score: row.original?.score ?? null, rubric: row.original?.rubric ?? null, packVersion: row.original?.packVersion ?? null }
    };
    const storedPack = source.rows.find((candidate) => candidate.id === row.id)?.evidencePack?.sha256 ?? null;
    record[entry.arm] = {
      score: row.new?.score ?? null,
      votes: row.attempts.judgeCalls.map((call) => call.verdict?.score ?? null),
      panelDisagreement: row.new?.meta?.panelDisagreement ?? null,
      costUsd: Number(row.attempts.judgeCalls.reduce((sum, call) => sum + (call.costUsd ?? 0), 0).toFixed(6)),
      pack: { ...row.evidencePack, matchesStoredP6: row.evidencePack?.sha256 === storedPack },
      supportChecks: row.attempts.judgeCalls.map((call) => call.verdict?.evidenceSupportCheck?.status ?? "none"),
      omittedBySupportCheck: row.attempts.judgeCalls.flatMap((call) => [
        ...(call.verdict?.evidenceSupportCheck?.omittedTerms ?? []),
        ...(call.verdict?.evidenceSupportCheck?.omittedProse ?? [])
      ]),
      wrongClaims: row.new?.wrongClaims ?? [],
      rationale: row.new?.rationale ?? ""
    };
    rows.set(key, record);
  }
}

const compared = [...rows.values()].map((row) => {
  const a = RANK[row.A?.score];
  const b = RANK[row.B?.score];
  const direction = a === undefined || b === undefined ? "not-comparable" : b > a ? "up" : b < a ? "down" : "same";
  const citesOmission = /claimSupportOmitted/i.test(row.B?.rationale ?? "") ||
    (row.B?.wrongClaims ?? []).some((claim) => /claimSupportOmitted/i.test(claim));
  return { ...row, direction, armBCitesOmissionLine: citesOmission };
});

const stage = (number) => compared.filter((row) => row.stage === number);
const count = (list, direction) => list.filter((row) => row.direction === direction).length;
const stageSummary = (number) => {
  const list = stage(number);
  return {
    rows: list.length,
    up: count(list, "up"),
    same: count(list, "same"),
    down: count(list, "down"),
    notComparable: count(list, "not-comparable"),
    errorVerdicts: list.filter((row) => row.A?.score === "error" || row.B?.score === "error").length,
    costUsd: Number(invocations.filter((item) => STAGE_OF(item.invocation) === number)
      .reduce((sum, item) => sum + (item.costUsd ?? 0), 0).toFixed(4))
  };
};

console.log(JSON.stringify({
  schema: "p7-paired-rejudge-summary-v1",
  totals: {
    invocations: invocations.length,
    calls: invocations.reduce((sum, item) => sum + (item.calls ?? 0), 0),
    costUsd: Number(invocations.reduce((sum, item) => sum + (item.costUsd ?? 0), 0).toFixed(4)),
    maxCallUsd: Math.max(...invocations.map((item) => item.maxCallUsd)),
    missingCosts: invocations.reduce((sum, item) => sum + (item.missingCosts ?? 0), 0),
    nonSuccessful: invocations.filter((item) => item.status !== "successful").map((item) => `${item.arm}-${item.invocation}:${item.status}`),
    armAPacksMatchingStoredP6: compared.filter((row) => row.A?.pack.matchesStoredP6).length,
    rows: compared.length
  },
  stages: { 1: stageSummary(1), 2: stageSummary(2), 3: stageSummary(3) },
  invocations,
  rows: compared
}, null, 2));
