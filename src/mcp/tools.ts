/**
 * MCP tool registration for the unified `search` + `execute` server.
 *
 *  - `search`  → host-side ranked search over the generated catalog
 *                (catalog/manifest.json), as defined by ADR-0001. The
 *                `execute` sandbox also provides `codemode.spec()`,
 *                `codemode.search()`, and `codemode.catalog()`. These helpers
 *                keep discovery in one model turn. Hits are compact cards:
 *                a short description, the input type and call line, and the
 *                payload field names. `codemode.describe` has the full types.
 *  - `execute` → runs LLM JavaScript in a Dynamic Worker sandbox via
 *                the injected `runExecute` (src/executor/run.ts, wired
 *                by src/server.ts). The runner is INJECTED because run.ts
 *                imports @cloudflare/codemode (→ cloudflare:workers),
 *                which plain-Node vitest cannot load; without a runner
 *                the tool degrades to an error-as-data explanation.
 *                Errors never cross the tool boundary as throws (ARCHITECTURE.md).
 *
 * The execute description uses the upstream REQUEST_TYPES structure with
 * manifest-backed service helpers. ARCHITECTURE.md defines the spec RPC and
 * output contract; src/skills/README.md defines runnable skill behavior.
 */
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import {
  clipProse,
  renderSignature,
  type RecoveryCandidate,
  type SearchConfidence,
  type SearchHit,
  type SearchPage,
  type SearchRecoveryMetadata,
  type WiderCandidate
} from "../catalog/search.ts";
import type { Catalog } from "../catalog/types.ts";
import { prepareCatalogSearch } from "../catalog/search-resolution.ts";
import { getCatalog } from "../catalog/load.ts";
import { SEARCH_KINDS, RETRIEVAL_REASONS } from "../catalog/types.ts";
import type { ExecuteCallContext, ExecuteRunner } from "../executor/run.ts";
import { projectSourceBasisTelemetry } from "../policy/source-basis.ts";
import { logEvent } from "../observability.ts";
import { searchEventFields } from "../observability-search.ts";
import { truncateForModel, truncateLogsForModel } from "../policy/truncate.ts";
import { candidateEvidenceBlock, evidenceCheckpointBlock } from "../policy/evidence-checkpoint.ts";
import { FAMILY_LINE, MICRO_MAP } from "./micro-map.ts";

export { SEARCH_KINDS };

export const SEARCH_TOOL_NAME = "search";
export const EXECUTE_TOOL_NAME = "execute";
const SEARCH_TOOL_TITLE = "Discover Stellar tools and skills";
const EXECUTE_TOOL_TITLE = "Run Stellar research code";
const SOURCE_BASIS_TELEMETRY_CALL_LIMIT = 12;
/** The public page is five cards; `limit` raises it. The catalog default stays the ranker's own. */
export const SEARCH_DEFAULT_LIMIT = 5;
export const SEARCH_CARD_DESCRIPTION_CHARS = 220;
export const SEARCH_NEXT_STEPS_MAX_CHARS = 400;

export const rankedSearchInputSchema = {
  query: z
    .string()
    .min(1)
    .describe(
      "Targeted search query for one candidate source family, e.g. \"soroban contract storage\" or \"validator directory\"."
    ),
  kind: z
    .enum(SEARCH_KINDS)
    .optional()
    .describe(
      "Restrict ranked results to a service operation or a whole skill. Skill sections are exact-read affordances exposed on whole-skill hits through availableSections, not independent search hits."
    ),
  service: z
    .string()
    .optional()
    .describe(
      "Restrict results to one service namespace, e.g. \"lumenloop\", \"scout\", or \"stellarDocs\"."
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .describe(`Maximum number of hits to return (default ${SEARCH_DEFAULT_LIMIT}, max 50).`),
  recoverFrom: z
    .array(z.string().min(1))
    .max(10)
    .optional()
    .describe(
      "Caller-reported exact operation ids already attempted. The host validates exact ids and exposure, not an execution ledger. Returns bounded recovery candidates separately from ranked hits; ids are never fuzzy-resolved."
    ),
  reason: z
    .enum(RETRIEVAL_REASONS)
    .optional()
    .describe(
      "Why the caller reports the operation was insufficient: empty, weak, adjacent, ambiguous, or partial. Filters recovery candidates without changing hit ranking."
    )
};

export const executeInputSchema = {
  code: z
    .string()
    .min(1)
    .describe(
      "JavaScript async arrow function to execute in the sandbox, e.g. async () => { ... return result; }"
    )
};

// Each model-facing field below is one complete contract inside the 2,048
// characters that Claude Code keeps of a tool description or of server
// instructions; test/mcp-instructions.test.ts holds the cap. The descriptions
// state what a script must know before it runs. What a script can get wrong
// (an unknown id, a wrong-level read, a missing global, no network) is taught
// by the host error that follows the mistake (src/executor), not by prefix
// text. ADR-0003: name only exposed operations and runnable skills here.
// The Playground uses the same exported tool contract.
//
// One official upstream documentation URL per source family rides last on both
// tool descriptions, as reference metadata.
export const UPSTREAM_DOC_LINKS = `Upstream docs: Lumenloop https://api.lumenloop.com/v1/docs; Scout https://stellarlight.xyz/api/openapi.json; Stellar Docs https://developers.stellar.org/docs.`;

export const SEARCH_DESCRIPTION = `Ranked search over every exposed service operation (lumenloop.*, scout.*, stellarDocs.*) and whole skill. Hits are cards to compose in \`execute\`; they are not evidence.

## Workflow

1. Plan which source families could ground the answer before searching:
${FAMILY_LINE}
Most questions have a primary family and a corroborating one — pick both up front.
2. \`search\` once per candidate family: two or three targeted queries (with \`service\`/\`kind\` filters where the family is known) beat one broad phrase. Vary vocabulary: an entity name first, then a capability phrase.
3. Write ONE \`execute\` script that composes SEVERAL relevant operations: fan out broad calls with Promise.all, then make targeted follow-up calls from what comes back.
4. Match breadth to the claim: an exact directory/index lookup can answer a closed-world membership question, but an open-world identity, history, or obscure-topic question needs a broad content/research family in the same script.

## Hits

Each hit has its exact \`id\`, a short description, a \`signature\` (input type and call line), and the payload field names under \`r.data\` (\`outputKeys\`, \`outputItemKeys\`). Skill hits list \`availableSections\` for \`codemode.skill.read\`. \`codemode.describe("<exact id>")\` inside \`execute\` returns the full description and types. Hit order is the ranking. \`widerCandidates\` are advisory directory or broad operations for when no hit fits. Never guess ids.

${UPSTREAM_DOC_LINKS}`;

export const EXECUTE_DESCRIPTION = `Run one JavaScript async arrow function in a sandbox with no network. It can call only the operations found with \`search\` (\`lumenloop.*\`, \`scout.*\`, \`stellarDocs.*\`) and the \`codemode.*\` helpers. Ids are exact-match: copy them from search hits.

Compose in ONE script: independent calls in parallel, then follow-ups built from their results, then return a small projection. The return value is the result, capped near 6k tokens: select fields and slice arrays in the script. A list row is a summary; call the detail operation before answering specifics.

async () => {
  const [dir, docs] = await Promise.all([
    lumenloop.search_directory({ query: "soroswap", limit: 3 }),
    stellarDocs.search_docs({ query: "AMM liquidity pool", hitsPerPage: 3 })
  ]);
  const top = dir.ok ? dir.data.projects[0] : null;
  const detail = top ? await lumenloop.get_project({ slug: top.slug, compact: true }) : null;
  return { project: detail?.ok ? detail.data : null, docs: docs.ok ? docs.data.hits.map(h => h.url) : docs.error };
}

Every call resolves, never throws, to { ok: true, data, asOf, asOfBasis, caveat? } or { ok: false, error: { kind, message, hint? } }. Check \`r.ok\` first. Payload fields live under \`.data\`: \`r.data.projects\`, never \`r.projects\`. \`error.kind\` "soft-empty" means the service had nothing for that lookup: inconclusive, not evidence of absence. \`caveat\` "no-rows" is ok data with no rows, true only at that source's scope; "unverified-match" marks semantic candidates, not confirmed identity.

Helpers:
- \`codemode.describe(id)\`: full types for an operation or skill.
- \`codemode.search(query)\`: search, mid-script.
- \`codemode.skill.read(id, { sections: [...] })\`: playbook sections; \`r.data.sections\` is an ARRAY of { section, content, url }.

${UPSTREAM_DOC_LINKS}`;

/**
 * MCP initialize-time instructions (SDK ServerOptions.instructions). Clients
 * that inject them put them in the system prompt, where they outlive per-tool
 * descriptions over a long session. BASE is the workflow and evidence contract
 * and fits the 2,048-character cap; it names the envelope without restating
 * the payload-access rule, which the execute description owns. The micro-map
 * rides after BASE for clients that inject instructions in full.
 */
export const BASE_SERVER_INSTRUCTIONS = `Unified Stellar-ecosystem gateway: \`search\` discovers service operations and skills. \`execute\` composes them in sandboxed JavaScript.

Workflow: classify claim scope; plan source families; \`search\` each family with vocabulary; write ONE \`execute\` script. Use Promise.all for independent calls, then follow up from results. Use \`codemode.describe("<exact id>")\` for full types. Filter raw list rows (and nested field variants) before projecting compact columns. Read sections via \`codemode.skill.read(id, { sections })\`. Runnable skills use \`codemode.skill.run("<exact id>", input)\`; calls are in \`data.calls\`.

Every service call resolves to { ok: true, data, asOf, asOfBasis, caveat? } or { ok: false, error: { kind, message, hint? } }. error.kind is "error" or "soft-empty" (inconclusive, NOT evidence of absence). \`asOf\` is an upstream-stated date, or the observation time when \`asOfBasis\` is "observed". An ok \`caveat\` is "no-rows" or "unverified-match". A closed-world exact empty applies only there. For an open-world identity, history, or topic question, ok results with a \`caveat\`, or off-target or adjacent rows, ground nothing: make one broad pass. Use \`lumenloop.search_content_semantic\` for content, \`scout.searchResearch\` for history, \`lumenloop.find_av_passages\` for speech, and \`stellarDocs.search_docs\` for technical text. Require exact identity or canonical slug plus source and date before attribution; otherwise say unverified or ask for context.

Evidence discipline: copy exact symbols, types, formulas, and identifiers from results. State visible source conflicts instead of choosing silently.

Host blocks preserve metadata and truncation. Read listed artifacts with \`codemode.artifact.info(id)\` / \`codemode.artifact.read(id)\`, then return a compact projection. Operation and skill ids are exact-match — never guess them; discover via \`search\` or \`codemode.search\` mid-script.`;

export const SERVER_INSTRUCTIONS = `${BASE_SERVER_INSTRUCTIONS}\n\n${MICRO_MAP}`;

type SearchCard = { id: string; description: string; signature?: string };

/**
 * The public search page shows each entry as a card: a short description and
 * an input-only signature with short field prose. `outputKeys` and
 * `outputItemKeys` already name the payload fields, and `codemode.describe(id)`
 * returns everything cut here.
 */
function compactCard<T extends SearchCard>(catalog: Catalog, card: T): T {
  const entry = card.signature === undefined ? undefined : catalog.entries.find((e) => e.id === card.id);
  const signature = entry && renderSignature(entry, { inputOnly: true });
  return {
    ...card,
    description: clipProse(card.description, SEARCH_CARD_DESCRIPTION_CHARS),
    ...(signature ? { signature } : {})
  };
}

/**
 * The one hint a search response carries. It says what to do with this page
 * and nothing the tool descriptions already say; test/server.test.ts holds the
 * SEARCH_NEXT_STEPS_MAX_CHARS bound for every branch.
 */
export function searchNextSteps(page: Pick<SearchPage, "hits" | "truncated" | "widerCandidates">): string {
  const { hits, truncated, widerCandidates } = page;
  const base =
    hits.length > 0
      ? `Compose the relevant hits in ONE \`execute\` script, copying each id and input field exactly.${truncated ? " More entries matched than shown: raise `limit` or vary the query if none of these fit." : ""}`
      : "No hits. Try another source family, different vocabulary (an entity name, then a capability phrase), or drop the filters. One empty search does not show that a capability is missing.";
  if (widerCandidates.some((candidate) => candidate.basis === "short-query-directory")) {
    return `${base} This one-word query matched no operation name: if no hit names the entity, look it up with the directory operation in \`widerCandidates\`.`;
  }
  if (widerCandidates.length === 0) return base;
  return hits.length > 0
    ? `${base} No hit is a strong match: prefer the leading hit that fits, or make one bounded pass over the broad operations in \`widerCandidates\`.`
    : `${base} Before retrying, make one bounded pass over the broad operations in \`widerCandidates\`.`;
}

export type RegisterToolsOptions = {
  /**
   * The sandbox runner from src/executor/run.ts (createExecuteRunner(env)).
   * Injected by src/server.ts; omitted in plain-Node tests, where `execute`
   * answers with an error-as-data explaining the sandbox is not wired.
   */
  runExecute?: ExecuteRunner;
  executeContext?: () => ExecuteCallContext;
  /**
   * Host-side token cap for all execute model-boundary channels: final result
   * is shaped by the runner, logs/errors here.
   */
  modelBoundaryMaxTokens?: number;
};

/**
 * Register the model-facing tools on a (fresh, per-request) McpServer.
 */
export function registerTools(server: McpServer, options: RegisterToolsOptions = {}): void {
  server.registerTool(
    SEARCH_TOOL_NAME,
    {
      title: SEARCH_TOOL_TITLE,
      description: SEARCH_DESCRIPTION,
      inputSchema: z.object(rankedSearchInputSchema),
      annotations: {
        // Directory review reads annotations.title; clients prefer the top-level title.
        title: SEARCH_TOOL_TITLE,
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false
      }
    },
    async (args) => {
      const t0 = Date.now();
      const catalog = getCatalog();

      const respond = (structured: {
        hits: SearchHit[];
        total: number;
        truncated: boolean;
        recovery: RecoveryCandidate[];
        widerCandidates: WiderCandidate[];
        confidence: SearchConfidence;
        recoveryMetadata: SearchRecoveryMetadata;
        nextSteps: string;
      }, page: SearchPage | null, isError?: true) => {
        const text = JSON.stringify(structured);
        logEvent("search", {
          source: "tool",
          ...searchEventFields({
            query: args.query,
            requestedLimit: args.limit ?? null,
            page,
            summary: structured
          }),
          // Keep response size observable for compaction and future limits.
          responseChars: text.length,
          ms: Date.now() - t0
        });
        return {
          content: [{ type: "text" as const, text }],
          structuredContent: structured,
          ...(isError === undefined ? {} : { isError })
        };
      };

      const prepared = prepareCatalogSearch(catalog, args.service);
      if (!prepared.ok) {
        return respond({
          hits: [],
          total: 0,
          truncated: false,
          recovery: [],
          widerCandidates: [],
          confidence: { hitCount: 0, topScoreGap: null, topScoreTiers: null },
          recoveryMetadata: { serviceFilterExcludedSkills: [] },
          nextSteps: `Unknown service "${prepared.issue.service}" — service filter values are exact-match. Valid services: ${prepared.issue.validServices.join(", ")}. Retry with one of those exact values, or drop the \`service\` filter.`
        }, null, true);
      }

      const recoveryStage = prepared.checkRecoveryIds(args.recoverFrom);
      if (!recoveryStage.ok) {
        return respond({
          hits: [],
          total: 0,
          truncated: false,
          recovery: [],
          widerCandidates: [],
          confidence: { hitCount: 0, topScoreGap: null, topScoreTiers: null },
          recoveryMetadata: { serviceFilterExcludedSkills: [] },
          nextSteps: `Unknown recoverFrom operation id(s): ${recoveryStage.issue.ids.map((id) => JSON.stringify(id)).join(", ")}. Recovery ids are exact-match; discover valid operations with search first.`
        }, null, true);
      }

      const { page, recovery } = recoveryStage.resolve({
        query: args.query,
        kind: args.kind,
        limit: args.limit ?? SEARCH_DEFAULT_LIMIT,
        reason: args.reason
      });
      const { total, truncated, confidence } = page;
      const card = <T extends SearchCard>(entry: T): T => compactCard(catalog, entry);
      return respond(
        {
          hits: page.hits.map(card),
          total,
          truncated,
          recovery: recovery.map(card),
          widerCandidates: page.widerCandidates.map(card),
          confidence,
          recoveryMetadata: {
            serviceFilterExcludedSkills: page.recoveryMetadata.serviceFilterExcludedSkills.map(card)
          },
          nextSteps: searchNextSteps(page)
        },
        page
      );
    }
  );

  server.registerTool(
    EXECUTE_TOOL_NAME,
    {
      title: EXECUTE_TOOL_TITLE,
      description: EXECUTE_DESCRIPTION,
      inputSchema: z.object(executeInputSchema),
      annotations: {
        title: EXECUTE_TOOL_TITLE,
        // A truncated result can persist a private, expiring artifact of this call's own
        // output. That cache changes no user or upstream state, so execute stays read-only.
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false
      }
    },
    async (args) => {
      const runExecute = options.runExecute;
      if (!runExecute) {
        // No runner injected (plain-Node tests / misconfigured server):
        // error as data, never a throw (ARCHITECTURE.md).
        logEvent("execute_unavailable", { codeChars: args.code.length });
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: "execute is unavailable: the Dynamic Worker sandbox runner is not wired on this server instance. No code was run. Use the search tool to explore the catalog."
            }
          ]
        };
      }

      const t0 = Date.now();
      let outcome;
      try {
        outcome = await runExecute(args.code, options.executeContext?.());
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
      // Logs get their own token budget at the model boundary (equal to the
      // result cap) — shapeLogs' structural caps alone still admit ~50k
      // tokens, which would smuggle payloads past the result cap via
      // console.log. Rationale + tuning note in src/policy/truncate.ts.
      const shapedLogs = truncateLogsForModel(outcome.logs.join("\n"), options.modelBoundaryMaxTokens);
      // Error text is model-authored too (`throw new Error(payload)`) — same
      // budget as the result, or it becomes the third smuggling channel.
      const shapedError = outcome.ok ? null : truncateForModel(outcome.error, options.modelBoundaryMaxTokens);

      logEvent("execute", {
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
        recoveryHint: outcome.ok ? (outcome.recoveryHint ?? null) : null,
        sourceBasis: outcome.ok
          ? projectSourceBasisTelemetry(outcome.sourceBasis, SOURCE_BASIS_TELEMETRY_CALL_LIMIT)
          : null
      });

      const logsBlock =
        outcome.logs.length > 0 ? `\n\n--- console (${outcome.logs.length} lines) ---\n${shapedLogs.text}` : "";

      if (!outcome.ok) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Execution failed: ${shapedError ? shapedError.text : outcome.error}${logsBlock}`
            }
          ]
        };
      }

      const operationSummary = outcome.operationSummary;
      const noData = operationSummary.total > 0 && operationSummary.ok === 0;
      const allSuccessfulCallsEmpty =
        operationSummary.ok > 0 && outcome.evidenceSummary.kind === "service-inconclusive";
      const recoveryBlock = allSuccessfulCallsEmpty
        ? `\n\n--- EVIDENCE RECOVERY ---\nAll ${operationSummary.ok} successful service call(s) returned structurally empty collections. Each carries \`caveat: "no-rows"\`; they do not ground an open-world negative. ${outcome.recoveryHint ? "Use the exact recovery guidance below." : "Make one broad pass before making an open-world negative."} For a closed-world question, report the empty result only at the named source's scope.`
        : !noData
          ? ""
        : operationSummary.error > 0 && operationSummary.softEmpty === 0
          ? `\n\n--- SERVICE ERRORS ---\nAll ${operationSummary.total} service calls failed. Errors do not establish absence or an open-world negative: inspect or retry the failures before broadening.`
          : operationSummary.error === 0
            ? `\n\n--- EVIDENCE RECOVERY ---\nAll ${operationSummary.total} service calls soft-emptied. This cannot ground an open-world negative: follow the calls' hints and make one broad pass. For a closed-world question, report the empty result only at the named source's scope.`
            : `\n\n--- INCONCLUSIVE SERVICE OUTCOMES ---\n${operationSummary.error} service call(s) errored and ${operationSummary.softEmpty} soft-emptied. Neither outcome establishes absence or an open-world negative: inspect or retry errors, then use any applicable soft-empty hint before broadening.`;

      // Scout project/repo operations serve ordinary lookup and landscape requests too. Treat
      // them as a build-stage preflight only when the same execute read an exact
      // catalog-declared build-authority playbook; any-skill reads stay off this
      // composition cue so landscape/list requests never inherit a build cap.
      const hasPriorArtPreflight = Boolean(
        outcome.operationSummary.priorArtCandidates && outcome.evidenceSummary.buildAuthoritySkillIds?.length
      );

      const candidateBlock = candidateEvidenceBlock(
        outcome.operationSummary.candidateEvidence,
        hasPriorArtPreflight
      );

      const priorArtEvidenceBlock =
        hasPriorArtPreflight
          ? `\n\n--- PRIOR-ART CANDIDATES ---\nThis build-stage run paired an implementation playbook with ${outcome.operationSummary.priorArtCandidates} Scout project/repository discovery or detail call(s). These rows are decision input, not reuse clearance: return no more than three directly relevant candidates with exact URL, role/applicability, freshness/provenance, and limitations. License, audit, deployment, compatibility, security, maintenance, and production readiness remain unknown unless the returned evidence directly establishes each claim; rank, stars, funding, directory status, and public source do not.`
          : "";
      const evidenceCheckpoint = evidenceCheckpointBlock(outcome.recoveryHint);

      return {
        content: [
          {
            type: "text" as const,
            text: `${outcome.result}${recoveryBlock}${candidateBlock}${priorArtEvidenceBlock}${evidenceCheckpoint}${logsBlock}`
          }
        ]
      };
    }
  );
}
