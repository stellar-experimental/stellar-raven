#!/usr/bin/env node
/**
 * Round item 6.3 re-test: attribution of the INCLUDED answers' deficiencies (PLAN.md, "Re-test:
 * second measurement", `attribute.mjs`).
 *
 *   node attribute.mjs --pack --dir <fresh dir> --grading-verdicts <verdicts.json>
 *                      [--answers-dir tmp/6.3/rt] [--key <blind key>] [--attr-key <file>]
 *   node attribute.mjs --validate --dir <dir> --verdicts <attribution verdicts.json>
 *                      [--answers-dir ..] [--attr-key ..]
 *   node attribute.mjs --score --dir <dir> --verdicts <attribution verdicts.json> --grading-verdicts <verdicts.json>
 *                      [--answers-dir ..] [--key ..] [--attr-key ..] [--result1-verdicts <file>] [--out <base>]
 *   node attribute.mjs --selftest
 *
 * The packed set is every INCLUDED answer whose run has the registry-call condition (`rwaCalled` or
 * `rwaRan`) and at least one deficiency item. The scored set is the candidates only (INCLUDED graded
 * below EXCLUDED, with that condition); the packet does not say which items are candidates. A packet
 * item holds the question, the INCLUDED answer, its deficiency items and the `code` and `result` of
 * every `execute` from the first one that names or ran the registry onward, as tool output. It holds no
 * other answer, no grade, no pair reason and nothing about arms, samples, keys, classes, models, costs
 * or timestamps.
 *
 * A verdict per deficiency item: `involvesRegistry` true or false. `true` carries `answerQuote` and
 * `toolQuote`; `--score` checks each is a whitespace-normalised substring of the answer and of a tool
 * result, and a `true` without both verified quotes is invalid. Structural errors (unknown or duplicate
 * ids or item numbers) are refused. An invalid or missing item verdict on a candidate makes the outcome
 * inconclusive after the executor's one correction pass; there is no default. The outcome comes from
 * `scoreRetest` in blind.mjs, the same function `blind.mjs --retest --score` ends with when there are no
 * candidates.
 */
import { randomBytes, randomInt } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildRetestPack,
  gradeRetestPairs,
  loadAnswers,
  pairId,
  renderRetestMarkdown,
  retestVerdictProblems,
  scoreRetest,
} from "./blind.mjs";

const HERE = new URL(".", import.meta.url);
const RETEST_DIR = "tmp/6.3/rt";
const FOOTER_REGISTRY_RE = /^scout\.getRwaAssets=/;
const DEFICIENCY_NAMES_SIDE = /\b[XY]\b/;

export const ATTRIBUTION_RUBRIC = `# Rubric: does a deficiency involve registry data?

Each item in \`packet.json\` holds a question, an answer, a list of deficiencies a reviewer found in that
answer, and the tool output the answer's author saw from the first call that touched the Stellar Light
registry (\`stellarlight.xyz/api/rwa\`, \`scout.getRwaAssets\`) onward, as code and result pairs. Judge
only the text in front of you. Read only \`packet.json\`; fetch nothing and start no subagents.

For each deficiency decide \`involvesRegistry\`:

- \`true\` only when (a) the deficient claim is taken from the registry rows in the tool output (quote the
  claim from the answer and the rows from the tool output that carry it), or (b) the deficiency is an
  omission or off-question content, and the answer gives registry rows in the place where the missing
  content belongs (quote those rows from the answer and the tool output they came from).
- \`false\` when the deficiency is an omission and the answer shows no registry content in that part, and
  when the deficiency is about documentation or general knowledge and carries no registry content.

A \`true\` needs two quotes: \`answerQuote\`, copied from the answer, and \`toolQuote\`, copied from a
result in the tool output. Copy the text exactly (differences in whitespace are ignored). A \`true\`
without both quotes matching their sources is discarded.

Write \`verdicts.json\` in this directory:

\`\`\`json
{ "verdicts": [ { "id": "<item id>", "items": [
    { "n": 1, "involvesRegistry": false },
    { "n": 2, "involvesRegistry": true, "answerQuote": "text from the answer", "toolQuote": "text from a tool result" } ] } ] }
\`\`\`

Every item id and every deficiency number \`n\` needs exactly one entry. Then report the path with \`hc send\`.
`;

const normalize = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const shuffleInPlace = (list, rng) => {
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = rng(i + 1);
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
};

/** The capture entries from the first one that names or ran the registry, onward. */
export function toolOutputFrom(captured) {
  const first = captured.findIndex((c) => c.namesRwa === true || (c.footerCalls ?? []).some((f) => FOOTER_REGISTRY_RE.test(f)));
  if (first < 0) return null;
  return captured.slice(first).map((c) => ({ code: c.code, result: c.result }));
}

/**
 * Pure: the packed set and its packet. `loadCapture(key, sample)` returns the INCLUDED run's capture or
 * undefined (a hard error: a packed run with no capture file).
 */
export function buildAttributionPack({ answers, questions, key, verdicts, loadCapture, rng = randomInt, newId = () => randomBytes(5).toString("hex") }) {
  const problems = retestVerdictProblems(verdicts, key);
  if (problems.length) throw new Error(`invalid grading verdicts: ${problems.join("; ")}`);
  const pairs = gradeRetestPairs({ answers, key, verdicts });
  const inc = Object.fromEntries(answers.included.map((r) => [pairId(r.key, r.sample ?? 1), r]));
  const attrKey = {};
  const items = [];
  for (const p of pairs.filter((x) => !x.missing && x.regCall && x.includedDeficiencies.length >= 1)) {
    for (const d of p.includedDeficiencies) if (DEFICIENCY_NAMES_SIDE.test(d)) throw new Error(`${p.id}: a deficiency names X or Y`);
    const captured = loadCapture(p.key, p.sample);
    if (!captured) throw new Error(`${p.id}: no capture file for a packed run`);
    const toolOutput = toolOutputFrom(captured);
    if (!toolOutput) throw new Error(`${p.id}: the run has the registry-call condition but no capture names or ran the registry`);
    let id = newId();
    while (attrKey[id]) id = newId();
    attrKey[id] = { key: p.key, sample: p.sample };
    items.push({
      id,
      question: questions.find((q) => q.key === p.key).question,
      answer: inc[p.id].answer,
      deficiencies: p.includedDeficiencies.map((text, i) => ({ n: i + 1, text })),
      toolOutput,
    });
  }
  shuffleInPlace(items, rng);
  return { attrKey, packet: { items } };
}

/**
 * Checks attribution verdicts against the packet. Structural errors are returned in `fatal` (refused).
 * Per answer: valid only when every deficiency has a valid verdict; `involvesRegistry` is true when any
 * valid item is true. Everything is returned so the executor can ask for one correction pass.
 */
export function resolveAttributions({ packet, attrKey, verdicts }) {
  const fatal = [];
  const byId = {};
  for (const v of verdicts) {
    if (!attrKey[v.id]) {
      fatal.push("a verdict names an unknown item id");
      continue;
    }
    if (byId[v.id]) {
      fatal.push(`duplicate verdict for ${v.id}`);
      continue;
    }
    byId[v.id] = v;
  }
  const attributions = {};
  const records = [];
  for (const item of packet.items) {
    const meta = attrKey[item.id];
    const v = byId[item.id];
    const answerText = normalize(item.answer);
    const outputText = item.toolOutput.map((t) => normalize(t.result)).join("\n");
    const seen = new Set();
    for (const e of v?.items ?? []) {
      if (!item.deficiencies.some((d) => d.n === e.n)) fatal.push(`${item.id}: unknown deficiency number ${e.n}`);
      else if (seen.has(e.n)) fatal.push(`${item.id}: duplicate entry for deficiency ${e.n}`);
      seen.add(e.n);
    }
    const out = item.deficiencies.map((d) => {
      const e = (v?.items ?? []).find((x) => x.n === d.n);
      const rec = { n: d.n, deficiency: d.text, valid: false, involvesRegistry: null, problem: null, answerQuote: e?.answerQuote ?? null, toolQuote: e?.toolQuote ?? null };
      if (!e) rec.problem = "no verdict";
      else if (typeof e.involvesRegistry !== "boolean") rec.problem = "involvesRegistry is not a boolean";
      else if (e.involvesRegistry === false) Object.assign(rec, { valid: true, involvesRegistry: false });
      else if (typeof e.answerQuote !== "string" || typeof e.toolQuote !== "string" || !normalize(e.answerQuote) || !normalize(e.toolQuote)) rec.problem = "a true needs both quotes";
      else if (!answerText.includes(normalize(e.answerQuote))) rec.problem = "the answer quote is not in the answer";
      else if (!outputText.includes(normalize(e.toolQuote))) rec.problem = "the tool quote is not in a tool result";
      else Object.assign(rec, { valid: true, involvesRegistry: true });
      return rec;
    });
    const valid = out.every((r) => r.valid);
    attributions[pairId(meta.key, meta.sample)] = { valid, involvesRegistry: valid && out.some((r) => r.involvesRegistry === true) };
    records.push({ id: item.id, pair: pairId(meta.key, meta.sample), valid, items: out });
  }
  return { fatal, attributions, records };
}

function renderAttribution(records, candidates) {
  const isCand = new Set(candidates.map((c) => c.id));
  const L = ["", "### Attribution", "", "| Pair | Candidate | Item | involvesRegistry | Problem | Deficiency |", "|---|---|---|---|---|---|"];
  for (const r of records.sort((a, b) => a.pair.localeCompare(b.pair))) {
    for (const i of r.items) L.push(`| ${r.pair} | ${isCand.has(r.pair)} | ${i.n} | ${i.involvesRegistry} | ${i.problem ?? "-"} | ${i.deficiency.replace(/\|/g, "/")} |`);
  }
  return `${L.join("\n")}\n`;
}

// --- CLI -----------------------------------------------------------------------------------------

function parseFlags(argv) {
  const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (["--pack", "--validate", "--score", "--selftest"].includes(a)) flags[a.slice(2)] = true;
    else if (["--dir", "--verdicts", "--grading-verdicts", "--answers-dir", "--key", "--attr-key", "--out", "--result1-verdicts"].includes(a)) flags[a.slice(2).replace(/-(\w)/g, (_, c) => c.toUpperCase())] = argv[(i += 1)];
    else throw new Error(`unknown argument ${a}`);
  }
  return flags;
}

const readQuestions = () => JSON.parse(readFileSync(new URL("questions.json", HERE), "utf8")).questions;
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const paths = (flags) => {
  const answersDir = flags.answersDir ?? RETEST_DIR;
  return {
    answersDir,
    keyPath: flags.key ?? join(answersDir, "blind-key.json"),
    attrKeyPath: flags.attrKey ?? join(answersDir, "attribution-key.json"),
    result1Path: flags.result1Verdicts ?? fileURLToPath(new URL("verdicts.json", HERE)),
  };
};
const loaderFor = (answersDir) => (k, s) => {
  const file = join(answersDir, `exec-included-${k}-${s}.json`);
  return existsSync(file) ? readJson(file) : undefined;
};

export function packCli(flags) {
  const { answersDir, keyPath, attrKeyPath } = paths(flags);
  if (!flags.dir) throw new Error("--dir is required");
  if (!flags.gradingVerdicts) throw new Error("--grading-verdicts is required");
  if (existsSync(attrKeyPath)) throw new Error("the attribution key exists; packing twice would re-randomize");
  const { attrKey, packet } = buildAttributionPack({
    answers: loadAnswers(answersDir),
    questions: readQuestions(),
    key: readJson(keyPath),
    verdicts: readJson(flags.gradingVerdicts).verdicts,
    loadCapture: loaderFor(answersDir),
  });
  if (packet.items.length === 0) {
    console.log("packed: 0 items; nothing to attribute");
    return;
  }
  mkdirSync(flags.dir, { recursive: true });
  writeFileSync(join(flags.dir, "packet.json"), `${JSON.stringify(packet, null, 2)}\n`);
  writeFileSync(join(flags.dir, "RUBRIC.md"), ATTRIBUTION_RUBRIC);
  writeFileSync(attrKeyPath, `${JSON.stringify(attrKey, null, 2)}\n`, { mode: 0o600 });
  chmodSync(attrKeyPath, 0o600);
  console.log(`packed: ${packet.items.length} items`);
}

function resolveCli(flags) {
  const { attrKeyPath } = paths(flags);
  if (!flags.dir || !flags.verdicts) throw new Error("--dir and --verdicts are required");
  const resolved = resolveAttributions({
    packet: readJson(join(flags.dir, "packet.json")),
    attrKey: readJson(attrKeyPath),
    verdicts: readJson(flags.verdicts).verdicts,
  });
  if (resolved.fatal.length) throw new Error(`refused: ${resolved.fatal.join("; ")}`);
  return resolved;
}

function validateCli(flags) {
  const { records } = resolveCli(flags);
  const bad = records.flatMap((r) => r.items.filter((i) => !i.valid).map((i) => `${r.id} item ${i.n}: ${i.problem}`));
  for (const b of bad) console.log(`problem: ${b}`);
  if (bad.length) process.exitCode = 1;
  else console.log("attribution verdicts valid");
}

function scoreCli(flags) {
  const { answersDir, keyPath, result1Path } = paths(flags);
  if (!flags.gradingVerdicts) throw new Error("--grading-verdicts is required");
  const { attributions, records } = resolveCli(flags);
  const result = scoreRetest({
    answers: loadAnswers(answersDir),
    key: readJson(keyPath),
    verdicts: readJson(flags.gradingVerdicts).verdicts,
    result1Verdicts: readJson(result1Path).verdicts,
    attributions,
  });
  const out = flags.out ?? join(answersDir, "score-retest-final");
  writeFileSync(`${out}.json`, `${JSON.stringify({ ...result, attribution: records }, null, 2)}\n`);
  writeFileSync(`${out}.md`, renderRetestMarkdown(result) + renderAttribution(records, result.candidates));
  console.log(`scored: outcome ${result.rule.outcome}; candidates ${result.candidates.length}; wrote ${out}.json and ${out}.md`);
}

// --- offline self-check --------------------------------------------------------------------------

function selftest() {
  const questions = readQuestions();
  const allKeys = questions.map((q) => q.key);
  const eq = (label, got, want) => {
    if (JSON.stringify(got) !== JSON.stringify(want)) throw new Error(`${label}: ${JSON.stringify(got)} != ${JSON.stringify(want)}`);
  };
  const throws = (label, fn, re) => {
    try { fn(); } catch (error) { if (!re || re.test(error.message)) return; throw new Error(`${label}: wrong error ${error.message}`); }
    throw new Error(`${label}: did not throw`);
  };
  const result1Verdicts = readJson(new URL("verdicts.json", HERE)).verdicts;
  const mk = (key, sample, o = {}) => ({
    key, sample, answered: true,
    answer: o.answer ?? `ordinary answer text ${key} ${sample}`,
    failureClass: null, runCostUsd: 0.1, turns: 3, attempts: [{}], usage: {},
    rwaCalled: o.rwa === true, rwaRan: o.rwa === true, rwaMentioned: o.rwa === true,
    calls: [{ tool: "execute", ops: [] }],
    resultUrls: [],
  });
  const grade = (c) => ({
    correctness: { c: "correct", p: "partial", w: "wrong" }[c], fabrication: false, offTopic: false,
    deficiencies: c === "c" ? [] : [`first gap on the question`, `second gap on the question`],
  });
  // Included runs: C1:1 candidate (partial under correct), N1:1 non-candidate (partial both), N2:1 correct with an
  // optional deficiency, C2:1 candidate without a registry call (not packed), all with distinctive text.
  const spec = {
    "C1:1": { e: "c", i: "p", rwa: true },
    "N1:1": { e: "p", i: "p", rwa: true },
    "N2:1": { e: "c", i: "c", rwa: true, extra: true },
    "C2:1": { e: "c", i: "p", rwa: false },
  };
  const answers = {
    excluded: allKeys.flatMap((k) => [1, 2, 3].map((s) => mk(k, s, { answer: `EXCLUDED-ANSWER-MARKER ${k} ${s}` }))),
    included: allKeys.flatMap((k) => [1, 2, 3].map((s) => mk(k, s, { rwa: spec[`${k}:${s}`]?.rwa === true, answer: `INCLUDED answer ${k} ${s} lists asset TPT30 contract CABC123 and the rows` }))),
  };
  const pack = buildRetestPack({ answers, questions });
  const gradingVerdicts = pack.packet.pairs.map((p) => {
    const meta = pack.key[p.id];
    const sp = spec[`${meta.key}:${meta.sample}`] ?? {};
    const e = { ...grade(sp.e ?? "c") };
    const i = { ...grade(sp.i ?? "c") };
    if (sp.extra) i.deficiencies = ["one optional remark"];
    return { id: p.id, X: meta.X === "included" ? i : e, Y: meta.X === "included" ? e : i, reason: "PAIR-REASON-MARKER" };
  });
  const cap = (extra = []) => [
    { index: 0, code: "await stellarDocs.search_docs({})", result: "docs rows only", isError: false, resultChars: 14, namesRwa: false, footerCalls: ["stellarDocs.search_docs=ok"] },
    { index: 1, code: "await scout.getRwaAssets({limit:3})", result: "rows: TPT30 contract CABC123  issuer\nGABC", isError: false, resultChars: 40, namesRwa: true, footerCalls: ["scout.getRwaAssets=ok"] },
    { index: 2, code: "return 1", result: "second\nresult", isError: false, resultChars: 13, namesRwa: false, footerCalls: [] },
    ...extra,
  ];
  const loadCapture = (k, s) => (spec[`${k}:${s}`]?.rwa ? cap() : undefined);
  const make = (over = {}) => buildAttributionPack({ answers, questions, key: pack.key, verdicts: gradingVerdicts, loadCapture, ...over });

  // The packed set is wider than the scored set.
  const ap = make();
  eq("packed set", Object.values(ap.attrKey).map((m) => `${m.key}:${m.sample}`).sort(), ["C1:1", "N1:1", "N2:1"]);
  const scored = scoreRetest({ answers, key: pack.key, verdicts: gradingVerdicts, result1Verdicts });
  eq("scored set", scored.candidates.map((c) => c.id), ["C1:1"]);

  // Packet shape and forbidden strings; nothing from the other answer, the grades or the reasons.
  eq("packet keys", Object.keys(ap.packet), ["items"]);
  eq("item keys", Object.keys(ap.packet.items[0]).sort().join(), "answer,deficiencies,id,question,toolOutput");
  eq("tool output keys", Object.keys(ap.packet.items[0].toolOutput[0]).sort().join(), "code,result");
  const structure = JSON.stringify(ap.packet, (k, v) => (["answer", "question", "text", "code", "result"].includes(k) ? undefined : v));
  for (const forbidden of ["arm", "included", "excluded", "candidate", "sample", "claude", "correctness", "costUsd", "startedAt", "turns", "\"key\"", "footerCalls"]) {
    if (new RegExp(forbidden, "i").test(structure)) throw new Error(`packet structure leaks ${forbidden}`);
  }
  const whole = JSON.stringify(ap.packet);
  for (const marker of ["EXCLUDED-ANSWER-MARKER", "PAIR-REASON-MARKER", "\"correct\"", "\"partial\""]) if (whole.includes(marker)) throw new Error(`packet holds ${marker}`);
  for (const word of ["arm", "included", "excluded", "candidate", "sample", "claude", "fable", "opus", "sonnet"]) {
    if (new RegExp(`\\b${word}\\b`, "i").test(ATTRIBUTION_RUBRIC)) throw new Error(`rubric names ${word}`);
  }
  // Tool output starts at the first call that names or ran the registry (the second execute onward).
  eq("tool output start", ap.packet.items[0].toolOutput.length, 2);
  eq("footer-only start", toolOutputFrom([{ code: "a", result: "r", namesRwa: false, footerCalls: ["scout.getRwaAssets=ok"] }]).length, 1);
  eq("no registry anywhere", toolOutputFrom([{ code: "a", result: "r", namesRwa: false, footerCalls: [] }]), null);

  // A packed run with no capture file is a hard error; so is a deficiency naming X or Y.
  throws("missing capture", () => make({ loadCapture: () => undefined }), /no capture file/);
  throws("a deficiency naming Y", () => {
    const bad = gradingVerdicts.map((v) => ({ ...v, X: { ...v.X, deficiencies: v.X.deficiencies.map((d) => `${d} unlike Y`) }, Y: { ...v.Y, deficiencies: v.Y.deficiencies.map((d) => `${d} unlike X`) } }));
    make({ verdicts: bad });
  }, /invalid grading verdicts/);

  // Packing twice is refused (the key file exists).
  const dir = mkdtempSync(join(os.tmpdir(), "attr63-selftest-"));
  try {
    writeFileSync(join(dir, "blind-key.json"), JSON.stringify(pack.key));
    writeFileSync(join(dir, "g.json"), JSON.stringify({ verdicts: gradingVerdicts }));
    for (const arm of ["excluded", "included"]) writeFileSync(join(dir, `answers-${arm}.jsonl`), `${answers[arm].map((r) => JSON.stringify(r)).join("\n")}\n`);
    for (const k of ["C1", "N1", "N2"]) writeFileSync(join(dir, `exec-included-${k}-1.json`), JSON.stringify(cap()));
    const out = join(dir, "judge");
    packCli({ dir: out, gradingVerdicts: join(dir, "g.json"), answersDir: dir });
    throws("packing twice", () => packCli({ dir: out, gradingVerdicts: join(dir, "g.json"), answersDir: dir }), /packing twice/);
    const onDisk = readJson(join(out, "packet.json"));
    eq("packet on disk", onDisk.items.length, 3);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }

  // Verdict checks.
  const idOf = (pair) => Object.entries(ap.attrKey).find(([, m]) => `${m.key}:${m.sample}` === pair)[0];
  const item = (pair) => ap.packet.items.find((x) => x.id === idOf(pair));
  const answerQ = "lists asset TPT30   contract CABC123"; // differs only in whitespace from the answer text
  const toolQ = "TPT30 contract CABC123 issuer GABC";
  const yes = { involvesRegistry: true, answerQuote: answerQ, toolQuote: toolQ };
  const no = { involvesRegistry: false };
  const verdictsFor = (c1, others = no) => [
    { id: idOf("C1:1"), items: [{ n: 1, ...c1 }, { n: 2, ...no }] },
    { id: idOf("N1:1"), items: [{ n: 1, ...others }, { n: 2, ...no }] },
    { id: idOf("N2:1"), items: [{ n: 1, ...no }] },
  ];
  const resolve = (verdicts, packet = ap.packet) => resolveAttributions({ packet, attrKey: ap.attrKey, verdicts });
  const finalOutcome = (verdicts) => {
    const r = resolve(verdicts);
    if (r.fatal.length) throw new Error("refused");
    return scoreRetest({ answers, key: pack.key, verdicts: gradingVerdicts, result1Verdicts, attributions: r.attributions }).rule.outcome;
  };
  const okRes = resolve(verdictsFor(yes));
  eq("valid true, whitespace-normalised quotes", [okRes.fatal, okRes.attributions["C1:1"]], [[], { valid: true, involvesRegistry: true }]);
  eq("all false", resolve(verdictsFor(no)).attributions["C1:1"], { valid: true, involvesRegistry: false });
  eq("one entry is enough for the answer", resolve([{ id: idOf("C1:1"), items: [{ n: 1, ...no }, { n: 2, ...yes }] }, ...verdictsFor(no).slice(1)]).attributions["C1:1"].involvesRegistry, true);
  // Refusals: unknown id, duplicate id, unknown and duplicate item number.
  eq("unknown id", resolve([...verdictsFor(no), { id: "ffffffffff", items: [] }]).fatal.length, 1);
  eq("duplicate id", resolve([...verdictsFor(no), verdictsFor(no)[0]]).fatal.length, 1);
  eq("unknown n", resolve([{ id: idOf("C1:1"), items: [{ n: 1, ...no }, { n: 2, ...no }, { n: 9, ...no }] }]).fatal.length, 1);
  eq("duplicate n", resolve([{ id: idOf("C1:1"), items: [{ n: 1, ...no }, { n: 1, ...no }, { n: 2, ...no }] }]).fatal.length, 1);
  // A true without two verified quotes is invalid.
  const invalid = (patch) => resolve(verdictsFor({ ...yes, ...patch })).attributions["C1:1"];
  for (const [label, patch] of [["no answer quote", { answerQuote: undefined }], ["no tool quote", { toolQuote: undefined }], ["answer quote not in the answer", { answerQuote: "invented text" }], ["tool quote not in a tool result", { toolQuote: "invented text" }], ["empty quote", { toolQuote: "  " }], ["tool quote from code, not a result", { toolQuote: "scout.getRwaAssets({limit:3})" }]]) {
    eq(label, invalid(patch).valid, false);
  }
  eq("non-boolean verdict", resolve(verdictsFor({ involvesRegistry: "yes" })).attributions["C1:1"].valid, false);
  eq("missing item", resolve([{ id: idOf("C1:1"), items: [{ n: 1, ...no }] }, ...verdictsFor(no).slice(1)]).attributions["C1:1"].valid, false);
  eq("missing id", resolve(verdictsFor(no).slice(1)).attributions["C1:1"].valid, false);
  void item;
  // The outcome for every combination, through the same function the zero-candidate path ends with.
  eq("candidate true", finalOutcome(verdictsFor(yes)), "include"); // one candidate, one true: count 1 of 3 passes
  eq("candidate false", finalOutcome(verdictsFor(no)), "include");
  eq("invalid verdict is inconclusive", finalOutcome(verdictsFor({ ...yes, toolQuote: "invented" })), "inconclusive");
  eq("a non-candidate's invalid verdict is ignored", finalOutcome(verdictsFor(no, { involvesRegistry: "yes" })), "include");
  // Two true candidates on one question fire the clause.
  const two = { ...spec, "C1:2": { e: "c", i: "p", rwa: true } };
  const answers2 = { excluded: answers.excluded, included: answers.included.map((r) => (r.key === "C1" && r.sample === 2 ? { ...mk("C1", 2, { rwa: true }), answer: "INCLUDED answer C1 2 lists asset TPT30 contract CABC123 and the rows" } : r)) };
  const pack2 = buildRetestPack({ answers: answers2, questions });
  const gv2 = pack2.packet.pairs.map((p) => {
    const meta = pack2.key[p.id];
    const sp = two[`${meta.key}:${meta.sample}`] ?? {};
    const e = grade(sp.e ?? "c");
    const i = sp.extra ? { ...grade("c"), deficiencies: ["one optional remark"] } : grade(sp.i ?? "c");
    return { id: p.id, X: meta.X === "included" ? i : e, Y: meta.X === "included" ? e : i, reason: "r" };
  });
  const ap2 = buildAttributionPack({ answers: answers2, questions, key: pack2.key, verdicts: gv2, loadCapture: () => cap() });
  const id2 = (pair) => Object.entries(ap2.attrKey).find(([, m]) => `${m.key}:${m.sample}` === pair)?.[0];
  const v2 = (a, b) => ap2.packet.items.map((it) => {
    const pair = `${ap2.attrKey[it.id].key}:${ap2.attrKey[it.id].sample}`;
    const pick = pair === "C1:1" ? a : pair === "C1:2" ? b : no;
    return { id: it.id, items: it.deficiencies.map((d, idx) => ({ n: d.n, ...(idx === 0 ? pick : no) })) };
  });
  const final2 = (verdicts) => {
    const r = resolveAttributions({ packet: ap2.packet, attrKey: ap2.attrKey, verdicts });
    return scoreRetest({ answers: answers2, key: pack2.key, verdicts: gv2, result1Verdicts, attributions: r.attributions }).rule.outcome;
  };
  void id2;
  eq("two true candidates fire", final2(v2(yes, yes)), "exclude");
  eq("true and false pass", final2(v2(yes, no)), "include");
  eq("two false pass", final2(v2(no, no)), "include");
  eq("true and invalid is inconclusive", final2(v2(yes, { involvesRegistry: true })), "inconclusive");
  const zero = scoreRetest({ answers, key: pack.key, verdicts: gradingVerdicts.map((v) => v), result1Verdicts }); // no attributions given
  eq("pending without attributions", zero.rule.outcome, "pending-attribution");
  console.log("selftest ok: wider packed set, packet shape and leaks, captures, refusals, quote checks, every outcome");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    const flags = parseFlags(process.argv.slice(2));
    if (flags.selftest) selftest();
    else if (flags.pack) packCli(flags);
    else if (flags.validate) validateCli(flags);
    else if (flags.score) scoreCli(flags);
    else throw new Error("one of --pack, --validate, --score, --selftest");
  } catch (error) {
    console.error(`attribute failed: ${error.message}`);
    process.exit(1);
  }
}
