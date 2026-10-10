#!/usr/bin/env node
// Offline p8 replay. It makes no model call and writes JSON to stdout.
// It rebuilds p6 (d15a4ce5), p7 (7e00ede2), and p8 (this tree) packs and reports:
//   A. the 11 saved omission rows: source-span support per disputed claim, apart from grades;
//   B. the three recoveries that the post-run review requires, with their unit headers;
//   C. the stored-p6 control inventory: answer-probe omissions and source-item counts;
//   D. the stable rows: full judge prompts under p6, p7, and p8;
//   E. the 32 measured rows: full judge prompt hashes and what differs between p7 and p8.
// Support uses the current findTranscriptEvidencePackOmissions, which counts rendered source
// text only, for all three packs.
//
// Usage (from the repository root):
//   node .agents/rounds/2026-10-10-weekend/pack-p8/replay-p8.mjs <saved results dir> > replay-p8.json
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import {
  explainTranscriptEvidencePack,
  findTranscriptEvidencePackOmissions,
  PACK_VERSION
} from "../../../../eval/qa/evidence-pack.mjs";
import { buildJudgePrompt } from "../../../../eval/qa/judge.mjs";

const resultsDir = resolve(process.argv[2] ?? "eval/qa/results");
const P7 = ".agents/rounds/2026-10-10-weekend/pack-p7";
const REVIEW_INPUTS = `${P7}/post-run-review/saved-data`;
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const load = async (revision, version) => {
  const source = execFileSync("git", ["show", `${revision}:eval/qa/evidence-pack.mjs`], { encoding: "utf8" });
  const module = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
  if (module.PACK_VERSION !== version) throw new Error(`${revision} does not define ${version}`);
  return module;
};
const p6 = await load("d15a4ce5", "p6");
const p7 = await load("7e00ede2", "p7");
if (PACK_VERSION !== "p8") throw new Error(`this tree defines ${PACK_VERSION}, not p8`);
const packs = (input) => ({
  p6: p6.buildTranscriptEvidencePack(input),
  p7: p7.buildTranscriptEvidencePack(input),
  p8: explainTranscriptEvidencePack(input).text
});
const items = (text) => text.split("\n").filter((line) => /^\d+\. title=/.test(line)).length;

function answerProbes(answer, claim) {
  const padded = String(answer ?? "").replace(/[.,;:!?)\]]+(?=\s|$)/g, " $&");
  const check = findTranscriptEvidencePackOmissions({ transcript: [{ tool: "execute", result: padded }], claims: [claim] });
  return { terms: new Set(check.omittedTerms), prose: new Set(check.omittedProse) };
}

function missing(transcript, text, claim, allowed) {
  const check = findTranscriptEvidencePackOmissions({ transcript, transcriptEvidence: text, claims: [claim] });
  return [...check.omittedTerms.filter((term) => allowed.terms.has(term)), ...check.omittedProse.filter((probe) => allowed.prose.has(probe))];
}

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

function jsonFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? jsonFiles(join(dir, entry.name)) : entry.name.endsWith(".json") ? [join(dir, entry.name)] : []
  ).sort();
}

const fileCache = new Map();
const readResults = (file) => {
  if (!fileCache.has(file)) {
    const bytes = readFileSync(join(resultsDir, file));
    fileCache.set(file, { sha256: sha256(bytes), data: JSON.parse(bytes) });
  }
  return fileCache.get(file);
};

// A. Omission rows.
const omissionRows = JSON.parse(readFileSync(".agents/rounds/2026-10-09-continuation/pack-omission/stored-pack-omissions.json", "utf8"));
const cases = corpusCases();
const partA = [];
for (const item of omissionRows) {
  const row = readResults(item.file).data.rows.find((candidate) => candidate.id === item.id);
  const kase = row.caseInput ?? cases.get(row.id);
  const input = { question: row.caseInput?.question ?? row.question ?? kase?.question, golden: kase?.golden, tags: row.tags, transcript: row.transcript, candidateAnswer: row.answer };
  const built = packs(input);
  const claims = (row.verdict?.wrongClaims ?? []).filter((claim) => typeof claim === "string" && claim.trim()).map((claim) => {
    const allowed = answerProbes(row.answer, claim);
    const supported = missing(row.transcript, "", claim, allowed);
    const allowedSupported = { terms: new Set(supported), prose: new Set(supported) };
    return {
      claim,
      transcriptSupport: supported,
      missing: Object.fromEntries(Object.entries(built).map(([version, text]) => [version, missing(row.transcript, text, claim, allowedSupported)])),
      storedScore: row.verdict?.score ?? null
    };
  });
  partA.push({
    file: item.file,
    id: row.id,
    caseSource: row.caseInput ? "saved-caseInput" : "current-corpus",
    chars: Object.fromEntries(Object.entries(built).map(([version, text]) => [version, text.length])),
    p6MatchesStored: row.evidencePack?.packVersion === "p6" ? sha256(built.p6) === row.evidencePack.sha256 : null,
    claims
  });
}
const supportedClaims = partA.flatMap((row) => row.claims).filter((claim) => claim.transcriptSupport.length);
const holding = (version) => supportedClaims.filter((claim) => claim.missing[version].length === 0).length;

// B. Required recoveries, read from the post-run review's local inputs.
const recoveries = [
  { invocation: "S1a", id: "q-defi-etherfuse-stablebonds", target: "mature in 90 days or less" },
  { invocation: "S2e", id: "q-pc-quantum-preparedness-dormant", target: "1,193 logical qubits" },
  { invocation: "S2c", id: "q-hist-quantum-preparedness-plan", target: "immediately" },
  { invocation: "S2c", id: "q-hist-quantum-preparedness-plan", target: "expected to be able to move to quantum-safe signing" }
].map((item) => {
  const path = `${REVIEW_INPUTS}/rr3-${item.invocation}-B-${item.id}-input.json`;
  if (!existsSync(path)) return { ...item, status: "missing-local-input" };
  const input = JSON.parse(readFileSync(path, "utf8"));
  const built = packs(input);
  const spanUnit = (text) => {
    const lines = text.split("\n");
    const at = lines.findIndex((line) => /^ {3}(?:span|snippet|summary): /.test(line) && line.includes(item.target));
    return at < 0 ? null : { header: lines[at - 1], span: lines[at].trim().slice(0, 400) };
  };
  return { ...item, inP6: Boolean(spanUnit(built.p6)), inP7: Boolean(spanUnit(built.p7)), p8: spanUnit(built.p8) };
});

// C and D. Stored-p6 inventory: non-stable rows (support and items) and stable rows (prompts).
const omissionKeys = new Set(omissionRows.map((row) => `${row.file}|${row.id}`));
const partC = { rows: 0, answerProbeMissing: { p6: 0, p7: 0, p8: 0 }, rowsWorseThanP6: [], itemsAtMost2: { p6: 0, p7: 0, p8: 0 }, maxP8Chars: 0 };
const partD = { rows: 0, identicalP6P8: 0, identicalP7P8: 0, differing: [] };
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
    const built = packs(input);
    if (row.tags?.freshness === "stable") {
      partD.rows += 1;
      const prompts = Object.fromEntries(Object.entries(built).map(([version, text]) => [version, sha256(buildJudgePrompt({ ...input, transcriptEvidence: text }))]));
      if (prompts.p6 === prompts.p8) partD.identicalP6P8 += 1;
      if (prompts.p7 === prompts.p8) partD.identicalP7P8 += 1;
      if (prompts.p6 !== prompts.p8) partD.differing.push(`${file}|${row.id}`);
      continue;
    }
    if (omissionKeys.has(`${file}|${row.id}`) || !built.p6 || sha256(built.p6) !== row.evidencePack.sha256) continue;
    partC.rows += 1;
    const allowed = answerProbes(row.answer, row.answer);
    const supported = missing(row.transcript, "", row.answer, allowed);
    const gate = { terms: new Set(supported), prose: new Set(supported) };
    const counts = Object.fromEntries(Object.entries(built).map(([version, text]) => [version, missing(row.transcript, text, row.answer, gate).length]));
    for (const version of ["p6", "p7", "p8"]) {
      partC.answerProbeMissing[version] += counts[version];
      if (items(built[version]) <= 2) partC.itemsAtMost2[version] += 1;
    }
    if (counts.p8 > counts.p6) partC.rowsWorseThanP6.push({ row: `${file}|${row.id}`, p6: counts.p6, p8: counts.p8 });
    partC.maxP8Chars = Math.max(partC.maxP8Chars, built.p8.length);
  }
}

// E. The 32 measured rows: full judge prompts.
const manifest = JSON.parse(readFileSync(`${P7}/rejudge-artifacts.json`, "utf8"));
const recorded = new Map();
for (const entry of manifest.artifacts) {
  const artifact = JSON.parse(readFileSync(entry.path, "utf8"));
  for (const [id, hash] of Object.entries(artifact.meta.promptSha256ById)) recorded.set(`${entry.invocation}|${entry.arm}|${id}`, hash);
}
const partE = [];
for (const key of [...recorded.keys()].filter((key) => key.includes("|A|"))) {
  const [invocation, , id] = key.split("|");
  const path = `${REVIEW_INPUTS}/rr3-${invocation}-A-${id}-input.json`;
  if (!existsSync(path)) {
    partE.push({ invocation, id, status: "missing-local-input" });
    continue;
  }
  const input = JSON.parse(readFileSync(path, "utf8"));
  const built = packs(input);
  const prompt = (text) => buildJudgePrompt({ ...input, transcriptEvidence: text });
  const prompts = { p6: prompt(built.p6), p7: prompt(built.p7), p8: prompt(built.p8) };
  // Outside the evidence block, the p7 and p8 prompts must be byte-identical.
  const outside = (text, pack) => text.replace(pack.trim(), "<PACK>");
  const p7Lines = new Set(built.p7.split("\n"));
  const p8Lines = built.p8.split("\n");
  partE.push({
    invocation,
    id,
    armAPromptReproduced: sha256(prompts.p6) === recorded.get(`${invocation}|A|${id}`),
    armBPromptReproduced: sha256(prompts.p7) === recorded.get(`${invocation}|B|${id}`),
    p8PromptSha256: sha256(prompts.p8),
    p8PromptChanged: sha256(prompts.p8) !== recorded.get(`${invocation}|B|${id}`),
    onlyEvidenceBlockDiffers: outside(prompts.p7, built.p7) === outside(prompts.p8, built.p8),
    packChars: { p7: built.p7.length, p8: built.p8.length },
    packLines: { p7: built.p7.split("\n").length, p8: p8Lines.length, p8LinesNotInP7: p8Lines.filter((line) => !p7Lines.has(line)).length }
  });
}

console.log(JSON.stringify({
  schema: "p8-replay-v1",
  revisions: {
    p6: "d15a4ce5",
    p7: "7e00ede2",
    p8: execFileSync("git", ["rev-parse", "--short=8", "HEAD"], { encoding: "utf8" }).trim(),
    p8PackModuleClean: execFileSync("git", ["status", "--porcelain", "--", "eval/qa/evidence-pack.mjs"], { encoding: "utf8" }) === ""
  },
  supportRule: "rendered source text only (packSourceEvidenceText); answer-gated probes",
  sources: Object.fromEntries([...fileCache].map(([file, value]) => [file, value.sha256])),
  partA: {
    summary: {
      rows: partA.length,
      claims: partA.reduce((sum, row) => sum + row.claims.length, 0),
      claimsWithTranscriptSupport: supportedClaims.length,
      claimsHolding: { p6: holding("p6"), p7: holding("p7"), p8: holding("p8") },
      maxP8Chars: Math.max(...partA.map((row) => row.chars.p8))
    },
    rows: partA
  },
  partB: recoveries,
  partC,
  partD,
  partE: {
    summary: {
      rows: partE.length,
      armAPromptsReproduced: partE.filter((row) => row.armAPromptReproduced).length,
      armBPromptsReproduced: partE.filter((row) => row.armBPromptReproduced).length,
      p8PromptsChanged: partE.filter((row) => row.p8PromptChanged).length,
      onlyEvidenceBlockDiffers: partE.filter((row) => row.onlyEvidenceBlockDiffers).length
    },
    rows: partE
  }
}, null, 2));
