/**
 * Shared build-time exposure exclusions (ADR-0003).
 * Used by build-catalog.mjs, build-super-spec.mjs, description-notes.mjs, and
 * src/skills/source.ts so excluded items never surface anywhere. Drift guards
 * against live inventories stay in build-catalog.mjs.
 */

/** Lumenloop account-mutation surfaces — excluded if they ever appear in inventory. */
export const LUMENLOOP_ACCOUNT_OP_RE = /(^|_)(key|keys|webhook|webhooks|topup|top_?up)(_|$)/;

// Excluded under AGENTS.md hard rules: request_research needs approval, elicitation,
// budget enforcement, partner-detail persistence, and dedup (named explicitly so
// upstream re-pricing cannot expose it). research_result and list_my_research read
// account-commissioned research and are dead ends while the trigger is unexposed
// (ADR-0003). list_research stays exposed (public editorial research).
export const EXCLUDED_LUMENLOOP_OPS = new Set([
  "request_research",
  "research_result",
  "list_my_research"
]);

/** True when a lumenloop tool must not be emitted: paid/metered, account mutation, or excluded by name. */
export function lumenloopOpExcluded(tool) {
  return (
    tool.metered === true ||
    EXCLUDED_LUMENLOOP_OPS.has(tool.name) ||
    LUMENLOOP_ACCOUNT_OP_RE.test(tool.name)
  );
}

// Excluded Scout endpoints (exact method+path, defined in src/policy/scout-exposure.ts):
//  POST /api/feedback                 submits feedback upstream
//  GET  /api/feedback                 dead end without POST; names scout.submitFeedback (ADR-0003)
//  POST /api/partners/submit-listing  creates a draft partner account / claim request
//  POST /api/partners/assistant       logs surfaced partners as leads; use scout.getPartners
//  POST /api/partners/onboard         upstream x-side-effecting; no approval/budget gate
//  POST /api/partners/match           no observed call succeeds (sls-123); use scout.getPartners
export {
  EXCLUDED_SCOUT_OPERATIONS,
  EXCLUDED_SCOUT_OPS,
  EXCLUDED_SCOUT_PATHS,
  NON_EXPOSED_SCOUT_OP_NAMES,
  OPTIONAL_EXCLUDED_SCOUT_OPERATIONS,
  SCOUT_PATHS_ABSENT_FROM_SPEC,
  findExcludedScoutPath
} from "../src/policy/scout-exposure.ts";

// Retired onboarding skills (ADR-0003): they teach raw REST/MCP auth and envelopes,
// which mislead models inside sandbox `execute`. Only lumenloop-mcp-connect remains
// in the public mirror; the six partner lumenloop-api-* skills are kept solely as
// scrub targets in src/skills/scrub.ts.
export const RETIRED_ONBOARDING_SKILLS = new Set(["lumenloop-mcp-connect"]);

export const RETIRED_PARTNER_ONBOARDING_SKILLS = new Set([
  "lumenloop-api-billing",
  "lumenloop-api-connect",
  "lumenloop-api-integrate",
  "lumenloop-api-keys",
  "lumenloop-api-query",
  "lumenloop-api-research"
]);

export const SKILL_EXPOSURE_CLASSIFICATION_VALUES = new Set(["internal-guidance", "removed"]);

/**
 * Audit ledger for non-exposed Lumenloop onboarding skills (not emitted).
 * - internal-guidance: raw body stays unexposed; safe lessons may be distilled into Raven-owned text.
 * - removed: partner-tier body absent from this public repo; retained only as scrub targets.
 */
export const SKILL_EXPOSURE_CLASSIFICATIONS = [
  {
    id: "lumenloop-mcp-connect",
    classification: "internal-guidance",
    source: "public lumenloop mirror",
    rationale:
      "Connector setup, bearer-token, and raw MCP tool-map instructions are misleading inside Raven execute; any reusable lesson must be distilled into Raven-owned sandbox/search guidance.",
    emittedSurface: "none"
  },
  ...[...RETIRED_PARTNER_ONBOARDING_SKILLS].map((id) => ({
    id,
    classification: "removed",
    source: "former partner-tier lumenloop-api skill",
    rationale:
      "Partner-tier onboarding content is not credential-free public repo input; the raw bodies were removed during go-public cleanup and survive only as scrub targets.",
    emittedSurface: "none"
  }))
];

export const SKILL_EXPOSURE_CLASSIFICATION_BY_ID = new Map(
  SKILL_EXPOSURE_CLASSIFICATIONS.map((entry) => [entry.id, entry])
);

// Shared with read-time skill scrubbing in src/skills/scrub.ts.
export {
  scrubNonExposedRefs,
  scrubRetiredSkillRefs,
  RETIRED_SKILL_REF_RE
} from "../src/skills/scrub.ts";
