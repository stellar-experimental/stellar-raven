#!/usr/bin/env node
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import {
  REMOTE_IDENTITY_VECTOR_SCHEMA,
  parseRemoteIdentityVector,
  remoteIdentityVectorSha256
} from "./remote-identity-guard.mjs";

const DOCS_APPLICATION_ID = "VNSJF5AWIZ";
const DOCS_INDEX_NAME = "crawler_Stellar Docs - Docusaurus";
// Algolia documents this search-only key for the public Stellar Docs index.
const DOCS_SEARCH_KEY = "c932e7670879e29070e269d202fb6740";
const DEFAULT_TIMEOUT_MS = 20_000;
const DEFAULT_RETRY_DELAYS_MS = [250, 1_000];

export const REMOTE_IDENTITY_SOURCES = Object.freeze({
  scoutOpenapi: "https://stellarlight.xyz/api/openapi.json",
  lumenloopOpenapi: "https://api.lumenloop.com/v1/openapi.json",
  lumenloopTools: "https://api.lumenloop.com/v1/tools",
  lumenloopSkills: "https://api.lumenloop.com/v1/skills",
  stellarDocsSettings:
    `https://${DOCS_APPLICATION_ID}-dsn.algolia.net/1/indexes/crawler_Stellar%20Docs%20-%20Docusaurus/settings`,
  stellarDocsTitles:
    `https://${DOCS_APPLICATION_ID}-dsn.algolia.net/1/indexes/*/queries`
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

export async function fetchJsonWithRetry(
  { label, url, init },
  {
    fetchImpl = globalThis.fetch,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retryDelaysMs = DEFAULT_RETRY_DELAYS_MS,
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
          status: response.status
        });
      }
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        throw sourceError("invalid-json", `${label} returned invalid JSON`);
      }
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
    onRetry({
      label,
      attempt,
      maximumAttempts,
      reason: safeRetryReason(error)
    });
    await sleepImpl(retryDelaysMs[attempt - 1]);
  }
  throw new Error(`${label} exhausted its retry limit`);
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

function stripDocsOrigin(url) {
  return String(url ?? "").replace(/^https?:\/\/developers\.stellar\.org/, "");
}

export function normalizeStellarDocsTitles(value) {
  const response = requireObject(value, "Stellar Docs title response");
  if (!Array.isArray(response.hits) || !Number.isInteger(response.nbHits)) {
    throw new Error("Stellar Docs title response is incomplete");
  }
  if (response.nbHits !== response.hits.length) {
    throw new Error("Stellar Docs title response is truncated");
  }
  const unique = new Map();
  for (const hit of response.hits) {
    const path = stripDocsOrigin(hit.url_without_anchor);
    const title = hit.hierarchy?.lvl1;
    if (!path || typeof title !== "string" || title.length === 0) continue;
    unique.set(`${path}\u0000${title}`, { path, title });
  }
  return [...unique.values()].sort(
    (left, right) => left.path.localeCompare(right.path) || left.title.localeCompare(right.title)
  );
}

export function buildRemoteIdentityVector({
  scoutOpenapi,
  lumenloopOpenapi,
  lumenloopTools,
  lumenloopSkills,
  stellarDocsSettings,
  stellarDocsTitles
}) {
  const scout = requireObject(scoutOpenapi, "Scout OpenAPI");
  const scoutVersion = requireString(scout.info?.version, "Scout OpenAPI version");
  const docsSettings = requireObject(stellarDocsSettings, "Stellar Docs settings");
  const docsTitles = normalizeStellarDocsTitles(stellarDocsTitles);
  return parseRemoteIdentityVector({
    schema: REMOTE_IDENTITY_VECTOR_SCHEMA,
    services: {
      scout: {
        openapiVersion: scoutVersion,
        canonicalOpenapiSha256: canonicalRemoteSourceSha256(scout)
      },
      lumenloop: normalizeLumenloopInventory(lumenloopOpenapi, lumenloopTools, lumenloopSkills),
      stellarDocs: {
        indexSettingsSha256: canonicalRemoteSourceSha256(docsSettings),
        canonicalTitleSetSha256: canonicalRemoteSourceSha256(docsTitles)
      }
    }
  });
}

export async function probeRemoteIdentities(options = {}) {
  const request = (source) => fetchJsonWithRetry(source, options);
  const docsHeaders = {
    "x-algolia-api-key": DOCS_SEARCH_KEY,
    "x-algolia-application-id": DOCS_APPLICATION_ID
  };
  const docsQueryParams = (page) => new URLSearchParams({
    query: "",
    filters: "type:lvl1",
    hitsPerPage: "1000",
    page: String(page),
    distinct: "false",
    attributesToRetrieve: JSON.stringify(["hierarchy", "url_without_anchor"]),
    attributesToHighlight: "[]",
    attributesToSnippet: "[]"
  }).toString();
  const docsTitleRequest = {
    label: "Stellar Docs title batch",
    url: REMOTE_IDENTITY_SOURCES.stellarDocsTitles,
    init: {
      method: "POST",
      headers: { ...docsHeaders, "content-type": "application/json" },
      body: JSON.stringify({
        requests: Array.from({ length: 10 }, (_, page) => ({
          indexName: DOCS_INDEX_NAME,
          params: docsQueryParams(page)
        }))
      })
    }
  };
  const [
    scoutOpenapi,
    lumenloopOpenapi,
    lumenloopTools,
    lumenloopSkills,
    stellarDocsSettings,
    stellarDocsTitleBatch
  ] = await Promise.all([
    request({ label: "Scout OpenAPI", url: REMOTE_IDENTITY_SOURCES.scoutOpenapi }),
    request({ label: "Lumenloop OpenAPI", url: REMOTE_IDENTITY_SOURCES.lumenloopOpenapi }),
    request({ label: "Lumenloop public tools", url: REMOTE_IDENTITY_SOURCES.lumenloopTools }),
    request({ label: "Lumenloop public skills", url: REMOTE_IDENTITY_SOURCES.lumenloopSkills }),
    request({
      label: "Stellar Docs settings",
      url: REMOTE_IDENTITY_SOURCES.stellarDocsSettings,
      init: { headers: docsHeaders }
    }),
    request(docsTitleRequest)
  ]);
  const titleResults = stellarDocsTitleBatch?.results;
  if (
    !Array.isArray(titleResults) ||
    titleResults.length !== 10 ||
    !Number.isInteger(titleResults[0]?.nbPages) ||
    titleResults[0].nbPages < 1 ||
    titleResults[0].nbPages > titleResults.length
  ) {
    throw new Error("Stellar Docs title page count is invalid");
  }
  const titlePages = titleResults.slice(0, titleResults[0].nbPages);
  for (const [page, response] of titlePages.entries()) {
    if (
      response.page !== page ||
      response.nbPages !== titleResults[0].nbPages ||
      response.nbHits !== titleResults[0].nbHits ||
      !Array.isArray(response.hits)
    ) {
      throw new Error("Stellar Docs title pagination changed during capture");
    }
  }
  const stellarDocsTitles = {
    nbHits: titleResults[0].nbHits,
    hits: titlePages.flatMap((page) => page.hits)
  };
  return buildRemoteIdentityVector({
    scoutOpenapi,
    lumenloopOpenapi,
    lumenloopTools,
    lumenloopSkills,
    stellarDocsSettings,
    stellarDocsTitles
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
    onRetry: ({ label, attempt, maximumAttempts, reason }) => {
      console.error(
        `remote-identity-probe: ${label} attempt ${attempt}/${maximumAttempts} failed (${reason}); retrying`
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
