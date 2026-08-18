/**
 * exposure.mjs — the build-time exposure exclusions, as shared DATA
 * (ADR-0003, research/decisions/0003-build-time-exposure-filtering.md).
 *
 * The manifest IS the exposed surface: an excluded item is simply never
 * emitted, and consumers are never told what the gateway cannot do. That
 * property only holds if EVERY emitter draws from one exclusion dataset —
 * build-catalog.mjs (manifest entries + skill sections), build-super-spec.mjs
 * (in-sandbox spec), description-notes.mjs (callable-name rewrites must not
 * mint names for excluded ops), and src/skills/source.ts (the scrub applied to
 * every skill body served at read time). This module is that dataset; the fail-loud drift guards that pin
 * it to the live inventories stay in build-catalog.mjs, which is the one
 * script that always sees the inventory inputs.
 */

/** Lumenloop account-mutation surfaces — excluded if they ever appear in inventory. */
export const LUMENLOOP_ACCOUNT_OP_RE = /(^|_)(key|keys|webhook|webhooks|topup|top_?up)(_|$)/;

// request_research is the paid deep-research trigger — excluded until the
// budget-gate + dedup feature is deliberately built (PLAN §8: off by default).
// Named explicitly (not just via the metered flag) so an upstream re-pricing
// cannot silently expose it.
//
// research_result and list_my_research are the READ half of the same feature
// and are excluded with it: both are scoped to research the calling account
// commissioned, and the gateway account never commissions any (the trigger is
// not exposed) — so they are structurally dead ends, and their upstream
// descriptions document the paid commissioning flow (an ADR-0003 leak).
// Re-expose all three together with the budget gate + dedup.
// list_research is NOT excluded: it lists public published editorial research
// pieces (a keyless content collection), independent of request_research.
export const EXCLUDED_LUMENLOOP_OPS = new Set([
  "request_research",
  "research_result",
  "list_my_research"
]);

/** True when a lumenloop tool must not be emitted: paid/metered, account
 *  mutation, or explicitly excluded by name. */
export function lumenloopOpExcluded(tool) {
  return (
    tool.metered === true ||
    EXCLUDED_LUMENLOOP_OPS.has(tool.name) ||
    LUMENLOOP_ACCOUNT_OP_RE.test(tool.name)
  );
}

// Scout write/side-effecting endpoints — excluded (exact method+path):
//  POST /api/feedback                 submits feedback upstream
//  GET  /api/feedback                 feedback-schema discovery; read-only but
//                                     a dead end once POST is excluded — its
//                                     only purpose is to shape a submission the
//                                     gateway cannot make, and its upstream
//                                     description names scout.submitFeedback
//                                     (a non-exposed op, ADR-0003 leak)
//  POST /api/partners/submit-listing  creates a DRAFT partner account / claim
//                                     request reviewed by the Stellar Light team
//  POST /api/partners/assistant       surfaced partners are logged as leads for
//                                     the weekly partner digest (per upstream
//                                     OpenAPI); scout.matchPartners is the
//                                     side-effect-free ranking alternative
//  POST /api/partners/onboard         upstream marks the AI interview/extraction
//                                     helper x-side-effecting as of Scout 1.8.70;
//                                     Raven has no approval or budget gate for it
//  GET  /api/hackathon-brief          broad composite changed 27 gated cases
//                                     and seven context-only extended cases;
//                                     it lowered the frozen holdout
//                                     from 11/24/27 to 10/22/25 with no gated
//                                     gain in a controlled 2026-08-18 ablation
//  POST /api/partners/match stays exposed: its OpenAPI description declares
//                                     pure AI ranking over published partners
export const EXCLUDED_SCOUT_OPS = new Set([
  "POST /api/feedback",
  "GET /api/feedback",
  "POST /api/partners/submit-listing",
  "POST /api/partners/assistant",
  "POST /api/partners/onboard",
  "GET /api/hackathon-brief"
]);

// Retired skills — exclusion as DATA (ADR-0003; decision 2026-07-03).
// The Lumenloop onboarding skills teach RAW HTTP/REST or MCP-connector access
// (Bearer llmcp_ auth, key minting, rate limits, the REST response envelope).
// They are redundant AND misleading here: a model calling `execute` reaches
// Lumenloop only through the wrapped `lumenloop.*` sandbox globals — no
// network, secrets stay host-side, and the envelope is {ok,data}, not the
// REST shape those skills describe.
//
// Only lumenloop-mcp-connect (from the PUBLIC lumenloop source) still exists
// in the mirror. The six lumenloop-api-* partner skills were retired here
// and were removed from the mirror entirely
// 2026-07-06 (go-public cleanup): their description harvest was complete and
// partner-tier content must not live in this public repo. Their names live on
// only in the scrub regex in src/skills/scrub.ts, which removes the public
// skills' cross-references to them from emitted and served text.
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
 * Review ledger for non-exposed Lumenloop onboarding skills. This is NOT an
 * emitted model surface; it exists so future syncs/revisits have an auditable
 * per-skill decision instead of rediscovering why the raw bodies stay out of
 * catalog exposure.
 *
 * classification:
 * - internal-guidance: raw skill remains non-exposed; safe lessons may be
 *   distilled into Raven-owned notes or code, but never by mirroring the raw
 *   connector/key-management playbook.
 * - removed: raw body is intentionally absent from this public repo and no
 *   current Raven-facing guidance is accepted from it.
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

// The retired-skill scrub lives in src/skills/scrub.ts because it now runs at
// READ time too: skill bodies are fetched from upstream at the pinned commit
// rather than vendored, so every served body is scrubbed on the way out. One
// implementation, re-exported here so the builders keep importing exposure
// data from one place.
export { scrubRetiredSkillRefs, RETIRED_SKILL_REF_RE } from "../src/skills/scrub.ts";
