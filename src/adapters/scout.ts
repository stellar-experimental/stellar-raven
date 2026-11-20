/**
 * Stellar Light / Scout adapter: keyless HTTP per manifest transport (ARCHITECTURE.md).
 * Collection responses pass through unchanged because resource keys vary by endpoint and
 * single-item/analytics endpoints have no uniform rows array.
 * 404 and `meta.error` map to `soft-empty`; `meta.partial` or a `"backend read failed"`
 * warning maps to `error` even when partial rows are present.
 */
import type { CatalogEntry } from "../catalog/types.ts";
import {
  errResult,
  okResult,
  caughtResult,
  OPERATION_BUDGET_MS,
  type AdapterEnv,
  type AdapterResult,
  type FetchLike
} from "./types.ts";

const SERVICE = "scout";
const TIMEOUT_HINT =
  "The call timed out. Do not retry it in this script. Report this source as unavailable, not as missing data.";
const SCOUT_MISS_HINT =
  "Scope this miss to the requested Scout record. For an open-world identity or history question, make one broader pass: use scout.searchResearch for cited research/history, scout.searchProjects for project identity, scout.getPeople for SDF staff/leadership/board, or scout.getBuilders for ecosystem builder membership; validate any semantic candidate before attribution.";

function fillPathTemplate(
  path: string,
  args: Record<string, unknown>
): { path: string; used: Set<string>; missing: string[] } {
  const used = new Set<string>();
  const missing: string[] = [];
  const filled = path.replace(/\{([^}]+)\}/g, (_m, name: string) => {
    const value = args[name];
    if (value === undefined || value === null) {
      missing.push(name);
      return "";
    }
    used.add(name);
    return encodeURIComponent(String(value));
  });
  return { path: filled, used, missing };
}

/** Message for a partial page that carries no failed-read warning. */
function describePartialRead(failedReads: unknown): string {
  const named = Array.isArray(failedReads)
    ? failedReads
        .filter(
          (r): r is { read: string; cause: string } =>
            typeof r === "object" && r !== null && typeof r.read === "string" && typeof r.cause === "string"
        )
        .map((r) => `${r.read} (${r.cause})`)
    : [];
  return named.length > 0
    ? `backend read failed: ${named.join("; ")}`
    : "backend read failed: Scout marked the page partial";
}

function toQueryValue(value: unknown): string {
  // compareHackathons-style comma lists; scalars stringify plainly.
  return Array.isArray(value) ? value.join(",") : String(value);
}

export async function callScout(
  entry: CatalogEntry,
  args: Record<string, unknown>,
  _env: AdapterEnv,
  fetchImpl: FetchLike = fetch
): Promise<AdapterResult> {
  const transport = entry.transport;
  if (!transport || transport.type !== "http" || !transport.path) {
    return errResult({
      service: SERVICE,
      kind: "error",
      message: `catalog entry ${entry.id} has no http transport — cannot call it`
    });
  }

  const { path, used, missing } = fillPathTemplate(transport.path, args);
  if (missing.length > 0) {
    return errResult({
      service: SERVICE,
      kind: "error",
      message: `missing required path parameter(s): ${missing.join(", ")}`
    });
  }

  const method = transport.method ?? "GET";
  const base = transport.base ?? "https://stellarlight.xyz";
  const rest: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(args)) {
    if (!used.has(k) && v !== undefined && v !== null) rest[k] = v;
  }

  let url = `${base}${path}`;
  const init: RequestInit = { method };
  if (method === "GET") {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(rest)) qs.set(k, toQueryValue(v));
    const q = qs.toString();
    if (q) url += `?${q}`;
  } else {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(rest);
  }

  const signal = AbortSignal.timeout(OPERATION_BUDGET_MS);
  init.signal = signal;
  try {
    const res = await fetchImpl(url, init);
    const contentType = res.headers.get("content-type") ?? "";

    // Non-JSON responses (e.g. format=csv) pass through as { text, contentType }.
    if (!contentType.includes("json")) {
      const text = await res.text();
      if (!res.ok) {
        // 404 is an unknown-slug miss (soft-empty), not a failure.
        return errResult({
          service: SERVICE,
          kind: res.status === 404 ? "soft-empty" : "error",
          message: `HTTP ${res.status} from ${path}: ${text.slice(0, 300)}`,
          status: res.status,
          ...(res.status === 404 ? { hint: SCOUT_MISS_HINT } : {})
        });
      }
      return okResult({ text, contentType });
    }

    const body = (await res.json()) as Record<string, unknown>;

    if (!res.ok) {
      const message = typeof body.error === "string" ? body.error : `HTTP ${res.status} from ${path}`;
      const hint = typeof body.hint === "string" ? body.hint : undefined;
      // Forward valid-value lists (validSources, validCategories, …) for enum-correction retries.
      const validLists: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(body)) {
        if (k.startsWith("valid")) validLists[k] = v;
      }
      if (res.status === 404) {
        return errResult({
          service: SERVICE,
          kind: "soft-empty",
          message,
          status: 404,
          hint: hint ? `${hint} ${SCOUT_MISS_HINT}` : SCOUT_MISS_HINT
        });
      }
      if (res.status === 503 && body.unavailable === true) {
        return errResult({
          service: SERVICE,
          kind: "error",
          message,
          status: 503,
          hint: "AI partner endpoints are unavailable — fall back to GET /api/partners filters (scout.getPartners); do not retry."
        });
      }
      return errResult({
        service: SERVICE,
        kind: "error",
        message,
        status: res.status,
        ...(hint ? { hint } : {}),
        ...(Object.keys(validLists).length > 0 ? { details: validLists } : {})
      });
    }

    const meta = body.meta as Record<string, unknown> | undefined;
    // Check partial/failed-read signals before meta.error so a backend failure is never classified as a miss.
    const warnings = meta?.warnings;
    const failedReads = meta?.failedReads;
    const failedReadWarning = Array.isArray(warnings)
      ? warnings.find(
          (warning): warning is string =>
            typeof warning === "string" && /^backend read failed(?:\s|:|$)/.test(warning)
        )
      : undefined;
    if (meta?.partial === true || failedReadWarning !== undefined) {
      return errResult({
        service: SERVICE,
        kind: "error",
        message: failedReadWarning ?? describePartialRead(failedReads),
        status: res.status,
        hint: "The Scout backend read failed transiently. Retry once. If the read still fails, report the result as inconclusive.",
        details: {
          ...(Array.isArray(warnings) ? { warnings } : {}),
          ...(Array.isArray(failedReads) ? { failedReads } : {})
        }
      });
    }

    // 200 with meta.error (e.g. no usable query) is soft-empty by upstream contract.
    if (meta && typeof meta.error === "string" && meta.error.length > 0) {
      const advisory = body.advisory as { summary?: unknown } | undefined;
      return errResult({
        service: SERVICE,
        kind: "soft-empty",
        message:
          typeof advisory?.summary === "string"
            ? advisory.summary
            : `scout answered with meta.error: ${meta.error}`,
        status: res.status,
        code: meta.error,
        hint: SCOUT_MISS_HINT,
        ...(advisory !== undefined ? { details: advisory } : {})
      });
    }

    return okResult(body);
  } catch (e) {
    if (signal.aborted) {
      return errResult({
        service: SERVICE,
        kind: "error",
        message: `${SERVICE} timed out after ${OPERATION_BUDGET_MS / 1000} s`,
        hint: TIMEOUT_HINT
      });
    }
    return caughtResult(SERVICE, e);
  }
}
