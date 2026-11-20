/**
 * Worker-side skill-availability canary. Runs on Cron Triggers with `bypassCaches: true`
 * to detect Cloudflare-side egress failures that CI runners and warm immutable caches miss.
 * Writes a single KV verdict read by `GET /health/skills` and classified by `refresh.yml`.
 */
import type { Catalog } from "../catalog/types.ts";
import { logEvent } from "../observability.ts";
import { createSkillSource, type SkillPin } from "./source.ts";

/** KV key holding the latest verdict. Single key: this is a liveness bit, not a series. */
export const CANARY_KV_KEY = "raven:skill-canary:v1";

export type CanaryVerdict = {
  ok: boolean;
  /** ISO timestamp of the run. Staleness is as important as the boolean: a cron
   *  that stops firing is itself an outage of the detector. */
  checkedAt: string;
  /** Pins actually fetched this run. */
  checked: number;
  /** Wall-clock for the whole sweep. */
  ms: number;
  /** First failure's message, or null. No body text, no ids beyond the url. */
  error: string | null;
};

/**
 * Every distinct pinned `(url, sha256, sha)` identity in the catalog (same triple as `memoKey`).
 * Checks all pins rather than a sample so single-repo outages are not missed.
 */
export function canaryPins(catalog: Catalog): SkillPin[] {
  const byIdentity = new Map<string, SkillPin>();
  for (const entry of catalog.entries) {
    const t = entry.transport;
    if (t?.type !== "file") continue;
    if (!t.url || !t.sha || !t.sha256) continue;
    const identity = `${t.url}\n${t.sha256}\n${t.sha}`;
    if (!byIdentity.has(identity)) {
      byIdentity.set(identity, { url: t.url, sha: t.sha, sha256: t.sha256 });
    }
  }
  return [...byIdentity.values()];
}

/** Fetch every pinned file from upstream, failing on the first error. */
export async function runSkillCanary(
  catalog: Catalog,
  deps: { fetchImpl?: typeof fetch } = {}
): Promise<CanaryVerdict> {
  const started = Date.now();
  const pins = canaryPins(catalog);
  const source = createSkillSource({ ...deps, bypassCaches: true });
  let error: string | null = null;
  let checked = 0;

  // Zero pins is a broken catalog/extractor, never a passing sweep.
  if (pins.length === 0) {
    error = "no pinned skill files in the catalog — nothing to verify, so nothing is verified";
  }

  for (const pin of pins) {
    try {
      await source(pin);
      checked++;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      break;
    }
  }

  const verdict: CanaryVerdict = {
    ok: error === null,
    checkedAt: new Date().toISOString(),
    checked,
    ms: Date.now() - started,
    error
  };

  // Same event the serving path emits, so one query answers "is skill retrieval
  // healthy" across both synthetic and real reads.
  logEvent("skill_canary", {
    ok: verdict.ok,
    checked: verdict.checked,
    pins: pins.length,
    ms: verdict.ms,
    errorClass: verdict.error ? errorClass(verdict.error) : null
  });

  return verdict;
}

/**
 * Run the canary and persist the verdict.
 *
 * A KV write failure must not swallow the result — it is logged above either
 * way, and the endpoint reporting a stale `checkedAt` is the correct downstream
 * symptom of "the canary could not record itself".
 */
export async function runAndStoreSkillCanary(
  catalog: Catalog,
  kv: KVNamespace,
  deps: { fetchImpl?: typeof fetch } = {}
): Promise<CanaryVerdict> {
  const verdict = await runSkillCanary(catalog, deps);
  try {
    await kv.put(CANARY_KV_KEY, JSON.stringify(verdict));
  } catch (e) {
    logEvent("skill_canary_store_failed", {
      errorName: e instanceof Error ? e.name : typeof e
    });
  }
  return verdict;
}

/**
 * Stored verdict for `GET /health/skills`. Reports without probing upstream,
 * so it is safe unauthenticated and projects only coarse error classes (no URLs or digests).
 */
export async function skillHealthResponse(kv: KVNamespace): Promise<Response> {
  let stored: unknown = null;
  try {
    stored = await kv.get<unknown>(CANARY_KV_KEY, "json");
  } catch {
    stored = null;
  }
  const record =
    typeof stored === "object" && stored !== null ? (stored as Record<string, unknown>) : null;
  if (
    !record ||
    typeof record.ok !== "boolean" ||
    typeof record.checkedAt !== "string" ||
    (record.error != null && typeof record.error !== "string") ||
    record.ok !== (record.error == null)
  ) {
    // 503 with no `checkedAt`: scripts/classify-canary.mjs maps this to `error`, not an outage claim.
    return Response.json(
      { ok: false, reason: "no usable canary verdict recorded" },
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  }
  // Project to a fixed schema so raw error text/digests never leak and the classifier contract stays stable.
  const body = {
    ok: record.ok,
    checkedAt: record.checkedAt,
    checked: typeof record.checked === "number" ? record.checked : null,
    ms: typeof record.ms === "number" ? record.ms : null,
    error: record.error === null || record.error === undefined ? null : errorClass(record.error)
  };
  return Response.json(body, {
    status: record.ok ? 200 : 503,
    // Short edge cache bounds KV reads on an unauthenticated route without hurting freshness.
    headers: { "cache-control": "public, max-age=60" }
  });
}

/** Coarse, non-identifying reason for a failed sweep. */
function errorClass(message: string): string {
  if (/integrity check failed/.test(message)) return "integrity";
  if (/provenance check failed/.test(message)) return "provenance";
  if (/nothing to verify/.test(message)) return "empty-pin-set";
  if (/could not fetch/.test(message)) return "unreachable";
  return "other";
}
