#!/usr/bin/env node
/**
 * Round item 6.2: blind packets for the two judges, and the un-blinded scoring (PLAN.md steps 5, 6).
 *
 *   node blind.mjs --pack --opus-dir <dir> --fable-dir <dir> [--answers-dir tmp/6.2] [--key tmp/6.2/blind-key.json]
 *   node blind.mjs --score --verdicts opus=<verdicts.json> --verdicts fable=<verdicts.json>
 *                          [--answers-dir tmp/6.2] [--key tmp/6.2/blind-key.json] [--out tmp/6.2/score]
 *   node blind.mjs --selftest            offline check on synthetic answers; writes nothing durable
 *
 * `--pack` writes `packet.json` and `RUBRIC.md` into each judge directory. A packet entry carries an
 * opaque pair id, the question, the reference URLs and, for X and Y, the answer text, the tool-call
 * list (tool, search query, operation ids) and the deduplicated result URLs. No arm, question key,
 * file name, timestamp, cost, token count or model name enters a packet. X and Y are assigned by a
 * random bit from `crypto.randomInt` and stored only in the key file. Judges: Claude Opus 5.5 grades
 * the Sonnet and Fable comparisons, Claude Fable grades the Opus comparison.
 */
import { randomBytes, randomInt } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = new URL(".", import.meta.url);
export const CLIENTS = ["claude-fable-5-2", "claude-opus-5-5", "claude-sonnet-5-5"];
export const RULE_KEYS = ["L1", "L2", "N1", "N2", "N3", "N4"];
const JUDGE_OF = { "claude-sonnet-5-5": "opus", "claude-fable-5-2": "opus", "claude-opus-5-5": "fable" };
const CORRECTNESS = ["correct", "partial", "wrong"];

export const RUBRIC = `# Rubric (fixed before any answer existed)

You grade pairs of answers to the same question about the Stellar ecosystem. Each pair has answer X
and answer Y, in no meaningful order. You do not know how either was produced. Judge each answer on
its own, then write one line per pair.

Read only \`packet.json\` in this directory. Fetch any live page you need (WebFetch or curl); the
reference pages in each pair are the live developers.stellar.org pages. Do not read any other file on
this machine and do not start subagents.

Per answer:

- \`correctness\`:
  - \`correct\`: every material claim agrees with the reference pages and the question is answered;
  - \`partial\`: right but missing a material part, or one minor error;
  - \`wrong\`: a material claim contradicts the reference pages, or the question is not answered.
- \`fabrication\`: \`true\` when the answer states a specific identifier, number, API name, table name
  or URL that none of these supports: the reference pages, the pages the answer itself cites, the
  \`resultUrls\` listed for it. Fetch what you need before marking it; otherwise \`false\`.

When a pair lists no reference pages (\`referenceUrls\` is empty), apply this instead of the reference
comparison: the answer is \`wrong\` when it claims to have produced an exhaustive or multi-hour
report, names a protocol you cannot confirm on the web as a Stellar protocol, or gives a figure with
no cited source; otherwise \`correct\` or \`partial\` by coverage.

Grounding (whether tool use supported the claims) is not judged. Do not infer anything from the order
X, Y, from the tool-call list, or from length.

Write \`verdicts.json\` in this directory:

\`\`\`json
{ "verdicts": [ { "id": "<pair id>", "X": { "correctness": "correct|partial|wrong", "fabrication": false },
                  "Y": { "correctness": "correct|partial|wrong", "fabrication": false }, "reason": "one line" } ] }
\`\`\`

Every pair id in the packet needs exactly one verdict. Then report the path with \`hc send\`.
`;

/** Parse a JSONL file; missing file gives []. */
function readJsonl(path) {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
}

export function loadAnswers(dir) {
  const out = {};
  for (const client of CLIENTS) {
    out[client] = { hold: readJsonl(join(dir, `answers-hold-${client}.jsonl`)), fresh: readJsonl(join(dir, `answers-fresh-${client}.jsonl`)) };
  }
  return out;
}

const byKey = (rows) => Object.fromEntries(rows.map((r) => [r.key, r]));

function packetSide(run) {
  return {
    answer: run.answer,
    toolCalls: run.calls.map((c) => {
      const call = { tool: c.tool };
      if (c.query !== undefined) call.query = c.query;
      if (c.ops !== undefined) call.ops = c.ops;
      return call;
    }),
    resultUrls: run.resultUrls,
  };
}

/**
 * Pure: pairs every (client, question) both arms answered, assigns X and Y by `rng(2)`, gives each an
 * opaque id and shuffles. Returns the key (private) and one packet per judge.
 */
export function buildPacks({ answers, questions, rng = randomInt, newId = () => randomBytes(5).toString("hex") }) {
  const key = {};
  const entries = [];
  for (const client of CLIENTS) {
    const hold = byKey(answers[client].hold);
    const fresh = byKey(answers[client].fresh);
    for (const q of questions) {
      const h = hold[q.key];
      const f = fresh[q.key];
      if (!h?.answered || !f?.answered) continue;
      let id = newId();
      while (key[id]) id = newId();
      const freshIsX = rng(2) === 1;
      key[id] = { client, key: q.key, X: freshIsX ? "fresh" : "hold" };
      entries.push({
        judge: JUDGE_OF[client],
        entry: {
          id,
          question: q.question,
          referenceUrls: q.referenceUrls,
          X: packetSide(freshIsX ? f : h),
          Y: packetSide(freshIsX ? h : f),
        },
      });
    }
  }
  for (let i = entries.length - 1; i > 0; i -= 1) {
    const j = rng(i + 1);
    [entries[i], entries[j]] = [entries[j], entries[i]];
  }
  const packets = { opus: [], fable: [] };
  for (const { judge, entry } of entries) packets[judge].push(entry);
  return { key, packets };
}

const sum = (xs) => xs.reduce((a, b) => a + b, 0);
const opsOf = (run) => run.calls.flatMap((c) => c.ops ?? []);
const docsOps = (run) => opsOf(run).filter((o) => o.startsWith("stellarDocs."));

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
  };
}

const isBad = (v) => v.correctness === "wrong" || v.fabrication === true;

function validateVerdicts(verdictsByJudge, key) {
  const seen = new Set();
  const byId = {};
  for (const [judge, verdicts] of Object.entries(verdictsByJudge)) {
    for (const v of verdicts) {
      if (!key[v.id]) throw new Error(`verdict for an unknown pair id (${judge})`);
      if (JUDGE_OF[key[v.id].client] !== judge) throw new Error(`pair graded by the wrong judge (${judge})`);
      if (seen.has(v.id)) throw new Error("duplicate verdict");
      for (const side of ["X", "Y"]) {
        if (!CORRECTNESS.includes(v[side]?.correctness) || typeof v[side]?.fabrication !== "boolean") {
          throw new Error(`invalid verdict fields for ${side}`);
        }
      }
      if (typeof v.reason !== "string" || !v.reason.trim()) throw new Error("verdict needs a reason");
      seen.add(v.id);
      byId[v.id] = { ...v, judge };
    }
  }
  for (const id of Object.keys(key)) if (!byId[id]) throw new Error("a packed pair has no verdict");
  return byId;
}

/** Pure scoring: un-blinds, applies the pre-registered outcome, attribution, reach and rule. */
export function score({ answers, questions, key, verdictsByJudge }) {
  const verdictById = validateVerdicts(verdictsByJudge, key);
  const verdictOfPair = {};
  for (const [id, meta] of Object.entries(key)) {
    const v = verdictById[id];
    const hold = meta.X === "hold" ? v.X : v.Y;
    const fresh = meta.X === "fresh" ? v.X : v.Y;
    verdictOfPair[`${meta.client}|${meta.key}`] = { hold, fresh, reason: v.reason, judge: v.judge };
  }

  const pairs = [];
  for (const client of CLIENTS) {
    const hold = byKey(answers[client].hold);
    const fresh = byKey(answers[client].fresh);
    for (const q of questions) {
      const h = hold[q.key];
      const f = fresh[q.key];
      const pair = { client, key: q.key, rule: RULE_KEYS.includes(q.key) };
      const missing = !h?.answered || !f?.answered;
      if (missing) {
        Object.assign(pair, {
          outcome: "tie",
          missing: true,
          holdFailure: h?.answered ? null : (h?.failureClass ?? "not-run"),
          freshFailure: f?.answered ? null : (f?.failureClass ?? "not-run"),
          attributable: false,
        });
      } else {
        const v = verdictOfPair[`${client}|${q.key}`];
        const hb = isBad(v.hold);
        const fb = isBad(v.fresh);
        const outcome = fb && !hb ? "loss" : hb && !fb ? "win" : "tie";
        let attributable = false;
        let rEmpty = false;
        if (outcome === "loss") {
          if (q.referencePaths.length === 0) {
            const used = (run) => opsOf(run).some((o) => o.startsWith("scout.") || o.startsWith("lumenloop."));
            attributable = used(h) && !used(f);
          } else {
            const R = new Set(h.calls.filter((c) => c.referencePathsInResult.length > 0).flatMap((c) => (c.ops ?? []).filter((o) => o.startsWith("stellarDocs."))));
            rEmpty = R.size === 0;
            const freshNamesR = opsOf(f).some((o) => R.has(o));
            const freshReached = f.calls.some((c) => c.referencePathsInResult.length > 0);
            attributable = !freshNamesR && !freshReached;
          }
        }
        Object.assign(pair, {
          outcome,
          missing: false,
          holdGrade: v.hold,
          freshGrade: v.fresh,
          reason: v.reason,
          judge: v.judge,
          attributable,
          rEmpty,
          correctVsPartial: v.hold.correctness !== v.fresh.correctness && !hb && !fb,
        });
      }
      const reach = (run) => (run ? { docsOpCalled: docsOps(run).length > 0, referenceReached: run.calls.some((c) => c.referencePathsInResult.length > 0) } : null);
      pair.reach = { hold: reach(h), fresh: reach(f) };
      pairs.push(pair);
    }
  }

  const keys = questions.map((q) => q.key);
  const stats = {};
  for (const client of CLIENTS) {
    stats[client] = { hold: runStats(answers[client].hold, keys), fresh: runStats(answers[client].fresh, keys) };
  }

  const count = (list, o) => list.filter((p) => p.outcome === o).length;
  const net = (list) => count(list, "loss") - count(list, "win");
  const rulePairs = pairs.filter((p) => p.rule);
  const missingAll = pairs.filter((p) => p.missing).length;
  const missingRule = rulePairs.filter((p) => p.missing).length;
  const holdUnanswered = sum(CLIENTS.map((c) => stats[c].hold.unanswered));
  const freshUnanswered = sum(CLIENTS.map((c) => stats[c].fresh.unanswered));
  const inconclusiveReasons = [];
  if (missingAll > 3) inconclusiveReasons.push(`${missingAll} of 30 pairs missing (more than 3)`);
  if (missingRule > 2) inconclusiveReasons.push(`${missingRule} of 18 rule pairs missing (more than 2)`);
  if (freshUnanswered - holdUnanswered >= 3) inconclusiveReasons.push(`FRESH has ${freshUnanswered - holdUnanswered} more unanswered runs than HOLD (3 or more)`);

  const triggers = [];
  if (net(rulePairs) >= 2) triggers.push(`1: rule pairs FRESH losses - wins = ${net(rulePairs)} (>= 2)`);
  const perClient = {};
  for (const client of CLIENTS) {
    const own = pairs.filter((p) => p.client === client);
    perClient[client] = { losses: count(own, "loss"), wins: count(own, "win"), ties: count(own, "tie"), net: net(own) };
    if (net(own) >= 2) triggers.push(`2a: ${client} over all 10 pairs, losses - wins = ${net(own)} (>= 2)`);
  }
  const attributable = pairs.filter((p) => p.attributable);
  for (const p of attributable) triggers.push(`2b: attributable FRESH loss, ${p.client} ${p.key}`);

  const outcome = inconclusiveReasons.length ? "inconclusive" : triggers.length ? "hold" : "absorb";
  return {
    pairs,
    stats,
    rule: {
      outcome,
      inconclusiveReasons,
      triggers,
      rulePairsLosses: count(rulePairs, "loss"),
      rulePairsWins: count(rulePairs, "win"),
      rulePairsNet: net(rulePairs),
      perClient,
      missingAll,
      missingRule,
      holdUnanswered,
      freshUnanswered,
    },
  };
}

export function renderMarkdown(result) {
  const L = [];
  const f = (o) => Object.entries(o).map(([k, v]) => `${k} ${v}`).join(", ") || "none";
  L.push("### Runs per client and arm", "", "| Client | Arm | Answered | Failures by class | Calls | Turns | Input tok | Output tok | Cache read tok | Cache create tok | Cost USD |", "|---|---|---|---|---|---|---|---|---|---|---|");
  for (const [client, arms] of Object.entries(result.stats)) {
    for (const arm of ["hold", "fresh"]) {
      const s = arms[arm];
      L.push(`| ${client} | ${arm} | ${s.answered}/10 | ${f(s.failures)} | ${s.calls} | ${s.turns} | ${s.inputTokens} | ${s.outputTokens} | ${s.cacheReadTokens} | ${s.cacheCreationTokens} | ${s.costUsd} |`);
    }
  }
  const g = (x) => (x ? `${x.correctness}${x.fabrication ? "+fab" : ""}` : "-");
  const reach = (r) => (r ? `${r.docsOpCalled ? "docs" : "-"}/${r.referenceReached ? "ref" : "-"}` : "-");
  L.push("", "### Pairs", "", "| Client | Q | Rule | Outcome | HOLD grade | FRESH grade | Attributable | Reach HOLD | Reach FRESH | Judge reason |", "|---|---|---|---|---|---|---|---|---|---|");
  for (const p of result.pairs) {
    const note = p.missing ? `missing (HOLD ${p.holdFailure ?? "answered"}, FRESH ${p.freshFailure ?? "answered"})` : p.reason.replace(/\|/g, "/");
    L.push(`| ${p.client} | ${p.key} | ${p.rule ? "yes" : "no"} | ${p.outcome} | ${g(p.holdGrade)} | ${g(p.freshGrade)} | ${p.attributable ? `yes${p.rEmpty ? " (R empty)" : ""}` : "no"} | ${reach(p.reach.hold)} | ${reach(p.reach.fresh)} | ${note} |`);
  }
  const r = result.rule;
  L.push("", "### Rule", "", `- Rule pairs (18): FRESH losses ${r.rulePairsLosses}, wins ${r.rulePairsWins}, net ${r.rulePairsNet}.`);
  for (const [c, v] of Object.entries(r.perClient)) L.push(`- ${c}, 10 pairs: losses ${v.losses}, wins ${v.wins}, ties ${v.ties}, net ${v.net}.`);
  L.push(`- Missing pairs: ${r.missingAll} of 30 (${r.missingRule} of 18 rule pairs). Unanswered runs: HOLD ${r.holdUnanswered}, FRESH ${r.freshUnanswered}.`);
  L.push(`- Inconclusive clause: ${r.inconclusiveReasons.join("; ") || "not triggered"}.`);
  L.push(`- Hold triggers: ${r.triggers.join("; ") || "none"}.`);
  L.push(`- **Outcome: ${r.outcome}.**`);
  return `${L.join("\n")}\n`;
}

// --- CLI ---------------------------------------------------------------------------------------

function parseFlags(argv) {
  const flags = { verdicts: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (["--pack", "--score", "--selftest"].includes(a)) flags[a.slice(2)] = true;
    else if (a === "--verdicts") flags.verdicts.push(argv[(i += 1)]);
    else if (["--opus-dir", "--fable-dir", "--answers-dir", "--key", "--out"].includes(a)) flags[a.slice(2).replace(/-(\w)/g, (_, c) => c.toUpperCase())] = argv[(i += 1)];
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
  const answersDir = flags.answersDir ?? "tmp/6.2";
  const keyPath = flags.key ?? join(answersDir, "blind-key.json");
  if (existsSync(keyPath)) throw new Error("the key file exists; packing twice would re-randomize");
  const { key, packets } = buildPacks({ answers: loadAnswers(answersDir), questions: readQuestions() });
  for (const [judge, dir] of [["opus", flags.opusDir], ["fable", flags.fableDir]]) {
    if (!dir) throw new Error(`--${judge}-dir is required`);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "packet.json"), `${JSON.stringify({ pairs: packets[judge] }, null, 2)}\n`);
    writeFileSync(join(dir, "RUBRIC.md"), RUBRIC);
  }
  writePrivate(keyPath, `${JSON.stringify(key, null, 2)}\n`);
  console.log(`packed: opus ${packets.opus.length} pairs, fable ${packets.fable.length} pairs`);
}

function scoreCli(flags) {
  const answersDir = flags.answersDir ?? "tmp/6.2";
  const key = JSON.parse(readFileSync(flags.key ?? join(answersDir, "blind-key.json"), "utf8"));
  const verdictsByJudge = {};
  for (const spec of flags.verdicts) {
    const [judge, path] = spec.split("=");
    if (!JUDGE_OF[CLIENTS[0]] || !["opus", "fable"].includes(judge)) throw new Error("--verdicts takes opus=<path> or fable=<path>");
    verdictsByJudge[judge] = JSON.parse(readFileSync(path, "utf8")).verdicts;
  }
  const result = score({ answers: loadAnswers(answersDir), questions: readQuestions(), key, verdictsByJudge });
  const out = flags.out ?? join(answersDir, "score");
  writeFileSync(`${out}.json`, `${JSON.stringify(result, null, 2)}\n`);
  writeFileSync(`${out}.md`, renderMarkdown(result));
  console.log(`scored: outcome ${result.rule.outcome}; wrote ${out}.json and ${out}.md`);
}

// --- offline self-check on synthetic answers -----------------------------------------------------

function selftest() {
  const questions = readQuestions();
  const mk = (key, { answered = true, ops = ["stellarDocs.search_docs"], ref = true, answer = `synthetic answer ${key}` } = {}) => ({
    key, answered, answer: answered ? answer : "", failureClass: answered ? null : "transport", runCostUsd: 1, turns: 3, usage: { input_tokens: 10, output_tokens: 5 },
    calls: [{ tool: "execute", ops, isError: false, resultUrls: ref ? ["https://example.test/x"] : [], referencePathsInResult: ref ? ["/docs/p"] : [] }],
    resultUrls: ref ? ["https://example.test/x"] : [],
  });
  const answers = {};
  for (const client of CLIENTS) {
    answers[client] = { hold: questions.map((q) => mk(q.key)), fresh: questions.map((q) => mk(q.key, { ops: ["stellarDocs.other"], ref: false })) };
  }
  answers["claude-opus-5-5"].fresh[2] = mk("N1", { answered: false });
  const { key, packets } = buildPacks({ answers, questions, rng: randomInt });
  const ids = Object.keys(key);
  // Question text is real text (F4 says "hold"); everything else in a packet must be arm-neutral.
  const serialized = JSON.stringify(packets, (k, v) => (k === "question" ? undefined : v));
  if (ids.length !== 29 || packets.opus.length !== 20 || packets.fable.length !== 9) throw new Error("pack counts");
  for (const forbidden of ["hold", "fresh", "claude-", "runCostUsd", "startedAt", "\"key\""]) {
    if (serialized.includes(forbidden)) throw new Error(`packet leaks ${forbidden}`);
  }
  if (new Set(ids).size !== ids.length) throw new Error("pair ids not unique");
  // A judge that marks every FRESH answer wrong and every HOLD answer correct.
  const verdict = (judge) => packets[judge].map((p) => {
    const freshIsX = key[p.id].X === "fresh";
    const bad = { correctness: "wrong", fabrication: false };
    const good = { correctness: "correct", fabrication: false };
    return { id: p.id, X: freshIsX ? bad : good, Y: freshIsX ? good : bad, reason: "synthetic" };
  });
  const result = score({ answers, questions, key, verdictsByJudge: { opus: verdict("opus"), fable: verdict("fable") } });
  const losses = result.pairs.filter((p) => p.outcome === "loss").length;
  if (losses !== 29 || result.pairs.filter((p) => p.missing).length !== 1) throw new Error("score counts");
  // Synthetic HOLD reached a reference path through stellarDocs.search_docs and FRESH did not; L2 has
  // no reference pages and neither synthetic run called scout or lumenloop, so L2 is not attributable.
  if (!result.pairs.filter((p) => p.outcome === "loss").every((p) => p.attributable === (p.key !== "L2"))) throw new Error("attribution");
  if (result.rule.outcome !== "hold") throw new Error("rule outcome");
  // A missing verdict and a wrong judge are refused.
  let refused = 0;
  try { score({ answers, questions, key, verdictsByJudge: { opus: verdict("opus").slice(1), fable: verdict("fable") } }); } catch { refused += 1; }
  try { score({ answers, questions, key, verdictsByJudge: { opus: verdict("fable"), fable: verdict("opus") } }); } catch { refused += 1; }
  if (refused !== 2) throw new Error("validation");
  if (!renderMarkdown(result).includes("**Outcome: hold.**")) throw new Error("render");
  console.log("selftest ok: 29 pairs packed, blinded, scored; 1 missing pair; refusals work");
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
