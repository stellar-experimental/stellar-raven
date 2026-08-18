/**
 * The skill-availability canary (src/skills/canary.ts).
 *
 * This is the only detector for a Cloudflare-side failure of the
 * serve-don't-store path, so the properties worth pinning are the ones whose
 * absence would make it LOOK healthy while telling us nothing:
 *
 *   - it must bypass the caches (a warm colo entry answers reads for a year)
 *   - it must not pollute the shared memo (it probes; real traffic serves)
 *   - a never-run canary must not read as healthy
 *   - the endpoint must report, never probe (it is unauthenticated)
 */
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadManifest } from "../src/catalog/search.ts";
import type { Catalog } from "../src/catalog/types.ts";
import {
  CANARY_KV_KEY,
  canaryPins,
  runAndStoreSkillCanary,
  runSkillCanary,
  skillHealthResponse,
  type CanaryVerdict
} from "../src/skills/canary.ts";
import { createSkillSource, resetSkillSourceMemo } from "../src/skills/source.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog: Catalog = loadManifest(
  JSON.parse(readFileSync(join(ROOT, "catalog", "manifest.json"), "utf8"))
);

/** Serves the exact bytes each pin expects, counting requests. */
function fakeUpstream(bodies: Map<string, string>) {
  let calls = 0;
  const impl = (async (url: string | URL | Request) => {
    calls++;
    const body = bodies.get(String(url));
    return body === undefined
      ? new Response("not found", { status: 404 })
      : new Response(body, { status: 200 });
  }) as unknown as typeof fetch;
  return { impl, calls: () => calls };
}

/** Minimal in-memory KV with the two methods the canary uses. */
function fakeKv(): KVNamespace & { store: Map<string, string> } {
  const store = new Map<string, string>();
  return {
    store,
    get: (async (key: string, type?: string) => {
      const raw = store.get(key);
      if (raw === undefined) return null;
      return type === "json" ? JSON.parse(raw) : raw;
    }) as KVNamespace["get"],
    put: (async (key: string, value: string) => {
      store.set(key, value);
    }) as KVNamespace["put"]
  } as KVNamespace & { store: Map<string, string> };
}

describe("canaryPins", () => {
  it("covers every distinct pinned file exactly once", () => {
    const pins = canaryPins(catalog);
    const fileEntries = catalog.entries.filter((e) => e.transport?.type === "file");
    expect(pins.length).toBeGreaterThan(0);
    // EXACT set equality with the catalog. Counting alone let a mutant that
    // returned any two pins from two owners pass while silently skipping most
    // of the surface.
    const expected = new Set(
      fileEntries.map((e) => `${e.transport!.url}\n${e.transport!.sha256}\n${e.transport!.sha}`)
    );
    const actual = new Set(pins.map((p) => `${p.url}\n${p.sha256}\n${p.sha}`));
    expect(actual).toEqual(expected);
    // Many section entries share one file; each file is still fetched once.
    expect(pins.length).toBeLessThan(fileEntries.length);
  });

  it("keeps two identities that share a url — dedup is by full pin, not url", () => {
    // The serving memo keys on url + sha256 + sha, so the same url can carry
    // two verified identities. Deduping by url alone would check one and call
    // the other healthy without ever fetching it.
    const url = catalog.entries.find((e) => e.transport?.type === "file")!.transport!.url!;
    const twin = {
      entries: [
        { transport: { type: "file", url, sha: "a".repeat(40), sha256: "b".repeat(64) } },
        { transport: { type: "file", url, sha: "c".repeat(40), sha256: "d".repeat(64) } }
      ]
    } as unknown as Catalog;
    expect(canaryPins(twin)).toHaveLength(2);
  });
});

describe("runSkillCanary", () => {
  it("blames the exact url and records a timestamp", async () => {
    const pin = canaryPins(catalog)[0]!;
    const verdict = await runSkillCanary(catalog, {
      fetchImpl: (async () => new Response("x", { status: 500 })) as unknown as typeof fetch
    });
    expect(verdict.ok).toBe(false);
    expect(verdict.checked).toBe(0);
    // The operator must not have to guess which upstream went away.
    expect(verdict.error).toContain(pin.url);
    expect(Number.isFinite(Date.parse(verdict.checkedAt))).toBe(true);
  });

  it("names the failing url and stops at the first failure", async () => {
    const { impl, calls } = fakeUpstream(new Map());
    const verdict = await runSkillCanary(catalog, { fetchImpl: impl });
    expect(verdict.ok).toBe(false);
    expect(verdict.error).toMatch(/could not fetch .*HTTP 404/);
    // One pin, one attempt (a 4xx on an immutable url is not retried) — it does
    // not march through all ~30 urls to reach the same conclusion.
    expect(calls()).toBe(1);
  });
});

describe("cache bypass — the property that makes the canary mean anything", () => {
  const URL_A =
    "https://raw.githubusercontent.com/acme/skills/deadbeefdeadbeefdeadbeefdeadbeefdeadbeef/skills/x/SKILL.md";
  const BODY = "---\nname: x\n---\n\n# X\n\n## One\n\nalpha\n";

  async function pinFor(text: string) {
    const bytes = new TextEncoder().encode(text);
    const sha256 = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const header = new TextEncoder().encode(`blob ${bytes.byteLength}\0`);
    const framed = new Uint8Array(header.byteLength + bytes.byteLength);
    framed.set(header, 0);
    framed.set(bytes, header.byteLength);
    const sha = [...new Uint8Array(await crypto.subtle.digest("SHA-1", framed))]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return { url: URL_A, sha, sha256 };
  }

  it("goes to upstream even when a colo cache holds the file", async () => {
    // Pinned urls are cached `immutable` for a year. A canary on the normal
    // read path would answer from that cache and report healthy forever after
    // egress died — the same bug `check-mirrors --fetch` had at the build layer.
    resetSkillSourceMemo();
    const pin = await pinFor(BODY);
    let fetches = 0;
    const impl = (async () => {
      fetches++;
      return new Response(BODY, { status: 200 });
    }) as unknown as typeof fetch;
    const warmCache = {
      match: async () => new Response(BODY),
      put: async () => {}
    } as unknown as Cache;

    const serving = createSkillSource({ fetchImpl: impl, cacheImpl: () => warmCache });
    expect((await serving(pin)).from).toBe("cache");
    expect(fetches).toBe(0); // the serving path is SUPPOSED to do this

    resetSkillSourceMemo();
    let puts = 0;
    const spyCache = {
      match: async () => new Response(BODY),
      put: async () => {
        puts++;
      }
    } as unknown as Cache;
    const probing = createSkillSource({ fetchImpl: impl, cacheImpl: () => spyCache, bypassCaches: true });
    expect((await probing(pin)).from).toBe("upstream");
    expect(fetches).toBe(1); // the canary must actually touch the network
    // ...and must not WRITE the colo cache either. Without this spy, a probe
    // that skipped cache reads but still seeded the cache passed happily.
    expect(puts).toBe(0);
  });

  it("a FAILED probe does not evict the serving path's memo entry", async () => {
    // The rejection handler used to delete the memo key unconditionally, so a
    // failing probe threw away a perfectly good serving entry for the same pin
    // — the canary amplifying the outage it exists to measure. The passing
    // probe in the test above could never catch it.
    resetSkillSourceMemo();
    const pin = await pinFor(BODY);
    const serving = createSkillSource({
      fetchImpl: (async () => new Response(BODY, { status: 200 })) as unknown as typeof fetch,
      cacheImpl: () => undefined
    });
    expect((await serving(pin)).from).toBe("upstream"); // seeds the memo

    const probing = createSkillSource({
      fetchImpl: (async () => new Response("boom", { status: 500 })) as unknown as typeof fetch,
      cacheImpl: () => undefined,
      bypassCaches: true
    });
    await expect(probing(pin)).rejects.toThrow(/could not fetch/);

    expect((await serving(pin)).from).toBe("memo");
  });

  it("does not seed the shared memo from a probe", async () => {
    // The scheduled handler can run in an isolate that also serves traffic.
    // A probe writing the memo would hand the next real reader a body that
    // never went through its own verification path.
    resetSkillSourceMemo();
    const pin = await pinFor(BODY);
    let fetches = 0;
    const impl = (async () => {
      fetches++;
      return new Response(BODY, { status: 200 });
    }) as unknown as typeof fetch;

    const probing = createSkillSource({ fetchImpl: impl, cacheImpl: () => undefined, bypassCaches: true });
    await probing(pin);
    await probing(pin);
    expect(fetches).toBe(2); // no memo reuse between probes either

    const serving = createSkillSource({ fetchImpl: impl, cacheImpl: () => undefined });
    expect((await serving(pin)).from).toBe("upstream"); // NOT "memo"
    expect(fetches).toBe(3);
  });
});

describe("/health/skills", () => {
  it("503s when no verdict has ever been recorded", async () => {
    // "Never ran" and "ran and failed" are both "do not trust skill retrieval".
    // A monitor reading only the status code must not see the first as healthy.
    const res = await skillHealthResponse(fakeKv());
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ ok: false });
  });

  it("mirrors a stored verdict: 200 when ok, 503 when not", async () => {
    const kv = fakeKv();
    const good: CanaryVerdict = {
      ok: true,
      checkedAt: "2026-07-30T00:00:00.000Z",
      checked: 30,
      ms: 900,
      error: null
    };
    kv.store.set(CANARY_KV_KEY, JSON.stringify(good));
    const okRes = await skillHealthResponse(kv);
    expect(okRes.status).toBe(200);
    expect(await okRes.json()).toEqual({ ok: true, checkedAt: good.checkedAt, checked: 30, ms: 900, error: null });

    kv.store.set(CANARY_KV_KEY, JSON.stringify({ ...good, ok: false, error: "could not fetch" }));
    expect((await skillHealthResponse(kv)).status).toBe(503);
  });

  it.each([
    { ok: true, error: "could not fetch" },
    { ok: false, error: null }
  ])("rejects a contradictory stored verdict: %o", async ({ ok, error }) => {
    const kv = fakeKv();
    kv.store.set(
      CANARY_KV_KEY,
      JSON.stringify({ ok, checkedAt: "2026-07-30T00:00:00.000Z", checked: 30, ms: 900, error })
    );

    const res = await skillHealthResponse(kv);
    expect(res.status).toBe(503);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.json()).toEqual({ ok: false, reason: "no usable canary verdict recorded" });
  });

  it("publishes a coarse error class, never the raw URL or digests", async () => {
    // The route is unauthenticated. A raw integrity error carries expected and
    // actual hashes; a transport error carries the exact upstream URL. Useful
    // in Workers Logs, not on a public endpoint.
    const kv = fakeKv();
    const raw =
      "integrity check failed for https://raw.githubusercontent.com/o/r/deadbeef/x.md: " +
      "expected sha256 abc123, got def456";
    kv.store.set(
      CANARY_KV_KEY,
      JSON.stringify({ ok: false, checkedAt: "2026-07-30T00:00:00.000Z", checked: 4, ms: 80, error: raw })
    );
    const body = (await (await skillHealthResponse(kv)).json()) as { error: string };
    expect(body.error).toBe("integrity");
    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain("raw.githubusercontent.com");
    expect(serialized).not.toContain("abc123");
  });

  it("bounds the KV-read lever with a short edge cache on the success path", async () => {
    // Unauthenticated + no-store would let anyone turn this route into
    // unbounded billable KV reads. The verdict only changes hourly and the
    // consumer tolerates 3h, so a 60s edge cache costs no freshness.
    const kv = fakeKv();
    kv.store.set(
      CANARY_KV_KEY,
      JSON.stringify({ ok: true, checkedAt: "2026-07-30T00:00:00.000Z", checked: 30, ms: 900, error: null })
    );
    expect((await skillHealthResponse(kv)).headers.get("cache-control")).toBe("public, max-age=60");
  });

  it("a canary with zero pins is NOT healthy", async () => {
    // The vacuous pass: no file transports means nothing was verified, and
    // "checked: 0, ok: true" is the most reassuring possible lie.
    const empty = { entries: [] } as unknown as Catalog;
    const verdict = await runSkillCanary(empty);
    expect(verdict.ok).toBe(false);
    expect(verdict.checked).toBe(0);
    expect(verdict.error).toMatch(/nothing to verify/);
  });

  it("survives a KV read failure without throwing", async () => {
    const broken = {
      get: async () => {
        throw new Error("kv down");
      }
    } as unknown as KVNamespace;
    expect((await skillHealthResponse(broken)).status).toBe(503);
  });
});

describe("runAndStoreSkillCanary", () => {
  it("stores the verdict under the canary key", async () => {
    const kv = fakeKv();
    const verdict = await runAndStoreSkillCanary(catalog, kv, {
      fetchImpl: (async () => new Response("nope", { status: 404 })) as unknown as typeof fetch
    });
    expect(verdict.ok).toBe(false);
    expect(JSON.parse(kv.store.get(CANARY_KV_KEY)!)).toEqual(verdict);
  });

  it("still returns the verdict when the KV write fails", async () => {
    // Losing the write is not losing the answer: it is logged either way, and
    // the endpoint reporting a stale checkedAt is the correct symptom.
    const broken = {
      get: async () => null,
      put: async () => {
        throw new Error("kv down");
      }
    } as unknown as KVNamespace;
    const verdict = await runAndStoreSkillCanary(catalog, broken, {
      fetchImpl: (async () => new Response("nope", { status: 404 })) as unknown as typeof fetch
    });
    expect(verdict.ok).toBe(false);
  });
});
