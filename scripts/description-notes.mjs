/**
 * Catalog-level guidance appended to specific op descriptions (data, like the
 * deny-list; exact-match on the tool/operation name). Sharpens boundaries and
 * flags result-shape traps the upstream descriptions miss.
 *
 * Shared by build-catalog.mjs (manifest descriptions) and
 * build-super-spec.mjs (in-sandbox spec descriptions) so the two model-facing
 * surfaces cannot drift. These descriptions feed lexical scoring, so keep
 * notes source-scoped and measure wording changes with the routing gate.
 */

// These notes cover verified gaps in the upstream descriptions. They state
// source boundaries and evidence semantics that apply beyond one query.
export const LUMENLOOP_DESCRIPTION_NOTES = {
  find_content_by_entity:
    'Catalog note: entity_type "person" can return ok data with all-empty groups even for heavily covered people (live-verified 2026-07-03). This is a data-shaped empty, not a transport or soft-empty failure. It supports only the scoped statement that this exact lookup linked no content. For open-world person coverage, use search_content_semantic, then require exact identity plus source and date before attribution.',
  search_directory:
    "Catalog note: use this lane plus find_content_about_project for narrative editorial context about a named ecosystem project; the scout project search returns structured fields only. A match_mode semantic row is a candidate, not exact identity proof.",
  search_content_semantic:
    "Catalog note: this is the wide-net recovery lane for open-world identity, history, event, and obscure-topic questions after directory, entity, or docs lookups are empty or off-target. Raven normalizes every returned collection into one items array, globally sorted by the upstream similarity score; each row carries collection, while counts and meta preserve shape context. Filter items before projecting compact fields. Semantic rows are candidates, not attribution: require exact identity plus source and date, and discard merely adjacent results."
};

// ---------------------------------------------------------------------------
// Callable-name rewrite for scout descriptions (shared, deterministic).
//
// The scout entries carry their descriptions verbatim from the upstream Stellar
// Light OpenAPI, which cross-references sibling operations by RAW REST endpoint
// (e.g. "POST /api/feedback", "use /api/partners with ?type/?sector") and by
// snake_case MCP-tool name (e.g. "use get_leaderboard"). Model code can NEVER
// issue raw HTTP and the sandbox surface is camelCase — it invokes each
// operation as scout.<opId>(args) — so both spellings are dead pointers.
// Rewrite them using a map derived mechanically from the SAME spec
// (path+method -> operationId), so it stays correct across inventory
// refreshes. Only exact spec-declared API paths and exact snake forms of
// spec-declared operationIds are touched — never generic slash-prose like
// "on/off-ramp" or "upcoming/active/completed", never substrings of longer
// identifiers. Shared by build-catalog.mjs (manifest) and
// build-super-spec.mjs (in-sandbox spec) so the two surfaces cannot drift.
// ---------------------------------------------------------------------------

import { EXCLUDED_SCOUT_OPS } from "./exposure.mjs";

const SCOUT_HTTP_METHODS = ["get", "post", "put", "patch", "delete"];

// Standalone shorthands the upstream prose uses that are not full spec paths
// but still name a callable operation. Every alias target must be an EXPOSED
// op — an alias for an excluded op would mint a callable-looking name for an
// operation that does not exist to consumers (the ADR-0003 leak that
// scoutRefRewrites otherwise filters out). Currently empty: the one historical
// alias ("/assistant" → scout.partnerAssistant) pointed at an excluded op and
// its prose occurrences are scrubbed instead (SCOUT_DESCRIPTION_SCRUBS).
const SCOUT_REF_ALIASES = [];

/** snake_case form of a camelCase operationId (searchProjects -> search_projects). */
function snakeCase(opId) {
  return opId.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
}

/**
 * Build the ordered [needle, replacement] rewrite pairs from a scout OpenAPI
 * doc. Two needle families, both derived mechanically from the spec — the
 * same uncallable-name defect in two spellings:
 *  - REST references → "scout.<opId>": method-qualified ("POST /api/feedback")
 *    and bare paths ("/api/partners"); longer needles sort first so
 *    "/api/partners/match" wins over "/api/partners" and a verb-qualified
 *    reference resolves before its bare path. Bare-path default prefers GET
 *    (the read/listing intent the prose means when it drops the verb).
 *  - snake_case tool names → the BARE camelCase opId ("use get_leaderboard" →
 *    "use getLeaderboard"): sibling context inside a scout entry's own
 *    description is unambiguous, and the model sees the exact method segment
 *    it calls. Needle only added when the snake form differs from the opId —
 *    an all-lowercase opId would yield a plain-word needle, far too
 *    match-happy for prose.
 *
 * Use bare camelCase for snake rewrites. A service namespace prefix can add
 * unrelated raw-substring matches under the vendor scorer. The surrounding
 * Scout operation already supplies the service context, so the prefix adds no
 * callable information. Path rewrites keep the prefix because they replace an
 * uncallable REST reference with a complete sandbox call target.
 */
export function scoutRefRewrites(openapi) {
  const pairs = [];
  const bareByPath = new Map();
  for (const [path, item] of Object.entries(openapi.paths)) {
    for (const method of SCOUT_HTTP_METHODS) {
      const op = item[method];
      if (!op?.operationId) continue;
      // Never mint a callable name for an excluded op (ADR-0003: it does not
      // exist to consumers). Prose that references an excluded endpoint is
      // scrubbed by SCOUT_DESCRIPTION_SCRUBS, not rewritten.
      if (EXCLUDED_SCOUT_OPS.has(`${method.toUpperCase()} ${path}`)) continue;
      const callable = `scout.${op.operationId}`;
      pairs.push([`${method.toUpperCase()} ${path}`, callable]);
      if (!bareByPath.has(path) || method === "get") bareByPath.set(path, callable);
      const snake = snakeCase(op.operationId);
      if (snake !== op.operationId) pairs.push([snake, op.operationId]);
    }
  }
  for (const [path, callable] of bareByPath) pairs.push([path, callable]);
  pairs.push(...SCOUT_REF_ALIASES);
  pairs.sort((a, b) => b[0].length - a[0].length);
  return pairs;
}

const regexEscape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Rewrite raw REST references and snake_case tool names in `text` using the
 * pairs from scoutRefRewrites(openapi).
 *
 * Path-shaped needles (contain "/") use plain longest-first substring
 * replacement — the "/" delimiters make them unambiguous, and longest-first
 * ordering keeps "/api/partners" from eating "/api/partners/match".
 * Token-shaped needles (snake names) match only as standalone tokens: never
 * inside a longer identifier ([\w] boundaries on both sides) and never when
 * preceded by "." (the lookbehind), so a rerun over already-rewritten text
 * never rewrites twice — the camelCase replacement carries no underscore, so
 * no snake needle can match it again anyway.
 *
 * Also drops the query-string "?" from "?type/?sector"-style shorthand — in
 * sandbox vocabulary those are fields on the single args object, never URL
 * query params. The strip requires a token boundary before the "?" (start,
 * whitespace, "(" or "/") so a mid-word "?" in prose is never touched. Scope
 * note: this rewrite only ever processes op-level summary/description text;
 * "?slugs=…"/"?repo=" strings elsewhere in the spec (parameter and
 * response-schema descriptions) are untouched because those fields never
 * pass through here.
 */
export function rewriteScoutRefs(text, pairs) {
  let out = text;
  for (const [needle, replacement] of pairs) {
    if (needle.includes("/")) {
      out = out.split(needle).join(replacement);
    } else {
      out = out.replace(
        new RegExp(`(?<![\\w.])${regexEscape(needle)}(?![\\w])`, "g"),
        replacement
      );
    }
  }
  return out.replace(/(^|[\s(/])\?([a-z])/g, "$1$2");
}

/**
 * Remove non-exposed Scout endpoint spellings from schema descriptions.
 *
 * Schemas are emitted through catalog signatures, codemode.describe(), and
 * the super spec. Upstream component prose can therefore advertise an
 * excluded endpoint even when its own operation never reaches the manifest.
 * Derive the replacements from the exposure data so every excluded endpoint
 * receives the same treatment. The catalog guard remains the fail-loud
 * backstop for references in non-description schema fields.
 */
export function scrubNonExposedScoutSchemaRefs(value) {
  if (Array.isArray(value)) return value.map(scrubNonExposedScoutSchemaRefs);
  if (!value || typeof value !== "object") return value;

  const out = {};
  for (const [key, item] of Object.entries(value)) {
    if (key !== "description" || typeof item !== "string") {
      out[key] = scrubNonExposedScoutSchemaRefs(item);
      continue;
    }

    let description = item;
    const rewrites = [...EXCLUDED_SCOUT_OPS]
      .flatMap((signature) => {
        const path = signature.slice(signature.indexOf(" ") + 1);
        const label = `upstream ${path.split("/").filter(Boolean).at(-1).replaceAll("-", " ")}`;
        return [
          [signature, label],
          [path, label]
        ];
      })
      .sort((a, b) => b[0].length - a[0].length);
    for (const [needle, replacement] of rewrites) {
      description = description.split(needle).join(replacement);
    }
    out[key] = description;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Excluded-endpoint clause scrubs (ADR-0003).
//
// Some upstream scout descriptions cross-reference endpoints that are in
// EXCLUDED_SCOUT_OPS. Those clauses must be REMOVED, not rewritten: a rewrite
// would mint a callable name for an op that does not exist to consumers, and
// leaving the raw REST reference would still advertise a capability the
// gateway does not expose. Exact-match data, applied to the RAW upstream text
// BEFORE scoutRefRewrites — with a fail-loud guard: if upstream rephrases and
// a needle stops matching, the build breaks so a human reconciles (a silently
// stale scrub = the leak comes back).
// ---------------------------------------------------------------------------
export const SCOUT_DESCRIPTION_SCRUBS = {
  getStatus: [
    // "Use to check how fresh/large the data is or to discover endpoints." —
    // the endpoint-enumeration RECOMMENDATION is ours, not upstream's payload,
    // and it steers models at upstream's raw /api/ namespace, part of which is
    // deliberately not exposed here. The build works to displace exactly that
    // vocabulary (scoutRefRewrites turns REST refs into callable scout.<op>
    // ids), so recommending it back is our own emitted surface undoing that.
    // The payload's endpoint array itself stays described — this drops the
    // recommendation, not the fact; SCOUT_DESCRIPTION_NOTES.getStatus carries
    // the boundary.
    " or to discover endpoints"
  ],
  matchPartners: [
    // "Not for: ... → GET /api/partners; interactive human chat → the
    // /partners/chat page (backed by /api/partners/assistant)." — the chat
    // page is backed by the excluded assistant endpoint; the directory-browse
    // alternative before the ";" stays.
    "; interactive human chat → the /partners/chat page (backed by /api/partners/assistant)"
  ]
};

/**
 * Remove the excluded-endpoint clauses from one op's raw upstream description.
 * Throws when a listed needle is absent (upstream prose drifted — reconcile
 * SCOUT_DESCRIPTION_SCRUBS) so a stale scrub can never silently re-leak.
 */
export function scrubScoutDescription(opId, text) {
  const needles = SCOUT_DESCRIPTION_SCRUBS[opId];
  if (!needles) return text;
  let out = text;
  for (const needle of needles) {
    if (!out.includes(needle)) {
      throw new Error(
        `SCOUT_DESCRIPTION_SCRUBS["${opId}"] needle not found in the upstream description: ` +
          `${JSON.stringify(needle)}. Upstream rephrased — reconcile the scrub in ` +
          `scripts/description-notes.mjs so the excluded-endpoint reference cannot re-leak.`
      );
    }
    out = out.split(needle).join("");
  }
  return out;
}

export const SCOUT_DESCRIPTION_NOTES = {
  // Boundary twin of LUMENLOOP_DESCRIPTION_NOTES.search_directory. Keep the
  // source distinction aligned across both operation descriptions.
  searchProjects:
    "Catalog note: results are structured directory facts, not editorial pieces — for articles, AV, interviews, or research summaries about a project, use the lumenloop semantic and directory ops.",
  searchRepos:
    "Catalog note: repoScore, stars, rank, and directory presence are discovery metadata, not API, security, license, audit, maintenance, or production evidence. Verify those claims at the repository and primary sources before reusing code.",
  searchResearch:
    "Catalog note: this is the broad Scout cited-research recovery lane for history, standards, incidents, audits, and unknown technical topics. Treat chunks as leads: preserve their source and date, and require an exact entity match before attribution.",
  getBuilders:
    "Catalog note: this is a bounded directory-membership surface, not an exhaustive biography or ecosystem-history index. An empty row set means no matching Scout builder record; for an open-world identity or history question, make one broad content or research pass before a wider negative conclusion.",
  getPartners:
    "Catalog note: this is the partner and service-provider DIRECTORY for anchors, asset issuers, on/off ramps, stablecoin and RWA providers, audit firms, infrastructure, tooling, protocols, wallets, and integration providers; filter by region, type, sector, accepting, or q. Use for regional partner listings including common region names and aliases such as Latin America/LatAm, MENA, Africa, Europe, and Asia-Pacific. Use searchProjects for built products, apps, protocols, and projects rather than service-provider listings.",
  getHackathon:
    "Catalog note: winner order is only meaningful when hackathonPlacement is ordinal (1st Place, 2nd Place, ...) and placementRank is a number; many events label every winner just Winners with placementRank null — there the winners array order is NOT a ranking, so never assert finishing order from list position (live-verified 2026-07-03).",
  listSkills:
    "Catalog note: this is the live ecosystem DIRECTORY — skills plus MCP servers, SDKs, and CLIs — for discovering what exists and fetching install metadata; most entries are not mirrored skills.",
  getSkill:
    "Catalog note: returns the full upstream markdown of one directory entry, suited to install/metadata questions. For reading build/integration playbooks, prefer the skills.* catalog entries via codemode.skill.read (sectioned, curated, pinned).",
  getStatus:
    "Catalog note: the upstream payload carries its own `ok` health/status flag at `data.ok` — distinct from the envelope call-status `ok`. Its endpoint enumeration is upstream's raw HTTP surface, not this gateway's callable surface: some of those paths are deliberately not exposed here, so discover callable operations with `search` or `codemode.catalog()` rather than planning around `/api/...` paths.",
  getChangelog:
    "Catalog note: the upstream payload carries its own `ok` flag at `data.ok` — distinct from the envelope call-status `ok`.",
  explainRepo:
    "Catalog note: the upstream payload carries its own `ok` flag at `data.ok` — distinct from the envelope call-status `ok`."
};
