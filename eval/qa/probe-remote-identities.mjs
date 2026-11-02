#!/usr/bin/env node
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import {
  REMOTE_IDENTITY_MAX_RETRY_AFTER_MS,
  REMOTE_IDENTITY_REQUEST_TIMEOUT_MS,
  REMOTE_IDENTITY_RETRY_DELAYS_MS,
  REMOTE_IDENTITY_VECTOR_SCHEMA,
  parseRemoteIdentityVector,
  remoteIdentityVectorSha256
} from "./remote-identity-guard.mjs";

export const REMOTE_IDENTITY_SOURCES = Object.freeze({
  scoutOpenapi: "https://stellarlight.xyz/api/openapi.json",
  lumenloopOpenapi: "https://api.lumenloop.com/v1/openapi.json",
  lumenloopTools: "https://api.lumenloop.com/v1/tools",
  lumenloopSkills: "https://api.lumenloop.com/v1/skills",
  // Mintlify publishes both files from the deployed docs. They need no key, so the probe does
  // not spend the organization's API rate limit that the answering server uses.
  stellarDocsLlmsTxt: "https://developers.stellar.org/llms.txt",
  stellarDocsLlmsFullTxt: "https://developers.stellar.org/llms-full.txt"
});

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function canonicalizeRemoteSource(value) {
  if (Array.isArray(value)) return value.map(canonicalizeRemoteSource);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalizeRemoteSource(value[key])])
    );
  }
  return value;
}

export function canonicalRemoteSourceSha256(value) {
  return sha256(JSON.stringify(canonicalizeRemoteSource(value)));
}

function safeRetryReason(error) {
  if (error?.kind === "http") return `HTTP ${error.status}`;
  if (error?.kind === "timeout") return "timeout";
  return "network error";
}

function sourceError(kind, message, details = {}) {
  return Object.assign(new Error(message), { kind, ...details });
}

function shouldRetry(error) {
  return (
    error?.kind === "timeout" ||
    error?.kind === "network" ||
    (error?.kind === "http" && (
      error.status === 408 ||
      error.status === 425 ||
      error.status === 429 ||
      error.status >= 500
    ))
  );
}

const HTTP_DATE = new RegExp(
  "^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), " +
  "\\d{2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) " +
  "\\d{4} \\d{2}:\\d{2}:\\d{2} GMT$"
);

export function parseRetryAfterMs(value, {
  nowMs = Date.now(),
  maximumMs = REMOTE_IDENTITY_MAX_RETRY_AFTER_MS
} = {}) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const trimmed = value.trim();
  let requestedMs;
  if (/^\d+$/.test(trimmed)) {
    requestedMs = Number(trimmed) * 1_000;
  } else {
    if (!HTTP_DATE.test(trimmed)) return null;
    const retryAtMs = Date.parse(trimmed);
    if (!Number.isFinite(retryAtMs)) return null;
    requestedMs = Math.max(0, retryAtMs - nowMs);
  }
  if (!Number.isFinite(requestedMs)) return maximumMs;
  return Math.min(maximumMs, requestedMs);
}

async function fetchWithRetry(
  { label, url, init },
  readBody,
  {
    fetchImpl = globalThis.fetch,
    timeoutMs = REMOTE_IDENTITY_REQUEST_TIMEOUT_MS,
    retryDelaysMs = REMOTE_IDENTITY_RETRY_DELAYS_MS,
    maximumRetryAfterMs = REMOTE_IDENTITY_MAX_RETRY_AFTER_MS,
    nowImpl = Date.now,
    sleepImpl = (delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs)),
    onRetry = () => {}
  } = {}
) {
  const maximumAttempts = retryDelaysMs.length + 1;
  for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let error;
    try {
      const response = await fetchImpl(url, { ...init, signal: controller.signal });
      if (!response.ok) {
        throw sourceError("http", `${label} returned HTTP ${response.status}`, {
          status: response.status,
          retryAfterMs: parseRetryAfterMs(response.headers?.get?.("retry-after"), {
            nowMs: nowImpl(),
            maximumMs: maximumRetryAfterMs
          })
        });
      }
      return await readBody(response, label);
    } catch (cause) {
      error = cause?.kind
        ? cause
        : controller.signal.aborted || cause?.name === "AbortError"
          ? sourceError("timeout", `${label} timed out`)
          : sourceError("network", `${label} had a network error`);
    } finally {
      clearTimeout(timeout);
    }

    if (!shouldRetry(error) || attempt === maximumAttempts) throw error;
    const delayMs = Math.max(
      retryDelaysMs[attempt - 1],
      error.retryAfterMs ?? 0
    );
    onRetry({
      label,
      attempt,
      maximumAttempts,
      reason: safeRetryReason(error),
      delayMs
    });
    await sleepImpl(delayMs);
  }
  throw new Error(`${label} exhausted its retry limit`);
}

async function readJsonBody(response, label) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw sourceError("invalid-json", `${label} returned invalid JSON`);
  }
}

async function readBytesBody(response) {
  return new Uint8Array(await response.arrayBuffer());
}

export function fetchJsonWithRetry(source, options) {
  return fetchWithRetry(source, readJsonBody, options);
}

/** Return the exact decoded response body, so the identity hashes the bytes that were served. */
export function fetchBytesWithRetry(source, options) {
  return fetchWithRetry(source, readBytesBody, options);
}

function requireObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value;
}

function requireString(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value;
}

export function normalizeLumenloopInventory(openapiValue, toolsValue, skillsValue) {
  const openapi = requireObject(openapiValue, "Lumenloop OpenAPI");
  const version = requireString(openapi.info?.version, "Lumenloop OpenAPI version");
  const envelope = requireObject(toolsValue, "Lumenloop tools response");
  const data = requireObject(envelope.data, "Lumenloop tools data");
  if (envelope.success !== true || !Array.isArray(data.tools) || !Array.isArray(data.workflows)) {
    throw new Error("Lumenloop tools response is incomplete");
  }
  if (data.count !== data.tools.length) {
    throw new Error("Lumenloop tools response count does not match its tools");
  }
  const skillsEnvelope = requireObject(skillsValue, "Lumenloop skills response");
  const skillsData = requireObject(skillsEnvelope.data, "Lumenloop skills data");
  if (
    skillsEnvelope.success !== true ||
    !Array.isArray(skillsData.skills) ||
    skillsData.count !== skillsData.skills.length
  ) {
    throw new Error("Lumenloop skills response is incomplete");
  }
  const publicCatalog = {
    count: data.count,
    hint: requireString(data.hint, "Lumenloop tools hint"),
    scope: requireString(data.scope, "Lumenloop tools scope"),
    skillCount: skillsData.count,
    skills: [...skillsData.skills].sort((left, right) => left.name.localeCompare(right.name)),
    skillArchives: canonicalizeRemoteSource(
      requireObject(skillsData.archives, "Lumenloop skill archives")
    ),
    skillNote: requireString(skillsData.note, "Lumenloop skill note"),
    skillVersions: canonicalizeRemoteSource(
      requireObject(skillsData.versions, "Lumenloop skill versions")
    ),
    tools: [...data.tools].sort((left, right) => left.name.localeCompare(right.name)),
    workflows: [...data.workflows].sort((left, right) => left.name.localeCompare(right.name))
  };
  return {
    advertisedContractIdentity: `openapi-${version}`,
    canonicalInventorySha256: canonicalRemoteSourceSha256({ openapi, publicCatalog })
  };
}

const UTF8 = new TextDecoder("utf-8", { fatal: true, ignoreBOM: false });

/**
 * Identify one published Mintlify text file by its exact bytes.
 * Both files open with a Markdown heading. A 200 response with an HTML or empty body is an
 * outage page, not an identity, so the probe rejects it.
 */
export function stellarDocsFileIdentity(value, label) {
  const bytes = value instanceof Uint8Array ? value : null;
  let text = null;
  try {
    text = bytes && bytes.length > 0 ? UTF8.decode(bytes) : null;
  } catch {
    text = null;
  }
  if (text === null || !/^# \S/.test(text)) {
    throw new Error(`${label} is not a UTF-8 Markdown document`);
  }
  return { sha256: sha256(bytes), bytes: bytes.length };
}

export function buildRemoteIdentityVector({
  scoutOpenapi,
  lumenloopOpenapi,
  lumenloopTools,
  lumenloopSkills,
  stellarDocsLlmsTxt,
  stellarDocsLlmsFullTxt
}) {
  const scout = requireObject(scoutOpenapi, "Scout OpenAPI");
  const scoutVersion = requireString(scout.info?.version, "Scout OpenAPI version");
  const llmsTxt = stellarDocsFileIdentity(stellarDocsLlmsTxt, "Stellar Docs llms.txt");
  const llmsFullTxt = stellarDocsFileIdentity(stellarDocsLlmsFullTxt, "Stellar Docs llms-full.txt");
  return parseRemoteIdentityVector({
    schema: REMOTE_IDENTITY_VECTOR_SCHEMA,
    services: {
      scout: {
        openapiVersion: scoutVersion,
        canonicalOpenapiSha256: canonicalRemoteSourceSha256(scout)
      },
      lumenloop: normalizeLumenloopInventory(lumenloopOpenapi, lumenloopTools, lumenloopSkills),
      stellarDocs: {
        llmsTxtSha256: llmsTxt.sha256,
        llmsTxtBytes: llmsTxt.bytes,
        llmsFullTxtSha256: llmsFullTxt.sha256,
        llmsFullTxtBytes: llmsFullTxt.bytes
      }
    }
  });
}

export async function probeRemoteIdentities(options = {}) {
  const request = (source) => fetchJsonWithRetry(source, options);
  const requestBytes = (source) => fetchBytesWithRetry(source, options);
  const [
    scoutOpenapi,
    lumenloopOpenapi,
    lumenloopTools,
    lumenloopSkills,
    stellarDocsLlmsTxt,
    stellarDocsLlmsFullTxt
  ] = await Promise.all([
    request({ label: "Scout OpenAPI", url: REMOTE_IDENTITY_SOURCES.scoutOpenapi }),
    request({ label: "Lumenloop OpenAPI", url: REMOTE_IDENTITY_SOURCES.lumenloopOpenapi }),
    request({ label: "Lumenloop public tools", url: REMOTE_IDENTITY_SOURCES.lumenloopTools }),
    request({ label: "Lumenloop public skills", url: REMOTE_IDENTITY_SOURCES.lumenloopSkills }),
    requestBytes({ label: "Stellar Docs llms.txt", url: REMOTE_IDENTITY_SOURCES.stellarDocsLlmsTxt }),
    requestBytes({
      label: "Stellar Docs llms-full.txt",
      url: REMOTE_IDENTITY_SOURCES.stellarDocsLlmsFullTxt
    })
  ]);
  return buildRemoteIdentityVector({
    scoutOpenapi,
    lumenloopOpenapi,
    lumenloopTools,
    lumenloopSkills,
    stellarDocsLlmsTxt,
    stellarDocsLlmsFullTxt
  });
}

export async function captureStablePreArmIdentity({
  captureCount = 3,
  intervalMs = 5 * 60_000,
  probe = probeRemoteIdentities,
  sleepImpl = (delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs))
} = {}) {
  if (!Number.isInteger(captureCount) || captureCount < 2) {
    throw new Error("stable pre-arm capture count must be at least 2");
  }
  let expectedSha256 = null;
  for (let capture = 1; capture <= captureCount; capture += 1) {
    const vectorSha256 = remoteIdentityVectorSha256(await probe());
    expectedSha256 ??= vectorSha256;
    if (vectorSha256 !== expectedSha256) {
      throw new Error(`remote identity changed during pre-arm capture ${capture}`);
    }
    if (capture < captureCount) await sleepImpl(intervalMs);
  }
  return expectedSha256;
}

async function main() {
  const args = process.argv.slice(2);
  if (
    args.length > 1 ||
    (args.length === 1 && !["--sha256", "--stable-sha256"].includes(args[0]))
  ) {
    throw new Error("usage: probe-remote-identities.mjs [--sha256|--stable-sha256]");
  }
  const probe = () => probeRemoteIdentities({
    onRetry: ({ label, attempt, maximumAttempts, reason, delayMs }) => {
      console.error(
        `remote-identity-probe: ${label} attempt ${attempt}/${maximumAttempts} failed (${reason}); retrying in ${delayMs} ms`
      );
    }
  });
  if (args[0] === "--stable-sha256") {
    console.log(await captureStablePreArmIdentity({ probe }));
    return;
  }
  const vector = await probe();
  console.log(args[0] === "--sha256" ? remoteIdentityVectorSha256(vector) : JSON.stringify(vector));
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => {
    console.error(`remote-identity-probe: ${String(error.message ?? error)}`);
    process.exitCode = 1;
  });
}
