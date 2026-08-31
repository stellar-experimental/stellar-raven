/**
 * Sandbox surface — the namespaced globals LLM code sees inside `execute`
 * (PLAN §1). Pure module: no cloudflare:workers import, fully unit-testable;
 * src/executor/run.ts feeds these providers to codemode's
 * DynamicWorkerExecutor, whose ResolvedProvider type they match structurally.
 *
 * Each service global exposes one
 * async fn PER OPERATION, named exactly by the catalog id's terminal segment —
 * `lumenloop.search_directory(args)`, `scout.getStatus()`,
 * `stellarDocs.search_docs(args)`. Chosen over a generic `call("id", args)`
 * because (a) it is exactly the callable line `search` already renders in
 * every operation hit's signature, so the model copies verbatim instead of
 * translating, and (b) codemode's per-namespace Proxy dispatch makes wrong
 * names fail loudly ("Tool not found") rather than fuzzy-resolving —
 * exact-match ids end to end.
 *
 * Every fn: guard (arg-validation) → adapter → redaction, and
 * ALWAYS returns a value ({ok:...} envelope) — never throws to the sandbox.
 * Ordinary calls hold no shared mutable state. Recovery-only dispatch uses
 * host receipt state and rejects multiple attempts in one execute. A sandbox-side prelude
 * (envelopeGuardPrelude below) guards the envelope: fail-loud on wrong-level
 * payload reads (`r.projects` throws "use r.data.projects"), warn-once +
 * undefined on failed-envelope data access, and writes are write-through.
 *
 * The `codemode` global adds mid-script discovery + skills:
 *   codemode.spec()                   — the unified super spec
 *     (specs/super-spec.json) with $refs resolved inline — the SAME document
 *     the code-shaped `search` tool queries, so execute mirrors upstream
 *     openApiMcpServer's REQUEST_TYPES (spec + calls in one sandbox). Upstream
 *     injects the spec into the execute sandbox source; ours crosses the
 *     provider RPC instead (a source-injected `const codemode` would shadow
 *     this provider global) — same resolved document either way.
 *   codemode.search(queryOrOpts)      — host-side searchCatalogPage (ranked;
 *     { ok, hits, total, truncated, recovery, widerCandidates, confidence, recoveryMetadata }
 *     — truncated ⇒ retry with a higher limit
 *     or narrower filters). Unknown kind/service filter values are rejected
 *     as error envelopes naming the valid set. The
 *     searchCatalog contract keeps filters silent, so the validation lives
 *     here at the sandbox boundary.
 *   codemode.catalog({ kind?, service?, compact? }) — the catalog as plain
 *     data for arbitrary code-grep discovery (spec-as-data pattern; strict
 *     superset of the fixed scorer). Exact filters slice the exposed surface;
 *     compact omits schemas. Everything returned is exposed/readable.
 *     Recovery-only operations require a host receipt before dispatch.
 *     Exposure is filtered at build time (ADR-0003). Host-only transport/
 *     provenance detail is stripped.
 *   codemode.describe(id)             — canonical detail-on-demand step
 *     (exact id): operations get the FULL rendered signature (search hits
 *     stub oversized output types) + inputSchema/outputSchema as data;
 *     skills get availableSections; skill sections get parent id + key —
 *     every kind carries a `usage` line naming the exact next call.
 *   codemode.skill.read(name, {sections?}) — pinned skill content, fetched
 *     from upstream at the pinned commit and hash-verified (src/skills/source.ts)
 *   codemode.skill.run(name, input)   — runnable-skill dispatch (research/
 *     skill-run-design.md §6): exact catalog id, input validated host-side
 *     against the entry's schema, first-party runner executed HOST-side over
 *     the same wrapped op closures the service namespaces expose (policy
 *     identity by construction — buildOpsFns below); returns the service-call
 *     envelope with a host-recorded `data.calls` audit trail.
 * (`skill.read`/`skill.run` need a sandbox-side prelude: nested objects can't
 * cross the Proxy dispatch, so the prelude assigns `codemode.skill` wrapping
 * the flat `skill_read`/`skill_run` dispatch fns — codemode's documented
 * prelude mechanism.)
 */
import {
  CATALOG_KINDS,
  SEARCH_KINDS,
  RETRIEVAL_REASONS,
  type BuildAuthorityRole,
  type Catalog,
  type CatalogEntry,
  type CatalogKind,
  type SearchKind,
  type RetrievalReason
} from "../catalog/types.ts";
import {
  catalogServices,
  renderSignature,
  sectionKeysOf
} from "../catalog/search.ts";
import { prepareCatalogSearch } from "../catalog/search-resolution.ts";
import { lastIdSegment, VALID_IDENT } from "../catalog/id.ts";
import { callService } from "../adapters/index.ts";
import { errResult, type AdapterEnv, type FetchLike } from "../adapters/types.ts";
import { guard } from "../policy/guard.ts";
import { redactSecrets, secretsFromEnv } from "../policy/redact.ts";
import type { SourceMetadataField, SourceMetadataPath } from "../policy/source-basis.ts";
import { readSkill } from "../skills/store.ts";
import type { SkillRetrievalFrom, SkillSource } from "../skills/source.ts";
import { runSkill, assertRunnersWired } from "../skills/run.ts";
import { RUNNERS } from "../skills/runners/index.ts";
import type { OpsFacade, SkillRunner } from "../skills/runners/types.ts";
import { resolveSpecRefs } from "./spec-sandbox.ts";
import { logArtifactRead, logEvent, logSkillRead } from "../observability.ts";
import { searchEventFields } from "../observability-search.ts";
import { info as artifactInfo, read as artifactRead } from "../artifacts/store.ts";
import {
  consumeRecoveryReceipt,
  qualifyingSourcesForRecoveryTarget,
  type RecoveryReceiptFailure
} from "../policy/recovery-receipt.ts";

/** Structurally identical to @cloudflare/codemode's ResolvedProvider. */
export type SandboxProvider = {
  name: string;
  fns: Record<string, (...args: unknown[]) => Promise<unknown>>;
  prelude?: string;
};

export const ARTIFACT_INFO_CAP = 8;
export const ARTIFACT_READ_CAP = 4;

export type OpLedgerCall = {
  op: string;
  outcome: "ok" | "error" | "soft-empty";
  /** Host-only structural evidence signal. It never changes the service envelope. */
  hasServiceData?: boolean;
  /** Exact allowlisted response metadata captured before sandbox projection. */
  sourceMetadata?: SourceMetadataField[];
  ms: number;
};

type SourceMetadataRule = {
  path: SourceMetadataPath;
  segments: readonly string[];
  kind: "string" | "number" | "string-or-number";
};

/**
 * These are the only response locations the host may copy into the provenance
 * sidecar. They cover payload-root metadata, the standard `meta` block and its
 * `counts` block, plus Scout's named `meta.scfRound` scheduling summary.
 * No recursive walk occurs, so row content, credentials and partner details
 * cannot enter through an unexpected nested field with a familiar name.
 */
const SOURCE_METADATA_RULES: readonly SourceMetadataRule[] = [
  { path: "data.generatedAt", segments: ["generatedAt"], kind: "string" },
  { path: "data.dataAsOf", segments: ["dataAsOf"], kind: "string" },
  { path: "data.asOf", segments: ["asOf"], kind: "string" },
  { path: "data.matchMode", segments: ["matchMode"], kind: "string" },
  { path: "data.match_mode", segments: ["match_mode"], kind: "string" },
  { path: "data.count", segments: ["count"], kind: "number" },
  { path: "data.total", segments: ["total"], kind: "number" },
  { path: "data.meta.generatedAt", segments: ["meta", "generatedAt"], kind: "string" },
  { path: "data.meta.dataAsOf", segments: ["meta", "dataAsOf"], kind: "string" },
  { path: "data.meta.asOf", segments: ["meta", "asOf"], kind: "string" },
  { path: "data.meta.matchMode", segments: ["meta", "matchMode"], kind: "string" },
  { path: "data.meta.match_mode", segments: ["meta", "match_mode"], kind: "string" },
  { path: "data.meta.count", segments: ["meta", "count"], kind: "number" },
  { path: "data.meta.total", segments: ["meta", "total"], kind: "number" },
  { path: "data.meta.counts.count", segments: ["meta", "counts", "count"], kind: "number" },
  { path: "data.meta.counts.total", segments: ["meta", "counts", "total"], kind: "number" },
  { path: "data.meta.scfRound.asOf", segments: ["meta", "scfRound", "asOf"], kind: "string" },
  {
    path: "data.meta.scfRound.currentRound",
    segments: ["meta", "scfRound", "currentRound"],
    kind: "string-or-number"
  },
  {
    path: "data.meta.scfRound.currentPhase",
    segments: ["meta", "scfRound", "currentPhase"],
    kind: "string"
  },
  {
    path: "data.meta.scfRound.submissionWindow.closes",
    segments: ["meta", "scfRound", "submissionWindow", "closes"],
    kind: "string"
  }
];

function captureSourceMetadata(payload: unknown): SourceMetadataField[] | undefined {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) return undefined;
  const fields: SourceMetadataField[] = [];
  for (const rule of SOURCE_METADATA_RULES) {
    let current: unknown = payload;
    let present = true;
    for (const segment of rule.segments) {
      if (
        current === null ||
        typeof current !== "object" ||
        Array.isArray(current) ||
        !Object.prototype.hasOwnProperty.call(current, segment)
      ) {
        present = false;
        break;
      }
      current = (current as Record<string, unknown>)[segment];
    }
    if (!present) continue;
    if (current === null) {
      fields.push({ path: rule.path, value: null });
      continue;
    }
    if (rule.kind === "number" && typeof current === "number" && Number.isFinite(current)) {
      fields.push({ path: rule.path, value: current });
    } else if (rule.kind === "string" && typeof current === "string") {
      fields.push({ path: rule.path, value: current });
    } else if (
      rule.kind === "string-or-number" &&
      (typeof current === "string" || (typeof current === "number" && Number.isFinite(current)))
    ) {
      fields.push({ path: rule.path, value: current });
    }
  }
  return fields.length > 0 ? fields : undefined;
}

/**
 * An ok envelope is not by itself factual service evidence. Collections carry
 * the rows that can support a later answer. Empty collections are
 * inconclusive unless the same payload also has a meaningful scalar/detail
 * field. Metadata branches do not count as detail evidence.
 */
export function hasServiceData(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value !== "object") return true;

  const seen = new Set<object>();
  let hasData = false;
  const metadataKeys = new Set(["meta", "metadata", "counts", "pagination", "pageInfo"]);
  const visit = (current: unknown, metadataBranch = false): void => {
    if (current === null || hasData) return;
    if (typeof current !== "object") {
      if (!metadataBranch) hasData = true;
      return;
    }
    if (seen.has(current)) return;
    seen.add(current);
    if (Array.isArray(current)) {
      if (!metadataBranch && current.length > 0) hasData = true;
      return;
    }
    for (const [key, nested] of Object.entries(current)) {
      visit(nested, metadataBranch || metadataKeys.has(key));
    }
  };
  visit(value);
  return hasData;
}

export type ArtifactReadStats = {
  count: number;
  bytes: number;
};

export type ArtifactSandboxDeps = {
  bucket?: R2Bucket;
  owner?: string;
  onReadStats?: (stats: ArtifactReadStats) => void;
};

export type RecoverySandboxDeps = {
  bucket: R2Bucket;
  secret: string;
  identity?: string;
  receipt?: string;
};

/**
 * Skill namespace + result-shape guard. `codemode.skill.read` returns skill
 * content at the TOP LEVEL ({ ok, id, content | sections, availableSections,
 * notice? }) — NOT under `.data` like the service-call envelope. Reading
 * `.data` on an ok read is the one observed failure mode (agents copy the
 * `r.data.X` service pattern and get a bare TypeError with no corrective
 * path), so we plant a non-enumerable `.data` trap inside the sandbox exactly
 * like envelopeGuardPrelude: GET throws the corrective pointer to
 * content/sections; SET self-replaces (write-through — decorating the result
 * stays legal). A FAILED read ({ ok:false, error }) routes through the shared
 * `__guardEnvelope` so `.data` there warns-once-and-undefined identically to
 * every other failed envelope — one consistent story for `.data` misuse.
 * (__guardEnvelope is declared by the service prelude and shared via the
 * concatenated sandbox scope; buildProviders only attaches that prelude when
 * at least one operation entry exists, so a skills-only/empty-operation
 * catalog would leave it undeclared — the typeof fallback keeps skill.read
 * self-contained there, degrading to the pre-guard behavior instead of a
 * ReferenceError. The inlined trap descriptor below must stay in lock-step
 * with __trap in envelopeGuardPrelude: same non-enumerable get-throws /
 * set-write-through contract, or skill results and service envelopes
 * decorate inconsistently.)
 *
 * `codemode.skill.run` (design §6) is read's sibling over the flat
 * `skill_run` dispatch. NO .data-trap inversion for run: unlike skill.read,
 * run is a CALL and RETURNS the service-call envelope
 * ({ ok: true, data } | { ok: false, error }), so the shared __guardEnvelope
 * plants exactly the right traps — ok:true payload-key traps pointing at
 * r.data.<field>, ok:false warn-once `.data` — identical treatment to every
 * operation call. Same typeof fallback for operation-less test catalogs.
 */
const SKILL_PRELUDE = [
  "    codemode.skill = {",
  "      read: async (name, opts) => {",
  "        const raw = await codemode.skill_read(name, opts);",
  '        const r = typeof __guardEnvelope === "function" ? __guardEnvelope(raw, "codemode.skill.read") : raw;',
  '        if (r && typeof r === "object" && r.ok === true) {',
  "          const msg = 'codemode.skill.read result: \".data\" is the service-call envelope shape — skill content sits at the top level: use r.content (whole read) or r.sections (section read); other fields: id, availableSections, notice';",
  '          try { Object.defineProperty(r, "data", {',
  "            enumerable: false, configurable: true,",
  "            get() { throw new Error(msg); },",
  '            set(value) { Object.defineProperty(this, "data", { value, writable: true, enumerable: true, configurable: true }); }',
  "          }); } catch {}",
  "        }",
  "        return r;",
  "      },",
  "      run: async (name, input) => {",
  "        const raw = await codemode.skill_run(name, input);",
  '        return typeof __guardEnvelope === "function" ? __guardEnvelope(raw, "codemode.skill.run") : raw;',
  "      }",
  "    };"
].join("\n");

const ARTIFACT_PRELUDE = [
  "    codemode.artifact = {",
  "      info: async (id) => {",
  "        const raw = await codemode.artifact_info(id);",
  '        return typeof __guardEnvelope === "function" ? __guardEnvelope(raw, "codemode.artifact.info") : raw;',
  "      },",
  "      read: async (id) => {",
  "        const raw = await codemode.artifact_read(id);",
  '        return typeof __guardEnvelope === "function" ? __guardEnvelope(raw, "codemode.artifact.read") : raw;',
  "      }",
  "    };"
].join("\n");

/**
 * Sandbox-side envelope guard: fail-loud on wrong-level payload reads,
 * warn-once + undefined on failed-envelope data access, writes are
 * write-through. The single observed LLM failure mode with the result
 * envelope is reading payload fields one level too shallow (`r.projects`
 * instead of `r.data.projects`), which yields `undefined` and — after a
 * defensive `|| []` — masquerades as a legitimate empty result.
 *
 * The guard wraps every service fn in a prelude (codemode's documented
 * mechanism: preludes run after the per-namespace Proxy inits in the same
 * scope, and property assignment lands on the Proxy target, which the get
 * trap checks first — same trick as SKILL_PRELUDE). Each wrapped result gets
 * NON-ENUMERABLE accessor pairs planted on the envelope:
 *   - ok:true  → one pair per top-level key of `data`: GET throws
 *     "use r.data.projects" instead of returning undefined; SET self-replaces
 *     with a plain data property (write-through — decorating the envelope
 *     before returning it is a legitimate pattern, not a wrong-level read).
 *   - ok:false → a pair on `data`: GET returns undefined and console.logs
 *     ONE deduped `[envelope]` warning naming the actual service error
 *     (kind/message/hint); SET warns once too, then writes through — a model
 *     assigning r.data on a failed envelope without checking r.ok should see
 *     the real error. `r.error` on ok:true stays a plain undefined, so the
 *     `if (r.error)` guard pattern keeps working.
 *
 * Non-enumerable accessors deliberately avoid a Proxy around the envelope.
 * Dynamic Worker RPC cannot serialize Proxy prototypes. Keep every legitimate
 * pattern untouched with non-enumerable own accessors: Object.keys / spread /
 * JSON / structured clone all read enumerable-only, so a script can return a
 * raw envelope across the Workers RPC boundary. `await` never trips over a
 * `then` trap. Only direct wrong-level property access trips a trap.
 * The write-through SET is NOT try/caught: on a frozen envelope it must
 * throw loudly at the write, not silently no-op and then throw on read.
 * Applies to service namespaces only — codemode.* discovery fns return
 * their own shapes (hits/total at the top level) by design.
 */
function envelopeGuardPrelude(opsByService: Map<string, string[]>): string {
  const wiring = [...opsByService.entries()].map(
    ([svc, ops]) =>
      `    for (const __op of ${JSON.stringify(ops)}) {\n` +
      `      const __orig = ${svc}[__op];\n` +
      `      ${svc}[__op] = async (...__a) => __guardEnvelope(await __orig(...__a), "${svc}." + __op, true);\n` +
      `    }`
  );
  return [
    "    const __warned = new Set();",
    "    const __guardEnvelope = (r, call, guardPayloadShape = false) => {",
    '      if (r === null || typeof r !== "object" || typeof r.ok !== "boolean") return r;',
    "      const __trap = (key, desc) => {",
    "        try { Object.defineProperty(r, key, { ...desc, enumerable: false, configurable: true }); } catch {}",
    "      };",
    '      if (r.ok && r.data && typeof r.data === "object" && !Array.isArray(r.data)) {',
    "        if (guardPayloadShape) {",
    "          try {",
    "            const data = r.data;",
    "            for (const key of ['map', 'filter', 'length', Symbol.iterator]) {",
    "              if (key in data) continue;",
    "              const keys = Object.keys(data);",
    "              const arrays = keys.filter((candidate) => {",
    "                const descriptor = Object.getOwnPropertyDescriptor(data, candidate);",
    "                return descriptor && Object.prototype.hasOwnProperty.call(descriptor, 'value') && Array.isArray(descriptor.value);",
    "              });",
    "              const accessor = arrays.includes('hits') ? 'hits' : arrays.length === 1 ? arrays[0] : null;",
    "              const read = key === Symbol.iterator ? 'iteration' : '.' + String(key);",
    "              const suggestion = accessor ? ' Use r.data.' + accessor + ' for the array.' : '';",
    "              Object.defineProperty(data, key, {",
    "                enumerable: false, configurable: true,",
    "                get() { throw new Error(call + ' result payload is an object, not an array: ' + read + ' is array-only. Top-level payload keys: ' + (keys.length ? keys.join(', ') : '(none)') + '.' + suggestion); }",
    "              });",
    "            }",
    "          } catch {}",
    "        }",
    "        for (const key of Object.keys(r.data)) {",
    '          if (key === "ok" || key === "data" || key === "error" || key === "then" || key === "toJSON") continue;',
    '          const msg = call + \' result: ".\' + key + \'" is on the data payload, not the envelope — use r.data.\' + key + " (every call resolves to { ok: true, data } | { ok: false, error })";',
    "          __trap(key, {",
    "            get() { throw new Error(msg); },",
    "            set(value) { Object.defineProperty(this, key, { value, writable: true, enumerable: true, configurable: true }); }",
    "          });",
    "        }",
    "      } else if (!r.ok) {",
    "        const e = r.error || {};",
    "        const __warnOnce = () => {",
    "          const k = call + '|' + e.kind;",
    "          if (__warned.has(k)) return;",
    "          __warned.add(k);",
    "          console.log('[envelope] ' + call + ' returned { ok: false } — r.data is undefined. error.kind=\"' + e.kind + '\": ' + e.message + (e.hint ? ' (hint: ' + e.hint + ')' : '') + (e.kind === 'soft-empty' ? ' — soft-empty is routine, not evidence of absence.' : '') + ' Branch on r.ok and read r.error.');",
    "        };",
    '        __trap("data", {',
    "          get() { __warnOnce(); return undefined; },",
    '          set(value) { __warnOnce(); Object.defineProperty(this, "data", { value, writable: true, enumerable: true, configurable: true }); }',
    "        });",
    "      }",
    "      return r;",
    "    };",
    ...wiring
  ].join("\n");
}

/**
 * The per-op wrapped-closure builder — extracted from buildProviders (design
 * §11 row 6) so the SAME closures serve BOTH consumers: the sandbox service
 * namespaces (buildProviders) and the skill-run ops facade (runSkill's
 * sub-facade wraps these for the host call ledger). Policy identity holds by
 * construction: there is exactly one guard → callService → logEvent →
 * redactSecrets path, so a runner cannot reach an op the sandbox couldn't,
 * skip validation the sandbox gets, or leak a secret the sandbox wouldn't.
 * One fn per emitted operation entry — a build-excluded op has no entry,
 * hence no closure, hence nothing to call (ADR-0003, structurally).
 */
export function buildOpsFns(
  catalog: Catalog,
  env: AdapterEnv,
  deps?: {
    fetchImpl?: FetchLike;
    onOpCall?: (call: OpLedgerCall) => void;
    recovery?: RecoverySandboxDeps;
  }
): OpsFacade {
  const secrets = secretsFromEnv(env as Record<string, unknown>);
  const fetchImpl = deps?.fetchImpl;
  let recoveryAttempted = false;

  const byService: OpsFacade = {};
  for (const entry of catalog.entries) {
    if (entry.kind !== "operation") continue;
    const name = lastIdSegment(entry.id);
    // loadManifest (catalog/search.ts) already THROWS on an invalid ident, so a
    // real manifest can't reach here with a bad one; this stays as a belt for
    // hand-built test catalogs that skip loadManifest.
    if (!VALID_IDENT.test(entry.service) || !VALID_IDENT.test(name)) continue;
    (byService[entry.service] ??= {})[name] = async (args?: unknown) => {
      const t0 = Date.now();
      const refused = guard(entry, args); // arg validation only (ADR-0003)
      if (refused) {
        // guard only ever returns the error variant; narrow for the compiler.
        const ms = Date.now() - t0;
        logEvent("op", {
          id: entry.id,
          outcome: refused.ok ? "ok" : refused.error.kind,
          ms
        });
        deps?.onOpCall?.({
          op: entry.id,
          outcome: refused.ok ? "ok" : refused.error.kind,
          ms
        });
        return refused;
      }
      if (entry.discoveryMode === "recovery-only") {
        let message: string;
        let denialReason: RecoveryReceiptFailure | "attempted" | undefined;
        if (recoveryAttempted) {
          message = "only one recovery-only attempt is allowed per execute";
          denialReason = "attempted";
        } else {
          recoveryAttempted = true;
          const recovery = deps?.recovery;
          if (!recovery?.receipt) {
            message = "a recovery receipt is required before this operation can run; pass it as the top-level execute field recoveryReceipt beside code, not inside the script or the call arguments";
            denialReason = "missing";
          } else if (!recovery.identity || !recovery.secret || !recovery.bucket) {
            message = "the recovery receipt cannot be verified for this request";
            denialReason = "unavailable";
          } else {
            const authorization = await consumeRecoveryReceipt(
              recovery.bucket,
              recovery.secret,
              recovery.identity,
              entry.id,
              recovery.receipt
            );
            if (authorization.ok) {
              message = "";
              logEvent("recovery_receipt", {
                outcome: "consumed",
                source: authorization.source,
                target: authorization.target
              });
            } else {
              message = authorization.message;
              denialReason = authorization.reason;
            }
          }
        }
        if (message) {
          const ms = Date.now() - t0;
          const result = errResult({
            service: entry.service,
            kind: "error",
            message: `${entry.id} blocked by host recovery policy: ${message}. No adapter call was made.`
          });
          logEvent("op", { id: entry.id, outcome: "error", ms });
          logEvent("recovery_receipt", { outcome: "denied", reason: denialReason, target: entry.id });
          deps?.onOpCall?.({ op: entry.id, outcome: "error", ms });
          return result;
        }
      }
      const result = await callService(
        entry,
        (args ?? {}) as Record<string, unknown>,
        env,
        fetchImpl
      );
      const ms = Date.now() - t0;
      const redactedResult = redactSecrets(result, secrets);
      const sourceMetadata = redactedResult.ok
        ? captureSourceMetadata(redactedResult.data)
        : undefined;
      logEvent("op", {
        id: entry.id,
        outcome: result.ok ? "ok" : result.error.kind,
        ms
      });
      deps?.onOpCall?.({
        op: entry.id,
        outcome: result.ok ? "ok" : result.error.kind,
        hasServiceData: result.ok ? hasServiceData(result.data) : undefined,
        sourceMetadata,
        ms
      });
      return redactedResult;
    };
  }
  return byService;
}

export function buildProviders(
  catalog: Catalog,
  env: AdapterEnv,
  deps?: { fetchImpl?: FetchLike },
  /**
   * Pre-built ops from buildOpsFns — buildSandbox builds the closures ONCE
   * and passes them here AND to the skill-run facade, so the two surfaces
   * cannot diverge even by accidental double construction with different
   * deps. Omitted (direct callers, tests): built internally, same builder.
   */
  ops?: OpsFacade
): SandboxProvider[] {
  const opsFns = ops ?? buildOpsFns(catalog, env, deps);

  // --- service namespaces: one fn per operation entry ---------------------
  const providers: SandboxProvider[] = Object.entries(opsFns).map(([name, fns]) => ({
    name,
    fns
  }));

  // One combined guard prelude (helper + wiring for every service namespace)
  // carried by the first provider: codemode concatenates all preludes after
  // ALL proxy inits, so any prelude may reference every namespace const, but
  // the helper must be declared exactly once in that shared scope.
  if (providers.length > 0) {
    const opsByService = new Map(
      providers.map((p) => [p.name, Object.keys(p.fns)] as const)
    );
    providers[0]!.prelude = envelopeGuardPrelude(opsByService);
  }

  return providers;
}

/** codemode.search input: a bare query string or search options. */
type SearchArg = string | {
  query?: unknown;
  kind?: unknown;
  service?: unknown;
  limit?: unknown;
  recoverFrom?: unknown;
  reason?: unknown;
};
type CatalogArg = { kind?: unknown; service?: unknown; compact?: unknown };

/**
 * Sandbox-facing projection of one catalog entry for `codemode.catalog()`:
 * everything the model may reason over, nothing host-only (transport carries
 * base URLs / Algolia mappings / env-var names; provenance is refresh
 * bookkeeping). Every entry is exposed. A `discoveryMode: "recovery-only"`
 * entry needs a host receipt before dispatch (ADR-0009).
 */
function catalogEntryView(entry: CatalogEntry) {
  return {
    id: entry.id,
    service: entry.service,
    kind: entry.kind,
    description: entry.description,
    inputSchema: entry.inputSchema,
    outputSchema: entry.outputSchema,
    ...(entry.retrievalProfile ? { retrievalProfile: entry.retrievalProfile } : {}),
    ...(entry.discoveryMode ? { discoveryMode: entry.discoveryMode } : {}),
    // Runnable-skill affordance flag (design §5): present-and-true only, same
    // as the manifest — code-grep discovery (`entries.filter(e => e.runnable)`)
    // sees exactly what the catalog says, no third truth value.
    ...(entry.runnable === true ? { runnable: true as const } : {})
  };
}

function describeCatalogEntry(catalog: Catalog, id?: unknown) {
  if (typeof id !== "string" || id.length === 0) {
    return {
      ok: false,
      error: { service: "codemode", kind: "error", message: "codemode.describe needs an exact catalog id string" }
    };
  }
  const entry = catalog.entries.find((e) => e.id === id);
  if (!entry) {
    return {
      ok: false,
      error: {
        service: "codemode",
        kind: "error",
        message: `unknown id "${id}" — ids are exact-match; discover them with codemode.search first`
      }
    };
  }
  const base = {
    ok: true as const,
    id: entry.id,
    service: entry.service,
    kind: entry.kind,
    description: entry.description,
    ...(entry.retrievalProfile ? { retrievalProfile: entry.retrievalProfile } : {}),
    ...(entry.discoveryMode ? { discoveryMode: entry.discoveryMode } : {}),
    ...(entry.discoveryMode === "recovery-only"
      ? { qualifyingSources: qualifyingSourcesForRecoveryTarget(catalog, entry.id) }
      : {})
  };
  if (entry.kind === "skill") {
    const availableSections = sectionKeysOf(catalog, entry.id);
    if (entry.runnable === true) {
      const signature = renderSignature(entry);
      return {
        ...base,
        ...(signature ? { signature } : {}),
        inputSchema: entry.inputSchema,
        outputSchema: entry.outputSchema,
        ...(availableSections.length > 0 ? { availableSections } : {}),
        usage: `run it via codemode.skill.run(${JSON.stringify(entry.id)}, input) — input per the signature; the result is the service-call envelope ({ ok: true, data } | { ok: false, error }) with a data.calls audit of every constituent call. Read the playbook via codemode.skill.read(${JSON.stringify(entry.id)}${availableSections.length > 0 ? ", { sections: [...] }" : ""}) — run gathers the data, read carries the judgment steps.`
      };
    }
    return {
      ...base,
      ...(availableSections.length > 0 ? { availableSections } : {}),
      usage:
        availableSections.length > 0
          ? `read sections via codemode.skill.read(${JSON.stringify(entry.id)}, { sections: [...] }) — section keys in availableSections`
          : `read the whole skill via codemode.skill.read(${JSON.stringify(entry.id)})`
    };
  }
  if (entry.kind === "skill-section") {
    const hash = entry.id.indexOf("#");
    const skillId = hash === -1 ? entry.id : entry.id.slice(0, hash);
    const section = hash === -1 ? entry.id : entry.id.slice(hash + 1);
    return {
      ...base,
      skillId,
      section,
      usage: `read this section via codemode.skill.read(${JSON.stringify(skillId)}, { sections: [${JSON.stringify(section)}] })`
    };
  }
  const signature = renderSignature(entry);
  return {
    ...base,
    ...(signature ? { signature } : {}),
    inputSchema: entry.inputSchema,
    outputSchema: entry.outputSchema,
    usage:
      entry.discoveryMode === "recovery-only"
        ? "call it only inside an execute whose top-level recoveryReceipt authorizes this exact target; the receipt is one-use and comes from an earlier qualifying authority execute"
        : "call it exactly as the signature's callable line shows — the payload arrives under r.data ({ ok: true, data } | { ok: false, error }), never at the top level"
  };
}

// Module-level caches so buildCodemodeProvider can be called PER EXECUTE RUN
// (run.ts rebuilds it to get a per-run skill-read flag — see onSkillRead)
// without redoing the expensive derivations: keyed on the source objects,
// which are module-singleton JSON imports in the Worker.
const catalogViewCache = new WeakMap<Catalog, unknown>();
const compactCatalogViewCache = new WeakMap<Catalog, unknown>();
const resolvedSpecCache = new WeakMap<object, unknown>();

export function buildCodemodeProvider(
  catalog: Catalog,
  skillSource: SkillSource,
  superSpec?: unknown,
  hooks?: {
    /**
     * Fired when skill_read successfully returns skill content. ADVICE-ONLY
     * signal: run.ts uses it to append section-read advice to the truncation
     * footer — it must never affect which result bytes are kept.
     */
    onSkillRead?: (skillId: string, roles: readonly BuildAuthorityRole[]) => void;
    /**
     * Fired on every skill_run dispatch (attempted runs, whatever the
     * outcome — the span attribute counts skill.run USAGE; per-run outcomes
     * live in the skill_run log event). Observability-only, like onSkillRead.
     */
    onSkillRun?: () => void;
  },
  /**
   * Demo-only narrowing: production execute exposes codemode.search/catalog/
   * spec/describe for mid-script discovery; the public playground can disable
   * broad discovery helpers.
   */
  discovery?: boolean,
  /**
   * The skill.run wiring (design §6): the shared ops facade from buildOpsFns
   * — the SAME closures the service namespaces expose, so policy identity
   * holds by construction — plus the redaction-belt secrets. Threaded by
   * buildSandbox; when absent (a direct caller that never built ops),
   * skill_run answers with the standard not-wired error envelope, the same
   * degradation pattern as spec() without a super spec. `registry` defaults
   * to the bundled RUNNERS; overridable only so tests can pin dispatch
   * behavior against synthetic runners.
   */
  skillRun?: { facade: OpsFacade; secrets: string[]; registry?: Record<string, SkillRunner> },
  artifact?: ArtifactSandboxDeps
): SandboxProvider {
  // Derived once per catalog object, shared across runs (read-only data).
  let catalogView = catalogViewCache.get(catalog);
  if (!catalogView) {
    catalogView = {
      version: catalog.version,
      generatedAt: catalog.generatedAt,
      entries: catalog.entries.map(catalogEntryView)
    };
    catalogViewCache.set(catalog, catalogView);
  }
  let compactCatalogView = compactCatalogViewCache.get(catalog);
  if (!compactCatalogView) {
    compactCatalogView = {
      version: catalog.version,
      generatedAt: catalog.generatedAt,
      entries: catalog.entries.map((entry) => {
        const view = catalogEntryView(entry);
        const { inputSchema: _inputSchema, outputSchema: _outputSchema, ...compact } = view;
        return compact;
      })
    };
    compactCatalogViewCache.set(catalog, compactCatalogView);
  }
  const enableDiscovery = discovery ?? true;
  let artifactReads = 0;
  let artifactInfos = 0;
  let artifactReadBytes = 0;
  const artifactUnavailable = () => ({
    ok: false,
    error: {
      service: "artifact",
      kind: "error",
      message: "artifact is unavailable for this request"
    }
  });
  const artifactNotFound = () => ({
    ok: false,
    error: {
      service: "artifact",
      kind: "error",
      message: "artifact not found"
    }
  });
  const fns: Record<string, (...args: unknown[]) => Promise<unknown>> = {
    ...(enableDiscovery
      ? {
          spec: async () => {
            if (superSpec === undefined) {
              return {
                ok: false,
                error: {
                  service: "codemode",
                  kind: "error",
                  message:
                    "the unified super spec is not wired on this server instance — use codemode.catalog() / codemode.search instead"
                }
              };
            }
            // $refs resolved lazily on first use, then cached per spec object
            // (mirrors the search sandbox's lazy `__resolvedSpec ??= …`).
            if (typeof superSpec !== "object" || superSpec === null) return resolveSpecRefs(superSpec);
            let resolved = resolvedSpecCache.get(superSpec);
            if (resolved === undefined) {
              resolved = resolveSpecRefs(superSpec);
              resolvedSpecCache.set(superSpec, resolved);
            }
            return resolved;
          },

          catalog: async (arg?: unknown) => {
            if (arg !== undefined && arg !== null && (typeof arg !== "object" || Array.isArray(arg))) {
              return {
                ok: false,
                error: {
                  service: "codemode",
                  kind: "error",
                  message:
                    "codemode.catalog expects an options object: catalog({ kind?, service?, compact? })"
                }
              };
            }
            const opts = (arg ?? {}) as CatalogArg;
            const kind = opts.kind ?? undefined;
            const service = opts.service ?? undefined;
            const compact = opts.compact ?? false;
            if (kind !== undefined && !CATALOG_KINDS.includes(kind as CatalogKind)) {
              return {
                ok: false,
                error: {
                  service: "codemode",
                  kind: "error",
                  message: `unknown kind ${JSON.stringify(kind)} — valid kinds: ${CATALOG_KINDS.join(", ")}`
                }
              };
            }
            const services = catalogServices(catalog);
            if (service !== undefined && !services.includes(service as string)) {
              return {
                ok: false,
                error: {
                  service: "codemode",
                  kind: "error",
                  message: `unknown service ${JSON.stringify(service)} — valid services: ${services.join(", ")}`
                }
              };
            }
            if (typeof compact !== "boolean") {
              return {
                ok: false,
                error: {
                  service: "codemode",
                  kind: "error",
                  message: `compact must be a boolean when provided, got ${JSON.stringify(compact)}`
                }
              };
            }
            const base = (compact ? compactCatalogView : catalogView) as {
              version: number;
              generatedAt: string;
              entries: Array<{ kind: string; service: string }>;
            };
            const view = kind === undefined && service === undefined ? base : {
              version: base.version,
              generatedAt: base.generatedAt,
              entries: base.entries.filter(
                (entry) =>
                  (kind === undefined || entry.kind === kind) &&
                  (service === undefined || entry.service === service)
              )
            };
            // The cached projections are shared across execute runs. Return a
            // fresh plain-data graph so model-authored code cannot mutate one
            // run's catalog view and poison subsequent runs.
            return structuredClone(view);
          },

          search: async (arg?: unknown) => {
            const opts = (typeof arg === "string" ? { query: arg } : (arg ?? {})) as Exclude<
              SearchArg,
              string
            >;
            if (typeof opts.query !== "string" || opts.query.length === 0) {
              return {
                ok: false,
                error: {
                  service: "codemode",
                  kind: "error",
                  message: 'codemode.search needs a query: search("targeted query") or search({ query, kind?, service?, limit?, recoverFrom?, reason? })'
                }
              };
            }
            // searchCatalog uses silent exact-match filters. A near-miss like
            // service "stellardocs" or kind "operations" returns zero hits and reads as
            // "the capability is missing". Reject unknown filter values as an
            // error envelope that names the bad value and the real ones. The
            // service set comes from the catalog itself, never a hand-maintained
            // list. Explicit null means "no filter" (idiomatic
            // LLM code passes `maybeService ?? null`), same as `limit: null`.
            const kindFilter = opts.kind ?? undefined;
            const serviceFilter = opts.service ?? undefined;
            if (kindFilter !== undefined && !(SEARCH_KINDS as readonly unknown[]).includes(kindFilter)) {
              return {
                ok: false,
                error: {
                  service: "codemode",
                  kind: "error",
                  message: `codemode.search: unknown kind ${JSON.stringify(kindFilter)} — valid kinds (exact-match): ${SEARCH_KINDS.join(", ")}; skill sections are selected from a whole skill's availableSections and read by exact id`
                }
              };
            }
            const prepared = prepareCatalogSearch(catalog, serviceFilter as string | undefined);
            if (!prepared.ok) {
              return {
                ok: false,
                error: {
                  service: "codemode",
                  kind: "error",
                  message: `codemode.search: unknown service ${JSON.stringify(prepared.issue.service)} — valid services (exact-match): ${prepared.issue.validServices.join(", ")}`
                }
              };
            }
            const recoverFrom = opts.recoverFrom ?? undefined;
            if (
              recoverFrom !== undefined &&
              (!Array.isArray(recoverFrom) ||
                recoverFrom.length > 10 ||
                recoverFrom.some((id) => typeof id !== "string" || id.length === 0))
            ) {
              return {
                ok: false,
                error: {
                  service: "codemode",
                  kind: "error",
                  message: "codemode.search: recoverFrom must be an array of at most 10 non-empty exact operation ids"
                }
              };
            }
            const recoveryStage = prepared.checkRecoveryIds(recoverFrom as string[] | undefined);
            if (!recoveryStage.ok) {
              return {
                ok: false,
                error: {
                  service: "codemode",
                  kind: "error",
                  message: `codemode.search: unknown recoverFrom operation id(s) ${recoveryStage.issue.ids.map((id) => JSON.stringify(id)).join(", ")} — ids are exact-match`
                }
              };
            }
            const reason = opts.reason ?? undefined;
            if (reason !== undefined && !(RETRIEVAL_REASONS as readonly unknown[]).includes(reason)) {
              return {
                ok: false,
                error: {
                  service: "codemode",
                  kind: "error",
                  message: `codemode.search: unknown recovery reason ${JSON.stringify(reason)} — valid reasons: ${RETRIEVAL_REASONS.join(", ")}`
                }
              };
            }
            const t0 = Date.now();
            const { page, recovery } = recoveryStage.resolve({
              query: opts.query,
              kind: kindFilter as SearchKind | undefined,
              limit: typeof opts.limit === "number" ? opts.limit : undefined,
              reason: reason as RetrievalReason | undefined
            });
            const { hits, total, truncated, widerCandidates, confidence, recoveryMetadata } = page;
            logEvent("search", {
              source: "codemode",
              ...searchEventFields({
                query: opts.query,
                requestedLimit: typeof opts.limit === "number" ? opts.limit : null,
                page,
                summary: { hits, total, truncated, recovery, widerCandidates }
              }),
              responseChars: JSON.stringify({ hits, recovery, widerCandidates, confidence, recoveryMetadata }).length,
              ms: Date.now() - t0
            });
            return {
              ok: true,
              hits,
              total,
              truncated,
              recovery,
              widerCandidates,
              confidence,
              recoveryMetadata
            };
          },

          // The canonical detail-on-demand step mirrors upstream
          // codemode's search → describe → call): a describe result carries
          // everything DETAIL-shaped a search hit has and more — search hits
          // stub oversized output types (COMPACT_OUTPUT_THRESHOLD,
          // src/catalog/search.ts) and point here for the full shape, so this is
          // the one place the FULL signature is always rendered. (Ranking facts
          // — score, tier — stay on hits: they describe a hit's place in one
          // response, not the entry.) Every kind also carries a `usage` line:
          // the exact next call, so the model never has to reverse-engineer the
          // read/call pattern from prose.
          describe: async (id?: unknown) => describeCatalogEntry(catalog, id)
        }
      : {}),
    skill_read: async (name?: unknown, opts?: unknown) => {
      // Wrap the shared source for THIS call so retrieval provenance and count
      // are observable without threading a stats sink through readSkill.
      const t0 = Date.now();
      const seen: SkillRetrievalFrom[] = [];
      const instrumented: SkillSource = async (pin) => {
        const got = await skillSource(pin);
        seen.push(got.from);
        return got;
      };
      const r = await readSkill(catalog, instrumented, name, opts);
      const entry = typeof name === "string"
        ? catalog.entries.find((candidate) => candidate.id === name)
        : undefined;
      if (r.ok && entry) hooks?.onSkillRead?.(entry.id, entry.buildAuthorityRoles ?? []);
      const requestedKeys = requestedSectionKeys(name, opts);
      logSkillRead({
        id: entry?.id ?? null,
        shape: readShape(requestedKeys),
        requested: requestedKeys.length,
        retrievals: seen.length,
        // Most expensive wins: one upstream fetch is what the call actually cost.
        from: seen.includes("upstream")
          ? "upstream"
          : seen.includes("cache")
            ? "cache"
            : seen.includes("memo")
              ? "memo"
              : "none",
        ms: Date.now() - t0,
        outcome: r.ok ? "ok" : r.error.kind
      });
      return r;
    },

    // The flat dispatch behind `codemode.skill.run` (SKILL_PRELUDE wraps it
    // — nested objects can't cross the Proxy dispatch, same mechanism as
    // skill_read). All semantics live host-side in runSkill (src/skills/
    // run.ts): exact-id resolution, guard validation, the declared-ops
    // sub-facade, the host-owned call ledger, deadline, warn belts. The
    // envelope goes back through __guardEnvelope in the prelude, so
    // .data-level misuse traps behave identically to every operation call.
    skill_run: async (name?: unknown, input?: unknown) => {
      hooks?.onSkillRun?.();
      if (!skillRun) {
        return {
          ok: false,
          error: {
            service: "skills",
            kind: "error",
            message:
              "codemode.skill.run is not wired on this server instance — the ops facade was not threaded into the sandbox build; use the service operations directly"
          }
        };
      }
      return runSkill(catalog, skillRun.registry ?? RUNNERS, skillRun.facade, name, input, {
        secrets: skillRun.secrets
      });
    },

    artifact_info: async (id?: unknown) => {
      const nextInfo = artifactInfos + 1;
      const infoOrdinal = nextInfo;
      const t0 = Date.now();
      if (!artifact?.bucket || !artifact.owner) {
        artifactInfos = nextInfo;
        await logArtifactRead({
          kind: "info",
          owner: artifact?.owner,
          bytes: 0,
          ms: Date.now() - t0,
          hit: false,
          reason: "unavailable",
          readCount: infoOrdinal
        });
        return artifactUnavailable();
      }
      if (nextInfo > ARTIFACT_INFO_CAP) {
        artifactInfos = nextInfo;
        await logArtifactRead({
          kind: "info",
          owner: artifact.owner,
          bytes: 0,
          ms: Date.now() - t0,
          hit: false,
          reason: "info-cap",
          readCount: infoOrdinal
        });
        return {
          ok: false,
          error: {
            service: "artifact",
            kind: "error",
            message: `artifact info cap exceeded: max ${ARTIFACT_INFO_CAP} info calls per execute`
          }
        };
      }

      artifactInfos = nextInfo;
      try {
        const r = await artifactInfo(artifact.bucket, artifact.owner, id);
        await logArtifactRead({
          kind: "info",
          owner: artifact.owner,
          bytes: 0,
          ms: Date.now() - t0,
          hit: r.ok,
          reason: r.ok ? undefined : "not-found",
          readCount: infoOrdinal
        });
        if (!r.ok) return artifactNotFound();
        return { ok: true, data: r.artifact };
      } catch {
        await logArtifactRead({
          kind: "info",
          owner: artifact.owner,
          bytes: 0,
          ms: Date.now() - t0,
          hit: false,
          reason: "error",
          readCount: infoOrdinal
        });
        return artifactUnavailable();
      }
    },

    artifact_read: async (id?: unknown) => {
      const nextRead = artifactReads + 1;
      const readOrdinal = nextRead;
      const t0 = Date.now();
      if (!artifact?.bucket || !artifact.owner) {
        artifactReads = nextRead;
        artifact?.onReadStats?.({ count: artifactReads, bytes: artifactReadBytes });
        await logArtifactRead({
          kind: "read",
          owner: artifact?.owner,
          bytes: 0,
          ms: Date.now() - t0,
          hit: false,
          reason: "unavailable",
          readCount: readOrdinal
        });
        return artifactUnavailable();
      }
      if (nextRead > ARTIFACT_READ_CAP) {
        artifactReads = nextRead;
        artifact.onReadStats?.({ count: artifactReads, bytes: artifactReadBytes });
        await logArtifactRead({
          kind: "read",
          owner: artifact.owner,
          bytes: 0,
          ms: Date.now() - t0,
          hit: false,
          reason: "read-cap",
          readCount: readOrdinal
        });
        return {
          ok: false,
          error: {
            service: "artifact",
            kind: "error",
            message: `artifact read cap exceeded: max ${ARTIFACT_READ_CAP} reads per execute`
          }
        };
      }

      artifactReads = nextRead;
      try {
        const r = await artifactRead(artifact.bucket, artifact.owner, id);
        if (!r.ok) {
          await logArtifactRead({
            kind: "read",
            owner: artifact.owner,
            bytes: 0,
            ms: Date.now() - t0,
            hit: false,
            reason: r.error.kind === "not-found" ? "not-found" : "error",
            readCount: readOrdinal
          });
          artifact.onReadStats?.({ count: artifactReads, bytes: artifactReadBytes });
          return r.error.kind === "not-found" ? artifactNotFound() : { ok: false, error: { service: "artifact", kind: "error", message: r.error.message } };
        }
        artifactReadBytes += r.artifact.bytes;
        await logArtifactRead({
          kind: "read",
          owner: artifact.owner,
          bytes: r.artifact.bytes,
          ms: Date.now() - t0,
          hit: true,
          readCount: readOrdinal
        });
        artifact.onReadStats?.({ count: artifactReads, bytes: artifactReadBytes });
        return { ok: true, data: r.value };
      } catch {
        await logArtifactRead({
          kind: "read",
          owner: artifact.owner,
          bytes: 0,
          ms: Date.now() - t0,
          hit: false,
          reason: "error",
          readCount: readOrdinal
        });
        artifact.onReadStats?.({ count: artifactReads, bytes: artifactReadBytes });
        return artifactNotFound();
      }
    }
  };

  return {
    name: "codemode",
    prelude: `${SKILL_PRELUDE}\n${ARTIFACT_PRELUDE}`,
    fns
  };
}

/**
 * Section keys a skill_read asked for — from a `#`-qualified id or `{ sections }`.
 * Telemetry only: readSkill owns validation and rejects anything malformed, so
 * this stays permissive and never throws.
 */
function requestedSectionKeys(name: unknown, opts: unknown): string[] {
  if (typeof name === "string") {
    const hash = name.indexOf("#");
    if (hash >= 0) return [name.slice(hash + 1)];
  }
  const sections =
    opts !== null && typeof opts === "object" ? (opts as { sections?: unknown }).sections : undefined;
  return Array.isArray(sections) ? sections.filter((k): k is string => typeof k === "string") : [];
}

/** Whole skill, `##` sections, companion files, or a mix — the shape question
 *  ideas/skill-discovery-without-bundling.md needs answered. */
function readShape(keys: string[]): "whole" | "sections" | "files" | "mixed" {
  if (keys.length === 0) return "whole";
  const files = keys.filter((k) => k.startsWith("file:")).length;
  return files === keys.length ? "files" : files === 0 ? "sections" : "mixed";
}

/** The full provider set `execute` wires into the sandbox. */
export function buildSandbox(
  catalog: Catalog,
  skillSource: SkillSource,
  env: AdapterEnv,
  deps?: {
    fetchImpl?: FetchLike;
    superSpec?: unknown;
    onSkillRead?: (skillId: string, roles: readonly BuildAuthorityRole[]) => void;
    onSkillRun?: () => void;
    onOpCall?: (call: OpLedgerCall) => void;
    recovery?: RecoverySandboxDeps;
    artifact?: ArtifactSandboxDeps;
    codemodeDiscovery?: boolean;
  }
): SandboxProvider[] {
  // Runner-wiring assertion at provider build (design §5/§6): registry ↔
  // manifest id sets both ways, deep schema equality per id, declared ops ⊆
  // emitted operation ids — THROWS so the first execute fails loudly instead
  // of validating input against a schema the bundled runner doesn't expect.
  assertRunnersWired(catalog, RUNNERS);
  // Ops built ONCE, fed to BOTH the sandbox service namespaces and the
  // skill-run facade — the policy-identity-by-construction point (design §2).
  const ops = buildOpsFns(catalog, env, deps);
  return [
    ...buildProviders(catalog, env, deps, ops),
    buildCodemodeProvider(
      catalog,
      skillSource,
      deps?.superSpec,
      {
        onSkillRead: deps?.onSkillRead,
        onSkillRun: deps?.onSkillRun
      },
      deps?.codemodeDiscovery,
      { facade: ops, secrets: secretsFromEnv(env as Record<string, unknown>) },
      deps?.artifact
    )
  ];
}
