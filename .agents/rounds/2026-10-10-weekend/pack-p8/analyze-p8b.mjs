#!/usr/bin/env node
// Predeclared offline reading for the p8b continuation (amendment-p8b.md). It makes no model call
// and writes JSON to stdout. It never edits a manifest or an artifact.
//
// It reads p8b-artifacts.json, which maps the single P8B invocation to:
//   - the saved input of q-defi-arbitrage-pathpayment-bots (rebuilt pack and prompt must match),
//   - the reused p6 baseline panel (arm A of S2a), and
//   - the historical p7 and p8 arm-B panels of S2a, which stay separate and are never replaced.
// For the continuation artifact it applies the acceptance gate (R7-2): exactly 3 judge calls,
// every call graded (no error vote), 3 reported costs, every input hash equal to the expected
// prompt and answer, identity and postflight checks passed, pack p8, and no call over the $0.60
// after-invocation checkpoint. Any failure makes the continuation INCONCLUSIVE. Otherwise the
// status is "ready-for-reading": a reader then applies the amended Stage 2 rule to every rationale.
// It also recomputes the span-only support diagnostic for each new vote.
//
// Usage (from the repository root, where the saved input exists):
//   node .agents/rounds/2026-10-10-weekend/pack-p8/analyze-p8b.mjs
//   node .agents/rounds/2026-10-10-weekend/pack-p8/analyze-p8b.mjs --stand-in historical
//   node .agents/rounds/2026-10-10-weekend/pack-p8/analyze-p8b.mjs --stand-in error-vote
// A stand-in uses the historical p8 S2a artifact as if it were the continuation (no paid call).
// "error-vote" also turns vote 1 into an error vote in memory, to prove the gate.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { buildTranscriptEvidencePack, findTranscriptEvidencePackOmissions } from "../../../../eval/qa/evidence-pack.mjs";
import { buildJudgePrompt } from "../../../../eval/qa/judge.mjs";

const DIR = ".agents/rounds/2026-10-10-weekend/pack-p8";
const RANK = { wrong: 0, partial: 1, correct: 2 };
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const args = process.argv.slice(2);
const standIn = args[0] === "--stand-in" ? args[1] : null;
if (args.length && !["historical", "error-vote"].includes(standIn)) throw new Error("usage: analyze-p8b.mjs [--stand-in historical|error-vote]");

const manifest = JSON.parse(readFileSync(`${DIR}/p8b-artifacts.json`, "utf8"));
const expected = manifest.expected;
const readArtifact = (entry) => {
  const bytes = readFileSync(entry.path);
  if (sha256(bytes) !== entry.sha256) throw new Error(`${entry.path}: SHA-256 differs from p8b-artifacts.json`);
  return JSON.parse(bytes);
};
const rowOf = (artifact) => {
  const row = artifact.rows.find((candidate) => candidate.id === manifest.row);
  if (!row) throw new Error(`artifact has no row ${manifest.row}`);
  return row;
};

// Rebuild the judge input for this row and prove it equals the expected pack and prompt.
const input = JSON.parse(readFileSync(manifest.savedInput, "utf8"));
const pack = buildTranscriptEvidencePack(input);
const prompt = buildJudgePrompt({ ...input, transcriptEvidence: pack });
const inputCheck = {
  packMatches: sha256(pack) === expected.packSha256,
  promptMatches: sha256(prompt) === expected.promptSha256
};
if (!inputCheck.packMatches || !inputCheck.promptMatches) throw new Error("rebuilt p8 pack or prompt differs from the expected hashes");
const answerSha256 = sha256(input.candidateAnswer);

const panel = (label, artifact) => {
  const row = rowOf(artifact);
  const votes = row.attempts.judgeCalls.map((call) => call.verdict);
  return {
    label,
    packVersion: row.evidencePack?.packVersion ?? null,
    packSha256: row.evidencePack?.sha256 ?? null,
    score: row.new?.score ?? null,
    votes: votes.map((vote) => vote?.score ?? null),
    costUsd: Number(row.attempts.judgeCalls.reduce((sum, call) => sum + (call.costUsd ?? 0), 0).toFixed(7)),
    rationales: votes.map((vote) => vote?.rationale ?? ""),
    wrongClaims: votes.map((vote) => vote?.wrongClaims ?? [])
  };
};

const baseline = panel(manifest.baseline.label, readArtifact(manifest.baseline));
if (baseline.packSha256 !== manifest.baseline.packSha256) throw new Error("baseline pack SHA-256 differs");
const historical = manifest.historical.map((entry) => panel(entry.label, readArtifact(entry)));

let continuationEntry = manifest.continuation;
if (standIn) continuationEntry = manifest.historical.find((entry) => entry.label.startsWith("p8 run"));
let report = { status: "not-run" };
if (continuationEntry) {
  const artifact = readArtifact(continuationEntry);
  if (standIn === "error-vote") {
    const call = rowOf(artifact).attempts.judgeCalls[0];
    call.verdict = { ...call.verdict, score: "error", failureClass: "cli", rationale: "stand-in error vote" };
  }
  const row = rowOf(artifact);
  const calls = row.attempts.judgeCalls;
  const meta = artifact.meta;
  const identity = meta.judgeIdentity ?? {};
  const failures = [];
  const require = (ok, message) => { if (!ok) failures.push(message); };
  require(artifact.rows.length === 1 || standIn, `expected 1 row, found ${artifact.rows.length}`);
  require(calls.length === expected.calls, `expected ${expected.calls} judge calls, found ${calls.length}`);
  require(calls.every((call) => call.verdict?.score && call.verdict.score !== "error"), "an error vote has no grade");
  require(calls.every((call) => Number.isFinite(call.costUsd)), "a call has no reported cost");
  require(calls.every((call) => call.inputSha256 === expected.promptSha256), "a call's input hash differs from the expected prompt");
  require(calls.every((call) => call.answerSha256 === answerSha256), "a call's answer hash differs from the saved answer");
  require(calls.every((call) => (call.costUsd ?? 0) <= expected.checkpointUsd), `a call exceeds the $${expected.checkpointUsd} after-invocation checkpoint`);
  require(row.evidencePack?.packVersion === expected.packVersion && row.evidencePack?.sha256 === expected.packSha256, "the row's pack differs from the expected p8 pack");
  require(meta.packVersion === expected.packVersion && meta.judgeRubric === expected.rubric && meta.judgeModel === expected.model && meta.judgePanel === expected.panel, "model, rubric, panel, or pack differs");
  require(meta.outcome?.status === "successful" && meta.outcome?.postflight?.status === "passed", `outcome ${meta.outcome?.status}/${meta.outcome?.postflight?.status}`);
  require(identity.guard?.matches === true, "the identity guard did not pass");
  require(identity.before?.binary?.sha256 === expected.binarySha256 && identity.before?.environment?.sha256 === expected.environmentSha256, "binary or environment pin differs");
  require(standIn || meta.budget?.authorizedUsd === expected.capUsd, `file cap ${meta.budget?.authorizedUsd}, expected ${expected.capUsd}`);

  const votes = calls.map((call) => call.verdict);
  const scores = votes.map((vote) => vote?.score ?? null);
  const graded = scores.filter((score) => score in RANK);
  const text = votes.map((vote) => `${vote?.rationale ?? ""}\n${(vote?.wrongClaims ?? []).join("\n")}`).join("\n");
  report = {
    status: failures.length ? "INCONCLUSIVE" : "ready-for-reading",
    standIn,
    gateFailures: failures,
    score: row.new?.score ?? null,
    votes: scores,
    gradedVotes: graded.length,
    directionVsBaseline: RANK[row.new?.score] === undefined ? "not-comparable"
      : RANK[row.new.score] > RANK[baseline.score] ? "up" : RANK[row.new.score] < RANK[baseline.score] ? "down" : "same",
    costsUsd: calls.map((call) => call.costUsd ?? null),
    maxCallUsd: Math.max(0, ...calls.map((call) => call.costUsd ?? 0)),
    // Recomputed with the current span-only diagnostic; the recorded check used the older filter.
    spanSupport: votes.map((vote) => {
      const claims = Array.isArray(vote?.wrongClaims) ? vote.wrongClaims : [];
      return claims.length ? findTranscriptEvidencePackOmissions({ transcript: input.transcript, transcriptEvidence: pack, claims }).status : "none";
    }),
    citesStellarTermStatus: votes.map((vote) => /stellarterm/i.test(`${vote?.rationale ?? ""} ${(vote?.wrongClaims ?? []).join(" ")}`)),
    citesNotice: /claimSupportNotice|did not fit this pack/i.test(text),
    entryNumberMentions: [...text.matchAll(/[^.]{0,80}\bentr(?:y|ies) \d+[^.]{0,80}/gi)].map((match) => match[0].trim()),
    rationales: votes.map((vote) => vote?.rationale ?? ""),
    wrongClaims: votes.map((vote) => vote?.wrongClaims ?? [])
  };
}

console.log(JSON.stringify({
  schema: "p8b-reading-v1",
  row: manifest.row,
  inputCheck,
  baseline,
  historical,
  continuation: report,
  readingRule: "amendment-p8b.md: amended Stage 2 rule; the gate above must pass first; a reader classifies every rationale"
}, null, 2));
