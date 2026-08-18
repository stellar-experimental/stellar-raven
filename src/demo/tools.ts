/**
 * AI SDK tool defs for the /playground page — `search` + `execute` wrapping
 * the SAME in-process internals the MCP handlers use (design Decision 2:
 * searchCatalogPage/getCatalog and createExecuteRunner directly, no HTTP
 * round-trip to /mcp), with the exported production descriptions/input
 * schemas. The search description gets one demo evidence appendix; callable
 * schemas remain the production contract.
 *
 * Behavior mirrors src/mcp/tools.ts registerTools handler-for-handler —
 * unknown-service validation, nextSteps copy, truncateForModel /
 * truncateLogsForModel shaping, logEvent fields — with bounded demo deltas
 * (design Decision 5, all in-request enforced here because stepCountIs alone
 * does not cap tool calls within one model step):
 *  - search `limit` clamped to DEMO_CAPS.maxSearchLimit,
 *  - ≤ DEMO_CAPS.maxSearchCallsPerTurn catalog searches per shared turn
 *    budget (structured refusal as data, never a throw),
 *  - ≤ DEMO_CAPS.maxExecuteCallsPerTurn sandbox runs per shared turn
 *    budget (structured refusal as data, never a throw),
 *  - execute code length capped at DEMO_CAPS.maxExecuteCodeChars.
 * Every call emits tool-start/tool-result trace frames via opts.emit.
 *
 * WORKER-ONLY MODULE: imports src/executor/run.ts (→ cloudflare:workers);
 * only the demo chat handler may import it, never plain-Node test graphs.
 */
import { tool } from "ai";
import { z } from "zod";
import { parseExpressionAt } from "acorn";
import {
  searchCatalogPage,
  catalogServices,
  recoveryCandidates,
  type RecoveryCandidate,
  type SearchHit,
  type SearchPage,
  type WiderCandidate
} from "../catalog/search.ts";
import type { RetrievalReason } from "../catalog/types.ts";
import { getCatalog } from "../catalog/load.ts";
import {
  SEARCH_DESCRIPTION,
  EXECUTE_DESCRIPTION,
  rankedSearchInputSchema,
  executeInputSchema
} from "../mcp/tools.ts";
import {
  createExecuteRunner,
  type ExecuteEvidenceSummary,
  type ExecuteOperationSummary,
  type ExecuteOutcome,
  type ExecuteRunner
} from "../executor/run.ts";
import { logEvent } from "../observability.ts";
import { searchEventFields } from "../observability-search.ts";
import {
  modelBoundaryMaxTokensFromEnv,
  truncateForModel,
  truncateLogsForModel
} from "../policy/truncate.ts";
import { projectSourceBasisTelemetry } from "../policy/source-basis.ts";
import {
  candidateEvidenceBlock,
  evidenceCheckpointBlock,
  type EvidenceRecoveryHint
} from "../policy/evidence-checkpoint.ts";
import { DEMO_CAPS, createDemoToolBudget, type DemoToolBudget } from "./budget.ts";
import type { DemoFrame } from "./frames.ts";

// One sandbox executor per isolate, exactly like src/server.ts — the runner
// only closes over env bindings (stable across requests in an isolate).
let cachedRunner: ExecuteRunner | undefined;
let cachedRunnerMaxTokens: number | undefined;
function getRunner(env: Env): ExecuteRunner {
  const modelBoundaryMaxTokens = modelBoundaryMaxTokensFromEnv(env as unknown as Record<string, unknown>);
  if (!cachedRunner || cachedRunnerMaxTokens !== modelBoundaryMaxTokens) {
    cachedRunner = createExecuteRunner(env, {
      // Same in-execute discovery surface as the main MCP. Demo cost remains
      // bounded by the outer execute-call and step caps.
      codemodeDiscovery: true,
      modelBoundaryMaxTokens
    });
    cachedRunnerMaxTokens = modelBoundaryMaxTokens;
  }
  return cachedRunner;
}

type SearchStructured = {
  hits: SearchHit[];
  total: number;
  truncated: boolean;
  recovery: RecoveryCandidate[];
  widerCandidates: WiderCandidate[];
  nextSteps: string;
};

const SOURCE_BASIS_CALL_LIMIT = 8;

export function evidenceOutcome(
  outcome: {
    ok: boolean;
    operationSummary: ExecuteOperationSummary;
    evidenceSummary: ExecuteEvidenceSummary;
  }
):
  | "execute-error"
  | "no-operations"
  | "data"
  | "empty-success"
  | "soft-empty"
  | "error"
  | "mixed" {
  if (!outcome.ok) return "execute-error";
  const summary = outcome.operationSummary;
  if (summary.total === 0) return "no-operations";
  const problemCount = summary.error + summary.softEmpty;
  if (summary.ok > 0 && problemCount > 0) return "mixed";
  if (summary.ok > 0 && outcome.evidenceSummary?.kind === "service-inconclusive") {
    return "empty-success";
  }
  if (summary.ok > 0) return "data";
  if (summary.error > 0 && summary.softEmpty > 0) return "mixed";
  return summary.error > 0 ? "error" : "soft-empty";
}

function hostEvidenceSummary(
  operations: ExecuteOperationSummary,
  evidence: ExecuteEvidenceSummary,
  truncated: boolean
): string {
  return [
    "--- host evidence summary ---",
    `evidence: ${evidence.kind}`,
    `service operations: total=${operations.total} ok=${operations.ok} error=${operations.error} soft-empty=${operations.softEmpty}`,
    `skill content read: ${evidence.skillRead ? "yes" : "no"}; artifact reads: ${evidence.artifactReads}`,
    `model boundary: ${truncated ? "truncated; inspect the source-basis manifest above" : "complete"}`
  ].join("\n");
}

// Demo deltas over the production page shape: a smaller default page and
// clipped per-hit prose. Full pages (~16-19KB of hits) blow up the follow-up
// call's prefill on a reasoning model — live tool turns routinely stalled past
// the whole-turn timeout before these caps. Signature clipping preserves the
// final callable line (renderSignature emits it last) and clips the middle
// output-type block within the same total budget.
const DEMO_SEARCH_DEFAULT_LIMIT = 5;
const DEMO_HIT_DESCRIPTION_CHARS = 220;
const DEMO_HIT_SIGNATURE_CHARS = 400;

function clip(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max)}… [clipped for the demo]`;
}

function clipSignature(text: string, max: number): string {
  if (text.length <= max) return text;
  const lastNewline = text.lastIndexOf("\n");
  if (lastNewline === -1) return clip(text, max);
  const callableLine = text.slice(lastNewline + 1);
  const marker = "\n… [middle clipped for the demo]\n";
  const headChars = max - callableLine.length - marker.length;
  if (headChars <= 0) return callableLine;
  return `${text.slice(0, headChars)}${marker}${callableLine}`;
}

function compactHitForDemo(hit: SearchHit): SearchHit {
  return {
    ...hit,
    description: clip(hit.description, DEMO_HIT_DESCRIPTION_CHARS),
    ...(hit.signature !== undefined
      ? { signature: clipSignature(hit.signature, DEMO_HIT_SIGNATURE_CHARS) }
      : {})
  };
}

function compactWiderCandidateForDemo(candidate: WiderCandidate): WiderCandidate {
  return {
    ...candidate,
    description: clip(candidate.description, DEMO_HIT_DESCRIPTION_CHARS),
    ...(candidate.signature !== undefined
      ? { signature: clipSignature(candidate.signature, DEMO_HIT_SIGNATURE_CHARS) }
      : {})
  };
}

function compactRecoveryCandidateForDemo(candidate: RecoveryCandidate): RecoveryCandidate {
  return {
    ...candidate,
    description: clip(candidate.description, DEMO_HIT_DESCRIPTION_CHARS),
    ...(candidate.signature !== undefined
      ? { signature: clipSignature(candidate.signature, DEMO_HIT_SIGNATURE_CHARS) }
      : {})
  };
}

type AstNode = {
  type?: string;
  callee?: AstNode;
  object?: AstNode;
  property?: AstNode;
  computed?: boolean;
  name?: string;
  value?: unknown;
  arguments?: AstNode[];
  [key: string]: unknown;
};

function isIdentifier(node: AstNode | undefined, name: string): boolean {
  return node?.type === "Identifier" && node.name === name;
}

function isPromiseAllObjectCall(node: AstNode): boolean {
  const callee = node.callee;
  if (node.type !== "CallExpression" || callee?.type !== "MemberExpression") return false;
  if (!isIdentifier(callee.object, "Promise")) return false;
  const property = callee.property;
  const allProperty =
    callee.computed === true
      ? property?.type === "Literal" && property.value === "all"
      : isIdentifier(property, "all");
  return allProperty && node.arguments?.[0]?.type === "ObjectExpression";
}

function walkAst(node: AstNode, visit: (node: AstNode) => boolean): boolean {
  if (visit(node)) return true;
  for (const [key, value] of Object.entries(node)) {
    if (key === "parent") continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === "object" && walkAst(item as AstNode, visit)) return true;
      }
    } else if (value && typeof value === "object" && walkAst(value as AstNode, visit)) {
      return true;
    }
  }
  return false;
}

function demoExecutePreflightError(code: string): string | null {
  try {
    const ast = parseExpressionAt(code, 0, { ecmaVersion: "latest" }) as unknown as AstNode;
    if (!walkAst(ast, isPromiseAllObjectCall)) return null;
    return "invalid demo execute script: `Promise.all({ ... })` is not valid JavaScript fanout because `Promise.all` requires an array/iterable. Rewrite as `const [a, b] = await Promise.all([callA, callB])`, then build a named result object from those values.";
  } catch {
    // Let the real sandbox return syntax/runtime diagnostics; this preflight
    // only catches a known-good parse with a known-bad Promise.all shape.
    return null;
  }
}

export function buildDemoTools(opts: {
  env: Env;
  emit: (f: DemoFrame) => void;
  budget?: DemoToolBudget;
  runExecute?: ExecuteRunner;
}): {
  tools: Record<string, unknown>;
  budgetReport: () => DemoToolBudget;
} {
  const { env, emit } = opts;
  const modelBoundaryMaxTokens = modelBoundaryMaxTokensFromEnv(env as unknown as Record<string, unknown>);
  // This object is created once by chat.ts and shared across fallback model
  // attempts. If callers omit it, a standalone turn budget is created for
  // direct smoke tests.
  const budget = opts.budget ?? createDemoToolBudget();

  const search = tool({
    description: `${SEARCH_DESCRIPTION}\n\nPlayground evidence rule: search hits are navigation metadata and callable signatures, not sufficient factual evidence for the answer. Use execute to obtain factual service or skill results.`,
    inputSchema: z.object(rankedSearchInputSchema),
    execute: async (args) => {
      const id = crypto.randomUUID();
      emit({ type: "tool-start", id, tool: "search", input: args });
      const t0 = Date.now();
      const catalog = getCatalog();

      // Mirror the MCP handler: a near-miss
      // `service` keeps the zero-hit response SHAPE with the diagnosis in
      // nextSteps. Same event fields under a demo-distinguishable evt name.
      const services = catalogServices(catalog);
      const respond = (structured: SearchStructured, page: SearchPage | null) => {
        logEvent("demo-search", {
          ...searchEventFields({
            query: args.query,
            requestedLimit: args.limit ?? null,
            page,
            summary: structured
          }),
          responseChars: JSON.stringify(structured).length,
          ms: Date.now() - t0
        });
        emit({ type: "tool-result", id, tool: "search", ok: true, output: structured });
        return structured;
      };

      if (budget.searchCalls >= DEMO_CAPS.maxSearchCallsPerTurn) {
        budget.searchRefusals += 1;
        const refusal: SearchStructured = {
          hits: [],
          total: 0,
          truncated: false,
          recovery: [],
          widerCandidates: [],
          nextSteps: "Search call limit reached for this demo turn. Earlier hits are navigation only; use an exact discovered id in execute if an execute call remains, then summarize only from factual tool evidence."
        };
        logEvent("demo-search-refused", {
          reason: "call-limit",
          ...searchEventFields({
            query: args.query,
            requestedLimit: args.limit ?? null,
            page: null,
            summary: null
          }),
          searchCalls: budget.searchCalls,
          searchRefusals: budget.searchRefusals
        });
        emit({ type: "tool-result", id, tool: "search", ok: false, output: refusal });
        return refusal;
      }
      budget.searchCalls += 1;

      if (args.service !== undefined && !services.includes(args.service)) {
        budget.unknownServiceSearches += 1;
        return respond({
          hits: [],
          total: 0,
          truncated: false,
          recovery: [],
          widerCandidates: [],
          nextSteps: `Unknown service "${args.service}" — service filter values are exact-match. Valid services: ${services.join(", ")}. Retry with one of those exact values, or drop the \`service\` filter.`
        }, null);
      }

      const operationIds = new Set(
        catalog.entries.filter((entry) => entry.kind === "operation").map((entry) => entry.id)
      );
      const unknownRecoveryIds = (args.recoverFrom ?? []).filter((id) => !operationIds.has(id));
      if (unknownRecoveryIds.length > 0) {
        return respond({
          hits: [],
          total: 0,
          truncated: false,
          recovery: [],
          widerCandidates: [],
          nextSteps: `Unknown recoverFrom operation id(s): ${unknownRecoveryIds.map((id) => JSON.stringify(id)).join(", ")}. Recovery ids are exact-match; discover valid operations with search first.`
        }, null);
      }

      const page = searchCatalogPage(catalog, {
        query: args.query,
        kind: args.kind,
        service: args.service,
        // Demo delta: page size clamped (the schema still advertises the
        // production max so the tool contract text stays verbatim).
        limit: Math.min(args.limit ?? DEMO_SEARCH_DEFAULT_LIMIT, DEMO_CAPS.maxSearchLimit)
      });
      const { total, truncated } = page;
      const hits = page.hits.map(compactHitForDemo);
      const widerCandidates = page.widerCandidates.map(compactWiderCandidateForDemo);
      const recoverFrom = args.recoverFrom ?? [];
      const recovery = recoverFrom.length > 0
        ? recoveryCandidates(
            catalog,
            recoverFrom,
            args.reason as RetrievalReason | undefined
          ).map(compactRecoveryCandidateForDemo)
        : [];
      if (truncated) budget.searchTruncatedCalls += 1;
      const remainingSearches = Math.max(0, DEMO_CAPS.maxSearchCallsPerTurn - budget.searchCalls);
      const searchAgain =
        remainingSearches > 0
          ? ` If these hits are truncated, mismatched, need corroboration, or do not expose the right endpoint shape, use another targeted search (${remainingSearches} remain) with the other candidate family, varied vocabulary, or exact \`kind\`/\`service\` filters.`
          : " No search calls remain; do not conclude capability absence from mismatched hits alone, and use the best available exact ids.";
      const baseNextSteps =
        hits.length > 0
          ? `Navigation only: these hits identify composable operations and skills, but they are not factual evidence for the user's answer. Write ONE \`execute\` script that calls several relevant operations (Promise.all across services for independent calls), then follow up with deeper calls parameterized by returned rows. Every call resolves to { ok: true, data } or { ok: false, error: { kind, message, hint? } } — payload fields live under \`.data\` (\`r.data.projects\`, never \`r.projects\`); check \`r.ok\` first. Errors are failed evidence and \`soft-empty\` is inconclusive: recover with remaining budget or qualify/abstain. Skill hits are operational playbooks — read needed sections via \`codemode.skill.read(id, { sections })\`; runnable hits show the exact \`codemode.skill.run("<exact id>", input)\` call. Scores share one scale; gated hits lead except a backfill hit may be promoted when it decisively dominates (>=1.6x), so hit order is authoritative. The same production discovery helpers are enabled in-script: \`codemode.search\`, \`codemode.describe\`, \`codemode.catalog\`, and \`codemode.spec\`. Avoid lossy projection false negatives: inspect row keys or filter raw rows before selecting fields.${truncated ? " More entries matched than shown (truncated)." : ""}${searchAgain}`
          : remainingSearches > 0
            ? `No navigation hits. Use another candidate family or varied vocabulary (${remainingSearches} searches remain), or use codemode.search inside execute; do not conclude the capability or fact is absent from one empty catalog search.`
            : "No navigation hits and no top-level search calls remain. You may use codemode.search inside execute; do not conclude the capability or fact is absent from an empty catalog search, and qualify if factual evidence cannot be recovered.";
      const nextSteps =
        widerCandidates.length > 0
          ? hits.length > 0
            ? `${baseNextSteps} This page has no gated operation match, so the ranked hits are lexical-only candidates; prefer the leading hit that fits the question, and if none does, run one bounded broad pass over the advisory widerCandidates.`
            : `${baseNextSteps} No gated operation matched either; run one bounded broad pass over the advisory widerCandidates before retrying, and still do not conclude absence.`
          : baseNextSteps;
      return respond({ hits, total, truncated, recovery, widerCandidates, nextSteps }, page);
    }
  });

  const execute = tool({
    description: EXECUTE_DESCRIPTION,
    inputSchema: z.object(executeInputSchema),
    execute: async (args) => {
      const id = crypto.randomUUID();
      emit({ type: "tool-start", id, tool: "execute", input: args });

      const refuse = (reason: string, error: string) => {
        const refusal = { ok: false as const, error };
        budget.executeRefusals += 1;
        logEvent("demo-execute-refused", {
          reason,
          codeChars: args.code.length,
          executeCalls: budget.executeCalls,
          executeRefusals: budget.executeRefusals
        });
        emit({ type: "tool-result", id, tool: "execute", ok: false, output: refusal });
        return refusal;
      };
      if (budget.executeCalls >= DEMO_CAPS.maxExecuteCallsPerTurn) {
        return refuse("call-limit", "execute call limit reached for this turn");
      }
      if (args.code.length > DEMO_CAPS.maxExecuteCodeChars) {
        return refuse(
          "code-too-long",
          `execute code too long for the demo: ${args.code.length} chars (max ${DEMO_CAPS.maxExecuteCodeChars}). Write a shorter script — select fields and aggregate in-sandbox instead of inlining data.`
        );
      }
      const preflightError = demoExecutePreflightError(args.code);
      if (preflightError) {
        return refuse("invalid-promise-all-object", preflightError);
      }
      budget.executeCalls += 1;

      const t0 = Date.now();
      let outcome: ExecuteOutcome;
      try {
        outcome = await (opts.runExecute ?? getRunner(env))(args.code);
      } catch (e) {
        // The runner is designed never to throw; belt-and-braces anyway.
        outcome = {
          ok: false as const,
          error: e instanceof Error ? e.message : String(e),
          logs: [],
          operationSummary: { total: 0, ok: 0, error: 0, softEmpty: 0 },
          evidenceSummary: {
            kind: "none",
            skillRead: false,
            buildAuthoritySkillIds: [],
            buildAuthorityRoles: [],
            skillRuns: 0,
            artifactReads: 0
          }
        };
      }
      if (!outcome.ok) budget.executeFailures += 1;
      if (outcome.ok && outcome.truncated) budget.executeResultTruncated += 1;
      budget.operations.total += outcome.operationSummary.total;
      budget.operations.ok += outcome.operationSummary.ok;
      budget.operations.error += outcome.operationSummary.error;
      budget.operations.softEmpty += outcome.operationSummary.softEmpty;
      const latest = outcome.operationSummary;
      budget.latestOperations = {
        total: latest.total,
        ok: latest.ok,
        error: latest.error,
        softEmpty: latest.softEmpty
      };
      budget.latestExecuteEvidence = outcome.evidenceSummary.kind;
      const recoveryHint = outcome.ok ? (outcome.recoveryHint ?? null) : null;
      let visibleRecoveryHint: EvidenceRecoveryHint | null = null;
      if (recoveryHint) {
        budget.recoveryHintedExecutes += 1;
        if (!budget.recoveryAdviceDelivered && budget.latestRecoveryHint === null) {
          budget.latestRecoveryHint = recoveryHint;
          visibleRecoveryHint = recoveryHint;
          // The standalone checkpoint is already model-visible in this tool
          // result, so reserve the turn's single hint cycle immediately. The
          // next prepareStep may restate this same pending hint, but no later
          // execute may surface a second cycle.
          budget.recoveryAdviceDelivered = true;
        } else {
          budget.recoveryAdviceSuppressed += 1;
          // A later execute supersedes the pending "latest execute" note.
          // The first checkpoint was already delivered, so do not retain
          // stale source-operation claims for the next step boundary.
          budget.latestRecoveryHint = null;
        }
      } else {
        // Structural failure/no-evidence recovery must describe this execute,
        // not a prior hint-bearing one from the same model step.
        budget.latestRecoveryHint = null;
      }
      // Same model-boundary budgets as the MCP handler: logs and error text
      // are model-authored channels and get the result's ~6k-token cap each
      // (rationale in src/policy/truncate.ts and src/mcp/tools.ts).
      const shapedLogs = truncateLogsForModel(outcome.logs.join("\n"), modelBoundaryMaxTokens);
      const shapedError = outcome.ok ? null : truncateForModel(outcome.error, modelBoundaryMaxTokens);

      logEvent("demo-execute", {
        ok: outcome.ok,
        ms: Date.now() - t0,
        codeChars: args.code.length,
        resultOriginalChars: outcome.ok ? (outcome.resultOriginalChars ?? outcome.result.length) : null,
        resultReturnedChars: outcome.ok ? (outcome.resultReturnedChars ?? outcome.result.length) : null,
        resultOriginalApproxTokens: outcome.ok ? outcome.resultApproxOriginalTokens : null,
        resultLimitTokens: outcome.ok ? outcome.resultMaxTokens : null,
        resultLimitChars: outcome.ok ? outcome.resultMaxChars : null,
        resultTruncated: outcome.ok ? outcome.truncated : null,
        logLines: outcome.logs.length,
        logsTruncated: shapedLogs.truncated,
        errorTruncated: shapedError ? shapedError.truncated : null,
        artifactReadCount: outcome.evidenceSummary.artifactReads,
        artifactReadBytes: outcome.artifactReadBytes ?? 0,
        operationSummary: outcome.operationSummary,
        evidenceSummary: outcome.evidenceSummary,
        evidenceOutcome: evidenceOutcome(outcome),
        recoveryHint,
        recoveryAdviceVisible: visibleRecoveryHint !== null,
        recoveryAdviceDelivered: budget.recoveryAdviceDelivered,
        recoveryAdviceSuppressed: budget.recoveryAdviceSuppressed,
        sourceBasis: outcome.ok
          ? projectSourceBasisTelemetry(outcome.sourceBasis, SOURCE_BASIS_CALL_LIMIT)
          : null
      });

      const logsBlock =
        outcome.logs.length > 0
          ? `\n\n--- console (${outcome.logs.length} lines) ---\n${shapedLogs.text}`
          : "";
      const truncationAdvisory =
        outcome.ok && outcome.truncated
          ? "\n\n--- demo advisory ---\nThis execute result was truncated before the final-answer step. Answer only from the visible returned fields, say the result was truncated if that affects completeness, and suggest a narrower follow-up for full detail."
          : "";
      const evidenceBlock = hostEvidenceSummary(
        outcome.operationSummary,
        outcome.evidenceSummary,
        outcome.ok && outcome.truncated
      );
      const evidenceCheckpoint = outcome.ok
        ? evidenceCheckpointBlock(visibleRecoveryHint ?? undefined)
        : "";
      const hasPriorArtPreflight = Boolean(
        outcome.operationSummary.priorArtCandidates &&
          outcome.evidenceSummary.buildAuthoritySkillIds?.length
      );
      const candidateBlock = outcome.ok
        ? candidateEvidenceBlock(outcome.operationSummary.candidateEvidence, hasPriorArtPreflight)
        : "";

      const text = outcome.ok
        ? `${outcome.result}\n\n${evidenceBlock}${candidateBlock}${evidenceCheckpoint}${truncationAdvisory}${logsBlock}`
        : `Execution failed: ${shapedError ? shapedError.text : outcome.error}\n\n${evidenceBlock}${logsBlock}`;
      emit({ type: "tool-result", id, tool: "execute", ok: outcome.ok, output: text });
      return text;
    }
  });

  return {
    tools: { search, execute },
    budgetReport: () => ({
      ...budget,
      operations: { ...budget.operations },
      latestOperations: { ...budget.latestOperations }
    })
  };
}
