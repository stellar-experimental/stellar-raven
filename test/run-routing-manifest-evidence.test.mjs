import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const REPO = join(import.meta.dirname, "..");
const dir = mkdtempSync(join(tmpdir(), "routing-manifest-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

// The runner prints the holdout and protocol-history per-case tables on every run, so the raw
// output must never reach an assertion: a failed `toMatch` prints the whole string. This returns
// derived values only. Known residual: a `run-routing failed:` line can carry a case id
// (run-routing.mjs, the case-resolution throw).
function gate(manifest) {
  const run = spawnSync(process.execPath, ["eval/run-routing.mjs", "--gate", "--manifest", manifest], {
    cwd: REPO,
    encoding: "utf8",
  });
  const raw = run.stdout + run.stderr;
  const lines = raw.split("\n");
  const verdict = lines.findIndex((line) => line.startsWith("GATE FAIL"));
  const failures = [
    ...(verdict < 0 ? [] : lines.slice(verdict + 1).filter((line) => line.startsWith("  - "))),
    ...lines.filter((line) => line.startsWith("run-routing failed:")),
  ];
  if (run.status !== 0 && failures.length === 0) failures.push(`runner exited ${run.status} without a gate verdict`);
  return { status: run.status, failures, rawHasPerCaseTable: /holdout lane — \d+ FROZEN/.test(raw) && raw.includes("┌") };
}

describe("run-routing --manifest gate evidence", () => {
  it("fails --gate when the selected manifest differs from the committed evidence, without a per-case row in the failures", () => {
    const variant = join(dir, "variant-manifest.json");
    writeFileSync(variant, readFileSync(join(REPO, "catalog/manifest.json"), "utf8") + "\n");
    const run = gate(variant);
    expect(run.status).toBe(1);
    expect(run.failures.join("\n")).toMatch(/selected manifest .*variant-manifest\.json SHA-256 does not match the committed catalog\/manifest\.json gate evidence/);
    // The runner does print the tables; the failures are what a reader sees, and hold no row.
    expect(run.rawHasPerCaseTable).toBe(true);
    for (const line of run.failures) expect(line).not.toMatch(/[│┌]/);
  }, 120_000);

  it("passes --gate when the selected manifest is the committed manifest", () => {
    const run = gate(join(REPO, "catalog/manifest.json"));
    expect(run.failures).toEqual([]);
    expect(run.status).toBe(0);
  }, 120_000);
});
