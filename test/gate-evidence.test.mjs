import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { GATE_EVIDENCE_INPUTS, REBASELINE_POINTER, gateEvidenceFailures } from "../eval/lib/gate-evidence.mjs";

const sha = (text) => createHash("sha256").update(text).digest("hex");
const dir = mkdtempSync(join(tmpdir(), "gate-evidence-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

const TOTALS = { legacy: {}, skills: {}, holdout: {} };

/** A repo with the four inputs; `wrongPath` commits a hash that does not match that input. */
function fixture(name, wrongPath) {
  const repo = join(dir, name);
  const inputs = GATE_EVIDENCE_INPUTS.map((path) => {
    const body = `content of ${path}`;
    mkdirSync(dirname(join(repo, path)), { recursive: true });
    writeFileSync(join(repo, path), body);
    return { path, sha256: path === wrongPath ? sha("stale") : sha(body) };
  });
  return { repo, gateConfig: { evidence: { inputs, acceptedTotals: TOTALS } } };
}

describe("gateEvidenceFailures", () => {
  it("passes when every committed hash matches", () => {
    const { repo, gateConfig } = fixture("ok");
    expect(gateEvidenceFailures(gateConfig, { repo, manifestPath: join(repo, "catalog/manifest.json") })).toEqual([]);
  });

  it("names the input, both hashes and the re-baseline procedure for a committed-input mismatch", () => {
    const wrong = "eval/holdout-cases.json";
    const { repo, gateConfig } = fixture("mismatch", wrong);
    const failures = gateEvidenceFailures(gateConfig, { repo, manifestPath: join(repo, "catalog/manifest.json") });
    expect(failures).toEqual([
      `${wrong} SHA-256 ${sha(`content of ${wrong}`).slice(0, 12)} does not match the committed ${sha("stale").slice(0, 12)} in eval/gates.json — ${REBASELINE_POINTER}`,
    ]);
    expect(failures.join("\n")).not.toMatch(/[│┌]/);
  });

  it("keeps the variant-manifest message and gives it no re-baseline pointer", () => {
    const { repo, gateConfig } = fixture("variant");
    const variant = join(dir, "variant", "variant-manifest.json");
    writeFileSync(variant, "a different manifest");
    const failures = gateEvidenceFailures(gateConfig, { repo, manifestPath: variant });
    expect(failures).toHaveLength(1);
    expect(failures[0]).toMatch(/selected manifest .*variant-manifest\.json SHA-256 does not match the committed catalog\/manifest\.json gate evidence — a variant manifest cannot pass --gate$/);
    expect(failures[0]).not.toContain("re-baseline");
  });
});
