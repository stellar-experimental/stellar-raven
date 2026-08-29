import { createHash } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import {
  CASE_INPUT_IDENTITY,
  caseInputSha256,
  classifyPairedRow,
  comparePairedArtifacts,
  formatPairedVerdict,
  statisticalDecision
} from "../eval/qa/paired-verdict.mjs";

const CASE_HASH = "a".repeat(64);

function result(grades, {
  caseHashes = {},
  failures = {},
  tuple = {},
  comparable = true
} = {}) {
  const ids = grades.map((_, index) => `case-${String(index).padStart(3, "0")}`);
  return {
    meta: {
      variant: "A",
      surface: "search-execute",
      model: "answer-model",
      judgeModel: "judge-model",
      judgeRubric: "v-test",
      packVersion: "p-test",
      resultsSchema: "qa-agent-result-v4",
      caseIdentitySchema: CASE_INPUT_IDENTITY,
      promptAppend: null,
      comparable,
      completeness: { complete: true, aggregatesAllowed: true },
      inputSnapshot: {
        caseIdsSha256: createHash("sha256").update(JSON.stringify(ids)).digest("hex")
      },
      judgeTiering: {
        policy: "stability-boundary-v1",
        stabilityThreshold: 0.75,
        stabilityRegisterStatus: "available",
        stabilityRegisterSha256: "register",
        maxPanelCases: 100
      },
      agentBinary: { sha256: "binary" },
      agentEnvironment: { inherited: { sha256: "environment" } },
      sourceIdentity: { qaImplementationSha256: "implementation" },
      ...tuple
    },
    rows: grades.map((grade, index) => {
      const id = ids[index];
      return {
        id,
        question: id,
        caseInputSha256: caseHashes[id] ?? CASE_HASH,
        tags: {},
        agent: { failure: failures[id] ?? null },
        verdict: { score: grade }
      };
    })
  };
}

function compare(baseline, candidate, repeats = null) {
  return comparePairedArtifacts({
    baselineRuns: repeats ? [baseline, repeats.baseline] : [baseline],
    candidateRuns: repeats ? [candidate, repeats.candidate] : [candidate]
  });
}

describe("paired QA verdict", () => {
  it("hashes the complete judge-facing case input", () => {
    const original = {
      question: "Question?",
      golden: { answer: "Answer", keyFacts: ["Fact"], avoid: [] },
      tags: { freshness: "stable" }
    };
    expect(caseInputSha256(original)).toHaveLength(64);
    expect(caseInputSha256({ ...original })).toBe(caseInputSha256(original));
    expect(caseInputSha256({ ...original, question: "Changed?" })).not.toBe(caseInputSha256(original));
  });

  it("passes only when both ordinal cutpoints clear the margin", () => {
    const baseline = result(Array(100).fill("partial"));
    const candidate = result(Array(100).fill("partial"));
    const compared = compare(baseline, candidate);

    expect(compared.verdict).toBe("PASS");
    expect(compared.denominator).toBe(100);
    expect(compared.transitionMatrix.partial.partial).toBe(100);
    expect(compared.estimates.strictCorrect.estimate).toBe(0);
    expect(compared.estimates.nonWrong.estimate).toBe(0);
    expect(formatPairedVerdict(compared)).toMatch(/^PASS denominator=100\/100/);
  });

  it("fails a strict-correct loss even when non-wrong is unchanged", () => {
    const compared = compare(
      result(Array(100).fill("correct")),
      result(Array(100).fill("partial"))
    );

    expect(compared.verdict).toBe("FAIL");
    expect(compared.estimates.strictCorrect.estimate).toBe(-1);
    expect(compared.estimates.nonWrong.estimate).toBe(0);
  });

  it("retains every correct, partial, and wrong transition", () => {
    const baselineGrades = [];
    const candidateGrades = [];
    for (const baseline of ["wrong", "partial", "correct"]) {
      for (const candidate of ["wrong", "partial", "correct"]) {
        baselineGrades.push(...Array(6).fill(baseline));
        candidateGrades.push(...Array(6).fill(candidate));
      }
    }
    const compared = compare(result(baselineGrades), result(candidateGrades));

    expect(compared.denominator).toBe(54);
    for (const baseline of ["wrong", "partial", "correct"]) {
      for (const candidate of ["wrong", "partial", "correct"]) {
        expect(compared.transitionMatrix[baseline][candidate]).toBe(6);
      }
    }
  });

  it("keeps a boundary result indeterminate and requests one repeat", () => {
    const baselineGrades = Array(100).fill("correct");
    const candidateGrades = [...baselineGrades];
    candidateGrades.splice(0, 5, ...Array(5).fill("partial"));
    const compared = compare(result(baselineGrades), result(candidateGrades));

    expect(compared.verdict).toBe("INDETERMINATE");
    expect(compared.reasons.map((item) => item.code)).toEqual([
      "statistical-decision",
      "repeat-required"
    ]);
  });

  it("combines exactly one repeat by case and then stops", () => {
    const baselineGrades = Array(100).fill("correct");
    const candidateGrades = [...baselineGrades];
    candidateGrades.splice(0, 5, ...Array(5).fill("partial"));
    const initialBaseline = result(baselineGrades);
    const initialCandidate = result(candidateGrades);
    const repeatBaseline = result(baselineGrades);
    const repeatCandidate = result(baselineGrades);
    const compared = compare(initialBaseline, initialCandidate, {
      baseline: repeatBaseline,
      candidate: repeatCandidate
    });

    expect(compared.verdict).toBe("PASS");
    expect(compared.runPairs).toBe(2);
    expect(compared.estimates.strictCorrect.estimate).toBe(-0.025);

    const stopped = compare(
      result(Array(100).fill("partial")),
      result(Array(100).fill("partial")),
      {
        baseline: result(Array(100).fill("partial")),
        candidate: result(Array(100).fill("partial"))
      }
    );
    expect(stopped.verdict).toBe("INDETERMINATE");
    expect(stopped.reasons[0].code).toBe("repeat-rule");
  });

  it("uses fixed T4 and T5 exclusions and blocks candidate-only losses", () => {
    const baseline = result(Array(100).fill("correct"));
    const candidate = result(Array(100).fill("correct"), {
      failures: {
        "case-000": null,
        "case-001": { class: "provider-safeguard" }
      }
    });
    candidate.rows[0].verdict.score = "error";
    const compared = compare(baseline, candidate);

    expect(compared.verdict).toBe("INDETERMINATE");
    expect(compared.denominator).toBe(98);
    expect(compared.exclusions.T4).toEqual(["case-000"]);
    expect(compared.exclusions.T5).toEqual(["case-001"]);
    expect(compared.reasons.map((item) => item.code)).toEqual([
      "candidate-only-T4",
      "candidate-only-T5"
    ]);
  });

  it("counts an agent-limit termination as wrong in T1", () => {
    expect(classifyPairedRow({
      agent: { failure: { class: "agent", subtype: "error_max_turns" } },
      verdict: { score: "error" }
    })).toEqual({ track: "T1", grade: "wrong", reason: "agent-limit/system failure" });
  });

  it("excludes changed case inputs and enforces the minimum denominator", () => {
    const baseline = result(Array(50).fill("partial"));
    const candidate = result(Array(50).fill("partial"), {
      caseHashes: { "case-000": "b".repeat(64) }
    });
    const compared = compare(baseline, candidate);

    expect(compared.verdict).toBe("INDETERMINATE");
    expect(compared.denominator).toBe(49);
    expect(compared.exclusions.content).toEqual(["case-000"]);
    expect(compared.reasons[0].message).toMatch(/below 50/);
  });

  it("rejects tuple changes before it compares grades", () => {
    const baseline = result(Array(100).fill("partial"));
    const candidate = result(Array(100).fill("partial"), {
      tuple: { judgeRubric: "v-other" }
    });
    const compared = compare(baseline, candidate);

    expect(compared.verdict).toBe("INDETERMINATE");
    expect(compared.denominator).toBe(0);
    expect(compared.reasons.map((item) => item.code)).toContain("measurement-tuple");
  });

  it("keeps strict equality with a confidence boundary indeterminate", () => {
    const deltas = Array(100).fill([0, 0]);
    const decision = statisticalDecision(deltas, { margin: 0, minimumEligibleIds: 50 });
    expect(decision.verdict).toBe("INDETERMINATE");
  });

  it("prints one machine-usable verdict with its denominator and reasons", () => {
    const root = mkdtempSync(join(tmpdir(), "qa-paired-verdict-"));
    try {
      const baselinePath = join(root, "baseline.json");
      const candidatePath = join(root, "candidate.json");
      writeFileSync(baselinePath, JSON.stringify(result(Array(100).fill("partial"))));
      writeFileSync(candidatePath, JSON.stringify(result(Array(100).fill("partial"))));
      const run = spawnSync(
        process.execPath,
        ["eval/qa/paired-verdict.mjs", baselinePath, candidatePath],
        { cwd: process.cwd(), encoding: "utf8" }
      );

      expect(run.status).toBe(0);
      expect(run.stdout.trim().split("\n")).toHaveLength(1);
      expect(run.stdout).toMatch(/^PASS denominator=100\/100 eligible IDs/);
      expect(run.stdout).toContain("reasons=");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
