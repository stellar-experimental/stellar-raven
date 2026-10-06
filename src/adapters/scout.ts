/**
 * Stellar Light / Scout adapter — keyless HTTP per the entry's transport
 * (ARCHITECTURE.md: manifest-owned transport and exposure).
 *
 * Call shape: path templates (`/api/hackathons/{slug}`) are filled from args;
 * remaining args become the query string for GET or the JSON body for POST.
 *
 * Row-nesting: every collection endpoint nests rows under a resource-named
 * key (`projects[]`, `repos[]`, …; only `/api/research` uses `results[]`) and
 * carries a `meta{}`. We pass the body through as `data` UNCHANGED — the
 * catalog descriptions document each rows key; inventing a uniform `rows[]`
 * would misrepresent single-item and analytics endpoints (measured truth in
 * the research doc, not a generic shape).
 *
 * Error mapping (per-service normalizer, ARCHITECTURE.md):
 *  - 400 `{error, hint?, valid*}`      → kind "error" + hint + valid lists.
 *  - 404 unknown slug                  → kind "soft-empty" ("discover the
 *    slug from the list endpoint first" — a miss, not a failure).
 *  - 503 `{unavailable:true}` (AI ops) → kind "error" with the documented
 *    fallback hint (GET /api/partners filters), NOT retryable.
 *  - 200 + `meta.error:"no_query"`     → kind "soft-empty" (0 rows + advisory).
 *  - 200 + `meta.partial: true`, or an element of the `meta.warnings` string
 *    array matching the case-sensitive prefix "backend read failed" followed
 *    by whitespace, a colon, or end of string → kind "error", even with rows;
 *    retry once, then report an inconclusive read. Preserve the warnings and
 *    `meta.failedReads` in details.
 *  - Other warnings remain visible in unchanged successful data.
 */
import type { CatalogEntry } from "../catalog/types.ts";
import {
  errResult,
  okResult,
  caughtResult,
  type AdapterEnv,
  type AdapterResult,
  type FetchLike
} from "./types.ts";

const SERVICE = "scout";
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

  try {
    const res = await fetchImpl(url, init);
    const contentType = res.headers.get("content-type") ?? "";

    // leaderboard?format=csv and friends: non-JSON is passed through as
    // { text, contentType } — the content type rides in the payload.
    if (!contentType.includes("json")) {
      const text = await res.text();
      if (!res.ok) {
        // 404 is a miss, not a failure — same soft-empty contract as the JSON
        // 404 branch below (adapter header: "404 unknown slug → soft-empty");
        // discover the slug from the list endpoint first.
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
      // valid-value lists (validSources, validCategories, …) make
      // retry-with-corrected-enum safe — pass them along as details.
      const validLists: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(body)) {
        if (k.startsWith("valid")) validLists[k] = v;
      }
      if (res.status === 404) {
        // Unknown detail slug — a miss, not a failure: discover the slug
        // from the list endpoint first (service contract).
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
    // Scout states read loss in `meta.partial` + `meta.failedReads` (spec
    // 1.9.62+: "count real loss on this field, not on the 200 status"). The
    // `backend read failed` warning stays a second signal for responses that
    // carry only the warning. A failed read is inconclusive even when some
    // rows survived. Check it before meta.error so a backend failure cannot be
    // classified as a miss.
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

    // projects/search with no usable query: 200, zero rows, meta.error +
    // advisory — soft-empty by the service's own signal.
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
    return caughtResult(SERVICE, e);
  }
}
