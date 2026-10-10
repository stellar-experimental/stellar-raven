#!/usr/bin/env node
// Predeclared reading for the p8 re-measurement. It makes no model call and writes JSON to stdout.
// Input: rejudge-artifacts.json in this folder (reused arm-A p6 artifacts, then arm-B p8 artifacts).
// For each of the 32 rows it pairs the arm-A and arm-B panels and reports scores, votes, costs,
// reuse, pack hashes, the recorded evidenceSupportCheck of each vote, and a support check
// recomputed with the current span-only diagnostic on rebuilt packs. It then applies the plan's
// stage rules and lists every rationale that a reader must check. Rows without an arm-B artifact
// read as "not-run".
//
// Usage (from the repository root, where post-run-review/saved-data exists):
//   node .agents/rounds/2026-10-10-weekend/pack-p8/analyze-rejudge-p8.mjs > rejudge-summary-p8.json
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { findTranscriptEvidencePackOmissions, buildTranscriptEvidencePack } from "../../../../eval/qa/evidence-pack.mjs";

const DIR = ".agents/rounds/2026-10-10-weekend/pack-p8";
const INPUTS = ".agents/rounds/2026-10-10-weekend/pack-p7/post-run-review/saved-data";
const RANK = { wrong: 0, partial: 1, correct: 2 };
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const p6Source = execFileSync("git", ["show", "d15a4ce5:eval/qa/evidence-pack.mjs"], { encoding: "utf8" });
const p6 = await import(`data:text/javascript;base64,${Buffer.from(p6Source).toString("base64")}`);

const manifest = JSON.parse(readFileSync(`${DIR}/rejudge-artifacts.json`, "utf8"));
const rows = new Map();
const invocations = [];
for (const entry of manifest.artifacts) {
  const bytes = readFileSync(entry.path);
  if (sha256(bytes) !== entry.sha256) throw new Error(`${entry.path}: SHA-256 differs from the manifest`);
  const artifact = JSON.parse(bytes);
  const expectedPack = entry.arm === "A" ? "p6" : "p8";
  if (artifact.meta.packVersion !== expectedPack) throw new Error(`${entry.path}: pack ${artifact.meta.packVersion}, expected ${expectedPack}`);
  invocations.push({
    invocation: entry.invocation,
    arm: entry.arm,
    reused: entry.arm === "A",
    status: artifact.meta.outcome?.status ?? null,
    costUsd: artifact.meta.budget?.reportedSpendUsd ?? null,
    calls: artifact.meta.budget?.reportedCalls ?? null,
    maxCallUsd: Math.max(0, ...(artifact.meta.budget?.calls ?? []).map((call) => call.costUsd ?? 0))
  });
  for (const row of artifact.rows) {
    const key = `${entry.invocation}|${row.id}`;
    const record = rows.get(key) ?? { stage: Number(entry.invocation[1]), invocation: entry.invocation, id: row.id };
    const input = existsSync(`${INPUTS}/rr3-${entry.invocation}-A-${row.id}-input.json`)
      ? JSON.parse(readFileSync(`${INPUTS}/rr3-${entry.invocation}-A-${row.id}-input.json`, "utf8"))
      : null;
    const pack = input ? (entry.arm === "A" ? p6.buildTranscriptEvidencePack(input) : buildTranscriptEvidencePack(input)) : null;
    const votes = row.attempts.judgeCalls.map((call) => call.verdict);
    record[entry.arm] = {
      reused: entry.arm === "A",
      score: row.new?.score ?? null,
      votes: votes.map((vote) => vote?.score ?? null),
      costUsd: Number(row.attempts.judgeCalls.reduce((sum, call) => sum + (call.costUsd ?? 0), 0).toFixed(6)),
      packSha256: row.evidencePack?.sha256 ?? null,
      packRebuilt: pack === null ? "missing-local-input" : sha256(pack) === row.evidencePack?.sha256,
      recordedSupport: votes.map((vote) => vote?.evidenceSupportCheck?.status ?? "none"),
      // The recorded arm-A checks used the older diagnostic; this one counts source text only.
      spanSupport: pack === null ? null : votes.map((vote) => {
        const claims = Array.isArray(vote?.wrongClaims) ? vote.wrongClaims : [];
        return claims.length ? findTranscriptEvidencePackOmissions({ transcript: input.transcript, transcriptEvidence: pack, claims }).status : "none";
      }),
      wrongClaims: votes.map((vote) => vote?.wrongClaims ?? []),
      rationales: votes.map((vote) => vote?.rationale ?? "")
    };
    rows.set(key, record);
  }
}

const read = [...rows.values()].map((row) => {
  const a = RANK[row.A?.score];
  const b = RANK[row.B?.score];
  const direction = !row.B ? "not-run" : a === undefined || b === undefined ? "not-comparable" : b > a ? "up" : b < a ? "down" : "same";
  const armBText = (row.B?.rationales ?? []).concat((row.B?.wrongClaims ?? []).flat()).join("\n");
  return {
    ...row,
    direction,
    armBCitesNotice: /claimSupportNotice|did not fit this pack/i.test(armBText),
    armBEntryNumberMentions: [...armBText.matchAll(/[^.]{0,80}\bentr(?:y|ies) \d+[^.]{0,80}/gi)].map((match) => match[0].trim())
  };
});

const stage = (number) => read.filter((row) => row.stage === number);
const count = (list, direction) => list.filter((row) => row.direction === direction).length;
const check = (number) => {
  const list = stage(number);
  return {
    rows: list.length,
    run: list.filter((row) => row.B).length,
    up: count(list, "up"),
    same: count(list, "same"),
    down: count(list, "down"),
    // The plan's stage rules. Every flagged row needs its rationales read before a verdict.
    flaggedForReading: list.filter((row) =>
      (number === 2 && row.direction === "down") ||
      (number === 3 && row.direction === "up") ||
      (number === 1 && row.B && row.direction !== "same") ||
      row.armBCitesNotice ||
      row.armBEntryNumberMentions.length
    ).map((row) => `${row.invocation}|${row.id}`)
  };
};

console.log(JSON.stringify({
  schema: "p8-paired-rejudge-reading-v1",
  totals: {
    rows: read.length,
    armBRows: read.filter((row) => row.B).length,
    armBCalls: invocations.filter((item) => item.arm === "B").reduce((sum, item) => sum + (item.calls ?? 0), 0),
    armBCostUsd: Number(invocations.filter((item) => item.arm === "B").reduce((sum, item) => sum + (item.costUsd ?? 0), 0).toFixed(4)),
    maxArmBCallUsd: Math.max(0, ...invocations.filter((item) => item.arm === "B").map((item) => item.maxCallUsd)),
    nonSuccessful: invocations.filter((item) => item.status !== "successful").map((item) => `${item.arm}-${item.invocation}:${item.status}`)
  },
  stages: { 1: check(1), 2: check(2), 3: check(3) },
  invocations,
  rows: read
}, null, 2));
