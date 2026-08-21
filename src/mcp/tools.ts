/**
 * MCP tool registration for the unified `search` + `execute` server.
 *
 *  - `search`  → host-side ranked search over the generated catalog
 *                (catalog/manifest.json), as defined by ADR-0001. The
 *                `execute` sandbox also provides `codemode.spec()`,
 *                `codemode.search()`, and `codemode.catalog()`. These helpers
 *                keep discovery in one model turn. Operation hits carry
 *                rendered TypeScript signatures.
 *  - `execute` → runs LLM JavaScript in a Dynamic Worker sandbox via
 *                the injected `runExecute` (src/executor/run.ts, wired
 *                by src/server.ts). The runner is INJECTED because run.ts
 *                imports @cloudflare/codemode (→ cloudflare:workers),
 *                which plain-Node vitest cannot load; without a runner
 *                the tool degrades to an error-as-data explanation.
 *                Errors never cross the tool boundary as throws (PLAN §4).
 *
 * The `execute` description mirrors upstream's REQUEST_TYPES template
 * (node_modules/@cloudflare/codemode/dist/mcp.js), adapted to the
 * multi-service super spec; deltas are documented in
 * research/super-spec-design.md §5.
 */
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import {
  type RecoveryCandidate,
  type SearchHit,
  type SearchPage,
  type WiderCandidate
} from "../catalog/search.ts";
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
const SOURCE_BASIS_TELEMETRY_CALL_LIMIT = 12;

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
    .describe("Maximum number of hits to return (default 10, max 50)."),
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

export const searchHitSchema = z.object({
  id: z.string().describe("Exact catalog id — use it verbatim; never guess variants."),
  service: z.string(),
  kind: z.enum(SEARCH_KINDS),
  score: z
    .number()
    .describe(
      "Relevance score — higher is better, on one drift-guarded scale shared by both tiers. Ranking is tier-first with one exception: a backfill hit may be promoted above gated hits when its score decisively dominates them (>=1.6x), so hit order is the ranking to trust."
    ),
  tier: z
    .enum(["gated", "backfill"])
    .describe(
      "Which scorer ranked this hit: \"gated\" = the strict coverage-gated scorer (primary tier); \"backfill\" = the gate-relaxed scorer used only to fill out a page the gated tier left short (long multi-clause queries). Gated hits rank first, except a backfill hit whose score decisively dominates (>=1.6x) is promoted above the gated hits it beats."
    ),
  description: z.string(),
  signature: z
    .string()
    .optional()
    .describe(
      "Rendered TypeScript signature (operation hits and runnable-skill hits — a runnable skill's callable line is `codemode.skill.run(\"<id>\", input)`). The input type and callable line are always complete; an oversized OUTPUT type is compacted to a stub listing its top-level field names — the full shape comes from `codemode.describe(id)` inside `execute`."
    ),
  outputKeys: z
    .array(z.string())
    .optional()
    .describe(
      "Operation hits only: canonical top-level keys under a successful `r.data` payload. This structural summary survives UI signature clipping; use `codemode.describe(id)` for nested fields."
    ),
  outputItemKeys: z
    .record(z.string(), z.array(z.string()))
    .optional()
    .describe(
      "Operation hits only: array-valued `r.data` fields mapped to their documented item keys. This one-level structural summary survives UI signature clipping."
    ),
  availableSections: z
    .array(z.string())
    .optional()
    .describe(
      "Skill hits only: section keys for `codemode.skill.read(id, { sections })` in `execute` — ## slugs, then file:<relpath> keys. Omitted for skills without readable sections (metadata-only)."
    )
});

export const recoveryCandidateSchema = z.object({
  from: z.string().describe("Caller-reported exact operation id that declared this recovery edge."),
  id: z.string().describe("Exact recovery operation id; call or describe it verbatim."),
  service: z.string(),
  relation: z.string(),
  reasons: z.array(z.enum(RETRIEVAL_REASONS)),
  lane: z.string(),
  description: z.string(),
  signature: z.string().optional(),
  outputKeys: z
    .array(z.string())
    .optional()
    .describe("Canonical top-level keys under the recovery operation's successful `r.data` payload."),
  outputItemKeys: z
    .record(z.string(), z.array(z.string()))
    .optional()
    .describe("Array-valued recovery payload fields mapped to their documented item keys.")
});

export const widerCandidateSchema = z.object({
  id: z.string().describe("Exact exposed broad-operation id recommended for a structurally poor search page."),
  service: z.string(),
  lane: z.enum(["semantic", "research", "av", "corpus"]),
  basis: z.enum(["page-broad-hit", "catalog-anchor"]),
  description: z.string(),
  signature: z.string().optional(),
  outputKeys: z.array(z.string()).optional(),
  outputItemKeys: z.record(z.string(), z.array(z.string())).optional()
});

export const rankedSearchOutputSchema = {
  hits: z
    .array(searchHitSchema)
    .describe(
      "Ranked catalog entries. Operation hits include a rendered TypeScript signature you can call from `execute`."
    ),
  total: z
    .number()
    .int()
    .describe(
      "Distinct catalog entries in the match pool this page was drawn from (post kind/service filter, pre paging). Counts only the scorer tiers consulted for THIS page, so it is a floor, not an exhaustive match count — searching again with a higher `limit` can consult the backfill tier and report a larger total. total > hits.length means more matches exist than shown."
    ),
  truncated: z
    .boolean()
    .describe(
      "True when total > hits.length — more matching entries exist than returned. If none of these hits fit, retry with a higher `limit`, the other candidate family, or varied vocabulary before concluding the capability is missing."
    ),
  recovery: z
    .array(recoveryCandidateSchema)
    .describe(
      "Bounded, query-independent exact-ID contingencies for caller-reported prior operations; the host does not verify an execution ledger. Advisory and separate from lexical ranking; validate returned evidence before making a claim."
    ),
  widerCandidates: z
    .array(widerCandidateSchema)
    .describe(
      "Up to three advisory broad operations on zero-hit or all-backfill operation pages. Separate from ranked hits and derived only from page tiers plus manifest retrieval metadata."
    ),
  nextSteps: z.string().describe("What to do with these results (server hint).")
};

export const executeInputSchema = {
  code: z
    .string()
    .min(1)
    .describe(
      "JavaScript async arrow function to execute in the sandbox, e.g. async () => { ... return result; }"
    )
};

// Runnable-skill sentences (research/skill-run-design.md §11 row 13) — one
// each in SEARCH_DESCRIPTION, EXECUTE_DESCRIPTION, SERVER_INSTRUCTIONS, and
// the search nextSteps text below. Leave-with-the-feature rule: if the
// runnable set ever returns to zero, those sentences leave in the SAME change
// (ADR-0003 spirit — consumers are never told about, and never sold, what
// the gateway cannot do). Exported (with EXECUTE_DESCRIPTION) so the /demo
// playground drives the exact production tool contract.
export const SEARCH_DESCRIPTION = `Ranked lexical search over every exposed service operation (lumenloop.*, scout.*, stellarDocs.*) and whole skill. Skill sections are exact-read affordances exposed on whole-skill hits through availableSections; they are not independent ranked hits.

Returns ranked hits with rendered TypeScript signatures so you can call them from the \`execute\` tool without guessing. Structurally poor operation pages also return bounded \`widerCandidates\` that explicitly recommend broad semantic/research/A/V/corpus operations without changing ranking. Pass caller-reported exact attempted ids in \`recoverFrom\` (and optionally \`reason\`) to receive bounded recovery candidates separately from both ranking and wider-page advice.

## Workflow

1. Plan which source families could ground the answer before searching:
${FAMILY_LINE}
Most questions have a primary family and a corroborating one — pick both up front.
2. \`search\` once per candidate family — searches are cheap: two or three targeted queries (with \`service\`/\`kind\` filters where the family is known) beat one broad phrase. Vary vocabulary between queries: an entity name first, then a capability phrase.
3. Read the top hits' signatures and descriptions.
4. Write ONE \`execute\` script that composes SEVERAL relevant operations — hits are composable building blocks, not one-answer routes. Fan out broad calls (often across services) with Promise.all, then make targeted follow-up calls from what comes back.

5. Match breadth to the claim: an exact directory/index lookup can answer a closed-world membership question, but an open-world identity, history, or obscure-topic question needs a broad content/research family in the same script.

6. For a design-stage request to create a new artifact, include one bounded prior-art pass before committing architecture: at most two Scout repo/project discovery calls, one focused detail call, and three returned candidates, alongside current official examples. For each candidate return exact URL, role/applicability, freshness/provenance, and limitations; license/audit/deployment/compatibility stay unknown unless source-backed. Use the pass for scope, pitfalls, and build-vs-integrate decisions; skip it for single-step how-tos and debugging.

## Rules

- Never guess operation or skill names — always discover them here first (or with \`codemode.search\` mid-script).
- Prefer targeted queries ("account trustlines", "soroban storage patterns") over broad ones, and vary vocabulary across candidate families.
- Use \`kind\` to narrow to \`operation\` or \`skill\`, and \`service\` to narrow to one namespace. Filter values are exact-match — an unknown \`service\` is rejected with the valid names, never silently empty.
- Each hit's \`tier\` says which scorer ranked it: "gated" (strict, primary) or "backfill" (gate-relaxed page fill for long queries). Scores share one scale; gated hits lead except a backfill hit may be promoted when it decisively dominates (>=1.6x). Hit order is authoritative.
- \`truncated: true\` means more entries matched (\`total\`) than the page shows — if nothing here fits, search again with a higher \`limit\`, the other candidate family, or varied vocabulary before concluding the capability is missing.
- Skill hits are operational playbooks and carry \`availableSections\` — read those sections via \`codemode.skill.read(id, { sections })\` inside \`execute\`.
- A few skills are also RUNNABLE — their hits additionally carry a \`signature\` whose callable line is \`codemode.skill.run("<exact id>", input)\`: one call inside \`execute\` that runs the skill's whole data-gathering pipeline and resolves to the standard { ok: true, data } | { ok: false, error } envelope.
- Operation signatures are compact: the input type and callable line are always complete, but a very large OUTPUT type is stubbed down to its top-level field names. When you need the full output shape (or the raw JSON schemas), call \`codemode.describe("<exact id>")\` inside \`execute\`.
- Deeper or arbitrary discovery lives inside \`execute\`: \`codemode.search(...)\` (this same ranked search, mid-script), \`codemode.describe(id)\` (one entry's full detail), \`codemode.catalog({ kind?, service?, compact? })\` (exact-filtered catalog data; default/full includes schemas, \`compact: true\` omits them), and \`codemode.spec()\` (the unified OpenAPI super spec) — use them for follow-ups without another tool round-trip.`;

export const EXECUTE_DESCRIPTION = `Execute JavaScript in a sandboxed Worker isolate with access to the service SDKs discovered via the \`search\` tool.

Calls return one text result; failures set \`isError\`. The sandbox result, console output, and thrown errors each have a separate model-boundary cap of roughly 6k tokens by default. Service-call payloads live under \`.data\`. The sandbox has no direct network access, and \`fetch()\` fails.

Write an async arrow function in JavaScript that returns the result. One script should compose MANY operations: broad discovery calls first (in parallel where independent), then targeted deeper calls parameterized by their results, then return one merged, compact value.

Worked example (multi-service fan-out, then a follow-up detail call):

async () => {
  const [dir, docs] = await Promise.all([
    lumenloop.search_directory({ query: "soroswap", limit: 3 }),
    stellarDocs.search_docs({ query: "AMM liquidity pool", hitsPerPage: 3 })
  ]);
  let project = null;
  if (dir.ok && dir.data.projects.length > 0) {
    const detail = await lumenloop.get_project({ slug: dir.data.projects[0].slug, compact: true });
    if (detail.ok) project = detail.data;
  }
  return { project, docs: docs.ok ? docs.data.hits.map(h => ({ url: h.url, snippet: h.snippet })) : docs.error };
}

## Result envelope

Every service call resolves (never throws) to either { ok: true, data } or { ok: false, error: { service, kind, message, status?, hint? } } where kind is "error" (call failed / bad args) or "soft-empty" (the service answered with nothing — unknown slug, zero hits; NOT evidence). Check \`r.ok\` before using \`r.data\`. Payload fields live one level down — \`r.data.projects\`, never \`r.projects\`; reading a payload field directly on the envelope throws an Error naming the correct path. \`r.data\` on a failed call is undefined and logs a one-line \`[envelope]\` warning naming the error. Writes to the envelope are allowed.

## Rules

- The ONLY globals are \`lumenloop\`, \`scout\`, \`stellarDocs\`, \`codemode\`, and standard JavaScript. There is no \`host\`, \`fs\`, \`require\`, \`process\`, or Node.js API.
- Never guess method names — call an operation as \`<service>.<name>(args)\` exactly as the spec's operationId / x-execute line (or a search hit's signature) shows. Unknown names fail; there is no fuzzy resolution.
- Mid-script discovery: \`codemode.spec()\` returns the unified OpenAPI-style super spec covering every service ($refs resolved inline — paths keyed "/{service}/{operation}", operationId = the exact callable, x-execute = the exact sandbox call line); \`codemode.search("targeted query")\` (or \`{ query, kind?, service?, limit?, recoverFrom?, reason? }\`) for RANKED results plus advisory broad-operation and exact-ID recovery candidates — resolves to { ok: true, hits, total, truncated, widerCandidates, recovery }. \`widerCandidates\` is populated only for structurally poor operation pages and never changes ranking; \`recovery\` requires explicit \`recoverFrom\` ids. Truncated means more entries matched than returned (raise \`limit\`, try the other candidate family, or vary vocabulary — \`total\` is a floor, not exhaustive: it counts only the scorer tiers consulted for this page and can grow at a higher \`limit\`), and an unknown \`kind\`/\`service\`/\`recoverFrom\` value comes back as an error listing the valid scope; and \`codemode.catalog({ kind?, service?, compact? })\` for exact-filtered catalog data. Default/full entries include id, service, kind, description, inputSchema, outputSchema, and any retrievalProfile; \`compact: true\` omits the schemas. Everything listed is callable/readable. Use these for follow-ups instead of ending the script early.
- \`codemode.describe("<exact id>")\` is the canonical detail step after \`search\`: for an operation it returns the FULL rendered signature (complete output type, even where the search hit showed a compacted stub), the raw inputSchema/outputSchema as data, and a \`usage\` line; for a skill, its \`availableSections\` plus the skill.read call to make; for a skill section, the parent skill id, section key, and the exact skill.read call. Reach for it whenever a search hit's stub, description, or field names aren't enough to write the call or select payload fields.
- Skills are operational playbooks — tested build/integration/recovery procedures: \`codemode.skill.read("<exact skill id>", { sections: ["<section-slug>"] })\`; section keys come from search hits' \`availableSections\` or the spec's x-skill-index. \`{ sections }\` is the ONLY option (unknown option keys are rejected, not ignored). It resolves to { ok: true, id, content | sections, availableSections, notice? } — skill content sits at the TOP LEVEL of the result, not under \`.data\` (that envelope is for service calls); failures are { ok: false, error } as usual. Large reads come back whole for in-sandbox use (grep/aggregate freely) with an advisory \`notice\` — but RETURN sections or aggregates from the script, not whole bodies. Pair build skill sections with \`stellarDocs.search_*\` for current reference truth. When designing a new contract, app, integration, protocol, or infrastructure component, also run one prior-art pass in the SAME script: at most two \`scout.searchRepos\`/\`scout.searchProjects\` discovery calls, one focused detail call, and three returned candidates. Use it for scope, pitfalls, and build-vs-integrate decisions; return exact URL, role/applicability, freshness/provenance, and limitations, with license/audit/deployment/compatibility unknown unless source-backed. It is never API, security, maintenance, or production authority. Skip it for single-step how-tos and debugging; purely factual questions use docs first.
- A few skills are RUNNABLE: \`codemode.skill.run("<exact skill id>", input)\` executes that skill's data-gathering pipeline host-side in one call, resolving to the ordinary service-call envelope ({ ok: true, data } | { ok: false, error }) with \`data.calls\` auditing every constituent call it made — ids are exact-match (runnable search hits and \`codemode.describe\` show the exact callable line and input type), and \`skill.read\` on the same id still returns the prose playbook: run gathers the data, read carries the judgment steps.
- If a returned result is truncated, the visible tail is a source-basis block. When it says an artifact is available, call \`codemode.artifact.info(id)\` for metadata or \`codemode.artifact.read(id)\` for the full redacted result inside the same authenticated execute session; read it in the sandbox, then return a compact projection. Artifact reads resolve to the same envelope shape and are capped per execute.
- Do NOT use \`fetch\` — the sandbox has no network access; it will throw. All I/O goes through the service globals.
- Do NOT use TypeScript syntax — no type annotations, interfaces, or generics. Plain JavaScript only.
- Do NOT define named functions and then call them — just write the arrow function body directly.
- Parallelize independent calls with Promise.all; sequence only where a call needs a previous result.
- Directory/list-style results are summaries: most services pair them with a per-item detail operation (\`lumenloop.get_project\`, \`scout.getHackathon\`, \`lumenloop.get_document\`, …). When the question needs specifics beyond a list row, follow up with the detail call parameterized by the row — answering detail questions from a broad payload alone is a known failure mode.
- Evidence sufficiency is answer-level, not envelope-level. For a closed-world question (is X in this directory/index?), an exact empty may be reported only at that source's scope. For an open-world identity, history, or topic question, an ok call whose rows are empty, off-target, adjacent, or only semantic candidates grounds no negative conclusion — several such calls ground nothing together. Make one wider pass in the SAME script: use \`lumenloop.search_content_semantic\` for ecosystem content/events, \`scout.searchResearch\` for cited history, \`lumenloop.find_av_passages\` for spoken material, or \`stellarDocs.search_docs\` for official technical wording. After a successful profiled broad call, the host may append a standalone conditional checkpoint naming uncalled alternatives from the manifest recovery graph; it observes operation classes, not row relevance, so stop when exact evidence or the named closed-world answer already resolves the question and otherwise make at most one bounded alternative pass. Treat semantic rows as candidates: require exact identity or canonical slug plus source and date before attribution; otherwise return a scoped unverified result or ask for context.
- Avoid lossy list filtering: inspect row keys, call \`codemode.describe\` when output fields are unclear, and filter against raw row JSON or nested/common field variants before projecting compact columns. Projecting first can erase evidence and create false no-match answers.
- The final return value is truncated at the configured model-boundary cap (default ~6k tokens) — select fields, slice arrays, aggregate in-script, and read skills by section rather than returning raw payloads or whole skill bodies. console.log output comes back as logs.`;

/**
 * MCP initialize-time instructions (SDK ServerOptions.instructions) — clients
 * that inject them surface this in the system prompt, where it outlives
 * per-tool descriptions over a long session. HARD BUDGET: Claude Code — the
 * largest agentic-client population — truncates injected instructions at
 * exactly 2,048 characters. BASE must therefore be a complete, self-sufficient
 * workflow/envelope contract within that budget; test/mcp-instructions
 * enforces the cap and the load-bearing phrases. The micro-map rides after
 * BASE for clients that inject instructions in full.
 */
export const BASE_SERVER_INSTRUCTIONS = `Unified Stellar-ecosystem gateway: \`search\` discovers every service operation and skill; \`execute\` composes discovered operations in sandboxed JavaScript.

Workflow: classify the claim scope, plan candidate source families, \`search\` once per family with targeted vocabulary, then write ONE \`execute\` script (Promise.all for independent calls, then result-parameterized follow-ups). Oversized output types are stubbed in hits; use \`codemode.describe("<exact id>")\` for full signatures/schemas. Filter raw list rows (and nested field variants) before projecting compact columns. Read skill sections via \`codemode.skill.read(id, { sections })\`; runnable skills use \`codemode.skill.run("<exact id>", input)\` and return an ordinary envelope plus \`data.calls\`.

Every service call resolves to { ok: true, data } or { ok: false, error: { kind, message, hint? } }. Payloads live under .data (for example \`r.data.projects\`, never \`r.projects\`). error.kind is "error" or "soft-empty" (inconclusive, NOT evidence of absence). A closed-world question (is X in this directory/index?) may report an exact empty only at that source's scope. For an open-world identity, history, or topic question, ok rows that are empty, off-target, adjacent, or only semantic candidates are inconclusive too: make one broad pass before a negative. Prefer \`lumenloop.search_content_semantic\` for ecosystem content/events, \`scout.searchResearch\` for cited history, \`lumenloop.find_av_passages\` for spoken material, and \`stellarDocs.search_docs\` for official technical wording. Require exact identity or canonical slug plus source and date before attribution; otherwise say unverified or ask for context.

Truncated results include a source-basis block; if it lists an artifact id, read it via \`codemode.artifact.info(id)\` / \`codemode.artifact.read(id)\` in a later execute and return a compact projection. Operation and skill ids are exact-match — never guess them; discover via \`search\` or \`codemode.search\` mid-script.`;

export const SERVER_INSTRUCTIONS = `${BASE_SERVER_INSTRUCTIONS}\n\n${MICRO_MAP}`;

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
      title: "Discover Stellar tools and skills",
      description: SEARCH_DESCRIPTION,
      inputSchema: z.object(rankedSearchInputSchema),
      outputSchema: z.object(rankedSearchOutputSchema),
      annotations: {
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
          nextSteps: `Unknown recoverFrom operation id(s): ${recoveryStage.issue.ids.map((id) => JSON.stringify(id)).join(", ")}. Recovery ids are exact-match; discover valid operations with search first.`
        }, null, true);
      }

      const { page, recovery } = recoveryStage.resolve({
        query: args.query,
        kind: args.kind,
        limit: args.limit,
        reason: args.reason
      });
      const { hits, total, truncated, widerCandidates } = page;
      const baseNextSteps =
        hits.length > 0
          ? `These hits are composable: write ONE \`execute\` script that calls the several relevant operations (Promise.all across services for independent calls), then follows up with deeper calls parameterized by their results — e.g. \`await lumenloop.search_directory({ query: "..." })\` then \`lumenloop.get_project({ slug })\`. Every call resolves to { ok: true, data } or { ok: false, error: { kind, message, hint? } } — payload fields live under \`.data\` (\`r.data.projects\`, never \`r.projects\`); check \`r.ok\` first. Skill hits are operational playbooks — read the sections you need in-script via \`codemode.skill.read(id, { sections })\` (keys: the hit's \`availableSections\`), and pair them with stellarDocs searches for current reference truth. For a design-stage request to create a new artifact, make one prior-art pass before architecture: at most two \`scout.searchRepos\`/\`scout.searchProjects\` discovery calls, one focused detail call, and three returned candidates. Return exact URL, role/applicability, freshness/provenance, and limitations; license/audit/deployment/compatibility stay unknown unless source-backed. Skip it for a single-step how-to or debugging task. Hits whose \`signature\` shows a \`codemode.skill.run("<exact id>", input)\` line are runnable skills — call that line verbatim to run the whole pipeline in one step (payload under \`.data\`, constituent calls audited in \`data.calls\`). Hit order is the ranking to trust: gated hits rank first, and a backfill hit appears above gated hits only when its score decisively dominates them. Recovery candidates are bounded exact-ID contingencies, separate from ranking: use relevant ones in the same execute when an open-world answer remains empty, weak, adjacent, ambiguous, or partial, and validate identity/source/date before asserting. Signatures with a stubbed output type (\`{ /* N top-level fields: ... */ }\`) list the payload's top-level field names — for the full output shape call \`codemode.describe("<exact id>")\` inside \`execute\`. For directory/list rows, inspect keys or filter raw row JSON and nested/common field variants before projecting compact columns. Use \`codemode.search(...)\` mid-script for follow-up discovery; search again here with the other candidate family, varied vocabulary, or \`kind\`/\`service\` filters if none fit.${truncated ? " More entries matched than shown (truncated) — raise `limit`, try the other candidate family, or vary vocabulary if none of these fit." : ""}`
          : "No hits. Try the other candidate family, vary vocabulary (entity name first, then capability phrase), or drop the `kind`/`service` filters. Do not conclude the capability is missing from one empty result.";
      const nextSteps =
        widerCandidates.length > 0
          ? hits.length > 0
            ? `${baseNextSteps} This page has no gated operation match, so the ranked hits are lexical-only candidates; prefer the leading hit that fits the question, and if none does, run one bounded broad pass over the advisory widerCandidates.`
            : `${baseNextSteps} No gated operation matched either; run one bounded broad pass over the advisory widerCandidates before retrying, and still do not conclude absence.`
          : baseNextSteps;
      return respond({ hits, total, truncated, recovery, widerCandidates, nextSteps }, page);
    }
  );

  server.registerTool(
    EXECUTE_TOOL_NAME,
    {
      title: "Run Stellar research code",
      description: EXECUTE_DESCRIPTION,
      inputSchema: z.object(executeInputSchema),
      annotations: {
        // A truncated result can persist a private artifact for a later execute call.
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: true
      }
    },
    async (args) => {
      const runExecute = options.runExecute;
      if (!runExecute) {
        // No runner injected (plain-Node tests / misconfigured server):
        // error as data, never a throw (PLAN §4).
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
        ? `\n\n--- EVIDENCE RECOVERY ---\nAll ${operationSummary.ok} successful service call(s) returned structurally empty collections. Their { ok: true, data } envelopes remain unchanged, but they are inconclusive for an open-world negative. ${outcome.recoveryHint ? "Use the exact recovery guidance below." : "Make one broad pass before making an open-world negative."} For a closed-world question, report the empty result only at the named source's scope.`
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
