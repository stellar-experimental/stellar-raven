#!/usr/bin/env node
// R5-1 check (diagnostic only). It makes no model call and writes JSON to stdout.
// 1. Rebuild all 64 packs and 64 full judge prompts of the p8 run from the R6 saved inputs and
//    compare them with the hashes recorded in the 24 artifacts. Arm A uses the p6 module from
//    d15a4ce5; arm B uses the p8 module in this tree.
// 2. Compare the support diagnostic before (commit 36e77d40) and after the R5-1 filter for every
//    vote with wrong claims, in both arms.
//
// Usage (from the repository root, where post-run-review/saved-data exists):
//   node .agents/rounds/2026-10-10-weekend/pack-p8/verify-r5-1.mjs > r5-1-check.json
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { buildTranscriptEvidencePack, findTranscriptEvidencePackOmissions, PACK_VERSION } from "../../../../eval/qa/evidence-pack.mjs";
import { buildJudgePrompt } from "../../../../eval/qa/judge.mjs";

const DIR = ".agents/rounds/2026-10-10-weekend/pack-p8";
const INPUTS = `${DIR}/post-run-review/saved-data`;
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const load = async (revision) => import(`data:text/javascript;base64,${Buffer.from(
  execFileSync("git", ["show", `${revision}:eval/qa/evidence-pack.mjs`], { encoding: "utf8" })
).toString("base64")}`);
const p6 = await load("d15a4ce5");
const before = await load("36e77d40");
if (PACK_VERSION !== "p8" || before.PACK_VERSION !== "p8") throw new Error("expected pack p8");

const manifest = JSON.parse(readFileSync(`${DIR}/rejudge-artifacts.json`, "utf8"));
const identity = { packs: 0, packsMatching: 0, prompts: 0, promptsMatching: 0, mismatches: [] };
const diagnostic = { comparedVotes: 0, changes: [] };
for (const entry of manifest.artifacts) {
  const artifact = JSON.parse(readFileSync(entry.path, "utf8"));
  for (const row of artifact.rows) {
    const input = JSON.parse(readFileSync(`${INPUTS}/rr6-${entry.invocation}-${entry.arm}-${row.id}-input.json`, "utf8"));
    const pack = entry.arm === "A" ? p6.buildTranscriptEvidencePack(input) : buildTranscriptEvidencePack(input);
    const prompt = buildJudgePrompt({ ...input, transcriptEvidence: pack });
    identity.packs += 1;
    identity.prompts += 1;
    if (sha256(pack) === row.evidencePack?.sha256) identity.packsMatching += 1;
    else identity.mismatches.push(`${entry.arm}|${entry.invocation}|${row.id}|pack`);
    if (sha256(prompt) === artifact.meta.promptSha256ById[row.id]) identity.promptsMatching += 1;
    else identity.mismatches.push(`${entry.arm}|${entry.invocation}|${row.id}|prompt`);
    if (entry.arm === "B" && before.buildTranscriptEvidencePack(input) !== pack) identity.mismatches.push(`B|${entry.invocation}|${row.id}|p8-before`);
    row.attempts.judgeCalls.forEach((call, index) => {
      const claims = Array.isArray(call.verdict?.wrongClaims) ? call.verdict.wrongClaims : [];
      if (!claims.length) return;
      const args = { transcript: input.transcript, transcriptEvidence: pack, claims };
      const was = before.findTranscriptEvidencePackOmissions(args);
      const now = findTranscriptEvidencePackOmissions(args);
      diagnostic.comparedVotes += 1;
      if (JSON.stringify(was) !== JSON.stringify(now)) {
        diagnostic.changes.push({ arm: entry.arm, invocation: entry.invocation, id: row.id, vote: index + 1, before: was, after: now });
      }
    });
  }
}
console.log(JSON.stringify({ schema: "p8-r5-1-check-v1", packVersion: PACK_VERSION, identity, diagnostic }, null, 2));
