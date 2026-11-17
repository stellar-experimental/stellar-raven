/**
 * Worker-only execution runner; see ARCHITECTURE.md for the output contract.
 * @cloudflare/codemode imports cloudflare:workers. Worker paths such as
 * src/server.ts and src/demo/tools.ts can load this module; plain Node cannot.
 * Keep it outside the runtime imports of src/mcp/tools.ts.
 *
 * Each execute call gets a fresh Dynamic Worker through LOADER.
 * globalOutbound: null blocks model-code network access; the timeout is 60s.
 * The executor interface does not expose cpuMs or subRequests limits.
 * Console output and the returned value cross separate redacted boundaries.
 *
 * The final result receives truncation and reserved-marker escaping.
 * Truncation, an ok call, or an error call adds a bounded footer.
 * SOURCE BASIS marks truncation; SOURCE METADATA marks an untruncated footer.
 * Only a truncated result with an owner can receive a stored artifact.
 * Logs and errors have independent model-output caps and are not persisted.
 */
import { tracing } from "cloudflare:workers";
import { DynamicWorkerExecutor } from "@cloudflare/codemode";
import superSpecJson from "../../specs/super-spec.json";
import { getCatalog } from "../catalog/load.ts";
import { detailTargetsFromSources, recoveryCandidatesFromSources } from "../catalog/search.ts";
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
import { classifyExecuteError, withScriptHint, type ExecuteErrorName } from "./script-hints.ts";
import { put as putArtifact, type ArtifactMime } from "../artifacts/store.ts";
import { logArtifactWrite } from "../observability.ts";
import { CORROBORATING_FAMILY_IDS } from "../policy/corroboration.ts";
import type { EvidenceRecoveryHint } from "../policy/evidence-checkpoint.ts";
import type { ExactEvidenceCall } from "../policy/exact-evidence.ts";

export type ExecuteOperationSummary = {
  total: number;
  ok: number;
  /** Successful calls with positive rows, or a scalar/detail payload. */
  evidenceData?: number;
  error: number;
  softEmpty: number;
  /** Successful calls carrying any host-derived `caveat`. */
  caveats?: number;
  /** Successful calls marked `caveat: "unverified-match"` (candidate lane or semantic/corrected match mode). */
  candidateEvidence?: number;
  /** Successful calls that returned rows from a family outside the corroborating families (see src/policy/corroboration.ts). */
  uncorroboratedEvidence?: number;
  /** Successful Scout project/repository calls whose contracts can return prior-art candidates. */
  priorArtCandidates?: number;
  /** Successful candidate-lane calls with a row that is the document the query names by identifier. */
  exactEvidence?: number;
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

/** The fixed buckets a call's final status counts into; the exact status stays on the `op` event. */
export const SOURCE_STATUS_BUCKETS = ["2xx", "3xx", "4xx", "429", "5xx", "timeout", "network", "none"] as const;
export type SourceStatusBucket = (typeof SOURCE_STATUS_BUCKETS)[number];

export const SOURCE_SERVICES = ["lumenloop", "scout", "stellarDocs", "stellarOrg"] as const;
export type SourceService = (typeof SOURCE_SERVICES)[number];

/** One service's calls in a run: counts only, with fixed keys, never upstream text. */
export type SourceSummaryEntry = {
  calls: number;
  /** Upstream HTTP requests across those calls. */
  attempts: number;
  ok: number;
  error: number;
  softEmpty: number;
  finalStatus: Partial<Record<SourceStatusBucket, number>>;
};
/** Keyed by service; only services the run called appear. */
export type SourceSummary = Partial<Record<SourceService, SourceSummaryEntry>>;

export type ExecuteOutcome =
  | {
      ok: true;
      result: string;
      truncated: boolean;
      logs: string[];
      /** Compact host-observed service-call outcomes; never includes payload data. */
      operationSummary: ExecuteOperationSummary;
      /** Per-service calls, upstream requests, outcomes, and final-status buckets. */
      sourceSummary: SourceSummary;
      /** Host-owned evidence classification; never inspects model-authored payload text. */
      evidenceSummary: ExecuteEvidenceSummary;
      /** Conditional wider-pass advice derived only from successful operation ids. */
      recoveryHint?: EvidenceRecoveryHint;
      /** Candidate-lane calls whose result held the document the query names by identifier. */
      exactEvidence?: ExactEvidenceCall[];
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
      /** Bounded failure class for telemetry; never message text and never shown to the model. */
      errorName: ExecuteErrorName;
      logs: string[];
      /** Calls completed before the sandbox failed, summarized without payload data. */
      operationSummary: ExecuteOperationSummary;
      /** Per-service calls, upstream requests, outcomes, and final-status buckets. */
      sourceSummary: SourceSummary;
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

export function summarizeOperationLedger(calls: readonly OpLedgerCall[]): ExecuteOperationSummary {
  const summary: ExecuteOperationSummary = { total: calls.length, ok: 0, error: 0, softEmpty: 0 };
  let evidenceData = 0;
  let caveats = 0;
  let candidateEvidence = 0;
  let uncorroboratedEvidence = 0;
  let priorArtCandidates = 0;
  let exactEvidence = 0;
  for (const call of calls) {
    if (call.outcome === "ok") summary.ok += 1;
    else if (call.outcome === "error") summary.error += 1;
    else summary.softEmpty += 1;
    const hasEvidenceData = call.outcome === "ok" && call.hasServiceData !== false;
    if (hasEvidenceData) evidenceData += 1;
    if (call.outcome === "ok" && call.caveat) caveats += 1;
    if (hasEvidenceData && call.caveat === "unverified-match") candidateEvidence += 1;
    if (hasEvidenceData && !CORROBORATING_FAMILY_IDS.includes(call.op.split(".", 1)[0]!)) uncorroboratedEvidence += 1;
    if (hasEvidenceData && EVIDENCE_OPERATION_IDS["prior-art"].has(call.op)) priorArtCandidates += 1;
    if (call.outcome === "ok" && call.exactRows?.length) exactEvidence += 1;
  }
  if (evidenceData > 0) summary.evidenceData = evidenceData;
  if (caveats > 0) summary.caveats = caveats;
  if (candidateEvidence > 0) summary.candidateEvidence = candidateEvidence;
  if (uncorroboratedEvidence > 0) summary.uncorroboratedEvidence = uncorroboratedEvidence;
  if (priorArtCandidates > 0) summary.priorArtCandidates = priorArtCandidates;
  if (exactEvidence > 0) summary.exactEvidence = exactEvidence;
  return summary;
}

/** Bucket a ledger `finalStatus` (an exact HTTP status or `timeout`, `network`, `none`) into a fixed key. */
export function sourceStatusBucket(finalStatus: string): SourceStatusBucket {
  if (finalStatus === "timeout" || finalStatus === "network" || finalStatus === "none") return finalStatus;
  const status = Number(finalStatus);
  if (status === 429) return "429";
  if (status >= 200 && status < 300) return "2xx";
  if (status >= 300 && status < 400) return "3xx";
  if (status >= 400 && status < 500) return "4xx";
  if (status >= 500 && status < 600) return "5xx";
  return "none";
}

/** Per-service view of the run ledger: fixed service keys and fixed status buckets only. */
export function summarizeSourceLedger(calls: readonly OpLedgerCall[]): SourceSummary {
  const summary: SourceSummary = {};
  for (const call of calls) {
    const service = SOURCE_SERVICES.find((name) => name === call.op.split(".", 1)[0]);
    if (!service) continue;
    const entry = (summary[service] ??= { calls: 0, attempts: 0, ok: 0, error: 0, softEmpty: 0, finalStatus: {} });
    entry.calls += 1;
    entry.attempts += call.attempts;
    if (call.outcome === "ok") entry.ok += 1;
    else if (call.outcome === "error") entry.error += 1;
    else entry.softEmpty += 1;
    const bucket = sourceStatusBucket(call.finalStatus);
    entry.finalStatus[bucket] = (entry.finalStatus[bucket] ?? 0) + 1;
  }
  return summary;
}

/** The host-block view of the calls whose result held the document a query names by identifier. */
function exactEvidenceOfLedger(calls: readonly OpLedgerCall[]): ExactEvidenceCall[] {
  return calls
    .filter((call) => call.outcome === "ok" && call.exactRows?.length)
    .map((call) => ({
      op: call.op,
      rows: call.exactRows!.map(({ key, url }) => ({ key, ...(url ? { url } : {}) }))
    }));
}

function sourceMetadataFromOperationLedger(calls: readonly OpLedgerCall[]): SourceMetadataEntry[] {
  return calls.flatMap((call) =>
    (call.sourceMetadata ?? []).map((field) => ({ op: call.op, ...field }))
  );
}

/** Latest host observation time across ok calls; ISO strings sort chronologically. */
function latestObservedAt(calls: readonly OpLedgerCall[]): string | undefined {
  let latest: string | undefined;
  for (const call of calls) {
    if (call.outcome === "ok" && call.observedAt && (!latest || call.observedAt > latest)) latest = call.observedAt;
  }
  return latest;
}

export function evidenceRecoveryHint(
  calls: readonly OpLedgerCall[],
  summary: ExecuteOperationSummary
): EvidenceRecoveryHint | undefined {
  const alternatives = evidenceAlternativesHint(calls, summary);
  // A detail pointer makes no claim about what the run did not call, so it does not wait on the
  // unprofiled-operation rule or on the mode that guards "narrow lookups only".
  const sourceCalls = calls.filter((call) => call.outcome === "ok" && call.hasServiceData !== false);
  // A call whose rows carried no join key (a site search that returned only audit rows) is no
  // source for the edge. A call the ledger did not check, or an operation with another unchecked
  // call, is not narrowed.
  const ready = new Map<string, Set<string>>();
  const unchecked = new Set<string>();
  for (const call of sourceCalls) {
    if (call.detailReady === undefined) {
      unchecked.add(call.op);
      continue;
    }
    const targets = ready.get(call.op) ?? new Set<string>();
    for (const target of call.detailReady) targets.add(target);
    ready.set(call.op, targets);
  }
  for (const op of unchecked) ready.delete(op);
  const detail = detailTargetsFromSources(
    getCatalog(),
    [...new Set(sourceCalls.map((call) => call.op))],
    [...new Set(calls.map((call) => call.op))],
    ready
  ).map(({ id, sources: from, keys, part }) => ({ target: id, sourceOperations: from, keys, ...(part ? { part } : {}) }));
  if (detail.length === 0) return alternatives;
  if (alternatives) return { ...alternatives, detail };
  return {
    mode: "detail-only",
    sourceOperations: [...new Set(detail.flatMap((pointer) => pointer.sourceOperations))],
    candidates: [],
    detail
  };
}

function evidenceAlternativesHint(
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
    // skill_run log events the host dispatch emits (src/skills/README.md).
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
    // (ARCHITECTURE.md) — without it the sandbox run
    // is invisible in the trace waterfall between the handler span and the
    // adapter fetch spans. No-op when tracing is off/unsampled; ends on throw.
    const outcome = await tracing.enterSpan("codemode.execute", async (span) => {
      span.setAttribute("code.chars", code.length);
      // A script that fails to load (a syntax error) rejects instead of
      // returning an error. Fold it into the same outcome so it gets a hint,
      // redaction, and truncation like any other script failure.
      let loadRejected = false;
      const result = await executor.execute(code, providers).catch((e: unknown) => {
        loadRejected = true;
        return {
          result: undefined,
          error: e instanceof Error ? e.message : String(e),
          logs: [] as string[]
        };
      });
      const errorName = result.error === undefined ? undefined : classifyExecuteError(result.error, loadRejected);
      span.setAttribute("sandbox.ok", result.error === undefined);
      if (errorName !== undefined) span.setAttribute("sandbox.errorName", errorName);
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
      return { ...result, errorName };
    });
    const logs = shapeLogs(outcome.logs, secrets);
    const operationSummary = summarizeOperationLedger(opLedger);
    const sourceSummary = summarizeSourceLedger(opLedger);
    const recoveryHint = evidenceRecoveryHint(opLedger, operationSummary);
    const exactEvidence = exactEvidenceOfLedger(opLedger);
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
      const errorName = outcome.errorName ?? "other";
      // Global names come from the wired provider set, never a hard-coded list.
      // Hinting runs before redaction and truncation so those still run last.
      const hinted = withScriptHint(outcome.error, providers.map((provider) => provider.name));
      return {
        ok: false,
        error: redactSecrets(hinted, secrets),
        errorName,
        logs,
        operationSummary,
        sourceSummary,
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
    // A soft-empty-only run has no data to date or mark; its envelopes already say soft-empty.
    if (result.truncated || opLedger.some((call) => call.outcome !== "soft-empty")) {
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
        observedAt: latestObservedAt(opLedger),
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
      sourceSummary,
      evidenceSummary,
      ...(recoveryHint ? { recoveryHint } : {}),
      ...(exactEvidence.length > 0 ? { exactEvidence } : {}),
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

// Cache serialization for the experimental spec-search runner only.
// The production codemode.spec helper uses resolved-object provider RPC.
let cachedSerializedSpec: string | undefined;
function getSerializedSpec(): string {
  cachedSerializedSpec ??= serializeSpecForSandbox(superSpecJson);
  return cachedSerializedSpec;
}

/**
 * Experimental spec-search runner for explicit evaluation callers.
 * Production search uses host-ranked catalog queries under ADR-0001.
 * This runner injects the serialized spec into a networkless Dynamic Worker
 * with no service providers. It applies spec-sandbox output shaping and drops
 * console logs. It is not registered as a production MCP tool.
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
