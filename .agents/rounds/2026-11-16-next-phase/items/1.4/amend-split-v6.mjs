#!/usr/bin/env node
/**
 * Round item 1.4 follow-up: amend split v5 into v6 by moving the one non-tuning case that an
 * incidental search in the Codex review session displayed (REPORT.md, open question 1). The
 * authority is the orchestrator's answer of 2026-11-17 (option (a)), recorded in FOLLOWUP.md.
 *
 *   node amend-split-v6.mjs <codex session log> [--dry-run]
 *
 * The id never leaves this process. The runner collects every corpus case path in the session log,
 * keeps the ids outside the seven case files that review was allowed to open, and requires exactly
 * one of them to sit in heldOut or reserve of v5. It moves that id with `moveToTuning`. Output: the
 * counts and the v6 SHA-256, or one fixed failure line. No id, path, or log text is printed.
 */
import { createHash } from "node:crypto";
import { chmodSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { AmendError, moveToTuning } from "../../../../../eval/qa/split-amend.mjs";

const V5_SHA256 = "c8796ec14c4d77d114693cfcf5a51a9f5da80a6506956bb7f88c6992725f4b15";
const COUNTS_V5 = { tuning: 86, heldOut: 114, reserve: 47 };
const ALLOWED = new Set([
  "q-edge-fresh-latest-protocol-version",
  "q-pc-protocol-upgrade-timing",
  "q-protocol-version-history-list",
  "q-infra-software-versions-current-protocol",
  "q-hist-quantum-preparedness-plan",
  "q-scf-current-round",
  "q-pc-quantum-preparedness-dormant",
]);
const NOTE =
  "2026-11-17: round item 1.4 follow-up: one non-tuning case whose provenance an incidental search " +
  "in the Codex review session displayed moved to tuning; identified by script from that session " +
  "log, seen by no one (orchestrator answer in items/1.4/FOLLOWUP.md)";
const PATH_RE = /corpus\/(?:battery|live|retired)\/(?:[a-z0-9-]+\/)?(q-[a-z0-9-]+)\.json/g;

const BACKUPS = join(homedir(), "backups");
const V5_PATH = join(BACKUPS, "gca-2026-11-14-split-v5.json");
const V6_PATH = join(BACKUPS, "gca-2026-11-14-split-v6.json");
const CASES_PATH = fileURLToPath(new URL("../../../../../eval/qa/cases.json", import.meta.url));

const LINES = {
  usage: "usage: amend-split-v6.mjs <codex session log> [--dry-run]",
  read: "check failed: a required input file could not be read",
  parse: "check failed: a required input file is not valid JSON",
  v5Hash: "check failed: the v5 split SHA-256 is not the recorded value",
  outExists: "check failed: the v6 split already exists; it is never overwritten",
  notOne: "check failed: the session log does not show exactly one case outside tuning beyond the allowed set",
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
  const dryRun = args.includes("--dry-run");
  const logs = args.filter((a) => a !== "--dry-run");
  if (logs.length !== 1) throw new RunnerError("usage");

  if (existsSync(V6_PATH)) throw new RunnerError("outExists");
  const v5Bytes = readBytes(V5_PATH);
  if (sha256(v5Bytes) !== V5_SHA256) throw new RunnerError("v5Hash");
  const split = parseJson(v5Bytes);
  const outside = new Set([...(split.sets?.heldOut ?? []), ...(split.sets?.reserve ?? [])]);

  const text = readBytes(logs[0]).toString("utf8");
  const seen = new Set([...text.matchAll(PATH_RE)].map((m) => m[1]).filter((id) => !ALLOWED.has(id)));
  const exposed = [...seen].filter((id) => outside.has(id));
  if (exposed.length !== 1) throw new RunnerError("notOne");

  const corpus = parseJson(readBytes(CASES_PATH));
  const caseIds = (Array.isArray(corpus?.cases) ? corpus.cases : []).map((c) => c.id);
  const { split: v6, counts } = moveToTuning({
    split,
    movedId: exposed[0],
    allowedFrom: ["heldOut", "reserve"],
    countsBefore: COUNTS_V5,
    caseIds,
    note: NOTE,
  });
  const out = Buffer.from(`${JSON.stringify(v6, null, 2)}\n`);
  if (!dryRun) {
    try {
      writeFileSync(V6_PATH, out, { flag: "wx", mode: 0o600 });
      chmodSync(V6_PATH, 0o600);
    } catch {
      throw new RunnerError("outExists");
    }
  }
  console.log(`counts: tuning ${counts.tuning}, heldOut ${counts.heldOut}, reserve ${counts.reserve}`);
  console.log(`${dryRun ? "dry run, nothing written; v6 SHA-256 would be" : "v6 SHA-256"}: ${sha256(out)}`);
}

try {
  main();
} catch (error) {
  const line = error instanceof AmendError || error instanceof RunnerError ? error.message : LINES.unexpected;
  console.error(`amend-split-v6 failed: ${line}`);
  process.exit(1);
}
