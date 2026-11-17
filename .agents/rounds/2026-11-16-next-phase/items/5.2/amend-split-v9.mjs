#!/usr/bin/env node
/**
 * Round item 5.2: amend split v8 into v9 by moving every non-tuning case among the ids an
 * incidental QA lint output showed the item 5.2 executor (REPORT.md, "For the orchestrator" 2).
 * The authority is the orchestrator's answer of 2026-11-17, recorded in REPORT.md.
 *
 *   node amend-split-v9.mjs <exposure note> [--dry-run]
 *
 * The ids never leave this process. The runner collects every case id in the exposure note
 * (`tmp/5.2/EXPOSURE.txt`, untracked), keeps those in heldOut or reserve of v8 (ids already in
 * tuning stay), and moves each with `moveToTuning`. Output: the counts, the number of cases outside
 * tuning that carry a `reverifyBy` and the earliest such date, and the v9 SHA-256, or one fixed
 * failure line. No id, path, or note text is printed.
 */
import { createHash } from "node:crypto";
import { chmodSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { AmendError, moveToTuning } from "../../../../../eval/qa/split-amend.mjs";

const V8_SHA256 = "1f0c1268d47103e652c545cd7642f808d893aa7779192b50d189c42510027720";
const COUNTS_V8 = { tuning: 89, heldOut: 112, reserve: 46 };
const NOTE =
  "2026-11-17: round item 5.2: the non-tuning cases among those an incidental QA lint output showed " +
  "the item executor moved to tuning; identified by script from the executor's exposure note " +
  "(orchestrator answer in items/5.2/REPORT.md)";
const ID_RE = /\bq-[a-z0-9]+(?:-[a-z0-9]+)+\b/g;

const BACKUPS = join(homedir(), "backups");
const V8_PATH = join(BACKUPS, "gca-2026-11-14-split-v8.json");
const V9_PATH = join(BACKUPS, "gca-2026-11-14-split-v9.json");
const CASES_PATH = fileURLToPath(new URL("../../../../../eval/qa/cases.json", import.meta.url));

const LINES = {
  usage: "usage: amend-split-v9.mjs <exposure note> [--dry-run]",
  read: "check failed: a required input file could not be read",
  parse: "check failed: a required input file is not valid JSON",
  v8Hash: "check failed: the v8 split SHA-256 is not the recorded value",
  outExists: "check failed: the v9 split already exists; it is never overwritten",
  none: "check failed: the exposure note names no case outside tuning",
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

  if (existsSync(V9_PATH)) throw new RunnerError("outExists");
  const v8Bytes = readBytes(V8_PATH);
  if (sha256(v8Bytes) !== V8_SHA256) throw new RunnerError("v8Hash");
  let split = parseJson(v8Bytes);
  const outside = new Set([...(split.sets?.heldOut ?? []), ...(split.sets?.reserve ?? [])]);

  const text = readBytes(notes[0]).toString("utf8");
  const exposed = [...new Set([...text.matchAll(ID_RE)].map((m) => m[0]))].filter((id) => outside.has(id));
  if (exposed.length === 0) throw new RunnerError("none");

  const corpus = parseJson(readBytes(CASES_PATH));
  const cases = Array.isArray(corpus?.cases) ? corpus.cases : [];
  const amendedBefore = split.amended;
  let counts = COUNTS_V8;
  for (const movedId of exposed.sort()) {
    const moved = moveToTuning({
      split,
      movedId,
      allowedFrom: ["heldOut", "reserve"],
      countsBefore: counts,
      caseIds: cases.map((c) => c.id),
      note: NOTE,
    });
    split = moved.split;
    counts = moved.counts;
  }
  // One note for the whole amendment, not one per moved id.
  const v9 = { ...split, amended: amendedBefore.length > 0 ? `${amendedBefore}; ${NOTE}` : NOTE };

  // Counts only, for the TODO's held-out status: cases outside v9 tuning with a `reverifyBy`.
  const tuning = new Set(v9.sets.tuning);
  const dates = cases.filter((c) => !tuning.has(c.id)).map((c) => reverifyDates(c).sort()[0]).filter(Boolean);

  const out = Buffer.from(`${JSON.stringify(v9, null, 2)}\n`);
  if (!dryRun) {
    try {
      writeFileSync(V9_PATH, out, { flag: "wx", mode: 0o600 });
      chmodSync(V9_PATH, 0o600);
    } catch {
      throw new RunnerError("outExists");
    }
  }
  console.log(`counts: tuning ${counts.tuning}, heldOut ${counts.heldOut}, reserve ${counts.reserve}`);
  console.log(`outside tuning with a reverifyBy: ${dates.length}; earliest ${dates.sort()[0] ?? "none"}`);
  console.log(`${dryRun ? "dry run, nothing written; v9 SHA-256 would be" : "v9 SHA-256"}: ${sha256(out)}`);
}

try {
  main();
} catch (error) {
  const line = error instanceof AmendError || error instanceof RunnerError ? error.message : LINES.unexpected;
  console.error(`amend-split-v9 failed: ${line}`);
  process.exit(1);
}
