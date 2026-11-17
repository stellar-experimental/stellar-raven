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
 *
 * Re-test (PLAN.md "Re-test: second measurement"): the same flags with `--retest`, plus `--validate`,
 *   node blind.mjs --retest --pack --dir <fresh dir> [--answers-dir tmp/6.3/rt] [--key <file>]
 *   node blind.mjs --retest --validate --verdicts <verdicts.json> [--answers-dir ..] [--key ..] [--hash-file ..]
 *   node blind.mjs --retest --score --verdicts <verdicts.json> [--answers-dir ..] [--key ..] [--out ..]
 *                           [--result1-verdicts <file>]
 *   node blind.mjs --retest --selftest
 * 21 pairs (seven keys, three samples, EXCLUDED sample i against INCLUDED sample i). The outcome is
 * computed by `scoreRetest`; with candidates it needs `attribute.mjs --score` (same function, with the
 * attributions), with none it is final here. A clause that fires or an inconclusive condition both
 * count against inclusion; as in result 1, "inconclusive" takes precedence over "exclude" in the label
 * and every fired clause is listed either way.
 */
import { createHash, randomBytes, randomInt } from "node:crypto";
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

// --- re-test (second measurement) --------------------------------------------------------------

export const RETEST_KEYS = ["C1", "C2", "C3", "D3", "N1", "N2", "N3"];
export const CARRIED_KEYS = ["D1", "D2", "D4"];
export const SAMPLES = [1, 2, 3];
const DEFICIENCY_NAMES_SIDE = /\b[XY]\b/;

export const RETEST_RUBRIC = `# Rubric (fixed before any answer existed)

You grade pairs of answers to the same question about the Stellar ecosystem. Each pair has answer X
and answer Y, in no meaningful order. You do not know how either was produced. A question can appear
in several pairs; grade each pair on its own. Judge each answer on its own, then write one line per
pair.

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
- \`deficiencies\`: a list of strings, most important first. Required when \`correctness\` is not
  \`correct\`, when \`fabrication\` is \`true\` and when \`offTopic\` is \`true\`; otherwise it may be
  empty. Each item names one claim that is wrong, unsupported or missing, or (when \`offTopic\` is
  \`true\`) names the off-topic content. Each item stands alone: say what the answer claims or omits and
  what the sources say. An item never refers to the other answer, to X or to Y.

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
    "X": { "correctness": "correct|partial|wrong", "fabrication": false, "offTopic": false,
           "deficiencies": ["one claim or omission", "..."] },
    "Y": { "correctness": "correct|partial|wrong", "fabrication": false, "offTopic": false,
           "deficiencies": [] },
    "reason": "one line" } ] }
\`\`\`

Every pair id in the packet needs exactly one verdict. Then report the path with \`hc send\`.
`;

const sampleOf = (r) => r.sample ?? 1;
const byKeySample = (rows) => Object.fromEntries(rows.map((r) => [`${r.key}:${sampleOf(r)}`, r]));
const shuffleInPlace = (list, rng) => {
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = rng(i + 1);
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
};

/**
 * Pure: pairs EXCLUDED sample i with INCLUDED sample i per question when both answered; assigns X and Y
 * so that each question has floor and ceiling of n/2 INCLUDED-as-X and the packet is as balanced as the
 * odd counts allow; opaque ids; shuffled. Entries carry exactly id, question, referenceUrls, X, Y.
 */
export function buildRetestPack({ answers, questions, rng = randomInt, newId = () => randomBytes(5).toString("hex") }) {
  const ex = byKeySample(answers.excluded);
  const inc = byKeySample(answers.included);
  const groups = [];
  for (const k of RETEST_KEYS) {
    const q = questions.find((x) => x.key === k);
    if (!q) throw new Error(`questions.json lacks ${k}`);
    const samples = SAMPLES.filter((s) => ex[`${k}:${s}`]?.answered && inc[`${k}:${s}`]?.answered);
    if (samples.length) groups.push({ q, samples });
  }
  const order = shuffleInPlace([...groups.keys()], rng);
  let diff = 0;
  const bitsOf = {};
  for (const gi of order) {
    const n = groups[gi].samples.length;
    let trues = Math.floor(n / 2);
    if (n % 2 === 1 && (diff < 0 || (diff === 0 && rng(2) === 1))) trues += 1;
    bitsOf[gi] = shuffleInPlace(Array.from({ length: n }, (_, i) => i < trues), rng);
    diff += trues - (n - trues);
  }
  const key = {};
  const entries = [];
  groups.forEach((g, gi) => {
    g.samples.forEach((s, i) => {
      let id = newId();
      while (key[id]) id = newId();
      const includedIsX = bitsOf[gi][i];
      key[id] = { key: g.q.key, sample: s, X: includedIsX ? "included" : "excluded" };
      const e = ex[`${g.q.key}:${s}`];
      const n = inc[`${g.q.key}:${s}`];
      entries.push({
        id,
        question: g.q.question,
        referenceUrls: g.q.referenceUrls,
        X: packetSide(includedIsX ? n : e),
        Y: packetSide(includedIsX ? e : n),
      });
    });
  });
  shuffleInPlace(entries, rng);
  return { key, packet: { pairs: entries } };
}

/** The judge's grade fields as written, hashed at the first write so a completion pass cannot change one. */
export function gradesHash(verdicts) {
  const rows = [...verdicts]
    .sort((a, b) => String(a.id).localeCompare(String(b.id)))
    .map((v) => [v.id, ...["X", "Y"].flatMap((s) => [v[s]?.correctness, v[s]?.fabrication, v[s]?.offTopic])]);
  return createHash("sha256").update(JSON.stringify(rows)).digest("hex");
}

/** Problems with a re-test verdict file against the key (empty when valid). */
export function retestVerdictProblems(verdicts, key) {
  const problems = [];
  const seen = new Set();
  for (const v of verdicts) {
    if (!key[v.id]) {
      problems.push("a verdict names an unknown pair id");
      continue;
    }
    if (seen.has(v.id)) problems.push(`duplicate verdict for ${v.id}`);
    seen.add(v.id);
    for (const side of ["X", "Y"]) {
      const s = v[side];
      if (!CORRECTNESS.includes(s?.correctness) || typeof s?.fabrication !== "boolean" || typeof s?.offTopic !== "boolean") {
        problems.push(`${v.id}: invalid verdict fields for ${side}`);
        continue;
      }
      const required = s.correctness !== "correct" || s.fabrication === true || s.offTopic === true;
      const list = s.deficiencies;
      if (list !== undefined && (!Array.isArray(list) || list.some((x) => typeof x !== "string" || !x.trim()))) {
        problems.push(`${v.id}: ${side} deficiencies must be a list of non-empty strings`);
        continue;
      }
      if (required && (!list || list.length === 0)) problems.push(`${v.id}: ${side} needs a deficiencies list`);
      for (const item of list ?? []) if (DEFICIENCY_NAMES_SIDE.test(item)) problems.push(`${v.id}: a ${side} deficiency names X or Y`);
    }
    if (typeof v.reason !== "string" || !v.reason.trim()) problems.push(`${v.id}: verdict needs a reason`);
  }
  for (const id of Object.keys(key)) if (!seen.has(id)) problems.push(`${id}: a packed pair has no verdict`);
  return problems;
}

const gradeScore = (v) => (isBad(v) ? 0 : v.correctness === "partial" ? 1 : 2);
const regCallOf = (run) => run.rwaCalled === true || run.rwaRan === true;
export const pairId = (key, sample) => `${key}:${sample}`;

/**
 * Un-blinds the graded pairs. One entry per (key, sample) of the seven re-sampled questions: missing when
 * either run is unanswered, else both grades, the call flags, the deficiency items and the pre-registered
 * per-pair predicates. `verdicts` must already be valid.
 */
export function gradeRetestPairs({ answers, key, verdicts }) {
  const verdictById = Object.fromEntries(verdicts.map((v) => [v.id, v]));
  const gradeOf = {};
  for (const [id, meta] of Object.entries(key)) {
    const v = verdictById[id];
    if (!v) throw new Error("a packed pair has no verdict");
    const e = meta.X === "excluded" ? v.X : v.Y;
    const i = meta.X === "included" ? v.X : v.Y;
    gradeOf[pairId(meta.key, meta.sample)] = { excluded: e, included: i, reason: v.reason };
  }
  const ex = byKeySample(answers.excluded);
  const inc = byKeySample(answers.included);
  const pairs = [];
  for (const k of RETEST_KEYS) {
    for (const s of SAMPLES) {
      const id = pairId(k, s);
      const e = ex[id];
      const i = inc[id];
      if (!e?.answered || !i?.answered) {
        pairs.push({
          id, key: k, sample: s, missing: true,
          excludedFailure: e?.answered ? null : (e?.failureClass ?? "not-run"),
          includedFailure: i?.answered ? null : (i?.failureClass ?? "not-run"),
        });
        continue;
      }
      const g = gradeOf[id];
      if (!g) throw new Error(`${id} is answered on both arms but has no packed pair`);
      const eb = isBad(g.excluded);
      const ib = isBad(g.included);
      const sE = gradeScore(g.excluded);
      const sI = gradeScore(g.included);
      const regCall = regCallOf(i);
      pairs.push({
        id, key: k, sample: s, missing: false,
        excludedGrade: g.excluded, includedGrade: g.included, reason: g.reason,
        sE, sI,
        regCall, rwaCalled: i.rwaCalled === true, rwaRan: i.rwaRan === true, rwaMentioned: i.rwaMentioned === true,
        excludedRwaCalled: e.rwaCalled === true, excludedRwaRan: e.rwaRan === true,
        callRanDiffer: (i.rwaCalled === true) !== (i.rwaRan === true) || (e.rwaCalled === true) !== (e.rwaRan === true),
        badLoss: ib && !eb,
        badWin: eb && !ib,
        worse: sI < sE,
        candidate: sI < sE && regCall,
        wrongRegistryUse: regCall && g.included.offTopic === true,
        includedDeficiencies: g.included.deficiencies ?? [],
        excludedDeficiencies: g.excluded.deficiencies ?? [],
        excludedOffTopic: g.excluded.offTopic,
        turns: { excluded: e.turns, included: i.turns },
        costUsd: { excluded: e.runCostUsd, included: i.runCostUsd },
        includedOps: [...new Set(opsOf(i))],
      });
    }
  }
  return pairs;
}

/** Number of complete pairs and a count give "fires", "inconclusive" or "ok" for one clause. */
export function clauseState(n, count) {
  if (n < 2) return "inconclusive";
  if (count >= 2) return "fires";
  if (n === 2 && count === 1) return "inconclusive";
  return "ok";
}

/** The carried result-1 clauses for D1, D2 and D4, recomputed from the committed un-blinded verdicts. */
export function carriedClauses(result1Verdicts) {
  const byK = Object.fromEntries(result1Verdicts.map((v) => [v.key, v]));
  for (const k of CARRIED_KEYS) if (!byK[k]) throw new Error(`result-1 verdicts lack ${k}`);
  const outcomeOf = (v) => {
    const eb = isBad(v.excluded);
    const ib = isBad(v.included);
    return ib && !eb ? "loss" : eb && !ib ? "win" : "tie";
  };
  const d2Loss = outcomeOf(byK.D2) === "loss";
  const regs = ["D1", "D4"].map((k) => outcomeOf(byK[k]));
  const losses = regs.filter((o) => o === "loss").length;
  const wins = regs.filter((o) => o === "win").length;
  return {
    D2: { holds: !d2Loss, note: "no INCLUDED loss" },
    registry: { holds: losses - wins <= 0, losses, wins, note: "D1 and D4: INCLUDED losses minus wins <= 0" },
    holds: !d2Loss && losses - wins <= 0,
    singleSample: true,
  };
}

/**
 * The re-test rule, mechanically. `attributions` maps "KEY:sample" to { valid, involvesRegistry } for the
 * candidate pairs (absent: not yet attributed). Outcome: "pending-attribution" (candidates, no attributions
 * given), else "inconclusive", "exclude" or "include".
 */
export function scoreRetest({ answers, key, verdicts, result1Verdicts, attributions }) {
  const problems = retestVerdictProblems(verdicts, key);
  if (problems.length) throw new Error(`invalid verdicts: ${problems.join("; ")}`);
  const pairs = gradeRetestPairs({ answers, key, verdicts });
  const candidates = pairs.filter((p) => !p.missing && p.candidate);
  const attributed = attributions !== undefined;
  for (const p of candidates) {
    const a = attributions?.[p.id];
    p.attribution = !attributed ? "pending" : a && a.valid === true ? "ok" : "invalid";
    p.involvesRegistry = p.attribution === "ok" ? a.involvesRegistry === true : null;
  }

  const questionsOut = RETEST_KEYS.map((k) => {
    const mine = pairs.filter((p) => p.key === k);
    const complete = mine.filter((p) => !p.missing);
    const n = complete.length;
    const losses = complete.filter((p) => p.badLoss).length;
    const wins = complete.filter((p) => p.badWin).length;
    const cands = complete.filter((p) => p.candidate);
    const trues = cands.filter((p) => p.involvesRegistry === true).length;
    const unknown = cands.filter((p) => p.involvesRegistry === null).length;
    const wrong = complete.filter((p) => p.wrongRegistryUse).length;
    const worse = complete.filter((p) => p.worse);
    const clauses = {
      badLossNet: { count: losses - wins, state: clauseState(n, losses - wins) },
      attributableDrop: { count: trues, unknown, state: unknown > 0 && trues < 2 ? "pending" : clauseState(n, trues) },
      wrongRegistryUse: { count: wrong, state: clauseState(n, wrong) },
    };
    return {
      key: k, completePairs: n, clauses,
      worsePairs: worse.map((p) => p.sample),
      altReading: worse.length * 2 > n && trues >= 1,
      crowdOut: cands.filter((p) => p.involvesRegistry === false).map((p) => p.sample),
    };
  });

  const inconclusiveReasons = [];
  const fired = [];
  for (const q of questionsOut) {
    if (q.completePairs < 2) inconclusiveReasons.push(`${q.key} has ${q.completePairs} complete pair(s)`);
    for (const [name, c] of Object.entries(q.clauses)) {
      if (c.state === "fires") fired.push(`${q.key}: ${name} (${c.count})`);
      else if (c.state === "inconclusive" && q.completePairs >= 2) inconclusiveReasons.push(`${q.key}: ${name} count ${c.count} of ${q.completePairs} complete pairs`);
    }
  }
  const invalid = candidates.filter((p) => p.attribution === "invalid");
  for (const p of invalid) inconclusiveReasons.push(`${p.id}: attribution missing or invalid`);
  const pending = candidates.length > 0 && !attributed;
  const carried = carriedClauses(result1Verdicts);
  const carriedFailed = [];
  if (!carried.D2.holds) carriedFailed.push("carried D2: INCLUDED loses");
  if (!carried.registry.holds) carriedFailed.push(`carried D1/D4: losses ${carried.registry.losses} minus wins ${carried.registry.wins} > 0`);

  const outcome = pending ? "pending-attribution" : inconclusiveReasons.length ? "inconclusive" : fired.length || carriedFailed.length ? "exclude" : "include";
  const unfiredWorse = questionsOut.filter((q) => q.worsePairs.length >= 2 && !Object.values(q.clauses).some((c) => c.state === "fires")).map((q) => q.key);
  return {
    pairs,
    questions: questionsOut,
    candidates: candidates.map((p) => ({ id: p.id, attribution: p.attribution, involvesRegistry: p.involvesRegistry })),
    carried,
    stats: retestStats(answers, pairs),
    reported: {
      callRanDiffer: pairs.filter((p) => !p.missing && p.callRanDiffer).map((p) => p.id),
      unfiredQuestionsWithTwoOrMoreWorse: unfiredWorse,
      altReadingQuestions: questionsOut.filter((q) => q.altReading).map((q) => q.key),
      crowdOut: questionsOut.flatMap((q) => q.crowdOut.map((s) => pairId(q.key, s))),
    },
    rule: { outcome, inconclusiveReasons, firedClauses: fired, carriedFailed },
  };
}

function retestStats(answers, pairs) {
  const stat = (rows) => {
    const mine = rows.filter((r) => RETEST_KEYS.includes(r.key));
    const u = (r, f) => r.usage?.[f] ?? 0;
    return {
      runs: mine.length,
      answered: mine.filter((r) => r.answered).length,
      unanswered: RETEST_KEYS.length * SAMPLES.length - mine.filter((r) => r.answered).length,
      attempts: sum(mine.map((r) => r.attempts?.length ?? 1)),
      calls: sum(mine.map((r) => r.calls.length)),
      turns: sum(mine.map((r) => r.turns ?? 0)),
      inputTokens: sum(mine.map((r) => u(r, "input_tokens"))),
      outputTokens: sum(mine.map((r) => u(r, "output_tokens"))),
      cacheReadTokens: sum(mine.map((r) => u(r, "cache_read_input_tokens"))),
      cacheCreationTokens: sum(mine.map((r) => u(r, "cache_creation_input_tokens"))),
      costUsd: Number(sum(mine.map((r) => r.runCostUsd ?? 0)).toFixed(2)),
      rwaCalledRuns: mine.filter((r) => r.rwaCalled).length,
      rwaRanRuns: mine.filter((r) => r.rwaRan).length,
      rwaMentionedRuns: mine.filter((r) => r.rwaMentioned).length,
    };
  };
  return { excluded: stat(answers.excluded), included: stat(answers.included), completePairs: pairs.filter((p) => !p.missing).length };
}

export function renderRetestMarkdown(result) {
  const L = [];
  L.push("### Runs per arm", "", "| Arm | Answered | Attempts | Calls | Turns | Input tok | Output tok | Cache read tok | Cache create tok | Cost USD | rwaCalled runs | rwaRan runs | rwaMentioned runs |", "|---|---|---|---|---|---|---|---|---|---|---|---|---|");
  for (const arm of ["excluded", "included"]) {
    const s = result.stats[arm];
    L.push(`| ${arm} | ${s.answered}/21 | ${s.attempts} | ${s.calls} | ${s.turns} | ${s.inputTokens} | ${s.outputTokens} | ${s.cacheReadTokens} | ${s.cacheCreationTokens} | ${s.costUsd} | ${s.rwaCalledRuns} | ${s.rwaRanRuns} | ${s.rwaMentionedRuns} |`);
  }
  const g = (x) => (x ? `${x.correctness}${x.fabrication ? "+fab" : ""}` : "-");
  L.push("", "### Pairs", "", "| Pair | EXCLUDED | INCLUDED | worse | regCall | rwaCalled/rwaRan | candidate | involvesRegistry | INCL offTopic | Turns E/I | Cost E/I | Reason |", "|---|---|---|---|---|---|---|---|---|---|---|---|");
  for (const p of result.pairs) {
    if (p.missing) {
      L.push(`| ${p.id} | missing | missing | - | - | - | - | - | - | - | - | EXCLUDED ${p.excludedFailure ?? "answered"}, INCLUDED ${p.includedFailure ?? "answered"} |`);
      continue;
    }
    const c = (x) => (typeof x === "number" ? x.toFixed(2) : "-");
    const inv = p.candidate ? String(p.involvesRegistry) : "-";
    L.push(`| ${p.id} | ${g(p.excludedGrade)} | ${g(p.includedGrade)} | ${p.worse} | ${p.regCall} | ${p.rwaCalled}/${p.rwaRan} | ${p.candidate} | ${inv} | ${p.includedGrade.offTopic} | ${p.turns.excluded}/${p.turns.included} | ${c(p.costUsd.excluded)}/${c(p.costUsd.included)} | ${p.reason.replace(/\|/g, "/")} |`);
  }
  L.push("", "### Clauses per question", "", "| Question | Complete pairs | 1 bad loss (net) | 2 attributable drop | 3 wrong registry use | Worse pairs (samples) | Crowd-out (candidate, no registry) |", "|---|---|---|---|---|---|---|");
  for (const q of result.questions) {
    const c = q.clauses;
    L.push(`| ${q.key} | ${q.completePairs} | ${c.badLossNet.count} ${c.badLossNet.state} | ${c.attributableDrop.count} ${c.attributableDrop.state} | ${c.wrongRegistryUse.count} ${c.wrongRegistryUse.state} | ${q.worsePairs.join(",") || "none"} | ${q.crowdOut.join(",") || "none"} |`);
  }
  const r = result.rule;
  const cr = result.carried;
  L.push("", "### Rule", "");
  L.push(`- Carried result-1 clauses (single sample, recomputed from verdicts.json): D2 holds ${cr.D2.holds}; D1 and D4 losses ${cr.registry.losses}, wins ${cr.registry.wins}, holds ${cr.registry.holds}.`);
  L.push(`- Reported: runs where rwaCalled and rwaRan differ: ${result.reported.callRanDiffer.join(", ") || "none"}; questions with two or more worse pairs and no fired clause: ${result.reported.unfiredQuestionsWithTwoOrMoreWorse.join(", ") || "none"}; other reading of the sentence (worse in a majority, registry involved at least once): ${result.reported.altReadingQuestions.join(", ") || "none"}.`);
  L.push(`- Inconclusive conditions: ${r.inconclusiveReasons.join("; ") || "none"}.`);
  L.push(`- Fired clauses: ${r.firedClauses.join("; ") || "none"}${r.carriedFailed.length ? `; ${r.carriedFailed.join("; ")}` : ""}.`);
  L.push(`- **Outcome: ${r.outcome}.**`);
  return `${L.join("\n")}\n`;
}

// --- CLI ---------------------------------------------------------------------------------------

function parseFlags(argv) {
  const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (["--pack", "--score", "--selftest", "--retest", "--validate"].includes(a)) flags[a.slice(2)] = true;
    else if (["--dir", "--verdicts", "--answers-dir", "--key", "--out", "--hash-file", "--result1-verdicts"].includes(a)) flags[a.slice(2).replace(/-(\w)/g, (_, c) => c.toUpperCase())] = argv[(i += 1)];
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

const RETEST_DIR = "tmp/6.3/rt";
const retestPaths = (flags) => {
  const answersDir = flags.answersDir ?? RETEST_DIR;
  return {
    answersDir,
    keyPath: flags.key ?? join(answersDir, "blind-key.json"),
    hashPath: flags.hashFile ?? join(answersDir, "grades.sha256"),
    result1Path: flags.result1Verdicts ?? fileURLToPath(new URL("verdicts.json", HERE)),
  };
};

function retestPackCli(flags) {
  const { answersDir, keyPath } = retestPaths(flags);
  if (existsSync(keyPath)) throw new Error("the key file exists; packing twice would re-randomize");
  if (!flags.dir) throw new Error("--dir is required");
  const { key, packet } = buildRetestPack({ answers: loadAnswers(answersDir), questions: readQuestions() });
  mkdirSync(flags.dir, { recursive: true });
  writeFileSync(join(flags.dir, "packet.json"), `${JSON.stringify(packet, null, 2)}\n`);
  writeFileSync(join(flags.dir, "RUBRIC.md"), RETEST_RUBRIC);
  writePrivate(keyPath, `${JSON.stringify(key, null, 2)}\n`);
  console.log(`packed: ${packet.pairs.length} pairs`);
}

/** The first call records the grade hash; every later call refuses a verdict file whose grades differ. */
function checkGradesHash(verdicts, hashPath, { record }) {
  const hash = gradesHash(verdicts);
  if (!existsSync(hashPath)) {
    if (!record) throw new Error("no grade hash on file: run --retest --validate on the judge's first write");
    writePrivate(hashPath, `${hash}\n`);
    return "recorded";
  }
  if (readFileSync(hashPath, "utf8").trim() !== hash) throw new Error("the grades differ from the hash taken at the first write");
  return "matches";
}

function retestValidateCli(flags) {
  const { keyPath, hashPath } = retestPaths(flags);
  if (!flags.verdicts) throw new Error("--verdicts is required");
  const key = JSON.parse(readFileSync(keyPath, "utf8"));
  const verdicts = JSON.parse(readFileSync(flags.verdicts, "utf8")).verdicts;
  const hash = checkGradesHash(verdicts, hashPath, { record: true });
  const problems = retestVerdictProblems(verdicts, key);
  console.log(`grade hash ${hash}`);
  if (problems.length) {
    for (const p of problems) console.log(`problem: ${p}`);
    process.exitCode = 1;
  } else console.log("verdicts valid");
}

function retestScoreCli(flags) {
  const { answersDir, keyPath, hashPath, result1Path } = retestPaths(flags);
  if (!flags.verdicts) throw new Error("--verdicts is required");
  const key = JSON.parse(readFileSync(keyPath, "utf8"));
  const verdicts = JSON.parse(readFileSync(flags.verdicts, "utf8")).verdicts;
  checkGradesHash(verdicts, hashPath, { record: false });
  const result1Verdicts = JSON.parse(readFileSync(result1Path, "utf8")).verdicts;
  const result = scoreRetest({ answers: loadAnswers(answersDir), key, verdicts, result1Verdicts });
  const out = flags.out ?? join(answersDir, "score-retest");
  writeFileSync(`${out}.json`, `${JSON.stringify(result, null, 2)}\n`);
  writeFileSync(`${out}.md`, renderRetestMarkdown(result));
  console.log(`scored: outcome ${result.rule.outcome}; candidates ${result.candidates.length}; wrote ${out}.json and ${out}.md`);
}

// --- re-test offline self-check ------------------------------------------------------------------

function retestSelftest() {
  const questions = readQuestions();
  const allKeys = questions.map((q) => q.key);
  const eq = (label, got, want) => {
    if (JSON.stringify(got) !== JSON.stringify(want)) throw new Error(`${label}: ${JSON.stringify(got)} != ${JSON.stringify(want)}`);
  };
  const throws = (label, fn) => {
    try { fn(); } catch { return; }
    throw new Error(`${label}: did not throw`);
  };
  const result1Verdicts = JSON.parse(readFileSync(new URL("verdicts.json", HERE), "utf8")).verdicts;
  const mk = (key, sample, o = {}) => ({
    key, sample,
    answered: o.answered ?? true,
    answer: (o.answered ?? true) ? `synthetic answer ${key} ${sample}${o.rwa ? " using getRwaAssets" : ""}` : "",
    failureClass: (o.answered ?? true) ? null : "transport",
    runCostUsd: 0.1, turns: 3, attempts: [{}],
    usage: { input_tokens: 10, output_tokens: 5 },
    rwaCalled: o.rwa === true, rwaRan: o.ran ?? o.rwa === true, rwaMentioned: o.rwa === true,
    calls: [{ tool: "execute", ops: o.rwa ? ["scout.getRwaAssets"] : ["stellarDocs.search_docs"], isError: false }],
    resultUrls: ["https://example.test/x", "https://stellarlight.xyz/api/rwa?limit=3"],
  });
  // spec: { "C1:2": { e, i, rwa, ran, off, inv } }; missing: ["C1:2:included", ...]
  const answersFor = (spec, missing) => ({
    excluded: allKeys.flatMap((k) => SAMPLES.map((s) => mk(k, s, { answered: !missing.includes(`${k}:${s}:excluded`) }))),
    included: allKeys.flatMap((k) => SAMPLES.map((s) => mk(k, s, { answered: !missing.includes(`${k}:${s}:included`), rwa: spec[`${k}:${s}`]?.rwa === true, ran: spec[`${k}:${s}`]?.ran }))),
  });
  const grade = (c, off = false) => ({
    correctness: { c: "correct", p: "partial", w: "wrong", f: "correct" }[c],
    fabrication: c === "f", offTopic: off,
    deficiencies: c === "c" && !off ? [] : ["a standalone deficiency"],
  });
  const verdictsFor = (pack, spec) => pack.packet.pairs.map((p) => {
    const meta = pack.key[p.id];
    const sp = spec[`${meta.key}:${meta.sample}`] ?? {};
    const e = grade(sp.e ?? "c");
    const i = grade(sp.i ?? "c", sp.off === true);
    return { id: p.id, X: meta.X === "included" ? i : e, Y: meta.X === "included" ? e : i, reason: "synthetic" };
  });
  const run = (spec = {}, { missing = [], r1 = result1Verdicts, attribute = true } = {}) => {
    const answers = answersFor(spec, missing);
    const pack = buildRetestPack({ answers, questions });
    const attributions = attribute ? Object.fromEntries(Object.entries(spec).filter(([, v]) => v.inv !== undefined).map(([k, v]) => [k, { valid: v.inv !== "invalid", involvesRegistry: v.inv === true }])) : undefined;
    // Candidates without an explicit attribution default to a false verdict so the outcome is final.
    const filled = attributions && Object.fromEntries(Object.entries(attributions));
    const first = scoreRetest({ answers, key: pack.key, verdicts: verdictsFor(pack, spec), result1Verdicts: r1, attributions: filled && Object.keys(filled).length === 0 ? {} : filled });
    return first;
  };
  const outcome = (label, res, want) => eq(label, res.rule.outcome, want);
  const q = (k, ...specs) => Object.fromEntries(specs.map((sp, i) => [`${k}:${i + 1}`, sp]).filter(([, sp]) => sp));

  // --- packing -------------------------------------------------------------------------------------
  const full = answersFor({}, []);
  let tens = 0;
  let elevens = 0;
  for (let n = 0; n < 40; n += 1) {
    const { key, packet } = buildRetestPack({ answers: full, questions });
    if (packet.pairs.length !== 21 || Object.keys(key).length !== 21 || new Set(Object.keys(key)).size !== 21) throw new Error("pack counts");
    if (Object.values(key).some((m) => !RETEST_KEYS.includes(m.key))) throw new Error("D1, D2 or D4 was packed");
    for (const k of RETEST_KEYS) {
      const x = Object.values(key).filter((m) => m.key === k && m.X === "included").length;
      if (x !== 1 && x !== 2) throw new Error(`split on ${k} is ${x}, not 2 and 1`);
    }
    const total = Object.values(key).filter((m) => m.X === "included").length;
    if (total === 10) tens += 1;
    else if (total === 11) elevens += 1;
    else throw new Error(`overall split ${total}`);
  }
  if (!tens || !elevens) throw new Error("the odd split never varied over 40 packs");
  const { packet: p1 } = buildRetestPack({ answers: full, questions });
  eq("entry shape", Object.keys(p1.pairs[0]).sort().join(), "X,Y,id,question,referenceUrls");
  eq("side shape", Object.keys(p1.pairs[0].X).sort().join(), "answer,resultUrls");
  const noText = JSON.stringify(p1, (k, v) => (k === "answer" || k === "question" ? undefined : v));
  for (const forbidden of ["excluded", "included", "\"arm\"", "getRwaAssets", "claude-", "runCostUsd", "startedAt", "\"key\"", "\"sample\"", "toolCalls", "\"calls\"", "rwaCalled", "rwaRan"]) {
    if (noText.includes(forbidden)) throw new Error(`packet leaks ${forbidden}`);
  }
  for (const p of p1.pairs) for (const sd of ["X", "Y"]) if (p[sd].resultUrls.some((u) => u.includes(REGISTRY_URL_PART))) throw new Error("registry URL in resultUrls");
  if (RETEST_RUBRIC.includes("excluded") || RETEST_RUBRIC.includes("included")) throw new Error("rubric names an arm");

  // A missing sample makes only its pair missing.
  const miss = run({}, { missing: ["C1:2:included"] });
  eq("one missing", miss.pairs.filter((p) => p.missing).map((p) => p.id), ["C1:2"]);
  eq("pairs left", miss.pairs.filter((p) => !p.missing).length, 20);
  outcome("one of three missing, two complete pairs, no count", miss, "include");

  // --- the rule ------------------------------------------------------------------------------------
  outcome("all ties", run(), "include");
  // clause 1: net bad loss
  outcome("bad loss 1 of 3", run(q("C1", { i: "w" })), "include");
  outcome("bad loss 2 of 3", run(q("C1", { i: "w" }, { i: "f" })), "exclude");
  outcome("bad loss 3 of 3", run(q("C1", { i: "w" }, { i: "w" }, { i: "f" })), "exclude");
  outcome("bad loss 2, win 1 nets 1", run(q("C1", { i: "w" }, { i: "w" }, { e: "w" })), "include");
  outcome("bad loss 3, win 1 nets 2", run(q("N1", { i: "w" }, { i: "w" }, { i: "w" })), "exclude");
  outcome("both bad is a tie", run(q("C1", { e: "w", i: "w" }, { e: "f", i: "w" }, { e: "w", i: "f" })), "include");
  outcome("D3 is re-sampled and counted", run(q("D3", { i: "w" }, { i: "w" })), "exclude");
  // clause 2: attributable drop (candidate = INCLUDED lower and a registry call; one true and one false pass)
  const drop = (inv, rwa = true) => ({ e: "c", i: "p", rwa, inv });
  outcome("drop 1 true of 3", run(q("C2", drop(true), null, null)), "include");
  outcome("drop 2 true", run(q("C2", drop(true), drop(true))), "exclude");
  outcome("drop 3 true", run(q("C2", drop(true), drop(true), drop(true))), "exclude");
  outcome("one true, one false", run(q("C2", drop(true), drop(false))), "include");
  const crowd = run(q("C2", drop(false), drop(false), drop(false)));
  outcome("three crowd-out, no registry", crowd, "include");
  eq("crowd-out reported", crowd.reported.crowdOut, ["C2:1", "C2:2", "C2:3"]);
  eq("three worse, none fired, listed", crowd.reported.unfiredQuestionsWithTwoOrMoreWorse, ["C2"]);
  // clause 3: wrong registry use
  outcome("wrong use 1", run(q("C3", { rwa: true, off: true })), "include");
  outcome("wrong use 2", run(q("C3", { rwa: true, off: true }, { rwa: true, off: true })), "exclude");
  outcome("off topic without a registry call", run(q("C3", { off: true }, { off: true }, { off: true })), "include");
  // candidate ordering
  const cand = (e, i, extra = {}) => run(q("N2", { e, i, rwa: true, inv: true, ...extra })).candidates.length;
  eq("partial under correct", cand("c", "p"), 1);
  eq("bad under partial", cand("p", "w"), 1);
  eq("bad under correct", cand("c", "f"), 1);
  eq("equal", [cand("c", "c"), cand("p", "p"), cand("w", "w")], [0, 0, 0]);
  eq("better", [cand("p", "c"), cand("w", "p"), cand("w", "c")], [0, 0, 0]);
  eq("no registry call", cand("c", "p", { rwa: false }), 0);
  eq("registry ran, call not seen", cand("c", "p", { rwa: false, ran: true }), 1);
  // triggers on different clauses or questions do not add
  outcome("one of each clause on one question", run(q("C1", { i: "w", rwa: true, off: true, inv: true })), "include");
  outcome("a wrong use on two questions", run({ ...q("C1", { rwa: true, off: true }), ...q("C2", { rwa: true, off: true }) }), "include");
  outcome("loss 1 plus drop 1 plus wrong 1 on three pairs", run(q("N3", { i: "w" }, { e: "c", i: "p", rwa: true, inv: true }, { rwa: true, off: true })), "include");
  // two complete pairs and one complete pair
  outcome("two complete, count 2", run(q("C1", drop(true), drop(true)), { missing: ["C1:3:included"] }), "exclude");
  outcome("two complete, count 1", run(q("C1", drop(true), null), { missing: ["C1:3:included"] }), "inconclusive");
  outcome("two complete, count 0", run({}, { missing: ["C1:3:excluded"] }), "include");
  outcome("two complete, one bad loss", run(q("N1", { i: "w" }), { missing: ["N1:3:included"] }), "inconclusive");
  outcome("one complete pair", run({}, { missing: ["D3:2:included", "D3:3:excluded"] }), "inconclusive");
  outcome("no complete pair", run({}, { missing: ["N2:1:included", "N2:2:included", "N2:3:included"] }), "inconclusive");
  // a fired clause is listed even when another question is inconclusive; the label follows result 1
  const both = run(q("C1", { i: "w" }, { i: "w" }), { missing: ["N2:1:included", "N2:2:included"] });
  outcome("fired plus inconclusive", both, "inconclusive");
  eq("fired listed", both.rule.firedClauses.length, 1);
  // carried D clauses, recomputed from result 1's verdicts
  eq("result 1 carried clauses hold", run().carried.holds, true);
  const r1With = (key, patch) => result1Verdicts.map((v) => (v.key === key ? { ...v, ...patch } : v));
  const bad = { correctness: "wrong", fabrication: false, offTopic: false };
  outcome("carried D2 loss", run({}, { r1: r1With("D2", { included: bad }) }), "exclude");
  outcome("carried D1 loss", run({}, { r1: r1With("D1", { included: bad, excluded: { correctness: "correct", fabrication: false, offTopic: false } }) }), "exclude");
  const d1loss = r1With("D1", { included: bad, excluded: { correctness: "correct", fabrication: false, offTopic: false } });
  outcome("carried D1 loss, D4 win", run({}, { r1: d1loss.map((v) => (v.key === "D4" ? { ...v, excluded: bad, included: { correctness: "correct", fabrication: false, offTopic: false } } : v)) }), "include");
  throws("carried verdicts lack D4", () => run({}, { r1: result1Verdicts.filter((v) => v.key !== "D4") }));
  // zero candidates is final; candidates without attributions are pending; an invalid verdict is inconclusive
  outcome("zero candidates is final", run(q("C1", { e: "c", i: "p" }), { attribute: false }), "include");
  outcome("candidates, no attributions", run(q("C1", drop(true)), { attribute: false }), "pending-attribution");
  outcome("invalid attribution", run(q("C1", drop("invalid"))), "inconclusive");
  outcome("true candidates, one invalid", run(q("C1", drop(true), drop("invalid"))), "inconclusive");

  // --- verdict validation and the grade hash --------------------------------------------------------
  const answers = answersFor({}, []);
  const pack = buildRetestPack({ answers, questions });
  const ok = verdictsFor(pack, {});
  eq("valid file", retestVerdictProblems(ok, pack.key), []);
  const withBad = (patch) => ok.map((v, n) => (n === 0 ? patch(v) : v));
  const refused = (label, verdicts) => { if (!retestVerdictProblems(verdicts, pack.key).length) throw new Error(`${label}: not refused`); };
  refused("missing deficiencies on partial", withBad((v) => ({ ...v, X: { correctness: "partial", fabrication: false, offTopic: false }, Y: v.Y })));
  refused("missing deficiencies on fabrication", withBad((v) => ({ ...v, X: { correctness: "correct", fabrication: true, offTopic: false } })));
  refused("empty list on wrong", withBad((v) => ({ ...v, Y: { correctness: "wrong", fabrication: false, offTopic: false, deficiencies: [] } })));
  refused("item names X", withBad((v) => ({ ...v, X: { correctness: "partial", fabrication: false, offTopic: false, deficiencies: ["it is worse than X in scope"] } })));
  refused("item names Y", withBad((v) => ({ ...v, Y: { correctness: "partial", fabrication: false, offTopic: false, deficiencies: ["Y omits the date"] } })));
  refused("unknown id", [...ok.slice(1), { ...ok[0], id: "ffffffffff" }]);
  refused("duplicate id", [...ok, ok[0]]);
  refused("missing verdict", ok.slice(1));
  refused("missing reason", withBad((v) => ({ ...v, reason: "" })));
  refused("bad correctness", withBad((v) => ({ ...v, X: { ...v.X, correctness: "great" } })));
  refused("deficiencies not a list", withBad((v) => ({ ...v, X: { ...v.X, deficiencies: "text" } })));
  if (retestVerdictProblems(withBad((v) => ({ ...v, X: { ...v.X, deficiencies: undefined } })), pack.key).length) throw new Error("a correct answer needs no list");
  // A completion pass may add deficiencies but no grade can move.
  const incomplete = withBad((v) => ({ ...v, X: { correctness: "partial", fabrication: false, offTopic: false } }));
  const completed = withBad((v) => ({ ...v, X: { correctness: "partial", fabrication: false, offTopic: false, deficiencies: ["a standalone deficiency"] } }));
  eq("hash ignores deficiencies", gradesHash(incomplete), gradesHash(completed));
  const moved = withBad((v) => ({ ...v, X: { correctness: "correct", fabrication: false, offTopic: false, deficiencies: [] } }));
  if (gradesHash(moved) === gradesHash(completed)) throw new Error("hash missed a changed grade");
  const reordered = [...completed].reverse();
  eq("hash is order independent", gradesHash(reordered), gradesHash(completed));
  const res = run(q("C1", drop(true)));
  if (!renderRetestMarkdown(res).includes("**Outcome: include.**")) throw new Error("render");
  console.log("selftest ok: re-test packing, balance, blinding, every clause, ordering, thresholds, carried clauses, validation");
}


if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    const flags = parseFlags(process.argv.slice(2));
    if (flags.retest) {
      if (flags.selftest) retestSelftest();
      else if (flags.pack) retestPackCli(flags);
      else if (flags.validate) retestValidateCli(flags);
      else if (flags.score) retestScoreCli(flags);
      else throw new Error("--retest needs one of --pack, --validate, --score, --selftest");
    } else if (flags.selftest) selftest();
    else if (flags.pack) packCli(flags);
    else if (flags.score) scoreCli(flags);
    else throw new Error("one of --pack, --score, --selftest");
  } catch (error) {
    console.error(`blind failed: ${error.message}`);
    process.exit(1);
  }
}
