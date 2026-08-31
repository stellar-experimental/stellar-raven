import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const workdirs = [];

afterEach(() => {
  for (const directory of workdirs.splice(0)) rmSync(directory, { recursive: true, force: true });
});

describe("repository-recovery grade CLI", () => {
  it("fails closed without current-grade aggregates for an identity-invalid artifact", () => {
    const directory = mkdtempSync(path.join(os.tmpdir(), "repo-recovery-grade-test-"));
    workdirs.push(directory);
    const resultPath = path.join(directory, "invalid.json");
    writeFileSync(resultPath, JSON.stringify({
      artifactSchema: "repository-recovery-reviewed-v1",
      contract: "repository-tooling-recovery-v1",
      caseContentDigest: "sha256(JSON.stringify(cases))=invalid",
      orderedIdsDigest: "sha256(ids.join(\\\"\\n\\\"))=invalid",
      rows: []
    }));

    const run = spawnSync(process.execPath, ["eval/repo-recovery/grade-results.mjs", resultPath], {
      cwd: process.cwd(),
      encoding: "utf8"
    });
    const output = JSON.parse(run.stdout);

    expect(run.status).toBe(1);
    expect(output).toMatchObject({
      contract: "repository-tooling-recovery-v2",
      identityPass: false,
      identityReason: "stored artifact identity does not match current suite",
      reviewPass: false,
      pass: false
    });
    expect(output.reviewReasons.length).toBeGreaterThan(0);
    expect(output).not.toHaveProperty("positivePasses");
    expect(output).not.toHaveProperty("positives");
  });
});
