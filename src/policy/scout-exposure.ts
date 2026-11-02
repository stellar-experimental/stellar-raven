/**
 * Scout operations that Raven does not expose.
 *
 * This module is the single source for both build-time filtering and runtime
 * skill-body filtering. Keep the method with the path because operation
 * exposure is method-specific. Skill prose filtering derives its path set
 * from these records.
 */
export const EXCLUDED_SCOUT_OPERATIONS = new Map([
  ["POST /api/feedback", "submitFeedback"],
  ["GET /api/feedback", "getFeedbackSchema"],
  ["POST /api/partners/submit-listing", "submitPartnerListing"],
  ["POST /api/partners/assistant", "partnerAssistant"],
  ["POST /api/partners/onboard", "partnerOnboard"],
  // Keep quality excluded until its routing contract and a general scoring
  // repair pass the routing gates and independent exposure review.
  ["GET /api/quality", "getQualityReport"],
  // Keep verification excluded until a routing-contract candidate passes
  // the routing gates and independent exposure review.
  ["GET /api/verify", "verifyClaim"],
  // RWA routing can capture unrelated implementation queries. Require a
  // general routing repair and independent operation review before exposure.
  ["GET /api/rwa", "getRwaAssets"]
]);

// Reviewed exclusions not yet in the accepted inventory. Current Scout lists
// these operations, while the accepted 1.9.61 snapshot does not. Their
// presence must not block refresh or expose them; the catalog build validates
// each exact method and name when listed. When an inventory containing them is
// accepted, decide exposure per the recommendation in .agents/TODO.md ("Preserve
// structured routing intent across extraction caps and gate tiers"), and move
// to EXCLUDED_SCOUT_OPERATIONS only the operations that stay excluded.
export const OPTIONAL_EXCLUDED_SCOUT_OPERATIONS = new Map([
  ["GET /api/hackathons/review", "reviewSubmission"],
  ["GET /api/hackathons/analyze", "analyzeHackathonSubmissions"],
  ["GET /api/hackathons/builds/{id}", "getHackathonSubmission"],
  ["GET /api/sources/locate", "locateSource"]
]);

export const EXCLUDED_SCOUT_OPS = new Set([
  ...EXCLUDED_SCOUT_OPERATIONS.keys(),
  ...OPTIONAL_EXCLUDED_SCOUT_OPERATIONS.keys()
]);

export const NON_EXPOSED_SCOUT_OP_NAMES = new Set([
  ...EXCLUDED_SCOUT_OPERATIONS.values(),
  ...OPTIONAL_EXCLUDED_SCOUT_OPERATIONS.values()
]);

// Public skill prose also describes this collection, but Scout's OpenAPI does
// not list it. The catalog builder checks that absence so a future addition
// requires a new exposure decision instead of silently changing this policy.
export const SCOUT_PATHS_ABSENT_FROM_SPEC = new Set(["/api/repos"]);

export const EXCLUDED_SCOUT_PATHS = new Set([
  ...[...EXCLUDED_SCOUT_OPS].map((operation) => operation.split(" ")[1]!),
  ...SCOUT_PATHS_ABSENT_FROM_SPEC
]);
