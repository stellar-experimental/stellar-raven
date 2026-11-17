import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join, relative } from "node:path";

// The inputs whose SHA-256 gates.json commits as the evidence behind its accepted totals.
export const GATE_EVIDENCE_INPUTS = [
  "catalog/manifest.json",
  "eval/routing-cases.json",
  "eval/skills-cases.json",
  "eval/holdout-cases.json",
];

// Names the procedure, not a command that prints per-case rows: the redirect keeps the table out
// of the terminal, and the totals are read with jq.
export const REBASELINE_POINTER =
  "re-baseline: run `npm run eval:routing -- --gate > <file>`, read the totals with `jq`, compare per case, " +
  "then update eval/gates.json in the same commit (run-evals skill, section 6)";

/**
 * Failure lines for the committed gate evidence in `gateConfig`. A mismatch names the input and
 * the first 12 hex of both hashes, never a case row. `manifestPath` is the manifest this run grades.
 */
export function gateEvidenceFailures(gateConfig, { repo, manifestPath }) {
  const failures = [];
  const evidence = gateConfig.evidence;
  if (!evidence || typeof evidence !== "object" || Array.isArray(evidence)) {
    return ["gates.json evidence is missing — re-baseline with committed input fingerprints and accepted totals"];
  }

  if (!Array.isArray(evidence.inputs)) {
    failures.push("gates.json evidence.inputs must be an array");
  } else {
    const inputs = new Map();
    for (const input of evidence.inputs) {
      if (!input || typeof input.path !== "string" || typeof input.sha256 !== "string") {
        failures.push("gates.json evidence.inputs entries must contain path and sha256 strings");
        continue;
      }
      if (inputs.has(input.path)) failures.push(`gates.json evidence.inputs repeats ${input.path}`);
      inputs.set(input.path, input.sha256);
    }
    for (const path of GATE_EVIDENCE_INPUTS) {
      const expected = inputs.get(path);
      if (!expected) {
        failures.push(`gates.json evidence.inputs is missing ${path}`);
        continue;
      }
      if (!/^[a-f0-9]{64}$/.test(expected)) {
        failures.push(`gates.json evidence.inputs has an invalid SHA-256 for ${path}`);
        continue;
      }
      // The manifest evidence must describe the manifest this run grades, including a --manifest variant.
      const committed = join(repo, path);
      const source = path === "catalog/manifest.json" ? manifestPath : committed;
      const actual = createHash("sha256").update(readFileSync(source)).digest("hex");
      if (actual === expected) continue;
      if (source !== committed) {
        failures.push(`selected manifest ${relative(repo, manifestPath)} SHA-256 does not match the committed ${path} gate evidence — a variant manifest cannot pass --gate`);
      } else {
        failures.push(
          `${path} SHA-256 ${actual.slice(0, 12)} does not match the committed ${expected.slice(0, 12)} in eval/gates.json — ${REBASELINE_POINTER}`,
        );
      }
    }
    for (const path of inputs.keys()) {
      if (!GATE_EVIDENCE_INPUTS.includes(path)) failures.push(`gates.json evidence.inputs contains unexpected path ${path}`);
    }
  }

  const totals = evidence.acceptedTotals;
  for (const lane of ["legacy", "skills", "holdout"]) {
    if (!totals?.[lane] || typeof totals[lane] !== "object" || Array.isArray(totals[lane])) {
      failures.push(`gates.json evidence.acceptedTotals.${lane} is missing`);
    }
  }
  if (evidence.localTrace !== undefined && (typeof evidence.localTrace !== "string" || evidence.localTrace.length === 0)) {
    failures.push("gates.json evidence.localTrace must be a non-empty string when present");
  }
  return failures;
}
