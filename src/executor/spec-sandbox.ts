/**
 * Spec sandbox — the code-shaped `search` machinery, mirroring
 * @cloudflare/codemode@0.4.2's `openApiMcpServer` internals
 * (dist/mcp.js: truncateResponse / sandboxResponseText /
 * createOpenApiSandboxCode) as faithfully as our multi-service setup allows.
 *
 * What mirrors upstream EXACTLY:
 *  - the truncation constants (4 chars/token, 6k-token cap, marker + footer,
 *    24512-char sandbox pass-through ceiling) and both truncation functions;
 *  - the generated sandbox source: spec JSON injected inline (`</` escaped),
 *    `__resolveRefs` with ref cache + structuredClone + `$circular` marker,
 *    lazily resolved `__resolvedSpec`, in-sandbox `__truncateResponse`,
 *    normalizeCode applied to the LLM code, wrapper returns the truncated
 *    string.
 *
 * Provider and spec behavior (see ARCHITECTURE.md):
 *  - `includeRequest` is always false — our execute keeps per-operation fns
 *    (lumenloop.* / scout.* / stellarDocs.*) instead of a generic
 *    codemode.request; the search sandbox is read-only over spec data with
 *    NO providers at all, exactly like upstream's search.
 *  - the spec is our unified super spec (specs/super-spec.json), not a single
 *    upstream OpenAPI document.
 *  - `resolveSpecRefs` reimplements the sandbox's `__resolveRefs` host-side
 *    so `execute`'s codemode.spec() can return the same resolved document
 *    across the provider RPC boundary (upstream injects the spec into the
 *    execute sandbox source instead; ours would shadow the codemode provider
 *    global, so the host fn is the faithful-in-result equivalent).
 *
 * Pure module: no cloudflare:workers import — unit-testable under plain Node
 * (test/spec-sandbox.test.ts evals the generated wrapper directly).
 */
import { normalizeCode } from "../catalog/vendor/normalize.ts";

// --- constants: verbatim from @cloudflare/codemode/dist/mcp.js --------------
export const CHARS_PER_TOKEN = 4;
export const MAX_TOKENS = 6_000;
export const MAX_CHARS = MAX_TOKENS * CHARS_PER_TOKEN;
export const TRUNCATION_MARKER = "--- TRUNCATED ---";
const TRUNCATION_FOOTER_PREFIX = `\n\n${TRUNCATION_MARKER}\nResponse was ~`;
export const MAX_SANDBOX_TRUNCATED_CHARS = 24_512;

/** Upstream `truncateResponse`: hard cap at ~6k tokens with actionable footer. */
export function truncateResponse(content: unknown): string {
  const text =
    typeof content === "string" ? content : (JSON.stringify(content, null, 2) ?? "undefined");
  if (text.length <= MAX_CHARS) return text;
  return `${text.slice(0, MAX_CHARS)}\n\n${TRUNCATION_MARKER}\nResponse was ~${Math.ceil(
    text.length / CHARS_PER_TOKEN
  ).toLocaleString()} tokens (limit: ${MAX_TOKENS.toLocaleString()}). Use more specific queries to reduce response size.`;
}

/**
 * Upstream `sandboxResponseText`: the sandbox already truncated its own
 * result — pass an already-footered string through untouched (its footer
 * carries the REAL pre-truncation size); re-truncate anything else.
 */
export function sandboxResponseText(content: unknown): string {
  if (
    typeof content === "string" &&
    content.length <= MAX_SANDBOX_TRUNCATED_CHARS &&
    content.slice(MAX_CHARS).startsWith(TRUNCATION_FOOTER_PREFIX)
  ) {
    return content;
  }
  return truncateResponse(content);
}

/** Serialize a spec for inline injection (upstream: `</` → <, script-safe). */
export function serializeSpecForSandbox(spec: unknown): string {
  return JSON.stringify(spec).replace(/</g, "\\u003c");
}

/**
 * Upstream `createOpenApiSandboxCode(code, spec, /*includeRequest*\/ false)`:
 * wrap LLM code in an async arrow function whose scope provides
 * `codemode.spec()` over the inlined spec, with in-sandbox $ref resolution
 * and truncation. `serializedSpec` must come from serializeSpecForSandbox
 * (pre-serialized once per isolate so each call doesn't re-stringify ~180KB).
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
const __truncateResponse = (content) => {
  const text = typeof content === "string" ? content : (JSON.stringify(content, null, 2) ?? "undefined");
  if (text.length <= ${MAX_CHARS}) return text;
  const truncated = text.slice(0, ${MAX_CHARS});
  const estimatedTokens = Math.ceil(text.length / ${CHARS_PER_TOKEN});
  return truncated + "\\n\\n${TRUNCATION_MARKER}\\nResponse was ~" + estimatedTokens.toLocaleString() + " tokens (limit: ${MAX_TOKENS.toLocaleString()}). Use more specific queries to reduce response size.";
};
const codemode = {
  spec: async () => (__resolvedSpec ??= __resolveRefs(__rawSpec, __rawSpec))
};
return __truncateResponse(await (${normalized})());
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
