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
  calibrationFromPairedArtifacts,
  caseInputPayload,
  caseInputSha256,
  classifyPairedRow,
  comparePairedArtifacts,
  formatPairedVerdict,
  statisticalDecision
} from "../eval/qa/paired-verdict.mjs";
import { runPairedVerdictValidation } from "../eval/qa/validate-paired-verdict.mjs";
import {
  REMOTE_IDENTITY_CAPTURE_REUSE_MAX_AGE_MS,
  REMOTE_IDENTITY_GUARD_SCHEMA,
  REMOTE_IDENTITY_VECTOR_SCHEMA,
  createRemoteIdentityGuard,
  runRemoteIdentityGuardedCall,
  remoteIdentityVectorSha256
} from "../eval/qa/remote-identity-guard.mjs";

const REGISTER_HASH = "c".repeat(64);
const ADAPTER_REVISION = "a".repeat(40);
const BASELINE_REVISION = "b".repeat(40);
const CANDIDATE_REVISION = "d".repeat(40);
const ADAPTER_SHA256 = "e".repeat(64);
const REMOTE_PROBE_SHA256 = "f".repeat(64);
const BINARY_SHA256 = "5".repeat(64);
const ENVIRONMENT_SHA256 = "6".repeat(64);

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

const GUARD_START_MS = Date.parse("2026-10-11T02:00:00.000Z");
// The fixture guard starts its monotonic clock at GUARD_START_MS, so the wall clock equals start + elapsed.
const guardWallAt = (elapsedMs) => new Date(GUARD_START_MS + elapsedMs).toISOString();
const guardCheckedAt = (sequence) => guardWallAt(sequence * 10_000);

// Each later before-call check reuses the previous after-call capture 10 s later.
function guardChecks(ids, vectorSha256) {
  const checks = ids.flatMap((id, index) => [
    {
      sequence: index * 2 + 1,
      checkedAt: guardCheckedAt(index * 2 + 1),
      elapsedMs: (index * 2 + 1) * 10_000,
      phase: "before",
      id,
      attempt: 1,
      vectorSha256,
      reusedFromSequence: index === 0 ? null : index * 2
    },
    {
      sequence: index * 2 + 2,
      checkedAt: guardCheckedAt(index * 2 + 2),
      elapsedMs: (index * 2 + 2) * 10_000,
      phase: "after",
      id,
      attempt: 1,
      vectorSha256,
      reusedFromSequence: null
    }
  ]);
  checks.push({
    sequence: ids.length * 2 + 1,
    checkedAt: guardCheckedAt(ids.length * 2 + 1),
    elapsedMs: (ids.length * 2 + 1) * 10_000,
    phase: "postflight",
    id: null,
    attempt: null,
    vectorSha256,
    reusedFromSequence: null
  });
  return checks;
}

// Moves the elapsed time, and optionally the wall clock, of checks[index] and every later check.
function shiftGuardChecks(guard, index, elapsedDeltaMs, wallDeltaMs = elapsedDeltaMs) {
  for (const check of guard.checks.slice(index)) {
    check.elapsedMs += elapsedDeltaMs;
    check.checkedAt = new Date(Date.parse(check.checkedAt) + wallDeltaMs).toISOString();
  }
}

// Builds a guard record with the producer. Row `retriedRow` gets a second answering attempt.
function producedGuardRecord(result, { retriedRow }) {
  const vector = result.meta.remoteIdentityGuard.baselineVector;
  let clockMs = GUARD_START_MS;
  const guard = createRemoteIdentityGuard({
    probeIdentity: {
      contract: REMOTE_IDENTITY_VECTOR_SCHEMA,
      artifactPath: "eval/qa/probe-remote-identities.mjs",
      sha256: REMOTE_PROBE_SHA256,
      expectedSha256: REMOTE_PROBE_SHA256,
      matches: true
    },
    expectedVectorSha256: remoteIdentityVectorSha256(vector),
    capture: () => {
      clockMs += 500;
      return structuredClone(vector);
    },
    now: () => clockMs,
    monotonicNow: () => clockMs
  });
  for (const [index, row] of result.rows.entries()) {
    const numbers = index === retriedRow ? [1, 2] : [1];
    row.attempts.agent = numbers.map((number) => ({ number }));
    for (const number of numbers) {
      runRemoteIdentityGuardedCall({
        guard,
        context: { id: row.id, attempt: number },
        authorize: () => ({}),
        call: () => {
          clockMs += 20_000;
          return { costUsd: 0.1 };
        },
        recordSpend: () => {}
      });
      clockMs += 2_000;
    }
  }
  guard.postflight();
  return guard.record();
}

function freshBeforeCheck(guard, index) {
  guard.checks[index] = { ...guard.checks[index], reusedFromSequence: null };
  guard.successfulCaptureCount += 1;
  guard.reusedCaptureCount -= 1;
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
      agentBinary: {
        sha256: BINARY_SHA256,
        expectedSha256: BINARY_SHA256,
        matches: true
      },
      agentEnvironment: {
        inherited: {
          sha256: ENVIRONMENT_SHA256,
          expectedSha256: ENVIRONMENT_SHA256,
          matches: true
        }
      },
      judgeBinary: {
        sha256: BINARY_SHA256,
        expectedSha256: BINARY_SHA256,
        matches: true
      },
      judgeEnvironment: {
        sha256: ENVIRONMENT_SHA256,
        expectedSha256: ENVIRONMENT_SHA256,
        matches: true
      },
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
        successfulCaptureCount: ids.length + 2,
        reusedCaptureCount: ids.length - 1,
        completedAnsweringCalls: ids.length,
        checks: guardChecks(ids, remoteIdentitySha256),
        captureRetryPolicy: { maximumAttempts: 4, delaysMs: [30_000, 60_000, 120_000] },
        failedCaptureAttempts: [],
        failure: null,
        cancellation: null,
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
        attempts: { agent: [{ number: 1 }], judge: [] },
        verdict: { score: grade }
      };
    })
  };
}

function withRuntimeAdapter(run, arm, overrides = {}) {
  const mode = arm === "baseline" ? "add-missing" : "verify-native";
  const sourceRevision = arm === "baseline" ? BASELINE_REVISION : CANDIDATE_REVISION;
  const publicPort = overrides.publicPort ?? 8788;
  const upstreamPort = overrides.upstreamPort ?? 8790;
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

function setServerRevision(run, revision) {
  run.meta.sourceIdentity.serverRevision = revision;
  run.meta.runtimeAdapter.sourceRevision = revision;
  run.meta.runtimeAdapter.attestation.sourceRevision = revision;
  run.meta.runtimeAdapter.attestation.upstream.revision = revision;
  run.meta.runtimeAdapter.attestationAfter.sourceRevision = revision;
  run.meta.runtimeAdapter.attestationAfter.upstream.revision = revision;
  run.meta.listenerPair.upstream.revision = revision;
  run.meta.listenerPairAfter.upstream.revision = revision;
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
  it.each(["baseline", "candidate", "both", "absent", "panel", "tier-panel", "size-only"])(
    "reports %s panel metadata without changing the paired estimates",
    (kind) => {
      const baseline = result(Array(100).fill("partial"));
      const candidate = result(["correct", ...Array(99).fill("partial")]);
      const before = compare(baseline, candidate);
      for (const [arm, artifact] of [["baseline", baseline], ["candidate", candidate]]) {
        if (kind === arm || kind === "both") artifact.rows[0].verdict.meta = { panelEscalationSkipped: "max-panel-cases" };
        else if (kind === "panel") artifact.rows[0].verdict.meta = { judgeTierUsed: "panel", panelSize: 3, panelDisagreement: false };
        else if (kind === "tier-panel") artifact.rows[0].verdict.meta = { judgeTierUsed: "panel" };
        else if (kind === "size-only") artifact.rows[0].verdict.meta = { judgeTierUsed: "single", panelSize: 3 };
      }
      const after = compare(baseline, candidate);
      const skippedPanelArms = ["baseline", "candidate"].filter((arm) => kind === arm || kind === "both");
      const status = (arm) => skippedPanelArms.includes(arm) ? "skipped-max-panel-cases" : ["panel", "tier-panel"].includes(kind) ? "panel-result" : "no-panel-metadata";
      expect(after.flipPanelConfidence).toEqual([{ id: "case-000", look: 1,
        baselineGrade: "partial", candidateGrade: "correct", baseline: status("baseline"), candidate: status("candidate"), skippedPanelArms }]);
      const { flipPanelConfidence: _before, ...previousDecision } = before;
      const { flipPanelConfidence: _after, ...currentDecision } = after;
      expect(currentDecision).toEqual(previousDecision);
      expect(baseline.meta.judgeTiering.maxPanelCases).toBe(34);
      expect(candidate.meta.judgeTiering.maxPanelCases).toBe(34);
      expect(formatPairedVerdict(after)).toContain(`skipped-max-panel-cases=${skippedPanelArms.length ? 1 : 0}/1`);
      if (skippedPanelArms.length) expect(formatPairedVerdict(after)).toContain(`case-000@1:${skippedPanelArms.join("+")}`);
    }
  );
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

  it("keeps skipped-panel labels separate for each look", () => {
    const baseline = result(Array(100).fill("correct"));
    const candidate = result([...Array(5).fill("partial"), ...Array(95).fill("correct")]);
    const repeats = { baseline: structuredClone(baseline), candidate: structuredClone(candidate) };
    const before = compare(baseline, candidate, repeats);
    baseline.rows[0].verdict.meta = { panelEscalationSkipped: "max-panel-cases" };
    repeats.candidate.rows[0].verdict.meta = { panelEscalationSkipped: "max-panel-cases" };
    const after = compare(baseline, candidate, repeats);
    expect(after.flipPanelConfidence.filter((row) => row.id === "case-000").map((row) => ({
      look: row.look, skippedPanelArms: row.skippedPanelArms
    }))).toEqual([{ look: 1, skippedPanelArms: ["baseline"] }, { look: 2, skippedPanelArms: ["candidate"] }]);
    expect(after.denominator).toBe(before.denominator);
    expect(after.estimates).toEqual(before.estimates);
    expect(after.transitions).toEqual(before.transitions);
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

  it("rejects a stored-judge binary hash mismatch", () => {
    const baseline = result(Array(100).fill("partial"));
    const candidate = result(Array(100).fill("partial"));
    candidate.meta.judgeBinary.sha256 = "7".repeat(64);
    candidate.meta.judgeBinary.expectedSha256 = "7".repeat(64);
    const compared = compare(baseline, candidate);

    expect(compared.verdict).toBe("INDETERMINATE");
    expect(compared.reasons).toContainEqual(
      expect.objectContaining({ code: "binary-environment-pairing" })
    );
  });

  it("rejects valid but different cross-arm judge identity hashes", () => {
    const baseline = result(Array(100).fill("partial"));
    const candidate = result(Array(100).fill("partial"));
    const candidateBinary = "7".repeat(64);
    const candidateEnvironment = "8".repeat(64);
    candidate.meta.agentBinary = {
      sha256: candidateBinary,
      expectedSha256: candidateBinary,
      matches: true
    };
    candidate.meta.judgeBinary = structuredClone(candidate.meta.agentBinary);
    candidate.meta.agentEnvironment.inherited = {
      sha256: candidateEnvironment,
      expectedSha256: candidateEnvironment,
      matches: true
    };
    candidate.meta.judgeEnvironment = structuredClone(candidate.meta.agentEnvironment.inherited);
    const compared = compare(baseline, candidate);

    expect(compared.verdict).toBe("INDETERMINATE");
    expect(compared.reasons).toContainEqual(
      expect.objectContaining({ code: "measurement-tuple" })
    );
  });

  it.each([
    ["missing judge binary", (meta) => { delete meta.judgeBinary; }],
    ["malformed judge binary hash", (meta) => { meta.judgeBinary.sha256 = "bad"; }],
    ["missing expected judge hash", (meta) => { delete meta.judgeBinary.expectedSha256; }],
    ["failed judge hash match", (meta) => { meta.judgeBinary.matches = false; }],
    ["missing judge environment", (meta) => { delete meta.judgeEnvironment; }],
    ["malformed judge environment hash", (meta) => { meta.judgeEnvironment.sha256 = "bad"; }]
  ])("rejects %s", (_label, mutate) => {
    const baseline = result(Array(100).fill("partial"));
    const candidate = result(Array(100).fill("partial"));
    mutate(candidate.meta);
    const compared = compare(baseline, candidate);

    expect(compared.verdict).toBe("INDETERMINATE");
    expect(compared.reasons).toContainEqual(
      expect.objectContaining({ code: "binary-environment-pairing" })
    );
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
    ["a fresh capture at every check", (guard) => {
      for (const [index, check] of guard.checks.entries()) {
        if (check.reusedFromSequence !== null) freshBeforeCheck(guard, index);
      }
    }],
    ["a reuse at the age limit", (guard) => {
      shiftGuardChecks(guard, 4, REMOTE_IDENTITY_CAPTURE_REUSE_MAX_AGE_MS - 10_000);
    }],
    ["a wall clock moved back 90 s", (guard) => {
      shiftGuardChecks(guard, 4, 0, -90_000);
    }],
    ["a producer record with a retried row", (guard, candidate) => {
      candidate.meta.remoteIdentityGuard = producedGuardRecord(candidate, { retriedRow: 3 });
    }]
  ])("accepts a guard record with %s", (_label, mutate) => {
    const baseline = result(Array(100).fill("partial"));
    const candidate = result(Array(100).fill("partial"));
    mutate(candidate.meta.remoteIdentityGuard, candidate);

    expect(compare(baseline, candidate).reasons).not.toContainEqual(
      expect.objectContaining({ code: "remote-identity-guard" })
    );
  });

  it("accepts a guard record whose unavailable captures succeeded on retry", () => {
    const baseline = result(Array(100).fill("partial"));
    const candidate = result(Array(100).fill("partial"));
    const guard = candidate.meta.remoteIdentityGuard;
    freshBeforeCheck(guard, 2);
    guard.failedCaptureAttempts = [1, 2, 3].map((captureAttempt) => ({
      sequence: captureAttempt,
      failedAt: guardWallAt(20_000 + captureAttempt * 2_000),
      elapsedMs: 20_000 + captureAttempt * 2_000,
      phase: "before",
      id: "case-001",
      attempt: 1,
      captureAttempt,
      kind: "nonzero-exit",
      reason: "Lumenloop tools response is incomplete",
      probeRetryLines: 0
    }));

    const compared = compare(baseline, candidate);

    expect(compared.reasons).not.toContainEqual(
      expect.objectContaining({ code: "remote-identity-guard" })
    );
  });

  it("rejects an invalid retry record in recalibration", () => {
    const baseline = result(Array(100).fill("partial"));
    const candidate = result(Array(100).fill("partial"));
    candidate.meta.remoteIdentityGuard.failedCaptureAttempts = [{
      sequence: 1,
      failedAt: "2099-01-01T00:00:00.000Z",
      elapsedMs: 5_000,
      phase: "before",
      id: "case-000",
      attempt: 1,
      captureAttempt: 1,
      kind: "nonzero-exit",
      reason: null,
      probeRetryLines: 0
    }];

    expect(() => calibrationFromPairedArtifacts(baseline, candidate)).toThrow(/remote-identity-guard/);
  });

  it.each([
    ["an after-call check for a call that never ran", (guard) => {
      Object.assign(guard.checks[1], { id: "never-called", attempt: 99 });
    }],
    ["checks for calls outside the results", (guard) => {
      for (const check of guard.checks.slice(0, -1)) Object.assign(check, { id: "not-in-results", attempt: 700 });
    }],
    ["a postflight years before the first check", (guard) => {
      guard.checks.at(-1).checkedAt = "2020-01-01T00:00:00.000Z";
    }]
  ])("rejects %s in recalibration", (_label, mutate) => {
    const baseline = result(Array(100).fill("partial"));
    const candidate = result(Array(100).fill("partial"));
    mutate(candidate.meta.remoteIdentityGuard);

    expect(() => calibrationFromPairedArtifacts(baseline, candidate)).toThrow(/remote-identity-guard/);
  });

  const reuseCounts = (guard, mutate) => {
    mutate();
    guard.successfulCaptureCount -= 1;
    guard.reusedCaptureCount += 1;
  };

  const retriedGuard = (guard) => {
    guard.failedCaptureAttempts = [{
      sequence: 1,
      failedAt: guardWallAt(5_000),
      elapsedMs: 5_000,
      phase: "before",
      id: "case-000",
      attempt: 1,
      captureAttempt: 1,
      kind: "timeout",
      reason: null,
      probeRetryLines: 2
    }];
    return guard.failedCaptureAttempts[0];
  };

  it.each([
    ["missing record", (guard, candidate) => { delete candidate.meta.remoteIdentityGuard; }],
    ["previous guard schema", (guard) => { guard.schema = "qa-remote-identity-guard-v2"; }],
    ["missing retry policy", (guard) => { delete guard.captureRetryPolicy; }],
    ["changed retry delays", (guard) => { guard.captureRetryPolicy.delaysMs = [10_000, 30_000]; }],
    ["missing failed-attempt list", (guard) => { delete guard.failedCaptureAttempts; }],
    ["exhausted capture attempts", (guard) => {
      const entry = retriedGuard(guard);
      guard.failedCaptureAttempts = [1, 2, 3, 4].map((captureAttempt) => ({
        ...entry,
        sequence: captureAttempt,
        captureAttempt
      }));
    }],
    ["skipped capture attempt", (guard) => { retriedGuard(guard).captureAttempt = 2; }],
    ["recorded cancellation", (guard) => {
      guard.cancellation = { phase: "before", id: "case-000", attempt: 1, cancelledAt: "2026-10-11T02:00:00.000Z" };
    }],
    ["missing failure kind", (guard) => { delete retriedGuard(guard).kind; }],
    ["unknown failure kind", (guard) => { retriedGuard(guard).kind = "identity-changed"; }],
    ["missing reason field", (guard) => { delete retriedGuard(guard).reason; }],
    ["missing retry-line count", (guard) => { delete retriedGuard(guard).probeRetryLines; }],
    ["extra failed-attempt field", (guard) => { retriedGuard(guard).stderr = "text"; }],
    ["unallowlisted reason", (guard) => { retriedGuard(guard).reason = "PATH /synthetic/private/bin"; }],
    ["negative retry-line count", (guard) => { retriedGuard(guard).probeRetryLines = -1; }],
    ["invalid failure date", (guard) => { retriedGuard(guard).failedAt = "yesterday"; }],
    ["failure wall clock far from its elapsed time", (guard) => {
      retriedGuard(guard).failedAt = "2099-01-01T00:00:00.000Z";
    }],
    ["failure after its success", (guard) => {
      const entry = retriedGuard(guard);
      entry.elapsedMs = 10_001;
      entry.failedAt = guardWallAt(10_001);
    }],
    ["failure before the check that precedes its call", (guard) => {
      const entry = retriedGuard(guard);
      freshBeforeCheck(guard, 2);
      Object.assign(entry, { id: "case-001", elapsedMs: 19_999, failedAt: guardWallAt(19_999) });
    }],
    ["postflight failure before the last call check", (guard) => {
      const entry = retriedGuard(guard);
      const lastCall = guard.checks.at(-2);
      Object.assign(entry, {
        phase: "postflight",
        id: null,
        attempt: null,
        elapsedMs: lastCall.elapsedMs - 1,
        failedAt: guardWallAt(lastCall.elapsedMs - 1)
      });
    }],
    ["failure without an elapsed time", (guard) => { delete retriedGuard(guard).elapsedMs; }],
    ["success without a check time", (guard) => {
      retriedGuard(guard);
      delete guard.checks[0].checkedAt;
    }],
    ["failure elapsed times out of order", (guard) => {
      const entry = retriedGuard(guard);
      freshBeforeCheck(guard, 2);
      entry.elapsedMs = 25_000;
      entry.id = "case-001";
      entry.failedAt = guardWallAt(25_000);
      guard.failedCaptureAttempts.push({
        ...entry,
        sequence: 2,
        id: "case-000",
        elapsedMs: 5_000,
        failedAt: guardWallAt(5_000)
      });
    }],
    ["failed attempt whose only success is a reuse", (guard) => {
      const entry = retriedGuard(guard);
      guard.failedCaptureAttempts = [{
        ...entry,
        id: "case-001",
        failedAt: guard.checks[1].checkedAt
      }];
    }],
    ["unknown phase", (guard) => { retriedGuard(guard).phase = "during"; }],
    ["broken failed-attempt sequence", (guard) => { retriedGuard(guard).sequence = 2; }],
    ["failed attempt without a later capture", (guard) => { retriedGuard(guard).id = "unknown"; }],
    ["non-probe capture error", (guard) => { retriedGuard(guard).kind = "capture-error"; }],
    ["matches false", (guard) => { guard.matches = false; }],
    ["failure present", (guard) => { guard.failure = { reason: "probe-unavailable" }; }],
    ["probe hash mismatch", (guard) => { guard.probe.expectedSha256 = "0".repeat(64); }],
    ["resume allowed", (guard) => { guard.sameAuthorizationResumeAllowed = true; }],
    ["short check count", (guard) => { guard.successfulCaptureCount -= 1; guard.checks.pop(); }],
    ["missing check list", (guard) => { delete guard.checks; }],
    ["wrong fresh capture count", (guard) => { guard.successfulCaptureCount += 1; guard.reusedCaptureCount -= 1; }],
    ["missing reuse count", (guard) => { delete guard.reusedCaptureCount; }],
    ["check without a reuse field", (guard) => { delete guard.checks[1].reusedFromSequence; }],
    ["extra check field", (guard) => { guard.checks[1].capturedAt = guard.checks[1].checkedAt; }],
    ["check without a row id", (guard) => { guard.checks[3].id = null; }],
    ["postflight with a row id", (guard) => { guard.checks.at(-1).id = "case-099"; }],
    ["changed check vector", (guard) => { guard.checks[5].vectorSha256 = "0".repeat(64); }],
    ["swapped check phases", (guard) => {
      guard.checks[2].phase = "after";
      guard.checks[3].phase = "before";
    }],
    ["reused first before-call check", (guard) => {
      reuseCounts(guard, () => { guard.checks[0].reusedFromSequence = 0; });
    }],
    ["reused after-call check", (guard) => {
      reuseCounts(guard, () => { guard.checks[3].reusedFromSequence = 3; });
    }],
    ["reused postflight", (guard) => {
      reuseCounts(guard, () => { guard.checks.at(-1).reusedFromSequence = guard.checks.length - 1; });
    }],
    ["reuse of an earlier call's capture", (guard) => { guard.checks[4].reusedFromSequence = 2; }],
    ["reuse of a before-call check", (guard) => { guard.checks[4].reusedFromSequence = 3; }],
    ["reuse of a later check", (guard) => { guard.checks[4].reusedFromSequence = 6; }],
    ["reuse past the age limit", (guard) => {
      shiftGuardChecks(guard, 4, REMOTE_IDENTITY_CAPTURE_REUSE_MAX_AGE_MS - 10_000 + 1);
    }],
    ["reuse past the age limit with a wall clock that hides it", (guard) => {
      shiftGuardChecks(guard, 4, 110_000, -90_000);
    }],
    ["reuse dated before its source", (guard) => {
      guard.checks[4].elapsedMs = guard.checks[3].elapsedMs - 1;
    }],
    ["check without an elapsed time", (guard) => { delete guard.checks[2].elapsedMs; }],
    ["fractional elapsed time", (guard) => { guard.checks[2].elapsedMs += 0.5; }],
    ["elapsed time moving back", (guard) => { guard.checks[6].elapsedMs = guard.checks[5].elapsedMs - 1; }],
    ["wall clock past the tolerance", (guard) => { shiftGuardChecks(guard, 4, 0, -300_001); }],
    ["postflight years before the first check", (guard) => {
      guard.checks.at(-1).checkedAt = "2020-01-01T00:00:00.000Z";
    }],
    ["after-call check for a call that never ran", (guard) => {
      Object.assign(guard.checks[1], { id: "never-called", attempt: 99 });
    }],
    ["after-call check for another attempt", (guard) => { guard.checks[1].attempt = 2; }],
    ["checks for calls outside the results", (guard) => {
      for (const check of guard.checks.slice(0, -1)) Object.assign(check, { id: "not-in-results", attempt: 700 });
    }],
    ["checks in a different order from the rows", (guard) => {
      for (const index of [0, 1]) guard.checks[index].id = "case-001";
      for (const index of [2, 3]) guard.checks[index].id = "case-000";
    }],
    ["row without attempt evidence", (guard, candidate) => { delete candidate.rows[4].attempts; }],
    ["row with a skipped attempt number", (guard, candidate) => {
      candidate.rows[4].attempts.agent = [{ number: 2 }];
    }],
    ["row attempt without its guard pair", (guard, candidate) => {
      candidate.rows[4].attempts.agent.push({ number: 2 });
    }],
    ["low call count", (guard) => { guard.completedAnsweringCalls -= 1; }],
    ["high call count", (guard) => { guard.completedAnsweringCalls += 1; }],
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
    ["artifact public port drift", (_baseline, candidate) => {
      candidate.meta.port = 8787;
    }],
    ["listener private port drift", (_baseline, candidate) => {
      candidate.meta.listenerPair.upstream.port = 8791;
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

  it("accepts different internally attested port pairs across arms", () => {
    const baseline = withRuntimeAdapter(
      result(Array(100).fill("partial")),
      "baseline",
      { publicPort: 8789, upstreamPort: 8791 }
    );
    const candidate = withRuntimeAdapter(
      result(Array(100).fill("partial")),
      "candidate",
      { publicPort: 8788, upstreamPort: 8790 }
    );
    const compared = comparePairedArtifacts({ baselineRuns: [baseline], candidateRuns: [candidate] });

    expect(compared.verdict).toBe("PASS");
    expect(compared.reasons.some((item) => item.code === "runtime-adapter-pairing")).toBe(false);
  });

  it("rejects intra-arm port drift across the paired repeat", () => {
    const baselineFirst = withRuntimeAdapter(result(Array(100).fill("correct")), "baseline", {
      publicPort: 8789,
      upstreamPort: 8791
    });
    const baselineSecond = withRuntimeAdapter(result(Array(100).fill("correct")), "baseline", {
      publicPort: 8787,
      upstreamPort: 8793
    });
    const candidateGrades = [...Array(5).fill("partial"), ...Array(95).fill("correct")];
    const candidateFirst = withRuntimeAdapter(result(candidateGrades), "candidate", {
      publicPort: 8788,
      upstreamPort: 8790
    });
    const candidateSecond = withRuntimeAdapter(result(Array(100).fill("correct")), "candidate", {
      publicPort: 8788,
      upstreamPort: 8790
    });
    const compared = comparePairedArtifacts({
      baselineRuns: [baselineFirst, baselineSecond],
      candidateRuns: [candidateFirst, candidateSecond]
    });

    expect(compared.verdict).toBe("INDETERMINATE");
    expect(compared.reasons).toContainEqual(
      expect.objectContaining({ code: "runtime-adapter-pairing" })
    );
  });

  it("rejects intra-arm server revision drift across the paired repeat", () => {
    const baselineFirst = withRuntimeAdapter(result(Array(100).fill("correct")), "baseline");
    const baselineSecond = withRuntimeAdapter(result(Array(100).fill("correct")), "baseline");
    setServerRevision(baselineSecond, "e".repeat(40));
    const candidateGrades = [...Array(5).fill("partial"), ...Array(95).fill("correct")];
    const candidateFirst = withRuntimeAdapter(result(candidateGrades), "candidate");
    const candidateSecond = withRuntimeAdapter(result(Array(100).fill("correct")), "candidate");
    const compared = comparePairedArtifacts({
      baselineRuns: [baselineFirst, baselineSecond],
      candidateRuns: [candidateFirst, candidateSecond]
    });

    expect(compared.verdict).toBe("INDETERMINATE");
    expect(compared.reasons).toContainEqual(
      expect.objectContaining({ code: "server-revision-pairing" })
    );
  });

  it("rejects equal baseline and candidate server revisions", () => {
    const baseline = withRuntimeAdapter(result(Array(100).fill("partial")), "baseline");
    const candidate = withRuntimeAdapter(result(Array(100).fill("partial")), "candidate");
    setServerRevision(candidate, BASELINE_REVISION);
    const compared = comparePairedArtifacts({ baselineRuns: [baseline], candidateRuns: [candidate] });

    expect(compared.verdict).toBe("INDETERMINATE");
    expect(compared.reasons).toContainEqual(
      expect.objectContaining({ code: "server-revision-pairing" })
    );
  });

  it("makes the printer reject equal baseline and candidate revisions", () => {
    const root = mkdtempSync(join(tmpdir(), "qa-paired-verdict-revision-"));
    try {
      const baselinePath = join(root, "baseline.json");
      const candidatePath = join(root, "candidate.json");
      const baseline = withRuntimeAdapter(result(Array(100).fill("partial")), "baseline");
      const candidate = withRuntimeAdapter(result(Array(100).fill("partial")), "candidate");
      setServerRevision(candidate, BASELINE_REVISION);
      writeFileSync(baselinePath, JSON.stringify(baseline));
      writeFileSync(candidatePath, JSON.stringify(candidate));

      const run = spawnSync(
        process.execPath,
        ["eval/qa/paired-verdict.mjs", baselinePath, candidatePath],
        { cwd: process.cwd(), encoding: "utf8" }
      );
      expect(run.status).toBe(2);
      expect(run.stdout).toMatch(/server-revision-pairing/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
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
