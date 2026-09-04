import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { accessSync, constants, readFileSync, realpathSync, statSync } from "node:fs";
import path from "node:path";

export const REMOTE_IDENTITY_VECTOR_SCHEMA = "qa-remote-identity-vector-v1";
export const REMOTE_IDENTITY_GUARD_SCHEMA = "qa-remote-identity-guard-v1";
export const REMOTE_IDENTITY_SERVICES = ["scout", "lumenloop", "stellarDocs"];

const SERVICE_FIELDS = {
  scout: ["openapiVersion", "canonicalOpenapiSha256"],
  lumenloop: ["advertisedContractIdentity", "canonicalInventorySha256"],
  stellarDocs: ["indexSettingsSha256", "canonicalTitleSetSha256"]
};
const HASH_FIELDS = new Set([
  "canonicalOpenapiSha256",
  "canonicalInventorySha256",
  "indexSettingsSha256",
  "canonicalTitleSetSha256"
]);
const SAFE_IDENTITY = /^[A-Za-z0-9][A-Za-z0-9._:+/-]{0,127}$/;
const SHA256 = /^[a-f0-9]{64}$/;

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function exactKeys(value, expected, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    throw new Error(`${label} must contain exactly: ${wanted.join(", ")}`);
  }
}

/** Exact keys exclude timestamps and other volatile fields. */
export function parseRemoteIdentityVector(value) {
  exactKeys(value, ["schema", "services"], "remote identity vector");
  if (value.schema !== REMOTE_IDENTITY_VECTOR_SCHEMA) {
    throw new Error(`remote identity vector schema must be ${REMOTE_IDENTITY_VECTOR_SCHEMA}`);
  }
  exactKeys(value.services, REMOTE_IDENTITY_SERVICES, "remote identity services");

  const services = {};
  for (const service of REMOTE_IDENTITY_SERVICES) {
    const fields = SERVICE_FIELDS[service];
    const source = value.services[service];
    exactKeys(source, fields, `remote identity service ${service}`);
    services[service] = {};
    for (const field of fields) {
      const fieldValue = source[field];
      if (HASH_FIELDS.has(field)) {
        if (typeof fieldValue !== "string" || !SHA256.test(fieldValue)) {
          throw new Error(`remote identity ${service}.${field} must be a lowercase SHA-256`);
        }
      } else if (typeof fieldValue !== "string" || !SAFE_IDENTITY.test(fieldValue)) {
        throw new Error(`remote identity ${service}.${field} must be a safe identity token`);
      }
      services[service][field] = fieldValue;
    }
  }

  return { schema: REMOTE_IDENTITY_VECTOR_SCHEMA, services };
}

export function remoteIdentityVectorSha256(vector) {
  return sha256(JSON.stringify(parseRemoteIdentityVector(vector)));
}

export function compareRemoteIdentityVectors(before, after) {
  const left = parseRemoteIdentityVector(before);
  const right = parseRemoteIdentityVector(after);
  const changedServices = REMOTE_IDENTITY_SERVICES.filter(
    (service) => JSON.stringify(left.services[service]) !== JSON.stringify(right.services[service])
  );
  return { matches: changedServices.length === 0, changedServices };
}

function artifactPathFor(resolvedPath, repoRoot) {
  const relative = path.relative(repoRoot, resolvedPath);
  if (relative && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative)) {
    return relative.split(path.sep).join("/");
  }
  return path.basename(resolvedPath);
}

export class RemoteIdentityProbeError extends Error {
  constructor(kind, probePath, { status = null, signal = null, timedOut = false } = {}) {
    const statusText = status === null ? "none" : String(status);
    const signalText = signal ?? "none";
    super(
      `remote identity probe failed: kind=${kind} path=${probePath} status=${statusText} signal=${signalText} timedOut=${timedOut}`
    );
    this.name = "RemoteIdentityProbeError";
    this.code = "remote-identity-probe";
    this.diagnostics = { kind, path: probePath, status, signal, timedOut };
  }
}

export function remoteIdentityProbeIdentity(command, expectedSha256, { repoRoot = process.cwd() } = {}) {
  if (typeof command !== "string" || command.trim() === "") {
    throw new Error("--remote-identity-probe is required before collection");
  }
  if (typeof expectedSha256 !== "string" || !SHA256.test(expectedSha256)) {
    throw new Error(
      "--expect-remote-identity-probe-sha256 must be a 64-character lowercase SHA-256"
    );
  }
  const requestedPath = path.resolve(command);
  let resolvedPath;
  try {
    resolvedPath = realpathSync(requestedPath);
  } catch {
    throw new RemoteIdentityProbeError("missing", path.basename(requestedPath));
  }
  const artifactPath = artifactPathFor(resolvedPath, path.resolve(repoRoot));
  try {
    if (!statSync(resolvedPath).isFile()) {
      throw new RemoteIdentityProbeError("not-file", artifactPath);
    }
    accessSync(resolvedPath, constants.X_OK);
  } catch (error) {
    if (error instanceof RemoteIdentityProbeError) throw error;
    throw new RemoteIdentityProbeError("not-executable", artifactPath);
  }
  const actualSha256 = sha256(readFileSync(resolvedPath));
  if (actualSha256 !== expectedSha256) {
    throw new RemoteIdentityProbeError("hash-mismatch", artifactPath);
  }
  return {
    contract: REMOTE_IDENTITY_VECTOR_SCHEMA,
    artifactPath,
    resolvedPath,
    sha256: actualSha256,
    expectedSha256,
    matches: true
  };
}

function publicProbeRecord(probeIdentity) {
  return {
    contract: probeIdentity.contract,
    path: probeIdentity.artifactPath,
    sha256: probeIdentity.sha256,
    expectedSha256: probeIdentity.expectedSha256,
    matches: probeIdentity.matches
  };
}

/** Run the pinned probe with a minimal environment and retain no raw output. */
export function captureRemoteIdentity(probeIdentity, {
  spawnSyncImpl = spawnSync,
  timeoutMs = 60_000,
  maxBufferBytes = 1024 * 1024,
  environment = { PATH: process.env.PATH ?? "" }
} = {}) {
  const current = remoteIdentityProbeIdentity(
    probeIdentity?.resolvedPath,
    probeIdentity?.expectedSha256
  );
  const result = spawnSyncImpl(current.resolvedPath, [], {
    encoding: "utf8",
    timeout: timeoutMs,
    maxBuffer: maxBufferBytes,
    env: environment,
    stdio: ["ignore", "pipe", "pipe"]
  });
  const probePath = current.artifactPath;
  if (result.error || result.status !== 0 || result.signal) {
    const timedOut = result.error?.code === "ETIMEDOUT";
    const kind = timedOut
      ? "timeout"
      : result.error?.code === "ENOBUFS"
        ? "output-overflow"
        : result.signal
          ? "signal"
          : result.error
            ? "spawn-error"
            : "nonzero-exit";
    throw new RemoteIdentityProbeError(kind, probePath, {
      status: result.status ?? null,
      signal: result.signal ?? null,
      timedOut
    });
  }
  let parsed;
  try {
    parsed = JSON.parse(String(result.stdout ?? ""));
  } catch {
    throw new RemoteIdentityProbeError("invalid-json", probePath);
  }
  try {
    return parseRemoteIdentityVector(parsed);
  } catch {
    throw new RemoteIdentityProbeError("invalid-vector", probePath);
  }
}

export class RemoteIdentityGuardError extends Error {
  constructor(message) {
    super(message);
    this.name = "RemoteIdentityGuardError";
    this.code = "remote-identity-guard";
  }
}

/** A failure permanently closes this instance and forbids resume. */
export function createRemoteIdentityGuard({
  probeIdentity,
  expectedVectorSha256,
  capture = captureRemoteIdentity
}) {
  if (typeof expectedVectorSha256 !== "string" || !SHA256.test(expectedVectorSha256)) {
    throw new Error(
      "--expect-remote-identity-sha256 must be a 64-character lowercase SHA-256"
    );
  }
  let baselineVector = null;
  let finalVector = null;
  let pendingCall = null;
  let failure = null;
  let completedAnsweringCalls = 0;
  let postflight = { attempted: false, matches: false, vectorSha256: null };
  const captures = [];

  const fail = ({
    reason,
    phase,
    context,
    beforeVector = null,
    afterVector = null,
    changedServices = [],
    diagnostics = null
  }) => {
    failure ??= {
      reason,
      phase,
      id: context.id,
      attempt: context.attempt,
      changedServices,
      beforeVector,
      afterVector,
      diagnostics
    };
    const message = reason === "identity-changed"
      ? `remote service identity changed: ${changedServices.join(", ")}`
      : reason === "pre-arm-vector-mismatch"
        ? "remote identity vector does not match the pre-arm SHA-256"
        : "remote identity probe is unavailable";
    throw new RemoteIdentityGuardError(message);
  };

  const captureVector = (phase, context) => {
    let vector;
    try {
      vector = parseRemoteIdentityVector(capture(probeIdentity));
    } catch (error) {
      fail({
        reason: "probe-unavailable",
        phase,
        context,
        beforeVector: phase === "after" ? pendingCall?.vector ?? null : baselineVector,
        diagnostics: error?.diagnostics ?? {
          kind: "capture-error",
          path: probeIdentity?.artifactPath ?? probeIdentity?.path ?? "unknown",
          status: null,
          signal: null,
          timedOut: false
        }
      });
    }
    captures.push({
      sequence: captures.length + 1,
      phase,
      id: context.id,
      attempt: context.attempt,
      vectorSha256: remoteIdentityVectorSha256(vector)
    });
    finalVector = vector;
    return vector;
  };

  const assertActive = () => {
    if (failure) {
      throw new RemoteIdentityGuardError(
        "remote identity guard already stopped this authorization"
      );
    }
  };

  return {
    beforeCall(context) {
      assertActive();
      if (pendingCall) throw new Error("remote identity guard has an unfinished answering call");
      const vector = captureVector("before", context);
      if (baselineVector === null) {
        baselineVector = vector;
        if (remoteIdentityVectorSha256(vector) !== expectedVectorSha256) {
          fail({ reason: "pre-arm-vector-mismatch", phase: "before", context, afterVector: vector });
        }
      }
      const comparison = compareRemoteIdentityVectors(baselineVector, vector);
      if (!comparison.matches) {
        fail({
          reason: "identity-changed",
          phase: "before",
          context,
          beforeVector: baselineVector,
          afterVector: vector,
          changedServices: comparison.changedServices
        });
      }
      pendingCall = { ...context, vector };
      return vector;
    },

    afterCall(context, { completed = true } = {}) {
      if (!pendingCall || pendingCall.id !== context.id || pendingCall.attempt !== context.attempt) {
        throw new Error("remote identity guard answering-call context does not match");
      }
      const beforeVector = pendingCall.vector;
      let afterVector;
      try {
        afterVector = captureVector("after", context);
      } finally {
        pendingCall = null;
        if (completed) completedAnsweringCalls += 1;
      }
      const comparison = compareRemoteIdentityVectors(beforeVector, afterVector);
      if (!comparison.matches) {
        fail({
          reason: "identity-changed",
          phase: "after",
          context,
          beforeVector,
          afterVector,
          changedServices: comparison.changedServices
        });
      }
      return afterVector;
    },

    postflight() {
      assertActive();
      if (pendingCall) throw new Error("remote identity guard has an unfinished answering call");
      if (baselineVector === null) {
        fail({
          reason: "probe-unavailable",
          phase: "postflight",
          context: { id: null, attempt: null },
          diagnostics: {
            kind: "missing-baseline",
            path: probeIdentity?.artifactPath ?? "unknown",
            status: null,
            signal: null,
            timedOut: false
          }
        });
      }
      const vector = captureVector("postflight", { id: null, attempt: null });
      const comparison = compareRemoteIdentityVectors(baselineVector, vector);
      postflight = {
        attempted: true,
        matches: comparison.matches,
        vectorSha256: remoteIdentityVectorSha256(vector)
      };
      if (!comparison.matches) {
        fail({
          reason: "identity-changed",
          phase: "postflight",
          context: { id: null, attempt: null },
          beforeVector: baselineVector,
          afterVector: vector,
          changedServices: comparison.changedServices
        });
      }
      return vector;
    },

    record() {
      return {
        schema: REMOTE_IDENTITY_GUARD_SCHEMA,
        probe: publicProbeRecord(probeIdentity),
        expectedBaselineVectorSha256: expectedVectorSha256,
        baselineVectorSha256: baselineVector ? remoteIdentityVectorSha256(baselineVector) : null,
        matches: failure === null,
        baselineVector,
        finalVector,
        postflight,
        successfulCaptureCount: captures.length,
        completedAnsweringCalls,
        captures: [...captures],
        failure,
        sameAuthorizationResumeAllowed: false,
        requiresNewAuthorization: failure !== null
      };
    }
  };
}

/** The production wrapper guarantees one identity pair around each call. */
export function runRemoteIdentityGuardedCall({
  guard,
  context,
  authorize,
  call,
  recordSpend: persistSpend,
  onCompleted = () => {}
}) {
  const authorization = authorize();
  guard.beforeCall(context);
  let result;
  let callReturned = false;
  let primaryError = null;
  try {
    result = call(authorization);
    callReturned = true;
    onCompleted(result);
    persistSpend(authorization, result);
  } catch (error) {
    primaryError = error;
  }

  let afterProbeError = null;
  try {
    guard.afterCall(context, { completed: callReturned });
  } catch (error) {
    afterProbeError = error;
  }
  if (primaryError) {
    if (afterProbeError && primaryError.cause === undefined && Object.isExtensible(primaryError)) {
      primaryError.cause = afterProbeError;
    }
    throw primaryError;
  }
  if (afterProbeError) throw afterProbeError;
  return result;
}
