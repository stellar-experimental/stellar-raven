#!/usr/bin/env node
// refresh-inventory.mjs — regenerate the three service inventory snapshots under inventory/.
//
//   node scripts/refresh-inventory.mjs
//   node scripts/refresh-inventory.mjs --service stellar-light
//
// Plain Node 20+ (global fetch, node:fs only — no deps). Reads .env at the repo
// root for LUMENLOOP_API_KEY / ALGOLIA_{APPLICATION_ID,API_KEY}_{DOCS,SITE}.
//
// Guarantees:
//   - Deterministic output: object keys sorted recursively, tool/skill arrays
//     sorted by name, so diffs are meaningful.
//   - Idempotent: a file is rewritten only if its content (ignoring the
//     top-level `fetchedAt`) actually changed; back-to-back runs produce zero diff.
//   - No key material in outputs: every .env value (including the Algolia app id,
//     which would otherwise appear in hostnames) is asserted absent from every
//     output before writing; URLs use `{ALGOLIA_APPLICATION_ID_DOCS}` placeholders.
//
// Authored config (NOT fetched — preserved verbatim across refreshes):
//   LUMENLOOP_PARTNER_TOOLS — the partner-lane tool names hidden from GET
//   /v1/tools even with a partner key (the union quirk,
//   research/services/lumenloop.md); the tool union count is validated against
//   GET /v1/me `tools.available` every run so drift fails loudly.
// Skills are NOT authored the same way: GET /v1/skills already LISTS the
// partner-set skills (marking them available:false), so the union comes from
// that list — no name list to maintain. The count guard is tools-only: GET
// /v1/me carries `tools.available` but exposes NO skills count/list to assert
// against, so there is nothing to check the skill union against.
//
// PUBLISH-SAFETY (2026-07-06, go-public cleanup): partner-lane tools and
// partner-set skills are persisted as NAME-ONLY stubs (`partner_stub: true`)
// — no descriptions, no schemas, no file paths, and `me.limits` is dropped.
// Partner-tier detail must never be committed to this public repo; the names
// alone keep the union guards and drift diffs working.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchJson, parseEnvFile, sortDeep } from "./lib/shared.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const INVENTORY_DIR = join(ROOT, "inventory");

// ---------------------------------------------------------------------------
// Authored config — Lumenloop partner lane
// ---------------------------------------------------------------------------
// GET /v1/tools hides partner-tier tools even with a partner key. These names
// come from research/services/lumenloop.md (verified live 2026-07-01); the
// script unions them with GET /v1/tools and asserts the tool union count
// equals GET /v1/me `tools.available`. (Skills differ — see the header note:
// GET /v1/skills already lists them, so no authored skill name list exists.)
const LUMENLOOP_BASE = "https://api.lumenloop.com/v1";
const LUMENLOOP_PARTNER_TOOLS = ["list_my_research", "request_research", "research_result"];

// ---------------------------------------------------------------------------
// Stellar Docs (Algolia) — index name for the settings drift probe
// ---------------------------------------------------------------------------
const STELLAR_DOCS_INDEX = "crawler_Stellar Docs - Docusaurus";

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

// Env var names this script reads for auth — asserted absent from every output
// even on an env-only run (no .env file, e.g. secrets exported into the
// environment) where parseEnvFile below returns nothing.
const SECRET_ENV_NAMES = ["LUMENLOOP_API_KEY", "ALGOLIA_APPLICATION_ID_DOCS", "ALGOLIA_API_KEY_DOCS", "ALGOLIA_APPLICATION_ID_SITE", "ALGOLIA_API_KEY_SITE"];

// Scrub-check values: the union of .env entries (generic — every value, as
// before) AND process.env values for the secret key names above, so a run that
// supplies secrets via the environment instead of .env is still guarded. Keyed
// by name=value so the two sources dedupe.
const SECRET_VALUES = (() => {
  const byPair = new Map();
  const add = (k, v) => {
    if (typeof v === "string" && v.length >= 6) byPair.set(`${k}=${v}`, [k, v]);
  };
  for (const [k, v] of Object.entries(parseEnvFile(join(ROOT, ".env")))) add(k, v);
  for (const k of SECRET_ENV_NAMES) add(k, process.env[k]);
  return [...byPair.values()];
})();

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
    // Raw OpenAPI 3.1 document (keyless, NOT enveloped — plain fetch, not lumenloopGet).
    // Covers the 18 guest tool-invoke paths + account/discovery endpoints only; the 3
    // partner tools are absent by design (same hidden-lane quirk as /v1/tools).
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

  // Partner-lane tools are persisted as NAME-ONLY stubs: no detail fetch, no
  // description/schemas. Partner-tier detail must not live in this public
  // repo; the names alone keep the union count-guard above honest and keep
  // build-catalog's exclusion guard (EXCLUDED_LUMENLOOP_OPS must resolve
  // against the inventory) working. buildLumenloop fails loudly if a stub is
  // ever not excluded, so restoring detail is always a deliberate change.
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

  // Skills: metadata only (never zip/file contents). The list marks partner-set
  // skills available:false even with a partner key. PUBLIC-set skills store the
  // upstream description + file paths from the detail endpoint; PARTNER-set
  // skills are name/set/tier stubs only (no detail fetch, no description, no
  // file paths) for the same publish-safety reason as the tool stubs — the
  // names keep the /v1/skills union observable so partner-set drift still
  // shows up in inventory diffs.
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
// Stellar Docs (Algolia)
// ---------------------------------------------------------------------------
async function refreshStellarDocs() {
  const appId = requireEnv("ALGOLIA_APPLICATION_ID_DOCS");
  const apiKey = requireEnv("ALGOLIA_API_KEY_DOCS");
  const settingsPath = `/1/indexes/${encodeURIComponent(STELLAR_DOCS_INDEX)}/settings`;

  const settings = await fetchJson(`https://${appId}-dsn.algolia.net${settingsPath}`, {
    headers: {
      "X-Algolia-Application-Id": appId,
      "X-Algolia-API-Key": apiKey,
    },
    label: "algolia index settings",
  });

  writeInventory("stellar-docs.json", {
    service: "stellar-docs",
    fetchedAt: new Date().toISOString(),
    source: {
      // Hostname templated so the output never contains the .env app-id value.
      settings: `https://{ALGOLIA_APPLICATION_ID_DOCS}-dsn.algolia.net${settingsPath}`,
      authEnv: ["ALGOLIA_APPLICATION_ID_DOCS", "ALGOLIA_API_KEY_DOCS"],
      research: "research/services/stellar-docs-algolia.md",
    },
    index: STELLAR_DOCS_INDEX,
    settings,
  });

  // Page-title snapshot: every type:lvl1 record is one
  // docs page title — the specific concept vocabulary ("Muxed Accounts",
  // "Sponsored Reserves") that neither the op descriptions nor the coarse
  // taxonomy topic slugs carry. build-catalog.mjs scopes these per docs
  // operation by URL prefix and distills them into the low-weight `keywords`
  // field the scorer blends in.
  const REQUESTED_HITS_PER_PAGE = 1000;
  const queryPath = `/1/indexes/${encodeURIComponent(STELLAR_DOCS_INDEX)}/query`;
  const titlesRes = await fetchJson(`https://${appId}-dsn.algolia.net${queryPath}`, {
    method: "POST",
    headers: {
      "X-Algolia-Application-Id": appId,
      "X-Algolia-API-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: {
      query: "",
      filters: "type:lvl1",
      hitsPerPage: REQUESTED_HITS_PER_PAGE,
      distinct: false,
      attributesToRetrieve: ["hierarchy", "url_without_anchor"],
      attributesToHighlight: [],
      attributesToSnippet: [],
    },
    label: "algolia lvl1 page titles",
  });
  // One page, no pagination. That is fine while the filtered index fits inside
  // it, and silently wrong the moment it does not: the snapshot would turn page
  // one into "the complete corpus", record a false `total`, and stop producing
  // drift for anything past the cut. Fail loudly instead of guessing — the
  // remedy (paginate, or raise the cap) is a deliberate change, not a default.
  // Fail closed on a MISSING count too, not just an exceeded one. Accepting an
  // absent or malformed nbHits would silently restore the exact failure this
  // guard exists to prevent: an unverifiable page one recorded as the whole
  // corpus. paginationLimitedTo is an index SETTING and is not echoed in a
  // query response, so the honest thing to print is what we asked for.
  const returned = Array.isArray(titlesRes.hits) ? titlesRes.hits.length : null;
  const nbHits = titlesRes.nbHits;
  if (returned === null || !Number.isInteger(nbHits) || nbHits < 0) {
    throw new Error(
      `algolia lvl1 page titles: cannot verify completeness — hits=${
        returned === null ? "not an array" : returned
      }, nbHits=${JSON.stringify(nbHits)}. Refusing to record a corpus total that may be a ` +
        `truncated first page.`,
    );
  }
  if (nbHits > returned) {
    throw new Error(
      `algolia lvl1 page titles truncated: index reports ${nbHits} matching records but only ` +
        `${returned} were returned (requested hitsPerPage ${REQUESTED_HITS_PER_PAGE}; the index's ` +
        `own paginationLimitedTo is recorded in inventory/stellar-docs.json). The title snapshot ` +
        `would claim a complete corpus it does not have — paginate this query before re-running.`,
    );
  }
  const seen = new Set();
  const titles = [];
  for (const hit of titlesRes.hits ?? []) {
    const title = hit.hierarchy?.lvl1;
    const url = hit.url_without_anchor ?? "";
    const path = url.replace(/^https?:\/\/[^/]+/, "");
    if (!title || !path) continue;
    const key = `${path} ${title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    titles.push({ path, title });
  }
  titles.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : a.title.localeCompare(b.title)));

  writeInventory("stellar-docs-titles.json", {
    service: "stellar-docs",
    fetchedAt: new Date().toISOString(),
    source: {
      query: `https://{ALGOLIA_APPLICATION_ID_DOCS}-dsn.algolia.net${queryPath}`,
      authEnv: ["ALGOLIA_APPLICATION_ID_DOCS", "ALGOLIA_API_KEY_DOCS"],
      method:
        "empty-query POST filtered to type:lvl1 (one record per page title); title = hierarchy.lvl1, path = url_without_anchor without origin; deduped, sorted by path then title",
    },
    index: STELLAR_DOCS_INDEX,
    total: titles.length,
    titles,
  });

  return { pageTitleCount: titles.length };
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
export function parseServiceArg(args) {
  if (args.length === 0) return "all";
  if (args.length !== 2 || args[0] !== "--service") {
    throw new Error("usage: node scripts/refresh-inventory.mjs [--service lumenloop|stellar-light|stellar-docs]");
  }
  const service = args[1];
  if (!["lumenloop", "stellar-light", "stellar-docs"].includes(service)) {
    throw new Error(`unknown service "${service}" (expected lumenloop, stellar-light, or stellar-docs)`);
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
    console.log(`done: stellar-docs index settings + ${result.pageTitleCount} page titles`);
  } else {
    const [lumenloop, stellarLight, stellarDocs] = await Promise.all([
      refreshLumenloop(),
      refreshStellarLight(),
      refreshStellarDocs(),
    ]);
    console.log(
      `done: lumenloop ${lumenloop.toolCount} tools (${lumenloop.partnerToolCount} partner, hidden from /v1/tools) + ${lumenloop.skillCount} skills + openapi (${lumenloop.openapiOperationCount} ops); ` +
        `stellar-light ${stellarLight.operationCount} ops; stellar-docs index settings + ${stellarDocs.pageTitleCount} page titles`,
    );
  }
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`refresh-inventory failed: ${err.message}`);
    process.exit(1);
  });
}
