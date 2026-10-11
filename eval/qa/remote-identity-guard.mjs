import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { accessSync, constants, readFileSync, realpathSync, statSync } from "node:fs";
import path from "node:path";

export const REMOTE_IDENTITY_VECTOR_SCHEMA = "qa-remote-identity-vector-v1";
export const REMOTE_IDENTITY_GUARD_SCHEMA = "qa-remote-identity-guard-v2";
export const REMOTE_IDENTITY_SERVICES = ["scout", "lumenloop", "stellarDocs"];
export const REMOTE_IDENTITY_REQUEST_TIMEOUT_MS = 20_000;
export const REMOTE_IDENTITY_RETRY_DELAYS_MS = Object.freeze([250, 1_000]);
export const REMOTE_IDENTITY_MAX_RETRY_AFTER_MS = 5_000;
// The probe sends its Algolia requests in one concurrent phase.
const REMOTE_IDENTITY_DOCS_QUERY_PHASES = 1;
const REMOTE_IDENTITY_MAX_RETRY_DELAY_MS = Math.max(
  REMOTE_IDENTITY_MAX_RETRY_AFTER_MS,
  ...REMOTE_IDENTITY_RETRY_DELAYS_MS
);
export const REMOTE_IDENTITY_MAX_NETWORK_BUDGET_MS = REMOTE_IDENTITY_DOCS_QUERY_PHASES * (
  (REMOTE_IDENTITY_RETRY_DELAYS_MS.length + 1) * REMOTE_IDENTITY_REQUEST_TIMEOUT_MS +
  REMOTE_IDENTITY_RETRY_DELAYS_MS.length * REMOTE_IDENTITY_MAX_RETRY_DELAY_MS
);
export const REMOTE_IDENTITY_PROBE_PROCESS_TIMEOUT_MS =
  REMOTE_IDENTITY_MAX_NETWORK_BUDGET_MS + 5_000;
// The guard waits before each repeat of one capture after an unavailable probe.
export const REMOTE_IDENTITY_CAPTURE_RETRY_DELAYS_MS = Object.freeze([30_000, 60_000, 120_000]);
export const REMOTE_IDENTITY_MAX_CAPTURE_ATTEMPTS =
  REMOTE_IDENTITY_CAPTURE_RETRY_DELAYS_MS.length + 1;
export const REMOTE_IDENTITY_CAPTURE_WAIT_SLICE_MS = 1_000;
export const REMOTE_IDENTITY_MAX_CAPTURE_WAIT_MS =
  REMOTE_IDENTITY_MAX_CAPTURE_ATTEMPTS * REMOTE_IDENTITY_PROBE_PROCESS_TIMEOUT_MS +
  REMOTE_IDENTITY_CAPTURE_RETRY_DELAYS_MS.reduce((total, delayMs) => total + delayMs, 0);

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
const PROBE_LINE_PREFIX = "remote-identity-probe: ";
export const REMOTE_IDENTITY_PROBE_ERROR_KINDS = Object.freeze([
  "missing",
  "not-file",
  "not-executable",
  "hash-mismatch",
  "timeout",
  "output-overflow",
  "signal",
  "spawn-error",
  "nonzero-exit",
  "invalid-json",
  "invalid-vector"
]);

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

// The pinned probe builds every expected message from these fixed labels and fields.
const PROBE_REQUEST_LABELS = [
  "Scout OpenAPI",
  "Lumenloop OpenAPI",
  "Lumenloop public tools",
  "Lumenloop public skills",
  "Stellar Docs settings",
  "Stellar Docs title pages"
];
const PROBE_SHAPE_LABELS = [
  "Scout OpenAPI",
  "Scout OpenAPI version",
  "Lumenloop OpenAPI",
  "Lumenloop OpenAPI version",
  "Lumenloop tools response",
  "Lumenloop tools data",
  "Lumenloop tools hint",
  "Lumenloop tools scope",
  "Lumenloop skills response",
  "Lumenloop skills data",
  "Lumenloop skill archives",
  "Lumenloop skill note",
  "Lumenloop skill versions",
  "Stellar Docs settings",
  "Stellar Docs title response"
];
const alternatives = (values) => values.map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
const PROBE_REQUEST_LABEL = `(?:${alternatives(PROBE_REQUEST_LABELS)})`;
const PROBE_RETRY_MESSAGE = new RegExp(
  `^${PROBE_REQUEST_LABEL} attempt [1-9]/[1-9] failed \\((?:HTTP [1-5][0-9]{2}|timeout|network error)\\); ` +
  "retrying in [0-9]{1,5} ms$"
);
const PROBE_MESSAGE_PATTERNS = [
  PROBE_RETRY_MESSAGE,
  new RegExp(`^${PROBE_REQUEST_LABEL} returned HTTP [1-5][0-9]{2}$`),
  new RegExp(
    `^${PROBE_REQUEST_LABEL} (?:returned invalid JSON|timed out|had a network error|exhausted its retry limit)$`
  ),
  new RegExp(`^(?:${alternatives(PROBE_SHAPE_LABELS)}) must be (?:an object|a non-empty string)$`)
];
const PROBE_FIXED_MESSAGES = new Set([
  "Lumenloop tools response is incomplete",
  "Lumenloop tools response count does not match its tools",
  "Lumenloop skills response is incomplete",
  "Stellar Docs title response is incomplete",
  "Stellar Docs title response is truncated",
  "Stellar Docs title pages are incomplete",
  "Stellar Docs title page count is invalid",
  "Stellar Docs title pagination changed during capture",
  "remote identity vector must be an object",
  `remote identity vector schema must be ${REMOTE_IDENTITY_VECTOR_SCHEMA}`,
  "remote identity vector must contain exactly: schema, services",
  "remote identity services must be an object",
  `remote identity services must contain exactly: ${[...REMOTE_IDENTITY_SERVICES].sort().join(", ")}`,
  ...Object.entries(SERVICE_FIELDS).flatMap(([service, fields]) => [
    `remote identity service ${service} must be an object`,
    `remote identity service ${service} must contain exactly: ${[...fields].sort().join(", ")}`,
    ...fields.map((field) => HASH_FIELDS.has(field)
      ? `remote identity ${service}.${field} must be a lowercase SHA-256`
      : `remote identity ${service}.${field} must be a safe identity token`)
  ])
]);

/** True only for a known probe message form with bounded numeric fields. */
export function isAllowlistedProbeReason(value) {
  return typeof value === "string" &&
    value.length <= 200 &&
    (PROBE_FIXED_MESSAGES.has(value) || PROBE_MESSAGE_PATTERNS.some((pattern) => pattern.test(value)));
}

/** Keep only an allowlisted final probe line and the count of probe retry lines. */
export function probeStderrDiagnostics(stderr) {
  const probeLines = String(stderr ?? "")
    .split(/\r?\n/)
    .filter((line) => line.startsWith(PROBE_LINE_PREFIX))
    .map((line) => line.slice(PROBE_LINE_PREFIX.length));
  const last = probeLines.at(-1);
  return {
    reason: isAllowlistedProbeReason(last) ? last : null,
    probeRetryLines: probeLines.filter((line) => PROBE_RETRY_MESSAGE.test(line)).length
  };
}

export class RemoteIdentityProbeError extends Error {
  constructor(kind, probePath, {
    status = null,
    signal = null,
    timedOut = false,
    reason = null,
    probeRetryLines = null
  } = {}) {
    const statusText = status === null ? "none" : String(status);
    const signalText = signal ?? "none";
    super(
      `remote identity probe failed: kind=${kind} path=${probePath} status=${statusText} signal=${signalText} timedOut=${timedOut}`
    );
    this.name = "RemoteIdentityProbeError";
    this.code = "remote-identity-probe";
    this.diagnostics = { kind, path: probePath, status, signal, timedOut, reason, probeRetryLines };
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

/** Run the pinned probe with a minimal environment and retain no raw output beyond diagnostics. */
export function captureRemoteIdentity(probeIdentity, {
  spawnSyncImpl = spawnSync,
  timeoutMs = REMOTE_IDENTITY_PROBE_PROCESS_TIMEOUT_MS,
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
  const stderrDiagnostics = probeStderrDiagnostics(result.stderr);
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
      timedOut,
      ...stderrDiagnostics
    });
  }
  let parsed;
  try {
    parsed = JSON.parse(String(result.stdout ?? ""));
  } catch {
    throw new RemoteIdentityProbeError("invalid-json", probePath, {
      status: result.status,
      ...stderrDiagnostics
    });
  }
  try {
    return parseRemoteIdentityVector(parsed);
  } catch {
    throw new RemoteIdentityProbeError("invalid-vector", probePath, {
      status: result.status,
      ...stderrDiagnostics
    });
  }
}

export class RemoteIdentityGuardError extends Error {
  constructor(message) {
    super(message);
    this.name = "RemoteIdentityGuardError";
    this.code = "remote-identity-guard";
  }
}

function sleepSync(delayMs) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delayMs);
}

/**
 * A failure or a cancellation permanently closes this instance and forbids resume.
 * Only an unavailable probe repeats a capture; every vector check runs once per capture.
 * `checkCancelled` throws when the collection is cancelled. The guard calls it before each
 * probe, after each wait slice, and last in `beforeCall`, just before the answering call.
 */
export function createRemoteIdentityGuard({
  probeIdentity,
  expectedVectorSha256,
  capture = captureRemoteIdentity,
  sleep = sleepSync,
  onCaptureRetry = () => {},
  checkCancelled = () => {}
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
  let cancellation = null;
  let completedAnsweringCalls = 0;
  let postflight = {
    attempted: false,
    matches: false,
    vectorSha256: null,
    skippedReason: null
  };
  const captures = [];
  const failedCaptureAttempts = [];

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
      failedAt: new Date().toISOString(),
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
        : reason === "missing-baseline"
          ? "remote identity baseline is missing"
          : "remote identity probe is unavailable";
    throw new RemoteIdentityGuardError(message);
  };

  const assertNotCancelled = (phase, context) => {
    try {
      checkCancelled();
    } catch (error) {
      cancellation ??= {
        phase,
        id: context.id,
        attempt: context.attempt,
        cancelledAt: new Date().toISOString()
      };
      throw error;
    }
  };

  const waitBeforeRetry = (delayMs, phase, context) => {
    for (let waitedMs = 0; waitedMs < delayMs;) {
      const sliceMs = Math.min(REMOTE_IDENTITY_CAPTURE_WAIT_SLICE_MS, delayMs - waitedMs);
      sleep(sliceMs);
      waitedMs += sliceMs;
      assertNotCancelled(phase, context);
    }
  };

  const captureVector = (phase, context) => {
    let vector;
    for (let captureAttempt = 1; ; captureAttempt += 1) {
      assertNotCancelled(phase, context);
      try {
        vector = parseRemoteIdentityVector(capture(probeIdentity));
        break;
      } catch (error) {
        const retryable = error instanceof RemoteIdentityProbeError;
        const diagnostics = retryable
          ? error.diagnostics
          : {
              kind: "capture-error",
              path: probeIdentity?.artifactPath ?? probeIdentity?.path ?? "unknown",
              status: null,
              signal: null,
              timedOut: false,
              reason: null,
              probeRetryLines: null
            };
        failedCaptureAttempts.push({
          sequence: failedCaptureAttempts.length + 1,
          failedAt: new Date().toISOString(),
          phase,
          id: context.id,
          attempt: context.attempt,
          captureAttempt,
          kind: diagnostics.kind,
          reason: diagnostics.reason ?? null,
          probeRetryLines: diagnostics.probeRetryLines ?? null
        });
        if (retryable && captureAttempt < REMOTE_IDENTITY_MAX_CAPTURE_ATTEMPTS) {
          const delayMs = REMOTE_IDENTITY_CAPTURE_RETRY_DELAYS_MS[captureAttempt - 1];
          onCaptureRetry({
            phase,
            id: context.id,
            attempt: context.attempt,
            captureAttempt,
            maximumAttempts: REMOTE_IDENTITY_MAX_CAPTURE_ATTEMPTS,
            kind: diagnostics.kind,
            delayMs
          });
          waitBeforeRetry(delayMs, phase, context);
          continue;
        }
        fail({
          reason: "probe-unavailable",
          phase,
          context,
          beforeVector: phase === "after" ? pendingCall?.vector ?? null : baselineVector,
          diagnostics
        });
      }
    }
    captures.push({
      sequence: captures.length + 1,
      capturedAt: new Date().toISOString(),
      phase,
      id: context.id,
      attempt: context.attempt,
      vectorSha256: remoteIdentityVectorSha256(vector)
    });
    finalVector = vector;
    return vector;
  };

  const assertActive = () => {
    if (failure || cancellation) {
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
      assertNotCancelled("before", context);
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
      if (failure || cancellation) {
        postflight = {
          attempted: false,
          matches: false,
          vectorSha256: null,
          skippedReason: failure ? "guard-already-stopped" : "collection-cancelled"
        };
        return null;
      }
      if (pendingCall) throw new Error("remote identity guard has an unfinished answering call");
      if (baselineVector === null) {
        fail({
          reason: "missing-baseline",
          phase: "postflight",
          context: { id: null, attempt: null },
          diagnostics: {
            kind: "missing-baseline",
            path: probeIdentity?.artifactPath ?? "unknown",
            status: null,
            signal: null,
            timedOut: false,
            reason: null,
            probeRetryLines: null
          }
        });
      }
      const vector = captureVector("postflight", { id: null, attempt: null });
      const comparison = compareRemoteIdentityVectors(baselineVector, vector);
      postflight = {
        attempted: true,
        matches: comparison.matches,
        vectorSha256: remoteIdentityVectorSha256(vector),
        skippedReason: null
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
        captureRetryPolicy: {
          maximumAttempts: REMOTE_IDENTITY_MAX_CAPTURE_ATTEMPTS,
          delaysMs: [...REMOTE_IDENTITY_CAPTURE_RETRY_DELAYS_MS]
        },
        failedCaptureAttempts: failedCaptureAttempts.map((entry) => ({ ...entry })),
        failure,
        cancellation: cancellation ? { ...cancellation } : null,
        sameAuthorizationResumeAllowed: false,
        requiresNewAuthorization: failure !== null || cancellation !== null
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
