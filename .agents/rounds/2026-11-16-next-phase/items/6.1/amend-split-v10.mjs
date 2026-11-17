#!/usr/bin/env node
/**
 * Round item 6.1: amend split v9 into v10 by moving the one non-tuning case that the item lead
 * saw by accident in a repository-wide search (QUESTION.md). The authority is the orchestrator's
 * answer (option (a)), recorded in QUESTION.md ("Answer").
 *
 *   node amend-split-v10.mjs <exposure note> [--dry-run]
 *
 * The id never leaves this process. The runner collects every case id in the exposure note
 * (`tmp/6.1/EXPOSURE.md`, untracked) and requires exactly one of them to sit in heldOut or reserve
 * of v9. It moves that id with `moveToTuning`. Output: the counts, the number of cases outside
 * tuning that carry a `reverifyBy` and the earliest such date, and the v10 SHA-256, or one fixed
 * failure line. No id, path, or note text is printed.
 */
import { createHash } from "node:crypto";
import { chmodSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { AmendError, moveToTuning } from "../../../../../eval/qa/split-amend.mjs";

const V9_SHA256 = "0b6c9c04b59f5f49225df4c054df0a1117bfb8f179660147dde14887515c800c";
const COUNTS_V9 = { tuning: 91, heldOut: 111, reserve: 45 };
const NOTE =
  "2026-11-17: round item 6.1: one non-tuning case seen by the item lead in a repository-wide search " +
  "moved to tuning; identified by script from the lead's exposure note (orchestrator answer in " +
  "items/6.1/QUESTION.md)";
const ID_RE = /\bq-[a-z0-9]+(?:-[a-z0-9]+)+\b/g;

const BACKUPS = join(homedir(), "backups");
const V9_PATH = join(BACKUPS, "gca-2026-11-14-split-v9.json");
const V10_PATH = join(BACKUPS, "gca-2026-11-14-split-v10.json");
const CASES_PATH = fileURLToPath(new URL("../../../../../eval/qa/cases.json", import.meta.url));

const LINES = {
  usage: "usage: amend-split-v10.mjs <exposure note> [--dry-run]",
  read: "check failed: a required input file could not be read",
  parse: "check failed: a required input file is not valid JSON",
  v9Hash: "check failed: the v9 split SHA-256 is not the recorded value",
  outExists: "check failed: the v10 split already exists; it is never overwritten",
  notOne: "check failed: the exposure note does not name exactly one case outside tuning",
  amend: "check failed: the amendment library refused the move (message withheld)",
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

/** Every `reverifyBy` string anywhere in one case, without reading any other field's value. */
function reverifyDates(value, out = []) {
  if (Array.isArray(value)) for (const item of value) reverifyDates(item, out);
  else if (value && typeof value === "object") {
    for (const [key, inner] of Object.entries(value)) {
      if (key === "reverifyBy" && typeof inner === "string") out.push(inner);
      else reverifyDates(inner, out);
    }
  }
  return out;
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const notes = args.filter((a) => a !== "--dry-run");
  if (notes.length !== 1) throw new RunnerError("usage");

  if (existsSync(V10_PATH)) throw new RunnerError("outExists");
  const v9Bytes = readBytes(V9_PATH);
  if (sha256(v9Bytes) !== V9_SHA256) throw new RunnerError("v9Hash");
  const split = parseJson(v9Bytes);
  const outside = new Set([...(split.sets?.heldOut ?? []), ...(split.sets?.reserve ?? [])]);

  const text = readBytes(notes[0]).toString("utf8");
  const exposed = [...new Set([...text.matchAll(ID_RE)].map((m) => m[0]))].filter((id) => outside.has(id));
  if (exposed.length !== 1) throw new RunnerError("notOne");

  const corpus = parseJson(readBytes(CASES_PATH));
  const cases = Array.isArray(corpus?.cases) ? corpus.cases : [];
  const { split: v10, counts } = moveToTuning({
    split,
    movedId: exposed[0],
    allowedFrom: ["heldOut", "reserve"],
    countsBefore: COUNTS_V9,
    caseIds: cases.map((c) => c.id),
    note: NOTE,
  });

  // Counts only, for the TODO's held-out status: cases outside v10 tuning with a `reverifyBy`.
  const tuning = new Set(v10.sets.tuning);
  const dates = cases.filter((c) => !tuning.has(c.id)).map((c) => reverifyDates(c).sort()[0]).filter(Boolean);

  const out = Buffer.from(`${JSON.stringify(v10, null, 2)}\n`);
  if (!dryRun) {
    try {
      writeFileSync(V10_PATH, out, { flag: "wx", mode: 0o600 });
      chmodSync(V10_PATH, 0o600);
    } catch {
      throw new RunnerError("outExists");
    }
  }
  console.log(`counts: tuning ${counts.tuning}, heldOut ${counts.heldOut}, reserve ${counts.reserve}`);
  console.log(`outside tuning with a reverifyBy: ${dates.length}; earliest ${dates.sort()[0] ?? "none"}`);
  console.log(`${dryRun ? "dry run, nothing written; v10 SHA-256 would be" : "v10 SHA-256"}: ${sha256(out)}`);
}

try {
  main();
} catch (error) {
  const line =
    error instanceof RunnerError ? error.message : error instanceof AmendError ? LINES.amend : LINES.unexpected;
  console.error(`amend-split-v10 failed: ${line}`);
  process.exit(1);
}
