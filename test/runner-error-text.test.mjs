/**
 * Runner errors name a file and a position, never a case id, question or file content: the routing
 * and protocol-history runners print `err.message`, and an agent reads their output. Every
 * assertion counts a synthetic private marker; none prints a message that could carry one.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { confirmationOnlyFor } from "../eval/lib/confirmation-only.mjs";
import { evaluateProtocolHistory } from "../eval/lib/protocol-history-source-epoch.mjs";
import { readJson } from "../eval/lib/read-json.mjs";

const REPO = join(import.meta.dirname, "..");
const MARKER = "SYNTHETIC_PRIVATE_MARKER_91c2";
const dir = mkdtempSync(join(tmpdir(), "runner-error-text-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));
const leaks = (text) => text.split(MARKER).length - 1;

function messageOf(fn) {
  try {
    fn();
  } catch (error) {
    return error instanceof Error ? error.message : "non-error thrown";
  }
  return null;
}

function contractWith(cases) {
  return {
    path: "eval/synthetic-protocol-history-v2.json",
    expectedContract: "synthetic-protocol-history-v2",
    bytes: Buffer.from("{}"),
    contract: {
      contract: "synthetic-protocol-history-v2",
      frozen: true,
      version: 2,
      authoredAt: "2026-09-03",
      targetOperation: "scout.searchResearch",
      requiredCases: cases,
      forbiddenCases: [],
      neutralCases: [],
    },
  };
}

const evaluate = (cases) =>
  evaluateProtocolHistory({
    contractInputs: [contractWith(cases)],
    manifestBytes: Buffer.from("{}"),
    manifest: {},
    inventoryBytes: Buffer.from("{}"),
    inventory: {},
    rank: () => [],
  });

describe("protocol-history contract errors", () => {
  const bad = [
    ["an empty question", [{ id: MARKER, question: "", class: "c" }]],
    ["an empty class", [{ id: MARKER, question: `${MARKER} question`, class: "" }]],
    ["a repeated id", [{ id: MARKER, question: "q", class: "c" }, { id: MARKER, question: "q2", class: "c" }]],
    ["a non-object case", [MARKER]],
  ];
  it.each(bad)("names a position and leaks no marker for %s", (_label, cases) => {
    const message = messageOf(() => evaluate(cases));
    expect(message).not.toBeNull();
    expect(leaks(message)).toBe(0);
    expect(message).toMatch(/requiredCases/);
  });

  it("names the position of the failing case", () => {
    expect(messageOf(() => evaluate([{ id: "ok", question: "q", class: "c" }, { id: MARKER, question: "", class: "c" }]))).toContain("requiredCases[1]");
  });
});

describe("confirmation-only list errors", () => {
  it("names the set and the list position, never the listed id", () => {
    const list = { sets: { synthetic: { ids: ["kept", MARKER] } } };
    const message = messageOf(() => confirmationOnlyFor("synthetic", ["kept"], list));
    expect(message).not.toBeNull();
    expect(leaks(message)).toBe(0);
    expect(message).toContain('set "synthetic"');
    expect(message).toContain("position 1");
  });
});

describe("JSON read errors", () => {
  it("name the file only and keep no cause", () => {
    const file = join(dir, "bad.json");
    writeFileSync(file, `${MARKER} {not json`);
    let thrown;
    try {
      readJson(file, dir);
    } catch (error) {
      thrown = error;
    }
    expect(thrown.message).toBe("bad.json is not valid JSON");
    expect(thrown.cause).toBeUndefined();
  });

  it("keeps the marker out of a runner's stdout and stderr and exits 1", () => {
    const file = join(dir, "variant-manifest.json");
    writeFileSync(file, `${MARKER} {not json`);
    const run = spawnSync(process.execPath, ["eval/run-routing.mjs", "--manifest", file], { cwd: REPO, encoding: "utf8" });
    expect(run.status).toBe(1);
    expect(leaks(run.stdout) + leaks(run.stderr)).toBe(0);
    expect(run.stderr).toMatch(/^run-routing failed: .*variant-manifest\.json is not valid JSON/);
  }, 60_000);
});
