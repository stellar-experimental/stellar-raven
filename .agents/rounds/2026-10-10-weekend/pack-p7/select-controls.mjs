#!/usr/bin/env node
// Offline control selection for a paid p7 re-judge. It reads ignored saved results, rebuilds p6
// and p7 packs, and selects stored-correct non-stable p6 rows whose p6 pack reproduces exactly.
// It also selects stored-wrong no-false-upgrade controls.
// It also checks that stable rows keep identical judge prompts. It makes no model call.
//
// Usage (from the repository root):
//   node .agents/rounds/2026-10-10-weekend/pack-p7/select-controls.mjs [results-dir] > out.json
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import {
  buildTranscriptEvidencePack,
  findTranscriptEvidencePackOmissions
} from "../../../../eval/qa/evidence-pack.mjs";
import { buildJudgePrompt } from "../../../../eval/qa/judge.mjs";

const P6_REVISION = "d15a4ce5";
const CONTROL_COUNT = 20;
const OMISSION_ROWS = ".agents/rounds/2026-10-09-continuation/pack-omission/stored-pack-omissions.json";
const resultsDir = resolve(process.argv[2] ?? "eval/qa/results");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

const p6Source = execFileSync("git", ["show", `${P6_REVISION}:eval/qa/evidence-pack.mjs`], { encoding: "utf8" });
const p6 = await import(`data:text/javascript;base64,${Buffer.from(p6Source).toString("base64")}`);
if (p6.PACK_VERSION !== "p6") throw new Error(`revision ${P6_REVISION} does not define pack p6`);

const omissionKeys = new Set(JSON.parse(readFileSync(OMISSION_ROWS, "utf8")).map((row) => `${row.file}|${row.id}`));

function jsonFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? jsonFiles(join(dir, entry.name)) : entry.name.endsWith(".json") ? [join(dir, entry.name)] : []
  ).sort();
}

const answerOmissions = (row, text) => {
  const check = findTranscriptEvidencePackOmissions({ transcript: row.transcript, transcriptEvidence: text, claims: [row.answer] });
  return check.omittedTerms.length + check.omittedProse.length;
};

const candidates = [];
const wrongCandidates = [];
const stageOneIds = new Set();
const stable = { rows: 0, identicalPrompts: 0, differingPrompts: [] };
const costs = [];
const sources = {};
for (const path of jsonFiles(resultsDir)) {
  let data;
  const bytes = readFileSync(path);
  try {
    data = JSON.parse(bytes);
  } catch {
    continue;
  }
  if (!Array.isArray(data?.rows)) continue;
  const file = relative(resultsDir, path);
  for (const row of data.rows) {
    if (row.evidencePack?.packVersion !== "p6" || !row.caseInput || !Array.isArray(row.transcript) || !row.verdict) continue;
    sources[file] ??= sha256(bytes);
    if (Number.isFinite(row.verdict.costUsd)) costs.push(row.verdict.costUsd);
    const input = { ...row.caseInput, tags: row.tags, transcript: row.transcript, candidateAnswer: row.answer };
    if (row.tags?.freshness === "stable") {
      stable.rows += 1;
      const prompts = [p6.buildTranscriptEvidencePack(input), buildTranscriptEvidencePack(input)]
        .map((transcriptEvidence) => sha256(buildJudgePrompt({ ...input, transcriptEvidence })));
      if (prompts[0] === prompts[1]) stable.identicalPrompts += 1;
      else stable.differingPrompts.push(`${file}|${row.id}`);
      continue;
    }
    const storedWrongNoOmission = row.verdict.score === "wrong" &&
      row.verdict.evidenceSupportCheck?.status === "no-pack-omission";
    // Stage 1 measures the stored-p6 omission rows; they are never controls.
    if (omissionKeys.has(`${file}|${row.id}`)) {
      stageOneIds.add(row.id);
      continue;
    }
    if (row.verdict.score !== "correct" && !storedWrongNoOmission) continue;
    const packs = { p6: p6.buildTranscriptEvidencePack(input), p7: buildTranscriptEvidencePack(input) };
    if (!packs.p6 || sha256(packs.p6) !== row.evidencePack.sha256) continue;
    (storedWrongNoOmission ? wrongCandidates : candidates).push({
      file,
      id: row.id,
      service: row.tags?.service ?? null,
      freshness: row.tags?.freshness ?? null,
      storedRubric: row.verdict.rubric,
      storedCostUsd: row.verdict.costUsd ?? null,
      p6Chars: packs.p6.length,
      p7Chars: packs.p7.length,
      p6AnswerProbeOmissions: answerOmissions(row, packs.p6),
      p7AnswerProbeOmissions: answerOmissions(row, packs.p7)
    });
  }
}

// One row per case ID (latest file wins), then evenly spaced picks over sorted IDs.
const byId = new Map();
for (const candidate of candidates) byId.set(candidate.id, candidate);
const unique = [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
const step = unique.length / Math.min(CONTROL_COUNT, unique.length);
const controls = Array.from({ length: Math.min(CONTROL_COUNT, unique.length) }, (_, index) => unique[Math.floor(index * step)]);
// No-false-upgrade controls: stored wrong with a saved no-pack-omission check, one row per case ID
// (the latest file wins), excluding case IDs already in Stage 1 or in the correct controls.
// Arm B must not score them higher than arm A.
const usedIds = new Set([...stageOneIds, ...controls.map((row) => row.id)]);
const wrongById = new Map();
for (const candidate of wrongCandidates) if (!usedIds.has(candidate.id)) wrongById.set(candidate.id, candidate);
const falseUpgradeControls = [...wrongById.values()].sort((a, b) => a.id.localeCompare(b.id));
const sorted = [...costs].sort((a, b) => a - b);
const quantile = (q) => sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))] : null;

console.log(JSON.stringify({
  schema: "p7-control-selection-v1",
  p6Revision: P6_REVISION,
  controlRule: "non-stable, stored p6 pack with exact p6 rebuild, stored score correct, saved caseInput, not a pack-omission row; one row per case ID; evenly spaced over sorted IDs",
  sources,
  storedJudgeCostUsd: {
    calls: sorted.length,
    mean: sorted.length ? Number((sorted.reduce((sum, cost) => sum + cost, 0) / sorted.length).toFixed(4)) : null,
    p50: quantile(0.5),
    p90: quantile(0.9),
    max: sorted.at(-1) ?? null
  },
  stableRows: stable,
  eligibleCandidates: candidates.length,
  uniqueCandidateIds: unique.length,
  candidateAnswerProbeOmissions: {
    p6: candidates.reduce((sum, row) => sum + row.p6AnswerProbeOmissions, 0),
    p7: candidates.reduce((sum, row) => sum + row.p7AnswerProbeOmissions, 0),
    rowsWorseUnderP7: candidates.filter((row) => row.p7AnswerProbeOmissions > row.p6AnswerProbeOmissions).map((row) => `${row.file}|${row.id}`)
  },
  controls,
  falseUpgradeRule: "non-stable, stored p6 pack with exact p6 rebuild, stored score wrong, saved evidenceSupportCheck.status no-pack-omission, saved caseInput; one row per case ID, latest file; case IDs in Stage 1 (stored-p6 omission rows) or the correct controls excluded",
  falseUpgradeControls
}, null, 2));
