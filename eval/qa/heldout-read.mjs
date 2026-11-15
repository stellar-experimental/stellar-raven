#!/usr/bin/env node
/**
 * heldout-read.mjs — counting logic for the held-out read (eval/qa/heldout-read.sh).
 *
 *   node eval/qa/heldout-read.mjs plan <ids-file>
 *   node eval/qa/heldout-read.mjs summary <results.json> <stored-baseline.json> <ids-file> --planned <n>
 *
 * Both commands print counts and never an id: not in the output, not in an error. `plan` asserts that
 * the ids name distinct cases in the battery and that every one is active, so the job count the runner
 * will plan equals the id count, before any spend. `summary` selects rows by id before it reads any
 * other field, and pairs a row with the stored baseline only when both hold the same `caseInputSha256`.
 */
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { CASES_PATH, loadCases, partitionLifecycleCases } from "./lib.mjs";

export function parseIds(text) {
  return String(text)
    .split(/[\s,]+/)
    .map((id) => id.trim())
    .filter(Boolean);
}

/** Pre-spend plan check. Throws with counts only. */
export function planCheck(ids, cases) {
  if (ids.length === 0) throw new Error("the ids file holds no ids");
  const unique = new Set(ids);
  if (unique.size !== ids.length) throw new Error(`the ids file holds ${ids.length - unique.size} duplicate id(s)`);
  const selected = cases.filter((kase) => unique.has(kase.id));
  if (selected.length !== ids.length) {
    throw new Error(`${ids.length - selected.length} of ${ids.length} ids are not in the battery`);
  }
  const { active } = partitionLifecycleCases(selected);
  if (active.length !== ids.length) {
    throw new Error(`${ids.length - active.length} of ${ids.length} ids are quarantined; planned jobs would be ${active.length}`);
  }
  return active.length;
}

const RANK = { wrong: 0, partial: 1, correct: 2 };

function selectRows(file, idSet) {
  // Rows are selected by id first; nothing else of an unselected row is read.
  const rows = (file?.rows ?? []).filter((row) => idSet.has(row.id));
  return new Map(rows.map((row) => [row.id, row]));
}

/** Counts for one held-out collection against the stored baseline. Never returns an id. */
export function summarize({ results, baseline, ids, planned }) {
  const idSet = new Set(ids);
  const rows = selectRows(results, idSet);
  const base = selectRows(baseline, idSet);
  const counts = { correct: 0, partial: 0, wrong: 0, error: 0, unjudged: 0 };
  let coreCorrect = 0;
  let trapRows = 0;
  let trapPassed = 0;
  let paired = 0;
  let skipped = 0;
  let up = 0;
  let down = 0;
  let becameWrong = 0;
  let leftWrong = 0;
  for (const row of rows.values()) {
    const score = row.verdict?.score;
    if (score in counts && score !== "unjudged") counts[score] += 1;
    else counts[row.verdict ? "error" : "unjudged"] += 1;
    if (row.verdict?.coreAnswer === "correct") coreCorrect += 1;
    if (row.tags?.trap || row.caseInput?.tags?.trap) {
      trapRows += 1;
      if (score === "correct") trapPassed += 1;
    }
    const before = base.get(row.id);
    if (!before || !before.caseInputSha256 || before.caseInputSha256 !== row.caseInputSha256) {
      skipped += 1;
      continue;
    }
    const was = before.verdict?.score;
    if (!(was in RANK) || !(score in RANK)) {
      skipped += 1;
      continue;
    }
    paired += 1;
    if (RANK[score] > RANK[was]) up += 1;
    else if (RANK[score] < RANK[was]) down += 1;
    if (score === "wrong" && was !== "wrong") becameWrong += 1;
    if (was === "wrong" && score !== "wrong") leftWrong += 1;
  }
  return {
    planned,
    collected: rows.size,
    judged: rows.size - counts.unjudged - counts.error,
    costUsd: results?.meta?.totalCostUsd ?? null,
    counts,
    coreCorrect,
    trapRows,
    trapPassed,
    paired,
    skipped,
    up,
    down,
    becameWrong,
    leftWrong
  };
}

export function renderSummary(s) {
  const usd = typeof s.costUsd === "number" ? s.costUsd.toFixed(4) : "unknown";
  return [
    `jobs planned: ${s.planned}`,
    `jobs completed: ${s.collected} (judged ${s.judged})`,
    `cost USD: ${usd}`,
    `verdicts: correct ${s.counts.correct}, partial ${s.counts.partial}, wrong ${s.counts.wrong}, error ${s.counts.error}`,
    `core-answer-correct: ${s.coreCorrect} of ${s.collected}`,
    `trap rows passed (verdict correct): ${s.trapPassed} of ${s.trapRows}`,
    `paired against the stored baseline on ${s.paired} rows (${s.skipped} not paired: case input changed, absent, or ungraded): rows up ${s.up}, rows down ${s.down}, became wrong ${s.becameWrong}, left wrong ${s.leftWrong}`
  ].join("\n");
}

function main(argv) {
  const [command, ...rest] = argv;
  try {
    if (command === "plan") {
      const ids = parseIds(readFileSync(rest[0], "utf8"));
      console.log(String(planCheck(ids, loadCases(CASES_PATH).cases)));
      return 0;
    }
    if (command === "summary") {
      const [resultsPath, baselinePath, idsPath] = rest;
      const plannedAt = rest.indexOf("--planned");
      const planned = plannedAt >= 0 ? Number(rest[plannedAt + 1]) : NaN;
      const ids = parseIds(readFileSync(idsPath, "utf8"));
      if (!Number.isInteger(planned) || planned !== ids.length) throw new Error("planned job count does not equal the id count");
      const summary = summarize({
        results: JSON.parse(readFileSync(resultsPath, "utf8")),
        baseline: JSON.parse(readFileSync(baselinePath, "utf8")),
        ids,
        planned
      });
      console.log(renderSummary(summary));
      return 0;
    }
    throw new Error("usage: heldout-read.mjs plan <ids-file> | summary <results> <baseline> <ids-file> --planned <n>");
  } catch (error) {
    // The message is built from counts and fixed text only; it never carries an id.
    console.error(`heldout-read: ${error instanceof Error ? error.message : "failed"}`);
    return 2;
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) process.exit(main(process.argv.slice(2)));
