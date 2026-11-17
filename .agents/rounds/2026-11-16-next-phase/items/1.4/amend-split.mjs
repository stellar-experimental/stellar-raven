#!/usr/bin/env node
/**
 * Round item 1.4: amend the QA split v4 into v5 by moving the five non-tuning cases that items 2.1
 * and 2.2 must open and edit on their dated runs. The authority is the orchestrator's answer in
 * QUESTION.md (option 1).
 *
 *   node amend-split.mjs --dry-run   every check, counts and the would-be v5 SHA-256, no write
 *   node amend-split.mjs             the same, then writes v5 (mode 600, never overwrites)
 *
 * The move is `moveToTuning` from eval/qa/split-amend.mjs, applied once per id. The runner also
 * prints, as one count, how many `scheduled` cases stay outside tuning in v5 (the orchestrator
 * asked for it by count). It reads `tags.freshness` of a case selected by id from the v5 non-tuning
 * sets and nothing else of those rows. It prints counts and a SHA-256, or one fixed failure line;
 * never an id, a question, a row field, or an error message.
 */
import { createHash } from "node:crypto";
import { chmodSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { AmendError, moveToTuning } from "../../../../../eval/qa/split-amend.mjs";

const V4_SHA256 = "58ad28bb903fcd7c72122de4ca13f93438a42b92a6987dcbce7d6c3f8096c191";
const MOVED_IDS = [
  "q-edge-fresh-latest-protocol-version",
  "q-pc-protocol-upgrade-timing",
  "q-infra-software-versions-current-protocol",
  "q-hist-quantum-preparedness-plan",
  "q-scf-current-round",
];
const COUNTS_V4 = { tuning: 81, heldOut: 117, reserve: 49 };
const NOTE =
  "2026-11-17: round item 1.4: five non-tuning scheduled cases moved to tuning so the dated golden " +
  "runs (items 2.1 and 2.2) can open and edit them (orchestrator answer in items/1.4/QUESTION.md)";

const BACKUPS = join(homedir(), "backups");
const V4_PATH = join(BACKUPS, "gca-2026-11-14-split-v4.json");
const V5_PATH = join(BACKUPS, "gca-2026-11-14-split-v5.json");
const CASES_PATH = fileURLToPath(new URL("../../../../../eval/qa/cases.json", import.meta.url));

const LINES = {
  usage: "usage: amend-split.mjs [--dry-run]",
  read: "check failed: a required input file could not be read",
  parse: "check failed: a required input file is not valid JSON",
  v4Hash: "check failed: the v4 split SHA-256 is not the recorded value",
  outExists: "check failed: the v5 split already exists; it is never overwritten",
  total: "check failed: the v5 split is not 86 tuning and 161 outside tuning",
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

  if (existsSync(V5_PATH)) throw new RunnerError("outExists");
  const v4Bytes = readBytes(V4_PATH);
  if (sha256(v4Bytes) !== V4_SHA256) throw new RunnerError("v4Hash");

  let split = parseJson(v4Bytes);
  const corpus = parseJson(readBytes(CASES_PATH));
  const cases = Array.isArray(corpus?.cases) ? corpus.cases : [];
  const caseIds = cases.map((c) => c.id);

  const amendedBefore = split.amended;
  let counts = COUNTS_V4;
  for (const movedId of MOVED_IDS) {
    ({ split, counts } = moveToTuning({ split, movedId, allowedFrom: ["heldOut", "reserve"], countsBefore: counts, caseIds, note: NOTE }));
  }
  // One note for the whole amendment, not one per move.
  split.amended = amendedBefore.length > 0 ? `${amendedBefore}; ${NOTE}` : NOTE;
  if (counts.tuning !== 86 || counts.heldOut + counts.reserve !== 161) throw new RunnerError("total");

  const outside = new Set([...split.sets.heldOut, ...split.sets.reserve]);
  const scheduledOutside = cases.filter((c) => outside.has(c.id)).filter((c) => c.tags?.freshness === "scheduled").length;

  const out = Buffer.from(`${JSON.stringify(split, null, 2)}\n`);
  if (!dryRun) {
    try {
      writeFileSync(V5_PATH, out, { flag: "wx", mode: 0o600 });
      chmodSync(V5_PATH, 0o600);
    } catch {
      throw new RunnerError("outExists");
    }
  }
  console.log(`counts: tuning ${counts.tuning}, heldOut ${counts.heldOut}, reserve ${counts.reserve}`);
  console.log(`scheduled cases outside tuning in v5: ${scheduledOutside}`);
  console.log(`${dryRun ? "dry run, nothing written; v5 SHA-256 would be" : "v5 SHA-256"}: ${sha256(out)}`);
}

try {
  main();
} catch (error) {
  const line = error instanceof AmendError || error instanceof RunnerError ? error.message : LINES.unexpected;
  console.error(`amend-split failed: ${line}`);
  process.exit(1);
}
