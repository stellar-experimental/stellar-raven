#!/usr/bin/env node
/**
 * Round item 5.1: amend split v7 into v8 by moving the one non-tuning case that lists the removed
 * operation in its `surface` and that the item lead saw by accident (QUESTION.md). The authority is
 * the orchestrator's answer (option (a)), recorded in FOLLOWUP.md.
 *
 *   node amend-split-v8.mjs <exposure note> [--dry-run]
 *
 * The id never leaves this process. The runner collects every case id in the exposure note
 * (`tmp/5.1/EXPOSURE.md`, untracked) and requires exactly one of them to sit in heldOut or reserve
 * of v7. It moves that id with `moveToTuning`. Output: the counts, the number of cases outside
 * tuning that carry a `reverifyBy` and the earliest such date, and the v8 SHA-256, or one fixed
 * failure line. No id, path, or note text is printed.
 */
import { createHash } from "node:crypto";
import { chmodSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { AmendError, moveToTuning } from "../../../../../eval/qa/split-amend.mjs";

const V7_SHA256 = "d5e56748dfdf2ce9c0bcf8a48898f976db96578dd97516d07dd0b3cb13966c8a";
const COUNTS_V7 = { tuning: 88, heldOut: 112, reserve: 47 };
const NOTE =
  "2026-11-17: round item 5.1: one non-tuning case that lists the removed operation in its surface " +
  "and was seen by the item lead moved to tuning; identified by script from the lead's exposure " +
  "note (orchestrator answer in items/5.1/FOLLOWUP.md)";
const ID_RE = /\bq-[a-z0-9]+(?:-[a-z0-9]+)+\b/g;

const BACKUPS = join(homedir(), "backups");
const V7_PATH = join(BACKUPS, "gca-2026-11-14-split-v7.json");
const V8_PATH = join(BACKUPS, "gca-2026-11-14-split-v8.json");
const CASES_PATH = fileURLToPath(new URL("../../../../../eval/qa/cases.json", import.meta.url));

const LINES = {
  usage: "usage: amend-split-v8.mjs <exposure note> [--dry-run]",
  read: "check failed: a required input file could not be read",
  parse: "check failed: a required input file is not valid JSON",
  v7Hash: "check failed: the v7 split SHA-256 is not the recorded value",
  outExists: "check failed: the v8 split already exists; it is never overwritten",
  notOne: "check failed: the exposure note does not name exactly one case outside tuning",
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

  if (existsSync(V8_PATH)) throw new RunnerError("outExists");
  const v7Bytes = readBytes(V7_PATH);
  if (sha256(v7Bytes) !== V7_SHA256) throw new RunnerError("v7Hash");
  const split = parseJson(v7Bytes);
  const outside = new Set([...(split.sets?.heldOut ?? []), ...(split.sets?.reserve ?? [])]);

  const text = readBytes(notes[0]).toString("utf8");
  const exposed = [...new Set([...text.matchAll(ID_RE)].map((m) => m[0]))].filter((id) => outside.has(id));
  if (exposed.length !== 1) throw new RunnerError("notOne");

  const corpus = parseJson(readBytes(CASES_PATH));
  const cases = Array.isArray(corpus?.cases) ? corpus.cases : [];
  const { split: v8, counts } = moveToTuning({
    split,
    movedId: exposed[0],
    allowedFrom: ["heldOut", "reserve"],
    countsBefore: COUNTS_V7,
    caseIds: cases.map((c) => c.id),
    note: NOTE,
  });

  // Counts only, for the TODO's held-out status: cases outside v8 tuning with a `reverifyBy`.
  const tuning = new Set(v8.sets.tuning);
  const dates = cases.filter((c) => !tuning.has(c.id)).map((c) => reverifyDates(c).sort()[0]).filter(Boolean);

  const out = Buffer.from(`${JSON.stringify(v8, null, 2)}\n`);
  if (!dryRun) {
    try {
      writeFileSync(V8_PATH, out, { flag: "wx", mode: 0o600 });
      chmodSync(V8_PATH, 0o600);
    } catch {
      throw new RunnerError("outExists");
    }
  }
  console.log(`counts: tuning ${counts.tuning}, heldOut ${counts.heldOut}, reserve ${counts.reserve}`);
  console.log(`outside tuning with a reverifyBy: ${dates.length}; earliest ${dates.sort()[0] ?? "none"}`);
  console.log(`${dryRun ? "dry run, nothing written; v8 SHA-256 would be" : "v8 SHA-256"}: ${sha256(out)}`);
}

try {
  main();
} catch (error) {
  const line = error instanceof AmendError || error instanceof RunnerError ? error.message : LINES.unexpected;
  console.error(`amend-split-v8 failed: ${line}`);
  process.exit(1);
}
