#!/usr/bin/env node
/**
 * Sibling scan for a dated golden run (round items 2.1 and 2.2). It tells the lane which siblings
 * it may open, and counts the pending-state wording it may not look at.
 *
 *   node sibling-check.mjs --run <2.1|2.2a|2.2c> --split <path to the split file>
 *
 * The pool is every member of each register entry that holds a case the run edits, plus every case
 * whose judge-facing text (question, answer, key facts, avoid, notes) matches the run's pattern
 * set. The split is read for `sets.tuning` only.
 *
 * Output:
 * - stdout lines: the ids of the pool the lane may open (tuning, the six dated cases and the one
 *   staged sibling), each with whether it matches the strict pending-state test;
 * - the last line, the only one safe to commit: the number of strict matches among the pool cases
 *   the lane may not open.
 * It prints no other count and never the id of a case the lane may not open. Errors are one fixed
 * line with no case data.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tuningIdsOf } from "../../../../../../eval/qa/tuning-rows.mjs";

const DATED = [
  "q-edge-fresh-latest-protocol-version",
  "q-pc-protocol-upgrade-timing",
  "q-protocol-version-history-list",
  "q-infra-software-versions-current-protocol",
  "q-hist-quantum-preparedness-plan",
  "q-scf-current-round",
];
const STAGED_SIBLING = "q-pc-quantum-preparedness-dormant";

const BELL_POOL = /\bP29\b|\bP30\b|Protocol 29|Protocol 30|\bBell\b|2026-11-23|(?:current|latest) protocol|CAP-008[478]/i;
const BELL_PENDING = new RegExp(
  [
    String.raw`(?:Bell|Protocol 30|\bP30\b)[^.]{0,160}(?:not yet|scheduled|pending|upcoming|vote|Testnet only)`,
    String.raw`(?:not yet|scheduled|pending|upcoming)[^.]{0,160}(?:Bell|Protocol 30|\bP30\b)`,
    String.raw`(?:current|latest)[^.]{0,40}(?:Protocol 29|\bP29\b)`,
    String.raw`(?:Protocol 29|\bP29\b)[^.]{0,40}(?:current|latest)`,
    String.raw`runs? (?:Protocol 29|\bP29\b)`,
  ].join("|"),
  "i",
);
const RUNS = {
  "2.1": {
    edited: DATED.slice(0, 3).concat("q-hist-quantum-preparedness-plan"),
    pool: BELL_POOL,
    pending: BELL_PENDING,
    staged: true,
  },
  "2.2a": {
    edited: ["q-infra-software-versions-current-protocol"],
    pool: /\bv?(?:2[789]|30)\.\d+\.\d+\b|Protocol (?:29|30)\b|software versions/i,
    pending: /(?:current|latest|recommended)[^.]{0,80}(?:\b29\.\d+\.\d+|Protocol 29)|\b29\.\d+\.\d+[^.]{0,60}(?:current|latest)/i,
    staged: false,
  },
  "2.2c": {
    edited: ["q-scf-current-round"],
    pool: /SCF #4[4-7]\b|Initial Review|Panel Review|Deadline to submit|Community Vote/i,
    pending: /SCF #46[^.]{0,80}(?:Initial Review|Panel Review|in progress|currently)|(?:currently|current round|in progress)[^.]{0,80}SCF #46/i,
    staged: false,
  },
};

const FAIL = {
  usage: "usage: sibling-check.mjs --run <2.1|2.2a|2.2c> --split <path>",
  read: "check failed: a required input file could not be read or parsed",
  split: "check failed: the split file does not list the expected tuning rows",
  unexpected: "check failed: unexpected error (message withheld)",
};

class CheckError extends Error {}
const fail = (key) => {
  throw new CheckError(FAIL[key]);
};

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fail("read");
  }
}

const judgeText = (c) => JSON.stringify([c.question, c.golden?.answer, c.golden?.keyFacts, c.golden?.avoid, c.golden?.notes]);

function main() {
  const args = process.argv.slice(2);
  const run = RUNS[args[args.indexOf("--run") + 1]];
  const splitPath = args[args.indexOf("--split") + 1];
  if (!run || !splitPath || args.length !== 4) fail("usage");

  let tuning;
  try {
    tuning = new Set(tuningIdsOf(readJson(splitPath)));
  } catch (error) {
    if (error instanceof CheckError) throw error;
    fail("split");
  }
  const register = readJson(fileURLToPath(new URL("../../../../../../eval/qa/consistency-register.json", import.meta.url)));
  const cases = readJson(fileURLToPath(new URL("../../../../../../eval/qa/cases.json", import.meta.url))).cases ?? [];

  const edited = new Set(run.edited);
  const pool = new Set();
  const groups = [
    ...(register.clusters?.entries ?? []).map((e) => e.members),
    ...(register.dateContingentTraps?.entries ?? []).map((e) => e.caseIds),
    ...(register.numericInvariants?.entries ?? []).map((e) => e.affectedCaseIds),
  ];
  for (const ids of groups) if (ids?.some((id) => edited.has(id))) for (const id of ids) pool.add(id);
  for (const c of cases) if (run.pool.test(judgeText(c))) pool.add(c.id);
  if (run.staged) pool.add(STAGED_SIBLING);
  for (const id of edited) pool.delete(id);

  const alwaysOpenable = new Set([...DATED, ...(run.staged ? [STAGED_SIBLING] : [])]);
  const openable = [];
  let closedMatches = 0;
  for (const c of cases) {
    if (!pool.has(c.id)) continue;
    const matches = run.pending.test(judgeText(c));
    if (tuning.has(c.id) || alwaysOpenable.has(c.id)) openable.push(`${c.id} ${matches ? "matches the strict pending-state test" : "no strict match"}`);
    else if (matches) closedMatches += 1;
  }
  console.log(`openable siblings for run ${args[args.indexOf("--run") + 1]} (open these only; never print or commit this list):`);
  for (const line of openable.sort()) console.log(`  ${line}`);
  console.log(`pending-state matches among the cases this lane may not open: ${closedMatches}`);
}

try {
  main();
} catch (error) {
  console.error(`sibling-check failed: ${error instanceof CheckError ? error.message : FAIL.unexpected}`);
  process.exit(1);
}
