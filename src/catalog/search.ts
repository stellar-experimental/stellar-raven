/**
 * Host-side catalog search — the FROZEN contract (scratchpad 514):
 *
 *   loadManifest(json: unknown): Catalog
 *   searchCatalog(catalog, { query, kind?, service?, limit? }): SearchHit[]
 *   type SearchHit = { id, service, kind, score, tier, description, signature?, outputKeys? }
 *
 * (`tier` — todo 838 — is an additive metadata field on the hit, not a
 * contract-shape change. `searchCatalogPage` — todo 840 — is a NEW export
 * beside the frozen surface; `searchCatalog` is its thin `.hits` wrapper.)
 *
 * Pure functions, no I/O — importable from the Worker, vitest, and the eval
 * CLI alike. Everything in the manifest is exposed by construction (ADR-0003:
 * exclusions are filtered at build time). Default limit 10.
 *
 * Filters stay SILENT here by design: an unknown `kind`/`service` simply
 * matches nothing (the eval runner scores raw routing behavior through this
 * exact contract). Filter VALIDATION — "did you mean stellarDocs?" — is the
 * callers' job (src/mcp/tools.ts, src/executor/providers.ts), fed by
 * `catalogServices` below.
 *
 * Scoring is the vendored @cloudflare/codemode ranked-token scorer
 * (src/catalog/vendor/search-scoring.ts); signatures for operation hits are
 * rendered from JSON Schema via the vendored type generator.
 */
// NOTE: relative imports in src/catalog/** carry explicit .ts extensions so
// the module graph loads under plain `node` (type stripping) — the eval CLI
// and vitest both import this file directly (frozen contract, scratchpad 514).
import { z } from "zod";
import {
  RETRIEVAL_LANES,
  catalogSchema,
  type Catalog,
  type CatalogEntry,
  type CatalogKind,
  type RetrievalReason
} from "./types.ts";
import { lastIdSegment, VALID_IDENT } from "./id.ts";
import {
  scoreEntryWeighted,
  scoreEntryWeightedUngated,
  diversifyByService
} from "./scoring.ts";
import {
  jsonSchemaToType,
  sanitizeToolName,
  toPascalCase,
  type JsonSchema
} from "./vendor/json-schema-types.ts";

export type { Catalog, CatalogEntry } from "./types.ts";

export type SearchHit = {
  id: string;
  service: string;
  kind: string;
  score: number;
  /**
   * Which scorer produced this hit (todo 838): "gated" = tier 1, the vendor
   * scorer with its coverage gate; "backfill" = tier 2, the gate-free replica
   * used only to fill a page tier 1 left short. The drift guard in
   * test/scoring.test.ts proves both paths produce the same score wherever
   * the gate passes, so `score` is a common scale across the tier seam.
   */
  tier: "gated" | "backfill";
  description: string;
  /**
   * Rendered TypeScript signature — operation entries and runnable-skill
   * entries (research/skill-run-design.md §5: a runnable skill's hit carries
   * the `codemode.skill.run("<id>", …)` callable line, the adoption surface
   * of that design). Input type and callable envelope line are always full;
   * an output type block over COMPACT_OUTPUT_THRESHOLD chars is stubbed down
   * to its top-level field names (todo 841) — the full shape is
   * `codemode.describe(id)`'s job.
   */
  signature?: string;
  /**
   * Top-level keys on a successful operation's `r.data` payload. Kept as a
   * separate structural field so UI-specific prose/signature clipping cannot
   * hide the canonical projection contract. Omitted for non-object outputs
   * and non-callable entries; use `codemode.describe(id)` for nested shapes.
   */
  outputKeys?: string[];
  /** Array-valued payload fields mapped to their documented item keys. */
  outputItemKeys?: Record<string, string[]>;
  /**
   * Skill hits only: section keys readable via `codemode.skill.read(id,
   * { sections })` — `##`-heading slugs first, then `file:<relpath>` keys.
   * Omitted when the skill has no section entries (sectionless bodies).
   */
  availableSections?: string[];
};

export type RecoveryCandidate = {
  from: string;
  id: string;
  service: string;
  relation: string;
  reasons: RetrievalReason[];
  lane: string;
  description: string;
  signature?: string;
  outputKeys?: string[];
  outputItemKeys?: Record<string, string[]>;
};

export type WiderCandidate = {
  id: string;
  service: string;
  /** The candidate operation's own retrieval lane. */
  lane: "semantic" | "research" | "av" | "corpus";
  basis: "page-broad-hit" | "catalog-anchor";
  description: string;
  signature?: string;
  outputKeys?: string[];
  outputItemKeys?: Record<string, string[]>;
};

export type SearchOptions = {
  query: string;
  kind?: CatalogKind;
  service?: string;
  limit?: number;
};

/**
 * One result page plus honest pagination facts (todo 840, mirroring upstream
 * @cloudflare/codemode's { results, total, truncated } search shape):
 *  - `total`     — distinct catalog entries scoring non-null under the scorer
 *    tiers actually consulted (after kind/service filters, BEFORE paging and
 *    diversity). Tier 1 only when it fills the page; gated candidates plus
 *    novel ungated candidates when tier 2 ran.
 *  - `truncated` — total > hits.length: more matching entries exist than the
 *    page shows, so a caller that found nothing fitting should retry with a
 *    higher limit, varied vocabulary, or alternate family/filter rather than
 *    conclude absence.
 */
export type SearchPage = {
  hits: SearchHit[];
  total: number;
  truncated: boolean;
  /** The page size after the default/min/max clamp was applied. */
  effectiveLimit: number;
  /**
   * Advisory broad-operation recommendations for structurally poor operation
   * pages. Separate from ranked hits: never counted, scored, or paginated.
   */
  widerCandidates: WiderCandidate[];
};

export const DEFAULT_SEARCH_LIMIT = 10;
export const MAX_SEARCH_LIMIT = 50;

/**
 * Required cross-tier score dominance before a backfill hit may outrank a
 * gated hit. This is a structural, query-independent A/B-validated ranking
 * constant, in the same class as the 0.75 kind weight and 0.4 keyword blend.
 * The scoring drift guard proves gated scores are on the ungated scale, so
 * the comparison is legitimate across the seam.
 */
export const TIER_INTERLEAVE_MARGIN = 1.6;
const BROAD_RETRIEVAL_LANES = new Set(["semantic", "research", "av", "corpus"] as const);
type BroadRetrievalLane = WiderCandidate["lane"];

/**
 * The valid `service` filter values, derived from the catalog itself (unique
 * `entry.service` values, sorted) — the source of truth for the filter-
 * validation layers in src/mcp/tools.ts and src/executor/providers.ts, so a
 * near-miss like "stellardocs" can be rejected with the real names instead of
 * silently matching nothing. Cached per catalog object (a module-singleton
 * JSON import in the Worker); WeakMap so a reloaded manifest never pins the
 * old array.
 */
const servicesCache = new WeakMap<Catalog, readonly string[]>();

export function catalogServices(catalog: Catalog): readonly string[] {
  let services = servicesCache.get(catalog);
  if (!services) {
    services = [...new Set(catalog.entries.map((e) => e.service))].sort();
    servicesCache.set(catalog, services);
  }
  return services;
}

/**
 * Structural invariants over the whole entry set — enforced at load so a bad
 * manifest fails loudly at first use, not silently at call time:
 *  (a) globally unique entry ids (the exact-match id is the whole addressing
 *      scheme; a dup would make resolution order-dependent);
 *  (b) unique terminal name segments among kind:"operation" entries WITHIN a
 *      service — those segments become sandbox function names in providers.ts,
 *      so a collision would silently shadow one operation with another;
 *  (c) every kind:"operation" entry's `service` and terminal name segment is a
 *      legal JS identifier (VALID_IDENT) — providers.ts turns them into sandbox
 *      namespace/function names and would otherwise SILENTLY skip an op with a
 *      bad ident, yielding a searchable-but-uncallable operation. Throwing here
 *      makes a builder regression fail loudly at load, not silently at call;
 *  (d) a `runnable` entry is kind:"skill" and carries BOTH schemas
 *      (research/skill-run-design.md §5) — the flag advertises a callable
 *      contract, so a runnable entry without schemas (or on a non-skill kind)
 *      is a builder bug that would render a broken signature and validate
 *      nothing at dispatch.
 */
const refinedCatalogSchema = catalogSchema.superRefine((catalog, ctx) => {
  const seenIds = new Set<string>();
  const opNamesByService = new Map<string, Map<string, string>>();
  for (const entry of catalog.entries) {
    if (seenIds.has(entry.id)) {
      ctx.addIssue({ code: "custom", message: `duplicate catalog id: ${entry.id}` });
    }
    seenIds.add(entry.id);

    if (entry.runnable === true) {
      if (entry.kind !== "skill") {
        ctx.addIssue({
          code: "custom",
          message: `runnable entry ${entry.id} has kind "${entry.kind}" — runnable is a skill-entry affordance (one skill, one id, read + run)`
        });
      }
      if (!entry.inputSchema || !entry.outputSchema) {
        ctx.addIssue({
          code: "custom",
          message: `runnable skill ${entry.id} is missing ${!entry.inputSchema ? "inputSchema" : "outputSchema"} — a runnable entry must carry both schemas (the callable contract)`
        });
      }
    }

    if (entry.retrievalProfile && entry.kind !== "operation") {
      ctx.addIssue({ code: "custom", message: `retrieval profile entry ${entry.id} is not an operation` });
    }
    if (entry.buildAuthorityRoles && (entry.kind !== "skill" || entry.service !== "skills")) {
      ctx.addIssue({ code: "custom", message: `build authority roles on ${entry.id} require a skills whole-skill entry` });
    }

    if (entry.kind !== "operation") continue;
    const name = lastIdSegment(entry.id);

    if (!VALID_IDENT.test(entry.service)) {
      ctx.addIssue({
        code: "custom",
        message: `operation ${entry.id} has service "${entry.service}" which is not a legal JS identifier (sandbox namespace name)`
      });
    }
    if (!VALID_IDENT.test(name)) {
      ctx.addIssue({
        code: "custom",
        message: `operation ${entry.id} has terminal name "${name}" which is not a legal JS identifier (sandbox fn name)`
      });
    }
    let names = opNamesByService.get(entry.service);
    if (!names) {
      names = new Map();
      opNamesByService.set(entry.service, names);
    }
    const prior = names.get(name);
    if (prior !== undefined) {
      ctx.addIssue({
        code: "custom",
        message: `operation name collision in service "${entry.service}": ${prior} and ${entry.id} both map to sandbox fn "${name}"`
      });
    } else {
      names.set(name, entry.id);
    }
  }

  const byId = new Map(catalog.entries.map((entry) => [entry.id, entry]));
  for (const entry of catalog.entries) {
    if (!entry.retrievalProfile) continue;
    const seenTargets = new Set<string>();
    for (const edge of entry.retrievalProfile.recoverWith) {
      const target = byId.get(edge.id);
      if (!target || target.kind !== "operation") {
        ctx.addIssue({ code: "custom", message: `retrieval profile ${entry.id} references non-exposed operation ${edge.id}` });
      }
      if (edge.id === entry.id) {
        ctx.addIssue({ code: "custom", message: `retrieval profile ${entry.id} contains a self-edge` });
      }
      if (seenTargets.has(edge.id)) {
        ctx.addIssue({ code: "custom", message: `retrieval profile ${entry.id} repeats target ${edge.id}` });
      }
      seenTargets.add(edge.id);
    }
  }
});

/**
 * Parse + validate a raw manifest (e.g. the imported catalog/manifest.json).
 * Throws (ZodError) on malformed input OR a structural invariant violation
 * (see refinedCatalogSchema) — the catalog is generated, so any validation
 * failure is a build bug, not a runtime condition to soften.
 */
export function loadManifest(json: unknown): Catalog {
  return refinedCatalogSchema.parse(json);
}

/** Last id segment (after the final "."), used as the high-weight name field. */
function entryName(entry: CatalogEntry): string {
  return lastIdSegment(entry.id);
}

function outputKeysOf(entry: CatalogEntry): string[] {
  if (entry.kind !== "operation") return [];
  const schema = entry.outputSchema as { properties?: Record<string, unknown> } | undefined;
  return schema?.properties ? Object.keys(schema.properties).sort() : [];
}

function outputItemKeysOf(entry: CatalogEntry): Record<string, string[]> {
  if (entry.kind !== "operation") return {};
  const schema = entry.outputSchema as {
    properties?: Record<string, { type?: unknown; items?: { properties?: Record<string, unknown> } }>;
  } | undefined;
  const out: Record<string, string[]> = {};
  for (const [key, property] of Object.entries(schema?.properties ?? {})) {
    if (property.type !== "array" || !property.items?.properties) continue;
    const itemKeys = Object.keys(property.items.properties).sort();
    if (itemKeys.length > 0) out[key] = itemKeys;
  }
  return out;
}

/**
 * SEARCH-HIT output-type compaction threshold (todo 841): in a search hit, an
 * operation whose rendered OUTPUT type block exceeds this many chars is
 * replaced by a stub declaration (see renderSignature). Why 2000: measured
 * over the whole manifest (2026-07-06), every operation's output block was
 * ≤1,350 chars except three Scout monsters — scout.searchProjects (12,681),
 * scout.searchRepos (4,122), scout.explainRepo (2,099) — so 2000 sat in the
 * dead zone between the ordinary population and the outliers. Coverage has
 * since grown with upstream schemas, not with any threshold change: Scout
 * 1.8.28 pushed several shared response schemas over the line and 1.8.30
 * added ~622 chars of shared `meta` prose (nullable `total` + `totalBasis`),
 * carrying getHackathon and searchResearch over too. 15 Scout operations
 * compact today; the exact set is pinned in test/search.test.ts so a later
 * schema refresh cannot silently widen it. The intent is unchanged — trim
 * only the outliers (a limit-10 page carrying searchProjects was ~26KB, ~6.5k
 * tokens, with the bloat usually attached to an OFF-TARGET hit, making the
 * wrong call the easiest one to copy) while leaving every other operation's
 * search signature byte-identical. Applies to output blocks only — the input
 * type and the callable envelope line are what the model needs to MAKE the
 * call and are never compacted anywhere; the full output type stays one
 * `codemode.describe(id)` away inside `execute`.
 */
export const COMPACT_OUTPUT_THRESHOLD = 2000;

/**
 * Stub declaration standing in for an oversized output type block in a
 * search hit. Keeps (a) the type NAME the callable line references, so the
 * signature still reads as one coherent declaration set, and (b) the output
 * schema's TOP-LEVEL property names — field names teach the model payload
 * shape (`r.data.projects[].slug` starts from knowing `projects` exists), so
 * field selection stays possible without a describe round-trip. Non-object
 * output schemas (no top-level properties to list) degrade to a bare
 * `unknown` stub with the same describe pointer. The interpolated text
 * (property names, entry id) rides inside a block comment, so a literal
 * comment-terminator sequence in it would end the comment early and corrupt
 * the stub — a
 * build-generated schema shouldn't contain one, but the stub must not be
 * corruptible by upstream data, hence the escape.
 */
function inBlockComment(text: string): string {
  return text.replace(/\*\//g, "*\\/");
}

function compactOutputStub(entry: CatalogEntry, typeName: string): string {
  const schema = entry.outputSchema as JsonSchema;
  const pointer = `full shape via codemode.describe(${JSON.stringify(entry.id)})`;
  const props =
    typeof schema === "object" && schema !== null && schema.properties
      ? Object.keys(schema.properties)
      : [];
  if (props.length === 0) {
    return `type ${typeName} = unknown /* ${inBlockComment(`output type elided in search hits — ${pointer}`)} */`;
  }
  return `type ${typeName} = { /* ${inBlockComment(`${props.length} top-level field${props.length === 1 ? "" : "s"}: ${props.join(", ")} — ${pointer}`)} */ }`;
}

/**
 * Render a TypeScript signature for an operation or runnable-skill entry:
 * input/output type declarations plus the callable line the model can use
 * inside `execute` (e.g. `lumenloop.search_directory(input): Promise<...>`;
 * for a runnable skill, `codemode.skill.run("<id>", input): Promise<...>` —
 * research/skill-run-design.md §5: skill.run is a CALL, so its rendered line
 * spells the same service-call envelope union operations do; there is no
 * third shape to teach). Non-runnable skills and sections still render no
 * signature — their affordance is skill.read, not a call.
 *
 * The callable line spells out the full result envelope (adapters/types.ts)
 * rather than a bare Promise<Output>: the signature is what LLM code copies
 * from, and a bare Promise<Output> reads as "payload fields at the top
 * level" — exactly the wrong access (`r.projects` instead of
 * `r.data.projects`) the envelope exists to prevent.
 *
 * `compactOversizedOutput` (todo 841) is the SEARCH-HIT rendering mode: the
 * input type block and the callable line are always full (they are what the
 * model needs to make the call), but an output type block over
 * COMPACT_OUTPUT_THRESHOLD chars is replaced by a stub that keeps the type
 * name and the top-level field names (compactOutputStub above). Compaction
 * wraps AROUND the vendored renderer — src/catalog/vendor/json-schema-types.ts
 * stays byte-untouched. `codemode.describe` always renders full (default
 * mode): describe is the canonical detail-on-demand step, so it must carry
 * exactly what the search hit elided.
 */
export function renderSignature(
  entry: CatalogEntry,
  opts?: { compactOversizedOutput?: boolean }
): string | undefined {
  const callableEntry = entry.kind === "operation" || entry.runnable === true;
  if (!callableEntry || !entry.inputSchema) return undefined;
  const typeBase = toPascalCase(sanitizeToolName(entryName(entry)));
  const parts: string[] = [];
  parts.push(jsonSchemaToType(entry.inputSchema as JsonSchema, `${typeBase}Input`));
  if (entry.outputSchema) {
    const outputBlock = jsonSchemaToType(entry.outputSchema as JsonSchema, `${typeBase}Output`);
    parts.push(
      opts?.compactOversizedOutput && outputBlock.length > COMPACT_OUTPUT_THRESHOLD
        ? compactOutputStub(entry, `${typeBase}Output`)
        : outputBlock
    );
  }
  const outputType = entry.outputSchema ? `${typeBase}Output` : "unknown";
  // Callable line as the model uses it inside `execute`: the namespaced
  // global for operations; the codemode.skill.run dispatch for runnable
  // skills (exact-id first argument — ids are exact-match, never fuzzy).
  const callable = entry.runnable
    ? `codemode.skill.run(${JSON.stringify(entry.id)}, input: ${typeBase}Input)`
    : `${entry.id}(input: ${typeBase}Input)`;
  parts.push(
    `${callable}: Promise<{ ok: true, data: ${outputType} } | { ok: false, error: { kind: "error" | "soft-empty", message: string, hint?: string } }>`
  );
  return parts.join("\n");
}

/**
 * Section keys of a skill, from its `skill-section` catalog entries
 * (`skillId#<key>`): the same key set src/skills/store.ts advertises as
 * `availableSections` (`##` slugs, then `file:<relpath>` keys — catalog
 * entries are id-sorted, store.ts is document-ordered, so ORDER may differ).
 * Exported (todo 841) so `codemode.describe` (src/executor/providers.ts)
 * advertises the SAME key set search hits carry — one derivation, no drift.
 */
export function sectionKeysOf(catalog: Catalog, skillId: string): string[] {
  const prefix = `${skillId}#`;
  const slugs: string[] = [];
  const fileKeys: string[] = [];
  for (const e of catalog.entries) {
    if (e.kind !== "skill-section" || !e.id.startsWith(prefix)) continue;
    const key = e.id.slice(prefix.length);
    (key.startsWith("file:") ? fileKeys : slugs).push(key);
  }
  return [...slugs, ...fileKeys];
}

/**
 * One scoring pass over the catalog: filter (kind/service), score with
 * `scoreFn`, and sort score desc then id asc. Shared by both tiers of
 * searchCatalogPage() so tier 2 is the SAME pipeline under a different
 * scorer; the caller diversifies + pages the result (split out of the old
 * selectPage so the pre-paging candidate COUNT is observable for `total`,
 * todo 840 — diversifyByService(scoreCandidates(...), pageLimit) is the old
 * selectPage, term for term). The catalog needs no exposure filter:
 * everything in the manifest is exposed by construction (ADR-0003).
 */
function scoreCandidates(
  catalog: Catalog,
  opts: SearchOptions,
  scoreFn: typeof scoreEntryWeighted
): { entry: CatalogEntry; score: number }[] {
  const scored: { entry: CatalogEntry; score: number }[] = [];
  for (const entry of catalog.entries) {
    // Search-visibility seam (skills-form arms): searchable:false entries are
    // exposed (exact-id describe/read/run) but never scored or counted here.
    if (entry.searchable === false) continue;
    if (opts.kind && entry.kind !== opts.kind) continue;
    if (opts.service && entry.service !== opts.service) continue;
    const score = scoreFn(
      {
        id: entry.id,
        name: entryName(entry),
        service: entry.service,
        kind: entry.kind,
        description: entry.description,
        keywords: entry.keywords,
        routingKeywords: entry.routingKeywords
      },
      opts.query
    );
    if (score === null) continue;
    scored.push({ entry, score });
  }

  scored.sort((a, b) => b.score - a.score || (a.entry.id < b.entry.id ? -1 : 1));

  return scored;
}

type SelectedCandidate = { entry: CatalogEntry; score: number };
type TieredCandidate = SelectedCandidate & { tier: SearchHit["tier"] };

/**
 * Stably reorder one already-selected mixed-tier page without changing its
 * membership. In a single left-to-right pass over the backfill run, each
 * backfill hit swaps left across consecutive adjacent gated hits while its
 * score is at least TIER_INTERLEAVE_MARGIN times theirs. It stops at the
 * first gated hit it does not dominate or at an earlier backfill hit. Thus
 * order within each tier is preserved, and equality at the margin qualifies.
 */
function interleaveSelectedPage(
  selected: SelectedCandidate[],
  gatedCount: number
): TieredCandidate[] {
  const reordered: TieredCandidate[] = selected.map((candidate, index) => ({
    ...candidate,
    tier: index < gatedCount ? "gated" : "backfill"
  }));
  for (let index = gatedCount; index < reordered.length; index++) {
    let cursor = index;
    while (cursor > 0) {
      const backfill = reordered[cursor]!;
      const preceding = reordered[cursor - 1]!;
      if (
        backfill.tier !== "backfill" ||
        preceding.tier !== "gated" ||
        backfill.score < TIER_INTERLEAVE_MARGIN * preceding.score
      ) {
        break;
      }
      reordered[cursor - 1] = backfill;
      reordered[cursor] = preceding;
      cursor--;
    }
  }
  return reordered;
}

/**
 * Ranked search over the catalog, with pagination facts. Pure; results
 * sorted by score desc, then id asc for determinism (within a tier — see
 * below).
 *
 * Internal scoring (round 2, todo 793 — contract unchanged): the vendored
 * lexical score is wrapped by src/catalog/scoring.ts (query stopword
 * filtering, kind weighting, per-service diversity in the returned set);
 * rationale documented there.
 *
 * Tiered gate-rescue backfill (round 4, M1): tier 1 is the pipeline above,
 * unchanged — when it fills the page, the result is byte-identical to the
 * pre-tiering behavior. Only when tier 1 leaves the page short (fewer than
 * `limit` gate-passing candidates exist — measured: 58/122 extended-lane
 * questions, all >20 tokens, gated to ZERO) is the same pipeline re-run with
 * the coverage gate bypassed (scoring.ts lever 5) and its novel hits
 * appended to complete membership, then the fixed page is stably interleaved:
 * a tier-2 hit never outranks a tier-1 hit unless its ungated score is >=
 * TIER_INTERLEAVE_MARGIN times the gated hit's score. The drift guard in
 * test/scoring.test.ts proves scoreEntryUngated equals scoreEntry wherever
 * the gate passes, so hit.score is a common scale across the seam. The
 * tier-2 page is drawn at `limit + 10` so diversity quotas are computed over
 * a wider slate before the tier-1 duplicates are removed.
 *
 * `total`/`truncated` (todo 840): total counts distinct candidates the
 * consulted scorer tiers accepted (post-filter, pre-diversity/paging) —
 * tier-1 candidates alone when tier 1 filled the page; plus the NOVEL tier-2
 * candidates (ungated minus gated ids) when the backfill ran. Counting only
 * consulted tiers keeps the number honest: it is exactly the pool this
 * response's ranking drew from, not a hypothetical deeper search.
 */
export function searchCatalogPage(catalog: Catalog, opts: SearchOptions): SearchPage {
  // Number.isFinite, not `?? DEFAULT`: `codemode.search` inside the sandbox
  // admits any `typeof opts.limit === "number"` (src/executor/providers.ts),
  // and `typeof NaN === "number"`. Model-authored code computing a limit
  // (`n * 2` over undefined, `+"ten"`, `0/0`) yields NaN, and every comparison
  // against NaN is false — so the clamp AND the pagination below silently
  // disappear and the page returns EVERY gated candidate with
  // `truncated: false`, i.e. the contract claims a complete answer while
  // having dropped its own bounds. Clamp here, at the one chokepoint every
  // caller (public tool, demo, codemode.search, eval lanes) routes through.
  const requested = opts.limit;
  const limit = Math.max(
    1,
    Math.min(Number.isFinite(requested) ? (requested as number) : DEFAULT_SEARCH_LIMIT, MAX_SEARCH_LIMIT)
  );

  const gated = scoreCandidates(catalog, opts, scoreEntryWeighted);
  let selected = diversifyByService(gated, limit, (s) => s.entry.service);
  let total = gated.length;
  const gatedCount = selected.length; // page seam: hits below this index are tier 2
  if (selected.length < limit) {
    // Tier 2: every gate-passing candidate is already on the short page
    // (diversifyByService only leaves slots empty when candidates ran out —
    // so the page's ids ARE the full gated id set here), and after dropping
    // those ids the ungated re-run contributes gate-failed entries only.
    const tier1Ids = new Set(selected.map((s) => s.entry.id));
    const ungated = scoreCandidates(catalog, opts, scoreEntryWeightedUngated);
    total = gated.length + ungated.filter((s) => !tier1Ids.has(s.entry.id)).length;
    const rescue = diversifyByService(ungated, limit + 10, (s) => s.entry.service).filter(
      (s) => !tier1Ids.has(s.entry.id)
    );
    selected = [...selected, ...rescue].slice(0, limit);
  }

  // Membership is now final and sliced to `limit`. Reorder only this fixed
  // page; total and truncated therefore retain their pre-interleave meaning.
  const reordered = interleaveSelectedPage(selected, gatedCount);

  const hits = reordered.map(({ entry, score, tier }) => {
    const hit: SearchHit = {
      id: entry.id,
      service: entry.service,
      kind: entry.kind,
      score,
      tier,
      description: entry.description
    };
    // Search-hit rendering mode: oversized output type blocks become stubs
    // (COMPACT_OUTPUT_THRESHOLD above) — the full signature is describe's job.
    // Runnable-skill hits render one too (the skill.run callable line, the
    // §10 adoption surface) AND keep availableSections below — one skill, one
    // id, two affordances (read + run).
    const signature = renderSignature(entry, { compactOversizedOutput: true });
    if (signature) hit.signature = signature;
    const outputKeys = outputKeysOf(entry);
    if (outputKeys.length > 0) hit.outputKeys = outputKeys;
    const outputItemKeys = outputItemKeysOf(entry);
    if (Object.keys(outputItemKeys).length > 0) hit.outputItemKeys = outputItemKeys;
    if (entry.kind === "skill") {
      const sections = sectionKeysOf(catalog, entry.id);
      if (sections.length > 0) hit.availableSections = sections;
    }
    return hit;
  });

  return {
    hits,
    total,
    truncated: total > hits.length,
    effectiveLimit: limit,
    widerCandidates: deriveWiderCandidates(catalog, hits, opts)
  };
}

function widerCandidateOf(
  entry: CatalogEntry,
  basis: WiderCandidate["basis"]
): WiderCandidate | undefined {
  const lane = entry.retrievalProfile?.lane;
  if (
    entry.kind !== "operation" ||
    lane === undefined ||
    !BROAD_RETRIEVAL_LANES.has(lane as BroadRetrievalLane)
  ) {
    return undefined;
  }
  const signature = renderSignature(entry, { compactOversizedOutput: true });
  const outputKeys = outputKeysOf(entry);
  const outputItemKeys = outputItemKeysOf(entry);
  return {
    id: entry.id,
    service: entry.service,
    lane: lane as BroadRetrievalLane,
    basis,
    description: entry.description,
    ...(signature ? { signature } : {}),
    ...(outputKeys.length > 0 ? { outputKeys } : {}),
    ...(Object.keys(outputItemKeys).length > 0 ? { outputItemKeys } : {})
  };
}

function catalogBroadAnchors(
  catalog: Catalog,
  service: string | undefined
): CatalogEntry[] {
  const byId = new Map(catalog.entries.map((entry) => [entry.id, entry]));
  const inbound = new Map<string, Set<string>>();
  for (const source of catalog.entries) {
    if (source.kind !== "operation" || !source.retrievalProfile) continue;
    for (const edge of source.retrievalProfile.recoverWith) {
      const target = byId.get(edge.id);
      const lane = target?.retrievalProfile?.lane;
      if (
        !target ||
        target.kind !== "operation" ||
        lane === undefined ||
        !BROAD_RETRIEVAL_LANES.has(lane as BroadRetrievalLane) ||
        (service !== undefined && target.service !== service)
      ) {
        continue;
      }
      let sources = inbound.get(target.id);
      if (!sources) {
        sources = new Set();
        inbound.set(target.id, sources);
      }
      sources.add(source.id);
    }
  }

  const laneOrder = new Map(
    RETRIEVAL_LANES.map((lane, index) => [lane, index] as const)
  );
  const winners = new Map<BroadRetrievalLane, CatalogEntry>();
  for (const [id] of inbound) {
    const entry = byId.get(id);
    const lane = entry?.retrievalProfile?.lane as BroadRetrievalLane | undefined;
    if (!entry || !lane) continue;
    const prior = winners.get(lane);
    const count = inbound.get(entry.id)?.size ?? 0;
    const priorCount = prior ? (inbound.get(prior.id)?.size ?? 0) : -1;
    if (!prior || count > priorCount || (count === priorCount && entry.id < prior.id)) {
      winners.set(lane, entry);
    }
  }
  return [...winners.values()].sort((a, b) => {
    const countDiff = (inbound.get(b.id)?.size ?? 0) - (inbound.get(a.id)?.size ?? 0);
    if (countDiff !== 0) return countDiff;
    const laneDiff =
      (laneOrder.get(a.retrievalProfile!.lane) ?? Number.MAX_SAFE_INTEGER) -
      (laneOrder.get(b.retrievalProfile!.lane) ?? Number.MAX_SAFE_INTEGER);
    return laneDiff || (a.id < b.id ? -1 : 1);
  });
}

function deriveWiderCandidates(
  catalog: Catalog,
  hits: readonly SearchHit[],
  opts: SearchOptions,
  limit = 3
): WiderCandidate[] {
  if (limit <= 0 || opts.kind === "skill") return [];
  const allBackfill = hits.length > 0 && hits.every((hit) => hit.tier === "backfill");
  if (hits.length > 0 && !allBackfill) return [];

  const byId = new Map(catalog.entries.map((entry) => [entry.id, entry]));
  const selectedIds = new Set<string>();
  const selectedLanes = new Set<BroadRetrievalLane>();
  const out: WiderCandidate[] = [];
  const add = (entry: CatalogEntry | undefined, basis: WiderCandidate["basis"]) => {
    if (!entry || selectedIds.has(entry.id)) return;
    if (opts.service !== undefined && entry.service !== opts.service) return;
    const profile = entry.retrievalProfile;
    // Same-lane broader-semantic edges mark narrower ops; let canonical anchor take lane.
    if (profile?.recoverWith.some((edge) => {
      const target = byId.get(edge.id);
      return edge.relation === "broader-semantic" &&
        target?.kind === "operation" &&
        target.retrievalProfile?.lane === profile.lane;
    })) return;
    const candidate = widerCandidateOf(entry, basis);
    if (!candidate || selectedLanes.has(candidate.lane)) return;
    selectedIds.add(candidate.id);
    selectedLanes.add(candidate.lane);
    out.push(candidate);
  };

  if (allBackfill) {
    for (const hit of hits) {
      add(byId.get(hit.id), "page-broad-hit");
      if (out.length >= limit) return out;
    }
  }
  for (const anchor of catalogBroadAnchors(catalog, opts.service)) {
    add(anchor, "catalog-anchor");
    if (out.length >= limit) break;
  }
  return out;
}

/**
 * The frozen-contract entry point (scratchpad 514; eval/run-routing.mjs and
 * the vitest suites import this): the same page as searchCatalogPage, hits
 * only. Thin wrapper by construction so the two can never disagree.
 */
export function searchCatalog(catalog: Catalog, opts: SearchOptions): SearchHit[] {
  return searchCatalogPage(catalog, opts).hits;
}

/**
 * Exact-ID, query-independent recovery suggestions. They are deliberately
 * separate from ranked hits: normal scorer membership/order never changes.
 */
export function recoveryCandidates(
  catalog: Catalog,
  fromIds: readonly string[],
  reason?: RetrievalReason,
  limit = 3
): RecoveryCandidate[] {
  if (limit <= 0) return [];
  const attempted = new Set(fromIds);
  const byId = new Map(catalog.entries.map((entry) => [entry.id, entry]));
  const selected = new Set<string>();
  const out: RecoveryCandidate[] = [];
  for (const from of fromIds) {
    const source = byId.get(from);
    if (!source?.retrievalProfile) continue;
    for (const edge of source.retrievalProfile.recoverWith) {
      if (reason && !edge.on.includes(reason)) continue;
      if (attempted.has(edge.id) || selected.has(edge.id)) continue;
      const target = byId.get(edge.id);
      if (!target || target.kind !== "operation") continue;
      const signature = renderSignature(target, { compactOversizedOutput: true });
      const outputKeys = outputKeysOf(target);
      const outputItemKeys = outputItemKeysOf(target);
      out.push({
        from,
        id: target.id,
        service: target.service,
        relation: edge.relation,
        reasons: [...edge.on],
        lane: source.retrievalProfile.lane,
        description: target.description,
        ...(signature ? { signature } : {}),
        ...(outputKeys.length > 0 ? { outputKeys } : {}),
        ...(Object.keys(outputItemKeys).length > 0 ? { outputItemKeys } : {})
      });
      selected.add(edge.id);
      if (out.length >= limit) return out;
    }
  }
  return out;
}

/**
 * Execute-time graph walk: derive candidates from successful source
 * operations while excluding every operation already attempted in the run.
 * Separate source/exclusion sets avoid traversing failed calls merely because
 * they must not be suggested again.
 */
export function recoveryCandidatesFromSources(
  catalog: Catalog,
  fromIds: readonly string[],
  excludeIds: readonly string[],
  limit = 3
): RecoveryCandidate[] {
  if (limit <= 0) return [];
  const excluded = new Set(excludeIds);
  const byId = new Map(catalog.entries.map((entry) => [entry.id, entry]));
  const selected = new Set<string>();
  const out: RecoveryCandidate[] = [];
  for (const from of fromIds) {
    const source = byId.get(from);
    if (!source?.retrievalProfile) continue;
    for (const edge of source.retrievalProfile.recoverWith) {
      if (excluded.has(edge.id) || selected.has(edge.id)) continue;
      const target = byId.get(edge.id);
      if (!target || target.kind !== "operation") continue;
      const signature = renderSignature(target, { compactOversizedOutput: true });
      const outputKeys = outputKeysOf(target);
      const outputItemKeys = outputItemKeysOf(target);
      out.push({
        from,
        id: target.id,
        service: target.service,
        relation: edge.relation,
        reasons: [...edge.on],
        lane: source.retrievalProfile.lane,
        description: target.description,
        ...(signature ? { signature } : {}),
        ...(outputKeys.length > 0 ? { outputKeys } : {}),
        ...(Object.keys(outputItemKeys).length > 0 ? { outputItemKeys } : {})
      });
      selected.add(edge.id);
      if (out.length >= limit) return out;
    }
  }
  return out;
}
