/**
 * Live pinned retrieval for ecosystem skill bodies (serve-don't-store; src/skills/README.md).
 * Fetches commit-pinned `raw.githubusercontent.com` URLs, verifies both SHA-256 (integrity)
 * and git blob SHA-1 (provenance), and applies `scrubNonExposedRefs`.
 * Memo keys include `(url, sha256, sha)`; colo cache hits are re-verified on every read
 * and all cache operations are best-effort transport only.
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
 * Deadline for each file load through store.ts. Main-file and companion-file
 * stages have separate races; this does not bound a whole read to 20s.
 * A deadline returns a skill error without canceling an in-flight fetch.
 */
export const SKILL_READ_DEADLINE_MS = 20_000;

/** Immutable by construction (commit-pinned URLs) — cache for a year. */
const CACHE_CONTROL = "public, max-age=31536000, immutable";

/** Keyed by full verified identity `(url, sha256, sha)` so differing digests never share a memo entry. */
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
   * Bypass memo and colo caches for the availability canary.
   * A warm immutable cache cannot prove current upstream reachability.
   * Keep this disabled on the serving path, where caches reduce traffic.
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
    const wrapped: Promise<string> = pending.catch((e: unknown) => {
      // Evict only an entry this call owns; a bypassing canary never writes or evicts the shared memo.
      if (!bypassMemo && memo.get(key) === wrapped) memo.delete(key);
      throw e;
    });
    if (!bypassMemo) memo.set(key, wrapped);
    return { text: await wrapped, from };
  };
}
