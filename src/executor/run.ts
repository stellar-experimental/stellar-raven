/**
 * Execute runner — wires @cloudflare/codemode's DynamicWorkerExecutor
 * (research/codemode.md §2) to the sandbox surface from providers.ts.
 *
 * WORKER-ONLY MODULE: `@cloudflare/codemode`'s main entry imports
 * `cloudflare:workers`, so this file must only be imported from src/server.ts
 * (never from src/mcp/tools.ts, which unit tests load under plain Node).
 * The import works fine inside the Worker — verified against 0.4.2 — so we
 * use the shipped executor rather than a hand-rolled loader: it already does
 * module synthesis, console capture, per-namespace Proxy dispatch, JSON+
 * binary codec, eager isolate disposal, and `globalOutbound: null`.
 *
 * Sandbox contract per call:
 *  - fresh isolate via env.LOADER.load() (one-shot; billing note PLAN §1)
 *  - globalOutbound: null → fetch()/connect() throw (secrets stay host-side)
 *  - 60s wall-clock timeout inside the sandbox
 *  - result = the value returned by the model's async arrow function
 *  - console.* buffered and returned as logs
 *
 * Output hygiene (PLAN §4): per-call results are already redacted in the
 * providers; the FINAL result + logs are redacted again and truncated to
 * ~6k tokens with an actionable footer before crossing the tool boundary.
 * Known limitation: codemode's executor doesn't expose Worker `limits`
 * ({cpuMs, subRequests}) — we rely on its timeout + plan defaults.
 */
import { tracing } from "cloudflare:workers";
import { DynamicWorkerExecutor } from "@cloudflare/codemode";
import superSpecJson from "../../specs/super-spec.json";
import { getCatalog } from "../catalog/load.ts";
import { recoveryCandidatesFromSources } from "../catalog/search.ts";
import type { BuildAuthorityRole, Catalog } from "../catalog/types.ts";
import { buildSandbox, type ArtifactReadStats, type OpLedgerCall, type SandboxProvider } from "./providers.ts";
import {
  createSpecSandboxCode,
  sandboxResponseText,
  serializeSpecForSandbox
} from "./spec-sandbox.ts";
import { createSkillSource } from "../skills/source.ts";
import { redactSecrets, secretsFromEnv } from "../policy/redact.ts";
import { truncateForModel, modelBoundaryMaxTokensFromEnv } from "../policy/truncate.ts";
import {
  buildSourceBasisManifest,
  escapeSourceManifestMarkerCollisions,
  sanitizeCanonicalUrls,
  sourceBasisShapeFromTruncation,
  type BuildSourceBasisManifestInput,
  type SourceBasisArtifact,
  type SourceMetadataEntry
} from "../policy/source-basis.ts";
import { shapeLogs } from "./shape-logs.ts";
import { put as putArtifact, type ArtifactMime } from "../artifacts/store.ts";
import { logArtifactWrite } from "../observability.ts";
import type { EvidenceRecoveryHint } from "../policy/evidence-checkpoint.ts";

export type ExecuteOperationSummary = {
  total: number;
  ok: number;
  /** Successful calls with positive rows, or a scalar/detail payload. */
  evidenceData?: number;
  error: number;
  softEmpty: number;
  /** Successful calls whose operation contract returns semantic/directory/research candidates. */
  candidateEvidence?: number;
  /** Successful Scout project/repository calls whose contracts can return prior-art candidates. */
  priorArtCandidates?: number;
};

export type ExecuteEvidenceSummary = {
  kind: "service-data" | "service-inconclusive" | "skill-content" | "artifact-data" | "none";
  skillRead: boolean;
  /** Exact playbooks with a declared design-stage build-authority role. */
  buildAuthoritySkillIds?: string[];
  buildAuthorityRoles?: BuildAuthorityRole[];
  skillRuns: number;
  artifactReads: number;
};

export type ExecuteOutcome =
  | {
      ok: true;
      result: string;
      truncated: boolean;
      logs: string[];
      /** Compact host-observed service-call outcomes; never includes payload data. */
      operationSummary: ExecuteOperationSummary;
      /** Host-owned evidence classification; never inspects model-authored payload text. */
      evidenceSummary: ExecuteEvidenceSummary;
      /** Conditional wider-pass advice derived only from successful operation ids. */
      recoveryHint?: EvidenceRecoveryHint;
      resultOriginalChars?: number;
      resultReturnedChars?: number;
      resultMaxTokens?: number;
      resultMaxChars?: number;
      resultApproxOriginalTokens?: number;
      sourceBasis?: BuildSourceBasisManifestInput;
      artifactReadBytes?: number;
    }
  | {
      ok: false;
      error: string;
      logs: string[];
      /** Calls completed before the sandbox failed, summarized without payload data. */
      operationSummary: ExecuteOperationSummary;
      /** Host-owned evidence classification; never inspects model-authored payload text. */
      evidenceSummary: ExecuteEvidenceSummary;
      artifactReadBytes?: number;
    };

export type ExecuteCallContext = {
  /** Auth-bound artifact owner: OAuth subject or fixed loopback-dev owner. Undefined disables artifacts. */
  artifactOwner?: string;
  requestId?: string;
  rayId?: string;
};

export type ExecuteRunner = (code: string, context?: ExecuteCallContext) => Promise<ExecuteOutcome>;
export type ExecuteRunnerOptions = {
  /**
   * Enable codemode.search/catalog/spec/describe. Production MCP and the
   * playground enable the full discovery surface; focused tests may disable it.
   */
  codemodeDiscovery?: boolean;
  /**
   * Host-side model boundary cap for final execute results. Defaults from
   * env/config; never controlled by model-authored sandbox code.
   */
  modelBoundaryMaxTokens?: number;
};

const EVIDENCE_OPERATION_IDS = {
  candidate: new Set([
    "lumenloop.search_directory",
    "lumenloop.search_content_semantic",
    "lumenloop.find_av_passages",
    "lumenloop.find_similar_scf_submissions",
    "scout.searchProjects",
    "scout.searchResearch"
  ]),
  "prior-art": new Set(["scout.searchProjects", "scout.searchRepos", "scout.explainRepo"])
} as const;

export function assertExecutorEvidenceOperationIds(catalog: Catalog): void {
  const entriesById = new Map(catalog.entries.map((entry) => [entry.id, entry]));
  for (const [evidenceClass, ids] of Object.entries(EVIDENCE_OPERATION_IDS)) {
    for (const id of ids) {
      const entry = entriesById.get(id);
      if (!entry) {
        throw new Error(
          `Executor ${evidenceClass} evidence operation "${id}" is missing from the exposed catalog`
        );
      }
      if (entry.kind !== "operation") {
        throw new Error(
          `Executor ${evidenceClass} evidence operation "${id}" must resolve to an exposed operation, found kind "${entry.kind}"`
        );
      }
    }
  }
}

const BROAD_RETRIEVAL_LANES = new Set(["semantic", "research", "av", "corpus"]);

function summarizeOperationLedger(calls: readonly OpLedgerCall[]): ExecuteOperationSummary {
  const summary: ExecuteOperationSummary = { total: calls.length, ok: 0, error: 0, softEmpty: 0 };
  let evidenceData = 0;
  let candidateEvidence = 0;
  let priorArtCandidates = 0;
  for (const call of calls) {
    if (call.outcome === "ok") summary.ok += 1;
    else if (call.outcome === "error") summary.error += 1;
    else summary.softEmpty += 1;
    const hasEvidenceData = call.outcome === "ok" && call.hasServiceData !== false;
    if (hasEvidenceData) evidenceData += 1;
    if (hasEvidenceData && EVIDENCE_OPERATION_IDS.candidate.has(call.op)) candidateEvidence += 1;
    if (hasEvidenceData && EVIDENCE_OPERATION_IDS["prior-art"].has(call.op)) priorArtCandidates += 1;
  }
  if (evidenceData > 0) summary.evidenceData = evidenceData;
  if (candidateEvidence > 0) summary.candidateEvidence = candidateEvidence;
  if (priorArtCandidates > 0) summary.priorArtCandidates = priorArtCandidates;
  return summary;
}

function sourceMetadataFromOperationLedger(calls: readonly OpLedgerCall[]): SourceMetadataEntry[] {
  return calls.flatMap((call) =>
    (call.sourceMetadata ?? []).map((field) => ({ op: call.op, ...field }))
  );
}

function evidenceRecoveryHint(
  calls: readonly OpLedgerCall[],
  summary: ExecuteOperationSummary
): EvidenceRecoveryHint | undefined {
  // Empty successful collections are inconclusive evidence, but their exact
  // operation ids still carry the catalog recovery profile.
  if (summary.ok === 0) return undefined;
  const calledIds = [...new Set(calls.map((call) => call.op))];
  const successfulIds = [...new Set(calls.filter((call) => call.outcome === "ok").map((call) => call.op))];
  const catalog = getCatalog();
  const byId = new Map(catalog.entries.map((entry) => [entry.id, entry]));
  // Candidate-evidence classification controls attribution guidance, not
  // retrieval breadth. Directory candidates remain operation-scoped and may
  // still need an exact wider recovery edge; the profile lane decides whether
  // a genuinely broad semantic/research/A/V/corpus pass already ran.
  // An unprofiled successful operation may itself be a wider/candidate lane.
  // Stay silent instead of making the stronger (and potentially false) claim
  // that the host observed narrow lookups only.
  if (successfulIds.some((id) => !byId.get(id)?.retrievalProfile)) return undefined;
  const broadIds = successfulIds.filter((id) => {
    const lane = byId.get(id)?.retrievalProfile?.lane;
    return lane !== undefined && BROAD_RETRIEVAL_LANES.has(lane);
  });
  if (broadIds.length > 0) {
    const candidates = recoveryCandidatesFromSources(catalog, broadIds, calledIds, 3);
    if (candidates.length === 0) return undefined;
    return {
      mode: "conditional-alternatives",
      sourceOperations: broadIds,
      candidates: candidates.map(({ id, relation, reasons }) => ({ id, relation, reasons }))
    };
  }

  const narrowIds = successfulIds.filter((id) => byId.get(id)?.retrievalProfile?.emptyScope === "operation");
  if (narrowIds.length === 0) return undefined;
  const candidates = recoveryCandidatesFromSources(catalog, narrowIds, calledIds, 3);
  if (candidates.length === 0) return undefined;
  return {
    mode: "narrow-only",
    sourceOperations: narrowIds,
    candidates: candidates.map(({ id, relation, reasons }) => ({ id, relation, reasons }))
  };
}

export type SpecSearchOutcome =
  | { ok: true; result: string }
  | { ok: false; error: string };

export type SpecSearchRunner = (code: string) => Promise<SpecSearchOutcome>;

const EXECUTE_TIMEOUT_MS = 60_000;

/**
 * One skill source per isolate. Skill bodies are fetched from upstream at the
 * commit pinned in ecosystem-skills/MANIFEST.json rather than shipped in the
 * bundle; the source's in-isolate memo (in front of the colo cache) is what
 * makes repeated reads within a run, and across runs on a warm isolate, free.
 * Host-side only — the sandbox itself still has no network.
 */
const skillSource = createSkillSource();

function serializedResult(value: unknown): { body: string; mime: ArtifactMime } {
  if (typeof value === "string") return { body: value, mime: "text/plain; charset=utf-8" };
  if (value === undefined) return { body: "undefined", mime: "application/x.raven.undefined" };
  try {
    return { body: JSON.stringify(value), mime: "application/json" };
  } catch (e) {
    return {
      body: `[unserializable result: ${e instanceof Error ? e.message : String(e)}]`,
      mime: "text/plain; charset=utf-8"
    };
  }
}

function collectCanonicalUrlCandidates(value: unknown): string[] {
  const out: string[] = [];
  const urls = new Set<string>();
  // Best visit so far per object: shallowest depth seen at all, and shallowest
  // seen on a URL-keyed path. A revisit is skipped only when a prior visit
  // dominates it, so a shallow alias reached after a depth-cut traversal (or a
  // URL-keyed alias after a non-URL one) still descends. Depths only shrink,
  // so each node is visited at most ~2× the depth cap. Raw candidates are
  // deduped here so repeats cannot exhaust the 20-URL traversal bound;
  // sanitizeCanonicalUrls still dedupes after normalization before its 5-URL cap.
  const seen = new Map<object, { anyDepth: number; urlDepth: number }>();
  const visit = (v: unknown, depth: number, urlLeaf = true) => {
    if (out.length >= 20 || depth > 5) return;
    if (typeof v === "string") {
      if (urlLeaf && v.includes("https://") && !urls.has(v)) {
        urls.add(v);
        out.push(v);
      }
      return;
    }
    if (v === null || typeof v !== "object") return;
    const prev = seen.get(v);
    if (prev && (urlLeaf ? prev.urlDepth : prev.anyDepth) <= depth) return;
    seen.set(v, {
      anyDepth: Math.min(prev?.anyDepth ?? Infinity, depth),
      urlDepth: urlLeaf ? Math.min(prev?.urlDepth ?? Infinity, depth) : (prev?.urlDepth ?? Infinity)
    });
    if (Array.isArray(v)) {
      for (const item of v.slice(0, 50)) visit(item, depth + 1, urlLeaf);
      return;
    }
    for (const [key, item] of Object.entries(v as Record<string, unknown>)) {
      if (out.length >= 20) break;
      visit(
        item,
        depth + 1,
        /url|uri|link|website|repo/i.test(key) &&
          !/logo|avatar|icon|image|thumb|banner|(?<!re)store/i.test(key)
      );
    }
  };
  visit(value, 0);
  return out;
}

/**
 * Mirror @cloudflare/codemode's withGlobalsHint (dist/index.js): a sandbox
 * `ReferenceError` usually means the model invented a global — append the real
 * sandbox globals so the retry is informed instead of another guess. The
 * global names are derived from the wired provider set (never hard-coded) so
 * they cannot drift from what the sandbox actually exposes. Applied before
 * redaction/truncation so those still run last. Deviates from upstream's
 * wording by one clause — "and standard JavaScript" — because
 * EXECUTE_DESCRIPTION's globals rule includes it; without the clause the two
 * surfaces contradict on whether builtins (console, Promise, Math…) exist.
 */
function withGlobalsHint(message: string, providers: SandboxProvider[]): string {
  if (!/\bis not defined\b/.test(message)) return message;
  return `${message} (the only globals available in the sandbox are: ${providers
    .map((p) => p.name)
    .join(", ")}, and standard JavaScript)`;
}

export function createExecuteRunner(env: Env, options: ExecuteRunnerOptions = {}): ExecuteRunner {
  const catalog = getCatalog();
  assertExecutorEvidenceOperationIds(catalog);
  const executor = new DynamicWorkerExecutor({
    loader: env.LOADER,
    globalOutbound: null, // default, pinned explicitly: sandbox has NO network
    timeout: EXECUTE_TIMEOUT_MS
  });
  const secrets = secretsFromEnv(env as unknown as Record<string, unknown>);
  const modelBoundaryMaxTokens =
    options.modelBoundaryMaxTokens ?? modelBoundaryMaxTokensFromEnv(env as unknown as Record<string, unknown>);

  return async (code: string, context: ExecuteCallContext = {}): Promise<ExecuteOutcome> => {
    // Providers are rebuilt per run so the skill-read flag is run-scoped
    // (never leaks across concurrent executes); the expensive derivations
    // (catalog view, resolved spec) are cached module-level in providers.ts.
    // The flag is ADVICE-ONLY: it may change the truncation footer's wording,
    // never the token budget or which result bytes are kept.
    let skillRead = false;
    const buildAuthoritySkillIds = new Set<string>();
    const buildAuthorityRoles = new Set<BuildAuthorityRole>();
    // Count of skill.run dispatches this run (attempted, whatever the
    // outcome) — stamped on the codemode.execute span below so runnable-skill
    // usage is visible in the trace waterfall; per-run outcomes live in the
    // skill_run log events the host dispatch emits (design §8).
    let skillRuns = 0;
    const opLedger: OpLedgerCall[] = [];
    let artifactReadStats: ArtifactReadStats = { count: 0, bytes: 0 };
    const providers = buildSandbox(catalog, skillSource, env, {
      superSpec: superSpecJson,
      onSkillRead: (skillId, roles) => {
        skillRead = true;
        if (roles.length > 0) {
          buildAuthoritySkillIds.add(skillId);
          for (const role of roles) buildAuthorityRoles.add(role);
        }
      },
      onSkillRun: () => {
        skillRuns += 1;
      },
      onOpCall: (call) => {
        opLedger.push(call);
      },
      artifact: {
        bucket: env.ARTIFACTS,
        owner: context.artifactOwner,
        onReadStats: (stats) => {
          artifactReadStats = stats;
        }
      },
      codemodeDiscovery: options.codemodeDiscovery
    });
    // Custom span because the Worker Loader isolate is NOT auto-instrumented
    // (research/observability-cloudflare.md §2) — without it the sandbox run
    // is invisible in the trace waterfall between the handler span and the
    // adapter fetch spans. No-op when tracing is off/unsampled; ends on throw.
    const outcome = await tracing.enterSpan("codemode.execute", async (span) => {
      span.setAttribute("code.chars", code.length);
      const result = await executor.execute(code, providers);
      span.setAttribute("sandbox.ok", result.error === undefined);
      span.setAttribute("sandbox.logLines", result.logs?.length ?? 0);
      span.setAttribute("sandbox.skillRead", skillRead);
      span.setAttribute("sandbox.skillRun", skillRuns);
      span.setAttribute("sandbox.artifactReadCount", artifactReadStats.count);
      span.setAttribute("sandbox.artifactReadBytes", artifactReadStats.bytes);
      const spanOperationSummary = summarizeOperationLedger(opLedger);
      span.setAttribute("sandbox.operationTotal", spanOperationSummary.total);
      span.setAttribute("sandbox.operationOk", spanOperationSummary.ok);
      span.setAttribute("sandbox.operationError", spanOperationSummary.error);
      span.setAttribute("sandbox.operationSoftEmpty", spanOperationSummary.softEmpty);
      return result;
    });
    const logs = shapeLogs(outcome.logs, secrets);
    const operationSummary = summarizeOperationLedger(opLedger);
    const recoveryHint = evidenceRecoveryHint(opLedger, operationSummary);
    const evidenceSummary: ExecuteEvidenceSummary = {
      kind:
        operationSummary.evidenceData !== undefined
          ? "service-data"
          : operationSummary.total > 0
            ? "service-inconclusive"
            : artifactReadStats.count > 0
              ? "artifact-data"
              : skillRead
                ? "skill-content"
                : "none",
      skillRead,
      buildAuthoritySkillIds: [...buildAuthoritySkillIds].sort(),
      buildAuthorityRoles: [...buildAuthorityRoles].sort(),
      skillRuns,
      artifactReads: artifactReadStats.count
    };
    if (outcome.error !== undefined) {
      const hinted = withGlobalsHint(outcome.error, providers);
      return {
        ok: false,
        error: redactSecrets(hinted, secrets),
        logs,
        operationSummary,
        evidenceSummary,
        artifactReadBytes: artifactReadStats.bytes
      };
    }
    const redactedResult = redactSecrets(outcome.result, secrets);
    const result = truncateForModel(redactedResult, modelBoundaryMaxTokens, {
      skillSectionAdvice: skillRead
    });
    let text = escapeSourceManifestMarkerCollisions(result.text);
    let sourceBasis: BuildSourceBasisManifestInput | undefined;
    const sourceMetadata = sourceMetadataFromOperationLedger(opLedger);
    if (result.truncated || sourceMetadata.length > 0) {
      let artifact: SourceBasisArtifact = { state: "absent", reason: "unavailable" };
      if (result.truncated) {
        const serialized = serializedResult(redactedResult);
        const writeStart = Date.now();
        if (context.artifactOwner) {
          try {
            const written = await putArtifact(env.ARTIFACTS, context.artifactOwner, {
              body: serialized.body,
              mime: serialized.mime,
              requestId: context.requestId,
              rayId: context.rayId,
              capTokens: result.maxTokens,
              originalChars: result.originalChars,
              opLedger: opLedger.map((call) => ({
                op: call.op,
                status: call.outcome,
                ms: call.ms
              })),
              catalogGeneratedAt: catalog.generatedAt
            });
            if (written.ok) {
              artifact = {
                state: "available",
                id: written.artifact.id,
                sha256: written.artifact.sha256,
                bytes: written.artifact.bytes,
                expiresAt: written.artifact.expiresAt
              };
              await logArtifactWrite({
                owner: context.artifactOwner,
                bytes: written.artifact.bytes,
                ms: Date.now() - writeStart,
                ok: true
              });
            } else {
              artifact = { state: "skipped", reason: written.skipped };
              await logArtifactWrite({
                owner: context.artifactOwner,
                bytes: written.bytes,
                ms: Date.now() - writeStart,
                ok: false,
                skipped: written.skipped
              });
            }
          } catch (e) {
            await logArtifactWrite({
              owner: context.artifactOwner,
              bytes: serialized.body.length,
              ms: Date.now() - writeStart,
              ok: false,
              errorName: e instanceof Error ? e.name : "error"
            });
            artifact = { state: "absent", reason: "unavailable" };
          }
        } else {
          await logArtifactWrite({
            bytes: serialized.body.length,
            ms: Date.now() - writeStart,
            ok: false,
            skipped: "unavailable"
          });
        }
      } else {
        artifact = { state: "absent", reason: "not-truncated" };
      }
      sourceBasis = {
        shape: sourceBasisShapeFromTruncation(redactedResult, result),
        calls: opLedger,
        sourceMetadata,
        canonicalUrls: sanitizeCanonicalUrls(collectCanonicalUrlCandidates(redactedResult)),
        artifact,
        skillSectionAdvice: skillRead,
        truncated: result.truncated
      };
      const visibleResult = result.truncated
        ? escapeSourceManifestMarkerCollisions(result.text.slice(0, result.maxChars))
        : text;
      text = `${visibleResult}\n${buildSourceBasisManifest(sourceBasis)}`;
    }
    return {
      ok: true,
      result: text,
      truncated: result.truncated,
      logs,
      operationSummary,
      evidenceSummary,
      ...(recoveryHint ? { recoveryHint } : {}),
      resultOriginalChars: result.originalChars,
      resultReturnedChars: text.length,
      resultMaxTokens: result.maxTokens,
      resultMaxChars: result.maxChars,
      resultApproxOriginalTokens: result.approxOriginalTokens,
      sourceBasis,
      artifactReadBytes: artifactReadStats.bytes
    };
  };
}

// Serialized once per isolate — each search call injects ~180KB of spec JSON
// into its sandbox source (upstream re-stringifies per call; identical bytes).
let cachedSerializedSpec: string | undefined;
function getSerializedSpec(): string {
  cachedSerializedSpec ??= serializeSpecForSandbox(superSpecJson);
  return cachedSerializedSpec;
}

/**
 * The code-shaped spec-search runner — NOT registered as a top-level tool
 * since ADR-0001 (research/decisions/0001-search-tool-shape.md): the shipped
 * `search` is the host-side ranked query, and discovery-in-code lives inside
 * `execute` (codemode.spec()/search/catalog). Kept so a code-shaped tool can
 * be re-exposed for future A/Bs (eval/qa/run-qa.mjs --search-tool).
 *
 * Mirrors openApiMcpServer's search tool:
 * LLM code wrapped by createSpecSandboxCode (codemode.spec() over the super
 * spec, in-sandbox truncation), executed in a fresh Dynamic Worker with NO
 * providers (search is read-only over spec data; no service calls, no
 * secrets), result passed through sandboxResponseText host-side. Logs are
 * deliberately dropped — upstream's search ignores them too.
 */
export function createSpecSearchRunner(env: Env): SpecSearchRunner {
  const executor = new DynamicWorkerExecutor({
    loader: env.LOADER,
    globalOutbound: null, // no network in the search sandbox either
    timeout: EXECUTE_TIMEOUT_MS
  });

  return async (code: string): Promise<SpecSearchOutcome> => {
    const outcome = await tracing.enterSpan("codemode.spec_search", async (span) => {
      span.setAttribute("code.chars", code.length);
      const result = await executor.execute(createSpecSandboxCode(code, getSerializedSpec()), []);
      span.setAttribute("sandbox.ok", result.error === undefined);
      return result;
    });
    if (outcome.error !== undefined) {
      return { ok: false, error: outcome.error };
    }
    return { ok: true, result: sandboxResponseText(outcome.result) };
  };
}
