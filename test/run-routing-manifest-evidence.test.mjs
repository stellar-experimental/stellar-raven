import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const REPO = join(import.meta.dirname, "..");
const dir = mkdtempSync(join(tmpdir(), "routing-manifest-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

function gate(manifest) {
  const run = spawnSync(process.execPath, ["eval/run-routing.mjs", "--gate", "--manifest", manifest], {
    cwd: REPO,
    encoding: "utf8",
  });
  return { status: run.status, output: run.stdout + run.stderr };
}

describe("run-routing --manifest gate evidence", () => {
  it("fails --gate when the selected manifest differs from the committed evidence", () => {
    const variant = join(dir, "variant-manifest.json");
    writeFileSync(variant, readFileSync(join(REPO, "catalog/manifest.json"), "utf8") + "\n");
    const run = gate(variant);
    expect(run.status).toBe(1);
    expect(run.output).toMatch(/selected manifest .*variant-manifest\.json SHA-256 does not match the committed catalog\/manifest\.json gate evidence/);
  }, 120_000);

  it("passes --gate when the selected manifest is the committed manifest", () => {
    const run = gate(join(REPO, "catalog/manifest.json"));
    expect(run.output).not.toMatch(/SHA-256 does not match/);
    expect(run.status).toBe(0);
  }, 120_000);
});
