/**
 * In-memory KV for Node OAuth tests. Supports `{ type: "json" }`, put metadata,
 * and prefix/limit/cursor `list()` needed by workers-oauth-provider 1.x; expiry is recorded, not enforced.
 */
export type MemoryKv = KVNamespace & {
  store: Map<string, string>;
  metadata: Map<string, unknown>;
  expirationTtl: Map<string, number>;
};

export function memoryKv(): MemoryKv {
  const store = new Map<string, string>();
  const metadata = new Map<string, unknown>();
  const expirationTtl = new Map<string, number>();
  return {
    store,
    metadata,
    expirationTtl,
    // Honors `{ type: "json" }`. The real provider reads client records that
    // way, so a stub that always returns the raw string hands back a string
    // where an object is expected and fails deep inside the library.
    async get(key: string, options?: { type?: string } | string) {
      const raw = store.get(key) ?? null;
      const type = typeof options === "string" ? options : options?.type;
      if (raw === null || type !== "json") return raw;
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    },
    async put(key: string, value: string, options?: { metadata?: unknown; expirationTtl?: number }) {
      store.set(key, value);
      if (options?.metadata === undefined) metadata.delete(key);
      else metadata.set(key, options.metadata);
      if (options?.expirationTtl === undefined) expirationTtl.delete(key);
      else expirationTtl.set(key, options.expirationTtl);
    },
    async delete(key: string) {
      store.delete(key);
      metadata.delete(key);
      expirationTtl.delete(key);
    },
    async list(options?: { prefix?: string; limit?: number; cursor?: string }) {
      const prefix = options?.prefix ?? "";
      const limit = options?.limit ?? 1000;
      const names = [...store.keys()].filter((name) => name.startsWith(prefix)).sort();
      const start = options?.cursor ? Number(options.cursor) : 0;
      const page = names.slice(start, start + limit);
      const next = start + limit;
      const complete = next >= names.length;
      return {
        keys: page.map((name) => ({
          name,
          ...(metadata.has(name) ? { metadata: metadata.get(name) } : {}),
          ...(expirationTtl.has(name) ? { expiration: Math.floor(Date.now() / 1000) + expirationTtl.get(name)! } : {})
        })),
        list_complete: complete,
        ...(complete ? {} : { cursor: String(next) }),
        cacheStatus: null
      };
    }
  } as unknown as MemoryKv;
}
