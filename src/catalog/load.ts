/**
 * Shared cached-catalog helper. The generated manifest is
 * bundled as a JSON module (wrangler/esbuild + Vite both import JSON natively);
 * `loadManifest` validates it once, lazily, then caches for the isolate's
 * lifetime. `loadManifest` throws on a malformed manifest, which is a build
 * bug we want loudly at first use.
 *
 * Plain module: only parses the bundled JSON, so it is safe to import from
 * BOTH the plain-Node side (src/mcp/tools.ts) and the worker-only runner
 * (src/executor/run.ts) — it pulls nothing worker-only itself.
 */
import manifestJson from "../../catalog/manifest.json";
import { loadManifest, type Catalog } from "./search.ts";

let cached: Catalog | undefined;

export function getCatalog(): Catalog {
  cached ??= loadManifest(manifestJson);
  return cached;
}
