#!/usr/bin/env node
// Predeclared reading for the p9 re-measurement (measurement-plan-p9.md). It makes no model call
// and writes JSON to stdout. It never edits a manifest or an artifact.
//
// For each of the 32 rows it pairs the reused arm-A p6 panel with an arm-B panel:
//   - a changed row (rejudge-artifacts-p9.json changedRows) reads the new p9 panel, or "not-run";
//   - any other row reads the p8 panel of the p8 run, but only when the rebuilt p9 prompt equals
//     the recorded p8 prompt. Otherwise the row is INCONCLUSIVE.
// A new p9 panel passes the mechanical gate only with: pack p9 and its rebuilt SHA-256, the rebuilt
// prompt hash on every call, exactly 3 graded votes (no error vote), 3 reported costs, no call over
// $0.60, a successful outcome, and a passed postflight. A failed gate makes the row INCONCLUSIVE.
// For every arm-B vote it reports the span-only support check on the rebuilt pack, the avoid
// matches, and which entity-list records the rationale names (review R8-1 and R8-2). It flags every
// row that a reader must check under the stage rules.
//
// Usage (from the repository root):
//   node .agents/rounds/2026-10-12-pack-p9/analyze-rejudge-p9.mjs > .agents/rounds/2026-10-12-pack-p9/rejudge-summary-p9.json
//   node .agents/rounds/2026-10-12-pack-p9/analyze-rejudge-p9.mjs --stand-in p8
// The stand-in reads the p8 panels of the changed rows as if they were new p9 panels. Their prompts
// differ from p9, so the gate must report every changed row INCONCLUSIVE. It proves the gate offline.
import { readFileSync } from "node:fs";
import {
  entityListClaims,
  entityListCoverage,
  explainTranscriptEvidencePack,
  findTranscriptEvidencePackOmissions,
  PACK_VERSION
} from "../../../eval/qa/evidence-pack.mjs";
import { buildJudgePrompt } from "../../../eval/qa/judge.mjs";
import { rowInput, sha256, storedArtifact } from "./inputs.mjs";

const DIR = ".agents/rounds/2026-10-12-pack-p9";
const RANK = { wrong: 0, partial: 1, correct: 2 };
const CALL_CHECKPOINT_USD = 0.6;
const args = process.argv.slice(2);
const standIn = args[0] === "--stand-in" ? args[1] : null;
if (args.length && standIn !== "p8") throw new Error("usage: analyze-rejudge-p9.mjs [--stand-in p8]");
if (PACK_VERSION !== "p9") throw new Error(`this tree defines ${PACK_VERSION}, not p9`);

const manifest = JSON.parse(readFileSync(`${DIR}/rejudge-artifacts-p9.json`, "utf8"));
const entriesOf = (side) => JSON.parse(readFileSync(side.manifest, "utf8")).artifacts.filter((entry) => entry.arm === side.arm);
const armA = entriesOf(manifest.armA);
const armP8 = entriesOf(manifest.armBReused);
const changed = new Set(manifest.changedRows.map((row) => `${row.invocation}|${row.id}`));
const artifactFor = (entries, invocation) => {
  const entry = entries.find((candidate) => candidate.invocation === invocation);
  return entry ? storedArtifact(entry) : null;
};
const newArtifacts = standIn
  ? armP8.map((entry) => ({ invocation: `P9-${entry.invocation}`, entry }))
  : manifest.artifacts.map((entry) => ({ invocation: entry.invocation, entry }));

function panel(artifact, id) {
  const row = artifact.data.rows.find((candidate) => candidate.id === id);
  if (!row) return null;
  const calls = row.attempts?.judgeCalls ?? [];
  return {
    packVersion: row.evidencePack?.packVersion ?? artifact.data.meta.packVersion ?? null,
    packSha256: row.evidencePack?.sha256 ?? null,
    promptSha256: artifact.data.meta.promptSha256ById?.[id] ?? null,
    score: row.new?.score ?? null,
    votes: calls.map((call) => call.verdict?.score ?? null),
    costs: calls.map((call) => call.costUsd ?? null),
    inputHashes: calls.map((call) => call.inputSha256 ?? null),
    verdicts: calls.map((call) => call.verdict ?? null),
    status: artifact.data.meta.outcome?.status ?? null,
    postflight: artifact.data.meta.outcome?.postflight?.status ?? null
  };
}

// The mechanical gate for a new p9 panel (the R7-2 rule of the p8b amendment, per row).
function gate(result, pack, prompt) {
  const reasons = [];
  if (result.packVersion !== "p9") reasons.push(`pack ${result.packVersion}`);
  if (result.packSha256 !== sha256(pack)) reasons.push("pack SHA-256 differs from the rebuilt p9 pack");
  if (result.promptSha256 !== prompt) reasons.push("prompt SHA-256 differs from the rebuilt p9 prompt");
  if (result.votes.length !== 3) reasons.push(`${result.votes.length} judge calls, not 3`);
  if (result.votes.some((vote) => !(vote in RANK))) reasons.push("an error vote has no grade");
  if (result.costs.some((cost) => typeof cost !== "number")) reasons.push("a call cost is missing");
  if (result.costs.some((cost) => cost > CALL_CHECKPOINT_USD)) reasons.push(`a call cost more than $${CALL_CHECKPOINT_USD}`);
  if (result.inputHashes.some((hash) => hash !== prompt)) reasons.push("a call input hash differs from the rebuilt p9 prompt");
  if (result.status !== "successful") reasons.push(`outcome ${result.status}`);
  if (result.postflight !== "passed") reasons.push(`postflight ${result.postflight}`);
  return reasons;
}

const rows = [];
for (const entryA of armA) {
  const artifactA = storedArtifact(entryA);
  const artifactP8 = artifactFor(armP8, entryA.invocation);
  const fresh = newArtifacts.find((item) => item.invocation === `P9-${entryA.invocation}`);
  const artifactP9 = fresh ? storedArtifact(fresh.entry) : null;
  for (const id of artifactA.data.meta.selectedIds) {
    const key = `${entryA.invocation}|${id}`;
    const input = rowInput(artifactA, id);
    const pack = explainTranscriptEvidencePack(input).text;
    const prompt = sha256(buildJudgePrompt({ ...input, transcriptEvidence: pack }));
    const a = panel(artifactA, id);
    let b = null;
    let source = "not-run";
    let inconclusive = [];
    if (changed.has(key)) {
      const result = artifactP9 ? panel(artifactP9, id) : null;
      if (result) {
        b = result;
        source = standIn ? "stand-in-p8" : "p9-new";
        inconclusive = gate(result, pack, prompt);
      }
    } else {
      b = panel(artifactP8, id);
      source = "p8-reused";
      if (b.promptSha256 !== prompt) inconclusive.push("rebuilt p9 prompt differs from the recorded p8 prompt; reuse is invalid");
    }
    const listLabels = [...new Set(entityListClaims(input).flatMap((claim) => claim.records.map((record) => record.label)))];
    const direction = !b ? "not-run" : inconclusive.length ? "inconclusive" : b.score === null || a.score === null
      ? "not-comparable" : RANK[b.score] > RANK[a.score] ? "up" : RANK[b.score] < RANK[a.score] ? "down" : "same";
    const votes = (b?.verdicts ?? []).map((verdict) => {
      const claims = Array.isArray(verdict?.wrongClaims) ? verdict.wrongClaims : [];
      const text = [verdict?.rationale ?? "", ...claims].join("\n");
      return {
        score: verdict?.score ?? null,
        avoidMatches: verdict?.avoidMatches ?? [],
        spanSupport: claims.length ? findTranscriptEvidencePackOmissions({ transcript: input.transcript, transcriptEvidence: pack, claims }).status : "none",
        listRecordsNamed: listLabels.filter((label) => new RegExp(`(?<![\\p{L}\\p{N}])${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{N}])`, "iu").test(text)),
        citesNotice: /claimSupportNotice|did not fit this pack/i.test(text),
        entryNumberMentions: [...text.matchAll(/[^.]{0,80}\bentr(?:y|ies) \d+[^.]{0,80}/gi)].map((match) => match[0].trim()),
        rationale: verdict?.rationale ?? "",
        wrongClaims: claims
      };
    });
    rows.push({
      stage: Number(entryA.invocation[1]),
      invocation: entryA.invocation,
      id,
      changed: changed.has(key),
      armBSource: source,
      p9PackSha256: sha256(pack),
      p9PromptSha256: prompt,
      p9ListCoverage: (({ records, shown, complete }) => ({ records, shown, complete }))(
        entityListCoverage({ ...input, transcriptEvidence: pack })
      ),
      armA: a && { score: a.score, votes: a.votes },
      armB: b && { score: b.score, votes: b.votes, costUsd: Number(b.costs.reduce((sum, cost) => sum + (cost ?? 0), 0).toFixed(7)) },
      inconclusive,
      direction,
      votes
    });
  }
}

const stage = (number) => rows.filter((row) => row.stage === number);
const flagged = (row) =>
  row.direction === "inconclusive" ||
  (row.stage === 1 && row.changed && row.direction !== "same" && row.direction !== "not-run") ||
  (row.stage === 2 && row.direction === "down") ||
  (row.stage === 3 && row.direction === "up") ||
  row.votes.some((vote) => vote.citesNotice || vote.entryNumberMentions.length);
const fresh = rows.filter((row) => row.armBSource === "p9-new" || row.armBSource === "stand-in-p8");
const changedRun = rows.filter((row) => row.changed && row.armBSource !== "not-run");
console.log(JSON.stringify({
  schema: "p9-paired-rejudge-reading-v1",
  standIn,
  status: rows.some((row) => row.direction === "inconclusive")
    ? "INCONCLUSIVE"
    : changedRun.length < changed.size ? (changedRun.length ? "partial-run" : "not-run") : "ready-for-reading",
  totals: {
    rows: rows.length,
    changedRows: changed.size,
    changedRowsRun: changedRun.length,
    reusedP8Rows: rows.filter((row) => row.armBSource === "p8-reused").length,
    newCalls: fresh.reduce((sum, row) => sum + row.votes.length, 0),
    newCostUsd: Number(fresh.reduce((sum, row) => sum + (row.armB?.costUsd ?? 0), 0).toFixed(4))
  },
  stages: Object.fromEntries([1, 2, 3].map((number) => {
    const list = stage(number);
    const count = (direction) => list.filter((row) => row.direction === direction).length;
    return [number, {
      rows: list.length,
      up: count("up"),
      same: count("same"),
      down: count("down"),
      inconclusive: count("inconclusive"),
      notRun: count("not-run"),
      flaggedForReading: list.filter(flagged).map((row) => `${row.invocation}|${row.id}`)
    }];
  })),
  rows
}, null, 2));
