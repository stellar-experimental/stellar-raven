import { createHash } from "node:crypto";
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  REMOTE_IDENTITY_CAPTURE_RETRY_DELAYS_MS,
  REMOTE_IDENTITY_GUARD_SCHEMA,
  REMOTE_IDENTITY_MAX_CAPTURE_ATTEMPTS,
  REMOTE_IDENTITY_MAX_CAPTURE_WAIT_MS,
  REMOTE_IDENTITY_PROBE_PROCESS_TIMEOUT_MS,
  REMOTE_IDENTITY_VECTOR_SCHEMA,
  RemoteIdentityProbeError,
  captureRemoteIdentity,
  compareRemoteIdentityVectors,
  createRemoteIdentityGuard,
  parseRemoteIdentityVector,
  probeStderrDiagnostics,
  remoteIdentityProbeIdentity,
  remoteIdentityVectorSha256,
  runRemoteIdentityGuardedCall
} from "../eval/qa/remote-identity-guard.mjs";
import { PAIRED_COLLECTION_DEADLINE_MS } from "../eval/qa/paired-collection-supervisor.mjs";
import {
  applyCollectionComparability,
  collectionComparabilityReasons,
  collectionAggregates
} from "../eval/qa/run-qa.mjs";

const HASH = {
  scout: "1".repeat(64),
  lumenloop: "2".repeat(64),
  docsSettings: "3".repeat(64),
  docsTitles: "4".repeat(64)
};

function vector() {
  return {
    schema: REMOTE_IDENTITY_VECTOR_SCHEMA,
    services: {
      scout: {
        openapiVersion: "1.9.30",
        canonicalOpenapiSha256: HASH.scout
      },
      lumenloop: {
        advertisedContractIdentity: "openapi-1.0.0",
        canonicalInventorySha256: HASH.lumenloop
      },
      stellarDocs: {
        indexSettingsSha256: HASH.docsSettings,
        canonicalTitleSetSha256: HASH.docsTitles
      }
    }
  };
}

function changedVector(service) {
  const changed = structuredClone(vector());
  if (service === "scout") changed.services.scout.openapiVersion = "1.9.31";
  if (service === "lumenloop") {
    changed.services.lumenloop.canonicalInventorySha256 = "5".repeat(64);
  }
  if (service === "stellarDocs") {
    changed.services.stellarDocs.indexSettingsSha256 = "6".repeat(64);
  }
  return changed;
}

function queuedCapture(values) {
  let index = 0;
  return () => {
    const value = values[index++];
    if (value instanceof Error) throw value;
    return structuredClone(value);
  };
}

function fakeProbeIdentity() {
  return {
    contract: REMOTE_IDENTITY_VECTOR_SCHEMA,
    artifactPath: "eval/qa/test-probe",
    sha256: "a".repeat(64),
    expectedSha256: "a".repeat(64),
    matches: true
  };
}

describe("QA remote identity vector contract", () => {
  it("accepts matching vectors for all three services", () => {
    expect(compareRemoteIdentityVectors(vector(), structuredClone(vector()))).toEqual({
      matches: true,
      changedServices: []
    });
  });

  it.each(["scout", "lumenloop", "stellarDocs"])(
    "detects a %s identity change",
    (service) => {
      expect(compareRemoteIdentityVectors(vector(), changedVector(service))).toEqual({
        matches: false,
        changedServices: [service]
      });
    }
  );

  it("rejects volatile timestamps and any other extra field", () => {
    const withTimestamp = vector();
    withTimestamp.capturedAt = "2026-09-04T00:00:00.000Z";
    expect(() => parseRemoteIdentityVector(withTimestamp)).toThrow(/contain exactly/);

    const serviceTimestamp = vector();
    serviceTimestamp.services.scout.generatedAt = "2026-09-04T00:00:00.000Z";
    expect(() => parseRemoteIdentityVector(serviceTimestamp)).toThrow(/contain exactly/);
  });
});

describe("QA remote identity probe", () => {
  it("pins the executable and never exposes raw probe output on failure", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "qa-remote-probe-"));
    try {
      const command = path.join(root, "probe");
      writeFileSync(command, "#!/bin/sh\nprintf '%s\\n' 'not-json secret-value'\nprintf '%s\\n' 'stderr-secret' >&2\n");
      chmodSync(command, 0o755);
      const digest = createHash("sha256").update(readFileSync(command)).digest("hex");
      const identity = remoteIdentityProbeIdentity(command, digest);

      expect(() => captureRemoteIdentity(identity)).toThrow(/kind=invalid-json/);
      try {
        captureRemoteIdentity(identity);
      } catch (error) {
        expect(error.message).not.toContain("secret-value");
        expect(error.message).not.toContain("stderr-secret");
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("QA remote identity call guard", () => {
  it("captures a matching pair around every answering call", () => {
    const baseline = vector();
    const guard = createRemoteIdentityGuard({
      probeIdentity: fakeProbeIdentity(),
      expectedVectorSha256: remoteIdentityVectorSha256(baseline),
      capture: queuedCapture([baseline, baseline, baseline, baseline, baseline])
    });
    const paidCalls = [];

    for (const id of ["a", "b"]) {
      runRemoteIdentityGuardedCall({
        guard,
        context: { id, attempt: 1 },
        authorize: () => ({ id }),
        call: () => {
          paidCalls.push(id);
          return { costUsd: 0.1 };
        },
        recordSpend: () => {}
      });
    }
    guard.postflight();

    expect(paidCalls).toEqual(["a", "b"]);
    expect(guard.record()).toMatchObject({
      matches: true,
      successfulCaptureCount: 5,
      completedAnsweringCalls: 2,
      failure: null,
      sameAuthorizationResumeAllowed: false,
      requiresNewAuthorization: false
    });
    expect(guard.record().captures.map((capture) => capture.phase)).toEqual([
      "before",
      "after",
      "before",
      "after",
      "postflight"
    ]);
  });

  it.each(["scout", "lumenloop", "stellarDocs"])(
    "stops after a %s change and records both vectors",
    (service) => {
      const baseline = vector();
      const changed = changedVector(service);
      const guard = createRemoteIdentityGuard({
        probeIdentity: fakeProbeIdentity(),
        expectedVectorSha256: remoteIdentityVectorSha256(baseline),
        capture: queuedCapture([baseline, changed])
      });
      const rows = [];

      expect(() => runRemoteIdentityGuardedCall({
        guard,
        context: { id: "a", attempt: 1 },
        authorize: () => ({ id: "a" }),
        call: () => ({ id: "a", costUsd: 0.1 }),
        onCompleted: (row) => rows.push(row),
        recordSpend: () => {}
      })).toThrow(new RegExp(service));

      expect(rows).toEqual([{ id: "a", costUsd: 0.1 }]);
      expect(guard.record()).toMatchObject({
        matches: false,
        completedAnsweringCalls: 1,
        sameAuthorizationResumeAllowed: false,
        requiresNewAuthorization: true,
        failure: {
          reason: "identity-changed",
          phase: "after",
          id: "a",
          attempt: 1,
          changedServices: [service],
          beforeVector: baseline,
          afterVector: changed
        }
      });
    }
  );

  it("fails before the paid call when the probe is unavailable", () => {
    const guard = createRemoteIdentityGuard({
      probeIdentity: fakeProbeIdentity(),
      expectedVectorSha256: remoteIdentityVectorSha256(vector()),
      capture: queuedCapture([new Error("secret probe failure")])
    });
    let paidCalls = 0;

    expect(() => runRemoteIdentityGuardedCall({
      guard,
      context: { id: "a", attempt: 1 },
      authorize: () => ({ id: "a" }),
      call: () => {
        paidCalls += 1;
        return { costUsd: 0.1 };
      },
      recordSpend: () => {}
    })).toThrow(/probe is unavailable/);

    expect(paidCalls).toBe(0);
    expect(JSON.stringify(guard.record())).not.toContain("secret probe failure");
    expect(guard.record().failure).toMatchObject({
      reason: "probe-unavailable",
      phase: "before",
      beforeVector: null,
      afterVector: null
    });
  });

  it("fails before the first paid call when the pre-arm vector pin differs", () => {
    const baseline = vector();
    const guard = createRemoteIdentityGuard({
      probeIdentity: fakeProbeIdentity(),
      expectedVectorSha256: "f".repeat(64),
      capture: queuedCapture([baseline])
    });
    let paidCalls = 0;

    expect(() => runRemoteIdentityGuardedCall({
      guard,
      context: { id: "a", attempt: 1 },
      authorize: () => ({}),
      call: () => {
        paidCalls += 1;
      },
      recordSpend: () => {}
    })).toThrow(/pre-arm SHA-256/);

    expect(paidCalls).toBe(0);
    expect(guard.record()).toMatchObject({
      matches: false,
      completedAnsweringCalls: 0,
      failure: { reason: "pre-arm-vector-mismatch", phase: "before" }
    });
  });

  it("reports one accurate reason after a pre-arm vector mismatch", () => {
    const baseline = vector();
    const guard = createRemoteIdentityGuard({
      probeIdentity: fakeProbeIdentity(),
      expectedVectorSha256: "f".repeat(64),
      capture: queuedCapture([baseline])
    });
    let collectionError;
    try {
      runRemoteIdentityGuardedCall({
        guard,
        context: { id: "a", attempt: 1 },
        authorize: () => ({}),
        call: () => ({ costUsd: 0.1 }),
        recordSpend: () => {}
      });
    } catch (error) {
      collectionError = error;
    }

    expect(guard.postflight()).toBeNull();
    const remoteIdentityGuardRecord = guard.record();
    expect(remoteIdentityGuardRecord.postflight).toMatchObject({
      attempted: false,
      skippedReason: "guard-already-stopped"
    });
    expect(collectionComparabilityReasons({
      collectionError,
      postflightError: null,
      remoteIdentityPostflightError: null,
      collectionSourceIdentityGuard: { matches: true, changedKeys: [] },
      remoteIdentityGuardRecord
    })).toEqual(["remote identity pre-arm vector SHA-256 mismatch"]);
  });

  it("records a missing baseline as its own fail-closed reason", () => {
    const guard = createRemoteIdentityGuard({
      probeIdentity: fakeProbeIdentity(),
      expectedVectorSha256: remoteIdentityVectorSha256(vector()),
      capture: queuedCapture([])
    });

    let postflightError;
    try {
      guard.postflight();
    } catch (error) {
      postflightError = error;
    }

    expect(postflightError).toMatchObject({
      code: "remote-identity-guard",
      message: "remote identity baseline is missing"
    });
    const remoteIdentityGuardRecord = guard.record();
    expect(remoteIdentityGuardRecord).toMatchObject({
      matches: false,
      failure: {
        reason: "missing-baseline",
        phase: "postflight",
        diagnostics: { kind: "missing-baseline" }
      },
      sameAuthorizationResumeAllowed: false,
      requiresNewAuthorization: true
    });
    expect(collectionComparabilityReasons({
      collectionError: null,
      postflightError: null,
      remoteIdentityPostflightError: postflightError,
      collectionSourceIdentityGuard: { matches: true, changedKeys: [] },
      remoteIdentityGuardRecord
    })).toEqual(["remote identity baseline is missing"]);
  });

  it.each([
    ["missing-baseline", "remote identity baseline is missing"],
    ["probe-unavailable", "remote identity probe unavailable"]
  ])("maps %s to an accurate comparability reason", (reason, expected) => {
    expect(collectionComparabilityReasons({
      collectionError: null,
      postflightError: null,
      remoteIdentityPostflightError: null,
      collectionSourceIdentityGuard: { matches: true, changedKeys: [] },
      remoteIdentityGuardRecord: {
        matches: false,
        failure: { reason, changedServices: [] }
      }
    })).toEqual([expected]);
  });

  it("stops before a judge call when the after-call probe is unavailable", () => {
    const baseline = vector();
    const guard = createRemoteIdentityGuard({
      probeIdentity: fakeProbeIdentity(),
      expectedVectorSha256: remoteIdentityVectorSha256(baseline),
      capture: queuedCapture([baseline, new Error("secret after failure")])
    });
    let answeringCalls = 0;
    let judgeCalls = 0;

    try {
      runRemoteIdentityGuardedCall({
        guard,
        context: { id: "a", attempt: 1 },
        authorize: () => ({}),
        call: () => {
          answeringCalls += 1;
          return { costUsd: 0.1 };
        },
        recordSpend: () => {}
      });
      judgeCalls += 1;
    } catch {
      // The guard must skip the next paid call.
    }

    expect(answeringCalls).toBe(1);
    expect(judgeCalls).toBe(0);
    expect(JSON.stringify(guard.record())).not.toContain("secret after failure");
    expect(guard.record().failure).toMatchObject({
      reason: "probe-unavailable",
      phase: "after",
      beforeVector: baseline,
      afterVector: null
    });
  });

  it("preserves a paid-call error when the after-call probe also fails", () => {
    const baseline = vector();
    const primary = new Error("primary paid-call error");
    const guard = createRemoteIdentityGuard({
      probeIdentity: fakeProbeIdentity(),
      expectedVectorSha256: remoteIdentityVectorSha256(baseline),
      capture: queuedCapture([baseline, new Error("secret after failure")])
    });

    let caught;
    try {
      runRemoteIdentityGuardedCall({
        guard,
        context: { id: "a", attempt: 1 },
        authorize: () => ({}),
        call: () => { throw primary; },
        recordSpend: () => {}
      });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBe(primary);
    expect(caught.cause).toMatchObject({ code: "remote-identity-guard" });
    expect(guard.record()).toMatchObject({
      matches: false,
      completedAnsweringCalls: 0,
      failure: { reason: "probe-unavailable", phase: "after" }
    });
  });

  it("preserves completed rows and leaves later IDs unattempted", () => {
    const baseline = vector();
    const guard = createRemoteIdentityGuard({
      probeIdentity: fakeProbeIdentity(),
      expectedVectorSha256: remoteIdentityVectorSha256(baseline),
      capture: queuedCapture([baseline, changedVector("scout")])
    });
    const selectedIds = ["a", "b", "c"];
    const rows = [];
    const paidCalls = [];

    for (const id of selectedIds) {
      try {
        runRemoteIdentityGuardedCall({
          guard,
          context: { id, attempt: 1 },
          authorize: () => ({ id }),
          call: () => {
            paidCalls.push(id);
            return { id, costUsd: 0.1 };
          },
          onCompleted: (row) => rows.push(row),
          recordSpend: () => {}
        });
      } catch {
        break;
      }
    }

    expect(paidCalls).toEqual(["a"]);
    expect(rows.map((row) => row.id)).toEqual(["a"]);
    expect(selectedIds.filter((id) => !rows.some((row) => row.id === id))).toEqual(["b", "c"]);
    expect(() => guard.beforeCall({ id: "b", attempt: 1 })).toThrow(/already stopped/);
  });

  it("provides metadata that forces comparability and aggregate suppression", () => {
    const baseline = vector();
    const guard = createRemoteIdentityGuard({
      probeIdentity: fakeProbeIdentity(),
      expectedVectorSha256: remoteIdentityVectorSha256(baseline),
      capture: queuedCapture([baseline, changedVector("lumenloop")])
    });
    try {
      runRemoteIdentityGuardedCall({
        guard,
        context: { id: "a", attempt: 1 },
        authorize: () => ({}),
        call: () => ({ costUsd: 0.1 }),
        recordSpend: () => {}
      });
    } catch {
      // The record below is the expected result.
    }
    const remoteIdentityGuard = guard.record();
    const comparabilityReasons = remoteIdentityGuard.matches
      ? []
      : [`remote service identity changed: ${remoteIdentityGuard.failure.changedServices.join(", ")}`];
    const aggregates = collectionAggregates(
      [{ id: "a", verdict: { score: "correct" }, agent: { failure: null } }],
      [{ id: "a" }],
      { judging: true }
    );
    expect(aggregates.summary).not.toBeNull();
    expect(aggregates.metrics).not.toBeNull();
    const finalized = applyCollectionComparability(aggregates, comparabilityReasons);

    expect(remoteIdentityGuard.failure.changedServices).toEqual(["lumenloop"]);
    expect(finalized.comparable).toBe(false);
    expect(finalized.completeness.aggregatesAllowed).toBe(false);
    expect(finalized.summary).toBeNull();
    expect(finalized.metrics).toBeNull();
  });
});

function unavailable(kind = "nonzero-exit", reason = "Lumenloop tools response is incomplete") {
  return new RemoteIdentityProbeError(kind, "eval/qa/test-probe", {
    status: kind === "timeout" ? null : 1,
    timedOut: kind === "timeout",
    reason,
    probeRetryLines: 1
  });
}

function guardedCall(guard, id, paidCalls = []) {
  return runRemoteIdentityGuardedCall({
    guard,
    context: { id, attempt: 1 },
    authorize: () => ({ id }),
    call: () => {
      paidCalls.push(id);
      return { costUsd: 0.1 };
    },
    recordSpend: () => {}
  });
}

describe("QA remote identity probe stderr diagnostics", () => {
  it("keeps the last allowlisted probe line and counts probe retry lines", () => {
    const stderr = [
      "remote-identity-probe: Scout OpenAPI attempt 1/3 failed (HTTP 503); retrying in 250 ms",
      "unrelated stderr text",
      "remote-identity-probe: Scout OpenAPI attempt 2/3 failed (timeout); retrying in 1000 ms",
      "remote-identity-probe: Stellar Docs title pagination changed during capture",
      ""
    ].join("\n");
    expect(probeStderrDiagnostics(stderr)).toEqual({
      reason: "Stellar Docs title pagination changed during capture",
      probeRetryLines: 2
    });
  });

  it.each([
    ["an unprefixed line", "Lumenloop tools response is incomplete"],
    ["an assignment shape", "remote-identity-probe: failed with key=abc"],
    ["a long token", `remote-identity-probe: failed ${"a1".repeat(20)}`],
    ["a credential word", "remote-identity-probe: bad Authorization header"],
    ["non-ASCII text", "remote-identity-probe: caf\u00e9 failed"],
    ["a control character", "remote-identity-probe: failed\tagain"],
    ["more than 200 characters", `remote-identity-probe: ${"x ".repeat(101)}`],
    ["an empty reason", "remote-identity-probe: "]
  ])("rejects %s", (_label, stderr) => {
    expect(probeStderrDiagnostics(stderr).reason).toBeNull();
  });

  it("returns no reason for empty stderr", () => {
    expect(probeStderrDiagnostics(undefined)).toEqual({ reason: null, probeRetryLines: 0 });
  });

  it("keeps the probe reason and never keeps stdout or other stderr text", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "qa-remote-probe-"));
    try {
      const command = path.join(root, "probe");
      writeFileSync(command, [
        "#!/bin/sh",
        "printf '%s\\n' 'stdout-secret'",
        "printf '%s\\n' 'stderr-secret' >&2",
        "printf '%s\\n' 'remote-identity-probe: Scout OpenAPI attempt 1/3 failed (HTTP 502); retrying in 250 ms' >&2",
        "printf '%s\\n' 'remote-identity-probe: Lumenloop tools response is incomplete' >&2",
        "exit 1",
        ""
      ].join("\n"));
      chmodSync(command, 0o755);
      const digest = createHash("sha256").update(readFileSync(command)).digest("hex");
      let caught;
      try {
        captureRemoteIdentity(remoteIdentityProbeIdentity(command, digest));
      } catch (error) {
        caught = error;
      }
      expect(caught.diagnostics).toEqual({
        kind: "nonzero-exit",
        path: "probe",
        status: 1,
        signal: null,
        timedOut: false,
        reason: "Lumenloop tools response is incomplete",
        probeRetryLines: 1
      });
      expect(JSON.stringify({ message: caught.message, ...caught })).not.toMatch(/stdout-secret|stderr-secret/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("QA remote identity capture retry", () => {
  it("bounds the worst-case wait for one capture inside the paired deadline", () => {
    expect(REMOTE_IDENTITY_PROBE_PROCESS_TIMEOUT_MS).toBe(145_000);
    expect(REMOTE_IDENTITY_MAX_CAPTURE_WAIT_MS).toBe(4 * 145_000 + 210_000);
    expect(REMOTE_IDENTITY_MAX_CAPTURE_WAIT_MS).toBeLessThan(PAIRED_COLLECTION_DEADLINE_MS / 16);
  });

  it("retries an unavailable capture, then continues with a matching vector", () => {
    const baseline = vector();
    const sleeps = [];
    const notices = [];
    const guard = createRemoteIdentityGuard({
      probeIdentity: fakeProbeIdentity(),
      expectedVectorSha256: remoteIdentityVectorSha256(baseline),
      capture: queuedCapture([
        baseline,
        baseline,
        unavailable(),
        unavailable("timeout", null),
        unavailable("invalid-json", null),
        baseline,
        baseline,
        baseline
      ]),
      sleep: (delayMs) => sleeps.push(delayMs),
      onCaptureRetry: (notice) => notices.push(notice)
    });
    const paidCalls = [];

    guardedCall(guard, "a", paidCalls);
    guardedCall(guard, "b", paidCalls);
    guard.postflight();

    expect(paidCalls).toEqual(["a", "b"]);
    expect(sleeps).toEqual([...REMOTE_IDENTITY_CAPTURE_RETRY_DELAYS_MS]);
    expect(notices.map(({ captureAttempt, delayMs }) => [captureAttempt, delayMs])).toEqual([
      [1, 30_000],
      [2, 60_000],
      [3, 120_000]
    ]);
    const record = guard.record();
    expect(record).toMatchObject({
      schema: REMOTE_IDENTITY_GUARD_SCHEMA,
      matches: true,
      failure: null,
      successfulCaptureCount: 5,
      completedAnsweringCalls: 2,
      captureRetryPolicy: { maximumAttempts: 4, delaysMs: [30_000, 60_000, 120_000] },
      requiresNewAuthorization: false
    });
    expect(record.successfulCaptureCount).toBe(record.captures.length);
    expect(record.captures.map(({ phase, id }) => [phase, id])).toEqual([
      ["before", "a"],
      ["after", "a"],
      ["before", "b"],
      ["after", "b"],
      ["postflight", null]
    ]);
    expect(record.failedCaptureAttempts).toEqual([
      expect.objectContaining({
        sequence: 1,
        phase: "before",
        id: "b",
        attempt: 1,
        captureAttempt: 1,
        kind: "nonzero-exit",
        reason: "Lumenloop tools response is incomplete",
        probeRetryLines: 1,
        failedAt: expect.any(String)
      }),
      expect.objectContaining({
        sequence: 2,
        phase: "before",
        id: "b",
        captureAttempt: 2,
        kind: "timeout",
        reason: null
      }),
      expect.objectContaining({ sequence: 3, captureAttempt: 3, kind: "invalid-json" })
    ]);
  });

  it("checks a retried vector against the baseline", () => {
    const baseline = vector();
    const guard = createRemoteIdentityGuard({
      probeIdentity: fakeProbeIdentity(),
      expectedVectorSha256: remoteIdentityVectorSha256(baseline),
      capture: queuedCapture([baseline, unavailable(), changedVector("scout")]),
      sleep: () => {}
    });

    expect(() => guardedCall(guard, "a")).toThrow(/scout/);
    expect(guard.record()).toMatchObject({
      matches: false,
      failure: { reason: "identity-changed", phase: "after", changedServices: ["scout"] }
    });
    expect(guard.record().failedCaptureAttempts).toHaveLength(1);
  });

  it("stops after four failed attempts and records every attempt", () => {
    const baseline = vector();
    const sleeps = [];
    const guard = createRemoteIdentityGuard({
      probeIdentity: fakeProbeIdentity(),
      expectedVectorSha256: remoteIdentityVectorSha256(baseline),
      capture: queuedCapture([
        baseline,
        baseline,
        unavailable(),
        unavailable(),
        unavailable("timeout", null),
        unavailable()
      ]),
      sleep: (delayMs) => sleeps.push(delayMs)
    });
    const paidCalls = [];

    guardedCall(guard, "a", paidCalls);
    expect(() => guardedCall(guard, "b", paidCalls)).toThrow(/probe is unavailable/);

    expect(paidCalls).toEqual(["a"]);
    expect(sleeps).toEqual([30_000, 60_000, 120_000]);
    const record = guard.record();
    expect(record).toMatchObject({
      matches: false,
      successfulCaptureCount: 2,
      completedAnsweringCalls: 1,
      requiresNewAuthorization: true,
      failure: {
        reason: "probe-unavailable",
        phase: "before",
        id: "b",
        attempt: 1,
        diagnostics: {
          kind: "nonzero-exit",
          reason: "Lumenloop tools response is incomplete",
          probeRetryLines: 1
        }
      }
    });
    expect(record.failedCaptureAttempts.map(({ sequence, captureAttempt, id }) => [
      sequence,
      captureAttempt,
      id
    ])).toEqual([
      [1, 1, "b"],
      [2, 2, "b"],
      [3, 3, "b"],
      [4, 4, "b"]
    ]);
    expect(record.failedCaptureAttempts).toHaveLength(REMOTE_IDENTITY_MAX_CAPTURE_ATTEMPTS);
    expect(() => guard.beforeCall({ id: "c", attempt: 1 })).toThrow(/already stopped/);
  });

  it.each([
    ["an identity change", () => [vector(), changedVector("lumenloop")], /lumenloop/],
    ["a pre-arm mismatch", () => [changedVector("scout")], /pre-arm SHA-256/]
  ])("never retries %s", (_label, captures, message) => {
    const sleeps = [];
    let captureCount = 0;
    const queued = queuedCapture(captures());
    const guard = createRemoteIdentityGuard({
      probeIdentity: fakeProbeIdentity(),
      expectedVectorSha256: remoteIdentityVectorSha256(vector()),
      capture: (identity) => {
        captureCount += 1;
        return queued(identity);
      },
      sleep: (delayMs) => sleeps.push(delayMs)
    });

    expect(() => guardedCall(guard, "a")).toThrow(message);
    expect(sleeps).toEqual([]);
    expect(captureCount).toBe(captures().length);
    expect(guard.record().failedCaptureAttempts).toEqual([]);
  });

  it("never retries a missing baseline", () => {
    const sleeps = [];
    const guard = createRemoteIdentityGuard({
      probeIdentity: fakeProbeIdentity(),
      expectedVectorSha256: remoteIdentityVectorSha256(vector()),
      capture: () => {
        throw new Error("must not capture");
      },
      sleep: (delayMs) => sleeps.push(delayMs)
    });

    expect(() => guard.postflight()).toThrow(/baseline is missing/);
    expect(sleeps).toEqual([]);
    expect(guard.record().failedCaptureAttempts).toEqual([]);
  });

  it("does not retry a capture error that is not a probe error", () => {
    const sleeps = [];
    const guard = createRemoteIdentityGuard({
      probeIdentity: fakeProbeIdentity(),
      expectedVectorSha256: remoteIdentityVectorSha256(vector()),
      capture: queuedCapture([new Error("secret capture failure")]),
      sleep: (delayMs) => sleeps.push(delayMs)
    });

    expect(() => guardedCall(guard, "a")).toThrow(/probe is unavailable/);
    expect(sleeps).toEqual([]);
    expect(guard.record().failedCaptureAttempts).toEqual([
      expect.objectContaining({ captureAttempt: 1, kind: "capture-error", reason: null })
    ]);
    expect(JSON.stringify(guard.record())).not.toContain("secret capture failure");
  });

  it("retries an unavailable postflight capture", () => {
    const baseline = vector();
    const guard = createRemoteIdentityGuard({
      probeIdentity: fakeProbeIdentity(),
      expectedVectorSha256: remoteIdentityVectorSha256(baseline),
      capture: queuedCapture([baseline, baseline, unavailable(), baseline]),
      sleep: () => {}
    });

    guardedCall(guard, "a");
    guard.postflight();

    expect(guard.record()).toMatchObject({
      matches: true,
      postflight: { attempted: true, matches: true },
      failedCaptureAttempts: [expect.objectContaining({ phase: "postflight", id: null })]
    });
  });
});
