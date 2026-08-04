/**
 * Catalog-level guidance appended to specific op descriptions (data, like the
 * deny-list; exact-match on the tool/operation name). Sharpens boundaries and
 * flags result-shape traps the upstream descriptions miss.
 *
 * Shared by build-catalog.mjs (manifest descriptions) and
 * build-super-spec.mjs (in-sandbox spec descriptions) so the two model-facing
 * surfaces cannot drift. Wording constraint for every note: keep tokens out
 * of the lexical scorer's blast radius — no `r.` (a bare "r" token
 * prefix-covers rule/role/rewrite/… queries) and no apostrophes (possessives
 * tokenize to a bare "s" with the same effect).
 */

// Lumenloop notes — the residue of the 2026-07-03 skills harvest (Solo todo
// 825): everything the retired lumenloop-api onboarding skills and the
// playbook gotchas teach was checked against the inventory descriptions, and
// almost all of it is already carried there (search_directory semantic
// fallback, compact=true, summaries vs verbatim text, videos/av alias,
// per-collection sort fields) or normalized by the adapter (get_document
// not-found prose → soft-empty). What remains is the one trap the
// descriptions miss, live-verified 2026-07-03: find_content_by_entity with
// entity_type "person" answers success:true + all-empty groups even for the
// most heavily covered people (control: organization returns full groups) —
// an envelope-ok empty that reads as evidence of absence but is lane behavior.
// Lumenloop/scout boundary contrast (Solo todo 835, agentic-lane evidence
// 2026-07-03): after the stellar-light description enrichment, agent callers
// took "what is X / who builds X" project-lookup questions to
// scout.searchProjects even when the asker wanted the narrative/editorial
// answer lumenloop carries. The pair of notes below (here and on
// scout.searchProjects) states the contrast each side is blind to: lumenloop
// = editorial context + directory descriptions, scout = structured fields.
// Wording is collision-checked against the routing corpus (2026-07-04):
// every non-trivial token is either already present in the entry or has zero
// cross-labeled query hits ("narrative", "editorial", "context", "lane");
// "who builds X" is a deliberate claim — that phrasing appears only in
// lumenloop-labeled questions. Avoided on this side: hackathon, partner,
// funding, award, live, history (all appear in scout/mixed-labeled queries).
export const LUMENLOOP_DESCRIPTION_NOTES = {
  find_content_by_entity:
    'Catalog note: entity_type "person" can return ok data with all-empty groups even for heavily covered people (live-verified 2026-07-03). This is a data-shaped empty, not a transport or soft-empty failure. It supports only the scoped statement that this exact lookup linked no content. For open-world person coverage, use search_content_semantic, then require exact identity plus source and date before attribution.',
  search_directory:
    "Catalog note: prefer this lane plus find_content_about_project when a what is X or who builds X question wants narrative editorial context about a named ecosystem project; the scout project search returns structured fields only. A match_mode semantic row is a candidate, not exact identity proof.",
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
 * DELIBERATELY NOT the scout.-prefixed form for the snake rewrites: that
 * variant was built and measured 2026-07-04 and REVERTED on a per-case gate
 * regression — every description gaining its first literal "scout" word gains
 * +5 for any query containing the token "out" ("runs out", "find out", …) via
 * scoreField's raw-substring fallback ("out" is a substring of "scout",
 * description weight 5), which flipped legacy case
 * q-soroban-ttl-expiry-behavior top-1 (scout.analyzeEcosystem 158→163 past
 * stellarDocs.search_soroban_contract_docs at 162). Bare camelCase is
 * score-neutral by construction: the scorer normalizes "get_leaderboard" and
 * "getLeaderboard" to the identical "get leaderboard". The path rewrites DO
 * carry the scout. prefix — measured zero per-case deltas there.
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
  ],
  partnerOnboard: [
    // "Use when: ... structured profile fields (then submit via
    // POST /api/partners/submit-listing)." — the submission step is excluded.
    " (then submit via POST /api/partners/submit-listing)",
    // "Not for: finding partners → /api/partners/match or /assistant." — the
    // assistant is excluded; the match alternative stays.
    " or /assistant"
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
  // Boundary twin of LUMENLOOP_DESCRIPTION_NOTES.search_directory (todo 835)
  // — see the collision-check rationale there. Avoided on this side: news,
  // talks, content, coverage, written, builds (all appear in
  // lumenloop-labeled queries and would lexically pull them toward scout);
  // "articles", "AV", "interviews", "summaries", "editorial", "pieces" have
  // zero query hits in the routing corpus (2026-07-04).
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
