import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const FAMILIES = new Set(["lumenloop", "scout", "stellarDocs", "skills"]);
const MANIFEST_PATH = fileURLToPath(new URL("../../catalog/manifest.json", import.meta.url));

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function normalizeUrl(url) {
  const trimmed = url.replace(/\/+$/, "");
  return trimmed.endsWith("/mcp") ? trimmed : `${trimmed}/mcp`;
}

function authHeaders() {
  const token = process.env.RAVEN_MCP_BEARER_TOKEN;
  return token ? { authorization: `Bearer ${token}` } : {};
}

export function parseMcpResponse(text) {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("empty MCP response");
  if (!trimmed.startsWith("event:") && !trimmed.startsWith("data:")) return JSON.parse(trimmed);
  const dataLines = [];
  for (const line of trimmed.split(/\r?\n/)) {
    if (!line.startsWith("data:")) continue;
    const data = line.slice(5).trim();
    if (data && data !== "[DONE]") dataLines.push(data);
  }
  if (!dataLines.length) throw new Error(`SSE response had no data frame: ${trimmed.slice(0, 200)}`);
  return JSON.parse(dataLines.join("\n"));
}

export async function postMcp(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      ...authHeaders()
    },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${url} HTTP ${res.status}: ${text.slice(0, 300)}`);
  const message = parseMcpResponse(text);
  if (message.error) {
    const code = message.error.code !== undefined ? ` ${message.error.code}` : "";
    throw new Error(`MCP JSON-RPC error${code}: ${message.error.message ?? "unknown error"}`);
  }
  return message;
}

export function parseSearchPayload(message) {
  if (Array.isArray(message.result?.structuredContent?.hits)) return message.result.structuredContent;
  const text = (message.result?.content ?? []).find((content) => content.type === "text")?.text;
  if (!text) throw new Error("search response missing structuredContent.hits and JSON text content");
  return JSON.parse(text);
}

export async function preflightSearch(url, clientName = "discovery-eval") {
  await postMcp(url, {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: clientName, version: "0" }
    }
  });
  const list = await postMcp(url, { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
  const names = (list.result?.tools ?? []).map((tool) => tool.name);
  if (!names.includes("search")) {
    throw new Error(`live server exposes [${names.join(", ")}], but discovery eval requires search`);
  }
  return names;
}

export function compactHit(hit, rank) {
  const out = { rank, id: hit.id, service: hit.service, kind: hit.kind };
  for (const key of ["tier", "score", "normalizedScore", "keywordScore", "semanticScore"]) {
    if (hit[key] !== undefined) out[key] = hit[key];
  }
  return out;
}

export function loadDiscoveryCases(casesPath, { manifestPath = MANIFEST_PATH } = {}) {
  const data = JSON.parse(readFileSync(casesPath, "utf8"));
  const cases = Array.isArray(data) ? data : data.cases;
  if (!Array.isArray(cases)) throw new Error(`${casesPath} must contain an array or { cases: [] }`);
  // Search never ranks searchable:false entries (skill sections), so only searchable ids can be graded hits.
  const searchableIds = new Set(
    JSON.parse(readFileSync(manifestPath, "utf8")).entries.filter((e) => e.searchable !== false).map((e) => e.id)
  );
  const unsearchable = [];
  const seen = new Set();
  for (const c of cases) {
    if (!c.id || !c.question) throw new Error(`case ${c.id ?? "<unknown>"} needs id and question`);
    if (seen.has(c.id)) throw new Error(`duplicate case id ${c.id}`);
    seen.add(c.id);
    if (c.expectedFamilies !== undefined) {
      if (!Array.isArray(c.expectedFamilies) || !c.expectedFamilies.length) {
        throw new Error(`case ${c.id} expectedFamilies must be a non-empty array`);
      }
      for (const family of c.expectedFamilies) {
        if (!FAMILIES.has(family)) throw new Error(`case ${c.id} has invalid expected family ${family}`);
      }
      if (!Array.isArray(c.acceptableOps) || !c.acceptableOps.length) {
        throw new Error(`case ${c.id} acceptableOps must be a non-empty array`);
      }
      for (const id of c.acceptableOps) if (!searchableIds.has(id)) unsearchable.push(`${c.id}: ${id}`);
    } else if (!FAMILIES.has(c.expected_service)) {
      throw new Error(`case ${c.id} needs discovery labels or a valid expected_service`);
    }
  }
  if (unsearchable.length) {
    throw new Error(`acceptableOps must be searchable manifest entries:\n${unsearchable.join("\n")}`);
  }
  return {
    meta: Array.isArray(data)
      ? null
      : {
          schemaVersion: data.schemaVersion ?? null,
          authoredAt: data.authoredAt ?? null,
          contract: data.contract ?? null
        },
    cases
  };
}

export function expectedFamiliesOf(c) {
  return c.expectedFamilies ?? [c.expected_service];
}

export function gradeVisibleSearches(c, searches) {
  const expectedFamilies = new Set(expectedFamiliesOf(c));
  const acceptableOps = new Set(c.acceptableOps ?? []);
  const familyHitAt3 = searches.some((search) =>
    search.hits.slice(0, 3).some((hit) => expectedFamilies.has(hit.service))
  );
  const usableOpAt5 = c.acceptableOps
    ? searches.some((search) => search.hits.slice(0, 5).some((hit) => acceptableOps.has(hit.id)))
    : null;
  return { familyHitAt3, usableOpAt5 };
}

export function capSearchEvidence(searches, maxSearches = 3) {
  const observedSearchCount = searches.length;
  return {
    searches: searches.slice(0, maxSearches),
    observedSearchCount,
    searchContractValid: observedSearchCount >= 1 && observedSearchCount <= maxSearches
  };
}

export function summarizeDiscovery(rows) {
  const bucket = (items) => {
    const n = items.length;
    const familyHitAt3 = items.filter((row) => row.familyHitAt3).length;
    const usableRows = items.filter((row) => row.usableOpAt5 !== null);
    const usableOpAt5 = usableRows.filter((row) => row.usableOpAt5).length;
    const primaryHit = items.filter((row) => row.primaryHit === true).length;
    const anyHit = items.filter((row) => row.anyHit === true).length;
    return {
      n,
      familyHitAt3,
      familyHitAt3Pct: n ? Number(((100 * familyHitAt3) / n).toFixed(1)) : 0,
      ...(usableRows.length
        ? {
            usableN: usableRows.length,
            usableOpAt5,
            usableOpAt5Pct: Number(((100 * usableOpAt5) / usableRows.length).toFixed(1))
          }
        : {}),
      ...(items.some((row) => row.primaryHit !== null)
        ? {
            primaryHit,
            primaryPct: n ? Number(((100 * primaryHit) / n).toFixed(1)) : 0,
            anyHit,
            anyPct: n ? Number(((100 * anyHit) / n).toFixed(1)) : 0
          }
        : {})
    };
  };
  const byPool = {};
  for (const pool of [...new Set(rows.map((row) => row.seed?.pool).filter(Boolean))].sort()) {
    byPool[pool] = bucket(rows.filter((row) => row.seed?.pool === pool));
  }
  const byExpectedService = {};
  for (const service of [...FAMILIES]) {
    const subset = rows.filter((row) => row.expected_service === service);
    if (subset.length) byExpectedService[service] = bucket(subset);
  }
  return { overall: bucket(rows), byPool, byExpectedService };
}

export function writeResult(outPath, value) {
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(value, null, 2) + "\n");
}

export function resultStamp(prefix) {
  return `${new Date().toISOString().replace(/[:.]/g, "-")}-${prefix}`;
}
