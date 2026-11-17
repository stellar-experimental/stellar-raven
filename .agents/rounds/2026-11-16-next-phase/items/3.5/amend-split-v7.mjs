#!/usr/bin/env node
/**
 * Round item 3.5 follow-up: amend split v6 into v7 by moving the one non-tuning case whose id and
 * golden amounts the lead's `tail` of the QA lint log displayed (REPORT.md, "Incidental exposure").
 * The authority is the orchestrator's answer of 2026-11-17 (option (a)), recorded in FOLLOWUP.md.
 *
 *   node amend-split-v7.mjs <exposure note> [--dry-run]
 *
 * The id never leaves this process. The runner collects every case id in the exposure note
 * (`tmp/3.5/EXPOSURE.md`, untracked) and requires exactly one of them to sit in heldOut or reserve
 * of v6. It moves that id with `moveToTuning`. Output: the counts, the number of cases outside
 * tuning that carry a `reverifyBy` and the earliest such date, and the v7 SHA-256, or one fixed
 * failure line. No id, path, or note text is printed.
 */
import { createHash } from "node:crypto";
import { chmodSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { AmendError, moveToTuning } from "../../../../../eval/qa/split-amend.mjs";

const V6_SHA256 = "04107a463c462eecb02a64fe0b69fab6cb4a1bc388197c3e3a01107e9350c362";
const COUNTS_V6 = { tuning: 87, heldOut: 113, reserve: 47 };
const NOTE =
  "2026-11-17: round item 3.5 follow-up: one non-tuning case whose id and golden amounts a QA lint " +
  "log displayed to the item lead moved to tuning; identified by script from the lead's exposure " +
  "note (orchestrator answer in items/3.5/FOLLOWUP.md)";
const ID_RE = /\bq-[a-z0-9]+(?:-[a-z0-9]+)+\b/g;

const BACKUPS = join(homedir(), "backups");
const V6_PATH = join(BACKUPS, "gca-2026-11-14-split-v6.json");
const V7_PATH = join(BACKUPS, "gca-2026-11-14-split-v7.json");
const CASES_PATH = fileURLToPath(new URL("../../../../../eval/qa/cases.json", import.meta.url));

const LINES = {
  usage: "usage: amend-split-v7.mjs <exposure note> [--dry-run]",
  read: "check failed: a required input file could not be read",
  parse: "check failed: a required input file is not valid JSON",
  v6Hash: "check failed: the v6 split SHA-256 is not the recorded value",
  outExists: "check failed: the v7 split already exists; it is never overwritten",
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

  if (existsSync(V7_PATH)) throw new RunnerError("outExists");
  const v6Bytes = readBytes(V6_PATH);
  if (sha256(v6Bytes) !== V6_SHA256) throw new RunnerError("v6Hash");
  const split = parseJson(v6Bytes);
  const outside = new Set([...(split.sets?.heldOut ?? []), ...(split.sets?.reserve ?? [])]);

  const text = readBytes(notes[0]).toString("utf8");
  const exposed = [...new Set([...text.matchAll(ID_RE)].map((m) => m[0]))].filter((id) => outside.has(id));
  if (exposed.length !== 1) throw new RunnerError("notOne");

  const corpus = parseJson(readBytes(CASES_PATH));
  const cases = Array.isArray(corpus?.cases) ? corpus.cases : [];
  const { split: v7, counts } = moveToTuning({
    split,
    movedId: exposed[0],
    allowedFrom: ["heldOut", "reserve"],
    countsBefore: COUNTS_V6,
    caseIds: cases.map((c) => c.id),
    note: NOTE,
  });

  // Counts only, for the TODO's held-out status: cases outside v7 tuning with a `reverifyBy`.
  const tuning = new Set(v7.sets.tuning);
  const dates = cases.filter((c) => !tuning.has(c.id)).map((c) => reverifyDates(c).sort()[0]).filter(Boolean);

  const out = Buffer.from(`${JSON.stringify(v7, null, 2)}\n`);
  if (!dryRun) {
    try {
      writeFileSync(V7_PATH, out, { flag: "wx", mode: 0o600 });
      chmodSync(V7_PATH, 0o600);
    } catch {
      throw new RunnerError("outExists");
    }
  }
  console.log(`counts: tuning ${counts.tuning}, heldOut ${counts.heldOut}, reserve ${counts.reserve}`);
  console.log(`outside tuning with a reverifyBy: ${dates.length}; earliest ${dates.sort()[0] ?? "none"}`);
  console.log(`${dryRun ? "dry run, nothing written; v7 SHA-256 would be" : "v7 SHA-256"}: ${sha256(out)}`);
}

try {
  main();
} catch (error) {
  const line = error instanceof AmendError || error instanceof RunnerError ? error.message : LINES.unexpected;
  console.error(`amend-split-v7 failed: ${line}`);
  process.exit(1);
}
