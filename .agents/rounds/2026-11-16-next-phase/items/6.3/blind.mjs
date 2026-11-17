#!/usr/bin/env node
/**
 * Round item 6.3: the blind packet for the judge and the un-blinded scoring (PLAN.md steps 4, 5).
 *
 *   node blind.mjs --pack --dir <fresh dir> [--answers-dir tmp/6.3] [--key tmp/6.3/blind-key.json]
 *   node blind.mjs --score --verdicts <verdicts.json> [--answers-dir tmp/6.3] [--key tmp/6.3/blind-key.json]
 *                          [--out tmp/6.3/score]
 *   node blind.mjs --selftest            offline check on synthetic answers; writes nothing durable
 *
 * One client (Claude Sonnet 5.5, answers in `answers-excluded.jsonl` and `answers-included.jsonl`) and
 * one judge (Claude Opus 5.5, which did not answer). `--pack` writes `packet.json` and `RUBRIC.md` into
 * --dir. A packet entry carries an opaque pair id, the question, the reference URLs and, for X and Y,
 * the answer text and the deduplicated result URLs minus every URL containing
 * `stellarlight.xyz/api/rwa`. No tool-call list, arm, question key or class, file name, timestamp, cost,
 * token count or model name enters a packet. X and Y are a balanced random split (`crypto.randomInt`),
 * stored only in the key file; pairs are shuffled under opaque ids.
 *
 * `--score` prints the rule outcome (include, exclude, inconclusive) mechanically; nobody overrides it.
 */
import { randomBytes, randomInt } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = new URL(".", import.meta.url);
export const CLIENT = "claude-sonnet-5-5";
export const CONTROL_KEYS = ["C1", "C2", "C3"];
export const NEUTRAL_KEYS = ["N1", "N2", "N3"];
export const DISPLACEMENT_KEYS = ["D2", "D3"];
export const REGISTRY_KEYS = ["D1", "D4"];
const CORRECTNESS = ["correct", "partial", "wrong"];
const REGISTRY_URL_PART = "stellarlight.xyz/api/rwa";

export const RUBRIC = `# Rubric (fixed before any answer existed)

You grade pairs of answers to the same question about the Stellar ecosystem. Each pair has answer X
and answer Y, in no meaningful order. You do not know how either was produced. Judge each answer on
its own, then write one line per pair.

Read only \`packet.json\` in this directory. Fetch any live page or URL you need (WebFetch or curl).
Do not read any other file on this machine and do not start subagents.

Per answer:

- \`correctness\`:
  - \`correct\`: every material claim agrees with the reference pages or other live primary sources
    you fetch, and the question is answered;
  - \`partial\`: right but missing a material part, or one minor error;
  - \`wrong\`: a material claim contradicts those sources, or the question is not answered.
- \`fabrication\`: \`true\` when the answer states a specific identifier, asset code, issuer, number,
  API name or URL that none of these supports: the reference pages, the pages the answer itself
  cites, the \`resultUrls\` listed for it, or the registry \`https://stellarlight.xyz/api/rwa\` (a source
  for every pair, whether or not the pair lists it). Fetch before marking it; otherwise \`false\`.
- \`offTopic\`: \`true\` when the answer spends material content on assets, issuers, products or
  registries the question did not ask about, or rests a main claim on such data; otherwise \`false\`.

Source notes:

- The registry \`https://stellarlight.xyz/api/rwa\` is curated: an asset's absence means it is not
  tracked there, not that it is absent from Stellar. It returns at most 100 of its rows per call and
  takes \`state\`, \`kind\` and \`level\` filters.
- Values from rwa.xyz are rwa.xyz's own valuations. Fetch \`app.rwa.xyz\` pages with \`curl\`; their data
  sits in the \`__NEXT_DATA__\` script.

Grounding (whether tool use supported the claims) is not judged. Do not infer anything from the order
X, Y, or from length.

Write \`verdicts.json\` in this directory:

\`\`\`json
{ "verdicts": [ { "id": "<pair id>",
    "X": { "correctness": "correct|partial|wrong", "fabrication": false, "offTopic": false },
    "Y": { "correctness": "correct|partial|wrong", "fabrication": false, "offTopic": false },
    "reason": "one line" } ] }
\`\`\`

Every pair id in the packet needs exactly one verdict. Then report the path with \`hc send\`.
`;

function readJsonl(path) {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
}

export function loadAnswers(dir) {
  return {
    excluded: readJsonl(join(dir, "answers-excluded.jsonl")),
    included: readJsonl(join(dir, "answers-included.jsonl")),
  };
}

const byKey = (rows) => Object.fromEntries(rows.map((r) => [r.key, r]));
const stripRegistry = (urls) => urls.filter((u) => !u.includes(REGISTRY_URL_PART));

function packetSide(run) {
  return { answer: run.answer, resultUrls: stripRegistry(run.resultUrls ?? []) };
}

/** A balanced shuffle of n booleans: floor(n/2) true, the odd one random, then Fisher-Yates. */
function balancedBits(n, rng) {
  const bits = Array.from({ length: n }, (_, i) => i < Math.floor(n / 2));
  if (n % 2 === 1) bits[n - 1] = rng(2) === 1;
  for (let i = bits.length - 1; i > 0; i -= 1) {
    const j = rng(i + 1);
    [bits[i], bits[j]] = [bits[j], bits[i]];
  }
  return bits;
}

/** Pure: pairs every question both arms answered, assigns X and Y (balanced), opaque ids, shuffles. */
export function buildPack({ answers, questions, rng = randomInt, newId = () => randomBytes(5).toString("hex") }) {
  const excluded = byKey(answers.excluded);
  const included = byKey(answers.included);
  const paired = questions.filter((q) => excluded[q.key]?.answered && included[q.key]?.answered);
  const bits = balancedBits(paired.length, rng);
  const key = {};
  const entries = [];
  paired.forEach((q, i) => {
    let id = newId();
    while (key[id]) id = newId();
    const includedIsX = bits[i];
    key[id] = { key: q.key, X: includedIsX ? "included" : "excluded" };
    entries.push({
      id,
      question: q.question,
      referenceUrls: q.referenceUrls,
      X: packetSide(includedIsX ? included[q.key] : excluded[q.key]),
      Y: packetSide(includedIsX ? excluded[q.key] : included[q.key]),
    });
  });
  for (let i = entries.length - 1; i > 0; i -= 1) {
    const j = rng(i + 1);
    [entries[i], entries[j]] = [entries[j], entries[i]];
  }
  return { key, packet: { pairs: entries } };
}

const sum = (xs) => xs.reduce((a, b) => a + b, 0);
const opsOf = (run) => run.calls.flatMap((c) => c.ops ?? []);

function runStats(rows, expectedKeys) {
  const byK = byKey(rows);
  const failures = {};
  let answered = 0;
  for (const k of expectedKeys) {
    const r = byK[k];
    if (r?.answered) answered += 1;
    else {
      const c = r ? r.failureClass : "not-run";
      failures[c] = (failures[c] ?? 0) + 1;
    }
  }
  const u = (r, f) => r.usage?.[f] ?? 0;
  return {
    runs: rows.length,
    answered,
    unanswered: expectedKeys.length - answered,
    failures,
    calls: sum(rows.map((r) => r.calls.length)),
    turns: sum(rows.map((r) => r.turns ?? 0)),
    inputTokens: sum(rows.map((r) => u(r, "input_tokens"))),
    outputTokens: sum(rows.map((r) => u(r, "output_tokens"))),
    cacheReadTokens: sum(rows.map((r) => u(r, "cache_read_input_tokens"))),
    cacheCreationTokens: sum(rows.map((r) => u(r, "cache_creation_input_tokens"))),
    costUsd: Number(sum(rows.map((r) => r.runCostUsd ?? 0)).toFixed(2)),
    rwaCalledRuns: rows.filter((r) => r.rwaCalled).length,
    rwaMentionedRuns: rows.filter((r) => r.rwaMentioned).length,
  };
}

const isBad = (v) => v.correctness === "wrong" || v.fabrication === true;

function validateVerdicts(verdicts, key) {
  const byId = {};
  for (const v of verdicts) {
    if (!key[v.id]) throw new Error("verdict for an unknown pair id");
    if (byId[v.id]) throw new Error("duplicate verdict");
    for (const side of ["X", "Y"]) {
      const s = v[side];
      if (!CORRECTNESS.includes(s?.correctness) || typeof s?.fabrication !== "boolean" || typeof s?.offTopic !== "boolean") {
        throw new Error(`invalid verdict fields for ${side}`);
      }
    }
    if (typeof v.reason !== "string" || !v.reason.trim()) throw new Error("verdict needs a reason");
    byId[v.id] = v;
  }
  for (const id of Object.keys(key)) if (!byId[id]) throw new Error("a packed pair has no verdict");
  return byId;
}

/** Pure scoring: un-blinds and applies the pre-registered outcome, attribution and rule. */
export function score({ answers, questions, key, verdicts }) {
  const verdictById = validateVerdicts(verdicts, key);
  const verdictOfKey = {};
  for (const [id, meta] of Object.entries(key)) {
    const v = verdictById[id];
    verdictOfKey[meta.key] = {
      excluded: meta.X === "excluded" ? v.X : v.Y,
      included: meta.X === "included" ? v.X : v.Y,
      reason: v.reason,
    };
  }
  const excluded = byKey(answers.excluded);
  const included = byKey(answers.included);
  const classOf = (k) => (CONTROL_KEYS.includes(k) ? "C" : NEUTRAL_KEYS.includes(k) ? "N" : k);

  const pairs = questions.map((q) => {
    const e = excluded[q.key];
    const i = included[q.key];
    const pair = { key: q.key, class: classOf(q.key) };
    if (!e?.answered || !i?.answered) {
      return {
        ...pair,
        missing: true,
        excludedFailure: e?.answered ? null : (e?.failureClass ?? "not-run"),
        includedFailure: i?.answered ? null : (i?.failureClass ?? "not-run"),
        outcome: "missing",
        attributableDrop: false,
        callsRwaWrongly: false,
      };
    }
    const v = verdictOfKey[q.key];
    const eb = isBad(v.excluded);
    const ib = isBad(v.included);
    const outcome = ib && !eb ? "loss" : eb && !ib ? "win" : "tie";
    const cn = CONTROL_KEYS.includes(q.key) || NEUTRAL_KEYS.includes(q.key);
    const attributableDrop = cn && v.included.correctness === "partial" && v.excluded.correctness === "correct" && i.rwaCalled === true;
    const callsRwaWrongly = i.rwaCalled === true && v.included.offTopic === true;
    return {
      ...pair,
      missing: false,
      outcome,
      excludedGrade: v.excluded,
      includedGrade: v.included,
      reason: v.reason,
      attributableDrop,
      callsRwaWrongly,
      correctVsPartialNoRwa: !ib && !eb && v.excluded.correctness !== v.included.correctness && !i.rwaCalled,
      rwaCalled: i.rwaCalled === true,
      rwaMentioned: i.rwaMentioned === true,
      excludedRwaCalled: e.rwaCalled === true,
      excludedOffTopic: v.excluded.offTopic,
      includedOps: [...new Set(opsOf(i))],
      excludedOps: [...new Set(opsOf(e))],
      turns: { excluded: e.turns, included: i.turns },
      costUsd: { excluded: e.runCostUsd, included: i.runCostUsd },
    };
  });

  const keys = questions.map((q) => q.key);
  const stats = { excluded: runStats(answers.excluded, keys), included: runStats(answers.included, keys) };
  const of = (list) => pairs.filter((p) => list.includes(p.key));
  const pairOf = (k) => pairs.find((p) => p.key === k);
  const lost = (p) => !p.missing && (p.outcome === "loss" || p.attributableDrop);

  const inconclusiveReasons = [];
  for (const p of of([...CONTROL_KEYS, ...NEUTRAL_KEYS, ...DISPLACEMENT_KEYS])) if (p.missing) inconclusiveReasons.push(`${p.key} is missing`);
  if (REGISTRY_KEYS.every((k) => pairOf(k).missing)) inconclusiveReasons.push("D1 and D4 are both missing");

  // Failed clauses are listed even when the outcome is inconclusive.
  const failed = [];
  for (const p of of([...CONTROL_KEYS, ...NEUTRAL_KEYS])) {
    if (lost(p)) failed.push(`1: INCLUDED loses ${p.key}${p.attributableDrop ? " (attributable drop)" : ""}`);
    if (!p.missing && p.callsRwaWrongly) failed.push(`1: INCLUDED calls RWA wrongly on ${p.key}`);
  }
  for (const p of of(DISPLACEMENT_KEYS)) if (lost(p)) failed.push(`2: INCLUDED loses ${p.key}`);
  const regPairs = of(REGISTRY_KEYS).filter((p) => !p.missing);
  const regLosses = regPairs.filter((p) => p.outcome === "loss").length;
  const regWins = regPairs.filter((p) => p.outcome === "win").length;
  if (regLosses - regWins > 0) failed.push(`3: registry pairs INCLUDED losses ${regLosses} minus wins ${regWins} > 0`);

  const outcome = inconclusiveReasons.length ? "inconclusive" : failed.length ? "exclude" : "include";
  return {
    pairs,
    stats,
    rule: { outcome, inconclusiveReasons, failedClauses: failed, registryLosses: regLosses, registryWins: regWins },
  };
}

export function renderMarkdown(result) {
  const L = [];
  const f = (o) => Object.entries(o).map(([k, v]) => `${k} ${v}`).join(", ") || "none";
  L.push("### Runs per arm", "", "| Arm | Answered | Failures | Calls | Turns | Input tok | Output tok | Cache read tok | Cache create tok | Cost USD | rwaCalled runs | rwaMentioned runs |", "|---|---|---|---|---|---|---|---|---|---|---|---|");
  for (const arm of ["excluded", "included"]) {
    const s = result.stats[arm];
    L.push(`| ${arm} | ${s.answered}/10 | ${f(s.failures)} | ${s.calls} | ${s.turns} | ${s.inputTokens} | ${s.outputTokens} | ${s.cacheReadTokens} | ${s.cacheCreationTokens} | ${s.costUsd} | ${s.rwaCalledRuns} | ${s.rwaMentionedRuns} |`);
  }
  const g = (x) => (x ? `${x.correctness}${x.fabrication ? "+fab" : ""}` : "-");
  L.push("", "### Pairs", "", "| Key | Class | Outcome | EXCLUDED grade | INCLUDED grade | INCLUDED offTopic | rwaCalled (INCL) | rwaMentioned (INCL) | Attributable drop | Calls RWA wrongly | EXCLUDED offTopic | Turns E/I | Cost E/I | Reason |", "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
  for (const p of result.pairs) {
    if (p.missing) {
      L.push(`| ${p.key} | ${p.class} | missing | - | - | - | - | - | - | - | - | - | - | EXCLUDED ${p.excludedFailure ?? "answered"}, INCLUDED ${p.includedFailure ?? "answered"} |`);
      continue;
    }
    const c = (x) => (typeof x === "number" ? x.toFixed(2) : "-");
    L.push(`| ${p.key} | ${p.class} | ${p.outcome} | ${g(p.excludedGrade)} | ${g(p.includedGrade)} | ${p.includedGrade.offTopic} | ${p.rwaCalled} | ${p.rwaMentioned} | ${p.attributableDrop} | ${p.callsRwaWrongly} | ${p.excludedOffTopic} | ${p.turns.excluded}/${p.turns.included} | ${c(p.costUsd.excluded)}/${c(p.costUsd.included)} | ${p.reason.replace(/\|/g, "/")} |`);
  }
  const r = result.rule;
  const notes = result.pairs.filter((p) => !p.missing && p.correctVsPartialNoRwa).map((p) => p.key);
  L.push("", "### Rule", "", `- Registry pairs D1 and D4: INCLUDED losses ${r.registryLosses}, wins ${r.registryWins}.`);
  L.push(`- Correct against partial without an RWA call (reported, not counted): ${notes.join(", ") || "none"}.`);
  L.push(`- Inconclusive clause: ${r.inconclusiveReasons.join("; ") || "not triggered"}.`);
  L.push(`- Failed clauses: ${r.failedClauses.join("; ") || "none"}.`);
  L.push(`- **Outcome: ${r.outcome}.**`);
  return `${L.join("\n")}\n`;
}

// --- CLI ---------------------------------------------------------------------------------------

function parseFlags(argv) {
  const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (["--pack", "--score", "--selftest"].includes(a)) flags[a.slice(2)] = true;
    else if (["--dir", "--verdicts", "--answers-dir", "--key", "--out"].includes(a)) flags[a.slice(2).replace(/-(\w)/g, (_, c) => c.toUpperCase())] = argv[(i += 1)];
    else throw new Error(`unknown argument ${a}`);
  }
  return flags;
}

const readQuestions = () => JSON.parse(readFileSync(new URL("questions.json", HERE), "utf8")).questions;

function writePrivate(path, text) {
  writeFileSync(path, text, { mode: 0o600 });
  chmodSync(path, 0o600);
}

function packCli(flags) {
  const answersDir = flags.answersDir ?? "tmp/6.3";
  const keyPath = flags.key ?? join(answersDir, "blind-key.json");
  if (existsSync(keyPath)) throw new Error("the key file exists; packing twice would re-randomize");
  if (!flags.dir) throw new Error("--dir is required");
  const { key, packet } = buildPack({ answers: loadAnswers(answersDir), questions: readQuestions() });
  mkdirSync(flags.dir, { recursive: true });
  writeFileSync(join(flags.dir, "packet.json"), `${JSON.stringify(packet, null, 2)}\n`);
  writeFileSync(join(flags.dir, "RUBRIC.md"), RUBRIC);
  writePrivate(keyPath, `${JSON.stringify(key, null, 2)}\n`);
  console.log(`packed: ${packet.pairs.length} pairs`);
}

function scoreCli(flags) {
  const answersDir = flags.answersDir ?? "tmp/6.3";
  if (!flags.verdicts) throw new Error("--verdicts is required");
  const key = JSON.parse(readFileSync(flags.key ?? join(answersDir, "blind-key.json"), "utf8"));
  const verdicts = JSON.parse(readFileSync(flags.verdicts, "utf8")).verdicts;
  const result = score({ answers: loadAnswers(answersDir), questions: readQuestions(), key, verdicts });
  const out = flags.out ?? join(answersDir, "score");
  writeFileSync(`${out}.json`, `${JSON.stringify(result, null, 2)}\n`);
  writeFileSync(`${out}.md`, renderMarkdown(result));
  console.log(`scored: outcome ${result.rule.outcome}; wrote ${out}.json and ${out}.md`);
}

// --- offline self-check on synthetic answers -----------------------------------------------------

function selftest() {
  const questions = readQuestions();
  const keys = questions.map((q) => q.key);
  if (keys.join(",") !== "C1,C2,C3,D1,D2,D3,D4,N1,N2,N3") throw new Error("question keys");
  const mk = (key, o = {}) => ({
    key,
    answered: o.answered ?? true,
    answer: (o.answered ?? true) ? `synthetic answer ${key}${o.rwa ? " using getRwaAssets" : ""}` : "",
    failureClass: (o.answered ?? true) ? null : "transport",
    runCostUsd: o.cost ?? 0.1,
    turns: o.turns ?? 3,
    usage: { input_tokens: 10, output_tokens: 5 },
    rwaCalled: o.rwa === true,
    rwaMentioned: o.rwa === true,
    calls: [{ tool: "execute", ops: o.rwa ? ["scout.getRwaAssets"] : ["stellarDocs.search_docs"], isError: false }],
    resultUrls: ["https://example.test/x", "https://stellarlight.xyz/api/rwa?limit=3"],
  });
  const answers = { excluded: questions.map((q) => mk(q.key)), included: questions.map((q) => mk(q.key, { rwa: true })) };
  const { key, packet } = buildPack({ answers, questions });
  const ids = Object.keys(key);
  if (ids.length !== 10 || packet.pairs.length !== 10 || new Set(ids).size !== 10) throw new Error("pack counts");
  if (Object.values(key).filter((m) => m.X === "included").length !== 5) throw new Error("split not balanced");

  // Leak checks: nothing arm-specific outside answer text, and no registry URL in resultUrls.
  const noAnswers = JSON.stringify(packet, (k, v) => (k === "answer" || k === "question" ? undefined : v));
  for (const forbidden of ["excluded", "included", "\"arm\"", "getRwaAssets", "claude-", "runCostUsd", "startedAt", "\"key\"", "toolCalls", "\"calls\""]) {
    if (noAnswers.includes(forbidden)) throw new Error(`packet leaks ${forbidden}`);
  }
  for (const p of packet.pairs) for (const s of ["X", "Y"]) if (p[s].resultUrls.some((u) => u.includes(REGISTRY_URL_PART))) throw new Error("registry URL in resultUrls");
  if (Object.keys(packet.pairs[0]).sort().join() !== "X,Y,id,question,referenceUrls") throw new Error("packet entry shape");

  // The rule: each case is a map key -> { e, i } grades (c = correct, p = partial, w = wrong, f = fabrication)
  // plus RWA calls and off-topic flags; everything else is a tie of correct answers.
  const grade = (c) => ({ correctness: { c: "correct", p: "partial", w: "wrong", f: "correct" }[c], fabrication: c === "f", offTopic: false });
  const run = (spec = {}, { missing = [], rwaOn = keys } = {}) => {
    const ans = {
      excluded: questions.map((q) => mk(q.key, { answered: !missing.includes(q.key) || (spec[q.key]?.keepE ?? false) })),
      included: questions.map((q) => mk(q.key, { answered: !missing.includes(q.key), rwa: rwaOn.includes(q.key) })),
    };
    const { key: k, packet: pk } = buildPack({ answers: ans, questions });
    const verdicts = pk.pairs.map((p) => {
      const meta = k[p.id];
      const s = spec[meta.key] ?? {};
      const e = { ...grade(s.e ?? "c") };
      const i = { ...grade(s.i ?? "c"), offTopic: s.off === true };
      return { id: p.id, X: meta.X === "included" ? i : e, Y: meta.X === "included" ? e : i, reason: "synthetic" };
    });
    return score({ answers: ans, questions, key: k, verdicts }).rule;
  };
  const expect = (label, got, want) => {
    if (got.outcome !== want) throw new Error(`${label}: ${got.outcome}, wanted ${want}`);
  };
  expect("all ties", run(), "include");
  expect("C loss (wrong)", run({ C1: { i: "w" } }), "exclude");
  expect("N loss (fabrication)", run({ N2: { i: "f" } }), "exclude");
  expect("C attributable drop", run({ C2: { e: "c", i: "p" } }), "exclude");
  expect("C partial without an RWA call", run({ C2: { e: "c", i: "p" } }, { rwaOn: [] }), "include");
  expect("C partial both ways", run({ C2: { e: "p", i: "c" } }), "include");
  expect("N calls RWA wrongly", run({ N1: { off: true } }), "exclude");
  expect("N off topic without a call", run({ N1: { off: true } }, { rwaOn: [] }), "include");
  expect("D2 loss", run({ D2: { i: "w" } }), "exclude");
  expect("D3 loss", run({ D3: { i: "f" } }), "exclude");
  expect("D2 partial is not a loss", run({ D2: { e: "c", i: "p" } }), "include");
  expect("D1 loss alone", run({ D1: { i: "w" } }), "exclude");
  expect("D1 loss, D4 win", run({ D1: { i: "w" }, D4: { e: "w" } }), "include");
  expect("D1 win alone", run({ D1: { e: "w" } }), "include");
  expect("C2 missing", run({}, { missing: ["C2"] }), "inconclusive");
  expect("N3 missing", run({}, { missing: ["N3"] }), "inconclusive");
  expect("D3 missing", run({}, { missing: ["D3"] }), "inconclusive");
  expect("D1 missing only", run({}, { missing: ["D1"] }), "include");
  expect("D1 and D4 missing", run({}, { missing: ["D1", "D4"] }), "inconclusive");
  const mixed = run({ D1: { i: "w" } }, { missing: ["D4"] });
  expect("D1 loss with D4 missing", mixed, "exclude");

  // Validation: a missing verdict, an unknown id and a missing offTopic are refused.
  const ans = { excluded: questions.map((q) => mk(q.key)), included: questions.map((q) => mk(q.key, { rwa: true })) };
  const { key: k2, packet: p2 } = buildPack({ answers: ans, questions });
  const ok = p2.pairs.map((p) => ({ id: p.id, X: grade("c"), Y: grade("c"), reason: "r" }));
  let refused = 0;
  for (const bad of [ok.slice(1), [...ok.slice(1), { ...ok[0], id: "ffffffffff" }], ok.map((v, n) => (n === 0 ? { ...v, X: { correctness: "correct", fabrication: false } } : v))]) {
    try { score({ answers: ans, questions, key: k2, verdicts: bad }); } catch { refused += 1; }
  }
  if (refused !== 3) throw new Error("validation");
  const result = score({ answers: ans, questions, key: k2, verdicts: ok });
  if (!renderMarkdown(result).includes("**Outcome: include.**")) throw new Error("render");
  console.log("selftest ok: 10 pairs packed, balanced and blinded; 20 rule cases; 3 refusals");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    const flags = parseFlags(process.argv.slice(2));
    if (flags.selftest) selftest();
    else if (flags.pack) packCli(flags);
    else if (flags.score) scoreCli(flags);
    else throw new Error("one of --pack, --score, --selftest");
  } catch (error) {
    console.error(`blind failed: ${error.message}`);
    process.exit(1);
  }
}
