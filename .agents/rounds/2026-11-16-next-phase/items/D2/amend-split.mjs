#!/usr/bin/env node
/**
 * Round item D2, decision 2(b): amend the QA split v2 into v3 by moving the one held-out case whose
 * answer the orchestrator saw in the loop 2 read to the tuning set. Run once by the executor.
 *
 *   node amend-split.mjs --dry-run   every check, counts and the would-be v3 SHA-256, no write
 *   node amend-split.mjs             the same, then writes v3 (mode 600, never overwrites)
 *
 * The logic lives in eval/qa/split-amend.mjs and is tested in `npm test`. This runner does only
 * file I/O and hashes. It prints three counts and a SHA-256, or one fixed failure line; it never
 * prints an id, a question, a row field, a path read from a file, or an error message. Nobody
 * opens, prints, `head`s or `jq`s anything under ~/backups.
 */
import { createHash } from "node:crypto";
import { chmodSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { AmendError, amendSplit } from "../../../../../eval/qa/split-amend.mjs";

const V2_SHA256 = "697c550ae15400f5d7e8d9e47f4fd3d5460a6052d91571f5014ef4d35f64ed12";
const RESULTS_SHA256 = "1902171b4cd930459f4b3baf149cc20a2b581c0df5dc2ff28cd6c5405851f9d3";

const BACKUPS = join(homedir(), "backups");
const V2_PATH = join(BACKUPS, "gca-2026-11-14-split-v2.json");
const HELDOUT_DIR = join(BACKUPS, "heldout-2026-11-15");
const TARGET_PATH = join(HELDOUT_DIR, "exposed-row.sha256");
const RESULTS_PATH = join(HELDOUT_DIR, "results.json");
const RESULTS_SHA_PATH = join(HELDOUT_DIR, "results.sha256");
const V3_PATH = join(BACKUPS, "gca-2026-11-14-split-v3.json");
const CASES_PATH = fileURLToPath(new URL("../../../../../eval/qa/cases.json", import.meta.url));

const LINES = {
  usage: "usage: amend-split.mjs [--dry-run]",
  read: "check failed: a required input file could not be read",
  parse: "check failed: a required input file is not valid JSON",
  v2Hash: "check failed: the v2 split SHA-256 is not the recorded value",
  resultsHash: "check failed: the results file SHA-256 is not the recorded value",
  resultsShaFile: "check failed: results.sha256 does not record the same SHA-256 as the results file",
  outExists: "check failed: the v3 split already exists; it is never overwritten",
  unexpected: "check failed: unexpected error (message withheld)",
};

class RunnerError extends Error {
  constructor(key) {
    super(LINES[key]);
  }
}

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

function readBytes(path) {
  try {
    return readFileSync(path);
  } catch {
    throw new RunnerError("read");
  }
}

function parseJson(bytes) {
  try {
    return JSON.parse(bytes.toString("utf8"));
  } catch {
    throw new RunnerError("parse");
  }
}

function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--dry-run")) throw new RunnerError("usage");
  const dryRun = args.length === 1;

  const v2Bytes = readBytes(V2_PATH);
  if (sha256(v2Bytes) !== V2_SHA256) throw new RunnerError("v2Hash");
  const resultsBytes = readBytes(RESULTS_PATH);
  if (sha256(resultsBytes) !== RESULTS_SHA256) throw new RunnerError("resultsHash");
  const recorded = readBytes(RESULTS_SHA_PATH).toString("utf8").trim().match(/^([a-f0-9]{64})(\s|$)/);
  if (!recorded || recorded[1] !== RESULTS_SHA256) throw new RunnerError("resultsShaFile");
  const targetSha256 = readBytes(TARGET_PATH).toString("utf8");
  if (existsSync(V3_PATH)) throw new RunnerError("outExists");

  const split = parseJson(v2Bytes);
  const results = parseJson(resultsBytes);
  const cases = parseJson(readBytes(CASES_PATH));
  const caseIds = (Array.isArray(cases?.cases) ? cases.cases : []).map((c) => c.id);

  const { v3, counts } = amendSplit({ split, rows: results?.rows, targetSha256, caseIds });
  const out = Buffer.from(`${JSON.stringify(v3, null, 2)}\n`);

  if (!dryRun) {
    try {
      writeFileSync(V3_PATH, out, { flag: "wx", mode: 0o600 });
      chmodSync(V3_PATH, 0o600);
    } catch {
      throw new RunnerError("outExists");
    }
  }
  console.log(`counts: tuning ${counts.tuning}, heldOut ${counts.heldOut}, reserve ${counts.reserve}`);
  console.log(`${dryRun ? "dry run, nothing written; v3 SHA-256 would be" : "v3 SHA-256"}: ${sha256(out)}`);
}

try {
  main();
} catch (error) {
  const line = error instanceof AmendError || error instanceof RunnerError ? error.message : LINES.unexpected;
  console.error(`amend-split failed: ${line}`);
  process.exit(1);
}
