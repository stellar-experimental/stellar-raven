#!/usr/bin/env node
/**
 * Item 4.1 step 1: choose the 24 rows every client answers.
 *
 * Usage: node select-rows.mjs <split.json> <out rows.json>
 *
 * Reads `sets.tuning` of the split only, asserts the file's SHA-256, orders the tuning ids by
 * sha256("np-4.1|" + id) ascending and keeps the first 24. No other field of anything is read.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { tuningIdsOf } from "../../../../../eval/qa/tuning-rows.mjs";

const SPLIT_SHA256 = "d5e56748dfdf2ce9";
const SEED = "np-4.1|";
const COUNT = 24;

const [splitPath, outPath] = process.argv.slice(2);
if (!splitPath || !outPath) {
  console.error("usage: node select-rows.mjs <split.json> <rows.json>");
  process.exit(2);
}
const bytes = readFileSync(splitPath);
const sha = createHash("sha256").update(bytes).digest("hex");
if (!sha.startsWith(SPLIT_SHA256)) throw new Error(`split SHA-256 ${sha} does not start with ${SPLIT_SHA256}`);
const split = JSON.parse(bytes.toString("utf8"));
const ids = tuningIdsOf({ sets: { tuning: split.sets.tuning } });
const key = (id) => createHash("sha256").update(SEED + id).digest("hex");
const chosen = [...ids].sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0)).slice(0, COUNT);
writeFileSync(outPath, `${JSON.stringify({ splitSha256: sha, seed: SEED, count: COUNT, ids: chosen }, null, 2)}\n`);
console.log(`splitSha256=${sha}\nwrote ${chosen.length} ids to ${outPath}`);
