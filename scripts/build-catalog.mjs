#!/usr/bin/env node
/**
 * build-catalog.mjs — deterministic catalog builder (PLAN §2).
 *
 * Reads the three inventory snapshots (inventory/*.json) + the skill pin set
 * (ecosystem-skills/MANIFEST.json) and emits catalog/manifest.json — the unified
 * index the MCP `search` tool ranks. Zero dependencies. NOT offline: skill
 * bodies are not stored in this repo, so the pinned files are fetched from
 * upstream and hash-verified (scripts/lib/skill-mirror.mjs), through a
 * gitignored working cache. Everything else is a committed input.
 *
 * Determinism: entries sorted by id, object keys sorted recursively,
 * generatedAt derived from the NEWEST input snapshot timestamp (never wall
 * clock) — running twice on the same inputs yields byte-identical output.
 *
 * The entry shape is validated end-to-end by src/catalog/types.ts
 * (catalogSchema) in test/catalog.test.ts; this script stays plain JS so it
 * runs with `node` alone.
 */
import { readFileSync, mkdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
// Loaded via native type stripping (Node >= 23.6) — the same way
// eval/run-routing.mjs imports src/catalog/search.ts. Still zero deps.
import { extractKeywords } from "../src/catalog/extract-keywords.ts";
import { tokenize } from "../src/catalog/vendor/search-scoring.ts";
// The runnable-skill allowlist-as-data (research/skill-run-design.md §2/§5):
// the SAME registry the runtime dispatch and the super-spec emitter consume,
// so the exposed runnable surface cannot drift between emitters.
import { RUNNERS } from "../src/skills/runners/index.ts";
import { writeFileAtomic } from "./lib/shared.mjs";
import { loadSkillTexts, skillFileUrl } from "./lib/skill-mirror.mjs";
import { RETRIEVAL_PROFILES } from "./catalog-data/retrieval-profiles.mjs";
import { lumenloopInputSchema, lumenloopOutputSchema } from "../src/adapters/lumenloop-shape.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_PATH = join(ROOT, "catalog", "manifest.json");

const readJson = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

// ---------------------------------------------------------------------------
// Operation keywords: descriptions are prose, so
// schema-level vocabulary — property names and enum values — plus the docs
// page-title snapshot are lexically invisible to the search scorer. Distill
// them into the same low-weight `keywords` field skill sections carry
// (KEYWORD_BLEND damping, scoring.ts lever 4). Two noise controls, both
// measured necessary (a naive schema-prose version regressed extended strict
// top1 74→71 and skills top5 23→22 on 2026-07-03): only NAMES and ENUMS are
// harvested (no schema description prose), and tokens shared across a large
// fraction of the same service's operations (pagination/envelope
// boilerplate: page, offset, total, …) are dropped by a document-frequency
// filter — shared vocabulary distinguishes nothing and rescues wrong ops
// into the gated tier.
// ---------------------------------------------------------------------------

/** Collect property names and enum values from a JSON schema subtree. */
function schemaTextParts(schema, out = []) {
  if (!schema || typeof schema !== "object") return out;
  if (Array.isArray(schema)) {
    for (const item of schema) schemaTextParts(item, out);
    return out;
  }
  for (const [key, value] of Object.entries(schema)) {
    if (key === "properties" && value && typeof value === "object" && !Array.isArray(value)) {
      for (const [prop, sub] of Object.entries(value)) {
        out.push(prop);
        schemaTextParts(sub, out);
      }
    } else if (key === "enum" && Array.isArray(value)) {
      for (const v of value) if (typeof v === "string") out.push(v);
    } else if (value && typeof value === "object") {
      schemaTextParts(value, out);
    }
  }
  return out;
}

/**
 * Fraction of a service's ops sharing a token before it is considered
 * boilerplate. 0.3: an envelope field on every op is dropped; a field
 * shared by 2–3 related ops (of 12+) survives.
 */
const OP_KEYWORD_MAX_DF = 0.3;

/**
 * Attach `keywords` to each operation entry of ONE service. Non-operation
 * entries pass through untouched. `extraBodiesById` adds service-specific
 * vocabulary sources (docs page titles), which join the schema tokens under
 * the SAME document-frequency filter: a routing keyword is only useful when
 * it distinguishes this op from its siblings ("muxed" appears on one docs
 * op and survives; "contract" appears on most and is dropped).
 */
function attachOperationKeywords(entries, extraBodiesById = new Map(), { cap } = {}) {
  const ops = entries.filter((e) => e.kind === "operation");
  const tokenSetById = new Map(
    ops.map((e) => [
      e.id,
      new Set(
        tokenize(
          [
            ...schemaTextParts(e.inputSchema),
            ...schemaTextParts(e.outputSchema),
            ...(extraBodiesById.get(e.id) ?? [])
          ].join("\n")
        )
      )
    ])
  );
  const df = new Map();
  for (const set of tokenSetById.values()) {
    for (const t of set) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const maxDf = Math.max(1, Math.floor(ops.length * OP_KEYWORD_MAX_DF));
  return entries.map((entry) => {
    const tokens = tokenSetById.get(entry.id);
    if (!tokens) return entry;
    const distinctive = [...tokens].filter((t) => (df.get(t) ?? 0) <= maxDf);
    const keywords = extractKeywords(distinctive.join(" "), {
      exclude: [
        entry.id,
        entry.service,
        entry.kind,
        entry.description,
        // A token already in routingKeywords must not ride both blends
        // (scoring.ts levers 4 + 7 are additive).
        ...(entry.routingKeywords ?? [])
      ],
      ...(cap !== undefined ? { cap } : {})
    });
    return keywords.length > 0 ? { ...entry, keywords } : entry;
  });
}

/**
 * Attach `routingKeywords` (scoring.ts lever 7) to operation entries from
 * upstream-curated routing vocabulary (`bodiesById`: Scout's x-routing
 * purpose/useWhen/exampleQuestions/keywords, collected by buildScout).
 * Deliberately NO document-frequency filter (unlike attachOperationKeywords):
 * the vocabulary is curated per-op upstream, so cross-op overlap is signal,
 * not schema shrapnel. extractKeywords still dedups against the entry's
 * already-scored fields, and the result lands in its own field so scoring
 * can weight curated routing vocabulary above schema keywords. Run BEFORE
 * attachOperationKeywords so the schema pass can exclude these tokens.
 */
function attachRoutingKeywords(entries, bodiesById) {
  return entries.map((entry) => {
    const bodies = bodiesById.get(entry.id);
    if (!bodies || bodies.length === 0) return entry;
    // Explicit 256 cap (four times the schema-keyword default 64): upstream
    // curates this field for routing, and new repeated vocabulary must not
    // evict previously-visible terms from a broad operation. Scout 1.7.18's
    // largest set is 149 tokens; 256 keeps it whole while still bounding the
    // Worker-bundled manifest.
    const routingKeywords = extractKeywords(bodies.join("\n"), {
      exclude: [entry.id, entry.service, entry.kind, entry.description],
      cap: 256
    });
    return routingKeywords.length > 0 ? { ...entry, routingKeywords } : entry;
  });
}

/**
 * Per-operation page-title bodies for stellarDocs: titles from
 * inventory/stellar-docs-titles.json scoped by each op's clientFilter URL
 * prefixes. Whole-corpus ops (no prefix filter) get none — vocabulary shared
 * by the whole surface distinguishes nothing.
 */
function stellarDocsTitleExtras(entries, titlesSnapshot) {
  const out = new Map();
  for (const entry of entries) {
    const prefixes = entry.transport?.algolia?.clientFilter?.prefixesAnyOf;
    if (!Array.isArray(prefixes) || prefixes.length === 0) continue;
    const pathPrefixes = prefixes.map((p) => p.replace(/^https?:\/\/[^/]+/, ""));
    const titles = titlesSnapshot.titles
      .filter((t) => pathPrefixes.some((p) => t.path.startsWith(p)))
      .map((t) => t.title);
    if (titles.length > 0) out.set(entry.id, [titles.join("\n")]);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Exposure filtering — build-time, data-driven (ADR-0003; supersedes the
// runtime deny-list of ADR-0002). The manifest IS the exposed surface: an
// entry is either emitted (callable/readable) or it does not exist to
// consumers. The exclusion DATA lives in scripts/exposure.mjs, shared by every
// emitter (manifest, super-spec, description rewrites, skill sectioning) so the
// surfaces cannot drift; the fail-loud guards that pin that data to the live
// inventories live here, where the inventory inputs are read. Exclusion
// reasons live in exposure.mjs and the ADRs — never in emitted entries, never
// as runtime policy.
// ---------------------------------------------------------------------------

// Drift guard: exclusions are exact-match data, so an upstream rename/removal
// must break the build (stale exclusion = a write endpoint may have moved),
// not silently stop matching.
function assertScoutExclusionsResolve(openapi) {
  const present = new Set();
  for (const [path, pathItem] of Object.entries(openapi.paths)) {
    for (const method of HTTP_METHODS) {
      if (pathItem[method]) present.add(`${method.toUpperCase()} ${path}`);
    }
  }
  const stale = [...EXCLUDED_SCOUT_OPS].filter((k) => !present.has(k));
  if (stale.length > 0) {
    throw new Error(
      `EXCLUDED_SCOUT_OPS no longer present in the scout OpenAPI: ${stale.join(", ")}. ` +
        `Upstream renamed or removed them — reconcile the exclusion list in build-catalog.mjs.`
    );
  }
}

// Inverse gate: upstream marks write/side-effecting scout operations with
// `x-side-effecting: true` (all three current POSTs carry it, all excluded).
// A FUTURE marked operation must not auto-emit just because nobody updated
// the exclusion data — emitting a side-effecting op is a reviewed exposure
// decision (ADR-0003; AGENTS.md hard rules), never a default. Exported for
// the guard tests. Found by the 2026-07-12 coverage review (Solo 607): until
// this gate, the upstream signal was ingested but enforced nowhere.
export function assertSideEffectingOpsExcluded(openapi, excluded = EXCLUDED_SCOUT_OPS) {
  for (const [path, pathItem] of Object.entries(openapi.paths ?? {})) {
    for (const method of HTTP_METHODS) {
      const op = pathItem[method];
      if (!op || op["x-side-effecting"] !== true) continue;
      const key = `${method.toUpperCase()} ${path}`;
      if (!excluded.has(key)) {
        throw new Error(
          `exposure gate: upstream marks "${key}" x-side-effecting but the exclusion data ` +
            `(scripts/exposure.mjs EXCLUDED_SCOUT_OPS) does not cover it. Decide the policy — ` +
            `exclude it, or expose it deliberately through the reviewed side-effect path — ` +
            `before the catalog can build (ADR-0003).`
        );
      }
    }
  }
}

function assertLumenloopExclusionsResolve(inv) {
  const names = new Set(inv.tools.map((t) => t.name));
  const stale = [...EXCLUDED_LUMENLOOP_OPS].filter((n) => !names.has(n));
  if (stale.length > 0) {
    throw new Error(
      `EXCLUDED_LUMENLOOP_OPS no longer present in the lumenloop inventory: ${stale.join(", ")}. ` +
        `Upstream renamed or removed them — reconcile the exclusion list in build-catalog.mjs.`
    );
  }
}

// Refresh-safety guard: the retirement is pinned to upstream skill NAMES, so an
// ecosystem-skills re-sync (update.sh) that RENAMES or REMOVES a retired skill
// would silently un-retire it (the stale name would stop matching and the skill
// would leak back into the exposed catalog). Fail the build LOUDLY instead —
// forcing a human to reconcile RETIRED_ONBOARDING_SKILLS with the new mirror.
function assertRetirementNamesResolve(skillsManifest) {
  const mirrorNames = new Set(
    skillsManifest.sources.flatMap((s) => s.skills.map((sk) => sk.name))
  );
  const stale = [...RETIRED_ONBOARDING_SKILLS].filter((n) => !mirrorNames.has(n));
  if (stale.length > 0) {
    throw new Error(
      `RETIRED_ONBOARDING_SKILLS names no longer present in the skills mirror: ${stale.join(", ")}. ` +
        `An upstream sync renamed or removed them — reconcile the exclusion list in build-catalog.mjs ` +
        `(retire the new name, or drop the entry if the skill is gone) so nothing silently un-retires.`
    );
  }
}

// Lumenloop serves 14 skills of its own via /v1/skills (metadata only; bodies
// are zips). They are NOT emitted: every PUBLIC one duplicates a canonical
// skills.* mirror entry — one skill, one id (ADR-0003 kills the
// lumenloop.skill.* twin namespace entirely). Guard the duplication assumption
// loudly: a NEW upstream-served public skill with no mirror counterpart must
// break the build (mirror it via ecosystem-skills/update.sh, or exclude it
// here with a reason), not vanish silently.
//
// Partner-set skills are exempt BY POLICY: they are deliberately not mirrored
// (partner-tier content must not live in this public repo — mirror source
// removed 2026-07-06) and never emitted. The inventory keeps them as
// name-only stubs (`set: "partner"`, no description/files) purely so the
// /v1/skills union stays observable and drift in the partner set still
// surfaces in inventory diffs.
function assertLumenloopSkillsMirrored(inv, skillsManifest) {
  const mirrorNames = new Set(
    skillsManifest.sources.flatMap((s) => s.skills.map((sk) => sk.name))
  );
  const unmirrored = inv.skills
    .filter((s) => s.set !== "partner")
    .map((s) => s.name)
    .filter((n) => !mirrorNames.has(n));
  if (unmirrored.length > 0) {
    throw new Error(
      `Lumenloop /v1/skills serves public skills with no ecosystem-skills mirror counterpart: ` +
        `${unmirrored.join(", ")}. Mirror them (ecosystem-skills/update.sh) or exclude them ` +
        `here with a reason — API-served skills are never emitted directly (ADR-0003).`
    );
  }
}

// Description notes shared with build-super-spec.mjs — see that module for
// rationale (single source so manifest and in-sandbox spec cannot drift).
import {
  LUMENLOOP_DESCRIPTION_NOTES,
  SCOUT_DESCRIPTION_NOTES,
  SCOUT_DESCRIPTION_SCRUBS,
  scoutRefRewrites,
  rewriteScoutRefs,
  scrubScoutDescription,
  scrubNonExposedScoutSchemaRefs
} from "./description-notes.mjs";
import {
  EXCLUDED_LUMENLOOP_OPS,
  EXCLUDED_SCOUT_OPS,
  RETIRED_ONBOARDING_SKILLS,
  lumenloopOpExcluded,
  scrubRetiredSkillRefs
} from "./exposure.mjs";
import { assertNoNonExposedRefsInText } from "./emitted-text-guard.mjs";
import { parseFrontmatter, plainText, slugify } from "./lib/skill-markdown.mjs";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Recursively sort object keys (arrays keep order) for stable output. */
function sortKeysDeep(value) {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = sortKeysDeep(value[key]);
    return out;
  }
  return value;
}

/** Resolve internal $refs against a root doc, inlining them (cycle-safe). */
function inlineRefs(schema, root, seen = new Set()) {
  if (Array.isArray(schema)) return schema.map((s) => inlineRefs(s, root, seen));
  if (!schema || typeof schema !== "object") return schema;
  if (typeof schema.$ref === "string") {
    const ref = schema.$ref;
    if (!ref.startsWith("#/") || seen.has(ref)) return { ...schema };
    let target = root;
    for (const seg of ref.slice(2).split("/")) {
      const key = seg.replace(/~1/g, "/").replace(/~0/g, "~");
      if (!target || typeof target !== "object") return { ...schema };
      target = target[key];
    }
    if (target === undefined) return { ...schema };
    return inlineRefs(target, root, new Set(seen).add(ref));
  }
  const out = {};
  for (const [key, value] of Object.entries(schema)) out[key] = inlineRefs(value, root, seen);
  return out;
}

/** First paragraph after `startIndex` in `lines` (skips blanks, stops at blank/heading). */
function firstParagraph(lines, startIndex) {
  let i = startIndex;
  while (i < lines.length && lines[i].trim() === "") i++;
  const para = [];
  while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("#")) {
    para.push(lines[i]);
    i++;
  }
  return plainText(para.join(" "));
}

// ---------------------------------------------------------------------------
// Lumenloop — one entry per exposed tool (exclusions filtered at build time;
// API-served skills are never emitted — see assertLumenloopSkillsMirrored)
// ---------------------------------------------------------------------------

function buildLumenloop(inv) {
  const entries = [];
  const origin = inv.source.base.replace(/\/v1$/, ""); // https://api.lumenloop.com
  const consumedNotes = new Set();

  for (const tool of inv.tools) {
    // Partner-lane tools exist in the inventory only as name stubs (no
    // description/schemas — partner-tier detail is not persisted in this
    // public repo). A stub that is not excluded is unemittable AND a policy
    // breach: fail loudly so exposing a partner tool is always a deliberate
    // change (extend the exclusions, or restore detail persistence together
    // with the budget gate — see CLAUDE.md's research-lane rule).
    if (tool.partner_stub && !lumenloopOpExcluded(tool)) {
      throw new Error(
        `lumenloop tool "${tool.name}" is a partner name-only stub but is not excluded — ` +
          `it cannot be emitted. Add it to EXCLUDED_LUMENLOOP_OPS (scripts/exposure.mjs), or ` +
          `deliberately restore partner detail persistence in scripts/refresh-inventory.mjs.`
      );
    }
    if (lumenloopOpExcluded(tool)) continue;
    const descriptionParts = [tool.description];
    if (tool.when_to_use) descriptionParts.push(`When to use: ${tool.when_to_use}`);
    if (tool.returns) descriptionParts.push(`Returns: ${tool.returns}`);
    const note = LUMENLOOP_DESCRIPTION_NOTES[tool.name];
    if (note !== undefined) {
      descriptionParts.push(note);
      consumedNotes.add(tool.name);
    }
    entries.push({
      id: `lumenloop.${tool.name}`,
      service: "lumenloop",
      kind: "operation",
      description: descriptionParts.join("\n\n"),
      inputSchema: lumenloopInputSchema(`lumenloop.${tool.name}`, tool.input_schema ?? null),
      outputSchema: lumenloopOutputSchema(`lumenloop.${tool.name}`, tool.output_schema ?? null),
      transport: { type: "http", method: "POST", path: `/v1/tools/${tool.name}`, base: origin },
      provenance: {
        source: inv.source.tools,
        fetchedAt: inv.fetchedAt,
        tier: tool.tier
      }
    });
  }

  // Fail loud on orphaned notes (mirrors the scout check below): notes are
  // exact-match data keyed on lumenloop tool names, so an upstream
  // rename/removal must break the build, not silently drop catalog guidance.
  for (const key of Object.keys(LUMENLOOP_DESCRIPTION_NOTES)) {
    if (!consumedNotes.has(key)) {
      throw new Error(
        `LUMENLOOP_DESCRIPTION_NOTES key "${key}" matched no exposed lumenloop tool name — orphaned note ` +
          `(upstream renamed/removed the tool, or it is now excluded?); update scripts/description-notes.mjs`
      );
    }
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Stellar Light / Scout — one entry per OpenAPI operation
// ---------------------------------------------------------------------------

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"];

function scoutInputSchema(op, pathItem, openapi) {
  const properties = {};
  const required = [];
  const parameters = [...(pathItem.parameters ?? []), ...(op.parameters ?? [])];
  for (const rawParam of parameters) {
    const param = inlineRefs(rawParam, openapi);
    if (!param?.name) continue;
    const schema = param.schema ? inlineRefs(param.schema, openapi) : { type: "string" };
    if (param.description && !schema.description) schema.description = param.description;
    properties[param.name] = schema;
    if (param.required) required.push(param.name);
  }
  const bodySchema = op.requestBody?.content?.["application/json"]?.schema;
  if (bodySchema) {
    const inlined = inlineRefs(bodySchema, openapi);
    if (inlined.type === "object" && inlined.properties) {
      for (const [name, schema] of Object.entries(inlined.properties)) {
        properties[name] = schema;
      }
      for (const name of inlined.required ?? []) required.push(name);
    } else {
      properties.body = inlined;
      required.push("body");
    }
  }
  if (Object.keys(properties).length === 0) return { type: "object", properties: {} };
  const schema = { type: "object", properties };
  if (required.length > 0) schema.required = [...new Set(required)].sort();
  return schema;
}

function scoutOutputSchema(op, openapi) {
  const schema = op.responses?.["200"]?.content?.["application/json"]?.schema;
  return schema ? inlineRefs(schema, openapi) : null;
}

function buildScout(inv) {
  const entries = [];
  // Scout 1.7.16 (sls-051 structural fix) moved routing vocabulary — synonym
  // chains, region/product terms, question exemplars — out of description
  // prose into a machine-readable `x-routing` extension per operation.
  // Upstream's documented consumer convention: score it as separately-
  // weighted fields, never concatenated into the description. Collected
  // here (purpose/useWhen/exampleQuestions/keywords) and attached as the
  // `routingKeywords` field via attachRoutingKeywords (scoring.ts lever 7).
  // `notFor` is deliberately dropped — its clauses carry OTHER operations'
  // vocabulary ("a funded project → searchProjects" on getBuilders), which
  // as this op's keywords would recreate the cross-capture the upstream fix
  // removed.
  const routingExtras = new Map();
  const openapi = inv.openapi;
  const base = openapi.servers?.[0]?.url ?? "https://stellarlight.xyz";
  const consumedNotes = new Set();
  // Rewrite the upstream OpenAPI's raw-REST cross-references to callable
  // scout.<op> names (map derived from this same spec) and strip markdown —
  // scout is the only source whose descriptions carry `**`/backticks and dead
  // "/api/..." pointers the sandbox can never call. See description-notes.mjs.
  const refPairs = scoutRefRewrites(openapi);

  for (const [path, pathItem] of Object.entries(openapi.paths)) {
    for (const method of HTTP_METHODS) {
      const op = pathItem[method];
      if (!op) continue;
      const httpMethod = method.toUpperCase();
      if (EXCLUDED_SCOUT_OPS.has(`${httpMethod} ${path}`)) continue;
      const opId = op.operationId ?? `${method}_${slugify(path)}`;
      const rawDescription = [op.summary, op.description]
        .filter(Boolean)
        .join(". ")
        .replace(/\.\.\s/g, ". ");
      // Scrub excluded-endpoint clauses BEFORE the rewrite (the rewrite never
      // mints names for excluded ops, so an unscrubbed clause would keep its
      // raw REST spelling — still a leak).
      const description = plainText(
        rewriteScoutRefs(scrubScoutDescription(opId, rawDescription), refPairs)
      );
      const note = SCOUT_DESCRIPTION_NOTES[opId];
      if (note !== undefined) consumedNotes.add(opId);
      const routing = op["x-routing"];
      if (routing && typeof routing === "object") {
        const parts = [
          routing.purpose,
          ...(Array.isArray(routing.useWhen) ? routing.useWhen : []),
          ...(Array.isArray(routing.exampleQuestions) ? routing.exampleQuestions : []),
          ...(Array.isArray(routing.keywords) ? routing.keywords : [])
        ].filter((v) => typeof v === "string" && v.length > 0);
        if (parts.length > 0) routingExtras.set(`scout.${opId}`, [parts.join("\n")]);
      }
      entries.push({
        id: `scout.${opId}`,
        service: "scout",
        kind: "operation",
        description: [description || opId, note ? plainText(note) : undefined]
          .filter(Boolean)
          .join("\n\n"),
        inputSchema: scrubNonExposedScoutSchemaRefs(scoutInputSchema(op, pathItem, openapi)),
        outputSchema: scrubNonExposedScoutSchemaRefs(scoutOutputSchema(op, openapi)),
        transport: { type: "http", method: httpMethod, path, base },
        provenance: {
          source: `${base}/api/openapi.json`,
          fetchedAt: inv.fetchedAt,
          openapiVersion: inv.openapiVersion
        }
      });
    }
  }
  // Fail loud on orphaned notes: the notes are exact-match data keyed on scout
  // operationIds, so an upstream rename/removal must break the build, not
  // silently drop catalog guidance.
  for (const key of Object.keys(SCOUT_DESCRIPTION_NOTES)) {
    if (!consumedNotes.has(key)) {
      throw new Error(
        `SCOUT_DESCRIPTION_NOTES key "${key}" matched no scout operationId — orphaned note ` +
          `(upstream renamed/removed the operation?); update scripts/description-notes.mjs`
      );
    }
  }
  // Same orphan guard for the scrubs: a scrub keyed on a renamed/removed/
  // excluded op would silently stop applying.
  const emittedScoutOps = new Set(entries.map((e) => e.id.slice("scout.".length)));
  for (const key of Object.keys(SCOUT_DESCRIPTION_SCRUBS)) {
    if (!emittedScoutOps.has(key)) {
      throw new Error(
        `SCOUT_DESCRIPTION_SCRUBS key "${key}" matched no exposed scout operationId — orphaned ` +
          `scrub (upstream renamed/removed the operation, or it is now excluded?); update ` +
          `scripts/description-notes.mjs`
      );
    }
  }
  return { entries, routingExtras };
}

// ---------------------------------------------------------------------------
// Stellar Docs (Algolia) — 12 authored operations from specs/stellar-docs.json
// Mapping recipe: research/services/stellar-docs-spec-design.md §7.
// ---------------------------------------------------------------------------

function buildStellarDocs(spec) {
  const { backend, catalogHints } = spec;
  return spec.operations.map((op) => ({
    id: op.id, // "stellarDocs.search_docs" etc — verbatim from the spec
    service: spec.service,
    kind: catalogHints.kind,
    description: op.returns ? `${op.description}\n\nReturns: ${op.returns}` : op.description,
    inputSchema: op.params, // spec params are already a JSON Schema object
    outputSchema: null,
    // Transport = shared backend block + this op's exact Algolia query mapping.
    // The adapter consumes `algolia` (paramMap/fixedParams/
    // conditionalParams/clientFilter/derivedQuery) as-is.
    transport: {
      type: "algolia",
      index: backend.index,
      endpoint: backend.endpoint,
      hosts: backend.hosts,
      applicationIdEnv: backend.applicationIdEnv,
      apiKeyEnv: backend.apiKeyEnv,
      retry: backend.retry,
      baseParams: backend.baseParams,
      constraints: backend.constraints,
      algolia: op.algolia
    },
    provenance: {
      source: catalogHints.provenanceSource,
      fetchedAt: spec.authoredAt,
      spec: "specs/stellar-docs.json",
      note: "authored spec-as-data operation, live-verified against the Algolia index — not a fetched descriptor"
    }
  }));
}

// ---------------------------------------------------------------------------
// Ecosystem skills mirror — skill + per-##-section + per-extra-file entries
// ---------------------------------------------------------------------------

function skillEntryBase(manifestSource, syncedAt) {
  return {
    service: "skills",
    inputSchema: null,
    outputSchema: null,
    provenance: {
      source: manifestSource.url,
      fetchedAt: syncedAt,
      commit: manifestSource.commit
    }
  };
}

// Exact exposed skill IDs with a deliberately narrow, query-independent role
// in a design-stage implementation review. Do not infer this from prose or
// from "any skill read": landscape/content skills are valuable but must not
// trigger the host's bounded prior-art composition cue.
export const BUILD_AUTHORITY_SKILL_ROLES = Object.freeze({
  "skills.stellar-dev.smart-contracts": ["contract"],
  "skills.stellar-dev.dapp": ["dapp", "sdk-integration"],
  "skills.stellar-dev.standards": ["protocol"],
  "skills.stellar-dev.data": ["infrastructure"]
});

// Same refresh-safety problem as the retirement list, one layer up: the roles
// above are pinned to exact skill IDs, and all four live in stellar-dev, which
// churns. An upstream rename would silently drop a skill's build-authority role
// (no error, just a quietly weaker prior-art cue). Fail the build instead.
export function assertBuildAuthorityIdsResolve(entries) {
  const skillIds = new Set(entries.filter((e) => e.kind === "skill").map((e) => e.id));
  const stale = Object.keys(BUILD_AUTHORITY_SKILL_ROLES).filter((id) => !skillIds.has(id));
  if (stale.length > 0) {
    throw new Error(
      `BUILD_AUTHORITY_SKILL_ROLES names skills that no longer exist: ${stale.join(", ")}. ` +
        `An upstream re-pin renamed or removed them — reconcile the role map in build-catalog.mjs ` +
        `(move the role to the new id, or drop it) so a build-authority role cannot silently vanish.`
    );
  }
}

function buildSkills(manifest, texts, arm) {
  const entries = [];
  const syncedAt = manifest.synced_at;
  // Section-level `keywords` are distilled from BODY text, and sections are
  // out of search in the shipped arm (searchable:false), so emitting them
  // would put upstream-derived prose in a committed artifact that nothing
  // scores. Arm A is the only arm that puts sections back in search, so it is
  // the only arm that gets them.
  const emitSectionKeywords = arm === "A";
  const loadedOf = (sourceId, skillName, filePath) => {
    const key = `${sourceId}/${skillName}/${filePath}`;
    const loaded = texts.get(key);
    if (loaded === undefined) {
      throw new Error(
        `skill file ${key} is listed in ecosystem-skills/MANIFEST.json but was not loaded — ` +
          `re-run the build (scripts/lib/skill-mirror.mjs fetches pinned files on demand)`
      );
    }
    return loaded;
  };
  const textOf = (sourceId, skillName, filePath) => loadedOf(sourceId, skillName, filePath).text;

  for (const source of manifest.sources) {
    for (const skill of source.skills) {
      // Retired skills are not emitted at all — no skill entry, no sections
      // (ADR-0003; the auditable record is RETIRED_ONBOARDING_SKILLS in
      // scripts/exposure.mjs + the ADR, not a manifest entry). They are not
      // even fetched (loadSkillTexts skips them).
      if (RETIRED_ONBOARDING_SKILLS.has(skill.name)) continue;

      const skillId = `skills.${source.id}.${skill.name}`;
      const skillFile = (skill.files ?? []).find((f) => f.path === "SKILL.md");
      if (!skillFile) {
        throw new Error(`skill ${source.id}/${skill.name} has no SKILL.md in MANIFEST.json`);
      }
      // Every entry names the immutable upstream location of its bytes plus
      // the pinned blob hash: that pair IS the transport (src/skills/store.ts
      // resolves it through src/skills/source.ts, which re-verifies the hash).
      const transportFor = (file) => ({
        type: "file",
        url: skillFileUrl(source, skill.name, file.path),
        // sha = git blob hash (provenance, ties bytes to the reviewed git
        // object); sha256 = the SECURITY digest the Worker verifies, because
        // SHA-1 has practical chosen-prefix collisions.
        sha: file.sha,
        sha256: loadedOf(source.id, skill.name, file.path).sha256
      });
      // Scrub retired-skill cross-references BEFORE deriving descriptions and
      // headings — the same scrub src/skills/source.ts applies to every served
      // body, so what search surfaces and what skill.read returns agree.
      const raw = scrubRetiredSkillRefs(
        textOf(source.id, skill.name, "SKILL.md"),
        `${source.id}/${skill.name}/SKILL.md`
      );
      const { attrs, body } = parseFrontmatter(raw);
      const bodyLines = body.split("\n");

      // 1) the whole-skill entry
      entries.push({
        ...skillEntryBase(source, syncedAt),
        id: skillId,
        kind: "skill",
        description: attrs.description || firstParagraph(bodyLines, 0) || skill.name,
        ...(BUILD_AUTHORITY_SKILL_ROLES[skillId]
          ? { buildAuthorityRoles: [...BUILD_AUTHORITY_SKILL_ROLES[skillId]] }
          : {}),
        transport: transportFor(skillFile)
      });

      // 2) one entry per `##` section of SKILL.md. The entry is an ADDRESS,
      // not a copy: heading + pinned location, no body excerpt. Sections are
      // out of search (below), so a description beyond the heading would be
      // upstream prose in a committed file that nothing reads.
      const usedSlugs = new Set();
      for (let i = 0; i < bodyLines.length; i++) {
        const line = bodyLines[i];
        if (!line.startsWith("## ")) continue;
        const heading = plainText(line.slice(3));
        let slug = slugify(heading);
        for (let n = 2; usedSlugs.has(slug); n++) slug = `${slugify(heading)}-${n}`;
        usedSlugs.add(slug);
        const sectionId = `${skillId}#${slug}`;
        let sectionEnd = i + 1;
        while (sectionEnd < bodyLines.length && !bodyLines[sectionEnd].startsWith("## ")) {
          sectionEnd++;
        }
        const keywords = emitSectionKeywords
          ? extractKeywords(bodyLines.slice(i + 1, sectionEnd).join("\n"), {
              exclude: [sectionId, heading, "skills", "skill-section"]
            })
          : [];
        entries.push({
          ...skillEntryBase(source, syncedAt),
          id: sectionId,
          kind: "skill-section",
          description: heading,
          ...(keywords.length > 0 ? { keywords } : {}),
          // Sections remain exposed for exact-id reads and navigation, but
          // ADR-0005 keeps them out of search.
          searchable: false,
          transport: { ...transportFor(skillFile), section: heading }
        });
      }

      // 3) each additional .md file treated like a section
      for (const file of skill.files ?? []) {
        if (file.path === "SKILL.md" || !file.path.endsWith(".md")) continue;
        const fileRaw = scrubRetiredSkillRefs(
          textOf(source.id, skill.name, file.path),
          `${source.id}/${skill.name}/${file.path}`
        );
        const fileLines = parseFrontmatter(fileRaw).body.split("\n");
        const headingLine = fileLines.find((l) => /^#{1,2} /.test(l));
        const heading = headingLine ? plainText(headingLine.replace(/^#+ /, "")) : file.path;
        const fileEntryId = `${skillId}#file:${file.path}`;
        const fileKeywords = emitSectionKeywords
          ? extractKeywords(fileLines.join("\n"), {
              exclude: [fileEntryId, heading, "skills", "skill-section"]
            })
          : [];
        entries.push({
          ...skillEntryBase(source, syncedAt),
          id: fileEntryId,
          kind: "skill-section",
          description: heading,
          ...(fileKeywords.length > 0 ? { keywords: fileKeywords } : {}),
          // Same search exclusion as ## sections (2026-07-13 A/B; see above).
          searchable: false,
          transport: transportFor(file)
        });
      }
    }
  }
  return entries;
}

// ---------------------------------------------------------------------------
// Skills-form experiment arms from ADR-0005. One categorical treatment over
// the assembled entries controls which
// representation of the pinned skill store enters search. Everything else —
// exposure, exact-id reads/runs, schemas, pins, scoring constants — is a
// control. Arm B is the default build. Arm A restores section search for
// replication, and arm C removes all skills from search.
// ---------------------------------------------------------------------------

const SKILLS_FORM_ARMS = ["A", "B", "C"];

function applySkillsFormArm(entries, arm) {
  if (arm === "B") return entries; // shipped default
  if (arm === "A") {
    // Legacy pre-2026-07-13 representation: sections re-enter search.
    return entries.map((e) => {
      if (e.service !== "skills" || e.kind !== "skill-section") return e;
      const { searchable, ...rest } = e;
      return rest;
    });
  }
  // Arm C: all skills out of search.
  return entries.map((e) => (e.service === "skills" ? { ...e, searchable: false } : e));
}

/** SHA-256 hex of a stable JSON projection (audit output for arm runs). */
function sha256Json(value) {
  return createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex");
}

// ---------------------------------------------------------------------------
// Runnable skills — attach `runnable: true` + the runner's schemas to the
// matching skill entries (research/skill-run-design.md §5: a contract
// broadening on the EXISTING kind:"skill" entry, never a second entry/kind —
// one skill, one id, two affordances). Fail-loud drift guards in every
// direction, mirroring assertRetirementNamesResolve /
// assertLumenloopExclusionsResolve: registry keys and declared ops are
// exact-match data pinned to the emitted surface, so upstream drift breaks
// the BUILD, never surfaces as a runtime TypeError dressed up as a runner
// bug. Exported for the guard tests (test/catalog.test.ts); main() below is
// gated so importing this module never builds.
// ---------------------------------------------------------------------------

export function attachRunnableSkills(entries, registry = RUNNERS) {
  const opIds = new Set(entries.filter((e) => e.kind === "operation").map((e) => e.id));
  const byId = new Map(entries.map((e) => [e.id, e]));
  for (const [id, runner] of Object.entries(registry)) {
    const entry = byId.get(id);
    // A registry key with no emitted skill entry = the skill was renamed or
    // retired (or the key is a typo). Silence here would ship a runner the
    // catalog never advertises — dead code at best, id drift at worst.
    if (!entry || entry.kind !== "skill") {
      throw new Error(
        `RUNNERS registry key "${id}" matched no emitted skill entry — the skill was renamed/` +
          `retired upstream or the id is wrong; reconcile src/skills/runners/index.ts with the ` +
          `skills mirror (registry drift must break the build, not silently un-expose the runner).`
      );
    }
    // Every declared op must resolve to an emitted operation entry: this is
    // the guard that turns an upstream constituent-op retirement (e.g. a
    // live-drift refresh dropping one) into a build failure instead of a
    // missing facade fn at dispatch time.
    for (const opId of runner.ops) {
      if (!opIds.has(opId)) {
        throw new Error(
          `runner "${id}" declares op "${opId}" which resolves to no emitted operation entry — ` +
            `upstream retired/renamed it or exposure now excludes it; reconcile the runner's ` +
            `declared ops (and its pipeline) before rebuilding.`
        );
      }
    }
  }
  return entries.map((entry) => {
    const runner = registry[entry.id];
    if (!runner) return entry;
    return {
      ...entry,
      runnable: true,
      inputSchema: runner.inputSchema,
      outputSchema: runner.outputSchema
    };
  });
}

/** Attach and fail-loud validate query-independent recovery edges. */
export function attachRetrievalProfiles(entries, profiles = RETRIEVAL_PROFILES) {
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const profiled = new Set();
  const out = entries.map((entry) => {
    const profile = profiles[entry.id];
    if (profile === undefined) return entry;
    if (entry.kind !== "operation") {
      throw new Error(`retrieval profile key "${entry.id}" is not an operation`);
    }
    profiled.add(entry.id);
    const targets = new Set();
    for (const edge of profile.recoverWith ?? []) {
      const target = byId.get(edge.id);
      if (!target || target.kind !== "operation") {
        throw new Error(`retrieval profile "${entry.id}" references non-exposed operation "${edge.id}"`);
      }
      if (edge.id === entry.id) throw new Error(`retrieval profile "${entry.id}" contains a self-edge`);
      if (targets.has(edge.id)) throw new Error(`retrieval profile "${entry.id}" repeats target "${edge.id}"`);
      targets.add(edge.id);
      if (!Array.isArray(edge.on) || edge.on.length === 0) {
        throw new Error(`retrieval profile "${entry.id}" target "${edge.id}" has no trigger reasons`);
      }
    }
    return { ...entry, retrievalProfile: profile };
  });
  for (const id of Object.keys(profiles)) {
    if (!profiled.has(id)) throw new Error(`retrieval profile key "${id}" matched no exposed operation`);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Assemble
// ---------------------------------------------------------------------------

// The ADR-0003 leak guard, run over the fully assembled manifest: no emitted
// text may name an operation that is not itself emitted, reference an
// excluded scout endpoint by its raw REST spelling, or mention a retired
// skill. This is the systemic backstop for the whole leak class — a scrub or
// rewrite that goes stale fails the build here instead of shipping a pointer
// to a capability consumers must never learn about. Every operation schema
// and every runnable-skill schema contributes its JSON too: schema text ships
// through signatures and describe/catalog views, so it must follow the same
// exposure boundary as descriptions. Exported for the guard tests.
//
// The "any service.op token not in opIds" check needs the full assembled
// manifest as an allowlist, so it stays here; the other three checks (raw
// excluded scout path, retired-skill ref, excluded lumenloop op name) are
// allowlist-free and factored into scripts/emitted-text-guard.mjs so any
// OTHER emitted text (e.g. the /demo page/prompts) can run them too without
// a manifest — see assertNoNonExposedRefsInText.
export function assertNoNonExposedRefs(entries) {
  const opIds = new Set(entries.filter((e) => e.kind === "operation").map((e) => e.id));
  // Service-callable tokens ("scout.matchPartners"); the lookbehind skips
  // dotted prefixes so skill ids like "skills.lumenloop.<name>" never match,
  // and TLD-shaped tokens ("lumenloop.com" in prose URLs) are ignored.
  const callableRe = /(?<![.\w])(?:lumenloop|scout|stellarDocs)\.[A-Za-z_]\w*/g;
  const TLDS = new Set(["com", "org", "net", "io", "xyz", "dev", "app", "buzz"]);
  for (const entry of entries) {
    const text = [
      entry.description ?? "",
      ...(entry.keywords ?? []),
      ...(entry.routingKeywords ?? []),
      // Operation and runnable-skill schemas ship to the model through
      // signatures and describe/catalog views. Guard their whole JSON.
      ...(entry.kind === "operation" || entry.runnable === true
        ? [JSON.stringify(entry.inputSchema), JSON.stringify(entry.outputSchema)]
        : [])
    ].join("\n");
    for (const token of text.match(callableRe) ?? []) {
      if (TLDS.has(token.split(".")[1])) continue;
      if (!opIds.has(token)) {
        throw new Error(
          `ADR-0003 leak: entry "${entry.id}" emits a reference to non-exposed operation ` +
            `"${token}" — scrub or rewrite the source text (scripts/description-notes.mjs / ` +
            `scripts/exposure.mjs).`
        );
      }
    }
    assertNoNonExposedRefsInText(text, `entry "${entry.id}"`);
  }
}

async function main() {
  const lumenloop = readJson("inventory/lumenloop.json");
  const stellarLight = readJson("inventory/stellar-light.json");
  const stellarDocsSpec = readJson("specs/stellar-docs.json");
  const stellarDocsTitles = readJson("inventory/stellar-docs-titles.json");
  const skillsManifest = readJson("ecosystem-skills/MANIFEST.json");
  assertRetirementNamesResolve(skillsManifest);
  assertLumenloopExclusionsResolve(lumenloop);
  assertLumenloopSkillsMirrored(lumenloop, skillsManifest);
  assertScoutExclusionsResolve(stellarLight.openapi);
  assertSideEffectingOpsExcluded(stellarLight.openapi);

  // Experiment-arm selection. Arm B is the shipped default. Any non-B arm
  // requires --out so a variant can
  // never overwrite the shipped manifest).
  const armIdx = process.argv.indexOf("--skills-form");
  const arm = armIdx >= 0 ? process.argv[armIdx + 1] : "B";
  if (!SKILLS_FORM_ARMS.includes(arm)) {
    throw new Error(`--skills-form must be one of ${SKILLS_FORM_ARMS.join("|")}, got "${arm}"`);
  }
  const outIdx = process.argv.indexOf("--out");
  const outPath = outIdx >= 0 ? resolve(process.argv[outIdx + 1]) : OUT_PATH;
  if (arm !== "B" && outIdx < 0) {
    throw new Error(`--skills-form ${arm} requires --out <path>: variant manifests never overwrite ${OUT_PATH}`);
  }

  // Skill bodies are not vendored here: loadSkillTexts fetches each pinned
  // file (or reads the gitignored working cache) and verifies it against the
  // git blob hash in MANIFEST.json — the same bytes, checked the same way, the
  // Worker verifies at read time.
  const skillTexts = await loadSkillTexts(skillsManifest, {
    skip: (name) => RETIRED_ONBOARDING_SKILLS.has(name)
  });

  const stellarDocsEntries = buildStellarDocs(stellarDocsSpec);
  const scout = buildScout(stellarLight);
  // Runnable attachment runs over the FULLY assembled set: its declared-op
  // guard needs every service's operation entries in scope, not just skills.
  const entries = applySkillsFormArm(
    attachRetrievalProfiles(attachRunnableSkills(
      [
        ...attachOperationKeywords(buildLumenloop(lumenloop)),
        // Scout ops: x-routing vocabulary → routingKeywords (lever 7) first,
        // then schema tokens → keywords with the routing tokens excluded.
        ...attachOperationKeywords(attachRoutingKeywords(scout.entries, scout.routingExtras)),
        // Docs ops carry page-title vocabulary (hundreds of distinct frequency-1
        // tokens post-DF) — the default 64 cap truncates the alphabetical tail,
        // so they get a roomier cap. Still bounded: 12 ops × ≤256 short tokens.
        ...attachOperationKeywords(
          stellarDocsEntries,
          stellarDocsTitleExtras(stellarDocsEntries, stellarDocsTitles),
          { cap: 256 }
        ),
        ...buildSkills(skillsManifest, skillTexts, arm)
      ].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    )),
    arm
  );

  const ids = new Set();
  for (const entry of entries) {
    if (ids.has(entry.id)) throw new Error(`duplicate catalog id: ${entry.id}`);
    ids.add(entry.id);
  }

  assertBuildAuthorityIdsResolve(entries);

  assertNoNonExposedRefs(entries);

  // generatedAt = newest input snapshot (deterministic; never wall clock).
  // Includes stellar-docs-titles.json's fetchedAt: its page-title vocabulary
  // feeds the manifest `keywords`, so a titles-only refresh must move the stamp.
  const generatedAt = [
    lumenloop.fetchedAt,
    stellarLight.fetchedAt,
    stellarDocsSpec.authoredAt,
    stellarDocsTitles.fetchedAt,
    skillsManifest.synced_at
  ].reduce((max, ts) => (Date.parse(ts) > Date.parse(max) ? ts : max));

  // The stellarDocs corpus taxonomy stays in specs/stellar-docs.json. It
  // reaches the model through the super spec. The scorer, adapters, and
  // codemode.catalog() do not need a manifest copy.
  const catalog = sortKeysDeep({ version: 1, generatedAt, entries });
  mkdirSync(dirname(outPath), { recursive: true });
  const manifestBytes = `${JSON.stringify(catalog, null, 2)}\n`;
  writeFileAtomic(outPath, manifestBytes);

  // Treatment audit (experiment validity record): identical inputs must be
  // provable across arms — ops byte-identical, skill pins fixed, only the
  // skills search representation moving. Printed for every build; the arm
  // harness records these lines with each result.
  const searchableEntries = entries.filter((e) => e.searchable !== false);
  const searchableCounts = { skill: 0, "skill-section": 0 };
  const exposedCounts = { skill: 0, "skill-section": 0 };
  for (const e of entries) {
    if (e.service === "skills") exposedCounts[e.kind] += 1;
  }
  for (const e of searchableEntries) {
    if (e.service === "skills") searchableCounts[e.kind] += 1;
  }
  console.log(
    `skills-form arm ${arm} -> ${outPath}\n` +
      `  manifest sha256 ${sha256Json(catalog)}\n` +
      `  searchable-projection sha256 ${sha256Json(searchableEntries.map((e) => e.id).sort())}\n` +
      `  operation-records sha256 ${sha256Json(entries.filter((e) => e.kind === "operation"))}\n` +
      `  searchable skills ${searchableCounts.skill} whole + ${searchableCounts["skill-section"]} sections ` +
      `(exposed in every arm: ${exposedCounts.skill} whole + ${exposedCounts["skill-section"]} sections)`
  );

  const counts = {};
  for (const entry of entries) {
    counts[`${entry.service}/${entry.kind}`] = (counts[`${entry.service}/${entry.kind}`] ?? 0) + 1;
  }
  // Transparency: name what the build filtered out (no silent surface changes).
  const excludedLumenloop = lumenloop.tools.filter(lumenloopOpExcluded).map((t) => t.name);
  console.log(`catalog/manifest.json — ${entries.length} entries`);
  for (const [key, count] of Object.entries(counts).sort()) console.log(`  ${key}: ${count}`);
  console.log(
    `  excluded at build: lumenloop ops [${excludedLumenloop.join(", ")}], ` +
      `scout ops [${[...EXCLUDED_SCOUT_OPS].join(", ")}], ` +
      `retired skills [${[...RETIRED_ONBOARDING_SKILLS].join(", ")}], ` +
      `lumenloop-served skill metadata (${lumenloop.skills.length}: ` +
      `${lumenloop.skills.filter((s) => s.set !== "partner").length} public/mirrored, ` +
      `${lumenloop.skills.filter((s) => s.set === "partner").length} partner name-only stubs)`
  );
  // Transparency, inclusion side: name the runnable skills the build attached
  // (the registry is the allowlist-as-data — design §2).
  console.log(`  runnable skills: [${Object.keys(RUNNERS).sort().join(", ")}]`);
}

// Gated so the guard tests (test/catalog.test.ts) can import the exported
// functions above without triggering a build; `node scripts/build-catalog.mjs`
// still builds exactly as before.
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) await main();
