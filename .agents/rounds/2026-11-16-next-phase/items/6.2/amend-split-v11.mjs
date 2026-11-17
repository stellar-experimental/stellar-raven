#!/usr/bin/env node
/**
 * Round item 6.2: amend split v10 into v11 by moving the one non-tuning case that the item lead
 * saw by accident in a repository-wide search (QUESTION.md). The authority is the orchestrator's
 * approval of option (a), recorded in QUESTION.md and the item PLAN.md (step 1).
 *
 *   node amend-split-v11.mjs <exposure note> [--dry-run]
 *
 * The id never leaves this process. The runner collects every case id in the exposure note
 * (`tmp/6.2/EXPOSURE.md`, untracked) and requires exactly one id. Three outcomes, each printing
 * only counts, a SHA-256 and one outcome word, never an id, path or note text:
 *   - "no move": the id is already in v10 tuning. Nothing is written; the SHA-256 is v10's.
 *   - "not in split": the id is in none of the three sets. Nothing is written; v10's SHA-256.
 *   - "moved": `moveToTuning` moves it, and v11 is written (mode 600, never overwritten); v11's
 *     SHA-256 (with --dry-run: the SHA-256 it would have, nothing written).
 * The count of cases outside tuning with a `reverifyBy`, and the earliest such date, are printed
 * after a move.
 */
import { createHash } from "node:crypto";
import { chmodSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { AmendError, moveToTuning } from "../../../../../eval/qa/split-amend.mjs";

const V10_SHA256 = "fea3d467e0df7b21a3fab7b5e4013d077da789de5aea16188d5bf975063f35e9";
const COUNTS_V10 = { tuning: 92, heldOut: 110, reserve: 45 };
const NOTE =
  "2026-11-17: round item 6.2: one non-tuning case seen by the item lead in a repository-wide search " +
  "moved to tuning; identified by script from the lead's exposure note (orchestrator approval of " +
  "option (a), items/6.2/QUESTION.md)";
const ID_RE = /\bq-[a-z0-9]+(?:-[a-z0-9]+)+\b/g;

const BACKUPS = join(homedir(), "backups");
const V10_PATH = join(BACKUPS, "gca-2026-11-14-split-v10.json");
const V11_PATH = join(BACKUPS, "gca-2026-11-14-split-v11.json");
const CASES_PATH = fileURLToPath(new URL("../../../../../eval/qa/cases.json", import.meta.url));

const LINES = {
  usage: "usage: amend-split-v11.mjs <exposure note> [--dry-run]",
  read: "check failed: a required input file could not be read",
  parse: "check failed: a required input file is not valid JSON",
  v10Hash: "check failed: the v10 split SHA-256 is not the recorded value",
  outExists: "check failed: the v11 split already exists; it is never overwritten",
  notOne: "check failed: the exposure note does not name exactly one case id",
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

  if (existsSync(V11_PATH)) throw new RunnerError("outExists");
  const v10Bytes = readBytes(V10_PATH);
  if (sha256(v10Bytes) !== V10_SHA256) throw new RunnerError("v10Hash");
  const split = parseJson(v10Bytes);
  const sets = split.sets ?? {};

  const text = readBytes(notes[0]).toString("utf8");
  const exposed = [...new Set([...text.matchAll(ID_RE)].map((m) => m[0]))];
  if (exposed.length !== 1) throw new RunnerError("notOne");
  const id = exposed[0];

  const countsLine = `counts: tuning ${sets.tuning?.length}, heldOut ${sets.heldOut?.length}, reserve ${sets.reserve?.length}`;
  if ((sets.tuning ?? []).includes(id)) {
    console.log(`no move: the exposed id is already in v10 tuning; nothing written`);
    console.log(countsLine);
    console.log(`v10 SHA-256: ${V10_SHA256}`);
    return;
  }
  const inSplit = ["heldOut", "reserve"].some((key) => (sets[key] ?? []).includes(id));
  if (!inSplit) {
    console.log(`not in split: the exposed id is in none of the three sets; nothing written`);
    console.log(countsLine);
    console.log(`v10 SHA-256: ${V10_SHA256}`);
    return;
  }

  const corpus = parseJson(readBytes(CASES_PATH));
  const cases = Array.isArray(corpus?.cases) ? corpus.cases : [];
  const { split: v11, counts } = moveToTuning({
    split,
    movedId: id,
    allowedFrom: ["heldOut", "reserve"],
    countsBefore: COUNTS_V10,
    caseIds: cases.map((c) => c.id),
    note: NOTE,
  });

  // Counts only, for the TODO's held-out status: cases outside v11 tuning with a `reverifyBy`.
  const tuning = new Set(v11.sets.tuning);
  const dates = cases.filter((c) => !tuning.has(c.id)).map((c) => reverifyDates(c).sort()[0]).filter(Boolean);

  const out = Buffer.from(`${JSON.stringify(v11, null, 2)}\n`);
  if (!dryRun) {
    try {
      writeFileSync(V11_PATH, out, { flag: "wx", mode: 0o600 });
      chmodSync(V11_PATH, 0o600);
    } catch {
      throw new RunnerError("outExists");
    }
  }
  console.log(dryRun ? "moved (dry run, nothing written)" : "moved");
  console.log(`counts: tuning ${counts.tuning}, heldOut ${counts.heldOut}, reserve ${counts.reserve}`);
  console.log(`outside tuning with a reverifyBy: ${dates.length}; earliest ${dates.sort()[0] ?? "none"}`);
  console.log(`${dryRun ? "v11 SHA-256 would be" : "v11 SHA-256"}: ${sha256(out)}`);
}

try {
  main();
} catch (error) {
  const line =
    error instanceof RunnerError ? error.message : error instanceof AmendError ? LINES.amend : LINES.unexpected;
  console.error(`amend-split-v11 failed: ${line}`);
  process.exit(1);
}
