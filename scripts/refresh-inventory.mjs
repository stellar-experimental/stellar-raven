#!/usr/bin/env node
// Regenerate the four service inventory snapshots under inventory/ (lumenloop,
// stellar-light, stellar-docs + titles, stellar-org).
//   node scripts/refresh-inventory.mjs [--service lumenloop|stellar-light|stellar-docs|stellar-org]
//
// Reads .env (LUMENLOOP_API_KEY, MINTLIFY_ASSISTANT_API_KEY) + process.env.
// Deterministic and idempotent (preserves existing fetchedAt when content is unchanged);
// refuses to write if any secret value appears in output.
//
// LUMENLOOP_PARTNER_TOOLS supplies partner names hidden by GET /v1/tools (validated against
// GET /v1/me tools.available; see ARCHITECTURE.md). Partner-lane tools and partner-set skills
// are persisted as name-only stubs (`partner_stub: true`; no descriptions, schemas, files, or
// `me.limits`) so partner-tier detail is never committed.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchJson, parseEnvFile, sortDeep } from "./lib/shared.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const INVENTORY_DIR = join(ROOT, "inventory");

// ---------------------------------------------------------------------------
// Authored config — Lumenloop partner lane
// ---------------------------------------------------------------------------
// Union authored partner names with GET /v1/tools and validate GET /v1/me tools.available.
// ARCHITECTURE.md describes the inventory and exposure boundaries.
const LUMENLOOP_BASE = "https://api.lumenloop.com/v1";
const LUMENLOOP_PARTNER_TOOLS = ["list_my_research", "request_research", "research_result"];

// ---------------------------------------------------------------------------
// Stellar Docs (Mintlify) — backend identity mirrors specs/stellar-docs.json `backend`.
// ---------------------------------------------------------------------------
const STELLAR_DOCS_ORIGIN = "https://developers.stellar.org";
const MINTLIFY_API_BASE = "https://api.mintlify.com";
const MINTLIFY_SUBDOMAIN = "stellardevelopmentfoundation";
const MINTLIFY_SEARCH_PATH = `/discovery/v1/search/${MINTLIFY_SUBDOMAIN}`;
const MINTLIFY_PAGE_PATH = `/discovery/v1/page/${MINTLIFY_SUBDOMAIN}`;
const MINTLIFY_AUTH_ENV = "MINTLIFY_ASSISTANT_API_KEY";
// Fixed probe query: it only proves the search contract answers; its hits are
// not recorded, so ranking churn cannot produce drift.
const MINTLIFY_PROBE_QUERY = "glossary";
// Bound for the recursive /_llms/ index walk; reaching it means a cycle or a
// layout change, so the refresh fails instead of recording a partial corpus.
const MAX_LLMS_INDEX_FILES = 50;

// ---------------------------------------------------------------------------
// stellar.org — keyless site search and one page probe; mirrors specs/stellar-org.json `backend`.
// ---------------------------------------------------------------------------
const STELLAR_ORG_ORIGIN = "https://stellar.org";
const STELLAR_ORG_SEARCH_PATH = "/api/search";
const STELLAR_ORG_USER_AGENT = "RavenMCP/1.0";
// Fixed probes: only the response shape is recorded, so ranking and page copy cannot produce drift.
const STELLAR_ORG_PROBE_QUERY = "roadmap";
const STELLAR_ORG_PROBE_PATH = "/";

// .env parser + JSON fetch + deep key sort live in scripts/lib/shared.mjs
// (shared with scripts/check-skills-drift.mjs; this file's behavior is canonical).
const ENV = { ...parseEnvFile(join(ROOT, ".env")), ...process.env };

function requireEnv(name) {
  const value = ENV[name];
  if (!value) throw new Error(`missing required env var ${name} (set it in .env)`);
  return value;
}

// ---------------------------------------------------------------------------
// Deterministic serialization + idempotent writes + secret scrubbing
// ---------------------------------------------------------------------------
function stableStringify(value) {
  return `${JSON.stringify(sortDeep(value), null, 2)}\n`;
}

// Union .env entries and secret process.env vars so env-only runs are still scrub-checked.
const SECRET_ENV_NAMES = ["LUMENLOOP_API_KEY", "MINTLIFY_ASSISTANT_API_KEY"];

const SECRET_VALUES = (() => {
  const byPair = new Map();
  const add = (k, v) => {
    if (typeof v === "string" && v.length >= 6) byPair.set(`${k}=${v}`, [k, v]);
  };
  for (const [k, v] of Object.entries(parseEnvFile(join(ROOT, ".env")))) add(k, v);
  for (const k of SECRET_ENV_NAMES) add(k, process.env[k]);
  return [...byPair.values()];
})();

// Match src/policy/redact.ts's secret names.
// Keep this helper local so the maintenance script still runs as plain JavaScript.
const ERROR_SECRET_ENV_NAMES = [
  "LUMENLOOP_API_KEY", "MINTLIFY_ASSISTANT_API_KEY",
  "MCP_SERVER_SECRET", "WORKOS_API_KEY"
];

function redactErrorMessage(message) {
  const variants = new Set();
  for (const name of ERROR_SECRET_ENV_NAMES) {
    const value = ENV[name];
    if (typeof value !== "string" || value.length === 0) continue;
    variants.add(value);
    variants.add(encodeURIComponent(value));
    variants.add(Buffer.from(value).toString("base64"));
  }
  // Replace once, longest first: overlapping secrets cannot expose a suffix or
  // rewrite the replacement marker. Escape every regex metacharacter literally.
  const pattern = [...variants].sort((a, b) => b.length - a.length)
    .map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  return pattern ? String(message).replace(new RegExp(pattern, "g"), "[redacted]") : String(message);
}

function assertNoSecrets(fileName, text) {
  for (const [name, value] of SECRET_VALUES) {
    if (text.includes(value)) {
      throw new Error(`refusing to write ${fileName}: output contains the value of ${name}`);
    }
  }
}

function writeInventory(fileName, candidate) {
  const path = join(INVENTORY_DIR, fileName);
  const next = stableStringify(candidate);
  assertNoSecrets(fileName, next);
  if (existsSync(path)) {
    try {
      const existing = JSON.parse(readFileSync(path, "utf8"));
      const existingNormalized = { ...existing, fetchedAt: candidate.fetchedAt };
      if (stableStringify(existingNormalized) === next) {
        console.log(`inventory/${fileName}: unchanged (kept fetchedAt ${existing.fetchedAt})`);
        return;
      }
    } catch {
      // unreadable/invalid existing file — fall through and rewrite
    }
  }
  writeFileSync(path, next);
  console.log(`inventory/${fileName}: written`);
}

// ---------------------------------------------------------------------------
// fetch helpers (fetchJson imported from ./lib/shared.mjs)
// ---------------------------------------------------------------------------
async function lumenloopGet(path, apiKey) {
  const body = await fetchJson(`${LUMENLOOP_BASE}${path}`, {
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
    label: `lumenloop ${path}`,
  });
  if (body.success !== true) {
    throw new Error(`lumenloop ${path}: envelope error ${body.code ?? ""} ${body.error ?? ""}`);
  }
  return body.data;
}

const HTTP_METHODS = new Set(["get", "post", "put", "patch", "delete", "head", "options"]);

function countOperations(openapi) {
  let count = 0;
  for (const pathItem of Object.values(openapi.paths ?? {})) {
    for (const key of Object.keys(pathItem)) if (HTTP_METHODS.has(key)) count += 1;
  }
  return count;
}

// ---------------------------------------------------------------------------
// Lumenloop
// ---------------------------------------------------------------------------
async function refreshLumenloop() {
  const apiKey = requireEnv("LUMENLOOP_API_KEY");

  const [toolList, me, skillList, changelog, openapi] = await Promise.all([
    lumenloopGet("/tools"), // keyless list: guest lane only (hides partner tools)
    lumenloopGet("/me", apiKey),
    lumenloopGet("/skills", apiKey), // lists partner skills but marks them available:false
    lumenloopGet("/changelog"),
    // Raw OpenAPI 3.1 (keyless, not enveloped); omits partner tools like /v1/tools.
    fetchJson(`${LUMENLOOP_BASE}/openapi.json`, { label: "lumenloop /openapi.json" }),
  ]);

  const listedToolNames = (toolList.tools ?? []).map((t) => t.name);
  const toolNames = [...new Set([...listedToolNames, ...LUMENLOOP_PARTNER_TOOLS])].sort();

  const available = me?.tools?.available;
  if (toolNames.length !== available) {
    throw new Error(
      `lumenloop tool union has ${toolNames.length} tools but /v1/me reports ${available} available — ` +
        `update LUMENLOOP_PARTNER_TOOLS in scripts/refresh-inventory.mjs (the list endpoint hides partner tools).`,
    );
  }

  // Persist partner tools as name-only stubs (publish-safety; keeps union and exclusion guards intact).
  const listedSet = new Set(listedToolNames);
  const tools = await Promise.all(
    toolNames.map(async (name) => {
      if (!listedSet.has(name)) {
        return { name, listed_in_catalog: false, partner_stub: true };
      }
      const detail = await lumenloopGet(`/tools/${name}`, apiKey);
      return { ...detail, listed_in_catalog: true };
    }),
  );
  tools.sort((a, b) => a.name.localeCompare(b.name));

  // Skills metadata only (no zip contents); partner-set skills stay name/set/tier stubs.
  const skills = await Promise.all(
    (skillList.skills ?? []).map(async (entry) => {
      if (entry.set === "partner") {
        return {
          name: entry.name,
          set: entry.set,
          tier: entry.tier,
          listed_available: entry.available,
          partner_stub: true,
        };
      }
      const detail = await lumenloopGet(`/skills/${entry.name}`, apiKey);
      return {
        name: entry.name,
        set: entry.set,
        tier: entry.tier,
        description: entry.description,
        listed_available: entry.available,
        detail_available: true,
        files: (detail.files ?? []).map((f) => f.path).sort(),
      };
    }),
  );
  skills.sort((a, b) => a.name.localeCompare(b.name));

  const entries = changelog.entries ?? [];
  const latest = entries.reduce((a, b) => (!a || (b.date ?? "") > (a.date ?? "") ? b : a), null);

  writeInventory("lumenloop.json", {
    service: "lumenloop",
    fetchedAt: new Date().toISOString(),
    source: {
      base: LUMENLOOP_BASE,
      tools: `${LUMENLOOP_BASE}/tools`,
      toolDetail: `${LUMENLOOP_BASE}/tools/{name}`,
      me: `${LUMENLOOP_BASE}/me`,
      skills: `${LUMENLOOP_BASE}/skills`,
      changelog: `${LUMENLOOP_BASE}/changelog`,
      openapi: `${LUMENLOOP_BASE}/openapi.json`,
      authEnv: "LUMENLOOP_API_KEY",
      research: "research/services/lumenloop.md",
    },
    quirk:
      "GET /v1/tools and GET /v1/skills hide (or mark unavailable) partner-tier items even with a partner key. " +
      "This inventory unions the list endpoints and validates the tool count against GET /v1/me tools.available. " +
      "Partner-tier items are persisted as name-only stubs (partner_stub: true) — detail is never committed.",
    changelogCursor: latest
      ? { date: latest.date, title: latest.title, breaking: latest.breaking ?? false }
      : null,
    changelogEntryCount: changelog.count ?? entries.length,
    // Account limits/quotas are deliberately NOT persisted (partner-tier
    // account detail; publish-safety). tools.available is what the union
    // count-guard above asserts against, so it stays.
    me: {
      tier: me.tier,
      lane: me.lane,
      tools: me.tools,
    },
    toolCount: tools.length,
    tools,
    skillCount: skills.length,
    skills,
    // Full raw OpenAPI 3.1 spec, embedded like stellar-light's. Guest-lane only:
    // 18 POST /tools/{name} invoke paths + account/discovery endpoints; the 3
    // partner tools never appear here (see `quirk`) — `tools` above is the union truth.
    openapiVersion: openapi.info?.version ?? null,
    openapiOperationCount: countOperations(openapi),
    openapi,
  });

  return {
    toolCount: tools.length,
    partnerToolCount: tools.filter((t) => !t.listed_in_catalog).length,
    skillCount: skills.length,
    openapiOperationCount: countOperations(openapi),
  };
}

// ---------------------------------------------------------------------------
// Stellar Light / Scout
// ---------------------------------------------------------------------------
const STELLAR_LIGHT_BASE = "https://stellarlight.xyz";

async function refreshStellarLight() {
  const [openapi, status, changelog] = await Promise.all([
    fetchJson(`${STELLAR_LIGHT_BASE}/api/openapi.json`),
    fetchJson(`${STELLAR_LIGHT_BASE}/api/status`),
    fetchJson(`${STELLAR_LIGHT_BASE}/api/changelog?limit=1`),
  ]);

  const operationCount = countOperations(openapi);

  // Strip per-request/telemetry volatility so back-to-back runs are stable and
  // diffs reflect contract changes, not traffic. dataSources row counts /
  // snapshot dates churn daily (e.g. the Electric Capital snapshot) — keep only
  // which corpora EXIST; freshness belongs to the live /api/status call, and
  // letting it into the inventory would page the drift check every day.
  const statusSnapshot = normalizeScoutStatus(status);

  writeInventory("stellar-light.json", {
    service: "stellar-light",
    fetchedAt: new Date().toISOString(),
    source: {
      base: STELLAR_LIGHT_BASE,
      openapi: `${STELLAR_LIGHT_BASE}/api/openapi.json`,
      status: `${STELLAR_LIGHT_BASE}/api/status`,
      changelog: `${STELLAR_LIGHT_BASE}/api/changelog`,
      auth: "none (keyless, read-only)",
      research: "research/services/stellar-light.md",
    },
    openapiVersion: openapi.info?.version ?? null,
    operationCount,
    openapi,
    status: statusSnapshot,
    statusNote:
      "volatile fields (generatedAt, usage, sources/dataSources counts/dates/notes) stripped by scripts/refresh-inventory.mjs",
    changelogLatest: (changelog.entries ?? [])[0] ?? null,
    changelogEntryCount: changelog.meta?.total ?? null,
  });

  return { operationCount };
}

export function normalizeScoutStatus(status) {
  const { generatedAt: _g, usage: _u, ...statusSnapshot } = status;
  for (const field of ["sources", "dataSources"]) {
    if (Array.isArray(statusSnapshot[field])) {
      statusSnapshot[field] = statusSnapshot[field].map(({ name }) => ({ name }));
    }
  }
  return statusSnapshot;
}

// ---------------------------------------------------------------------------
// Stellar Docs (Mintlify) — docs/stellar-docs.md defines the endpoint and credential boundaries.
// ---------------------------------------------------------------------------
async function fetchText(url, label = url) {
  const attempts = 3;
  for (let attempt = 1; ; attempt += 1) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      if (res.status >= 500 && attempt < attempts) throw new Error(`HTTP ${res.status}`);
      if (!res.ok) throw Object.assign(new Error(`${label}: HTTP ${res.status}`), { final: true });
      return await res.text();
    } catch (err) {
      if (err.final || attempt >= attempts) {
        throw new Error(`${label}: ${err.message}${err.cause ? ` (${err.cause.code ?? err.cause.message ?? err.cause})` : ""}`);
      }
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

/**
 * Map a same-origin llms.txt link to the catalog's page-path form: no origin,
 * no `.md`, no trailing `/index` (`/docs/build/index.md` -> `/docs/build`).
 * Returns null for any other origin.
 */
export function docsPathFromLlmsUrl(url, origin = STELLAR_DOCS_ORIGIN) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.origin !== origin) return null;
  const path = parsed.pathname.replace(/\.md$/, "").replace(/\/index$/, "").replace(/\/+$/, "");
  return path === "" ? "/" : path;
}

/**
 * Parse one llms.txt index file. A list item that links a same-origin `.md`
 * file is a page; one that links a same-origin `/_llms/*.txt` file is a nested
 * index the caller must follow. Inline links in descriptions are ignored.
 */
export function parseLlmsIndex(text, origin = STELLAR_DOCS_ORIGIN) {
  const pages = [];
  const indexes = [];
  for (const line of text.split("\n")) {
    const match = /^- \[(.+?)\]\((\S+?)\)(?::\s|$)/.exec(line.trim());
    if (!match) continue;
    const [, title, url] = match;
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      continue;
    }
    if (parsed.origin !== origin) continue;
    if (/^\/_llms\/.+\.txt$/.test(parsed.pathname)) {
      indexes.push(`${origin}${parsed.pathname}`);
    } else if (parsed.pathname.endsWith(".md")) {
      pages.push({ path: docsPathFromLlmsUrl(url, origin), title: title.trim() });
    }
  }
  return { pages, indexes };
}

/** Deduplicate on path + title and sort by path, then title. */
export function normalizeTitles(pages) {
  const seen = new Set();
  const titles = [];
  for (const { path, title } of pages) {
    if (!path || !title) continue;
    const key = `${path} ${title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    titles.push({ path, title });
  }
  return titles.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : a.title.localeCompare(b.title)));
}

function shapeOf(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return typeof value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, shapeOf(value[key])]));
}

async function mintlifyPost(path, apiKey, body, label) {
  return fetchJson(`${MINTLIFY_API_BASE}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body,
    label,
  });
}

async function refreshStellarDocs() {
  const apiKey = requireEnv(MINTLIFY_AUTH_ENV);

  // Page index: keyless llms.txt plus every nested /_llms/ index it links.
  const rootUrl = `${STELLAR_DOCS_ORIGIN}/llms.txt`;
  const queue = [rootUrl];
  const visited = new Set();
  const indexFiles = [];
  const pages = [];
  while (queue.length > 0) {
    const url = queue.shift();
    if (visited.has(url)) continue;
    if (visited.size >= MAX_LLMS_INDEX_FILES) {
      throw new Error(`llms.txt index walk exceeded ${MAX_LLMS_INDEX_FILES} files; refusing to record a partial page index`);
    }
    visited.add(url);
    const text = await fetchText(url, `stellar docs ${new URL(url).pathname}`);
    const parsed = parseLlmsIndex(text);
    indexFiles.push({ path: new URL(url).pathname, pageCount: parsed.pages.length, sha256: sha256(text) });
    pages.push(...parsed.pages);
    queue.push(...parsed.indexes);
  }
  const titles = normalizeTitles(pages);
  if (titles.length === 0) {
    throw new Error("stellar docs llms.txt: no page entries parsed; refusing to record an empty page index");
  }
  indexFiles.sort((a, b) => a.path.localeCompare(b.path));

  // Authenticated contract probes. Only the response shape is recorded.
  const searchRes = await mintlifyPost(MINTLIFY_SEARCH_PATH, apiKey, { query: MINTLIFY_PROBE_QUERY, pageSize: 1 }, "mintlify search");
  if (!Array.isArray(searchRes) || searchRes.length === 0 || typeof searchRes[0]?.path !== "string") {
    throw new Error("mintlify search: expected a non-empty array of { path, content, metadata }");
  }
  const pageRes = await mintlifyPost(MINTLIFY_PAGE_PATH, apiKey, { path: searchRes[0].path }, "mintlify page");
  if (typeof pageRes?.content !== "string") {
    throw new Error("mintlify page: expected { path, content }");
  }

  writeInventory("stellar-docs.json", {
    service: "stellar-docs",
    fetchedAt: new Date().toISOString(),
    source: {
      backend: "mintlify",
      apiBase: MINTLIFY_API_BASE,
      searchPath: MINTLIFY_SEARCH_PATH,
      pagePath: MINTLIFY_PAGE_PATH,
      subdomain: MINTLIFY_SUBDOMAIN,
      siteOrigin: STELLAR_DOCS_ORIGIN,
      authEnv: MINTLIFY_AUTH_ENV,
      llmsTxt: rootUrl,
      research: "research/services/stellar-docs-mintlify.md",
    },
    contract: {
      searchProbe: { body: { pageSize: 1, query: MINTLIFY_PROBE_QUERY }, resultShape: shapeOf(searchRes[0]) },
      pageProbe: { resultShape: shapeOf(pageRes) },
    },
    pageIndex: {
      pageCount: titles.length,
      indexFiles,
    },
  });

  // Page-title snapshot from the llms.txt page index: the specific concept
  // vocabulary ("Muxed Accounts", "Sponsored Reserves") that neither the op
  // descriptions nor the coarse taxonomy topic slugs carry. build-catalog.mjs
  // scopes these per docs operation by path prefix and distills them into the
  // low-weight `keywords` field the scorer blends in.
  writeInventory("stellar-docs-titles.json", {
    service: "stellar-docs",
    fetchedAt: new Date().toISOString(),
    source: {
      llmsTxt: rootUrl,
      auth: "none (keyless)",
      method:
        "llms.txt plus every nested /_llms/*.txt index; one list item per page; title = link text, path = same-origin URL without origin, .md, or trailing /index; deduped, sorted by path then title",
    },
    total: titles.length,
    titles,
  });

  return { pageTitleCount: titles.length, indexFileCount: indexFiles.length };
}

// ---------------------------------------------------------------------------
// stellar.org — research/services/stellar-org-site.md records the contract.
// ---------------------------------------------------------------------------
async function refreshStellarOrg() {
  const search = await fetchJson(
    `${STELLAR_ORG_ORIGIN}${STELLAR_ORG_SEARCH_PATH}?${new URLSearchParams({ q: STELLAR_ORG_PROBE_QUERY, locale: "en" })}`,
    { headers: { "User-Agent": STELLAR_ORG_USER_AGENT }, label: "stellar.org search" },
  );
  if (!Array.isArray(search?.results) || search.results.length === 0) {
    throw new Error("stellar.org search: expected a non-empty results array");
  }
  const rowKeys = [...new Set(search.results.flatMap((row) => Object.keys(row ?? {})))].sort();
  const res = await fetch(`${STELLAR_ORG_ORIGIN}${STELLAR_ORG_PROBE_PATH}`, {
    headers: { "User-Agent": STELLAR_ORG_USER_AGENT },
    redirect: "manual",
    signal: AbortSignal.timeout(30_000),
  });
  const html = await res.text();
  writeInventory("stellar-org.json", {
    service: "stellar-org",
    fetchedAt: new Date().toISOString(),
    source: {
      origin: STELLAR_ORG_ORIGIN,
      searchPath: STELLAR_ORG_SEARCH_PATH,
      auth: "none (keyless)",
      spec: "specs/stellar-org.json",
      research: "research/services/stellar-org-site.md",
    },
    contract: {
      searchProbe: {
        query: STELLAR_ORG_PROBE_QUERY,
        responseKeys: Object.keys(search).sort(),
        rowKeys,
      },
      pageProbe: {
        path: STELLAR_ORG_PROBE_PATH,
        status: res.status,
        contentType: (res.headers.get("content-type") ?? "").split(";")[0].trim(),
        hasMain: /<main\b/i.test(html),
      },
    },
  });
  return { rowKeyCount: rowKeys.length };
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
export function parseServiceArg(args) {
  if (args.length === 0) return "all";
  if (args.length !== 2 || args[0] !== "--service") {
    throw new Error("usage: node scripts/refresh-inventory.mjs [--service lumenloop|stellar-light|stellar-docs|stellar-org]");
  }
  const service = args[1];
  if (!["lumenloop", "stellar-light", "stellar-docs", "stellar-org"].includes(service)) {
    throw new Error(`unknown service "${service}" (expected lumenloop, stellar-light, stellar-docs, or stellar-org)`);
  }
  return service;
}

async function main() {
  mkdirSync(INVENTORY_DIR, { recursive: true });
  const service = parseServiceArg(process.argv.slice(2));
  if (service === "lumenloop") {
    const result = await refreshLumenloop();
    console.log(`done: lumenloop ${result.toolCount} tools (${result.partnerToolCount} partner, hidden from /v1/tools) + ${result.skillCount} skills + openapi (${result.openapiOperationCount} ops)`);
  } else if (service === "stellar-light") {
    const result = await refreshStellarLight();
    console.log(`done: stellar-light ${result.operationCount} ops`);
  } else if (service === "stellar-docs") {
    const result = await refreshStellarDocs();
    console.log(`done: stellar-docs Mintlify contract + ${result.pageTitleCount} page titles from ${result.indexFileCount} llms.txt files`);
  } else if (service === "stellar-org") {
    await refreshStellarOrg();
    console.log("done: stellar-org site search and page contract");
  } else {
    const [lumenloop, stellarLight, stellarDocs] = await Promise.all([
      refreshLumenloop(),
      refreshStellarLight(),
      refreshStellarDocs(),
      refreshStellarOrg(),
    ]);
    console.log(
      `done: lumenloop ${lumenloop.toolCount} tools (${lumenloop.partnerToolCount} partner, hidden from /v1/tools) + ${lumenloop.skillCount} skills + openapi (${lumenloop.openapiOperationCount} ops); ` +
        `stellar-light ${stellarLight.operationCount} ops; stellar-docs Mintlify contract + ${stellarDocs.pageTitleCount} page titles; stellar-org site contract`,
    );
  }
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`refresh-inventory failed: ${redactErrorMessage(err.message)}`);
    process.exit(1);
  });
}
