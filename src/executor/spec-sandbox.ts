/**
 * Spec sandbox for code-shaped `search` over `specs/super-spec.json`, mirroring
 * `@cloudflare/codemode` `openApiMcpServer` (`createOpenApiSandboxCode`) with `includeRequest: false`.
 * Service calls live on per-service globals (`lumenloop.*`, `scout.*`, `stellarDocs.*`, `stellarOrg.*`).
 * `resolveSpecRefs` mirrors `__resolveRefs` host-side for `execute`'s `codemode.spec()` RPC.
 * Pure module (no `cloudflare:workers` import).
 */
import { normalizeCode } from "../catalog/vendor/normalize.ts";

/** Serialize a spec for inline injection (upstream: `</` → <, script-safe). */
export function serializeSpecForSandbox(spec: unknown): string {
  return JSON.stringify(spec).replace(/</g, "\\u003c");
}

/**
 * Upstream `createOpenApiSandboxCode(code, spec, /*includeRequest*\/ false)`:
 * wrap LLM code in an async arrow function whose scope provides
 * `codemode.spec()` over the inlined spec, with in-sandbox $ref resolution.
 * The wrapper returns the raw value; the host shapes it. `serializedSpec`
 * must come from serializeSpecForSandbox (pre-serialized once per isolate so
 * each call doesn't re-stringify ~180KB).
 */
export function createSpecSandboxCode(code: string, serializedSpec: string): string {
  const normalized = normalizeCode(code);
  return `async () => {
const __rawSpec = ${serializedSpec};
const __refCache = new Map();
const __cloneResolvedRef = (value) => structuredClone(value);
const __resolveRefs = (obj, root, seen = new Set()) => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map((item) => __resolveRefs(item, root, seen));

  if (Object.prototype.hasOwnProperty.call(obj, "$ref") && typeof obj.$ref === "string") {
    const ref = obj.$ref;
    if (seen.has(ref)) return { $circular: ref };
    if (!ref.startsWith("#/")) return obj;
    if (__refCache.has(ref)) return __cloneResolvedRef(__refCache.get(ref));
    seen.add(ref);

    const parts = ref
      .slice(2)
      .split("/")
      .map((s) => s.replace(/~1/g, "/").replace(/~0/g, "~"));
    let resolved = root;
    for (const part of parts) resolved = resolved?.[part];
    const result = __resolveRefs(resolved, root, seen);
    seen.delete(ref);
    __refCache.set(ref, result);
    return __cloneResolvedRef(result);
  }

  const result = {};
  for (const [key, value] of Object.entries(obj)) result[key] = __resolveRefs(value, root, seen);
  return result;
};
let __resolvedSpec;
const codemode = {
  spec: async () => (__resolvedSpec ??= __resolveRefs(__rawSpec, __rawSpec))
};
return await (${normalized})();
}`;
}

/**
 * Host-side twin of the sandbox's `__resolveRefs` (same algorithm, same
 * cache/clone/circular semantics) — backs `execute`'s codemode.spec().
 */
export function resolveSpecRefs(spec: unknown): unknown {
  const refCache = new Map<string, unknown>();
  const resolve = (obj: unknown, root: unknown, seen = new Set<string>()): unknown => {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map((item) => resolve(item, root, seen));

    const record = obj as Record<string, unknown>;
    if (Object.prototype.hasOwnProperty.call(record, "$ref") && typeof record.$ref === "string") {
      const ref = record.$ref;
      if (seen.has(ref)) return { $circular: ref };
      if (!ref.startsWith("#/")) return obj;
      if (refCache.has(ref)) return structuredClone(refCache.get(ref));
      seen.add(ref);

      const parts = ref
        .slice(2)
        .split("/")
        .map((s) => s.replace(/~1/g, "/").replace(/~0/g, "~"));
      let resolved: unknown = root;
      for (const part of parts) {
        resolved = (resolved as Record<string, unknown> | undefined)?.[part];
      }
      const result = resolve(resolved, root, seen);
      seen.delete(ref);
      refCache.set(ref, result);
      return structuredClone(result);
    }

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record)) result[key] = resolve(value, root, seen);
    return result;
  };
  return resolve(spec, spec);
}
