#!/usr/bin/env node
/**
 * Round item 1.1: amend the QA split v3 into v4 by moving one named non-tuning case to the tuning
 * set, so the sls-033 cap can be removed from it. The authority is the orchestrator's answer in
 * QUESTION.md. Run by the executor in phase 1 with `--dry-run` only, and for real in phase 2.
 *
 *   node amend-split.mjs --dry-run   every check, counts and the would-be v4 SHA-256, no write
 *   node amend-split.mjs             the same, then writes v4 (mode 600, never overwrites)
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
import { AmendError, moveToTuning } from "../../../../../eval/qa/split-amend.mjs";

const V3_SHA256 = "ceb98d6a612aa2a85b48a20dac953f76b7e67f860092c61c84292dcb53434155";
const MOVED_ID = "q-tool-wallets-comparison";
const COUNTS_BEFORE = { tuning: 80, heldOut: 118, reserve: 49 };
const NOTE =
  "2026-11-17: round item 1.1: one non-tuning case moved to tuning for the sls-033 cap removal " +
  "(orchestrator answer in items/1.1/QUESTION.md)";

const BACKUPS = join(homedir(), "backups");
const V3_PATH = join(BACKUPS, "gca-2026-11-14-split-v3.json");
const V4_PATH = join(BACKUPS, "gca-2026-11-14-split-v4.json");
const CASES_PATH = fileURLToPath(new URL("../../../../../eval/qa/cases.json", import.meta.url));

const LINES = {
  usage: "usage: amend-split.mjs [--dry-run]",
  read: "check failed: a required input file could not be read",
  parse: "check failed: a required input file is not valid JSON",
  v3Hash: "check failed: the v3 split SHA-256 is not the recorded value",
  outExists: "check failed: the v4 split already exists; it is never overwritten",
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

  if (existsSync(V4_PATH)) throw new RunnerError("outExists");
  const v3Bytes = readBytes(V3_PATH);
  if (sha256(v3Bytes) !== V3_SHA256) throw new RunnerError("v3Hash");

  const split = parseJson(v3Bytes);
  const cases = parseJson(readBytes(CASES_PATH));
  const caseIds = (Array.isArray(cases?.cases) ? cases.cases : []).map((c) => c.id);

  const { split: v4, counts } = moveToTuning({
    split,
    movedId: MOVED_ID,
    allowedFrom: ["heldOut", "reserve"],
    countsBefore: COUNTS_BEFORE,
    caseIds,
    note: NOTE,
  });
  const out = Buffer.from(`${JSON.stringify(v4, null, 2)}\n`);

  if (!dryRun) {
    try {
      writeFileSync(V4_PATH, out, { flag: "wx", mode: 0o600 });
      chmodSync(V4_PATH, 0o600);
    } catch {
      throw new RunnerError("outExists");
    }
  }
  console.log(`counts: tuning ${counts.tuning}, heldOut ${counts.heldOut}, reserve ${counts.reserve}`);
  console.log(`${dryRun ? "dry run, nothing written; v4 SHA-256 would be" : "v4 SHA-256"}: ${sha256(out)}`);
}

try {
  main();
} catch (error) {
  const line = error instanceof AmendError || error instanceof RunnerError ? error.message : LINES.unexpected;
  console.error(`amend-split failed: ${line}`);
  process.exit(1);
}
