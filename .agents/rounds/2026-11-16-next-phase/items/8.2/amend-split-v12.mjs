#!/usr/bin/env node
/**
 * Round item 8.2: amend split v11 into v12. Two `ideas/` files quoted judge-facing text of golden
 * cases (EXPOSURE.md). The item's set O reviewer read those passages outside a maintenance lane, so
 * the orchestrator ruled (2026-11-18) that every id whose case text an agent read moves to tuning by
 * a dated amendment, as item 6.2 did for v11.
 *
 *   node amend-split-v12.mjs [--dry-run]
 *
 * The ids below are named without their sets. The runner never prints an id, a set or a path. It
 * prints one outcome word, the counts, and a SHA-256:
 *   - per id, in aggregate: moved (from held-out or reserve), already in tuning (a no-op), or in
 *     none of the three sets (not a battery case);
 *   - "moved": v12 is written (mode 600, never overwritten) beside v11, which stays untouched;
 *     with --dry-run, the SHA-256 v12 would have, nothing written;
 *   - "no move": nothing is written; the SHA-256 is v11's.
 */
import { createHash } from "node:crypto";
import { chmodSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { AmendError, moveToTuning } from "../../../../../eval/qa/split-amend.mjs";

const EXPOSED_IDS = [
  // ideas/codegen-correctness-substrate.md (now research/audits/2026-08-07-codegen-partner-report.md)
  "q-sor-decode-hosterror-codes",
  "q-soroban-unit-testing",
  "q-soroban-wasm-size-limit",
  "q-sor-testing-negative-auth-events",
  "q-zk-nullifier-storage",
  "q-sor-evm-to-soroban-porting",
  // ideas/source-delivery-ranked-references.md, section 1
  "q-protocol-base-reserve-min-balance",
  "q-quickstart-manual-ledger-close",
  "q-sor-p23-auto-restore-extendto",
  "q-ti-rpc-gettransactions-pagination-xdr",
];

const V11_SHA256 = "bb4390d3398f5e0cbdf99948bdd61be4b6872fe57c2484524802771407d71fd6";
const COUNTS_V11 = { tuning: 93, heldOut: 109, reserve: 45 };
const NOTE =
  "2026-11-18: round item 8.2: cases whose judge-facing text two ideas/ files quoted, read by the item's " +
  "set O reviewer outside a maintenance lane, moved to tuning (orchestrator ruling on items/8.2/EXPOSURE.md)";

const BACKUPS = join(homedir(), "backups");
const V11_PATH = join(BACKUPS, "gca-2026-11-14-split-v11.json");
const V12_PATH = join(BACKUPS, "gca-2026-11-14-split-v12.json");
const CASES_PATH = fileURLToPath(new URL("../../../../../eval/qa/cases.json", import.meta.url));

const LINES = {
  usage: "usage: amend-split-v12.mjs [--dry-run]",
  read: "check failed: a required input file could not be read",
  parse: "check failed: a required input file is not valid JSON",
  v11Hash: "check failed: the v11 split SHA-256 is not the recorded value",
  v11Counts: "check failed: the v11 split counts are not the recorded values",
  outExists: "check failed: the v12 split already exists; it is never overwritten",
  amend: "check failed: the amendment library refused a move (message withheld)",
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
const countsOf = (sets) => ({ tuning: sets.tuning.length, heldOut: sets.heldOut.length, reserve: sets.reserve.length });

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
  if (args.some((a) => a !== "--dry-run")) throw new RunnerError("usage");

  if (existsSync(V12_PATH)) throw new RunnerError("outExists");
  const v11Bytes = readBytes(V11_PATH);
  if (sha256(v11Bytes) !== V11_SHA256) throw new RunnerError("v11Hash");
  const v11 = parseJson(v11Bytes);
  const c11 = countsOf(v11.sets ?? { tuning: [], heldOut: [], reserve: [] });
  if (c11.tuning !== COUNTS_V11.tuning || c11.heldOut !== COUNTS_V11.heldOut || c11.reserve !== COUNTS_V11.reserve) {
    throw new RunnerError("v11Counts");
  }

  const corpus = parseJson(readBytes(CASES_PATH));
  const caseIds = (Array.isArray(corpus?.cases) ? corpus.cases : []).map((c) => c.id);

  let split = v11;
  let counts = { ...COUNTS_V11 };
  const tally = { moved: 0, alreadyTuning: 0, notInSplit: 0 };
  for (const id of EXPOSED_IDS) {
    if (split.sets.tuning.includes(id)) {
      tally.alreadyTuning += 1;
      continue;
    }
    if (!split.sets.heldOut.includes(id) && !split.sets.reserve.includes(id)) {
      tally.notInSplit += 1;
      continue;
    }
    ({ split, counts } = moveToTuning({
      split,
      movedId: id,
      allowedFrom: ["heldOut", "reserve"],
      countsBefore: counts,
      caseIds,
      note: NOTE,
    }));
    tally.moved += 1;
  }

  const tallyLine = `ids: ${EXPOSED_IDS.length}; moved ${tally.moved}, already in tuning ${tally.alreadyTuning}, in no set ${tally.notInSplit}`;
  if (tally.moved === 0) {
    console.log("no move: nothing written");
    console.log(tallyLine);
    console.log(`counts: tuning ${counts.tuning}, heldOut ${counts.heldOut}, reserve ${counts.reserve}`);
    console.log(`v11 SHA-256: ${V11_SHA256}`);
    return;
  }

  // One amendment note for the whole batch, not one per moved id.
  const v12 = { ...split, amended: v11.amended.length > 0 ? `${v11.amended}; ${NOTE}` : NOTE };

  // Counts only, for the TODO's held-out status: cases outside v12 tuning with a `reverifyBy`.
  const tuning = new Set(v12.sets.tuning);
  const cases = Array.isArray(corpus?.cases) ? corpus.cases : [];
  const dates = cases.filter((c) => !tuning.has(c.id)).map((c) => reverifyDates(c).sort()[0]).filter(Boolean);

  const out = Buffer.from(`${JSON.stringify(v12, null, 2)}\n`);
  if (!dryRun) {
    try {
      writeFileSync(V12_PATH, out, { flag: "wx", mode: 0o600 });
      chmodSync(V12_PATH, 0o600);
    } catch {
      throw new RunnerError("outExists");
    }
  }
  console.log(dryRun ? "moved (dry run, nothing written)" : "moved");
  console.log(tallyLine);
  console.log(`counts: tuning ${counts.tuning}, heldOut ${counts.heldOut}, reserve ${counts.reserve}`);
  console.log(`outside tuning with a reverifyBy: ${dates.length}; earliest ${dates.sort()[0] ?? "none"}`);
  console.log(`${dryRun ? "v12 SHA-256 would be" : "v12 SHA-256"}: ${sha256(out)}`);
}

try {
  main();
} catch (error) {
  const line =
    error instanceof RunnerError ? error.message : error instanceof AmendError ? LINES.amend : LINES.unexpected;
  console.error(`amend-split-v12 failed: ${line}`);
  process.exit(1);
}
