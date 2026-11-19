import { execFile } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const REPO = join(import.meta.dirname, "..");
const dir = mkdtempSync(join(tmpdir(), "routing-manifest-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

// The runner prints the holdout and protocol-history per-case tables only under `--rows`, but the
// raw output must still never reach an assertion: a failed `toMatch` prints the whole string. This
// returns derived values only: failure lines and a count of held-out case ids found in the output.
let cachedHeldOutIds;
function heldOutIds() {
  if (cachedHeldOutIds) return cachedHeldOutIds;
  const ids = new Set();
  const walk = (value) => {
    if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") {
      if (typeof value.id === "string" && value.id.length >= 4) ids.add(value.id);
      Object.values(value).forEach(walk);
    }
  };
  for (const file of [
    "eval/holdout-cases.json",
    "eval/protocol-history-cases.json",
    "eval/protocol-history-cases-v2.json",
    "eval/protocol-history-blind-cases.json",
    "eval/protocol-history-blind-cases-v2.json",
  ]) walk(JSON.parse(readFileSync(join(REPO, file), "utf8")));
  cachedHeldOutIds = ids;
  return ids;
}

async function gate(manifest, extraArgs = []) {
  const run = await new Promise((resolve) => {
    execFile(
      process.execPath,
      ["eval/run-routing.mjs", "--gate", "--manifest", manifest, ...extraArgs],
      { cwd: REPO, encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        const status = error && typeof error.code === "number" ? error.code : error ? null : 0;
        resolve({ status, stdout, stderr });
      }
    );
  });
  const raw = run.stdout + run.stderr;
  const lines = raw.split("\n");
  const verdict = lines.findIndex((line) => line.startsWith("GATE FAIL"));
  const failures = [
    ...(verdict < 0 ? [] : lines.slice(verdict + 1).filter((line) => line.startsWith("  - "))),
    ...lines.filter((line) => line.startsWith("run-routing failed:")),
  ];
  if (run.status !== 0 && failures.length === 0) failures.push(`runner exited ${run.status} without a gate verdict`);
  const ids = heldOutIds();
  const heldOutIdOccurrences = raw.split(/[^A-Za-z0-9._-]+/).filter((token) => ids.has(token)).length;
  return { status: run.status, failures, heldOutIdOccurrences, printsHoldoutLane: /holdout lane — \d+ FROZEN/.test(raw) };
}

describe("run-routing --manifest gate evidence", () => {
  it.concurrent("fails --gate when the selected manifest differs from the committed evidence, without a per-case row in the failures", async () => {
    const variant = join(dir, "variant-manifest.json");
    writeFileSync(variant, readFileSync(join(REPO, "catalog/manifest.json"), "utf8") + "\n");
    const run = await gate(variant);
    expect(run.status).toBe(1);
    expect(run.failures.join("\n")).toMatch(/selected manifest .*variant-manifest\.json SHA-256 does not match the committed catalog\/manifest\.json gate evidence/);
    // The failures are what a reader sees, and hold no row.
    expect(run.heldOutIdOccurrences).toBe(0);
    for (const line of run.failures) expect(line).not.toMatch(/[│┌]/);
  }, 120_000);

  it.concurrent("passes --gate when the selected manifest is the committed manifest", async () => {
    const run = await gate(join(REPO, "catalog/manifest.json"));
    expect(run.failures).toEqual([]);
    expect(run.status).toBe(0);
    // The default run prints the holdout aggregate and no held-out case id.
    expect(run.printsHoldoutLane).toBe(true);
    expect(run.heldOutIdOccurrences).toBe(0);
  }, 120_000);

  it.concurrent("prints the per-row tables only under --rows", async () => {
    const run = await gate(join(REPO, "catalog/manifest.json"), ["--rows"]);
    expect(run.status).toBe(0);
    expect(run.heldOutIdOccurrences).toBeGreaterThan(0);
  }, 120_000);
});
