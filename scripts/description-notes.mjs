/**
 * Catalog-level guidance appended to specific operation descriptions (exact-match on name).
 * Shared by build-catalog.mjs and build-super-spec.mjs so manifest and sandbox stay aligned.
 * These strings feed lexical scoring; measure wording changes with the routing gate.
 */

export const LUMENLOOP_DESCRIPTION_NOTES = {
  find_content_by_entity:
    'Catalog note: entity_type "person" can return ok data with all-empty groups even for heavily covered people (live-verified 2026-07-03). This is a data-shaped empty, not a transport or soft-empty failure. It supports only the scoped statement that this exact lookup linked no content. For open-world person coverage, use search_content_semantic, then require exact identity plus source and date before attribution.',
  search_directory:
    "Catalog note: use this lane plus find_content_about_project for narrative editorial context about a named ecosystem project; the scout project search returns structured fields only. A match_mode semantic row is a candidate, not exact identity proof.",
  search_content_semantic:
    "Catalog note: this is the wide-net recovery lane for open-world identity, history, event, and obscure-topic questions after directory, entity, or docs lookups are empty or off-target. Raven normalizes every returned collection into one items array, globally sorted by the upstream similarity score; each row carries collection, while counts and meta preserve shape context. Filter items before projecting compact fields. Semantic rows are candidates, not attribution: require exact identity plus source and date, and discard merely adjacent results."
};

// Host-owned discovery descriptions (exact-ID; generators fail if a key goes stale).
// Does not alter pinned bytes served by skill.read.
export const SKILL_DESCRIPTION_OVERRIDES = Object.freeze({
  "skills.trustless-work.trustless-work-dev":
    "Escrow-as-a-service integration for single-release and multi-release escrows, milestone releases, dispute handling, and the provider REST API, React SDK, or Blocks UI.",
  // Omits upstream "Blux is also an option.", whose short tokens noisy-match unrelated queries.
  // Remove once short-token routing stops matching alone.
  "skills.stellar-dev.dapp":
    "Stellar dApp / frontend development. Covers the JavaScript stellar-sdk (browser + Node.js), Freighter wallet, Stellar Wallets Kit (multi-wallet), Wallet Standard, smart accounts with passkeys, transaction building / signing / submission, smart contract invocation from the client, simulation, and error handling. Use when building a React/Next.js/Node.js app that talks to Stellar — classic operations or smart contracts."
});

export function skillDescription(id, upstreamDescription) {
  return SKILL_DESCRIPTION_OVERRIDES[id] ?? upstreamDescription;
}

export function assertSkillDescriptionOverrideIdsResolve(skillIds, consumer) {
  const known = skillIds instanceof Set ? skillIds : new Set(skillIds);
  const stale = Object.keys(SKILL_DESCRIPTION_OVERRIDES).filter((id) => !known.has(id));
  if (stale.length > 0) {
    throw new Error(
      `${consumer}: SKILL_DESCRIPTION_OVERRIDES names skills that no longer exist: ${stale.join(", ")}. ` +
        "Reconcile scripts/description-notes.mjs with the pinned source."
    );
  }
}

// Deterministic callable-name rewrites for Scout descriptions (shared by build-catalog and
// build-super-spec). Upstream OpenAPI prose cites raw REST paths and snake_case tool names;
// sandbox code calls scout.<opId>(args). Only exact spec-declared paths and opIds are rewritten.

import { EXCLUDED_SCOUT_OPS, NON_EXPOSED_SCOUT_OP_NAMES } from "./exposure.mjs";

const SCOUT_HTTP_METHODS = ["get", "post", "put", "patch", "delete"];

// Extra non-path shorthands targeting exposed ops only (excluded ops are scrubbed instead).
const SCOUT_REF_ALIASES = [];

/** snake_case form of a camelCase operationId (searchProjects -> search_projects). */
function snakeCase(opId) {
  return opId.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
}

/**
 * Build longest-first [needle, replacement] rewrite pairs from a Scout OpenAPI doc:
 * - REST paths -> "scout.<opId>" (bare paths prefer GET).
 * - snake_case opIds -> bare camelCase opId (omits `scout.` prefix so vendor lexical scoring
 *   does not add spurious namespace substring matches; skips all-lowercase opIds).
 */
export function scoutRefRewrites(openapi) {
  const pairs = [];
  const bareByPath = new Map();
  for (const [path, item] of Object.entries(openapi.paths)) {
    for (const method of SCOUT_HTTP_METHODS) {
      const op = item[method];
      if (!op?.operationId) continue;
      // Excluded ops are scrubbed by scrubScoutDescription, never rewritten (ADR-0003).
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
const completePathRe = (needle) =>
  new RegExp(`(?<![\\w/.-])${regexEscape(needle)}(?![\\w/{}%+~@=:$&-]|\\.[\\w]|;\\S)`, "g");

/**
 * Apply scoutRefRewrites to op-level summary/description text.
 * Path needles match complete paths only (not URLs or undeclared subpaths); snake needles match
 * standalone tokens not preceded by `.`. Also strips leading `?` from `?param` shorthands.
 */
export function rewriteScoutRefs(text, pairs) {
  let out = text;
  for (const [needle, replacement] of pairs) {
    if (needle.includes("/")) {
      out = out.replace(
        completePathRe(needle),
        replacement
      );
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
 * Schema descriptions preserve upstream facts using non-callable labels.
 * Operation descriptions instead drop affected clauses before scoring.
 * Raw x-routing sources stay strict and never pass through these rewrites.
 */
const NON_EXPOSED_SCOUT_NAME_SPELLINGS = new Set(
  [...NON_EXPOSED_SCOUT_OP_NAMES].flatMap((name) => [name.toLowerCase(), snakeCase(name)])
);
const SCOUT_TEXT_REF_REWRITES = [
  ...[...EXCLUDED_SCOUT_OPS].flatMap((signature) => {
    const path = signature.slice(signature.indexOf(" ") + 1);
    const label = `upstream ${path.split("/")
      .filter((part) => part && !/^\{.*\}$/.test(part)).at(-1).replaceAll("-", " ")}`;
    return [[signature, label], [path, label]];
  }),
  ...[...NON_EXPOSED_SCOUT_OP_NAMES].flatMap((name) => {
    const words = name.replace(/^(get|list)(?=[A-Z])/, "").replace(/([a-z0-9])([A-Z])/g, "$1 $2");
    return [name, snakeCase(name)].map((spelling) => [spelling, `upstream ${words.toLowerCase()}`]);
  })
].sort((a, b) => b[0].length - a[0].length);

function scrubNonExposedScoutLists(text) {
  const description = text.replace(
    /\((?:[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)?\s*,\s*)+[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)?\)/g,
    (list) => {
      const kept = list.slice(1, -1).split(/\s*,\s*/).filter((name) =>
        !NON_EXPOSED_SCOUT_NAME_SPELLINGS.has(name.replace(/^scout\./i, "").toLowerCase())
      );
      if (kept.length === list.slice(1, -1).split(/\s*,\s*/).length) return list;
      return kept.length > 0 ? `(${kept.join(", ")})` : "";
    }
  );
  return description === text ? text : description
    .replace(/[ \t]+([,.;:!?])/g, "$1").replace(/[ \t]{2,}/g, " ").trim();
}

const scoutTextRefRe = (needle) => needle.includes("/")
  ? completePathRe(needle)
  : new RegExp(`(?<![\\w])(?:scout\\.)?${regexEscape(needle)}(?![\\w])`, "gi");

export function scrubNonExposedScoutText(text) {
  let description = scrubNonExposedScoutLists(text);
  for (const [needle, replacement] of SCOUT_TEXT_REF_REWRITES) {
    description = description.replace(scoutTextRefRe(needle), replacement);
  }
  return description;
}

function dropNonExposedScoutClauses(text) {
  const description = scrubNonExposedScoutLists(text);
  // Sentence and semicolon boundaries avoid guessing the grammar around a
  // reference. Dots inside identifiers and paths do not split the clause.
  const clauses = description.split(/(?<=[.!?;])\s+|\n+/u);
  const kept = clauses.filter((clause) => !SCOUT_TEXT_REF_REWRITES.some(
    ([needle]) => scoutTextRefRe(needle).test(clause)
  ));
  return kept.length === clauses.length ? description : kept.join(" ").trim();
}

export function scrubNonExposedScoutSchemaRefs(value) {
  if (Array.isArray(value)) return value.map(scrubNonExposedScoutSchemaRefs);
  if (!value || typeof value !== "object") return value;

  const out = {};
  for (const [key, item] of Object.entries(value)) {
    out[key] = key === "description" && typeof item === "string"
      ? scrubNonExposedScoutText(item)
      : scrubNonExposedScoutSchemaRefs(item);
  }
  return out;
}

// Author-maintained clause scrubs for excluded Scout endpoints (ADR-0003), applied before
// scoutRefRewrites. Fails loud if a needle disappears so upstream rephrasing cannot re-leak.
export const SCOUT_DESCRIPTION_SCRUBS = {
  getStatus: [
    // Drops the endpoint-enumeration recommendation pointing at raw /api/ paths (some excluded).
    " or to discover endpoints"
  ]
};

/** Remove authored clauses and exposure-derived refs; throws if a listed needle is missing. */
export function scrubScoutDescription(opId, { summary = "", description = "" }) {
  const needles = SCOUT_DESCRIPTION_SCRUBS[opId] ?? [];
  const fields = { summary, description };
  for (const needle of needles) {
    if (!Object.values(fields).some((text) => text.includes(needle))) {
      throw new Error(
        `SCOUT_DESCRIPTION_SCRUBS["${opId}"] needle not found in the upstream description: ` +
          `${JSON.stringify(needle)}. Upstream rephrased — reconcile the scrub in ` +
          `scripts/description-notes.mjs so the excluded-endpoint reference cannot re-leak.`
      );
    }
    for (const key of Object.keys(fields)) fields[key] = fields[key].split(needle).join("");
  }
  return Object.fromEntries(Object.entries(fields).map(([key, text]) => [key, dropNonExposedScoutClauses(text)]));
}

export const SCOUT_DESCRIPTION_NOTES = {
  // Keep source boundary aligned with LUMENLOOP_DESCRIPTION_NOTES.search_directory.
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
