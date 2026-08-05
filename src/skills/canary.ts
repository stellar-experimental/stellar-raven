/**
 * Skill-availability canary — the only detector for a Cloudflare-side failure
 * of the serve-don't-store path.
 *
 * WHY IT CANNOT LIVE IN CI. Skill bodies are fetched from
 * `raw.githubusercontent.com` at request time. The daily `check-mirrors --fetch`
 * proves those pins resolve *from a GitHub Actions runner* — which says nothing
 * about whether the deployed Worker can reach them. Egress blocking, a
 * shared-IP rate limit, or a runtime regression can break serving while every
 * external check stays green. So the check runs from inside the Worker: no
 * inbound request, no auth surface, no secret.
 *
 * WHAT IT DOES NOT PROVE. Cron Triggers run wherever Cloudflare has spare
 * capacity, not across the colos serving user requests — so this samples ONE
 * execution location per run. It catches global and shared-infrastructure
 * failures, which is the realistic case; it cannot rule out a fault confined to
 * some other colo. Real-traffic `skill_read outcome:error` remains the only signal
 * that covers user-selected colos, and neither replaces the other.
 *
 * WHY IT BYPASSES THE CACHES. Pinned URLs are cached `immutable` for a year and
 * memoized per isolate. A canary on the normal read path would answer from a
 * warm colo entry and report "healthy" for months after egress died. It builds
 * its own source with `bypassCaches` for exactly this reason, and that source
 * neither reads nor writes the shared memo, so probing cannot alter what real
 * traffic sees.
 *
 * WHAT IT DOES NOT DO. It does not alert, retry-until-green, or gate anything.
 * It writes a verdict; `refresh.yml` reads it through `/health/skills` and
 * classifies it. Keeping the judgement out of the Worker means a flaky probe
 * cannot page anyone on its own.
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
 * Every distinct pinned SERVING IDENTITY in the catalog.
 *
 * Deduped by url + sha + sha256 — the same triple `memoKey` uses — not by url
 * alone. Two entries may share a URL while pinning different digests, and each
 * is separately verified at read time, so a url-only dedup would check one and
 * declare the other healthy without ever fetching it.
 *
 * The whole set, not a sample: a partial outage confined to one upstream repo
 * is precisely what a one-pin probe would miss, and 30-odd GETs once an hour is
 * nothing next to being wrong about it.
 */
export function canaryPins(catalog: Catalog): SkillPin[] {
  const byIdentity = new Map<string, SkillPin>();
  for (const entry of catalog.entries) {
    const t = entry.transport;
    if (t?.type !== "file") continue;
    // `transportSchema.superRefine` already rejects a file transport missing
    // any of the three at catalog load, so this narrows a type rather than
    // guarding a real case — but it stays a skip, not a `!`, because a canary
    // that throws while enumerating would report an outage that isn't one.
    if (!t.url || !t.sha || !t.sha256) continue;
    const identity = `${t.url}\n${t.sha256}\n${t.sha}`;
    if (!byIdentity.has(identity)) {
      byIdentity.set(identity, { url: t.url, sha: t.sha, sha256: t.sha256 });
    }
  }
  return [...byIdentity.values()];
}

/**
 * Fetch every pinned file straight from upstream and report a single verdict.
 *
 * Fails on the FIRST error rather than collecting all of them: the question is
 * "is this path working", and one unreachable pin already answers it. The
 * message names which url so the operator is not left guessing.
 */
export async function runSkillCanary(
  catalog: Catalog,
  deps: { fetchImpl?: typeof fetch } = {}
): Promise<CanaryVerdict> {
  const started = Date.now();
  const pins = canaryPins(catalog);
  const source = createSkillSource({ ...deps, bypassCaches: true });
  let error: string | null = null;
  let checked = 0;

  // Zero pins is not health, it is a canary with nothing to check reporting
  // success — the vacuous pass that makes a monitor worse than none. It means
  // the catalog lost its file transports or `canaryPins` broke; either way the
  // honest answer is "not ok".
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
 * The stored verdict as an HTTP response, for `GET /health/skills`.
 *
 * Reports; never probes. A request cannot make the Worker fetch anything, so
 * the endpoint is safe to leave unauthenticated and cannot be used to drive
 * traffic at upstream. It exposes a boolean, a timestamp, counts, a duration
 * and an error string — no skill content, no catalog ids, no caller identity.
 */
export async function skillHealthResponse(kv: KVNamespace): Promise<Response> {
  let stored: CanaryVerdict | null = null;
  try {
    stored = await kv.get<CanaryVerdict>(CANARY_KV_KEY, "json");
  } catch {
    stored = null;
  }
  if (!stored || typeof stored.ok !== "boolean" || typeof stored.checkedAt !== "string") {
    // 503, not 200-with-a-flag: "never ran", "unreadable", and "ran and failed"
    // are all "do not trust skill retrieval", and a monitor reading only the
    // status code must not see any of them as healthy. The consumer
    // distinguishes them by shape — this body has no `checkedAt`, which
    // `scripts/classify-canary.mjs` maps to `error`, never to an outage claim.
    return Response.json(
      { ok: false, reason: "no usable canary verdict recorded" },
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  }
  // Project to a fixed shape rather than echoing the stored object. Two
  // reasons: the raw `error` carries internal wording and, on an integrity
  // failure, expected/actual digests; and a stable schema is what the classifier
  // parses, so a future field cannot change what this endpoint promises.
  const body = {
    ok: stored.ok,
    checkedAt: stored.checkedAt,
    checked: typeof stored.checked === "number" ? stored.checked : null,
    ms: typeof stored.ms === "number" ? stored.ms : null,
    // Enough to tell "upstream unreachable" from "bytes did not verify"
    // without republishing URLs or hashes.
    error: stored.error === null || stored.error === undefined ? null : errorClass(stored.error)
  };
  return Response.json(body, {
    status: stored.ok ? 200 : 503,
    // Short edge cache: the verdict only changes hourly and the consumer
    // tolerates 3h, so this costs nothing in freshness while stopping an
    // unauthenticated route from being an unbounded KV-read meter.
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
