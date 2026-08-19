/**
 * Skill source — live retrieval of skill bodies from upstream, pinned.
 *
 * Skill markdown is NOT vendored into this repo and NOT shipped inside the
 * Worker bundle. Each catalog skill/section entry carries
 * `transport: { type: "file", url, sha, sha256 }` where `url` is a
 * raw.githubusercontent.com URL at the commit pinned in
 * ecosystem-skills/MANIFEST.json, `sha` is that file's git blob hash from the
 * same pinned tree, and `sha256` is a SHA-256 over the raw bytes recorded by
 * the catalog build. This module turns that into text.
 *
 * The source enforces three properties:
 *
 * 1. **Immutability.** The URL names a commit, never a branch, so upstream
 *    edits cannot change what this server serves. Re-pinning stays a reviewed,
 *    committed act (`ecosystem-skills/update.sh` prints the body diff, and
 *    ecosystem-skills/PIN-REVIEW.md records the attestation) — skills are
 *    prompt input, so an upstream edit must never reach the model without a
 *    human reading the diff.
 * 2. **Integrity.** Every fetched body is verified before it is decoded and
 *    served. SHA-256 is the SECURITY check: git's SHA-1 has practical
 *    chosen-prefix collisions, so it is provenance (it ties bytes to the git
 *    object the reviewer saw), not an adversarial boundary. Both must match;
 *    bytes that fail either are refused, not served.
 * 3. **Exposure hygiene.** Every served body uses the same non-exposed
 *    reference scrub as the builders. Live content cannot introduce a hidden
 *    reference to a retired skill or excluded Scout operation.
 *
 * Policy: **serve, do not store.** Raven
 * forwards this content and must never become its source of record. The caches
 * below are transport on a forwarding path; a durable owned mirror (R2, a
 * committed copy, a bundled copy) is out of scope by decision. Responses carry
 * the forwarded markdown and nothing else — no license text, notice, or
 * wrapper is attached.
 *
 * Caching: an in-isolate memo keyed by (url, sha256) in front of the colo-wide
 * Cache API. Cached bytes are re-verified on every hit — the cache is a
 * transport, not a trust boundary — and cache WRITES are best-effort, so a
 * cache outage can never turn an already-verified body into a failed read.
 */
import { scrubNonExposedRefs } from "./scrub.ts";

/** The pinned identity of one file. `sha` is the git blob hash (provenance);
 *  `sha256` is the security digest over the same raw bytes. */
export type SkillPin = { url: string; sha: string; sha256: string };

/** Where the served bytes actually came from. Reported so the caller can log a
 *  latency profile that is interpretable: an upstream read and a memo hit differ
 *  by two orders of magnitude, and a mean over both says nothing. */
export type SkillRetrievalFrom = "memo" | "cache" | "upstream";

/** Resolves a pin to verified, scrubbed markdown plus its provenance. Rejects on
 *  transport failure, either hash mismatch, or a scrub drift-guard trip. */
export type SkillSource = (pin: SkillPin) => Promise<{ text: string; from: SkillRetrievalFrom }>;

/** Upstream is small markdown over a CDN; a slow fetch is a failed fetch. */
const FETCH_TIMEOUT_MS = 8000;

/**
 * Ceiling for everything one skill.read does, across every file it touches.
 * Deliberately under the executor's 60s wall clock: a slow upstream must fail
 * as a `skills` error envelope, never by killing the whole execute run.
 */
export const SKILL_READ_DEADLINE_MS = 20_000;

/** Immutable by construction (commit-pinned URLs) — cache for a year. */
const CACHE_CONTROL = "public, max-age=31536000, immutable";

/** "<url>\n<sha256>\n<sha>" -> in-flight or settled body. Keyed by the full
 *  verified identity, never the URL alone: a second entry pinning the same URL
 *  to different bytes must re-verify rather than inherit the first one's body.
 *  BOTH digests belong in the key. `verify` checks sha256 AND the git blob sha,
 *  so a key omitting the blob sha would let a pin with a mismatched provenance
 *  hash be served from memo without that half ever running. */
const memo = new Map<string, Promise<string>>();

const memoKey = (pin: SkillPin) => `${pin.url}\n${pin.sha256}\n${pin.sha}`;

/** Test seam: drop memoized bodies so a test can observe fetch behavior. */
export function resetSkillSourceMemo(): void {
  memo.clear();
}

function hex(digest: ArrayBuffer): string {
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** git blob hash of raw bytes — sha1("blob <len>\0" + content), the exact id
 *  ecosystem-skills/MANIFEST.json records per file. Provenance only. */
async function gitBlobSha(bytes: ArrayBuffer): Promise<string> {
  const header = new TextEncoder().encode(`blob ${bytes.byteLength}\0`);
  const framed = new Uint8Array(header.byteLength + bytes.byteLength);
  framed.set(header, 0);
  framed.set(new Uint8Array(bytes), header.byteLength);
  return hex(await crypto.subtle.digest("SHA-1", framed));
}

/** Both digests must match the pin, or the bytes are not served. */
async function verify(bytes: ArrayBuffer, pin: SkillPin): Promise<void> {
  const sha256 = hex(await crypto.subtle.digest("SHA-256", bytes));
  if (sha256 !== pin.sha256) {
    throw new Error(
      `integrity check failed for ${pin.url}: expected sha256 ${pin.sha256}, got ${sha256} — ` +
        `upstream bytes differ from the pinned tree; nothing was served`
    );
  }
  const blob = await gitBlobSha(bytes);
  if (blob !== pin.sha) {
    throw new Error(
      `provenance check failed for ${pin.url}: expected git blob ${pin.sha}, got ${blob} — ` +
        `bytes match sha256 but not the pinned git object; nothing was served`
    );
  }
}

/** The colo cache, or undefined outside a Workers runtime (unit tests). */
function defaultCache(): Cache | undefined {
  return (globalThis as { caches?: { default?: Cache } }).caches?.default;
}

async function fetchVerified(
  pin: SkillPin,
  fetchImpl: typeof fetch
): Promise<{ text: string; bytes: ArrayBuffer }> {
  let lastError = "";
  // One retry: a single transient CDN blip should not cost the caller a turn.
  for (let attempt = 0; attempt < 2; attempt++) {
    let res: Response;
    try {
      res = await fetchImpl(pin.url, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { accept: "text/plain" }
      });
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
      continue;
    }
    if (!res.ok) {
      lastError = `HTTP ${res.status}`;
      // 4xx means the pin is wrong (moved/deleted upstream) — retrying an
      // immutable URL cannot fix that, so fail on the first answer.
      if (res.status < 500) break;
      continue;
    }
    const bytes = await res.arrayBuffer();
    await verify(bytes, pin);
    return { text: new TextDecoder().decode(bytes), bytes };
  }
  throw new Error(`could not fetch ${pin.url}: ${lastError}`);
}

export type SkillSourceDeps = {
  /** Test seam; production uses global fetch (host-side — the execute sandbox
   *  itself still has no network). */
  fetchImpl?: typeof fetch;
  /** Test seam; production uses `caches.default`. Returning undefined disables
   *  the colo cache entirely, which is what happens under plain Node. */
  cacheImpl?: () => Cache | undefined;
  /**
   * Skip BOTH the memo and the colo cache and go to upstream every time.
   *
   * Only the availability canary sets this, and it is what makes the canary
   * mean anything. Pinned URLs are cached `immutable` for a year, so a warm
   * colo entry answers a read without touching the network — a canary that
   * used the normal path would report "healthy" indefinitely while egress to
   * GitHub was dead. (`check-mirrors --fetch` had exactly this bug at the build
   * layer: 0 network requests against a warm cache.) Never set it on the
   * serving path; the caches are the reason a read is 0 ms instead of 80.
   */
  bypassCaches?: boolean;
};

/**
 * The default source: memo -> Cache API -> upstream, verified and scrubbed.
 */
export function createSkillSource(deps: SkillSourceDeps = {}): SkillSource {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const getCache = deps.bypassCaches ? () => undefined : (deps.cacheImpl ?? defaultCache);
  const bypassMemo = deps.bypassCaches === true;
  return async (pin) => {
    const key = memoKey(pin);
    const hit = bypassMemo ? undefined : memo.get(key);
    // A memo hit is reported as such even though it resolves the same promise:
    // the distinction is the whole point of measuring retrieval provenance.
    if (hit) return { text: await hit, from: "memo" as const };
    let from: SkillRetrievalFrom = "upstream";
    const pending = (async () => {
      const cache = getCache();
      const request = new Request(pin.url, { headers: { accept: "text/plain" } });
      // Cache reads are best-effort AND untrusted: a hit is re-verified, and a
      // broken cache backend must not fail a read it could not have served.
      try {
        const cached = await cache?.match(request);
        if (cached) {
          const bytes = await cached.arrayBuffer();
          await verify(bytes, pin);
          from = "cache";
          return scrubNonExposedRefs(new TextDecoder().decode(bytes), pin.url);
        }
      } catch {
        // fall through to upstream
      }
      const { text, bytes } = await fetchVerified(pin, fetchImpl);
      // Cache writes are best-effort: bytes are already fetched and verified,
      // so a cache outage must never turn a good read into a failed one.
      try {
        await cache?.put(
          request,
          new Response(bytes, {
            headers: {
              "content-type": "text/markdown; charset=utf-8",
              "cache-control": CACHE_CONTROL
            }
          })
        );
      } catch {
        // best-effort
      }
      return scrubNonExposedRefs(text, pin.url);
    })();
    // A failed fetch must not poison the isolate for the rest of its life.
    const wrapped: Promise<string> = pending.catch((e: unknown) => {
      // Delete ONLY an entry this call owns. A bypassing probe never wrote the
      // memo, so it must never delete one either — its rejection would
      // otherwise evict a perfectly good serving entry for the same pin,
      // forcing the next real request back to the network. That is the canary
      // amplifying the outage it exists to measure. The identity check also
      // covers the race where another read has already replaced ours.
      if (!bypassMemo && memo.get(key) === wrapped) memo.delete(key);
      throw e;
    });
    // The canary must not WRITE the memo either: a shared isolate serves real
    // traffic, and seeding it from a cache-bypassing probe would hand the next
    // reader a body it never verified through its own path.
    if (!bypassMemo) memo.set(key, wrapped);
    return { text: await wrapped, from };
  };
}
