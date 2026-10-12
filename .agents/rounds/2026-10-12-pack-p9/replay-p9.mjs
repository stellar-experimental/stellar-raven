#!/usr/bin/env node
// Offline p9 replay. It makes no model call and writes JSON to stdout. It never writes a file.
// It rebuilds p6 (d15a4ce5), p7 (7e00ede2), p8 (36e77d40), and p9 (this tree) packs and reports:
//   A. the 11 saved omission rows: disputed-claim support and entity-list coverage per pack;
//   B. the 32 measured rows of the p7 and p8 runs: each stored pack and prompt reproduced from the
//      saved source result and its cases, then per pack: size, entity-list coverage, disputed-claim
//      support (every wrong claim of every stored vote, p8b included), and answer-probe omissions;
//   C. the stored-p6 control inventory: answer-probe omissions, source-item counts, and entity lists;
//   D. the stable rows: full judge prompts under p6 and p9.
// Part B is also the baseline verification command: it checks each rebuilt p6 pack and prompt
// against the stored arm-A pack and prompt, and the same for p7 and p8.
// Support counts rendered source text only (packSourceEvidenceText) for every pack version.
// Entity-list coverage uses entityListCoverage from this tree; its requirements come from the answer
// and the saved execute results, before any rendering limit, so the measure is the same for every
// pack version. "detectedEvidenceComplete" means every detected entity-list record is shown and every
// transcript-supported probe of the stored disputed claims is present. It does not check other claims.
//
// Usage (from the repository root):
//   node .agents/rounds/2026-10-12-pack-p9/replay-p9.mjs [<saved results dir>] > .agents/rounds/2026-10-12-pack-p9/replay-p9.json
// The default results dir is the main checkout's ignored eval/qa/results. The stored re-judge
// artifacts are read from its 2026-10-10-pack-rejudge/raven-p{6,7,8}-arm folders.
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import {
  entityListClaims,
  entityListCoverage,
  explainTranscriptEvidencePack,
  findTranscriptEvidencePackOmissions,
  PACK_VERSION
} from "../../../eval/qa/evidence-pack.mjs";
import { buildJudgePrompt } from "../../../eval/qa/judge.mjs";
import {
  casesAt,
  fileCache,
  git,
  loadPackModule,
  readJsonWithHash,
  RESULTS_DIR,
  REVISIONS,
  rowInput,
  sha256,
  storedArtifact as storedIn
} from "./inputs.mjs";

const resultsDir = resolve(process.argv[2] ?? RESULTS_DIR);
const storedArtifact = (entry) => storedIn(entry, resultsDir);
const ROUNDS = ".agents/rounds";
const P7 = `${ROUNDS}/2026-10-10-weekend/pack-p7`;
const P8 = `${ROUNDS}/2026-10-10-weekend/pack-p8`;
const VERSIONS = ["p6", "p7", "p8", "p9"];
const modules = {
  p6: await loadPackModule(REVISIONS.p6, "p6"),
  p7: await loadPackModule(REVISIONS.p7, "p7"),
  p8: await loadPackModule(REVISIONS.p8, "p8")
};
if (PACK_VERSION !== "p9") throw new Error(`this tree defines ${PACK_VERSION}, not p9`);
const packs = (input) => ({
  p6: modules.p6.buildTranscriptEvidencePack(input),
  p7: modules.p7.buildTranscriptEvidencePack(input),
  p8: modules.p8.buildTranscriptEvidencePack(input),
  p9: explainTranscriptEvidencePack(input).text
});
// Records and fields that a p9 rendering limit removed, counted by limit (audit entityListLimits).
const limitCounts = (input) => {
  const counts = {};
  for (const item of explainTranscriptEvidencePack(input).audit?.entityListLimits ?? []) counts[item.limit] = (counts[item.limit] ?? 0) + 1;
  return counts;
};
const items = (text) => text.split("\n").filter((line) => /^\d+\. title=/.test(line)).length;
const byVersion = (fn) => Object.fromEntries(VERSIONS.map((version) => [version, fn(version)]));

function answerProbes(answer, claim) {
  const padded = String(answer ?? "").replace(/[.,;:!?)\]]+(?=\s|$)/g, " $&");
  const check = findTranscriptEvidencePackOmissions({ transcript: [{ tool: "execute", result: padded }], claims: [claim] });
  return { terms: new Set(check.omittedTerms), prose: new Set(check.omittedProse) };
}

function missing(transcript, text, claim, allowed) {
  const check = findTranscriptEvidencePackOmissions({ transcript, transcriptEvidence: text, claims: [claim] });
  return [...check.omittedTerms.filter((term) => allowed.terms.has(term)), ...check.omittedProse.filter((probe) => allowed.prose.has(probe))];
}

// Disputed-claim support: answer-gated probes of each claim that the full transcript supports,
// then the probes that each pack's rendered source text lacks.
function claimSupport(input, built, claims) {
  return claims.map((claim) => {
    const allowed = answerProbes(input.candidateAnswer, claim);
    const supported = missing(input.transcript, "", claim, allowed);
    const gate = { terms: new Set(supported), prose: new Set(supported) };
    return { claim, transcriptSupport: supported, missing: byVersion((version) => missing(input.transcript, built[version], claim, gate)) };
  });
}

function listCoverage(input, built) {
  return byVersion((version) => {
    const coverage = entityListCoverage({ ...input, transcriptEvidence: built[version] });
    return {
      records: coverage.records,
      shown: coverage.shown,
      complete: coverage.complete,
      missing: coverage.byClaim.flatMap((claim) => claim.missing.map((record) => record.label))
    };
  });
}

function listClaimsSummary(input) {
  return entityListClaims(input).map((claim) => ({
    claimIndex: claim.claimIndex,
    entry: claim.entryIndex + 1,
    path: claim.path,
    keys: claim.keys,
    records: claim.records.map((record) => record.label)
  }));
}

// A. Omission rows. Rows without a saved caseInput read the cases of the p8 tree (e7ca3fb0).
const omissionRows = JSON.parse(readFileSync(`${ROUNDS}/2026-10-09-continuation/pack-omission/stored-pack-omissions.json`, "utf8"));
const omissionCases = casesAt("e7ca3fb0");
const partA = [];
for (const item of omissionRows) {
  const { data } = readJsonWithHash(join(resultsDir, item.file));
  const row = data.rows.find((candidate) => candidate.id === item.id);
  const kase = row.caseInput ?? omissionCases.get(row.id);
  const input = { question: row.caseInput?.question ?? row.question ?? kase?.question, golden: kase?.golden, tags: row.tags, transcript: row.transcript, candidateAnswer: row.answer };
  const built = packs(input);
  const claims = (row.verdict?.wrongClaims ?? []).filter((claim) => typeof claim === "string" && claim.trim());
  partA.push({
    file: item.file,
    id: row.id,
    caseSource: row.caseInput ? "saved-caseInput" : "cases-e7ca3fb0",
    chars: byVersion((version) => built[version].length),
    p6MatchesStored: row.evidencePack?.packVersion === "p6" ? sha256(built.p6) === row.evidencePack.sha256 : null,
    entityLists: listClaimsSummary(input),
    listCoverage: listCoverage(input, built),
    claims: claimSupport(input, built, claims).map((claim) => ({ ...claim, storedScore: row.verdict?.score ?? null }))
  });
}
const supportedA = partA.flatMap((row) => row.claims).filter((claim) => claim.transcriptSupport.length);

// B. The 32 measured rows. Arm A is p6, the p7 run's arm B is p7, the p8 run's arm B is p8.
const p7Manifest = JSON.parse(readFileSync(`${P7}/rejudge-artifacts.json`, "utf8"));
const p8Manifest = JSON.parse(readFileSync(`${P8}/rejudge-artifacts.json`, "utf8"));
const p8bManifest = JSON.parse(readFileSync(`${P8}/p8b-artifacts.json`, "utf8"));
const armArtifacts = {
  p6: p7Manifest.artifacts.filter((entry) => entry.arm === "A"),
  p7: p7Manifest.artifacts.filter((entry) => entry.arm === "B"),
  p8: p8Manifest.artifacts.filter((entry) => entry.arm === "B")
};
const p8b = storedArtifact(p8bManifest.continuation);
const partB = [];
for (const entryA of armArtifacts.p6) {
  const stored = Object.fromEntries(["p6", "p7", "p8"].map((version) => [
    version,
    storedArtifact(armArtifacts[version].find((entry) => entry.invocation === entryA.invocation))
  ]));
  for (const id of stored.p6.data.meta.selectedIds) {
    const input = rowInput(stored.p6, id);
    const built = packs(input);
    const reproduced = {};
    const votes = {};
    for (const version of ["p6", "p7", "p8"]) {
      const artifact = stored[version];
      const row = artifact.data.rows.find((candidate) => candidate.id === id);
      const inputHere = rowInput(artifact, id);
      if (JSON.stringify(inputHere) !== JSON.stringify(input)) throw new Error(`${id}: ${version} input differs from arm A`);
      const prompt = sha256(buildJudgePrompt({ ...input, transcriptEvidence: built[version] }));
      reproduced[version] = {
        pack: sha256(built[version]) === row.evidencePack.sha256,
        prompt: prompt === artifact.data.meta.promptSha256ById[id]
      };
      votes[version] = row.attempts.judgeCalls.map((call) => call.verdict);
    }
    const p8bRow = p8b.data.rows.find((candidate) => candidate.id === id);
    if (p8bRow) votes.p8b = p8bRow.attempts.judgeCalls.map((call) => call.verdict);
    const claims = [...new Set(Object.values(votes).flat().flatMap((verdict) => verdict?.wrongClaims ?? [])
      .filter((claim) => typeof claim === "string" && claim.trim()))];
    const support = claimSupport(input, built, claims);
    const probes = (() => {
      const allowed = answerProbes(input.candidateAnswer, input.candidateAnswer);
      const supported = missing(input.transcript, "", input.candidateAnswer, allowed);
      const gate = { terms: new Set(supported), prose: new Set(supported) };
      return byVersion((version) => missing(input.transcript, built[version], input.candidateAnswer, gate).length);
    })();
    const coverage = listCoverage(input, built);
    const supportedClaims = support.filter((claim) => claim.transcriptSupport.length);
    const p9Prompt = sha256(buildJudgePrompt({ ...input, transcriptEvidence: built.p9 }));
    partB.push({
      invocation: entryA.invocation,
      id,
      reproduced,
      p9PromptSha256: p9Prompt,
      p9PromptEqualsStoredP8: p9Prompt === stored.p8.data.meta.promptSha256ById[id],
      p9PackSha256: sha256(built.p9),
      chars: byVersion((version) => built[version].length),
      panels: Object.fromEntries(Object.entries(votes).map(([version, list]) => [version, list.map((verdict) => verdict?.score ?? null).join("/")])),
      entityLists: listClaimsSummary(input),
      listCoverage: coverage,
      p9ListLimits: limitCounts(input),
      disputedClaims: { total: claims.length, transcriptSupported: supportedClaims.length },
      disputedClaimsHolding: byVersion((version) => supportedClaims.filter((claim) => claim.missing[version].length === 0).length),
      answerProbeMissing: probes,
      detectedEvidenceComplete: byVersion((version) =>
        coverage[version].complete && supportedClaims.every((claim) => claim.missing[version].length === 0)),
      claims: support
    });
  }
}

// C and D. The stored-p6 inventory: non-stable rows (support, items, entity lists) and stable rows (prompts).
const omissionKeys = new Set(omissionRows.map((row) => `${row.file}|${row.id}`));
const partC = {
  rows: 0,
  answerProbeMissing: byVersion(() => 0),
  itemsAtMost2: byVersion(() => 0),
  rowsWorseThanP8: [],
  rowsWithEntityLists: 0,
  listRecords: 0,
  listRecordsShown: byVersion(() => 0),
  listRowsComplete: byVersion(() => 0),
  listRows: [],
  maxP9Chars: 0
};
const partD = { rows: 0, identicalP6P9: 0, differing: [] };
function jsonFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? jsonFiles(join(dir, entry.name)) : entry.name.endsWith(".json") ? [join(dir, entry.name)] : []
  ).sort();
}
for (const path of jsonFiles(resultsDir)) {
  let data;
  try {
    data = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    continue;
  }
  if (!Array.isArray(data?.rows)) continue;
  const file = relative(resultsDir, path);
  for (const row of data.rows) {
    if (row.evidencePack?.packVersion !== "p6" || !row.caseInput || !Array.isArray(row.transcript) || !row.verdict) continue;
    const input = { ...row.caseInput, tags: row.tags, transcript: row.transcript, candidateAnswer: row.answer };
    if (row.tags?.freshness === "stable") {
      const p6 = modules.p6.buildTranscriptEvidencePack(input);
      const p9 = explainTranscriptEvidencePack(input).text;
      partD.rows += 1;
      const same = sha256(buildJudgePrompt({ ...input, transcriptEvidence: p6 })) === sha256(buildJudgePrompt({ ...input, transcriptEvidence: p9 }));
      if (same) partD.identicalP6P9 += 1;
      else partD.differing.push(`${file}|${row.id}`);
      continue;
    }
    const built = packs(input);
    if (omissionKeys.has(`${file}|${row.id}`) || !built.p6 || sha256(built.p6) !== row.evidencePack.sha256) continue;
    partC.rows += 1;
    const allowed = answerProbes(row.answer, row.answer);
    const supported = missing(row.transcript, "", row.answer, allowed);
    const gate = { terms: new Set(supported), prose: new Set(supported) };
    const counts = byVersion((version) => missing(row.transcript, built[version], row.answer, gate).length);
    for (const version of VERSIONS) {
      partC.answerProbeMissing[version] += counts[version];
      if (items(built[version]) <= 2) partC.itemsAtMost2[version] += 1;
    }
    if (counts.p9 > counts.p8) partC.rowsWorseThanP8.push({ row: `${file}|${row.id}`, p8: counts.p8, p9: counts.p9 });
    const coverage = listCoverage(input, built);
    if (coverage.p9.records) {
      partC.rowsWithEntityLists += 1;
      partC.listRecords += coverage.p9.records;
      for (const version of VERSIONS) {
        partC.listRecordsShown[version] += coverage[version].shown;
        if (coverage[version].complete) partC.listRowsComplete[version] += 1;
      }
      partC.listRows.push({
        row: `${file}|${row.id}`,
        lists: listClaimsSummary(input),
        shown: byVersion((version) => `${coverage[version].shown}/${coverage[version].records}`),
        p9Missing: coverage.p9.missing,
        p9ListLimits: limitCounts(input),
        chars: byVersion((version) => built[version].length)
      });
    }
    partC.maxP9Chars = Math.max(partC.maxP9Chars, built.p9.length);
  }
}

const sum = (rows, fn) => rows.reduce((total, row) => total + fn(row), 0);
const sumCounts = (list) => list.reduce((total, counts) => {
  for (const [key, value] of Object.entries(counts)) total[key] = (total[key] ?? 0) + value;
  return total;
}, {});
partC.p9ListLimits = sumCounts(partC.listRows.map((row) => row.p9ListLimits));
console.log(JSON.stringify({
  schema: "p9-replay-v1",
  revisions: {
    ...REVISIONS,
    p9: git(["rev-parse", "--short=8", "HEAD"]).trim(),
    p9PackModuleClean: git(["status", "--porcelain", "--", "eval/qa/evidence-pack.mjs"]) === ""
  },
  supportRule: "rendered source text only (packSourceEvidenceText); answer-gated probes",
  listRule: "entityListCoverage: identity field and every non-null claim field on one rendered line, before the next record identity",
  sources: Object.fromEntries([...fileCache].map(([path, value]) => [relative(resultsDir, path), value.sha256])),
  partA: {
    summary: {
      rows: partA.length,
      claims: sum(partA, (row) => row.claims.length),
      claimsWithTranscriptSupport: supportedA.length,
      claimsHolding: byVersion((version) => supportedA.filter((claim) => claim.missing[version].length === 0).length),
      rowsWithEntityLists: partA.filter((row) => row.listCoverage.p9.records).length,
      listRecords: sum(partA, (row) => row.listCoverage.p9.records),
      listRecordsShown: byVersion((version) => sum(partA, (row) => row.listCoverage[version].shown)),
      maxChars: byVersion((version) => Math.max(...partA.map((row) => row.chars[version])))
    },
    rows: partA
  },
  partB: {
    summary: {
      rows: partB.length,
      storedPacksReproduced: byVersion((version) => version === "p9" ? null : partB.filter((row) => row.reproduced[version].pack).length),
      storedPromptsReproduced: byVersion((version) => version === "p9" ? null : partB.filter((row) => row.reproduced[version].prompt).length),
      rowsWithEntityLists: partB.filter((row) => row.listCoverage.p9.records).length,
      p9ListLimits: sumCounts(partB.map((row) => row.p9ListLimits)),
      listRecords: sum(partB, (row) => row.listCoverage.p9.records),
      listRecordsShown: byVersion((version) => sum(partB, (row) => row.listCoverage[version].shown)),
      disputedClaimsWithTranscriptSupport: sum(partB, (row) => row.disputedClaims.transcriptSupported),
      disputedClaimsHolding: byVersion((version) => sum(partB, (row) => row.disputedClaimsHolding[version])),
      rowsWithDetectedEvidenceComplete: byVersion((version) => partB.filter((row) => row.detectedEvidenceComplete[version]).length),
      answerProbeMissing: byVersion((version) => sum(partB, (row) => row.answerProbeMissing[version])),
      p9PromptsDifferFromP8: partB.filter((row) => !row.p9PromptEqualsStoredP8).map((row) => `${row.invocation}|${row.id}`),
      maxChars: byVersion((version) => Math.max(...partB.map((row) => row.chars[version])))
    },
    rows: partB
  },
  partC,
  partD
}, null, 2));
