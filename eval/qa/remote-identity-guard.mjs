import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, realpathSync } from "node:fs";
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

/**
 * Validate and normalize one probe result. Exact keys exclude timestamps and
 * other volatile fields from the comparison contract.
 */
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
  return {
    matches: changedServices.length === 0,
    changedServices
  };
}

export function remoteIdentityProbeIdentity(command, expectedSha256) {
  if (typeof command !== "string" || command.trim() === "") {
    throw new Error("--remote-identity-probe is required before collection");
  }
  if (typeof expectedSha256 !== "string" || !SHA256.test(expectedSha256)) {
    throw new Error(
      "--expect-remote-identity-probe-sha256 must be a 64-character lowercase SHA-256"
    );
  }
  let resolvedPath;
  let actualSha256;
  try {
    resolvedPath = realpathSync(path.resolve(command));
    actualSha256 = sha256(readFileSync(resolvedPath));
  } catch {
    throw new Error("remote identity probe executable is unavailable");
  }
  if (actualSha256 !== expectedSha256) {
    throw new Error("remote identity probe bytes do not match the expected SHA-256");
  }
  return {
    contract: REMOTE_IDENTITY_VECTOR_SCHEMA,
    resolvedPath,
    sha256: actualSha256,
    expectedSha256,
    matches: true
  };
}

/** Run the pinned probe without retaining its raw stdout or stderr. */
export function captureRemoteIdentity(probeIdentity, {
  spawnSyncImpl = spawnSync,
  timeoutMs = 60_000
} = {}) {
  const current = remoteIdentityProbeIdentity(
    probeIdentity?.resolvedPath,
    probeIdentity?.expectedSha256
  );
  const result = spawnSyncImpl(current.resolvedPath, [], {
    encoding: "utf8",
    timeout: timeoutMs,
    maxBuffer: 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"]
  });
  if (result.error || result.status !== 0 || result.signal) {
    throw new Error("remote identity probe did not complete successfully");
  }
  let parsed;
  try {
    parsed = JSON.parse(String(result.stdout ?? ""));
  } catch {
    throw new Error("remote identity probe returned invalid JSON");
  }
  try {
    return parseRemoteIdentityVector(parsed);
  } catch {
    throw new Error("remote identity probe returned an invalid identity vector");
  }
}

export class RemoteIdentityGuardError extends Error {
  constructor(message) {
    super(message);
    this.name = "RemoteIdentityGuardError";
    this.code = "remote-identity-guard";
  }
}

/**
 * Track the before/after pair for each answering call. A failure permanently
 * closes this instance, which prevents a same-process resume.
 */
export function createRemoteIdentityGuard({ probeIdentity, capture = captureRemoteIdentity }) {
  let baselineVector = null;
  let finalVector = null;
  let pendingCall = null;
  let failure = null;
  let completedAnsweringCalls = 0;
  const captures = [];

  const fail = ({ reason, phase, context, beforeVector = null, afterVector = null, changedServices = [] }) => {
    failure ??= {
      reason,
      phase,
      id: context.id,
      attempt: context.attempt,
      changedServices,
      beforeVector,
      afterVector
    };
    throw new RemoteIdentityGuardError(
      reason === "identity-changed"
        ? `remote service identity changed: ${changedServices.join(", ")}`
        : "remote identity probe is unavailable"
    );
  };

  const captureVector = (phase, context) => {
    let vector;
    try {
      vector = parseRemoteIdentityVector(capture(probeIdentity));
    } catch {
      fail({
        reason: "probe-unavailable",
        phase,
        context,
        beforeVector: phase === "after" ? pendingCall?.vector ?? null : baselineVector,
        afterVector: null
      });
    }
    const normalized = vector;
    captures.push({
      sequence: captures.length + 1,
      phase,
      id: context.id,
      attempt: context.attempt,
      vectorSha256: remoteIdentityVectorSha256(normalized)
    });
    finalVector = normalized;
    return normalized;
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
      if (baselineVector === null) baselineVector = vector;
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

    afterCall(context) {
      if (!pendingCall || pendingCall.id !== context.id || pendingCall.attempt !== context.attempt) {
        throw new Error("remote identity guard answering-call context does not match");
      }
      completedAnsweringCalls += 1;
      const beforeVector = pendingCall.vector;
      let afterVector;
      try {
        afterVector = captureVector("after", context);
      } finally {
        pendingCall = null;
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

    record() {
      return {
        schema: REMOTE_IDENTITY_GUARD_SCHEMA,
        probe: probeIdentity,
        matches: failure === null,
        baselineVector,
        finalVector,
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
  try {
    result = call(authorization);
    onCompleted(result);
    persistSpend(authorization, result);
    return result;
  } finally {
    guard.afterCall(context);
  }
}
