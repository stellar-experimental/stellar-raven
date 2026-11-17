#!/usr/bin/env node
/**
 * Step 1 of item 3.4: the only reader of the stored QA run files.
 *
 * Usage: node select-tuning.mjs <results-dir> <split.json> <out-dir>
 *
 * The split is read for `sets.tuning` only. Each run file's `rows` are selected by `id` with
 * `selectById` before any other row field is read, and each selection asserts the count in
 * EXPECTED below (a constant table, not the filter's own output). The output holds, per run,
 * `{ run, model, startedAt, rows }` with tuning rows only and no other `meta`. The script prints
 * each run file's name and SHA-256 and never prints an id or a count by set name. It writes
 * nothing under the results directory and runs no git command.
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { selectById, tuningIdsOf } from "../../../../../eval/qa/tuning-rows.mjs";

/** Tuning rows per run file under split v6, in file-name order (plan, "Facts re-checked"). */
const EXPECTED = [
  ["2026-11-14T06-06-31-variantA.json", 23],
  ["2026-11-14T20-13-51-variantA.json", 87],
  ["2026-11-14T22-18-17-variantA.json", 50],
  ["2026-11-14T23-04-27-variantA.json", 50],
  ["2026-11-14T23-27-33-variantA.json", 5],
  ["2026-11-14T23-30-06-variantA.json", 5],
  ["2026-11-14T23-33-28-variantA.json", 5],
  ["2026-11-15T00-32-53-variantA.json", 50],
  ["2026-11-15T04-31-41-variantA.json", 58],
  ["2026-11-15T05-28-42-variantA.json", 58],
  ["2026-11-15T05-38-45-variantA.json", 10],
  ["2026-11-15T05-45-31-variantA.json", 10],
  ["2026-11-15T07-33-40-variantA.json", 58],
  ["2026-11-15T08-55-41-variantA.json", 17],
  ["2026-11-15T09-08-35-variantA.json", 17]
];

const [resultsDir, splitPath, outDir] = process.argv.slice(2);
if (!resultsDir || !splitPath || !outDir) {
  console.error("usage: node select-tuning.mjs <results-dir> <split.json> <out-dir>");
  process.exit(2);
}

const split = JSON.parse(readFileSync(splitPath, "utf8"));
const ids = tuningIdsOf({ sets: { tuning: split.sets.tuning } });
mkdirSync(outDir, { recursive: true });

for (const [file, expected] of EXPECTED) {
  const bytes = readFileSync(path.join(resultsDir, file));
  const run = JSON.parse(bytes.toString("utf8"));
  const rows = selectById(run.rows, ids, expected, file);
  const out = {
    run: file.replace(/-variantA\.json$/, ""),
    model: run.meta?.model ?? run.model ?? null,
    startedAt: run.meta?.startedAt ?? run.startedAt ?? null,
    rows
  };
  writeFileSync(path.join(outDir, file), JSON.stringify(out));
  console.log(`${file}  sha256=${createHash("sha256").update(bytes).digest("hex")}  tuningRows=${rows.length}`);
}
