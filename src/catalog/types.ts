/**
 * Catalog types — the unified, machine-generated index that `search` ranks
 * (PLAN §2 as a starting sketch, deliberately trimmed).
 *
 * One entry per callable surface: every service operation, every skill, and
 * every skill section. `scripts/build-catalog.mjs` generates
 * `catalog/manifest.json`; `loadManifest` (src/catalog/search.ts) validates it
 * against `catalogSchema` before anything trusts it.
 *
 * Field rationale (what earns its place for a two-tool search+execute MCP):
 *  - id / service / kind / description → the search scorer's input fields.
 *  - inputSchema / outputSchema        → rendered into the TS `signature`
 *    returned with operation and runnable-skill hits, and execute-side arg
 *    validation — the model never owns URLs/args, PLAN §4.
 *  - transport                         → what the adapters need to actually
 *    place the call.
 *  - provenance                        → where the entry came from + snapshot
 *    time, so drift is attributable to an inventory refresh.
 *
 * Deliberately absent:
 *  - policy/auth/cost — exposure is filtered at BUILD time (ADR-0003): the
 *    manifest is the exposed surface, so every entry in it is callable or
 *    readable and a runtime allow/deny layer has nothing to express.
 *    Exclusions (paid ops, write endpoints, retired skills, upstream skill
 *    twins) live as data + reasons in scripts/build-catalog.mjs.
 *  - raven-next's `resultShape` (evidence/soft-empty/error paths): search
 *    never reads it, and execute-phase normalizers are per-service code, not
 *    per-entry data. Likewise the stellarDocs corpus taxonomy: it lives in
 *    specs/stellar-docs.json and ships to the model inside the super spec.
 */
import { z } from "zod";

export const CATALOG_SERVICES = ["lumenloop", "scout", "stellarDocs", "skills"] as const;

export const CATALOG_KINDS = ["operation", "skill", "skill-section"] as const;
export type CatalogKind = (typeof CATALOG_KINDS)[number];

// Search intentionally excludes section entries (ADR-0005). Sections remain
// cataloged so exact-id describe/read and availableSections can expose them,
// but advertising a section filter would promise a lane that always returns
// zero hits.
export const SEARCH_KINDS = ["operation", "skill"] as const;
export type SearchKind = (typeof SEARCH_KINDS)[number];

/** A JSON Schema fragment — kept opaque; only the TS renderer walks it. */
const jsonSchemaShape = z.record(z.string(), z.unknown());

/**
 * How the host adapter reaches the surface. `type` discriminates:
 *  - "http"   → method + path (+ base) against a service origin
 *  - "algolia"→ Algolia REST query (hosts carry an app-id placeholder)
 *  - "file"   → a pinned upstream markdown file: `url` (raw.githubusercontent
 *               at the commit pinned in ecosystem-skills/MANIFEST.json),
 *               `sha` (git blob hash — provenance) and `sha256` (security
 *               digest). Both are re-verified on every read; skill bodies are
 *               forwarded from upstream, never stored here. See src/skills/source.ts.
 * Extra transport detail (hosts, retry policy, …) rides along via catchall.
 */

/**
 * A "file" transport is the ONLY catalog field that makes the host fetch a URL,
 * so it is constrained here rather than trusted. The catalog is a generated,
 * committed artifact, but a mis-built or tampered manifest must not be able to
 * point host-side fetches at an arbitrary destination: the host, the path
 * shape, and both digests are all pinned to what the skill pipeline can emit.
 * (`global_fetch_strictly_public` forces public-Internet routing; it is not a
 * destination allowlist.)
 */
const SKILL_FILE_URL_RE =
  /^https:\/\/raw\.githubusercontent\.com\/[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+\/[0-9a-f]{40}\/\S+\.md$/;
const HEX40_RE = /^[0-9a-f]{40}$/;
const HEX64_RE = /^[0-9a-f]{64}$/;
export const transportSchema = z
  .object({
    type: z.enum(["http", "algolia", "file"]),
    method: z.string().optional(),
    path: z.string().optional(),
    base: z.string().optional(),
    /** "file" transports: commit-pinned raw URL. */
    url: z.string().optional(),
    /** "file" transports: git blob hash (provenance). */
    sha: z.string().optional(),
    /** "file" transports: SHA-256 over the raw bytes (security). */
    sha256: z.string().optional()
  })
  .catchall(z.unknown())
  .superRefine((t, ctx) => {
    if (t.type !== "file") return;
    const fail = (message: string) => ctx.addIssue({ code: "custom", message });
    if (!t.url || !SKILL_FILE_URL_RE.test(t.url)) {
      fail(
        `file transport url must be a commit-pinned https://raw.githubusercontent.com/<owner>/<repo>/<40-hex>/<path>.md — got ${t.url ?? "undefined"}`
      );
    }
    if (!t.sha || !HEX40_RE.test(t.sha)) fail("file transport sha must be a 40-hex git blob hash");
    if (!t.sha256 || !HEX64_RE.test(t.sha256)) {
      fail("file transport sha256 must be a 64-hex digest of the raw bytes");
    }
  });

export const provenanceSchema = z
  .object({
    /** Upstream origin of this entry (inventory endpoint URL, or the pinned source tree URL for skills). */
    source: z.string().min(1),
    /** ISO timestamp of the inventory snapshot / skill pin the entry was built from. */
    fetchedAt: z.string().min(1)
  })
  .catchall(z.unknown());

export const RETRIEVAL_LANES = ["exact", "directory", "detail", "semantic", "research", "av", "corpus"] as const;
export const RETRIEVAL_REASONS = ["empty", "weak", "adjacent", "ambiguous", "partial"] as const;
export const RETRIEVAL_RELATIONS = [
  "broader-semantic",
  "cited-research",
  "different-medium",
  "cross-family",
  "corpus-wide",
  "structured-identity",
  "source-code"
] as const;

/**
 * Query-independent roles for skills that can ground a design-stage build
 * review. This is deliberately narrow: a successful read of any arbitrary
 * skill is not evidence that the execute composed an implementation playbook.
 */
export const BUILD_AUTHORITY_ROLES = ["contract", "dapp", "sdk-integration", "protocol", "infrastructure"] as const;
export type BuildAuthorityRole = (typeof BUILD_AUTHORITY_ROLES)[number];

export type RetrievalReason = (typeof RETRIEVAL_REASONS)[number];

export const retrievalProfileSchema = z.object({
  lane: z.enum(RETRIEVAL_LANES),
  emptyScope: z.enum(["operation", "corpus", "inconclusive"]),
  recoverWith: z.array(z.object({
    id: z.string().min(1),
    relation: z.enum(RETRIEVAL_RELATIONS),
    on: z.array(z.enum(RETRIEVAL_REASONS)).min(1)
  })).min(1).max(6)
});

export const catalogEntrySchema = z.object({
  /** Exact-match id, `<namespace>.<name>` (+ `#<section>` for skill sections). */
  id: z.string().min(1),
  service: z.enum(CATALOG_SERVICES),
  kind: z.enum(CATALOG_KINDS),
  description: z.string().min(1),
  /**
   * Skill-section entries only (optional): content tokens distilled from the
   * section BODY at build time (scripts/build-catalog.mjs via
   * src/catalog/extract-keywords.ts) — mid-section vocabulary the truncated
   * description can't carry. Blended into scoring at low weight
   * (src/catalog/scoring.ts); never rendered to users.
   */
  keywords: z.array(z.string()).optional(),
  /**
   * Operation entries only (optional): curated machine-routing vocabulary
   * the upstream service publishes separately from its prose description
   * (Scout 1.7.16 `x-routing`: purpose/useWhen/exampleQuestions/keywords —
   * the sls-051 structural fix). Distilled at build time WITHOUT the
   * document-frequency filter `keywords` get (upstream already curates the
   * vocabulary per-op; the A/B measured the filter as a net loss here) and
   * blended into scoring at its own, higher weight (src/catalog/scoring.ts
   * lever 7): this vocabulary was DESIGNED for routing, unlike
   * schema-derived shrapnel. Never rendered to users.
   */
  routingKeywords: z.array(z.string()).optional(),
  /** Query-independent exact-ID recovery graph, validated at catalog build/load. */
  retrievalProfile: retrievalProfileSchema.optional(),
  /**
   * Whole-skill entries only: the build domains this exact exposed playbook
   * authoritatively covers for the host's bounded prior-art composition cue.
   * It is metadata, never a claim that a returned repository is applicable.
   */
  buildAuthorityRoles: z.array(z.enum(BUILD_AUTHORITY_ROLES)).min(1).optional(),
  /**
   * Search-visibility marker (skills program, Solo scratchpad 608): literal
   * `false` ONLY — absence means searchable. An entry with `searchable:
   * false` stays fully exposed (exact-id describe/read/run, codemode.catalog,
   * super spec) but never enters search scoring or results. SHIPPED on all
   * 210 skill-section entries since the 2026-07-13 skills-form A/B (arm B
   * won: sections crowded operations in search while whole-skill entries
   * carried every measured discovery need — scratchpad 608 P4).
   */
  searchable: z.literal(false).optional(),
  /**
   * Runnable-skill marker (research/skill-run-design.md §5): literal `true`
   * ONLY on the kind:"skill" entries whose data-gathering core also ships as
   * a bundled host-side runner (src/skills/runners/), callable inside
   * `execute` via `codemode.skill.run(id, input)`. A deliberate contract
   * broadening, not a new kind: "skills are prose; a declared few are also
   * callable" — one skill, one id, two affordances (read + run). A second
   * kind/entry would recreate the twin-identity problem ADR-0002/0003 killed.
   * Runnable entries MUST carry both schemas (enforced by
   * refinedCatalogSchema in src/catalog/search.ts); the builder attaches the
   * flag + schemas from the RUNNERS registry (scripts/build-catalog.mjs).
   */
  runnable: z.literal(true).optional(),
  /**
   * JSON Schema for call args (operations) or for `codemode.skill.run` input
   * (runnable skills); null for prose-only skills and sections.
   */
  inputSchema: jsonSchemaShape.nullable(),
  /**
   * JSON Schema for the result where the upstream declares one, or the
   * runner's declared `data` payload contract (runnable skills); else null.
   */
  outputSchema: jsonSchemaShape.nullable(),
  transport: transportSchema.nullable(),
  provenance: provenanceSchema
});

export type CatalogEntry = z.infer<typeof catalogEntrySchema>;

export const catalogSchema = z.object({
  version: z.number().int().positive(),
  /** Derived from the newest input snapshot — NOT wall clock (determinism). */
  generatedAt: z.string().min(1),
  entries: z.array(catalogEntrySchema)
});

export type Catalog = z.infer<typeof catalogSchema>;
