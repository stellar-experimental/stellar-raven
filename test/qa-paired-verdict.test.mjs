import { createHash } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import {
  CASE_INPUT_IDENTITY,
  LOOK_ALPHA,
  LOOK_Z,
  MINIMUM_ELIGIBLE_IDS,
  NO_CHANGE_CONFIDENCE_RADIUS,
  caseInputPayload,
  caseInputSha256,
  classifyPairedRow,
  comparePairedArtifacts,
  formatPairedVerdict,
  statisticalDecision
} from "../eval/qa/paired-verdict.mjs";
import { runPairedVerdictValidation } from "../eval/qa/validate-paired-verdict.mjs";
import {
  REMOTE_IDENTITY_GUARD_SCHEMA,
  REMOTE_IDENTITY_VECTOR_SCHEMA,
  remoteIdentityVectorSha256
} from "../eval/qa/remote-identity-guard.mjs";

const REGISTER_HASH = "c".repeat(64);
const ADAPTER_REVISION = "a".repeat(40);
const BASELINE_REVISION = "b".repeat(40);
const CANDIDATE_REVISION = "d".repeat(40);
const ADAPTER_SHA256 = "e".repeat(64);
const REMOTE_PROBE_SHA256 = "f".repeat(64);

function remoteVector() {
  return {
    schema: REMOTE_IDENTITY_VECTOR_SCHEMA,
    services: {
      scout: {
        openapiVersion: "1.9.30",
        canonicalOpenapiSha256: "1".repeat(64)
      },
      lumenloop: {
        advertisedContractIdentity: "openapi-1.0.0",
        canonicalInventorySha256: "2".repeat(64)
      },
      stellarDocs: {
        indexSettingsSha256: "3".repeat(64),
        canonicalTitleSetSha256: "4".repeat(64)
      }
    }
  };
}

function tiering(overrides = {}) {
  return {
    policy: "stability-boundary-v1",
    judgePanel: 1,
    stabilityThreshold: 0.75,
    stabilityRegisterStatus: "available",
    stabilityRegisterSource: "pinned",
    stabilityRegisterSha256: REGISTER_HASH,
    maxPanelCases: 34,
    maxPanelCasesSource: "bounded-scaled-default",
    defaultPanelPolicy: {
      kind: "clamped-one-third",
      numerator: 1,
      denominator: 3,
      rounding: "ceil",
      floor: 10,
      ceiling: 34
    },
    ...overrides
  };
}

function result(grades, {
  caseInputs = {},
  failures = {},
  tuple = {},
  comparable = true
} = {}) {
  const ids = grades.map((_, index) => `case-${String(index).padStart(3, "0")}`);
  const remoteIdentity = remoteVector();
  const remoteIdentitySha256 = remoteIdentityVectorSha256(remoteIdentity);
  return {
    meta: {
      variant: "A",
      surface: "search-execute",
      model: "answer-model",
      judgeModel: "judge-model",
      judgeRubric: "v-test",
      judgePanel: 1,
      packVersion: "p-test",
      resultsSchema: "qa-agent-result-v4",
      caseIdentitySchema: CASE_INPUT_IDENTITY,
      promptAppend: null,
      comparable,
      completeness: { complete: true, aggregatesAllowed: true },
      inputSnapshot: {
        caseIdsSha256: createHash("sha256").update(JSON.stringify(ids)).digest("hex")
      },
      judgeTiering: tiering(),
      agentBinary: { sha256: "binary" },
      agentEnvironment: { inherited: { sha256: "environment" } },
      sourceIdentity: { qaImplementationSha256: "implementation" },
      remoteIdentityGuard: {
        schema: REMOTE_IDENTITY_GUARD_SCHEMA,
        probe: {
          contract: REMOTE_IDENTITY_VECTOR_SCHEMA,
          path: "eval/qa/probe-remote-identities.mjs",
          sha256: REMOTE_PROBE_SHA256,
          expectedSha256: REMOTE_PROBE_SHA256,
          matches: true
        },
        matches: true,
        expectedBaselineVectorSha256: remoteIdentitySha256,
        baselineVectorSha256: remoteIdentitySha256,
        baselineVector: remoteIdentity,
        finalVector: structuredClone(remoteIdentity),
        postflight: {
          attempted: true,
          matches: true,
          vectorSha256: remoteIdentitySha256,
          skippedReason: null
        },
        successfulCaptureCount: ids.length * 2 + 1,
        completedAnsweringCalls: ids.length,
        captures: [
          ...Array.from({ length: ids.length * 2 }, (_, index) => ({
            sequence: index + 1,
            phase: index % 2 === 0 ? "before" : "after",
            vectorSha256: remoteIdentitySha256
          })),
          {
            sequence: ids.length * 2 + 1,
            phase: "postflight",
            vectorSha256: remoteIdentitySha256
          }
        ],
        failure: null,
        sameAuthorizationResumeAllowed: false,
        requiresNewAuthorization: false
      },
      ...tuple
    },
    rows: grades.map((grade, index) => {
      const id = ids[index];
      const caseInput = caseInputPayload(caseInputs[id] ?? {
        question: id,
        golden: { answer: `answer-${id}`, keyFacts: [], avoid: [] },
        tags: { freshness: "stable", trap: null }
      });
      return {
        id,
        question: id,
        caseInput,
        caseInputSha256: caseInputSha256(caseInput),
        tags: caseInput.tags,
        agent: { failure: failures[id] ?? null },
        verdict: { score: grade }
      };
    })
  };
}

function withRuntimeAdapter(run, arm, overrides = {}) {
  const mode = arm === "baseline" ? "add-missing" : "verify-native";
  const sourceRevision = arm === "baseline" ? BASELINE_REVISION : CANDIDATE_REVISION;
  const publicPort = 8788;
  const upstreamPort = 8790;
  const listenerPair = {
    verification: "dual-listener-process-cwd",
    adapter: {
      verification: "listener-process-cwd",
      port: publicPort,
      pid: 101,
      command: "node",
      cwd: "/tmp/runner",
      revision: ADAPTER_REVISION,
      dirty: false
    },
    upstream: {
      verification: "listener-process-cwd",
      port: upstreamPort,
      pid: arm === "baseline" ? 201 : 301,
      command: "workerd",
      cwd: arm === "baseline" ? "/tmp/baseline" : "/tmp/candidate",
      revision: sourceRevision,
      dirty: false
    }
  };
  const attestation = {
    schema: "exact-old-runtime-adapter-v1",
    mode,
    sourceRevision,
    implementationSha256: ADAPTER_SHA256,
    upstream: {
      url: `http://127.0.0.1:${upstreamPort}/`,
      port: upstreamPort,
      pid: listenerPair.upstream.pid,
      cwd: listenerPair.upstream.cwd,
      revision: sourceRevision,
      dirty: false
    },
    matches: true
  };
  const runtimeAdapter = {
    schema: "exact-old-runtime-adapter-v1",
    mode,
    adapterRevision: ADAPTER_REVISION,
    implementationSha256: ADAPTER_SHA256,
    publicPort,
    upstreamPort,
    sourceRevision,
    attestation,
    attestationAfter: structuredClone(attestation),
    ...overrides.runtimeAdapter
  };
  return {
    ...run,
    meta: {
      ...run.meta,
      port: publicPort,
      sourceIdentity: { ...run.meta.sourceIdentity, serverRevision: sourceRevision },
      runtimeAdapter,
      listenerPair: overrides.listenerPair ?? listenerPair,
      listenerPairAfter: overrides.listenerPairAfter ?? structuredClone(listenerPair),
      listenerPairGuard: overrides.listenerPairGuard ?? {
        verification: "dual-listener-process-stability",
        adapter: { matches: true },
        upstream: { matches: true },
        matches: true
      }
    }
  };
}

function compare(baseline, candidate, repeats = null) {
  return comparePairedArtifacts({
    baselineRuns: repeats
      ? [withRuntimeAdapter(baseline, "baseline"), withRuntimeAdapter(repeats.baseline, "baseline")]
      : [withRuntimeAdapter(baseline, "baseline")],
    candidateRuns: repeats
      ? [withRuntimeAdapter(candidate, "candidate"), withRuntimeAdapter(repeats.candidate, "candidate")]
      : [withRuntimeAdapter(candidate, "candidate")]
  });
}

function matrixTotal(matrix) {
  return Object.values(matrix).reduce(
    (total, row) => total + Object.values(row).reduce((sum, value) => sum + value, 0),
    0
  );
}

describe("paired QA verdict", () => {
  it("hashes canonical judge-facing case input and ignores harmless key order", () => {
    const first = {
      question: "Question?",
      golden: { answer: "Answer", keyFacts: ["Fact"], avoid: [] },
      tags: { freshness: "stable", trap: "cant-do", service: "ignored" }
    };
    const reordered = {
      tags: { service: "different-ignored-value", trap: "cant-do", freshness: "stable" },
      golden: { avoid: [], keyFacts: ["Fact"], answer: "Answer" },
      question: "Question?"
    };
    expect(caseInputSha256(first)).toHaveLength(64);
    expect(caseInputSha256(first)).toBe(caseInputSha256(reordered));
    expect(caseInputPayload(first)).toEqual(caseInputPayload(reordered));
    expect(caseInputSha256({ ...first, question: "Changed?" })).not.toBe(caseInputSha256(first));
  });

  it("passes only when both ordinal cutpoints clear the experimental margin", () => {
    const compared = compare(
      result(Array(100).fill("partial")),
      result(Array(100).fill("partial"))
    );

    expect(compared.verdict).toBe("PASS");
    expect(compared.denominator).toBe(100);
    expect(compared.transitions.perId.matrix.partial.partial).toBe(100);
    expect(compared.estimates.strictCorrect.estimate).toBe(0);
    expect(compared.estimates.nonWrong.estimate).toBe(0);
    expect(compared.verdictLabel).toBe(
      "PASS (experimental margin 0.08 = no-change radius; not a product tolerance)"
    );
    expect(formatPairedVerdict(compared)).toMatch(/^PASS \(experimental margin 0\.08/);
  });

  it("reads stored artifacts that still carry the retired coverage keys", () => {
    // Artifacts produced before the coverage-share retirement, such as the
    // 2026-09-04T05-40-51-variantA arm, stamp `meanContinuousCoverage` and
    // `continuousCoverageRowCount`. Neither key is part of the measurement
    // tuple, so an asymmetric pair still compares and the values are ignored.
    const retired = { meanContinuousCoverage: 0.5601952380952382, continuousCoverageRowCount: 500 };
    const compared = compare(
      result(Array(100).fill("partial")),
      result(Array(100).fill("partial"), { tuple: retired })
    );

    expect(compared.verdict).toBe("PASS");
    expect(compared.denominator).toBe(100);
    expect(compared.reasons.some((item) => item.code === "measurement-tuple")).toBe(false);
  });

  it("fails when an upper bound demonstrates a loss", () => {
    const deltas = [
      ...Array(8).fill([-1, -1]),
      ...Array(92).fill([0, 0])
    ];
    const decision = statisticalDecision(deltas);

    expect(decision.verdict).toBe("FAIL");
    expect(decision.code).toBe("loss-demonstrated");
    expect(decision.estimates.strictCorrect.upper).toBeLessThan(0);
    expect(decision.estimates.nonWrong.upper).toBeLessThan(0);
  });

  it("retains every correct, partial, and wrong transition", () => {
    const baselineGrades = [];
    const candidateGrades = [];
    for (const baseline of ["wrong", "partial", "correct"]) {
      for (const candidate of ["wrong", "partial", "correct"]) {
        baselineGrades.push(...Array(12).fill(baseline));
        candidateGrades.push(...Array(12).fill(candidate));
      }
    }
    const compared = compare(result(baselineGrades), result(candidateGrades));

    expect(compared.denominator).toBe(108);
    for (const baseline of ["wrong", "partial", "correct"]) {
      for (const candidate of ["wrong", "partial", "correct"]) {
        expect(compared.transitions.perId.matrix[baseline][candidate]).toBe(12);
      }
    }
  });

  it("keeps a confidence-boundary result indeterminate and requests one repeat", () => {
    const baselineGrades = Array(100).fill("correct");
    const candidateGrades = [...baselineGrades];
    candidateGrades.splice(0, 5, ...Array(5).fill("partial"));
    const compared = compare(result(baselineGrades), result(candidateGrades));

    expect(compared.verdict).toBe("INDETERMINATE");
    expect(compared.reasons.map((item) => item.code)).toEqual([
      "confidence-bounds-overlap",
      "repeat-required"
    ]);
  });

  it("combines exactly one repeat by ID and labels both matrix units", () => {
    const baselineGrades = Array(100).fill("correct");
    const candidateGrades = [...baselineGrades];
    candidateGrades.splice(0, 5, ...Array(5).fill("partial"));
    const compared = compare(
      result(baselineGrades),
      result(candidateGrades),
      {
        baseline: result(baselineGrades),
        candidate: result(baselineGrades)
      }
    );

    expect(compared.verdict).toBe("PASS");
    expect(compared.runPairs).toBe(2);
    expect(compared.estimates.strictCorrect.estimate).toBe(-0.025);
    expect(compared.transitions.perLook).toHaveLength(2);
    expect(compared.transitions.perLook.map((look) => matrixTotal(look.matrix))).toEqual([100, 100]);
    expect(compared.transitions.perLook[0].unit).toBe("attempts");
    expect(compared.transitions.perId.unit).toBe("ids");
    expect(compared.transitions.perId.basis).toBe("first-look");
    expect(matrixTotal(compared.transitions.perId.matrix)).toBe(100);

    const stopped = compare(
      result(Array(100).fill("partial")),
      result(Array(100).fill("partial")),
      {
        baseline: result(Array(100).fill("partial")),
        candidate: result(Array(100).fill("partial"))
      }
    );
    expect(stopped.verdict).toBe("INDETERMINATE");
    expect(stopped.reasons.map((item) => item.code)).toEqual([
      "experimental-margin-cleared",
      "repeat-rule"
    ]);
  });

  it("counts each T1 attempt by look before applying union exclusions by ID", () => {
    const baselineGrades = Array(100).fill("correct");
    const candidateGrades = [...baselineGrades];
    candidateGrades.splice(0, 5, ...Array(5).fill("partial"));
    const repeatCandidate = result(baselineGrades, {
      failures: { "case-010": { class: "timeout" } }
    });
    const compared = compare(
      result(baselineGrades),
      result(candidateGrades),
      {
        baseline: result(baselineGrades),
        candidate: repeatCandidate
      }
    );

    expect(compared.verdict).toBe("INDETERMINATE");
    expect(compared.exclusions.T5).toEqual(["case-010"]);
    expect(compared.transitions.perLook.map((look) => matrixTotal(look.matrix))).toEqual([100, 99]);
    expect(matrixTotal(compared.transitions.perId.matrix)).toBe(99);
  });

  it("keeps the initial blocker when a disallowed second pair is supplied", () => {
    const baseline = result(Array(100).fill("correct"));
    const candidate = result(Array(100).fill("correct"), {
      failures: { "case-010": { class: "timeout" } }
    });
    const stopped = compare(baseline, candidate, {
      baseline: result(Array(100).fill("correct")),
      candidate: result(Array(100).fill("correct"))
    });

    expect(stopped.verdict).toBe("INDETERMINATE");
    expect(stopped.reasons.map((item) => item.code)).toEqual([
      "candidate-only-T5",
      "repeat-rule"
    ]);
  });

  it("uses fixed T4 and T5 exclusions and blocks candidate-only losses", () => {
    const baseline = result(Array(102).fill("correct"));
    const candidate = result(Array(102).fill("correct"), {
      failures: { "case-001": { class: "provider-safeguard" } }
    });
    candidate.rows[0].verdict.score = "error";
    const compared = compare(baseline, candidate);

    expect(compared.verdict).toBe("INDETERMINATE");
    expect(compared.denominator).toBe(100);
    expect(compared.exclusions.T4).toEqual(["case-000"]);
    expect(compared.exclusions.T5).toEqual(["case-001"]);
    expect(compared.reasons.map((item) => item.code)).toEqual([
      "candidate-only-T4",
      "candidate-only-T5"
    ]);
  });

  it("treats a T4 to T5 swap as a union exclusion, not candidate-only", () => {
    const baseline = result(Array(101).fill("correct"), {
      failures: { "case-000": { class: "spawn" } }
    });
    const candidate = result(Array(101).fill("correct"), {
      failures: { "case-000": { class: "timeout" } }
    });
    const compared = compare(baseline, candidate);

    expect(compared.denominator).toBe(100);
    expect(compared.exclusions.T5).toEqual(["case-000"]);
    expect(compared.candidateOnly).toEqual({ T4: [], T5: [] });
    expect(compared.verdict).toBe("PASS");
  });

  it("counts an agent-limit termination as wrong in T1", () => {
    expect(classifyPairedRow({
      agent: { failure: { class: "agent", subtype: "error_max_turns" } },
      verdict: { score: "error" }
    })).toEqual({ track: "T1", grade: "wrong", reason: "agent-limit/system failure" });
  });

  it("returns the powered denominator reason below n=100", () => {
    const compared = compare(
      result(Array(99).fill("partial")),
      result(Array(99).fill("partial"))
    );

    expect(compared.verdict).toBe("INDETERMINATE");
    expect(compared.denominator).toBe(99);
    expect(compared.reasons).toEqual([
      expect.objectContaining({ code: "denominator-below-powered-n" })
    ]);
    expect(compared.reasons[0].message).toContain("powered n=100");
  });

  it("excludes a changed canonical case input", () => {
    const baseline = result(Array(101).fill("partial"));
    const candidate = result(Array(101).fill("partial"), {
      caseInputs: {
        "case-000": {
          question: "changed",
          golden: { answer: "answer", keyFacts: [], avoid: [] },
          tags: { freshness: "stable", trap: null }
        }
      }
    });
    const compared = compare(baseline, candidate);

    expect(compared.denominator).toBe(100);
    expect(compared.exclusions.content).toEqual(["case-000"]);
  });

  it("rejects rubric tuple changes before it compares grades", () => {
    const baseline = result(Array(100).fill("partial"));
    const candidate = result(Array(100).fill("partial"), {
      tuple: { judgeRubric: "v-other" }
    });
    const compared = compare(baseline, candidate);

    expect(compared.verdict).toBe("INDETERMINATE");
    expect(compared.denominator).toBe(0);
    expect(compared.reasons.map((item) => item.code)).toContain("measurement-tuple");
  });

  it("rejects a forced judge-panel size change", () => {
    const baseline = result(Array(100).fill("partial"), {
      tuple: { judgePanel: 2, judgeTiering: tiering({ policy: "forced-panel", judgePanel: 2 }) }
    });
    const candidate = result(Array(100).fill("partial"), {
      tuple: { judgePanel: 3, judgeTiering: tiering({ policy: "forced-panel", judgePanel: 3 }) }
    });
    const compared = compare(baseline, candidate);

    expect(compared.verdict).toBe("INDETERMINATE");
    expect(compared.reasons.map((item) => item.code)).toContain("measurement-tuple");
  });

  it("rejects an unpinned stability register", () => {
    const unpinned = tiering({ stabilityRegisterSource: "regenerated" });
    const compared = compare(
      result(Array(100).fill("partial"), { tuple: { judgeTiering: unpinned } }),
      result(Array(100).fill("partial"), { tuple: { judgeTiering: unpinned } })
    );

    expect(compared.verdict).toBe("INDETERMINATE");
    expect(compared.reasons).toContainEqual(
      expect.objectContaining({ code: "measurement-tuple" })
    );
  });

  it("rejects different remote identity vectors", () => {
    const baseline = result(Array(100).fill("partial"));
    const candidate = result(Array(100).fill("partial"));
    candidate.meta.remoteIdentityGuard.baselineVector.services.scout.openapiVersion = "1.9.31";
    candidate.meta.remoteIdentityGuard.finalVector.services.scout.openapiVersion = "1.9.31";
    const compared = compare(baseline, candidate);

    expect(compared.verdict).toBe("INDETERMINATE");
    expect(compared.reasons).toContainEqual(
      expect.objectContaining({ code: "remote-identity-guard" })
    );
  });

  it.each([
    ["missing record", (guard, candidate) => { delete candidate.meta.remoteIdentityGuard; }],
    ["matches false", (guard) => { guard.matches = false; }],
    ["failure present", (guard) => { guard.failure = { reason: "probe-unavailable" }; }],
    ["probe hash mismatch", (guard) => { guard.probe.expectedSha256 = "0".repeat(64); }],
    ["resume allowed", (guard) => { guard.sameAuthorizationResumeAllowed = true; }],
    ["short capture count", (guard) => { guard.successfulCaptureCount -= 1; guard.captures.pop(); }],
    ["low call count", (guard) => { guard.completedAnsweringCalls -= 1; }],
    ["drifted final vector", (guard) => {
      guard.finalVector.services.scout.openapiVersion = "1.9.31";
      guard.postflight.vectorSha256 = remoteIdentityVectorSha256(guard.finalVector);
    }]
  ])("rejects remote guard mutation: %s", (_label, mutate) => {
    const baseline = result(Array(100).fill("partial"));
    const candidate = result(Array(100).fill("partial"));
    mutate(candidate.meta.remoteIdentityGuard, candidate);

    const compared = compare(baseline, candidate);

    expect(compared.verdict).toBe("INDETERMINATE");
    expect(compared.reasons).toContainEqual(
      expect.objectContaining({ code: "remote-identity-guard" })
    );
  });

  it.each([
    ["guard stop", "guard-already-stopped"],
    ["unexpected text", "unexpected"],
    ["empty text", ""],
    ["false", false],
    ["zero", 0],
    ["missing field", undefined]
  ])("rejects a successful postflight with %s as skippedReason", (_label, skippedReason) => {
    const baseline = result(Array(100).fill("partial"));
    const candidate = result(Array(100).fill("partial"));
    candidate.meta.remoteIdentityGuard.postflight.skippedReason = skippedReason;

    const compared = compare(baseline, candidate);

    expect(compared.verdict).toBe("INDETERMINATE");
    expect(compared.reasons).toContainEqual(
      expect.objectContaining({ code: "remote-identity-guard" })
    );
  });

  it.each([
    ["missing baseline adapter", (baseline) => { baseline.meta.runtimeAdapter = null; }],
    ["direct candidate", (_baseline, candidate) => { candidate.meta.runtimeAdapter = null; }],
    ["wrong schema", (baseline) => { baseline.meta.runtimeAdapter.schema = "other"; }],
    ["mixed adapter revision", (_baseline, candidate) => {
      candidate.meta.runtimeAdapter.adapterRevision = "f".repeat(40);
      candidate.meta.listenerPair.adapter.revision = "f".repeat(40);
      candidate.meta.listenerPairAfter.adapter.revision = "f".repeat(40);
    }],
    ["mixed adapter hash", (_baseline, candidate) => {
      candidate.meta.runtimeAdapter.implementationSha256 = "f".repeat(64);
      candidate.meta.runtimeAdapter.attestation.implementationSha256 = "f".repeat(64);
      candidate.meta.runtimeAdapter.attestationAfter.implementationSha256 = "f".repeat(64);
    }],
    ["mixed public port", (_baseline, candidate) => {
      candidate.meta.runtimeAdapter.publicPort = 8787;
      candidate.meta.port = 8787;
      candidate.meta.listenerPair.adapter.port = 8787;
      candidate.meta.listenerPairAfter.adapter.port = 8787;
    }],
    ["mixed private port", (_baseline, candidate) => {
      candidate.meta.runtimeAdapter.upstreamPort = 8791;
      candidate.meta.listenerPair.upstream.port = 8791;
      candidate.meta.listenerPairAfter.upstream.port = 8791;
      candidate.meta.runtimeAdapter.attestation.upstream.port = 8791;
      candidate.meta.runtimeAdapter.attestationAfter.upstream.port = 8791;
    }],
    ["reversed modes", (baseline, candidate) => {
      baseline.meta.runtimeAdapter.mode = "verify-native";
      baseline.meta.runtimeAdapter.attestation.mode = "verify-native";
      baseline.meta.runtimeAdapter.attestationAfter.mode = "verify-native";
      candidate.meta.runtimeAdapter.mode = "add-missing";
      candidate.meta.runtimeAdapter.attestation.mode = "add-missing";
      candidate.meta.runtimeAdapter.attestationAfter.mode = "add-missing";
    }],
    ["mixed candidate mode", (_baseline, candidate) => {
      candidate.meta.runtimeAdapter.mode = "add-missing";
      candidate.meta.runtimeAdapter.attestation.mode = "add-missing";
      candidate.meta.runtimeAdapter.attestationAfter.mode = "add-missing";
    }],
    ["adapter source mismatch", (baseline) => {
      baseline.meta.runtimeAdapter.sourceRevision = "f".repeat(40);
    }],
    ["adapter attestation drift", (baseline) => {
      baseline.meta.runtimeAdapter.attestationAfter.upstream.pid += 1;
    }],
    ["listener attestation drift", (baseline) => {
      baseline.meta.listenerPairAfter.upstream.pid += 1;
    }],
    ["missing listener guard", (baseline) => { baseline.meta.listenerPairGuard = null; }],
    ["failed listener guard", (_baseline, candidate) => {
      candidate.meta.listenerPairGuard.matches = false;
    }]
  ])("rejects the %s topology", (_name, mutate) => {
    const baseline = withRuntimeAdapter(result(Array(100).fill("partial")), "baseline");
    const candidate = withRuntimeAdapter(result(Array(100).fill("partial")), "candidate");
    mutate(baseline, candidate);
    const compared = comparePairedArtifacts({ baselineRuns: [baseline], candidateRuns: [candidate] });

    expect(compared.verdict).toBe("INDETERMINATE");
    expect(compared.denominator).toBe(0);
    expect(compared.reasons).toContainEqual(
      expect.objectContaining({ code: "runtime-adapter-pairing" })
    );
  });

  it("keeps strict equality with the experimental margin boundary indeterminate", () => {
    const deltas = [...Array(5).fill([-1, 0]), ...Array(95).fill([0, 0])];
    const first = statisticalDecision(deltas);
    const boundaryMargin = -first.estimates.strictCorrect.lower;
    const decision = statisticalDecision(deltas, { margin: boundaryMargin });
    expect(decision.verdict).toBe("INDETERMINATE");
  });

  it("prints estimates, bounds, eligibility, look, and reasons on one line", () => {
    const root = mkdtempSync(join(tmpdir(), "qa-paired-verdict-"));
    try {
      const baselinePath = join(root, "baseline.json");
      const candidatePath = join(root, "candidate.json");
      writeFileSync(
        baselinePath,
        JSON.stringify(withRuntimeAdapter(result(Array(100).fill("partial")), "baseline"))
      );
      writeFileSync(
        candidatePath,
        JSON.stringify(withRuntimeAdapter(result(Array(100).fill("partial")), "candidate"))
      );
      const run = spawnSync(
        process.execPath,
        ["eval/qa/paired-verdict.mjs", baselinePath, candidatePath],
        { cwd: process.cwd(), encoding: "utf8" }
      );

      expect(run.status).toBe(0);
      expect(run.stdout.trim().split("\n")).toHaveLength(1);
      expect(run.stdout).toContain("eligible=100/100");
      expect(run.stdout).toContain("look=1/2");
      expect(run.stdout).toContain("strictCorrect=0.0000[0.0000,0.0000]");
      expect(run.stdout).toContain("reasons=");

      const jsonRun = spawnSync(
        process.execPath,
        ["eval/qa/paired-verdict.mjs", baselinePath, candidatePath, "--json"],
        { cwd: process.cwd(), encoding: "utf8" }
      );
      expect(jsonRun.status).toBe(0);
      expect(JSON.parse(jsonRun.stdout)).toMatchObject({
        verdict: "PASS",
        verdictLabel: "PASS (experimental margin 0.08 = no-change radius; not a product tolerance)"
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("keeps JSON output on an input failure", () => {
    const run = spawnSync(
      process.execPath,
      ["eval/qa/paired-verdict.mjs", "--json", "/no/such/a.json", "/no/such/b.json"],
      { cwd: process.cwd(), encoding: "utf8" }
    );

    expect(run.status).toBe(2);
    const parsed = JSON.parse(run.stdout);
    expect(parsed.verdict).toBe("INDETERMINATE");
    expect(parsed.verdictLabel).toBe("INDETERMINATE");
    expect(parsed.reasons).toEqual([expect.objectContaining({ code: "command-error" })]);
  });

  it("runs reduced deterministic operating-characteristic gates under npm test", () => {
    const validation = runPairedVerdictValidation({ iterations: 5_000 });

    expect(validation.pass).toBe(true);
    expect(validation.gates).toEqual(expect.objectContaining({
      noChangeFailControl: true,
      noChangeTwoLookPassPower: true,
      twelvePointFailPower: true,
      falsePassAtEightPointLoss: true
    }));
    expect(MINIMUM_ELIGIBLE_IDS).toBe(100);
    expect(NO_CHANGE_CONFIDENCE_RADIUS).toBe(0.08);
    expect(LOOK_ALPHA).toBe(0.007143);
    expect(LOOK_Z).toBeCloseTo(2.45, 3);
  });
});
