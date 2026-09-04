import { createHash } from "node:crypto";
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  REMOTE_IDENTITY_VECTOR_SCHEMA,
  captureRemoteIdentity,
  compareRemoteIdentityVectors,
  createRemoteIdentityGuard,
  parseRemoteIdentityVector,
  remoteIdentityProbeIdentity,
  remoteIdentityVectorSha256,
  runRemoteIdentityGuardedCall
} from "../eval/qa/remote-identity-guard.mjs";
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
