#!/usr/bin/env node
// Offline replay: rebuild p6 and p7 packs for the saved p6-era pack-omission rows and report,
// per disputed claim, whether each final pack text holds the support that the transcript holds.
// It reads ignored saved results and writes JSON to stdout. It makes no model call.
//
// Usage (from the repository root):
//   node .agents/rounds/2026-10-10-weekend/pack-p7/replay-p7-omissions.mjs [results-dir] > out.json
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  buildTranscriptEvidencePack,
  findTranscriptEvidencePackOmissions,
  PACK_VERSION
} from "../../../../eval/qa/evidence-pack.mjs";

const P6_REVISION = "d15a4ce5";
const ROWS_FILE = ".agents/rounds/2026-10-09-continuation/pack-omission/stored-pack-omissions.json";
const resultsDir = resolve(process.argv[2] ?? "eval/qa/results");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

const p6Source = execFileSync("git", ["show", `${P6_REVISION}:eval/qa/evidence-pack.mjs`], { encoding: "utf8" });
const p6 = await import(`data:text/javascript;base64,${Buffer.from(p6Source).toString("base64")}`);
if (p6.PACK_VERSION !== "p6") throw new Error(`revision ${P6_REVISION} does not define pack p6`);

function corpusCases() {
  const root = "eval/qa/corpus/battery";
  const cases = new Map();
  for (const category of readdirSync(root)) {
    for (const name of readdirSync(join(root, category)).filter((file) => file.endsWith(".json"))) {
      const kase = JSON.parse(readFileSync(join(root, category, name), "utf8"));
      cases.set(kase.id, kase);
    }
  }
  return cases;
}

// Probes that the saved answer itself carries. Judge-only text never counts as candidate support.
function answerProbes(answer, claim) {
  const padded = String(answer ?? "").replace(/[.,;:!?)\]]+(?=\s|$)/g, " $&");
  const check = findTranscriptEvidencePackOmissions({ transcript: [{ tool: "execute", result: padded }], claims: [claim] });
  return { terms: new Set(check.omittedTerms), prose: new Set(check.omittedProse) };
}

function packCheck(transcript, text, claim, allowed) {
  const check = findTranscriptEvidencePackOmissions({ transcript, transcriptEvidence: text, claims: [claim] });
  return {
    terms: check.omittedTerms.filter((term) => allowed.terms.has(term)),
    prose: check.omittedProse.filter((probe) => allowed.prose.has(probe))
  };
}

function claimReport(row, claim, packs) {
  const answer = answerProbes(row.answer, claim);
  // An empty pack lists every probe that the transcript supports.
  const transcript = packCheck(row.transcript, "", claim, answer);
  const supported = { terms: new Set(transcript.terms), prose: new Set(transcript.prose) };
  const omitted = Object.fromEntries(
    Object.entries(packs).map(([version, text]) => [version, packCheck(row.transcript, text, claim, supported)])
  );
  const count = (value) => value.terms.length + value.prose.length;
  const status = count(transcript) === 0
    ? "no-answer-support-in-transcript"
    : count(omitted.p7) === 0 ? "p7-holds-support" : "p7-omits-support";
  return {
    claim,
    status,
    transcriptSupport: transcript,
    p6Omitted: omitted.p6,
    p7Omitted: omitted.p7,
    judgeTextOnly: {
      terms: findTranscriptEvidencePackOmissions({ transcript: row.transcript, claims: [claim] }).omittedTerms.filter((term) => !answer.terms.has(term)),
      prose: findTranscriptEvidencePackOmissions({ transcript: row.transcript, claims: [claim] }).omittedProse.filter((probe) => !answer.prose.has(probe))
    }
  };
}

const listed = JSON.parse(readFileSync(ROWS_FILE, "utf8"));
const cases = corpusCases();
const files = new Map();
const rows = [];
for (const item of listed) {
  const path = join(resultsDir, item.file);
  if (!existsSync(path)) {
    rows.push({ file: item.file, id: item.id, status: "missing-artifact" });
    continue;
  }
  if (!files.has(item.file)) {
    const bytes = readFileSync(path);
    files.set(item.file, { sha256: sha256(bytes), data: JSON.parse(bytes) });
  }
  const { data } = files.get(item.file);
  const row = data.rows.find((candidate) => candidate.id === item.id);
  const kase = row.caseInput ?? cases.get(row.id);
  const caseSource = row.caseInput ? "saved-caseInput" : "current-corpus";
  const input = {
    question: row.caseInput?.question ?? row.question ?? kase?.question,
    golden: kase?.golden,
    tags: row.tags,
    transcript: row.transcript,
    candidateAnswer: row.answer
  };
  const packs = { p6: p6.buildTranscriptEvidencePack(input), p7: buildTranscriptEvidencePack(input) };
  const claims = (row.verdict?.wrongClaims ?? []).filter((claim) => typeof claim === "string" && claim.trim());
  rows.push({
    file: item.file,
    id: row.id,
    freshness: row.tags?.freshness ?? null,
    caseSource,
    stored: {
      packVersion: row.evidencePack?.packVersion ?? null,
      packSha256: row.evidencePack?.sha256 ?? null,
      rubric: row.verdict?.rubric ?? null,
      score: row.verdict?.score ?? null,
      judgeCostUsd: row.verdict?.costUsd ?? null
    },
    p6: {
      chars: packs.p6.length,
      sha256: sha256(packs.p6),
      matchesStoredPack: row.evidencePack?.packVersion === "p6" ? sha256(packs.p6) === row.evidencePack.sha256 : null
    },
    p7: { chars: packs.p7.length, sha256: sha256(packs.p7) },
    claims: claims.map((claim) => claimReport(row, claim, packs))
  });
}

const allClaims = rows.flatMap((row) => row.claims ?? []);
const omittedCount = (claims, version) =>
  claims.reduce((sum, claim) => sum + claim[`${version}Omitted`].terms.length + claim[`${version}Omitted`].prose.length, 0);
const supported = allClaims.filter((claim) => claim.status !== "no-answer-support-in-transcript");
console.log(JSON.stringify({
  schema: "p7-omission-replay-v1",
  p6Revision: P6_REVISION,
  currentPackVersion: PACK_VERSION,
  rowsFile: ROWS_FILE,
  sources: Object.fromEntries([...files].map(([file, value]) => [file, value.sha256])),
  summary: {
    rows: rows.length,
    missingArtifacts: rows.filter((row) => row.status === "missing-artifact").length,
    claims: allClaims.length,
    claimsWithTranscriptSupport: supported.length,
    p6ClaimsHoldingSupport: supported.filter((claim) => omittedCount([claim], "p6") === 0).length,
    p7ClaimsHoldingSupport: supported.filter((claim) => omittedCount([claim], "p7") === 0).length,
    p6OmittedProbes: omittedCount(supported, "p6"),
    p7OmittedProbes: omittedCount(supported, "p7"),
    p6PacksMatchingStoredP6Hash: rows.filter((row) => row.p6?.matchesStoredPack === true).length,
    storedP6Rows: rows.filter((row) => row.stored?.packVersion === "p6").length,
    maxP7Chars: Math.max(...rows.map((row) => row.p7?.chars ?? 0))
  },
  rows
}, null, 2));
